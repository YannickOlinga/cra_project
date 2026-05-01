import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AiFillDelete } from 'react-icons/ai';
import { FaPencil } from 'react-icons/fa6';
import './compteRendu.css';
import './clients.css';
import AddCustomerModal from '../components/AddCustomerModal';
import AddAssignmentModal from '../components/AddAssignmentModal';
import DeleteCustomerModal from '../components/DeleteCustomerModal';
import { exportRowsToCsv } from '../utils/csvExport';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export default function Clients() {
  const [session, setSession] = useState(null);
  const [clients, setClients] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  const [missionCustomer, setMissionCustomer] = useState(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedClientIds, setSelectedClientIds] = useState([]);
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

    async function loadCustomers() {
      try {
        const response = await fetch(`${apiBaseUrl}/customers`, {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });

        const data = await response.json().catch(() => []);
        if (response.status === 401) {
          localStorage.removeItem('authSession');
          window.location.href = '/login';
          return;
        }
        if (!response.ok || !Array.isArray(data)) {
          throw new Error('Impossible de charger les clients.');
        }

        if (!isCancelled) {
          setClients(data);
        }
      } catch {
        if (!isCancelled) {
          setClients([]);
        }
      }
    }

    loadCustomers();

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

  function handleCustomerCreated(createdCustomer, options = {}) {
    setClients((current) => [createdCustomer, ...current]);
    if (!options.keepAdding) {
      setMissionCustomer(createdCustomer);
    }
  }

  function handleCustomerUpdated(updatedCustomer) {
    setClients((current) =>
      current.map((client) => (client.id === updatedCustomer.id ? updatedCustomer : client)),
    );
  }

  function handleCustomerDeleted(deletedCustomerId) {
    setClients((current) => current.filter((client) => client.id !== deletedCustomerId));
    setSelectedClientIds((current) =>
      current.filter((clientId) => clientId !== deletedCustomerId),
    );
  }

  function handleLogout() {
    localStorage.removeItem('authSession');
    window.location.href = '/login';
  }

  function handleToggleSelectionMode() {
    setIsSelectionMode((current) => !current);
    setSelectedClientIds([]);
  }

  function handleToggleClientSelection(clientId) {
    setSelectedClientIds((current) =>
      current.includes(clientId)
        ? current.filter((selectedId) => selectedId !== clientId)
        : [...current, clientId],
    );
  }

  async function handleBulkDeleteClients() {
    if (!session?.token || selectedClientIds.length === 0 || isBulkDeleting) {
      return;
    }

    const confirmed = window.confirm(
      `Supprimer ${selectedClientIds.length} client${selectedClientIds.length > 1 ? 's' : ''} ?`,
    );

    if (!confirmed) {
      return;
    }

    setIsBulkDeleting(true);

    try {
      const responses = await Promise.all(
        selectedClientIds.map((clientId) =>
          fetch(`${apiBaseUrl}/customers/${clientId}`, {
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
        throw new Error('Impossible de supprimer tous les clients sélectionnés.');
      }

      setClients((current) =>
        current.filter((client) => !selectedClientIds.includes(client.id)),
      );
      setSelectedClientIds([]);
      setIsSelectionMode(false);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : 'Impossible de supprimer les clients sélectionnés.',
      );
    } finally {
      setIsBulkDeleting(false);
    }
  }

  function handleExportCsv() {
    exportRowsToCsv(
      'clients.csv',
      [
        { key: 'nom', label: 'Nom' },
        { key: 'email', label: 'Email' },
        { key: 'entreprise', label: 'Entreprise' },
      ],
      clients.map((client) => ({
        nom:
          `${client.user?.first_name ?? ''} ${client.user?.last_name ?? ''}`.trim() ||
          `Client #${client.id}`,
        email: client.user?.email ?? '-',
        entreprise: client.company || 'Aucune entreprise',
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
              <li className="cr-nav-item active">
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

      <main className="cr-main-content clients-content">
        <header className="cr-content-header">
          <h1 className="cr-page-title">Clients</h1>
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

        <section className="clients-hero">
          <div className="clients-hero-copy">
            <div className="clients-hero-icon-wrap">
              <div className="clients-hero-icon">
                <span className="clients-hero-folder" />
              </div>
            </div>
            <div>
              <h2>Gérez vos clients efficacement</h2>
              <p>Centralisez toutes les informations liées à vos clients.</p>
              <p>Ajoutez et gérez les contacts clés pour chaque compte.</p>
            </div>
          </div>
          <button
            type="button"
            className="clients-add-button"
            onClick={() => setShowAddModal(true)}
          >
            Ajouter un Client
          </button>
        </section>

        <section className="clients-board">
          <div className="clients-toolbar">
            <div className="bulk-actions">
              <button
                type="button"
                className="clients-toolbar-btn"
                onClick={handleToggleSelectionMode}
              >
                {isSelectionMode ? 'Annuler la sélection' : 'Sélectionner'}
              </button>
              {isSelectionMode ? (
                <button
                  type="button"
                  className="bulk-delete-btn"
                  onClick={handleBulkDeleteClients}
                  disabled={selectedClientIds.length === 0 || isBulkDeleting}
                >
                  {isBulkDeleting
                    ? 'Suppression...'
                    : `Supprimer (${selectedClientIds.length})`}
                </button>
              ) : null}
            </div>
            <button type="button" className="clients-toolbar-btn" onClick={handleExportCsv}>
              Exporter (.csv)
            </button>
          </div>

          <div className="clients-table-shell">
            <table className="clients-table">
              <thead>
                <tr>
                  {isSelectionMode ? <th>Sélection</th> : null}
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Entreprise</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={isSelectionMode ? 5 : 4} className="clients-empty-cell">
                      Aucun client trouvé. Ajoutez un client pour commencer.
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => {
                    const fullName =
                      `${client.user?.first_name ?? ''} ${client.user?.last_name ?? ''}`.trim() ||
                      `Client #${client.id}`;

                    return (
                      <tr key={client.id}>
                        {isSelectionMode ? (
                          <td>
                            <input
                              type="checkbox"
                              className="bulk-checkbox"
                              checked={selectedClientIds.includes(client.id)}
                              onChange={() => handleToggleClientSelection(client.id)}
                              aria-label={`Sélectionner ${fullName}`}
                            />
                          </td>
                        ) : null}
                        <td className="clients-name-cell">{fullName}</td>
                        <td>{client.user?.email ?? '-'}</td>
                        <td>{client.company || 'Aucune entreprise'}</td>
                        <td>
                          <div className="clients-actions-cell">
                            <button
                              type="button"
                              className="clients-icon-btn"
                              title="Modifier"
                              onClick={() => setEditingClient(client)}
                            >
                              <FaPencil />
                            </button>
                            <button
                              type="button"
                              className="clients-icon-btn clients-icon-btn-danger"
                              title="Supprimer"
                              onClick={() => setDeletingClient(client)}
                            >
                              <AiFillDelete />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <AddCustomerModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onCreated={handleCustomerCreated}
        />
        <AddCustomerModal
          isOpen={Boolean(editingClient)}
          mode="edit"
          customer={editingClient}
          onClose={() => setEditingClient(null)}
          onUpdated={handleCustomerUpdated}
        />
        <DeleteCustomerModal
          isOpen={Boolean(deletingClient)}
          customer={deletingClient}
          onClose={() => setDeletingClient(null)}
          onDeleted={handleCustomerDeleted}
        />
        <AddAssignmentModal
          isOpen={Boolean(missionCustomer)}
          onClose={() => setMissionCustomer(null)}
          initialCustomerId={missionCustomer?.id ?? ''}
          onCreated={(_, options) => {
            if (!options?.keepAdding) {
              setMissionCustomer(null);
            }
          }}
        />
      </main>
    </div>
  );
}
