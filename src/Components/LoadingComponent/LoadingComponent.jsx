import React from 'react';
import './LoadingComponent.css';

const LoadingComponent = () => {
  return (
    <div className="loader-container ">
      <div className="loader">
        <div className="text"><span>Loading</span></div>
        <div className="text"><span>Loading</span></div>
        <div className="text"><span>Loading</span></div>
        <div className="text"><span>Loading</span></div>
        <div className="text"><span>Loading</span></div>
        <div className="text"><span>Loading</span></div>
        <div className="text"><span>Loading</span></div>
        <div className="text"><span>Loading</span></div>
        <div className="text"><span>Loading</span></div>
        <div className="line" />
      </div>
      <p className="loader-text">Loading products data...</p>
    </div>
  );
}

export default LoadingComponent;