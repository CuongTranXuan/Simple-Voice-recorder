'use strict'

let log = console.log.bind(console),
  id = val => document.getElementById(val),
  ul = id('ul'),
  gUMbtn = id('gUMbtn'),
  start = id('start'),
  stop = id('stop'),
  stream,
  recorder,
  counter=1,
  chunks,
  media;


gUMbtn.onclick = e => {
  media = {
    tag: 'audio',
    type: 'audio/wav',
    ext: '.wav',
    gUM: {audio: true}
  };
  navigator.mediaDevices.getUserMedia(media.gUM).then(_stream => {
    stream = _stream;
    id('gUMArea').style.display = 'none';
    id('btns').style.display = 'inherit';
    start.removeAttribute('disabled');
    recorder = new MediaRecorder(stream);
    let i = 0
    recorder.ondataavailable = e => {
      chunks.push(e.data);
      log(i)
      i = i+1;
      // if(recorder.state == 'inactive')  makeUpload();
      if(i == 1) {
        makeUpload();
        i = 0
      }
    };
    log('got media successfully');
  }).catch(log);
}

start.onclick = e => {
  start.disabled = true;
  stop.removeAttribute('disabled');
  chunks=[];
  recorder.start(1000);
}


stop.onclick = e => {
  stop.disabled = true;
  recorder.stop();
  start.removeAttribute('disabled');
}



function makeUpload(){
  let blob = new Blob(chunks, {type: media.type })
  var httpRequest = new XMLHttpRequest();
	httpRequest.open("POST", "http://localhost:8100/uploads", true);
	httpRequest.send(blob);
}
