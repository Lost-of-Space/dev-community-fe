import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import { removeFromSession } from "../common/session";
import { useTranslation } from "react-i18next";

const BlockedPage = () => {
  const { t } = useTranslation();

  const { userAuth: { isBlocked }, setUserAuth } = useContext(UserContext);

  let navigate = useNavigate();

  const signOutUser = () => {
    removeFromSession("user");
    setUserAuth({ access_token: null });
    navigate("/");
  }

  return (
    <div className="flex items-center justify-center flex-col min-h-[calc(100vh-80px)] bg-blocked-red px-8">
      {
        isBlocked ?
          <>
            <h1 className="text-white-404 text-3xl font-bold">{t("blocked_Sorry")}!</h1>
            <p className="text-white-404 text-2xl max-sm:text-xl">{t("blocked_You have been")} <span className="font-bold text-2xl max-sm:text-xl">{t("blocked_blocked")}</span>.</p>
            <p className="text-white-404 text-4xl max-sm:text-3xl font-bold">{t("blocked_But")}</p>
            <p className="text-white-404 text-2xl max-sm:text-xl">{t("blocked_You can sign out")}, {t("blocked_and create a new account")}.</p>
            <p className="text-white-404 text-2xl max-sm:text-xl">{t("blocked_Hope you will be a good user next time")}!</p>
            <button className="bg-white text-black m-4 px-6 py-3 text-xl max-sm:text-base hover:bg-black hover:text-white" onClick={signOutUser}>{t("blocked_Logout to start from scratch")}</button>
          </>
          :
          <>
            <h1 className="text-white-404 text-3xl font-bold max-sm:text-2xl">{t("blocked_Hmm")}..</h1>
            <p className="text-white-404 text-2xl max-sm:text-xl">{t("blocked_What are you doing")} <span className="font-bold text-2xl max-sm:text-xl">{t("blocked_Here")}</span>?</p>
            <p className="text-white-404 text-2xl max-sm:text-xl">{t("blocked_It seems like you are not blocked")}</p>
            <p className="text-white-404 text-4xl max-sm:text-2xl font-bold">{t("blocked_But")}</p>
            <p className="text-white-404 text-3xl max-sm:text-2xl">{t("blocked_If you want to")}...</p>
          </>
      }
    </div>
  )
}

export default BlockedPage;