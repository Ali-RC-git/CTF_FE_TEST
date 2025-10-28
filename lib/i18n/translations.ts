export type Language = 'en' | 'es';

export interface Translations {
  header: {
    logo: string;
    login: string;
    signup: string;
  };
  hero: {
    title: string;
    description: string;
    getStarted: string;
    learnMore: string;
  };
  eventCode: {
    title: string;
    description: string;
    signup: string;
    placeholder: string;
    validating: string;
    noCode: string;
    createAccount: string;
  };
  footer: {
    aboutUs: string;
    contact: string;
    privacyPolicy: string;
    termsOfService: string;
    faqs: string;
    copyright: string;
  };
  languageToggle: {
    en: string;
    es: string;
  };
  signupPage: {
    title: string;
    createAccount: string;
    orSignUpWith: string;
    titleSelect: string;
    selectTitle: string;
    mr: string;
    ms: string;
    dr: string;
    prof: string;
    firstName: string;
    lastName: string;
    organization: string;
    email: string;
  };
  loginPage: {
    title: string;
    email: string;
    password: string;
    forgotPassword: string;
    loginButton: string;
    noAccount: string;
    signupLink: string;
  };
  teamPage: {
    createTeam: {
      title: string;
      teamName: string;
      teamNamePlaceholder: string;
      teamNameHelper: string;
      description: string;
      descriptionPlaceholder: string;
      descriptionHelper: string;
      visibility: string;
      public: string;
      private: string;
      maxSize: string;
      createButton: string;
      codeCopied: string;
      copyCode: string;
    },
    joinTeam: {
      title: string;
      searchPlaceholder: string;
      requestJoin: string;
      teamFull: string;
      enterCode: string;
      enterCodePlaceholder: string;
      joinButton: string;
      haveCode: string;
    },
    myTeams: {
      title: string;
      captain: string;
      manageTeam: string;
      viewProgress: string;
      rank: string;
      members: string;
    }
  };
  dashboard: {
    title: string;
    welcomeBack: string;
    organization: string;
    createJoinTeam: string;
    viewMyTeams: string;
    points: string;
    challengesSolved: string;
    rank: string;
    enrolledCourses: string;
    recentQuestionProgress: string;
    liveScoreboard: string;
    showScoreboard: string;
    hideScoreboard: string;
  };
  challenges: {
    title: string;
    startChallenge: string;
    continueChallenge: string;
    viewChallenge: string;
    getHint: string;
    launchVM: string;
    vmAvailable: string;
    solved: string;
    inProgress: string;
    unsolved: string;
    easy: string;
    medium: string;
    hard: string;
    expert: string;
    points: string;
    solves: string;
    timeSpent: string;
    progress: string;
    backToChallenges: string;
    estimatedTime: string;
    totalPoints: string;
    stepByStepInstructions: string;
    whyThisMatters: string;
    flagFormat: string;
    submitFlag: string;
    status: string;
    scenario: string;
    contextNotes: string;
    questions: string;
  };
  navigation: {
    dashboard: string;
    events: string;
    teams: string;
    scoreboard: string;
    courses: string;
    profile: string;
    settings: string;
    logout: string;
  };
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    view: string;
    create: string;
    update: string;
    search: string;
    filter: string;
    sort: string;
    next: string;
    previous: string;
    submit: string;
    reset: string;
    confirm: string;
    yes: string;
    no: string;
    close: string;
    open: string;
    back: string;
    home: string;
  };
  admin: {
    dashboard: {
      title: string;
      exportData: string;
      quickAddChallenge: string;
      totalUsers: string;
      activeChallenges: string;
      completionRate: string;
      flagSubmissionsToday: string;
      recentActivity: string;
      systemHealth: string;
      uptime: string;
      memoryUsage: string;
      cpuLoad: string;
      storageUsed: string;
      user: string;
      action: string;
      challenge: string;
      time: string;
      status: string;
      completedChallenge: string;
      startedChallenge: string;
      submittedFlag: string;
      requestedHint: string;
      createdChallenge: string;
      success: string;
      inProgress: string;
      correct: string;
      hintUsed: string;
      published: string;
    };
    users: {
      title: string;
      exportUsers: string;
      addUser: string;
      allUsers: string;
      students: string;
      instructors: string;
      administrators: string;
      name: string;
      email: string;
      role: string;
      joined: string;
      lastActive: string;
      active: string;
      inactive: string;
      actions: string;
    };
    challenges: {
      title: string;
      exportChallenges: string;
      addChallenge: string;
      allChallenges: string;
      activeChallenges: string;
      draftChallenges: string;
      archivedChallenges: string;
      challengeTitle: string;
      category: string;
      difficulty: string;
      points: string;
      completion: string;
      networkSecurity: string;
      industrialControlSystems: string;
      protocolAnalysis: string;
    };
    teams: {
      title: string;
      exportTeams: string;
      addTeam: string;
      allTeams: string;
      activeTeams: string;
      inactiveTeams: string;
      teamName: string;
      members: string;
      score: string;
      rank: string;
      created: string;
      lastActivity: string;
    };
    scoreboard: {
      title: string;
      exportScoreboard: string;
      refreshData: string;
      rank: string;
      team: string;
      points: string;
      trend: string;
      up: string;
      down: string;
      stable: string;
    };
    analytics: {
      title: string;
      exportAnalytics: string;
      userEngagement: string;
      challengePerformance: string;
      systemMetrics: string;
      timeRange: string;
      last7Days: string;
      last30Days: string;
      last90Days: string;
      lastYear: string;
    };
    system: {
      title: string;
      systemSettings: string;
      generalSettings: string;
      platformName: string;
      platformDescription: string;
      defaultUserRole: string;
      registrationPolicy: string;
      resetToDefaults: string;
      saveSettings: string;
      maintenanceMode: string;
      enableMaintenance: string;
      disableMaintenance: string;
      databaseBackup: string;
      createBackup: string;
      restoreBackup: string;
      systemLogs: string;
      viewLogs: string;
      clearLogs: string;
      securitySettings: string;
      enable2FA: string;
      enable2FAAllUsers: string;
      disable2FA: string;
      passwordPolicy: string;
      sessionTimeout: string;
      requireEmailVerification: string;
      emailSettings: string;
      systemEmailAddress: string;
      smtpServer: string;
      smtpPort: string;
      encryption: string;
    };
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    header: {
      logo: 'CRDF GLOBAL',
      login: 'Log in',
      signup: 'Sign up',
    },
    hero: {
      title: 'Capture the flag competitions and cybersecurity training delivery',
      description: 'Advance your cybersecurity skills with our comprehensive training programs and competitive CTF events designed for professionals at all levels.',
      getStarted: 'Get Started',
      learnMore: 'Learn More',
    },
    eventCode: {
      title: 'Have an Event Code?',
      description: 'If you have received an event code from your organization or instructor, use it to register for our cybersecurity training event and participate in hands-on CTF challenges.',
      signup: 'Register with Code',
      placeholder: 'Enter your event code',
      validating: 'Validating...',
      noCode: "Don't have an event code?",
      createAccount: 'Create a new account',
    },
    footer: {
      aboutUs: 'About Us',
      contact: 'Contact',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      faqs: 'FAQs',
      copyright: '© 2025 CRDF Global. All rights reserved.',
    },
    languageToggle: {
      en: 'English',
      es: 'Spanish',
    },
    signupPage: {
      title: 'Create Your Account',
      createAccount: 'Create Account',
      orSignUpWith: 'or sign up with email',
      titleSelect: 'Title',
      selectTitle: 'Select Title',
      mr: 'Mr',
      ms: 'Ms',
      dr: 'Dr.',
      prof: 'Prof.',
      firstName: 'First Name',
      lastName: 'Last Name',
      organization: 'Organization Name',
      email: 'Email Address',
    },
    loginPage: {
      title: 'Log in to your account',
      email: 'Email Address',
      password: 'Password',
      forgotPassword: 'Forgot password?',
      loginButton: 'Log in',
      noAccount: "Don't have an account?",
      signupLink: 'Sign up',
    },
    teamPage: {
      createTeam: {
        title: 'Create New Team',
        teamName: 'Team Name',
        teamNamePlaceholder: 'Enter your team name',
        teamNameHelper: 'Choose a unique name that represents your team',
        description: 'Team Description (Optional)',
        descriptionPlaceholder: 'Describe your team\'s focus or expertise',
        descriptionHelper: 'This will help other participants understand your team\'s approach',
        visibility: 'Team Visibility',
        public: 'Public - Anyone can find and request to join',
        private: 'Private - Only people with the code can join',
        maxSize: 'Maximum Team Size',
        createButton: 'Create Team',
        codeCopied: 'Copied!',
        copyCode: 'Copy Code',
      },
      joinTeam: {
        title: 'Join Existing Team',
        searchPlaceholder: 'Search for teams...',
        requestJoin: 'Request to Join',
        teamFull: 'Team Full',
        enterCode: 'Have a team code?',
        enterCodePlaceholder: 'Enter team code',
        joinButton: 'Join',
        haveCode: 'Have a team code?',
      },
      myTeams: {
        title: 'My Teams',
        captain: 'You are Team Captain',
        manageTeam: 'Manage Team',
        viewProgress: 'View Progress',
        rank: 'Rank:',
        members: 'members',
      }
    },
    dashboard: {
      title: 'Student Dashboard',
      welcomeBack: 'Welcome back,',
      organization: 'Organization:',
      createJoinTeam: 'Create / Join Team',
      viewMyTeams: 'View My Teams',
      points: 'Points',
      challengesSolved: 'Challenges Solved',
      rank: 'Rank',
      enrolledCourses: 'Enrolled Courses',
      recentQuestionProgress: 'Recent Question Progress',
      liveScoreboard: 'Live Scoreboard',
      showScoreboard: 'Show Scoreboard',
      hideScoreboard: 'Hide Scoreboard',
    },
    challenges: {
      title: 'Challenges',
      startChallenge: 'Start Challenge',
      continueChallenge: 'Continue',
      viewChallenge: 'View Challenge',
      getHint: 'Get Hint',
      launchVM: 'Launch VM',
      vmAvailable: 'VM Available',
      solved: 'Solved',
      inProgress: 'In Progress',
      unsolved: 'Unsolved',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      expert: 'Expert',
      points: 'pts',
      solves: 'solves',
      timeSpent: 'Time spent on this challenge:',
      progress: 'Progress',
      backToChallenges: 'Back to Challenges',
      estimatedTime: 'Estimated:',
      totalPoints: 'pts total',
      stepByStepInstructions: 'Step-by-step Instructions:',
      whyThisMatters: 'Why this matters:',
      flagFormat: 'Flag format:',
      submitFlag: 'Submit Flag',
      status: 'Status:',
      scenario: 'Scenario (OT/ICS Context)',
      contextNotes: 'OT/ICS Context Notes:',
      questions: 'Questions',
    },
    navigation: {
      dashboard: 'Dashboard',
      events: 'Events',
      teams: 'Teams',
      scoreboard: 'Scoreboard',
      courses: 'Courses',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      create: 'Create',
      update: 'Update',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      reset: 'Reset',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      close: 'Close',
      open: 'Open',
      back: 'Back',
      home: 'Home',
    },
    admin: {
      dashboard: {
        title: 'Admin Dashboard',
        exportData: 'Export Data',
        quickAddChallenge: 'Quick Add Challenge',
        totalUsers: 'Total Users',
        activeChallenges: 'Active Challenges',
        completionRate: 'Completion Rate',
        flagSubmissionsToday: 'Flag Submissions Today',
        recentActivity: 'Recent Activity',
        systemHealth: 'System Health',
        uptime: 'Uptime',
        memoryUsage: 'Memory Usage',
        cpuLoad: 'CPU Load',
        storageUsed: 'Storage Used',
        user: 'User',
        action: 'Action',
        challenge: 'Challenge',
        time: 'Time',
        status: 'Status',
        completedChallenge: 'Completed challenge',
        startedChallenge: 'Started challenge',
        submittedFlag: 'Submitted flag',
        requestedHint: 'Requested hint',
        createdChallenge: 'Created challenge',
        success: 'Success',
        inProgress: 'In Progress',
        correct: 'Correct',
        hintUsed: 'Hint Used',
        published: 'Published',
      },
      users: {
        title: 'User Management',
        exportUsers: 'Export Users',
        addUser: 'Add User',
        allUsers: 'All Users',
        students: 'Students',
        instructors: 'Instructors',
        administrators: 'Administrators',
        name: 'Name',
        email: 'Email',
        role: 'Role',
        joined: 'Joined',
        lastActive: 'Last Active',
        active: 'Active',
        inactive: 'Inactive',
        actions: 'Actions',
      },
      challenges: {
        title: 'Challenge Management',
        exportChallenges: 'Export Challenges',
        addChallenge: 'Add Challenge',
        allChallenges: 'All Challenges',
        activeChallenges: 'Active Challenges',
        draftChallenges: 'Draft Challenges',
        archivedChallenges: 'Archived Challenges',
        challengeTitle: 'Title',
        category: 'Category',
        difficulty: 'Difficulty',
        points: 'Points',
        completion: 'Completion',
        networkSecurity: 'Network Security',
        industrialControlSystems: 'Industrial Control Systems',
        protocolAnalysis: 'Protocol Analysis',
      },
      teams: {
        title: 'Team Management',
        exportTeams: 'Export Teams',
        addTeam: 'Add Team',
        allTeams: 'All Teams',
        activeTeams: 'Active Teams',
        inactiveTeams: 'Inactive Teams',
        teamName: 'Team Name',
        members: 'Members',
        score: 'Score',
        rank: 'Rank',
        created: 'Created',
        lastActivity: 'Last Activity',
      },
      scoreboard: {
        title: 'Live Scoreboard',
        exportScoreboard: 'Export Scoreboard',
        refreshData: 'Refresh Data',
        rank: 'Rank',
        team: 'Team',
        points: 'Points',
        trend: 'Trend',
        up: 'Up',
        down: 'Down',
        stable: 'Stable',
      },
      analytics: {
        title: 'Analytics',
        exportAnalytics: 'Export Analytics',
        userEngagement: 'User Engagement',
        challengePerformance: 'Challenge Performance',
        systemMetrics: 'System Metrics',
        timeRange: 'Time Range',
        last7Days: 'Last 7 Days',
        last30Days: 'Last 30 Days',
        last90Days: 'Last 90 Days',
        lastYear: 'Last Year',
      },
      system: {
        title: 'System Settings',
        systemSettings: 'System Settings',
        platformName: 'Platform Name',
        platformDescription: 'Platform Description',
        defaultUserRole: 'Default User Role',
        registrationPolicy: 'Registration Policy',
        resetToDefaults: 'Reset to Defaults',
        saveSettings: 'Save Settings',
        maintenanceMode: 'Maintenance Mode',
        enableMaintenance: 'Enable Maintenance',
        disableMaintenance: 'Disable Maintenance',
        databaseBackup: 'Database Backup',
        createBackup: 'Create Backup',
        restoreBackup: 'Restore Backup',
        systemLogs: 'System Logs',
        viewLogs: 'View Logs',
        clearLogs: 'Clear Logs',
        securitySettings: 'Security Settings',
        enable2FA: 'Enable 2FA for Administrators',
        enable2FAAllUsers: 'Enable 2FA for All Users',
        disable2FA: 'Disable 2FA',
        passwordPolicy: 'Password Policy',
        sessionTimeout: 'Session Timeout',
        requireEmailVerification: 'Require email verification for new accounts',
        emailSettings: 'Email Settings',
        systemEmailAddress: 'System Email Address',
        smtpServer: 'SMTP Server',
        smtpPort: 'SMTP Port',
        encryption: 'Encryption',
        generalSettings: ""
      },
    }
  },
  es: {
    header: {
      logo: 'CRDF GLOBAL',
      login: 'Iniciar sesión',
      signup: 'Registrarse',
    },
    hero: {
      title: 'Competiciones de captura de bandera y entrega de formación en ciberseguridad',
      description: 'Mejora tus habilidades de ciberseguridad con nuestros programas de formación integrales y eventos CTF competitivos diseñados para profesionales de todos los niveles.',
      getStarted: 'Comenzar',
      learnMore: 'Más información',
    },
    eventCode: {
      title: '¿Tienes un Código de Evento?',
      description: 'Si has recibido un código de evento de tu organización o instructor, úsalo para registrarte en nuestro evento de capacitación en ciberseguridad y participar en desafíos CTF prácticos.',
      signup: 'Registrarse con Código',
      placeholder: 'Ingresa tu código de evento',
      validating: 'Validando...',
      noCode: '¿No tienes un código de evento?',
      createAccount: 'Crear una nueva cuenta',
    },
    footer: {
      aboutUs: 'Sobre nosotros',
      contact: 'Contacto',
      privacyPolicy: 'Política de privacidad',
      termsOfService: 'Términos de servicio',
      faqs: 'Preguntas frecuentes',
      copyright: '© 2025 CRDF Global. Todos los derechos reservados.',
    },
    languageToggle: {
      en: 'Inglés',
      es: 'Español',
    },
    signupPage: {
      title: 'Crea Tu Cuenta',
      createAccount: 'Crear Cuenta',
      orSignUpWith: 'o regístrate con email',
      titleSelect: 'Título',
      selectTitle: 'Seleccionar Título',
      mr: 'Sr',
      ms: 'Sra',
      dr: 'Dr.',
      prof: 'Prof.',
      firstName: 'Nombre',
      lastName: 'Apellido',
      organization: 'Nombre de la Organización',
      email: 'Correo Electrónico',
    },
    loginPage: {
      title: 'Inicia sesión en tu cuenta',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      forgotPassword: '¿Olvidaste tu contraseña?',
      loginButton: 'Iniciar sesión',
      noAccount: '¿No tienes una cuenta?',
      signupLink: 'Regístrate',
    },
    teamPage: {
      createTeam: {
        title: 'Crear Nuevo Equipo',
        teamName: 'Nombre del Equipo',
        teamNamePlaceholder: 'Ingresa el nombre de tu equipo',
        teamNameHelper: 'Elige un nombre único que represente a tu equipo',
        description: 'Descripción del Equipo (Opcional)',
        descriptionPlaceholder: 'Describe el enfoque o experiencia de tu equipo',
        descriptionHelper: 'Esto ayudará a otros participantes a entender el enfoque de tu equipo',
        visibility: 'Visibilidad del Equipo',
        public: 'Público - Cualquiera puede encontrar y solicitar unirse',
        private: 'Privado - Solo personas con el código pueden unirse',
        maxSize: 'Tamaño Máximo del Equipo',
        createButton: 'Crear Equipo',
        codeCopied: '¡Copiado!',
        copyCode: 'Copiar Código',
      },
      joinTeam: {
        title: 'Unirse a un Equipo Existente',
        searchPlaceholder: 'Buscar equipos...',
        requestJoin: 'Solicitar Unirse',
        teamFull: 'Equipo Completo',
        enterCode: '¿Tienes un código de equipo?',
        enterCodePlaceholder: 'Ingresa el código del equipo',
        joinButton: 'Unirse',
        haveCode: '¿Tienes un código de equipo?',
      },
      myTeams: {
        title: 'Mis Equipos',
        captain: 'Eres Capitán del Equipo',
        manageTeam: 'Administrar Equipo',
        viewProgress: 'Ver Progreso',
        rank: 'Rango:',
        members: 'miembros',
      }
    },
    dashboard: {
      title: 'Panel de Estudiante',
      welcomeBack: 'Bienvenido de nuevo,',
      organization: 'Organización:',
      createJoinTeam: 'Crear / Unirse a Equipo',
      viewMyTeams: 'Ver Mis Equipos',
      points: 'Puntos',
      challengesSolved: 'Desafíos Resueltos',
      rank: 'Rango',
      enrolledCourses: 'Cursos Inscritos',
      recentQuestionProgress: 'Progreso de Preguntas Recientes',
      liveScoreboard: 'Tabla de Puntuaciones en Vivo',
      showScoreboard: 'Mostrar Tabla',
      hideScoreboard: 'Ocultar Tabla',
    },
    challenges: {
      title: 'Desafíos',
      startChallenge: 'Iniciar Desafío',
      continueChallenge: 'Continuar',
      viewChallenge: 'Ver Desafío',
      getHint: 'Obtener Pista',
      launchVM: 'Lanzar VM',
      vmAvailable: 'VM Disponible',
      solved: 'Resuelto',
      inProgress: 'En Progreso',
      unsolved: 'Sin Resolver',
      easy: 'Fácil',
      medium: 'Medio',
      hard: 'Difícil',
      expert: 'Experto',
      points: 'pts',
      solves: 'resueltos',
      timeSpent: 'Tiempo invertido en este desafío:',
      progress: 'Progreso',
      backToChallenges: 'Volver a Desafíos',
      estimatedTime: 'Estimado:',
      totalPoints: 'pts total',
      stepByStepInstructions: 'Instrucciones paso a paso:',
      whyThisMatters: 'Por qué esto importa:',
      flagFormat: 'Formato de bandera:',
      submitFlag: 'Enviar Bandera',
      status: 'Estado:',
      scenario: 'Escenario (Contexto OT/ICS)',
      contextNotes: 'Notas de Contexto OT/ICS:',
      questions: 'Preguntas',
    },
    navigation: {
      dashboard: 'Panel',
      events: 'Eventos',
      teams: 'Equipos',
      scoreboard: 'Tabla de Puntuaciones',
      courses: 'Cursos',
      profile: 'Perfil',
      settings: 'Configuración',
      logout: 'Cerrar Sesión',
    },
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      view: 'Ver',
      create: 'Crear',
      update: 'Actualizar',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      next: 'Siguiente',
      previous: 'Anterior',
      submit: 'Enviar',
      reset: 'Restablecer',
      confirm: 'Confirmar',
      yes: 'Sí',
      no: 'No',
      close: 'Cerrar',
      open: 'Abrir',
      back: 'Atrás',
      home: 'Inicio',
    },
    admin: {
      dashboard: {
        title: 'Panel de Administración',
        exportData: 'Exportar Datos',
        quickAddChallenge: 'Agregar Desafío Rápido',
        totalUsers: 'Total de Usuarios',
        activeChallenges: 'Desafíos Activos',
        completionRate: 'Tasa de Finalización',
        flagSubmissionsToday: 'Envíos de Banderas Hoy',
        recentActivity: 'Actividad Reciente',
        systemHealth: 'Salud del Sistema',
        uptime: 'Tiempo de Actividad',
        memoryUsage: 'Uso de Memoria',
        cpuLoad: 'Carga de CPU',
        storageUsed: 'Almacenamiento Usado',
        user: 'Usuario',
        action: 'Acción',
        challenge: 'Desafío',
        time: 'Tiempo',
        status: 'Estado',
        completedChallenge: 'Desafío completado',
        startedChallenge: 'Desafío iniciado',
        submittedFlag: 'Bandera enviada',
        requestedHint: 'Pista solicitada',
        createdChallenge: 'Desafío creado',
        success: 'Éxito',
        inProgress: 'En Progreso',
        correct: 'Correcto',
        hintUsed: 'Pista Usada',
        published: 'Publicado',
      },
      users: {
        title: 'Gestión de Usuarios',
        exportUsers: 'Exportar Usuarios',
        addUser: 'Agregar Usuario',
        allUsers: 'Todos los Usuarios',
        students: 'Estudiantes',
        instructors: 'Instructores',
        administrators: 'Administradores',
        name: 'Nombre',
        email: 'Correo Electrónico',
        role: 'Rol',
        joined: 'Se Unió',
        lastActive: 'Última Actividad',
        active: 'Activo',
        inactive: 'Inactivo',
        actions: 'Acciones',
      },
      challenges: {
        title: 'Gestión de Desafíos',
        exportChallenges: 'Exportar Desafíos',
        addChallenge: 'Agregar Desafío',
        allChallenges: 'Todos los Desafíos',
        activeChallenges: 'Desafíos Activos',
        draftChallenges: 'Desafíos Borrador',
        archivedChallenges: 'Desafíos Archivados',
        challengeTitle: 'Título',
        category: 'Categoría',
        difficulty: 'Dificultad',
        points: 'Puntos',
        completion: 'Finalización',
        networkSecurity: 'Seguridad de Red',
        industrialControlSystems: 'Sistemas de Control Industrial',
        protocolAnalysis: 'Análisis de Protocolos',
      },
      teams: {
        title: 'Gestión de Equipos',
        exportTeams: 'Exportar Equipos',
        addTeam: 'Agregar Equipo',
        allTeams: 'Todos los Equipos',
        activeTeams: 'Equipos Activos',
        inactiveTeams: 'Equipos Inactivos',
        teamName: 'Nombre del Equipo',
        members: 'Miembros',
        score: 'Puntuación',
        rank: 'Rango',
        created: 'Creado',
        lastActivity: 'Última Actividad',
      },
      scoreboard: {
        title: 'Tabla de Puntuaciones en Vivo',
        exportScoreboard: 'Exportar Tabla de Puntuaciones',
        refreshData: 'Actualizar Datos',
        rank: 'Rango',
        team: 'Equipo',
        points: 'Puntos',
        trend: 'Tendencia',
        up: 'Arriba',
        down: 'Abajo',
        stable: 'Estable',
      },
      analytics: {
        title: 'Analíticas',
        exportAnalytics: 'Exportar Analíticas',
        userEngagement: 'Compromiso del Usuario',
        challengePerformance: 'Rendimiento de Desafíos',
        systemMetrics: 'Métricas del Sistema',
        timeRange: 'Rango de Tiempo',
        last7Days: 'Últimos 7 Días',
        last30Days: 'Últimos 30 Días',
        last90Days: 'Últimos 90 Días',
        lastYear: 'Último Año',
      },
      system: {
        title: 'Configuración del Sistema',
        systemSettings: 'Configuración del Sistema',
        generalSettings: 'Configuración General',
        platformName: 'Nombre de la Plataforma',
        platformDescription: 'Descripción de la Plataforma',
        defaultUserRole: 'Rol de Usuario Predeterminado',
        registrationPolicy: 'Política de Registro',
        resetToDefaults: 'Restablecer a Predeterminados',
        saveSettings: 'Guardar Configuración',
        maintenanceMode: 'Modo de Mantenimiento',
        enableMaintenance: 'Habilitar Mantenimiento',
        disableMaintenance: 'Deshabilitar Mantenimiento',
        databaseBackup: 'Respaldo de Base de Datos',
        createBackup: 'Crear Respaldo',
        restoreBackup: 'Restaurar Respaldo',
        systemLogs: 'Registros del Sistema',
        viewLogs: 'Ver Registros',
        clearLogs: 'Limpiar Registros',
        securitySettings: 'Configuración de Seguridad',
        enable2FA: 'Habilitar 2FA para Administradores',
        enable2FAAllUsers: 'Habilitar 2FA para Todos los Usuarios',
        disable2FA: 'Deshabilitar 2FA',
        passwordPolicy: 'Política de Contraseñas',
        sessionTimeout: 'Tiempo de Espera de Sesión',
        requireEmailVerification: 'Requerir verificación de email para nuevas cuentas',
        emailSettings: 'Configuración de Email',
        systemEmailAddress: 'Dirección de Email del Sistema',
        smtpServer: 'Servidor SMTP',
        smtpPort: 'Puerto SMTP',
        encryption: 'Cifrado',
      },
    }
  },
};