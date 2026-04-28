import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './provider.css';
import Navbar from '../components/Navbar';
import {
  getRecaptchaV2Response,
  renderRecaptchaV2,
  resetRecaptchaV2,
} from '../utils/recaptchaV2';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function SignupProvider() {
  const navigate = useNavigate();
  const [role, setRole] = useState('provider');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    company: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const recaptchaRef = useRef(null);
  const recaptchaWidgetIdRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;

    renderRecaptchaV2(recaptchaRef.current)
      .then((widgetId) => {
        if (!isCancelled) {
          recaptchaWidgetIdRef.current = widgetId;
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          console.error('reCAPTCHA render error:', error);
          setErrorMessage('reCAPTCHA est indisponible.');
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (role === 'customer' && !formData.company.trim()) {
      setErrorMessage("Le champ entreprise est obligatoire pour un client.");
      return;
    }

    setIsSubmitting(true);

    try {
      const recaptchaToken = getRecaptchaV2Response(recaptchaWidgetIdRef.current);
      if (!recaptchaToken) {
        throw new Error('Veuillez valider le reCAPTCHA.');
      }

      const payload = {
        role,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        recaptchaToken,
        ...(role === 'customer' ? { company: formData.company.trim() } : {}),
      };

      const response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(', ')
          : data?.message ?? "L'inscription a échoué.";
        throw new Error(message);
      }

      localStorage.setItem(
        'authSession',
        JSON.stringify({
          token: data.access_token,
          user: data.user,
          role: data.role,
          profile: data.profile,
        }),
      );

      setSuccessMessage('Compte créé. Redirection vers votre espace...');
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        company: '',
      });
      resetRecaptchaV2(recaptchaWidgetIdRef.current);

      window.setTimeout(() => {
        navigate('/compte-rendu');
      }, 1200);
    } catch (error) {
      const message =
        error instanceof TypeError
          ? "Impossible de joindre l'API. Vérifie que le backend tourne et que l'URL API est correcte."
          : error instanceof Error
            ? error.message
            : 'Une erreur est survenue.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="signup-layout">
        <section className="signup-form-panel">
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="role-group">
              <p className="role-title">Je m'inscris en tant que</p>

              <label
                className={`role-option ${role === 'customer' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={role === 'customer'}
                  onChange={(event) => setRole(event.target.value)}
                />
                <span>Client</span>
              </label>

              <label
                className={`role-option ${role === 'provider' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="role"
                  value="provider"
                  checked={role === 'provider'}
                  onChange={(event) => setRole(event.target.value)}
                />
                <span>Prestataire</span>
              </label>
            </div>

            <input type="hidden" name="role" value={role} />
            <input
              type="text"
              className="signup-field"
              name="last_name"
              placeholder="Nom"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              className="signup-field"
              name="first_name"
              placeholder="Prénom"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            {role === 'customer' ? (
              <input
                type="text"
                className="signup-field"
                name="company"
                placeholder="Entreprise"
                value={formData.company}
                onChange={handleChange}
                required
              />
            ) : null}
            <input
              type="email"
              className="signup-field"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              className="signup-field"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
            {errorMessage ? (
              <p className="form-message error">{errorMessage}</p>
            ) : null}
            {successMessage ? (
              <p className="form-message success">{successMessage}</p>
            ) : null}
            <div className="signup-recaptcha">
              <div ref={recaptchaRef} className="recaptcha-widget"></div>
            </div>
            <button className="signup-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Inscription...' : 'S\'inscrire'}
            </button>
          </form>
        </section>

        <div className="signup-media-panel">
          <div className="img_div"></div>
        </div>
      </div>
    </>
  );
}

export default SignupProvider;
