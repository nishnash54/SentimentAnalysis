from flask import Flask
from flask_socketio import SocketIO, send
import io
import base64
import cv2
from imageio import imread

from emotions import final_ml_predict as ml_predict

app = Flask(__name__)
socketio = SocketIO(app)

@app.route("/")
def hello():
    return "Hello World!"


@socketio.on('json', namespace=r'/ml')
def mlhandler(message):
    # print('Got image')
    image = message['image']
    img = imread(io.BytesIO(base64.b64decode(image)))
    cv2_img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    cv_result = ml_predict(cv2_img)
    _, buffer = cv2.imencode('.jpg', cv_result)
    result_im = base64.b64encode(buffer).decode('UTF-8')
    # print('Result: ')
    # print(result_im[:20])

    send({'result': result_im})


if __name__ == '__main__':
    socketio.run(app, port=8000)
