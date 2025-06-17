import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import { profileDataStructure } from "./profile.page";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import useCloudinaryUpload from "../common/cloudinary";
import InputBox from "../components/input.component";
import { storeInSession } from "../common/session";
import { credentialHeaders } from '~/services/credentials'
import { useTranslation } from "react-i18next";

const EditProfilePage = () => {
  const { t } = useTranslation();

  let { userAuth, userAuth: { access_token }, setUserAuth } = useContext(UserContext);
  const { uploading, uploadToCloudinary } = useCloudinaryUpload();

  let profileImgElement = useRef();
  let editProfileForm = useRef();

  const bioLimit = 150;

  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const [updatedProfileImg, setUpdatedProfileImg] = useState(null);


  let { personal_info: { fullname, username: profile_username, profile_img, email, bio }, social_links } = profile;

  const [charsWritten, setCharsWritten] = useState(0);

  const handleCharChange = (e) => {
    setCharsWritten(e.target.value.length);
  }

  const handleImgPreview = (e) => {
    let img = e.target.files[0];

    profileImgElement.current.src = URL.createObjectURL(img);

    setUpdatedProfileImg(img);
  }

  const handleImgUpload = async (e) => {
    e.preventDefault();

    if (updatedProfileImg) {
      const loadingToast = toast.loading(`${t("Uploading")}...`);
      e.target.setAttribute("disabled", true);

      try {
        const url = await uploadToCloudinary(updatedProfileImg);
        if (url) {
          console.log("Uploaded image URL: ", url);
          axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/update-profile-img`, { url }, {
            headers: {
              'X-Authorization': `Bearer ${access_token}`,
              ...credentialHeaders
            }
          })
            .then(({ data }) => {
              let newUserAuth = { ...userAuth, profile_img: data.profile_img }

              storeInSession("user", JSON.stringify(newUserAuth));
              setUserAuth(newUserAuth);

              setUpdatedProfileImg(null);
              toast.dismiss(loadingToast);
              e.target.removeAttribute("disabled");
              toast.success(`${t("Uploaded")}.`)
            })
            .catch(({ response }) => {
              toast.dismiss(loadingToast);
              e.target.removeAttribute("disabled");
              toast.error(`${t("An error occured")}: ` + response.data.error);
            })
        }
      } catch (err) {
        console.error(`${t("An error occured")}: `, err);
      } finally {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
      }
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();

    let form = new FormData(editProfileForm.current);
    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { username, bio, youtube, facebook, twitter, github, instagram, website } = formData;

    if (username.length < 3) {
      return toast.error(`${t("Username must be at least 3 chars long")}.`)
    }
    if (bio.length > bioLimit) {
      return toast.error(`${t("profile_Bio should not be more than")} ${bioLimit} ${t("profile_chars")}.`)
    }

    let loadingToast = toast.loading(`${t("Updating")}...`);
    e.target.setAttribute("disabled", true);

    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/update-profile`, {
      username, bio, social_links: {
        youtube, facebook, twitter, github, instagram, website
      }
    }, {
      headers: {
        'X-Authorization': `Bearer ${access_token}`,
        ...credentialHeaders
      }
    })
      .then(({ data }) => {
        if (userAuth.username != data.username) {
          let newUserAuth = { ...userAuth, username: data.username };

          storeInSession("user", JSON.stringify(newUserAuth));
          setUserAuth(newUserAuth);
        }

        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.success(`${t("Profile Updated")}.`)
      })
      .catch(({ response }) => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.error(`${t("An error occured")}: ` + response.data.error)
      })
  }

  useEffect(() => {
    if (access_token) {
      axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-profile`, { username: userAuth.username },
        {
          headers: {
            ...credentialHeaders
          }
        })
        .then(({ data }) => {
          setProfile(data);
          setLoading(false);
        })
        .catch(err => {
          console.log(err);
        })
    }
  }, [access_token])

  return (
    <AnimationWrapper>
      {
        loading ? <Loader />
          :
          <form ref={editProfileForm}>
            <Toaster />
            <h1 className="max-md:hidden text-xl">{t("Edit Profile")}</h1>

            <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">

              <div className="max-lg:center items-center mb-5">
                <label htmlFor="uploadImg" id="profileImgLbl" className="center relative block w-48 h-48 bg-grey rounded-full overflow-hidden">
                  <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-center text-white bg-black/30 opacity-0 hover:opacity-100 cursor-pointer">
                    {t("Upload Image")}
                  </div>
                  <img ref={profileImgElement} src={profile_img} alt="profile picture" />
                </label>

                <input type="file" id="uploadImg" onChange={handleImgPreview} accept=".jpeg, .jpg, .png, .gif" hidden />

                <button onClick={handleImgUpload} disabled={updatedProfileImg == null ? true : false} className="btn-light disabled:cursor-not-allowed disabled:opacity-50 mt-5 max-lg:center lg:w-full px-10">{t("Upload Image")}</button>
              </div>

              <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                  <div>
                    <InputBox name="fullname" type="text" value={fullname} placeholder={t("Full Name")} disabled={true} icon="fi-rr-user" />
                  </div>
                  <div>
                    <InputBox name="email" type="email" value={email} placeholder={t("Email")} disabled={true} icon="fi-rr-envelope" />
                  </div>
                </div>

                <InputBox name="username" type="text" value={profile_username} placeholder={t("Username")} icon="fi-rr-at" />

                <p className="text-dark-grey/70 -mt-3">*{t("profile_Username will be used to search user")}, {t("profile_it is visible to everyone")}.</p>
                <textarea name="bio" maxLength={bioLimit} defaultValue={bio} onChange={handleCharChange} placeholder={`${t("Profile Description")}...`} className="input-box h-48 lg:h-40 resize-none leading-7 mt-5 pl-5"></textarea>
                <p className="text-dark-grey/70 -mt-1">{charsWritten}/{bioLimit}</p>

                <p className="my-5 text-dark-grey">{t("Social Media")}</p>

                <div className="md:grid md:grid-cols-2 gap-x-6">
                  {
                    Object.keys(social_links).map((key, i) => {
                      let link = social_links[key];

                      return <InputBox key={i} name={key} type="text" value={link} placeholder="https://..." icon={"fi " + (key != 'website' ? "fi-brands-" + key : "fi-br-globe") + " text-2xl hover:text-royalblue text-dark-grey"} />
                    })
                  }
                </div>

                <button className="btn-dark w-auto px-12 max-sm:center" onClick={handleUpdateProfile} type="submit">{t("Update Profile")}</button>

              </div>

            </div>
          </form>
      }
    </AnimationWrapper>
  )
}

export default EditProfilePage;