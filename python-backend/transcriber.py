import sys
import os
import time
import whisper


#model = whisper.load_model("base.en")
model = whisper.load_model("tiny.en")

def send(message):
    sys.stdout.write(message.strip() + '\n')
    sys.stdout.flush()

def get_text(sound_file_name):
    result = model.transcribe(sound_file_name)
    base = os.sep.join(sound_file_name.split(os.sep)[:-2]) + os.sep + 'transcriptions'
    textfname = sound_file_name.split(os.sep)[-1].split('.')[0] + '.txt'
    path = base + os.sep + textfname

    with open(path, 'w') as f:
        f.write(result['text'])

    return result['text']

if __name__ == "__main__":
    send('python workdir ' + os.getcwd())
    send('DAEMON STARTED')
    while True:
        input_data = sys.stdin.readline().strip()
        if input_data:
            response = get_text(input_data)
            send(response)
        else:
            break

