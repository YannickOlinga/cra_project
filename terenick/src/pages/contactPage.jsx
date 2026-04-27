import React, { useEffect, useRef, useState } from 'react'
import './contactPage.css'
import {
  getRecaptchaV2Response,
  renderRecaptchaV2,
  resetRecaptchaV2,
} from '../utils/recaptchaV2'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState('')
  const recaptchaRef = useRef(null)
  const recaptchaWidgetIdRef = useRef(null)

  useEffect(() => {
    let isCancelled = false

    renderRecaptchaV2(recaptchaRef.current)
      .then((widgetId) => {
        if (!isCancelled) {
          recaptchaWidgetIdRef.current = widgetId
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setSubmitStatus('error')
        }
      })

    return () => {
      isCancelled = true
    }
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('')

    try {
      const recaptchaToken = getRecaptchaV2Response(recaptchaWidgetIdRef.current)
      if (!recaptchaToken) {
        throw new Error('Veuillez valider le reCAPTCHA.')
      }

      const response = await fetch(`${apiBaseUrl}/mail/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          website: formData.website.trim(),
          recaptchaToken,
        }),
      })

      if (!response.ok) {
        throw new Error("Impossible d'envoyer le message.")
      }

      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        website: ''
      })
      resetRecaptchaV2(recaptchaWidgetIdRef.current)
    } catch {
      setSubmitStatus('error')
      resetRecaptchaV2(recaptchaWidgetIdRef.current)
    } finally {
      setIsSubmitting(false)
    }
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
                  <div className="contact-honeypot" aria-hidden="true">
                    <label htmlFor="website">Site web</label>
                    <input
                      type="text"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>
                  <div className="form-group-exact">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Nom"
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    ></textarea>
                  </div>

                  <div className="recaptcha-notice-exact">
                    <div ref={recaptchaRef} className="recaptcha-widget"></div>
                  </div>
                  
                  <button type="submit" className="submit-btn-exact" disabled={isSubmitting}>
                    {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
                  </button>
                  {submitStatus === 'success' ? (
                    <p className="contact-submit-message contact-submit-message-success">
                      Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
                    </p>
                  ) : null}
                  {submitStatus === 'error' ? (
                    <p className="contact-submit-message contact-submit-message-error">
                      Une erreur est survenue. Veuillez réessayer.
                    </p>
                  ) : null}
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
                    <p>contact.terenick@gmail.com</p>
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
