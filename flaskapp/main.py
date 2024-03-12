from flask import Flask, request, jsonify
import joblib
import json

app = Flask(__name__)

# Load the pre-trained model
model = joblib.load("Naive_model.pkl")

@app.route('/classify', methods=['POST'])
def classify_email():
    try:
        data = request.get_json()
        text = data['text']

        # Log the content of the submitted email
        #print("Submitted Email Content:")
        #print(text)

        # Perform classification using the pre-trained model
        classification = model.predict([text])[0]

        # Ensure the classification is converted to a JSON-serializable format
        classification_json = json.dumps({'classification': int(classification)})

        # Log the classification result
        #print("Classification Result:" )
        #print(classification_json)

        # Return the classification result
        return classification_json
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True, host= '0.0.0.0', port=5000)
