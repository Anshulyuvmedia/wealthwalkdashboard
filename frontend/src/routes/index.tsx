
// Authentication related pages
import Login from "../app/auth/login-page";
import Register from "../app/auth/register-page";
import Dashboard from "../app/dashboard/page";


const authProtectedRoutes = [
    { path: "/", component: <Dashboard /> },
]


const publicRoutes = [
  { path: "/login", component: <Login /> },
  { path: "/register", component: <Register /> },
];
export { publicRoutes ,authProtectedRoutes };
