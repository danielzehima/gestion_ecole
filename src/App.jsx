import React, { useState, useMemo, useEffect } from 'react';
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
  LogOut,
  UserPlus,
  Shield,
  BarChart3,
  Download,
  FileText
} from 'lucide-react';
import LandingPage from './LandingPage';
import CheckoutPage from './CheckoutPage';
import AuthPage from './AuthPage';
import { supabase } from './supabaseClient';
import emailjs from '@emailjs/browser';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Écoute de l'état d'authentification Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentView((prev) => (prev === 'landing' ? 'dashboard' : prev));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentView('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Configuration et Paramètres ---
  const [settings, setSettings] = useState({
    academicYear: '2023-2024',
    schoolName: "ScolariPay Demo",
    currency: 'FCFA',
    subscriptionTier: 'essentiel',
    logoUrl: ''
  });

  const [academicYears, setAcademicYears] = useState(['2022-2023', '2023-2024', '2024-2025']);
  const [newYearInput, setNewYearInput] = useState('');

  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState({ name: '', fee: '' });

  // --- Données d'état (State) ---
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [newPayment, setNewPayment] = useState({ studentId: '', amount: '' });
  const [loadingData, setLoadingData] = useState(false);

  // Nouveaux états pour la relance Email
  const [selectedStudentForEmail, setSelectedStudentForEmail] = useState(null);
  const [emailForm, setEmailForm] = useState({ subject: '', message: '' });

  const handleOpenEmailModal = (student) => {
    setSelectedStudentForEmail(student);
    setEmailForm({
      subject: `Relance de paiement - ${settings.schoolName}`,
      message: `Bonjour,\n\nSauf erreur ou omission de notre part, nous n'avons pas encore reçu le règlement du solde de scolarité de ${student.name} s'élevant à ${formatMoney(student.reste)}.\n\nMerci de régulariser la situation dans les plus brefs délais.\n\nCordialement,\nLa Direction`
    });
  };

  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleSendEmail = async (e) => {
    e.preventDefault();

    // Configuration EmailJS - à remplir par l'utilisateur
    const EMAILJS_SERVICE_ID = "service_gl29pau";
    const EMAILJS_TEMPLATE_ID = "template_4ywb96t";
    const EMAILJS_PUBLIC_KEY = "nV5Lv9hckUu9lv69W";

    if (EMAILJS_SERVICE_ID === "nV5Lv9hckUu9lv69W") {
      alert("⚠️ L'envoi direct d'email en arrière-plan nécessite une configuration API.\n\nPour que cela fonctionne automatiquement, vous devez créer un compte gratuit sur www.emailjs.com, puis remplacer les clés 'VOTRE_SERVICE_ID', etc. dans le code source de App.jsx.\n\nEn attendant, nous ouvrons votre logiciel de messagerie (Gmail/Outlook) !");
      const mailtoLink = `mailto:${selectedStudentForEmail.parentEmail || ''}?subject=${encodeURIComponent(emailForm.subject)}&body=${encodeURIComponent(emailForm.message)}`;
      window.location.href = mailtoLink;
      setSelectedStudentForEmail(null);
      return;
    }

    setIsSendingEmail(true);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: selectedStudentForEmail.parentEmail,
          to_name: selectedStudentForEmail.parentName || "Parent",
          subject: emailForm.subject,
          message: emailForm.message,
          school_name: settings.schoolName
        },
        EMAILJS_PUBLIC_KEY
      );
      alert(`Email envoyé avec succès à la boîte de réception de ${selectedStudentForEmail.parentEmail || "l'adresse du parent"} !`);
      setSelectedStudentForEmail(null);
    } catch (error) {
      console.error("Erreur d'envoi d'email:", error);
      alert("Erreur lors de l'envoi de l'email : " + (error.text || error.message));
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Nouveaux états pour Inscription
  const [enrollmentForm, setEnrollmentForm] = useState({
    lastName: '',
    firstName: '',
    className: '',
    birthDate: '',
    birthPlace: '',
    address: '',
    isNewStudent: true,
    parentName: '',
    parentPhone: '',
    parentEmail: ''
  });

  // Nouveau état pour la gestion du personnel
  const [staff, setStaff] = useState([]);
  const [newStaff, setNewStaff] = useState({ email: '', roleName: 'Assistant', permissions: ['dashboard', 'students'] });

  // Gestion du multi-rôle
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('Admin');
  const [currentUserPermissions, setCurrentUserPermissions] = useState(['dashboard', 'inscription', 'students', 'payments', 'reports', 'settings']);

  // --- Fetch Data ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && (currentView === 'dashboard' || currentView === 'students' || currentView === 'payments' || currentView === 'settings')) {
        fetchDashboardData(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && (currentView === 'dashboard' || currentView === 'students' || currentView === 'payments' || currentView === 'settings')) {
        fetchDashboardData(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [currentView]);

  const fetchDashboardData = async (user) => {
    setLoadingData(true);
    try {
      let schoolId = user.id;
      let role = 'Administrateur';

      let permissions = ['dashboard', 'inscription', 'students', 'payments', 'reports', 'settings'];

      // 1. Vérifier si l'utilisateur est un membre du personnel
      const { data: staffData } = await supabase.from('staff').select('school_id, role').eq('email', user.email).maybeSingle();
      if (staffData) {
        schoolId = staffData.school_id;
        
        if (staffData.role && staffData.role.includes('|')) {
          const parts = staffData.role.split('|');
          role = parts[0];
          permissions = parts[1] ? parts[1].split(',') : [];
        } else if (staffData.role) {
          role = staffData.role;
          if (role === 'Comptable') permissions = ['dashboard', 'students', 'payments', 'reports'];
          else if (role === 'Secrétaire') permissions = ['dashboard', 'inscription', 'students'];
          else if (role === 'Professeur') permissions = ['dashboard', 'students'];
          else permissions = ['dashboard'];
        }
      }

      setActiveSchoolId(schoolId);
      setCurrentUserRole(role);
      setCurrentUserPermissions(permissions);

      // 2. Récupérer les Settings
      const { data: settingsData } = await supabase.from('settings').select('*').eq('user_id', schoolId).single();
      if (settingsData) {
        setSettings({
          academicYear: settingsData.academic_year || '2023-2024',
          schoolName: settingsData.school_name || "ScolariPay Demo",
          currency: settingsData.currency || 'FCFA',
          subscriptionTier: settingsData.subscription_tier || 'essentiel',
          logoUrl: settingsData.logo_url || ''
        });
      } else if (role === 'Administrateur') {
        const defaultSettings = { user_id: schoolId, school_name: 'Mon École', academic_year: '2023-2024', currency: 'FCFA', subscription_tier: 'essentiel' };
        await supabase.from('settings').insert([defaultSettings]);
      }

      // 3. Classes
      const { data: classesData } = await supabase.from('classes').select('*').eq('user_id', schoolId);
      if (classesData) setClasses(classesData);

      // 4. Students
      const { data: studentsData } = await supabase.from('students').select('*').eq('user_id', schoolId);
      if (studentsData) {
        setStudents(studentsData.map(s => ({
          id: s.id,
          name: `${s.first_name} ${s.last_name}`,
          firstName: s.first_name,
          lastName: s.last_name,
          className: s.class_name,
          section: s.section,
          birthDate: s.birth_date,
          birthPlace: s.birth_place,
          address: s.address,
          isNewStudent: s.is_new_student,
          parentName: s.parent_name,
          parentPhone: s.parent_phone,
          parentEmail: s.parent_email,
          amountPaid: s.amount_paid || 0
        })));
      }

      // 5. Payments
      const { data: paymentsData } = await supabase.from('payments').select('*').eq('user_id', schoolId).order('date', { ascending: false });
      if (paymentsData) {
        setPayments(paymentsData.map(p => ({
          id: p.id,
          studentId: p.student_id,
          date: p.date,
          amount: p.amount,
          academicYear: p.academic_year
        })));
      }

      // 6. Staff (Roles) - Seulement si admin
      if (role === 'Administrateur') {
        const { data: staffMembers } = await supabase.from('staff').select('*').eq('school_id', schoolId);
        if (staffMembers) setStaff(staffMembers);
      }
    } catch (error) {
      console.error("Erreur de récupération :", error);
    } finally {
      setLoadingData(false);
    }
  };

  // --- Helpers ---
  const formatMoney = (amount) => {
    return `${(amount || 0).toLocaleString('fr-FR')} ${settings.currency}`;
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
      return { ...p, studentName: student?.name || 'Inconnu', fullClassName: student ? `${student.className} - ${student.section}` : '-' };
    });
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
  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!newPayment.studentId || !newPayment.amount || !activeSchoolId) return;

    const amountNum = parseFloat(newPayment.amount);
    const studentIdStr = newPayment.studentId;

    const paymentEntry = {
      student_id: studentIdStr,
      date: new Date().toISOString(),
      amount: amountNum,
      user_id: activeSchoolId,
      academic_year: settings.academicYear
    };

    const { data: insertedPayment, error } = await supabase.from('payments').insert([paymentEntry]).select().single();
    if (error) {
      console.error("Erreur de base de données (Paiement) :", error);
      alert(`Erreur lors de l'enregistrement : ${error.message}\n(Astuce : Avez-vous bien ajouté la colonne "academic_year" dans la table "payments" sur Supabase ?)`);
      return;
    }

    const student = students.find(s => s.id === studentIdStr);
    const newAmountPaid = (student.amountPaid || 0) + amountNum;

    await supabase.from('students').update({ amount_paid: newAmountPaid }).eq('id', studentIdStr);

    setPayments([{
      id: insertedPayment.id,
      studentId: insertedPayment.student_id,
      date: insertedPayment.date,
      amount: insertedPayment.amount,
      academicYear: insertedPayment.academic_year
    }, ...payments]);

    setStudents(students.map(s => s.id === studentIdStr ? { ...s, amountPaid: newAmountPaid } : s));

    setIsPaymentModalOpen(false);
    setNewPayment({ studentId: '', amount: '' });

    // Préparation du reçu pour impression automatique
    const newReceiptObj = {
      id: insertedPayment.id,
      studentId: studentIdStr,
      date: insertedPayment.date,
      amount: insertedPayment.amount,
      academicYear: insertedPayment.academic_year,
      studentName: student?.name || 'Inconnu',
      fullClassName: student ? `${student.className} - ${student.section}` : '-'
    };
    setSelectedReceipt(newReceiptObj);
    
    // Déclenchement automatique de l'impression après ouverture du modal
    setTimeout(() => {
      handlePrintReceipt(newReceiptObj);
    }, 500);
  };

  // --- Logique Rapports ---
  const chartData = useMemo(() => {
    const monthlyTotals = {};
    payments.forEach(p => {
      const dateObj = new Date(p.date);
      const month = dateObj.toLocaleString('default', { month: 'short' });
      const year = dateObj.getFullYear();
      const key = `${month} ${year}`;
      if (!monthlyTotals[key]) monthlyTotals[key] = { name: key, total: 0 };
      monthlyTotals[key].total += p.amount;
    });
    // Trier chronologiquement (simplifié ici pour la démo, on utilise l'ordre d'insertion)
    return Object.values(monthlyTotals).reverse(); 
  }, [payments]);

  const handlePrintReceipt = (receipt) => {
    if (!receipt) return;
    const originalTitle = document.title;
    
    // Formatage de la date du jour
    const formattedDate = new Date().toISOString().split('T')[0];
    
    // Nettoyage du nom de l'élève pour le fichier (remplace les espaces par des underscores)
    const safeStudentName = receipt.studentName.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Le nom du fichier correspondra au titre du document pendant l'impression
    document.title = `Recu_${safeStudentName}_${formattedDate}`;
    
    window.print();
    
    // Restauration du titre original
    document.title = originalTitle;
  };

  const handleExportCSV = () => {
    // Utiliser le point-virgule (;) pour Excel en français
    const csvHeaders = "Date;Élève;Classe;Montant\n";
    const csvRows = filteredPayments.map(p => `${p.date.split('T')[0]};"${p.studentName || ''}";"${p.fullClassName || ''}";${p.amount}`).join("\n");
    // Ajout du BOM (\uFEFF) pour forcer l'encodage UTF-8 dans Excel
    const blob = new Blob(['\uFEFF' + csvHeaders + csvRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `rapport_comptable_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddYear = async () => {
    if (newYearInput && !academicYears.includes(newYearInput)) {
      setAcademicYears([...academicYears, newYearInput]);

      await supabase.from('settings').upsert({
        user_id: activeSchoolId,
        academic_year: newYearInput,
        school_name: settings.schoolName,
        currency: settings.currency,
        logo_url: settings.logoUrl
      }, { onConflict: 'user_id' });

      setSettings({ ...settings, academicYear: newYearInput });
      setNewYearInput('');
    }
  };

  const handleAddClass = async (e) => {
    if (e) e.preventDefault();

    if (!newClass.name || !newClass.fee) {
      alert("Veuillez remplir le nom et le montant de la classe.");
      return;
    }
    if (!activeSchoolId) {
      alert("Erreur : Impossible d'identifier l'école. Veuillez vous reconnecter.");
      return;
    }

    const newCls = { name: newClass.name, fee: parseFloat(newClass.fee), user_id: activeSchoolId };

    const { data, error } = await supabase.from('classes').insert([newCls]).select().single();
    if (error) {
      console.error("Erreur ajout classe:", error);
      alert("Erreur Supabase (Vérifiez les politiques RLS) : " + error.message);
    } else if (data) {
      setClasses([...classes, data]);
      setNewClass({ name: '', fee: '' });
    }
  };

  const handleRemoveClass = async (id) => {
    await supabase.from('classes').delete().eq('id', id);
    setClasses(classes.filter(c => c.id !== id));
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    if (!enrollmentForm.lastName || !enrollmentForm.firstName || !enrollmentForm.className || !activeSchoolId) return;

    // Vérification de la limite du forfait Essentiel
    if (settings.subscriptionTier === 'essentiel' && students.length >= 100) {
      alert("Vous avez atteint la limite de 100 élèves du forfait Essentiel. Veuillez passer au forfait Croissance pour ajouter plus d'élèves.");
      return;
    }

    const newStudentEntry = {
      user_id: activeSchoolId,
      last_name: enrollmentForm.lastName,
      first_name: enrollmentForm.firstName,
      class_name: enrollmentForm.className,
      section: 'A',
      birth_date: enrollmentForm.birthDate,
      birth_place: enrollmentForm.birthPlace,
      address: enrollmentForm.address,
      is_new_student: enrollmentForm.isNewStudent,
      parent_name: enrollmentForm.parentName,
      parent_phone: enrollmentForm.parentPhone,
      parent_email: enrollmentForm.parentEmail,
      amount_paid: 0
    };

    const { data: insertedStudent, error } = await supabase.from('students').insert([newStudentEntry]).select().single();

    if (error) {
      alert("Erreur lors de l'inscription : " + error.message);
      return;
    }

    setStudents([...students, {
      id: insertedStudent.id,
      name: `${insertedStudent.first_name} ${insertedStudent.last_name}`,
      firstName: insertedStudent.first_name,
      lastName: insertedStudent.last_name,
      className: insertedStudent.class_name,
      section: insertedStudent.section,
      birthDate: insertedStudent.birth_date,
      birthPlace: insertedStudent.birth_place,
      address: insertedStudent.address,
      isNewStudent: insertedStudent.is_new_student,
      parentName: insertedStudent.parent_name,
      parentPhone: insertedStudent.parent_phone,
      parentEmail: insertedStudent.parent_email,
      amountPaid: 0
    }]);

    alert("Élève inscrit avec succès !");
    setEnrollmentForm({
      lastName: '', firstName: '', className: '', birthDate: '', birthPlace: '', address: '', isNewStudent: true, parentName: '', parentPhone: '', parentEmail: ''
    });
    setActiveTab('students');
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.email || currentUserRole !== 'Administrateur') return;

    const roleString = `${newStaff.roleName}|${newStaff.permissions.join(',')}`;

    const { data, error } = await supabase.from('staff').insert([{
      school_id: activeSchoolId,
      email: newStaff.email,
      role: roleString
    }]).select().single();

    if (error) {
      alert("Erreur lors de l'ajout du personnel : " + error.message);
    } else if (data) {
      setStaff([...staff, data]);
      setNewStaff({ email: '', roleName: 'Assistant', permissions: ['dashboard', 'students'] });
    }
  };

  const handleRemoveStaff = async (id) => {
    if (currentUserRole !== 'Administrateur') return;
    await supabase.from('staff').delete().eq('id', id);
    setStaff(staff.filter(s => s.id !== id));
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

  if (currentView === 'landing') {
    return (
      <LandingPage
        onLogin={() => setCurrentView('auth')}
        onSubscribe={(plan) => {
          setSelectedPlan(plan);
          setCurrentView('auth');
        }}
      />
    );
  }

  if (currentView === 'auth') {
    return (
      <AuthPage
        onBack={() => setCurrentView('landing')}
        onSuccess={() => {
          if (selectedPlan) setCurrentView('checkout');
          else setCurrentView('dashboard');
        }}
      />
    );
  }

  if (currentView === 'checkout') {
    return (
      <CheckoutPage
        plan={selectedPlan}
        onBack={() => setCurrentView('landing')}
        onSuccess={async () => {
          // Mise à jour de l'abonnement dans la base de données Supabase de l'école
          if (activeSchoolId && selectedPlan) {
            let tierName = 'essentiel';
            const planName = selectedPlan.name.toLowerCase();
            if (planName.includes('croissance')) tierName = 'croissance';
            if (planName.includes('premium')) tierName = 'premium';
            
            await supabase.from('settings').upsert({
              user_id: activeSchoolId,
              subscription_tier: tierName
            }, { onConflict: 'user_id' });
            
            setSettings(prev => ({ ...prev, subscriptionTier: tierName }));
          }
          
          setSelectedPlan(null);
          setCurrentView('dashboard');
        }}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header" onClick={() => setCurrentView('landing')} style={{ cursor: 'pointer' }}>
          <div className="sidebar-logo-icon" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <CreditCard size={24} />
            )}
          </div>
          <span className="sidebar-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{settings.schoolName || 'ScolariPay'}</span>
        </div>

        <div style={{ padding: '0.5rem 1.5rem', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
          <div style={{ marginBottom: '0.4rem' }}>
            Connecté en tant que: <strong style={{ color: '#ffffff' }}>{currentUserRole}</strong>
          </div>
          <div style={{ display: 'inline-block', padding: '0.2rem 0.5rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
            Forfait SaaS: <strong style={{ color: 'var(--accent)', textTransform: 'capitalize' }}>{settings.subscriptionTier || 'Essentiel'}</strong>
          </div>
        </div>

        <nav className="sidebar-nav">
          {currentUserPermissions.includes('dashboard') && (
            <a href="#" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
              <LayoutDashboard size={20} /> Tableau de bord
            </a>
          )}
          
          {currentUserPermissions.includes('inscription') && (
            <a href="#" className={`nav-item ${activeTab === 'inscription' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('inscription'); }}>
              <UserPlus size={20} /> Inscription
            </a>
          )}
          
          {currentUserPermissions.includes('students') && (
            <a href="#" className={`nav-item ${activeTab === 'students' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('students'); }}>
              <Users size={20} /> Élèves
            </a>
          )}
          
          {currentUserPermissions.includes('payments') && (
            <a href="#" className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('payments'); }}>
              <Printer size={20} /> Reçus / Paiements
            </a>
          )}
          
          {currentUserPermissions.includes('reports') && (
            <a href="#" className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('reports'); }}>
              <BarChart3 size={20} /> Rapports
            </a>
          )}
          
          {currentUserPermissions.includes('settings') && (
            <a href="#" className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('settings'); }}>
              <Settings size={20} /> Paramètres
            </a>
          )}
          <div style={{ flex: 1 }}></div>
          <a href="#" className="nav-item" style={{ color: 'var(--danger)', marginTop: 'auto' }} onClick={async (e) => {
            e.preventDefault();
            await supabase.auth.signOut();
            setCurrentView('landing');
          }}>
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
                        <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Aucun résultat</td></tr>
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
                          <button className="icon-btn" title="Envoyer une relance par email" onClick={() => handleOpenEmailModal(s)}>
                            <Mail size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {retardsCritiques === 0 && (
                      <p style={{ color: 'var(--success)' }}>Tous les élèves sont à jour !</p>
                    )}
                  </div>
                </div>
              </div>



              {/* Table d'inscription (Élèves) sur le Dashboard */}
              <div className="card" style={{ marginTop: '2rem', gridColumn: '1 / -1' }}>
                <div className="card-header">
                  <h2 className="card-title">Élèves Inscrits (Aperçu)</h2>
                  <span className="card-action" onClick={() => setActiveTab('students')}>Voir tous les détails</span>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Nom de l'élève</th>
                        <th>Classe</th>
                        <th>Scolarité</th>
                        <th>Reste à Payer</th>
                        <th>Statut</th>
                        <th>Relance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.slice(0, 5).map(s => (
                        <tr key={s.id}>
                          <td><strong>{s.name}</strong></td>
                          <td>{s.className}</td>
                          <td>{formatMoney(s.totalTuition)}</td>
                          <td style={{ color: (s.reste > 0) ? 'var(--danger)' : 'var(--text-primary)' }}>
                            {formatMoney(s.reste)}
                          </td>
                          <td>{getStudentStatus(s)}</td>
                          <td>
                            {s.reste > 0 && (
                              <button className="icon-btn" title="Envoyer une relance par email" onClick={() => handleOpenEmailModal(s)}>
                                <Mail size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredStudents.length === 0 && (
                        <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Aucun élève inscrit pour le moment</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inscription' && (
          <div className="fade-in">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Nouvelle Inscription</h1>
            <div className="card" style={{ maxWidth: '800px' }}>
              <div className="card-header">
                <h2 className="card-title">Dossier d'inscription</h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleEnrollStudent}>
                  {/* Informations Personnelles */}
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Informations de l'élève</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Nom <span className="text-danger">*</span></label>
                      <input type="text" className="form-input" required value={enrollmentForm.lastName} onChange={e => setEnrollmentForm({ ...enrollmentForm, lastName: e.target.value })} placeholder="Nom de famille" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Prénom(s) <span className="text-danger">*</span></label>
                      <input type="text" className="form-input" required value={enrollmentForm.firstName} onChange={e => setEnrollmentForm({ ...enrollmentForm, firstName: e.target.value })} placeholder="Prénoms" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date de naissance</label>
                      <input type="date" className="form-input" value={enrollmentForm.birthDate} onChange={e => setEnrollmentForm({ ...enrollmentForm, birthDate: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Lieu de naissance</label>
                      <input type="text" className="form-input" value={enrollmentForm.birthPlace} onChange={e => setEnrollmentForm({ ...enrollmentForm, birthPlace: e.target.value })} placeholder="Ville, Pays" />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Lieu d'habitation (Adresse)</label>
                      <input type="text" className="form-input" value={enrollmentForm.address} onChange={e => setEnrollmentForm({ ...enrollmentForm, address: e.target.value })} placeholder="Quartier, Rue..." />
                    </div>
                  </div>

                  {/* Parcours Scolaire */}
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Scolarité</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Classe demandée <span className="text-danger">*</span></label>
                      <select className="form-input" required value={enrollmentForm.className} onChange={e => setEnrollmentForm({ ...enrollmentForm, className: e.target.value })}>
                        <option value="">Sélectionner une classe</option>
                        {classes.map(c => (
                          <option key={c.id} value={c.name}>{c.name} - Frais: {formatMoney(c.fee)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Statut</label>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input type="radio" name="studentStatus" checked={enrollmentForm.isNewStudent} onChange={() => setEnrollmentForm({ ...enrollmentForm, isNewStudent: true })} />
                          Nouveau
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input type="radio" name="studentStatus" checked={!enrollmentForm.isNewStudent} onChange={() => setEnrollmentForm({ ...enrollmentForm, isNewStudent: false })} />
                          Ancien
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Contacts d'Urgence */}
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>En cas d'urgence (Parents / Tuteurs)</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Nom et Prénom du parent</label>
                      <input type="text" className="form-input" value={enrollmentForm.parentName} onChange={e => setEnrollmentForm({ ...enrollmentForm, parentName: e.target.value })} placeholder="Père, Mère ou Tuteur légal" />
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
                        <input type="tel" className="form-input" value={enrollmentForm.parentPhone} onChange={e => setEnrollmentForm({ ...enrollmentForm, parentPhone: e.target.value })} placeholder="6XX XX XX XX" style={{ borderRadius: '0 8px 8px 0', flex: 1 }} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-input" value={enrollmentForm.parentEmail} onChange={e => setEnrollmentForm({ ...enrollmentForm, parentEmail: e.target.value })} placeholder="parent@exemple.com" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button type="button" className="btn-secondary" onClick={() => setEnrollmentForm({ lastName: '', firstName: '', className: '', birthDate: '', birthPlace: '', address: '', isNewStudent: true, parentName: '', parentPhone: '', parentEmail: '' })}>Réinitialiser</button>
                    <button type="submit" className="btn-primary"><UserPlus size={18} /> Inscrire l'élève</button>
                  </div>
                </form>
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
                        <td style={{ color: 'var(--success)', fontWeight: 500 }}>{formatMoney(s.amountPaid)}</td>
                        <td style={{ color: (s.reste > 0) ? 'var(--danger)' : 'var(--text-primary)' }}>
                          {formatMoney(s.reste)}
                        </td>
                        <td>{getStudentStatus(s)}</td>
                        <td style={{ textAlign: 'right' }}>
                          {s.reste > 0 && (
                            <button className="icon-btn" title="Envoyer une relance par email" onClick={() => handleOpenEmailModal(s)}>
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
                        <td style={{ color: 'var(--text-secondary)' }}>#PAY-{p.id.toString().slice(-4)}</td>
                        <td><strong>{p.studentName}</strong></td>
                        <td>{p.fullClassName}</td>
                        <td>{formatDate(p.date)}</td>
                        <td style={{ fontWeight: 600, color: 'var(--success)' }}>+ {formatMoney(p.amount)}</td>
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
                  <div className="settings-form-grid">
                    <div className="form-group">
                      <label className="form-label">Nom de l'établissement (Marque Blanche)</label>
                      <input type="text" className="form-input" value={settings.schoolName} onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })} />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Logo de l'établissement (URL - Marque Blanche)</label>
                      <input 
                        type="url" 
                        className="form-input" 
                        placeholder="https://lien-vers-mon-logo.com/logo.png" 
                        value={settings.logoUrl} 
                        onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })} 
                      />
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Collez l'URL de votre logo pour personnaliser les reçus et le menu.</p>
                      
                      <button 
                        type="button" 
                        className="btn-primary" 
                        style={{ marginTop: '1rem' }} 
                        onClick={async () => {
                          const { error } = await supabase.from('settings').upsert({
                            user_id: activeSchoolId,
                            school_name: settings.schoolName,
                            logo_url: settings.logoUrl,
                            academic_year: settings.academicYear,
                            currency: settings.currency
                          }, { onConflict: 'user_id' });
                          if (error) alert("Erreur lors de la sauvegarde (Vérifiez que la colonne logo_url existe dans la table settings) : " + error.message);
                          else alert("Logo et Nom sauvegardés avec succès !");
                        }}
                      >
                        Sauvegarder la personnalisation
                      </button>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Année Scolaire en cours</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select className="form-select" value={settings.academicYear} onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}>
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
                      <select className="form-select" value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })}>
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
                              onChange={(e) => setClasses(classes.map(cls => cls.id === c.id ? { ...cls, fee: parseFloat(e.target.value) || 0 } : cls))}
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
                          <input type="text" className="form-input" placeholder="Nom de classe" value={newClass.name} onChange={(e) => setNewClass({ ...newClass, name: e.target.value })} />
                        </td>
                        <td>
                          <input type="number" className="form-input" placeholder="Montant" value={newClass.fee} onChange={(e) => setNewClass({ ...newClass, fee: e.target.value })} />
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

              {/* Gestion des rôles et utilisateurs DANS LES PARAMÈTRES */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={20} className="text-accent" /> Gestion des accès (Personnel)</h2>
                </div>
                <div className="card-body">
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Invitez des membres du personnel et choisissez précisément les onglets auxquels ils auront accès.</p>

                  <form onSubmit={handleAddStaff} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                      <div className="form-group" style={{ flex: 2, minWidth: '200px' }}>
                        <label className="form-label">Email du collaborateur</label>
                        <input type="email" className="form-input" required value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} placeholder="collaborateur@ecole.com" />
                      </div>
                      <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                        <label className="form-label">Titre du Rôle</label>
                        <input type="text" className="form-input" required value={newStaff.roleName} onChange={e => setNewStaff({ ...newStaff, roleName: e.target.value })} placeholder="ex: Comptable..." />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Fixer ses accès (Onglets autorisés)</label>
                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        {[
                          { id: 'dashboard', label: 'Tableau de bord' },
                          { id: 'inscription', label: 'Inscription' },
                          { id: 'students', label: 'Élèves' },
                          { id: 'payments', label: 'Paiements & Reçus' },
                          { id: 'reports', label: 'Rapports Comptables' },
                          { id: 'settings', label: 'Paramètres' }
                        ].map(tab => (
                          <label key={tab.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                            <input 
                              type="checkbox" 
                              checked={newStaff.permissions.includes(tab.id)}
                              onChange={(e) => {
                                if (e.target.checked) setNewStaff({...newStaff, permissions: [...newStaff.permissions, tab.id]});
                                else setNewStaff({...newStaff, permissions: newStaff.permissions.filter(p => p !== tab.id)});
                              }}
                            />
                            {tab.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div style={{ alignSelf: 'flex-start' }}>
                      <button type="submit" className="btn-primary"><UserPlus size={18} /> Inviter & Sauvegarder les accès</button>
                    </div>
                  </form>

                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Email</th>
                          <th>Rôle et Permissions</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staff.length === 0 ? (
                          <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Aucun membre du personnel invité.</td></tr>
                        ) : (
                          staff.map(s => (
                            <tr key={s.id}>
                              <td>{s.email}</td>
                              <td>
                                <span className="status-badge status-good">{s.role.includes('|') ? s.role.split('|')[0] : s.role}</span>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                  {s.role.includes('|') ? s.role.split('|')[1]?.split(',').join(', ') : 'Accès par défaut'}
                                </div>
                              </td>
                              <td className="text-right">
                                <button className="btn-secondary" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => handleRemoveStaff(s.id)}>
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 5. RAPPORTS COMPTABLES --- */}
        {activeTab === 'reports' && (
          <div className="dashboard">
            <div className="dashboard-header">
              <div className="dashboard-title">
                <h1>Rapports Comptables</h1>
                <p>Analysez les finances et exportez vos données.</p>
              </div>
              <button className="btn-primary" onClick={handleExportCSV}>
                <Download size={18} /> Exporter CSV
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon blue"><Wallet size={24} /></div>
                <div className="stat-content">
                  <div className="stat-label">Total des Encaissements</div>
                  <div className="stat-value">{formatMoney(totalEncaisse)}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon orange"><FileText size={24} /></div>
                <div className="stat-content">
                  <div className="stat-label">Nombre de Transactions</div>
                  <div className="stat-value">{payments.length}</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
              <div className="card-header">
                <h2 className="card-title">Évolution des Encaissements (Année: {settings.academicYear})</h2>
              </div>
              <div className="card-body" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => `${value}`} dx={-10} />
                    <RechartsTooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                    <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="card" style={{ marginTop: '2rem' }}>
              <div className="card-header">
                <h2 className="card-title">Historique détaillé (Filtre actif)</h2>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Élève</th>
                      <th>Classe</th>
                      <th>Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.slice(0, 10).map(p => (
                      <tr key={p.id}>
                        <td>{formatDate(p.date)}</td>
                        <td><strong>{p.studentName}</strong></td>
                        <td>{p.fullClassName}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 500 }}>{formatMoney(p.amount)}</td>
                      </tr>
                    ))}
                    {filteredPayments.length === 0 && (
                       <tr><td colSpan="4" style={{textAlign:'center', color: 'var(--text-secondary)'}}>Aucun paiement trouvé.</td></tr>
                    )}
                  </tbody>
                </table>
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
                      onChange={(e) => setNewPayment({ ...newPayment, studentId: e.target.value })}
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
                        onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
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

        {/* --- MODAL RELANCE EMAIL --- */}
        {selectedStudentForEmail && (
          <div className="modal-overlay" onClick={() => setSelectedStudentForEmail(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Envoyer une Relance</h2>
                <button className="modal-close" onClick={() => setSelectedStudentForEmail(null)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSendEmail}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Destinataire (Parent de {selectedStudentForEmail.name})</label>
                    <input
                      type="text"
                      className="form-input"
                      value={selectedStudentForEmail.parentEmail || "Adresse email non renseignée"}
                      disabled
                      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Objet de l'email</label>
                    <input
                      type="text"
                      className="form-input"
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-input"
                      rows="6"
                      value={emailForm.message}
                      onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setSelectedStudentForEmail(null)}>Annuler</button>
                  <button type="submit" className="btn-primary" disabled={isSendingEmail}>
                    {isSendingEmail ? "Envoi en cours..." : <><Mail size={18} /> Envoyer la relance</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL REÇU (PRINT PREVIEW) --- */}
        {selectedReceipt && (
          <div className="modal-overlay" onClick={() => setSelectedReceipt(null)}>
            <div className="modal-content receipt-modal" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Aperçu du Reçu</h2>
                <button className="modal-close" onClick={() => setSelectedReceipt(null)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="receipt-content" id="printable-receipt" style={{ padding: '2rem' }}>
                  
                  {/* En-tête Marque Blanche du Reçu */}
                  <div className="receipt-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain', margin: '0 auto 1rem' }} />
                    ) : (
                      <div className="receipt-logo" style={{ width: '50px', height: '50px', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', margin: '0 auto 1rem' }}>
                        <CreditCard size={24} />
                      </div>
                    )}
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{settings.schoolName}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Reçu de Paiement N° PAY-{selectedReceipt.id.toString().slice(-4)}</p>
                  </div>
                  
                  <div className="receipt-body">
                    <div className="receipt-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
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
              <div className="modal-footer no-print">
                <button className="btn-secondary" onClick={() => setSelectedReceipt(null)}>Fermer</button>
                <button className="btn-primary" onClick={() => handlePrintReceipt(selectedReceipt)}>
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
