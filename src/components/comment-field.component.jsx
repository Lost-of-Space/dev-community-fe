import { useContext, useState } from "react";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { PostContext } from "../pages/post.page";

const CommentField = ({ action, index = undefined, replyingTo = undefined, setReplying }) => {

  let { post, post: { _id, author: { _id: post_author }, comments, comments: { results: commentsArr }, activity, activity: { total_comments, total_parent_comments } }, setPost, setTotalParentCommentsLoaded } = useContext(PostContext);

  let { userAuth: { access_token, username, fullname, profile_img } } = useContext(UserContext);

  const [comment, setComment] = useState("")

  const handleComment = () => {

    if (!access_token) {
      return toast.error("Login to leave a comment");
    }
    if (!comment.length) {
      return toast.error("Comment cannot be empty");
    }

    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/add-comment", { _id, post_author, comment, replying_to: replyingTo },
      {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })
      .then(({ data }) => {

        setComment("");

        data.commented_by = { personal_info: { username, profile_img, fullname } }

        let newCommentArr;

        if (replyingTo) {
          commentsArr[index].children.push(data._id);

          data.childrenLevel = commentsArr[index].childrenLevel + 1;
          data.parentIndex = index;

          commentsArr[index].isReplyLoaded = true;
          commentsArr.splice(index + 1, 0, data);
          newCommentArr = commentsArr;

          setReplying(false);

        } else {
          data.childrenLevel = 0;
          newCommentArr = [data, ...commentsArr];
        }

        let parrentCommentIncrementVal = replyingTo ? 0 : 1;

        setPost({
          ...post, comments: { ...comments, results: newCommentArr },
          activity: { ...activity, total_comments: total_comments + 1, total_parent_comments: total_parent_comments + parrentCommentIncrementVal }
        });

        setTotalParentCommentsLoaded(preVal => preVal + parrentCommentIncrementVal);

      })
      .catch(err => {
        console.log(err);
      })

  }

  return (
    <>
      <Toaster />
      <textarea value={comment} className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto" placeholder="Write a comment here"
        onChange={(e) => setComment(e.target.value)}>
      </textarea>
      <button onClick={handleComment} className="btn-dark mt-5 px-10 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!comment.trim().length}>{action}</button>
    </>
  )
}

export default CommentField;