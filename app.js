/* ══════════════════════════════════════════════════════
   OBFUSCATION / VSET
══════════════════════════════════════════════════════ */
const _k=['S','t','u','d','y','D','e','c','k','V','S','e','t','2','0','2','5'];
const VSET_KEY=_k.join('');
function xorStr(str,key){return str.split('').map((c,i)=>String.fromCharCode(c.charCodeAt(0)^key.charCodeAt(i%key.length))).join('');}
function encodeVset(obj){const json=JSON.stringify(obj);return btoa(unescape(encodeURIComponent(xorStr(json,VSET_KEY))));}
function decodeVset(b64){return JSON.parse(xorStr(decodeURIComponent(escape(atob(b64))),VSET_KEY));}

/* ══════════════════════════════════════════════════════
   THEME MANAGEMENT
══════════════════════════════════════════════════════ */
const THEME_COLORS=[
  {hex:'#0062ff',idx:0},
  {hex:'#ff6b6b',idx:1},
  {hex:'#10b981',idx:2},
  {hex:'#f59e0b',idx:3},
  {hex:'#8b5cf6',idx:4}
];

function loadThemeSettings(){
  try{
    const saved=JSON.parse(localStorage.getItem('sd_theme')||'null');
    if(saved){
      applyThemeSettings(saved.darkMode,saved.accentColor);
    }
  }catch(e){}
}

/* Wordt aangeroepen telkens als het Instellingen-tabblad van het menu wordt getekend,
   want de toggle/kleurknoppen bestaan alleen in de DOM zolang dat tabblad open is. */
function syncThemeUIControls(){
  try{
    const saved=JSON.parse(localStorage.getItem('sd_theme')||'null');
    const darkToggle=document.getElementById('theme-dark-toggle');
    if(darkToggle) darkToggle.checked = !!(saved&&saved.darkMode);
    updateAccentColorUI(saved&&saved.accentColor?saved.accentColor:'#0062ff');
  }catch(e){}
}

function toggleDarkMode(){
  const isDark=document.getElementById('theme-dark-toggle').checked;
  const currentAccent=localStorage.getItem('sd_theme')?JSON.parse(localStorage.getItem('sd_theme')).accentColor:'#0062ff';
  saveThemeSettings(isDark,currentAccent);
  applyThemeSettings(isDark,currentAccent);
}

function setAccentColor(hex,idx){
  const isDark=document.getElementById('theme-dark-toggle').checked;
  saveThemeSettings(isDark,hex);
  applyThemeSettings(isDark,hex);
  updateAccentColorUI(hex);
}

function updateAccentColorUI(hex){
  document.querySelectorAll('[id^="accent-"]').forEach(btn=>{btn.style.borderColor='transparent';btn.style.boxShadow='none';});
  const idx=THEME_COLORS.findIndex(c=>c.hex===hex);
  if(idx>=0){const btn=document.getElementById('accent-'+idx); if(btn){btn.style.borderColor='rgba(0,0,0,0.5)';btn.style.boxShadow='0 0 8px rgba(0,0,0,0.3)';}}
}

function applyThemeSettings(darkMode,accentColor){
  const root=document.documentElement.style;
  const body=document.body;
  
  if(darkMode){
    body.classList.add('dark-mode');
    document.getElementById('theme-color-meta')?.setAttribute('content','#0a0812');
    root.setProperty('--bg-grad','#000');
    root.setProperty('--glass','#1c1c1e');
    root.setProperty('--glass2','#1c1c1e');
    root.setProperty('--glass-border','rgba(62, 64, 70, 0.56)');
    root.setProperty('--text','#ffffff');
    root.setProperty('--text2','#e9e9e9');
    root.setProperty('--text3','rgba(255,255,255,0.65)');
  }else{
    body.classList.remove('dark-mode');
    document.getElementById('theme-color-meta')?.setAttribute('content','#f0eef9');
    root.setProperty('--bg-grad','#f2f2f7');
    root.setProperty('--glass','rgba(255,255,255,0.90)');
    root.setProperty('--glass2','rgba(255,255,255,0.80)');
    root.setProperty('--glass-border','rgba(200,195,230,0.6)');
    root.setProperty('--text','#0b0f2a');
    root.setProperty('--text2','#3d3a55');
    root.setProperty('--text3','#7c7899');
  }
  if(accentColor&&accentColor!=='#0062ff'){
    const hex=accentColor.replace('#','');
    const r=parseInt(hex.substr(0,2),16);
    const g=parseInt(hex.substr(2,2),16);
    const b=parseInt(hex.substr(4,2),16);
    root.setProperty('--accent',accentColor);
    root.setProperty('--accent2',`rgb(${Math.max(0,r-20)},${Math.max(0,g-20)},${Math.max(0,b-20)})`);
    root.setProperty('--accent-light',`rgba(${r},${g},${b},0.12)`);
  }else{
    root.setProperty('--accent','#0062ff');
    root.setProperty('--accent2','#0075ff');
    root.setProperty('--accent-light','rgba(0,98,255,0.12)');
  }
}

function saveThemeSettings(darkMode,accentColor){
  localStorage.setItem('sd_theme',JSON.stringify({darkMode,accentColor}));
}

/* ══════════════════════════════════════════════════════
   DB
══════════════════════════════════════════════════════ */
let DB={sets:[]};
function initDB(){
  try{
    DB.sets=JSON.parse(localStorage.getItem('sd_sets')||'[]');
    // Mark all sets as 'local' initially unless they have _serverFile
    DB.sets.forEach(s=>{
      if(!s._lastLocalSync)s._lastLocalSync=0;
    });
  }catch(e){DB.sets=[];}
}

/* Verify that all sets marked as fromServer still exist and are accessible */
async function syncLocalWithServer(){
  try{
    const baseURL=window.location.protocol==='file:'?'./sets/':'./sets/';
    const indexResp=await fetch(baseURL+'index.json');
    if(indexResp.ok){
      const fileList=await indexResp.json();
      const serverFiles=new Set(fileList);
      
      // Check each stored set that was from server
      DB.sets=DB.sets.filter(s=>{
        if(!s._serverFile||!s.fromServer)return true;
        // If server file still exists, keep it
        if(serverFiles.has(s._serverFile))return true;
        // Server file was deleted - remove from local storage
        console.warn('Server set removed:',s._serverFile);
        return false;
      });
      
      saveDB();
    }
  }catch(e){console.warn('Could not sync local sets:',e.message);}
}
function saveDB(){try{localStorage.setItem('sd_sets',JSON.stringify(DB.sets));}catch(e){}}

async function loadSetsFromDirectory(){
  try{
    // Load from local /sets/ directory instead of GitHub
    const baseURL=window.location.protocol==='file:'?'./sets/':'./sets/';
    const indexResp=await fetch(baseURL+'index.json');
    if(indexResp.ok){
      const fileList=await indexResp.json();
      for(const filename of fileList){
        try{
          // For local file:// protocol, decode filename properly
          let filePath=baseURL+filename;
          if(window.location.protocol==='file:'){
            filePath=baseURL+encodeURIComponent(filename);
          }
          const sr=await fetch(filePath);
          if(sr.ok){
            const content=await sr.text();
            let set=null;
            try{set=decodeVset(content.trim());}catch{try{set=JSON.parse(content.trim());}catch(e){}}
            if(set&&set.title){
              set._serverFile=filename;
              if(!set.id)set.id='srv_'+filename.replace('.vset','');
              if(!set.slug)set.slug=toSlug(set.title);
              if(!set.terms)set.terms=[];
              set.fromServer=true;
              set._lastSync=Date.now();
              const existIdx=DB.sets.findIndex(x=>x._serverFile===filename);
              if(existIdx>=0){
                // Update existing set from server
                const oldSet=DB.sets[existIdx];
                DB.sets[existIdx]=set;
                // Mark if terms were removed or modified
                if(oldSet.terms&&oldSet.terms.length!==set.terms.length){
                  set._modified=true;
                }
              }else{
                DB.sets.push(set);
              }
            }
          }
        }catch(e){console.warn('Failed to load',filename,':',e.message)}
      }
      saveDB();
    }
  }catch(e){console.warn('Could not load sets from /sets/ directory:',e.message)}
}

/* ══════════════════════════════════════════════════════
   HOMEPAGE & NAVIGATION
══════════════════════════════════════════════════════ */
let currentPage = 'home';
let libraryFilter = 'all';
let searchQuery = '';
let librarySort = 'date';
let subjectSort = 'date';
let libraryMineOnly = false;
let libraryFilters = { size:'all', opened:'all', images:'all' };
let librarySelected = new Set();
let currentSubject = '';

const SUBJECT_FALLBACK = [
  ['Biologie','biologie','#168a68'],['Duits','duits','#b94747'],['Geschiedenis','geschiedenis','#8a6238'],
  ['Grieks','grieks','#5168b6'],['Latijn','latijn','#8a4f77'],['Nederlands','nederlands','#d06b32'],
  ['Natuurkunde','natuurkunde','#316f9e'],['Scheikunde','scheikunde','#6a55a5'],
  ['Aardrijkskunde','aardrijkskunde','#477b42'],['Economie','economie','#397e78'],
  ['Engels','engels','#9b4452'],['Frans','frans','#3c5f9b'],['Overig','overig','#62636a']
].map(([name,slug,color])=>({name,slug,color,image:'assets/subjects/placeholder.svg'}));
let SUBJECTS = [...SUBJECT_FALLBACK];

async function loadSubjectIndex(){
  try{
    const response=await fetch('assets/subjects/index.json');
    if(response.ok){
      const subjects=await response.json();
      if(Array.isArray(subjects)&&subjects.length)SUBJECTS=subjects;
    }
  }catch(e){}
  if(currentPage==='vakken')renderVakken();
  if(currentPage==='subject')renderSubjectDetail();
}

function getSubjectConfig(value){
  const normalized=String(value||'').toLowerCase();
  return SUBJECTS.find(subject=>subject.slug===normalized||subject.name.toLowerCase()===normalized)
    || SUBJECTS.find(subject=>subject.slug==='overig')
    || SUBJECT_FALLBACK[SUBJECT_FALLBACK.length-1];
}

function getPageFromLocation() {
  const hashPage = decodeURIComponent(window.location.hash.slice(1));
  if(hashPage.startsWith('subject/')){
    currentSubject=getSubjectConfig(hashPage.slice(8)).name;
    return 'subject';
  }
  if (['home', 'library', 'vakken', 'zoeken'].includes(hashPage)) return hashPage;
  const queryPage = new URLSearchParams(window.location.search).get('page');
  return ['home', 'library', 'vakken', 'zoeken'].includes(queryPage) ? queryPage : 'home';
}

function showPage(page) {
  if (!['home', 'library', 'vakken', 'zoeken', 'subject'].includes(page)) page = 'home';
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(page).classList.add('active');
  document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
  const sidebarPage=page==='subject'?'vakken':page;
  const sidebarBtns = document.querySelectorAll('.sidebar-btn');
  sidebarBtns.forEach(b => {
    const onclick = b.getAttribute('onclick') || '';
    if (onclick.includes("'"+sidebarPage+"'")) b.classList.add('active');
  });
  if (page === 'library') renderLibrary();
  else if (page === 'vakken') renderVakken();
  else if (page === 'subject') renderSubjectDetail();
  else if (page === 'home') renderHome();
  else if (page === 'zoeken') { renderRecentSearchesList(); setTimeout(()=>{ document.getElementById('mobile-search-box')?.focus(); }, 100); }
  updateRecentSidebar();
  const nextHash=page==='subject'
    ? `#subject/${encodeURIComponent(getSubjectConfig(currentSubject).slug)}`
    : `#${page}`;
  if (window.location.hash !== nextHash) {
    window.history.replaceState(window.history.state, '', nextHash);
  }
}

window.addEventListener('hashchange', () => showPage(getPageFromLocation()));

function updateRecentSidebar() {
  const recentKey = 'sd_recent_sets';
  let recent = [];
  try { recent = JSON.parse(localStorage.getItem(recentKey) || '[]'); } catch(e) {}
  const recentSets = recent.map(id => DB.sets.find(s => s.id === id)).filter(Boolean).slice(0, 3);
  
  const container = document.getElementById('recent-sidebar');
  if (!container) return;
  
  container.innerHTML = recentSets.map(s => `
    <div class="recent-set-item" onclick="openSet('${s.id}')">
      <svg width="24px" height="24px" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path data-name="Rectangle 30" fill="rgba(149,0,0,0)" d="M0 0h256v256H0z"/><g data-name="Group 20" transform="translate(-3613 1432)" fill="currentColor"><path data-name="Path 188" d="M3815.387-1215.553a33.3 33.3 0 0 1-5.766-.507l-105.483-18.6 93.315-16.454a32.78 32.78 0 0 0 21.3-13.57 32.78 32.78 0 0 0 5.467-24.658l-12.621-71.574 22.852 4.029a32.8 32.8 0 0 1 12.2 4.784 32.9 32.9 0 0 1 9.1 8.786 32.9 32.9 0 0 1 5.143 11.558 32.8 32.8 0 0 1 .324 13.1l-13.371 75.83a32.9 32.9 0 0 1-4.053 11.016 32.9 32.9 0 0 1-7.343 8.625 33.04 33.04 0 0 1-21.064 7.635m-120.77-162.634a33 33 0 0 1 6.686-1.177Z"/><rect data-name="Rectangle 33" width="193" height="143" rx="33" transform="rotate(-10.02 -5974.64 -21305.009)" opacity=".6"/></g></svg>
      <div class="recent-set-label">${esc(s.title)}</div>
    </div>
  `).join('');
}

function getWeekNumber(d = new Date()) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  return weekNum;
}

function renderHome(){
  const today = new Date();
  const opts = {weekday:'long', year:'numeric', month:'long', day:'numeric'};
  document.getElementById('today-date').textContent = today.toLocaleDateString('nl-NL', opts).split(',')[0];
  document.getElementById('week-number').textContent = `Week ${getWeekNumber(today)}`;

  renderRecentSidebar();

  const isOffline = !navigator.onLine;

  // Zijbalk verbergen/tonen
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.style.display = isOffline ? 'none' : '';

  // Secties
  const onlineSections = ['section-recent','section-recommended','section-newest'];
  onlineSections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = isOffline ? 'none' : '';
  });

  // Zoekbalk verbergen op desktop bij geen internet
  const searchWrapper = document.querySelector('nav .search-wrapper');
  if (searchWrapper) searchWrapper.style.display = isOffline ? 'none' : '';

  document.getElementById('section-no-connection').style.display = isOffline ? 'block' : 'none';

  if (!isOffline) {
    const recentKey = 'sd_recent_sets';
    let recent = [];
    try { recent = JSON.parse(localStorage.getItem(recentKey) || '[]'); } catch(e) {}
    recent = recent.filter(id => DB.sets.find(s => s.id === id)).slice(0, 3);
    const recentSets = recent.map(id => DB.sets.find(s => s.id === id)).filter(Boolean);
    if (recentSets.length) {
      document.getElementById('section-recent').style.display = 'block';
      renderSetGrid('recent-grid', recentSets);
    }
    const recommended = DB.sets.filter(s => s.vak).sort(() => Math.random() - 0.5).slice(0, 3);
    if (recommended.length) renderSetGrid('recommended-grid', recommended);
    const newest = DB.sets.filter(s => s.fromServer).sort((a, b) => (b.id || '').localeCompare(a.id || '')).slice(0, 3);
    const newestSect = document.getElementById('section-newest');
    if (newest.length) { newestSect.style.display = 'block'; renderSetGrid('newest-grid', newest); }
    else { newestSect.style.display = 'none'; }
  }

  // Mijn sets (altijd zichtbaar)
  const mySets = DB.sets.filter(s => !s.fromServer);
  const mySect = document.getElementById('section-my-sets');
  if (mySets.length) { mySect.style.display = 'block'; renderSetGrid('my-sets-grid', mySets); }
  else { mySect.style.display = 'none'; }

  // Gedownloade sets (altijd zichtbaar, ook offline)
  const offlineIds = getOfflineSets().map(o => o.id || o.slug);
  const offlineSets = DB.sets.filter(s =>
    s._offlineSaved || offlineIds.includes(s.id) || offlineIds.includes(s.slug) || (!s.fromServer && !s._serverFile)
  );
  const offlineSect = document.getElementById('section-offline');
  if (offlineSect) {
    if (offlineSets.length) { offlineSect.style.display = 'block'; renderSetGrid('offline-grid', offlineSets); }
    else { offlineSect.style.display = 'none'; }
  }
}

function isUserSet(set){
  return !set.fromServer&&!set._serverFile;
}

function renderSetGrid(elementId, sets, options={}) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if(!sets.length){
    el.innerHTML='<div class="empty-state">Geen sets gevonden met deze instellingen.</div>';
    return;
  }
  el.innerHTML = sets.map(s => `
    <div class="set-card${librarySelected.has(s.id)?' selected':''}" onclick="openSet('${s.id}')">
      ${options.selectable?`<button class="set-select-btn" onclick="event.stopPropagation();toggleLibrarySelection('${s.id}')" aria-label="Selecteer ${esc(s.title)}">
        ${librarySelected.has(s.id)?'<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>':''}
      </button>`:''}
      <div class="set-card-title">${esc(s.title)}</div>
      <div class="set-card-desc">${esc(s.description||'')}</div>
      <div class="set-card-meta">
        <span class="badge badge-purple">${s.terms.length} begrippen</span>
        ${s.vak?`<span class="badge badge-orange">${esc(s.vak)}</span>`:''}
        ${s.datum?`<span style="font-size:11px;color:var(--text3)">${s.datum}</span>`:''}
      </div>
      <div class="set-card-actions" onclick="event.stopPropagation()">
        <button style="aspect-ratio:1/1 !important;padding:6px 10px;align-items:center;display:flex;justify-content:center;" class="btn btn-glass btn-sm" onclick="openSet('${s.id}')"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256"><path data-name="Rectangle 20" fill="rgba(0,0,0,0)" d="M0 0h256v256H0z"/><path data-name="Path 1" d="M211.196 93.815c25.431 15.689 25.431 52.681 0 68.371l-124.243 76.65c-26.746 16.5-61.217-2.748-61.217-34.185v-153.3c0-31.437 34.47-50.686 61.217-34.185Z" fill="var(--text)"/></svg></button>
        ${options.manage&&isUserSet(s)?`<button class="btn btn-glass btn-sm card-action-btn" onclick="duplicateSet('${s.id}')" title="Dupliceren"><svg viewBox="0 0 24 24"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg></button>`:''}
        ${!s.fromServer?`<button style="aspect-ratio:1/1 !important;padding:6px 10px;align-items:center;display:flex;justify-content:center;" class="btn btn-glass btn-sm" onclick="showCreateModal('${s.id}')"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256"><path data-name="Rectangle 17" fill="rgba(152,37,37,0)" d="M0 0h256v256H0z"/><g data-name="Group 13" transform="rotate(45 2187.158 -2777.125)" fill="var(--text)"><path data-name="Path 170" d="M2785 888.133a7.9 7.9 0 0 1-3.778-.941 7 7 0 0 1-2.831-2.824l-17.6-32.459a6.4 6.4 0 0 1-.779-2.688h49.978a6.4 6.4 0 0 1-.779 2.688l-17.6 32.459a7.03 7.03 0 0 1-2.831 2.824 7.9 7.9 0 0 1-3.78.941m25-54.655h-50V600.523a21.35 21.35 0 0 1 1.965-8.969 23 23 0 0 1 5.358-7.324 25.1 25.1 0 0 1 7.947-4.938 26.7 26.7 0 0 1 9.731-1.811 26.7 26.7 0 0 1 9.731 1.811 25.1 25.1 0 0 1 7.947 4.938 23 23 0 0 1 5.358 7.324 21.4 21.4 0 0 1 1.965 8.969v232.954Zm-24.5-237.083c-4.687 0-8.5 3.515-8.5 7.834v216.6c0 4.32 3.813 7.835 8.5 7.835s8.5-3.515 8.5-7.835v-216.6c0-4.32-3.81-7.835-8.499-7.835Z"/><rect data-name="Rectangle 19" width="17" height="232.271" rx="8.5" transform="translate(2777 596.393)" opacity=".6"/></g></svg></button>`:''}
        ${!s.fromServer?`<button class="btn btn-sm" style="background:rgba(232,58,74,0.1);color:var(--red);border:none;border-radius:100%;aspect-ratio:1/1;align-items:center;display:flex;justify-content:center;padding:6px 10px;font-family:var(--font);font-weight:700;cursor:pointer" onclick="confirmDelete('${s.id}')"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256"><path data-name="Rectangle 20" fill="rgba(0,0,0,0)" d="M0 0h256v256H0z"/><g data-name="Group 15" fill="var(--red)"><path data-name="Path 181" d="M190.628 256H66.231a22.12 22.12 0 0 1-15.521-6.256 20.93 20.93 0 0 1-6.429-15.1L27.774 72.076a20.93 20.93 0 0 1 6.429-15.1 22.12 22.12 0 0 1 15.521-6.259h155.345a22.12 22.12 0 0 1 15.521 6.256 20.93 20.93 0 0 1 6.429 15.1l-14.445 162.568a20.93 20.93 0 0 1-6.429 15.1A22.12 22.12 0 0 1 190.628 256M162.914 74.908a12.03 12.03 0 0 0-12.061 11.654l-4.635 132.749a12.09 12.09 0 0 0 11.646 12.489q.201.008.429.008a12.025 12.025 0 0 0 12.06-11.654l4.636-132.749a12.075 12.075 0 0 0-11.646-12.488 10 10 0 0 0-.429-.009m-69.829 0q-.215-.002-.429.007a12.09 12.09 0 0 0-11.646 12.49l4.635 132.749a12.025 12.025 0 0 0 12.059 11.654q.23.002.43-.008a12.09 12.09 0 0 0 11.647-12.489l-4.635-132.749a12.026 12.026 0 0 0-12.061-11.654"/><path data-name="Path 179" d="M30.793 41.057A8.453 8.453 0 0 1 22.34 32.6a16.906 16.906 0 0 1 16.906-16.9h27.773A15.7 15.7 0 0 1 82.718 0h90.566a15.7 15.7 0 0 1 15.7 15.7h27.774a16.906 16.906 0 0 1 16.902 16.9 8.45 8.45 0 0 1-8.452 8.453Z"/><path data-name="Path 180" d="M157.86 231.8a12.075 12.075 0 0 1-11.646-12.489l4.639-132.746a12.076 12.076 0 0 1 24.137.843l-4.637 132.746a12.076 12.076 0 0 1-12.061 11.654q-.212 0-.432-.008m-72.214-11.646L81.01 87.405a12.075 12.075 0 0 1 24.136-.84l4.636 132.749a12.075 12.075 0 0 1-11.647 12.489c-.143 0-.287.007-.429.007a12.076 12.076 0 0 1-12.06-11.656" opacity=".4"/></g></svg></button>`:''}
      </div>
    </div>
  `).join('');
}

function renderLibrary() {
  renderLibraryMenus();
  let sets = DB.sets.filter(set=>libraryMineOnly?isUserSet(set):!isUserSet(set));
  const recentIds=new Set(getOpenedSetIds());
  if(libraryFilters.size==='small')sets=sets.filter(set=>(set.terms?.length||0)<=20);
  if(libraryFilters.size==='medium')sets=sets.filter(set=>(set.terms?.length||0)>20&&(set.terms?.length||0)<=50);
  if(libraryFilters.size==='large')sets=sets.filter(set=>(set.terms?.length||0)>50);
  if(libraryFilters.opened==='opened')sets=sets.filter(set=>recentIds.has(set.id));
  if(libraryFilters.opened==='unopened')sets=sets.filter(set=>!recentIds.has(set.id));
  if(libraryFilters.images==='with')sets=sets.filter(set=>setHasImages(set));
  if(libraryFilters.images==='without')sets=sets.filter(set=>!setHasImages(set));
  if (searchQuery) {
    sets = sets.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.vak && s.vak.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }
  sortSets(sets,librarySort);
  const summary=document.getElementById('library-summary');
  if(summary)summary.textContent=libraryMineOnly
    ? `${sets.length} zelfgemaakte ${sets.length===1?'set':'sets'}`
    : `${sets.length} beschikbare ${sets.length===1?'set':'sets'}`;
  document.getElementById('library-mine-btn')?.classList.toggle('active',libraryMineOnly);
  renderSetGrid('library-list',sets,{selectable:libraryMineOnly,manage:libraryMineOnly});
  renderLibrarySelectionBar();
}

function renderVakken() {
  const el = document.getElementById('vakken-grid');
  if(!el)return;
  el.innerHTML = SUBJECTS.map(subject => {
    const count = DB.sets.filter(set => !isUserSet(set)&&normalizeSubject(set.vak)===subject.name).length;
    return `
      <button class="subject-card" onclick="openSubject('${subject.slug}')"
        style="--subject-color:${subject.color};--subject-image:url('${subject.image}')">
        <span class="subject-card-content">
          <strong>${esc(subject.name)}</strong>
          <small>${count} ${count===1?'set':'sets'}</small>
        </span>
      </button>
    `;
  }).join('');
}

function openSubject(slug){
  currentSubject=getSubjectConfig(slug).name;
  showPage('subject');
}

function renderSubjectDetail(){
  const subject=getSubjectConfig(currentSubject);
  currentSubject=subject.name;
  const sets=DB.sets.filter(set=>!isUserSet(set)&&normalizeSubject(set.vak)===subject.name);
  sortSets(sets,subjectSort);
  const hero=document.getElementById('subject-hero');
  if(hero){
    hero.style.setProperty('--subject-color',subject.color);
    hero.style.setProperty('--subject-image',`url('${subject.image}')`);
  }
  const title=document.getElementById('subject-title');
  const count=document.getElementById('subject-count');
  if(title)title.textContent=subject.name;
  if(count)count.textContent=`${sets.length} ${sets.length===1?'set':'sets'}`;
  renderSortMenu('subject-sort-menu','subject-sort-btn',subjectSort,'setSubjectSort');
  renderSetGrid('subject-sets-grid',sets);
}

function normalizeSubject(value){
  const match=SUBJECTS.find(subject=>subject.name.toLowerCase()===String(value||'').trim().toLowerCase());
  return match?match.name:'Overig';
}

function getRecentSetIds(){
  try{return JSON.parse(localStorage.getItem('sd_recent_sets')||'[]');}catch(e){return[];}
}

function getOpenedSetIds(){
  let opened=[];
  try{opened=JSON.parse(localStorage.getItem('sd_opened_sets')||'[]');}catch(e){}
  return [...new Set([...opened,...getRecentSetIds()])];
}

function setHasImages(set){
  return (set.terms||[]).some(term=>Array.isArray(term.images)&&term.images.length);
}

function sortSets(sets,sort){
  const byTitle=(a,b)=>(a.title||'').localeCompare(b.title||'','nl',{sensitivity:'base'});
  if(sort==='alpha')sets.sort(byTitle);
  else if(sort==='subject')sets.sort((a,b)=>normalizeSubject(a.vak).localeCompare(normalizeSubject(b.vak),'nl',{sensitivity:'base'})||byTitle(a,b));
  else if(sort==='size')sets.sort((a,b)=>(b.terms?.length||0)-(a.terms?.length||0)||byTitle(a,b));
  else sets.sort((a,b)=>(b.datum||b.id||'').localeCompare(a.datum||a.id||'')||byTitle(a,b));
  return sets;
}

function renderRecentSidebar(){
  const recentKey='sd_recent_sets';
  let recent=[];
  try{recent=JSON.parse(localStorage.getItem(recentKey)||'[]');}catch(e){}
  recent=recent.filter(id=>DB.sets.find(s=>s.id===id)).slice(0,3);
  const recentSets=recent.map(id=>DB.sets.find(s=>s.id===id)).filter(Boolean);

  const container=document.getElementById('recent-sidebar');
  if(!container)return;

  if(recentSets.length===0){
    container.innerHTML='';
    return;
  }

  container.innerHTML=recentSets.map(s=>`
    <button class="recent-set-item" onclick="openSet('${s.id}')" title="${esc(s.title)}">
      <svg width="24px" height="24px" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path data-name="Rectangle 30" fill="rgba(149,0,0,0)" d="M0 0h256v256H0z"/><g data-name="Group 20" transform="translate(-3613 1432)" fill="currentColor"><path data-name="Path 188" d="M3815.387-1215.553a33.3 33.3 0 0 1-5.766-.507l-105.483-18.6 93.315-16.454a32.78 32.78 0 0 0 21.3-13.57 32.78 32.78 0 0 0 5.467-24.658l-12.621-71.574 22.852 4.029a32.8 32.8 0 0 1 12.2 4.784 32.9 32.9 0 0 1 9.1 8.786 32.9 32.9 0 0 1 5.143 11.558 32.8 32.8 0 0 1 .324 13.1l-13.371 75.83a32.9 32.9 0 0 1-4.053 11.016 32.9 32.9 0 0 1-7.343 8.625 33.04 33.04 0 0 1-21.064 7.635m-120.77-162.634a33 33 0 0 1 6.686-1.177Z"/><rect data-name="Rectangle 33" width="193" height="143" rx="33" transform="rotate(-10.02 -5974.64 -21305.009)" opacity=".6"/></g></svg>
      <div class="recent-set-label">${esc(s.title)}</div>
    </button>
  `).join('');
}

function filterLibrary() {
  renderLibrary();
}

const SORT_OPTIONS=[
  ['date','Datum'],['alpha','Alfabet'],['subject','Vak'],['size','Grootte']
];

function renderLibraryMenus(){
  const filterMenu=document.getElementById('library-filter-menu');
  if(filterMenu){
    const group=(title,key,options)=>`
      <div class="filter-group">
        <div class="filter-group-title">${title}</div>
        ${options.map(([value,label])=>`<button class="menu-option${libraryFilters[key]===value?' active':''}" onclick="setLibraryFilter('${key}','${value}')"><span>${label}</span><i></i></button>`).join('')}
      </div>`;
    filterMenu.innerHTML=
      group('Grootte','size',[['all','Alle groottes'],['small','Tot 20 begrippen'],['medium','21–50 begrippen'],['large','Meer dan 50']])+
      group('Gebruik','opened',[['all','Alles'],['opened','Al geopend'],['unopened','Nog niet geopend']])+
      group('Afbeeldingen','images',[['all','Alles'],['with','Bevat afbeeldingen'],['without','Zonder afbeeldingen']]);
  }
  renderSortMenu('library-sort-menu','library-sort-btn',librarySort,'setLibrarySort');
  const activeCount=Object.values(libraryFilters).filter(value=>value!=='all').length;
  const count=document.getElementById('library-filter-count');
  if(count){
    count.textContent=activeCount;
    count.classList.toggle('show',activeCount>0);
  }
}

function renderSortMenu(menuId,buttonId,value,handler){
  const menu=document.getElementById(menuId);
  const button=document.getElementById(buttonId);
  const selected=SORT_OPTIONS.find(option=>option[0]===value)||SORT_OPTIONS[0];
  if(button){
    const svg=button.querySelector('svg')?.outerHTML||'';
    button.innerHTML=`Sorteren op: ${selected[1].toLowerCase()}${svg}`;
  }
  if(menu)menu.innerHTML=SORT_OPTIONS.map(([sort,label])=>
    `<button class="menu-option${sort===value?' active':''}" onclick="${handler}('${sort}')"><span>${label}</span><i></i></button>`
  ).join('');
}

function toggleLibraryMenu(id,event){
  event?.stopPropagation();
  const target=document.getElementById(id);
  document.querySelectorAll('.toolbar-menu.open').forEach(menu=>{if(menu!==target)menu.classList.remove('open');});
  target?.classList.toggle('open');
}

function closeLibraryMenus(){
  document.querySelectorAll('.toolbar-menu.open').forEach(menu=>menu.classList.remove('open'));
}

function setLibraryFilter(key,value){
  libraryFilters[key]=value;
  closeLibraryMenus();
  renderLibrary();
}

function setLibrarySort(value){
  librarySort=value;
  closeLibraryMenus();
  renderLibrary();
}

function setSubjectSort(value){
  subjectSort=value;
  closeLibraryMenus();
  renderSubjectDetail();
}

function toggleMySets(){
  libraryMineOnly=!libraryMineOnly;
  librarySelected.clear();
  renderLibrary();
}

function toggleLibrarySelection(id){
  if(librarySelected.has(id))librarySelected.delete(id);
  else librarySelected.add(id);
  renderLibrary();
}

function renderLibrarySelectionBar(){
  const bar=document.getElementById('library-selection-bar');
  if(!bar)return;
  if(!libraryMineOnly){
    bar.innerHTML='';
    bar.classList.remove('show');
    return;
  }
  const count=librarySelected.size;
  bar.classList.add('show');
  bar.innerHTML=`
    <span>${count?`${count} geselecteerd`:'Selecteer sets om ze te combineren'}</span>
    <button class="btn btn-primary btn-sm" onclick="showLibraryCombineModal()" ${count<2?'disabled':''}>
      Sets combineren${count?` (${count})`:''}
    </button>`;
}

function showLibraryCombineModal(){
  const selected=[...librarySelected].map(id=>DB.sets.find(set=>set.id===id)).filter(Boolean);
  if(selected.length<2){showToast('Selecteer minimaal 2 sets');return;}
  showModal(`
    <h3>Sets combineren</h3>
    <div class="modal-content">
      <p class="text-muted" style="margin-bottom:16px">${selected.length} sets worden samengevoegd. Dubbele begrippen worden één keer opgenomen.</p>
      <div class="input-group"><label>Naam van de nieuwe set</label><input id="combine-title" type="text" value="${esc(selected.map(set=>set.title).join(' + '))}"></div>
      <div class="combine-preview">${selected.map(set=>`<div><strong>${esc(set.title)}</strong><span>${set.terms?.length||0} begrippen</span></div>`).join('')}</div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-glass" onclick="closeModal()">Annuleren</button>
      <button class="btn btn-primary" onclick="combineLibrarySets()">Combineren</button>
    </div>`);
}

function combineLibrarySets(){
  const selected=[...librarySelected].map(id=>DB.sets.find(set=>set.id===id)).filter(Boolean);
  const title=document.getElementById('combine-title')?.value.trim();
  if(selected.length<2||!title){showToast('Vul een naam in');return;}
  const seen=new Set();
  const terms=[];
  selected.forEach(set=>(set.terms||[]).forEach(term=>{
    const key=(term.term||'').trim().toLowerCase();
    if(!seen.has(key)){seen.add(key);terms.push({...term});}
  }));
  DB.sets.unshift({
    id:'set_combo_'+Date.now(),slug:toSlug(title),title,
    description:`Combinatie van: ${selected.map(set=>set.title).join(', ')}`,
    vak:selected.every(set=>normalizeSubject(set.vak)===normalizeSubject(selected[0].vak))?normalizeSubject(selected[0].vak):'Overig',
    datum:new Date().toISOString().slice(0,10),terms
  });
  saveDB();
  librarySelected.clear();
  closeModal();
  renderLibrary();
  showToast(`"${title}" is aangemaakt`);
}

function duplicateSet(id){
  const source=DB.sets.find(set=>set.id===id);
  if(!source)return;
  const copy=JSON.parse(JSON.stringify(source));
  copy.id='set_copy_'+Date.now();
  copy.title=`${source.title} – kopie`;
  copy.slug=`${toSlug(copy.title)}-${Date.now().toString().slice(-5)}`;
  copy.datum=new Date().toISOString().slice(0,10);
  delete copy.fromServer;
  delete copy._serverFile;
  delete copy._lastSync;
  DB.sets.unshift(copy);
  saveDB();
  renderLibrary();
  showToast('Set gedupliceerd');
}

document.addEventListener('click',event=>{
  if(!event.target.closest('.toolbar-dropdown'))closeLibraryMenus();
  if(!event.target.closest('.subject-picker-popover')&&!event.target.closest('.subject-picker-btn'))closeSubjectPicker();
});



function openSet(id){
  const s=DB.sets.find(x=>x.id===id);if(!s)return;
  const slug=s.slug||toSlug(s.title);s.slug=slug;saveDB();
  const recentKey='sd_recent_sets';
  let recent=[];try{recent=JSON.parse(localStorage.getItem(recentKey)||'[]');}catch(e){}
  recent=recent.filter(r=>r!==id);recent.unshift(id);recent=recent.slice(0,10);
  localStorage.setItem(recentKey,JSON.stringify(recent));
  let opened=[];try{opened=JSON.parse(localStorage.getItem('sd_opened_sets')||'[]');}catch(e){}
  if(!opened.includes(id)){opened.push(id);localStorage.setItem('sd_opened_sets',JSON.stringify(opened));}
  window.location.href=`set.html?set=${encodeURIComponent(slug)}`;
}

/* ══════════════════════════════════════════════════════
   MOBIELE ZOEKPAGINA
══════════════════════════════════════════════════════ */
function saveRecentSearch(query) {
  if (!query || query.trim().length < 2) return;
  let recents = [];
  try { recents = JSON.parse(localStorage.getItem('sd_recent_searches') || '[]'); } catch(e) {}
  recents = recents.filter(r => r !== query.trim());
  recents.unshift(query.trim());
  recents = recents.slice(0, 10);
  localStorage.setItem('sd_recent_searches', JSON.stringify(recents));
}

function getRecentSearches() {
  try { return JSON.parse(localStorage.getItem('sd_recent_searches') || '[]'); } catch(e) { return []; }
}

function clearRecentSearches() {
  localStorage.removeItem('sd_recent_searches');
  renderRecentSearchesList();
}

function renderRecentSearchesList() {
  const recents = getRecentSearches();
  const section = document.getElementById('mobile-recent-searches-section');
  const list = document.getElementById('mobile-recent-searches-list');
  if (!list) return;
  if (recents.length === 0) {
    if (section) section.style.display = 'none';
    return;
  }
  if (section) section.style.display = 'block';
  list.innerHTML = recents.map(q => `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(180,170,210,0.2);cursor:pointer" onclick="doMobileSearch('${esc(q)}')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <span style="font-size:14px;color:var(--text);font-weight:600;flex:1">${esc(q)}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
    </div>
  `).join('');
}

function doMobileSearch(query) {
  const box = document.getElementById('mobile-search-box');
  if (box) { box.value = query; box.dispatchEvent(new Event('input')); }
}

function setupMobileSearch() {
  const searchBox = document.getElementById('mobile-search-box');
  if (!searchBox) return;
  let searchTimeout;
  searchBox.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim().toLowerCase();
    const resultsEl = document.getElementById('mobile-search-results');
    const recentSection = document.getElementById('mobile-recent-searches-section');
    if (!query) {
      if (resultsEl) resultsEl.innerHTML = '';
      if (recentSection) recentSection.style.display = 'block';
      renderRecentSearchesList();
      return;
    }
    if (recentSection) recentSection.style.display = 'none';
    searchTimeout = setTimeout(() => {
      saveRecentSearch(query);
      let results = DB.sets.filter(s =>
        s.title.toLowerCase().includes(query) ||
        (s.vak && s.vak.toLowerCase().includes(query)) ||
        (s.datum && s.datum.includes(query))
      );
      if (!resultsEl) return;
      if (results.length === 0) {
        resultsEl.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text2)">Geen resultaten gevonden</div>';
        return;
      }
      resultsEl.innerHTML = `
        <div style="font-size:13px;color:var(--text3);font-weight:700;margin-bottom:12px">${results.length} resultaat${results.length !== 1 ? 'en' : ''}</div>
        <div class="library-list">${results.map(s => `
          <div class="library-item" onclick="openSet('${s.id}')">
            <div class="library-item-info">
              <h3>${esc(s.title)}</h3>
              <p>${esc(s.description || 'Geen omschrijving')}</p>
              <div class="library-item-meta">
                <span class="badge badge-purple">${s.terms.length} begrippen</span>
                ${s.vak ? `<span class="badge badge-orange">${esc(s.vak)}</span>` : ''}
              </div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openSet('${s.id}')">→</button>
          </div>
        `).join('')}</div>`;
    }, 300);
  });
}

function setupSearch(){
  const searchBox=document.getElementById('search-box');
  if(!searchBox)return;
  
  // Create search results dropdown
  const dropdown=document.createElement('div');
  dropdown.id='search-dropdown';
  dropdown.style.cssText='position:fixed;top:52px;background:rgba(255,255,255,1);border:1px solid var(--glass-border);border-radius:22px;max-height:400px;overflow-y:auto;z-index:300;display:none;';
  document.body.appendChild(dropdown);
  
  const updateDropdownPosition = () => {
    const rect = searchBox.getBoundingClientRect();
    dropdown.style.left = rect.left + 'px';
    dropdown.style.top = (rect.bottom + 8) + 'px';
    dropdown.style.width = rect.width + 'px';
  };
  
  searchBox.addEventListener('input',(e)=>{
    const query=e.target.value.trim().toLowerCase();
    searchQuery=query;
    
    if(!query){
      dropdown.style.display='none';
      return;
    }
    
    // --help toggle
    if(query==='help'){
      dropdown.innerHTML='<div style="padding:16px;text-align:center;color:var(--text2);font-size:14px">Geen resultaten gevonden</div>';
      updateDropdownPosition();
      dropdown.style.display='block';
      showOnboarding('home',true);
      return;
    }
    
    // Secret feature: type 'developer' to go to developer.html
    if(query==='dev'){
      dropdown.innerHTML='<div style="padding:16px;text-align:center;color:var(--text2);font-size:14px">Geen resultaten gevonden</div>';
      updateDropdownPosition();
      dropdown.style.display='block';
      return;
    }
    
    let results=DB.sets.filter(s=>
      s.title.toLowerCase().includes(query)||
      (s.vak&&s.vak.toLowerCase().includes(query))||
      (s.datum&&s.datum.includes(query))
    );
    
    if(results.length===0){
      dropdown.innerHTML='<div style="padding:16px;text-align:center;color:var(--text2);font-size:14px">Geen resultaten gevonden</div>';
      updateDropdownPosition();
      dropdown.style.display='block';
      return;
    }
    
    updateDropdownPosition();
    dropdown.innerHTML=results.slice(0,8).map(s=>`
      <div style="padding:12px 16px;border-bottom:1px solid rgba(0,98,255,0.1);cursor:pointer;transition:all .2s" onmouseover="this.style.background='rgba(0,98,255,0.05)'" onmouseout="this.style.background=''" onclick="openSet('${s.id}');document.getElementById('search-dropdown').style.display='none';document.getElementById('search-box').value=''">
        <div style="font-weight:800;font-size:14px;color:var(--text)">${esc(s.title)}</div>
        <div style="font-size:12px;color:var(--text2);margin-top:3px">${s.vak?'<span style="margin-right:8px">'+esc(s.vak)+'</span>':''}${s.terms.length} begrippen</div>
      </div>
    `).join('')+(results.length>8?'<div style="padding:8px;text-align:center;font-size:12px;color:var(--text3)">+${results.length-8} meer...</div>':'');
    dropdown.style.display='block';
  });
  
  searchBox.addEventListener('focus',()=>{
    if(searchBox.value.trim()){
      updateDropdownPosition();
      dropdown.style.display='block';
    }
  });
  
  searchBox.addEventListener('keydown',(e)=>{
    if(e.key==='Enter'){
      const query=searchBox.value.trim().toLowerCase();
      if(query==='dev'){
        window.location.href='developer.html';
      }
    }
  });
  
  window.addEventListener('scroll',()=>{
    if(dropdown.style.display==='block'){
      updateDropdownPosition();
    }
  });
  
  document.addEventListener('click',(e)=>{
    if(!searchBox.contains(e.target)&&!dropdown.contains(e.target)){
      dropdown.style.display='none';
    }
  });
}

function toSlug(str){
  return str.toLowerCase()
    .replace(/[àáâäãåā]/g,'a').replace(/[èéêëē]/g,'e').replace(/[ìíîïī]/g,'i')
    .replace(/[òóôöõøō]/g,'o').replace(/[ùúûüū]/g,'u').replace(/[ñ]/g,'n')
    .replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-').slice(0,60)||'set-'+Date.now();
}

/* ══════════════════════════════════════════════════════
   RICH TEXT EDITOR ENGINE
   
   Philosophy:
   - Each pair cell is a contenteditable div
   - We use execCommand (still works in all browsers) for bold/italic/color
   - We save the innerHTML as the formatted content and strip tags for plain text
   - On load, we restore innerHTML so the user sees formatting in the field
══════════════════════════════════════════════════════ */

const COLORS = [
  {hex:'#0b0f2a', label:'Zwart'},
  {hex:'#e83a4a', label:'Rood'},
  {hex:'#0062ff', label:'Blauw'},
  {hex:'#18b672', label:'Groen'},
  {hex:'#f07b20', label:'Oranje'},
  {hex:'#9333ea', label:'Paars'},
  {hex:'#db2777', label:'Roze'},
  {hex:'#0891b2', label:'Cyaan'},
];

// Track which cell currently has the toolbar visible
let _activeFmtBar = null;
let _savedRange = null; // saved selection before toolbar button mousedown

/** Save the current selection so we can restore it after a toolbar click */
function saveSelection() {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    _savedRange = sel.getRangeAt(0).cloneRange();
  }
}

/** Restore saved selection into the given element */
function restoreSelection(el) {
  el.focus();
  if (!_savedRange) return;
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(_savedRange);
}

/** Apply execCommand formatting, restoring selection first */
function applyCmd(editorEl, cmd, value=null) {
  restoreSelection(editorEl);
  document.execCommand(cmd, false, value);
  editorEl.focus();
  syncPairFromEditor(editorEl);
  updateToolbarState(editorEl);
}

/** Get plain text from HTML */
function htmlToPlain(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

/** Update active states of toolbar buttons based on cursor position */
function updateToolbarState(editorEl) {
  const barId = editorEl.dataset.barId;
  const bar = document.getElementById(barId);
  if (!bar) return;

  const isBold = document.queryCommandState('bold');
  const isItalic = document.queryCommandState('italic');

  bar.querySelector('[data-cmd="bold"]')?.classList.toggle('active', isBold);
  bar.querySelector('[data-cmd="italic"]')?.classList.toggle('active', isItalic);

  // Highlight current foreColor swatch
  bar.querySelectorAll('.color-swatch').forEach(sw => {
    sw.classList.remove('active');
  });
  // (foreColor is tricky to query — skip for now, selection-based)
}

/** Read innerHTML back into CE.pairs */
function syncPairFromEditor(editorEl) {
  const idx = parseInt(editorEl.dataset.idx);
  const field = editorEl.dataset.field; // 'term' or 'def'
  const pair = CE.pairs[idx];
  if (!pair) return;
  const html = editorEl.innerHTML;
  const plain = htmlToPlain(html);
  if (field === 'term') {
    pair.term = plain;
    pair.termHtml = html;
  } else {
    pair.def = plain;
    pair.defHtml = html;
  }
  ceSaveDraft();
}

/** Show/hide toolbar for the focused editor */
function onEditorFocus(editorEl) {
  const barId = editorEl.dataset.barId;
  const bar = document.getElementById(barId);
  if (bar) {
    bar.classList.add('visible');
    _activeFmtBar = bar;
  }
  updateToolbarState(editorEl);
}

function onEditorBlur(editorEl, e) {
  // Delay so toolbar button clicks can fire first
  setTimeout(() => {
    const barId = editorEl.dataset.barId;
    const bar = document.getElementById(barId);
    if (!bar) return;
    // If focus moved to the bar itself or one of its children, keep visible
    if (bar.contains(document.activeElement)) return;
    bar.classList.remove('visible');
    if (_activeFmtBar === bar) _activeFmtBar = null;
  }, 180);
}

/** Build a single pair row HTML — no inline event handlers on the editor itself,
    we bind via JS after insertion */
function buildPairRowHTML(i, p) {
  const termBarId = `bar-term-${i}`;
  const defBarId  = `bar-def-${i}`;
  const termEdId  = `ed-term-${i}`;
  const defEdId   = `ed-def-${i}`;

  const termHtml = p.termHtml || esc(p.term || '');
  const defHtml  = p.defHtml  || esc(p.def  || '');

  return `
    <div class="pair-row" id="pr-${i}">
      <div class="pair-num">${i+1}</div>

      <!-- TERM column -->
      <div class="pair-col">
        <div
          class="rich-editor"
          id="${termEdId}"
          contenteditable="true"
          data-placeholder="Begrip"
          data-idx="${i}"
          data-field="term"
          data-bar-id="${termBarId}"
          spellcheck="true"
        >${termHtml}</div>
        ${buildToolbarHTML(termBarId, termEdId)}
        ${buildImageGallery(i, p)}
      </div>

      <!-- DEF column -->
      <div class="pair-col">
        <div
          class="rich-editor"
          id="${defEdId}"
          contenteditable="true"
          data-placeholder="Definitie"
          data-idx="${i}"
          data-field="def"
          data-bar-id="${defBarId}"
          spellcheck="true"
        >${defHtml}</div>
        ${buildToolbarHTML(defBarId, defEdId)}
      </div>

      <button class="pair-del" onclick="ceRemove(${i})">×</button>
    </div>
  `;
}

function buildToolbarHTML(barId, edId) {
  const swatches = COLORS.map(c =>
    `<div class="color-swatch" style="background:${c.hex}" title="${c.label}"
      data-color="${c.hex}" data-editor="${edId}"></div>`
  ).join('');

  return `
    <div class="fmt-bar" id="${barId}">
      ${swatches}
      <div class="fmt-sep"></div>
      <button class="fmt-btn" data-cmd="bold" data-editor="${edId}" title="Vet (Ctrl+B)"><b>B</b></button>
      <button class="fmt-btn" data-cmd="italic" data-editor="${edId}" title="Cursief (Ctrl+I)"><i>I</i></button>
      <div class="fmt-sep"></div>
      <button class="fmt-clear" data-editor="${edId}" title="Verwijder alle opmaak">✕ Opmaak wissen</button>
      <button class="img-upload-btn" data-upload="${edId}" style="margin-left:auto">🖼️ Afb.</button>
    </div>
  `;
}

function buildImageGallery(i, p) {
  if (!p.images || !p.images.length) return '';
  return `<div class="image-gallery">${p.images.map((img,j) =>
    `<img src="data:image/png;base64,${img.base64}" class="image-thumb"
      onclick="ceRemoveImage(${i},${j})" title="Klik om te verwijderen">`
  ).join('')}</div>`;
}

/** After inserting pair rows into DOM, bind all events */
function bindPairEvents(container) {
  // ── Editor focus/blur/input/keydown ──
  container.querySelectorAll('.rich-editor').forEach(ed => {
    ed.addEventListener('focus', () => onEditorFocus(ed));
    ed.addEventListener('blur',  (e) => onEditorBlur(ed, e));
    ed.addEventListener('input', () => { saveSelection(); syncPairFromEditor(ed); updateToolbarState(ed); });
    ed.addEventListener('keyup', () => { updateToolbarState(ed); });
    ed.addEventListener('mouseup', () => { saveSelection(); updateToolbarState(ed); });
    ed.addEventListener('keydown', (e) => {
      // Ctrl+B / Ctrl+I shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'b' || e.key === 'B') { e.preventDefault(); saveSelection(); applyCmd(ed, 'bold'); }
        if (e.key === 'i' || e.key === 'I') { e.preventDefault(); saveSelection(); applyCmd(ed, 'italic'); }
      }
      // Tab → jump to next editor
      if (e.key === 'Tab') {
        e.preventDefault();
        const all = [...container.querySelectorAll('.rich-editor')];
        const cur = all.indexOf(ed);
        const next = all[cur + 1];
        if (next) { next.focus(); const r = document.createRange(); r.selectNodeContents(next); r.collapse(false); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
        else { ceAdd(); } // Tab on last field → add new pair
      }
    });
  });

  // ── Toolbar buttons (bold/italic) ──
  container.querySelectorAll('.fmt-btn[data-cmd]').forEach(btn => {
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault(); // don't steal focus
      const ed = document.getElementById(btn.dataset.editor);
      if (!ed) return;
      saveSelection();
      applyCmd(ed, btn.dataset.cmd);
    });
  });

  // ── Color swatches ──
  container.querySelectorAll('.color-swatch').forEach(sw => {
    sw.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const ed = document.getElementById(sw.dataset.editor);
      if (!ed) return;
      saveSelection();
      applyCmd(ed, 'foreColor', sw.dataset.color);
    });
  });

  // ── Clear formatting ──
  container.querySelectorAll('.fmt-clear').forEach(btn => {
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const ed = document.getElementById(btn.dataset.editor);
      if (!ed) return;
      restoreSelection(ed);
      // Select all if nothing selected
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        document.execCommand('selectAll', false, null);
      }
      document.execCommand('removeFormat', false, null);
      ed.focus();
      syncPairFromEditor(ed);
      updateToolbarState(ed);
    });
  });

  // ── Image upload ──
  container.querySelectorAll('[data-upload]').forEach(btn => {
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const edId = btn.dataset.upload;
      // Extract pair index from editor id: ed-term-2 → 2
      const match = edId.match(/ed-(?:term|def)-(\d+)/);
      if (match) ceUploadImage(parseInt(match[1]));
    });
  });
}

/* ══════════════════════════════════════════════════════
   CREATE / EDIT MODAL
══════════════════════════════════════════════════════ */
let CE = { id: null, pairs: [], viewMode: 0 }; // 0: klein, 1: breed, 2: volledig

function showCreateModal(id) {
  document.documentElement.classList.add("modal-open");
  document.body.classList.add("modal-open");
  CE.id = id || null;
  CE.viewMode = window.innerWidth <= 750 ? 2 : 0;
  let s = id ? DB.sets.find(x => x.id === id) : null;

  if (!id) {
    const draft = JSON.parse(localStorage.getItem('sd_draft') || 'null');
    if (draft) {
      s = {
        title: draft.title || '',
        vak: draft.vak || '',
        description: draft.desc || '',
        datum: draft.datum || '',
        terms: draft.pairs || []
      };
      setTimeout(() => showToast('Concept hersteld'), 100);
    }
  }

  CE.pairs = s
    ? s.terms.map(t => ({ ...t }))
    : [{ term:'', def:'' }, { term:'', def:'' }];
  const editorSubject=getSubjectConfig(s?.vak||'Overig').name;

  showModal(`
    <h3>
      <span>${id ? 'Set bewerken' : 'Nieuwe set'}</span>
      <div class="modal-header-actions">
        <button class="modal-header-btn" onclick="toggleMaximize()" title="Maximaliseer"><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 256 256"><path data-name="Rectangle 20" fill="rgba(255,255,255,0)" d="M2433 926h256v256h-256z" transform="translate(-2433 -926)"/><path data-name="Rectangle 20" d="M2504.766 936h112.468A61.766 61.766 0 0 1 2679 997.766v112.468a61.766 61.766 0 0 1-61.766 61.766h-112.468a61.766 61.766 0 0 1-61.766-61.766V997.766A61.766 61.766 0 0 1 2504.766 936" fill="var(--accent)" opacity=".4" transform="translate(-2433 -926)"/><path data-name="Rectangle 59" fill="var(--accent)" opacity=".6" d="m2634.186 960.308 20.506 20.506-166.877 166.877-20.506-20.506z" transform="translate(-2433 -926)"/><path data-name="Path 235" d="M2602.5 936h14.734A61.766 61.766 0 0 1 2679 997.766v14.734a14.5 14.5 0 0 1-14.5 14.5 14.5 14.5 0 0 1-14.5-14.5v-14.734A32.8 32.8 0 0 0 2617.234 965H2602.5a14.5 14.5 0 0 1-14.5-14.5 14.5 14.5 0 0 1 14.5-14.5" fill="var(--accent)" transform="translate(-2433 -926)"/><path data-name="Path 236" d="M2519.5 1172h-14.734a61.766 61.766 0 0 1-61.766-61.766V1095.5a14.5 14.5 0 0 1 14.5-14.5 14.5 14.5 0 0 1 14.5 14.5v14.734a32.8 32.8 0 0 0 32.766 32.766h14.734a14.5 14.5 0 0 1 14.5 14.5 14.5 14.5 0 0 1-14.5 14.5" fill="var(--accent)" transform="translate(-2433 -926)"/></svg></button>
      </div>
    </h3>
    <div class="modal-content">
    <div class="two-col" style="margin-bottom:12px">
      <div class="input-group"><label>Titel *</label><input id="c-title" type="text" placeholder="Bijv. Biologie H3" value="${esc(s?.title||'')}" oninput="ceSaveDraft()"></div>
      <div class="input-group"><label>Vak</label>
        <div class="subject-select">
          <input id="c-vak" type="hidden" value="${esc(editorSubject)}">
          <button type="button" class="subject-picker-btn" onclick="toggleSubjectPicker(this)">
            <span id="c-vak-label">${esc(editorSubject)}</span>
            <svg viewBox="0 0 24 24"><path d="m7 10 5 5 5-5"/></svg>
          </button>
        </div>
      </div>
    </div>
    <div class="two-col" style="margin-bottom:16px">
      <div class="input-group"><label>Omschrijving</label><textarea id="c-desc" style="min-height:56px" oninput="ceSaveDraft()">${esc(s?.description||'')}</textarea></div>
      <div class="input-group"><label>Datum toetsafname</label><input id="c-datum" type="date" value="${esc(s?.datum||'')}" oninput="ceSaveDraft()"></div>
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:8px">
      <div style="font-size:15px;font-weight:800">Begrippen
      </div>
      <button class="btn btn-glass btn-sm" onclick="ceAdd()">+ Toevoegen</button>
    </div>

    <div style="display:grid;grid-template-columns:28px 1fr 1fr 28px;gap:8px;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid rgba(180,170,210,0.2)">
      <div></div>
      <div style="font-size:11px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.5px">Begrip / Term</div>
      <div style="font-size:11px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.5px">Definitie</div>
      <div></div>
    </div>

    <div id="ce-pairs" style="max-height:360px;overflow-y:auto;padding-right:2px"></div>
    <button class="btn btn-glass btn-add-term" style="width:100%;margin-top:8px" onclick="ceAdd()">+ Begrip toevoegen</button>
    </div>

    <div class="modal-footer">
      <button class="btn btn-sm" style="background:rgba(232,58,74,0.1);color:var(--red);margin-right:auto" onclick="ceClearDraft()">Concept verwijderen</button>
      <button class="btn btn-glass" onclick="closeModal()">Annuleren</button>
      <button class="btn btn-primary" onclick="ceSave()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        ${id ? 'Opslaan' : 'Aanmaken'}
      </button>
    </div>
  `);

  ceRenderPairs();
}

function toggleSubjectPicker(button){
  const existing=document.querySelector('.subject-picker-popover');
  if(existing){existing.remove();return;}
  const rect=button.getBoundingClientRect();
  const popover=document.createElement('div');
  popover.className='subject-picker-popover';
  popover.style.left=`${Math.max(12,Math.min(rect.left,window.innerWidth-292))}px`;
  popover.style.top=`${Math.max(12,Math.min(rect.bottom+8,window.innerHeight-356))}px`;
  popover.style.width=`${Math.min(Math.max(rect.width,240),280)}px`;
  const current=document.getElementById('c-vak')?.value;
  popover.innerHTML=SUBJECTS.map(subject=>`
    <button type="button" class="${subject.name===current?'active':''}" onclick="selectEditorSubject('${subject.slug}')">
      <span class="subject-picker-color" style="background:${subject.color}"></span>
      <span>${esc(subject.name)}</span>
      ${subject.name===current?'<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>':''}
    </button>`).join('');
  document.body.appendChild(popover);
}

function closeSubjectPicker(){
  document.querySelector('.subject-picker-popover')?.remove();
}

function selectEditorSubject(slug){
  const subject=getSubjectConfig(slug);
  const input=document.getElementById('c-vak');
  const label=document.getElementById('c-vak-label');
  if(input)input.value=subject.name;
  if(label)label.textContent=subject.name;
  closeSubjectPicker();
  ceSaveDraft();
}

function toggleMaximize() {
  if (window.innerWidth <= 750) return;
  CE.viewMode = (CE.viewMode + 1) % 3;
  const bg = document.getElementById('modal-bg');
  const btn = document.querySelector('.modal-header-btn');

  bg.classList.remove('modal-maximized', 'modal-fullscreen');

  const maxSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 256 256"><path data-name="Rectangle 20" fill="rgba(255,255,255,0)" d="M2433 926h256v256h-256z" transform="translate(-2433 -926)"/><path data-name="Rectangle 20" d="M2504.766 936h112.468A61.766 61.766 0 0 1 2679 997.766v112.468a61.766 61.766 0 0 1-61.766 61.766h-112.468a61.766 61.766 0 0 1-61.766-61.766V997.766A61.766 61.766 0 0 1 2504.766 936" fill="var(--accent)" opacity=".4" transform="translate(-2433 -926)"/><path data-name="Rectangle 59" fill="var(--accent)" opacity=".6" d="m2634.186 960.308 20.506 20.506-166.877 166.877-20.506-20.506z" transform="translate(-2433 -926)"/><path data-name="Path 235" d="M2602.5 936h14.734A61.766 61.766 0 0 1 2679 997.766v14.734a14.5 14.5 0 0 1-14.5 14.5 14.5 14.5 0 0 1-14.5-14.5v-14.734A32.8 32.8 0 0 0 2617.234 965H2602.5a14.5 14.5 0 0 1-14.5-14.5 14.5 14.5 0 0 1 14.5-14.5" fill="var(--accent)" transform="translate(-2433 -926)"/><path data-name="Path 236" d="M2519.5 1172h-14.734a61.766 61.766 0 0 1-61.766-61.766V1095.5a14.5 14.5 0 0 1 14.5-14.5 14.5 14.5 0 0 1 14.5 14.5v14.734a32.8 32.8 0 0 0 32.766 32.766h14.734a14.5 14.5 0 0 1 14.5 14.5 14.5 14.5 0 0 1-14.5 14.5" fill="var(--accent)" transform="translate(-2433 -926)"/></svg>';
  const minSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 256 256"><path data-name="Rectangle 20" fill="rgba(255,255,255,0)" d="M0 0h256v256H0z"/><path data-name="Rectangle 20" d="M71.766 10h112.468A61.766 61.766 0 0 1 246 71.766v112.468A61.766 61.766 0 0 1 184.234 246H71.766A61.766 61.766 0 0 1 10 184.234V71.766A61.766 61.766 0 0 1 71.766 10" fill="var(--accent)" opacity=".4"/><path data-name="Path 237" d="m19.047 216.442 76.775-76.775 20.506 20.506-76.775 76.775a62.1 62.1 0 0 1-20.506-20.506m122.9-122.9 74.488-74.489a62.1 62.1 0 0 1 20.507 20.506l-74.489 74.488Z" fill="var(--accent)" opacity=".6"/><path data-name="Path 235" d="M198.5 131h-14.734A61.766 61.766 0 0 1 122 69.234V54.5A14.5 14.5 0 0 1 136.5 40 14.5 14.5 0 0 1 151 54.5v14.734A32.8 32.8 0 0 0 183.766 102H198.5a14.5 14.5 0 0 1 14.5 14.5 14.5 14.5 0 0 1-14.5 14.5" fill="var(--accent)"/><path data-name="Path 236" d="M61.5 120h14.734A61.766 61.766 0 0 1 138 181.766V196.5a14.5 14.5 0 0 1-14.5 14.5 14.5 14.5 0 0 1-14.5-14.5v-14.734A32.8 32.8 0 0 0 76.234 149H61.5A14.5 14.5 0 0 1 47 134.5 14.5 14.5 0 0 1 61.5 120" fill="var(--accent)"/></svg>';

  if (CE.viewMode === 1) {
    bg.classList.add('modal-maximized');
    if (btn) btn.innerHTML = maxSvg;
  } else if (CE.viewMode === 2) {
    bg.classList.add('modal-fullscreen');
    if (btn) btn.innerHTML = minSvg;
  } else {
    if (btn) btn.innerHTML = maxSvg;
  }
}

function ceRenderPairs() {
  const container = document.getElementById('ce-pairs');
  if (!container) return;

  // Build all rows
  container.innerHTML = CE.pairs.map((p, i) => buildPairRowHTML(i, p)).join('');

  // Bind all events
  bindPairEvents(container);
}

function ceSaveDraft() {
  if (CE.id) return;
  const draft = {
    title: document.getElementById('c-title')?.value || '',
    vak: document.getElementById('c-vak')?.value || '',
    desc: document.getElementById('c-desc')?.value || '',
    datum: document.getElementById('c-datum')?.value || '',
    pairs: CE.pairs
  };
  localStorage.setItem('sd_draft', JSON.stringify(draft));
}

function ceClearDraft() {
  if (!confirm('Weet je zeker dat je alle velden wilt leegmaken?')) return;
  localStorage.removeItem('sd_draft');
  CE.pairs = [{ term:'', def:'' }, { term:'', def:'' }];
  document.getElementById('c-title').value = '';
  document.getElementById('c-vak').value = 'Overig';
  document.getElementById('c-vak-label').textContent = 'Overig';
  document.getElementById('c-desc').value = '';
  ceRenderPairs();
}

function ceAdd() {
  CE.pairs.push({ term:'', def:'', termHtml:'', defHtml:'' });
  ceSaveDraft();
  ceRenderPairs();
  // Scroll to bottom and focus new term editor
  const container = document.getElementById('ce-pairs');
  if (container) {
    container.scrollTop = container.scrollHeight;
    setTimeout(() => {
      const eds = container.querySelectorAll('.rich-editor[data-field="term"]');
      const last = eds[eds.length - 1];
      if (last) last.focus();
    }, 60);
  }
}

function ceRemove(i) {
  if (CE.pairs.length <= 1) { showToast('Minimaal 1 begrip vereist'); return; }
  CE.pairs.splice(i, 1);
  ceSaveDraft();
  ceRenderPairs();
}

function ceUploadImage(idx) {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500000) { showToast('Afbeelding te groot (max 500KB)'); return; }
    const reader = new FileReader();
    reader.onload = evt => {
      const b64 = evt.target.result.split(',')[1];
      const pair = CE.pairs[idx];
      if (!pair.images) pair.images = [];
      if (pair.images.length >= 3) { showToast('Max 3 afbeeldingen per begrip'); return; }
      pair.images.push({ id:'img_'+Date.now(), base64:b64 });
      ceSaveDraft();
      ceRenderPairs();
      showToast('✓ Afbeelding toegevoegd!');
    };
    reader.readAsDataURL(file);
  };
  inp.click();
}

function ceRemoveImage(idx, imgIdx) {
  const pair = CE.pairs[idx];
  if (pair.images) { pair.images.splice(imgIdx, 1); ceSaveDraft(); ceRenderPairs(); showToast('Afbeelding verwijderd'); }
}

function ceSave() {
  const title = document.getElementById('c-title').value.trim();
  if (!title) { showToast('Vul een titel in'); return; }

  // Sync all editors one last time before saving
  document.querySelectorAll('#ce-pairs .rich-editor').forEach(ed => syncPairFromEditor(ed));

  const terms = CE.pairs
    .filter(p => p.term.trim() || p.def.trim())
    .map(p => {
      const t = { term: p.term.trim(), def: p.def.trim() };
      // Preserve rich HTML (only if it differs from plain text, i.e., has formatting)
      if (p.termHtml && p.termHtml !== esc(p.term)) t.termHtml = p.termHtml;
      if (p.defHtml  && p.defHtml  !== esc(p.def))  t.defHtml  = p.defHtml;
      if (p.images) t.images = p.images;
      return t;
    });

  if (!terms.length) { showToast('Voeg minimaal 1 begrip toe'); return; }

  const existing = CE.id ? DB.sets.find(x => x.id === CE.id) : null;
  const slug = existing?.slug || toSlug(title);
  const set = {
    id: CE.id || 'set_'+Date.now(),
    slug, title,
    description: document.getElementById('c-desc').value.trim(),
    vak: normalizeSubject(document.getElementById('c-vak').value),
    datum: document.getElementById('c-datum').value,
    terms
  };

  if (CE.id) {
    const idx = DB.sets.findIndex(x => x.id === CE.id);
    if (idx > -1) DB.sets[idx] = set;
  } else {
    DB.sets.unshift(set);
  }

  saveDB();
  localStorage.removeItem('sd_draft');
  closeModal();
  if(currentPage==='library')renderLibrary();
  else if(currentPage==='subject')renderSubjectDetail();
  else renderHome();
  showToast(CE.id ? 'Set opgeslagen' : 'Set aangemaakt');
}

/* ══════════════════════════════════════════════════════
   DELETE
══════════════════════════════════════════════════════ */
function confirmDelete(id) {
  const s = DB.sets.find(x => x.id === id);
  if (!s) return;
  if (s.fromServer) { showToast('Lokale sets kunnen niet verwijderd worden'); return; }
  showModal(`
    <h3>Set verwijderen?</h3>
    <p style="color:var(--text2);margin-bottom:20px">Dit kan niet ongedaan worden gemaakt.</p>
    <div class="modal-footer">
      <button class="btn btn-glass" onclick="closeModal()">Annuleren</button>
      <button class="btn" style="background:var(--red);color:#fff;border:none;border-radius:var(--r3);padding:9px 18px;font-family:var(--font);font-weight:700;cursor:pointer" onclick="doDelete('${id}')">Verwijderen</button>
    </div>
  `);
}
function doDelete(id) {
  DB.sets=DB.sets.filter(s=>s.id!==id);
  librarySelected.delete(id);
  saveDB();
  closeModal();
  if(currentPage==='library')renderLibrary();
  else renderHome();
  showToast('Set verwijderd');
}

/* ══════════════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════════════ */
function showModal(html) {
  document.getElementById('modal-panel').innerHTML = html;
  const bg = document.getElementById('modal-bg');
  bg.classList.remove('hidden');
  bg.classList.remove('modal-maximized', 'modal-fullscreen');
  if (CE.viewMode === 1) {
    bg.classList.add('modal-maximized');
  } else if (CE.viewMode === 2) {
    bg.classList.add('modal-fullscreen');
  }
}
function closeModal() {
  closeSubjectPicker();
  document.documentElement.classList.remove("modal-open");
  document.body.classList.remove("modal-open");
  CE.viewMode = 0;
  document.getElementById('modal-bg').classList.add('hidden');
  document.getElementById('modal-bg').classList.remove('modal-maximized', 'modal-fullscreen');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); if (document.getElementById('account-overlay')) closeAccountOverlay(); } });

/* ══════════════════════════════════════════════════════
   TOAST / UTIL
══════════════════════════════════════════════════════ */
let _tt;
function showToast(msg) { const t=document.getElementById('toast'); t.innerHTML=msg; t.classList.add('show'); clearTimeout(_tt); _tt=setTimeout(()=>t.classList.remove('show'),2800); }
function esc(s) { if(!s)return''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

/* ══════════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════
   OFFLINE SETS
══════════════════════════════════════════ */
function getOfflineSets() {
  try { return JSON.parse(localStorage.getItem('sd_offline_sets') || '[]'); } catch(e) { return []; }
}

function importVsetFile() {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = '.vset,application/octet-stream';
  inp.multiple = true;
  inp.onchange = async (e) => {
    const files = [...e.target.files];
    let imported = 0;
    for (const file of files) {
      try {
        const text = await file.text();
        let set = null;
        try { set = decodeVset(text.trim()); } catch { try { set = JSON.parse(text.trim()); } catch(err) {} }
        if (!set || !set.title) { showToast(`${file.name}: ongeldig bestand`); continue; }
        if (!set.id) set.id = 'imp_' + Date.now() + '_' + imported;
        if (!set.slug) set.slug = toSlug(set.title);
        if (!set.terms) set.terms = [];
        set._offlineSaved = true;
        set._offlineSavedAt = Date.now();
        // Voeg toe of update
        const idx = DB.sets.findIndex(s => s.id === set.id || s.slug === set.slug);
        if (idx >= 0) { DB.sets[idx] = set; } else { DB.sets.unshift(set); }
        // Registreer als offline
        const offline = getOfflineSets();
        if (!offline.some(o => o.id === set.id)) {
          offline.push({ id: set.id, slug: set.slug, title: set.title });
          localStorage.setItem('sd_offline_sets', JSON.stringify(offline));
        }
        imported++;
      } catch(err) { showToast(`Fout bij ${file.name}`); }
    }
    if (imported > 0) {
      saveDB();
      showToast(`✓ ${imported} set${imported > 1 ? 's' : ''} geïmporteerd`);
      renderHome();
    }
  };
  inp.click();
}

/* ══════════════════════════════════════════
   ONBOARDING
══════════════════════════════════════════ */
const ONBOARD_DEFS = {
  home: {
    icon: '<svg width="84" height="84" xmlns="http://www.w3.org/2000/svg" width="256.001" height="256" viewBox="0 0 256.001 256"><path data-name="Rectangle 20" fill="rgba(0,0,0,0)" d="M.001 0h256v256h-256z"/><g data-name="Privacy Icon_iOS Buddy" fill="var(--accent)"><path data-name="Path 203" d="M52.014 97.921c-15.859-1.58-26.413-14.252-26.413-29.657 0-16.51 12.135-29.864 29.867-29.864 15.645 0 26.952 10.41 29.371 24.176a31 31 0 0 1 .5 5.509v.179c0 16.513-12.118 29.867-29.867 29.867h-.326a23 23 0 0 1-3.132-.21" opacity=".6"/><path data-name="Path 205" d="M197.12 98.13c-17.75 0-29.865-13.353-29.865-29.865a30.6 30.6 0 0 1 .526-5.687c2.432-13.768 13.7-24.178 29.339-24.178 17.748 0 29.868 13.356 29.868 29.865 0 15.4-10.522 28.072-26.412 29.652a22 22 0 0 1-3.122.216 7 7 0 0 1-.334-.003" opacity=".4"/><path data-name="Path 206" d="M178.83 217.6a4.6 4.6 0 0 1-3.186-1.258 3.8 3.8 0 0 1-1.182-2.678c0-.1 0-.206.008-.308.327-4.671.566-10.89.566-14.872q.01-.586.011-1.17a72.5 72.5 0 0 0-.881-11.273 80 80 0 0 1-10.6 5.554c-1.18.56-2.407 1.025-3.637 1.556s-2.355.887-3.583 1.306-2.611.84-3.943 1.211-2.253.606-3.41.887c-.769.185-1.487.375-2.254.513s-2 .422-3.021.607c-2 .327-4.047.651-6.146.841-.612.094-1.278.141-1.945.185q-.189-3.388-.191-6.781t.191-6.781a1 1 0 0 0 0-.12 2.2 2.2 0 0 0-.706-1.6 2.67 2.67 0 0 0-1.86-.706h-7.594a2.74 2.74 0 0 1-1.864-.717 2.27 2.27 0 0 1-.729-1.663v-.061q-.007-.6-.008-1.193 0-4.177.415-8.339c1.536.138 3.177.186 4.761.186a42 42 0 0 0 4.813-.186h.412a54.1 54.1 0 0 0 18.069-4.9c.413-.186.771-.324 1.13-.513a17 17 0 0 0 2.1-1.121 56 56 0 0 0 5.729-3.637l1.386-1.121c11.163-9.55 13.519-22.924 17.562-34.217s9.73-20.466 27.426-21.866c48.8-3.742 49.314 88.721 49.321 108.793v.776a4.91 4.91 0 0 1-5.121 4.667Z" opacity=".6"/><path data-name="Path 204" d="M5.122 217.599A4.91 4.91 0 0 1 0 212.933v-.644c0-19.834.4-112.665 49.359-108.927 17.627 1.35 23.384 10.433 27.307 21.569 4.4 12.113 6.725 26.667 20.033 36.359a30 30 0 0 0 2.663 1.723c.615.422 1.229.746 1.9 1.12a25 25 0 0 0 2.766 1.4 53.9 53.9 0 0 0 19.3 5.255q-.437 4.286-.446 8.6v.891a2.47 2.47 0 0 0 2.577 2.316h7.661a2.66 2.66 0 0 1 1.86.717 2.2 2.2 0 0 1 .7 1.6v.119q-.195 3.385-.2 6.773t.2 6.773l-.016.047a15 15 0 0 1-2.049.138c-.51 0-1.075.095-1.707.095h-.1c-1.228 0-2.457.094-3.736.094s-2.507 0-3.742-.094h-.083c-.869 0-1.7-.095-2.5-.143h-1.183a13 13 0 0 1-1.944-.185c-2.1-.186-4.145-.513-6.142-.84-1.025-.186-2-.375-3.021-.607l-3.276-.7a49 49 0 0 1-6.927-2.116c-1.044-.389-2.085-.713-3.091-1.149s-2.256-.887-3.417-1.4a33 33 0 0 1-3.119-1.443c-.922-.422-1.792-.84-2.611-1.31s-1.709-.931-2.562-1.4a24 24 0 0 1-2.511-1.553 71.6 71.6 0 0 0-.879 11.27c0 .39 0 .781.009 1.171 0 3.982.224 10.139.547 14.725q.015.16.014.32a3.93 3.93 0 0 1-1.2 2.782 4.73 4.73 0 0 1-3.3 1.316Z"/></g></svg>',
    title: 'Welkom bij Velios+',
    desc: 'Jouw volledig gratis en slimme leeromgeving voor het oefenen van begrippen en definities. Speciaal gemaakt voor leerlingen van het Murmellius Gymnasium. Onderdeel van de Velios leeromgeving.',
    features: [
      { icon: '<svg width="36px" height="36px" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path data-name="Rectangle 30" fill="rgba(149,0,0,0)" d="M0 0h256v256H0z"/><g data-name="Group 20" transform="translate(-3613 1432)" fill="currentColor"><path data-name="Path 188" d="M3815.387-1215.553a33.3 33.3 0 0 1-5.766-.507l-105.483-18.6 93.315-16.454a32.78 32.78 0 0 0 21.3-13.57 32.78 32.78 0 0 0 5.467-24.658l-12.621-71.574 22.852 4.029a32.8 32.8 0 0 1 12.2 4.784 32.9 32.9 0 0 1 9.1 8.786 32.9 32.9 0 0 1 5.143 11.558 32.8 32.8 0 0 1 .324 13.1l-13.371 75.83a32.9 32.9 0 0 1-4.053 11.016 32.9 32.9 0 0 1-7.343 8.625 33.04 33.04 0 0 1-21.064 7.635m-120.77-162.634a33 33 0 0 1 6.686-1.177Z"/><rect data-name="Rectangle 33" width="193" height="143" rx="33" transform="rotate(-10.02 -5974.64 -21305.009)" opacity=".6"/></g></svg>', title: 'Kies een set', desc: 'Bekijk de bibliotheek en kies een set waarvan je de begrippen wilt leren.' },
      { icon: '<svg width="36px" height="36px" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path data-name="Rectangle 20" fill="rgba(255,255,255,0)" d="M0 0h256v256H0z"/><g data-name="Group 28" fill="var(--text)"><path data-name="Rectangle 20" d="M71.766 10h112.468A61.766 61.766 0 0 1 246 71.766v112.468A61.766 61.766 0 0 1 184.234 246H71.766A61.766 61.766 0 0 1 10 184.234V71.766A61.766 61.766 0 0 1 71.766 10" opacity=".4"/><path data-name="Path 207" d="M124.5 198a9.626 9.626 0 0 1-9.626-9.626v-47.25h-47.25A9.625 9.625 0 0 1 58 131.5v-7a9.625 9.625 0 0 1 9.625-9.625h47.25v-47.25A9.626 9.626 0 0 1 124.5 58h7a9.625 9.625 0 0 1 9.626 9.625v47.25h47.25A9.625 9.625 0 0 1 198 124.5v7a9.625 9.625 0 0 1-9.625 9.625h-47.25v47.25A9.626 9.626 0 0 1 131.5 198Z"/></g></svg>', title: 'Maak je eigen sets', desc: 'Bestaat de set die je zoekt niet? Maak m zelf!' },
      { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 256 256"><path data-name="Rectangle 20" fill="rgba(0,0,0,0)" d="M0 0h256v256H0z"/><g data-name="Group 24" transform="translate(-2446 -936.951)" fill="var(--text)"><g data-name="Group 23"><path data-name="Path 189" d="M2642.946 1106.865a15.41 15.41 0 0 1-12.337-6.617 84 84 0 0 0-24.246-16.065 79 79 0 0 0-32.126-6.6 79 79 0 0 0-32.125 6.6 84 84 0 0 0-24.245 16.063 15.4 15.4 0 0 1-12.609 6.62 15.75 15.75 0 0 1-15.545-15.949 16.12 16.12 0 0 1 4.354-11.072l-.143-.149a114.7 114.7 0 0 1 35.882-24.673 108.65 108.65 0 0 1 44.431-9.1 107.3 107.3 0 0 1 44.432 9.236 114.6 114.6 0 0 1 33.691 22.86 16.07 16.07 0 0 1 6.4 13.18 15.744 15.744 0 0 1-15.537 15.672Zm43.485-45.364a15.17 15.17 0 0 1-12.12-6.479 146.1 146.1 0 0 0-43.724-29.29 139.3 139.3 0 0 0-56.349-11.479 139.3 139.3 0 0 0-56.349 11.479 146.1 146.1 0 0 0-46.245 31.8l-.08-.082a15.03 15.03 0 0 1-10.257 4.055h-.273a15.523 15.523 0 0 1-15.034-15.977 15.83 15.83 0 0 1 5.174-11.5 172.7 172.7 0 0 1 54.407-37.458 168.9 168.9 0 0 1 68.657-13.983 168.9 168.9 0 0 1 68.656 13.987 172.7 172.7 0 0 1 55.7 38.791l-.25.255a15.9 15.9 0 0 1 3.656 10.456 15.5 15.5 0 0 1-15.294 15.428Z" opacity=".4"/><path data-name="Path 190" d="M2555.828 1153.209a24.76 24.76 0 0 1-7.519-18.275 24.76 24.76 0 0 1 7.519-18.276 25.14 25.14 0 0 1 18.411-7.464 25.13 25.13 0 0 1 18.411 7.464 24.76 24.76 0 0 1 7.52 18.276 24.76 24.76 0 0 1-7.52 18.275 25.13 25.13 0 0 1-18.411 7.464 25.14 25.14 0 0 1-18.411-7.464" opacity=".6"/></g><rect data-name="Rectangle 47" width="22.261" height="282.713" rx="11.13" transform="rotate(45 177.689 3696.811)"/></g></svg>', title: 'Geen verbinding, geen probleem!', desc: 'Maak sets gemakkelijk beschikbaar voor offline gebruik om zelfs zonder verbinding te kunnen leren! Je eigen sets kan je sowieso al zonder verbinding leren.' }
    ]
  }
};

function showOnboarding(key, force = false) {
  const seen = JSON.parse(localStorage.getItem('sd_onboard') || '{}');
  if (!force && seen[key]) return;
  seen[key] = true;
  localStorage.setItem('sd_onboard', JSON.stringify(seen));
  const d = ONBOARD_DEFS[key];
  if (!d) return;
  const el = document.createElement('div');
  el.className = 'onboard-overlay';
  el.id = 'onboard-overlay';
  el.innerHTML = `
    <div class="onboard-panel">
      <div class="onboard-body">
        <span class="onboard-icon">${d.icon}</span>
        <div class="onboard-title">${d.title}</div>
        <div class="onboard-desc">${d.desc}</div>
        ${(d.features||[]).map(f=>`
          <div class="onboard-feature">
            <div class="onboard-feature-icon">${f.icon}</div>
            <div class="onboard-feature-text">
              <strong>${f.title}</strong>
              <span>${f.desc}</span>
            </div>
          </div>`).join('')}
      </div>
      <div class="onboard-footer">
        <button class="onboard-btn" onclick="closeOnboarding()">Verdergaan</button>
      </div>
    </div>`;
  document.body.appendChild(el);
  const body = el.querySelector('.onboard-body');
  const btn = el.querySelector('.onboard-btn');
  function updateOnboardButtonState() {
    const canScroll = body.scrollHeight <= body.clientHeight + 2;
    const isBottom = body.scrollTop + body.clientHeight >= body.scrollHeight - 2;
    btn.disabled = !(canScroll || isBottom);
  }
  body.addEventListener('scroll', updateOnboardButtonState);
  setTimeout(updateOnboardButtonState, 0);
}

function closeOnboarding() {
  const el = document.getElementById('onboard-overlay');
  if (!el) return;
  el.style.pointerEvents = 'none';
  const panel = el.querySelector('.onboard-panel');
  if (panel) {
    panel.classList.add('closing');
  }
  el.classList.add('closing');
  setTimeout(() => el.remove(), 420);
}
function initMobileSidebar() {
  const isMobile = window.innerWidth <= 750;
  const searchBtn = document.getElementById('sidebar-search-btn');
  if (searchBtn) searchBtn.style.display = isMobile ? '' : 'none';
}
window.addEventListener('resize', initMobileSidebar);
loadThemeSettings();
initDB();
loadSubjectIndex();
window.addEventListener('online', () => renderHome());
window.addEventListener('offline', () => renderHome());
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') loadAllNotifications(); });
showOnboarding('home');
syncLocalWithServer().then(()=>{
  loadSetsFromDirectory().then(() => { showPage(getPageFromLocation()); setupSearch(); });
});

window.debugDb = function(){
  console.log('Sets in memory:', DB.sets.length, DB.sets);
  return DB.sets;
};
loadSetsFromDirectory().then(() => {
  showPage(getPageFromLocation());
  setupSearch();
  setupMobileSearch();
  initMobileSidebar();
  loadAllNotifications();
  autoRequestNotifPermissionOnce();
  const loadingScreen = document.getElementById('loading-screen');
  const appContent = document.getElementById('app-content');
  if (loadingScreen && appContent) {
    loadingScreen.style.opacity = '0';
    appContent.style.opacity = '1';
    appContent.style.pointerEvents = 'auto';
    setTimeout(() => { loadingScreen.style.display = 'none'; }, 500);
  }
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('create') === '1') {
    setTimeout(() => showCreateModal(), 0);
  }
  if (urlParams.get('menu')) {
    setTimeout(() => openAccountOverlay(urlParams.get('menu')), 0);
  }
  const editId = urlParams.get('edit');
  if (editId) {
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
    setTimeout(() => {
      const setToEdit = DB.sets.find(s => s.id === editId);
      if (setToEdit && !setToEdit.fromServer && !setToEdit._serverFile) {
        showCreateModal(editId);
      } else if (setToEdit) {
        showToast('Server-sets kunnen niet bewerkt worden');
      } else {
        showToast('Set niet gevonden');
      }
    }, 200);
  }
});

/* ── ACCOUNT NAV (gekoppeld aan het samengevoegde menu-overlay) ── */
let _currentSession = null;
let _currentProfile = null;

async function initAccountNav() {
  try {
    const session = await VeliosAuth.getSession();
    _currentSession = session;
    _currentProfile = session ? await VeliosAuth.getProfile() : null;
  } catch (e) {
    console.warn('Kon accountstatus niet laden:', e.message);
  }
  updateMenuTriggerButton();
  // Als het menu open staat op het Account-tabblad, herteken het met de nieuwe info
  if (typeof MenuOverlay !== 'undefined' && MenuOverlay.open && MenuOverlay.tab === 'account') {
    renderOverlayTab('account');
  }
}

function updateMenuTriggerButton() {
  const btn = document.getElementById('menuTriggerBtn');
  if (!btn) return;
  const dot = document.getElementById('menuTriggerDot');
  if (_currentSession && _currentProfile) {
    const initial = _currentProfile.display_name?.[0]?.toUpperCase() || _currentProfile.username?.[0]?.toUpperCase() || '?';
    btn.innerHTML = (_currentProfile.avatar_url
      ? `<img src="${_currentProfile.avatar_url}" alt="avatar">`
      : `<span style="pointer-events:none">${initial}</span>`) + '<span class="menu-trigger-dot" id="menuTriggerDot"></span>';
  } else {
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span class="menu-trigger-dot" id="menuTriggerDot"></span>`;
  }
  // herstel de unread-stip na het vervangen van innerHTML
  if (typeof updateNotifBadges === 'function') updateNotifBadges();
}

async function doSignOut() {
  await VeliosAuth.signOut();
  window.location.href = 'login.html';
}

// Init bij laden
initAccountNav();

/* ══════════════════════════════════════════════════════
   SAMENGEVOEGD MENU-OVERLAY: Account / Instellingen / Notificaties
   Hergebruikt .onboard-overlay / .onboard-panel voor exact dezelfde
   in- en uit-animatie als de onboarding-overlay.
══════════════════════════════════════════════════════ */
let MenuOverlay = { open: false, tab: 'account' };

const MENU_TABS = [
  { key: 'account', label: 'Account', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
  { key: 'settings', label: 'Instellingen', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 008.6 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H2a2 2 0 110-4h.09A1.65 1.65 0 003.6 8.6a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H8a1.65 1.65 0 001-1.51V2a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V8a1.65 1.65 0 001.51 1H22a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>' },
  { key: 'notifications', label: 'Notificaties', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>' }
];

function openAccountOverlay(tab) {
  if (document.getElementById('account-overlay')) return; // al open
  MenuOverlay.open = true;
  MenuOverlay.tab = tab || MenuOverlay.tab || 'account';
  NotifDetailId = null;
  NotifSelectMode = false;
  NotifSelectedIds = [];

  const el = document.createElement('div');
  el.className = 'onboard-overlay';
  el.id = 'account-overlay';
  el.onclick = (e) => { if (e.target === el) closeAccountOverlay(); };
  el.innerHTML = `
    <div class="onboard-panel acc-ov-panel">
      <div class="acc-ov-header">
        <h3>Menu</h3>
        <button class="modal-header-btn" onclick="closeAccountOverlay()" title="Sluiten">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="acc-ov-body">
        <div class="acc-ov-sidebar" id="accOvSidebar"></div>
        <div class="acc-ov-content" id="accOvContent"></div>
      </div>
    </div>`;
  document.body.appendChild(el);
  renderOverlaySidebar();
  renderOverlayTab(MenuOverlay.tab);
  loadAllNotifications();
}

function closeAccountOverlay() {
  const el = document.getElementById('account-overlay');
  if (!el) { MenuOverlay.open = false; return; }
  el.classList.add('closing');
  const panel = el.querySelector('.onboard-panel');
  if (panel) panel.classList.add('closing');
  setTimeout(() => { el.remove(); }, 420);
  MenuOverlay.open = false;
}

window.addEventListener('resize', () => { if (MenuOverlay.open) renderOverlaySidebar(); });

function renderOverlaySidebar() {
  const sidebar = document.getElementById('accOvSidebar');
  if (!sidebar) return;
  const read = getNotifReadIds();
  const unread = AllNotifs.filter(n => !read.includes(n.id)).length;
  const isMobile = window.innerWidth <= 750;
  // Op mobiel: alleen de NIET-actieve tabblad-knoppen tonen (de actieve staat al als content erboven)
  const tabsToShow = isMobile ? MENU_TABS.filter(t => t.key !== MenuOverlay.tab) : MENU_TABS;
  sidebar.innerHTML = tabsToShow.map(t => `
    <button class="acc-ov-navbtn ${MenuOverlay.tab === t.key ? 'active' : ''}" onclick="switchOverlayTab('${t.key}')">
      <span class="acc-ov-navicon">${t.icon}</span>
      <span>${t.label}</span>
      ${t.key === 'notifications' ? `<span class="acc-ov-navbadge" id="notifNavBadge" style="display:${unread > 0 ? 'flex' : 'none'}">${unread > 0 ? unread : ''}</span>` : ''}
    </button>
  `).join('');
}

function switchOverlayTab(tab) {
  if (tab === MenuOverlay.tab) return;
  NotifDetailId = null;
  NotifSelectMode = false;
  NotifSelectedIds = [];
  MenuOverlay.tab = tab;
  renderOverlaySidebar();
  renderOverlayTab(tab);
}

function renderOverlayTab(tab) {
  MenuOverlay.tab = tab = tab || MenuOverlay.tab;
  const content = document.getElementById('accOvContent');
  if (!content) return;
  let html = '';
  if (tab === 'account') html = renderAccountTabContent();
  else if (tab === 'settings') html = renderSettingsTabContent();
  else if (tab === 'notifications') html = renderNotificationsTabContent();
  content.innerHTML = `<div class="acc-ov-content-inner">${html}</div>`;
  if (tab === 'settings') syncThemeUIControls();
  renderOverlaySidebar();
}

/* ── Account-tabblad ── */
function renderAccountTabContent() {
  if (_currentSession && _currentProfile) {
    const p = _currentProfile;
    const initial = p.display_name?.[0]?.toUpperCase() || p.username?.[0]?.toUpperCase() || '?';
    return `
      <div class="acc-ov-account-card">
        <div class="acc-ov-account-header">
          <div class="acc-ov-account-avatar">${p.avatar_url ? `<img src="${p.avatar_url}" alt="avatar">` : initial}</div>
          <div>
            <div class="acc-ov-account-name">${esc(p.display_name || p.username || '—')}</div>
            <div class="acc-ov-account-user">@${esc(p.username || '—')}</div>
          </div>
        </div>
        <div class="acc-sync-badge" style="margin-top:10px">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          <span id="accOvSyncCount">0</span>/5 gesynchroniseerd
        </div>
      </div>
      <a href="account-options.html" class="acc-dd-item" style="border-radius:var(--r4)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Account beheren
      </a>
      <a href="my-account.html" class="acc-dd-item" style="border-radius:var(--r4)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/></svg>
        Gesynchroniseerde sets
      </a>
      <div class="acc-dd-sep"></div>
      <button class="acc-dd-item danger" style="border-radius:var(--r4)" onclick="doSignOut()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Uitloggen
      </button>`;
  }
  return `
    <div style="text-align:center;padding:32px 12px">
      <div style="font-size:16px;font-weight:800;margin-bottom:8px">Je bent niet ingelogd</div>
      <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Log in om je sets te synchroniseren tussen apparaten.</div>
      <button class="btn btn-primary" onclick="window.location.href='login.html'">Inloggen</button>
    </div>`;
}

/* ── Instellingen-tabblad ── */
function renderSettingsTabContent() {
  const notifPerm = ('Notification' in window) ? Notification.permission : 'unsupported';
  return `
    <div class="settings-section"><div class="settings-section-title">Verschijning</div>
      <div class="settings-row"><span class="settings-row-label">Donkere modus</span><label class="toggle"><input type="checkbox" id="theme-dark-toggle" onchange="toggleDarkMode()"><span class="toggle-slider"></span></label></div>
    </div>
    <div class="settings-section"><div class="settings-section-title">Accentkleur</div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:6px 2px;max-width:240px">
        <button style="width:36px;height:36px;border-radius:50%;background:#0062ff;border:2px solid transparent;cursor:pointer;transition:all .2s" id="accent-0" onclick="setAccentColor('#0062ff',0)" title="Blauw"></button>
        <button style="width:36px;height:36px;border-radius:50%;background:#ff6b6b;border:2px solid transparent;cursor:pointer;transition:all .2s" id="accent-1" onclick="setAccentColor('#ff6b6b',1)" title="Rood"></button>
        <button style="width:36px;height:36px;border-radius:50%;background:#10b981;border:2px solid transparent;cursor:pointer;transition:all .2s" id="accent-2" onclick="setAccentColor('#10b981',2)" title="Groen"></button>
        <button style="width:36px;height:36px;border-radius:50%;background:#f59e0b;border:2px solid transparent;cursor:pointer;transition:all .2s" id="accent-3" onclick="setAccentColor('#f59e0b',3)" title="Amber"></button>
        <button style="width:36px;height:36px;border-radius:50%;background:#8b5cf6;border:2px solid transparent;cursor:pointer;transition:all .2s" id="accent-4" onclick="setAccentColor('#8b5cf6',4)" title="Paars"></button>
      </div>
    </div>
    <div class="settings-section">
      <div class="settings-section-title">Meldingen</div>
      <div class="settings-row">
        <span class="settings-row-label">Systeemmeldingen</span>
        ${notifPerm === 'granted'
          ? `<span style="font-size:12px;color:var(--green);font-weight:700">✓ Ingeschakeld</span>`
          : notifPerm === 'denied'
            ? `<span style="font-size:12px;color:var(--red);font-weight:700">Geblokkeerd door browser</span>`
            : `<button class="btn btn-glass btn-sm" onclick="requestNotifPermission()">Inschakelen</button>`}
      </div>
    </div>
    <div class="settings-section">
      <div class="settings-section-title">Importeren</div>
      <div class="settings-row">
        <span class="settings-row-label">Importeer .vset bestand</span>
        <button class="btn btn-glass btn-sm" onclick="importVsetFile()" style="white-space:nowrap">Importeer</button>
      </div>
    </div>`;
}

/* ══════════════════════════════════════════════════════
   NOTIFICATIES
══════════════════════════════════════════════════════ */
let AllNotifs = [];
let NotifDetailId = null;
let NotifSelectMode = false;
let NotifSelectedIds = [];

function normalizeNotif(raw, id) {
  return {
    id,
    titel: raw.titel || raw.Titel || 'Melding',
    datum: raw.datum || raw.Datum || '',
    tijd: raw.tijd || raw.Tijd || '',
    subtitel: raw.subtitel || raw.Subtitel || '',
    blog: !!(raw.blog !== undefined ? raw.blog : raw.Blog),
    inhoud: raw.inhoud || raw.Inhoud || '',
    _auto: false
  };
}

async function loadFileNotifications() {
  const out = [];
  try {
    const resp = await fetch('./notifications/index.json', { cache: 'no-store' });
    if (!resp.ok) return out;
    const files = await resp.json();
    for (const filename of files) {
      try {
        const r = await fetch('./notifications/' + filename, { cache: 'no-store' });
        if (!r.ok) continue;
        const raw = await r.json();
        out.push(normalizeNotif(raw, filename));
      } catch (e) { console.warn('Kon notificatie niet laden:', filename, e.message); }
    }
  } catch (e) { /* map ./notifications/ bestaat nog niet — geen probleem */ }
  return out;
}

/* Vergelijkt sets/index.json met de vorige bekende lijst. Nieuwe bestanden
   leveren een automatische "Een nieuwe set toegevoegd"-notificatie op.
   De tijd komt van de Last-Modified header van sets/index.json (de beste
   proxy voor het "commit-moment" die we als statische site kunnen lezen —
   dit werkt alleen als de hostingomgeving die header doorgeeft). */
async function checkForNewSetNotification() {
  try {
    const resp = await fetch('./sets/index.json', { cache: 'no-store' });
    if (!resp.ok) return [];
    const lastModified = resp.headers.get('Last-Modified');
    const fileList = await resp.json();

    const storedRaw = localStorage.getItem('sd_known_set_files');
    if (storedRaw === null) {
      // eerste keer: alleen de huidige stand opslaan, nog niets melden
      localStorage.setItem('sd_known_set_files', JSON.stringify(fileList));
      return [];
    }
    let known = [];
    try { known = JSON.parse(storedRaw || '[]'); } catch (e) {}
    const newFiles = fileList.filter(f => !known.includes(f));

    const synthetic = newFiles.map(filename => {
      const set = DB.sets.find(s => s._serverFile === filename);
      const title = set ? set.title : filename.replace('.vset', '');
      const vak = set ? set.vak : '';
      return {
        id: 'autoset_' + filename,
        titel: 'Een nieuwe set toegevoegd',
        subtitel: vak ? `${title} - ${vak}` : title,
        datum: lastModified ? new Date(lastModified).toLocaleDateString('nl-NL') : '',
        tijd: lastModified ? new Date(lastModified).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) + ' uur' : '',
        subtitel_present: true,
        blog: false,
        inhoud: '',
        _auto: true
      };
    });

    localStorage.setItem('sd_known_set_files', JSON.stringify(fileList));
    return synthetic;
  } catch (e) { console.warn('Kon nieuwe sets niet controleren:', e.message); return []; }
}

async function loadAllNotifications() {
  const fileNotifs = await loadFileNotifications();
  const autoNotifs = await checkForNewSetNotification();
  const deleted = getNotifDeletedIds();
  AllNotifs = [...autoNotifs, ...fileNotifs].filter(n => !deleted.includes(n.id));
  updateNotifBadges();
  maybeSendSystemNotification(autoNotifs.length);
  if (MenuOverlay.open && MenuOverlay.tab === 'notifications') renderOverlayTab('notifications');
  else renderOverlaySidebar();
}

function getNotifReadIds() { try { return JSON.parse(localStorage.getItem('sd_notif_read') || '[]'); } catch (e) { return []; } }
function setNotifReadIds(arr) { localStorage.setItem('sd_notif_read', JSON.stringify(arr)); }
function getNotifDeletedIds() { try { return JSON.parse(localStorage.getItem('sd_notif_deleted') || '[]'); } catch (e) { return []; } }
function setNotifDeletedIds(arr) { localStorage.setItem('sd_notif_deleted', JSON.stringify(arr)); }

function markNotifRead(id) {
  const read = getNotifReadIds();
  if (!read.includes(id)) { read.push(id); setNotifReadIds(read); }
  updateNotifBadges();
}
function markAllNotifsRead() {
  setNotifReadIds(AllNotifs.map(n => n.id));
  updateNotifBadges();
  renderOverlayTab('notifications');
  showToast('Alles gemarkeerd als gelezen');
}
function markAllNotifsUnread() {
  setNotifReadIds([]);
  updateNotifBadges();
  renderOverlayTab('notifications');
  showToast('Alles gemarkeerd als ongelezen');
}
function updateNotifBadges() {
  const read = getNotifReadIds();
  const unreadCount = AllNotifs.filter(n => !read.includes(n.id)).length;
  const navBadge = document.getElementById('notifNavBadge');
  if (navBadge) { navBadge.textContent = unreadCount > 0 ? String(unreadCount) : ''; navBadge.style.display = unreadCount > 0 ? 'flex' : 'none'; }
  const dot = document.getElementById('menuTriggerDot');
  if (dot) dot.classList.toggle('show', unreadCount > 0);
}

function toggleNotifSelectMode() {
  NotifSelectMode = !NotifSelectMode;
  NotifSelectedIds = [];
  renderOverlayTab('notifications');
}
function toggleNotifSelected(id) {
  const i = NotifSelectedIds.indexOf(id);
  if (i >= 0) NotifSelectedIds.splice(i, 1); else NotifSelectedIds.push(id);
  renderOverlayTab('notifications');
}
function deleteSelectedNotifs() {
  if (!NotifSelectedIds.length) { showToast('Selecteer eerst meldingen'); return; }
  const deleted = getNotifDeletedIds();
  NotifSelectedIds.forEach(id => { if (!deleted.includes(id)) deleted.push(id); });
  setNotifDeletedIds(deleted);
  AllNotifs = AllNotifs.filter(n => !NotifSelectedIds.includes(n.id));
  showToast(`${NotifSelectedIds.length} melding(en) verwijderd`);
  NotifSelectMode = false;
  NotifSelectedIds = [];
  updateNotifBadges();
  renderOverlayTab('notifications');
}

function handleNotifClick(id) {
  if (NotifSelectMode) { toggleNotifSelected(id); return; }
  const n = AllNotifs.find(x => x.id === id);
  if (!n) return;
  markNotifRead(id);
  if (n.blog) { NotifDetailId = id; renderOverlayTab('notifications'); }
  else { renderOverlayTab('notifications'); }
}
function closeNotifDetail() { NotifDetailId = null; renderOverlayTab('notifications'); }

let notifKebabOpen = false;
function toggleNotifKebab(e) {
  if (e) e.stopPropagation();
  const dd = document.getElementById('notifKebabDD');
  if (!dd) return;
  if (dd.style.display === 'block') {
    dd.classList.add('closing');
    setTimeout(() => { dd.classList.remove('closing'); dd.style.display = 'none'; }, 150);
    notifKebabOpen = false;
  } else {
    dd.classList.remove('closing');
    dd.style.display = 'block';
    notifKebabOpen = true;
    setTimeout(() => document.addEventListener('click', closeNotifKebabOutside, { once: true }), 10);
  }
}
function closeNotifKebabOutside(e) {
  const dd = document.getElementById('notifKebabDD');
  if (dd && notifKebabOpen && !dd.contains(e.target)) {
    dd.classList.add('closing');
    setTimeout(() => { dd.classList.remove('closing'); dd.style.display = 'none'; }, 150);
    notifKebabOpen = false;
  }
}

/* Staat alleen <br>, <b>, <i>, <strong>, <em> toe in de inhoud van een notificatie */
function sanitizeNotifHtml(html) {
  if (!html) return '';
  const allowed = ['br', 'b', 'i', 'strong', 'em'];
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  (function clean(node) {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === 1) {
        if (!allowed.includes(child.tagName.toLowerCase())) {
          child.replaceWith(document.createTextNode(child.textContent));
        } else {
          [...child.attributes].forEach(a => child.removeAttribute(a.name));
          clean(child);
        }
      }
    });
  })(tmp);
  return tmp.innerHTML;
}

function renderNotificationsTabContent() {
  if (NotifDetailId) {
    const n = AllNotifs.find(x => x.id === NotifDetailId);
    if (n) {
      return `
        <button class="notif-detail-back" onclick="closeNotifDetail()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Terug
        </button>
        <div class="notif-detail-title">${esc(n.titel)}</div>
        <div class="notif-detail-meta">${esc(n.datum)}${n.datum && n.tijd ? ' • ' : ''}${esc(n.tijd)}</div>
        <div class="notif-detail-body">${sanitizeNotifHtml(n.inhoud)}</div>`;
    }
    NotifDetailId = null;
  }

  const read = getNotifReadIds();
  const unreadCount = AllNotifs.filter(n => !read.includes(n.id)).length;

  const trashIconColor = NotifSelectMode ? 'var(--accent)' : 'var(--red)';
  const toolbar = `
    <div class="notif-toolbar">
      <div class="notif-toolbar-title">Notificaties${unreadCount > 0 ? ` <span style="color:var(--accent)">(${unreadCount} nieuw)</span>` : ''}</div>
      <div class="notif-toolbar-actions">
        <div class="notif-kebab-wrap">
          <button class="btn-icon" style="width:36px;height:36px" onclick="toggleNotifKebab(event)" title="Meer opties">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--text)"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
          </button>
          <div class="notif-kebab-dd" id="notifKebabDD" style="display:none">
            <button class="notif-kebab-item" onclick="markAllNotifsRead()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Alles markeren als gelezen
            </button>
            <button class="notif-kebab-item" onclick="markAllNotifsUnread()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>
              Alles markeren als ongelezen
            </button>
          </div>
        </div>
        <button class="btn-icon" style="width:36px;height:36px" onclick="toggleNotifSelectMode()" title="Verwijderen">
          <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><g fill="${trashIconColor}"><path d="M190.628 256H66.231a22.12 22.12 0 0 1-15.521-6.256 20.93 20.93 0 0 1-6.429-15.1L27.774 72.076a20.93 20.93 0 0 1 6.429-15.1 22.12 22.12 0 0 1 15.521-6.259h155.345a22.12 22.12 0 0 1 15.521 6.256 20.93 20.93 0 0 1 6.429 15.1l-14.445 162.568a20.93 20.93 0 0 1-6.429 15.1A22.12 22.12 0 0 1 190.628 256M162.914 74.908a12.03 12.03 0 0 0-12.061 11.654l-4.635 132.749a12.09 12.09 0 0 0 11.646 12.489q.201.008.429.008a12.025 12.025 0 0 0 12.06-11.654l4.636-132.749a12.075 12.075 0 0 0-11.646-12.488 10 10 0 0 0-.429-.009m-69.829 0q-.215-.002-.429.007a12.09 12.09 0 0 0-11.646 12.49l4.635 132.749a12.025 12.025 0 0 0 12.059 11.654q.23.002.43-.008a12.09 12.09 0 0 0 11.647-12.489l-4.635-132.749a12.026 12.026 0 0 0-12.061-11.654"/><path d="M30.793 41.057A8.453 8.453 0 0 1 22.34 32.6a16.906 16.906 0 0 1 16.906-16.9h27.773A15.7 15.7 0 0 1 82.718 0h90.566a15.7 15.7 0 0 1 15.7 15.7h27.774a16.906 16.906 0 0 1 16.902 16.9 8.45 8.45 0 0 1-8.452 8.453Z"/></g></svg>
        </button>
      </div>
    </div>`;

  const selectBar = NotifSelectMode ? `
    <div class="notif-selectbar">
      <span>${NotifSelectedIds.length} geselecteerd</span>
      <div style="display:flex;gap:6px">
        <button class="btn btn-glass btn-sm" onclick="toggleNotifSelectMode()">Annuleren</button>
        <button class="btn btn-sm" style="background:var(--red);color:#fff" onclick="deleteSelectedNotifs()">Verwijderen</button>
      </div>
    </div>` : '';

  if (!AllNotifs.length) return toolbar + selectBar + `<div class="notif-empty">Geen notificaties</div>`;

  const list = AllNotifs.map(n => {
    const isUnread = !read.includes(n.id);
    const isSelected = NotifSelectedIds.includes(n.id);
    let preview = n.subtitel;
    if (!preview && n.inhoud) {
      const plain = n.inhoud.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const words = plain.split(' ').filter(Boolean);
      preview = words.slice(0, 4).join(' ') + (words.length > 4 ? '...' : '');
    }
    return `
      <div class="notif-item ${isUnread ? 'unread' : ''} ${NotifSelectMode ? 'select-mode' : ''} ${isSelected ? 'selected' : ''}" onclick="handleNotifClick('${n.id}')">
        <div class="notif-item-check">${isSelected ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}</div>
        <div class="notif-item-dot"></div>
        <div class="notif-item-body">
          <div class="notif-item-title">${esc(n.titel)}</div>
          ${preview ? `<div class="notif-item-sub">${esc(preview)}</div>` : ''}
          <div class="notif-item-meta">${esc(n.datum)}${n.datum && n.tijd ? ' • ' : ''}${esc(n.tijd)}</div>
        </div>
      </div>`;
  }).join('');

  return toolbar + selectBar + `<div class="notif-list">${list}</div>`;
}

/* ── Systeemmeldingen (browser Notification API) ── */
function requestNotifPermission() {
  if (!('Notification' in window)) { showToast('Meldingen worden niet ondersteund in deze browser'); return; }
  if (Notification.permission === 'granted') { showToast('Meldingen staan al aan'); return; }
  Notification.requestPermission().then(perm => {
    showToast(perm === 'granted' ? '✓ Systeemmeldingen ingeschakeld' : 'Meldingen geweigerd');
    if (MenuOverlay.open && MenuOverlay.tab === 'settings') renderOverlayTab('settings');
  });
}
function autoRequestNotifPermissionOnce() {
  if (!('Notification' in window)) return;
  if (localStorage.getItem('sd_notif_permission_asked')) return;
  localStorage.setItem('sd_notif_permission_asked', '1');
  if (Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
}
function maybeSendSystemNotification(newCount) {
  if (newCount <= 0) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification('Velios+', { body: newCount === 1 ? '1 nieuwe melding' : `${newCount} nieuwe meldingen`, icon: 'favicon.png' });
  } catch (e) {}
}
