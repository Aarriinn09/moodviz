# 🎵 MoodViz — Mood-Based Music Visualizer

MoodViz is a full-stack AI-powered web app that detects your emotional state — either through your **facial expression** or **how you describe your feelings** — and responds with matching Bollywood music recommendations, a real-time canvas visualizer, and emotion-specific particle effects.

---

## 🌐 Live Demo

🔗 [moodviz.vercel.app](https://moodviz.vercel.app)

---

## ✨ Features

- **📷 Facial Emotion Detection** — Capture a photo via webcam and let the AI detect your emotion in real time
- **🖼️ Image Upload** — Upload any face photo to detect emotion
- **✍️ Text Emotion Detection** — Describe how you feel in plain text and the app understands your mood (with negation handling — "not happy" → sad)
- **🎵 Bollywood Music Recommendations** — Get 5 Spotify-curated Bollywood tracks matching your mood
- **▶️ YouTube Playback** — Click any song to play it instantly via YouTube, with autoplay queue
- **🎨 Real-time Canvas Visualizer** — Mood-specific p5.js animations that react to your emotion
- **✨ Emotion Particle Effects** — Unique emoji rain/float animations for each emotion
- **🌈 Dynamic Background** — Gradient background shifts smoothly based on detected emotion
- **📱 Fully Responsive** — Works on mobile, tablet and desktop

---

## 🧠 Supported Emotions

| Emotion | Visual Style | Particles |
|---------|-------------|-----------|
| 😄 Happy | Bouncy orbiting circles | Stars and sparkles bounce |
| 😢 Sad | Slow melting waves | Rain droplets fall |
| 😠 Angry | Sharp radiating spikes | Fire emojis shake |
| 😨 Fear | Pulsing concentric rings | Ghosts float upward |
| 😲 Surprise | Burst particle explosion | Confetti bursts |
| 🤢 Disgust | Slow green waves | Leaf emojis drift |
| 😐 Neutral | Steady equalizer bars | Clouds drift slowly |
| 🥰 Romantic | Soft pulsing rings | Hearts float upward |

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (Create React App)
- **p5.js** — Canvas visualizer
- **YouTube Data API v3** — Music playback
- **Vercel** — Deployment

### Backend
- **FastAPI** — REST API
- **FER** (Facial Expression Recognition) — Emotion detection from images
- **Spotify Web API** — Music recommendations
- **TextBlob** — Text sentiment analysis
- **OpenCV** — Image processing
- **Render** — Deployment

---

## 📁 Project Structure

```
moodviz/
├── frontend/
│   ├── src/
│   │   ├── App.js               # Main React component
│   │   ├── CanvasVisualizer.jsx # p5.js mood visualizer
│   │   └── EmotionParticles.jsx # Emotion particle effects
│   └── .env                     # Frontend environment variables
│
└── backend/
    ├── main.py                  # FastAPI server
    ├── requirements.txt         # Python dependencies
    └── .env                     # Backend environment variables
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Python 3.11
- Node.js
- Spotify Developer Account
- YouTube Data API Key

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
```

Create `backend/.env`:
```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
YOUTUBE_API_KEY=your_youtube_api_key
```

Run the backend:
```bash
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
REACT_APP_YOUTUBE_API_KEY=your_youtube_api_key
```

Run the frontend:
```bash
npm start
```

---

## 🔑 API Keys Required

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| [Spotify Developer](https://developer.spotify.com/dashboard) | Music recommendations | ✅ Free |
| [YouTube Data API](https://console.cloud.google.com) | Music playback | ✅ Free |

---

## 📸 How It Works

1. **Choose input mode** — Camera, Upload or Text
2. **Express your mood** — Take a selfie, upload a photo, or type how you feel
3. **AI detects emotion** — FER model analyzes facial expressions, TextBlob handles text
4. **Music loads** — 5 Bollywood tracks matching your mood appear
5. **Visuals come alive** — Canvas animates and particles rain based on your emotion
6. **Click to play** — Any track plays instantly via YouTube

---

## 🎯 Key Technical Highlights

- **Dual emotion detection** — Computer vision (FER) for faces + NLP (TextBlob) for text
- **Smart Spotify search** — Mood-specific query strings for accurate Bollywood recommendations
- **Autoplay queue** — Songs play sequentially, next track starts automatically
- **Emotion-aware UI** — Every visual element responds to the detected emotion

---

## 👨‍💻 Author

**Arin Rathore**
- GitHub: [@Aarriinn09](https://github.com/Aarriinn09)
- LinkedIn: [Arin](https://www.linkedin.com/in/arin-rathore-62a36019a/)
- LeetCode: [Arin0906](https://leetcode.com/Arin0906)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
