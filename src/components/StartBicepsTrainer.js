import React from 'react';

function StartBicepsTrainer() {
  const openTrainer = () => {
    window.open("http://localhost:5000/biceps", "_blank");
  };

  return (
    <div>
      <h2>Biceps AI Trainer</h2>
      <button onClick={openTrainer} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Start Biceps Trainer
      </button>
    </div>
  );
}

export default StartBicepsTrainer;
