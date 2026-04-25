import React from 'react'
import './aboutPage.css'

function AboutPage() {
  return (
    <div className="about-page">
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

      {/* Values Section */}
      <section className="values">
        <div className="container">
          <h2>Nos Valeurs</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              </div>
              <h3>Simplicité</h3>
              <p>Une interface épurée et intuitive pour une utilisation sans effort</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <h3>Efficacité</h3>
              <p>Automatisation intelligente pour un gain de temps maximal</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3>Fiabilité</h3>
              <p>Une plateforme stable et sécurisée pour vos données professionnelles</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h3>Innovation</h3>
              <p>Des technologies de pointe au service de votre productivité</p>
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
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Team member" 
                />
              </div>
              <h3>Alexandre Martin</h3>
              <p className="role">CEO & Fondateur</p>
              <p className="bio">Visionnaire passionné par l'innovation technologique</p>
            </div>
            <div className="team-member">
              <div className="member-image">
                <img 
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Team member" 
                />
              </div>
              <h3>Sophie Dubois</h3>
              <p className="role">Directrice Technique</p>
              <p className="bio">Expertise en développement et architecture logicielle</p>
            </div>
            <div className="team-member">
              <div className="member-image">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Team member" 
                />
              </div>
              <h3>Thomas Bernard</h3>
              <p className="role">Designer UX/UI</p>
              <p className="bio">Créatif dédié à l'expérience utilisateur optimale</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Clients Actifs</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">CRA Générés</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
