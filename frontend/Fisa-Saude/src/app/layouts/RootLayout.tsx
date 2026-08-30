import { Outlet, useLocation } from 'react-router';
import { AccessibilityButton } from '../components/AccessibilityButton';
import { LibrasIndicator } from '../components/LibrasIndicator';
import { WhatsApp } from '../components/WhatsAppButton';

export default function RootLayout() {
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminArea && (
        <>
          <AccessibilityButton />
          <LibrasIndicator />
          <WhatsApp />
        </>
      )}
      <Outlet />
    </>
  );
}
