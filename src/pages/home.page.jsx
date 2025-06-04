import { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component"
import axios from "axios";
import PostCard from "../components/post-card.component";
import MinimalPostCard from "../components/minimal-post-card.component";
import { activeTabRef } from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";
import { useTranslation } from "react-i18next";
import { credentialHeaders } from '~/services/credentials'

const HomePage = () => {
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  let [latestPosts, setLatestPosts] = useState(null);
  let [popularPosts, setPopularPosts] = useState(null);

  const { t, i18n } = useTranslation();

  const [pageState, setPageState] = useState(t("home_home"));
  const [homeLabel, setHomeLabel] = useState(t("home_home"));

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/top-tags`, {
      headers: { ...credentialHeaders }
    })
      .then(({ data }) => setCategories(data.tags))
      .catch(err => console.log(`${t("An error occured")}: `, err));
  }, []);


  let [cardStyle, setCardStyle] = useState(() => {
    return parseInt(localStorage.getItem("cardStyle")) || 1;
  });

  const changeCardStyle = () => {
    let newStyle = cardStyle + 1;
    if (newStyle > 4) {
      newStyle = 1;
    }
    setCardStyle(newStyle);
    //saves to local storage
    localStorage.setItem("cardStyle", newStyle);
  };

  const fetchLatestPosts = ({ page = 1 }) => {
    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/latest-posts`, { page }, {
      headers: { ...credentialHeaders }
    })
      .then(async ({ data }) => {

        let formatedData = await filterPaginationData({
          state: latestPosts,
          data: data.posts,
          page,
          countRoute: "/all-latest-posts-count"
        })

        setLatestPosts(formatedData);
      })
      .catch(err => {
        console.log(err);
      })
  }

  const fetchPopularPosts = () => {
    axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/popular-posts`, {
      headers: { ...credentialHeaders }
    })
      .then(({ data }) => {
        setPopularPosts(data.posts)
      })
      .catch(err => {
        console.log(err);
      })
  }

  const fetchPostsByCategory = ({ page = 1 }) => {
    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-posts`, { tag: pageState, page }, {
      headers: { ...credentialHeaders }
    })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: latestPosts,
          data: data.posts,
          page,
          countRoute: "/search-posts-count",
          data_to_send: { tag: pageState }
        })

        setLatestPosts(formatedData);
      })
      .catch(err => {
        console.log(err);
      })
  }

  const loadPostByCategory = (e) => {

    let category = e.target.innerText.toLowerCase();

    setLatestPosts(null);

    if (pageState == category) {
      setPageState(t("home_home"));
      return;
    }

    setPageState(category);
  }

  useEffect(() => {
    activeTabRef.current.click();

    if (pageState == t("home_home")) {
      fetchLatestPosts({ page: 1 });
    } else {
      fetchPostsByCategory({ page: 1 });
    }

    if (!popularPosts) {
      fetchPopularPosts();
    }

  }, [pageState])

  useEffect(() => {
    const handleLanguageChanged = () => {
      const newHomeLabel = i18n.t("home_home");
      setHomeLabel(newHomeLabel);

      setPageState((prev) => (prev === homeLabel ? newHomeLabel : prev));
    };

    i18n.on("languageChanged", handleLanguageChanged);
    return () => i18n.off("languageChanged", handleLanguageChanged);
  }, [homeLabel, i18n]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <>
      <AnimationWrapper>
        <section className="h-cover flex justify-center gap-10">
          {/* latest posts */}
          <div className="w-full">

            <InPageNavigation routes={[pageState, t("popular posts")]} defaultHidden={[t("popular posts")]}
              panelElements={
                <div className="flex justify-center items-center ml-auto">
                  <button className="btn-mini w-10 h-10" onClick={changeCardStyle}>
                    <span className="fi fi-br-objects-column -mb-[4px]"></span>
                  </button>
                </div>
              }>
              <>

                <div className="mb-8">
                  <h1 className="font-medium max-md:text-xl text-2xl mb-2">{t("Suggested tags")}:</h1>
                  <div className="flex gap-3 flex-wrap">
                    {
                      categories.map((category, i) => {
                        return <button onClick={loadPostByCategory} className={"tag-btn max-md:text-base max-md:py-2 max-md:px-4 " + (pageState == category ? "tag-btn-active" : "")} key={i}>{category}</button>
                      })
                    }
                  </div>
                </div>
                {
                  latestPosts == null ?
                    (
                      <Loader />
                    ) : (
                      latestPosts.results.length ?
                        <div className={cardStyle === 4 ? "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-3" : ""}>
                          {
                            latestPosts.results.map((post, i) => {
                              return (<AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>
                                <PostCard content={post} author={post.author.personal_info} style={cardStyle} />
                              </AnimationWrapper>);
                            })
                          }
                        </div>
                        :
                        <NoDataMessage message={`${t("No such posts found")}!`} />
                    )
                }
                <LoadMoreDataBtn state={latestPosts} fetchDataFunc={(pageState == t("home_home") ? fetchLatestPosts : fetchPostsByCategory)} />
              </>

              {
                popularPosts == null ?
                  (
                    <Loader />
                  ) : (popularPosts.length ?
                    popularPosts.map((post, i) => {
                      return (<AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>
                        <MinimalPostCard post={post} index={i} />
                      </AnimationWrapper>);
                    })
                    :
                    <NoDataMessage message={`${t("home_Oops")}! ${t("home_It seems like there is not even one post in our database")}`} />
                  )
              }
            </InPageNavigation>

          </div>

          {/* filters and trends */}
          <div className="min-w-[30%] lg:min-w-[250px] max-w-min lg:max-w-[30%] border-l border-grey pl-8 pt-3 max-md:hidden">
            <div className="flex flex-col gap-10">
              {/* <div>
              <h1 className="font-medium text-2xl mb-8">Suggested tags</h1>
              <div className="flex gap-3 flex-wrap">
                {
                  categories.map((category, i) => {
                    return <button onClick={loadPostByCategory} className={"tag-btn " + (pageState == category ? "tag-btn-active" : "")} key={i}>{category}</button>
                  })
                }
              </div>
            </div> */}

              <div>
                <h1 className="font-medium text-2xl mb-8">
                  {t("Top 10 Posts")} <span className="fi fi-br-arrow-trend-up"></span>
                </h1>

                {
                  popularPosts == null ?
                    (
                      <Loader />
                    ) : (popularPosts.length ?
                      popularPosts.map((post, i) => {
                        return (<AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>
                          <MinimalPostCard post={post} index={i} />
                        </AnimationWrapper>);
                      })
                      :
                      <NoDataMessage message={`${t("home_Oops")}! ${t("home_It seems like there is not even one post in our database")}`} />
                    )
                }
              </div>
            </div>
          </div>
        </section>
      </AnimationWrapper>

      <button
        className={`select-none fixed w-14 h-14 bottom-6 right-6 z-50 p-3 rounded-full transition-all duration-[250] ${showScrollToTop ? 'opacity-100 scale-100' : 'opacity-0 scale-0'} bg-black text-white shadow-md hover:shadow-lg hover:bg-royalblue hover:text-white-404`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <span className="fi fi-rr-angle-small-up text-3xl block -mt-1 select-none"></span>
      </button>
    </>
  )
}

export default HomePage;