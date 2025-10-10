// Body.js
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Login";
import Browse from "./Browse";
import NotFoundError from "./NotFoundError";
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
import Tests from "./Tests";
import TestView from "./TestView";
import CompanyPage from "../admin/CompanyDetails";
import Company from "./Company";
import CompanyApplications from "../admin/CompanyApplications";
import PlacedStudents from "../admin/PlacedStudents";
import CounsellorApplications from "../counsellor/CounsellorApplications";
import StudentProgress from "../counsellor/StudentProgress";
import PlacementDriveManagement from "../admin/PlacementDriveManagement";
import PlacementDriveDetails from "../admin/PlacementDriveDetails";
import StudentRoundView from "../admin/StudentRoundView";
import ComprehensiveStudentView from "../admin/ComprehensiveStudentView";
import StudentPlacementDrives from "./StudentPlacementDrives";
import Notifications from "./Notifications";


const Body = () => {
  const appRouter = createBrowserRouter([
    { path: "*", element: <NotFoundError /> },
    { path: "/", element: <Login /> },
    { path: "/browse", element: <Layout><Browse /></Layout> },
    { path: "/developer", element: <Layout><Developers /></Layout> },
    { path: "/schedule", element: <Layout><SchedulePage /></Layout> },
    { path: "/notifications", element: <Layout><Notifications /></Layout> },
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
    { path: "/counsellor/student-progress", element: <Layout><StudentProgress /></Layout> },
    { path: "/tests", element: <Layout><Tests /></Layout> },
    { path: "/tests/:testId", element: <Layout><TestView /></Layout> },
    { path: "/companypage", element: <Layout><CompanyPage /></Layout> },
    { path: "/company", element: <Layout><Company /></Layout> },
    { path: "/admin/applications", element: <Layout><CompanyApplications /></Layout> },
    { path: "/admin/applications/:companyId", element: <Layout><CompanyApplications /></Layout> },
    { path: "/placed-students", element: <Layout><PlacedStudents /></Layout> },
    { path: "/counsellor/applications", element: <Layout><CounsellorApplications /></Layout> },
    { path: "/placement-drives", element: <Layout><StudentPlacementDrives /></Layout> },
    { path: "/admin/placement-drives", element: <Layout><PlacementDriveManagement /></Layout> },
    { path: "/admin/placement-drive/:driveId", element: <Layout><PlacementDriveDetails /></Layout> },
    { path: "/admin/placement-drive/:driveId/students", element: <Layout><ComprehensiveStudentView /></Layout> },
    { path: "/admin/placement-drive/:driveId/round/:roundNumber/students", element: <Layout><StudentRoundView /></Layout> },
  ]);

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  );
};

export default Body;
