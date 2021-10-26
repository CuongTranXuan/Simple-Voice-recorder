function convertFloat32ToInt16(float32ArrayData) {
    var l = float32ArrayData.length;
    var int16ArrayData = new Int16Array(l);
    while (l--) {
      int16ArrayData[l] = Math.min(1, float32ArrayData[l]) * 0x7fff
    }
    return int16ArrayData
}
function record(sampleRate, channelCount){
    chunks = []
    const constraints = {
        audio: {
            channelCount: channelCount,
            echoCancellation: false
        }
    }
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        context = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: sampleRate
          });
        input = context.createMediaStreamSource(stream);
        processor = context.createScriptProcessor(4096, 1, 1);
        processor.onaudioprocess = e => {
            const buffer = e.inputBuffer.getChannelData(0);
            const int16ArrayData = convertFloat32ToInt16(buffer);
            // Gửi dữ liệu lên server
            chunks.push(int16ArrayData.buffer);
        }
        input.connect(processor)
        processor.connect(context.destination)
    }, function (err) {
        console.error('không tìm thấy Micro , Hãy check lại thiết bị thu âm của bạn: ' + err);
    })
}
function makeUpload(audioChunks, uploadURL){
    let blob = new Blob(audioChunks, {type: "audio/wav" })
    var httpRequest = new XMLHttpRequest(); // can use request, axios, whatever
    httpRequest.open("POST", uploadURL, true);
    httpRequest.send(blob);
}