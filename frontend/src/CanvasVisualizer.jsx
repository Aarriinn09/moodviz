import React, { useRef, useEffect } from "react";
import p5 from "p5";

const MOOD_STYLES = {
  happy: {
    colors: ["#FFD700", "#FF6B6B", "#FF8C00", "#FFE566"],
    shape: "circles",
    speed: 3,
  },
  sad: {
    colors: ["#4A90D9", "#7B9EBF", "#1E3A5F", "#85B5E0"],
    shape: "waves",
    speed: 1,
  },
  angry: {
    colors: ["#FF2200", "#FF6600", "#8B0000", "#FF4400"],
    shape: "spikes",
    speed: 5,
  },
  fear: {
    colors: ["#6A0DAD", "#9B59B6", "#301860", "#8E44AD"],
    shape: "pulse",
    speed: 2,
  },
  surprise: {
    colors: ["#00E5FF", "#FF00FF", "#FFFF00", "#00FFAA"],
    shape: "burst",
    speed: 4,
  },
  disgust: {
    colors: ["#4CAF50", "#8BC34A", "#2E7D32", "#66BB6A"],
    shape: "waves",
    speed: 2,
  },
  neutral: {
    colors: ["#A0A0A0", "#707070", "#505050", "#909090"],
    shape: "bars",
    speed: 1,
  },
  romantic: {
    colors: ["#FF69B4", "#FF1493", "#FFB6C1", "#FF85C2"],
    shape: "pulse",
    speed: 2,
  },
};

export default function CanvasVisualizer({ emotion = "neutral" }) {
  const containerRef = useRef();
  const p5Ref = useRef();

  useEffect(() => {
    const style = MOOD_STYLES[emotion] || MOOD_STYLES.neutral;

    const sketch = (p) => {
      let time = 0;
      let particles = [];

      p.setup = () => {
        p.createCanvas(580, 380).parent(containerRef.current);
        p.colorMode(p.RGB);
        for (let i = 0; i < 30; i++) {
          particles.push({
            x: p.random(p.width),
            y: p.random(p.height),
            size: p.random(2, 6),
            speed: p.random(0.2, 1),
            col: style.colors[Math.floor(p.random(style.colors.length))],
          });
        }
      };

      p.draw = () => {
        p.background(15, 15, 20, 30);
        time += 0.02 * style.speed;

        drawParticles(p, particles, time, style);

        if (style.shape === "circles") drawCircles(p, style, time);
        if (style.shape === "waves") drawWaves(p, style, time);
        if (style.shape === "spikes") drawSpikes(p, style, time);
        if (style.shape === "pulse") drawPulse(p, style, time);
        if (style.shape === "burst") drawBurst(p, style, time);
        if (style.shape === "bars") drawBars(p, style, time);
      };
    };

    if (p5Ref.current) p5Ref.current.remove();
    p5Ref.current = new p5(sketch);
    return () => {
      if (p5Ref.current) p5Ref.current.remove();
    };
  }, [emotion]);

  return (
    <div
      ref={containerRef}
      style={{
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 0 40px rgba(0,0,0,0.5)",
      }}
    />
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function drawParticles(p, particles, time, style) {
  particles.forEach((pt) => {
    pt.y -= pt.speed * 0.3;
    pt.x += Math.sin(time + pt.y * 0.01) * 0.3;
    if (pt.y < -10) {
      pt.y = p.height + 10;
      pt.x = p.random(p.width);
    }
    const [r, g, b] = hexToRgb(pt.col);
    p.noStroke();
    p.fill(r, g, b, 80);
    p.ellipse(pt.x, pt.y, pt.size, pt.size);
  });
}

function drawCircles(p, style, time) {
  for (let i = 0; i < 5; i++) {
    const angle = time + i * (p.TWO_PI / 5);
    const r1 = 100 + Math.sin(time * 1.5) * 30;
    const x = p.width / 2 + Math.cos(angle) * r1;
    const y = p.height / 2 + Math.sin(angle) * r1 * 0.6;
    const size = 50 + Math.sin(time * 2 + i) * 20;
    const [r, g, b] = hexToRgb(style.colors[i % style.colors.length]);
    p.noStroke();
    p.fill(r, g, b, 180);
    p.ellipse(x, y, size, size);
    p.fill(r, g, b, 60);
    p.ellipse(x, y, size * 1.6, size * 1.6);
  }
  const [r, g, b] = hexToRgb(style.colors[0]);
  p.fill(r, g, b, 120);
  p.noStroke();
  const cs = 70 + Math.sin(time * 3) * 25;
  p.ellipse(p.width / 2, p.height / 2, cs, cs);
  p.fill(255, 255, 255, 60);
  p.ellipse(p.width / 2, p.height / 2, cs * 0.4, cs * 0.4);
}

function drawWaves(p, style, time) {
  for (let w = 0; w < 5; w++) {
    const [r, g, b] = hexToRgb(style.colors[w % style.colors.length]);
    p.noFill();
    p.strokeWeight(2 - w * 0.2);
    p.stroke(r, g, b, 180 - w * 20);
    p.beginShape();
    for (let x = 0; x <= p.width; x += 4) {
      const y =
        p.height / 2 +
        Math.sin(x * 0.015 + time + w * 1.2) * (50 + w * 15) +
        Math.sin(x * 0.03 + time * 1.3) * 20;
      p.vertex(x, y);
    }
    p.endShape();
    p.strokeWeight(0.5);
    p.stroke(r, g, b, 40);
    p.beginShape();
    for (let x = 0; x <= p.width; x += 4) {
      const y =
        p.height / 2 +
        Math.sin(x * 0.015 + time + w * 1.2) * (50 + w * 15) +
        Math.sin(x * 0.03 + time * 1.3) * 20;
      p.vertex(x, y + 8);
    }
    p.endShape();
  }
}

function drawSpikes(p, style, time) {
  p.push();
  p.translate(p.width / 2, p.height / 2);
  const spikes = 32;
  for (let i = 0; i < spikes; i++) {
    const angle = (i / spikes) * p.TWO_PI;
    const len = 60 + Math.sin(time * 4 + i * 0.4) * 100;
    const [r, g, b] = hexToRgb(style.colors[i % style.colors.length]);
    p.stroke(r, g, b, 200);
    p.strokeWeight(2.5);
    p.line(0, 0, Math.cos(angle) * len, Math.sin(angle) * len);
    p.stroke(r, g, b, 60);
    p.strokeWeight(6);
    p.line(0, 0, Math.cos(angle) * len * 0.6, Math.sin(angle) * len * 0.6);
  }
  const [r, g, b] = hexToRgb(style.colors[0]);
  p.noStroke();
  p.fill(r, g, b, 150);
  p.ellipse(0, 0, 30 + Math.sin(time * 6) * 10, 30 + Math.sin(time * 6) * 10);
  p.pop();
}

function drawPulse(p, style, time) {
  p.push();
  p.translate(p.width / 2, p.height / 2);
  for (let i = 6; i >= 0; i--) {
    const size = 60 + i * 50 + Math.sin(time * 2 + i * 0.5) * 25;
    const [r, g, b] = hexToRgb(style.colors[i % style.colors.length]);
    p.noFill();
    p.stroke(r, g, b, 180 - i * 20);
    p.strokeWeight(2 - i * 0.15);
    p.ellipse(0, 0, size, size * 0.7);
  }
  const [r, g, b] = hexToRgb(style.colors[0]);
  p.noStroke();
  p.fill(r, g, b, 200);
  p.ellipse(0, 0, 20, 20);
  p.fill(255, 255, 255, 150);
  p.ellipse(-4, -4, 6, 6);
  p.pop();
}

function drawBurst(p, style, time) {
  p.push();
  p.translate(p.width / 2, p.height / 2);
  const count = 80;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * p.TWO_PI + time * 0.5;
    const r2 = 80 + Math.sin(time * 3 + i * 0.2) * 70;
    const x = Math.cos(angle) * r2;
    const y = Math.sin(angle) * r2;
    const size = 6 + Math.sin(time * 2 + i * 0.3) * 4;
    const [r, g, b] = hexToRgb(style.colors[i % style.colors.length]);
    p.noStroke();
    p.fill(r, g, b, 180);
    p.ellipse(x, y, size, size);
    p.fill(r, g, b, 60);
    p.ellipse(x, y, size * 2.5, size * 2.5);
  }
  p.pop();
}

function drawBars(p, style, time) {
  const bars = 40;
  const bw = p.width / bars;
  for (let i = 0; i < bars; i++) {
    const h =
      40 + Math.sin(time + i * 0.3) * 60 + Math.sin(time * 1.7 + i * 0.5) * 30;
    const [r, g, b] = hexToRgb(style.colors[i % style.colors.length]);
    p.noStroke();
    p.fill(r, g, b, 160);
    p.rect(i * bw + 1, p.height / 2 - h / 2, bw - 2, h, 3);
    p.fill(r, g, b, 40);
    p.rect(i * bw + 1, p.height / 2 - h / 2 - 4, bw - 2, 3, 2);
  }
}
