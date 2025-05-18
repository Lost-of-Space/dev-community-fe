import { useContext } from "react";
import { UserContext } from "../../App";
import toast from "react-hot-toast";
import axios from "axios";
import { NavLink } from "react-router-dom";
import DialogWrapper from "../../components/dialog-window.component";
import { credentialHeaders } from '~/services/credentials'

const ManagePostCard = ({ post, setPosts }) => {
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

      toast.success("Post deleted successfully");

    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error(error.response?.data?.error || "Failed to delete post");
    }
  };

  return (
    <tr className="border-b border-grey hover:bg-grey/20 max-sm:flex flex-col max-sm:mb-4">
      <td className="p-4 max-sm:py-2 max-sm:pt-3 max-w-[15rem]">
        <NavLink to={`/post/${post_id}`} className="line-clamp-1 text-dark-grey max-sm:text-xl max-sm:text-black hover:underline active:underline">
          {title}
        </NavLink>
      </td>
      <hr className="hidden max-sm:block text-grey my-1" />

      <td className="p-4 max-sm:py-1">
        <NavLink to={`/user/${username}`} className="text-dark-grey hover:underline active:underline">
          <span className="hidden max-sm:inline-block text-black">By</span> @{username}
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
        <hr className="hidden max-sm:block text-grey pb-3" />
        <DialogWrapper
          onConfirm={() => deletePost(post_id)}
          message={<p>Are you sure you want to delete post <span className="text-royalblue">"{title}"</span>?</p>}
          confirmText={"Delete"}
        >
          <button className="hover:bg-red/30 hover:text-red px-2 py-1 rounded">
            Delete
          </button>
        </DialogWrapper>
      </td>
    </tr>
  );
};

export default ManagePostCard;
