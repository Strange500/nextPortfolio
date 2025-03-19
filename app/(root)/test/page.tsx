"use client";

import { useEffect } from "react";
import { Circle, Quadtree } from '@timohausmann/quadtree-ts';

const MAX_OBJECTS = 5;
const MAX_LEVELS = 10;
const NUM_POINTS = 1500;
const MAX_DISTANCE = 60;
const RADIUS = 3;



const useCanvasAnimation = () => {


  useEffect(() => {

    const mousePos = {
      x: 0,
      y: 0,
    }
    function setMousePos(param: {x: number; y: number}) {
      mousePos.x = param.x;
      mousePos.y = param.y;
    }
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const quadtree = new Quadtree<Point>({
      width: canvas.width,
      height: canvas.height,
      maxObjects: MAX_OBJECTS,
      maxLevels: MAX_LEVELS,
    });

    class Point extends Circle {
      deg: number;

      constructor(x: number, y: number, deg: number) {
        super({ x, y, r: RADIUS });
        this.deg = deg;
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
        context.fillStyle = "black";
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
      return new Point(x, y, deg);
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

    const point1 = points.toSpliced(0, NUM_POINTS / 2);
    const point2 = points.toSpliced(NUM_POINTS / 2, NUM_POINTS);

    let pointls = point1;

    const animate = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Update and render points
      pointls.forEach(point => {
        point.update(canvas.width, canvas.height);
        point.render(context);

        quadtree.remove(point, true);
        quadtree.insert(point);
      });

      quadtree.remove(points[0]);
      quadtree.insert(points[0]);
      // Draw connections between close points
      pointls.forEach(point => {
        const neighbors = quadtree.retrieve(new Circle({
          x: point.x,
          y: point.y,
          r: MAX_DISTANCE,
        }));

        neighbors.forEach(neighbor => {
          if (neighbor !== point && point.distanceTo(neighbor) <= MAX_DISTANCE) {
            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(neighbor.x, neighbor.y);
            context.strokeStyle = "black";
            context.stroke();
          }
        });

        pointls = pointls === point1 ? point2 : point1;


      });
      quadtree.retrieve(new Circle({
        x:  mousePos.x,
        y: mousePos.y,
        r: MAX_DISTANCE,
      })).forEach(point => {
        if (point.distanceTo(new Point(mousePos.x, mousePos.y, 0)) < MAX_DISTANCE * 2) {
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(mousePos.x, mousePos.y);
          context.strokeStyle = "red";
          context.stroke();
        }
      })




      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      // Optional cleanup logic if needed
    };
  });
};

const BG = () => {
  useCanvasAnimation();
  return (
    <canvas id={'canvas'} className="w-screen h-screen z-[-1] absolute top-0 right-0"></canvas>
  );
};

export default BG;