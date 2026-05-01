import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AiFillDelete } from 'react-icons/ai';
import { FaPencil } from 'react-icons/fa6';
import './missions.css';
import './compteRendu.css';
import AddAssignmentModal from '../components/AddAssignmentModal';
import { exportRowsToCsv } from '../utils/csvExport';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

function getCustomerDisplayName(customer) {
  const fullName =
    `${customer?.user?.first_name ?? ''} ${customer?.user?.last_name ?? ''}`.trim();

  return customer?.company || fullName || 'Client inconnu';
}

export default function Missions() {
  const [session, setSession] = useState(null);
  const [missionRows, setMissionRows] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMission, setEditingMission] = useState(null);
  const [deletingMissionId, setDeletingMissionId] = useState(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMissionIds, setSelectedMissionIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  useEffect(() => {
    const storedSession = localStorage.getItem('authSession');
    if (!storedSession) {
      setSession(null);
      return;
    }

    try {
      setSession(JSON.parse(storedSession));
    } catch {
      setSession(null);
    }
  }, []);

  useEffect(() => {
    if (!session?.token) {
      return;
    }

    let isCancelled = false;

    async function loadAssignments() {
      try {
        const response = await fetch(`${apiBaseUrl}/assignments/`, {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });

        const data = await response.json().catch(() => []);
        if (!response.ok || !Array.isArray(data)) {
          throw new Error('Impossible de charger les missions.');
        }

        if (!isCancelled) {
          setMissionRows(data);
        }
      } catch {
        if (!isCancelled) {
          setMissionRows([]);
        }
      }
    }

    loadAssignments();

    return () => {
      isCancelled = true;
    };
  }, [session]);

  const profile = useMemo(() => {
    const firstName = session?.user?.first_name ?? 'Terence';
    const lastName = session?.user?.last_name ?? 'M';
    const email = session?.user?.email ?? 'terence.mayombo@gmail.com';
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'TM';

    return {
      fullName: `${firstName} ${lastName}`.trim(),
      email,
      initials,
    };
  }, [session]);

  function handleAssignmentCreated(createdAssignment) {
    setMissionRows((current) => [createdAssignment, ...current]);
  }

  function handleAssignmentUpdated(updatedAssignment) {
    setMissionRows((current) =>
      current.map((mission) =>
        mission.id === updatedAssignment.id ? updatedAssignment : mission,
      ),
    );
    setEditingMission(null);
  }

  function handleCloseAssignmentModal() {
    setShowAddModal(false);
    setEditingMission(null);
  }

  function handleLogout() {
    localStorage.removeItem('authSession');
    window.location.href = '/login';
  }

  async function handleDeleteMission(mission) {
    if (!session?.token || deletingMissionId) {
      return;
    }

    const confirmed = window.confirm(
      `Supprimer la mission "${mission.label || `mission ${mission.id}`}" ?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingMissionId(mission.id);

    try {
      const response = await fetch(`${apiBaseUrl}/assignments/${mission.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('authSession');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = Array.isArray(data?.message)
          ? data.message.join(', ')
          : data?.message ?? 'Impossible de supprimer la mission.';
        throw new Error(message);
      }

      setMissionRows((current) =>
        current.filter((currentMission) => currentMission.id !== mission.id),
      );
      setSelectedMissionIds((current) =>
        current.filter((missionId) => missionId !== mission.id),
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : 'Impossible de supprimer la mission.',
      );
    } finally {
      setDeletingMissionId(null);
    }
  }

  function handleToggleSelectionMode() {
    setIsSelectionMode((current) => !current);
    setSelectedMissionIds([]);
  }

  function handleToggleMissionSelection(missionId) {
    setSelectedMissionIds((current) =>
      current.includes(missionId)
        ? current.filter((selectedId) => selectedId !== missionId)
        : [...current, missionId],
    );
  }

  async function handleBulkDeleteMissions() {
    if (!session?.token || selectedMissionIds.length === 0 || isBulkDeleting) {
      return;
    }

    const confirmed = window.confirm(
      `Supprimer ${selectedMissionIds.length} mission${selectedMissionIds.length > 1 ? 's' : ''} ?`,
    );

    if (!confirmed) {
      return;
    }

    setIsBulkDeleting(true);

    try {
      const responses = await Promise.all(
        selectedMissionIds.map((missionId) =>
          fetch(`${apiBaseUrl}/assignments/${missionId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          }),
        ),
      );

      if (responses.some((response) => response.status === 401)) {
        localStorage.removeItem('authSession');
        window.location.href = '/login';
        return;
      }

      if (responses.some((response) => !response.ok)) {
        throw new Error('Impossible de supprimer toutes les missions sélectionnées.');
      }

      setMissionRows((current) =>
        current.filter((mission) => !selectedMissionIds.includes(mission.id)),
      );
      setSelectedMissionIds([]);
      setIsSelectionMode(false);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : 'Impossible de supprimer les missions sélectionnées.',
      );
    } finally {
      setIsBulkDeleting(false);
    }
  }

  function handleExportCsv() {
    exportRowsToCsv(
      'missions.csv',
      [
        { key: 'nom', label: 'Nom' },
        { key: 'client', label: 'Client' },
        { key: 'emailClient', label: 'Email client' },
        { key: 'tarifJournalier', label: 'Tarif journalier' },
      ],
      missionRows.map((mission) => ({
        nom: mission.label || `mission ${mission.id}`,
        client: getCustomerDisplayName(mission.customer),
        emailClient: mission.customer?.user?.email || '-',
        tarifJournalier: Number(mission.hourly_rate || 0),
      })),
    );
  }

  return (
    <div className="compte-rendu-container cr-layout">
      <aside className="cr-sidebar">
        <div className="cr-sidebar-header">
          <Link to="/" className="cr-logo">
            <span className="cr-logo-text">Terenick</span>
          </Link>
        </div>

        <nav className="cr-sidebar-nav">
          <div className="cr-nav-section">
            <h3 className="cr-nav-title">MENU</h3>
            <ul className="cr-nav-list">
              <li className="cr-nav-item">
                <a href="/clients" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>Clients</span>
                </a>
              </li>
              <li className="cr-nav-item active">
                <a href="/missions" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>Missions</span>
                </a>
              </li>
              <li className="cr-nav-item">
                <a href="/compte-rendu" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>CRA</span>
                </a>
              </li>
              <li className="cr-nav-item">
                <a href="/facturation" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>Facturation</span>
                </a>
              </li>
              {/* <li className="cr-nav-item">
                <a href="#" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>Reporting</span>
                </a>
              </li> */}
            </ul>
          </div>

          <div className="cr-nav-section cr-nav-section-account">
            <h3 className="cr-nav-title">MON COMPTE</h3>
            <ul className="cr-nav-list">
              <li className="cr-nav-item">
                <a href="/profile" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>Mon compte</span>
                </a>
              </li>
              <li className="cr-nav-item">
                <button type="button" className="cr-nav-link cr-nav-link-button" onClick={handleLogout}>
                  <span className="cr-nav-icon"></span>
                  <span>Déconnexion</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <div className="cr-sidebar-footer">
          <p className="cr-copyright">© 2026. Propulsé par Terenick</p>
        </div>
      </aside>

      <main className="cr-main-content missions-content">
        <header className="cr-content-header">
          <h1 className="cr-page-title">Vos missions</h1>
          <div className="cr-user-info">
            <div className="cr-user-details">
              <span className="cr-user-name">{profile.fullName}</span>
              <span className="cr-user-email">{profile.email}</span>
            </div>
            <a href="/profile" className="cr-user-badge-link" title="Profil">
              <span className="cr-user-avatar">{profile.initials}</span>
            </a>
          </div>
        </header>

        <section className="missions-hero">
          <div className="missions-hero-copy">
            <div className="missions-hero-icon-wrap">
              <div className="missions-hero-icon">
                <span className="missions-hero-folder" />
              </div>
            </div>
            <div>
              <h2>Organisez vos missions</h2>
              <p>Déployez vos missions pour structurer votre activité.</p>
            </div>
          </div>
          <button
            type="button"
            className="missions-add-button"
            onClick={() => {
              setEditingMission(null);
              setShowAddModal(true);
            }}
          >
            Ajouter une mission
          </button>
        </section>

        <section className="missions-board">
          <div className="missions-toolbar">
            <div className="bulk-actions">
              <button
                type="button"
                className="missions-toolbar-btn"
                onClick={handleToggleSelectionMode}
              >
                {isSelectionMode ? 'Annuler la sélection' : 'Sélectionner'}
              </button>
              {isSelectionMode ? (
                <button
                  type="button"
                  className="bulk-delete-btn"
                  onClick={handleBulkDeleteMissions}
                  disabled={selectedMissionIds.length === 0 || isBulkDeleting}
                >
                  {isBulkDeleting
                    ? 'Suppression...'
                    : `Supprimer (${selectedMissionIds.length})`}
                </button>
              ) : null}
            </div>
            <button type="button" className="missions-toolbar-btn" onClick={handleExportCsv}>
              Exporter (.csv)
            </button>
          </div>

          <div className="missions-table-shell">
            <table className="missions-table">
              <thead>
                <tr>
                  {isSelectionMode ? <th>Sélection</th> : null}
                  <th>Nom</th>
                  <th>Client</th>
                  <th>TJM</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {missionRows.length === 0 ? (
                  <tr>
                    <td colSpan={isSelectionMode ? 5 : 4} className="missions-empty-cell">
                      Aucune mission trouvée. Ajoutez une mission pour commencer.
                    </td>
                  </tr>
                ) : (
                  missionRows.map((mission) => (
                    <tr key={mission.id}>
                      {isSelectionMode ? (
                        <td>
                          <input
                            type="checkbox"
                            className="bulk-checkbox"
                            checked={selectedMissionIds.includes(mission.id)}
                            onChange={() => handleToggleMissionSelection(mission.id)}
                            aria-label={`Sélectionner ${mission.label || `mission ${mission.id}`}`}
                          />
                        </td>
                      ) : null}
                      <td className="missions-name-cell">
                        <span>{mission.label || `mission ${mission.id}`}</span>
                      </td>
                      <td>
                        <div className="missions-client-block">
                          <span className="missions-client-name">
                            {getCustomerDisplayName(mission.customer)}
                          </span>
                          <span className="missions-client-email">
                            {mission.customer?.user?.email || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="missions-rate-cell">
                        {currencyFormatter.format(Number(mission.hourly_rate || 0))}
                        <span>/ jour</span>
                      </td>
                      <td>
                        <div className="missions-actions-cell">
                          <button
                            type="button"
                            className="missions-edit-btn"
                            title="Modifier"
                            onClick={() => {
                              setEditingMission(mission);
                              setShowAddModal(true);
                            }}
                          >
                            <FaPencil />
                          </button>
                          <button
                            type="button"
                            className="missions-delete-btn"
                            title="Supprimer"
                            disabled={deletingMissionId === mission.id}
                            onClick={() => handleDeleteMission(mission)}
                          >
                            <AiFillDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <AddAssignmentModal
          isOpen={showAddModal}
          onClose={handleCloseAssignmentModal}
          onCreated={handleAssignmentCreated}
          onUpdated={handleAssignmentUpdated}
          assignment={editingMission}
          mode={editingMission ? 'edit' : 'create'}
        />
      </main>
    </div>
  );
}
