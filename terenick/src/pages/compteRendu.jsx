import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaRegEye } from 'react-icons/fa';
import { FaCheck } from 'react-icons/fa6';
import { AiFillDelete } from 'react-icons/ai';
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

function formatDays(value) {
  return `${Number(value).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} j.`;
}

function getReportStatusMeta(status) {
  return status === 'completed'
    ? { etat: 'Terminé', etatClass: 'completed' }
    : { etat: 'CRA créé', etatClass: 'in-progress' };
}

function buildActivityGroups(activities) {
  const groups = new Map();

  activities.forEach((activity) => {
    const groupKey = `${activity.year}-${activity.month}`;
    const activityReportIds = activity.reportIds?.length
      ? activity.reportIds
      : [activity.id];
    const activityMissionNames = activity.missionNames?.length
      ? activity.missionNames
      : [activity.mission];
    const existing = groups.get(groupKey) ?? {
      id: activity.id,
      reportIds: [],
      periode: activity.periode,
      missionNames: [],
      prestataire: activity.prestataire,
      totalValue: 0,
      etat: activity.etat,
      etatClass: activity.etatClass,
      month: activity.month,
      year: activity.year,
    };

    groups.set(groupKey, {
      ...existing,
      id: Math.min(existing.id, ...activityReportIds),
      reportIds: [...existing.reportIds, ...activityReportIds],
      missionNames: [...existing.missionNames, ...activityMissionNames],
      totalValue: existing.totalValue + Number(activity.totalValue || 0),
      etat:
        existing.etat === 'Terminé' && activity.etat === 'Terminé'
          ? 'Terminé'
          : 'CRA créé',
      etatClass:
        existing.etat === 'Terminé' && activity.etat === 'Terminé'
          ? 'completed'
          : 'in-progress',
    });
  });

  return Array.from(groups.values())
    .map((group) => {
      const uniqueMissionNames = Array.from(new Set(group.missionNames));

      return {
        ...group,
        mission:
          uniqueMissionNames.length === 1
            ? uniqueMissionNames[0]
            : `${uniqueMissionNames.length} missions`,
        missionNames: uniqueMissionNames,
        tempsTotal: formatDays(group.totalValue),
      };
    })
    .sort((first, second) => {
      if (first.year !== second.year) {
        return second.year - first.year;
      }

      return second.month - first.month;
    });
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

        const assignmentsResponse = await fetch(`${apiBaseUrl}/assignments`, {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });
        const assignmentsData = await assignmentsResponse.json().catch(() => []);
        const assignmentsById = new Map(
          (Array.isArray(assignmentsData) ? assignmentsData : []).map((assignment) => [
            Number(assignment.id),
            assignment,
          ]),
        );

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

              return [report.id, total];
            } catch {
              return [report.id, 0];
            }
          }),
        );

        const totalsMap = Object.fromEntries(totalsEntries);

        const nextActivities = data.map((report) => {
          const assignmentIds = Array.from(
            new Set([
              ...(report.assignment_ids ?? []),
              ...(report.assignments_id ? [report.assignments_id] : []),
            ].map(Number).filter(Boolean)),
          );
          const missionNames = assignmentIds.map((assignmentId) => {
            const assignment = assignmentsById.get(assignmentId);
            return assignment?.label || `Mission #${assignmentId}`;
          });
          const statusMeta = getReportStatusMeta(report.status);

          return {
            id: report.id,
            periode: formatReportPeriod(report.month, report.year),
            mission:
              missionNames.length > 1
                ? `${missionNames.length} missions`
                : missionNames[0] ||
                  report.assignment?.label ||
                  `Mission #${report.assignments_id ?? report.assignment?.id ?? report.id}`,
            missionNames,
            prestataire: providerLabel,
            totalValue: totalsMap[report.id] ?? 0,
            tempsTotal: formatDays(totalsMap[report.id] ?? 0),
            etat: statusMeta.etat,
            etatClass: statusMeta.etatClass,
            month: report.month,
            year: report.year,
          };
        });

        setActivities(buildActivityGroups(nextActivities));
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

  async function handleDeleteReport(activity) {
    if (!session?.token) {
      return;
    }

    const reportIds = activity.reportIds?.length ? activity.reportIds : [activity.id];
    const confirmed = window.confirm(
      reportIds.length > 1
        ? 'Supprimer tous les CRA de ce mois ?'
        : 'Supprimer ce CRA ?',
    );
    if (!confirmed) {
      return;
    }

    try {
      const responses = await Promise.all(
        reportIds.map((reportId) =>
          fetch(`${apiBaseUrl}/activity-reports/${reportId}`, {
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
        throw new Error('Impossible de supprimer le CRA.');
      }

      setActivities((current) =>
        current.filter(
          (currentActivity) =>
            !currentActivity.reportIds?.some((reportId) => reportIds.includes(reportId)),
        ),
      );
    } catch {
      window.alert('Impossible de supprimer le CRA.');
    }
  }

  async function handleToggleReportStatus(activity) {
    if (!session?.token) {
      return;
    }

    const isCompleted = activity.etatClass === 'completed';
    const nextStatus = isCompleted ? 'active' : 'completed';
    const nextStatusMeta = getReportStatusMeta(nextStatus);
    const reportIds = activity.reportIds?.length ? activity.reportIds : [activity.id];
    const confirmed = window.confirm(
      isCompleted
        ? 'Repasser ce CRA en statut créé pour pouvoir le modifier ?'
        : 'Valider ce CRA et passer son statut à terminé ?',
    );
    if (!confirmed) {
      return;
    }

    try {
      const responses = await Promise.all(
        reportIds.map((reportId) =>
          fetch(`${apiBaseUrl}/activity-reports/${reportId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.token}`,
            },
            body: JSON.stringify({ status: nextStatus }),
          }),
        ),
      );

      if (responses.some((response) => response.status === 401)) {
        localStorage.removeItem('authSession');
        window.location.href = '/login';
        return;
      }

      if (responses.some((response) => !response.ok)) {
        throw new Error('Impossible de modifier le statut du CRA.');
      }

      setActivities((current) =>
        current.map((currentActivity) =>
          currentActivity.id === activity.id
            ? {
                ...currentActivity,
                etat: nextStatusMeta.etat,
                etatClass: nextStatusMeta.etatClass,
              }
            : currentActivity,
        ),
      );
    } catch {
      window.alert('Impossible de modifier le statut du CRA.');
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
        mission: activity.missionNames?.join(' | ') ?? activity.mission,
        prestataire: activity.prestataire,
        tempsTotal: activity.tempsTotal,
        etat: activity.etat,
      })),
    );
  }

  const handleCreateReport = ({ report, assignment, assignments, reports }) => {
    const providerLabel =
      `${session?.user?.first_name ?? ''} ${session?.user?.last_name ?? ''}`.trim() ||
      'Prestataire';
    const createdReports = reports ?? [{ report, assignment, assignments }];
    const nextActivities = createdReports
      .filter((createdReport) => createdReport.report?.id)
      .map((createdReport) => {
        const createdReportData = createdReport.report;
        const createdAssignment = createdReport.assignment;
        const createdAssignments = createdReport.assignments ?? [];
        const missionNames = createdAssignments.length
          ? createdAssignments.map(
              (selectedAssignment) =>
                selectedAssignment.label || `Mission #${selectedAssignment.id}`,
            )
          : [];
        const missionLabel =
          missionNames.length > 1
            ? `${missionNames.length} missions`
            : missionNames[0] ||
          createdReportData?.assignment?.label ||
          createdAssignment?.label ||
          `Mission #${createdReportData?.assignments_id ?? createdAssignment?.id ?? ''}`;

        return {
          id: createdReportData.id,
          periode: formatReportPeriod(createdReportData.month, createdReportData.year),
          mission: missionLabel,
          missionNames,
          prestataire: providerLabel,
          totalValue: reportTotals[createdReportData.id] ?? 0,
          tempsTotal: formatDays(reportTotals[createdReportData.id] ?? 0),
          etat: 'CRA créé',
          etatClass: 'in-progress',
          month: createdReportData.month,
          year: createdReportData.year,
        };
      });

    if (nextActivities.length === 0) {
      return;
    }

    setActivities((current) => buildActivityGroups([...nextActivities, ...current]));
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
              <li className="cr-nav-item">
                <a href="/clients" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>Clients</span>
                </a>
              </li>
              <li className="cr-nav-item">
                <a href="/missions" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>Missions</span>
                </a>
              </li>
              <li className="cr-nav-item active">
                <a href="#" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>CRA</span>
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
        </div>

        <div className="cr-table-controls">
          <div className="cr-table-controls-right cr-table-controls-right-only">
            <button className="cr-btn cr-btn-outline" onClick={handleExportCsv}>
              Exporter (.csv)
            </button>
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
                      <span className="cr-report-mission-title">{activity.mission}</span>
                      {activity.missionNames?.length > 1 ? (
                        <span className="cr-report-mission-list">
                          {activity.missionNames.join(', ')}
                        </span>
                      ) : null}
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
                        <FaRegEye />
                      </Link>
                      <button
                        type="button"
                        className={`cr-action-btn cr-action-btn-success ${activity.etatClass === 'completed' ? 'is-completed' : ''}`}
                        title={
                          activity.etatClass === 'completed'
                            ? 'Repasser en CRA créé'
                            : 'Valider le CRA'
                        }
                        onClick={() => handleToggleReportStatus(activity)}
                      >
                        <FaCheck />
                      </button>
                      <button
                        className="cr-action-btn cr-action-btn-danger"
                        title="Supprimer"
                        onClick={() => handleDeleteReport(activity)}
                      >
                        <AiFillDelete />
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
