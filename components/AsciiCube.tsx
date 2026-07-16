"use client";

import { useEffect, useState, useRef } from "react";
import { technologies } from '@/data/technologies';

async function svgToAscii(imageUrl: string, width = 100, height = 100) {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject("No 2d context");
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      let asciiArt = "";
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          const alpha = data[index + 3];

          if (alpha < 128) {
            asciiArt += " ";
          } else {
            // Guarantee no holes for opaque pixels, use dense blocks for better silhouettes
            const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
            asciiArt += brightness < 128 ? "█" : "▒";
          }
        }
        asciiArt += "\n";
      }
      resolve(asciiArt.trimEnd());
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}

const BASELINE_SPEED = { da: 0.0075, db: 0.005, dc: 0.01 };

export default function AsciiCube() {
  const [frame, setFrame] = useState<string>("");
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
    let active = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cubeInstance: any = null;
    let cycleInterval: NodeJS.Timeout | undefined;
    const faceSources: (string | HTMLVideoElement)[] = new Array(6).fill("");
    
    // Canvas for video processing
    const videoCanvas = document.createElement('canvas');
    videoCanvas.width = 100;
    videoCanvas.height = 100;
    const videoCtx = videoCanvas.getContext('2d', { willReadFrequently: true });


    async function initWasm() {
      try {
        const wasm = await import("ascii-cube");
        await wasm.default(); // Initialize the Wasm module memory
        if (!active) return;
        
        cubeInstance = new wasm.Cube(120, 60);
        cubeRef.current = cubeInstance;
        cubeInstance.set_zoom(1500);

        const loadedLogos: (string | HTMLVideoElement)[] = [];
        
        // Load ALL SVGs/logos from the technologies data
        for (const tech of technologies) {
          try {
            const ascii = await svgToAscii(tech.svg);
            loadedLogos.push(ascii);
          } catch (e) {
            console.error(`Failed to load SVG for ${tech.name}`, e);
          }
        }

        // Add the new video logo
        const video = document.createElement("video");
        video.src = "/logo/HVjKOGP.mp4";
        video.crossOrigin = "Anonymous";
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.play().catch(e => console.error("Video play failed", e));
        
        loadedLogos.push(video);
        
        // Shuffle the logos so the video appears randomly
        loadedLogos.sort(() => Math.random() - 0.5);
        
        if (!active || loadedLogos.length === 0) return;

        // Initial setup: place some logos on different faces
        const initialFaces = [0, 4, 2];
        for (let i = 0; i < initialFaces.length; i++) {
          const face = initialFaces[i];
          const logo = loadedLogos[i % loadedLogos.length];
          faceSources[face] = logo;
          if (typeof logo === "string") {
            cubeInstance.set_face_logo(face, logo);
          }
        }

        // Cycle logos every 2 seconds, but only on hidden faces!
        let currentLogoIdx = 3 % loadedLogos.length;
        let currentFaceIdx = 0;
        const facesToCycle = [0, 4, 2, 3, 1, 5]; // Cycle through all faces

        cycleInterval = setInterval(() => {
          if (!active || !cubeInstance) return;
          
          // Try to find a face that is currently hidden
          for (let i = 0; i < facesToCycle.length; i++) {
            const face = facesToCycle[currentFaceIdx];
            
            // Check if it's hidden (or fallback if the method isn't ready)
            const isVisible = typeof cubeInstance.is_face_visible === 'function' 
              ? cubeInstance.is_face_visible(face) 
              : false;
              
            if (!isVisible) {
              const newLogo = loadedLogos[currentLogoIdx];
              faceSources[face] = newLogo;
              if (typeof newLogo === "string") {
                cubeInstance.set_face_logo(face, newLogo);
              }
              currentLogoIdx = (currentLogoIdx + 1) % loadedLogos.length;
              currentFaceIdx = (currentFaceIdx + 1) % facesToCycle.length;
              break; // Only swap one logo at a time
            }
            
            currentFaceIdx = (currentFaceIdx + 1) % facesToCycle.length;
          }
        }, 2000);

        let lastTime = 0;
        const animate = (time: number) => {
          if (!active) return;
          
          requestRef.current = requestAnimationFrame(animate);
          
          // Cap at ~60 FPS (16ms per frame) to prevent acceleration bursts after tab restore
          // and to normalize speed on high refresh rate (144Hz+) monitors
          if (time - lastTime < 16) return;
          lastTime = time;

          // Process video frames for any face currently showing the video
          let hasVideoFace = false;
          for (let i = 0; i < 6; i++) {
            if (faceSources[i] instanceof HTMLVideoElement) {
              hasVideoFace = true;
              break;
            }
          }

          if (hasVideoFace && videoCtx && video.readyState >= 2) {
            videoCtx.drawImage(video, 0, 0, 100, 100);
            const imageData = videoCtx.getImageData(0, 0, 100, 100).data;
            let asciiArt = "";
            for (let y = 0; y < 100; y++) {
              for (let x = 0; x < 100; x++) {
                const index = (y * 100 + x) * 4;
                const r = imageData[index];
                const g = imageData[index + 1];
                const b = imageData[index + 2];
                const alpha = imageData[index + 3];

                if (alpha < 128) {
                  asciiArt += " ";
                } else {
                  const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
                  asciiArt += brightness < 128 ? "█" : "▒";
                }
              }
              asciiArt += "\n";
            }
            asciiArt = asciiArt.trimEnd();
            
            for (let i = 0; i < 6; i++) {
              if (faceSources[i] === video) {
                cubeInstance.set_face_logo(i, asciiArt);
              }
            }
          }
          
          if (cubeInstance) {
            // Apply friction towards baseline speed
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

            const rawFrame = cubeInstance.next_frame();
            // The WASM hardcodes default faces to white inline styles. Strip it so Tailwind dark/light mode works!
            setFrame(rawFrame.replaceAll('style="color:#ffffff"', ''));
          }
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
    console.log("Pointer Down!");
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
    
    // Modify rotation speed based on drag distance
    rotationSpeed.current.da += deltaY * 0.001; 
    rotationSpeed.current.db -= deltaX * 0.001; // Cache bust: using new WASM with Quaternions!
    
    console.log("Dragging! New speeds:", rotationSpeed.current.da, rotationSpeed.current.db);
    
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    console.log("Pointer Up!");
    isDragging.current = false;
    if (e.target instanceof Element) {
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <pre 
      className="relative z-20 font-mono text-[8px] font-bold leading-none whitespace-pre text-foreground cursor-grab active:cursor-grabbing select-none"
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      dangerouslySetInnerHTML={{ __html: frame }}
    />
  );
}
