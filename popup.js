const SESSION_KEY = 'quick-notes-session';

const loginView = document.getElementById('login-view');
const portalView = document.getElementById('portal-view');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const welcomeText = document.getElementById('welcome-text');
const logoutBtn = document.getElementById('logout-btn');

function hasChromeStorage() {
  return typeof chrome !== 'undefined' && chrome?.storage?.local;
}

async function getSession() {
  if (hasChromeStorage()) {
    const result = await chrome.storage.local.get(SESSION_KEY);
    return result[SESSION_KEY] || null;
  }

  const cached = localStorage.getItem(SESSION_KEY);
  return cached ? JSON.parse(cached) : null;
}

async function setSession(session) {
  if (hasChromeStorage()) {
    await chrome.storage.local.set({ [SESSION_KEY]: session });
    return;
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

async function clearSession() {
  if (hasChromeStorage()) {
    await chrome.storage.local.remove(SESSION_KEY);
    return;
  }

  localStorage.removeItem(SESSION_KEY);
}

function render(session) {
  const isLoggedIn = Boolean(session?.username);
  loginView.classList.toggle('hidden', isLoggedIn);
  portalView.classList.toggle('hidden', !isLoggedIn);

  if (isLoggedIn) {
    welcomeText.textContent = `你好，${session.username}！`;
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  if (!username || !password) {
    return;
  }

  const session = { username, loggedInAt: Date.now() };
  await setSession(session);
  passwordInput.value = '';
  render(session);
});

logoutBtn.addEventListener('click', async () => {
  await clearSession();
  usernameInput.value = '';
  passwordInput.value = '';
  render(null);
});

getSession().then(render);
