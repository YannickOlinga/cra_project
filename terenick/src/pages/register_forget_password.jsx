import { useState } from 'react';
import './register_forget_password.css';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function RegisterForgetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setMessageType('');

    if (!email.trim()) {
      setMessage('Veuillez renseigner votre adresse e-mail.');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ?? "Impossible d'envoyer le lien de réinitialisation.",
        );
      }

      setMessage(
        data.message ??
          "Si un compte existe avec cette adresse, un lien de réinitialisation a été envoyé.",
      );
      setMessageType('success');
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="forgot-layout">
      <section className="forgot-panel">
        <form className="forgot-form" onSubmit={handleSubmit}>
          <p className="forgot-kicker">Accès au compte</p>
          <h1 className="forgot-title">Mot de passe oublié</h1>
          <p className="forgot-description">
            Entrez votre adresse e-mail pour recevoir un lien de
            réinitialisation de mot de passe.
          </p>

          <input
            className="forgot-field"
            type="email"
            placeholder="Votre adresse e-mail"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          {message ? (
            <p className={`forgot-message forgot-message--${messageType}`}>
              {message}
            </p>
          ) : null}

          <button className="forgot-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Envoi...' : 'Envoyer le lien'}
          </button>

          <p className="forgot-back">
            <a href="/login">Retour à la connexion</a>
          </p>
        </form>
      </section>

      <section className="forgot-visual">
        <div className="forgot-visual-card">
          <div className="forgot-icon">?</div>
          <p>Sécurisez l’accès à votre espace.</p>
        </div>
      </section>
    </div>
  );
}

export default RegisterForgetPassword;
