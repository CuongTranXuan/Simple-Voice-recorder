from flask import Flask, render_template, request
import subprocess
from flask_cors import CORS, cross_origin
# from vosk import run_test
app = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/')
def init_recorder():
    return render_template('index.html')
    
@app.route('/uploads', methods=['POST'])
@cross_origin()
# def save_audio():
#     rawAudio = request.get_data()
#     if rawAudio:
#         audioFile = open('RecordedFile.wav', 'wb')
#         audioFile.write(rawAudio)
#         audioFile.close()
#         return speech_to_text()
#     else: return 'break'
    
# def speech_to_text():
#     subprocess.run('python vosk.py', shell=True)

#     return 'transcript'
    
if __name__ == '__main__':
    app.run(debug=True, port=8100)
    # add host='0.0.0.0' if running on docker container
