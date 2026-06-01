/**
 * Spanish UI copy for the legal chat (product-facing strings).
 * Kept in one module for clarity and future i18n extraction.
 */
export const UI_COPY = {
  headerTitle: "Asistente laboral (España)",
  headerSubtitle:
    "Contratos de trabajo y despidos — improcedente, objetivo y procedente",
  emptyTitle: "¿En qué puedo orientarle?",
  emptyDescription:
    "Formule su consulta sobre contratos o despidos en España. Para un caso concreto, aporte hechos y fechas relevantes.",
  disclaimer:
    "Información orientativa. No constituye asesoramiento jurídico. Consulte con un abogado colegiado para su caso concreto.",
  inputPlaceholder: "Escriba su consulta laboral…",
  inputAriaLabel: "Mensaje",
  send: "Enviar",
  stop: "Detener",
  typing: "Escribiendo…",
  inputHint: "Enter para enviar · Mayús+Enter para nueva línea",
  interrupted: "— Respuesta interrumpida.",
  requestFailed: "No se pudo completar la consulta. Inténtelo de nuevo.",
  unexpectedError: "Error inesperado. Inténtelo de nuevo.",
  streamingUnavailable: "Streaming no disponible.",
  footerMadeBy: "Hecho por",
  footerAuthor: "Sararellano",
  errorBoundaryTitle: "No se pudo cargar el asistente",
  errorBoundaryDescription:
    "Ha ocurrido un error inesperado. Recargue la página o inténtelo más tarde.",
  errorBoundaryRetry: "Reintentar",
  // Auth
  authTitle: "Acceso al asistente laboral",
  loginTitle: "Acceso al asistente laboral",
  authSubtitle: "Inicie sesión para guardar su historial de consultas.",
  loginSubtitle: "Inicie sesión para guardar su historial de consultas.",
  authEmail: "Correo electrónico",
  authPassword: "Contraseña",
  authSignIn: "Iniciar sesión",
  authSignUp: "Crear cuenta",
  authHasAccount: "¿Ya tiene cuenta? Inicie sesión",
  authNoAccount: "¿No tiene cuenta? Regístrese",
  authCheckEmail: "Revise su correo para confirmar la cuenta.",
  authMagicLink: "Enlace mágico por correo",
  authSendMagicLink: "Enviar enlace",
  authMagicLinkSent: "Revise su correo para el enlace de acceso.",
  authFailed: "No se pudo autenticar.",
  // Sidebar
  sidebarLabel: "Historial de conversaciones",
  sidebarTitle: "Conversaciones",
  sidebarOpen: "Abrir historial",
  sidebarClose: "Cerrar historial",
  sidebarNewChat: "Nueva consulta",
  sidebarLoading: "Cargando…",
  sidebarEmpty: "Sin conversaciones guardadas.",
  loadConversationFailed: "No se pudo cargar la conversación.",
  // Feedback
  feedbackLabel: "Valorar respuesta",
  feedbackHelpful: "Útil",
  feedbackNotHelpful: "No útil",
  feedbackThanks: "Gracias por su valoración",
  // Account
  accountSignOut: "Cerrar sesión",
  accountDelete: "Eliminar mi cuenta y datos",
  accountDeleteConfirm:
    "¿Eliminar permanentemente su cuenta y todas las conversaciones?",
  accountDeleteSuccess: "Cuenta eliminada.",
  // Privacy
  privacyLink: "Política de privacidad",
  privacyTitle: "Política de privacidad",
  privacyUpdated: "Última actualización: mayo 2026",
  privacyDataTitle: "Datos que recopilamos",
  privacyDataBody:
    "Para prestar el servicio de chat orientativo almacenamos los siguientes datos en Supabase (UE):",
  privacyDataAccount: "Cuenta: correo electrónico y perfil básico.",
  privacyDataMessages:
    "Conversaciones: mensajes de usuario y respuestas del asistente.",
  privacyDataUsage: "Uso diario: contador de mensajes para límites de coste.",
  privacyDataAudit:
    "Auditoría: acciones registradas con hash de IP (no IP en claro).",
  privacyDataFeedback: "Feedback: valoraciones útil/no útil sobre respuestas.",
  privacyRetentionTitle: "Retención de datos",
  privacyRetentionBody:
    "Los datos se conservan mientras mantenga su cuenta. En el plan gratuito de Supabase, revise periódicamente y elimine datos antiguos manualmente si es necesario. Puede solicitar la eliminación completa de su cuenta desde el pie de página.",
  privacyRightsTitle: "Sus derechos (RGPD)",
  privacyRightsBody:
    "Puede acceder, rectificar y suprimir sus datos. Use «Eliminar mi cuenta y datos» para ejercer el derecho de supresión. Para otras solicitudes, contacte al responsable del sitio.",
  privacyLegalTitle: "Aviso legal",
  privacyLegalBody:
    "Esta implementación es técnica mínima y no sustituye asesoramiento legal sobre cumplimiento RGPD. OpenAI procesa sus consultas para generar respuestas; consulte también su política de privacidad.",
  backToChat: "Volver al chat",
} as const;
