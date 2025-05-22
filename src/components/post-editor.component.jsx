import { Link, useNavigate, useParams } from "react-router-dom";
import logo from "../imgs/logo.svg";
import logo_white from "../imgs/logo_white.svg";
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../imgs/default_banner.png"
import { useContext, useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs"; //lib for text editor
import { tools } from "./tools.component";
import axios from "axios";
import { ThemeContext, UserContext } from "../App";
import useCloudinaryUpload from "../common/cloudinary";
import Loader from "./loader.component";
import { credentialHeaders } from '~/services/credentials'
import { useTranslation } from "react-i18next";

const PostEditor = () => {
  const { t } = useTranslation();

  const editorContext = useContext(EditorContext);
  if (!editorContext || !editorContext.post) {
    return <Loader />
  }

  const {
    post,
    post: { title, banner, content, tags, des },
    setPost,
    textEditor,
    setTextEditor,
    setEditorState,
  } = editorContext;


  let { userAuth: { access_token } } = useContext(UserContext);
  let { post_id } = useParams();

  let { theme, setTheme } = useContext(ThemeContext);

  let navigate = useNavigate();


  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(new EditorJS({
        holder: "textEditor",
        data: Array.isArray(content) ? content[0] : content,
        tools: tools,
        placeholder: `${t("Type here anything")}...`
      }))
    }
  }, [])

  const [bannerImg, setBannerImg] = useState(defaultBanner);
  const { uploading, uploadToCloudinary } = useCloudinaryUpload();

  const handleBannerUpload = async (e) => {
    const img = e.target.files[0];
    if (img) {
      try {
        let loadingToast = toast.loading(`${t("Uploading")}...`);
        const url = await uploadToCloudinary(img);

        if (url) {
          //updating banner
          setBannerImg(url);
          setPost({ ...post, banner: url });
          toast.dismiss(loadingToast);
          toast.success(`${t("Uploaded")}!`);
        }
        toast.dismiss(loadingToast);
      } catch (error) {
        toast.error(`${t("An error occured")}: ${error.message}`);
      }
    }
  };

  //set default banner
  // const handleBannerError = (e) => {
  //   let img = e.target;

  //   img.src = defaultBanner;
  // }

  //Text editor
  const handleTitleKeyDown = (e) => {
    if (e.keyCode == 13) {
      e.preventDefault();
    }
  }

  const handleTitleChange = (e) => {
    let input = e.target;

    input.style.height = 'auto';
    input.style.height = input.scrollHeight + "px";

    setPost({ ...post, title: input.value })
  }

  const handlePublishEvent = () => {
    if (!banner.length) {
      return toast.error(`${t("Upload a post banner to publish it")}.`)
    }

    if (!title.length) {
      return toast.error(`${t("Set a post title to publish it")}.`)
    }

    if (textEditor.isReady) {
      textEditor.save().then(data => {
        if (data.blocks.length) {
          setPost({ ...post, content: data });
          setEditorState("publish")
        } else {
          return toast.error(`${t("Write something in post to publish it")}.`)
        }
      })
        .catch((err) => {
          return toast.error(`${t("An error occured")}: ` + err)
        })
    }
  }

  const handleSaveDraft = (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }

    if (!title.length) {
      return toast.error(`${t("Draft must have a title")}.`)
    }

    let publishingToast = toast.loading(`${t("Publishing")}...`)

    e.target.classList.add('disable');

    if (textEditor.isReady) {
      textEditor.save().then(content => {
        let postObj = {
          title, banner, des, content, tags, draft: true
        }
        //sends access token to confirm authorization
        axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/create-post`, { ...postObj, id: post_id }, {
          headers: {
            'X-Authorization': `Bearer ${access_token}`,
            ...credentialHeaders
          }
        })
          .then(() => {
            e.target.classList.remove('disable');

            toast.dismiss(publishingToast);
            toast.success(t("Saved"));

            setTimeout(() => {
              navigate("/dashboard/posts?tab=draft")
            }, 500);

          })
          .catch(({ response }) => {
            e.target.classList.remove('disable');

            toast.dismiss(publishingToast);
            return toast.error(`${t("An error occured")}: ` + response.data.error);
          })
      })
    }
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-20">
          <img src={theme == "light" ? logo : logo_white} alt="logo" />
        </Link>
        <p className="max-md:hidden text-black line-clamp-1 w-full">
          {title.length ? title : t("New Post")}
        </p>

        <div className="flex gap-4 max-sm:gap-2 ml-auto">
          <button className="btn-dark py-2 max-sm:px-3"
            onClick={handlePublishEvent}>
            {t("Publish")}
          </button>
          <button className="btn-light py-2 max-sm:px-3" onClick={handleSaveDraft}>
            {t("Save Draft")}
          </button>
        </div>

      </nav>
      <Toaster />
      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-70 bg-white border-4 border-grey">
              <label htmlFor="uploadBanner">
                <img src={banner ? banner : defaultBanner} alt="banner image"
                  // onError={handleBannerError}
                  className="z-20" />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>

            <textarea
              defaultValue={title}
              placeholder={`${t("Post Title")}`}
              className="text-4xl w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40 bg-white"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>

            <hr className="w-full opacity-10 my-5" />

            <div id="textEditor" className="font-monospace"></div>

          </div>
        </section>
      </AnimationWrapper>
    </>
  )
}

export default PostEditor;