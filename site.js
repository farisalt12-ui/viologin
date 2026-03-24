
const AUTH_URL=((window.AUTH_URL||window.VIOLETBOT_AUTH_URL)||'').trim();
const AUTH_STORAGE_KEY='violetbot_auth_session_v1';
const authGate=document.getElementById('authGate');
const sitePage=document.getElementById('sitePage');
const authForm=document.getElementById('authForm');
const authUsername=document.getElementById('authUsername');
const authPassword=document.getElementById('authPassword');
const authSubmit=document.getElementById('authSubmit');
const authMessage=document.getElementById('authMessage');
function getAuthSession(){try{return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)||'null')}catch{return null}}
function setAuthSession(data){localStorage.setItem(AUTH_STORAGE_KEY,JSON.stringify(data))}
function clearAuthSession(){localStorage.removeItem(AUTH_STORAGE_KEY)}
function humanizeAuthError(text){const t=String(text||'').trim().toLowerCase();if(t==='id_empty')return'Username is empty.';if(t==='wrong_creds')return'Wrong username or password.';if(t==='unknown_err')return'Unknown error from auth server.';if(t==='invalid_response')return'Unexpected auth response.';if(t==='proxy_failed')return'Auth proxy failed.';return'Login failed.'}
async function performLogin(username,password){if(!AUTH_URL)throw new Error('Missing auth URL.');let res;try{res=await fetch(AUTH_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({u:username,p:password})});}catch(_err){throw new Error('Could not reach login server.')}let data;try{data=await res.json();}catch(_err){throw new Error('Login server returned invalid data.')}if(!res.ok||!data.ok)throw new Error(humanizeAuthError(data.error||res.status));return {username,token:data.id||'ok'}}
function openSiteAfterAuth(){if(authGate)authGate.style.display='none';if(sitePage)sitePage.classList.remove('hidden')}

async function initAuthGate(){const session=getAuthSession();if(session&&session.username&&session.token){openSiteAfterAuth();return true}if(authForm){authForm.addEventListener('submit',async(e)=>{e.preventDefault();authMessage.textContent='';authSubmit.disabled=true;authSubmit.textContent='Checking...';try{const result=await performLogin(authUsername.value.trim(),authPassword.value);setAuthSession(result);openSiteAfterAuth();await initContent()}catch(err){authMessage.textContent=err.message||'Login failed.'}finally{authSubmit.disabled=false;authSubmit.textContent='Login'}})}return false}
const classGrid = document.getElementById('classGrid');
const statusMount = document.getElementById('statusMount');
const topNav = document.getElementById('topNav');

const guideModal = document.getElementById('guideModal');
const modalTitle = document.getElementById('modalTitle');
const modalNote = document.getElementById('modalNote');
const guideText = document.getElementById('guideText');
const guideSections = document.getElementById('guideSections');
const closeGuideModal = document.getElementById('closeGuideModal');

const addonModal = document.getElementById('addonModal');
const addonTitle = document.getElementById('addonTitle');
const addonSections = document.getElementById('addonSections');
const closeAddonModal = document.getElementById('closeAddonModal');

const localNotes = document.getElementById('localNotes');
const localImageInput = document.getElementById('localImageInput');
const localPreview = document.getElementById('localPreview');
const saveLocal = document.getElementById('saveLocal');
const clearLocal = document.getElementById('clearLocal');

let activeClassSlug = null;
let classesCache = [];
let pagesCache = [];

function escapeHtml(str){
  return String(str ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function tagClassName(tag){
  return `rank-tag-${String(tag).replace(/[^a-zA-Z0-9+]/g,'').replace('+','plus').toLowerCase()}`;
}
function versionBadgeMarkup(status) {
  if (status === 'latest') return `<span class="version-chip version-chip-latest"><span class="version-icon">🔥</span><span>Latest Version</span></span>`;
  if (status === 'older') return `<span class="version-chip version-chip-older"><span class="version-icon">🕰️</span><span>Older Version</span></span>`;
  return '';
}
function formatUpdatedAt(value) {
  if (!value) return 'Recently updated';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Recently updated';
  const now = new Date();
  const diffMs = now - d;
  const day = 24 * 60 * 60 * 1000;
  const days = Math.floor(diffMs / day);
  if (days <= 0) return 'Updated today';
  if (days === 1) return 'Updated 1 day ago';
  if (days < 30) return `Updated ${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return 'Updated 1 month ago';
  if (months < 12) return `Updated ${months} months ago`;
  const years = Math.floor(months / 12);
  if (years === 1) return 'Updated 1 year ago';
  return `Updated ${years} years ago`;
}
function renderState(message) {
  statusMount.innerHTML = `<div class="state-box">${escapeHtml(message)}</div>`;
}
async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Could not load ${path}`);
  return res.json();
}
async function loadNav() {
  try {
    pagesCache = await loadJson('data/pages.json');
    const pageLinks = pagesCache
      .filter(page => page.showInNav !== false)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map(page => `<a class="btn btn-secondary nav-link-animated" href="page.html?slug=${encodeURIComponent(page.slug)}">${escapeHtml(page.navLabel || page.title)}</a>`)
      .join('');
    topNav.innerHTML = `
      <a class="btn btn-secondary nav-link-animated" href="index.html">Home</a>
      ${pageLinks}
    `;
  } catch {
    topNav.innerHTML = `<a class="btn btn-secondary nav-link-animated" href="index.html">Home</a>`;
  }
}
function renderCards() {
  if (!classesCache.length) {
    classGrid.innerHTML = '';
    renderState('No classes found in data/classes.json');
    return;
  }
  statusMount.innerHTML = '';
  classGrid.innerHTML = classesCache.map(cls => `
    <article class="card animated-card">
      <div class="card-media">
        <img src="${cls.cardImage}" alt="${escapeHtml(cls.name)}" style="--card-pos:${escapeHtml(cls.cardImagePosition || 'center center')};--card-scale:${escapeHtml(String(cls.cardImageScale || 1))}">
        <div class="card-tags">
          ${cls.trending ? `<span class="rank-tag trending-tag"><span class="trend-icon">📈</span><span>Trending</span></span>` : ``}
          ${(cls.rankTags || []).map(tag => `<span class="rank-tag ${tagClassName(tag)}">${escapeHtml(tag)}</span>`).join('')}
        </div>
        <div class="card-title-overlay">${escapeHtml(cls.name)}</div>
      </div>
      <div class="card-body">
        <div class="card-name">${escapeHtml(cls.name)}</div>
        <div class="card-actions">
          ${cls.downloadUrl ? `<a class="btn btn-primary" href="${cls.downloadUrl}" target="_blank" rel="noopener noreferrer">Download</a>` : `<span class="btn btn-primary btn-disabled">Download</span>`}
          <button class="btn btn-secondary" data-open="${cls.slug}">Skill Setup</button>
          <button class="btn btn-secondary btn-addon" data-addon="${cls.slug}">Skill Addons</button>
        </div>
        <div class="meta-row">
          <div class="last-updated-chip">
            <span class="last-updated-dot"></span>
            <span>${formatUpdatedAt(cls.updatedAt)}</span>
          </div>
          ${versionBadgeMarkup(cls.versionStatus)}
        </div>
      </div>
    </article>
  `).join('');
  document.querySelectorAll('[data-open]').forEach(btn => {
    btn.addEventListener('click', () => openGuide(btn.getAttribute('data-open')));
  });
  document.querySelectorAll('[data-addon]').forEach(btn => {
    btn.addEventListener('click', () => openAddons(btn.getAttribute('data-addon')));
  });
}
function sectionImage(title, src){
  return `<section class="section"><h3>${escapeHtml(title || 'Image')}</h3><img class="guide-image" src="${src}" alt="${escapeHtml(title || 'Image')}"></section>`;
}
function findClass(slug) {
  return classesCache.find(c => c.slug === slug);
}
function openGuide(slug){
  const cls = findClass(slug);
  if (!cls) return;
  activeClassSlug = slug;
  modalTitle.textContent = cls.name;
  modalNote.textContent = cls.notes || '';
  guideText.innerHTML = cls.guideText ? escapeHtml(cls.guideText).replace(/\n/g, '<br>') : 'No text guide yet.';
  guideSections.innerHTML = '';
  (cls.guideImages || []).forEach(img => {
    guideSections.insertAdjacentHTML('beforeend', sectionImage(img.title || 'Guide Image', img.src));
  });
  if (cls.lockImages && cls.lockImages.length) {
    const block = document.createElement('section');
    block.className = 'section';
    let html = '';
    for (const asset of cls.lockImages) {
      html += `<div class="lock-header">${escapeHtml(asset.title || 'Skill Lock')}</div>`;
      html += `<img class="guide-image" src="${asset.src}" alt="${escapeHtml(asset.title || 'Skill Lock')}" style="margin-bottom:18px">`;
    }
    block.innerHTML = html;
    guideSections.appendChild(block);
  }
  loadLocalState(slug);
  guideModal.classList.add('open');
}
function openAddons(slug){
  const cls = findClass(slug);
  if (!cls) return;
  addonTitle.textContent = `${cls.name} — Skill Addons`;
  addonSections.innerHTML = (cls.addonImages || []).length
    ? cls.addonImages.map(img => sectionImage(img.title || 'Skill Addons', img.src)).join('')
    : `<section class="section"><h3>Skill Addons</h3><div class="guide-text">No addon image yet.</div></section>`;
  addonModal.classList.add('open');
}
function closeGuide(){ guideModal.classList.remove('open'); }
function closeAddons(){ addonModal.classList.remove('open'); }

closeGuideModal.addEventListener('click', closeGuide);
guideModal.addEventListener('click', (e) => { if (e.target === guideModal) closeGuide(); });
closeAddonModal.addEventListener('click', closeAddons);
addonModal.addEventListener('click', (e) => { if (e.target === addonModal) closeAddons(); });

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (addonModal.classList.contains('open')) closeAddons();
    if (guideModal.classList.contains('open')) closeGuide();
  }
});

function storageKey(id, type){ return `violetbot_${id}_${type}`; }
function loadLocalState(id){
  localNotes.value = localStorage.getItem(storageKey(id, 'notes')) || '';
  const imgs = JSON.parse(localStorage.getItem(storageKey(id, 'images')) || '[]');
  renderLocalPreview(imgs);
}
function renderLocalPreview(imgs){
  localPreview.innerHTML = imgs.map(src => `<img src="${src}" alt="Local uploaded">`).join('');
}
saveLocal.addEventListener('click', async () => {
  if(!activeClassSlug) return;
  localStorage.setItem(storageKey(activeClassSlug, 'notes'), localNotes.value);
  const files = [...(localImageInput.files || [])];
  let existing = JSON.parse(localStorage.getItem(storageKey(activeClassSlug, 'images')) || '[]');
  for(const file of files){
    const src = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
    existing.push(src);
  }
  localStorage.setItem(storageKey(activeClassSlug, 'images'), JSON.stringify(existing));
  localImageInput.value = '';
  renderLocalPreview(existing);
});
clearLocal.addEventListener('click', () => {
  if(!activeClassSlug) return;
  localStorage.removeItem(storageKey(activeClassSlug, 'notes'));
  localStorage.removeItem(storageKey(activeClassSlug, 'images'));
  localNotes.value = '';
  localImageInput.value = '';
  renderLocalPreview([]);
});
async function initContent() {
  try {
    await loadNav();
    classesCache = await loadJson('data/classes.json');
    renderCards();
    if (topNav && !document.getElementById('logoutBtn')) {
      topNav.insertAdjacentHTML('beforeend', '<button class="btn btn-secondary nav-link-animated" id="logoutBtn">Logout</button>');
      document.getElementById('logoutBtn').addEventListener('click', () => { clearAuthSession(); location.reload(); });
    }
  } catch (err) {
    classGrid.innerHTML = '';
    renderState(err.message);
  }
}
(async function init() {
  const allowed = await initAuthGate();
  if (allowed) await initContent();
})();
