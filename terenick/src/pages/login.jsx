import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(', ')
          : data?.message ?? 'Connexion impossible.';
        throw new Error(message);
      }

      localStorage.setItem(
        'authSession',
        JSON.stringify({
          token: data?.access_token ?? '',
          user: data?.user ?? null,
          role: data?.role ?? null,
          profile: data?.profile ?? null,
        }),
      );

      navigate('/compte-rendu');
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
      <div className="login-layout">
        <section className="login-form-panel">
          <form className="login-form" onSubmit={handleSubmit}>
            <input
              className="login-field"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              className="login-field"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
            {errorMessage ? <p className="login-error">{errorMessage}</p> : null}
            <button type="submit" className="login-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </button>
            <p className="login-text">
              Vous n'avez pas de compte ? <a href="/signup_provider">S'inscrire</a>
            </p>
            <p className="login-text">
              Mot de passe oublié ? <a href="/register_forget_password">Cliquez ici</a>
            </p>
            <p className="login-text">
              <a href="/">Retour à l'accueil</a>
            </p>
          </form>
        </section>

        <section className="login-media-panel">
          <div className="login-image"></div>
        </section>
      </div>
    </>
  )
}
 
export default login
