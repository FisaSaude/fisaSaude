import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { ToastProvider } from './components/ToastProvider';
import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <ToastProvider />
        <RouterProvider router={router} />
      </AccessibilityProvider>
    </ThemeProvider>
  );
}
