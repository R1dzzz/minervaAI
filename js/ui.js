/* ============================================================
   MinervaAI v2.0 — ui.js
   UI Helper Functions: Toasts, Dropdowns, Sidebar, Theme
   ============================================================ */

/* ══ THEME ══════════════════════════════ */
function setTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark', isDark);
  localStorage.setItem('minerva-theme', theme);

  document.getElementById('theme-light').classList.toggle('active', !isDark);
  document.getElementById('theme-dark').classList.toggle('active', isDark);
}

function loadSavedTheme() {
  const saved = localStorage.getItem('minerva-theme') || 'dark';
  setTheme(saved);
}

/* ══ TOAST NOTIFICATIONS ════════════════ */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas ${icons[type] || icons.info} toast-icon"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  // Auto remove after 3.5s
  setTimeout(() => {
    toast.classList.add('exit');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3500);
}

/* ══ SIDEBAR ════════════════════════════ */
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('active');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('active');
}

// Show hamburger button on mobile
function setupSidebarResponsive() {
  const checkMobile = () => {
    const isMobile = window.innerWidth < 769;
    const btn = document.getElementById('sidebar-open-btn');
    if (btn) btn.style.display = isMobile ? 'flex' : 'none';
  };
  checkMobile();
  window.addEventListener('resize', checkMobile);
}

/* ══ USER DROPDOWN ══════════════════════ */
function toggleUserDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById('user-dropdown');
  const overlay  = document.getElementById('dropdown-overlay');
  const profile  = document.getElementById('user-profile-btn');
  const rect     = profile.getBoundingClientRect();

  if (dropdown.style.display === 'none' || !dropdown.style.display) {
    // Position above profile button
    dropdown.style.display = 'block';
    dropdown.style.left    = rect.left + 'px';
    dropdown.style.bottom  = (window.innerHeight - rect.top + 8) + 'px';
    dropdown.style.top     = 'auto';
    overlay.classList.add('active');
  } else {
    closeDropdown();
  }
}

function closeDropdown() {
  document.getElementById('user-dropdown').style.display = 'none';
  document.getElementById('dropdown-overlay').classList.remove('active');
}

/* ══ HISTORY PANEL ══════════════════════ */
let historyPanelVisible = true;

function toggleHistoryPanel() {
  const panel = document.getElementById('history-panel');
  historyPanelVisible = !historyPanelVisible;
  panel.style.display = historyPanelVisible ? '' : 'none';
}

/* ══ NAV ACTIVE STATE ═══════════════════ */
function switchView(view) {
  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

  const viewMap = {
    chat: 'nav-ai-chat',
  };
  if (viewMap[view]) {
    const el = document.getElementById(viewMap[view]);
    if (el) el.classList.add('active');
  }

  // Close mobile sidebar on nav click
  if (window.innerWidth < 769) closeSidebar();
}

/* ══ ABOUT MODAL ════════════════════════ */
function openAbout() {
  showToast('MinervaAI v2.0 — Built by RLC™ (RoogLiteCore), Pandansari. Powered by Gemini AI & Supabase.', 'info');
}

/* ══ PROMPT PANEL ════════════════════════ */
const EXAMPLE_PROMPTS = [
  { icon: 'fa-brain',        label: 'Explain quantum computing simply' },
  { icon: 'fa-pen-fancy',    label: 'Write a poem about the ocean' },
  { icon: 'fa-code',         label: 'Explain JavaScript promises' },
  { icon: 'fa-chart-line',   label: 'Give me 5 business ideas for 2025' },
  { icon: 'fa-utensils',     label: 'Create a 7-day meal plan' },
  { icon: 'fa-globe',        label: 'What are the top 5 countries to visit?' },
  { icon: 'fa-dumbbell',     label: 'Make me a beginner workout routine' },
  { icon: 'fa-robot',        label: 'Tell me something fascinating about AI' },
];

function showPromptPanel() {
  // Simple inline prompt selector using toast-style cards
  const input = document.getElementById('user-input');
  const random = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)];
  input.value = random.label;
  input.dispatchEvent(new Event('input'));
  input.focus();
  showToast('Prompt loaded! Hit Send when ready.', 'success');
}

/* ══ PROFILE INFO ═══════════════════════ */
function openProfileInfo() {
  closeDropdown();
  const name  = document.getElementById('user-display-name').textContent;
  const email = document.getElementById('user-display-email').textContent;
  showToast(`Signed in as ${name} (${email})`, 'info');
}

/* ══ OPENING SCREEN ══════════════════════ */
function hideOpeningScreen() {
  const screen = document.getElementById('opening-screen');
  if (!screen) return;
  setTimeout(() => {
    screen.classList.add('fade-out');
    setTimeout(() => screen.remove(), 800);
  }, 2600);
}
