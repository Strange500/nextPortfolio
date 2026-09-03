"use client";

import { useEffect, useRef } from "react";
import { technologies } from '@/data/technologies';

async function svgToAscii(imageUrl: string, width = 50, height = 50) {
  return new Promise<{ characters: Uint8Array, colors: Uint32Array }>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject("No 2d context"); return; }
      
      ctx.drawImage(img, 0, 0, width, height);
      const data = ctx.getImageData(0, 0, width, height).data;
      
      const characters = new Uint8Array(width * height);
      const colors = new Uint32Array(width * height);
      let idx = 0;
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          const alpha = data[index + 3];

          if (alpha < 128) {
            characters[idx] = 32; // ' '
            colors[idx] = 0xffffff;
          } else {
            const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
            characters[idx] = brightness < 128 ? 255 : 254; // █ or ▒
            colors[idx] = (r << 16) | (g << 8) | b;
          }
          idx++;
        }
      }
      resolve({ characters, colors });
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}

const BASELINE_SPEED = { da: 0.0075, db: 0.005, dc: 0.01 };

export default function AsciiCube() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  
  // Interaction state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cubeRef = useRef<any>(null);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const rotationSpeed = useRef({ ...BASELINE_SPEED });

  useEffect(() => {
    const handleGlobalUp = () => {
      isDragging.current = false;
    };
    window.addEventListener('pointerup', handleGlobalUp);
    window.addEventListener('pointercancel', handleGlobalUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalUp);
      window.removeEventListener('pointercancel', handleGlobalUp);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    let active = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cubeInstance: any = null;
    let cycleInterval: NodeJS.Timeout | undefined;
    type LogoData = { characters: Uint8Array, colors: Uint32Array };
    const faceSources: (string | HTMLVideoElement | LogoData)[] = new Array(6).fill("");
    
    const videoCanvas = document.createElement('canvas');
    videoCanvas.width = 50;
    videoCanvas.height = 50;
    const videoCtx = videoCanvas.getContext('2d', { willReadFrequently: true });

    async function initWasm() {
      try {
        const wasm = await import("ascii-cube");
        const wasmMem = await wasm.default(); // Initialize the Wasm module memory
        const wasmMemory = wasmMem.memory;
        if (!active) return;
        
        cubeInstance = new wasm.Cube(120, 60);
        cubeRef.current = cubeInstance;
        cubeInstance.set_zoom(1500);

        const loadedLogos: (string | HTMLVideoElement | LogoData)[] = [];
        
        for (const tech of technologies) {
          try {
            const logoData = await svgToAscii(tech.svg, 50, 50);
            loadedLogos.push(logoData);
          } catch (e) {
            console.error(`Failed to load SVG for ${tech.name}`, e);
          }
        }

        const video = document.createElement("video");
        video.src = "/cube.mp4";
        video.crossOrigin = "anonymous";
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.play().catch(e => console.error("Video play failed", e));
        
        loadedLogos.push(video);
        loadedLogos.sort(() => Math.random() - 0.5);
        
        if (!active || loadedLogos.length === 0) return;

        const initialFaces = [0, 4, 2];
        for (let i = 0; i < initialFaces.length; i++) {
          const face = initialFaces[i];
          const logo = loadedLogos[i % loadedLogos.length];
          faceSources[face] = logo;
          if (logo && !(logo instanceof HTMLVideoElement) && typeof logo !== "string") {
            cubeInstance.update_face_fast(face, logo.characters, logo.colors);
          }
        }

        let currentLogoIdx = 3 % loadedLogos.length;
        let currentFaceIdx = 0;
        const facesToCycle = [0, 4, 2, 3, 1, 5];

        cycleInterval = setInterval(() => {
          if (!active || !cubeInstance) return;
          
          for (let i = 0; i < facesToCycle.length; i++) {
            const face = facesToCycle[currentFaceIdx];
            const isVisible = cubeInstance.is_face_visible(face);
              
            if (!isVisible) {
              let newLogoIdx = currentLogoIdx;
              let newLogo = loadedLogos[newLogoIdx];
              let attempts = 0;
              while (faceSources.includes(newLogo) && attempts < loadedLogos.length) {
                newLogoIdx = (newLogoIdx + 1) % loadedLogos.length;
                newLogo = loadedLogos[newLogoIdx];
                attempts++;
              }
              currentLogoIdx = newLogoIdx;

              faceSources[face] = newLogo;
              if (newLogo && !(newLogo instanceof HTMLVideoElement) && typeof newLogo !== "string") {
                cubeInstance.update_face_fast(face, newLogo.characters, newLogo.colors);
              }
              currentLogoIdx = (currentLogoIdx + 1) % loadedLogos.length;
              currentFaceIdx = (currentFaceIdx + 1) % facesToCycle.length;
              break;
            }
            
            currentFaceIdx = (currentFaceIdx + 1) % facesToCycle.length;
          }
        }, 2000);

        let lastTime = 0;
        const ctx = canvasRef.current!.getContext('2d', { alpha: true });
        if (!ctx) return;
        
        canvasRef.current!.width = 120 * 8;
        canvasRef.current!.height = 60 * 16;
        ctx.font = "bold 16px monospace";
        ctx.textBaseline = "top";

        const animate = (time: number) => {
          if (!active) return;
          if (time - lastTime >= 16) {
            lastTime = time;

            let hasVideoFace = false;
            for (let i = 0; i < 6; i++) {
              if (faceSources[i] instanceof HTMLVideoElement) {
                hasVideoFace = true; break;
              }
            }

            if (hasVideoFace && videoCtx && video.readyState >= 2) {
              videoCtx.drawImage(video, 0, 0, 50, 50);
              const imageData = videoCtx.getImageData(0, 0, 50, 50).data;
              const chars = new Uint8Array(2500);
              const colors = new Uint32Array(2500);
              let idx = 0;
              for (let y = 0; y < 50; y++) {
                for (let x = 0; x < 50; x++) {
                  const i4 = (y * 50 + x) * 4;
                  const r = imageData[i4];
                  const g = imageData[i4 + 1];
                  const b = imageData[i4 + 2];
                  const alpha = imageData[i4 + 3];

                  if (alpha < 128) {
                    chars[idx] = 32;
                    colors[idx] = 0xffffff;
                  } else {
                    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
                    chars[idx] = brightness < 128 ? 255 : 254;
                    colors[idx] = (r << 16) | (g << 8) | b;
                  }
                  idx++;
                }
              }
              
              for (let i = 0; i < 6; i++) {
                if (faceSources[i] === video) {
                  cubeInstance.update_face_fast(i, chars, colors);
                }
              }
            }
            
            if (cubeInstance) {
              if (!isDragging.current) {
                 rotationSpeed.current.da += (BASELINE_SPEED.da - rotationSpeed.current.da) * 0.05;
                 rotationSpeed.current.db += (BASELINE_SPEED.db - rotationSpeed.current.db) * 0.05;
                 rotationSpeed.current.dc += (BASELINE_SPEED.dc - rotationSpeed.current.dc) * 0.05;
              }

              cubeInstance.set_rotation_speed(
                 rotationSpeed.current.da,
                 rotationSpeed.current.db,
                 rotationSpeed.current.dc
              );

              cubeInstance.next_frame();
              
              const charsPtr = cubeInstance.chars_ptr();
              const colorsPtr = cubeInstance.colors_ptr();
              
              const width = 120;
              const height = 60;
              
              const charBuffer = new Uint8Array(wasmMemory.buffer, charsPtr, width * height);
              const colorBuffer = new Uint32Array(wasmMemory.buffer, colorsPtr, width * height);
              
              ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
              
              const isDark = document.documentElement.classList.contains('dark');
              const defaultFg = isDark ? "#ffffff" : "#0f172a";
              
              for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                  const idx = y * width + x;
                  const cCode = charBuffer[idx];
                  if (cCode === 32) continue; // Space
                  
                  const c = cCode === 255 ? '█' : (cCode === 254 ? '▒' : String.fromCharCode(cCode));
                  const hex = colorBuffer[idx];
                  let colorStr = defaultFg;
                  
                  if (hex !== 0x123456) {
                      colorStr = "#" + hex.toString(16).padStart(6, '0');
                  }
                  
                  ctx.fillStyle = colorStr;
                  ctx.fillText(c, x * 8, y * 16);
                }
              }
            }
          }
          requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
      } catch (err) {
        console.error("Failed to load Wasm cube:", err);
      }
    }

    initWasm();

    return () => {
      active = false;
      clearInterval(cycleInterval);
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
      if (cubeInstance && typeof cubeInstance.free === "function") {
        cubeInstance.free();
      }
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
    if (e.target instanceof Element) {
      e.target.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;
    
    rotationSpeed.current.da += deltaY * 0.001; 
    rotationSpeed.current.db -= deltaX * 0.001; 
    
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    if (e.target instanceof Element) {
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <canvas 
      ref={canvasRef}
      className="relative z-20 cursor-grab active:cursor-grabbing select-none w-[960px] h-auto max-w-full"
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
}
