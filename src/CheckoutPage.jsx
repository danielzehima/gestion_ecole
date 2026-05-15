import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

function CheckoutPage({ onBack, onSuccess, plan }) {
  const [paymentMethod, setPaymentMethod] = useState('mobile');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulation réaliste de l'attente du Push USSD (6 secondes)
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 6000);
  };

  if (isSuccess) {
    return (
      <div className="landing-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '400px' }}>
          <CheckCircle2 size={64} className="text-success" style={{ margin: '0 auto 1.5rem', color: 'var(--success)' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Paiement Réussi !</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Votre abonnement a été activé avec succès. Redirection vers votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button className="btn-secondary" style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'transparent' }} onClick={onBack}>
          <ArrowLeft size={20} /> Retour
        </button>

        <div className="content-grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
          {/* Formulaire de paiement */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Détails de facturation</h2>
            </div>
            <div className="card-body">
              <form onSubmit={handlePayment}>
                <div className="form-group">
                  <label className="form-label">Nom de l'établissement</label>
                  <input type="text" className="form-input" required placeholder="Ex: Complexe Scolaire L'Excellence" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email de contact</label>
                  <input type="email" className="form-input" required placeholder="direction@ecole.com" />
                </div>

                <div className="form-group" style={{ marginTop: '2rem' }}>
                  <label className="form-label">Méthode de Paiement</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                    {['Orange Money', 'MTN Mobile Money', 'Wave', 'Moov Africa'].map((method) => (
                      <label 
                        key={method} 
                        style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          padding: '1rem', 
                          border: `2px solid ${paymentMethod === method ? 'var(--primary)' : 'var(--border)'}`, 
                          borderRadius: '8px', 
                          cursor: 'pointer',
                          backgroundColor: paymentMethod === method ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
                          transition: 'all 0.2s'
                        }}
                      >
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value={method} 
                          checked={paymentMethod === method} 
                          onChange={(e) => setPaymentMethod(e.target.value)} 
                          style={{ display: 'none' }} 
                        />
                        <Smartphone size={24} style={{ marginBottom: '0.5rem', color: paymentMethod === method ? 'var(--primary)' : 'var(--text-secondary)' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: paymentMethod === method ? '600' : '400', textAlign: 'center' }}>{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Numéro de téléphone ({paymentMethod})</label>
                  <div style={{ display: 'flex' }}>
                    <select className="form-select" style={{ borderRight: 'none', borderRadius: '8px 0 0 8px', width: '120px', backgroundColor: 'var(--bg-secondary)' }}>
                      <option value="+237">🇨🇲 +237</option>
                      <option value="+225">🇨🇮 +225</option>
                      <option value="+221">🇸🇳 +221</option>
                      <option value="+241">🇬🇦 +241</option>
                      <option value="+243">🇨🇩 +243</option>
                      <option value="+242">🇨🇬 +242</option>
                      <option value="+228">🇹🇬 +228</option>
                      <option value="+229">🇧🇯 +229</option>
                      <option value="+226">🇧🇫 +226</option>
                      <option value="+223">🇲🇱 +223</option>
                      <option value="+33">🇫🇷 +33</option>
                    </select>
                    <input type="tel" className="form-input" required placeholder="6XX XX XX XX" style={{ borderRadius: '0 8px 8px 0', flex: 1 }} />
                  </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'rgba(79,70,229,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginTop: '2rem', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lock size={16} className="text-success" /> Paiement Sécurisé
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {isProcessing 
                      ? "Veuillez consulter votre téléphone. Un message est apparu pour vous demander de valider la transaction avec votre code PIN secret." 
                      : `Vous serez débité de ${plan?.price || 0} FCFA via ${paymentMethod}.`}
                  </p>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', justifyContent: 'center', position: 'relative' }} disabled={isProcessing}>
                  {isProcessing ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="spinner" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                      Validation sur votre téléphone en cours...
                    </span>
                  ) : (
                    `Payer ${plan?.price || 0} FCFA`
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Résumé de la commande */}
          <div>
            <div className="card" style={{ position: 'sticky', top: '2rem' }}>
              <div className="card-header">
                <h2 className="card-title">Résumé</h2>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 500 }}>{plan?.name || 'Abonnement'}</span>
                  <span style={{ fontWeight: 600 }}>{plan?.price || 0} FCFA</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <span>Périodicité</span>
                  <span style={{ textTransform: 'capitalize' }}>{plan?.period || 'Mensuel'}</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--accent)' }}>{plan?.price || 0} FCFA</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
