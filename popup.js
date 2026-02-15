const STORAGE_KEY = 'quick-notes-items';
const form = document.getElementById('note-form');
const input = document.getElementById('note-input');
const list = document.getElementById('note-list');
const clearBtn = document.getElementById('clear-btn');

async function getItems() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || [];
}

async function setItems(items) {
  await chrome.storage.local.set({ [STORAGE_KEY]: items });
}

function render(items) {
  list.innerHTML = '';

  items.forEach((item, index) => {
    const li = document.createElement('li');
    const text = document.createElement('span');
    text.textContent = item;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = '删除';
    removeBtn.addEventListener('click', async () => {
      const current = await getItems();
      const next = current.filter((_, i) => i !== index);
      await setItems(next);
      render(next);
    });

    li.append(text, removeBtn);
    list.append(li);
  });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const value = input.value.trim();
  if (!value) return;

  const items = await getItems();
  items.push(value);
  await setItems(items);

  input.value = '';
  render(items);
});

clearBtn.addEventListener('click', async () => {
  await setItems([]);
  render([]);
});

getItems().then(render);
