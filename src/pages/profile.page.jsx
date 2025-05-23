import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { UserContext } from "../App";
import AboutUser from "../components/about.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import InPageNavigation from "../components/inpage-navigation.component";
import PostCard from "../components/post-card.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import PageNotFound from "./404.page";
import { useTranslation } from "react-i18next";
import { credentialHeaders } from '~/services/credentials'
import FollowButton from "../components/follow-button.component";
import FollowedUserCard from "../components/followed-user-card.component";

export const profileDataStructure = {
  personal_info: {
    fullname: "",
    username: "",
    profile_img: "",
    bio: ""
  },
  account_info: {
    total_posts: 0,
    total_reads: 0
  },
  social_links: {

  },
  joinedAt: ""
}

const ProfilePage = () => {
  const { t } = useTranslation();

  let { id: profileId } = useParams();

  let [profile, setProfile] = useState(profileDataStructure);

  let [loading, setLoading] = useState(true);

  let [posts, setPosts] = useState(null);

  let [profileLoaded, setProfileLoaded] = useState("");

  const [following, setFollowing] = useState([]);
  const [followingUsers, setFollowingUsers] = useState(null);

  let {
    personal_info: { bio },
    account_info: { total_posts, total_reads },
    social_links,
    joinedAt,
    blocked
  } = profile;

  let { userAuth: { username } } = useContext(UserContext)

  const fetchUserProfile = async () => {
    try {
      const { data: user } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/get-profile`,
        { username: profileId },
        { headers: { ...credentialHeaders } }
      );

      if (user) {
        setProfile(user);
        setFollowing(user.following || []);
        setProfileLoaded(profileId);
        getPosts({ user_id: user._id });
      }
    } catch (err) {
      toast.error(`${t("An error occured")}: ` + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPosts = ({ page = 1, user_id }) => {

    user_id = user_id == undefined ? posts.user_id : user_id;

    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-posts`, { author: user_id, page }, {
      headers: { ...credentialHeaders }
    })
      .then(async ({ data }) => {

        let formatedData = await filterPaginationData({
          state: posts,
          data: data.posts,
          page,
          countRoute: "/search-posts-count",
          data_to_send: { author: user_id }
        })

        formatedData.user_id = user_id;
        setPosts(formatedData);
      })

  }

  useEffect(() => {

    if (profileId != profileLoaded) {
      setPosts(null);
    }
    if (posts == null) {
      resetStates();
      fetchUserProfile();
    }

  }, [profileId, posts])

  useEffect(() => {
    if (following.length > 0) {
      axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-users-by-id`, { user_ids: following }, {
        headers: { ...credentialHeaders }
      })
        .then(({ data }) => {
          setFollowingUsers(data.users);
        })
        .catch(err => console.log(err));
    } else {
      setFollowingUsers([]);
    }
  }, [following]);


  const resetStates = () => {
    setProfile(profileDataStructure);
    setLoading(true);
    setProfileLoaded("");
  }

  return (
    <AnimationWrapper>
      <Toaster />
      {
        loading ? <Loader />
          : profile && profile.personal_info && profile.personal_info.username ?
            <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
              <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[30%] md:pl-8 md:border-l border-grey md:sticky md:top-[100px] md:py-10">
                <img src={profile.personal_info.profile_img} className="w-24 h-24 bg-grey rounded-full md:w-32 md:h-32" alt="user profile image" />
                <div className="max-sm:text-center">
                  <h1 className="text-2xl font-medium">{profile.personal_info.fullname}</h1>
                  <p className="text-xl h-6 text-dark-grey">@{profile.personal_info.username}</p>
                </div>
                {
                  blocked ?
                    <p className="bg-red/30 text-red font-bold rounded-sm px-2 py-1">{t("This user is currently blocked")}.</p>
                    : ""
                }
                <p>{t("Posts")}: {total_posts.toLocaleString()} {t("Reads")}: {total_reads.toLocaleString()}</p>

                <div className="flex gap-4 mt-2">
                  {
                    profileId == username ?
                      <Link to="/settings/edit-profile" className="bg-grey text-xl py-3 px-7 hover:bg-black active:bg-black hover:text-white active:text-white selector-white">{t("Edit")}</Link>
                      :
                      <FollowButton username={profileId} />
                  }
                </div>

                <AboutUser className="max-md:hidden" bio={bio} social_links={social_links} joinedAt={joinedAt} />
              </div>
              <div className="max-md:mt-12 w-full">
                <InPageNavigation routes={[t("Posts Published"), t("Following"), t("About")]} defaultHidden={[t("About")]}>
                  <>
                    {
                      posts == null ? (
                        <Loader />
                      ) : (
                        posts.results.length ?
                          <div>
                            {posts.results.map((post, i) => {
                              return (
                                <AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>
                                  <PostCard content={post} author={post.author.personal_info} />
                                </AnimationWrapper>
                              );
                            })}
                          </div>
                          : <NoDataMessage message={`${t("No such posts found")}!`} />
                      )
                    }
                    <LoadMoreDataBtn state={posts} fetchDataFunc={getPosts} />
                  </>

                  <div>
                    {
                      followingUsers === null
                        ? <Loader />
                        : followingUsers.length
                          ? followingUsers.map((user, i) => (
                            <AnimationWrapper key={i} transition={{ duration: 1, delay: i * 0.08 }}>
                              <FollowedUserCard user={user} targetUsername={user.personal_info.username} />
                            </AnimationWrapper>
                          ))
                          : <NoDataMessage message={`${t("Not following anyone yet")}.`} />
                    }
                  </div>


                  <AboutUser bio={bio} social_links={social_links} joinedAt={joinedAt} />
                </InPageNavigation>
              </div>
            </section>
            : <PageNotFound />
      }
    </AnimationWrapper>
  )
}

export default ProfilePage;