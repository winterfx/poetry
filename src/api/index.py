from flask import Flask, request, jsonify
from src.service.ai import askAI,getPoemsDescription
app = Flask(__name__)

@app.route("/api/python")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/api/poems", methods=["POST"])
def get_poems()->dict:
    # call askai function in service/ai.py
    data=request.json
    print(data)
    input = data.get("userInput", "")
    answer = askAI(input)
    return jsonify({"poems": answer.get("poems", [])})
    
@app.route("/api/poem/description", methods=["POST"])
def get_poems_description()->dict:
    data=request.json
    answer = getPoemsDescription(data)
    return jsonify({"description": answer})