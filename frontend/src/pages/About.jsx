import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Server, Code, Eye, BrainCircuit } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">About Smart Waste AI</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Pioneering sustainable waste management through artificial intelligence.</p>
      </div>

      <div className="space-y-12">
        {/* Problem & Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <GlassCard delay={0.1}>
            <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">The Problem</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Improper waste segregation is a global crisis. Every year, millions of tons of recyclable materials end up in landfills or oceans because they were not properly identified and separated at the source. This leads to severe environmental degradation and wasted resources.
            </p>
          </GlassCard>
          
          <GlassCard delay={0.2} className="border-primary-green/30">
            <h2 className="text-2xl font-bold mb-4 text-primary-green">Our Solution</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Smart Waste AI leverages advanced computer vision to automate the classification of waste into 6 distinct categories. By providing real-time, accurate segregation guidance, we empower individuals and organizations to dispose of waste responsibly and increase recycling rates.
            </p>
          </GlassCard>
        </div>

        {/* Technology Stack */}
        <div>
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Powered By Modern Tech</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassCard delay={0.3} className="flex flex-col items-center text-center">
              <div className="text-primary-green mb-4"><BrainCircuit size={40} /></div>
              <h3 className="font-bold mb-2 text-gray-900 dark:text-white">YOLOv8</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">State-of-the-art real-time object detection model for unparalleled accuracy.</p>
            </GlassCard>

            <GlassCard delay={0.4} className="flex flex-col items-center text-center">
              <div className="text-blue-600 dark:text-blue-400 mb-4"><Eye size={40} /></div>
              <h3 className="font-bold mb-2 text-gray-900 dark:text-white">OpenCV</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">High-performance image processing and computer vision algorithms.</p>
            </GlassCard>

            <GlassCard delay={0.5} className="flex flex-col items-center text-center">
              <div className="text-gray-600 dark:text-gray-300 mb-4"><Server size={40} /></div>
              <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Flask</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Lightweight and robust Python backend to serve the machine learning model.</p>
            </GlassCard>

            <GlassCard delay={0.6} className="flex flex-col items-center text-center">
              <div className="text-blue-500 mb-4"><Code size={40} /></div>
              <h3 className="font-bold mb-2 text-gray-900 dark:text-white">React & Tailwind</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">A premium, responsive, and interactive frontend architecture.</p>
            </GlassCard>
          </div>
        </div>

        {/* Future Scope */}
        <GlassCard delay={0.7} className="mt-12 bg-primary-green/10 dark:bg-primary-green/5 border-primary-green/20">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <Cpu className="text-primary-green" />
            Future Scope
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
            <li>Integration with automated hardware sorting bins (IoT).</li>
            <li>Gamification features to reward users for proper recycling.</li>
            <li>Expansion of detectable categories including E-waste and hazardous materials.</li>
            <li>Mobile applications for iOS and Android using React Native.</li>
          </ul>
        </GlassCard>
      </div>
    </div>
  );
};

export default About;
