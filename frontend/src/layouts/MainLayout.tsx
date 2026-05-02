import { useState, ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Chatbot } from '../components/Chatbot';
import { AccessibilityPanel } from '../components/AccessibilityPanel';
import { BackgroundOrbs } from '../components/BackgroundOrbs';
import { useAccessibilityEffects } from '../hooks/useAccessibility';
import { trackPage } from '../services/analytics';

export const MainLayout = ({ children }: { children: ReactNode }) => {
  const [a11yOpen, setA11yOpen] = useState(false);
  const loc = useLocation();
  useAccessibilityEffects();

  useEffect(() => {
    trackPage(loc.pathname);
  }, [loc.pathname]);

  return (
    <div className="relative min-h-screen flex flex-col">
      <a className="skip-link" href="#main">Skip to content</a>
      <BackgroundOrbs />
      <Navbar onOpenA11y={() => setA11yOpen(true)} />
      <main id="main" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        {children}
      </main>
      <Footer />
      <Chatbot />
      <AccessibilityPanel open={a11yOpen} onClose={() => setA11yOpen(false)} />
    </div>
  );
};
