import { useContext, useState } from "react"
import toast, { Toaster } from "react-hot-toast"
import { UserContext } from "../App";
import axios from "axios";
import { useTranslation } from "react-i18next";

import { credentialHeaders } from '~/services/credentials'

const NotificationCommentField = ({ _id, post_author, index = undefined, replyingTo = undefined, setReplying, notification_id, notificationData }) => {
  const { t } = useTranslation();

  let { _id: user_id } = post_author;
  let { userAuth: { access_token } } = useContext(UserContext);
  let { notifications, notifications: { results }, setNotifications } = notificationData;

  let [comment, setComment] = useState('');

  const handleComment = () => {

    if (!comment.length) {
      return toast.error(t("Comment cannot be empty"));
    }

    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/add-comment`, { _id, post_author: user_id, comment, replying_to: replyingTo, notification_id },
      {
        headers: {
          'X-Authorization': `Bearer ${access_token}`,
          ...credentialHeaders
        }
      })
      .then(({ data }) => {
        setReplying(false);

        results[index].reply = { comment, _id: data._id }
        setNotifications({ ...notifications, results })
      })
      .catch(err => {
        console.log(err);
      })
  }

  return (
    <>
      <Toaster />
      <textarea value={comment} className="input-box pl-5 placeholder:text-dark-grey resize-none h-36 overflow-auto" placeholder={`${t("Leave a reply")}...`}
        onChange={(e) => setComment(e.target.value)}>
      </textarea>
      <button onClick={handleComment} className="btn-dark mt-5 px-10 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!comment.trim().length}>{t("Reply")}</button>
    </>
  )
}

export default NotificationCommentField