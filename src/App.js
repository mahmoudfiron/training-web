import React from 'react';
import './App.css';
import NavBar from './components/NavBar';
import Footer from './components/Footer'; // Footer will be created next.
import HomePage from './components/HomePage'; // HomePage will be created next.

function App() {
  return (
    <div className="App">
      <NavBar />
      <HomePage />
      <Footer />
    </div>
  );
}

export default App;