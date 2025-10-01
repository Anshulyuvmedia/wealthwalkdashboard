
// Authentication related pages
import Login from "../app/auth/login-page";
import Register from "../app/auth/register-page";
import Users from "@/app/Pages/users/userpage";
import Dashboard from "../app/Pages/dashboard/dashboardpage";
import Courses from "@/app/Pages/courses/page";
import AddCourse from "@/app/Pages/courses/AddCourse";
import CourseDetail from "@/app/Pages/courses/[id]";
import Plans from "@/app/Pages/plans/page";
import Signals from "@/app/Pages/signals/signalpage";


const authProtectedRoutes = [
    { path: "/", component: <Dashboard /> },
    { path: "/users", component: <Users /> },

    { path: "/courses", component: <Courses /> },
    { path: "/courses/add", component: <AddCourse /> },
    { path: "/courses/:id", component: <CourseDetail /> },

    { path: "/plans", component: <Plans /> },
    { path: "/signals", component: <Signals /> },
]


const publicRoutes = [
  { path: "/login", component: <Login /> },
  { path: "/register", component: <Register /> },
];
export { publicRoutes ,authProtectedRoutes };
