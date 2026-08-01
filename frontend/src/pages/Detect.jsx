import React, { useState, useRef, useContext } from 'react';
import { Camera, Upload, RefreshCw, Info, AlertTriangle, Zap, Database, Video, Clock, Crosshair, Box, Layers, Gauge, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';
import { AuthContext } from '../context/AuthContext';
import DownloadReportButton from "../components/Report/DownloadReportButton";
import EmailReportButton from "../components/Report/EmailReportButton";
import ActionModal from '../components/ActionModal';

const WASTE_COLORS = {
  "PLASTIC": "bg-pink-500",
  "GLASS": "bg-blue-400",
  "METAL": "bg-gray-400",
  "CARDBOARD": "bg-yellow-600",
  "PAPER": "bg-green-500",
  "TRASH": "bg-red-500",
  "E-WASTE": "bg-purple-500"
};
const getWasteColor = (cls) => WASTE_COLORS[cls?.toUpperCase()] || "bg-primary-green";

const Detect = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const { token, user } = useContext(AuthContext);
  const videoInputRef = useRef(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setErrorMsg(null);
      setResult(null);
      setPreviewImage(null);
      setPreviewVideo(null);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setModalConfig({
        isOpen: true,
        type: 'alert',
        title: 'Camera Error',
        message: 'Could not access camera. Please check permissions.',
        confirmText: 'OK'
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const captureAndPredict = () => {
    if (!videoRef.current || !cameraActive) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL('image/jpeg');
    setPreviewImage(base64Image);
    setOriginalImage(base64Image);
    stopCamera();

    sendPredictionRequest({ image_base64: base64Image });
  };

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (cameraActive) stopCamera();

    setPreviewVideo(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
      setOriginalImage(e.target.result);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('image', file);
    sendPredictionRequest(formData, true);
  };

  const handleFileUpload = (e) => processFile(e.target.files[0]);
  const handleVideoUpload = async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  // Stop webcam if active
  if (cameraActive) stopCamera();

  setErrorMsg(null);
  setResult(null);

  // Optional preview
  const videoURL = URL.createObjectURL(file);
  console.log("Selected Video:", videoURL);

  setPreviewImage(null);
  setPreviewVideo(videoURL);

  const formData = new FormData();
  formData.append("video", file);

  try {
    setIsProcessing(true);

    const headers = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      "http://127.0.0.1:5000/api/detect-video",
      {
        method: "POST",
        headers,
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Video detection failed");
    }

    setResult(data);
    if (data.video) {
      setPreviewVideo(data.video);
    }

  } catch (err) {
    console.error(err);
    setErrorMsg(err.message);
  } finally {
    setIsProcessing(false);
  }
};

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const sendPredictionRequest = async (payload, isFormData = false) => {
    setIsProcessing(true);
    setResult(null);
    setErrorMsg(null);

    try {
      const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('http://127.0.0.1:5000/api/predict', {
        method: 'POST',
        headers,
        body: isFormData ? payload : JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || data.msg || data.message || `Server Error: ${response.status}`);

      setResult(data);
      if (data.processed_image) {
        setPreviewImage(data.processed_image);
        setProcessedImage(data.processed_image);
      }
    } catch (err) {
      console.error('Prediction error:', err);
      setErrorMsg(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearSession = () => {
    setResult(null);
    setPreviewImage(null);
    setPreviewVideo(null);
    setErrorMsg(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Live Detection</h1>
        <p className="text-gray-600 dark:text-gray-400">Upload an image or use your camera to classify waste in real-time.</p>
      </div>

      {/* Two-column layout — centred, wider */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Live Detection Card (camera/preview) ── */}
        <div className="lg:col-span-3 flex flex-col">
          <GlassCard tilt={false} className="flex-1 flex flex-col min-h-[480px] !p-5">
            {/* Viewfinder */}
            <div
              className={`relative flex-1 rounded-xl overflow-hidden border flex items-center justify-center transition-all duration-300 min-h-[340px] ${
                isDragging
                  ? 'bg-green-500/10 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                  : 'bg-gray-100 dark:bg-black/40 border-gray-300 dark:border-white/10'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Live camera feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              />

              {/* Processed / uploaded image preview */}
              {!cameraActive && previewImage && (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-contain bg-gray-100 dark:bg-black/50"
                />
              )}

              {/* Uploaded video preview */}
              {!cameraActive && previewVideo && (
                <video
                  key={previewVideo}
                  src={previewVideo}
                  autoPlay
                  controls
                  loop
                  muted
                  className="absolute inset-0 w-full h-full object-contain bg-gray-100 dark:bg-black/50"
                />
              )}

              {/* Empty state */}
              {!cameraActive && !previewImage && !previewVideo && (
                <div className="text-gray-500 flex flex-col items-center p-8 text-center pointer-events-none select-none">
                  <Camera size={64} className="mb-4 opacity-40 text-gray-500" />
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-400 mb-1">Drag & drop an image here</p>
                  <p className="text-sm">or click <span className="text-primary-green">Upload Image</span> below</p>
                </div>
              )}

              {/* Error overlay */}
              {errorMsg && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-20 text-red-400 bg-red-950/90 p-4 rounded-xl border border-red-500/30 shadow-2xl flex items-center gap-3">
                  <AlertTriangle size={22} className="shrink-0" />
                  <span className="font-medium text-sm">{errorMsg}</span>
                </div>
              )}

              {/* Scanning overlay */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/80 dark:bg-primary-navy/80 backdrop-blur-sm flex flex-col items-center justify-center z-10"
                  >
                    <RefreshCw size={48} className="text-primary-green animate-spin mb-4" />
                    <p className="text-lg font-medium text-primary-green animate-pulse">Analyzing with YOLOv8...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
              {cameraActive ? (
                <>
                  <Button onClick={captureAndPredict} variant="primary" className="w-full sm:w-auto">
                    <Camera size={18} /> Capture &amp; Detect
                  </Button>
                  <Button onClick={stopCamera} variant="outline" className="w-full sm:w-auto">Stop Camera</Button>
                </>
              ) : (
                <Button onClick={startCamera} variant="primary" className="w-full sm:w-auto">
                  <Camera size={18} /> Open Camera
                </Button>
                
              )}

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <input
                type="file"
                accept="video/*"
                ref={videoInputRef}
                onChange={handleVideoUpload}
                className="hidden"
            />
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto">
                <Upload size={18} /> Upload Image
              </Button>
              <Button
                variant="secondary"
                onClick={() => videoInputRef.current?.click()}
                className="w-full sm:w-auto flex items-center justify-center gap-2"
            >
                <Video size={18} /> Upload Video
            </Button>
            </div>
          </GlassCard>
        </div>

        {/* ── Detection Results Card ── */}
        <div className="lg:col-span-2 flex flex-col">
          <GlassCard tilt={false} className="flex-1 flex flex-col min-h-[480px] !p-5">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-gray-900 dark:text-white">
              <Zap size={20} className="text-primary-green" />
              Detection Results
            </h2>

            {result ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col flex-1"
              >
                {/* Prediction cards */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[450px]">
                  {result?.predictions?.map((pred, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border ${pred.borderColor} bg-gray-50 dark:bg-white/5`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Detection #{idx + 1}</div>
                          <div className={`text-2xl font-bold ${pred.color}`}>{pred.category}</div>
                        </div>
                        <span className="bg-white border border-gray-200 dark:border-transparent dark:bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-gray-900 dark:text-white">
                          {pred.confidence}%
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <Info size={11} /> Action
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{pred.disposal}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-200 dark:border-white/10 mt-4">

                  {result.predictions ? (

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">

                      <span>
                        Detected {result.predictions.length} item
                        {result.predictions.length !== 1 ? "s" : ""}
                      </span>

                      <span className="flex items-center gap-1">
                        <RefreshCw size={12}/>
                        {result.time}
                      </span>

                    </div>

                  ) : (

                    <div className="space-y-6">
                      {/* Primary Waste Highlight */}
                      <div className="bg-gradient-to-br from-primary-green/20 to-transparent border border-primary-green/30 p-4 rounded-xl flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                            Primary Waste Detected
                          </span>
                          <span className="text-3xl font-black text-primary-green uppercase tracking-wide drop-shadow-sm">
                            {result.primary || "NONE"}
                          </span>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-primary-green/20 flex items-center justify-center border border-primary-green/20 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                           <Activity size={24} className="text-primary-green" />
                        </div>
                      </div>

                      {/* Stats Grid */}
                      {result.stats && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                              <Crosshair size={14}/> Avg Confidence
                            </div>
                            <div className="font-semibold text-lg">{(result.stats.avg_confidence * 100).toFixed(1)}%</div>
                          </div>
                          
                          <div className="bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                              <Box size={14}/> Unique Objects
                            </div>
                            <div className="font-semibold text-lg">{result.stats.unique_objects}</div>
                          </div>

                          <div className="bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                              <Clock size={14}/> Processing Time
                            </div>
                            <div className="font-semibold text-lg">{result.stats.total_processing_time_sec}s</div>
                          </div>
                          
                          <div className="bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                              <Gauge size={14}/> Average FPS
                            </div>
                            <div className="font-semibold text-lg">{result.stats.effective_fps} fps</div>
                          </div>
                        </div>
                      )}

                      {/* Class Breakdown Progress Bars */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <Layers size={16} /> Class Breakdown
                        </h4>
                        <div className="space-y-3">
                          {Object.entries(result.summary || {}).map(([cls, count]) => {
                            const total = result.stats?.unique_objects || 1;
                            const percentage = Math.round((count / total) * 100);
                            const colorClass = getWasteColor(cls);
                            
                            return (
                              <div key={cls} className="space-y-1">
                                <div className="flex justify-between text-xs font-medium">
                                  <span>{cls}</span>
                                  <span className="text-gray-500">{count} item{count !== 1 ? 's' : ''} ({percentage}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2">
                                  <div
                                    className={`${colorClass} h-2 rounded-full transition-all duration-1000 ease-out`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                  )}

                </div>

                <div className="mt-4 space-y-3">

                  {result.predictions && (
                    <>
                      <DownloadReportButton
                        predictions={result.predictions}
                        originalImage={originalImage}
                        processedImage={processedImage}
                        userName={user?.username}
                      />

                      <EmailReportButton
                        predictions={result.predictions}
                        originalImage={originalImage}
                        processedImage={processedImage}
                        time={result.time}
                      />
                    </>
                  )}

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={clearSession}
                  >
                    Clear Results
                  </Button>

                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 space-y-4 py-8">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/10">
                  <Database size={24} />
                </div>
                <p>Waiting for image input...</p>
              </div>
            )}
          </GlassCard>
        </div>

      </div>

      <ActionModal 
        {...modalConfig}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />
    </div>
  );
};

export default Detect;
