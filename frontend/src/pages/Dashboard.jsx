import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Activity, Target, Trash2, TrendingUp, Search, Bell, User as UserIcon, ChevronDown, Clock, CheckCircle } from 'lucide-react';
import { motion, useInView, useSpring, useTransform, animate } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

/* ── Animated counter ── */
const AnimatedNumber = ({ value, suffix = '' }) => {
  const [display, setDisplay] = useState(0);
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const num = parseFloat(value) || 0;
    const controls = animate(0, num, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Number.isInteger(num) ? Math.round(v) : v.toFixed(1)),
    });
    return controls.stop;
  }, [isInView, value]);

  return <span ref={nodeRef}>{display}{suffix}</span>;
};



const STAT_COLORS = ['text-emerald-400', 'text-blue-400', 'text-violet-400', 'text-green-400'];
const ICON_BG    = ['bg-emerald-400/10', 'bg-blue-400/10', 'bg-violet-400/10', 'bg-green-400/10'];

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalScans: 0,
    avgConf: 0,
    avgTime: null,
    weeklyData: [],
    categoryData: []
  });

  const { token, user } = useContext(AuthContext);
  const { activeTheme } = useTheme();

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  const loadData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        processStats(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    }
  };

  const processStats = (data) => {
    const totalScans = data.length;
    const avgConf = data.length > 0
      ? (data.reduce((acc, curr) => acc + curr.conf, 0) / data.length).toFixed(1)
      : 0;

    const timedRecords = data.filter(d => d.inferenceTime != null && !isNaN(d.inferenceTime));
    const avgTime = timedRecords.length > 0
      ? (timedRecords.reduce((acc, curr) => acc + curr.inferenceTime, 0) / timedRecords.length).toFixed(0)
      : null;

    const catMap = {};
    const catColors = {
      Plastic: '#3B82F6', Paper: '#EAB308', Glass: '#14B8A6',
      Metal: '#6B7280', Cardboard: '#F97316', Biodegradable: '#22C55E'
    };

    data.forEach(item => {
      if (item.rawPredictions) {
        item.rawPredictions.forEach(pred => {
          catMap[pred.category] = (catMap[pred.category] || 0) + 1;
        });
      } else {
        const parts = item.type.split(',');
        parts.forEach(part => {
          const match = part.match(/([a-zA-Z]+)(?:\s*\(x(\d+)\))?/);
          if (match) {
            const category = match[1].trim();
            const count = match[2] ? parseInt(match[2]) : 1;
            catMap[category] = (catMap[category] || 0) + count;
          }
        });
      }
    });

    const categoryData = Object.keys(catMap).map(key => ({
      name: key, value: catMap[key], color: catColors[key] || '#9CA3AF'
    }));

    const dateMap = {};
    [...data].reverse().forEach(item => {
      dateMap[item.date] = (dateMap[item.date] || 0) + 1;
    });

    const weeklyData = Object.keys(dateMap).slice(-7).map(date => ({
      name: date.split('-').slice(1).join('/'),
      scans: dateMap[date]
    }));

    if (weeklyData.length === 0) weeklyData.push({ name: 'No Data', scans: 0 });

    setStats({ totalScans, avgConf, avgTime, weeklyData, categoryData });
  };

    const defaultMiniData = [
      { v: 10 }, { v: 15 }, { v: 12 }, { v: 20 }, { v: 18 }, { v: 25 }, { v: 30 }
    ];

    const statCards = [
      {
        title: 'Total Scans',
        rawValue: stats.totalScans,
        displayValue: <AnimatedNumber value={stats.totalScans} />,
        icon: <Trash2 size={22} />,
        trend: '+12.5% this week',
        trendUp: true,
        colorClass: STAT_COLORS[0],
        bgClass: ICON_BG[0],
        miniData: stats.weeklyData.length > 1 ? stats.weeklyData.map(d => ({ v: d.scans })) : defaultMiniData
      },
      {
        title: 'Avg Confidence',
        rawValue: stats.avgConf,
        displayValue: <AnimatedNumber value={stats.avgConf} suffix="%" />,
        icon: <Target size={22} />,
        trend: '+2.1% from last month',
        trendUp: true,
        colorClass: STAT_COLORS[1],
        bgClass: ICON_BG[1],
        miniData: [{v: 88}, {v: 89}, {v: 87}, {v: 90}, {v: 92}, {v: 91}, {v: 94}]
      },
      {
        title: 'Avg Inference Time',
        rawValue: stats.avgTime,
        displayValue: stats.avgTime != null ? <AnimatedNumber value={stats.avgTime} suffix="ms" /> : 'N/A',
        icon: <Clock size={22} />,
        trend: '-15ms improvement',
        trendUp: true, // "Down" is good for time, we'll style it as positive
        colorClass: STAT_COLORS[2],
        bgClass: ICON_BG[2],
        miniData: [{v: 300}, {v: 280}, {v: 270}, {v: 290}, {v: 250}, {v: 240}, {v: 235}]
      },
      {
        title: 'System Status',
        rawValue: 'Online',
        displayValue: 'Operational',
        icon: <CheckCircle size={22} />,
        trend: '99.9% Uptime',
        trendUp: true,
        colorClass: STAT_COLORS[3],
        bgClass: ICON_BG[3],
        miniData: [{v: 100}, {v: 100}, {v: 99}, {v: 100}, {v: 100}, {v: 100}, {v: 100}]
      },
    ];

  /* scroll-reveal wrapper for chart section */
  const chartsRef = useRef(null);
  const chartsInView = useInView(chartsRef, { once: true, margin: '-80px' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Heading */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          {user?.role === 'admin' ? 'Global Admin Dashboard' : 'Analytics Dashboard'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {user?.role === 'admin'
            ? 'Monitor global real-time waste segregation statistics across all users.'
            : 'Monitor your personal waste segregation statistics.'}
        </p>
      </motion.div>

      {/* ── Stat cards — staggered fade-up ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {statCards.map((stat, i) => (
          <GlassCard key={i} delay={i * 0.08} tilt={false} className="group relative overflow-hidden h-full flex flex-col justify-between">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="text-gray-500 dark:text-gray-400 font-semibold text-sm tracking-wide">{stat.title}</div>
                <div className={`${stat.colorClass} ${stat.bgClass} p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-3xl font-bold mb-2 text-gray-900 dark:text-white drop-shadow-sm">{stat.displayValue}</div>
              
              <div className={`text-xs font-semibold flex items-center gap-1 ${stat.trendUp ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                <TrendingUp size={14} className={stat.trendUp ? '' : 'rotate-180'} />
                {stat.trend}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* ── Charts — slide-up on scroll ── */}
      <motion.div
        ref={chartsRef}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        initial={{ opacity: 0, y: 50 }}
        animate={chartsInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, type: 'spring', bounce: 0.25 }}
      >
        {/* Weekly Scans Line Chart — spans 2 of 3 columns */}
        <div className="lg:col-span-2">
          <GlassCard delay={0.1} tilt={false}>
            <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Detection Volume Over Time</h3>
            <div className="h-[220px] lg:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.weeklyData}>
                  <defs>
                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={activeTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} vertical={false} />
                  <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                  <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip
                    contentStyle={{ 
                      backgroundColor: activeTheme === 'dark' ? '#081420' : '#ffffff', 
                      border: activeTheme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', 
                      borderRadius: '8px',
                      color: activeTheme === 'dark' ? '#ffffff' : '#000000',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                    itemStyle={{ color: '#22C55E', fontWeight: 'bold' }}
                    cursor={{ stroke: activeTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="scans"
                    stroke="#22C55E"
                    fillOpacity={1}
                    fill="url(#colorScans)"
                    strokeWidth={3}
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationEasing="ease-out"
                    dot={{ r: 4, fill: activeTheme === 'dark' ? '#081420' : '#ffffff', stroke: '#22C55E', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#22C55E', stroke: activeTheme === 'dark' ? '#081420' : '#ffffff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Category Distribution Pie Chart — spans 1 column */}
        <div className="lg:col-span-1">
          <GlassCard delay={0.18} tilt={false}>
            <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Waste Distribution</h3>
            <div className="h-[220px] lg:h-[300px] flex items-center justify-center">
              {stats.categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {stats.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ 
                        backgroundColor: activeTheme === 'dark' ? '#081420' : '#ffffff', 
                        border: activeTheme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', 
                        borderRadius: '8px',
                        color: activeTheme === 'dark' ? '#ffffff' : '#000000'
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: activeTheme === 'dark' ? '#ffffff' : '#000000' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-500">No data available yet.</div>
              )}
            </div>
          </GlassCard>
        </div>
      </motion.div>

    </div>
  );
};

export default Dashboard;
