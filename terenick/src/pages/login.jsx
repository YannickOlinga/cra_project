import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import './login.css';
import {
  clearRateLimit,
  formatRateLimitTime,
  getRateLimitRemainingSeconds,
  recordRateLimitAttempt,
} from '../utils/rateLimit';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const loginRateLimitKey = 'rateLimit:login';

function getLoginErrorMessage(data) {
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

  if (
    messages.some((message) =>
      String(message)
        .toLowerCase()
        .includes('password must be longer than or equal to 8 characters'),
    )
  ) {
    return 'Le mot de passe doit contenir au moins 8 caractères.';
  }

  return messages.join(' ') || 'Identifiants invalides.';
}

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitRemaining, setRateLimitRemaining] = useState(() =>
    getRateLimitRemainingSeconds(loginRateLimitKey),
  );

  useEffect(() => {
    try {
      const session = JSON.parse(localStorage.getItem('authSession') ?? 'null');
      if (session?.token) {
        navigate('/compte-rendu', { replace: true });
      }
    } catch {
      localStorage.removeItem('authSession');
    }
  }, [navigate]);

  useEffect(() => {
    if (rateLimitRemaining <= 0) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setRateLimitRemaining(getRateLimitRemainingSeconds(loginRateLimitKey));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [rateLimitRemaining]);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');

    const currentRemaining = getRateLimitRemainingSeconds(loginRateLimitKey);
    if (currentRemaining > 0) {
      setRateLimitRemaining(currentRemaining);
      setErrorMessage(
        `Trop de tentatives. Réessayez dans ${formatRateLimitTime(currentRemaining)}.`,
      );
      return;
    }

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

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(getLoginErrorMessage(data));
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

      clearRateLimit(loginRateLimitKey);
      navigate('/compte-rendu');
    } catch (error) {
      const nextRemaining = recordRateLimitAttempt(loginRateLimitKey);
      setRateLimitRemaining(nextRemaining);
      setErrorMessage(
        nextRemaining > 0
          ? `Trop de tentatives. Réessayez dans ${formatRateLimitTime(nextRemaining)}.`
          : error.message,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
    <Navbar />
      <div className="login-layout">
        <section className="login-form-panel">
          <form className="login-form" onSubmit={handleSubmit}>
            <input
              className="login-field"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
            <div className="login-password-field">
              <input
                className="login-field login-password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                minLength={8}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
              </button>
            </div>
            {errorMessage ? <p className="login-error">{errorMessage}</p> : null}
            <button type="submit" className="login-submit" disabled={isSubmitting || rateLimitRemaining > 0}>
              {rateLimitRemaining > 0
                ? `Réessayer dans ${formatRateLimitTime(rateLimitRemaining)}`
                : isSubmitting
                  ? 'Connexion...'
                  : 'Se connecter'}
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
  );
}
 
export default Login;
