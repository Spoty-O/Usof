import CategoryPage from "./pages/CategoryPage";
import CreatePost from "./pages/CreatePost";
import MainPage from "./pages/MainPage";
import PostPage from "./pages/PostPage";
import UserPage from "./pages/UserPage";
import { CATEGORY_PAGE, CREATE_PAGE, MAIN_PAGE, POST_PAGE, USER_PAGE } from "./utils/consts";

export const allRoutes = [
    {
        path: MAIN_PAGE,
        Component: <MainPage />
    },
    {
        path: CATEGORY_PAGE,
        Component: <CategoryPage />
    },
    {
        path: POST_PAGE + '/:id',
        Component: <PostPage />
    },
    {
        path: USER_PAGE + '/:id',
        Component: <UserPage />
    },
    {
        path: CREATE_PAGE,
        Component: <CreatePost />
    }
]