const socket = io();
const messages = document.getElementById('messages');
const startRecording = document.getElementById('start-recording');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;

recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript.trim();
            if (transcript.toLowerCase() === 'hello odo') {
                socket.emit('message', transcript);
            }
        }
    }
};

recognition.onerror = (event) => {
    console.error(event.error);
};

startRecording.addEventListener('click', () => {
    recognition.start();
});

socket.on('message', (message) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight;
});
