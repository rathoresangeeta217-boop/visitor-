import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2 } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startVideo = useCallback(() => {
    setError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera API not supported in this browser.');
      return;
    }
    
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        setStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.warn('Camera access denied or unavailable:', err.message);
        setError(err.message || 'Could not start video source. Please ensure camera permissions are granted.');
      });
  }, []);

  useEffect(() => {
    startVideo();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startVideo]);

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        // Optimize image size to prevent local storage quota limits
        const MAX_WIDTH = 640;
        const scale = Math.min(MAX_WIDTH / video.videoWidth, 1);
        
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Compress to JPEG with 60% quality
        const data = canvas.toDataURL('image/jpeg', 0.6);
        setPhotoSrc(data);
        setHasPhoto(true);
        onCapture(data);
      }
    }
  };

  const retakePhoto = () => {
    setHasPhoto(false);
    setPhotoSrc(null);
    onCapture('');
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto overflow-hidden bg-slate-100 rounded-2xl border-2 border-slate-200">
      <div className="relative w-full aspect-[4/3] bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
        {error ? (
          <div className="text-red-400 text-sm flex flex-col items-center gap-2">
            <Camera className="w-8 h-8 opacity-50 mb-2" />
            <p className="font-medium">Camera Error</p>
            <p className="opacity-80">{error}</p>
            <button 
              onClick={startVideo}
              className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Retry Camera
            </button>
          </div>
        ) : !hasPhoto ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover absolute inset-0"
          />
        ) : (
          <img src={photoSrc!} alt="Captured" className="w-full h-full object-cover absolute inset-0" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="p-4 w-full flex justify-center bg-white border-t border-slate-200">
        {!hasPhoto ? (
          <button
            onClick={takePhoto}
            disabled={!!error}
            type="button"
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${
              error 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Camera className="w-5 h-5" />
            <span>Capture Photo</span>
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-emerald-600 font-medium px-4 py-2 bg-emerald-50 rounded-full">
              <CheckCircle2 className="w-5 h-5" />
              <span>Captured</span>
            </div>
            <button
              onClick={retakePhoto}
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retake</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
