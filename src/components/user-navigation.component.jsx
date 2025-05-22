import { Link, useNavigate } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { useContext } from "react";
import { UserContext } from "../App";
import { removeFromSession } from "../common/session";
import { useTranslation } from "react-i18next";

const UserNavigationPanel = () => {
  const { t } = useTranslation();

  const { userAuth: { username, isAdmin }, setUserAuth } = useContext(UserContext);

  let navigate = useNavigate();

  const signOutUser = () => {
    removeFromSession("user");
    setUserAuth({ access_token: null });
    navigate("/");
  }

  return (
    <AnimationWrapper
      className="absolute right-0 z-50"
      transition={{ duration: 0.2 }}
    >
      <div className="bg-white absolute right-0 border border-grey w-60 duration-200 shadow-sm">
        <Link to="/editor" className="flex gap-2 link md:hidden py-4 pl-5 hover:bg-black hover:text-white selector-white">
          <span className="fi fi-rr-file-edit icon"></span>
          <p>{t("Post")}</p>
        </Link>
        <Link to={`/user/${username}`} className="flex gap-2 link py-4 pl-5 hover:bg-black hover:text-white selector-white">
          <span className="fi fi-rr-user icon"></span>
          <p>{t("Profile")}</p>
        </Link>
        <Link to="/dashboard/posts" className="flex gap-2 link py-4 pl-5 hover:bg-black hover:text-white selector-white">
          <span className="fi fi-rr-chart-simple icon"></span>
          <p>{t("Dashboard")}</p>
        </Link>

        {
          isAdmin ?
            <Link to="/admin/users" className="flex gap-2 link py-4 pl-5 hover:bg-black hover:text-white selector-white">
              <span className="fi fi-rr-settings-sliders icon"></span>
              <p>{t("Control Panel")}</p>
            </Link>
            :
            null
        }

        <Link to="/settings/edit-profile" className="flex gap-2 link py-4 pl-5 hover:bg-black hover:text-white selector-white">
          <span className="fi fi-rr-settings icon"></span>
          <p>{t("Settings")}</p>
        </Link>

        <span className="absolute border-t border-grey w-[100%]">
        </span>

        <button className="text-left p-4 w-full pl-8 py-4 hover:bg-black hover:text-white selector-white" onClick={signOutUser}>
          <h1 className="font-bold text-xl">{t("Sign Out")}</h1>
        </button>
      </div>
    </AnimationWrapper>
  )

}

export default UserNavigationPanel;