import sys
import json
import numpy as np
import os
from PIL import Image

# THIS IS THE FIX: We import from the new, lightweight tflite_runtime
import tflite_runtime.interpreter as tflite

def predict_disease(image_path):
    """
    Loads a lightweight .tflite model and predicts disease using tflite-runtime.
    """
    try:
        script_dir = os.path.dirname(__file__)
        model_path = os.path.join(script_dir, 'model.tflite')
        class_names_path = os.path.join(script_dir, 'class_names.json')

        # Load the TFLite model using the new library
        interpreter = tflite.Interpreter(model_path=model_path)
        interpreter.allocate_tensors()

        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()

        with open(class_names_path, 'r') as f:
            class_names = json.load(f)

        # Preprocess the image using Pillow and NumPy
        img = Image.open(image_path).resize((128, 128))
        img_array = np.array(img, dtype=np.float32)
        img_batch = np.expand_dims(img_array, axis=0)

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
