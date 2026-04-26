import React, { useState } from 'react';
import './AddCustomerModal.css';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export default function DeleteCustomerModal({
  isOpen,
  customer,
  onClose,
  onDeleted,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !customer) return null;

  const fullName =
    `${customer.user?.first_name ?? ''} ${customer.user?.last_name ?? ''}`.trim() ||
    `Client #${customer.id}`;

  function handleUnauthorized() {
    localStorage.removeItem('authSession');
    window.location.href = '/login';
  }

  async function handleDelete() {
    const session = JSON.parse(localStorage.getItem('authSession') ?? 'null');
    if (!session?.token) {
      setErrorMessage('Session introuvable. Reconnecte-toi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${apiBaseUrl}/customers/${customer.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = Array.isArray(data?.message)
          ? data.message.join(', ')
          : data?.message ?? 'Impossible de supprimer le client.';
        throw new Error(message);
      }

      onDeleted?.(customer.id);
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Une erreur est survenue.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="customer-modal-overlay">
      <div className="customer-modal customer-modal-danger">
        <div className="customer-modal-header">
          <h2>Supprimer le client</h2>
          <button type="button" className="customer-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="customer-modal-form">
          <p className="customer-modal-warning">
            Tu vas supprimer <strong>{fullName}</strong>. Cette action est irréversible.
          </p>

          {errorMessage ? <p className="customer-modal-error">{errorMessage}</p> : null}

          <div className="customer-modal-actions">
            <button type="button" className="customer-btn customer-btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button
              type="button"
              className="customer-btn customer-btn-danger"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
