import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './register_forget_password.css';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setMessageType('');

    if (!token) {
      setMessage('Le lien de réinitialisation est invalide ou incomplet.');
      setMessageType('error');
      return;
    }

    if (password.length < 8) {
      setMessage('Le mot de passe doit contenir au moins 8 caractères.');
      setMessageType('error');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas.');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ?? 'Impossible de réinitialiser le mot de passe.',
        );
      }

      setPassword('');
      setConfirmPassword('');
      setIsSuccess(true);
      setMessage(data.message ?? 'Mot de passe modifié avec succès.');
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
          <p className="forgot-kicker">Sécurité du compte</p>
          <h1 className="forgot-title">Nouveau mot de passe</h1>
          <p className="forgot-description">
            Choisissez un mot de passe sécurisé pour retrouver l’accès à votre
            espace.
          </p>

          <input
            className="forgot-field"
            type="password"
            placeholder="Nouveau mot de passe"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            disabled={isSubmitting || isSuccess}
          />

          <input
            className="forgot-field"
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={8}
            disabled={isSubmitting || isSuccess}
          />

          {message ? (
            <p className={`forgot-message forgot-message--${messageType}`}>
              {message}
            </p>
          ) : null}

          <button
            className="forgot-submit"
            type="submit"
            disabled={isSubmitting || isSuccess}
          >
            {isSubmitting ? 'Réinitialisation...' : 'Réinitialiser'}
          </button>

          <p className="forgot-back">
            <Link to="/login">Retour à la connexion</Link>
          </p>
        </form>
      </section>

      <section className="forgot-visual">
        <div className="forgot-visual-card">
          <div className="forgot-icon">✓</div>
          <p>Votre nouveau mot de passe protège l’accès à votre espace CRA.</p>
        </div>
      </section>
    </div>
  );
}

export default ResetPassword;
