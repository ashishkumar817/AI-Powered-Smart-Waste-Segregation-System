import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ParticleBackground from './components/ParticleBackground';
import Footer from './components/Footer';
import Home from './pages/Home';
import Detect from './pages/Detect';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Locations from './pages/Locations';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";

// Routes where sidebar is shown (authenticated app routes)
const SIDEBAR_ROUTES = ['/dashboard', '/detect', '/history', '/locations', '/about', '/admin'];

const AppLayout = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const useSidebar = user && SIDEBAR_ROUTES.some(r => location.pathname.startsWith(r));

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#081420] text-gray-900 dark:text-gray-100 font-sans selection:bg-green-500/30 relative z-0 transition-colors duration-300 overflow-x-hidden w-full">
      <ParticleBackground />

      {useSidebar ? (
        // ── Authenticated layout: sidebar + content ──
        <div className="flex min-h-screen">
          <Sidebar />
          {/* Content shifts right on desktop to make room for sidebar */}
          <div className="flex-1 flex flex-col lg:ml-56 transition-all duration-300">
            {/* Mobile top spacing (Sidebar renders its own mobile top bar) */}
            <main className="flex-1 pt-16 lg:pt-0">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                /> 
                <Route
                path="/verify-otp"
                element={<VerifyOTP />}
                />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/register" element={<Register />} />
                <Route path="/detect" element={<ProtectedRoute><Detect /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                <Route path="/locations" element={<Locations />} />
                <Route path="/about" element={<About />} />
                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
      ) : (
        // ── Public layout: top navbar ──
        <>
          <Navbar />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                /> 
                <Route
                  path="/verify-otp"
                  element={<VerifyOTP />}
                />
                <Route
                path="/reset-password"
                element={<ResetPassword />}
                />
              <Route path="/register" element={<Register />} />
              <Route path="/detect" element={<ProtectedRoute><Detect /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/about" element={<About />} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
