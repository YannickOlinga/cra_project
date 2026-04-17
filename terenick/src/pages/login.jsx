import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function login() {
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
