
import React, { useState, useRef, useEffect } from 'react';

interface ImageEditorProps {
  image: string;
  onComplete: (editedImage: string) => void;
  onCancel: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ image, onComplete, onCancel }) => {
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [zoom, setZoom] = useState(1);
  const [isGrayscale, setIsGrayscale] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  
  useEffect(() => {
    const img = new Image();
    img.src = image;
    img.onload = () => {
      imageRef.current = img;
      renderCanvas();
    };
  }, [image]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Determine dimensions based on rotation
    const isVertical = rotation % 180 !== 0;
    const width = isVertical ? img.height : img.width;
    const height = isVertical ? img.width : img.height;

    // Set max preview size to keep UI responsive
    const maxWidth = window.innerWidth * 0.8;
    const maxHeight = window.innerHeight * 0.5; // Reduced height to fit UI controls
    let baseScale = Math.min(maxWidth / width, maxHeight / height, 1);
    
    canvas.width = width * baseScale;
    canvas.height = height * baseScale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) ${isGrayscale ? 'grayscale(100%)' : ''}`;
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    // Apply zoom on top of base scale
    ctx.scale(zoom, zoom);
    ctx.drawImage(img, -img.width * baseScale / 2, -img.height * baseScale / 2, img.width * baseScale, img.height * baseScale);
    ctx.restore();
  };

  useEffect(() => {
    renderCanvas();
  }, [rotation, brightness, contrast, isGrayscale, zoom]);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

const handleComplete = async () => {
  const canvas = document.createElement("canvas");
  const img = imageRef.current;
  if (!img) return;

  const isVertical = rotation % 180 !== 0;
  canvas.width = isVertical ? img.height : img.width;
  canvas.height = isVertical ? img.width : img.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) ${
    isGrayscale ? "grayscale(100%)" : ""
  }`;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(zoom, zoom);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  ctx.restore();

  // ✅ Convert canvas to Base64
  const base64Image = canvas
    .toDataURL("image/jpeg", 0.85)
    .split(",")[1];

  try {
    const res = await fetch("http://localhost:9000/api/detect-disease", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: base64Image }),
    });

    const data = await res.json();
    console.log("🌱 Disease Result:", data);

    // send edited image back to app
    onComplete(canvas.toDataURL("image/jpeg", 0.85));
  } catch (err) {
    console.error("❌ Detection failed:", err);
  }
};

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center text-white">
        <h3 className="text-xl font-bold">Refine Specimen</h3>
        <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-grow flex items-center justify-center w-full min-h-[300px] overflow-hidden my-4">
        <div className="relative group">
          <canvas ref={canvasRef} className="max-w-full max-h-full shadow-2xl rounded-lg border border-zinc-800" />
          {zoom !== 1 && (
            <div className="absolute bottom-4 right-4 bg-emerald-600/80 text-white text-[10px] px-2 py-1 rounded font-bold backdrop-blur-sm pointer-events-none uppercase tracking-tighter">
              {Math.round(zoom * 100)}% Zoom
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-md bg-zinc-900 rounded-[2.5rem] p-8 mb-4 space-y-6 shadow-2xl border border-zinc-800">
        <div className="flex justify-between items-center gap-4">
          <button 
            onClick={handleRotate}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-2xl flex items-center justify-center gap-2 transition active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Rotate
          </button>
          <button 
            onClick={() => setIsGrayscale(!isGrayscale)}
            className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 transition active:scale-95 ${isGrayscale ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            B&W
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Zoom Level</span>
              <button onClick={handleResetZoom} className="text-[10px] font-bold text-emerald-500 uppercase hover:text-emerald-400 transition">Reset</button>
            </div>
            <input 
              type="range" min="1" max="3" step="0.1" value={zoom} 
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Brightness</span>
              <input 
                type="range" min="50" max="150" value={brightness} 
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-400"
              />
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Contrast</span>
              <input 
                type="range" min="50" max="150" value={contrast} 
                onChange={(e) => setContrast(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-400"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleComplete}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black shadow-xl shadow-emerald-900/20 transition transform active:scale-[0.98] uppercase tracking-wider text-sm"
        >
          Diagnose Selected Area
        </button>
      </div>
    </div>
  );
};
