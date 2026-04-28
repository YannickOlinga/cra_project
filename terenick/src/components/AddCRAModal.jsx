import React, { useEffect, useMemo, useState } from 'react';
import './AddCRAModal.css';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export default function AddCRAModal({ isOpen, onClose, onGenerate }) {
  const [session, setSession] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    periode: new Date().toISOString().slice(0, 7),
    prestataire: '',
    missions: [],
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const storedSession = localStorage.getItem('authSession');
    if (!storedSession) {
      setSession(null);
      setAssignments([]);
      setFormError("Aucune session active. Reconnecte-toi.");
      return;
    }

    try {
      const parsedSession = JSON.parse(storedSession);
      setSession(parsedSession);
      setFormData((current) => ({
        ...current,
        prestataire: `${parsedSession?.user?.first_name ?? ''} ${parsedSession?.user?.last_name ?? ''}`.trim(),
      }));
      setFormError('');
    } catch {
      setSession(null);
      setAssignments([]);
      setFormError("Session invalide. Reconnecte-toi.");
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !session?.token) {
      return;
    }

    let isCancelled = false;

    async function loadAssignments() {
      setIsLoadingAssignments(true);
      try {
        const response = await fetch(`${apiBaseUrl}/assignments/`, {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });

        const data = await response.json().catch(() => []);
        if (!response.ok) {
          throw new Error('Impossible de charger les missions.');
        }

        if (isCancelled) {
          return;
        }

        const nextAssignments = Array.isArray(data) ? data : [];
        setAssignments(nextAssignments);
        setFormData((current) => ({
          ...current,
          missions: current.missions.filter((missionId) =>
            nextAssignments.some((assignment) => String(assignment.id) === missionId),
          ),
        }));
      } catch (error) {
        if (!isCancelled) {
          setAssignments([]);
          setFormError(
            error instanceof Error
              ? error.message
              : 'Impossible de charger les missions.',
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingAssignments(false);
        }
      }
    }

    loadAssignments();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, session]);

  const providerName = useMemo(() => {
    const profileUser = session?.profile?.user;
    const accountUser = session?.user;
    const firstName = profileUser?.first_name ?? accountUser?.first_name ?? '';
    const lastName = profileUser?.last_name ?? accountUser?.last_name ?? '';
    return `${firstName} ${lastName}`.trim() || 'Prestataire connecté';
  }, [session]);

  if (!isOpen) return null;

  const handlePeriodeChange = (e) => {
    setFormError('');
    setFormData({ ...formData, periode: e.target.value });
  };

  const handleMissionToggle = (missionId) => {
    setFormError('');
    setFormData((current) => {
      const isSelected = current.missions.includes(missionId);

      return {
        ...current,
        missions: isSelected
          ? current.missions.filter((selectedMissionId) => selectedMissionId !== missionId)
          : [...current.missions, missionId],
      };
    });
  };

  const handleGenerate = async () => {
    if (!session?.token) {
      setFormError("Aucune session active. Reconnecte-toi.");
      return;
    }

    if (!formData.periode || formData.missions.length === 0) {
      setFormError('Veuillez remplir toutes les étapes.');
      return;
    }

    const [year, month] = formData.periode.split('-').map(Number);
    if (!year || !month) {
      setFormError('Période invalide.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const selectedAssignmentIds = formData.missions.map(Number);
      const response = await fetch(`${apiBaseUrl}/activity-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          month,
          year,
          assignments_id: selectedAssignmentIds[0],
          assignment_ids: selectedAssignmentIds,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(', ')
          : data?.message ?? 'Impossible de créer le CRA.';
        throw new Error(message);
      }

      const selectedAssignments = assignments.filter((assignment) =>
        formData.missions.includes(String(assignment.id)),
      );

      onGenerate?.({
        report: data,
        assignments: selectedAssignments,
      });
      onClose();
    } catch (error) {
      setFormError(
        error instanceof TypeError
          ? "Impossible de joindre l'API."
          : error instanceof Error
            ? error.message
            : 'Une erreur est survenue.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Ajouter un CRA</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          {/* Étape 1 */}
          <div className="step">
            <h3>Étape 1: Sélectionnez la période pour laquelle émettre le CRA.</h3>
            <input
              type="month"
              className="form-select"
              value={formData.periode}
              onChange={handlePeriodeChange}
            />
          </div>

          {/* Étape 2 */}
          <div className="step">
            <h3>Étape 2: Sélectionnez le prestataire au nom duquel émettre le CRA (c'est l'entreprise qui facture).</h3>
            <div className="provider-info">
              <div className="provider-details">
                <span className="provider-name">{providerName}</span>
                <span className="provider-default">Prestataire connecté actuellement.</span>
              </div>
            </div>
          </div>

          {/* Étape 3 */}
          <div className="step">
            <h3>Étape 3: Sélectionnez les missions liées à vos CRA.</h3>
            {isLoadingAssignments ? (
              <p className="missions-helper">Chargement des missions...</p>
            ) : assignments.length > 0 ? (
              <div className="cra-mission-list">
                {assignments.map((assignment) => {
                  const missionId = String(assignment.id);
                  const isChecked = formData.missions.includes(missionId);
                  const clientLabel =
                    assignment.customer?.company ||
                    `${assignment.customer?.user?.first_name ?? ''} ${assignment.customer?.user?.last_name ?? ''}`.trim();

                  return (
                    <label
                      key={assignment.id}
                      className={`cra-mission-option ${isChecked ? 'selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleMissionToggle(missionId)}
                      />
                      <span className="cra-mission-copy">
                        <strong>{assignment.label || `Mission #${assignment.id}`}</strong>
                        {clientLabel ? <small>{clientLabel}</small> : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="missions-helper">Aucune mission disponible.</p>
            )}
          </div>
          {formError ? <p className="modal-error">{formError}</p> : null}
        </div>

        <div className="modal-footer">
          <button className="btn btn-cancel" onClick={onClose}>
            Annuler
          </button>
          <button className="btn btn-generate" onClick={handleGenerate} disabled={isSubmitting}>
            {isSubmitting ? 'Création...' : 'Générer'}
          </button>
        </div>
      </div>
    </div>
  );
}
