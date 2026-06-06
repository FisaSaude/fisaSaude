import { Outlet, useLocation } from 'react-router';
import { AccessibilityButton } from '../components/AccessibilityButton';
import { LibrasIndicator } from '../components/LibrasIndicator';
import { Chatbot } from '../components/Chatbot';

export default function RootLayout() {
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminArea && (
        <>
          <AccessibilityButton />
          <LibrasIndicator />
          <Chatbot />
        </>
      )}
      <Outlet />
    </>
  );
}
