import React, { useState } from 'react';
import { ShieldCheck, Clock, Smartphone, LineChart, ArrowRight, CheckCircle2, CreditCard, BellRing, BookOpen, HelpCircle, Lock, Headphones } from 'lucide-react';

function LandingPage({ onLogin, onSubscribe }) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactStatus, setContactStatus] = useState(null);

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-container nav-content">
          <div className="landing-logo">
            <div className="logo-icon-wrapper">
              <CreditCard className="logo-icon" size={24} />
            </div>
            <span className="logo-text">ScolariPay</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features">Fonctionnalités</a>
            <a href="#benefits">Avantages</a>
            <a href="#testimonials">Témoignages</a>
            <a href="#pricing">Tarifs</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setIsContactModalOpen(true); setContactStatus(null); }}>Contact</a>
          </div>
          <div className="landing-nav-actions">
            <button className="btn-text" onClick={onLogin}>Connexion</button>
            <button className="btn-primary" onClick={onLogin}>Essai Gratuit</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="landing-container hero-content">
          <div className="hero-text-col">
            <div className="badge-pill">
              <span className="badge-dot"></span> Nouvelle solution SaaS B2B
            </div>
            <h1 className="hero-title">
              La fin des impayés et des <span className="text-gradient">files d'attente</span> à la scolarité.
            </h1>
            <p className="hero-subtitle">
              Centralisez la gestion financière de votre établissement. Acceptez les paiements par Mobile Money, automatisez vos relances et suivez votre trésorerie en temps réel.
            </p>
            <div className="hero-actions">
              <button className="btn-primary btn-lg" onClick={onLogin}>
                Démarrer mon essai gratuit <ArrowRight size={20} />
              </button>
              <button className="btn-secondary btn-lg" onClick={onLogin}>
                Réserver une démo
              </button>
            </div>
            <p className="hero-micro">Sans engagement. Configuration en moins de 10 minutes.</p>
          </div>
          <div className="hero-image-col">
            <div className="dashboard-mockup">
              <div className="mock-header">
                 <div className="mock-dots"><span></span><span></span><span></span></div>
              </div>
              <div className="mock-body">
                <div className="mock-sidebar"></div>
                <div className="mock-main">
                  <div className="mock-cards">
                    <div className="mock-card blue"></div>
                    <div className="mock-card orange"></div>
                  </div>
                  <div className="mock-table">
                     <div className="mock-row"></div>
                     <div className="mock-row"></div>
                     <div className="mock-row"></div>
                     <div className="mock-row"></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating elements */}
            <div className="floating-card float-1">
               <CheckCircle2 size={20} className="text-success" /> Paiement validé
            </div>
            <div className="floating-card float-2">
               <BellRing size={20} className="text-warning" /> Relance envoyée
            </div>
          </div>
        </div>
      </header>

      {/* Problem Section */}
      <section id="problem" className="problem-section">
        <div className="landing-container">
          <div className="section-header center">
            <h2>La gestion financière vous coûte du temps et de l'argent</h2>
            <p>Votre équipe comptable et vous-même faites face aux mêmes défis chaque trimestre.</p>
          </div>
          <div className="problem-grid">
            <div className="problem-card">
              <div className="problem-icon-wrapper danger">
                <ShieldCheck size={28} />
              </div>
              <h3>Risques liés aux espèces</h3>
              <p>Des sommes importantes manipulées chaque jour, augmentant les risques d'erreurs, de pertes ou de vols.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon-wrapper warning">
                <Clock size={28} />
              </div>
              <h3>Relances épuisantes</h3>
              <p>Devoir vérifier manuellement qui n'est pas à jour et passer des heures à appeler les parents un par un.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon-wrapper info">
                <BookOpen size={28} />
              </div>
              <h3>Gestion papier fastidieuse</h3>
              <p>Des reçus égarés, des carnets à vérifier et une visibilité quasi nulle sur la trésorerie globale.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="features" className="solution-section">
        <div className="landing-container">
          <div className="section-header">
            <h2>Digitalisez votre comptabilité scolaire en toute simplicité.</h2>
          </div>
          <div className="features-grid">
            <div className="feature-item">
              <Smartphone className="feature-icon" size={32} />
              <div className="feature-text">
                <h3>Intégration Mobile Money</h3>
                <p>Offrez la flexibilité attendue. Les parents paient via Orange Money, MTN ou Wave depuis leur téléphone, 24h/24.</p>
              </div>
            </div>
            <div className="feature-item">
              <BookOpen className="feature-icon" size={32} />
              <div className="feature-text">
                <h3>Facturation et Reçus Automatisés</h3>
                <p>Fini les reçus à souche. Le système génère instantanément un reçu PDF infalsifiable envoyé par email.</p>
              </div>
            </div>
            <div className="feature-item">
              <LineChart className="feature-icon" size={32} />
              <div className="feature-text">
                <h3>Tableau de Bord en Temps Réel</h3>
                <p>Visualisez le total encaissé, le reste à recouvrer par classe et identifiez les retards d'un coup d'œil.</p>
              </div>
            </div>
            <div className="feature-item">
              <BellRing className="feature-icon" size={32} />
              <div className="feature-text">
                <h3>Système de Relance Intelligent</h3>
                <p>Programmez des rappels automatiques par SMS ou Email pour notifier les parents des échéances à venir.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="benefits-section">
        <div className="landing-container">
          <div className="section-header center">
            <h2>Conçu pour le succès de l'école, pensé pour la sérénité des parents.</h2>
          </div>
          <div className="benefits-split">
            <div className="benefit-box school">
              <h3>🏢 Pour l'Établissement</h3>
              <ul>
                <li><CheckCircle2 size={18} /> <strong>Sécurité maximale :</strong> Réduction de la circulation d'espèces.</li>
                <li><CheckCircle2 size={18} /> <strong>Visibilité absolue :</strong> Sachez exactement qui a payé.</li>
                <li><CheckCircle2 size={18} /> <strong>Productivité décuplée :</strong> Vos comptables font de la vraie gestion.</li>
              </ul>
            </div>
            <div className="benefit-box parents">
              <h3>👨‍👩‍👧‍👦 Pour les Parents</h3>
              <ul>
                <li><CheckCircle2 size={18} /> <strong>Zéro déplacement :</strong> Réglez la scolarité depuis le bureau.</li>
                <li><CheckCircle2 size={18} /> <strong>Tranquillité d'esprit :</strong> Réception immédiate d'une preuve numérique.</li>
                <li><CheckCircle2 size={18} /> <strong>Transparence :</strong> Suivi facile du reste à payer.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section id="testimonials" className="testimonials-section">
        <div className="landing-container">
          <div className="section-header center">
            <h2>Déjà adopté par les établissements les plus innovants.</h2>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p className="quote">"Avant ScolariPay, la période des paiements était un cauchemar logistique. Aujourd'hui, 70% se font via Mobile. Ma trésorerie est à jour à la seconde près."</p>
              <div className="author">
                <div className="avatar">AD</div>
                <div className="author-info">
                  <strong>Amadou D.</strong>
                  <span>Fondateur, Complexe Scolaire L'Excellence</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p className="quote">"Je devais demander une permission pour payer l'école. Maintenant, je reçois le rappel par SMS, je paie via mon mobile, et je reçois le reçu PDF. Un soulagement total."</p>
              <div className="author">
                <div className="avatar">SM</div>
                <div className="author-info">
                  <strong>Sarah M.</strong>
                  <span>Mère de deux élèves (CE2 et 6ème)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="landing-container">
          <div className="pricing-header">
            <h2>Des tarifs simples, adaptés à votre taille</h2>
            <p>Choisissez le forfait qui correspond le mieux à votre établissement.</p>
            
            <div className="pricing-toggle">
              <span>Mensuel</span>
              <div 
                className={`toggle-switch ${isAnnual ? 'active' : ''}`} 
                onClick={() => setIsAnnual(!isAnnual)}
              >
                <div className="toggle-slider"></div>
              </div>
              <span>Annuel <span className="badge-offer">2 mois offerts</span></span>
            </div>
          </div>

          <div className="pricing-grid">
            {/* Starter */}
            <div className="pricing-card">
              <h3 className="pricing-name">Essentiel</h3>
              <p className="pricing-target">Pour les petites écoles et crèches</p>
              <div className="pricing-price">
                {isAnnual ? '150 000' : '15 000'} <span className="pricing-currency">FCFA</span>
              </div>
              <p className="pricing-period">/ {isAnnual ? 'an' : 'mois'}</p>
              
              <ul className="pricing-features">
                <li><CheckCircle2 size={18} className="feature-check" /> Jusqu'à 100 élèves</li>
                <li><CheckCircle2 size={18} className="feature-check" /> Envoi de reçus par email</li>
                <li><CheckCircle2 size={18} className="feature-check" /> Tableau de bord basique</li>
                <li><CheckCircle2 size={18} className="feature-check" /> Support par email</li>
                <li><CheckCircle2 size={18} className="feature-check" /> 1 compte administrateur</li>
              </ul>
              
              <button className="btn-pricing outline" onClick={() => onSubscribe({ name: 'Forfait Essentiel', price: isAnnual ? '150 000' : '15 000', period: isAnnual ? 'Annuel' : 'Mensuel' })}>Commencer gratuitement</button>
            </div>

            {/* Professional */}
            <div className="pricing-card popular">
              <div className="popular-badge">Recommandé</div>
              <h3 className="pricing-name">Croissance</h3>
              <p className="pricing-target">Pour les établissements moyens (Primaire/Collège)</p>
              <div className="pricing-price">
                {isAnnual ? '350 000' : '35 000'} <span className="pricing-currency">FCFA</span>
              </div>
              <p className="pricing-period">/ {isAnnual ? 'an' : 'mois'}</p>
              
              <ul className="pricing-features">
                <li><CheckCircle2 size={18} className="feature-check" /> Élèves illimités</li>
                <li><CheckCircle2 size={18} className="feature-check" /> Intégration Mobile Money</li>
                <li><CheckCircle2 size={18} className="feature-check" /> Relances automatiques (SMS/Email)</li>
                <li><CheckCircle2 size={18} className="feature-check" /> Rapports comptables détaillés</li>
                <li><CheckCircle2 size={18} className="feature-check" /> Support prioritaire (Chat/Tél)</li>
              </ul>
              
              <button className="btn-pricing solid" onClick={() => onSubscribe({ name: 'Forfait Croissance', price: isAnnual ? '350 000' : '35 000', period: isAnnual ? 'Annuel' : 'Mensuel' })}>Choisir le forfait Pro</button>
            </div>

            {/* Enterprise */}
            <div className="pricing-card">
              <h3 className="pricing-name">Excellence</h3>
              <p className="pricing-target">Pour les grands groupes scolaires et universités</p>
              <div className="pricing-price">
                Sur mesure
              </div>
              <p className="pricing-period">Contactez-nous pour un devis</p>
              
              <ul className="pricing-features">
                <li><CheckCircle2 size={18} className="feature-check" /> Multi-établissements</li>
                <li><CheckCircle2 size={18} className="feature-check" /> Personnalisation marque blanche</li>
                <li><CheckCircle2 size={18} className="feature-check" /> Intégration API avec ERP existant</li>
                <li><CheckCircle2 size={18} className="feature-check" /> Gestionnaire de compte dédié</li>
                <li><CheckCircle2 size={18} className="feature-check" /> Formation sur site</li>
              </ul>
              
              <button className="btn-pricing outline" onClick={() => { setIsContactModalOpen(true); setContactStatus(null); }}>Contacter les ventes</button>
            </div>
          </div>

          <div className="pricing-notes">
            <div className="pricing-note-item">
              <ShieldCheck size={16} /> Fiche PCI-DSS : Vos paiements sont sécurisés
            </div>
            <div className="pricing-note-item">
              <Lock size={16} /> Frais d'agrégateur Mobile Money selon votre opérateur
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="landing-container">
          <div className="section-header center">
            <h2>Questions Fréquentes</h2>
            <p>Tout ce que vous devez savoir avant de vous lancer.</p>
          </div>
          
          <div className="faq-grid">
            <div className="faq-item">
              <h3 className="faq-question">
                <HelpCircle size={20} className="faq-icon" /> 
                Comment sont gérés les frais de transaction Mobile Money ?
              </h3>
              <p className="faq-answer">
                Les frais d'agrégateur de paiement sont transparents et peuvent être pris en charge par l'école ou imputés aux parents selon votre préférence lors de la configuration de votre espace. Nous ne prenons aucune commission sur vos transactions.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">
                <Lock size={20} className="faq-icon" /> 
                Mes données financières sont-elles en sécurité ?
              </h3>
              <p className="faq-answer">
                Absolument. Nos serveurs respectent les normes les plus strictes de protection des données financières (PCI-DSS) et toutes les transactions sont chiffrées de bout en bout. Des sauvegardes quotidiennes garantissent l'intégrité de vos données.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">
                <Headphones size={20} className="faq-icon" /> 
                Quel type d'assistance proposez-vous en cas de problème ?
              </h3>
              <p className="faq-answer">
                Notre équipe d'assistance technique est disponible 6j/7 par téléphone, email et chat en direct pour les forfaits Croissance et Excellence. Nous assurons un temps de réponse moyen de moins de 15 minutes pendant les heures ouvrables.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="cta-final-section">
        <div className="landing-container center">
          <h2>Prêt à moderniser la gestion de votre école ?</h2>
          <p>Rejoignez les établissements qui ont fait le choix de la sécurité et de l'efficacité. La transition se fait en douceur.</p>
          <button className="btn-primary btn-xl" onClick={onLogin}>
            Démarrer avec ScolariPay dès aujourd'hui
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-content">
            <div className="footer-logo">
              <CreditCard size={20} /> ScolariPay
            </div>
            <div className="footer-links">
              <a href="#">Mentions légales</a>
              <a href="#">Confidentialité</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setIsContactModalOpen(true); setContactStatus(null); }}>Contact</a>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; 2024 ScolariPay. Tous droits réservés.
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      {isContactModalOpen && (
        <div className="modal-overlay" onClick={() => setIsContactModalOpen(false)} style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Contacter l'équipe ScolariPay</h2>
              <button className="modal-close" onClick={() => setIsContactModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              {contactStatus === 'sent' ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <CheckCircle2 size={48} className="text-success" style={{ margin: '0 auto 1rem', color: 'var(--success)' }} />
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Message envoyé avec succès !</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Notre équipe commerciale vous contactera dans les plus brefs délais pour répondre à vos questions.</p>
                  <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setIsContactModalOpen(false)}>Fermer</button>
                </div>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setContactStatus('sending');
                  setTimeout(() => setContactStatus('sent'), 1500);
                }}>
                  <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Vous souhaitez en savoir plus, demander une démo sur-mesure ou obtenir un devis personnalisé ? Remplissez ce formulaire.
                  </p>
                  <div className="form-group">
                    <label className="form-label">Nom de l'établissement</label>
                    <input type="text" className="form-input" required placeholder="Ex: Groupe Scolaire Les Oliviers" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Votre nom complet</label>
                    <input type="text" className="form-input" required placeholder="Ex: Jean Dupont" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email professionnel</label>
                    <input type="email" className="form-input" required placeholder="direction@ecole.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Téléphone</label>
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
                  <div className="form-group">
                    <label className="form-label">Votre message</label>
                    <textarea className="form-input" required placeholder="Décrivez vos besoins..." rows="4" style={{ resize: 'vertical' }}></textarea>
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem', justifyContent: 'center' }} disabled={contactStatus === 'sending'}>
                    {contactStatus === 'sending' ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                        Envoi en cours...
                      </span>
                    ) : 'Envoyer le message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
