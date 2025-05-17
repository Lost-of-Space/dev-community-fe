import { lookInSession } from "./common/session";
import { createContext, useEffect, useState } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import Editor from "./pages/editor.pages";
import HomePage from "./pages/home.page";
import SearchPage from "./pages/search.page";
import PageNotFound from "./pages/404.page";
import ProfilePage from "./pages/profile.page";
import PostPage from "./pages/post.page";
import SideNavbar from "./components/sidenavbar.component";
import ChangePasswordPage from "./pages/change-password.page";
import EditProfilePage from "./pages/edit-profile.page";
import NotificationsPage from "./pages/notifications.page";
import ManagePostsPage from "./pages/manage-posts.page";
import AdmNavbar from "./control-panel/components/sidenav.adm.component";
import ManageUsersPage from "./control-panel/pages/manage-users.adm.page";
import AppRouter from "./common/AppRouter";
import BlockedPage from "./pages/blocked.page";
import UserStatisticsPage from "./control-panel/pages/user-statistics.page";
import PostStatisticsPage from "./control-panel/pages/post-statistics.page";
import PostsManagementPage from "./control-panel/pages/manage-posts.adm.page";
import DashboardPage from "./pages/dashboard.page";

export const UserContext = createContext({});

export const ThemeContext = createContext({});

const App = () => {

    const [userAuth, setUserAuth] = useState({});

    const [theme, setTheme] = useState("light");

    useEffect(() => {

        let userInSession = lookInSession("user");
        let themeInSession = lookInSession("theme");

        userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({ access_token: null });

        if (themeInSession) {
            setTheme(() => {
                document.body.setAttribute('data-theme', themeInSession);

                return themeInSession;
            })
        } else {
            document.body.setAttribute('data-theme', theme);
        }

    }, [])


    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <UserContext.Provider value={{ userAuth, setUserAuth }}>
                <Routes>
                    <Route element={<AppRouter><Outlet /></AppRouter>}>
                        <Route path="/editor" element={<Editor />} />
                        <Route path="/editor/:post_id" element={<Editor />} />
                    </Route>
                    <Route path="/" element={<Navbar />}>
                        <Route path="blocked" element={<BlockedPage />} />
                        <Route element={<AppRouter> <Outlet /> </AppRouter>}>
                            <Route index element={<HomePage />} />
                            <Route path="dashboard" element={<SideNavbar />}>
                                <Route path="posts" element={<ManagePostsPage />} />
                                <Route path="notifications" element={<NotificationsPage />} />
                                <Route path="charts" element={<DashboardPage />} />
                            </Route>
                            <Route path="settings" element={<SideNavbar />}>
                                <Route path="edit-profile" element={<EditProfilePage />} />
                                <Route path="change-password" element={<ChangePasswordPage />} />
                            </Route>
                            <Route path="search/:query" element={<SearchPage />} />
                            <Route path="user/:id" element={<ProfilePage />} />
                            <Route path="post/:post_id" element={<PostPage />} />
                            <Route path="admin" element={<AdmNavbar />}>
                                <Route path="users" element={<ManageUsersPage />} />
                                <Route path="posts" element={<PostsManagementPage />} />
                                <Route path="user-statistics" element={<UserStatisticsPage />} />
                                <Route path="post-statistics" element={<PostStatisticsPage />} />
                            </Route>
                        </Route>

                        <Route path="signin" element={<UserAuthForm type="sign-in" />} />
                        <Route path="signup" element={<UserAuthForm type="sign-up" />} />
                        <Route path="*" element={<PageNotFound />} />
                    </Route>

                </Routes>
            </UserContext.Provider>
        </ThemeContext.Provider>
    )
}

export default App;