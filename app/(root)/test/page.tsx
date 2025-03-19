"use client";

import { useEffect } from "react";
import { Circle, Quadtree } from '@timohausmann/quadtree-ts';

const MAX_OBJECTS = 10;
const MAX_LEVELS = 3;
const MAX_DISTANCE = 60;
const RADIUS = 3;
const COLORS = ["#0F0F0F", "#2D2E2E", "#716969"];



const useCanvasAnimation = () => {


  useEffect(() => {


    const canvasResizeObserver = new ResizeObserver(resampleCanvas);


    function resampleCanvas() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      NUM_POINTS = Math.floor((canvas.width * canvas.height) / 1000);
      // rebuild the quadtree and points array
      quadtree = new Quadtree<Point>({
        width: canvas.width,
        height: canvas.height,
        maxObjects: MAX_OBJECTS,
        maxLevels: MAX_LEVELS,
      });
      points.length = 0;
      for (let i = 0; i < NUM_POINTS; i++) {
        const point = genRandomPoint(canvas.width, canvas.height);
        quadtree.insert(point);
        points.push(point);
      }
    }


    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    canvas.width = canvas.clientWidth + 100;
    canvas.height = canvas.clientHeight + 100;
    //const NUM_POINTS = 1500;
    // I want a desnity of 1 point per 100 pixels
    let NUM_POINTS = Math.floor((canvas.width * canvas.height) / 1000);


    canvasResizeObserver.observe(canvas);

    let quadtree = new Quadtree<Point>({
      width: canvas.width + 100,
      height: canvas.height + 100,
      maxObjects: MAX_OBJECTS,
      maxLevels: MAX_LEVELS,
    });

    class Point extends Circle {
      deg: number;
      color: string;

      constructor(x: number, y: number, deg: number, color:string) {
        super({ x, y, r: RADIUS });
        this.deg = deg;
        this.color = color;
      }

      update(canvasWidth: number, canvasHeight: number) {
        // Modify movement speed and add variability to direction
        const speed = 0.3; // Reduced speed
        this.x += Math.cos(this.deg) * speed;
        this.y += Math.sin(this.deg) * speed;

        // Bounce off the walls by reversing the degree and adding some randomness
        if (this.x < 0 || this.x > canvasWidth) {
          this.deg = Math.PI - this.deg + (Math.random() * 0.25 - 0.125); // Small random change
        }
        if (this.y < 0 || this.y > canvasHeight) {
          this.deg = -this.deg + (Math.random() * 0.25 - 0.125); // Small random change
        }

      }

      render(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(this.x, this.y, RADIUS, 0, 2 * Math.PI);
        context.fillStyle = this.color;
        context.fill();
      }

      distanceTo(other: Point): number {
        return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
      }
    }

    function genRandomPoint(maxWidth: number, maxHeight: number): Point {
      const x = Math.random() * maxWidth;
      const y = Math.random() * maxHeight;
      const deg = Math.random() * 2 * Math.PI; // Use radians for degrees
      return new Point(x, y, deg, COLORS[Math.floor(Math.random() * COLORS.length)]);
    }

    // Generate a collection of points
    const points = Array.from({ length: NUM_POINTS }, () => {
      const point = genRandomPoint(canvas.width, canvas.height);
      quadtree.insert(point);
      return point;
    });

    const handleMouseMove = (event: MouseEvent) => {
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        setMousePos({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    const mousePoint: Point = new Point(-100, -100, 0, "red");
    function setMousePos(param: {x: number; y: number}) {
      mousePoint.x = param.x;
      mousePoint.y = param.y;
    }


    const times: number[] = []
    let fps: number = 0;

    const interval = setInterval(() => {
      console.log(fps);
      if (fps < 60) {
        for (let i = 0; i < 10; i++) {
          const p=points.pop();
          if(p){
            quadtree.remove(p, true);
          }
        }
      } else {
        for (let i = 0; i < 10; i++) {
          const p=genRandomPoint(canvas.width, canvas.height);
          points.push(p);
          quadtree.insert(p);
        }
      }
    }, 1000);

    let stop = false;

    const animate = () => {
      if (stop) {
        return;
      }
      const now = performance.now();
      while (times.length > 0 && times[0] <= now - 1000) {
        times.shift();
      }
      times.push(now);
      fps = times.length;
      
      
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Update and render points
      points.forEach(point => {
        point.update(canvas.width, canvas.height);
        point.render(context);
        quadtree.remove(point, true);
        quadtree.insert(point);
      });
      quadtree.remove(points[0]);
      quadtree.insert(points[0]);

      // Draw connections between close points
      const drawnConnections = new Set(); // Set to keep track of drawn connections
      quadtree.insert(mousePoint);
      points.forEach(point => {
        const neighbors = quadtree.retrieve(new Circle({
          x: point.x,
          y: point.y,
          r: MAX_DISTANCE,
        }));
        neighbors.forEach(neighbor => {
          if (neighbor !== point && point.distanceTo(neighbor) <= MAX_DISTANCE) {
            // Create a unique identifier for the connection
            const connectionId = `${Math.min(point.x, neighbor.x)}-${Math.max(point.y, neighbor.y)}`;

            if (!drawnConnections.has(connectionId)) {
              // Only draw if this connection hasn't been drawn before
              context.beginPath();
              context.moveTo(point.x, point.y);
              context.lineTo(neighbor.x, neighbor.y);
              context.strokeStyle = neighbor.color;
              context.stroke();
              // Add the connection to the set
              drawnConnections.add(connectionId);
            }
          }
        });
        quadtree.remove(point, true);
        drawnConnections.clear();
      });


      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
      stop = true;
    };
  });


};

const BG = () => {
  useCanvasAnimation();
  return (
    <canvas id={'canvas'} className="w-[110vw] h-[110vh] z-[-1] fixed top-0 right-0"></canvas>
  );
};

export default BG;