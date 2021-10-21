// peer connection
var pc = null;
var dc = null, dcInterval = null;
var start_btn = document.getElementById('start');
var stop_btn = document.getElementById('stop');
var statusField = document.getElementById('status');
var clear_btn = document.getElementById('clearText');
var analyticsVoice = document.getElementById('analytics');
var timeCounter = document.getElementById('timeCounter');

var ws = null
var recorder = null

function countTime(){
    timeCounter.classList.remove('d-none');
    var sec = 0;
    function pad ( val ) { return val > 9 ? val : "0" + val; }
    setInterval( function(){
        document.getElementById("seconds").innerHTML=pad(++sec%60);
        document.getElementById("minutes").innerHTML=pad(parseInt(sec/60,10));
    }, 1000);
}


function anlysticResult(){
        analyticsVoice.classList.remove('d-none');
        document.getElementById('gender').innerHTML = 'Chưa xác định';
        document.getElementById('emotion').innerHTML = 'Chưa xác định';
        document.getElementById('region').innerHTML = 'Chưa xác định';
        document.getElementById('namePer').innerHTML = 'Chưa xác định';
        document.getElementById('score').innerHTML = 'Chưa xác định';
};

function getText(){
    document.getElementById('textDemo').innerHTML = "";
    for (var i in texts) {
        document.getElementById('textDemo').innerHTML = texts[Math.floor(Math.random()*texts.length)].text;
    }
}


function getModel(){
    var model_type = $('#model_type').val();
    if (model_type == 1){
        return 'https://asr-test1.hyperfin.vn/asr'
    } else {
        return 'https://asr-test2.hyperfin.vn/asr'
    }
}


function isEmpty(str) {
//    return (!str || str.length === 0 );
    return (this.length === 0 || !this.trim());
}

function removeText() {
    document.getElementById('list').innerHTML = "";
}

function btn_show_clear() {
    clear_btn.classList.remove('d-none');
}

function btn_show_stop() {
    start_btn.classList.add('d-none');
    stop_btn.classList.remove('d-none');
    clear_btn.classList.remove('d-none');
}

function btn_show_start() {
    stop_btn.classList.add('d-none');
    start_btn.classList.remove('d-none');
    statusField.innerText = " ";
    clear_btn.classList.add('d-none');
}

function negotiate() {
    return pc.createOffer().then(function (offer) {
        return pc.setLocalDescription(offer);
    }).then(function () {
        return new Promise(function (resolve) {
            if (pc.iceGatheringState === 'complete') {
                resolve();
            } else {
                function checkState() {
                    if (pc.iceGatheringState === 'complete') {
                        pc.removeEventListener('icegatheringstatechange', checkState);
                        resolve();
                    }
                }

                pc.addEventListener('icegatheringstatechange', checkState);
            }
        });
    }).then(function () {
        var offer = pc.localDescription;
        var timer = countTime();
        var url = getModel();
        console.log('server :', url);
        return fetch(url, {
            body: JSON.stringify({
                sdp: offer.sdp,
                type: offer.type,
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            cache: "no-cache",
            method: 'POST',
        });
    }).then(function (response) {
        return response.json();
    }).then(function (answer) {
//        console.log(answer.sdp);
        return pc.setRemoteDescription(answer);
    }).catch(function (e) {
        console.log(e);
        btn_show_start();
    });
}

function jsUcfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


function downsampleBuffer(buffer, rate) {
    if (rate == sampleRate) {
        return buffer;
    }
    if (rate > sampleRate) {
        throw "downsampling rate show be smaller than original sample rate";
    }
    var sampleRateRatio = sampleRate / rate;
    var newLength = Math.round(buffer.length / sampleRateRatio);
    var result = new Float32Array(newLength);
    var offsetResult = 0;
    var offsetBuffer = 0;
    while (offsetResult < result.length) {
        var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
         // Use average value of skipped samples
        var accum = 0, count = 0;
        for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
            accum += buffer[i];
            count++;
        }
        result[offsetResult] = accum / count;
        // Or you can simply get rid of the skipped samples:
        // result[offsetResult] = buffer[nextOffsetBuffer];
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
    }
    return result;
}
function encodeWAV(samples) {
    var buffer = new ArrayBuffer(44 + samples.length * 2);
    var view = new DataView(buffer);

    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* RIFF chunk length */
    view.setUint32(4, 36 + samples.length * 2, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, numChannels, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 4, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, numChannels * 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, samples.length * 2, true);

    floatTo16BitPCM(view, 44, samples);

    return view;
}

function performRecvText(result) {
    var ls = JSON.parse(result);
    var sentence = ''
    if (ls.text != undefined) sentence = ls.text
    // for(var i in ls){
    //     lt = ls[i].replace('{', '').replace('}', '').replace("'", "").replace("'", "").split('/');
    //     bg = jsUcfirst(lt[0]);
    //     param  = lt[1] + "%" + "  \n" + lt[2] + "  \n" + lt[3]
    //     if(parseFloat(lt[1].split(':')[1]) <= 90){
    //         opacity = 0.7;
    //     }else{
    //         opacity = 1;
    //     }
    //     sentence += "<span title='"  + param + "'" + "style='opacity:" + opacity + ";'>" + bg + "</span>" + " ";
    // }

    htmlStr = document.getElementById('list').innerHTML;
//    listItemHtmlStr = " " + jsUcfirst(sentence) + " . ";
    listItemHtmlStr = " " + sentence + "  .  ";
    htmlStr += listItemHtmlStr;
    document.getElementById('list').innerHTML = htmlStr; 
}

function performRecvPartial(str) {
    document.getElementById('partial').innerText = str.toUpperCase()
}

function start() {
    btn_show_stop();
    statusField.innerText = 'Đang nhận dạng ...';
    // var constraints = {
    //     audio: true,
    //     video: false,
    // };
    ws = new WebSocket("ws://localhost:2700")
    const constraints = {
        audio: {
            channelCount: 1,
            sampleRate: 16000,
            sampleSize: 16,
            volume: 1
        }
    }
    // var downsampledBuffer = downsampleBuffer(interleaved, targetRate);
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        console.log('Đã mở kết nối');
        recorder = new MediaRecorder(stream)
        recorder.start(2000)
        recorder.ondataavailable = (event) => {
            console.debug('Got blob data:', event.data);
            if (event.data && event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
              ws.send(event.data);
            }
          };
    }, function (err) {
        console.log('không tìm thấy Micro , Hãy check lại thiết bị thu âm của bạn: ' + err);
        btn_show_start();
    });
    ws.onmessage = (event) => {
        console.log(event.data)
        performRecvText(event.data)
    }
}

function stop() {
    if (ws.readyState != WebSocket.CLOSED){
        ws.close(1000)
        recorder.stop()
        console.log(recorder.state)
    }
    console.log('Đã đóng kết nối');
    btn_show_start()

}
