import React, { useState, useEffect, useContext } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Recycle, Menu, X, ChevronRight, User, LogOut,
  Home, LayoutDashboard, ScanLine, History, ShieldCheck, MapPin,
  Sparkles, Settings, Info, Mail
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

// Smooth scroll helper
const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      if (location.pathname === '/') {
        const sections = ['home', 'about', 'features', 'how-it-works', 'contact'];
        let current = 'home';
        
        if (window.scrollY < 100) {
            current = 'home';
        } else {
            for (const section of sections) {
              if (section === 'home') continue;
              const el = document.getElementById(section);
              if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.top <= 200) {
                  current = section;
                }
              }
            }
        }
        setActiveSection(current);
      } else {
        setActiveSection(location.pathname);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleAnchor = (anchor) => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => scrollTo(anchor), 100);
    } else {
      scrollTo(anchor);
    }
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 bg-slate-200/95 dark:bg-[#030a12]/95 backdrop-blur-md border-b border-gray-300 dark:border-white/10 ${
        scrolled ? 'shadow-lg' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0" onClick={() => window.scrollTo(0,0)}>
            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }} className="text-primary-green">
              <Recycle size={32} />
            </motion.div>
            <span className="text-xl font-bold font-inter text-gray-900 dark:text-white glow-text">Smart Waste AI</span>
          </Link>

          {/* Desktop centre links */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <button
                  onClick={() => handleAnchor('home')}
                  className={`flex items-center gap-1.5 text-base font-medium transition-colors hover:text-primary-green relative ${
                    activeSection === 'home' || activeSection === '/' ? 'text-primary-green' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Home size={16} /> Home
                  {(activeSection === 'home' || activeSection === '/') && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-green glow"
                      initial={false}
                    />
                  )}
                </button>

                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 text-base font-medium transition-colors hover:text-primary-green relative ${
                    activeSection === '/dashboard' ? 'text-primary-green' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <LayoutDashboard size={16} /> Dashboard
                  {activeSection === '/dashboard' && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-green glow"
                      initial={false}
                    />
                  )}
                </Link>

                <Link
                  to="/detect"
                  className={`flex items-center gap-1.5 text-base font-medium transition-colors hover:text-primary-green relative ${
                    activeSection === '/detect' ? 'text-primary-green' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <ScanLine size={16} /> Detect
                  {activeSection === '/detect' && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-green glow"
                      initial={false}
                    />
                  )}
                </Link>

                <Link
                  to="/history"
                  className={`flex items-center gap-1.5 text-base font-medium transition-colors hover:text-primary-green relative ${
                    activeSection === '/history' ? 'text-primary-green' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <History size={16} /> History
                  {activeSection === '/history' && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-green glow"
                      initial={false}
                    />
                  )}
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-1.5 text-base font-medium transition-colors hover:text-primary-green relative ${
                      activeSection === '/admin' ? 'text-primary-green' : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <ShieldCheck size={16} /> Admin
                    {activeSection === '/admin' && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-green glow"
                        initial={false}
                      />
                    )}
                  </Link>
                )}

                <Link
                  to="/locations"
                  className={`flex items-center gap-1.5 text-base font-medium transition-colors hover:text-primary-green relative ${
                    activeSection === '/locations' ? 'text-primary-green' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <MapPin size={16} /> Locations
                  {activeSection === '/locations' && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-green glow"
                      initial={false}
                    />
                  )}
                </Link>

                <button
                  onClick={() => handleAnchor('about')}
                  className={`flex items-center gap-1.5 text-base font-medium transition-colors hover:text-primary-green relative ${
                    activeSection === 'about' || activeSection === '/about' ? 'text-primary-green' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Info size={16} /> About
                  {(activeSection === 'about' || activeSection === '/about') && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-green glow"
                      initial={false}
                    />
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    if(location.pathname !== '/') navigate('/');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`flex items-center gap-1.5 text-base font-medium transition-colors hover:text-primary-green relative ${
                    activeSection === 'home' || activeSection === '/' ? 'text-primary-green' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Home size={16} /> Home
                  {(activeSection === 'home' || activeSection === '/') && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-green glow"
                      initial={false}
                    />
                  )}
                </button>
                
                <button
                  onClick={() => handleAnchor('about')}
                  className={`flex items-center gap-1.5 text-base font-medium transition-colors hover:text-primary-green relative ${
                    activeSection === 'about' || activeSection === '/about' ? 'text-primary-green' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Info size={16} /> About
                  {(activeSection === 'about' || activeSection === '/about') && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-green glow"
                      initial={false}
                    />
                  )}
                </button>

                <button
                  onClick={() => handleAnchor('features')}
                  className={`flex items-center gap-1.5 text-base font-medium transition-colors hover:text-primary-green relative ${
                    activeSection === 'features' ? 'text-primary-green' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Sparkles size={16} /> Features
                  {activeSection === 'features' && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-green glow"
                      initial={false}
                    />
                  )}
                </button>

                <button
                  onClick={() => handleAnchor('how-it-works')}
                  className={`flex items-center gap-1.5 text-base font-medium transition-colors hover:text-primary-green relative ${
                    activeSection === 'how-it-works' ? 'text-primary-green' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Settings size={16} /> How It Works
                  {activeSection === 'how-it-works' && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-green glow"
                      initial={false}
                    />
                  )}
                </button>

                <Link
                  to="/detect"
                  className={`flex items-center gap-1.5 text-base font-medium transition-colors hover:text-primary-green relative ${
                    activeSection === '/detect' ? 'text-primary-green' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <ScanLine size={16} /> Detect
                  {activeSection === '/detect' && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-green glow"
                      initial={false}
                    />
                  )}
                </Link>

                <button
                  onClick={() => handleAnchor('contact')}
                  className={`flex items-center gap-1.5 text-base font-medium transition-colors hover:text-primary-green relative ${
                    activeSection === 'contact' ? 'text-primary-green' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Mail size={16} /> Contact
                  {activeSection === 'contact' && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-green glow"
                      initial={false}
                    />
                  )}
                </button>
              </>
            )}
          </div>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-4 ml-2">
                <span className="text-gray-600 dark:text-gray-300 text-sm flex items-center gap-2">
                  <User size={15} className="text-green-500 dark:text-green-400" />
                  {user.username}{user.role === 'admin' && ' (Admin)'}
                </span>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium transition-colors ml-2">
                Log In
              </Link>
            )}

            <Link
              to="/detect"
              className="bg-green-500 hover:bg-green-400 text-black font-semibold px-5 py-2 rounded-full transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] flex items-center gap-2"
            >
              Start Detection
              <ChevronRight size={18} />
            </Link>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white/95 dark:bg-[#081420]/95 backdrop-blur-xl shadow-xl absolute top-20 left-0 w-full border-t border-gray-200 dark:border-white/10"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      if (location.pathname !== '/') navigate('/');
                      window.scrollTo(0, 0);
                    }}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                      activeSection === 'home' || activeSection === '/' ? 'text-primary-green bg-black/5 dark:bg-white/5' : 'text-gray-600 hover:bg-black/5 hover:text-black dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
                    }`}
                  >
                    <Home size={18} /> Home
                  </button>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                      activeSection === '/dashboard' ? 'text-primary-green bg-black/5 dark:bg-white/5' : 'text-gray-600 hover:bg-black/5 hover:text-black dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
                    }`}
                  >
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                  <Link
                    to="/detect"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                      activeSection === '/detect' ? 'text-primary-green bg-black/5 dark:bg-white/5' : 'text-gray-600 hover:bg-black/5 hover:text-black dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
                    }`}
                  >
                    <ScanLine size={18} /> Detect
                  </Link>
                  <Link
                    to="/history"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                      activeSection === '/history' ? 'text-primary-green bg-black/5 dark:bg-white/5' : 'text-gray-600 hover:bg-black/5 hover:text-black dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
                    }`}
                  >
                    <History size={18} /> History
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                        activeSection === '/admin' ? 'text-primary-green bg-black/5 dark:bg-white/5' : 'text-gray-600 hover:bg-black/5 hover:text-black dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
                      }`}
                    >
                      <ShieldCheck size={18} /> Admin
                    </Link>
                  )}
                  <Link
                    to="/locations"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                      activeSection === '/locations' ? 'text-primary-green bg-black/5 dark:bg-white/5' : 'text-gray-600 hover:bg-black/5 hover:text-black dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
                    }`}
                  >
                    <MapPin size={18} /> Locations
                  </Link>
                  <button
                    onClick={() => handleAnchor('about')}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                      activeSection === 'about' || activeSection === '/about' ? 'text-primary-green bg-black/5 dark:bg-white/5' : 'text-gray-600 hover:bg-black/5 hover:text-black dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
                    }`}
                  >
                    <Info size={18} /> About
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      if (location.pathname !== '/') navigate('/');
                      window.scrollTo(0, 0);
                    }}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                      activeSection === 'home' || activeSection === '/' ? 'text-primary-green bg-black/5 dark:bg-white/5' : 'text-gray-600 hover:bg-black/5 hover:text-black dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
                    }`}
                  >
                    <Home size={18} /> Home
                  </button>

                  <button
                    onClick={() => handleAnchor('about')}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                      activeSection === 'about' || activeSection === '/about' ? 'text-primary-green bg-black/5 dark:bg-white/5' : 'text-gray-600 hover:bg-black/5 hover:text-black dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
                    }`}
                  >
                    <Info size={18} /> About
                  </button>

                  <button
                    onClick={() => handleAnchor('features')}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                      activeSection === 'features' ? 'text-primary-green bg-black/5 dark:bg-white/5' : 'text-gray-600 hover:bg-black/5 hover:text-black dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
                    }`}
                  >
                    <Sparkles size={18} /> Features
                  </button>

                  <button
                    onClick={() => handleAnchor('how-it-works')}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                      activeSection === 'how-it-works' ? 'text-primary-green bg-black/5 dark:bg-white/5' : 'text-gray-600 hover:bg-black/5 hover:text-black dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
                    }`}
                  >
                    <Settings size={18} /> How It Works
                  </button>

                  <Link
                    to="/detect"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                      activeSection === '/detect' ? 'text-primary-green bg-black/5 dark:bg-white/5' : 'text-gray-600 hover:bg-black/5 hover:text-black dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
                    }`}
                  >
                    <ScanLine size={18} /> Detect
                  </Link>

                  <button
                    onClick={() => handleAnchor('contact')}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                      activeSection === 'contact' ? 'text-primary-green bg-black/5 dark:bg-white/5' : 'text-gray-600 hover:bg-black/5 hover:text-black dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
                    }`}
                  >
                    <Mail size={18} /> Contact
                  </button>
                </>
              )}

              {user ? (
                <>
                  <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-white/10 mt-2 pt-3">
                    Signed in as <span className="text-gray-900 dark:text-white font-medium">{user.username}</span>
                  </div>
                  <button
                    onClick={() => { logout(); navigate('/'); setIsOpen(false); }}
                    className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <LogOut size={18} /> Log Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-black/5 hover:text-black dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <User size={18} /> Log In
                </Link>
              )}

              <Link to="/detect" onClick={() => setIsOpen(false)}>
                <button className="w-full mt-3 bg-green-500 hover:bg-green-400 text-black font-semibold py-2.5 rounded-full transition-all flex items-center justify-center gap-2">
                  <ScanLine size={18} /> Start Detection
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
