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
    var constraints = {
        audio: true,
        video: false,
    };
    ws = new WebSocket('ws://localhost:2700')
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        console.log('Đã mở kết nối');
        recorder = new MediaRecorder(stream)
        recorder.start(1000)
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
    // var configuration = {iceServers: [
    //                 {
    //                     'urls': [
    //                         'stun:stun.l.google.com:19302'
    //                     ]
    //                 }
    //                     ]};
    // var config = {
    //     sdpSemantics: 'unified-plan'
    // };

    // pc = new RTCPeerConnection(configuration);

    // var parameters = {};

    // dc = pc.createDataChannel('chat', parameters);
    // dc.onclose = function () {
    //     clearInterval(dcInterval);
    //     console.log('Đã đóng kết nối');
    //     btn_show_start();
    // };

    // dc.onopen = function () {
    //     console.log('Đã mở kết nối');
    // };

    // dc.onmessage = function (evt) {
    //     if(evt.data !== undefined) {
    //         getData =JSON.parse(evt.data);
    //         if(getData.text !== undefined) {
    //             performRecvText(getData.text, getData.result)
    //         }
    //         else if (getData.partial !== undefined) {
    //             performRecvPartial(getData.partial)
    //         }
    //     }

    //     statusField.innerText = 'Đang nhận dạng ...';
    // };

    // pc.oniceconnectionstatechange = function () {
    //     if (pc.iceConnectionState == 'disconnected') {
    //         console.log('Đã ngắt kết nối');
    //         btn_show_start();
    //     }
    // }

    // var constraints = {
    //     audio: true,
    //     video: false,
    // };

    // navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    //     stream.getTracks().forEach(function (track) {
    //         pc.addTrack(track, stream);
    //     });
    //     return negotiate();
    // }, function (err) {
    //     console.log('không tìm thấy Micro , Hãy check lại thiết bị thu âm của bạn: ' + err);
    //     btn_show_start();
    // });
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
