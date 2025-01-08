from flask import Flask, request, jsonify
from flask_cors import CORS
from model import model

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def check_condition(text):
    return model(text)

@app.route('/check', methods=['POST'])
def check_comment():
    data = request.json
    if not data or "text" not in data:
        return jsonify({"error": "Invalid input"}), 400
    
    text = data["text"]
    result = check_condition(text)
    return jsonify({"flagged": result})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5959)
