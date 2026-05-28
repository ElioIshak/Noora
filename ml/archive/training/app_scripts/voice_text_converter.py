import speech_recognition as sr
import pyaudio

rec = sr.Recognizer()
mics = sr.Microphone()

# Checking the working microphones available to choose one -> index = 5
# print(mics.list_working_microphones())

mic = sr.Microphone(device_index=5)

with mic as source:
    print("🎤 Say something...")
    rec.adjust_for_ambient_noise(source, duration=1)  # reads the first second of the file stream and calibrates the recognizer to the noise level of the audio
    audio = rec.listen(source, timeout=10)

try:
    text = rec.recognize_sphinx(audio)
    print("🗣 You said:", text)
except sr.UnknownValueError:
    print("❌ PocketSphinx could not understand the audio.")
except sr.RequestError as e:
    print("⚠️ PocketSphinx error:", e)
