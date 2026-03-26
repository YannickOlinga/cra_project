import React from 'react'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>À propos</h3>
          <p>La gestion de compte rendu d'activité (CRA) en ligne automatisée et simplifiée</p>
        </div>
        
        <div className="footer-section">
          <h3>Liens rapides</h3>
          <ul>
            <li><a href="#home">Accueil</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#about">À propos</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Contact</h3>
          <p>Email: contact@terenick.com</p>
          <p>Téléphone: +33 1 23 45 67 89</p>
          <p>Adresse: 79 Rue du Dauphiné, 69003 Lyon</p>
        </div>
        
        <div className="footer-section">
          <h3>Suivez-nous</h3>
          <div className="social-links">
            <a href="#facebook" aria-label="Facebook">Facebook</a>
            <a href="#twitter" aria-label="Twitter">Twitter</a>
            <a href="#linkedin" aria-label="LinkedIn">LinkedIn</a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2026 Terenick. Tous droits réservés.</p>
      </div>
    </footer>
  )
}

export default Footer
