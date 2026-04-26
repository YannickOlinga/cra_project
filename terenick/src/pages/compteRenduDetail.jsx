import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './compteRendu.css';
import './compteRenduDetail.css';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const weekdayLabels = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];

const monthTitleFormatter = new Intl.DateTimeFormat('fr-FR', {
  month: 'long',
  year: 'numeric',
});

function buildMonthGrid(month, year) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1);
  const firstWeekdayIndex = (firstDay.getDay() + 6) % 7;
  const cells = [];

  for (let index = 0; index < firstWeekdayIndex; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function formatPastDay(value) {
  if (Number(value) === 1) {
    return '1 j.';
  }

  if (Number(value) === 0.5) {
    return '0,5 j.';
  }

  return '-';
}

export default function CompteRenduDetail() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [report, setReport] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [lines, setLines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingDay, setPendingDay] = useState(null);

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
    if (!session?.token || !id) {
      return;
    }

    let isCancelled = false;

    async function loadDetail() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const reportResponse = await fetch(`${apiBaseUrl}/activity-reports/${id}`, {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });

        const reportData = await reportResponse.json().catch(() => null);

        if (!reportResponse.ok || !reportData) {
          throw new Error('Impossible de charger ce CRA.');
        }

        const linesResponse = await fetch(
          `${apiBaseUrl}/activity-reports-lines?activity_report_id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          },
        );

        const linesData = await linesResponse.json().catch(() => []);

        if (!linesResponse.ok || !Array.isArray(linesData)) {
          throw new Error('Impossible de charger les journées du CRA.');
        }

        let assignmentData = null;
        if (reportData.assignments_id) {
          const assignmentResponse = await fetch(
            `${apiBaseUrl}/assignments/${reportData.assignments_id}`,
            {
              headers: {
                Authorization: `Bearer ${session.token}`,
              },
            },
          );

          assignmentData = await assignmentResponse.json().catch(() => null);
          if (!assignmentResponse.ok) {
            assignmentData = null;
          }
        }

        if (isCancelled) {
          return;
        }

        setReport(reportData);
        setLines(linesData);
        setAssignment(assignmentData);
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Une erreur est survenue.',
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      isCancelled = true;
    };
  }, [id, session]);

  const firstName = session?.user?.first_name?.trim?.() ?? 'Utilisateur';
  const lastName = session?.user?.last_name?.trim?.() ?? '';
  const email = session?.user?.email?.trim?.() ?? '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  const fullName = `${firstName} ${lastName}`.trim();

  const calendarCells = useMemo(() => {
    if (!report?.month || !report?.year) {
      return [];
    }

    return buildMonthGrid(report.month, report.year);
  }, [report]);

  const linesByDay = useMemo(() => {
    return lines.reduce((map, line) => {
      map.set(line.day, line);
      return map;
    }, new Map());
  }, [lines]);

  const totalDays = useMemo(() => {
    const total = lines.reduce((sum, line) => sum + Number(line.past_day || 0), 0);
    return total.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
  }, [lines]);

  const clientLabel =
    assignment?.customer?.company ||
    `${assignment?.customer?.user?.first_name ?? ''} ${assignment?.customer?.user?.last_name ?? ''}`.trim() ||
    '-';

  function handleUnauthorized() {
    localStorage.removeItem('authSession');
    window.location.href = '/login';
  }

  function handleLogout() {
    localStorage.removeItem('authSession');
    window.location.href = '/login';
  }

  async function handleDayClick(day) {
    if (!session?.token || !report?.id || !report?.assignments_id || pendingDay === day) {
      return;
    }

    const currentLine = linesByDay.get(day);
    const currentValue = Number(currentLine?.past_day ?? 0);
    const nextValue = currentValue === 0 ? 0.5 : currentValue === 0.5 ? 1 : 0;

    setPendingDay(day);
    setErrorMessage('');

    try {
      if (!currentLine && nextValue > 0) {
        const response = await fetch(`${apiBaseUrl}/activity-reports-lines`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.token}`,
          },
          body: JSON.stringify({
            day,
            past_day: nextValue,
            activity_reports_id: report.id,
            assignments_id: report.assignments_id,
          }),
        });

        const data = await response.json().catch(() => null);
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }
        if (!response.ok) {
          throw new Error(
            Array.isArray(data?.message)
              ? data.message.join(', ')
              : data?.message ?? 'Impossible de créer la ligne.',
          );
        }

        setLines((current) => [...current.filter((line) => line.day !== day), data]);
        return;
      }

      if (currentLine && nextValue > 0) {
        const response = await fetch(`${apiBaseUrl}/activity-reports-lines/${currentLine.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.token}`,
          },
          body: JSON.stringify({
            past_day: nextValue,
          }),
        });

        const data = await response.json().catch(() => null);
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }
        if (!response.ok) {
          throw new Error(
            Array.isArray(data?.message)
              ? data.message.join(', ')
              : data?.message ?? 'Impossible de mettre à jour la ligne.',
          );
        }

        setLines((current) =>
          current.map((line) => (line.id === currentLine.id ? data : line)),
        );
        return;
      }

      if (currentLine && nextValue === 0) {
        const response = await fetch(`${apiBaseUrl}/activity-reports-lines/${currentLine.id}`, {
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
          throw new Error(
            Array.isArray(data?.message)
              ? data.message.join(', ')
              : data?.message ?? 'Impossible de supprimer la ligne.',
          );
        }

        setLines((current) => current.filter((line) => line.id !== currentLine.id));
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Une erreur est survenue.',
      );
    } finally {
      setPendingDay(null);
    }
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
              <li className="cr-nav-item active">
                <a href="/compte-rendu" className="cr-nav-link">
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
          <p className="cr-copyright">© 2026. Propulsé par Timizer</p>
        </div>
      </aside>

      <main className="cr-main-content cr-detail-content">
        <header className="cr-content-header">
          <div>
            <Link to="/compte-rendu" className="cr-detail-back">
              Retour aux CRA
            </Link>
            <h1 className="cr-page-title">Compte rendu d&apos;activité</h1>
            <p className="cr-detail-period">
              {report ? monthTitleFormatter.format(new Date(report.year, report.month - 1, 1)) : ''}
            </p>
          </div>
          <div className="cr-user-info">
            <div className="cr-user-details">
              <span className="cr-user-name">{fullName}</span>
              <span className="cr-user-email">{email}</span>
            </div>
            <a href="/dashboard" className="cr-user-badge-link" title="Dashboard">
              <div className="cr-user-avatar">{initials}</div>
            </a>
          </div>
        </header>

        {isLoading ? <p className="cr-detail-message">Chargement du CRA...</p> : null}
        {errorMessage ? <p className="cr-detail-message cr-detail-error">{errorMessage}</p> : null}

        {!isLoading && !errorMessage && report ? (
          <section className="cr-detail-shell">
            <div className="cr-detail-summary">
              <div className="cr-detail-card">
                <span className="cr-detail-label">Mission</span>
                <strong>{assignment?.label ?? report.assignment?.label ?? '-'}</strong>
              </div>
              <div className="cr-detail-card">
                <span className="cr-detail-label">Client</span>
                <strong>{clientLabel}</strong>
              </div>
              <div className="cr-detail-card">
                <span className="cr-detail-label">Prestataire</span>
                <strong>{fullName}</strong>
              </div>
              <div className="cr-detail-card">
                <span className="cr-detail-label">Jours saisis</span>
                <strong>{totalDays} j.</strong>
              </div>
            </div>

            <div className="cr-calendar-card">
              <div className="cr-calendar-head">
                {weekdayLabels.map((label) => (
                  <span key={label} className="cr-calendar-weekday">
                    {label}
                  </span>
                ))}
              </div>
              <div className="cr-calendar-grid">
                {calendarCells.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="cr-calendar-cell empty" />;
                  }

                  const line = linesByDay.get(day);
                  const pastDay = Number(line?.past_day ?? 0);

                  return (
                    <button
                      type="button"
                      key={day}
                      className={`cr-calendar-cell ${pastDay ? 'filled' : ''} ${pendingDay === day ? 'is-pending' : ''}`}
                      onClick={() => handleDayClick(day)}
                    >
                      <span className="cr-calendar-day">{day}</span>
                      <span className="cr-calendar-value">{formatPastDay(pastDay)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
