FROM python:3

ADD . /voice_recorder
WORKDIR /voice_recorder

RUN pip install -r requirements.txt
EXPOSE 8100
CMD [ "python", "voiceRecorder.py" ]