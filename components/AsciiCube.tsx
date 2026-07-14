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
      
      const chars = ['█', '▓', '▒', '░'];
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
      resolve(asciiArt);
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}

export default function AsciiCube() {
  const [frame, setFrame] = useState<string>("");
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    let cubeInstance: any = null;
    let cycleInterval: NodeJS.Timeout | undefined;

    async function initWasm() {
      try {
        const wasm = await import("ascii-cube");
        await wasm.default(); // Initialize the Wasm module memory
        if (!active) return;
        
        cubeInstance = new wasm.Cube(120, 60);
        cubeInstance.set_zoom(1500);

        const loadedLogos: string[] = [];
        
        // Load ALL SVGs/logos from the technologies data
        for (const tech of technologies) {
          try {
            const ascii = await svgToAscii(tech.svg);
            loadedLogos.push(ascii);
          } catch (e) {
            console.error(`Failed to load SVG for ${tech.name}`, e);
          }
        }
        
        if (!active || loadedLogos.length === 0) return;

        // Initial setup: place some logos on different faces
        cubeInstance.set_face_logo(0, loadedLogos[0]);
        cubeInstance.set_face_logo(4, loadedLogos[1 % loadedLogos.length]);
        cubeInstance.set_face_logo(2, loadedLogos[2 % loadedLogos.length]);

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
              cubeInstance.set_face_logo(face, loadedLogos[currentLogoIdx]);
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
          
          if (cubeInstance) {
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

  return (
    <pre 
      className="font-mono text-[8px] font-bold leading-none whitespace-pre text-foreground"
      dangerouslySetInnerHTML={{ __html: frame }}
    />
  );
}
