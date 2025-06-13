import { useContext, useEffect, useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import logo from "../imgs/logo.svg";
import logo_white from "../imgs/logo_white.svg";
import { ThemeContext, UserContext } from '../App';
import UserNavigationPanel from "./user-navigation.component";
import axios from "axios";
import { storeInSession } from "../common/session";
import { credentialHeaders } from '~/services/credentials'
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./lang-button.component";
import GlitchStripesLogo from "./logo-glitched.component";

const Navbar = () => {
  const { t } = useTranslation();

  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false)
  const [userNavPanel, setUserNavPanel] = useState(false)
  const [isAtTop, setIsAtTop] = useState(true);


  let { theme, setTheme } = useContext(ThemeContext);

  let navigate = useNavigate();

  const location = useLocation();
  const currentPath = location.pathname;

  const { userAuth, userAuth: { access_token, profile_img, new_notification_available }, setUserAuth } = useContext(UserContext);

  useEffect(() => {
    if (access_token) {
      axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/new-notification`, {
        headers: {
          'X-Authorization': `Bearer ${access_token}`,
          ...credentialHeaders
        }
      })
        .then(({ data }) => {
          setUserAuth({ ...userAuth, ...data })
        })
        .catch(err => {
          console.log(err);
        })
    }
  }, [access_token])

  const handleUserNavPanel = () => {
    setUserNavPanel(currentVal => !currentVal)
  }

  const handleSearch = (e) => {
    let query = e.target.value.trim();

    if (e.keyCode === 13 && query.length) {
      const tagMatches = query.match(/#([^\s#][^#]*)/g);

      if (tagMatches?.length) {
        const encodedTags = tagMatches
          .map(tag => encodeURIComponent(tag.slice(1).trim()))
          .join(",");

        const tagQuery = "tag=" + encodedTags;
        navigate(`/search/${tagQuery}`);
      } else {
        navigate(`/search/${encodeURIComponent(query)}`);
      }
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setUserNavPanel(false);
    }, 200);
  }

  const changeTheme = () => {
    let newTheme = theme == "light" ? "dark" : "light";

    setTheme(newTheme);

    document.body.setAttribute("data-theme", newTheme);

    storeInSession("theme", newTheme);
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY === 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <>
      <nav className="navbar z-[100]">
        <div className={`absolute p-2 rounded-b-md bg-white border border-grey -bottom-[2.65rem] shadow-sm max-md:right-[18%] ${isAtTop ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
          <LanguageSwitcher />
        </div>

        <Link to="/" className="flex-none w-20">
          <GlitchStripesLogo src={theme === "light" ? logo : logo_white} />
        </Link>

        <div className={"absolute bg-white w-full left-0 top-full border-b border-t border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show " + (searchBoxVisibility ? "show" : "hide")}>
          <input type="text" placeholder={t("Search")} className="w-full md:w-auto md:pr-6 search-box"
            onKeyDown={handleSearch} maxLength={60} />
          <span className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey icon"></span>
        </div>

        <div className="flex items-center gap-3 md:gap-6 ml-auto">
          <button className="md:hidden w-12 h-12 rounded-full bg-grey relative hover:bg-black/10" onClick={() => setSearchBoxVisibility(currentVal => !currentVal)}>
            <span className="fi fi-rr-search text-xl block -mb-1"></span>
          </button>

          <Link to="/editor" className="hidden md:flex md:items-center selector-white h-[38px] px-6 gap-2 link hover:bg-royalblue/80 hover:text-white">
            <span className="fi fi-rr-file-edit icon"></span>
            <p>{t("Post")}</p>
          </Link>

          <button onClick={changeTheme} className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10">
            <span className={"text-2xl -mb-1 block mt-1 fi fi-" + (theme == "light" ? "rr-moon-stars" : "rr-brightness")}></span>
          </button>

          {
            access_token ?
              <>
                <Link to="/dashboard/notifications">
                  <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10">
                    <span className="fi fi-rr-bell text-2xl block -mb-[6px]"></span>
                    {
                      new_notification_available ?
                        <span className="bg-red w-3 h-3 rounded-full absolute z-10 top-2 right-2"></span>
                        :
                        ""
                    }
                  </button>
                </Link>

                <div className="relative" onClick={handleUserNavPanel} onBlur={handleBlur}>
                  <button className="w-12 h-12 mt-1">
                    <img src={profile_img} alt="profile image" className="w-full object-cover rounded-full" />
                  </button>

                  {
                    userNavPanel ? <UserNavigationPanel />
                      :
                      ""
                  }
                </div>
              </>
              :
              <>
                {currentPath === "/signup" ? (
                  <Link className="btn-dark py-2 md:block" to="/signin">
                    {t("Sign In")}
                  </Link>
                ) : currentPath === "/signin" ? (
                  <Link className="btn-light py-2 md:block" to="/signup">
                    {t("Sign Up")}
                  </Link>
                ) :
                  <>
                    <Link className="btn-dark py-2 md:block" to="/signin">
                      {t("Sign In")}
                    </Link>
                    <Link className="btn-light py-2 hidden md:block" to="/signup">
                      {t("Sign Up")}
                    </Link>
                  </>
                }
              </>
          }

        </div>

      </nav>

      <Outlet />
    </>
  )
}

export default Navbar;