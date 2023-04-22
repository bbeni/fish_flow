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

socket.on('chat-inp', (message) => {
    const inp = document.createElement('div', '');
    inp.textContent = message;
    inp.classList.add('message');
    inp.classList.add('message-input');
    document.getElementById('messages').appendChild(inp);

});

socket.on('chat-res', (message) => {
    const outp = document.createElement('div', '');
    outp.textContent =  message ;
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

      const sendAudioChunk = (isLastChunk = false) => {
        if (audioChunks.length) {
          const audioBlob = new Blob(audioChunks);
          const reader = new FileReader();
          reader.readAsArrayBuffer(audioBlob);
          reader.onloadend = (event) => {
            const buffer = event.target.result;
            socket.emit("audio", buffer);
            
            if (isLastChunk) {
              socket.emit('done-audio');
            }
          };
          audioChunks.length = 0;
        } else if (isLastChunk) {
          socket.emit('done-audio');
        }
      };


      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
        sendAudioChunk();
      });

      mediaRecorder.addEventListener("stop", () => {
        sendAudioChunk(true); // Pass true to indicate that this is the last chunk
        recording_btn.classList.remove("recording");
      });


      mediaRecorder.start(100); // Start recording and emit "dataavailable" event every 0.5 seconds
    } catch (err) {
      console.error("Error while accessing the microphone:", err);
    }
  } else {
    isRecording = false;
    mediaRecorder.stop();
  }
}

