FROM python:3

ADD . /vosk_websocket
WORKDIR /vosk_websocket

RUN pip install -r requirements.txt

EXPOSE 2700

CMD [ "python","asr_server.py","./model" ]
# CMD [ "ls","./model" ]