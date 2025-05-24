import { useContext } from "react";
import { UserContext } from "../../App";
import toast from "react-hot-toast";
import axios from "axios";
import { NavLink } from "react-router-dom";
import DialogWrapper from "../../components/dialog-window.component";
import { credentialHeaders } from '~/services/credentials'
import { useTranslation } from "react-i18next";

const ManageUserCard = ({ user, setUsers }) => {
  const { t } = useTranslation();

  const { userAuth, userAuth: { access_token, isAdmin } } = useContext(UserContext);

  const {
    _id,
    personal_info: { profile_img = "/default-profile.png", fullname, username, email },
    admin,
    joinedAt,
    blocked,
    account_info: { total_posts = 0 }
  } = user;

  const toggleUserFlag = async (targetUserId, fieldToToggle) => {
    let loadingToast = toast.loading(`${t("Toggling")} ${fieldToToggle}...`);

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/toggle-user-flag`,
        {
          targetUserId,
          field: fieldToToggle,
        },
        {
          headers: {
            'X-Authorization': `Bearer ${access_token}`,
            ...credentialHeaders
          }
        }
      );

      setUsers(prevUsers => ({
        ...prevUsers,
        results: prevUsers.results.map(user =>
          user._id === targetUserId
            ? { ...user, [fieldToToggle]: response.data[fieldToToggle] }
            : user
        )
      }));

      toast.dismiss(loadingToast);
      toast.success(response.data.message);

    } catch (error) {
      console.error(`${t("Failed to toggle")} ${fieldToToggle}:`, error);
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.error || `${t("Failed to update")} ${fieldToToggle}`);
    }
  };


  return (
    <tr className="border-b border-grey hover:bg-grey/20 max-sm:flex flex-col">
      <td className="p-4">
        <div className="flex items-center gap-4">
          <img
            src={profile_img}
            className="w-10 h-10 rounded-full object-cover"
            alt={fullname}
          />
          <div>
            <p className="font-medium">{fullname}</p>
            <NavLink to={`/user/${username}`} className="text-dark-grey text-sm hover:underline active:underline">@{username}</NavLink>
          </div>
        </div>
      </td>
      <div className="hidden max-sm:block h-px bg-grey mb-2"></div>

      <td className="p-4 max-sm:py-1">
        <p>{email}</p>
      </td>

      <td className="p-4 max-sm:py-1">
        <p>{new Date(joinedAt).toLocaleDateString()}</p>
      </td>

      <td className="p-4 max-sm:hidden">
        <p>{total_posts}</p>
      </td>

      <td className="p-4 max-sm:py-1 max-sm:flex gap-2">
        {
          admin ?
            <span className="bg-royalblue/30 text-royalblue py-1 px-2 rounded text-xs">Admin</span>
            :
            <span className="bg-yellow/30 text-yellow py-1 px-3 rounded text-xs">User</span>
        }

        {
          blocked ?
            <span className="bg-red/30 text-red py-1 px-2 rounded text-xs sm:hidden">Blocked</span>
            :
            ""
        }
      </td>

      <td className="p-4">
        <div className="hidden max-sm:block h-px bg-grey mb-4"></div>
        <div className="flex gap-2">
          <DialogWrapper
            onConfirm={() => toggleUserFlag(_id, "admin")}
            message={<p>{t("Are you sure you want to")} <span className="underline">{admin ? t("remove") : t("add")}</span> <span className="text-yellow bg-yellow/20 px-2">{t("Admin")}</span> {t("status of user")} <span className="text-royalblue">{username}</span>?</p>}
          >
            <button
              className="flex items-center justify-center hover:bg-yellow/20 hover:text-yellow active:bg-yellow/20 active:text-yellow px-2 py-1 h-8 w-8 rounded font-bold disabled:bg-grey/70 disabled:text-black/50"
              disabled={email === userAuth.email}
            >
              <span className={`-mb-1 fi fi-${admin ? "sr-star text-yellow" : "rr-star"}`}></span>
            </button>
          </DialogWrapper>
          <DialogWrapper
            onConfirm={() => toggleUserFlag(_id, "blocked")}
            message={<p>{t("Are you sure you want to")} <span className={"px-2 " + (blocked ? "text-green bg-green/30" : "text-red bg-red/30")}>{blocked ? t("mng_unblock") : t("mng_block")}</span> {t("user")} <span className="text-royalblue">{username}</span>?</p>}
            confirmText={!blocked ? t("Block") : t("Unblock")}
          >
            <button
              disabled={email === userAuth.email}
              className="hover:bg-red/30 hover:text-red px-2 py-1 rounded disabled:bg-grey disabled:opacity-60 disabled:text-black"
            >
              {!blocked ? t("Block") : t("Unblock")}
            </button>
          </DialogWrapper>
        </div>
      </td>
    </tr>
  );
};

export default ManageUserCard;