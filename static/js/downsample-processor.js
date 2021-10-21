class DownsampleProcessor extends AudioWorkletProcessor {

    constructor() {
        super();
        this._bufferSize = 2048;
        this._buffer = new Float32Array(this._bufferSize);
        this._initBuffer();
    }
    _initBuffer() {
        this._bytesWritten = 0;
      }
    
      _isBufferEmpty() {
        return this._bytesWritten === 0;
      }
    
      _isBufferFull() {
        return this._bytesWritten === this._bufferSize;
      }
    
      _appendToBuffer(value) {
        if (this._isBufferFull()) {
          this._flush();
        }
    
        this._buffer[this._bytesWritten] = value;
        this._bytesWritten += 1;
      }
    
      _flush() {
        let buffer = this._buffer;
        if (this._bytesWritten < this._bufferSize) {
          buffer = buffer.slice(0, this._bytesWritten);
        }
    
        this.port.postMessage({
          eventType: 'data',
          audioBuffer: buffer
        });
    
        this._initBuffer();
      }
    
      _recordingStopped() {
        this.port.postMessage({
          eventType: 'stop'
        });
      }
    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const sampleRate = 16000;
        const bufferSize = 8192;
        const ratio = AudioWorkletGlobalScope.sampleRate / sampleRate;
        const length = Math.floor(bufferSize / ratio);
        const inputData = input[0];  // float 32 array
        let outputData = new Int16Array(length); // int 16 array
        let curSample, newSample;

        for (let i = 0; i < length; i++) {
            curSample = Math.floor(i * ratio);
            newSample = Math.min(inputData[curSample] * 32768, 32767);
            outputData[i] = Math.floor(newSample);
        }
        outputs[0] = outputData
        // HOW to return ouputData.buffer?

        return true;
    }
}

registerProcessor('downsample-processor', DownsampleProcessor)