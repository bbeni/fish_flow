const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);


const spawn = require("child_process").spawn;
console.log('PATH:::::');
console.log(process.env.PATH);


const pythonScript = './python-backend/a.py';
const tempFile = 'temp.webm';
const envName = 'tester';
const command = `conda run -n ${envName} python ${pythonScript}`;
const command2 = `conda run -n ${envName} python ${pythonScript} ${tempFile}`;



//const pythonProcess = spawn(command, { shell: true});
//pythonProcess.stdout.on('data', (data) => {
//    console.log('DATA::::');
//    console.log(data.toString());
//});

//pythonProcess.stderr.on('data', (data) => {
 //   console.log("ERROR:::::");
  //  console.log(data.toString());
//});

app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'temp.webm'))
});


const webmPath = path.join(__dirname, tempFile);
let chunks = []; // List to store received audio chunks


io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("audio", (buffer) => {
    console.log("Received audio data");
    // Handle the audio data here, e.g., transcribe it using the Whisper API
    console.log(buffer);
    chunks.push(buffer);

    fs.appendFileSync(webmPath, Buffer.from(buffer));


  });

  socket.on("done-audio", () => {
    const pythonProcess = spawn(command2, { shell: true});
    pythonProcess.stdout.on('data', (data) => {
        console.log(data.toString());
        socket.emit('new-text', data.toString());
        fs.unlinkSync(webmPath);
    });
    pythonProcess.stderr.on('data', (data) => {console.log(data.toString()); });

  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
