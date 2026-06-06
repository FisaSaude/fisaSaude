import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { ToastProvider } from './components/ToastProvider';

export default function App() {
  return (
    <AccessibilityProvider>
      <ToastProvider />
      <RouterProvider router={router} />
    </AccessibilityProvider>
  );
}
