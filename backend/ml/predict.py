import cv2
import numpy as np
import tensorflow as tf
from model_utils import build_improved_crnn, ALPHABET

# 1. Build and Load Weights
_, prediction_model = build_improved_crnn()
prediction_model.load_weights("crnn_ctc_model.weights.h5")

def predict_new(image_path):
    # Preprocess exactly like training
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    img = cv2.resize(img, (128, 32)).astype('float32') / 255.0
    img = img.reshape(1, 128, 32, 1)

    # Model Inference
    preds = prediction_model.predict(img)
    
    # Decode CTC Output
    decoded = tf.keras.backend.ctc_decode(preds, input_length=np.array([32]), greedy=True)[0][0]
    result = "".join([ALPHABET[int(c)] for c in decoded[0] if c != -1])
    
    print(f"Recognized Medication: {result}")
    return result

# Run test
predict_new("../uploads/50.jpg")