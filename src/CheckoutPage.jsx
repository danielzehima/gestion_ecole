import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

function CheckoutPage({ onBack, onSuccess, plan }) {
  const [paymentMethod, setPaymentMethod] = useState('mobile');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 2000);
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

                <div style={{ padding: '1rem', backgroundColor: 'rgba(79,70,229,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginTop: '2rem', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lock size={16} className="text-success" /> Abonnement SaaS
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Cliquez ci-dessous pour valider votre inscription à la plateforme.
                  </p>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', justifyContent: 'center' }} disabled={isProcessing}>
                  {isProcessing ? 'Validation...' : 'Confirmer l\'abonnement'}
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
