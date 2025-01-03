import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Login";
import Browse from "./Browse";
import NotFoundError from "./NotFoundError";
import Students from "./Students";
import Alumni from "./Alumni";
import Contact from "./Contact";
import Profile from "./Profile";
import AdminPage from "../admin/adminPage";
import StudentRegistation from "../admin/studentRegistation";
import SchedulePage from "./SchedulePage";
import Developers from "./Developers";

const Body = () => {
  const appRouter = createBrowserRouter([
    { path: "*", element: <NotFoundError /> },
    { path: "/", element: <Login /> },
    { path: "/browse", element: <Browse /> },
    { path: "/students", element: <Students /> },
    { path: "/alumni", element: <Alumni /> },
    { path: "/schedule", element: <SchedulePage /> },
    { path: "/contact", element: <Contact /> },
    { path: "/profile", element: <Profile /> },
    { path: "/admin", element: <AdminPage /> },
    { path: "/registation", element: <StudentRegistation /> },
    { path: "/developers", element: <Developers /> },
  ]);

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  );
};

export default Body;
