import { useContext } from "react";
import { UserContext } from "../../App";
import toast from "react-hot-toast";
import axios from "axios";
import { NavLink } from "react-router-dom";
import DialogWrapper from "../../components/dialog-window.component";
import { credentialHeaders } from '~/services/credentials'
import { useTranslation } from "react-i18next";

const ManagePostCard = ({ post, setPosts }) => {
  const { t } = useTranslation();

  const { userAuth: { access_token, isAdmin } } = useContext(UserContext);

  const {
    post_id,
    title,
    author: { username },
    publishedAt,
    activity: { total_likes = 0 },
    draft
  } = post;

  const deletePost = async (postId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/delete-post`,
        { post_id: postId, isAdmin },
        {
          headers: {
            'X-Authorization': `Bearer ${access_token}`,
            ...credentialHeaders
          }
        }
      );

      setPosts(prevPosts => ({
        ...prevPosts,
        results: prevPosts.results.filter(post => post.post_id !== postId),
        deletedDocCount: prevPosts.deletedDocCount + 1
      }));

      toast.success(t("Deleted"));

    } catch (error) {
      toast.error(error.response?.data?.error || `${t("An error occured")}: ${error}`);
    }
  };

  return (
    <tr className="border-b border-grey hover:bg-grey/20 max-sm:flex flex-col max-sm:mb-4">
      <td className="p-4 max-sm:py-2 max-sm:pt-3 sm:max-w-[15rem]">
        <NavLink to={`/post/${post_id}`} className="line-clamp-1 text-dark-grey max-sm:text-xl max-sm:text-black hover:underline active:underline">
          {title}
        </NavLink>
      </td>
      <div className="hidden max-sm:block h-px bg-grey my-1"></div>

      <td className="p-4 max-sm:py-1 md:max-w-[240px]">
        <NavLink to={`/user/${username}`} className="block text-dark-grey hover:underline active:underline truncate overflow-hidden whitespace-nowrap">
          <span className="hidden max-sm:inline-block text-black">{t("By")}</span> @{username}
        </NavLink>
      </td>

      <td className="p-4 max-sm:py-1">
        <p>{publishedAt ? new Date(publishedAt).toLocaleDateString() : "Not published"}</p>
      </td>

      <td className="p-4 max-sm:hidden">
        <p>{total_likes}</p>
      </td>

      <td className="p-4 max-sm:py-1 max-sm:flex gap-2">
        {
          draft ?
            <span className="bg-yellow/30 text-yellow py-1 px-3 rounded text-xs">Draft</span>
            :
            <span className="bg-green/30 text-green py-1 px-2 rounded text-xs">Published</span>
        }
      </td>

      <td className="p-4">
        <div className="hidden max-sm:block h-px bg-grey mb-3"></div>
        <DialogWrapper
          onConfirm={() => deletePost(post_id)}
          message={<p>{t("Are you sure you want to delete post")} <span className="text-royalblue">"{title}"</span>?</p>}
          confirmText={t("Delete")}
        >
          <button className="hover:bg-red/30 hover:text-red px-2 py-1 rounded">
            {t("Delete")}
          </button>
        </DialogWrapper>
      </td>
    </tr>
  );
};

export default ManagePostCard;
