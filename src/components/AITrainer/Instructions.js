// Instructions.js
import React, { useState } from 'react';
import { poseInstructions } from '../../utils/AITrainer/data.js';
import { poseImages } from '../../utils/AITrainer/pose_images.js';
import '../AITrainer/Instructions.css';

export default function Instructions({ currentPose }) {
    const [instructions] = useState(poseInstructions);

    return (
        <div className="instructions-container">
            <ul className="instructions-list">
                {instructions[currentPose].map((instruction, index) => (
                    <li key={index} className="instruction">{instruction}</li>
                ))}
            </ul>
            <img 
                className="pose-demo-img"
                src={poseImages[currentPose]}
                alt={`Pose demonstration for ${currentPose}`}
            />
        </div>
    );
}