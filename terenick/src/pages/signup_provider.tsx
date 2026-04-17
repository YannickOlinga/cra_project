import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './provider.css';

type Role = 'provider' | 'customer';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
function SignupProvider() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('provider');
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

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

      const data = (await response.json().catch(() => null)) as
        | { message?: string | string[] }
        | null;

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
      <div className="provider-container">
        <div className="img_div"></div>

        <form onSubmit={handleSubmit}>
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
                onChange={(event) =>
                  setRole(event.target.value as Role)
                }
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
                onChange={(event) =>
                  setRole(event.target.value as Role)
                }
              />
              <span>Prestataire</span>
            </label>
          </div>

          <input type="hidden" name="role" value={role} />
          <input
            type="text"
            name="last_name"
            placeholder="Nom"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="first_name"
            placeholder="Prénom"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
          {role === 'customer' ? (
            <input
              type="text"
              name="company"
              placeholder="Entreprise"
              value={formData.company}
              onChange={handleChange}
              required
            />
          ) : null}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
          />
          {errorMessage ? <p className="form-message error">{errorMessage}</p> : null}
          {successMessage ? (
            <p className="form-message success">{successMessage}</p>
          ) : null}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Inscription...' : 'Sign up'}
          </button>
        </form>
      </div>
    </>
  );
}

export default SignupProvider;
