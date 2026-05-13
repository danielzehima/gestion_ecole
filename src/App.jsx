import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  Bell, 
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  AlertCircle,
  X,
  Save,
  Plus,
  Trash2,
  Printer,
  Mail,
  LogOut
} from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Configuration et Paramètres ---
  const [settings, setSettings] = useState({
    schoolName: 'École Primaire Les Lilas',
    academicYear: '2023-2024',
    currency: '€'
  });

  const [academicYears, setAcademicYears] = useState(['2022-2023', '2023-2024', '2024-2025']);
  const [newYearInput, setNewYearInput] = useState('');

  const [classes, setClasses] = useState([
    { id: 1, name: 'CP', fee: 1500 },
    { id: 2, name: 'CE1', fee: 1500 },
    { id: 3, name: 'CE2', fee: 1500 },
    { id: 4, name: 'CM1', fee: 1500 },
    { id: 5, name: 'CM2', fee: 1500 },
  ]);
  const [newClass, setNewClass] = useState({ name: '', fee: '' });

  // --- Données d'état (State) ---
  const [students, setStudents] = useState([
    { id: 1, name: 'Lucas Martin', className: 'CP', section: 'A', amountPaid: 1500 },
    { id: 2, name: 'Emma Bernard', className: 'CE1', section: 'B', amountPaid: 1500 },
    { id: 3, name: 'Thomas Dubois', className: 'CM2', section: 'A', amountPaid: 1500 },
    { id: 4, name: 'Chloé Petit', className: 'CE2', section: 'A', amountPaid: 1350 },
    { id: 5, name: 'Hugo Leroy', className: 'CM1', section: 'B', amountPaid: 1200 },
    { id: 6, name: 'Lina Richard', className: 'CE1', section: 'A', amountPaid: 1350 },
  ]);

  const [payments, setPayments] = useState([
    { id: 1, studentId: 1, date: new Date().toISOString(), amount: 150 },
    { id: 2, studentId: 2, date: new Date().toISOString(), amount: 150 },
    { id: 3, studentId: 3, date: new Date(Date.now() - 86400000).toISOString(), amount: 300 },
    { id: 4, studentId: 4, date: new Date(Date.now() - 172800000).toISOString(), amount: 150 },
  ]);

  const [newPayment, setNewPayment] = useState({ studentId: '', amount: '' });

  // --- Helpers ---
  const formatMoney = (amount) => {
    return `${amount.toLocaleString('fr-FR')} ${settings.currency}`;
  };

  const getStudentTuition = (className) => {
    const cls = classes.find(c => c.name === className);
    return cls ? cls.fee : 0;
  };

  // --- Calculs Dérivés ---
  const studentsWithTuition = useMemo(() => {
    return students.map(s => ({
      ...s,
      totalTuition: getStudentTuition(s.className),
      reste: Math.max(0, getStudentTuition(s.className) - s.amountPaid)
    }));
  }, [students, classes]);

  const totalEncaisse = useMemo(() => {
    return studentsWithTuition.reduce((acc, curr) => acc + curr.amountPaid, 0);
  }, [studentsWithTuition]);

  const resteARecouvrer = useMemo(() => {
    return studentsWithTuition.reduce((acc, curr) => acc + curr.reste, 0);
  }, [studentsWithTuition]);

  const retardsCritiques = useMemo(() => {
    return studentsWithTuition.filter(s => s.reste > 0).length;
  }, [studentsWithTuition]);

  const paymentsWithStudents = useMemo(() => {
    return payments.map(p => {
      const student = studentsWithTuition.find(s => s.id === p.studentId);
      return { ...p, studentName: student?.name, fullClassName: `${student?.className} - ${student?.section}` };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [payments, studentsWithTuition]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return studentsWithTuition;
    const q = searchQuery.toLowerCase();
    return studentsWithTuition.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.className.toLowerCase().includes(q) ||
      s.section.toLowerCase().includes(q)
    );
  }, [studentsWithTuition, searchQuery]);

  const filteredPayments = useMemo(() => {
    if (!searchQuery) return paymentsWithStudents;
    const q = searchQuery.toLowerCase();
    return paymentsWithStudents.filter(p => 
      p.studentName?.toLowerCase().includes(q) || 
      p.fullClassName?.toLowerCase().includes(q) ||
      p.id.toString().includes(q)
    );
  }, [paymentsWithStudents, searchQuery]);

  // --- Actions ---
  const handleAddPayment = (e) => {
    e.preventDefault();
    if (!newPayment.studentId || !newPayment.amount) return;

    const amountNum = parseFloat(newPayment.amount);
    const studentIdNum = parseInt(newPayment.studentId);

    const payment = {
      id: Date.now(),
      studentId: studentIdNum,
      date: new Date().toISOString(),
      amount: amountNum
    };
    setPayments([payment, ...payments]);

    setStudents(students.map(s => {
      if (s.id === studentIdNum) {
        return { ...s, amountPaid: s.amountPaid + amountNum };
      }
      return s;
    }));

    setIsPaymentModalOpen(false);
    setNewPayment({ studentId: '', amount: '' });
  };

  const handleAddYear = () => {
    if (newYearInput && !academicYears.includes(newYearInput)) {
      setAcademicYears([...academicYears, newYearInput]);
      setSettings({ ...settings, academicYear: newYearInput });
      setNewYearInput('');
    }
  };

  const handleAddClass = () => {
    if (newClass.name && newClass.fee) {
      setClasses([...classes, { id: Date.now(), name: newClass.name, fee: parseFloat(newClass.fee) }]);
      setNewClass({ name: '', fee: '' });
    }
  };

  const handleRemoveClass = (id) => {
    setClasses(classes.filter(c => c.id !== id));
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('fr-FR');
  };

  const getStudentStatus = (student) => {
    if (student.amountPaid >= student.totalTuition) {
      return <span className="status-badge status-paid">À jour</span>;
    }
    if (student.amountPaid > 0) {
      return <span className="status-badge status-pending">Partiel</span>;
    }
    return <span className="status-badge status-late">En retard</span>;
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">
            <CreditCard size={24} />
          </div>
          <span className="sidebar-title">ScolariPay</span>
        </div>
        
        <nav className="sidebar-nav">
          <a href="#" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
            <LayoutDashboard size={20} /> Tableau de bord
          </a>
          <a href="#" className={`nav-item ${activeTab === 'students' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('students'); }}>
            <Users size={20} /> Élèves
          </a>
          <a href="#" className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('payments'); }}>
            <Wallet size={20} /> Paiements
          </a>
          <a href="#" className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('settings'); }}>
            <Settings size={20} /> Paramètres
          </a>
          <div style={{ flex: 1 }}></div>
          <a href="#" className="nav-item" style={{ color: 'var(--danger)', marginTop: 'auto' }} onClick={(e) => { e.preventDefault(); alert("Déconnexion en cours..."); }}>
            <LogOut size={20} /> Déconnexion
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="search-bar">
            <Search size={18} className="text-secondary" />
            <input 
              type="text" 
              placeholder="Rechercher un élève, un reçu..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="header-actions">
            <button className="icon-btn">
              <Bell size={20} />
              {retardsCritiques > 0 && <span className="notification-badge"></span>}
            </button>
            <div className="user-profile">
              <div className="avatar">AD</div>
              <div className="user-info">
                <span className="user-name">Admin</span>
                <span className="user-role">{settings.schoolName}</span>
              </div>
            </div>
          </div>
        </header>

        {/* --- 1. DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <div className="dashboard-header">
              <div className="dashboard-title">
                <h1>Aperçu Financier</h1>
                <p>Année Scolaire {settings.academicYear}</p>
              </div>
              <button className="btn-primary" onClick={() => setIsPaymentModalOpen(true)}>
                <CreditCard size={18} /> Nouveau Paiement
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon blue"><Wallet size={24} /></div>
                <div className="stat-content">
                  <div className="stat-label">Total Encaissé</div>
                  <div className="stat-value">{formatMoney(totalEncaisse)}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon orange"><TrendingUp size={24} /></div>
                <div className="stat-content">
                  <div className="stat-label">Reste à Recouvrer</div>
                  <div className="stat-value">{formatMoney(resteARecouvrer)}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon red"><AlertCircle size={24} /></div>
                <div className="stat-content">
                  <div className="stat-label">Élèves Non Soldés</div>
                  <div className="stat-value">{retardsCritiques}</div>
                </div>
              </div>
            </div>

            <div className="content-grid">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Derniers Paiements</h2>
                  <span className="card-action" onClick={() => setActiveTab('payments')}>Voir tout</span>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Élève</th>
                        <th>Classe</th>
                        <th>Date</th>
                        <th>Montant</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.slice(0, 5).map(p => (
                        <tr key={p.id}>
                          <td><strong>{p.studentName}</strong></td>
                          <td>{p.fullClassName}</td>
                          <td>{formatDate(p.date)}</td>
                          <td>{formatMoney(p.amount)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="icon-btn" title="Imprimer le reçu" onClick={() => setSelectedReceipt(p)}>
                              <Printer size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredPayments.length === 0 && (
                         <tr><td colSpan="5" style={{textAlign:'center', color: 'var(--text-secondary)'}}>Aucun résultat</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">À relancer</h2>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredStudents.filter(s => s.reste > 0).slice(0, 4).map(s => (
                       <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.875rem' }}>{s.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.className} - {s.section}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="status-badge status-late">{formatMoney(s.reste)}</span>
                          <button className="icon-btn" title="Envoyer une relance par email" onClick={() => alert(`Email de relance envoyé aux parents de ${s.name}`)}>
                            <Mail size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {retardsCritiques === 0 && (
                      <p style={{color: 'var(--success)'}}>Tous les élèves sont à jour !</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 2. ÉLÈVES --- */}
        {activeTab === 'students' && (
          <div className="dashboard">
            <div className="dashboard-header">
              <div className="dashboard-title">
                <h1>Gestion des Élèves</h1>
                <p>Suivi détaillé de la scolarité par élève.</p>
              </div>
              <button className="btn-primary" onClick={() => setIsPaymentModalOpen(true)}>
                <CreditCard size={18} /> Encaisser
              </button>
            </div>
            <div className="card">
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nom de l'élève</th>
                      <th>Classe</th>
                      <th>Scolarité Totale</th>
                      <th>Payé</th>
                      <th>Reste à Payer</th>
                      <th>Statut</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(s => (
                      <tr key={s.id}>
                        <td><strong>{s.name}</strong></td>
                        <td>{s.className} - {s.section}</td>
                        <td>{formatMoney(s.totalTuition)}</td>
                        <td style={{color: 'var(--success)', fontWeight: 500}}>{formatMoney(s.amountPaid)}</td>
                        <td style={{color: (s.reste > 0) ? 'var(--danger)' : 'var(--text-primary)'}}>
                          {formatMoney(s.reste)}
                        </td>
                        <td>{getStudentStatus(s)}</td>
                        <td style={{ textAlign: 'right' }}>
                           {s.reste > 0 && (
                             <button className="icon-btn" title="Envoyer une relance par email" onClick={() => alert(`Email de relance envoyé aux parents de ${s.name}`)}>
                               <Mail size={16} />
                             </button>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- 3. PAIEMENTS --- */}
        {activeTab === 'payments' && (
          <div className="dashboard">
            <div className="dashboard-header">
              <div className="dashboard-title">
                <h1>Historique des Paiements</h1>
                <p>Tous les encaissements réalisés.</p>
              </div>
              <button className="btn-primary" onClick={() => setIsPaymentModalOpen(true)}>
                <CreditCard size={18} /> Nouveau Paiement
              </button>
            </div>
            <div className="card">
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID Référence</th>
                      <th>Élève</th>
                      <th>Classe</th>
                      <th>Date d'encaissement</th>
                      <th>Montant</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map(p => (
                      <tr key={p.id}>
                        <td style={{color: 'var(--text-secondary)'}}>#PAY-{p.id.toString().slice(-4)}</td>
                        <td><strong>{p.studentName}</strong></td>
                        <td>{p.fullClassName}</td>
                        <td>{formatDate(p.date)}</td>
                        <td style={{fontWeight: 600, color: 'var(--success)'}}>+ {formatMoney(p.amount)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="icon-btn" title="Imprimer le reçu" onClick={() => setSelectedReceipt(p)}>
                            <Printer size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- 4. PARAMÈTRES --- */}
        {activeTab === 'settings' && (
          <div className="dashboard">
            <div className="dashboard-header">
              <div className="dashboard-title">
                <h1>Paramètres de l'école</h1>
                <p>Configuration pour le bon fonctionnement de l'application.</p>
              </div>
            </div>
            <div className="content-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Informations Générales</h2>
                </div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Nom de l'établissement</label>
                      <input type="text" className="form-input" value={settings.schoolName} onChange={(e) => setSettings({...settings, schoolName: e.target.value})} />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Année Scolaire en cours</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select className="form-select" value={settings.academicYear} onChange={(e) => setSettings({...settings, academicYear: e.target.value})}>
                          {academicYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <input type="text" className="form-input" placeholder="Nouvelle année (ex: 2025-2026)" value={newYearInput} onChange={(e) => setNewYearInput(e.target.value)} />
                        <button type="button" className="btn-secondary" style={{ padding: '0.625rem' }} onClick={handleAddYear}>
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Devise globale</label>
                      <select className="form-select" value={settings.currency} onChange={(e) => setSettings({...settings, currency: e.target.value})}>
                        <option value="€">Euro (€)</option>
                        <option value="FCFA">Franc CFA (FCFA)</option>
                        <option value="$">Dollar ($)</option>
                        <option value="MAD">Dirham (MAD)</option>
                        <option value="GNF">Franc Guinéen (GNF)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Gestion des Classes & Tarifs</h2>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Niveau / Classe</th>
                        <th>Montant de la scolarité</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classes.map(c => (
                        <tr key={c.id}>
                          <td><strong>{c.name}</strong></td>
                          <td>
                            <input 
                              type="number" 
                              className="form-input" 
                              style={{ width: '150px' }}
                              value={c.fee} 
                              onChange={(e) => setClasses(classes.map(cls => cls.id === c.id ? {...cls, fee: parseFloat(e.target.value) || 0} : cls))}
                            />
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => handleRemoveClass(c.id)}>
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {/* Ligne pour ajouter */}
                      <tr style={{ backgroundColor: 'var(--bg-primary)' }}>
                        <td>
                          <input type="text" className="form-input" placeholder="Nom de classe" value={newClass.name} onChange={(e) => setNewClass({...newClass, name: e.target.value})} />
                        </td>
                        <td>
                          <input type="number" className="form-input" placeholder="Montant" value={newClass.fee} onChange={(e) => setNewClass({...newClass, fee: e.target.value})} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={handleAddClass}>
                            Ajouter
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL PAIEMENT --- */}
        {isPaymentModalOpen && (
          <div className="modal-overlay" onClick={() => setIsPaymentModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Enregistrer un paiement</h2>
                <button className="modal-close" onClick={() => setIsPaymentModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddPayment}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Élève</label>
                    <select 
                      className="form-select" 
                      required 
                      value={newPayment.studentId}
                      onChange={(e) => setNewPayment({...newPayment, studentId: e.target.value})}
                    >
                      <option value="">Sélectionnez un élève...</option>
                      {studentsWithTuition.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.className}) - Reste: {formatMoney(s.reste)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Montant encaissé</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="number" 
                        className="form-input" 
                        required 
                        placeholder="Ex: 150" 
                        value={newPayment.amount}
                        onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                      />
                      <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {settings.currency}
                      </span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Moyen de paiement</label>
                    <select className="form-select">
                      <option value="cash">Espèces</option>
                      <option value="transfer">Virement Bancaire</option>
                      <option value="check">Chèque</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setIsPaymentModalOpen(false)}>Annuler</button>
                  <button type="submit" className="btn-primary">Valider le paiement</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL REÇU (PRINT PREVIEW) --- */}
        {selectedReceipt && (
          <div className="modal-overlay" onClick={() => setSelectedReceipt(null)}>
            <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Aperçu du Reçu</h2>
                <button className="modal-close" onClick={() => setSelectedReceipt(null)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                {/* Print Area */}
                <div className="receipt-print-area receipt-preview">
                  <div className="receipt-header">
                    <h3>{settings.schoolName}</h3>
                    <p>Année Scolaire {settings.academicYear}</p>
                    <p>Reçu de Paiement N° PAY-{selectedReceipt.id.toString().slice(-4)}</p>
                  </div>
                  <div className="receipt-body">
                    <div className="receipt-row">
                      <span style={{ color: 'var(--text-secondary)' }}>Date :</span>
                      <span>{formatDate(selectedReceipt.date)}</span>
                    </div>
                    <div className="receipt-row">
                      <span style={{ color: 'var(--text-secondary)' }}>Élève :</span>
                      <span><strong>{selectedReceipt.studentName}</strong></span>
                    </div>
                    <div className="receipt-row">
                      <span style={{ color: 'var(--text-secondary)' }}>Classe :</span>
                      <span>{selectedReceipt.fullClassName}</span>
                    </div>
                    
                    <div className="receipt-total">
                      <div className="receipt-row">
                        <span>Montant Encaissé :</span>
                        <span>{formatMoney(selectedReceipt.amount)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="receipt-footer">
                    <p>Ce reçu confirme le paiement pour la scolarité de l'élève mentionné ci-dessus.</p>
                    <p>Merci de votre confiance.</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setSelectedReceipt(null)}>Fermer</button>
                <button className="btn-primary" onClick={() => window.print()}>
                  <Printer size={18} /> Imprimer (PDF)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
