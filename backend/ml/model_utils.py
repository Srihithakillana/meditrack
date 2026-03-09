import tensorflow as tf
from tensorflow.keras import layers, models, backend as K

ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ/-.,: "
NUM_CLASSES = len(ALPHABET) + 1
MAX_TEXT_LEN = 32

def ctc_lambda_func(args):
    y_pred, labels, input_length, label_length = args
    return K.ctc_batch_cost(labels, y_pred, input_length, label_length)

def build_crnn():
    inputs = layers.Input(name='image_input', shape=(128, 32, 1))
    
    # --- UPGRADED CNN: 3 layers for better vision ---
    x = layers.Conv2D(32, (3, 3), activation='relu', padding='same')(inputs)
    x = layers.MaxPooling2D(pool_size=(2, 2))(x)
    x = layers.Conv2D(64, (3, 3), activation='relu', padding='same')(x)
    x = layers.MaxPooling2D(pool_size=(2, 2))(x)
    x = layers.Conv2D(128, (3, 3), activation='relu', padding='same')(x) # Added Layer
    x = layers.MaxPooling2D(pool_size=(2, 1))(x) # Keep horizontal width
    
    x = layers.Reshape(target_shape=(32, 512))(x)
    
    # --- UPGRADED BiLSTM: 256 units for better context ---
    x = layers.Bidirectional(layers.LSTM(256, return_sequences=True))(x)
    x = layers.Bidirectional(layers.LSTM(256, return_sequences=True))(x)
    
    y_pred = layers.Dense(NUM_CLASSES, activation='softmax')(x)

    # CTC Logic
    labels = layers.Input(name='the_labels', shape=[MAX_TEXT_LEN], dtype='float32')
    input_len = layers.Input(name='input_length', shape=[1], dtype='int64')
    label_len = layers.Input(name='label_length', shape=[1], dtype='int64')
    loss_out = layers.Lambda(ctc_lambda_func, name='ctc')([y_pred, labels, input_len, label_len])
    
    train_model = models.Model(inputs=[inputs, labels, input_len, label_len], outputs=loss_out)
    pred_model = models.Model(inputs=inputs, outputs=y_pred)
    return train_model, pred_model