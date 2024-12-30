import React, { useState } from 'react';
import '../styles/CalculatorPage.css';
import calcImage from '../assets/images/calculator-page-image.jpg';

const CalculatorPage = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [exerciseLevel, setExerciseLevel] = useState('nospec');
  const [calorieIntake, setCalorieIntake] = useState('');

  const MET_DATA = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    hard: 1.725,
    nonstop: 1.9
  };

  const handleCalculate = () => {
    const bmr = calcBMR();
    if (bmr > 0) {
      const intake = bmr * MET_DATA[exerciseLevel];
      setCalorieIntake(intake.toFixed(2));
    }
  };

  const calcBMR = () => {
    if (!weight || !height || !age) {
      alert('Please complete all fields!');
      return 0;
    }

    const weightInKg = weight;
    const heightInCm = height;
    const ageInYears = age;

    let bmr = 66 + 13.7 * weightInKg + 5 * heightInCm - 6.8 * ageInYears;
    return bmr;
  };

  return (
    <div className="page-container">
      <div className="image-container">
      <img src={calcImage} alt="Calculator page background" />
      </div>
      <div className="calculator-container">
        <h1>Calories Calculator</h1>
        <div className="calculator-form">
          <label>
            Weight (kg):
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </label>
          <label>
            Height (cm):
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </label>
          <label>
            Age:
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </label>
          <label>
            Exercise Level:
            <select
              value={exerciseLevel}
              onChange={(e) => setExerciseLevel(e.target.value)}
            >
              <option value="nospec">No Specific</option>
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
              <option value="nonstop">Nonstop</option>
            </select>
          </label>
          <button onClick={handleCalculate}>Calculate</button>
        </div>
        {calorieIntake && (
          <div className="result">
            <h3>Your Daily Calorie Intake is:</h3>
            <p>{calorieIntake} kcal</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalculatorPage;