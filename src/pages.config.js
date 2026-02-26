/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Landing from './pages/Landing';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Security from './pages/Security';
import Contact from './pages/Contact';
import Demo from './pages/Demo';
import AppHome from './pages/AppHome';
import NoSchool from './pages/NoSchool';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminSchools from './pages/SuperAdminSchools';
import SchoolAdminDashboard from './pages/SchoolAdminDashboard';
import SchoolAdminUsers from './pages/SchoolAdminUsers';
import SchoolAdminClasses from './pages/SchoolAdminClasses';
import SchoolAdminSubjects from './pages/SchoolAdminSubjects';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherClasses from './pages/TeacherClasses';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import ClassWorkspace from './pages/ClassWorkspace';
import AssignmentDetail from './pages/AssignmentDetail';
import SubmissionReview from './pages/SubmissionReview';
import ClassGradebook from './pages/ClassGradebook';
import Messages from './pages/Messages';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Landing": Landing,
    "Features": Features,
    "Pricing": Pricing,
    "Security": Security,
    "Contact": Contact,
    "Demo": Demo,
    "AppHome": AppHome,
    "NoSchool": NoSchool,
    "SuperAdminDashboard": SuperAdminDashboard,
    "SuperAdminSchools": SuperAdminSchools,
    "SchoolAdminDashboard": SchoolAdminDashboard,
    "SchoolAdminUsers": SchoolAdminUsers,
    "SchoolAdminClasses": SchoolAdminClasses,
    "SchoolAdminSubjects": SchoolAdminSubjects,
    "TeacherDashboard": TeacherDashboard,
    "TeacherClasses": TeacherClasses,
    "StudentDashboard": StudentDashboard,
    "ParentDashboard": ParentDashboard,
    "CoordinatorDashboard": CoordinatorDashboard,
    "ClassWorkspace": ClassWorkspace,
    "AssignmentDetail": AssignmentDetail,
    "SubmissionReview": SubmissionReview,
    "ClassGradebook": ClassGradebook,
    "Messages": Messages,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};