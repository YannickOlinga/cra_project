import { useEffect, useState } from 'react';
import './register_forget_password.css';
import Navbar from '../components/Navbar';
import {
  formatRateLimitTime,
  getRateLimitRemainingSeconds,
  recordRateLimitAttempt,
} from '../utils/rateLimit';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const forgotPasswordRateLimitKey = 'rateLimit:forgotPassword';

function getForgotPasswordErrorMessage(data) {
  const messages = Array.isArray(data?.message)
    ? data.message
    : [data?.message].filter(Boolean);

  if (
    messages.some((message) =>
      String(message).toLowerCase().includes('email must be an email'),
    )
  ) {
    return 'Veuillez saisir une adresse e-mail valide.';
  }

  return messages.join(' ') || "Impossible d'envoyer le lien de réinitialisation.";
}

function RegisterForgetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitRemaining, setRateLimitRemaining] = useState(() =>
    getRateLimitRemainingSeconds(forgotPasswordRateLimitKey),
  );

  useEffect(() => {
    if (rateLimitRemaining <= 0) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setRateLimitRemaining(
        getRateLimitRemainingSeconds(forgotPasswordRateLimitKey),
      );
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [rateLimitRemaining]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setMessageType('');

    if (!email.trim()) {
      setMessage('Veuillez renseigner votre adresse e-mail.');
      setMessageType('error');
      return;
    }

    const currentRemaining = getRateLimitRemainingSeconds(forgotPasswordRateLimitKey);
    if (currentRemaining > 0) {
      setRateLimitRemaining(currentRemaining);
      setMessage(
        `Trop de tentatives. Réessayez dans ${formatRateLimitTime(currentRemaining)}.`,
      );
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
        throw new Error(getForgotPasswordErrorMessage(data));
      }

      setMessage(
        data.message ??
          "Si un compte existe avec cette adresse, un lien de réinitialisation a été envoyé.",
      );
      setMessageType('success');
      const nextRemaining = recordRateLimitAttempt(forgotPasswordRateLimitKey);
      setRateLimitRemaining(nextRemaining);
    } catch (error) {
      const nextRemaining = recordRateLimitAttempt(forgotPasswordRateLimitKey);
      setRateLimitRemaining(nextRemaining);
      setMessage(
        nextRemaining > 0
          ? `Trop de tentatives. Réessayez dans ${formatRateLimitTime(nextRemaining)}.`
          : error.message,
      );
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="forgot-layout">
      <Navbar />
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

          <button className="forgot-submit" type="submit" disabled={isSubmitting || rateLimitRemaining > 0}>
            {rateLimitRemaining > 0
              ? `Réessayer dans ${formatRateLimitTime(rateLimitRemaining)}`
              : isSubmitting
                ? 'Envoi...'
                : 'Envoyer le lien'}
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
