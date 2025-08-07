import sys
import json
import numpy as np
import tensorflow as tf
import os
from tensorflow.keras.preprocessing import image

def predict_disease(image_path):
    """
    Loads a lightweight .tflite model and predicts disease.
    """
    try:
        # --- THIS IS THE FIX ---
        # Vercel places our files in specific directories. This finds the correct path
        # to the model files within the live deployment environment.
        script_dir = os.path.dirname(__file__)
        model_path = os.path.join(script_dir, 'model.tflite')
        class_names_path = os.path.join(script_dir, 'class_names.json')
        # --- END OF FIX ---

        # Load the TFLite model and allocate tensors.
        interpreter = tf.lite.Interpreter(model_path=model_path)
        interpreter.allocate_tensors()

        # Get input and output details.
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()

        # Load the class names.
        with open(class_names_path, 'r') as f:
            class_names = json.load(f)

        # Load and preprocess the image.
        img = image.load_img(image_path, target_size=(128, 128))
        img_array = image.img_to_array(img)
        img_batch = np.expand_dims(img_array, axis=0).astype(np.float32)

        # Set the image as input to the model.
        interpreter.set_tensor(input_details[0]['index'], img_batch)

        # Run the prediction.
        interpreter.invoke()

        # Get the result.
        predictions = interpreter.get_tensor(output_details[0]['index'])
        
        predicted_class_index = np.argmax(predictions[0])
        predicted_class_name = class_names[predicted_class_index]
        
        # Print the final result.
        print(predicted_class_name)

    except Exception as e:
        print(f"ERROR in Python script: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        # The image path from Node.js is an absolute path to a temporary file, so it works correctly.
        image_file_path = sys.argv[1]
        predict_disease(image_file_path)
    else:
        print("Error: Image path not provided.", file=sys.stderr)
        sys.exit(1)

