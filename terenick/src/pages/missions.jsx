import React, { useEffect, useMemo, useState } from 'react';
import './missions.css';
import './compteRendu.css';
import AddAssignmentModal from '../components/AddAssignmentModal';
import { exportRowsToCsv } from '../utils/csvExport';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export default function Missions() {
  const [session, setSession] = useState(null);
  const [missionRows, setMissionRows] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

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

  function handleLogout() {
    localStorage.removeItem('authSession');
    window.location.href = '/login';
  }

  function handleExportCsv() {
    exportRowsToCsv(
      'missions.csv',
      [
        { key: 'nom', label: 'Nom' },
        { key: 'identifiant', label: 'Identifiant' },
        { key: 'client', label: 'Client' },
        { key: 'emailClient', label: 'Email client' },
      ],
      missionRows.map((mission) => ({
        nom: mission.label || `mission ${mission.id}`,
        identifiant: mission.id,
        client: mission.customer?.company || 'Client inconnu',
        emailClient: mission.customer?.user?.email || '-',
      })),
    );
  }

  return (
    <div className="compte-rendu-container cr-layout">
      <aside className="cr-sidebar">
        <div className="cr-sidebar-header">
          <div className="cr-logo">
            <span className="cr-logo-text">Terenick</span>
          </div>
        </div>

        <nav className="cr-sidebar-nav">
          <div className="cr-nav-section">
            <h3 className="cr-nav-title">MENU</h3>
            <ul className="cr-nav-list">
              <li className="cr-nav-item">
                <a href="/compte-rendu" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>CRA</span>
                </a>
              </li>
              <li className="cr-nav-item active">
                <a href="/missions" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>Missions</span>
                </a>
              </li>
              <li className="cr-nav-item">
                <a href="/clients" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>Clients</span>
                </a>
              </li>
              <li className="cr-nav-item">
                <a href="#" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>Notes de frais</span>
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
            <a href="/dashboard" className="cr-user-badge-link" title="Dashboard">
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
            onClick={() => setShowAddModal(true)}
          >
            Ajouter une mission
          </button>
        </section>

        <section className="missions-board">
          <div className="missions-toolbar">
            <button type="button" className="missions-toolbar-btn" onClick={handleExportCsv}>
              Exporter (.csv)
            </button>
          </div>

          <div className="missions-table-shell">
            <table className="missions-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Identifiant</th>
                  <th>Client</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {missionRows.map((mission) => (
                  <tr key={mission.id}>
                    <td className="missions-name-cell">
                      <span>{mission.label || `mission ${mission.id}`}</span>
                    </td>
                    <td>{mission.id}</td>
                    <td>
                      <div className="missions-client-block">
                        <span className="missions-client-name">
                          {mission.customer?.company || 'Client inconnu'}
                        </span>
                        <span className="missions-client-email">
                          {mission.customer?.user?.email || '-'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="missions-actions-cell">
                        <button type="button" className="missions-delete-btn" title="Supprimer">
                          <span className="missions-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <AddAssignmentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onCreated={handleAssignmentCreated}
        />
      </main>
    </div>
  );
}
