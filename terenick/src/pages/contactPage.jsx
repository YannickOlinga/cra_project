import React, { useState } from 'react'
import './contactPage.css'

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    alert('Merci pour votre message. Nous vous répondrons dans les plus brefs délais.')
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    })
  }

  return (
    <div className="contact-page-exact">
      {/* Header */}
      <div className="contact-header-exact">
        <h1>Contactez-nous</h1>
      </div>

      {/* Main Content */}
      <div className="contact-main-exact">
        <div className="contact-container">
          <div className="contact-grid-exact">
            {/* Left Column - Form */}
            <div className="contact-left">
              <div className="contact-form-exact">
                <h2>Envoyez-nous un message</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group-exact">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Nom"
                    />
                  </div>
                  
                  <div className="form-group-exact">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Email"
                    />
                  </div>
                  
                  <div className="form-group-exact">
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="Sujet"
                    />
                  </div>
                  
                  <div className="form-group-exact">
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Message"
                    ></textarea>
                  </div>
                  
                  <button type="submit" className="submit-btn-exact">
                    Envoyer
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column - Contact Info */}
            <div className="contact-right">
              <div className="contact-info-exact">
                <h3>Informations de contact</h3>
                
                <div className="contact-item">
                  <div className="contact-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div className="contact-details">
                    <h4>Email</h4>
                    <p>contact@terenick.com</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div className="contact-details">
                    <h4>Téléphone</h4>
                    <p>+33 1 23 45 67 89</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div className="contact-details">
                    <h4>Adresse</h4>
                    <p>123 Avenue des Champs-Élysées<br />75008 Paris, France</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                  </div>
                  <div className="contact-details">
                    <h4>Heures d'ouverture</h4>
                    <p>Lundi - Vendredi<br />9h00 - 18h00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
