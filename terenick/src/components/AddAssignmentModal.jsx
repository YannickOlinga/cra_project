import React, { useEffect, useState } from 'react';
import './AddAssignmentModal.css';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const initialForm = {
  missionName: '',
  customerName: '',
  customerId: '',
};

export default function AddAssignmentModal({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState(initialForm);
  const [customers, setCustomers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialForm);
      setCustomers([]);
      setErrorMessage('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

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

    if (name === 'customerId') {
      const selectedCustomer = customers.find(
        (customer) => String(customer.id) === String(value),
      );
      if (selectedCustomer) {
        nextState.customerName =
          selectedCustomer.company ||
          `${selectedCustomer.user?.first_name ?? ''} ${selectedCustomer.user?.last_name ?? ''}`.trim();
      }
    }

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
    const trimmedCustomerName = formData.customerName.trim();
    const customerId = Number(formData.customerId);

    if (!trimmedMissionName || !trimmedCustomerName || !customerId) {
      setErrorMessage('Tous les champs sont obligatoires.');
      return;
    }

    setIsSubmitting(true);

    try {
      const customerResponse = await fetch(`${apiBaseUrl}/customers/${customerId}`, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      const customerData = await customerResponse.json().catch(() => null);
      if (!customerResponse.ok) {
        throw new Error(customerData?.message ?? 'Client introuvable.');
      }

      const customerDisplayName =
        customerData?.company?.trim?.() ||
        `${customerData?.user?.first_name ?? ''} ${customerData?.user?.last_name ?? ''}`.trim();

      if (customerDisplayName.toLowerCase() !== trimmedCustomerName.toLowerCase()) {
        throw new Error("Le nom du client ne correspond pas à l'ID fourni.");
      }

      const createResponse = await fetch(`${apiBaseUrl}/assignments/`, {
        method: 'POST',
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
          : createdAssignment?.message ?? "Impossible d'ajouter la mission.";
        throw new Error(message);
      }

      onCreated?.(createdAssignment);
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
          <h2>Ajouter une mission</h2>
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
            <span>Nom du client</span>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="Ex: CREDIT LYONNAIS"
              list="customers-list"
            />
          </label>

          <label className="assignment-field">
            <span>ID du client</span>
            <input
              type="number"
              min="1"
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              placeholder="Ex: 3"
            />
          </label>

          <datalist id="customers-list">
            {customers.map((customer) => (
              <option
                key={customer.id}
                value={
                  customer.company ||
                  `${customer.user?.first_name ?? ''} ${customer.user?.last_name ?? ''}`.trim()
                }
              >
                {customer.user?.email ?? ''}
              </option>
            ))}
          </datalist>

          {errorMessage ? <p className="assignment-modal-error">{errorMessage}</p> : null}

          <div className="assignment-modal-actions">
            <button type="button" className="assignment-btn assignment-btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="assignment-btn assignment-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Création...' : 'Créer la mission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
