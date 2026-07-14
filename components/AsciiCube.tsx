"use client";

import { useEffect, useState, useRef } from "react";

export default function AsciiCube() {
  const [frame, setFrame] = useState<string>("");
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    let cubeInstance: any = null;

    async function initWasm() {
      try {
        const wasm = await import("ascii-cube");
        await wasm.default(); // Initialize the Wasm module memory
        if (!active) return;
        
        cubeInstance = new wasm.Cube(120, 60);
        cubeInstance.set_zoom(1500);
        const logos = [
// Nix
` *   * 
  * *  
   *   
  NIX  `,
// Java
`  ( (  
   ) ) 
  ===  
 JAVA  `,
// Docker
` ## ## 
 ##### 
 ===== 
DOCKER `,
// Rust
`  ***  
 *R  * 
 *UST* 
  ***  `,
// React
`  \\ /  
 - R - 
  / \\  
 REACT `,
// Git
`   *   
  / \\  
 *GIT* 
   *   `,
// Angular
`   A   
  / \\  
 /___\\ 
ANGULAR`
        ];
        
        // Initial setup: place some logos on different faces
        cubeInstance.set_face_logo(0, logos[0]);
        cubeInstance.set_face_logo(4, logos[1]);
        cubeInstance.set_face_logo(2, logos[2]);

        // Cycle logos every 2 seconds, but only on hidden faces!
        let currentLogoIdx = 0;
        let currentFaceIdx = 0;
        const facesToCycle = [0, 4, 2, 3, 1, 5]; // Cycle through all faces

        const cycleInterval = setInterval(() => {
          if (!active || !cubeInstance) return;
          
          // Try to find a face that is currently hidden
          for (let i = 0; i < facesToCycle.length; i++) {
            const face = facesToCycle[currentFaceIdx];
            
            // Check if it's hidden (or fallback if the method isn't ready)
            const isVisible = typeof cubeInstance.is_face_visible === 'function' 
              ? cubeInstance.is_face_visible(face) 
              : false;
              
            if (!isVisible) {
              currentLogoIdx = (currentLogoIdx + 1) % logos.length;
              cubeInstance.set_face_logo(face, logos[currentLogoIdx]);
              currentFaceIdx = (currentFaceIdx + 1) % facesToCycle.length;
              break; // Only swap one logo at a time
            }
            
            currentFaceIdx = (currentFaceIdx + 1) % facesToCycle.length;
          }
        }, 2000);

        const animate = () => {
          if (!active) return;
          if (cubeInstance) {
            setFrame(cubeInstance.next_frame());
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

  return (
    <pre 
      className="font-mono text-[8px] leading-none whitespace-pre text-muted-foreground"
      dangerouslySetInnerHTML={{ __html: frame }}
    />
  );
}
