import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './compteRendu.css';
import AddCRAModal from '../components/AddCRAModal';
import { exportRowsToCsv } from '../utils/csvExport';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const monthFormatter = new Intl.DateTimeFormat('fr-FR', {
  month: 'long',
  year: 'numeric',
});

function formatReportPeriod(month, year) {
  return monthFormatter.format(new Date(year, month - 1, 1));
}

export default function CompteRendu() {
  const [session, setSession] = useState(null);
  const [activities, setActivities] = useState([]);
  const [reportTotals, setReportTotals] = useState({});
  const [showModal, setShowModal] = useState(false);

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

    async function loadReports() {
      try {
        const response = await fetch(`${apiBaseUrl}/activity-reports`, {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });

        const data = await response.json().catch(() => []);

        if (!response.ok || !Array.isArray(data)) {
          throw new Error('Impossible de charger les CRA.');
        }

        if (isCancelled) {
          return;
        }

        const providerLabel =
          `${session?.user?.first_name ?? ''} ${session?.user?.last_name ?? ''}`.trim() ||
          'Prestataire';

        const totalsEntries = await Promise.all(
          data.map(async (report) => {
            try {
              const linesResponse = await fetch(
                `${apiBaseUrl}/activity-reports-lines?activity_report_id=${report.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${session.token}`,
                  },
                },
              );

              const linesData = await linesResponse.json().catch(() => []);
              if (!linesResponse.ok || !Array.isArray(linesData)) {
                return [report.id, '0 j.'];
              }

              const total = linesData.reduce(
                (sum, line) => sum + Number(line.past_day || 0),
                0,
              );

              return [
                report.id,
                `${total.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} j.`,
              ];
            } catch {
              return [report.id, '0 j.'];
            }
          }),
        );

        const totalsMap = Object.fromEntries(totalsEntries);

        setActivities(
          data.map((report) => ({
            id: report.id,
            periode: formatReportPeriod(report.month, report.year),
            mission:
              report.assignment?.label ||
              `Mission #${report.assignments_id ?? report.assignment?.id ?? report.id}`,
            prestataire: providerLabel,
            tempsTotal: totalsMap[report.id] ?? '0 j.',
            etat: 'CRA créé',
            etatClass: 'in-progress',
            month: report.month,
            year: report.year,
          })),
        );
        setReportTotals(totalsMap);
      } catch {
        if (!isCancelled) {
          setActivities([]);
          setReportTotals({});
        }
      }
    }

    loadReports();

    return () => {
      isCancelled = true;
    };
  }, [session]);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  function handleLogout() {
    localStorage.removeItem('authSession');
    window.location.href = '/login';
  }

  async function handleDeleteReport(reportId) {
    if (!session?.token) {
      return;
    }

    const confirmed = window.confirm('Supprimer ce CRA ?');
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/activity-reports/${reportId}`, {
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
        throw new Error('Impossible de supprimer le CRA.');
      }

      setActivities((current) => current.filter((activity) => activity.id !== reportId));
    } catch {
      window.alert('Impossible de supprimer le CRA.');
    }
  }

  function handleExportCsv() {
    exportRowsToCsv(
      'comptes-rendus.csv',
      [
        { key: 'periode', label: 'Période' },
        { key: 'mission', label: 'Mission' },
        { key: 'prestataire', label: 'Prestataire' },
        { key: 'tempsTotal', label: 'Temps total' },
        { key: 'etat', label: 'État' },
      ],
      activities.map((activity) => ({
        periode: activity.periode,
        mission: activity.mission,
        prestataire: activity.prestataire,
        tempsTotal: activity.tempsTotal,
        etat: activity.etat,
      })),
    );
  }

  const handleCreateReport = ({ report, assignment }) => {
    const missionLabel =
      report?.assignment?.label ||
      assignment?.label ||
      `Mission #${report?.assignments_id ?? assignment?.id ?? ''}`;
    const providerLabel =
      `${session?.user?.first_name ?? ''} ${session?.user?.last_name ?? ''}`.trim() ||
      'Prestataire';

    setActivities((current) => [
      {
        id: report.id,
        periode: formatReportPeriod(report.month, report.year),
        mission: missionLabel,
        prestataire: providerLabel,
        tempsTotal: reportTotals[report.id] ?? '0 j.',
        etat: 'CRA créé',
        etatClass: 'in-progress',
        month: report.month,
        year: report.year,
      },
      ...current.filter((activity) => activity.id !== report.id),
    ]);
  };

  const activeCount = useMemo(() => activities.length, [activities.length]);

  const firstName = session?.user?.first_name?.trim?.() ?? 'Sylvestre Yannick Noah';
  const lastName = session?.user?.last_name?.trim?.() ?? 'Olinga';
  const email = session?.user?.email?.trim?.() ?? 'yannickolinga213@gmail.com';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'SN';
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <div className="compte-rendu-container cr-layout">
      {/* Sidebar */}
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
              <li className="cr-nav-item active">
                <a href="#" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>CRA</span>
                </a>
              </li>
              <li className="cr-nav-item">
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

      {/* Main Content */}
      <main className="cr-main-content">
        <header className="cr-content-header">
          <h1 className="cr-page-title">Mes comptes rendus d'activités</h1>
          <div className="cr-user-info">
            <div className="cr-user-details">
              <span className="cr-user-name">{fullName}</span>
              <span className="cr-user-email">{email}</span>
            </div>
            <a href="/profile" className="cr-user-badge-link" title="Profil">
              <div className="cr-user-avatar">{initials}</div>
            </a>
          </div>
        </header>

        <div className="cr-content-actions">
          <button className="cr-btn cr-btn-primary" onClick={handleOpenModal}>
            <span className="cr-btn-icon">+</span>
            Ajouter un CRA
          </button>
        </div>

        <div className="cr-tabs">
          <button className="cr-tab active">
            Actifs <span className="cr-tab-count">{activeCount}</span>
          </button>
          <button className="cr-tab">
            Traités <span className="cr-tab-count">0</span>
          </button>
        </div>

        <div className="cr-table-controls">
          <div className="cr-table-controls-right cr-table-controls-right-only">
            <button className="cr-btn cr-btn-outline" onClick={handleExportCsv}>
              Exporter (.csv)
            </button>
            <div className="cr-view-toggle">
              <button className="cr-view-btn active" aria-label="Vue tableau"></button>
              <button className="cr-view-btn" aria-label="Vue liste"></button>
            </div>
          </div>
        </div>

        <div className="cr-table-container">
          <table className="cr-activities-table">
            <thead>
              <tr>
                <th>Période</th>
                <th>Missions</th>
                <th>Prestataire</th>
                <th>Temps total</th>
                <th>État</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.map(activity => (
                <tr key={activity.id}>
                  <td>
                    <Link to={`/compte-rendu/${activity.id}`} className="cr-report-link">
                      {activity.periode}
                    </Link>
                  </td>
                  <td>
                    <Link to={`/compte-rendu/${activity.id}`} className="cr-report-link">
                      {activity.mission}
                    </Link>
                  </td>
                  <td>{activity.prestataire}</td>
                  <td>{activity.tempsTotal}</td>
                  <td>
                    <span className={`cr-status ${activity.etatClass}`}>
                      {activity.etat}
                    </span>
                  </td>
                  <td>
                    <div className="cr-action-buttons">
                      <Link
                        to={`/compte-rendu/${activity.id}`}
                        className="cr-action-btn cr-action-link"
                        title="Voir le CRA"
                      >
                        <span className="cr-eye-icon" />
                      </Link>
                      <Link
                        to={`/compte-rendu/${activity.id}`}
                        className="cr-action-btn cr-action-link"
                        title="Éditer le CRA"
                      >
                        <span className="cr-edit-icon" />
                      </Link>
                      <button
                        className="cr-action-btn cr-action-btn-danger"
                        title="Supprimer"
                        onClick={() => handleDeleteReport(activity.id)}
                      >
                        <span className="cr-trash-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      <AddCRAModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onGenerate={handleCreateReport}
      />
    </div>
  );
}
