import numpy as np
import cv2, os, json
from model_utils import build_crnn, ALPHABET, MAX_TEXT_LEN

# 1. Load Data from your consolidated JSON
with open('labels.json', 'r') as f:
    labels_data = json.load(f)

X_train, Y_train = [], []
char_map = {c: i for i, c in enumerate(ALPHABET)}

for item in labels_data:
    img_path = f"../uploads/{item['fileName']}"
    if os.path.exists(img_path):
        # Preprocessing: Resize and Normalize
        img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        img = cv2.resize(img, (128, 32)) / 255.0
        X_train.append(img)
        
        # Encode label text to numbers
        text = item['medicines'][0]['name'][:MAX_TEXT_LEN]
        encoded = [char_map[c] for c in text if c in char_map]
        encoded += [len(ALPHABET)] * (MAX_TEXT_LEN - len(encoded))
        Y_train.append(encoded)

X_train = np.array(X_train).reshape(-1, 128, 32, 1)
Y_train = np.array(Y_train)
num_samples = len(X_train)

# 2. Training execution
train_model, pred_model = build_crnn()
train_model.compile(optimizer='adam', loss={'ctc': lambda y_true, y_pred: y_pred})

# FIX: Ensure dummy target matches sample count (e.g., 50)
dummy_y = np.zeros(num_samples) 

train_model.fit(
    x={
        'image_input': X_train,
        'the_labels': Y_train,
        'input_length': np.array([32] * num_samples),
        'label_length': np.array([MAX_TEXT_LEN] * num_samples)
    }, 
    y=dummy_y, epochs=100, batch_size=8
)

pred_model.save_weights("crnn_ctc_model.weights.h5")
print("Model training complete. Weights saved.")
# ... (Keep your existing data loading logic here) ...
train_model, pred_model = build_crnn()

# Lower learning rate helps the model learn slowly and accurately
optimizer = tf.keras.optimizers.Adam(learning_rate=0.0001) 
train_model.compile(optimizer=optimizer, loss={'ctc': lambda y_true, y_pred: y_pred})

# Training for 100 cycles (epochs)
train_model.fit(
    x={
        'image_input': X_train,
        'the_labels': Y_train,
        'input_length': np.array([32] * len(X_train)),
        'label_length': np.array([MAX_TEXT_LEN] * len(X_train))
    }, 
    y=np.zeros(len(X_train)), 
    epochs=100, 
    batch_size=4 # Small batches are better for small datasets
)

# FIXED FILENAME: Must end in .weights.h5
pred_model.save_weights("crnn_ctc_model.weights.h5")
print("Successfully saved weights!")
