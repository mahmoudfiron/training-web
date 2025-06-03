from flask import Flask, Response, render_template, jsonify, request
import firebase_admin
from firebase_admin import credentials, firestore
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np

# 🔵 Import squat trainer if needed
from squat_routes import squat_bp

app = Flask(__name__)
CORS(app)

should_reset = {'flag': False}

# 🔵 Register blueprint
app.register_blueprint(squat_bp)

rep_counter = {'count': 0, 'stage': None}

# ✅ Initialize Firebase Admin SDK only once
if not firebase_admin._apps:
    cred = credentials.Certificate("firebase-admin-key.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()


@app.route('/save-biceps-session', methods=['POST'])
def save_biceps_session():
    data = request.json
    uid = data.get('uid')
    reps = data.get('reps')

    if not uid or reps is None:
        return {"error": "Missing uid or reps"}, 400

    try:
        db.collection("users").document(uid).collection("aiSessions").add({
            "exerciseType": "biceps",
            "reps": reps,
            "timestamp": firestore.SERVER_TIMESTAMP
        })
        return {"status": "saved"}, 200
    except Exception as e:
        return {"error": str(e)}, 500


# ✅ Route for Biceps HTML page
@app.route('/biceps')
def biceps_trainer():
    uid = request.args.get('uid')  # Grab UID from query string
    return render_template('biceps.html', uid=uid)


# ✅ Serve current rep count as JSON
@app.route('/biceps/count')
def biceps_count():
    return jsonify(count=rep_counter['count'], stage=rep_counter['stage'])


@app.route('/biceps/reset')
def biceps_reset():
    rep_counter['count'] = 0
    should_reset['flag'] = True
    return jsonify(status="reset")


# ✅ Angle calculation helper
def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - \
        np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    if angle > 180.0:
        angle = 360 - angle
    return angle


# ✅ Biceps trainer video stream
@app.route('/biceps/video')
def biceps_video_feed():
    def generate():
        global rep_counter
        rep_counter['count'] = 0
        counter = 0
        stage = None

        mp_drawing = mp.solutions.drawing_utils
        mp_pose = mp.solutions.pose
        cap = cv2.VideoCapture(0)

        with mp_pose.Pose(min_detection_confidence=0.5,
                          min_tracking_confidence=0.5) as pose:
            while cap.isOpened():

                if should_reset['flag']:
                    counter = 0
                    stage = None
                    rep_counter['count'] = 0
                    should_reset['flag'] = False  # Reset the flag

                ret, frame = cap.read()
                if not ret:
                    break

                image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                image.flags.writeable = False
                results = pose.process(image)
                image.flags.writeable = True
                image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

                try:
                    landmarks = results.pose_landmarks.landmark
                    shoulder = [landmarks[mp_pose.PoseLandmark.
                                          LEFT_SHOULDER.value].x,
                                landmarks[mp_pose.PoseLandmark.
                                          LEFT_SHOULDER.value].y]
                    elbow = [landmarks[mp_pose.PoseLandmark.
                                       LEFT_ELBOW.value].x,
                             landmarks[mp_pose.PoseLandmark.
                                       LEFT_ELBOW.value].y]
                    wrist = [landmarks[mp_pose.PoseLandmark.
                                       LEFT_WRIST.value].x,
                             landmarks[mp_pose.PoseLandmark.
                                       LEFT_WRIST.value].y]

                    angle = calculate_angle(shoulder, elbow, wrist)

                    if angle > 160:
                        stage = "down"
                    if angle < 40 and stage == 'down':
                        stage = "up"
                        counter += 1
                        rep_counter['count'] = counter
                        rep_counter['stage'] = stage
                        print(f'Reps: {counter}')

                    # Draw angle
                    cv2.putText(image, str(round(angle, 2)),
                                tuple(np.multiply(elbow, [640, 480])
                                .astype(int)),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255),
                                2, cv2.LINE_AA)

                    # Draw counter + stage box
                    cv2.rectangle(image, (0, 0), (225, 73), (245, 117, 16), -1)
                    cv2.putText(image, 'REPS', (15, 12),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                                (0, 0, 0), 1, cv2.LINE_AA)
                    cv2.putText(image, str(counter), (10, 60),
                                cv2.FONT_HERSHEY_SIMPLEX,
                                2, (255, 255, 255), 2, cv2.LINE_AA)
                    cv2.putText(image, 'STAGE', (65, 12),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                                (0, 0, 0), 1, cv2.LINE_AA)
                    cv2.putText(image, stage if stage else '',
                                (60, 60), cv2.FONT_HERSHEY_SIMPLEX,
                                2, (255, 255, 255), 2, cv2.LINE_AA)

                except Exception as e:
                    print(f"Pose detection error: {e}")

                mp_drawing.draw_landmarks(image, results.pose_landmarks,
                                          mp_pose.POSE_CONNECTIONS)

                _, buffer = cv2.imencode('.jpg', image)
                frame = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

        cap.release()

    return Response(generate(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == '__main__':
    app.run(debug=True)
