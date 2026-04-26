import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './profile.css';
import Footer from '../components/Footer';

function Profile() {
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const [session, setSession] = useState(
    JSON.parse(localStorage.getItem('authSession') ?? 'null'),
  );
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = session?.user ?? {};
  const role = session?.role ?? 'account';
  const roleLabel =
    role === 'provider'
      ? 'Prestataire'
      : role === 'customer'
        ? 'Client'
        : 'Compte';

  useEffect(() => {
    setFormData({
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      email: user.email ?? '',
      password: '',
    });
  }, [user.first_name, user.last_name, user.email]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const token = session?.token;

      if (!token) {
        throw new Error('Session introuvable.');
      }

      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        ...(formData.password.trim()
          ? { password: formData.password }
          : {}),
      };

      const response = await fetch(`${apiBaseUrl}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const nextMessage = Array.isArray(data?.message)
          ? data.message.join(', ')
          : data?.message ?? 'Mise à jour impossible.';
        throw new Error(nextMessage);
      }

      const nextSession = {
        ...session,
        user: data,
      };
      localStorage.setItem('authSession', JSON.stringify(nextSession));
      setSession(nextSession);
      setFormData((current) => ({
        ...current,
        password: '',
      }));
      setMessage('Profil mis à jour avec succès.');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Une erreur est survenue.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="profile-page">
      <section className="profile-shell">
        <Link to="/dashboard" className="profile-back">
          Retour au dashboard
        </Link>

        <p className="profile-kicker">Mon profil</p>
        <h1 className="profile-title">
          {user.first_name ?? 'Utilisateur'} {user.last_name ?? ''}
        </h1>
        <p className="profile-subtitle">
          Retrouvez ici les informations liées à votre compte.
        </p>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-grid">
            <label className="profile-card">
              <span className="profile-label">Prénom</span>
              <input
                className="profile-field"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </label>
            <label className="profile-card">
              <span className="profile-label">Nom</span>
              <input
                className="profile-field"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </label>
            <label className="profile-card">
              <span className="profile-label">Email</span>
              <input
                className="profile-field"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>
            <article className="profile-card">
              <span className="profile-label">Rôle</span>
              <strong>{roleLabel}</strong>
            </article>
            <label className="profile-card profile-card-full">
              <span className="profile-label">Nouveau mot de passe</span>
              <input
                className="profile-field"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                placeholder="Laisser vide pour ne pas modifier"
              />
            </label>
          </div>

          {message ? <p className="profile-message success">{message}</p> : null}
          {errorMessage ? (
            <p className="profile-message error">{errorMessage}</p>
          ) : null}

          <button className="profile-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </form>
        <Footer className="profile-footer" variant="compact" />
      </section>
    </div>
  );
}

export default Profile;
