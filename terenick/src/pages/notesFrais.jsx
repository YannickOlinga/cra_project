import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './compteRendu.css';
import { exportRowsToCsv } from '../utils/csvExport';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

const monthFormatter = new Intl.DateTimeFormat('fr-FR', {
  month: 'long',
  year: 'numeric',
});

const TAX_RATE = 0.2;

function formatDays(value) {
  return `${Number(value).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} j.`;
}

function formatPeriod(month, year) {
  return monthFormatter.format(new Date(year, month - 1, 1));
}

function getAssignmentClientLabel(assignment) {
  return (
    assignment?.customer?.company ||
    `${assignment?.customer?.user?.first_name ?? ''} ${assignment?.customer?.user?.last_name ?? ''}`.trim() ||
    'Client inconnu'
  );
}

function getAssignmentProviderLabel(assignment) {
  const user = assignment?.provider?.user;
  const fullName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim();
  return fullName || 'Prestataire inconnu';
}

function getCounterpartyLabel(assignment, isCustomer) {
  return isCustomer
    ? getAssignmentProviderLabel(assignment)
    : getAssignmentClientLabel(assignment);
}

function buildMissionTotals({ reports, assignmentsById, linesByReportId, isCustomer }) {
  const totalsByAssignment = new Map();

  reports.forEach((report) => {
    const reportLines = linesByReportId.get(Number(report.id)) ?? [];

    reportLines.forEach((line) => {
      const assignmentId = Number(line.assignments_id);
      const assignment = assignmentsById.get(assignmentId);
      const dailyRate = Number(assignment?.hourly_rate || 0);
      const days = Number(line.past_day || 0);
      const amount = days * dailyRate;
      const taxAmount = amount * TAX_RATE;
      const totalWithTax = amount + taxAmount;
      const existing = totalsByAssignment.get(assignmentId) ?? {
        assignmentId,
        mission: assignment?.label || `Mission #${assignmentId}`,
        counterparty: getCounterpartyLabel(assignment, isCustomer),
        dailyRate,
        days: 0,
        amount: 0,
        taxAmount: 0,
        totalWithTax: 0,
        payableAmount: 0,
        payableTaxAmount: 0,
        payableTotalWithTax: 0,
        periods: new Set(),
        completedReports: 0,
        activeReports: 0,
      };

      existing.days += days;
      existing.amount += amount;
      existing.taxAmount += taxAmount;
      existing.totalWithTax += totalWithTax;
      existing.periods.add(formatPeriod(report.month, report.year));

      if (report.status === 'completed') {
        existing.payableAmount += amount;
        existing.payableTaxAmount += taxAmount;
        existing.payableTotalWithTax += totalWithTax;
        existing.completedReports += 1;
      } else {
        existing.activeReports += 1;
      }

      totalsByAssignment.set(assignmentId, existing);
    });
  });

  return Array.from(totalsByAssignment.values())
    .map((total) => ({
      ...total,
      periods: Array.from(total.periods),
    }))
    .sort((first, second) => second.amount - first.amount);
}

export default function NotesFrais() {
  const [session, setSession] = useState(null);
  const [missionTotals, setMissionTotals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const isCustomer = session?.role === 'customer';

  useEffect(() => {
    const storedSession = localStorage.getItem('authSession');
    if (!storedSession) {
      setSession(null);
      setIsLoading(false);
      return;
    }

    try {
      setSession(JSON.parse(storedSession));
    } catch {
      setSession(null);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session?.token) {
      return;
    }

    let isCancelled = false;

    async function loadMissionTotals() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [reportsResponse, assignmentsResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/activity-reports`, {
            headers: { Authorization: `Bearer ${session.token}` },
          }),
          fetch(`${apiBaseUrl}/assignments`, {
            headers: { Authorization: `Bearer ${session.token}` },
          }),
        ]);

        const [reportsData, assignmentsData] = await Promise.all([
          reportsResponse.json().catch(() => []),
          assignmentsResponse.json().catch(() => []),
        ]);

        if (!reportsResponse.ok || !Array.isArray(reportsData)) {
          throw new Error('Impossible de charger les CRA.');
        }

        if (!assignmentsResponse.ok || !Array.isArray(assignmentsData)) {
          throw new Error('Impossible de charger les missions.');
        }

        const linesEntries = await Promise.all(
          reportsData.map(async (report) => {
            const linesResponse = await fetch(
              `${apiBaseUrl}/activity-reports-lines?activity_report_id=${report.id}`,
              {
                headers: { Authorization: `Bearer ${session.token}` },
              },
            );
            const linesData = await linesResponse.json().catch(() => []);

            return [
              Number(report.id),
              linesResponse.ok && Array.isArray(linesData) ? linesData : [],
            ];
          }),
        );

        if (isCancelled) {
          return;
        }

        const assignmentsById = new Map(
          assignmentsData.map((assignment) => [Number(assignment.id), assignment]),
        );

        setMissionTotals(
          buildMissionTotals({
            reports: reportsData,
            assignmentsById,
            linesByReportId: new Map(linesEntries),
            isCustomer,
          }),
        );
      } catch (error) {
        if (!isCancelled) {
          setMissionTotals([]);
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

    loadMissionTotals();

    return () => {
      isCancelled = true;
    };
  }, [isCustomer, session]);

  const filteredTotals = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return missionTotals;
    }

    return missionTotals.filter((item) =>
      [item.mission, item.counterparty, item.periods.join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [missionTotals, searchTerm]);

  const stats = useMemo(() => {
    return missionTotals.reduce(
      (summary, item) => ({
        missions: summary.missions + 1,
        days: summary.days + item.days,
        amount: summary.amount + item.amount,
        taxAmount: summary.taxAmount + item.taxAmount,
        totalWithTax: summary.totalWithTax + item.totalWithTax,
        payableAmount: summary.payableAmount + item.payableAmount,
        payableTaxAmount: summary.payableTaxAmount + item.payableTaxAmount,
        payableTotalWithTax:
          summary.payableTotalWithTax + item.payableTotalWithTax,
      }),
      {
        missions: 0,
        days: 0,
        amount: 0,
        taxAmount: 0,
        totalWithTax: 0,
        payableAmount: 0,
        payableTaxAmount: 0,
        payableTotalWithTax: 0,
      },
    );
  }, [missionTotals]);

  const firstName = session?.user?.first_name?.trim?.() ?? 'Utilisateur';
  const lastName = session?.user?.last_name?.trim?.() ?? '';
  const email = session?.user?.email?.trim?.() ?? '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  const fullName = `${firstName} ${lastName}`.trim();

  function handleLogout() {
    localStorage.removeItem('authSession');
    window.location.href = '/login';
  }

  function handleExportCsv() {
    exportRowsToCsv(
      'total-a-payer-par-mission.csv',
      [
        { key: 'mission', label: 'Mission' },
        { key: 'tiers', label: isCustomer ? 'Prestataire' : 'Client' },
        { key: 'jours', label: 'Jours saisis' },
        { key: 'tarifJournalier', label: 'Tarif journalier' },
        { key: 'montantTotal', label: 'Montant total HT' },
        { key: 'ttc', label: 'Montant TTC' },
        {
          key: 'montantAPayer',
          label: isCustomer ? 'Montant du valide HT' : 'Montant valide a payer HT',
        },
        { key: 'ttcAPayer', label: isCustomer ? 'TTC du valide' : 'TTC valide' },
        { key: 'periodes', label: 'Périodes' },
      ],
      filteredTotals.map((item) => ({
        mission: item.mission,
        tiers: item.counterparty,
        jours: item.days,
        tarifJournalier: item.dailyRate,
        montantTotal: item.amount,
        ttc: item.totalWithTax,
        montantAPayer: item.payableAmount,
        ttcAPayer: item.payableTotalWithTax,
        periodes: item.periods.join(' | '),
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
              <li className="cr-nav-item">
                <a href="/compte-rendu" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>CRA</span>
                </a>
              </li>
              <li className="cr-nav-item active">
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

      <main className="cr-main-content notes-fees-content">
        <header className="cr-content-header">
          <div>
            <h1 className="cr-page-title">Notes de frais</h1>
            <p className="notes-fees-subtitle">
              {isCustomer ? 'Montants dus par mission' : 'Total à payer par mission'}
            </p>
          </div>
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

        <section className="notes-fees-summary">
          <div className="notes-fees-card notes-fees-card-primary">
            <span>{isCustomer ? 'Total dû validé TTC' : 'Total à payer validé'}</span>
            <strong>
              {currencyFormatter.format(
                isCustomer ? stats.payableTotalWithTax : stats.payableAmount,
              )}
            </strong>
            <small>CRA terminés uniquement</small>
          </div>
          <div className="notes-fees-card">
            <span>{isCustomer ? 'Total dû HT' : 'Total à facturer'}</span>
            <strong>{currencyFormatter.format(stats.amount)}</strong>
            <small>Tous les CRA saisis</small>
          </div>
          <div className="notes-fees-card">
            <span>{isCustomer ? 'Total dû TTC' : 'Total TTC'}</span>
            <strong>{currencyFormatter.format(stats.totalWithTax)}</strong>
            <small>HT + TVA</small>
          </div>
          <div className="notes-fees-card">
            <span>Jours saisis</span>
            <strong>{formatDays(stats.days)}</strong>
            <small>{stats.missions} mission{stats.missions > 1 ? 's' : ''}</small>
          </div>
        </section>

        <div className="cr-table-controls">
          <input
            type="search"
            className="notes-fees-search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={`Rechercher une mission ou un ${isCustomer ? 'prestataire' : 'client'}`}
          />
          <div className="cr-table-controls-right">
            <button type="button" className="cr-btn cr-btn-outline" onClick={handleExportCsv}>
              Exporter (.csv)
            </button>
          </div>
        </div>

        {isLoading ? <p className="cr-detail-message">Chargement des montants...</p> : null}
        {errorMessage ? <p className="cr-detail-message cr-detail-error">{errorMessage}</p> : null}

        {!isLoading && !errorMessage ? (
          <div className="cr-table-container">
            <table className="cr-activities-table notes-fees-table">
              <thead>
                <tr>
                  <th>Mission</th>
                  <th>{isCustomer ? 'Prestataire' : 'Client'}</th>
                  <th>Jours</th>
                  <th>TJM</th>
                  <th>Total HT</th>
                  <th>TTC</th>
                  <th>{isCustomer ? 'Dû validé TTC' : 'À payer validé'}</th>
                  <th>Périodes</th>
                </tr>
              </thead>
              <tbody>
                {filteredTotals.length ? (
                  filteredTotals.map((item) => (
                    <tr key={item.assignmentId}>
                      <td>
                        <strong>{item.mission}</strong>
                      </td>
                      <td>{item.counterparty}</td>
                      <td>{formatDays(item.days)}</td>
                      <td>{currencyFormatter.format(item.dailyRate)}</td>
                      <td>
                        <strong>{currencyFormatter.format(item.amount)}</strong>
                      </td>
                      <td>
                        <strong>{currencyFormatter.format(item.totalWithTax)}</strong>
                      </td>
                      <td>
                        <span className="notes-fees-payable">
                          {currencyFormatter.format(
                            isCustomer ? item.payableTotalWithTax : item.payableAmount,
                          )}
                        </span>
                      </td>
                      <td>
                        <span className="notes-fees-periods">
                          {item.periods.join(', ')}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="notes-fees-empty">
                      Aucun montant à payer pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </main>
    </div>
  );
}
