import React, { useState } from 'react'
import './modernContactPage.css'

function ModernContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState('')

  // Validation des champs
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide'
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Le sujet est requis'
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Le message est requis'
    } else if (formData.message.length < 10) {
      newErrors.message = 'Le message doit contenir au moins 10 caractères'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    setSubmitStatus('')
    
    // Simuler l'envoi du formulaire
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Succès
      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
      setErrors({})
      
      // Masquer le message de succès après 5 secondes
      setTimeout(() => {
        setSubmitStatus('')
      }, 5000)
      
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modern-contact-page">
      {/* Background avec particules animées */}
      <div className="background-animation">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="floating-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{ '--delay': `${i * 0.5}s` }}></div>
          ))}
        </div>
      </div>

      {/* Header Section */}
      <header className="contact-header">
        <div className="header-content">
          <div className="header-badge">
            <span>Contact</span>
          </div>
          <h1 className="header-title">
            Contactez-nous
          </h1>
          <p className="header-subtitle">
            Nous sommes là pour répondre à toutes vos questions et vous accompagner dans votre projet
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="contact-main">
        <div className="container">
          <div className="contact-grid">
            {/* Formulaire Section */}
            <section className="form-section">
              <div className="glass-card">
                <div className="card-header">
                  <h2>Envoyez-nous un message</h2>
                  <p>Nous vous répondrons dans les plus brefs délais</p>
                </div>
                
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Nom complet</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`form-input ${errors.name ? 'error' : ''}`}
                        placeholder="Jean Dupont"
                        disabled={isSubmitting}
                      />
                      {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`form-input ${errors.email ? 'error' : ''}`}
                        placeholder="jean@entreprise.com"
                        disabled={isSubmitting}
                      />
                      {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="subject">Sujet</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`form-input ${errors.subject ? 'error' : ''}`}
                      placeholder="Demande de démonstration"
                      disabled={isSubmitting}
                    />
                    {errors.subject && <span className="error-message">{errors.subject}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className={`form-textarea ${errors.message ? 'error' : ''}`}
                      placeholder="Décrivez votre demande en détail..."
                      rows={5}
                      disabled={isSubmitting}
                    ></textarea>
                    {errors.message && <span className="error-message">{errors.message}</span>}
                  </div>
                  
                  <button 
                    type="submit" 
                    className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="spinner"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        Envoyer le message
                        <svg className="button-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22,2 15,22 11,13 2,9"></polygon>
                        </svg>
                      </>
                    )}
                  </button>
                </form>
                
                {/* Messages de statut */}
                {submitStatus === 'success' && (
                  <div className="status-message success">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                    Message envoyé avec succès ! Nous vous répondrons rapidement.
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="status-message error">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    Une erreur est survenue. Veuillez réessayer.
                  </div>
                )}
              </div>
            </section>

            {/* Informations Section */}
            <section className="info-section">
              <div className="glass-card">
                <div className="card-header">
                  <h2>Informations de contact</h2>
                  <p>Plusieurs moyens pour nous joindre</p>
                </div>
                
                <div className="contact-info-list">
                  <div className="contact-info-item">
                    <div className="info-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <div className="info-content">
                      <h3>Email</h3>
                      <p>contact@terenick.com</p>
                      <span>Réponse sous 24h</span>
                    </div>
                  </div>
                  
                  <div className="contact-info-item">
                    <div className="info-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </div>
                    <div className="info-content">
                      <h3>Téléphone</h3>
                      <p>+33 1 23 45 67 89</p>
                      <span>Lun-Ven 9h-18h</span>
                    </div>
                  </div>
                  
                  <div className="contact-info-item">
                    <div className="info-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                    <div className="info-content">
                      <h3>Adresse</h3>
                      <p>123 Avenue des Champs-Élysées</p>
                      <span>75008 Paris, France</span>
                    </div>
                  </div>
                </div>
                
                {/* Réseaux Sociaux */}
                <div className="social-section">
                  <h3>Suivez-nous</h3>
                  <div className="social-links">
                    <a href="https://linkedin.com/company/terenick" target="_blank" rel="noopener noreferrer" className="social-link">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                    <a href="https://twitter.com/terenick" target="_blank" rel="noopener noreferrer" className="social-link">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 0 7 2c9 0 14-9 14-13 0 0 1.5-3.5 0-5z"/>
                      </svg>
                    </a>
                    <a href="https://github.com/terenick" target="_blank" rel="noopener noreferrer" className="social-link">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Carte Interactive */}
          <section className="map-section">
            <div className="glass-card">
              <div className="card-header">
                <h2>Nous trouver</h2>
                <p>123 Avenue des Champs-Élysées, Paris</p>
              </div>
              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9916256937595!2d2.295299815844311!3d48.87084497928756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66f1e4b7b3b5b%3A0x40b82c3688c9a0b!2sAvenue%20des%20Champs-%C3%89lys%C3%A9es!5e0!3m2!1sfr!2sfr!4v1620000000000!5m2!1sfr!2sfr"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title="Localisation Terenick"
                  className="map-iframe"
                ></iframe>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="contact-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>Terenick</h3>
              <p>La solution moderne pour la gestion de vos comptes rendus d'activité</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Produit</h4>
                <ul>
                  <li><a href="/features">Fonctionnalités</a></li>
                  <li><a href="/pricing">Tarifs</a></li>
                  <li><a href="/demo">Démonstration</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Entreprise</h4>
                <ul>
                  <li><a href="/about">À propos</a></li>
                  <li><a href="/contact">Contact</a></li>
                  <li><a href="/blog">Blog</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Légal</h4>
                <ul>
                  <li><a href="/privacy">Confidentialité</a></li>
                  <li><a href="/terms">Conditions</a></li>
                  <li><a href="/cookies">Cookies</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Terenick. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ModernContactPage
