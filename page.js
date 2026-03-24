
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

async function initAuthGate(){const session=getAuthSession();if(session&&session.username&&session.token){openSiteAfterAuth();return true}if(authForm){authForm.addEventListener('submit',async(e)=>{e.preventDefault();authMessage.textContent='';authSubmit.disabled=true;authSubmit.textContent='Checking...';try{const result=await performLogin(authUsername.value.trim(),authPassword.value);setAuthSession(result);openSiteAfterAuth();await initPageContent()}catch(err){authMessage.textContent=err.message||'Login failed.'}finally{authSubmit.disabled=false;authSubmit.textContent='Login'}})}return false}
const topNav = document.getElementById('topNav');
const pageTitle = document.getElementById('pageTitle');
const pageHeroText = document.getElementById('pageHeroText');
const pageStatus = document.getElementById('pageStatus');
const pageBody = document.getElementById('pageBody');
const pageImage = document.getElementById('pageImage');

function escapeHtml(str){
  return String(str ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Could not load ${path}`);
  return res.json();
}
async function loadNav() {
  try {
    const pages = await loadJson('data/pages.json');
    topNav.innerHTML = `
      <a class="btn btn-secondary nav-link-animated" href="index.html">Home</a>
      ${pages.filter(page => page.showInNav !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(page => `<a class="btn btn-secondary nav-link-animated" href="page.html?slug=${encodeURIComponent(page.slug)}">${escapeHtml(page.navLabel || page.title)}</a>`).join('')}
    `;
  } catch {
    topNav.innerHTML = `<a class="btn btn-secondary nav-link-animated" href="index.html">Home</a>`;
  }
}
async function loadPage() {
  const slug = new URL(location.href).searchParams.get('slug') || 'grind-spots';
  try {
    const pages = await loadJson('data/pages.json');
    const page = pages.find(p => p.slug === slug);
    if (!page) throw new Error('Page not found');
    pageTitle.textContent = page.title || 'Page';
    pageHeroText.textContent = page.heroText || '';
    pageBody.innerHTML = page.bodyText ? escapeHtml(page.bodyText).replace(/\n/g, '<br>') : 'Coming soon.';
    pageStatus.textContent = page.status === 'live' ? 'Live' : 'Coming Soon';
    if (page.heroImage) {
      pageImage.src = page.heroImage;
      pageImage.classList.remove('hidden');
    } else {
      pageImage.classList.add('hidden');
    }
  } catch {
    pageTitle.textContent = 'Page';
    pageHeroText.textContent = 'Coming soon.';
    pageBody.textContent = 'This page is coming soon.';
    pageStatus.textContent = 'Coming Soon';
  }
}
async function initPageContent() {
  await loadNav();
  await loadPage();
}
(async function init() {
  const allowed = await initAuthGate();
  if (allowed) await initPageContent();
})();
