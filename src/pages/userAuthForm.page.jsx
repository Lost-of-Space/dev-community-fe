import { useContext } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.svg";
import githubIcon from "../imgs/github.svg";
import githubIcon_white from "../imgs/github_white.svg";
import { Navigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast"; //notification lib
import axios from "axios";
import { storeInSession } from "../common/session";
import { ThemeContext, UserContext } from "../App";
import { authWithGoogle, authWithGithub } from "../common/firebase";
import TextAnimationWrap from "../common/text-animation";
import { useTranslation } from "react-i18next";

import { credentialHeaders } from '~/services/credentials'

const UserAuthForm = ({ type }) => {
  const { t } = useTranslation();

  let { userAuth: { access_token }, setUserAuth } = useContext(UserContext)
  let { theme } = useContext(ThemeContext);

  const userAuthThroughServer = (serverRoute, formData) => {

    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}${serverRoute}`, formData, {
      withCredentials: true,
      headers: credentialHeaders
    })
      .then(({ data }) => {
        storeInSession("user", JSON.stringify(data))

        setUserAuth(data)
      })
      .catch((error) => {
        const errorMsg = error?.response?.data?.error || "Something went wrong.";
        toast.error(`${t("An error occured")}: ${errorMsg}`);
      })

  }

  const handleSubmit = (e) => {

    e.preventDefault();

    let serverRoute = type == "sign-in" ? "/signin" : "/signup";

    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    // formData
    let form = new FormData(formElement);
    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    //form validation
    let { fullname, email, password } = formData;

    //Data validation
    if (fullname) {
      if (fullname.length < 4) {
        return toast.error(`${t("Fullname must be at least 4 letters long")}.`)
      }
    }

    if (!email.length) {
      return toast.error(`${t("Enter email")}.`)
    }

    if (!emailRegex.test(email)) {
      return toast.error(`${t("Email is invalid")}.`)
    }

    if (!passwordRegex.test(password)) {
      return toast.error(`${t("Password should be 6 to 20 chars long with at least 1 numeric, 1 lowercase and 1 uppercase letters")}.`)
    }

    userAuthThroughServer(serverRoute, formData);

  }

  const handleGoogleAuth = (e) => {
    e.preventDefault();

    authWithGoogle().then(user => {

      let serverRoute = "/google-auth";

      let formData = {
        access_token: user.accessToken
      }
      userAuthThroughServer(serverRoute, formData)

    })
      .catch(err => {
        return toast.error(`${t("An error occured")}: ${err}`);
      })
  }

  const handleGithubAuth = (e) => {
    e.preventDefault();

    authWithGithub().then(user => {

      let serverRoute = "/github-auth";

      let formData = {
        access_token: user.accessToken
      }
      userAuthThroughServer(serverRoute, formData)

    })
      .catch(err => {
        return toast.error(`${t("An error occured")}: ${err}`);
      })
  }

  return (
    access_token ?
      <Navigate to="/" />
      :
      <AnimationWrapper keyValue={type} duration="2">
        <section className="h-cover flex items-center justify-center relative overflow-hidden">
          <Toaster />

          <div className={"rounded-full absolute z-20 flex items-center justify-center select-none max-md:hidden max-lg:hidden h-[160%] w-[85%] " + (type == "sign-in" ? "animate-slideToLeft -right-[40%]  bg-gradient-to-tl from-50%" : "animate-slideToRight -left-[40%]  bg-gradient-to-br from-50%") + " from-black to-black/60"}>
            <div className={(type == "sign-in" ? "mr-[50%]" : "ml-[50%]")}>
              <h2 className="text-white font-bold text-2xl mb-4">{type == "sign-in" ? t("Nice to see you again!") : t("For first time here?")}</h2>
              <p className="text-white/80 text-xl">{type == "sign-in" ? t("Log in to continue your Adventure!)") : t("Register to start your Adventure!")}</p>
            </div>
          </div>

          <form id="formElement" className={"z-0 w-[80%] max-w-[400px] lg:absolute " + (type == "sign-in" ? "left-[15%] animate-slideToLeft" : "right-[15%] animate-slideToRight")}>

            <h1 className="font-monospace text-center mb-24">
              {type == "sign-in" ?
                <TextAnimationWrap text={t("Welcome back")} className="text-4xl" />
                :
                <TextAnimationWrap text={t("Register now")} className="text-4xl" />
              }
            </h1>

            {
              type != "sign-in" ?
                <InputBox
                  name="fullname"
                  type="text"
                  placeholder={t("Full Name")}
                  icon="fi-rr-user"
                />
                : ""
            }

            <InputBox
              name="email"
              type="email"
              placeholder={t("Email")}
              icon="fi-rr-at"
            />

            <InputBox
              name="password"
              type="password"
              placeholder={t("Password")}
              icon="fi-rr-key"
            />

            <button className="btn-dark center mt-14" type="submit" onClick={handleSubmit}>
              {type.replace("-", " ")}
            </button>

            <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
              <hr className="w-1/2 border-black"></hr>
              <p>{t("auth_or")}</p>
              <hr className="w-1/2 border-black"></hr>
            </div>

            <div className="flex justify-around">
              <button className="btn-light flex items-center justify-center gap-4 w-[35%] center"
                onClick={handleGoogleAuth}>
                Google
                <img src={googleIcon} className="h-8 w-8 -mx-1" alt="google-logo" />
              </button>
              <button className="btn-light flex items-center justify-center gap-4 w-[35%] center"
                onClick={handleGithubAuth}>
                Github
                <img src={theme == "light" ? githubIcon : githubIcon_white} className="w-9 -mx-1" alt="google-logo" />
              </button>
            </div>

            {/*
              type == "sign-in" ?
                <p className="mt-6 text-dark-grey text-xl text-center">
                  Don't have an account?
                  <Link to="/signup" className="underline px-1 text-black text-xl ml-1">
                    Register here
                  </Link>
                </p>
                :
                <p className="mt-6 text-dark-grey text-xl text-center">
                  Already registered?
                  <Link to="/signin" className="underline px-1 text-black text-xl ml-1">
                    Sign in here
                  </Link>
                </p>
            */}

          </form>
        </section>
      </AnimationWrapper>
  )
}

export default UserAuthForm