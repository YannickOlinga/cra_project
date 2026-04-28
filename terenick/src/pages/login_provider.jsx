import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './provider.css'
import './login.css'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function LoginProvider() {
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
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message ?? 'Identifiants invalides.');
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

      navigate('/dashboard');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    
    <>
    <div className="login-layout">
        <form onSubmit={handleSubmit} className='login-form-panel login-form'>
            <input
              type="email"
              placeholder="Email"
              className='login-field'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              className='login-field'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
            {errorMessage ? <p className="login-error">{errorMessage}</p> : null}
            <button type="submit" className='login-submit' disabled={isSubmitting}>
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
      <div className="login-image">
        
      </div>
    </div>
    
    </>


  )
}

export default LoginProvider