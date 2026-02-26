import React from 'react';
import { UserProvider } from '@/components/auth/UserContext';

const publicPages = ['Landing', 'Features', 'Pricing', 'Security', 'Contact', 'Demo'];

export default function Layout({ children, currentPageName }) {
  const isPublic = publicPages.includes(currentPageName);

  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
}