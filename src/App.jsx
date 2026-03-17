import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import SuperAdminAnalytics from './pages/SuperAdminAnalytics';
import SuperAdminAutomation from './pages/SuperAdminAutomation';
import SuperAdminSupport from './pages/SuperAdminSupport';
import SuperAdminSchoolDetail from './pages/SuperAdminSchoolDetail';
import SuperAdminSettings from './pages/SuperAdminSettings';
import SchoolAdminAcademicSetup from './pages/SchoolAdminAcademicSetup';
import SchoolAdminGradebookGovernance from './pages/SchoolAdminGradebookGovernance';
import SchoolAdminBehavior from './pages/SchoolAdminBehavior';
import SchoolAdminMessagingPolicy from './pages/SchoolAdminMessagingPolicy';
import SchoolAdminGovernance from './pages/SchoolAdminGovernance';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route
        path="/SuperAdminAnalytics"
        element={
          <LayoutWrapper currentPageName="SuperAdminAnalytics">
            <SuperAdminAnalytics />
          </LayoutWrapper>
        }
      />
      <Route
        path="/SuperAdminSettings"
        element={
          <LayoutWrapper currentPageName="SuperAdminSettings">
            <SuperAdminSettings />
          </LayoutWrapper>
        }
      />
      <Route
        path="/SuperAdminAutomation"
        element={
          <LayoutWrapper currentPageName="SuperAdminAutomation">
            <SuperAdminAutomation />
          </LayoutWrapper>
        }
      />
      <Route
        path="/SuperAdminSchoolDetail/:schoolId"
        element={
          <LayoutWrapper currentPageName="SuperAdminSchoolDetail">
            <SuperAdminSchoolDetail />
          </LayoutWrapper>
        }
      />
      <Route
        path="/SuperAdminSupport"
        element={
          <LayoutWrapper currentPageName="SuperAdminSupport">
            <SuperAdminSupport />
          </LayoutWrapper>
        }
      />
      <Route
        path="/SchoolAdminGradebookGovernance"
        element={
          <LayoutWrapper currentPageName="SchoolAdminGradebookGovernance">
            <SchoolAdminGradebookGovernance />
          </LayoutWrapper>
        }
      />
      <Route
        path="/SchoolAdminMessagingPolicy"
        element={
          <LayoutWrapper currentPageName="SchoolAdminMessagingPolicy">
            <SchoolAdminMessagingPolicy />
          </LayoutWrapper>
        }
      />
      <Route
        path="/SchoolAdminBehavior"
        element={
          <LayoutWrapper currentPageName="SchoolAdminBehavior">
            <SchoolAdminBehavior />
          </LayoutWrapper>
        }
      />
      <Route
        path="/SchoolAdminGovernance"
        element={
          <LayoutWrapper currentPageName="SchoolAdminGovernance">
            <SchoolAdminGovernance />
          </LayoutWrapper>
        }
      />
      <Route
        path="/SchoolAdminAcademicSetup"
        element={
          <LayoutWrapper currentPageName="SchoolAdminAcademicSetup">
            <SchoolAdminAcademicSetup />
          </LayoutWrapper>
        }
      />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App