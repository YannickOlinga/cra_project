 import React from 'react'
import bgVideo from '../../public/b.mp4'; 
import Button from './Button';
import './Hero.css';  

function Hero() {
  return (
    <header className="hero">
      <video className="bg-video" src={bgVideo} autoPlay loop muted playsInline>
        <h1>La gestion de compte rendu d'activité (CRA) en ligne automatisée et simplifiée</h1>
      </video>
     
      
        
    </header>
  );
}

export default Hero;
