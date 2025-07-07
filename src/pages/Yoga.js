import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import React, { useRef, useState, useEffect } from 'react'
import Webcam from 'react-webcam'
import { count } from '../utils/AITrainer/music.js'; 

import Instructions from '../components/AITrainer/Instructions.js';
import '../styles/Yoga.css';
import DropDown from '../components/AITrainer/DropDown.js';
import { poseImages } from '../utils/AITrainer/pose_images.js';
import { POINTS, keypointConnections } from '../utils/AITrainer/data.js';
import { drawPoint, drawSegment } from '../utils/AITrainer/helper.js';
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

let skeletonColor = 'rgb(255,255,255)';
let poseList = ['Tree', 'Chair', 'Cobra', 'Warrior', 'Dog', 'Shoulderstand', 'Traingle'];

let interval;
let flag = false;

// ✅ Voice control flags
let spokenCorrect = false;
let spokenIncorrect = false;
let spokenRecord = false;

let correctPoseTime = 0;
let incorrectPoseTime = 0;
let lastEncouragement = 0;
let lastWarning = 0;

function Yoga() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [startingTime, setStartingTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [poseTime, setPoseTime] = useState(0);
  const [bestPerform, setBestPerform] = useState(0);
  const [currentPose, setCurrentPose] = useState('Tree');
  const [isStartPose, setIsStartPose] = useState(false);
  const [correctStart, setCorrectStart] = useState(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);

  function speak(text) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'en-US';
    window.speechSynthesis.speak(msg);
  }

  useEffect(() => {
    const timeDiff = (currentTime - startingTime) / 1000;
    if (flag) {
      setPoseTime(timeDiff);
    }
    if ((currentTime - startingTime) / 1000 > bestPerform) {
      setBestPerform(timeDiff);
      if (!spokenRecord) {
        speak("New record! Great job.");
        spokenRecord = true;
      }
    }
  }, [currentTime, bestPerform, startingTime]);

  useEffect(() => {
    let interval;
    if (flag && correctStart === null) {
      setCorrectStart(Date.now());
    }

    if (flag && correctStart !== null) {
      interval = setInterval(() => {
        const elapsed = (Date.now() - correctStart) / 1000;
        setPoseTime(accumulatedTime + elapsed);
      }, 100);
    }

    if (!flag && correctStart !== null) {
      const elapsed = (Date.now() - correctStart) / 1000;
      setAccumulatedTime(prev => prev + elapsed);
      setCorrectStart(null);
    }

    return () => clearInterval(interval);
  }, [correctStart, accumulatedTime]);

  useEffect(() => {
    setCurrentTime(0);
    setPoseTime(0);
    setBestPerform(0);
    spokenRecord = false;
  }, [currentPose]);

  const CLASS_NO = {
    Chair: 0, Cobra: 1, Dog: 2, No_Pose: 3, Shoulderstand: 4, Traingle: 5, Tree: 6, Warrior: 7,
  };

  function get_center_point(landmarks, left_bodypart, right_bodypart) {
    let left = tf.gather(landmarks, left_bodypart, 1)
    let right = tf.gather(landmarks, right_bodypart, 1)
    return tf.add(tf.mul(left, 0.5), tf.mul(right, 0.5))
  }

  function get_pose_size(landmarks, torso_size_multiplier = 2.5) {
    let hips_center = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
    let shoulders_center = get_center_point(landmarks, POINTS.LEFT_SHOULDER, POINTS.RIGHT_SHOULDER)
    let torso_size = tf.norm(tf.sub(shoulders_center, hips_center))
    let pose_center_new = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
    pose_center_new = tf.expandDims(pose_center_new, 1)
    pose_center_new = tf.broadcastTo(pose_center_new, [1, 17, 2])
    let d = tf.gather(tf.sub(landmarks, pose_center_new), 0, 0)
    let max_dist = tf.max(tf.norm(d, 'euclidean', 0))
    return tf.maximum(tf.mul(torso_size, torso_size_multiplier), max_dist)
  }

  function normalize_pose_landmarks(landmarks) {
    let pose_center = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
    pose_center = tf.expandDims(pose_center, 1)
    pose_center = tf.broadcastTo(pose_center, [1, 17, 2])
    landmarks = tf.sub(landmarks, pose_center)
    let pose_size = get_pose_size(landmarks)
    return tf.div(landmarks, pose_size)
  }

  function landmarks_to_embedding(landmarks) {
    landmarks = normalize_pose_landmarks(tf.expandDims(landmarks, 0))
    return tf.reshape(landmarks, [1, 34])
  }

  const runMovenet = async () => {
    const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER };
    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
    const poseClassifier = await tf.loadLayersModel('https://models.s3.jp-tok.cloud-object-storage.appdomain.cloud/model.json')
    const countAudio = new Audio(count)
    countAudio.loop = true
    interval = setInterval(() => { detectPose(detector, poseClassifier, countAudio) }, 100)
  }

  const detectPose = async (detector, poseClassifier, countAudio) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      let notDetected = 0;
      const video = webcamRef.current.video;
      const pose = await detector.estimatePoses(video);
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      try {
        const keypoints = pose[0].keypoints;
        let input = keypoints.map((keypoint) => {
          if (keypoint.score > 0.4) {
            if (!(keypoint.name === 'left_eye' || keypoint.name === 'right_eye')) {
              drawPoint(ctx, keypoint.x, keypoint.y, 8, 'rgb(255,255,255)')
              let connections = keypointConnections[keypoint.name]
              try {
                connections.forEach((connection) => {
                  let conName = connection.toUpperCase()
                  drawSegment(ctx, [keypoint.x, keypoint.y],
                    [keypoints[POINTS[conName]].x, keypoints[POINTS[conName]].y],
                    skeletonColor)
                })
              } catch (err) { }
            }
          } else {
            notDetected += 1;
          }
          return [keypoint.x, keypoint.y]
        });

        if (notDetected > 4) {
          skeletonColor = 'rgb(255,255,255)';
          return;
        }

        const processedInput = landmarks_to_embedding(input);
        const classification = poseClassifier.predict(processedInput);

        classification.array().then((data) => {
          const classNo = CLASS_NO[currentPose];
          if (data[0][classNo] > 0.97) {
            if (!flag) {
              countAudio.play();
              setStartingTime(new Date(Date()).getTime());
              flag = true;

              if (!spokenCorrect) {
                speak("Great pose! Hold it steady.");
                spokenCorrect = true;
                spokenIncorrect = false;
              }
            }

            setCurrentTime(new Date(Date()).getTime());
            skeletonColor = 'rgb(0,255,0)';
            correctPoseTime += 0.1;
            incorrectPoseTime = 0;

            if (correctPoseTime - lastEncouragement >= 5) {
              const encouragements = [
                "Nice work!",
                "You're doing great!",
                "Hold it, almost there!",
                "Awesome form!",
                "You're smashing it!",
                "You're becoming a legend!"
              ];
              const index = Math.floor(correctPoseTime / 5) - 1;
              speak(encouragements[Math.min(index, encouragements.length - 1)]);
              lastEncouragement = correctPoseTime;
            }

          } else {
            if (flag && !spokenIncorrect) {
              speak("Try adjusting your position.");
              spokenIncorrect = true;
              spokenCorrect = false;
            }

            flag = false;
            skeletonColor = 'rgb(255,255,255)';
            countAudio.pause();
            countAudio.currentTime = 0;

            incorrectPoseTime += 0.1;
            correctPoseTime = 0;

            if (incorrectPoseTime - lastWarning >= 5) {
              const warnings = [
                "Don't give up! Try again.",
                "Adjust your pose a little.",
                "You're close – just a bit more!",
                "Focus! You can do this!",
                "Don't waste time – get back in!"
              ];
              const randomIndex = Math.floor(Math.random() * warnings.length);
              speak(warnings[randomIndex]);
              lastWarning = incorrectPoseTime;
            }
          }
        });

      } catch (err) {
        console.log(err);
      }
    }
  }

  function startYoga() {
    setIsStartPose(true);
    runMovenet();
  }

  function stopPose() {
    setIsStartPose(false);
    clearInterval(interval);
    window.speechSynthesis.cancel();

    const db = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      addDoc(collection(db, "users", user.uid, "aiSessions"), {
        exerciseType: "yoga",
        pose: currentPose,
        duration: Math.round((Date.now() - startingTime) / 1000),
        timestamp: serverTimestamp(),
      }).then(() => {
        console.log("Yoga session saved!");
      }).catch((error) => {
        console.error("Error saving session:", error);
      });
    }
  }

  if (isStartPose) {
    return (
      <div className="yoga-container">
        <div className="performance-container">
          <button onClick={stopPose} className="secondary-btn">Stop Pose</button>
          <div className="pose-performance">
            <h4>Pose Time: {poseTime} s</h4>
          </div>
          <div className="pose-performance">
            <h4>Best: {bestPerform} s</h4>
          </div>
        </div>
        <div className="webcam-pose-container">
          <div className="webcam-container">
            <Webcam width='640px' height='480px' id="webcam" ref={webcamRef} />
            <canvas ref={canvasRef} id="my-canvas" width='640px' height='480px' style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}></canvas>
          </div>
          <img src={poseImages[currentPose]} className="pose-img" alt='currentPose' />
        </div>
      </div>
    );
  }

  return (
    <div className="yoga-container">
      <DropDown poseList={poseList} currentPose={currentPose} setCurrentPose={setCurrentPose} />
      <Instructions currentPose={currentPose} />
      <button onClick={startYoga} className="secondary-btn">Start Pose</button>
    </div>
  );
}

export default Yoga;
