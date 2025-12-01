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
import PublicLayout from "./PublicLayout";  // Import the PublicLayout component
import ProtectedRoute from "./ProtectedRoute";  // Import the ProtectedRoute component
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
import StudentComplaintForm from "./StudentComplaintForm";
import AdminComplaintManagement from "../admin/AdminComplaintManagement";
import CharusatRankPredictor from "./CharusatRankPredictor";
import PlacementDashboard from "./PlacementDashboard";
import ShowcasePage from "../pages/ShowcasePage";
import PlacementJourneyPage from "../pages/PlacementJourneyPage";
import Alumni2022 from "./Alumni2022";

const Body = () => {
  const appRouter = createBrowserRouter([
    { path: "*", element: <NotFoundError /> },
    
    // Public routes (no authentication required)
    { path: "/", element: <PublicLayout><Browse /></PublicLayout> },
    { path: "/showcase", element: <ShowcasePage /> },
    { path: "/placement-journey", element: <PlacementJourneyPage onComplete={() => window.location.href = '/'} /> },
    { path: "/rank-predictor", element: <PublicLayout><CharusatRankPredictor /></PublicLayout> },
    { path: "/placement-dashboard-public", element: <PublicLayout><PlacementDashboard /></PublicLayout> },
    { path: "/developers", element: <PublicLayout><Developers /></PublicLayout> },
    { path: "/public-contact", element: <PublicLayout><Contact /></PublicLayout> },
    { path: "/login", element: <Login /> },
    { path: "/alumni-2022-public", element: <PublicLayout><Alumni2022 /></PublicLayout> },
    
    // Protected routes (authentication required)
    { path: "/browse", element: <ProtectedRoute><Layout><Browse /></Layout></ProtectedRoute> },
    // { path: "/dashboard", element: <ProtectedRoute><Layout><PlacementDashboard /></Layout></ProtectedRoute> },
    { path: "/placement-dashboard", element: <ProtectedRoute><Layout><PlacementDashboard /></Layout></ProtectedRoute> },
    { path: "/alumni-2022", element: <ProtectedRoute><Layout><Alumni2022 /></Layout></ProtectedRoute> },
    { path: "/predictor", element: <ProtectedRoute><Layout><CharusatRankPredictor /></Layout></ProtectedRoute> },
    { path: "/developer", element: <ProtectedRoute><Layout><Developers /></Layout></ProtectedRoute> },
    { path: "/contact", element: <ProtectedRoute><Layout><Contact /></Layout></ProtectedRoute> },
    { path: "/schedule", element: <ProtectedRoute><Layout><SchedulePage /></Layout></ProtectedRoute> },
    { path: "/notifications", element: <ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute> },
    { path: "/profile", element: <ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute> },
    { path: "/admin", element: <ProtectedRoute><Layout><AdminPage /></Layout></ProtectedRoute> },
    { path: "/registation", element: <ProtectedRoute><Layout><StudentRegistation /></Layout></ProtectedRoute> },
    { path: "/StudentSelectionPage", element: <ProtectedRoute><Layout><StudentSelectionPage /></Layout></ProtectedRoute> },
    { path: "/studentsDomain", element: <ProtectedRoute><Layout><AllStudentSelections /></Layout></ProtectedRoute> },
    { path: "/students", element: <ProtectedRoute><Layout><StudentData /></Layout></ProtectedRoute> },
    { path: "/Certificate", element: <ProtectedRoute><Layout><Certificate /></Layout></ProtectedRoute> },
    { path: "/resume", element: <ProtectedRoute><Layout><ResumeViewer /></Layout></ProtectedRoute> },
    { path: "/adminCertificate/:id", element: <ProtectedRoute><Layout><StudentCertificate /></Layout></ProtectedRoute> },
    { path: "/adminResume/:id", element: <ProtectedRoute><Layout><StudentResume/></Layout></ProtectedRoute> },
    { path: "/registationCounsellor", element: <ProtectedRoute><Layout><CounsellorRegistation/></Layout></ProtectedRoute> },
    { path: "/counsellor", element: <ProtectedRoute><Layout><CounsellorPage/></Layout></ProtectedRoute> },
    { path: "/counsellor/student-progress", element: <ProtectedRoute><Layout><StudentProgress /></Layout></ProtectedRoute> },
    { path: "/tests", element: <ProtectedRoute><Layout><Tests /></Layout></ProtectedRoute> },
    { path: "/tests/:testId", element: <ProtectedRoute><Layout><TestView /></Layout></ProtectedRoute> },
    { path: "/companypage", element: <ProtectedRoute><Layout><CompanyPage /></Layout></ProtectedRoute> },
    { path: "/company", element: <ProtectedRoute><Layout><Company /></Layout></ProtectedRoute> },
    { path: "/admin/applications", element: <ProtectedRoute><Layout><CompanyApplications /></Layout></ProtectedRoute> },
    { path: "/admin/applications/:companyId", element: <ProtectedRoute><Layout><CompanyApplications /></Layout></ProtectedRoute> },
    { path: "/placed-students", element: <ProtectedRoute><Layout><PlacedStudents /></Layout></ProtectedRoute> },
    { path: "/counsellor/applications", element: <ProtectedRoute><Layout><CounsellorApplications /></Layout></ProtectedRoute> },
    { path: "/placement-drives", element: <ProtectedRoute><Layout><StudentPlacementDrives /></Layout></ProtectedRoute> },
    { path: "/admin/placement-drives", element: <ProtectedRoute><Layout><PlacementDriveManagement /></Layout></ProtectedRoute> },
    { path: "/admin/placement-drive/:driveId", element: <ProtectedRoute><Layout><PlacementDriveDetails /></Layout></ProtectedRoute> },
    { path: "/admin/placement-drive/:driveId/students", element: <ProtectedRoute><Layout><ComprehensiveStudentView /></Layout></ProtectedRoute> },
    { path: "/admin/placement-drive/:driveId/round/:roundNumber/students", element: <ProtectedRoute><Layout><StudentRoundView /></Layout></ProtectedRoute> },
    { path: "/complaints", element: <ProtectedRoute><Layout><StudentComplaintForm /></Layout></ProtectedRoute> },
    { path: "/admin/complaints", element: <ProtectedRoute><Layout><AdminComplaintManagement /></Layout></ProtectedRoute> },
  ]);

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  );
};

export default Body;
