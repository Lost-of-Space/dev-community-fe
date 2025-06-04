import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import PostInteraction from "../components/post-interaction.component";
import PostCard from "../components/post-card.component";
import PostContent from "../components/post-content.component";
import CommentsContainer from "../components/comments.component";
import { fetchComments } from "../components/comments.component";
import { credentialHeaders } from '~/services/credentials'
import { useTranslation } from "react-i18next";
import { useLocalizedDateUtils } from "../common/date";
import usePostViewTracker from "../common/post-view-tracker";


export const postStructure = {
  title: '',
  des: '',
  content: [],
  author: { personal_info: {} },
  banner: '',
  publishedAt: ''
}

export const PostContext = createContext({})

const PostPage = () => {
  const { getDay, getFullDay } = useLocalizedDateUtils();
  const { t } = useTranslation();

  let { post_id } = useParams()
  const isFirstViewToday = usePostViewTracker(post_id);

  const [post, setPost] = useState(postStructure);
  const [loading, setLoading] = useState(true);
  const [similarPosts, setSimilarPosts] = useState(null);
  const [isLikedByUser, setIsLikedByUser] = useState(false);
  const [commentsWrapper, setCommentsWrapper] = useState(false);
  const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);

  let { title, tags, content, banner, author: { personal_info: { fullname, username: author_username, profile_img } }, publishedAt } = post;

  const fetchPost = () => {
    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-post`, { post_id, count_view: isFirstViewToday }, {
      headers: {
        ...credentialHeaders
      }
    })
      .then(async ({ data: { post } }) => {

        post.comments = await fetchComments({ post_id: post._id, setParentCommentCountFunc: setTotalParentCommentsLoaded })

        setPost(post);

        axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-posts`, { tag: post.tags[0], limit: 3, eliminate_post: post_id }, {
          headers: {
            ...credentialHeaders
          }
        })
          .then(({ data }) => {
            setSimilarPosts(data.posts);
          })

        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      })
  }

  useEffect(() => {
    resetStates();
    fetchPost();

  }, [post_id, isFirstViewToday])

  const resetStates = () => {
    setPost(postStructure);
    setSimilarPosts(null);
    setLoading(true);
    setIsLikedByUser(false);
    setCommentsWrapper(false);
    setTotalParentCommentsLoaded(0);
  }

  return (
    <AnimationWrapper>
      {
        loading ? <Loader />
          :
          <PostContext.Provider value={{ post, setPost, isLikedByUser, setIsLikedByUser, commentsWrapper, setCommentsWrapper, totalParentCommentsLoaded, setTotalParentCommentsLoaded }}>
            <CommentsContainer />

            <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
              <img src={banner} className="aspect-video" alt="post banner" />
              <div className="flex flex-wrap mt-5 -mb-6 gap-3">
                {
                  tags.map((tag, i) => (
                    <NavLink to={`/search/tag=${tag}`} key={i} className="tag text-black py-1 ml-2 px-4 rounded-full text-xs hover:bg-black hover:text-white">{tag}</NavLink>
                  ))
                }
              </div>

              <div className="mt-12">
                <h2>{title}</h2>

                <div className="flex max-sm:flex-col justify-between my-8">
                  <div className="flex gap-5 items-start">
                    <img src={profile_img} className="w-12 h-12 rounded-full" alt="author avatar" />
                    <p className="capitalize text-xl">
                      {fullname}
                      <br />
                      <span className="text-dark-grey">
                        @
                        <Link className="text-base text-dark-grey hover:underline" to={`/user/${author_username}`}>{author_username}</Link>
                      </span>
                    </p>
                  </div>
                  <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">{t("Published on")} {getDay(publishedAt)}</p>
                </div>
              </div>
              <PostInteraction />

              <div className="my-12 ">
                {
                  content[0].blocks.map((block, i) => {
                    return <div>
                      <PostContent block={block} />
                    </div>
                  })
                }
              </div>

              <hr className="text-dark-grey/20" />

              {
                similarPosts != null && similarPosts.length ?
                  <>
                    <h1 className="text-2xl mt-14 mb-10 font-medium">{t("Check similar posts")}:</h1>
                    {
                      similarPosts.map((post, i) => {
                        let { author: { personal_info } } = post;

                        return <AnimationWrapper key={i} transition={{ duration: 1, delay: i * 0.08 }} className="isolate">
                          <PostCard content={post} author={personal_info} />
                        </AnimationWrapper>
                      })
                    }
                  </>
                  :
                  ""
              }
            </div>
          </PostContext.Provider>
      }
    </AnimationWrapper>
  )
}

export default PostPage;