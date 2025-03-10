import React from 'react';
import { poseImages } from '../../utils/AITrainer/pose_images.js';
import '../AITrainer/DropDown.css';

export default function DropDown({ poseList, currentPose, setCurrentPose }) {
  return (
    <div className='dropdown dropdown-container'>
      <button className="btn btn-secondary dropdown-toggle" type='button' data-bs-toggle="dropdown" id="pose-dropdown-btn" aria-expanded="false">
        {currentPose}
      </button>
      <ul className="dropdown-menu dropdown-custom-menu" aria-labelledby="dropdownMenuButton1">
        {poseList.map((pose) => (
          <li key={pose} onClick={() => setCurrentPose(pose)}>
            <div className="dropdown-item-container">
              <p className="dropdown-item-1">{pose}</p>
              <img src={poseImages[pose]} className="dropdown-img" alt={pose} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}