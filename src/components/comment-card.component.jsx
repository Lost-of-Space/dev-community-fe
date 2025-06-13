import toast from "react-hot-toast";
import { UserContext } from "../App";
import { useContext, useState } from "react";
import CommentField from "./comment-field.component";
import { PostContext } from "../pages/post.page";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useLocalizedDateUtils } from "../common/date";

import { credentialHeaders } from '~/services/credentials'

const CommentCard = ({ index, leftVal, commentData }) => {
  const { getDay, getFullDay } = useLocalizedDateUtils();
  const { t } = useTranslation();

  let { commented_by: { personal_info: { profile_img, fullname, username: commented_by_username } }, commentedAt, comment, _id, children } = commentData;

  let { post, post: { comments, activity, activity: { total_parent_comments }, comments: { results: commentsArr }, author: { personal_info: { username: post_author } } }, setPost, setTotalParentCommentsLoaded } = useContext(PostContext);

  let { userAuth: { access_token, username } } = useContext(UserContext);

  const [isReplying, setReplying] = useState(false);

  const getParentIndex = () => {
    let startingPoint = index - 1;

    try {
      while (commentsArr[startingPoint].childrenLevel >= commentData.childrenLevel) {
        startingPoint--;
      }
    } catch {
      startingPoint = undefined;
    }

    return startingPoint;
  }

  const removeCommentsCards = (startingPoint, isDelete = false) => {
    if (commentsArr[startingPoint]) {
      while (commentsArr[startingPoint].childrenLevel > commentData.childrenLevel) {
        commentsArr.splice(startingPoint, 1);
        if (!commentsArr[startingPoint]) {
          break;
        }
      }
    }

    if (isDelete) {
      let parentIndex = getParentIndex();

      if (parentIndex != undefined) {
        commentsArr[parentIndex].children = commentsArr[parentIndex].children.filter(child => child != _id)

        if (!commentsArr[parentIndex].children.length) {
          commentsArr[parentIndex].isReplyLoaded = false;
        }
      }

      commentsArr.splice(index, 1);
    }

    if (commentData.childrenLevel == 0 && isDelete) {
      setTotalParentCommentsLoaded(preVal => preVal - 1);
    }

    setPost({ ...post, comments: { results: commentsArr }, activity: { ...activity, total_parent_comments: total_parent_comments - (commentData.childrenLevel == 0 && isDelete ? 1 : 0) } })
  }

  const deleteComment = (e) => {
    e.target.setAttribute("disabled", true)

    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/delete-comment`, { _id }, {
      headers: {
        'X-Authorization': `Bearer ${access_token}`,
        ...credentialHeaders
      }
    })
      .then(() => {
        e.target.removeAttribute("disabled");
        removeCommentsCards(index + 1, true);
      })
      .catch(err => {
        console.log(err);
      })
  }

  const hideReplies = () => {
    commentData.isReplyLoaded = false;

    removeCommentsCards(index + 1);
  }

  const loadReplies = ({ skip = 0, currentIndex = index }) => {
    if (commentsArr[currentIndex].children.length) {
      hideReplies();

      axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-replies`, { _id: commentsArr[currentIndex]._id, skip }, {
        headers: {
          ...credentialHeaders
        }
      })
        .then(({ data: { replies } }) => {

          commentsArr[currentIndex].isReplyLoaded = true;

          for (let i = 0; i < replies.length; i++) {

            replies[i].childrenLevel = commentsArr[currentIndex].childrenLevel + 1;

            commentsArr.splice(currentIndex + 1 + i + skip, 0, replies[i])

          }
          setPost({ ...post, comments: { ...comments, results: commentsArr } })

        })
        .catch(err => {
          console.log(err);
        })
    }
  }

  const handleReplyClick = () => {
    if (!access_token) {
      return toast.error(t("Login to leave a comment"));
    }

    setReplying(preVal => !preVal);
  }

  const LoadMoreRepliesButton = () => {
    let parentIndex = getParentIndex();

    let button = <button onClick={() => loadReplies({ skip: index - parentIndex, currentIndex: parentIndex })}
      className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
    >{t("Load more Replies")}</button>

    if (commentsArr[index + 1]) {
      if (commentsArr[index + 1].childrenLevel < commentsArr[index].childrenLevel) {
        if ((index - parentIndex) < commentsArr[parentIndex].children.length) {
          return button;
        }
      }
    } else {
      if (parentIndex) {
        if ((index - parentIndex) < commentsArr[parentIndex].children.length) {
          return button;
        }
      }
    }

  }

  return (
    <div className="w-full" style={{ paddingLeft: `${Math.min(commentData.childrenLevel, 2) * 2 * 10}px` }}>
      <div className="my-5 p-5 border border-grey">
        <div className="flex gap-3 items-center mb-8">
          <img src={profile_img} className="w-6 h-6 rounded-full" alt="profile image" />
          <p className="line-clamp-1">{fullname}</p>
          <p className="-mx-2">•</p>
          <p className="min-w-fit">{getDay(commentedAt)}</p>
        </div>

        <p className="text-xl ml-3">{comment}</p>

        <div className="flex gap-5 items-center justify-end mt-5">

          {
            commentData.isReplyLoaded ?
              <button onClick={hideReplies} className="text-dark-grey p-2 px-3 hover:bg-grey/30 flex items-center gap-2">
                <span className="fi fi-br-comment-dots"></span> {t("Hide Replies")}
              </button>
              :
              children.length ?
                <button onClick={loadReplies} className="text-dark-grey p-2 px-3 hover:bg-grey/30 flex items-center gap-2">
                  <span className="fi fi-br-comment-dots"></span> {t("Show Replies")} ({children.length})
                </button>
                :
                ""
          }

          <button onClick={handleReplyClick} className="h-7 w-7 text-dark-grey hover:text-royalblue active:text-royalblue hover:bg-royalblue/30 active:bg-royalblue/30 rounded-sm">
            <span className={"fi fi-br-" + (isReplying ? "cross-small" : "arrow-turn-down-left")}></span>
          </button>

          {
            username === commented_by_username || username === post_author ?
              <button onClick={deleteComment} className="h-7 w-7 text-dark-grey hover:text-red active:text-red hover:bg-red/30 active:bg-red/30 rounded-sm">
                <span className="fi fi-br-trash"></span>
              </button>
              : ""
          }
        </div>

        {
          isReplying ?
            <div className="mt-3">
              <CommentField action="reply" index={index} replyingTo={_id} setReplying={setReplying} />
            </div> : ""
        }
      </div>

      <LoadMoreRepliesButton />

    </div>
  )
}

export default CommentCard;