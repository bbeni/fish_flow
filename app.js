const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);


const spawn = require("child_process").spawn;
const exec = require("child_process").exec;
//console.log('PATH:::::');
//console.log(process.env.PATH);


app.use('/static', express.static(path.join(__dirname, 'public')));


// entry points
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/files.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'files.html'))
});

app.get('/files', (req, res) => {
  const dir = path.join(__dirname, 'session');

  const walk = (dir, parent = '') => {
    let results = [];
    const list = fs.readdirSync(dir);

    list.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      const relativePath = path.join(parent, file);

      if (stat && stat.isDirectory()) {
        results = results.concat(walk(fullPath, relativePath));
      } else {
        results.push(relativePath);
      }
    });

    return results;
  };

  const files = walk(dir);
  res.json(files);
});

app.use('/session', express.static(path.join(__dirname, 'session')));



let chunks = []; // List to store received audio chunks


function parse_and_execute(text) {
    const command = `conda run -n ${envName} python ./python-backend/parse_and_execute.py ${text}`;
    const pythonProcess = spawn(command, { shell: true});
    pythonProcess.stdout.on('data', (data) => {
        return data.toString();
        console.log(data.toString());
    });
    pythonProcess.stderr.on('data', (data) => {console.log(data.toString()); });
}

function parse_and_execute(text) {
    return new Promise((resolve, reject) => {
        const command = `conda run -n ${envName} python ./python-backend/parse_and_execute.py ${text}`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                reject(error);
            } else if (stderr) {
                console.error(`Error: ${stderr}`);
                reject(stderr);
            } else {
                resolve(stdout);
            }
        });
    });
}



//spawn python transcriber daemon

const pythonScript = './python-backend/transcriber.py';
const envName = 'tester';
const command2 = `conda run --live-stream -n ${envName} python -u ${pythonScript}`;
const transcriber = spawn(command2, { shell: true, env: {...process.env, PYTHONBUFFERED:'1'}});
transcriber_started = false;


counter = 1;
tempFile = `temp${counter}.webm`;
webmPath = path.join(__dirname, 'session', 'recordings', tempFile);



io.on("connection", (socket) => {
  console.log("a user connected to me");

  // connect transcriber
  transcriber.stdout.on('data', (data) => {
      
      str = data.toString();
      //console.log(data.toString());

      if (transcriber_started) {
        chunks.length = 0;
        socket.emit('chat-inp', data.toString())
        parse_and_execute(data.toString())
        .then(response => socket.emit('chat-res', response))
        .catch(error => console.error(error));
      }

      if (str.includes('DAEMON STARTED')) {
        console.log('daemon started recognized');
        transcriber_started = true;
      }

  });

  transcriber.stderr.on('data', (data) => {
      console.log(data.toString());
  });


  // receive audio

  socket.on("audio", (buffer) => {
    console.log("Received audio data");
    // Handle the audio data here, e.g., transcribe it using the Whisper API
    console.log(buffer);
    chunks.push(buffer);
  });

  socket.on("done-audio", () => {
    fs.writeFileSync(webmPath, Buffer.concat(chunks));

    console.log("audio recording done");
    if (transcriber_started) {
      console.log('sending to daemon ' + webmPath);
      transcriber.stdin.write(webmPath + '\n');
      counter+=1;
      tempFile = `temp${counter}.webm`;
      webmPath = path.join(__dirname, 'session', 'recordings', tempFile);
    }

    chunks.length = 0;
    
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
