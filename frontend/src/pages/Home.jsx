import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useSpring, useTransform, useMotionValue, useMotionTemplate, animate, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Camera, Zap, ShieldCheck, Database, Info, Cpu, Scan, Layers, Recycle, Target, Mail, Phone, MapPin, Send, CheckCircle2, Loader2, User } from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';
import logo from '../assets/logo.png';
import aboutImg from '../assets/about us.png';
import heroBg from '../assets/hero-bg.png';
import plasticImgDark from '../assets/plastic_black.png';
import paperImgDark from '../assets/paper_black.png';
import glassImgDark from '../assets/glass_black.png';
import metalImgDark from '../assets/metal_black.png';
import cardboardImgDark from '../assets/cardboard_black.png';
import organicImgDark from '../assets/organic_black.png';
import plasticImgLight from '../assets/plastic_3d.png';
import paperImgLight from '../assets/paper_3d.png';
import glassImgLight from '../assets/glass_3d.png';
import metalImgLight from '../assets/metal_3d.png';
import cardboardImgLight from '../assets/cardboard_3d.png';
import organicImgLight from '../assets/organic_3d.png';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';
import About from './About';
import axios from "axios";

const categoryData = [
  { 
    name: 'Plastic', 
    type: 'Recyclable', 
    imgDark: plasticImgDark, 
    imgLight: plasticImgLight, 
    desc: 'Identifies PET bottles, HDPE containers, and mixed plastics with high confidence.',
    bgAccent: 'bg-blue-500/10', 
    glow: 'hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]',
    borderColor: 'border-gray-200 dark:border-white/5 hover:border-blue-500/50 dark:hover:border-blue-500/50',
    tagColor: 'text-blue-600 dark:text-blue-400 bg-blue-500/10'
  },
  { 
    name: 'Paper', 
    type: 'Recyclable', 
    imgDark: paperImgDark, 
    imgLight: paperImgLight, 
    desc: 'Detects office paper, newspapers, and crumpled sheets for clean recycling streams.',
    bgAccent: 'bg-yellow-500/10', 
    glow: 'hover:shadow-[0_0_40px_rgba(234,179,8,0.3)]',
    borderColor: 'border-gray-200 dark:border-white/5 hover:border-yellow-500/50 dark:hover:border-yellow-500/50',
    tagColor: 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10'
  },
  { 
    name: 'Glass', 
    type: 'Recyclable', 
    imgDark: glassImgDark, 
    imgLight: glassImgLight, 
    desc: 'Recognizes clear, green, and brown glass bottles or jars safely and accurately.',
    bgAccent: 'bg-teal-500/10', 
    glow: 'hover:shadow-[0_0_40px_rgba(20,184,166,0.3)]',
    borderColor: 'border-gray-200 dark:border-white/5 hover:border-teal-500/50 dark:hover:border-teal-500/50',
    tagColor: 'text-teal-600 dark:text-teal-400 bg-teal-500/10'
  },
  { 
    name: 'Metal', 
    type: 'Recyclable', 
    imgDark: metalImgDark, 
    imgLight: metalImgLight, 
    desc: 'Scans aluminum cans, tin containers, and foils for high-value material recovery.',
    bgAccent: 'bg-gray-500/10', 
    glow: 'hover:shadow-[0_0_40px_rgba(156,163,175,0.3)]',
    borderColor: 'border-gray-200 dark:border-white/5 hover:border-gray-400/50 dark:hover:border-gray-400/50',
    tagColor: 'text-gray-600 dark:text-gray-300 bg-gray-500/10'
  },
  { 
    name: 'Cardboard', 
    type: 'Recyclable', 
    imgDark: cardboardImgDark, 
    imgLight: cardboardImgLight, 
    desc: 'Detects corrugated boxes and packaging materials for flat-pack processing.',
    bgAccent: 'bg-orange-500/10', 
    glow: 'hover:shadow-[0_0_40px_rgba(249,115,22,0.3)]',
    borderColor: 'border-gray-200 dark:border-white/5 hover:border-orange-500/50 dark:hover:border-orange-500/50',
    tagColor: 'text-orange-600 dark:text-orange-400 bg-orange-500/10'
  },
  { 
    name: 'Organic', 
    type: 'Biodegradable', 
    imgDark: organicImgDark, 
    imgLight: organicImgLight, 
    desc: 'Identifies food scraps, peels, and yard waste for rapid composting routing.',
    bgAccent: 'bg-green-500/10', 
    glow: 'hover:shadow-[0_0_40px_rgba(34,197,94,0.3)]',
    borderColor: 'border-gray-200 dark:border-white/5 hover:border-green-500/50 dark:hover:border-green-500/50',
    tagColor: 'text-green-600 dark:text-green-400 bg-green-500/10'
  },
];

const steps = [
  { title: 'Data Ingestion', desc: 'Capture or upload imagery of the waste item using our high-resolution web interface.', icon: <Camera size={32} /> },
  { title: 'AI Vision Analysis', desc: 'Our fine-tuned YOLOv8 model scans the visual features in milliseconds.', icon: <Scan size={32} /> },
  { title: 'Instant Classification', desc: 'The neural network classifies the object and assigns a confidence score.', icon: <Layers size={32} /> },
  { title: 'Actionable Insights', desc: 'Receive immediate, verified instructions for proper eco-friendly disposal.', icon: <Recycle size={32} /> },
];

const faqs = [
  { question: "How do I scan waste using Smart Waste AI?", answer: "It's simple. Go to the Detect page and either use your device's camera to scan live, or upload an existing image. Our YOLOv8 model will analyze the image in milliseconds and provide the classification." },
  { question: "How does the AI Vision Scanner work?", answer: "We use a custom-trained YOLOv8 object detection model running on a Flask backend. It analyzes the visual features of the waste and cross-references it with thousands of trained images to accurately classify it." },
  { question: "What happens to the images I upload?", answer: "Your privacy is our priority. Images are processed in real-time in memory and are not permanently stored on our servers unless you opt-in to help improve our model." },
  { question: "Can I download my detection history?", answer: "Yes, you can view your entire detection history in the Dashboard and export it for your personal tracking or sustainability reporting." },
];

const AnimatedNumber = ({ value, suffix = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 3.5,
        ease: "easeOut",
        onUpdate: (val) => {
          setDisplayValue(Math.floor(val));
        }
      });
      return controls.stop;
    }
  }, [isInView, value]);

  return <span ref={ref}>{displayValue}{suffix}</span>;
};

const HeroTiltCard = ({ children }) => {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);

  const springCfg = { stiffness: 180, damping: 20 };
  const rotateY = useSpring(useTransform(rawX, [0, 1], [-18, 18]), springCfg);
  const rotateX = useSpring(useTransform(rawY, [0, 1], [14, -14]), springCfg);

  const glareX = useTransform(rawX, [0, 1], [0, 100]);
  const glareY = useTransform(rawY, [0, 1], [0, 100]);
  const glareGradient = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.18) 0%, transparent 65%)`;

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width);
    rawY.set((e.clientY - rect.top) / rect.height);
  }, [rawX, rawY]);

  const handleMouseLeave = useCallback(() => {
    rawX.set(0.5);
    rawY.set(0.5);
    setHovered(false);
  }, [rawX, rawY]);

  return (
    <motion.div
      ref={cardRef}
      style={{ perspective: 1200 }}
      className="relative h-[500px] w-full flex justify-center items-center mt-12 lg:mt-0"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        whileHover={{ scale: 1.04 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="relative w-full h-full flex justify-center items-center"
      >
        {children}

        {/* Glare overlay */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-30 rounded-[3rem]"
          style={{ background: glareGradient, opacity: hovered ? 1 : 0 }}
          transition={{ opacity: { duration: 0.3 } }}
        />
      </motion.div>
    </motion.div>
  );
};

const Home = () => {
  const [formStatus, setFormStatus] = useState('idle');
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
});

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    setFormStatus("sending");

    try {

        const res = await axios.post(
            "http://127.0.0.1:5000/api/contact",
            contactData
        );

        console.log(res.data);

        setFormStatus("sent");

         setContactData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });

        setTimeout(() => {
            setFormStatus("idle");
        }, 3000);

    } catch (err) {

        console.error(err);

        alert(
            err.response?.data?.error ||
            "Unable to send message."
        );

        setFormStatus("idle");
    }
};
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative pt-20 pb-32 overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-slate-100/20 dark:bg-[#081420]/30 z-0"></div>
        {/* Animated background glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-green/20 rounded-full blur-[100px] z-0 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] z-0 animate-pulse delay-1000" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-50 dark:bg-green-900/40 border-2 border-green-400/60 text-green-800 dark:text-green-300 text-sm font-bold shadow-[0_0_20px_rgba(74,222,128,0.4)] backdrop-blur-md">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-100"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)]"></span>
              </span>
              AI Powered Waste Detection
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold font-inter leading-tight text-gray-900 dark:text-white drop-shadow-lg">
              Intelligent <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 dark:from-green-400 via-emerald-500 dark:via-emerald-300 to-teal-600 dark:to-teal-400 animate-gradient-x drop-shadow-sm">
                Waste Sorting
              </span>
            </h1>
            
            <p className="text-xl font-medium text-gray-800 dark:text-gray-100 max-w-xl leading-relaxed drop-shadow-md bg-white/10 dark:bg-black/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 dark:border-white/5">
              Experience the future of recycling. Our state-of-the-art YOLOv8 AI instantly detects, classifies, and guides you on how to dispose of waste correctly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link to="/detect" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full">Start Detection</Button>
              </Link>
              <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full">Learn More</Button>
              </button>
            </div>
          </motion.div>

          {/* ── Hero tilt card ── */}
          <HeroTiltCard>
            {/* Background orbit rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
              <div className="absolute w-[400px] h-[400px] bg-green-500/30 blur-[100px] rounded-full animate-pulse" />
              <div className="absolute w-[600px] h-[600px] rounded-full border-2 border-green-500/30 animate-[ping_4s_ease-in-out_infinite] shadow-[0_0_30px_rgba(34,197,94,0.2)]" />
              <div className="absolute w-[450px] h-[450px] rounded-full border-2 border-green-500/40 animate-[spin_12s_linear_infinite] border-t-green-400 shadow-[0_0_40px_rgba(34,197,94,0.3)]" />
            </div>

            {/* Floating image card */}
            <motion.div 
              animate={{ y: [-15, 15, -15] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="relative w-full max-w-md aspect-square rounded-[3rem] glass flex items-center justify-center border-2 border-green-500/30 shadow-[0_0_60px_rgba(34,197,94,0.2)] overflow-hidden z-10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-transparent to-white/50 dark:to-black/90 z-10 pointer-events-none" />
              <img src={logo} alt="Smart Waste AI Logo" className="w-full h-full object-cover relative z-0 transform hover:scale-110 transition-transform duration-700" />
            </motion.div>
            
            {/* Floating Badges */}
            <motion.div 
              animate={{ y: [-10, 10, -10], rotate: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 4, delay: 0.5 }}
              className="absolute -top-4 right-0 lg:-right-10 z-20 bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-green-500/40 rounded-2xl p-4 shadow-xl flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 dark:text-green-400">
                <Zap size={24} />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Speed</div>
                <div className="font-bold text-gray-900 dark:text-white text-xl">~30ms</div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [10, -10, 10], rotate: [2, -2, 2] }}
              transition={{ repeat: Infinity, duration: 5, delay: 1 }}
              className="absolute -bottom-4 left-0 lg:-left-10 z-20 bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-emerald-400/40 rounded-2xl p-4 shadow-xl flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                <Cpu size={24} />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">AI Engine</div>
                <div className="font-bold text-gray-900 dark:text-white text-xl">YOLOv8</div>
              </div>
            </motion.div>
          </HeroTiltCard>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 cursor-pointer flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
          onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          <div className="w-6 h-10 rounded-full border-2 border-gray-500 dark:border-gray-400 flex justify-center p-1">
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-1 h-2.5 bg-green-500 rounded-full" 
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Banner */}
      <section className="py-16 bg-slate-50 dark:bg-[#030a12] relative z-20 border-t border-gray-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Stat Card 1 */}
            <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-[#0a1321] border border-gray-200 dark:border-white/5 p-6 hover:-translate-y-1.5 transition-all duration-500 hover:shadow-[0_8px_30px_rgba(34,197,94,0.12)]">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-green-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-500">
                  <Target size={20} />
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                <AnimatedNumber value={95} suffix="%+" />
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Detection Accuracy
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-[#0a1321] border border-gray-200 dark:border-white/5 p-6 hover:-translate-y-1.5 transition-all duration-500 hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)]">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-500">
                  <Layers size={20} />
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                <AnimatedNumber value={6} />
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Waste Categories
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-[#0a1321] border border-gray-200 dark:border-white/5 p-6 hover:-translate-y-1.5 transition-all duration-500 hover:shadow-[0_8px_30px_rgba(234,179,8,0.12)]">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform duration-500">
                  <Zap size={20} />
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                <AnimatedNumber value={30} suffix="ms" />
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Avg Scan Speed
              </div>
            </div>

            {/* Stat Card 4 */}
            <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-[#0a1321] border border-gray-200 dark:border-white/5 p-6 hover:-translate-y-1.5 transition-all duration-500 hover:shadow-[0_8px_30px_rgba(168,85,247,0.12)]">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck size={20} />
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                <AnimatedNumber value={24} suffix="/7" />
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                AI Availability
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* About Section (Side-by-side) */}
      <section id="about" className="py-24 bg-slate-100 dark:bg-primary-navy scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-3 py-1 mb-4 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-widest border border-green-500/20">
                ★ Core Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                About Smart Waste AI
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Smart Waste AI is a state-of-the-art environmental tech platform dedicated to solving the global recycling crisis. By leveraging cutting-edge computer vision (YOLOv8) and intuitive interfaces, we automate the complex process of waste segregation, ensuring recyclables are correctly identified and sorted at the source.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">AI Diagnosis Assist</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">Instant Results</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">Secure Data Analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">24/7 Availability</span>
                </div>
              </div>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link to="/detect" className="w-full sm:w-auto">
                  <Button variant="primary" className="w-full">Try the AI Scanner</Button>
                </Link>
                <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full">View Categories</Button>
                </button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-white/10 bg-white/5 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-green-900/10 to-transparent z-10 mix-blend-overlay pointer-events-none" />
              <img src={aboutImg} alt="About Smart Waste AI" className="w-full h-auto object-contain transform hover:scale-105 transition-transform duration-1000" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features / Categories Section */}
      <section id="features" className="py-24 bg-white dark:bg-[#081420] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-widest border border-green-500/20">
              ★ Model Capabilities
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">AI Detects 6 Waste Categories</h2>
            <p className="text-gray-600 dark:text-gray-400">Our YOLOv8-powered model accurately classifies recyclable and biodegradable waste in real time.</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mt-12">
            {categoryData.map((cat, index) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative bg-white dark:bg-[#050b14] border rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 group flex flex-col hover:-translate-y-2 ${cat.glow} ${cat.borderColor}`}
              >
                {/* Subtle top gradient line matching the category color */}
                <div className={`absolute top-0 inset-x-0 h-1 ${cat.bgAccent} opacity-50`} />

                <div className="relative h-48 flex items-center justify-center p-6 mt-6">
                  {/* Glowing background blob behind the image */}
                  <div className={`absolute inset-0 m-auto w-32 h-32 rounded-full ${cat.bgAccent} blur-3xl group-hover:scale-150 transition-transform duration-700`} />
                  
                  {/* Light Theme Image: multiply blending removes the white background */}
                  <img 
                    src={cat.imgLight} 
                    alt={cat.name} 
                    className="relative z-10 w-full h-full object-contain scale-110 drop-shadow-2xl mix-blend-multiply group-hover:scale-125 group-hover:-rotate-3 transition-transform duration-500 dark:hidden"
                  />
                  
                  {/* Dark Theme Image: screen blending removes the black background */}
                  <img 
                    src={cat.imgDark} 
                    alt={cat.name} 
                    className="relative z-10 w-full h-full object-contain scale-110 drop-shadow-2xl mix-blend-screen group-hover:scale-125 group-hover:-rotate-3 transition-transform duration-500 hidden dark:block"
                  />
                  
                  {/* AI Verified Badge */}
                  <div className="absolute top-4 right-4 bg-white/60 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5 z-20 shadow-sm dark:shadow-lg">
                    <ShieldCheck size={14} className="text-green-600 dark:text-green-400" />
                    <span className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">AI Verified</span>
                  </div>
                </div>
                
                <div className="p-6 pt-4 flex-1 flex flex-col relative z-20">
                  <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">{cat.name}</h3>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-6 flex-1 leading-relaxed">
                    {cat.desc}
                  </p>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-white/5">
                    <span className={`text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full ${cat.tagColor}`}>
                      {cat.type}
                    </span>
                    <motion.div 
                      className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
                    >
                      <span>View Guide</span>
                      <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/detect" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full">Scan Your Waste Now</Button>
            </Link>
            <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full">See How It Works</Button>
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 relative overflow-hidden bg-slate-50 dark:bg-[#030712] scroll-mt-20 transition-colors duration-300 border-t border-gray-100 dark:border-white/5">
        {/* Animated Grid & Particles */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:[mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#fff_70%,transparent_100%)]"></div>
          <motion.div 
            animate={{ 
              backgroundPosition: ['0% 0%', '100% 100%'],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-30%,rgba(34,197,94,0.15),transparent)]"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-widest border border-green-500/20 shadow-sm backdrop-blur-sm">
              Workflow
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">How It Works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">A seamless, AI-driven pipeline that turns a simple image into actionable environmental impact.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12 relative">
            {/* Glowing Connection Line */}
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-[2px] bg-gray-200 dark:bg-white/5 z-0 rounded-full">
              <motion.div 
                initial={{ scaleX: 0, opacity: 0 }}
                whileInView={{ scaleX: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500 to-transparent origin-left shadow-[0_0_15px_rgba(34,197,94,0.6)]" 
              />
            </div>
            
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                {/* Icon Container with Glow */}
                <div className="relative mb-8 mt-2">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl group-hover:bg-green-500/40 group-hover:scale-150 transition-all duration-700" />
                  <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-[#0a1321] border border-gray-200 dark:border-white/10 shadow-xl flex items-center justify-center text-green-600 dark:text-green-400 relative z-10 group-hover:-translate-y-3 group-hover:border-green-500/50 group-hover:shadow-[0_15px_40px_-10px_rgba(34,197,94,0.4)] transition-all duration-500 overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-green-500/10 before:to-transparent before:opacity-0 group-hover:before:opacity-100 before:transition-opacity">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: index % 2 === 0 ? 8 : -8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {step.icon}
                    </motion.div>
                  </div>
                  {/* Step Badge */}
                  <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(34,197,94,0.5)] border-2 border-slate-50 dark:border-[#030712] z-20 group-hover:scale-110 transition-transform duration-300">
                    {index + 1}
                  </div>
                </div>
                
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">{step.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-[220px]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-24 text-center flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link to="/detect" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-green-600 hover:bg-green-500 text-white font-semibold tracking-wide transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:-translate-y-0.5">
                Start Detection
              </button>
            </Link>
            <Link to="/history" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white dark:bg-[#0a1321] hover:bg-gray-50 dark:hover:bg-[#111e33] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 font-semibold tracking-wide transition-all hover:border-gray-300 dark:hover:border-white/20 hover:shadow-lg">
                View Architecture
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* The original standalone About page import can be removed entirely since we put About directly in Home now */}

      {/* FAQ Section */}
      <section className="py-24 bg-white dark:bg-[#081420] border-t border-gray-100 dark:border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase tracking-widest border border-gray-200 dark:border-white/10">
              Client Queries
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="text-gray-600 dark:text-gray-400">Get answers to the most common questions regarding scanning, data privacy, and AI assistance.</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-slate-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl open:bg-white dark:open:bg-[#0c1828] transition-colors duration-300">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-6 text-gray-900 dark:text-white group-open:text-primary-green transition-colors">
                  <span>{faq.question}</span>
                  <span className="transition-transform duration-300 group-open:-rotate-180">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <p className="text-gray-600 dark:text-gray-400 px-6 pb-6 pt-0 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="pt-14 pb-24 relative overflow-hidden bg-white dark:bg-[#081420] scroll-mt-16">
        {/* Subtle floating background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 text-gray-900 dark:text-white tracking-tight">
                Let's start a <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-400">conversation</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Have questions about our AI models, integration capabilities, or enterprise pricing? Our team is ready to help.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            {/* Contact Info (Left - 2 Cols) */}
            <motion.div 
              className="lg:col-span-4 space-y-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7 }}
            >
              {[
                { icon: <Mail size={24} />, title: 'Email Us', desc: 'support@smartwaste.ai', action: 'mailto:support@smartwaste.ai' },
                { icon: <Phone size={24} />, title: 'Call Us', desc: '+1 (555) 019-2834', action: 'tel:+15550192834' },
                { icon: <MapPin size={24} />, title: 'Visit Us', desc: 'Innovation Park, Tech City, SF', action: '#' }
              ].map((item, i) => (
                <a href={item.action} onClick={item.action === '#' ? (e) => e.preventDefault() : undefined} key={i} className="group flex items-start gap-4 sm:gap-5 p-6 sm:p-5 rounded-2xl bg-gray-50 dark:bg-[#0a1321] border border-gray-200 dark:border-white/5 hover:border-green-500/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(34,197,94,0.08)]">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300 group-hover:text-green-500 group-hover:scale-110 transition-all duration-300 shadow-sm">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-green-500 transition-colors">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">{item.desc}</p>
                  </div>
                </a>
              ))}
              
              <div className="flex gap-4 pt-4 px-2">
                {[FaGithub, FaTwitter, FaLinkedin].map((Icon, i) => (
                  <a href="#" onClick={(e) => e.preventDefault()} key={i} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Contact Form (Right - 3 Cols) */}
            <motion.div 
              className="lg:col-span-8"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7 }}
            >
              <form onSubmit={handleContactSubmit} className="relative p-8 sm:p-10 rounded-[2rem] bg-gray-50 dark:bg-[#0a1321] border border-gray-200 dark:border-white/5 shadow-xl space-y-6 overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-green-500 to-emerald-400 opacity-50" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-500 transition-colors">
                        <User size={18} />
                      </div>
                      <input
                          type="text"
                          required
                          placeholder="John Doe"
                          value={contactData.name}
                          onChange={(e) =>
                            setContactData({
                              ...contactData,
                              name: e.target.value,
                            })
                          }
                          className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                        />
                    </div>
                  </div>
                  
                  <div className="space-y-2 group">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Work Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-500 transition-colors">
                        <Mail size={18} />
                      </div>
                      <input
                          type="email"
                          required
                          placeholder="john@company.com"
                          value={contactData.email}
                          onChange={(e) =>
                            setContactData({
                              ...contactData,
                              email: e.target.value,
                            })
                          }
                          className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                        />
                    </div>
                  </div>

                    {/* Phone Number */}

                    <div className="space-y-2 group">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Phone Number
                      </label>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                          <Phone size={18} />
                        </div>

                        <input
                          type="tel"
                          pattern="[0-9+ ]{10,15}"
                          placeholder="+91 9876543210"
                          value={contactData.phone}
                          onChange={(e) =>
                            setContactData({
                              ...contactData,
                              phone: e.target.value,
                            })
                          }
                          className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Subject */}

                    <div className="space-y-2 group">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Subject
                      </label>

                      <input
                        type="text"
                        placeholder="Project Inquiry"
                        value={contactData.subject}
                        onChange={(e) =>
                          setContactData({
                            ...contactData,
                            subject: e.target.value,
                          })
                        }
                        className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                      />
                    </div>
                  </div>
            
                <div className="space-y-2 group">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">How can we help?</label>
                  <textarea
                      rows={6}
                      required
                      placeholder="Tell us about your project or inquiry..."
                      value={contactData.message}
                      onChange={(e) =>
                        setContactData({
                          ...contactData,
                          message: e.target.value,
                        })
                      }
                      className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all resize-none"
                    />
                </div>

                <button 
                  type="submit" 
                  disabled={formStatus !== 'idle'}
                  className={`w-full relative overflow-hidden font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2
                    ${formStatus === 'idle' ? 'bg-green-500 hover:bg-green-400 text-black hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transform hover:-translate-y-0.5' : ''}
                    ${formStatus === 'sending' ? 'bg-green-500/50 text-black/50 cursor-not-allowed' : ''}
                    ${formStatus === 'sent' ? 'bg-emerald-500 text-black' : ''}
                  `}
                >
                  {formStatus === "idle" && (
                    <>
                      <Send size={18} /> Send Message
                    </>
                  )}

                  {formStatus === "sending" && (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending...
                    </>
                  )}

                  {formStatus === "sent" && (
                    <>
                      <CheckCircle2 size={18} />
                      Message Sent
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
