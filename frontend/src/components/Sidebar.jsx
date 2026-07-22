import React, { useState, useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Recycle, LayoutDashboard, History, MapPin, Info,
  LogOut, User, Camera, Shield, ChevronLeft, ChevronRight, Menu
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Detect', path: '/detect', icon: <Camera size={20} /> },
    { name: 'History', path: '/history', icon: <History size={20} /> },
    { name: 'Locations', path: '/locations', icon: <MapPin size={20} /> },
    { name: 'About', path: '/about', icon: <Info size={20} /> },
    ...(user?.role === 'admin' ? [{ name: 'Admin', path: '/admin', icon: <Shield size={20} /> }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo + collapse button */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-white/10">
        <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
          <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }} className="text-primary-green flex-shrink-0">
            <Recycle size={28} />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-base font-bold font-inter text-gray-900 dark:text-white glow-text whitespace-nowrap overflow-hidden"
              >
                Smart Waste AI
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all group relative ${
                isActive
                  ? 'bg-primary-green/20 text-primary-green shadow-[0_0_12px_rgba(34,197,94,0.15)]'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
              }`
            }
            title={collapsed ? item.name : ''}
          >
            {({ isActive }) => (
              <>
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-green rounded-r-full"
                  />
                )}
                <span className="flex-shrink-0">{item.icon}</span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.18 }}
                      className="whitespace-nowrap overflow-hidden text-sm"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Theme Toggle + User + logout footer */}
      <div className="px-2 py-4 border-t border-gray-200 dark:border-white/10 space-y-2">
        <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
           <ThemeToggle className={collapsed ? '' : 'w-full'} />
        </div>

        <div className={`flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-green-500 dark:text-green-400" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden min-w-0"
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.username}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 dark:hover:text-red-400 transition-all text-sm font-medium ${collapsed ? 'justify-center' : ''}`}
          title="Logout"
        >
          <LogOut size={18} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Log Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 224 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col fixed top-0 left-0 h-screen z-40
          bg-white/95 dark:bg-[#081420]/95 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 overflow-hidden flex-shrink-0"
      >
        {sidebarContent}
      </motion.aside>

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-white/95 dark:bg-[#081420]/95 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 flex items-center px-4 gap-4">
        <button onClick={() => setMobileOpen(true)} className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg">
          <Menu size={26} />
        </button>
        <Link to="/dashboard" className="flex items-center gap-2">
          <Recycle size={24} className="text-primary-green" />
          <span className="font-bold text-base text-gray-900 dark:text-white glow-text">Smart Waste AI</span>
        </Link>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* ── Mobile drawer overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="lg:hidden fixed top-0 left-0 h-screen w-56 z-50
                bg-white/98 dark:bg-[#081420]/98 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-white/10">
                <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <Recycle size={26} className="text-primary-green" />
                  <span className="font-bold text-gray-900 dark:text-white glow-text">Smart Waste AI</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  <ChevronLeft size={20} />
                </button>
              </div>
              <div className="flex flex-col flex-1 overflow-hidden">
                {sidebarContent}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
