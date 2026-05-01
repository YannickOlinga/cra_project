import React, { useEffect, useState } from 'react';
import './AddCustomerModal.css';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const initialForm = {
  name: '',
  email: '',
  company: '',
  identifier: '',
};

function getCustomerForm(customer) {
  if (!customer) {
    return initialForm;
  }

  const fullName =
    `${customer.user?.first_name ?? ''} ${customer.user?.last_name ?? ''}`.trim();

  return {
    name: fullName,
    email: customer.user?.email ?? '',
    company: customer.company ?? '',
    identifier: customer.identifier ?? '',
  };
}

export default function AddCustomerModal({
  isOpen,
  onClose,
  onCreated,
  onUpdated,
  customer = null,
  mode = 'create',
}) {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [keepAdding, setKeepAdding] = useState(false);
  const isEditMode = mode === 'edit';

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialForm);
      setErrorMessage('');
      setIsSubmitting(false);
      setKeepAdding(false);
      return;
    }

    setFormData(getCustomerForm(customer));
    setErrorMessage('');
    setIsSubmitting(false);
    setKeepAdding(false);
  }, [customer, isOpen]);

  if (!isOpen) return null;

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
    setErrorMessage('');
  }

  function handleUnauthorized() {
    localStorage.removeItem('authSession');
    window.location.href = '/login';
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const session = JSON.parse(localStorage.getItem('authSession') ?? 'null');
    if (!session?.token) {
      setErrorMessage('Session introuvable. Reconnecte-toi.');
      return;
    }

    const trimmedIdentifier = formData.identifier.trim();
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      ...(formData.company.trim() ? { company: formData.company.trim() } : {}),
      ...(trimmedIdentifier ? { identifier: trimmedIdentifier } : {}),
    };

    if (!isEditMode && !payload.name && !payload.email && !trimmedIdentifier) {
      setErrorMessage(
        'Renseignez au moins un identifiant client ou les informations du client.',
      );
      return;
    }

    if (!trimmedIdentifier && (!payload.name || !payload.email)) {
      setErrorMessage(
        'Le nom et l’adresse mail sont obligatoires sans identifiant client.',
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = isEditMode
        ? `${apiBaseUrl}/customers/${customer.id}`
        : `${apiBaseUrl}/customers`;

      const response = await fetch(endpoint, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(', ')
          : data?.message ?? 'Impossible de créer le client.';
        throw new Error(message);
      }

      if (isEditMode) {
        onUpdated?.(data);
      } else {
        onCreated?.(data, { keepAdding });
      }

      if (!isEditMode && keepAdding) {
        setFormData(initialForm);
        return;
      }

      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof TypeError
          ? "Impossible de joindre l'API."
          : error instanceof Error
            ? error.message
            : 'Une erreur est survenue.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="customer-modal-overlay">
      <div className="customer-modal">
        <div className="customer-modal-header">
          <h2>{isEditMode ? 'Modifier le client' : 'Ajouter un client'}</h2>
          <button type="button" className="customer-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="customer-modal-form" onSubmit={handleSubmit}>
          <label className="customer-field">
            <span>Nom</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Jean Dupont"
              required={!formData.identifier.trim()}
            />
          </label>

          <label className="customer-field">
            <span>Adresse mail</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ex: jean@entreprise.com"
              required={!formData.identifier.trim()}
            />
          </label>

          <label className="customer-field">
            <span>Nom d’entreprise</span>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Optionnel"
            />
          </label>

          <label className="customer-field">
            <span>Identifiant client</span>
            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              maxLength={20}
              placeholder="Ex: CLI-ABC123"
            />
            <small className="customer-field-help">
              Si le client existe déjà, utilisez l’identifiant affiché dans son profil
              pour le rattacher.
            </small>
          </label>

          {!isEditMode ? (
            <label className="customer-keep-adding">
              <input
                type="checkbox"
                checked={keepAdding}
                onChange={(event) => setKeepAdding(event.target.checked)}
              />
              <span>Ajouter un autre client après celui-ci</span>
            </label>
          ) : null}

          {errorMessage ? <p className="customer-modal-error">{errorMessage}</p> : null}

          <div className="customer-modal-actions">
            <button type="button" className="customer-btn customer-btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="customer-btn customer-btn-primary" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? 'Enregistrement...'
                  : 'Création...'
                : isEditMode
                  ? 'Enregistrer'
                  : keepAdding
                    ? 'Créer et continuer'
                    : 'Créer le client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
