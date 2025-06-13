import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import DialogWrapper from "./dialog-window.component";
import { credentialHeaders } from '~/services/credentials'
import { useTranslation } from "react-i18next";
import { useLocalizedDateUtils } from "../common/date";

const PostStats = ({ stats }) => {
  const { t } = useTranslation();

  // Перетворення stats-об'єкта в масив
  const statItems = Object.entries(stats)
    .filter(([key]) => !key.includes("parent"))
    .map(([key, value]) => ({ id: key, value }));

  return (
    <div className="flex gap-2 max-lg:mb-6 max-lg:pb-6 border-grey max-lg:border-b">
      {statItems.map(({ id, value }, i) => (
        <div
          key={id}
          className={
            "flex flex-col items-center w-full h-full justify-center p-4 px-6 max-sm:px-4 " +
            (i !== 0 ? "border-grey border-l" : "")
          }
        >
          <h1 className="text-xl lg:text-2xl mb-2">{value.toLocaleString()}</h1>
          <p className="max-lg:text-dark-grey capitalize">{t(id)}</p>
        </div>
      ))}
    </div>
  );
};

export const ManagePublishedPostCard = ({ post }) => {
  const { getDay, getFullDay } = useLocalizedDateUtils();
  const { t } = useTranslation();

  let { banner, post_id, title, publishedAt, activity } = post;

  let { userAuth: { access_token } } = useContext(UserContext);

  let [showStats, setShowStats] = useState(false);

  return (
    <>
      <div className="flex gap-4 lg:gap-10 border-b mb-6 max-md:px-4 border-grey pb-6 items-center">
        <img src={banner} className="max:md:hidden lg:hidden xl:block w-28 h-28 max-sm:w-24 max-sm:h-24 flex-none bg-grey object-cover" alt="post banner" />

        <div className="flex flex-col justify-between py-2 w-full md:min-w-[300px]">
          <div>
            <Link to={`/post/${post_id}`} className="post-title mb-4 hover:underline">{title}</Link>

            <p className="line-clamp-1">{t("Published on")} {getDay(publishedAt)}</p>
          </div>

          <hr className="text-grey my-2 max-sm:block hidden" />
          <div className="flex flex-wrap gap-6 max-sm:gap-x-4 gap-y-2 md:mt-3">
            <Link to={`/editor/${post_id}`} className="max-sm:p-0 pt-4 py-2 underline">{t("Edit")}</Link>

            <button onClick={() => setShowStats(preVal => !preVal)} className="max-sm:p-0 lg:hidden pt-4 py-2 underline">{t("Stats")}</button>

            <DialogWrapper
              onConfirm={(e) => deletePost(post, access_token)}
              message={<p>{t("Are you sure you want to")} <span className="text-red bg-red/30 px-2">{t("Delete")}</span> {t("this post?")} <span className="block">{`${t("This action cannot be undone")}.`}</span></p>}
            >
              <button className="max-sm:p-0 pt-4 py-2 underline text-red">{t("Delete")}</button>
            </DialogWrapper>
          </div>

        </div>

        <div className="max-lg:hidden">
          <PostStats stats={activity} />
        </div>

      </div>

      {
        showStats ? <div className="lg:hidden">
          <PostStats stats={activity} />
        </div>
          :
          ""
      }
    </>
  )
}

export const ManageDraftPostCard = ({ post }) => {
  const { t } = useTranslation();

  let { title, des, post_id, index } = post;

  let { userAuth: { access_token } } = useContext(UserContext);

  index++;

  return (
    <div className="flex gap-5 lg:gap-10 pb-6 border-b mb-6 border-grey">
      <h1 className="post-index text-center pl-4 md:pl-6 flex-none text-6xl">{(index + 1).toString().padStart(2, "0")}</h1>

      <div>
        <h1 className="post-title mb-3">{title}</h1>
        <p className="line-clamp-2">{des.length ? des : t("No description")}</p>

        <div className="flex gap-6 mt-3">
          <Link to={`/editor/${post_id}`} className="pt-4 py-2 underline">{t("Edit")}</Link>
          <DialogWrapper
            onConfirm={(e) => deletePost(post, access_token)}
            message={<p>{t("Are you sure you want to")} <span className="text-red bg-red/30 px-2">{t("Delete")}</span> {t("this post?")} <span className="block">{`${t("This action cannot be undone")}.`}</span></p>}
          >
            <button className="pt-4 py-2 underline text-red">{t("Delete")}</button>
          </DialogWrapper>
        </div>
      </div>
    </div>
  )
}

const deletePost = (post, access_token) => {

  let { index, post_id, setStateFunc } = post;

  axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/delete-post`, { post_id }, {
    headers: {
      'X-Authorization': `Bearer ${access_token}`,
      ...credentialHeaders
    }
  })
    .then(({ data }) => {

      setStateFunc(preVal => {
        let { deletedDocCount, totalDocs, results } = preVal;

        results.splice(index, 1);

        if (!deletedDocCount) {
          deletedDocCount = 0;
        }

        if (!results.length && totalDocs - 1 > 0) {
          return null;
        }

        return { ...preVal, totalDocs: totalDocs - 1, deletedDocCount: deletedDocCount + 1 }

      })
    })
    .catch(err => {
      console.log(err);
    })
}