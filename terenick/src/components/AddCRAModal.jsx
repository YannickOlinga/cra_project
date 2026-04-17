import React, { useState } from 'react';
import './AddCRAModal.css';

export default function AddCRAModal({ isOpen, onClose, onGenerate }) {
  const [formData, setFormData] = useState({
    periode: 'mai-2026',
    prestataire: 'Terenick',
    mission: '',
    granularite: ''
  });

  const [selectedGranularite, setSelectedGranularite] = useState('');

  if (!isOpen) return null;

  const handlePeriodeChange = (e) => {
    setFormData({ ...formData, periode: e.target.value });
  };

  const handleMissionChange = (e) => {
    setFormData({ ...formData, mission: e.target.value });
  };

  const handleGranulariteSelect = (granularite) => {
    setSelectedGranularite(granularite);
    setFormData({ ...formData, granularite });
  };

  const handleGenerate = () => {
    if (formData.periode && formData.mission && formData.granularite) {
      onGenerate(formData);
    } else {
      alert('Veuillez remplir toutes les étapes');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Ajouter un CRA</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          {/* Étape 1 */}
          <div className="step">
            <h3>Étape 1: Sélectionnez la période pour laquelle émettre le CRA.</h3>
            <select 
              className="form-select" 
              value={formData.periode}
              onChange={handlePeriodeChange}
            >
              <option value="mai-2026">Mai 2026</option>
              <option value="avril-2026">Avril 2026</option>
              <option value="mars-2026">Mars 2026</option>
              <option value="fevrier-2026">Février 2026</option>
              <option value="janvier-2026">Janvier 2026</option>
            </select>
          </div>

          {/* Étape 2 */}
          <div className="step">
            <h3>Étape 2: Sélectionnez le prestataire au nom duquel émettre le CRA (c'est l'entreprise qui facture).</h3>
            <div className="provider-info">
              <div className="provider-details">
                <span className="provider-name">Terenick</span>
                <span className="provider-default">Prestataire défini par défaut.</span>
              </div>
              <a href="#" className="modify-link" onClick={(e) => e.preventDefault()}>Modifier</a>
            </div>
          </div>

          {/* Étape 3 */}
          <div className="step">
            <h3>Étape 3: Sélectionnez la mission liée à votre CRA.</h3>
            <select 
              className="form-select"
              value={formData.mission}
              onChange={handleMissionChange}
            >
              <option value="">Sélectionnez une mission</option>
              <option value="creation-site-web">Création de site web TEST</option>
              <option value="developpement-app">Développement d'application mobile</option>
              <option value="consulting-tech">Consulting technique</option>
              <option value="maintenance">Maintenance et support</option>
            </select>
          </div>

          {/* Étape 4 */}
          <div className="step">
            <h3>Étape 4: Enfin, choisissez la granularité qui correspond le mieux à votre mission : à la journée / demi-journée ou à l'heure.</h3>
            <div className="granularity-options">
              <button 
                className={`granularity-btn ${selectedGranularite === 'daily' ? 'selected' : ''}`}
                onClick={() => handleGranulariteSelect('daily')}
              >
                À la journée
              </button>
              <button 
                className={`granularity-btn ${selectedGranularite === 'hourly' ? 'selected' : ''}`}
                onClick={() => handleGranulariteSelect('hourly')}
              >
                À l'heure
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-cancel" onClick={onClose}>
            Annuler
          </button>
          <button className="btn btn-generate" onClick={handleGenerate}>
            Générer
          </button>
        </div>
      </div>
    </div>
  );
}
