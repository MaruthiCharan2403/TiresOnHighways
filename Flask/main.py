from flask import Flask, request, jsonify
from tensorflow import keras
from tensorflow.keras.preprocessing import image
import numpy as np
from flask_cors import CORS
from io import BytesIO
from PIL import Image

app = Flask(__name__)
CORS(app)
model = keras.models.load_model('best_model.h5', compile=False)


def preprocess_image(file):
    img = image.img_to_array(Image.open(file).convert('RGB').resize((64, 64)))
    img = np.expand_dims(img, axis=0)
    img = img / 255.0 
    return img

@app.route('/classify', methods=['POST'])
def classify_image():
    try:
        setofresult = []
        files = request.files.getlist('image')
        if not files:
            return jsonify({"error": "No files uploaded"})
        for file in files:
            processed_image = preprocess_image(file)
            predictions = model.predict(processed_image)
            print(predictions)
            predicted_class = np.argmax(predictions)
            print(predicted_class)
            class_labels = ["Cracked", "Normal"] 

            result = {
                "class": class_labels[predicted_class],
                "confidence": float(predictions[0][predicted_class])
            }

            setofresult.append(result)

        return jsonify(setofresult)

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}),500

@app.route('/', methods=['GET'])
def health_check():
    return "Hello TiresOnHighways Flask User!!!"

if __name__ == '__main__':
    app.run(debug=True)
