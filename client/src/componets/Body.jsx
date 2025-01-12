import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Login";
import Browse from "./Browse";
import NotFoundError from "./NotFoundError";
import Students from "./Students";
import Alumni from "./Alumni";
import Contact from "./Contact";
import Profile from "./Profile";
import AdminPage from "../admin/AdminPage";
import StudentRegistation from "../admin/studentRegistation";
import SchedulePage from "./SchedulePage";
import Developers from "./Developers";
import StudentSelectionPage from "./StudentSelectionPage"
import AllStudentSelections from "../admin/AllStudentSelections";
import StudentData from "../admin/StudentData";

const Body = () => {
  const appRouter = createBrowserRouter([
    { path: "*", element: <NotFoundError /> },
    { path: "/", element: <Login /> },
    { path: "/browse", element: <Browse /> },
    { path: "/developer", element: <Developers /> },
    { path: "/alumni", element: <Alumni /> },
    { path: "/schedule", element: <SchedulePage /> },
    { path: "/contact", element: <Contact /> },
    { path: "/profile", element: <Profile /> },
    { path: "/admin", element: <AdminPage /> },
    { path: "/registation", element: <StudentRegistation /> },
    { path: "/developers", element: <Developers /> },
    { path: "/StudentSelectionPage", element: <StudentSelectionPage /> },
    { path: "/studentsDomain", element: <AllStudentSelections /> },
    { path: "/students", element: <StudentData /> },
  ]);

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  );
};

export default Body;
