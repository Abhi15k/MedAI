from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)

# Load the summarization model
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

@app.route('/')
def home():
    return "Summarization Service is running!"

@app.route('/favicon.ico')
def favicon():
    return '', 204

@app.route('/summarize', methods=['POST'])
def summarize():
    try:
        # Get the input text from the request
        data = request.json
        text = data.get('text', '')

        if not text:
            return jsonify({'error': 'No text provided'}), 400

        # Generate the summary
        summary = summarizer(text, max_length=130, min_length=30, do_sample=False)[0]['summary_text']
        return jsonify({'summary': summary})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001)