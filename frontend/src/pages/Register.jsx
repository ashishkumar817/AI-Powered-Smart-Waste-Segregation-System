import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader, AlertCircle, Eye, EyeOff, ChevronLeft, Recycle, User, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import ActionModal from '../components/ActionModal';
import heroImage from '../assets/ai_waste_hero.png';

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
     e.preventDefault();
    if(formData.password!==formData.confirmPassword){

    setError("Passwords do not match");

    return;

}
   
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setModalConfig({
          isOpen: true,
          type: 'alert',
          title: 'Success',
          message: 'Registration successful! A welcome email has been sent.',
          onConfirm: () => navigate('/login')
        });
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Cannot connect to server. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-50 dark:bg-[#040a10] flex overflow-hidden transition-colors duration-300">
      
      {/* Left Column: Register Form */}
      <div className="w-full lg:w-1/2 h-full flex flex-col p-8 sm:p-12 xl:p-24 relative overflow-y-auto">
        
        {/* Back Button & Logo */}
        <div className="flex items-center relative w-full max-w-md mx-auto mb-12 shrink-0">
          <button onClick={() => navigate('/')} className="absolute left-0 flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <Link to="/" className="mx-auto flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Recycle className="text-green-500" size={24} />
            <span className="text-lg font-bold font-inter text-gray-900 dark:text-white">Smart Waste AI</span>
          </Link>
        </div>

        {/* Form Container */}
        <motion.div 
          className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto py-8"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Create an account</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Enter your details below to get started</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-red-400 text-sm items-start">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="bg-white dark:bg-[#0a1321]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 sm:p-10 shadow-xl">
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-2 group">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-500 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={formData.username}
                    placeholder="Enter username"
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-all"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2 group">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    placeholder="m@example.com"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    placeholder="Password"
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl pl-11 pr-12 py-3.5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-all"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

               <div className="space-y-2 group">
  <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold">
    Confirm Password
  </label>

  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-500 transition-colors">
      <Lock size={18} />
    </div>

    <input
      type={showConfirmPassword ? "text" : "password"}
      value={formData.confirmPassword}
      placeholder="Confirm Password"
      onChange={(e) =>
        setFormData({
          ...formData,
          confirmPassword: e.target.value,
        })
      }
      className={`w-full bg-gray-50 dark:bg-black/20 border rounded-xl pl-11 pr-12 py-3.5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all ${
        formData.confirmPassword &&
        formData.password !== formData.confirmPassword
          ? "border-red-500 focus:ring-red-500/50"
          : "border-gray-200 dark:border-white/10 focus:border-green-500 focus:ring-green-500/50"
      }`}
      required
    />

    <button
      type="button"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
    >
      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>

  {formData.confirmPassword &&
    formData.password !== formData.confirmPassword && (
      <p className="text-red-500 text-xs mt-1">
        Passwords do not match.
      </p>
    )}

  {formData.confirmPassword &&
    formData.password === formData.confirmPassword && (
      <p className="text-green-500 text-xs mt-1">
        ✓ Passwords match
      </p>
    )}
</div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-black font-bold py-4 rounded-xl transition-all transform hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] flex justify-center items-center gap-2"
              >
                {loading ? <Loader size={20} className="animate-spin" /> : "Sign Up"}
              </button>
            </form>
          </div>
         

          <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            Already have an account? <Link to="/login" className="text-green-600 dark:text-green-400 font-semibold hover:underline ml-1">Sign in</Link>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Hero Image */}
      <div className="hidden lg:block lg:w-1/2 h-full relative border-l border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-[#081420]">
        {/* Gradient Overlay removed per request */}
        
        <motion.div 
          className="absolute inset-0 overflow-hidden"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
        >
          <img 
            src={heroImage} 
            alt="AI Smart Waste Detection" 
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Motivational Text Overlay */}
        <div className="absolute bottom-12 left-12 right-12 z-20 text-center p-8 rounded-3xl bg-black/30 backdrop-blur-md border border-white/20 shadow-2xl">
          <blockquote className="text-2xl font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] tracking-tight">
            "Join the movement towards a cleaner, smarter planet."
          </blockquote>
          <p className="mt-4 text-sm text-white/90 font-bold tracking-wide uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            — Smart Waste AI
          </p>
        </div>
      </div>

      <ActionModal 
        {...modalConfig}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />
    </div>
  );
};

export default Register;
