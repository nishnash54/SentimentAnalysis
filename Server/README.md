# Server setup
1. Install requirements
```py
    pip install -r requirements.txt
```
2. Run server using
```py
    python server.py
```
3. Keep the server running.
4. Server runs at [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
5. Once the server is running, test it by clicking on the above URL
6. A message `Hello World!` should appear in the browser.
7. The server is up and running. :smiley:


## Web sockets

#### Request

Setting up the web socket with the URL and send the data in JSON format.

```py
URL = "http://127.0.0.1/ml"
JSON = {
    'image': base64 encoded image
}
```

#### Response

The server responds with a JSON object with an encoded image with the face detection and predicted emotion.

```py
JSON = {
    'image': base64 encoded image
}
```

# Sentiment Analysis Model
Let's have a look at how the model detects and predicts human emotions
 - Face detection
 - Emotion classification

## Face detection
Face detection refers to identifying human faces in images. Using a range of facial features such as eyes, nose, cheekbone, ears, lips, and their orientation, the algorithm is able to detect human faces from images.

## Emotion classification
Once the face is detected from the image, the algorithm now has to classify the type of emotion depicted by the individual. Humans have 43 facial muscles controlling our reactions such as frowning, smiling and laughing. The deep learning model is trained on a massive data set of facial reactions, and it provides a probabilistic estimate of the emotion depicted by the individual.

```py
def final_ml_predict(bgr_image):
  
    # Convert image to Grayscale and RGB
    gray_image = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2GRAY)
    rgb_image = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)

    # Find the coordinates of each face in the frame
    faces = face_cascade.detectMultiScale(gray_image, scaleFactor=1.1,
        minNeighbors=5, minSize=(30, 30), flags=cv2.CASCADE_SCALE_IMAGE)

    # For each face, predict the emotion.
    for face_coordinates in faces:

        # Selecting each face using the coordinates
        x1, x2, y1, y2 = apply_offsets(face_coordinates, emotion_offsets)
        gray_face = gray_image[y1:y2, x1:x2]
        try:
            gray_face = cv2.resize(gray_face, (emotion_target_size))
        except:
            continue

        gray_face = preprocess_input(gray_face, True)
        gray_face = np.expand_dims(gray_face, 0)
        gray_face = np.expand_dims(gray_face, -1)
        with graph.as_default():
                emotion_prediction = emotion_classifier.predict(gray_face)
        
        # Predicting emotion and labelling it to the maximum predicted value
        emotion_probability = np.max(emotion_prediction)
        emotion_label_arg = np.argmax(emotion_prediction)
        emotion_text = emotion_labels[emotion_label_arg]
        emotion_window.append(emotion_text)
        
        # Drawing bounding boxes and annotating the image.
        draw_bounding_box(face_coordinates, rgb_image, color)
        draw_text(face_coordinates, rgb_image, emotion_mode,
                  color, 0, -45, 1, 1)

    # Returning the annotated image
    bgr_image = cv2.cvtColor(rgb_image, cv2.COLOR_RGB2BGR)
return bgr_image
```

###### To explore the model further have a look. [here](./emotions.py)