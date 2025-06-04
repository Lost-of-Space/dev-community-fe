import { useContext } from "react";
import { UserContext } from "../../App";
import toast from "react-hot-toast";
import axios from "axios";
import { NavLink } from "react-router-dom";
import DialogWrapper from "../../components/dialog-window.component";
import { credentialHeaders } from '~/services/credentials'
import { useTranslation } from "react-i18next";
import { PopupMenu } from "../../components/popup.component";

const ManageReportCard = ({ report, setReports }) => {
  const { t } = useTranslation();
  const { userAuth: { access_token } } = useContext(UserContext);

  const {
    _id,
    from,
    post_id,
    text: reportText,
    status: reportStatus,
    createdAt
  } = report;

  const statusOptions = {
    pending: t("Pending"),
    reviewed: t("Reviewed"),
    rejected: t("Rejected")
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    let loadingToast = toast.loading(t("Updating status"));

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/update-report-status`,
        {
          reportId: _id,
          status: newStatus
        },
        {
          headers: {
            'X-Authorization': `Bearer ${access_token}`,
            ...credentialHeaders
          }
        }
      );

      setReports(prevReports => ({
        ...prevReports,
        results: prevReports.results.map(report =>
          report._id === _id ? { ...report, status: newStatus } : report
        )
      }));

      toast.dismiss(loadingToast);
      toast.success(response.data.message);
    } catch (error) {
      console.error("Failed to update report status:", error);
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.error || t("Failed to update status"));
    }
  };

  const deleteReport = async () => {
    let loadingToast = toast.loading(t("Deleting report"));

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_SERVER_DOMAIN}/delete-report/${_id}`,
        {
          headers: {
            'X-Authorization': `Bearer ${access_token}`,
            ...credentialHeaders
          }
        }
      );

      setReports(prevReports => ({
        ...prevReports,
        results: prevReports.results.filter(report => report._id !== _id)
      }));

      toast.dismiss(loadingToast);
      toast.success(response.data.message);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.error || t("Failed to delete report"));
    }
  };

  return (
    <tr className="border-b border-grey hover:bg-grey/20 max-sm:flex flex-col">
      {/* Post Title - small line */}
      <td className="p-4 max-w-[200px]">
        <NavLink
          to={`/post/${post_id.post_id}`}
          className="truncate block hover:underline active:underline"
          title={post_id.title}>
          {post_id.title}
        </NavLink>
      </td>

      {/* Report Text - long line */}
      <td className="p-4">
        <PopupMenu
          trigger={<p className="line-clamp-1 max-w-[150px] truncate block overflow-hidden">{reportText}</p>}>
          <p className="px-2 w-80">{reportText}</p>
        </PopupMenu>
      </td>

      {/* Reported By - only username */}
      <td className="p-4 max-w-[150px]">
        <NavLink to={`/user/${from.username}`} className="block text-dark-grey md:max-w-[150px] truncate overflow-hidden whitespace-nowrap hover:underline active:underline">@{from.username}</NavLink>
      </td>

      {/* Reported At */}
      <td className="p-4 max-w-[150px]">
        <p>{new Date(createdAt).toLocaleDateString()}</p>
      </td>

      {/* Status */}
      <td className="p-4 max-w-[150px]">
        <select
          value={reportStatus}
          onChange={handleStatusChange}
          className={`px-1 py-1 rounded ${reportStatus === 'pending' ? 'bg-yellow/30 text-yellow' :
            reportStatus === 'reviewed' ? 'bg-royalblue/30 text-royalblue' :
              'bg-red/30 text-red'
            }`}
        >
          {Object.entries(statusOptions).map(([key, label]) => (
            <option className="bg-white text-black" key={key} value={key}>{label}</option>
          ))}
        </select>
      </td>

      {/* Actions */}
      <td className="p-4 max-w-[120px]">
        <div className="flex gap-2">
          <DialogWrapper
            onConfirm={deleteReport}
            message={<p>{t("Are you sure you want to delete this report from")} <span className="text-royalblue">@{from.username}</span>?</p>}
            confirmText={t("Delete")}
          >
            <button className="hover:bg-red/30 hover:text-red px-2 py-1 rounded">
              {t("Delete")}
            </button>
          </DialogWrapper>
        </div>
      </td>
    </tr>
  );
};

export default ManageReportCard;