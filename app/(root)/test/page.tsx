"use client";

import { useEffect, useRef } from "react";
import { Circle, Quadtree, Rectangle } from '@timohausmann/quadtree-ts';

const MAX_OBJECTS = 5;
const MAX_LEVELS = 10;
const NUM_POINTS = 500;
const MAX_DISTANCE = 100;
const RADIUS = 1;

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

const useCanvasAnimation = () => {
  useEffect(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Initialize Quadtree
    const quadtree = new Quadtree<Point>({
      width: canvas.width,
      height: canvas.height,
      maxObjects: MAX_OBJECTS,
      maxLevels: MAX_LEVELS,
    });

    // Generate a collection of points
    const points = Array.from({ length: NUM_POINTS }, () => {
      const point = genRandomPoint(canvas.width, canvas.height);
      quadtree.insert(point);
      return point;
    });

    canvas.addEventListener('mousemove', (event) => {
      const x = event.clientX;
      const y = event.clientY;
      quadtree.retrieve(new Rectangle({
        x,
        y,
        width: 1,
        height: 1,
      })).forEach(point => {
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(x, y);
          context.strokeStyle = "black";
          context.stroke();

      })
    });

    const animate = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Update and render points
      points.forEach(point => {
        point.update(canvas.width, canvas.height);
        point.render(context);
      });

      // Draw connections between close points
      points.forEach(point => {
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
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      // Optional cleanup logic if needed
    };
  });
};

const Home = () => {
  useCanvasAnimation();

  return (
    <canvas id={'canvas'} className="w-screen h-screen"></canvas>
  );
};

export default Home;