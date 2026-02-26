import React from 'react';
import { UserProvider, useUser } from '@/components/auth/UserContext';
import NotificationBell from '@/components/notifications/NotificationBell';

const publicPages = ['Landing', 'Features', 'Pricing', 'Security', 'Contact', 'Demo'];
const fullScreenPages = ['ClassWorkspace', 'AssignmentDetail', 'SubmissionReview', 'ClassGradebook', 'Messages'];

function NotificationWrapper({ children }) {
  const { user, schoolId } = useUser();
  
  return (
    <>
      {user && schoolId && (
        <div className="fixed top-4 right-4 z-50">
          <NotificationBell userId={user.id} schoolId={schoolId} />
        </div>
      )}
      {children}
    </>
  );
}

export default function Layout({ children, currentPageName }) {
  const isPublic = publicPages.includes(currentPageName);
  const isFullScreen = fullScreenPages.includes(currentPageName);

  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <UserProvider>
      {isFullScreen ? (
        <NotificationWrapper>{children}</NotificationWrapper>
      ) : (
        children
      )}
    </UserProvider>
  );
}