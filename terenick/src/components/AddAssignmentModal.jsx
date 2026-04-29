import React, { useEffect, useState } from 'react';
import './AddAssignmentModal.css';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const initialForm = {
  missionName: '',
  customerId: '',
};

function getAssignmentForm(assignment) {
  if (!assignment) {
    return initialForm;
  }

  return {
    missionName: assignment.label ?? '',
    customerId: assignment.customers_id ? String(assignment.customers_id) : '',
  };
}

export default function AddAssignmentModal({
  isOpen,
  onClose,
  onCreated,
  onUpdated,
  assignment = null,
  mode = 'create',
}) {
  const [formData, setFormData] = useState(initialForm);
  const [customers, setCustomers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isEditMode = mode === 'edit';

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialForm);
      setCustomers([]);
      setErrorMessage('');
      setIsSubmitting(false);
      return;
    }

    setFormData(getAssignmentForm(assignment));
    setErrorMessage('');
    setIsSubmitting(false);
  }, [assignment, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const session = JSON.parse(localStorage.getItem('authSession') ?? 'null');
    if (!session?.token) {
      return;
    }

    let isCancelled = false;

    async function loadCustomers() {
      try {
        const response = await fetch(`${apiBaseUrl}/customers`, {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });

        const data = await response.json().catch(() => []);
        if (!response.ok || !Array.isArray(data)) {
          throw new Error('Impossible de charger les clients.');
        }

        if (!isCancelled) {
          setCustomers(data);
        }
      } catch {
        if (!isCancelled) {
          setCustomers([]);
        }
      }
    }

    loadCustomers();

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  function handleChange(event) {
    const { name, value } = event.target;
    const nextState = {
      ...formData,
      [name]: value,
    };

    setFormData(nextState);
    setErrorMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const session = JSON.parse(localStorage.getItem('authSession') ?? 'null');
    if (!session?.token) {
      setErrorMessage('Session introuvable. Reconnecte-toi.');
      return;
    }

    const trimmedMissionName = formData.missionName.trim();
    const customerId = Number(formData.customerId);

    if (!trimmedMissionName || !customerId) {
      setErrorMessage('Tous les champs sont obligatoires.');
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = isEditMode
        ? `${apiBaseUrl}/assignments/${assignment.id}`
        : `${apiBaseUrl}/assignments/`;
      const createResponse = await fetch(endpoint, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          label: trimmedMissionName,
          customers_id: customerId,
          hourly_rate: 1,
          budget: 1,
        }),
      });

      const createdAssignment = await createResponse.json().catch(() => null);
      if (!createResponse.ok) {
        const message = Array.isArray(createdAssignment?.message)
          ? createdAssignment.message.join(', ')
          : createdAssignment?.message ??
            (isEditMode
              ? 'Impossible de modifier la mission.'
              : "Impossible d'ajouter la mission.");
        throw new Error(message);
      }

      const selectedCustomer =
        customers.find((customer) => Number(customer.id) === customerId) ?? null;

      const nextAssignment = {
        ...createdAssignment,
        customer: createdAssignment?.customer ?? selectedCustomer,
      };

      if (isEditMode) {
        onUpdated?.(nextAssignment);
      } else {
        onCreated?.(nextAssignment);
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
    <div className="assignment-modal-overlay">
      <div className="assignment-modal">
        <div className="assignment-modal-header">
          <h2>{isEditMode ? 'Modifier la mission' : 'Ajouter une mission'}</h2>
          <button type="button" className="assignment-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="assignment-modal-form" onSubmit={handleSubmit}>
          <label className="assignment-field">
            <span>Nom de la mission</span>
            <input
              type="text"
              name="missionName"
              value={formData.missionName}
              onChange={handleChange}
              placeholder="Ex: Refonte site vitrine"
            />
          </label>

          <label className="assignment-field">
            <span>Client</span>
            <select
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              disabled={customers.length === 0}
            >
              <option value="">
                {customers.length === 0
                  ? 'Aucun client disponible'
                  : 'Sélectionnez un client'}
              </option>
              {customers.map((customer) => {
                const customerName =
                  customer.company ||
                  `${customer.user?.first_name ?? ''} ${customer.user?.last_name ?? ''}`.trim() ||
                  `Client #${customer.id}`;

                return (
                  <option key={customer.id} value={customer.id}>
                    {customerName}
                    {customer.user?.email ? ` - ${customer.user.email}` : ''}
                  </option>
                );
              })}
            </select>
          </label>

          {errorMessage ? <p className="assignment-modal-error">{errorMessage}</p> : null}

          <div className="assignment-modal-actions">
            <button type="button" className="assignment-btn assignment-btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="assignment-btn assignment-btn-primary" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? 'Enregistrement...'
                  : 'Création...'
                : isEditMode
                  ? 'Enregistrer'
                  : 'Créer la mission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
