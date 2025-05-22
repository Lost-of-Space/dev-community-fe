import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { UserContext } from "../../App";
import Loader from "../../components/loader.component";
import NoDataMessage from "../../components/nodata.component";
import LoadMoreDataBtn from "../../components/load-more.component";
import { filterPaginationData } from "../../common/filter-pagination-data";
import SortButton from "../components/sort-button.component";
import ManagePostsCard from "../components/manage-posts-card.component";
import { credentialHeaders } from '~/services/credentials'
import { useTranslation } from "react-i18next";

const PostsManagementPage = () => {
  const { t } = useTranslation();

  let { userAuth: { access_token, isAdmin } } = useContext(UserContext);

  const [posts, setPosts] = useState(null);
  const [query, setQuery] = useState({
    search: "",
    postFilter: {
      published: false,
      draft: false
    }
  });

  const [sortField, setSortField] = useState("publishedAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const getPosts = ({ page, deletedDocCount = 0 }) => {
    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-posts-adm`, {
      page,
      filter: query.search ? "search" : "all",
      query: query.search,
      postFilter: query.postFilter,
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
          state: posts,
          data: data.posts,
          page,
          user: access_token,
          countRoute: "/get-posts-count-adm",
          data_to_send: {
            filter: query.search ? "search" : "all",
            query: query.search,
            postFilter: query.postFilter
          }
        });

        setPosts(formatedData);
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    if (access_token && posts == null) {
      getPosts({ page: 1 });
    }
  }, [access_token, posts, query, sortField, sortOrder]);

  const handleSearch = (e) => {
    const searchQuery = e.target.value;

    if (e.keyCode === 13) {
      setQuery(prev => ({ ...prev, search: searchQuery }));
      setPosts(null);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;

    if (!value.length) {
      setQuery(prev => ({ ...prev, search: "" }));
      setPosts(null);
    }
  };

  const handleSort = (field) => {
    const newOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newOrder);
    setPosts(null);
  };

  const toggleFilter = (key) => {
    setQuery(prev => {
      let newFilter = { ...prev.postFilter };

      if (key === "published") newFilter.draft = false;
      if (key === "draft") newFilter.published = false;

      newFilter[key] = !prev.postFilter[key];

      return {
        ...prev,
        postFilter: newFilter
      };
    });
    setPosts(null);
  };

  return (
    <>
      <h1 className="max-md:hidden text-xl">{t("Manage Posts")}</h1>
      <Toaster />

      <div className="relative max-md:mt-5 md:mt-8 mb-2">
        <input type="search" onChange={handleSearchChange} onKeyDown={handleSearch} className="input-box search-remove-x" placeholder={t("Search Posts")} />
        <span className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey icon"></span>
      </div>
      <div className="flex gap-2 mb-2 flex-wrap">
        <p className="text-dark-grey mt-1">{`${t("Show Only")}:`}</p>
        <div className="flex gap-2">
          <button
            onClick={() => toggleFilter("published")}
            className={`btn-filter px-2 py-1 ${query.postFilter.published ? 'bg-black text-white' : 'bg-grey text-black'}`}
          >{t("Published")}</button>
          <button
            onClick={() => toggleFilter("draft")}
            className={`btn-filter px-2 py-1 ${query.postFilter.draft ? 'bg-black text-white' : 'bg-grey text-black'}`}
          >{t("Draft")}</button>
        </div>
      </div>

      {
        posts == null ? (
          <Loader />
        ) : posts.results.length ? (
          <>
            {/* Desktop Table View */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-grey text-left">
                    <th className="border-r border-grey">
                      <SortButton
                        sortFunc={handleSort}
                        sortBy={"title"}
                        fieldState={sortField}
                        orderState={sortOrder}
                        label={t("Title")}
                      />
                    </th>
                    <th className="py-3 px-4 border-r border-grey">{t("Author")}</th>
                    <th className="border-r border-grey">
                      <SortButton
                        sortFunc={handleSort}
                        sortBy={"publishedAt"}
                        fieldState={sortField}
                        orderState={sortOrder}
                        label={t("Published At")}
                      />
                    </th>
                    <th className="border-r border-grey">
                      <SortButton
                        sortFunc={handleSort}
                        sortBy={"activity.total_likes"}
                        fieldState={sortField}
                        orderState={sortOrder}
                        label={t("Likes")}
                      />
                    </th>
                    <th className="py-3 px-4 border-r border-grey">{t("Status")}</th>
                    <th className="py-3 px-4">{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.results.map(post => (
                    <ManagePostsCard key={post.post_id} post={post} setPosts={setPosts} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              {posts.results.map(post => (
                <ManagePostsCard key={post.post_id} post={post} setPosts={setPosts} isMobile />
              ))}
            </div>

            <LoadMoreDataBtn
              className="my-4"
              state={posts}
              fetchDataFunc={getPosts}
              additionalParam={{ deletedDocCount: posts.deletedDocCount }}
            />
          </>
        ) : (
          <NoDataMessage message={`${t("No posts found")}.`} />
        )
      }
    </>
  )
}

export default PostsManagementPage;