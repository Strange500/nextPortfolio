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
        
        cubeInstance = new wasm.Cube(80, 40);
        cubeInstance.set_face_color(4, "#22c55e"); // Front face green (Tailwind text-green-500)
        cubeInstance.set_face_color(2, "#3b82f6"); // Left face blue (Tailwind text-blue-500)
        
        const myLogo = 
`  XXXX
 X    X
 X    X
  XXXX  `;
        cubeInstance.set_face_logo(0, myLogo);

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
      className="font-mono leading-none whitespace-pre text-muted-foreground"
      dangerouslySetInnerHTML={{ __html: frame }}
    />
  );
}
