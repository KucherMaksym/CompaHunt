from sentence_transformers import SentenceTransformer
from flask import Flask, request, jsonify
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load only once on container startup
logger.info("Loading multilingual-e5-base model...")
model = SentenceTransformer('intfloat/multilingual-e5-base')
logger.info("Model loaded successfully!")

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/embed', methods=['POST'])
def embed():
    try:
        data = request.json
        text = data.get('text', '')

        if not text:
            return jsonify({'error': 'No text provided'}), 400

        # multilingual-e5 requires prefix for query
        if data.get('type') == 'query':
            text = f"query: {text}"
        elif data.get('type') == 'passage':
            text = f"passage: {text}"

        embedding = model.encode(text).tolist()

        return jsonify({
            'embedding': embedding,
            'dimension': len(embedding)
        })

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/batch-embed', methods=['POST'])
def batch_embed():
    try:
        data = request.json
        texts = data.get('texts', [])

        if not texts:
            return jsonify({'error': 'No texts provided'}), 400

        embeddings = model.encode(texts).tolist()

        return jsonify({
            'embeddings': embeddings,
            'count': len(embeddings),
            'dimension': len(embeddings[0]) if embeddings else 0
        })

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)