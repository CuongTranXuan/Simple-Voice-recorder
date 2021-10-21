// peer connection
var pc = null;
var dc = null, dcInterval = null;
var start_btn = document.getElementById('start');
var stop_btn = document.getElementById('stop');
var statusField = document.getElementById('status');
var clear_btn = document.getElementById('clearText');
var analyticsVoice = document.getElementById('analytics');
var timeCounter = document.getElementById('timeCounter');
var context = undefined
var ws = null
var recorder = null
const audioContext = new AudioContext({sampleRate: 16000})
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
function writeString(view, offset, string) {
    for (var i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}
function floatTo16BitPCM(output, offset, input) {
    for (var i = 0; i < input.length; i++, offset += 2) {
        var s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
}
function makeUpload(){
    let blob = new Blob(chunks, {type: "audio/wav" })
    var httpRequest = new XMLHttpRequest();
      httpRequest.open("POST", "http://localhost:8100/uploads", true);
      httpRequest.send(blob);
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
function convertFloat32ToInt16(float32ArrayData) {
    var l = float32ArrayData.length;
    var int16ArrayData = new Int16Array(l);
    while (l--) {
      int16ArrayData[l] = Math.min(1, float32ArrayData[l]) * 0x7fff;
    }
    return int16ArrayData;
  }
function start() {
    btn_show_stop();
    statusField.innerText = 'Đang nhận dạng ...';
    chunks = []
    // var constraints = {
    //     audio: true,
    //     video: false,
    // };
    ws = new WebSocket("ws://localhost:2700")
    const constraints = {
        audio: {
            channelCount: 1,
            echoCancellation: false
        }
    }
    // var downsampledBuffer = downsampleBuffer(interleaved, targetRate);
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        console.log('Đã mở kết nối');
        context = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: 16000
          });
        input = context.createMediaStreamSource(stream);
        processor = context.createScriptProcessor(4096, 1, 1);
        processor.onaudioprocess = e => {
            if (ws && ws.readyState === ws.OPEN) {
                const buffer = e.inputBuffer.getChannelData(0);
                const int16ArrayData = convertFloat32ToInt16(buffer);
                // Gửi dữ liệu lên server
                chunks.push(int16ArrayData.buffer);
                ws.send(int16ArrayData.buffer);
            }
        }
        input.connect(processor)
        processor.connect(context.destination)
    }, function (err) {
        console.error('không tìm thấy Micro , Hãy check lại thiết bị thu âm của bạn: ' + err);
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
        // recorder.stop()
        // console.log(recorder.state)
    }
    makeUpload()
    console.log('Đã đóng kết nối');
    btn_show_start()
}
