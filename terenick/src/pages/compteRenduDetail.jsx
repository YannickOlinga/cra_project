import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './compteRendu.css';
import './compteRenduDetail.css';
import { exportRowsToCsv } from '../utils/csvExport';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const weekdayLabels = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];

const monthTitleFormatter = new Intl.DateTimeFormat('fr-FR', {
  month: 'long',
  year: 'numeric',
});

const dayDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
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

function buildCalendarWeeks(cells) {
  const weeks = [];

  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  return weeks;
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

function formatSummaryDays(value) {
  return `${Number(value).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} j.`;
}

function getAssignmentClientLabel(assignment) {
  return (
    assignment?.customer?.company ||
    `${assignment?.customer?.user?.first_name ?? ''} ${assignment?.customer?.user?.last_name ?? ''}`.trim() ||
    '-'
  );
}

function getWeekRangeLabel(week) {
  const days = week.filter(Boolean);

  if (!days.length) {
    return '';
  }

  return `du ${days[0]} au ${days[days.length - 1]}`;
}

function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export default function CompteRenduDetail() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [report, setReport] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [reportAssignments, setReportAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [monthlyReportContexts, setMonthlyReportContexts] = useState([]);
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

        const assignmentsResponse = await fetch(`${apiBaseUrl}/assignments`, {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });
        const assignmentsData = await assignmentsResponse.json().catch(() => []);
        const providerAssignments = Array.isArray(assignmentsData) ? assignmentsData : [];
        const assignmentsById = new Map(
          providerAssignments.map((providerAssignment) => [
            Number(providerAssignment.id),
            providerAssignment,
          ]),
        );
        const reportAssignmentIds = Array.from(
          new Set([
            ...(reportData.assignment_ids ?? []),
            ...(reportData.assignments_id ? [reportData.assignments_id] : []),
          ].map(Number).filter(Boolean)),
        );
        const reportAssignmentsData = reportAssignmentIds
          .map((assignmentId) => assignmentsById.get(assignmentId))
          .filter(Boolean);
        const assignmentData = reportAssignmentsData[0] ?? null;

        const reportsResponse = await fetch(`${apiBaseUrl}/activity-reports`, {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });
        const reportsData = await reportsResponse.json().catch(() => []);

        const sameMonthReports = Array.isArray(reportsData)
          ? reportsData.filter(
              (monthlyReport) =>
                Number(monthlyReport.month) === Number(reportData.month) &&
                Number(monthlyReport.year) === Number(reportData.year),
            )
          : [];

        const reportContexts = await Promise.all(
          sameMonthReports.map(async (monthlyReport) => {
            const reportLinesPromise =
              Number(monthlyReport.id) === Number(reportData.id)
                ? Promise.resolve(linesData)
                : fetch(
                    `${apiBaseUrl}/activity-reports-lines?activity_report_id=${monthlyReport.id}`,
                    {
                      headers: {
                        Authorization: `Bearer ${session.token}`,
                      },
                    },
                  )
                    .then((response) => response.json())
                    .catch(() => []);

            const assignmentPromise =
              Promise.resolve(
                Array.from(
                  new Set([
                    ...(monthlyReport.assignment_ids ?? []),
                    ...(monthlyReport.assignments_id
                      ? [monthlyReport.assignments_id]
                      : []),
                  ].map(Number).filter(Boolean)),
                )
                  .map((assignmentId) => assignmentsById.get(assignmentId))
                  .filter(Boolean),
              );

            const [monthlyLines, monthlyAssignment] = await Promise.all([
              reportLinesPromise,
              assignmentPromise,
            ]);

            return {
              report: monthlyReport,
              assignment: monthlyAssignment[0] ?? null,
              assignments: monthlyAssignment,
              lines: Array.isArray(monthlyLines) ? monthlyLines : [],
            };
          }),
        );

        if (isCancelled) {
          return;
        }

        setReport(reportData);
        setLines(linesData);
        setAssignment(assignmentData);
        setReportAssignments(reportAssignmentsData);
        setSelectedAssignmentId((current) =>
          reportAssignmentsData.some((item) => String(item.id) === current)
            ? current
            : reportAssignmentsData[0]
              ? String(reportAssignmentsData[0].id)
              : '',
        );
        setMonthlyReportContexts(reportContexts);
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
  const isCustomer = session?.role === 'customer';

  const calendarCells = useMemo(() => {
    if (!report?.month || !report?.year) {
      return [];
    }

    return buildMonthGrid(report.month, report.year);
  }, [report]);

  const calendarWeeks = useMemo(() => buildCalendarWeeks(calendarCells), [calendarCells]);

  const dayWeekIndex = useMemo(() => {
    return calendarWeeks.reduce((map, week, weekIndex) => {
      week.forEach((day) => {
        if (day) {
          map.set(day, weekIndex);
        }
      });

      return map;
    }, new Map());
  }, [calendarWeeks]);

  const selectedLinesByDay = useMemo(() => {
    return lines.reduce((map, line) => {
      if (String(line.assignments_id) === selectedAssignmentId) {
        map.set(line.day, line);
      }
      return map;
    }, new Map());
  }, [lines, selectedAssignmentId]);

  const dayTotals = useMemo(() => {
    return lines.reduce((map, line) => {
      map.set(line.day, (map.get(line.day) ?? 0) + Number(line.past_day || 0));
      return map;
    }, new Map());
  }, [lines]);

  const totalDays = useMemo(() => {
    const total = lines.reduce((sum, line) => sum + Number(line.past_day || 0), 0);
    return total.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
  }, [lines]);

  const weeklyMissionSummaries = useMemo(() => {
    return monthlyReportContexts.reduce((map, context) => {
      const contextLines =
        Number(context.report?.id) === Number(report?.id) ? lines : context.lines;

      contextLines.forEach((line) => {
        const weekIndex = dayWeekIndex.get(Number(line.day));
        const pastDay = Number(line.past_day ?? 0);

        if (weekIndex === undefined || pastDay <= 0) {
          return;
        }

        if (!map.has(weekIndex)) {
          map.set(weekIndex, new Map());
        }

        const weekMap = map.get(weekIndex);
        const assignmentId = Number(line.assignments_id);
        const contextAssignment = context.assignments?.find(
          (item) => Number(item.id) === assignmentId,
        ) ?? context.assignment;
        const existing = weekMap.get(assignmentId) ?? {
          assignmentId,
          mission:
            contextAssignment?.label ||
            context.report?.assignment?.label ||
            `Mission #${assignmentId}`,
          client: getAssignmentClientLabel(contextAssignment),
          total: 0,
        };

        weekMap.set(assignmentId, {
          ...existing,
          total: existing.total + pastDay,
        });
      });

      return map;
    }, new Map());
  }, [dayWeekIndex, lines, monthlyReportContexts, report]);

  const monthlyMissions = useMemo(() => {
    return Array.from(
      new Set(
        monthlyReportContexts.flatMap((context) =>
          context.assignments?.length
            ? context.assignments.map((item) => item.label || `Mission #${item.id}`)
            : [
                context.assignment?.label ||
                  context.report?.assignment?.label ||
                  `Mission #${context.report?.assignments_id ?? context.report?.id}`,
              ],
        ),
      ),
    );
  }, [monthlyReportContexts]);

  const monthlyClients = useMemo(() => {
    return Array.from(
      new Set(
        monthlyReportContexts
          .flatMap((context) =>
            context.assignments?.length
              ? context.assignments.map((item) => getAssignmentClientLabel(item))
              : [getAssignmentClientLabel(context.assignment)],
          )
          .filter((label) => label && label !== '-'),
      ),
    );
  }, [monthlyReportContexts]);

  const clientLabel = getAssignmentClientLabel(assignment);

  function handleExportCsv() {
    if (!report) {
      return;
    }

    const assignmentsById = new Map(
      reportAssignments.map((reportAssignment) => [
        Number(reportAssignment.id),
        reportAssignment,
      ]),
    );
    const periodLabel = monthTitleFormatter.format(
      new Date(report.year, report.month - 1, 1),
    );

    exportRowsToCsv(
      `cra-${slugify(periodLabel)}.csv`,
      [
        { key: 'periode', label: 'Période' },
        { key: 'date', label: 'Date' },
        { key: 'jour', label: 'Jour' },
        { key: 'mission', label: 'Mission' },
        { key: 'client', label: 'Client' },
        { key: 'temps', label: 'Temps' },
        { key: 'prestataire', label: 'Prestataire' },
      ],
      [...lines]
        .sort((first, second) => {
          if (Number(first.day) !== Number(second.day)) {
            return Number(first.day) - Number(second.day);
          }

          return Number(first.assignments_id) - Number(second.assignments_id);
        })
        .map((line) => {
          const lineAssignment = assignmentsById.get(Number(line.assignments_id));
          const date = new Date(report.year, report.month - 1, Number(line.day));

          return {
            periode: periodLabel,
            date: dayDateFormatter.format(date),
            jour: line.day,
            mission: lineAssignment?.label || `Mission #${line.assignments_id}`,
            client: getAssignmentClientLabel(lineAssignment),
            temps: formatSummaryDays(line.past_day),
            prestataire: fullName,
          };
        }),
    );
  }

  function handleUnauthorized() {
    localStorage.removeItem('authSession');
    window.location.href = '/login';
  }

  function handleLogout() {
    localStorage.removeItem('authSession');
    window.location.href = '/login';
  }

  async function handleDayClick(day) {
    if (
      isCustomer ||
      !session?.token ||
      !report?.id ||
      !selectedAssignmentId ||
      pendingDay === day
    ) {
      return;
    }

    const currentLine = selectedLinesByDay.get(day);
    const currentValue = Number(currentLine?.past_day ?? 0);
    const dayTotal = Number(dayTotals.get(day) ?? 0);
    const nextValue = currentValue === 0 ? 0.5 : currentValue === 0.5 ? 1 : 0;

    if (nextValue > currentValue && dayTotal - currentValue + nextValue > 1) {
      setErrorMessage('Le total saisi sur une journée ne peut pas dépasser 1 j.');
      return;
    }

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
            assignments_id: Number(selectedAssignmentId),
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
              {!isCustomer ? (
                <>
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
                </>
              ) : null}
              <li className="cr-nav-item active">
                <a href="/compte-rendu" className="cr-nav-link">
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
          <div className="cr-detail-header-actions">
            <button
              type="button"
              className="cr-btn cr-btn-outline cr-detail-export-btn"
              onClick={handleExportCsv}
              disabled={!report || lines.length === 0}
            >
              Exporter (.csv)
            </button>
            <div className="cr-user-info">
              <div className="cr-user-details">
                <span className="cr-user-name">{fullName}</span>
                <span className="cr-user-email">{email}</span>
              </div>
              <a href="/profile" className="cr-user-badge-link" title="Profil">
                <div className="cr-user-avatar">{initials}</div>
              </a>
            </div>
          </div>
        </header>

        {isLoading ? <p className="cr-detail-message">Chargement du CRA...</p> : null}
        {errorMessage ? <p className="cr-detail-message cr-detail-error">{errorMessage}</p> : null}

        {!isLoading && !errorMessage && report ? (
          <section className="cr-detail-shell">
            <div className="cr-detail-summary">
              <div className="cr-detail-card">
                <span className="cr-detail-label">Missions</span>
                <strong>
                  {monthlyMissions.length > 1
                    ? `${monthlyMissions.length} missions`
                    : assignment?.label ?? report.assignment?.label ?? '-'}
                </strong>
                {monthlyMissions.length > 1 ? (
                  <span className="cr-detail-card-note">{monthlyMissions.join(', ')}</span>
                ) : null}
              </div>
              <div className="cr-detail-card">
                <span className="cr-detail-label">Clients</span>
                <strong>
                  {monthlyClients.length > 1
                    ? `${monthlyClients.length} clients`
                    : monthlyClients[0] ?? clientLabel}
                </strong>
                {monthlyClients.length > 1 ? (
                  <span className="cr-detail-card-note">{monthlyClients.join(', ')}</span>
                ) : null}
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
              <div className="cr-assignment-picker">
                <span className="cr-assignment-picker-label">
                  {isCustomer ? 'Mission affichée' : 'Mission à renseigner'}
                </span>
                <div className="cr-assignment-picker-options">
                  {reportAssignments.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className={`cr-assignment-chip ${String(item.id) === selectedAssignmentId ? 'active' : ''}`}
                      onClick={() => setSelectedAssignmentId(String(item.id))}
                    >
                      <strong>{item.label || `Mission #${item.id}`}</strong>
                      <small>{getAssignmentClientLabel(item)}</small>
                    </button>
                  ))}
                </div>
              </div>
              <div className="cr-calendar-head">
                {weekdayLabels.map((label) => (
                  <span key={label} className="cr-calendar-weekday">
                    {label}
                  </span>
                ))}
              </div>
              <div className="cr-calendar-weeks">
                {calendarWeeks.map((week, weekIndex) => {
                  const summaries = Array.from(
                    weeklyMissionSummaries.get(weekIndex)?.values() ?? [],
                  ).sort((first, second) => first.mission.localeCompare(second.mission));

                  return (
                    <div className="cr-calendar-week" key={`week-${weekIndex}`}>
                      <div className="cr-calendar-grid">
                        {week.map((day, index) => {
                          if (!day) {
                            return (
                              <div
                                key={`empty-${weekIndex}-${index}`}
                                className="cr-calendar-cell empty"
                              />
                            );
                          }

                          const selectedLine = selectedLinesByDay.get(day);
                          const selectedPastDay = Number(selectedLine?.past_day ?? 0);
                          const dayTotal = Number(dayTotals.get(day) ?? 0);

                          return (
                            <button
                              type="button"
                              key={day}
                              className={`cr-calendar-cell ${dayTotal ? 'filled' : ''} ${selectedPastDay ? 'is-selected-mission' : ''} ${pendingDay === day ? 'is-pending' : ''} ${isCustomer ? 'is-read-only' : ''}`}
                              onClick={() => handleDayClick(day)}
                              disabled={isCustomer}
                            >
                              <span className="cr-calendar-day">{day}</span>
                              <span className="cr-calendar-value">
                                {formatPastDay(dayTotal)}
                              </span>
                              {selectedPastDay ? (
                                <span className="cr-calendar-selected-value">
                                  Mission: {formatPastDay(selectedPastDay)}
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>

                      <div className="cr-week-summary">
                        <div className="cr-week-summary-header">
                          <span>Semaine {weekIndex + 1}</span>
                          <strong>{getWeekRangeLabel(week)}</strong>
                        </div>

                        {summaries.length ? (
                          <div className="cr-week-missions">
                            {summaries.map((summary) => (
                              <button
                                key={summary.assignmentId}
                                type="button"
                                onClick={() => setSelectedAssignmentId(String(summary.assignmentId))}
                                className={`cr-week-mission ${String(summary.assignmentId) === selectedAssignmentId ? 'is-current' : ''}`}
                              >
                                <span className="cr-week-mission-main">
                                  <strong>{summary.mission}</strong>
                                  <small>{summary.client}</small>
                                </span>
                                <span className="cr-week-mission-days">
                                  {formatSummaryDays(summary.total)}
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="cr-week-empty">Aucune mission saisie cette semaine.</p>
                        )}
                      </div>
                    </div>
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
