// Body.js
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
import StudentRegistation from "../admin/StudentRegistation";
import SchedulePage from "./SchedulePage";
import Developers from "./Developers";
import StudentSelectionPage from "./StudentSelectionPage";
import AllStudentSelections from "../admin/AllStudentSelections";
import StudentData from "../admin/StudentData";
import Layout from "./Layout";  // Import the Layout component
import Certificate from "./Certificate";
import StudentCertificate from "../admin/StudentCertificate";
import ResumeViewer from "./ResumeViewer";
import StudentResume from "../admin/StudentResume";
import CounsellorRegistation from "../admin/CounsellorRegistation";
import CounsellorPage from "../counsellor/CounsellorPage";


const Body = () => {
  const appRouter = createBrowserRouter([
    { path: "*", element: <NotFoundError /> },
    { path: "/", element: <Login /> },
    { path: "/browse", element: <Layout><Browse /></Layout> },
    { path: "/developer", element: <Layout><Developers /></Layout> },
    { path: "/alumni", element: <Layout><Alumni /></Layout> },
    { path: "/schedule", element: <Layout><SchedulePage /></Layout> },
    { path: "/contact", element: <Layout><Contact /></Layout> },
    { path: "/profile", element: <Layout><Profile /></Layout> },
    { path: "/admin", element: <Layout><AdminPage /></Layout> },
    { path: "/registation", element: <Layout><StudentRegistation /></Layout> },
    { path: "/developers", element: <Layout><Developers /></Layout> },
    { path: "/StudentSelectionPage", element: <Layout><StudentSelectionPage /></Layout> },
    { path: "/studentsDomain", element: <Layout><AllStudentSelections /></Layout> },
    { path: "/students", element: <Layout><StudentData /></Layout> },
    { path: "/Certificate", element: <Layout><Certificate /></Layout> },
    { path: "/resume", element: <Layout><ResumeViewer /></Layout> },
    { path: "/adminCertificate/:id", element: <Layout><StudentCertificate /></Layout> },
    { path: "/adminResume/:id", element: <Layout><StudentResume/></Layout> },
    { path: "/registationCounsellor", element: <Layout><CounsellorRegistation/></Layout> },
    { path: "/counsellor", element: <Layout><CounsellorPage/></Layout> },
  
  ]);

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  );
};

export default Body;
