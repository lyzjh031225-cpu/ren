const COUNT_KEY = 'starter-portal-count';

const countEl = document.getElementById('count');
const incrementBtn = document.getElementById('increment-btn');

function hasChromeStorage() {
  return typeof chrome !== 'undefined' && chrome?.storage?.local;
}

async function readCount() {
  if (hasChromeStorage()) {
    const result = await chrome.storage.local.get(COUNT_KEY);
    return Number(result[COUNT_KEY] || 0);
  }

  return Number(localStorage.getItem(COUNT_KEY) || 0);
}

async function writeCount(value) {
  if (hasChromeStorage()) {
    await chrome.storage.local.set({ [COUNT_KEY]: value });
    return;
  }

  localStorage.setItem(COUNT_KEY, String(value));
}

function renderCount(value) {
  countEl.textContent = String(value);
}

incrementBtn.addEventListener('click', async () => {
  const current = await readCount();
  const next = current + 1;
  await writeCount(next);
  renderCount(next);
});

readCount().then(renderCount);
