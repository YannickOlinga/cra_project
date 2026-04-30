import './compteRendu.css';
import './compteRenduDetail.css'; 
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { FaRegEye } from 'react-icons/fa';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const monthFormatter = new Intl.DateTimeFormat('fr-FR', {
  month: 'long',
  year: 'numeric',
});

function getAssignmentIds(report) {
  return Array.from(
    new Set([
      ...(Array.isArray(report.assignment_ids) ? report.assignment_ids : []),
      ...(report.assignments_id ? [report.assignments_id] : []),
    ]),
  ).filter(Boolean);
}

function formatPeriod(month, year) {
  if (!month || !year) {
    return '-';
  }

  const date = new Date(year, month - 1, 1);
  return monthFormatter.format(date).replace(/^\p{Ll}/u, (letter) => letter.toUpperCase());
}

function getProviderName(provider, fallbackProvider) {
  const user = provider?.user ?? fallbackProvider?.user;
  const fullName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim();
  return fullName || 'Prestataire';
}

function getReportStatus(report) {
  return report.status === 'completed'
    ? { label: 'Terminé', className: 'completed' }
    : { label: 'Actif', className: 'in-progress' };
}

export default function ClientInterface() {
  let session = null;

  try {
    session = JSON.parse(localStorage.getItem('authSession') ?? 'null');
  } catch {
    localStorage.removeItem('authSession');
  }

  function handleLogout() {
    localStorage.removeItem('authSession');
    window.location.href = '/login';
  }

  const firstName = session?.user?.first_name?.trim?.() ?? 'Client';
  const lastName = session?.user?.last_name?.trim?.() ?? '';
  const email = session?.user?.email?.trim?.() ?? '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'CL';
  const fullName = `${firstName} ${lastName}`.trim();
  const [reports, setReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState('');

  useEffect(() => {
    let isCancelled = false;

    async function loadReports() {
      if (!session?.token) {
        setReports([]);
        setIsLoadingReports(false);
        return;
      }

      setIsLoadingReports(true);
      setReportsError('');

      try {
        const [reportsResponse, assignmentsResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/activity-reports`, {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          }),
          fetch(`${apiBaseUrl}/assignments`, {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          }),
        ]);

        if (reportsResponse.status === 401 || assignmentsResponse.status === 401) {
          localStorage.removeItem('authSession');
          window.location.href = '/login';
          return;
        }

        if (!reportsResponse.ok || !assignmentsResponse.ok) {
          throw new Error('Impossible de charger les comptes rendus.');
        }

        const reportsData = await reportsResponse.json();
        const assignmentsData = await assignmentsResponse.json();
        const assignmentsById = new Map(
          (Array.isArray(assignmentsData) ? assignmentsData : []).map((assignment) => [
            assignment.id,
            assignment,
          ]),
        );

        const nextReports = (Array.isArray(reportsData) ? reportsData : [])
          .map((report) => {
            const linkedAssignments = getAssignmentIds(report)
              .map((assignmentId) => assignmentsById.get(assignmentId))
              .filter(Boolean);

            if (linkedAssignments.length === 0) {
              return null;
            }

            const status = getReportStatus(report);

            return {
              id: report.id,
              period: formatPeriod(report.month, report.year),
              missions: linkedAssignments
                .map((assignment) => assignment.label || `Mission #${assignment.id}`)
                .join(', '),
              providerName: getProviderName(report.provider, linkedAssignments[0]?.provider),
              statusLabel: status.label,
              statusClassName: status.className,
              year: report.year,
              month: report.month,
            };
          })
          .filter(Boolean)
          .sort((firstReport, secondReport) => {
            if (secondReport.year !== firstReport.year) {
              return secondReport.year - firstReport.year;
            }

            return secondReport.month - firstReport.month;
          });

        if (!isCancelled) {
          setReports(nextReports);
        }
      } catch {
        if (!isCancelled) {
          setReports([]);
          setReportsError('Impossible de charger les comptes rendus.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingReports(false);
        }
      }
    }

    loadReports();

    return () => {
      isCancelled = true;
    };
  }, [session?.token]);

  const reportCount = useMemo(() => reports.length, [reports.length]);

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
              <li className="cr-nav-item active">
                <a href="/compte-rendu" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>CRA</span>
                </a>
              </li>
              <li className="cr-nav-item">
                <a href="/notes-frais" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>Notes de frais</span>
                </a>
              </li>
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

      <main className="cr-main-content cr-detail-content">
        <header className="cr-content-header">
          <div> 
            <h1 className="cr-page-title">INFORMATIONS GÉNÉRALES</h1>
          </div>
          <div className="cr-user-info">
            <div className="cr-user-details">
              <span className="cr-user-name">{fullName}</span>
              {email ? <span className="cr-user-email">{email}</span> : null}
            </div>
            <a href="/profile" className="cr-user-badge-link" title="Profil">
              <div className="cr-user-avatar">{initials}</div>
            </a>
          </div>
        </header>
        <div className="cr-detail-grid">
            <div className="cr-detail-card">
                        <h2>Mes comptes rendus</h2>
                        <p>{reportCount} compte rendu{reportCount > 1 ? 's' : ''} rattaché{reportCount > 1 ? 's' : ''} à vos missions.</p>
                       

            </div>
            
          
        </div>

        <table className="tableau">
          <thead>
            <tr>
              <th className="tableau-header">ID</th>
              <th className="tableau-header">Période</th>
              <th className="tableau-header">Missions</th>
              <th className="tableau-header">Prestataire</th>
              <th className="tableau-header">Statut</th> 
              <th className="tableau-header">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingReports ? (
              <tr>
                <td className="tableau-cell" colSpan="6">Chargement...</td>
              </tr>
            ) : reportsError ? (
              <tr>
                <td className="tableau-cell" colSpan="6">{reportsError}</td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td className="tableau-cell" colSpan="6">Aucun compte rendu disponible.</td>
              </tr>
            ) : (
              reports.map((report, index) => (
                <tr key={report.id}>
                  <td className="tableau-cell">{index + 1}</td>
                  <td className="tableau-cell">{report.period}</td>
                  <td className="tableau-cell">{report.missions}</td>
                  <td className="tableau-cell">{report.providerName}</td>
                  <td className="tableau-cell">
                    <span className={`cr-status ${report.statusClassName}`}>
                      {report.statusLabel}
                    </span>
                  </td>
                  <td className="tableau-cell">
                    <Link
                      to={`/compte-rendu/${report.id}`}
                      className="cr-action-link"
                      title="Voir"
                      aria-label={`Voir le CRA ${report.period}`}
                    >
                      <FaRegEye />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
      </main>
    </div>
  );
}
