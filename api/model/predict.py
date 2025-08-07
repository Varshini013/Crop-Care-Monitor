import sys
import json
import numpy as np
import os
import tensorflow as tf
from tensorflow.keras.preprocessing import image

def predict_disease(image_path):
    """
    Loads a lightweight .tflite model and predicts disease using the full TensorFlow library.
    """
    try:
        # Vercel places our files in specific directories. This finds the correct path.
        script_dir = os.path.dirname(__file__)
        model_path = os.path.join(script_dir, 'model.tflite')
        class_names_path = os.path.join(script_dir, 'class_names.json')

        # Load the TFLite model using the standard TensorFlow interpreter
        interpreter = tf.lite.Interpreter(model_path=model_path)
        interpreter.allocate_tensors()

        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()

        with open(class_names_path, 'r') as f:
            class_names = json.load(f)

        # Preprocess the image using the reliable tf.keras functions
        img = image.load_img(image_path, target_size=(128, 128))
        img_array = image.img_to_array(img)
        img_batch = np.expand_dims(img_array, axis=0).astype(np.float32)

        interpreter.set_tensor(input_details[0]['index'], img_batch)
        interpreter.invoke()
        predictions = interpreter.get_tensor(output_details[0]['index'])
        
        predicted_class_index = np.argmax(predictions[0])
        predicted_class_name = class_names[predicted_class_index]
        
        print(predicted_class_name)

    except Exception as e:
        print(f"ERROR in Python script: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        image_file_path = sys.argv[1]
        predict_disease(image_file_path)
    else:
        print("Error: Image path not provided.", file=sys.stderr)
        sys.exit(1)
