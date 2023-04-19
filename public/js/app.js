const socket = io();
const messages = document.getElementById('messages');
const recording_btn = document.getElementById('start-recording');

recording_btn.addEventListener("click", (e) => {
  e.preventDefault();
  toggleRecording();
});


socket.on('message', (message) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight;
});

socket.on('new-text', (message) => {
    //document.getElementById('input-field').textContent = message;
    const inp = document.createElement('div', '');
    inp.textContent = message;
    inp.classList.add('message');
    inp.classList.add('message-input');
    document.getElementById('messages').appendChild(inp);
    const outp = document.createElement('div', '');
    outp.textContent = "You said '" + message + "'";
    outp.classList.add('message');
    outp.classList.add('message-response');
    document.getElementById('messages').appendChild(outp);

});


let isRecording = false;
let mediaRecorder;


async function toggleRecording() {
  if (!isRecording) {
    try {
      isRecording = true;
      recording_btn.classList.add("recording");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 64000 });
      const audioChunks = [];

      const sendAudioChunk = () => {
        if (audioChunks.length) {
          const audioBlob = new Blob(audioChunks);
          const reader = new FileReader();
          reader.readAsArrayBuffer(audioBlob);
          reader.onloadend = (event) => {
            const buffer = event.target.result;
            socket.emit("audio", buffer);
          };
          audioChunks.length = 0;
        }
      };

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
        sendAudioChunk();
      });

      mediaRecorder.addEventListener("stop", () => {
        sendAudioChunk();
        recording_btn.classList.remove("recording");
        socket.emit('done-audio');
      });

      mediaRecorder.start(500); // Start recording and emit "dataavailable" event every 0.5 seconds
    } catch (err) {
      console.error("Error while accessing the microphone:", err);
    }
  } else {
    isRecording = false;
    mediaRecorder.stop();
  }
}

