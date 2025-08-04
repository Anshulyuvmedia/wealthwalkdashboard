
// Authentication related pages
import Login from "../app/auth/login-page";
import Register from "../app/auth/register-page";
import Users from "@/app/Pages/users/userpage";
import Dashboard from "../app/Pages/dashboard/dashboardpage";
import Courses from "@/app/Pages/courses/coursepage";


const authProtectedRoutes = [
    { path: "/", component: <Dashboard /> },
    { path: "/users", component: <Users /> },
    { path: "/course", component: <Courses /> },
]


const publicRoutes = [
  { path: "/login", component: <Login /> },
  { path: "/register", component: <Register /> },
];
export { publicRoutes ,authProtectedRoutes };
