import React, { useState, useRef, useCallback } from "react";
import CanvasVisualizer from "./CanvasVisualizer";
import YouTube from "react-youtube";
import EmotionParticles from "./EmotionParticles";

const EMOTION_EMOJI = {
  happy: "😄",
  sad: "😢",
  angry: "😠",
  fear: "😨",
  surprise: "😲",
  disgust: "🤢",
  neutral: "😐",
  romantic: "🥰",
};

const EMOTION_GRADIENTS = {
  happy: "135deg, #f7971e, #ffd200",
  sad: "135deg, #1e3c72, #2a5298",
  angry: "135deg, #c0392b, #8e44ad",
  fear: "135deg, #360033, #0b8793",
  surprise: "135deg, #00c6ff, #ff00cc",
  disgust: "135deg, #134e5e, #71b280",
  neutral: "135deg, #232526, #414345",
  romantic: "135deg, #f953c6, #b91d73",
};

export default function App() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [textInput, setTextInput] = useState("");
  const [activeTab, setActiveTab] = useState("camera");
  const [emotion, setEmotion] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef();
  const canvasRef = useRef();
  const streamRef = useRef();

  const startCamera = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    streamRef.current = stream;
    setCameraOn(true);
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  }, []);

  const analyzeText = useCallback(async () => {
    if (!textInput.trim()) return;
    setLoading(true);
    const res = await fetch("https://moodviz.onrender.com/analyze-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: textInput }),
    });
    const data = await res.json();
    setEmotion(data.emotion);
    setTracks(data.tracks || []);
    setActiveVideoId(data.video_id);
    setLoading(false);
    setCurrentTrackIndex(0);
  }, [textInput]);

  const capture = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg"));
    setSnapshot(canvas.toDataURL("image/jpeg"));
    setLoading(true);
    const form = new FormData();
    form.append("file", blob, "snap.jpg");
    const res = await fetch("https://moodviz.onrender.com/analyze", {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    setEmotion(data.emotion);
    setTracks(data.tracks || []);
    setActiveVideoId(data.video_id);
    setLoading(false);
    setCurrentTrackIndex(0);
  }, []);

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setSnapshot(URL.createObjectURL(file));
    const form = new FormData();
    form.append("file", file, file.name);
    const res = await fetch("https://moodviz.onrender.com/analyze", {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    setEmotion(data.emotion);
    setTracks(data.tracks || []);
    setActiveVideoId(data.video_id);
    setLoading(false);
    setCurrentTrackIndex(0);
  }, []);

  const playTrackOnYoutube = useCallback(async (track, index = 0) => {
    const query = `${track.name} ${track.artist} bollywood`;
    const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
    const r = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${apiKey}`,
    );
    const data = await r.json();
    const id = data.items?.[0]?.id?.videoId;
    if (id) {
      setActiveVideoId(id);
      setCurrentTrackIndex(index);
    }
  }, []);

  const playNextTrack = useCallback(async () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    const nextTrack = tracks[nextIndex];
    if (nextTrack) {
      await playTrackOnYoutube(nextTrack, nextIndex);
    }
  }, [currentTrackIndex, tracks, playTrackOnYoutube]);

  const gradient = emotion
    ? EMOTION_GRADIENTS[emotion]
    : "135deg, #0f0c29, #302b63, #24243e";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(${gradient})`,
        transition: "background 1.2s ease",
        fontFamily: "'Segoe UI', sans-serif",
        color: "#fff",
        padding: "24px 16px",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {emotion && <EmotionParticles emotion={emotion} key={emotion} />}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        textarea::placeholder { color: rgba(255,255,255,0.3); }

        .main-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (min-width: 700px) {
          .main-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (min-width: 1050px) {
          .main-grid {
            grid-template-columns: 1fr 1.8fr 1fr;
          }
        }

        .canvas-wrapper canvas {
          width: 100% !important;
          height: auto !important;
        }

        .track-item {
          background: rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 10px 12px;
          cursor: pointer;
          color: #fff;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .track-item:hover {
          background: rgba(255,255,255,0.18);
        }

        .tab-btn {
          padding: 9px 18px;
          border-radius: 20px;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
          color: #fff;
          backdropFilter: blur(8px);
        }

        .upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 2px dashed rgba(255,255,255,0.3);
          border-radius: 12px;
          padding: 32px 20px;
          cursor: pointer;
          transition: border-color 0.2s;
          gap: 10px;
        }
        .upload-label:hover {
          border-color: rgba(255,255,255,0.6);
        }

        video {
          width: 100%;
          border-radius: 10px;
          background: #111;
          display: block;
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "28px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h1
          style={{
            fontSize: "clamp(1.8rem, 5vw, 2.4rem)",
            margin: 0,
            fontFamily: "Fascinate, system-ui",
            letterSpacing: "2px",
            fontWeight: 700,
          }}
        >
          🎧 Moodify
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            marginTop: "6px",
            fontFamily: "cursive",
            fontSize: "clamp(13px, 2vw, 15px)",
          }}
        >
          Music that understands you
        </p>
        {!emotion && (
          <p
            style={{
              color: "rgba(255,255,255,0.35)",
              marginTop: "10px",
              fontSize: "13px",
            }}
          >
            📷 Capture your face or ✍️ describe your mood to get started
          </p>
        )}

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginTop: "18px",
            flexWrap: "wrap",
          }}
        >
          {["camera", "upload", "text"].map((tab) => (
            <button
              key={tab}
              className="tab-btn"
              onClick={() => setActiveTab(tab)}
              style={{
                background:
                  activeTab === tab
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(255,255,255,0.1)",
              }}
            >
              {tab === "camera"
                ? "📷 Camera"
                : tab === "upload"
                  ? "🖼️ Upload"
                  : "✍️ Text"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="main-grid" style={{ position: "relative", zIndex: 1 }}>
        {/* Left — Input */}
        <div style={glassCard}>
          {activeTab === "camera" && (
            <>
              <p style={sectionLabel}>📷 Camera</p>
              <video ref={videoRef} autoPlay playsInline />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "14px",
                  flexWrap: "wrap",
                }}
              >
                {!cameraOn ? (
                  <button onClick={startCamera} style={ghostBtn}>
                    ▶ Start
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    style={{
                      ...ghostBtn,
                      borderColor: "rgba(255,80,80,0.5)",
                      color: "#ff8080",
                    }}
                  >
                    ■ Stop
                  </button>
                )}
                <button
                  onClick={capture}
                  disabled={loading || !cameraOn}
                  style={{
                    ...primaryBtn,
                    flex: 1,
                    opacity: loading || !cameraOn ? 0.5 : 1,
                  }}
                >
                  {loading ? "Analyzing..." : "✨ Capture"}
                </button>
              </div>
              {snapshot && (
                <div style={{ marginTop: "14px" }}>
                  <p style={{ ...sectionLabel, marginBottom: "6px" }}>
                    Last snap
                  </p>
                  <img
                    src={snapshot}
                    alt="snap"
                    style={{ width: "80px", borderRadius: "8px", opacity: 0.8 }}
                  />
                </div>
              )}
            </>
          )}

          {activeTab === "upload" && (
            <>
              <p style={sectionLabel}>🖼️ Upload a photo</p>
              <label className="upload-label">
                <span style={{ fontSize: "40px" }}>📁</span>
                <span
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.6)",
                    textAlign: "center",
                  }}
                >
                  Click to upload a face photo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
              </label>
              {loading && (
                <p
                  style={{
                    textAlign: "center",
                    marginTop: "14px",
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "13px",
                  }}
                >
                  Analyzing...
                </p>
              )}
              {snapshot && !loading && (
                <div style={{ marginTop: "14px" }}>
                  <p style={{ ...sectionLabel, marginBottom: "6px" }}>
                    Uploaded
                  </p>
                  <img
                    src={snapshot}
                    alt="uploaded"
                    style={{
                      width: "100%",
                      borderRadius: "10px",
                      opacity: 0.85,
                    }}
                  />
                </div>
              )}
            </>
          )}

          {activeTab === "text" && (
            <>
              <p style={sectionLabel}>✍️ How are you feeling?</p>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="e.g. I just got a new job, I am so excited!"
                rows={5}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "10px",
                  color: "#fff",
                  padding: "12px",
                  fontSize: "14px",
                  resize: "none",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "'Segoe UI', sans-serif",
                }}
              />
              <button
                onClick={analyzeText}
                disabled={loading || !textInput.trim()}
                style={{
                  ...primaryBtn,
                  marginTop: "12px",
                  width: "100%",
                  opacity: loading || !textInput.trim() ? 0.5 : 1,
                }}
              >
                {loading ? "Analyzing..." : "✨ Detect My Mood"}
              </button>
            </>
          )}
        </div>

        {/* Center — Visualizer */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            alignItems: "center",
          }}
        >
          {emotion && (
            <div
              style={{
                ...glassCard,
                padding: "12px 32px",
                fontSize: "1.3rem",
                fontWeight: 600,
                letterSpacing: "1px",
                animation: "fadeIn 0.5s ease",
                textAlign: "center",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              {EMOTION_EMOJI[emotion]}{" "}
              {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
            </div>
          )}
          <div
            style={{
              ...glassCard,
              padding: "12px",
              width: "100%",
              boxSizing: "border-box",
            }}
            className="canvas-wrapper"
          >
            <CanvasVisualizer emotion={emotion || "neutral"} />
          </div>
        </div>

        {/* Right — Tracks */}
        {tracks && tracks.length > 0 && (
          <div style={glassCard}>
            <p style={sectionLabel}>🎶 Songs for your mood</p>
            <p
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.4)",
                margin: "0 0 10px 0",
              }}
            >
              Click a song to play
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {tracks.map((t, i) => (
                <div
                  key={i}
                  className="track-item"
                  onClick={() => playTrackOnYoutube(t, i)}
                  style={{
                    background:
                      i === currentTrackIndex && activeVideoId
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(255,255,255,0.07)",
                  }}
                >
                  {t.album_art && (
                    <img
                      src={t.album_art}
                      alt="album"
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "6px",
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize: "13px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "160px",
                      }}
                    >
                      {t.name}
                    </div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "12px",
                        marginTop: "2px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {t.artist}
                    </div>
                  </div>
                  <span
                    style={{ fontSize: "14px", flexShrink: 0, opacity: 0.6 }}
                  >
                    {i === currentTrackIndex && activeVideoId ? "🎵" : "▶"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hidden YouTube player */}
      {activeVideoId && (
        <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
          <YouTube
            key={activeVideoId}
            videoId={activeVideoId}
            opts={{ playerVars: { autoplay: 1 } }}
            onEnd={playNextTrack}
          />
        </div>
      )}
    </div>
  );
}

const glassCard = {
  background: "rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "16px",
  padding: "20px",
};

const sectionLabel = {
  margin: "0 0 10px 0",
  fontSize: "12px",
  letterSpacing: "1px",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.5)",
};

const primaryBtn = {
  padding: "10px 20px",
  borderRadius: "20px",
  border: "none",
  background: "rgba(255,255,255,0.25)",
  color: "#fff",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 600,
  backdropFilter: "blur(8px)",
  transition: "all 0.2s",
};

const ghostBtn = {
  padding: "10px 20px",
  borderRadius: "20px",
  border: "1px solid rgba(255,255,255,0.3)",
  background: "transparent",
  color: "#fff",
  cursor: "pointer",
  fontSize: "14px",
};
