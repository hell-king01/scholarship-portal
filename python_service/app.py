import os
import sys
import numpy as np
import cv2
from flask import Flask, request, jsonify

# Append the PaddleOCR local path to sys.path
sys.path.append(r'C:\Sam\PaddleOCR-main\PaddleOCR-main')
try:
    from paddleocr import PaddleOCR
except ImportError:
    # If not found locally in that specific path, try normal import
    try:
        from paddleocr import PaddleOCR
    except ImportError:
        PaddleOCR = None

app = Flask(__name__)

# Initialize PaddleOCR with English, Hindi, and Marathi support
# Depending on PaddleOCR installation, languages usually are 'en', 'ch', or multilingual models.
# Let's use 'en' as default, but if 'marathi' or 'hindi' is supported we add it. 
# Usually, PaddleOCR uses 'hi' for Hindi and 'mr' or 'devanagari' for Marathi.
if PaddleOCR:
    try:
        # Initializing PaddleOCR with Hindi, Marathi, and English support
        # Note: 'hi' is Hindi, 'mr' is Marathi, 'en' is English. 
        # Using devanagari model usually covers both HI and MR.
        ocr = PaddleOCR(use_angle_cls=True, lang='hi', rec_model_dir=None) 
        # If we want exact multiple, some versions take lang='hi' or lang='latin'
        # Modern PaddleOCR handles devanagari script for both HI/MR.
    except Exception as e:
        print(f"Error initializing high-tier OCR. Falling back to base English: {e}")
        try:
             ocr = PaddleOCR(use_angle_cls=True, lang='en')
        except:
             ocr = None
else:
    ocr = None

@app.route('/process-ocr', methods=['POST'])
def process():
    if not ocr:
        return jsonify({"error": "PaddleOCR is not initialized on the server. Please check the python environment."}), 500

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        # Read the image via opencv
        file_bytes = np.frombuffer(file.read(), np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({"error": "Could not decode image"}), 400

        # Run OCR
        result = ocr.ocr(img, cls=True)
        
        # Result format handling
        # PaddleOCR returns a list of lists.
        # Format usually: [[ [ [x,y], [x,y], [x,y], [x,y] ], ("text", confidence) ], ...]
        structured_text_clusters = []
        raw_text = []

        if result and len(result) > 0 and result[0]:
            for line in result[0]:
                box, (text, conf) = line
                raw_text.append(text)
                structured_text_clusters.append({
                    "box": box,
                    "text": text,
                    "confidence": float(conf)
                })

        return jsonify({
            "success": True,
            "raw_text": "\n".join(raw_text),
            "clusters": structured_text_clusters,
            "confidence_avg": float(sum([c["confidence"] for c in structured_text_clusters])) / float(len(structured_text_clusters)) if structured_text_clusters else 0.0
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
