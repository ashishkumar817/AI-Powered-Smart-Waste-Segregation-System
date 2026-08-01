import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Recycle, Mail, ChevronDown } from 'lucide-react';
import { FaGithub, FaLinkedin, FaInstagram, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer className="bg-slate-900 text-white mt-auto transition-colors duration-300 border-t-4 border-green-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-12">
          {/* Brand Column */}
          <div className="space-y-6 mb-6 md:mb-0">
            <Link to="/" className="flex items-center gap-2">
              <Recycle className="text-green-500" size={28} />
              <span className="text-xl font-bold font-inter text-white">Smart Waste AI</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Providing state-of-the-art waste segregation services with top experts and AI-powered report analysis. A cleaner planet is our primary focus.
            </p>
            <div className="flex gap-4 text-gray-400">
              <a href="https://github.com/ashishkumar817" target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-colors p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center"><FaGithub size={20} /></a>
              <a href="https://www.linkedin.com/in/ashishkumar21-" target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"><FaLinkedin size={20} /></a>
              <a href="https://www.instagram.com/_ash_kumar_21_/" target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"><FaInstagram size={20} /></a>
              <a href="mailto:ashishkumarkaup@gmail.com" className="hover:text-green-500 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"><FaEnvelope size={20} /></a>
            </div>
          </div>
          
          {/* Quick Links Column */}
          <div className="border-b border-white/10 md:border-none pb-4 md:pb-0">
            <button 
              onClick={() => toggleSection('links')}
              className="w-full flex justify-between items-center md:hidden min-h-[44px]"
            >
              <h3 className="text-green-500 text-xs font-bold uppercase tracking-widest">Quick Links</h3>
              <ChevronDown size={16} className={`text-green-500 transition-transform ${openSection === 'links' ? 'rotate-180' : ''}`} />
            </button>
            <h3 className="hidden md:block text-green-500 text-xs font-bold uppercase tracking-widest mb-6">Quick Links</h3>
            <ul className={`space-y-2 text-sm text-gray-300 mt-4 md:mt-0 ${openSection === 'links' ? 'block' : 'hidden'} md:block`}>
              <li><Link to="/" onClick={() => window.scrollTo(0,0)} className="hover:text-green-400 transition-colors block py-2 min-h-[44px] flex items-center md:min-h-0 md:py-0">Home</Link></li>
              <li><Link to="/detect" onClick={() => window.scrollTo(0,0)} className="hover:text-green-400 transition-colors block py-2 min-h-[44px] flex items-center md:min-h-0 md:py-0">Scanner</Link></li>
              <li><Link to="/history" onClick={() => window.scrollTo(0,0)} className="hover:text-green-400 transition-colors block py-2 min-h-[44px] flex items-center md:min-h-0 md:py-0">History</Link></li>
              <li><Link to="/dashboard" onClick={() => window.scrollTo(0,0)} className="hover:text-green-400 transition-colors block py-2 min-h-[44px] flex items-center md:min-h-0 md:py-0">Dashboard</Link></li>
            </ul>
          </div>
          
          {/* Services Column */}
          <div className="border-b border-white/10 md:border-none pb-4 md:pb-0">
            <button 
              onClick={() => toggleSection('services')}
              className="w-full flex justify-between items-center md:hidden min-h-[44px]"
            >
              <h3 className="text-green-500 text-xs font-bold uppercase tracking-widest">Services</h3>
              <ChevronDown size={16} className={`text-green-500 transition-transform ${openSection === 'services' ? 'rotate-180' : ''}`} />
            </button>
            <h3 className="hidden md:block text-green-500 text-xs font-bold uppercase tracking-widest mb-6">Services</h3>
            <ul className={`space-y-2 text-sm text-gray-300 mt-4 md:mt-0 ${openSection === 'services' ? 'block' : 'hidden'} md:block`}>
              <li className="flex items-center gap-2 py-2 min-h-[44px] md:min-h-0 md:py-0"><Recycle size={14} className="text-green-500 shrink-0"/> Plastic Recycling</li>
              <li className="flex items-center gap-2 py-2 min-h-[44px] md:min-h-0 md:py-0"><Recycle size={14} className="text-green-500 shrink-0"/> E-Waste Management</li>
              <li className="flex items-center gap-2 py-2 min-h-[44px] md:min-h-0 md:py-0"><Recycle size={14} className="text-green-500 shrink-0"/> Hazardous Materials</li>
              <li className="flex items-center gap-2 py-2 min-h-[44px] md:min-h-0 md:py-0"><Recycle size={14} className="text-green-500 shrink-0"/> Data Analytics</li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="border-b border-white/10 md:border-none pb-4 md:pb-0">
            <button 
              onClick={() => toggleSection('contact')}
              className="w-full flex justify-between items-center md:hidden min-h-[44px]"
            >
              <h3 className="text-green-500 text-xs font-bold uppercase tracking-widest">Emergency & Contact</h3>
              <ChevronDown size={16} className={`text-green-500 transition-transform ${openSection === 'contact' ? 'rotate-180' : ''}`} />
            </button>
            <h3 className="hidden md:block text-green-500 text-xs font-bold uppercase tracking-widest mb-6">Emergency & Contact</h3>
            <ul className={`space-y-2 text-sm text-gray-300 mt-4 md:mt-0 ${openSection === 'contact' ? 'block' : 'hidden'} md:block`}>
              <li className="flex items-start gap-3 py-2 min-h-[44px] md:min-h-0 md:py-0">
                <Mail size={16} className="text-green-500 mt-0.5 shrink-0" />
                <span><strong className="text-white">Email:</strong> support@smartwaste.ai</span>
              </li>
              <li className="flex items-start gap-3 py-2 min-h-[44px] md:min-h-0 md:py-0">
                <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span><strong className="text-white">Phone:</strong> +91 9108 291 462</span>
              </li>
              <li className="flex items-start gap-3 py-2 min-h-[44px] md:min-h-0 md:py-0">
                <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span><strong className="text-white">Campus:</strong> Kaup, Udupi - 574106, Karnataka, India </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Smart Waste AI. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/" onClick={() => window.scrollTo(0,0)} className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/" onClick={() => window.scrollTo(0,0)} className="hover:text-white transition-colors">Terms of Service</Link>
            <div className="flex items-center gap-1 border border-white/20 rounded px-2 py-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> English
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
