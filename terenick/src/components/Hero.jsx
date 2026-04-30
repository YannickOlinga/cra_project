 import React from 'react'
import bgVideo from '../../public/b.mp4';  
import styles from './Hero.module.css';  

function Hero() {
  return (
    <header className={styles.hero}>
      <video className={styles.bgVideo} src={bgVideo} autoPlay loop muted playsInline>
      </video>
      
      <div className={styles.heroContent}>
        <div className={styles.heroTexts}>
          <h1>La gestion de compte rendu d'activité (CRA) en ligne automatisée et simplifiée</h1>
          <p>Suivez vos temps, gérez vos missions et optimisez votre productivité</p>
          <button className={styles.heroButton}>Commencer</button>
        </div>
      </div>
    </header>
  );
}

export default Hero;
