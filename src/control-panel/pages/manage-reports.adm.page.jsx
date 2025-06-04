import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { UserContext } from "../../App";
import Loader from "../../components/loader.component";
import NoDataMessage from "../../components/nodata.component";
import LoadMoreDataBtn from "../../components/load-more.component";
import { filterPaginationData } from "../../common/filter-pagination-data";
import SortButton from "../components/sort-button.component";
import { credentialHeaders } from '~/services/credentials'
import { useTranslation } from "react-i18next";
import ManageReportCard from "../components/manage-reports-card.component";

const ManageReportsPage = () => {
  const { t } = useTranslation();
  const { userAuth: { access_token, isAdmin } } = useContext(UserContext);

  const [reports, setReports] = useState(null);
  const [query, setQuery] = useState({
    search: "",
    reportFilter: {
      pending: false,
      reviewed: false,
      rejected: false
    }
  });

  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const getReports = ({ page, deletedDocCount = 0 }) => {
    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-reports`, {
      page,
      filter: query.search ? "search" : "all",
      query: query.search,
      reportFilter: query.reportFilter,
      isAdmin,
      deletedDocCount,
      sortField,
      sortOrder
    }, {
      headers: {
        'X-Authorization': `Bearer ${access_token}`,
        ...credentialHeaders
      }
    })
      .then(async ({ data }) => {
        const formatedData = await filterPaginationData({
          state: reports,
          data: data.reports,
          page,
          user: access_token,
          countRoute: "/get-reports-count",
          data_to_send: {
            filter: query.search ? "search" : "all",
            query: query.search,
            reportFilter: query.reportFilter
          }
        });

        setReports(formatedData);
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    if (access_token && reports == null) {
      getReports({ page: 1 });
    }
  }, [access_token, reports, query, sortField, sortOrder]);

  const handleSearch = (e) => {
    const searchQuery = e.target.value;
    setQuery(prev => ({ ...prev, search: searchQuery }));
    setReports(null);
  };

  const handleSort = (field) => {
    const newOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newOrder);
    setReports(null);
  };

  const toggleFilter = (key) => {
    setQuery(prev => ({
      ...prev,
      reportFilter: {
        ...prev.reportFilter,
        [key]: !prev.reportFilter[key]
      }
    }));
    setReports(null);
  };

  return (
    <>
      <h1 className="max-md:hidden text-xl">{t("Manage Reports")}</h1>
      <Toaster />

      <div className="relative max-md:mt-5 md:mt-8 mb-2">
        <input
          type="search"
          value={query.search}
          onChange={handleSearch}
          className="input-box search-remove-x"
          placeholder={t("Search Reports")}
        />
        <span className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey icon"></span>
      </div>

      <div className="flex gap-2 mb-2 flex-wrap">
        <p className="text-dark-grey mt-1">{`${t("Show Only")}:`}</p>
        <div className="flex gap-2">
          <button
            onClick={() => toggleFilter("pending")}
            className={`btn-filter px-2 py-1 ${query.reportFilter.pending ? 'bg-black text-white' : 'bg-grey text-black'}`}
          >{t("Pending")}</button>
          <button
            onClick={() => toggleFilter("reviewed")}
            className={`btn-filter px-2 py-1 ${query.reportFilter.reviewed ? 'bg-black text-white' : 'bg-grey text-black'}`}
          >{t("Reviewed")}</button>
          <button
            onClick={() => toggleFilter("rejected")}
            className={`btn-filter px-2 py-1 ${query.reportFilter.rejected ? 'bg-black text-white' : 'bg-grey text-black'}`}
          >{t("Rejected")}</button>
        </div>
      </div>

      {reports == null ? <Loader /> :
        reports.results.length ? (
          <>
            <div className="overflow-x-auto hidden sm:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-grey text-left">
                    <th className="border-r border-grey">
                      <SortButton
                        sortFunc={handleSort}
                        sortBy={"post_id.title"}
                        fieldState={sortField}
                        orderState={sortOrder}
                        label={t("Post")}
                      />
                    </th>
                    <th className="py-3 px-4 border-r border-grey">
                      {t("Report Text")}
                    </th>
                    <th className="py-3 px-4 border-r border-grey">
                      {t("Reported By")}
                    </th>
                    <th className="border-r border-grey">
                      <SortButton
                        sortFunc={handleSort}
                        sortBy={"createdAt"}
                        fieldState={sortField}
                        orderState={sortOrder}
                        label={t("Reported At")}
                      />
                    </th>
                    <th className="py-3 px-4 border-r border-grey">
                      {t("Status")}
                    </th>
                    <th className="py-3 px-4">
                      {t("Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.results.map(report => (
                    <ManageReportCard key={report._id} report={report} setReports={setReports} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden">
              {reports.results.map(report => (
                <ManageReportCard key={report._id} report={report} setReports={setReports} />
              ))}
            </div>

            <LoadMoreDataBtn
              className="my-4"
              state={reports}
              fetchDataFunc={getReports}
              additionalParam={{ deletedDocCount: reports.deletedDocCount }}
            />
          </>
        ) : (
          <NoDataMessage message={`${t("No reports found")}.`} />
        )
      }
    </>
  )
}

export default ManageReportsPage;