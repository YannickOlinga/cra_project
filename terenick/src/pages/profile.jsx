import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './profile.css';   
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

function generateCustomerIdentifier() {
  const randomPart = `${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 10)}`.toUpperCase();

  return `CLI-${randomPart}`.slice(0, 20);
}

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
  const [customerProfile, setCustomerProfile] = useState(
    session?.role === 'customer' ? session?.profile ?? null : null,
  );
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

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

  useEffect(() => {
    if (session?.role !== 'customer' || !session?.token) {
      return;
    }

    let isCancelled = false;

    function updateStoredCustomerProfile(nextCustomerProfile) {
      const nextSession = {
        ...session,
        profile: nextCustomerProfile,
      };

      setCustomerProfile(nextCustomerProfile);
      setSession(nextSession);
      localStorage.setItem('authSession', JSON.stringify(nextSession));
    }

    async function saveGeneratedIdentifier(customer) {
      const identifier = generateCustomerIdentifier();
      const fullName =
        `${customer.user?.first_name ?? user.first_name ?? ''} ${customer.user?.last_name ?? user.last_name ?? ''}`.trim() ||
        `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
      const email = customer.user?.email ?? user.email;

      if (!customer.id || !fullName || !email) {
        return customer;
      }

      const response = await fetch(`${apiBaseUrl}/customers/${customer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          name: fullName,
          email,
          ...(customer.company ? { company: customer.company } : {}),
          identifier,
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data) {
        return customer;
      }

      return data;
    }

    async function loadCustomerProfile() {
      try {
        let response = await fetch(`${apiBaseUrl}/customers/me`, {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });
        let data = await response.json().catch(() => null);

        if (!response.ok || !data) {
          response = await fetch(`${apiBaseUrl}/customers`, {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          });
          const customers = await response.json().catch(() => []);
          data = Array.isArray(customers) ? customers[0] : null;
        }

        if (!data) {
          return;
        }

        const nextCustomerProfile = data.identifier
          ? data
          : await saveGeneratedIdentifier(data);

        if (isCancelled) {
          return;
        }

        updateStoredCustomerProfile(nextCustomerProfile);
      } catch {
        // Le profil reste consultable meme si les donnees client ne chargent pas.
      }
    }

    loadCustomerProfile();

    return () => {
      isCancelled = true;
    };
  }, [
    apiBaseUrl,
    session?.role,
    session?.token,
    user.email,
    user.first_name,
    user.last_name,
  ]);

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

  async function handleDeleteAccount() {
    setMessage('');
    setErrorMessage('');

    if (!session?.token) {
      setErrorMessage('Session introuvable.');
      return;
    }

    const confirmed = window.confirm(
      'Supprimer définitivement votre compte ? Cette action est irréversible.',
    );

    if (!confirmed) {
      return;
    }

    setIsDeletingAccount(true);

    try {
      const response = await fetch(`${apiBaseUrl}/users/me`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const nextMessage = Array.isArray(data?.message)
          ? data.message.join(', ')
          : data?.message ?? 'Suppression impossible.';
        throw new Error(nextMessage);
      }

      localStorage.removeItem('authSession');
      window.location.href = '/';
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Une erreur est survenue.',
      );
    } finally {
      setIsDeletingAccount(false);
    }
  }

  return (
    <>
    <Navbar />
    <div className="profile-page">
      <section className="profile-shell">
       

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
            {role === 'customer' ? (
              <>
                <article className="profile-card">
                  <span className="profile-label">Entreprise</span>
                  <strong>{customerProfile?.company || '-'}</strong>
                </article>
                <article className="profile-card">
                  <span className="profile-label">Identifiant client</span>
                  <strong className="profile-identifier">
                    {customerProfile?.identifier || 'Génération en cours...'}
                  </strong>
                </article>
              </>
            ) : null}
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

          <div className="profile-danger-zone">
            <button
              className="profile-delete-account"
              type="button"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
            >
              {isDeletingAccount ? 'Suppression...' : 'Supprimer le compte'}
            </button>
          </div>
        </form> 
      </section>
    </div>
        <Footer/>
    </>
  );
}

export default Profile;
