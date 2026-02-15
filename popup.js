const SESSION_KEY = 'quick-portal-session';
const USERS_KEY = 'quick-portal-users';

const authView = document.getElementById('auth-view');
const portalView = document.getElementById('portal-view');
const welcomeText = document.getElementById('welcome-text');
const logoutBtn = document.getElementById('logout-btn');

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const authMessage = document.getElementById('auth-message');

const loginForm = document.getElementById('login-form');
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');

const registerForm = document.getElementById('register-form');
const registerUsername = document.getElementById('register-username');
const registerPassword = document.getElementById('register-password');
const registerConfirm = document.getElementById('register-confirm');

function hasChromeStorage() {
  return typeof chrome !== 'undefined' && chrome?.storage?.local;
}

async function storageGet(key, fallbackValue) {
  if (hasChromeStorage()) {
    const result = await chrome.storage.local.get(key);
    return result[key] ?? fallbackValue;
  }

  const cached = localStorage.getItem(key);
  return cached ? JSON.parse(cached) : fallbackValue;
}

async function storageSet(key, value) {
  if (hasChromeStorage()) {
    await chrome.storage.local.set({ [key]: value });
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

async function storageRemove(key) {
  if (hasChromeStorage()) {
    await chrome.storage.local.remove(key);
    return;
  }

  localStorage.removeItem(key);
}

function setMessage(text, type = '') {
  authMessage.textContent = text;
  authMessage.className = 'message';
  if (type) {
    authMessage.classList.add(type);
  }
}

function showLoginTab() {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  tabLogin.setAttribute('aria-selected', 'true');
  tabRegister.setAttribute('aria-selected', 'false');
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
}

function showRegisterTab() {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  tabRegister.setAttribute('aria-selected', 'true');
  tabLogin.setAttribute('aria-selected', 'false');
  registerForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
}

function render(session) {
  const isLoggedIn = Boolean(session?.username);
  authView.classList.toggle('hidden', isLoggedIn);
  portalView.classList.toggle('hidden', !isLoggedIn);

  if (isLoggedIn) {
    welcomeText.textContent = `你好，${session.username}！`;
  }
}

tabLogin.addEventListener('click', () => {
  showLoginTab();
  setMessage('');
});

tabRegister.addEventListener('click', () => {
  showRegisterTab();
  setMessage('');
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = registerUsername.value.trim();
  const password = registerPassword.value.trim();
  const confirm = registerConfirm.value.trim();

  if (!username || !password) {
    setMessage('账号和密码不能为空。', 'error');
    return;
  }

  if (password.length < 6) {
    setMessage('密码长度至少 6 位。', 'error');
    return;
  }

  if (password !== confirm) {
    setMessage('两次输入的密码不一致。', 'error');
    return;
  }

  const users = await storageGet(USERS_KEY, []);
  const exists = users.some((user) => user.username === username);
  if (exists) {
    setMessage('该账号已存在，请直接登录。', 'error');
    return;
  }

  users.push({ username, password, createdAt: Date.now() });
  await storageSet(USERS_KEY, users);

  registerForm.reset();
  showLoginTab();
  loginUsername.value = username;
  setMessage('注册成功，请登录。', 'success');
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();
  if (!username || !password) {
    setMessage('请输入账号和密码。', 'error');
    return;
  }

  const users = await storageGet(USERS_KEY, []);
  const matched = users.find((user) => user.username === username && user.password === password);
  if (!matched) {
    setMessage('账号或密码错误。', 'error');
    return;
  }

  const session = { username, loggedInAt: Date.now() };
  await storageSet(SESSION_KEY, session);
  loginPassword.value = '';
  setMessage('');
  render(session);
});

logoutBtn.addEventListener('click', async () => {
  await storageRemove(SESSION_KEY);
  loginForm.reset();
  registerForm.reset();
  showLoginTab();
  setMessage('已退出登录。', 'success');
  render(null);
});

Promise.all([storageGet(SESSION_KEY, null), storageGet(USERS_KEY, [])]).then(([session, users]) => {
  if (!users.length) {
    showRegisterTab();
    setMessage('当前还没有账号，请先注册。');
  } else {
    showLoginTab();
  }
  render(session);
});
