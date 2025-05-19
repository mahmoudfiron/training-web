import cv2
import mediapipe as mp
import numpy as np
import pyttsx3
import threading
import queue

# Setup Mediapipe
mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

# Setup voice engine
engine = pyttsx3.init()
engine.setProperty('rate', 150)
voices = engine.getProperty('voices')
for voice in voices:
    if 'en' in voice.id.lower():
        engine.setProperty('voice', voice.id)
        break

# Speech queue and worker
speech_queue = queue.Queue()

def speak_worker():
    while True:
        msg = speech_queue.get()
        if msg is None:
            break
        engine.say(msg)
        engine.runAndWait()

threading.Thread(target=speak_worker, daemon=True).start()

def speak(text):
    speech_queue.put(text)

def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    if angle > 180.0:
        angle = 360 - angle
    return angle

# Start video capture
cap = cv2.VideoCapture(0)

# Counter variables
counter = 0
stage = None
spoken_first = False

with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
    while cap.isOpened():
        ret, frame = cap.read()
        frame = cv2.flip(frame, 1)

        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        results = pose.process(image)

        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        try:
            landmarks = results.pose_landmarks.landmark

            shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                        landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
            elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                     landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
            wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                     landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]

            angle = calculate_angle(shoulder, elbow, wrist)

            angle_coords = tuple(np.multiply(elbow, [640, 480]).astype(int))
            cv2.putText(image, str(round(angle, 2)), angle_coords,
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2, cv2.LINE_AA)

            if angle > 160:
                stage = "down"
            if angle < 40 and stage == "down":
                stage = "up"
                counter += 1
                print(counter)

                if counter == 1 and not spoken_first:
                    speak("Great job! One rep completed!")
                    spoken_first = True
                elif counter % 10 == 0:
                    speak(f"You’ve completed {counter} reps. Keep it up, bro!")
                elif counter % 5 == 0:
                    speak("You're improving, keep going!")

        except:
            pass

        cv2.rectangle(image, (0, 0), (225, 73), (245, 117, 16), -1)
        cv2.putText(image, 'REPS', (15, 12),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)
        cv2.putText(image, str(counter),
                    (10, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 2, cv2.LINE_AA)
        cv2.putText(image, 'STAGE', (65, 12),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)
        cv2.putText(image, stage if stage else '',
                    (60, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 2, cv2.LINE_AA)

        mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                                  mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=2, circle_radius=2),
                                  mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=2, circle_radius=2))

        cv2.imshow('Mediapipe Feed', image)
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break

# Cleanup
speech_queue.put(None)
cap.release()
cv2.destroyAllWindows()
