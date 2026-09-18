import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from './lib/store';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Toasts } from './components/ui';
import Home from './pages/Home';
import Queue from './pages/Queue';
import Verify from './pages/Verify';
import Branches from './pages/Branches';
import Social from './pages/Social';
import Ops from './pages/Ops';
import Review from './pages/Review';

function Shell() {
  const { view } = useApp();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [view]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={view}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {view === 'home' && <Home />}
          {view === 'queue' && <Queue />}
          {view === 'verify' && <Verify />}
          {view === 'branches' && <Branches />}
          {view === 'social' && <Social />}
          {view === 'ops' && <Ops />}
          {view === 'review' && <Review />}
        </motion.main>
      </AnimatePresence>
      <Footer />
      <Toasts />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
