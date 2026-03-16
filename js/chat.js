/* ============================================================
   MinervaAI v2.0 — chat.js
   Chat Logic, History Management, App Bootstrap
   ============================================================ */

/* ══ STATE ══════════════════════════════ */
let conversationHistory = [];
let chatSessions        = []; // Persisted in localStorage
let activeSessionId     = null;
let currentUser         = null;
let isStreaming          = false;

const MAX_HISTORY_TURNS = 6; // Max conversation turns sent to API
const STORAGE_KEY       = 'minerva-sessions';

/* ══ INIT ════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Require auth — will redirect to login.html if not logged in
  currentUser = await requireAuth();
  if (!currentUser) return;

  // 2. Load theme
  loadSavedTheme();

  // 3. Load user profile into sidebar
  await loadUserProfile();

  // 4. Load sessions from localStorage
  loadSessions();

  // 5. Setup responsive sidebar
  setupSidebarResponsive();

  // 6. Show opening screen then reveal app
  hideOpeningScreen();

  // 7. Listen for textarea auto-resize
  const textarea = document.getElementById('user-input');
  textarea.addEventListener('input', autoResizeTextarea);

  // 8. Show welcome screen
  showWelcomeState();
});

/* ══ LOAD USER PROFILE ══════════════════ */
async function loadUserProfile() {
  try {
    const profile = await getUserProfile(currentUser.id);

    const name  = profile?.name  || currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'User';
    const email = profile?.email || currentUser.email || '';

    // Sidebar
    document.getElementById('user-display-name').textContent = name;
    document.getElementById('user-display-email').textContent = email;

    // Avatar — first letter of name
    document.getElementById('user-avatar').textContent = name.charAt(0).toUpperCase();

    // Welcome greeting
    document.getElementById('welcome-greeting').textContent = `Hello, ${name} 👋`;

  } catch (err) {
    console.error('Profile load error:', err);
  }
}

/* ══ SEND MESSAGE ════════════════════════ */
async function sendMessage() {
  if (isStreaming) return;

  const input   = document.getElementById('user-input');
  const message = input.value.trim();
  if (!message) return;

  // Clear input
  input.value = '';
  input.style.height = 'auto';
  updateCharCount(0);
  document.getElementById('send-btn').disabled = true;

  // Show chatbox, hide welcome
  showChatState();

  // Add user message
  addMessageToUI('user', message);

  // Update conversation history
  conversationHistory.push({ role: 'user', parts: [{ text: message }] });

  // Show typing indicator
  const typingEl = showTypingIndicator();
  isStreaming = true;

  // Prepare payload (limit to last N turns)
  const historyToSend = conversationHistory.length > MAX_HISTORY_TURNS
    ? conversationHistory.slice(-MAX_HISTORY_TURNS)
    : conversationHistory;

  // Call API
  const { text, error } = await callGeminiProxy(historyToSend);

  // Remove typing indicator
  typingEl.remove();
  isStreaming = false;

  if (error) {
    const errMsg = `I'm sorry, I encountered an issue: ${error}. Please try again.`;
    addMessageToUI('ai', errMsg);
    conversationHistory.push({ role: 'model', parts: [{ text: errMsg }] });
    showToast('API error. Check your Supabase function.', 'error');
  } else {
    addMessageToUI('ai', text);
    conversationHistory.push({ role: 'model', parts: [{ text }] });
    saveCurrentSession(message, text);
    renderHistoryList();
  }

  scrollToBottom();
}

/* ══ ADD MESSAGE TO UI ══════════════════ */
async function addMessageToUI(sender, message) {
  const chatbox = document.getElementById('chatbox');

  const wrapper = document.createElement('div');
  wrapper.className = `message ${sender}`;

  // Avatar
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  if (sender === 'ai') {
    avatar.innerHTML = `<img src="assets/images/logo-f.png" alt="AI" />`;
  } else {
    const initial = (document.getElementById('user-display-name')?.textContent || 'U').charAt(0).toUpperCase();
    avatar.textContent = initial;
  }

  // Bubble
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  if (sender === 'ai') {
    await renderAIMessage(bubble, message);
  } else {
    const p = document.createElement('p');
    p.textContent = message;
    bubble.appendChild(p);
  }

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chatbox.appendChild(wrapper);
  scrollToBottom();
}

/* ══ RENDER AI MESSAGE (with typing effect) */
async function renderAIMessage(bubble, message) {
  // Split by paragraphs
  const paragraphs = message.split(/\n\s*\n/);

  for (const paragraph of paragraphs) {
    // Split by code blocks
    const parts = paragraph.split(/(```[\s\S]*?```)/);

    for (const part of parts) {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Code block
        const rawCode = part.slice(3, -3).trim();
        const firstLine = rawCode.split('\n')[0];
        const code = rawCode.startsWith(firstLine) && /^\w+$/.test(firstLine)
          ? rawCode.slice(firstLine.length).trim()
          : rawCode;

        const pre  = document.createElement('pre');
        const codeEl = document.createElement('code');
        pre.className = 'code-block';
        codeEl.textContent = code;
        pre.appendChild(codeEl);

        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(code).then(() => {
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => { copyBtn.innerHTML = '<i class="fas fa-copy"></i>'; }, 2000);
          });
        });
        pre.appendChild(copyBtn);
        bubble.appendChild(pre);

      } else if (part.trim()) {
        // Plain text — word-by-word typing animation
        const cleaned = part.replace(/[*_]{1,3}/g, '').trim();
        const p = document.createElement('p');
        bubble.appendChild(p);

        const words = cleaned.split(' ');
        for (const word of words) {
          const span = document.createElement('span');
          span.textContent = word + ' ';
          p.appendChild(span);
          await sleep(18); // typing speed
          scrollToBottom();
        }
      }
    }
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/* ══ TYPING INDICATOR ═══════════════════ */
function showTypingIndicator() {
  const chatbox = document.getElementById('chatbox');

  const wrapper = document.createElement('div');
  wrapper.className = 'typing';
  wrapper.id = 'typing-indicator';

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.innerHTML = `<img src="assets/images/logo-f.png" alt="AI" />`;

  const bubbles = document.createElement('div');
  bubbles.className = 'typing-bubbles';
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot';
    bubbles.appendChild(dot);
  }

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubbles);
  chatbox.appendChild(wrapper);
  scrollToBottom();

  return wrapper;
}

/* ══ INPUT HANDLERS ══════════════════════ */
function handleInputChange() {
  const input = document.getElementById('user-input');
  const len   = input.value.length;
  updateCharCount(len);
  document.getElementById('send-btn').disabled = len === 0 || isStreaming;
  autoResizeTextarea.call(input);
}

function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!document.getElementById('send-btn').disabled) sendMessage();
  }
}

function autoResizeTextarea() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 160) + 'px';
}

function updateCharCount(len) {
  const el = document.getElementById('char-count');
  if (el) el.textContent = `${len} / 3,000`;
}

/* ══ WELCOME / CHAT STATES ══════════════ */
function showWelcomeState() {
  document.getElementById('welcome-state').style.display = '';
  document.getElementById('chatbox').style.display = 'none';
}

function showChatState() {
  document.getElementById('welcome-state').style.display = 'none';
  document.getElementById('chatbox').style.display = '';
}

function usePrompt(prompt) {
  const input = document.getElementById('user-input');
  input.value = prompt;
  input.dispatchEvent(new Event('input'));
  input.focus();
}

/* ══ SCROLL ══════════════════════════════ */
function scrollToBottom() {
  const area = document.getElementById('chat-area');
  area.scrollTop = area.scrollHeight;
}

/* ══ CLEAR CHAT ══════════════════════════ */
function clearChatHistory() {
  conversationHistory = [];
  activeSessionId = null;
  document.getElementById('chatbox').innerHTML = '';
  showWelcomeState();
  showToast('New conversation started', 'success');
}

/* ══ SESSION STORAGE (localStorage) ════ */
function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    chatSessions = raw ? JSON.parse(raw) : [];
  } catch {
    chatSessions = [];
  }
  renderHistoryList();
}

function saveCurrentSession(userMsg, aiMsg) {
  // Create a new session if none active
  if (!activeSessionId) {
    activeSessionId = Date.now().toString();
    chatSessions.unshift({
      id: activeSessionId,
      title: userMsg.length > 40 ? userMsg.slice(0, 40) + '…' : userMsg,
      preview: aiMsg.length > 60 ? aiMsg.slice(0, 60) + '…' : aiMsg,
      ts: Date.now()
    });
    // Limit to 20 sessions
    if (chatSessions.length > 20) chatSessions = chatSessions.slice(0, 20);
    saveSessions();
  }
}

function saveSessions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatSessions));
  } catch (err) {
    console.warn('Could not save sessions:', err);
  }
}

function renderHistoryList() {
  const list  = document.getElementById('history-list');
  const count = document.getElementById('history-count');

  count.textContent = chatSessions.length;

  if (chatSessions.length === 0) {
    list.innerHTML = `
      <div class="history-empty">
        <i class="fas fa-message-slash"></i>
        <p class="history-empty-text">No conversations yet.<br/>Start chatting to see history here.</p>
      </div>`;
    return;
  }

  list.innerHTML = chatSessions.map(s => `
    <div class="history-item ${s.id === activeSessionId ? 'active' : ''}"
         onclick="loadSession('${s.id}')">
      <div class="history-item-title">${escapeHtml(s.title)}</div>
      <div class="history-item-preview">${escapeHtml(s.preview)}</div>
    </div>
  `).join('');
}

function filterHistory(query) {
  const q = query.toLowerCase();
  const items = document.querySelectorAll('.history-item');
  items.forEach(item => {
    const title   = item.querySelector('.history-item-title')?.textContent.toLowerCase() || '';
    const preview = item.querySelector('.history-item-preview')?.textContent.toLowerCase() || '';
    item.style.display = (title.includes(q) || preview.includes(q)) ? '' : 'none';
  });
}

function loadSession(id) {
  // Note: We only store title/preview, not full conversation.
  // For simplicity, clicking a past session just shows a toast.
  // To persist full conversations, store them in Supabase DB.
  showToast('Full session replay coming in a future update!', 'info');
  activeSessionId = id;
  renderHistoryList();
}

function clearAllHistory() {
  if (!confirm('Delete all conversation history?')) return;
  chatSessions = [];
  activeSessionId = null;
  saveSessions();
  renderHistoryList();
  showToast('History cleared', 'success');
}

/* ══ AUTH ACTIONS ════════════════════════ */
async function handleLogout() {
  closeDropdown();
  await signOut();
}

/* ══ UTILS ═══════════════════════════════ */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
