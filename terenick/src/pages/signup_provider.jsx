import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './provider.css';
import Navbar from '../components/Navbar';
const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
function SignupProvider() {
  const navigate = useNavigate();
  const [role, setRole] = useState('provider');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    company: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (role === 'customer' && !formData.company.trim()) {
      setErrorMessage("Le champ entreprise est obligatoire pour un client.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        role,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        ...(role === 'customer' ? { company: formData.company.trim() } : {}),
      };

      const response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(', ')
          : data?.message ?? "L'inscription a échoué.";
        throw new Error(message);
      }

      setSuccessMessage('Compte créé. Redirection vers la connexion...');
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        company: '',
      });

      window.setTimeout(() => {
        navigate('/login_provider');
      }, 1200);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Une erreur est survenue.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="signup-layout">
        <section className="signup-form-panel">
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="role-group">
              <p className="role-title">Je m'inscris en tant que</p>

              <label
                className={`role-option ${role === 'customer' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={role === 'customer'}
                  onChange={(event) => setRole(event.target.value)}
                />
                <span>Client</span>
              </label>

              <label
                className={`role-option ${role === 'provider' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="role"
                  value="provider"
                  checked={role === 'provider'}
                  onChange={(event) => setRole(event.target.value)}
                />
                <span>Prestataire</span>
              </label>
            </div>

            <input type="hidden" name="role" value={role} />
            <input
              type="text"
              className="signup-field"
              name="last_name"
              placeholder="Nom"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              className="signup-field"
              name="first_name"
              placeholder="Prénom"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            {role === 'customer' ? (
              <input
                type="text"
                className="signup-field"
                name="company"
                placeholder="Entreprise"
                value={formData.company}
                onChange={handleChange}
                required
              />
            ) : null}
            <input
              type="email"
              className="signup-field"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              className="signup-field"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
            {errorMessage ? (
              <p className="form-message error">{errorMessage}</p>
            ) : null}
            {successMessage ? (
              <p className="form-message success">{successMessage}</p>
            ) : null}
            <button className="signup-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Inscription...' : 'S\'inscrire'}
            </button>
          </form>
        </section>

        <div className="signup-media-panel">
          <div className="img_div"></div>
        </div>
      </div>
    </>
  );
}

export default SignupProvider;
