import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"

from flask import Flask, request, jsonify
from transformers import pipeline
import multiprocessing as mp

app = Flask(__name__)

if __name__ == "__main__":
    try:
        mp.set_start_method('fork', force=True)
    except RuntimeError as e:
        # Start method may already be set
        print("Multiprocessing start method already set:", e)


sentiment_pipe = pipeline(
    "text-classification",
    model="ar2107/rhea_sentiment_finetuned_lite",   
    tokenizer="ar2107/rhea_sentiment_finetuned_lite"
)


zsc_pipe = pipeline(
    "zero-shot-classification",
    model="valhalla/distilbart-mnli-12-1"
)

DEPARTMENTS = [
    "Front Desk",
    "Housekeeping",
    "Maintenance & Amenities",
    "Room Service",
    "Restaurant/Café",
    "Food & Beverage",
    "General"
    "IT"
]

try:
    emotion_pipe = pipeline(
        "text-classification",
        model="j-hartmann/emotion-english-distilroberta-base",
        top_k=None
    )
except Exception as e:
    print("Error loading emotion model on startup:", e)
    emotion_pipe = None 

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
    
        s_res = sentiment_pipe(text)[0]
        raw_label = s_res["label"]
        raw_score = float(s_res["score"])
        label_map = {
            "Very Negative": "very negative",
            "Negative": "negative",
            "Neutral": "neutral",
            "Positive": "positive",
            "Very Positive": "very positive"
        }
        sentiment_label = label_map.get(raw_label, raw_label.lower())
        sentiment_confidence = round(raw_score, 4)

        global emotion_pipe
        if emotion_pipe is None:
            try:
                emotion_pipe = pipeline(
                    "text-classification",
                    model="j-hartmann/emotion-english-distilroberta-base",
                    top_k=None
                )
            except Exception as load_error:
                print("Error lazy-loading emotion model:", load_error)
                return jsonify({"error": "Emotion model unavailable"}), 500

        e_res = emotion_pipe(text)[0]
        top_emotion = max(e_res, key=lambda x: x["score"])
        emotion_label = top_emotion["label"]
        emotion_confidence = round(float(top_emotion["score"]), 4)

        dept_res = zsc_pipe(text, DEPARTMENTS)
        predicted_dept = dept_res["labels"][0]
        predicted_dept_conf = round(float(dept_res["scores"][0]), 4)

        return jsonify({
            "sentiment": {
                "label": sentiment_label,
                "confidence": sentiment_confidence,
                "raw_label": raw_label,
                "raw_score": raw_score
            },
            "emotion": {
                "label": emotion_label,
                "confidence": emotion_confidence
            },
            "department": {
                "label": predicted_dept,
                "confidence": predicted_dept_conf
            }
        })

    except Exception as e:
        print("Error in NLP pipeline:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)