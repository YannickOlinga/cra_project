import { useState } from 'react';
import './register_forget_password.css';

function RegisterForgetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim()) {
      setMessage('Veuillez renseigner votre adresse e-mail.');
      return;
    }

    setMessage(
      "Si un compte existe avec cette adresse, un lien de réinitialisation a été envoyé.",
    );
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

          {message ? <p className="forgot-message">{message}</p> : null}

          <button className="forgot-submit" type="submit">
            Envoyer le lien
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
