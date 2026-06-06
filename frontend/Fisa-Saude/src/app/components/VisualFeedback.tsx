import { useAccessibility } from '../contexts/AccessibilityContext';
import { useEffect, useState } from 'react';
import { Bell, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

type FeedbackType = 'notification' | 'success' | 'error' | 'warning' | 'info';

interface VisualFeedbackProps {
  show?: boolean;
  type?: FeedbackType;
  message?: string;
}

export function VisualFeedback({ show = false, type = 'notification', message }: VisualFeedbackProps) {
  const { settings } = useAccessibility();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show && settings.visualIndicators) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [show, settings.visualIndicators]);

  if (!settings.visualIndicators || !isVisible) {
    return null;
  }

  const icons = {
    notification: Bell,
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    notification: 'bg-info text-info-foreground',
    success: 'bg-success text-success-foreground',
    error: 'bg-destructive text-destructive-foreground',
    warning: 'bg-warning text-warning-foreground',
    info: 'bg-info text-info-foreground',
  };

  const Icon = icons[type];

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 ${colors[type]} px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300`}
      role="alert"
      aria-live="polite"
    >
      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
        <Icon size={20} aria-hidden="true" />
      </div>
      {message && <span className="font-medium">{message}</span>}
    </div>
  );
}

// Hook para usar feedback visual programaticamente
export function useVisualFeedback() {
  const { settings } = useAccessibility();
  const [feedback, setFeedback] = useState<{ type: FeedbackType; message?: string } | null>(null);

  const showFeedback = (type: FeedbackType, message?: string) => {
    if (settings.visualIndicators) {
      setFeedback({ type, message });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return { feedback, showFeedback };
}
