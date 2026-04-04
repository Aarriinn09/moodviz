import React from "react";

const EMOTION_PARTICLES = {
  happy: {
    emojis: ["😄", "⭐", "✨", "🌟", "💛"],
    behavior: "bounce",
    count: 20,
  },
  sad: {
    emojis: ["😢", "💧", "🌧️", "💙"],
    behavior: "diagonal",
    count: 18,
  },
  angry: {
    emojis: ["😠", "🔥", "💢", "⚡"],
    behavior: "shake",
    count: 16,
  },
  fear: {
    emojis: ["😨", "👻", "🕷️", "🌑"],
    behavior: "float",
    count: 14,
  },
  surprise: {
    emojis: ["😲", "🎉", "🎊", "💥", "⚡"],
    behavior: "burst",
    count: 22,
  },
  disgust: {
    emojis: ["🤢", "💚", "🌿"],
    behavior: "fall",
    count: 14,
  },
  neutral: {
    emojis: ["😐", "⚪", "🌫️"],
    behavior: "drift",
    count: 10,
  },
  romantic: {
    emojis: ["🥰", "💕", "💖", "💗", "💓"],
    behavior: "float",
    count: 20,
  },
};

function createParticle(behavior, index, total) {
  const base = {
    x: Math.random() * 100,
    y: -10 - Math.random() * 20,
    size: 16 + Math.random() * 20,
    opacity: 0.6 + Math.random() * 0.4,
    delay: Math.random() * 4,
    duration: 4 + Math.random() * 4,
  };

  switch (behavior) {
    case "bounce":
      return {
        ...base,
        animClass: "particle-bounce",
        drift: (Math.random() - 0.5) * 40,
      };
    case "diagonal":
      return {
        ...base,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        animClass: "particle-fall",
        drift: 20 + Math.random() * 30,
        duration: 3 + Math.random() * 2,
      };
    case "shake":
      return {
        ...base,
        animClass: "particle-shake",
        drift: (Math.random() - 0.5) * 60,
      };
    case "float":
      return {
        ...base,
        animClass: "particle-float",
        drift: (Math.random() - 0.5) * 20,
        duration: 6 + Math.random() * 4,
      };
    case "burst":
      return {
        ...base,
        x: 30 + Math.random() * 40,
        y: 30 + Math.random() * 40,
        animClass: "particle-burst",
        drift: (Math.random() - 0.5) * 100,
      };
    case "drift":
      return {
        ...base,
        animClass: "particle-drift",
        drift: (Math.random() - 0.5) * 30,
      };
    default:
      return {
        ...base,
        animClass: "particle-fall",
        drift: (Math.random() - 0.5) * 20,
      };
  }
}

export default function EmotionParticles({ emotion }) {
  const config = EMOTION_PARTICLES[emotion] || EMOTION_PARTICLES.neutral;
  const particles = Array.from({ length: config.count }, (_, i) =>
    createParticle(config.behavior, i, config.count),
  );

  return (
    <>
      <style>{`
        .particles-container {
          position: fixed; top: 0; left: 0;
          width: 100vw; height: 100vh;
          pointer-events: none; overflow: hidden; z-index: 0;
        }
        .particle {
          position: absolute; user-select: none; will-change: transform;
        }

        @keyframes fall {
          0%   { transform: translateY(-60px) translateX(0px); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.8; }
          100% { transform: translateY(110vh) translateX(var(--drift)); opacity: 0; }
        }
        @keyframes bounce {
          0%   { transform: translateY(-60px) translateX(0) scale(0.5); opacity: 0; }
          10%  { opacity: 1; scale: 1; }
          40%  { transform: translateY(40vh) translateX(calc(var(--drift) * 0.5)) scale(1.2); }
          60%  { transform: translateY(30vh) translateX(calc(var(--drift) * 0.7)) scale(0.9); }
          80%  { transform: translateY(80vh) translateX(var(--drift)) scale(1.1); }
          100% { transform: translateY(110vh) translateX(var(--drift)); opacity: 0; }
        }
        @keyframes diagonal {
          0%   { transform: translate(-60px, -60px); opacity: 0; }
          10%  { opacity: 1; }
          100% { transform: translate(calc(var(--drift) * 1vw), 110vh); opacity: 0; }
        }
        @keyframes shake {
          0%   { transform: translateY(-60px) translateX(0) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          25%  { transform: translateY(25vh) translateX(calc(var(--drift) * 0.3)) rotate(-15deg); }
          50%  { transform: translateY(50vh) translateX(calc(var(--drift) * 0.6)) rotate(15deg); }
          75%  { transform: translateY(75vh) translateX(calc(var(--drift) * 0.8)) rotate(-10deg); }
          100% { transform: translateY(110vh) translateX(var(--drift)) rotate(0deg); opacity: 0; }
        }
        @keyframes float {
          0%   { transform: translateY(110vh) translateX(0); opacity: 0; }
          10%  { opacity: 0.7; }
          50%  { transform: translateY(50vh) translateX(calc(var(--drift) * 0.5px)); }
          90%  { opacity: 0.5; }
          100% { transform: translateY(-60px) translateX(calc(var(--drift) * 1px)); opacity: 0; }
        }
        @keyframes burst {
          0%   { transform: scale(0) translate(0, 0); opacity: 1; }
          50%  { transform: scale(1.4) translate(calc(var(--drift) * 0.5px), calc(var(--drift) * 0.3px)); opacity: 0.8; }
          100% { transform: scale(0.8) translate(calc(var(--drift) * 1px), 110vh); opacity: 0; }
        }
        @keyframes drift {
          0%   { transform: translateY(-60px) translateX(0) rotate(0deg); opacity: 0; }
          15%  { opacity: 0.5; }
          85%  { opacity: 0.3; }
          100% { transform: translateY(110vh) translateX(calc(var(--drift) * 1px)) rotate(360deg); opacity: 0; }
        }

        .particle-fall    { animation: fall     var(--dur) var(--delay) infinite ease-in; }
        .particle-bounce  { animation: bounce   var(--dur) var(--delay) infinite ease-in-out; }
        .particle-diagonal{ animation: diagonal var(--dur) var(--delay) infinite linear; }
        .particle-shake   { animation: shake    var(--dur) var(--delay) infinite ease-in-out; }
        .particle-float   { animation: float    var(--dur) var(--delay) infinite ease-in-out; }
        .particle-burst   { animation: burst    var(--dur) var(--delay) infinite ease-out; }
        .particle-drift   { animation: drift    var(--dur) var(--delay) infinite linear; }
      `}</style>

      <div className="particles-container">
        {particles.map((p, i) => (
          <div
            key={i}
            className={`particle ${p.animClass}`}
            style={{
              left: `${p.x}%`,
              top: p.behavior === "float" ? "110vh" : `${p.y}%`,
              fontSize: `${p.size}px`,
              "--drift": `${p.drift}px`,
              "--dur": `${p.duration}s`,
              "--delay": `${p.delay}s`,
            }}
          >
            {config.emojis[i % config.emojis.length]}
          </div>
        ))}
      </div>
    </>
  );
}
