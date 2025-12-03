// src/app/routes.tsx
import Login from "../app/auth/login-page";
import Register from "../app/auth/register-page";
import Users from "@/app/Pages/users/userpage";
import AddUser from "@/app/Pages/users/AddUser";
import EditUser from "@/app/Pages/users/EditUser";
import Dashboard from "../app/Pages/dashboard/dashboardpage";
import Courses from "@/app/Pages/courses/page";
import AddCourse from "@/app/Pages/courses/AddCourse";
import CourseDetail from "@/app/Pages/courses/[id]";
import Plans from "@/app/Pages/plans/page";
import AddPlan from "@/app/Pages/plans/AddPlan";
import EditPlan from "@/app/Pages/plans/EditPlan";
import Signals from "@/app/Pages/signals/signalpage";
import AddSignal from "@/app/Pages/signals/addSignal";
import EditSignal from "@/app/Pages/signals/[id]";
import Strategy from "@/app/Pages/strategy/strategypage";
import AddStrategy from "@/app/Pages/strategy/addStrategy";
import EditStrategy from "@/app/Pages/strategy/EditStrategy";
import BackTesting from "@/app/Pages/strategy/backtest/[id]";

const authProtectedRoutes = [
  { path: "/", component: <Dashboard /> },
  { path: "/users", component: <Users /> },
  { path: "/users/add", component: <AddUser /> },
  { path: "/users/edit/:id", component: <EditUser /> },

  { path: "/courses", component: <Courses /> },
  { path: "/courses/add", component: <AddCourse /> },
  { path: "/courses/:id", component: <CourseDetail /> },

  { path: "/plans", component: <Plans /> },
  { path: "/plans/add", component: <AddPlan /> }, // New route for adding a plan
  { path: "/plans/edit/:id", component: <EditPlan /> }, // New route for editing a plan

  { path: "/strategy", component: <Strategy /> },
  { path: "/strategy/add", component: <AddStrategy /> },
  { path: "/strategy/edit/:id", component: <EditStrategy /> },

  { path: "/paidsignals", component: <Signals signalType={"Paid"} /> },
  { path: "/freesignals", component: <Signals signalType={"Free"} /> },
  { path: "/paidsignals/add", component: <AddSignal /> },
  { path: "/freesignals/add", component: <AddSignal /> },
  { path: "/paidsignals/edit/:id", component: <EditSignal /> },
  { path: "/freesignals/edit/:id", component: <EditSignal /> },

  { path: "/backTesting/:id", component: <BackTesting /> },
];

const publicRoutes = [
  { path: "/login", component: <Login /> },
  { path: "/register", component: <Register /> },
];

export { publicRoutes, authProtectedRoutes };