from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fer import FER
import cv2, shutil, os, requests
from dotenv import load_dotenv
# import textblob


load_dotenv()
app = FastAPI()

app.add_middleware(CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"])

detector = FER(mtcnn=False)

MOOD_PARAMS = {
    "happy":    {"query": "bollywood dance party upbeat superhit"},
    "sad":      {"query": "bollywood heartbreak arijit singh emotional"},
    "angry":    {"query": "bollywood intense action powerful"},
    "fear":     {"query": "bollywood suspense thriller background"},
    "surprise": {"query": "bollywood celebration energetic"},
    "disgust":  {"query": "bollywood indie alternative"},
    "neutral":  {"query": "bollywood chill lofi easy listening"},
    "romantic": {"query": "bollywood romantic love songs arijit"},
}

# def detect_text_emotion(text: str) -> str:
#     api_key = os.getenv("GEMINI_API_KEY")
#     url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key={api_key}"
    
#     payload = {
#         "contents": [{
#             "parts": [{
#                 "text": f"""Analyze the emotion in this text and return ONLY one word from this list:
#                 happy, sad, angry, fear, surprise, disgust, neutral
                
#                 Text: "{text}"
                
#                 Return only the single emotion word, nothing else."""
#             }]
#         }]
#     }
    
#     r = requests.post(url, json=payload)
#     print("Gemini status:", r.status_code)
#     print("Gemini response:", r.text)
    
#     try:
#         emotion = r.json()["candidates"][0]["content"]["parts"][0]["text"].strip().lower()
#         if emotion not in ["happy", "sad", "angry", "fear", "surprise", "disgust", "neutral"]:
#             emotion = "neutral"
#         return emotion
#     except Exception as e:
#         print("Gemini parse error:", e)
#         return "neutral"
def detect_text_emotion(text: str) -> str:
    text_lower = text.lower()

    negations = ["not", "never", "don't", "dont", "can't", "cant",
                 "won't", "wont", "no", "neither", "nor", "hardly",
                 "barely", "doesn't", "doesnt", "isn't", "isnt",
                 "wasn't", "wasnt", "couldn't", "couldnt", "shouldn't",
                 "shouldnt", "wouldn't", "wouldnt", "nothing", "nobody"]

    words = text_lower.split()
    negated = False
    for i, word in enumerate(words):
        if word in negations:
            negated = True
            break

    keywords = {
        "happy": ["happy", "excited", "joy", "great", "amazing", "love",
                  "wonderful", "fantastic", "got a job", "promoted",
                  "celebration", "blessed", "thrilled", "smile", "laugh",
                  "fun", "enjoy", "delighted", "pleased", "glad",
                  "graduated", "passed", "won", "selected", "accepted",
                  "married", "engaged", "baby", "born", "birthday",
                  "vacation", "holiday", "success", "achieved", "proud",
                  "blessed", "grateful", "thankful", "relieved", "hired",
                  "offer", "new job", "promotion", "raise", "bonus",
                  "best day", "amazing day", "great news", "good news"],

        "sad": ["sad", "depressed", "lonely", "heartbroken", "miss",
                "crying", "upset", "broke up", "lost", "grief", "hopeless",
                "unhappy", "miserable", "tears", "hurt", "painful", "alone",
                "died", "death", "funeral", "passed away", "gone forever",
                "miss you", "lost my", "dog died", "cat died", "failed",
                "rejected", "fired", "breakup", "divorce", "hospital",
                "sick", "ill", "accident", "nightmare", "terrible day",
                "worst day", "bad news", "no one", "nobody cares",
                "feel empty", "feel nothing", "gave up", "no hope",
                "left me", "abandoned", "ignored", "invisible",
                "exhausted", "drained", "broken", "shattered", "numb",
                "lost everything", "losing", "failure", "demoted",
                "cheated on", "betrayed", "used", "worthless", "useless"],

        "angry": ["angry", "furious", "fight", "hate", "frustrated",
                  "annoyed", "rage", "argument", "betrayed", "cheated",
                  "lied", "unfair", "mad", "irritated", "outraged",
                  "disrespected", "ignored", "insulted", "humiliated",
                  "backstabbed", "used me", "fed up", "sick of",
                  "tired of", "cant stand", "drives me crazy", "pissed",
                  "enraged", "livid", "disgusted with", "fed up with",
                  "done with", "had enough", "screaming", "yelling",
                  "threatening", "abusive", "toxic", "manipulated"],

        "fear": ["scared", "afraid", "nervous", "anxious", "worried",
                 "panic", "stress", "terrified", "fear", "exam",
                 "interview", "dread", "surgery", "operation", "result",
                 "waiting", "uncertain", "phobia", "nightmare", "danger",
                 "threatened", "unsafe", "paranoid", "trembling",
                 "shaking", "heart racing", "cant breathe", "overwhelmed",
                 "pressure", "deadline", "presentation", "test",
                 "evaluation", "judgment", "what if", "going wrong"],

        "surprise": ["surprised", "shocked", "unexpected", "unbelievable",
                     "wow", "never expected", "cant believe", "astonished",
                     "speechless", "mind blown", "out of nowhere",
                     "didnt see that coming", "plot twist", "sudden",
                     "no way", "seriously", "really", "omg", "oh my god",
                     "whoa", "incredible", "extraordinary", "remarkable"],

        "disgust": ["disgusted", "gross", "awful", "horrible", "sick",
                    "terrible", "worst", "nasty", "revolting", "appalled",
                    "repulsed", "nauseated", "vile", "filthy", "dirty",
                    "disgusting", "repulsive", "yuck", "eww", "pathetic",
                    "shameful", "embarrassing", "cringe", "toxic"],

        "romantic": ["love", "crush", "romantic", "date", "valentines",
                     "heart", "propose", "kiss", "missing you",
                     "falling in love", "feelings", "adore", "soulmate",
                     "together", "relationship", "partner", "cuddle",
                     "holding hands", "special someone", "my person",
                     "thinking about you", "can't stop thinking",
                     "butterflies", "first date", "anniversary",
                     "forever", "always", "meant to be", "destiny",
                     "true love", "sweetheart", "darling", "mine"],

        "neutral": ["okay", "fine", "alright", "meh", "whatever",
                    "normal", "usual", "same", "nothing special",
                    "just another", "as always", "routine", "average",
                    "moderate", "so so", "not bad", "not good"],
    }

    OPPOSITES = {
        "happy":    "sad",
        "sad":      "happy",
        "angry":    "neutral",
        "fear":     "neutral",
        "surprise": "neutral",
        "disgust":  "neutral",
        "romantic": "sad",
        "neutral":  "neutral",
    }

    scores = {emotion: 0 for emotion in keywords}
    for emotion, words_list in keywords.items():
        for word in words_list:
            if word in text_lower:
                scores[emotion] += 1

    best = max(scores, key=scores.get)

    if scores[best] > 0:
        if negated:
            return OPPOSITES.get(best, "neutral")
        return best

    # Fallback — TextBlob sentiment
    try:
        from textblob import TextBlob
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        if polarity > 0.3:
            return "happy"
        elif polarity < -0.3:
            return "sad"
        else:
            return "neutral"
    except Exception:
        return "neutral"
    
def get_spotify_token():
    r = requests.post("https://accounts.spotify.com/api/token",
        data={"grant_type": "client_credentials"},
        auth=(os.getenv("SPOTIFY_CLIENT_ID"), os.getenv("SPOTIFY_CLIENT_SECRET")))
    return r.json()["access_token"]

import random

def get_tracks(emotion: str):
    params = MOOD_PARAMS.get(emotion, MOOD_PARAMS["neutral"])
    token = get_spotify_token()
    
    offset = random.randint(0, 20)
    
    r = requests.get("https://api.spotify.com/v1/search",
        headers={"Authorization": f"Bearer {token}"},
        params={
            "q": params["query"],
            "type": "track",
            "limit": 5,
            "offset": offset
        })
    
    data = r.json()
    items = data.get("tracks", {}).get("items", [])
    
    if not items:
        r = requests.get("https://api.spotify.com/v1/search",
            headers={"Authorization": f"Bearer {token}"},
            params={
                "q": params["query"],
                "type": "track",
                "limit": 5,
                "offset": 0
            })
        items = r.json().get("tracks", {}).get("items", [])
    
    return [{
        "name": t["name"],
        "artist": t["artists"][0]["name"],
        "preview_url": t.get("preview_url"),
        "spotify_url": t.get("external_urls", {}).get("spotify"),
        "album_art": t["album"]["images"][0]["url"] if t["album"]["images"] else None
    } for t in items]
             
def get_youtube_video(emotion: str, track_name: str, artist: str):
    api_key = os.getenv("YOUTUBE_API_KEY")
    r = requests.get("https://www.googleapis.com/youtube/v3/search",
        params={
            "part": "snippet",
            "q": f"{track_name} {artist} bollywood",
            "type": "video",
            "maxResults": 1,
            "key": api_key
        })
    items = r.json().get("items", [])
    if not items:
        return None
    return items[0]["id"]["videoId"]

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        img = cv2.imread(temp_path)
        result = detector.detect_emotions(img)
        if not result:
            emotion = "neutral"
        else:
            scores = result[0]["emotions"]
            emotion = max(scores, key=scores.get)

        tracks = get_tracks(emotion)
        
        video_id = None
        if tracks:
            video_id = get_youtube_video(emotion, tracks[0]["name"], tracks[0]["artist"])
        
        return {"emotion": emotion, "tracks": tracks, "video_id": video_id}
    except Exception as e:
        return {"error": str(e)}
    finally:
        os.remove(temp_path)
        
@app.post("/analyze-text")
async def analyze_text(data: dict):
    text = data.get("text", "")
    if not text:
        return {"emotion": "neutral", "tracks": []}
    
    emotion = detect_text_emotion(text)
    tracks = get_tracks(emotion)
    
    video_id = None
    if tracks:
        video_id = get_youtube_video(emotion, tracks[0]["name"], tracks[0]["artist"])
    
    return {"emotion": emotion, "tracks": tracks, "video_id": video_id}