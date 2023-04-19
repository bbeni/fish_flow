import sys
import whisper


def get_text(sound_file_name):
	model = whisper.load_model("base.en")
	result = model.transcribe(sound_file_name)
	return result['text']

if __name__ == '__main__':
	if len(sys.argv) > 1:
		print(get_text(sys.argv[1]))
	else:
		print(get_text("./python-backend/test.mp3"))

