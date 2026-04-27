import React from 'react'
import Navbar from '../components/Navbar'
import './aboutPage.css'
import Footer from '../components/Footer'
function AboutPage() {
  return (
    <div className="about-page">
      <Navbar />
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>À Propos de Terenick</h1>
            <p className="hero-subtitle">
              La solution moderne pour la gestion de compte rendu d'activité
            </p>
            <p className="hero-description">
              Nous transformons la gestion des CRA en une expérience simple, 
              efficace et agréable pour les professionnels et les entreprises.
            </p>
          </div>
          <div className="hero-image">
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
              alt="Team collaboration" 
            />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission">
        <div className="container">
          <div className="section-content">
            <div className="text-content">
              <h2>Notre Mission</h2>
              <p>
                Terenick simplifie la gestion des comptes rendus d'activité pour les professionnels 
                et les entreprises. Notre plateforme automatisée permet un suivi efficace, un gain 
                de temps considérable et une meilleure organisation du travail.
              </p>
              <p>
                Nous croyons que la technologie devrait faciliter le quotidien professionnel, 
                pas le compliquer. C'est pourquoi nous avons développé une solution intuitive, 
                accessible et performante.
              </p>
            </div>
            <div className="image-content">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Modern office" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team">
        <div className="container">
          <h2>Notre Équipe</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-image">
                <img 
                  src="../../public/Capture d’écran 2026-04-27 à 12.01.16.png" 
                  alt="Team member" 
                />
              </div>
              <h3>Yannick Olinga</h3>
              <p className="role">CEO & Fondateur</p>
              <p className="bio">Visionnaire passionné par l'innovation technologique</p>
            </div>
            <div className="team-member">
              <div className="member-image">
                <img 
                  src="../../public/Capture d’écran 2026-04-27 à 11.59.54.png" 
                  alt="Team member" 
                />
              </div>
              <h3>Terence Mayombo</h3>
              <p className="role">Directrice Technique</p>
              <p className="bio">Expertise en développement et architecture logicielle</p>
            </div>
            
          </div>
        </div>
      </section>
      <Footer />

    </div>
  )
}

export default AboutPage
