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

function getPaymentStorageKey(session) {
  return `facturationPaidMonths:${session?.user?.id ?? session?.user?.email ?? 'anonymous'}`;
}

function buildMonthlyTotals({ reports, assignmentsById, linesByReportId, isCustomer }) {
  const totalsByMonth = new Map();

  reports.forEach((report) => {
    const reportLines = linesByReportId.get(Number(report.id)) ?? [];
    const monthKey = `${report.year}-${String(report.month).padStart(2, '0')}`;
    const existing = totalsByMonth.get(monthKey) ?? {
      id: monthKey,
      month: report.month,
      year: report.year,
      period: formatPeriod(report.month, report.year),
      missions: new Set(),
      counterparties: new Set(),
      days: 0,
      amount: 0,
      payableAmount: 0,
      completedReports: 0,
      activeReports: 0,
    };

    if (report.status === 'completed') {
      existing.completedReports += 1;
    } else {
      existing.activeReports += 1;
    }

    reportLines.forEach((line) => {
      const assignmentId = Number(line.assignments_id);
      const assignment = assignmentsById.get(assignmentId);
      const dailyRate = Number(assignment?.hourly_rate || 0);
      const days = Number(line.past_day || 0);
      const amount = days * dailyRate;

      existing.missions.add(assignment?.label || `Mission #${assignmentId}`);
      existing.counterparties.add(getCounterpartyLabel(assignment, isCustomer));
      existing.days += days;
      existing.amount += amount;

      if (report.status === 'completed') {
        existing.payableAmount += amount;
      }
    });

    totalsByMonth.set(monthKey, existing);
  });

  return Array.from(totalsByMonth.values())
    .map((total) => ({
      ...total,
      missions: Array.from(total.missions),
      counterparties: Array.from(total.counterparties),
    }))
    .sort((first, second) => {
      if (first.year !== second.year) {
        return second.year - first.year;
      }

      return second.month - first.month;
    });
}

export default function NotesFrais() {
  const [session, setSession] = useState(null);
  const [monthlyTotals, setMonthlyTotals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [paidMonths, setPaidMonths] = useState([]);
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
    if (!session?.user) {
      setPaidMonths([]);
      return;
    }

    try {
      const storedPaidMonths = JSON.parse(
        localStorage.getItem(getPaymentStorageKey(session)) ?? '[]',
      );
      setPaidMonths(Array.isArray(storedPaidMonths) ? storedPaidMonths : []);
    } catch {
      setPaidMonths([]);
    }
  }, [session]);

  useEffect(() => {
    if (!session?.token) {
      return;
    }

    let isCancelled = false;

    async function loadMonthlyTotals() {
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

        setMonthlyTotals(
          buildMonthlyTotals({
            reports: reportsData,
            assignmentsById,
            linesByReportId: new Map(linesEntries),
            isCustomer,
          }),
        );
      } catch (error) {
        if (!isCancelled) {
          setMonthlyTotals([]);
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

    loadMonthlyTotals();

    return () => {
      isCancelled = true;
    };
  }, [isCustomer, session]);

  const filteredTotals = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return monthlyTotals;
    }

    return monthlyTotals.filter((item) =>
      [item.period, item.missions.join(' '), item.counterparties.join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [monthlyTotals, searchTerm]);

  const stats = useMemo(() => {
    return monthlyTotals.reduce(
      (summary, item) => ({
        months: summary.months + 1,
        days: summary.days + item.days,
        amount: summary.amount + item.amount,
        payableAmount: summary.payableAmount + item.payableAmount,
      }),
      {
        months: 0,
        days: 0,
        amount: 0,
        payableAmount: 0,
      },
    );
  }, [monthlyTotals]);

  const paidMonthSet = useMemo(() => new Set(paidMonths), [paidMonths]);

  const paidStats = useMemo(() => {
    return monthlyTotals.reduce(
      (summary, item) => {
        if (!paidMonthSet.has(item.id)) {
          return summary;
        }

        return {
          months: summary.months + 1,
          amount: summary.amount + item.payableAmount,
        };
      },
      { months: 0, amount: 0 },
    );
  }, [monthlyTotals, paidMonthSet]);

  const firstName = session?.user?.first_name?.trim?.() ?? 'Utilisateur';
  const lastName = session?.user?.last_name?.trim?.() ?? '';
  const email = session?.user?.email?.trim?.() ?? '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  const fullName = `${firstName} ${lastName}`.trim();

  function handleLogout() {
    localStorage.removeItem('authSession');
    window.location.href = '/login';
  }

  function handleTogglePaidMonth(monthId) {
    setPaidMonths((current) => {
      const nextPaidMonths = current.includes(monthId)
        ? current.filter((paidMonthId) => paidMonthId !== monthId)
        : [...current, monthId];

      localStorage.setItem(
        getPaymentStorageKey(session),
        JSON.stringify(nextPaidMonths),
      );

      return nextPaidMonths;
    });
  }

  function handleExportCsv() {
    exportRowsToCsv(
      'total-a-payer-par-mois.csv',
      [
        { key: 'periode', label: 'Période' },
        { key: 'missions', label: 'Missions' },
        { key: 'tiers', label: isCustomer ? 'Prestataires' : 'Clients' },
        { key: 'jours', label: 'Jours saisis' },
        { key: 'montantTotal', label: 'Montant total HT' },
        {
          key: 'montantAPayer',
          label: isCustomer ? 'Montant dû validé HT' : 'Montant valide à payer HT',
        },
        { key: 'statut', label: 'Statut' },
        { key: 'paiement', label: 'Paiement' },
      ],
      filteredTotals.map((item) => ({
        periode: item.period,
        missions: item.missions.join(' | '),
        tiers: item.counterparties.join(' | '),
        jours: item.days,
        montantTotal: item.amount,
        montantAPayer: item.payableAmount,
        statut:
          item.completedReports > 0 && item.activeReports === 0
            ? 'Validé'
            : item.completedReports > 0
              ? 'Partiellement validé'
              : 'En attente',
        paiement: paidMonthSet.has(item.id) ? 'Payé' : 'Non payé',
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
                <a href="/facturation" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>Facturation</span>
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
            <h1 className="cr-page-title">Facturation</h1>
            <p className="notes-fees-subtitle">
              {isCustomer ? 'Montants dus par mois' : 'Total à payer par mois'}
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
            <span>{isCustomer ? 'Total dû validé' : 'Total à payer validé'}</span>
            <strong>{currencyFormatter.format(stats.payableAmount)}</strong>
            <small>CRA terminés uniquement</small>
          </div>
          <div className="notes-fees-card">
            <span>{isCustomer ? 'Total dû HT' : 'Total à facturer'}</span>
            <strong>{currencyFormatter.format(stats.amount)}</strong>
            <small>Tous les CRA saisis</small>
          </div>
          <div className="notes-fees-card">
            <span>Jours saisis</span>
            <strong>{formatDays(stats.days)}</strong>
            <small>{stats.months} mois</small>
          </div>
          <div className="notes-fees-card">
            <span>Mois suivis</span>
            <strong>{stats.months}</strong>
            <small>Total mensuel</small>
          </div>
          <div className="notes-fees-card">
            <span>Déjà payé</span>
            <strong>{currencyFormatter.format(paidStats.amount)}</strong>
            <small>{paidStats.months} mois payé{paidStats.months > 1 ? 's' : ''}</small>
          </div>
        </section>

        <div className="cr-table-controls">
          <input
            type="search"
            className="notes-fees-search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={`Rechercher un mois, une mission ou un ${isCustomer ? 'prestataire' : 'client'}`}
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
                  <th>Période</th>
                  <th>Missions</th>
                  <th>{isCustomer ? 'Prestataires' : 'Clients'}</th>
                  <th>Jours</th>
                  <th>Total HT</th>
                  <th>{isCustomer ? 'Dû validé' : 'À payer validé'}</th>
                  <th>Statut</th>
                  <th>Paiement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTotals.length ? (
                  filteredTotals.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.period}</strong>
                      </td>
                      <td>
                        <span className="notes-fees-periods">
                          {item.missions.join(', ')}
                        </span>
                      </td>
                      <td>
                        <span className="notes-fees-periods">
                          {item.counterparties.join(', ')}
                        </span>
                      </td>
                      <td>{formatDays(item.days)}</td>
                      <td>
                        <strong>{currencyFormatter.format(item.amount)}</strong>
                      </td>
                      <td>
                        <span className="notes-fees-payable">
                          {currencyFormatter.format(item.payableAmount)}
                        </span>
                      </td>
                      <td>
                        {item.completedReports > 0 && item.activeReports === 0
                          ? 'Validé'
                          : item.completedReports > 0
                            ? 'Partiellement validé'
                            : 'En attente'}
                      </td>
                      <td>
                        <span
                          className={`notes-fees-payment-status ${paidMonthSet.has(item.id) ? 'is-paid' : ''}`}
                        >
                          {paidMonthSet.has(item.id) ? 'Payé' : 'Non payé'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="notes-fees-payment-btn"
                          onClick={() => handleTogglePaidMonth(item.id)}
                          disabled={item.payableAmount <= 0}
                        >
                          {paidMonthSet.has(item.id)
                            ? 'Marquer non payé'
                            : 'Marquer comme payé'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="notes-fees-empty">
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
