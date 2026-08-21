/* ══════════════════════════════════════════════════════
   OBFUSCATION / VSET
══════════════════════════════════════════════════════ */
const _k=['S','t','u','d','y','D','e','c','k','V','S','e','t','2','0','2','5'];
const VSET_KEY=_k.join('');
function xorStr(str,key){return str.split('').map((c,i)=>String.fromCharCode(c.charCodeAt(0)^key.charCodeAt(i%key.length))).join('');}
function encodeVset(obj){const json=JSON.stringify(obj);return btoa(unescape(encodeURIComponent(xorStr(json,VSET_KEY))));}
function decodeVset(b64){return JSON.parse(xorStr(decodeURIComponent(escape(atob(b64))),VSET_KEY));}

let _currentSession = null;
let _currentProfile = null;

/* ══════════════════════════════════════════════════════
   THEME MANAGEMENT
══════════════════════════════════════════════════════ */
const THEME_COLORS=[
  {hex:'#ff9f0a',light:'#ffe4bd',dark:'#603d08',idx:0,label:'Oranjegeel'},
  {hex:'#0062ff',light:'#d8e7ff',dark:'#003b91',idx:1,label:'Blauw'},
  {hex:'#ff6b6b',light:'#ffe0e0',dark:'#5b3030',idx:2,label:'Rood'},
  {hex:'#10b981',light:'#d7f4eb',dark:'#0b4937',idx:3,label:'Groen'},
  {hex:'#8b5cf6',light:'#e7ddff',dark:'#392765',idx:4,label:'Paars'}
];
const DEFAULT_ACCENT='#ff9f0a';

function getThemeSettings(){
  try{
    const saved=JSON.parse(localStorage.getItem('sd_theme')||'null')||{};
    const accentColor=saved.accentColor&&!(saved.accentColor==='#0062ff'&&!saved.accentWasChosen)?saved.accentColor:DEFAULT_ACCENT;
    return {
      darkMode:!!saved.darkMode,
      followSystem:saved.followSystem!==false,
      accentColor,
      accentWasChosen:!!saved.accentWasChosen
    };
  }catch(e){
    return {darkMode:false,followSystem:true,accentColor:DEFAULT_ACCENT};
  }
}

function systemPrefersDark(){
  return !!(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);
}

function effectiveDarkMode(settings){
  return settings.followSystem?systemPrefersDark():settings.darkMode;
}

function loadThemeSettings(){
  const settings=getThemeSettings();
  applyThemeSettings(effectiveDarkMode(settings),settings.accentColor);
}

/* Wordt aangeroepen telkens als het Instellingen-tabblad van het menu wordt getekend,
   want de toggle/kleurknoppen bestaan alleen in de DOM zolang dat tabblad open is. */
function syncThemeUIControls(){
  const settings=getThemeSettings();
  const systemToggle=document.getElementById('theme-system-toggle');
  const darkToggle=document.getElementById('theme-dark-toggle');
  const darkRow=document.getElementById('theme-dark-row');
  if(systemToggle) systemToggle.checked=settings.followSystem;
  if(darkToggle){
    darkToggle.checked=effectiveDarkMode(settings);
    darkToggle.disabled=settings.followSystem;
  }
  if(darkRow) darkRow.classList.toggle('is-disabled',settings.followSystem);
  updateAccentColorUI(settings.accentColor);
}

function toggleDarkMode(){
  const settings=getThemeSettings();
  const darkToggle=document.getElementById('theme-dark-toggle');
  if(!darkToggle||settings.followSystem)return;
  settings.darkMode=darkToggle.checked;
  saveThemeSettings(settings);
  applyThemeSettings(settings.darkMode,settings.accentColor);
}

function toggleSystemTheme(){
  const settings=getThemeSettings();
  const systemToggle=document.getElementById('theme-system-toggle');
  const wasFollowing=settings.followSystem;
  settings.followSystem=!!systemToggle?.checked;
  if(wasFollowing&&!settings.followSystem)settings.darkMode=systemPrefersDark();
  saveThemeSettings(settings);
  applyThemeSettings(effectiveDarkMode(settings),settings.accentColor);
  syncThemeUIControls();
}

function setAccentColor(hex,idx){
  const settings=getThemeSettings();
  settings.accentColor=hex;
  settings.accentWasChosen=true;
  saveThemeSettings(settings);
  applyThemeSettings(effectiveDarkMode(settings),hex);
  updateAccentColorUI(hex);
}

function updateAccentColorUI(hex){
  document.querySelectorAll('[id^="accent-"]').forEach(btn=>btn.classList.remove('selected'));
  const idx=THEME_COLORS.findIndex(c=>c.hex===hex);
  if(idx>=0)document.getElementById('accent-'+idx)?.classList.add('selected');
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
  if(accentColor){
    const hex=accentColor.replace('#','');
    const r=parseInt(hex.substr(0,2),16);
    const g=parseInt(hex.substr(2,2),16);
    const b=parseInt(hex.substr(4,2),16);
    root.setProperty('--accent',accentColor);
    root.setProperty('--accent2',`rgb(${Math.max(0,r-20)},${Math.max(0,g-20)},${Math.max(0,b-20)})`);
    root.setProperty('--accent-light',`rgba(${r},${g},${b},0.12)`);
    root.setProperty('--accent-contrast','#fff');
  }
}

function saveThemeSettings(settings){
  localStorage.setItem('sd_theme',JSON.stringify(settings));
}

if(window.matchMedia){
  const systemThemeQuery=window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemThemeChange=()=>{
    const settings=getThemeSettings();
    if(!settings.followSystem)return;
    applyThemeSettings(systemThemeQuery.matches,settings.accentColor);
    syncThemeUIControls();
  };
  if(systemThemeQuery.addEventListener)systemThemeQuery.addEventListener('change',handleSystemThemeChange);
  else if(systemThemeQuery.addListener)systemThemeQuery.addListener(handleSystemThemeChange);
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
              set.klas=set.klas||(window.VeliosSchool?VeliosSchool.inferClassFromFilename(filename):'');
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

function normalizeCloudTerms(raw) {
  let data = raw;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch (e) { data = []; }
  }
  if (data && !Array.isArray(data) && Array.isArray(data.terms)) data = data.terms;
  if (!Array.isArray(data)) return [];
  return data.map((item, index) => {
    if (Array.isArray(item)) {
      const definition=String(item[1]||'');
      return { id:`cloud-term-${index}`, term:String(item[0]||''), def:definition, definition };
    }
    const definition = String(item?.def ?? item?.definition ?? item?.definitie ?? item?.answer ?? '');
    return {
      ...item,
      id: item?.id || `cloud-term-${index}`,
      term: String(item?.term ?? item?.begrip ?? item?.question ?? ''),
      def: definition,
      definition,
    };
  });
}

const HIDDEN_CLOUD_SETS_KEY = 'sd_hidden_cloud_sets';

function formatSetDate(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : '';
}

function getCloudSetDate(cloud, fallback = '') {
  let data = cloud?.data;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch (e) { data = null; }
  }
  return formatSetDate(data?.datum || cloud?.datum || cloud?.updated_at || cloud?.created_at || fallback);
}

function getHiddenCloudSetIds() {
  try {
    const ids = JSON.parse(localStorage.getItem(HIDDEN_CLOUD_SETS_KEY) || '[]');
    return new Set(Array.isArray(ids) ? ids.map(String) : []);
  } catch (e) {
    return new Set();
  }
}

function saveHiddenCloudSetIds(ids) {
  localStorage.setItem(HIDDEN_CLOUD_SETS_KEY, JSON.stringify([...ids]));
}

function getCloudSetId(set) {
  if (!set) return '';
  if (set._cloudSetId) return String(set._cloudSetId);
  return set._cloud ? String(set.id || '').replace(/^cloud_/, '') : '';
}

/** Laad privé gesynchroniseerde sets naast de openbare bibliotheeksets. */
async function loadSyncedSetsIntoLibrary() {
  if (!window.VeliosAuth) return;
  let session = null;
  try { session = await VeliosAuth.getSession(); } catch (e) { return; }
  if (!session) {
    DB.sets = DB.sets.filter(set => !set._cloud);
    DB.sets.forEach(set => {
      if (!set.fromServer && !set._serverFile) {
        delete set._synced;
        delete set._cloudSetId;
        delete set._syncedAt;
      }
    });
    saveDB();
    return;
  }
  try {
    const rows = await VeliosAuth.getSyncedSets();
    const availableCloudIds = new Set(rows.map(item => String(item.set_id)));
    DB.sets = DB.sets.filter(set => {
      if (set._cloud) return false;
      if (set._synced && set._cloudSetId && !availableCloudIds.has(String(set._cloudSetId))) return false;
      return true;
    });
    const hiddenCloudSetIds = getHiddenCloudSetIds();
    let syncMap = {};
    try { syncMap = JSON.parse(localStorage.getItem('sd_cloud_sync_map') || '{}'); } catch (e) {}
    rows.forEach(item => {
      const cloud = item.sets;
      if (!cloud) return;
      if (hiddenCloudSetIds.has(String(cloud.id))) return;
      let cloudPayload=cloud.data;
      if(typeof cloudPayload==='string'){try{cloudPayload=JSON.parse(cloudPayload)}catch(e){cloudPayload={}}}
      const cloudTerms = normalizeCloudTerms(cloud.data);
      const cloudDate = getCloudSetDate(cloud, item.synced_at);
      const mappedLocalId = Object.keys(syncMap).find(localId => String(syncMap[localId]) === String(cloud.id));
      const cloudTitle = String(cloud.naam || cloud.title || '').trim().toLowerCase();
      const cloudSubject = String(cloud.vak || '').trim().toLowerCase();
      const localSet = DB.sets.find(set => {
        if (set.fromServer || set._serverFile || set._cloud) return false;
        if (mappedLocalId && String(set.id) === String(mappedLocalId)) return true;
        return String(set.title || set.naam || '').trim().toLowerCase() === cloudTitle &&
          String(set.vak || '').trim().toLowerCase() === cloudSubject;
      });
      if (localSet) {
        localSet.title = cloud.naam || cloud.title || localSet.title || 'Naamloze set';
        localSet.description = cloud.beschrijving || cloud.description || '';
        localSet.vak = cloud.vak || '';
        localSet.klas = String(cloudPayload?.klas || cloud.klas || localSet.klas || '');
        localSet.terms = cloudTerms;
        localSet.datum = cloudDate;
        localSet._synced = true;
        localSet._cloudSetId = cloud.id;
        localSet._syncedAt = item.synced_at;
        return;
      }
      DB.sets.push({
        id: `cloud_${cloud.id}`,
        slug: `cloud-${cloud.id}`,
        title: cloud.naam || cloud.title || 'Naamloze set',
        description: cloud.beschrijving || cloud.description || '',
        vak: cloud.vak || '',
        klas: String(cloudPayload?.klas || cloud.klas || ''),
        terms: cloudTerms,
        datum: cloudDate,
        _cloud: true,
        _cloudSetId: cloud.id,
        _syncedAt: item.synced_at,
      });
    });
    saveDB();
  } catch (e) {
    console.warn('Gesynchroniseerde sets konden niet worden geladen:', e.message);
  }
}

let syncedLibraryReady = false;
let syncedLibraryRefresh = null;

function renderCurrentDataPage() {
  if (currentPage === 'library') renderLibrary();
  else if (currentPage === 'subject') renderSubjectDetail();
  else if (currentPage === 'vakken') renderVakken();
  else if (currentPage === 'home') renderHome();
}

/** Haal wijzigingen van een ander apparaat op zodra dit scherm weer actief is. */
function refreshSyncedSetsFromCloud() {
  if (!syncedLibraryReady || document.visibilityState === 'hidden' || !navigator.onLine) return Promise.resolve();
  if (syncedLibraryRefresh) return syncedLibraryRefresh;
  syncedLibraryRefresh = loadSyncedSetsIntoLibrary()
    .then(() => {
      renderCurrentDataPage();
      if (MenuOverlay.open && MenuOverlay.tab === 'account') updateAccountSyncCount();
    })
    .catch(error => console.warn('Cloudsets vernieuwen is mislukt:', error.message))
    .finally(() => { syncedLibraryRefresh = null; });
  return syncedLibraryRefresh;
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
let libraryFilters = { size:'all', opened:'all', images:'all', sync:'all' };
let librarySelected = new Set();
let librarySelectionMode = false;
let currentSubject = '';

const SUBJECT_FALLBACK = [
  ['Biologie','biologie','#168a68','assets/subjects/biologie.webp'],['Duits','duits','#b94747','assets/subjects/duits.webp'],['Geschiedenis','geschiedenis','#8a6238','assets/subjects/geschiedenis.webp'],
  ['Grieks','grieks','#5168b6','assets/subjects/grieks.webp'],['Latijn','latijn','#8a4f77','assets/subjects/latijn.webp'],['Nederlands','nederlands','#d06b32','assets/subjects/nederlands.webp'],
  ['Natuurkunde','natuurkunde','#316f9e','assets/subjects/natuurkunde.webp'],['Scheikunde','scheikunde','#6a55a5','assets/subjects/scheikunde.webp'],
  ['Aardrijkskunde','aardrijkskunde','#477b42','assets/subjects/aardrijkskunde.webp'],['Economie','economie','#397e78','assets/subjects/economie.webp'],
  ['Engels','engels','#9b4452','assets/subjects/engels.webp'],['Frans','frans','#3c5f9b','assets/subjects/frans.webp'],['Overig','overig','#62636a','assets/subjects/overig.webp']
  ,['Wiskunde','wiskunde','#2467a8','assets/subjects/placeholder.svg']
].map(([name,slug,color,image])=>({name,slug,color,image}));
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

let pageNavigationReady=false;
let pageTransitionTimer=null;
const PAGE_NAV_POSITION={home:0,library:1,vakken:2,subject:2.5,zoeken:3};

function clearPageTransition(activePage=null){
  clearTimeout(pageTransitionTimer);
  pageTransitionTimer=null;
  const scrollContainer=document.getElementById('page-scroll-container');
  document.querySelectorAll('.page').forEach(pageEl=>{
    pageEl.classList.remove('page-mobile-in','page-mobile-out','page-mobile-reverse','page-mobile-first','page-desktop-in');
    pageEl.style.removeProperty('--page-transition-top');
    pageEl.style.removeProperty('--page-out-offset');
    pageEl.classList.toggle('active',pageEl===activePage);
  });
  if(scrollContainer)scrollContainer.style.removeProperty('min-height');
}

function renderPageContent(page){
  if (page === 'library') renderLibrary();
  else if (page === 'vakken') renderVakken();
  else if (page === 'subject') renderSubjectDetail();
  else if (page === 'home') renderHome();
  else if (page === 'zoeken') renderRecentSearchesList();
}

function showPage(page) {
  if (!['home', 'library', 'vakken', 'zoeken', 'subject'].includes(page)) page = 'home';
  const targetPage=document.getElementById(page);
  if(!targetPage)return;
  const previousPage=document.getElementById(currentPage)||document.querySelector('.page.active');
  const isFirstPage=!pageNavigationReady;
  const isMobile=window.matchMedia('(max-width:750px)').matches;
  const reduceMotion=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const isSamePage=previousPage===targetPage;
  const reverseDirection=(PAGE_NAV_POSITION[page]??0)<(PAGE_NAV_POSITION[previousPage?.id]??0);

  if(pageTransitionTimer)clearPageTransition(previousPage);
  if(isMobile&&!isSamePage&&document.activeElement instanceof HTMLElement)document.activeElement.blur();
  currentPage = page;
  const pageTitles={home:'Dashboard',library:'Bestanden',vakken:'Vakken',zoeken:'Zoeken',subject:currentSubject||'Vak'};
  document.title=`${pageTitles[page]||'Dashboard'} | Velios+`;
  renderPageContent(page);

  document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
  const sidebarPage=page==='subject'?'vakken':page;
  const sidebarBtns = document.querySelectorAll('.sidebar-btn');
  sidebarBtns.forEach(b => {
    const onclick = b.getAttribute('onclick') || '';
    if (onclick.includes("'"+sidebarPage+"'")) b.classList.add('active');
  });
  updateRecentSidebar();
  const nextHash=page==='subject'
    ? `#subject/${encodeURIComponent(getSubjectConfig(currentSubject).slug)}`
    : `#${page}`;
  if (window.location.hash !== nextHash) {
    window.history.replaceState(window.history.state, '', nextHash);
  }

  if(reduceMotion){
    clearPageTransition(targetPage);
    if(page==='subject'&&!isFirstPage)resetPageScroll();
    pageNavigationReady=true;
    return;
  }

  if(isFirstPage){
    clearPageTransition(targetPage);
    if(isMobile&&page==='home'){
      targetPage.classList.add('page-mobile-first');
      pageTransitionTimer=setTimeout(()=>{
        targetPage.classList.remove('page-mobile-first');
        pageTransitionTimer=null;
      },320);
    }else if(!isMobile){
      targetPage.classList.add('page-desktop-in');
      pageTransitionTimer=setTimeout(()=>{
        targetPage.classList.remove('page-desktop-in');
        pageTransitionTimer=null;
      },400);
    }
    pageNavigationReady=true;
    return;
  }

  if(isSamePage){
    clearPageTransition(targetPage);
    pageNavigationReady=true;
    return;
  }

  if(!isMobile){
    clearPageTransition(targetPage);
    resetPageScroll();
    targetPage.classList.add('page-desktop-in');
    pageTransitionTimer=setTimeout(()=>{
      targetPage.classList.remove('page-desktop-in');
      pageTransitionTimer=null;
    },400);
    return;
  }

  const scrollContainer=document.getElementById('page-scroll-container');
  const previousScrollTop=Math.max(
    scrollContainer?.scrollTop||0,
    window.scrollY||0,
    document.documentElement.scrollTop||0,
    document.body.scrollTop||0
  );
  targetPage.classList.add('active');
  previousPage?.style.setProperty('--page-out-offset',`${-previousScrollTop}px`);
  previousPage?.classList.add('page-mobile-out');
  targetPage.classList.add('page-mobile-in');
  if(reverseDirection){
    previousPage?.classList.add('page-mobile-reverse');
    targetPage.classList.add('page-mobile-reverse');
  }
  pageTransitionTimer=setTimeout(()=>{
    clearPageTransition(targetPage);
    resetPageScroll();
  },410);
}

function resetPageScroll(){
  const scrollContainer=document.getElementById('page-scroll-container');
  const scrollToTop=()=>{
    if(scrollContainer)scrollContainer.scrollTop=0;
    document.documentElement.scrollTop=0;
    document.body.scrollTop=0;
    window.scrollTo(0,0);
  };
  scrollToTop();
  requestAnimationFrame(scrollToTop);
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
  const opts = {weekday:'long', month:'long', day:'numeric'};
  document.getElementById('today-date').textContent = today.toLocaleDateString('nl-NL', opts);
  document.getElementById('week-number').textContent = `Week ${getWeekNumber(today)}`;
  updateDashboardWelcome(today);

  renderRecentSidebar();

  const isOffline = !navigator.onLine;
  updateConnectionState();

  // Secties
  const onlineSections = ['section-recent','section-recommended','section-newest'];
  onlineSections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = isOffline ? 'none' : '';
  });

  // De globale verbindingsbalk houdt de melding op iedere pagina zichtbaar.
  // De navigatie en lokale zoekfunctie blijven ook offline beschikbaar.
  document.getElementById('section-no-connection').style.display = 'none';

  if (!isOffline) {
    const recentKey = 'sd_recent_sets';
    let recent = [];
    try { recent = JSON.parse(localStorage.getItem(recentKey) || '[]'); } catch(e) {}
    recent = recent.filter(id => DB.sets.find(s => s.id === id)).slice(0, 3);
    const recentSets = recent.map(id => DB.sets.find(s => s.id === id)).filter(Boolean);
    if (recentSets.length) {
      document.getElementById('section-recent').style.display = 'block';
      renderSetGrid('recent-grid', recentSets);
    } else document.getElementById('section-recent').style.display = 'none';
    const recommended = DB.sets.filter(s => s.vak).sort(() => Math.random() - 0.5).slice(0, 3);
    if (recommended.length) renderSetGrid('recommended-grid', recommended);
    const newest = DB.sets.filter(s => s.fromServer).sort((a, b) => (b.id || '').localeCompare(a.id || '')).slice(0, 3);
    const newestSect = document.getElementById('section-newest');
    if (newest.length) { newestSect.style.display = 'block'; renderSetGrid('newest-grid', newest); }
    else { newestSect.style.display = 'none'; }
  }

  // Mijn sets (altijd zichtbaar)
  const mySets = DB.sets.filter(isMySet);
  const mySect = document.getElementById('section-my-sets');
  if (mySets.length) { mySect.style.display = 'block'; renderSetGrid('my-sets-grid', mySets); }
  else { mySect.style.display = 'none'; }

  // Gedownloade sets (altijd zichtbaar, ook offline)
  const offlineIds = getOfflineSets().map(o => o.id || o.slug);
  const offlineSets = DB.sets.filter(s =>
    !s._cloud && (s._offlineSaved || offlineIds.includes(s.id) || offlineIds.includes(s.slug) || (!s.fromServer && !s._serverFile))
  );
  const offlineSect = document.getElementById('section-offline');
  if (offlineSect) {
    if (offlineSets.length) { offlineSect.style.display = 'block'; renderSetGrid('offline-grid', offlineSets); }
    else { offlineSect.style.display = 'none'; }
  }
}

function updateConnectionState(){
  const offline=!navigator.onLine;
  const notice=document.getElementById('offline-page-notice');
  if(notice)notice.hidden=!offline;
  document.body.classList.toggle('is-offline',offline);
  return offline;
}

function showConnectionDialog(){
  if(document.getElementById('connection-dialog'))return;
  const dialog=document.createElement('div');
  dialog.id='connection-dialog';
  dialog.className='connection-dialog-backdrop';
  dialog.innerHTML=`
    <div class="connection-dialog" role="dialog" aria-modal="true" aria-labelledby="connection-dialog-title">
      <span class="connection-dialog-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M2 8.8a15.7 15.7 0 0 1 3.1-2.1M8.5 5.3A15.4 15.4 0 0 1 22 8.8M5 12.4a10.8 10.8 0 0 1 3.1-1.8m3.9-.7a10.8 10.8 0 0 1 7 2.5M8.6 16a5.3 5.3 0 0 1 6.8 0M12 20h.01M3 3l18 18"/></svg></span>
      <h3 id="connection-dialog-title">Geen verbinding</h3>
      <p>Hiervoor heb je internet nodig. Controleer je verbinding en probeer het daarna opnieuw.</p>
      <button class="btn btn-primary" onclick="closeConnectionDialog()">Begrepen</button>
    </div>`;
  dialog.addEventListener('click',event=>{if(event.target===dialog)closeConnectionDialog();});
  document.body.appendChild(dialog);
}

function closeConnectionDialog(){
  const dialog=document.getElementById('connection-dialog');
  if(!dialog)return;
  dialog.classList.add('closing');
  setTimeout(()=>dialog.remove(),220);
}

function openOnlineAccountPage(path){
  if(!navigator.onLine){showConnectionDialog();return false;}
  window.location.href=path;
  return false;
}

function updateDashboardWelcome(now=new Date()){
  const greeting=document.getElementById('dashboard-greeting-copy');
  const comma=document.getElementById('dashboard-comma');
  const nameEl=document.getElementById('dashboard-name');
  const message=document.getElementById('dashboard-message');
  if(!greeting||!nameEl||!message)return;

  const displayName=String(_currentProfile?.display_name||_currentProfile?.username||'').trim().split(/\s+/)[0];
  const hour=now.getHours();
  const welcome=hour<12
    ? ['Goedemorgen','Klaar voor een frisse start?']
    : hour<18
      ? ['Welkom terug','Klaar om verder te gaan?']
      : ['Goedenavond','Nog even blokken voor de toets van binnenkort?'];

  greeting.textContent=welcome[0];
  if(comma)comma.textContent=displayName?', ':'';
  nameEl.textContent=displayName?displayName:'';
  message.textContent=welcome[1];
}

function isUserSet(set){
  return !set.fromServer&&!set._serverFile&&!set._cloud;
}

function isSyncedSet(set){
  return !!(set._cloud||set._synced||set._cloudSetId);
}

function findSetByCloudId(cloudSetId){
  const wanted=String(cloudSetId||'');
  if(!wanted)return null;
  return DB.sets.find(set=>getCloudSetId(set)===wanted)||null;
}

function isMySet(set){
  return isUserSet(set)||isSyncedSet(set);
}

function renderSetGrid(elementId, sets, options={}) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (!sets.length) {
    el.innerHTML = '<div class="empty-state">Geen sets gevonden met deze instellingen.</div>';
    return;
  }
  const playIcon='<img src="assets/icons/icon_play.svg" alt="">';
  const editIcon='<img src="assets/icons/icon_edit.svg" alt="">';
  const deleteIcon='<img src="assets/icons/icon_delete.svg" alt="">';
  el.innerHTML = sets.map(s => {
    const selected=librarySelected.has(s.id);
    const local=isUserSet(s);
    const synced=isSyncedSet(s);
    const selectable=!!options.selectable&&local;
    return `<div class="set-card${selected?' selected':''}${selectable?' selection-mode':''}" onclick="${selectable?`toggleLibrarySelection('${s.id}')`:`openSet('${s.id}')`}">
      ${selectable?`<button class="set-select-btn" onclick="event.stopPropagation();toggleLibrarySelection('${s.id}')" aria-label="Selecteer ${esc(s.title)}" aria-pressed="${selected}">${selected?'<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>':''}</button>`:''}
      <div class="set-card-title">${esc(s.title)}</div>
      <div class="set-card-desc">${esc(s.description||'')}</div>
      <div class="set-card-meta">
        <span class="badge badge-purple">${s.terms.length} begrippen</span>
        ${s.vak?`<span class="badge badge-orange">${esc(s.vak)}</span>`:''}
        ${synced?'<span class="badge badge-cloud" title="Gesynchroniseerd" aria-label="Gesynchroniseerd"><span class="badge-cloud-icon" aria-hidden="true"></span></span>':''}
        ${formatSetDate(s.datum)?`<span class="set-card-date">${formatSetDate(s.datum)}</span>`:''}
      </div>
      <div class="set-card-actions" onclick="event.stopPropagation()">
        <button class="btn btn-sm set-icon-btn" onclick="openSet('${s.id}')" aria-label="Openen">${playIcon}</button>
        ${local||synced?`<button class="btn btn-sm set-icon-btn" onclick="showCreateModal('${s.id}')" aria-label="Bewerken">${editIcon}</button>`:''}
        ${local||synced?`<button class="btn btn-sm set-icon-btn set-delete-btn" onclick="confirmDelete('${s.id}')" aria-label="Verwijderen">${deleteIcon}</button>`:''}
      </div>
    </div>`;
  }).join('');
}

function renderLibrary() {
  let sets = DB.sets.filter(set=>libraryMineOnly?isMySet(set):!isUserSet(set));
  const recentIds=new Set(getOpenedSetIds());
  if(libraryFilters.size==='small')sets=sets.filter(set=>(set.terms?.length||0)<=20);
  if(libraryFilters.size==='medium')sets=sets.filter(set=>(set.terms?.length||0)>20&&(set.terms?.length||0)<=50);
  if(libraryFilters.size==='large')sets=sets.filter(set=>(set.terms?.length||0)>50);
  if(libraryFilters.opened==='opened')sets=sets.filter(set=>recentIds.has(set.id));
  if(libraryFilters.opened==='unopened')sets=sets.filter(set=>!recentIds.has(set.id));
  if(libraryFilters.images==='with')sets=sets.filter(set=>setHasImages(set));
  if(libraryFilters.images==='without')sets=sets.filter(set=>!setHasImages(set));
  if(libraryFilters.sync==='synced')sets=sets.filter(isSyncedSet);
  if(libraryFilters.sync==='not-synced')sets=sets.filter(set=>!isSyncedSet(set));
  if (searchQuery) {
    sets = sets.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.vak && s.vak.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }
  const canSortRecent=sets.some(set=>recentIds.has(set.id));
  if(librarySort==='recent'&&!canSortRecent)librarySort='date';
  renderLibraryMenus(canSortRecent);
  sortSets(sets,librarySort);
  const summary=document.getElementById('library-summary');
  if(summary)summary.textContent=libraryMineOnly
    ? `${sets.length} eigen ${sets.length===1?'set':'sets'}`
    : `${sets.length} beschikbare ${sets.length===1?'set':'sets'}`;
  document.getElementById('library-mine-btn')?.classList.toggle('active',libraryMineOnly);
  renderSetGrid('library-list',sets,{selectable:libraryMineOnly&&librarySelectionMode});
  renderLibrarySelectionControls();
}

function renderVakken() {
  const el = document.getElementById('vakken-grid');
  if(!el)return;
  const visible=new Set(window.VeliosSchool?VeliosSchool.visibleSubjects(VeliosSchool.fromProfile(_currentProfile)):SUBJECTS.map(subject=>subject.name));
  el.innerHTML = SUBJECTS.filter(subject=>visible.has(subject.name)).map(subject => {
    const count = DB.sets.filter(set => !isMySet(set)&&normalizeSubject(set.vak)===subject.name).length;
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
  const sets=DB.sets.filter(set=>!isMySet(set)&&normalizeSubject(set.vak)===subject.name);
  const recentIds=new Set(getRecentSetIds());
  const canSortRecent=sets.some(set=>recentIds.has(set.id));
  if(subjectSort==='recent'&&!canSortRecent)subjectSort='date';
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
  renderSortMenu('subject-sort-menu','subject-sort-btn',subjectSort,'setSubjectSort',canSortRecent);
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
  if(sort==='recent'){
    const order=new Map(getRecentSetIds().map((id,index)=>[id,index]));
    sets.sort((a,b)=>(order.get(a.id)??Number.MAX_SAFE_INTEGER)-(order.get(b.id)??Number.MAX_SAFE_INTEGER)||byTitle(a,b));
  }else if(sort==='alpha')sets.sort(byTitle);
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
  ['recent','Recent geopend'],['date','Datum'],['alpha','Alfabet'],['subject','Vak'],['size','Grootte']
];

function renderLibraryMenus(canSortRecent=false){
  const filterMenu=document.getElementById('library-filter-menu');
  const activeCount=Object.values(libraryFilters).filter(value=>value!=='all').length;
  if(filterMenu){
    const group=(title,key,options)=>`
      <div class="filter-group">
        <div class="filter-group-title">${title}</div>
        ${options.map(([value,label])=>`<button class="menu-option${libraryFilters[key]===value?' active':''}" onclick="event.stopPropagation();setLibraryFilter('${key}','${value}')"><span>${label}</span><i></i></button>`).join('')}
      </div>`;
    filterMenu.innerHTML=`
      <div class="filter-mobile-header">
        <h2>Filters</h2>
        <button class="filter-close-btn" onclick="closeLibraryMenus()" aria-label="Filters sluiten">
          <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>
      </div>
      <button class="filter-reset-btn" onclick="event.stopPropagation();resetLibraryFilters()" ${activeCount?'':'disabled'}>
        <img src="assets/icons/icon_delete.svg" alt="">
        Filters verwijderen
      </button>
      <div class="filter-groups">
        ${group('Grootte','size',[['small','Tot 20 begrippen'],['medium','21–50 begrippen'],['large','Meer dan 50']])}
        ${group('Gebruik','opened',[['opened','Al geopend'],['unopened','Nog niet geopend']])}
        ${group('Afbeeldingen','images',[['with','Bevat afbeeldingen'],['without','Zonder afbeeldingen']])}
        ${group('Synchronisatie','sync',[['synced','Gesynchroniseerd'],['not-synced','Niet gesynchroniseerd']])}
      </div>`;
  }
  renderSortMenu('library-sort-menu','library-sort-btn',librarySort,'setLibrarySort',canSortRecent);
  const count=document.getElementById('library-filter-count');
  if(count){
    count.textContent=activeCount;
    count.classList.toggle('show',activeCount>0);
  }
}

function renderSortMenu(menuId,buttonId,value,handler,canSortRecent=false){
  const menu=document.getElementById(menuId);
  const button=document.getElementById(buttonId);
  const availableOptions=canSortRecent?SORT_OPTIONS:SORT_OPTIONS.filter(option=>option[0]!=='recent');
  if(!availableOptions.some(option=>option[0]===value))value='date';
  const selected=availableOptions.find(option=>option[0]===value)||availableOptions[0];
  if(button){
    const svg=button.querySelector('svg')?.outerHTML||'';
    button.innerHTML=`Sorteren op: ${selected[1].toLowerCase()}${svg}`;
  }
  if(menu)menu.innerHTML=availableOptions.map(([sort,label])=>
    `<button class="menu-option${sort===value?' active':''}" onclick="${handler}('${sort}')"><span>${label}</span><i></i></button>`
  ).join('');
}

function toggleLibraryMenu(id,event){
  event?.stopPropagation();
  const target=document.getElementById(id);
  if(!target)return;
  if(target.classList.contains('open')){
    closeLibraryMenu(target);
    return;
  }
  document.querySelectorAll('.toolbar-menu.open').forEach(menu=>{if(menu!==target)closeLibraryMenu(menu);});
  clearTimeout(target._closeTimer);
  target.classList.remove('closing');
  const button=target.closest('.toolbar-dropdown')?.querySelector('.toolbar-btn')||target._button;
  target._button=button;
  if(target.parentElement!==document.body){
    target._home=target.parentElement;
    document.body.appendChild(target);
  }
  target.classList.add('open');
  button?.setAttribute('aria-expanded','true');
  positionLibraryMenu(target);
  if(isFullscreenFilterMenu(target)){
    document.documentElement.classList.add('filter-menu-open');
    document.body.classList.add('filter-menu-open');
  }
}

function closeLibraryMenus(){
  document.querySelectorAll('.toolbar-menu.open').forEach(closeLibraryMenu);
}

function closeLibraryMenu(menu){
  if(!menu?.classList.contains('open'))return;
  menu.classList.remove('open');
  menu.classList.add('closing');
  menu._button?.setAttribute('aria-expanded','false');
  clearTimeout(menu._closeTimer);
  menu._closeTimer=setTimeout(()=>{
    menu.classList.remove('closing');
    restoreLibraryMenu(menu);
    if(!document.querySelector('.filter-menu.open')){
      document.documentElement.classList.remove('filter-menu-open');
      document.body.classList.remove('filter-menu-open');
    }
  },190);
}

function restoreLibraryMenu(menu){
  if(menu?._home&&menu.parentElement!==menu._home)menu._home.appendChild(menu);
}

function isFullscreenFilterMenu(menu){
  return menu?.id==='library-filter-menu'&&window.matchMedia('(max-width:750px)').matches;
}

function positionLibraryMenu(menu){
  if(!menu||isFullscreenFilterMenu(menu)){
    menu?.style.removeProperty('left');
    menu?.style.removeProperty('right');
    menu?.style.removeProperty('top');
    return;
  }
  const anchor=menu._button||menu.closest('.toolbar-dropdown')?.querySelector('.toolbar-btn');
  if(!anchor)return;
  const rect=anchor.getBoundingClientRect();
  if(window.matchMedia('(max-width:750px)').matches&&!menu.classList.contains('filter-menu'))menu.style.width=`${Math.round(rect.width)}px`;
  else menu.style.removeProperty('width');
  const menuWidth=menu.offsetWidth||(menu.classList.contains('filter-menu')?310:230);
  const margin=12;
  const left=Math.max(margin,Math.min(rect.left,window.innerWidth-menuWidth-margin));
  menu.style.left=`${Math.round(left)}px`;
  menu.style.right='auto';
  menu.style.top=`${Math.round(rect.bottom+6)}px`;
}

function positionOpenLibraryMenus(){
  document.querySelectorAll('.toolbar-menu.open').forEach(menu=>{
    positionLibraryMenu(menu);
    if(isFullscreenFilterMenu(menu)){
      document.documentElement.classList.add('filter-menu-open');
      document.body.classList.add('filter-menu-open');
    }
  });
  if(!document.querySelector('.filter-menu.open')||!window.matchMedia('(max-width:750px)').matches){
    document.documentElement.classList.remove('filter-menu-open');
    document.body.classList.remove('filter-menu-open');
  }
}

function setLibraryFilter(key,value){
  libraryFilters[key]=libraryFilters[key]===value?'all':value;
  renderLibrary();
}

function resetLibraryFilters(){
  libraryFilters={size:'all',opened:'all',images:'all',sync:'all'};
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
  librarySelectionMode=false;
  librarySelected.clear();
  renderLibrary();
}

function toggleLibrarySelectionMode(){
  if(!libraryMineOnly)return;
  librarySelectionMode=!librarySelectionMode;
  librarySelected.clear();
  renderLibrary();
}

function toggleLibrarySelection(id){
  if(librarySelected.has(id))librarySelected.delete(id);
  else librarySelected.add(id);
  renderLibrary();
}

function renderLibrarySelectionControls(){
  const controls=document.getElementById('library-selection-controls');
  if(!controls)return;
  if(!libraryMineOnly){
    controls.innerHTML='';
    controls.classList.remove('show');
    return;
  }
  const count=librarySelected.size;
  controls.classList.add('show');
  controls.innerHTML=`
    <button class="library-bulk-btn" onclick="duplicateLibrarySelection()" ${librarySelectionMode&&count>=1?'':'disabled'} title="Dupliceren" aria-label="Geselecteerde sets dupliceren">
      <img src="assets/icons/icon_duplicate.svg" alt="">
    </button>
    <button class="library-bulk-btn" onclick="showLibraryCombineModal()" ${librarySelectionMode&&count>=2?'':'disabled'} title="Combineren" aria-label="Geselecteerde sets combineren">
      <img src="assets/icons/icon_combine.svg" alt="">
    </button>
    <button class="library-bulk-btn library-bulk-delete" onclick="confirmDeleteLibrarySelection()" ${librarySelectionMode&&count>=1?'':'disabled'} title="Verwijderen" aria-label="Geselecteerde sets verwijderen">
      <img src="assets/icons/icon_delete.svg" alt="">
    </button>
    <button class="toolbar-btn library-select-mode-btn${librarySelectionMode?' active':''}" onclick="toggleLibrarySelectionMode()">
      ${librarySelectionMode?`Niet meer selecteren${count?` (${count})`:''}`:'Selecteren'}
    </button>`;
}

function duplicateLibrarySelection(){
  const sources=[...librarySelected].map(id=>DB.sets.find(set=>set.id===id)).filter(set=>set&&isUserSet(set));
  if(!sources.length)return;
  const stamp=Date.now();
  const copies=sources.map((source,index)=>{
    const copy=JSON.parse(JSON.stringify(source));
    copy.id=`set_copy_${stamp}_${index}`;
    copy.title=`${source.title} – kopie`;
    copy.slug=`${toSlug(copy.title)}-${stamp.toString().slice(-5)}-${index}`;
    copy.datum=new Date().toISOString().slice(0,10);
    delete copy.fromServer;
    delete copy._serverFile;
    delete copy._lastSync;
    return copy;
  });
  DB.sets.unshift(...copies);
  librarySelected.clear();
  librarySelectionMode=false;
  saveDB();
  renderLibrary();
  showToast(copies.length===1?'Set gedupliceerd':`${copies.length} sets gedupliceerd`);
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
  librarySelectionMode=false;
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
  if(!event.target.closest('.toolbar-dropdown,.toolbar-menu'))closeLibraryMenus();
  if(!event.target.closest('.subject-picker-popover')&&!event.target.closest('.subject-picker-btn'))closeSubjectPicker();
});
window.addEventListener('resize',positionOpenLibraryMenus);
window.addEventListener('scroll',positionOpenLibraryMenus,true);
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeLibraryMenus();});



function openSet(id){
  const s=DB.sets.find(x=>x.id===id);if(!s)return;
  const slug=s.slug||toSlug(s.title);s.slug=slug;saveDB();
  const recentKey='sd_recent_sets';
  let recent=[];try{recent=JSON.parse(localStorage.getItem(recentKey)||'[]');}catch(e){}
  recent=recent.filter(r=>r!==id);recent.unshift(id);recent=recent.slice(0,10);
  localStorage.setItem(recentKey,JSON.stringify(recent));
  let opened=[];try{opened=JSON.parse(localStorage.getItem('sd_opened_sets')||'[]');}catch(e){}
  if(!opened.includes(id)){opened.push(id);localStorage.setItem('sd_opened_sets',JSON.stringify(opened));}
  const cloudSetId=getCloudSetId(s);
  window.location.href=`set.html?set=${encodeURIComponent(slug)}${cloudSetId?`&cloud=${encodeURIComponent(cloudSetId)}`:''}`;
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

let resetAllInProgress=false;

async function deleteVeliosIndexedDbData(){
  if(!window.indexedDB||typeof indexedDB.databases!=='function')return;
  try{
    const databases=await indexedDB.databases();
    await Promise.all(databases.filter(db=>db.name).map(db=>new Promise(resolve=>{
      const request=indexedDB.deleteDatabase(db.name);
      request.onsuccess=request.onerror=request.onblocked=()=>resolve();
    })));
  }catch(e){console.warn('IndexedDB kon niet volledig worden gewist:',e.message);}
}

async function resetAllMobileData(){
  if(resetAllInProgress)return;
  resetAllInProgress=true;
  const input=document.getElementById('mobile-search-box');
  const results=document.getElementById('mobile-search-results');
  if(input){input.disabled=true;input.value='';input.placeholder='Alle gegevens worden verwijderd…';}
  if(results)results.innerHTML='<div style="text-align:center;padding:40px;color:var(--text2);font-weight:700">Velios wordt volledig gereset…</div>';

  try{
    if(window.VeliosAuth)await Promise.race([
      VeliosAuth.signOut(),
      new Promise(resolve=>setTimeout(resolve,2000))
    ]);
  }catch(e){console.warn('Online uitloggen is niet gelukt; de lokale sessie wordt wel verwijderd.',e.message);}

  try{
    if('caches' in window){
      const cacheNames=await caches.keys();
      await Promise.all(cacheNames.map(name=>caches.delete(name)));
    }
  }catch(e){console.warn('Cache kon niet volledig worden gewist:',e.message);}

  await Promise.race([
    deleteVeliosIndexedDbData(),
    new Promise(resolve=>setTimeout(resolve,1500))
  ]);
  try{sessionStorage.clear();}catch(e){}
  try{localStorage.clear();}catch(e){}
  window.location.replace('login.html');
}

function setupMobileSearch() {
  const searchBox = document.getElementById('mobile-search-box');
  if (!searchBox) return;
  let searchTimeout;
  searchBox.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const rawQuery=e.target.value.trim();
    if(rawQuery.toUpperCase()==='RESETALL123456789'){
      resetAllMobileData();
      return;
    }
    const query = rawQuery.toLowerCase();
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
    <div class="pair-row" id="pr-${i}" data-pair-index="${i}">
      <span class="pair-num" aria-label="Begrip ${i+1}">${i+1}</span>

      <!-- TERM column -->
      <div class="pair-col" data-label="Begrip / term">
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
      <div class="pair-col" data-label="Definitie">
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

      <button class="pair-del" type="button" onclick="ceRemove(${i})" aria-label="Begrip verwijderen"><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5"/></svg></button>
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
      <button class="img-upload-btn" data-upload="${edId}" style="margin-left:auto"><svg viewBox="0 0 24 24" aria-hidden="true" style="width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;vertical-align:-3px;margin-right:4px"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m4 18 5-5 3 3 2-2 6 5"/></svg>Afb.</button>
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
        klas: draft.klas || '',
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
      <div class="input-group"><label>Datum toetsafname</label><input id="c-datum" type="date" value="${esc(formatSetDate(s?.datum))}" oninput="ceSaveDraft()"></div>
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

  /* De nieuwe editor gebruikt dezelfde invoer- en opslaglogica, met een
     rustigere schaalbare lay-out voor desktop, tablet en telefoon. */
  showModal(buildCreateEditorMarkup(s,id,editorSubject));
  document.getElementById('modal-bg')?.classList.add('create-modal-bg');
  document.getElementById('modal-panel')?.classList.add('create-modal-panel');
  setupCreateModalSwipe();

  ceRenderPairs();
}

function buildCreateEditorMarkup(s,id,editorSubject){
  const inferredClass=window.VeliosSchool?VeliosSchool.setClass(s):'';
  const preferredClass=window.VeliosSchool?VeliosSchool.fromProfile(_currentProfile).schoolClass:'';
  const editorClass=inferredClass||preferredClass||'';
  const classOptions=['1','2','3','4','5','6','overig'].map(value=>({value,label:value==='overig'?'Overig':`Klas ${value}`}));
  const visibleSubjects=new Set(window.VeliosSchool
    ? VeliosSchool.visibleSubjects(VeliosSchool.fromProfile(_currentProfile))
    : SUBJECTS.map(subject=>subject.name));
  const subjectOptions=SUBJECTS
    .filter(subject=>visibleSubjects.has(subject.name)||subject.name===editorSubject)
    .map(subject=>({value:subject.name,label:subject.name}));
  if(!subjectOptions.some(subject=>subject.value===editorSubject))subjectOptions.push({value:editorSubject,label:editorSubject});
  return `<div class="create-editor-shell">
    <div class="create-editor-drag-zone" aria-hidden="true"><span></span></div>
    <header class="create-editor-header">
      <div class="create-editor-heading"><h2>${id?'Set bewerken':'Nieuwe set'}</h2></div>
      <div class="create-editor-header-actions"><button class="modal-header-btn create-editor-icon-btn create-editor-expand" type="button" onclick="toggleMaximize()" aria-label="Volledig scherm"><img src="assets/icons/icon_maximize.svg" alt=""></button><button class="create-editor-icon-btn" type="button" onclick="closeModal()" aria-label="Sluiten"><svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
    </header>
    <div class="create-editor-scroll modal-content">
      <section class="create-editor-card create-editor-details">
        <div class="create-editor-section-title"><div><span>Setgegevens</span><p>Deze informatie verschijnt op de setkaart.</p></div></div>
        <div class="create-editor-grid">
          <div class="input-group create-title-field"><label for="c-title">Titel <span>*</span></label><input id="c-title" type="text" placeholder="Bijv. Biologie H3" value="${esc(s?.title||'')}" oninput="ceSaveDraft()"></div>
          <div class="input-group"><label>Vak</label>${VeliosSelect.markup({id:'c-vak',value:editorSubject,placeholder:'Selecteer een vak',options:subjectOptions,onChange:'selectEditorSubject',ariaLabel:'Vak'})}</div>
          <div class="input-group"><label id="c-klas-label">Klas <span>*</span></label>${VeliosSelect.markup({id:'c-klas',value:editorClass,placeholder:'Selecteer je klas',options:classOptions,onChange:'ceSaveDraft',ariaLabel:'Klas'})}</div>
          <div class="input-group create-desc-field"><label for="c-desc">Omschrijving</label><textarea id="c-desc" placeholder="Waar gaat deze set over?" oninput="ceSaveDraft()">${esc(s?.description||'')}</textarea></div>
          <div class="input-group"><label for="c-datum">Datum toetsafname</label><input id="c-datum" type="date" value="${esc(formatSetDate(s?.datum))}" oninput="ceSaveDraft()"></div>
        </div>
      </section>
      <section class="create-editor-card create-editor-terms">
        <div class="create-editor-section-title"><div><span>Begrippen</span><p>Voeg minimaal één begrip en definitie toe.</p></div><button class="btn btn-glass btn-sm" type="button" onclick="ceAdd()"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Toevoegen</button></div>
        <div class="create-editor-columns" aria-hidden="true"><span></span><span>Begrip / term</span><span>Definitie</span><span></span></div>
        <div id="ce-pairs"></div>
        <button class="btn btn-glass btn-add-term" type="button" onclick="ceAdd()"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Begrip toevoegen</button>
      </section>
    </div>
    <footer class="create-editor-footer modal-footer"><button class="btn create-editor-clear" type="button" onclick="ceClearDraft()">Concept verwijderen</button><div class="create-editor-save-actions"><button class="btn btn-primary" type="button" onclick="ceSave()"><svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>${id?'Opslaan':'Set aanmaken'}</button></div></footer>
  </div>`;
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
  const visible=new Set(window.VeliosSchool?VeliosSchool.visibleSubjects(VeliosSchool.fromProfile(_currentProfile)):SUBJECTS.map(subject=>subject.name));
  popover.innerHTML=SUBJECTS.filter(subject=>visible.has(subject.name)).map(subject=>`
    <button type="button" class="${subject.name===current?'active':''}" onclick="selectEditorSubject('${subject.slug}')">
      <span>${esc(subject.name)}</span>
      ${subject.name===current?'<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>':''}
    </button>`).join('');
  document.body.appendChild(popover);
}

function closeSubjectPicker(){
  document.querySelector('.subject-picker-popover')?.remove();
}

function selectEditorSubject(value){
  const subject=getSubjectConfig(value);
  VeliosSelect.setValue('c-vak',subject.name,subject.name);
  const legacyLabel=document.getElementById('c-vak-label');
  if(legacyLabel)legacyLabel.textContent=subject.name;
  closeSubjectPicker();
  ceSaveDraft();
}

function toggleMaximize() {
  if (window.innerWidth <= 750) return;
  CE.viewMode = CE.viewMode === 2 ? 0 : 2;
  const bg = document.getElementById('modal-bg');
  const panel = document.getElementById('modal-panel');
  const btn = document.querySelector('.modal-header-btn,.create-editor-expand');

  bg.classList.remove('modal-maximized', 'modal-fullscreen');
  if(CE.viewMode===2){
    bg.classList.add('modal-fullscreen');
    panel.style.setProperty('width','100%','important');panel.style.setProperty('max-width','none','important');panel.style.setProperty('height','100dvh','important');panel.style.setProperty('max-height','none','important');panel.style.setProperty('border-radius','0','important');
  }else{
    ['width','max-width','height','max-height','border-radius'].forEach(prop=>panel.style.removeProperty(prop));
  }
  if(btn){btn.innerHTML=`<img src="assets/icons/${CE.viewMode===2?'icon_minimize.svg':'icon_maximize.svg'}" alt="">`;btn.setAttribute('aria-label',CE.viewMode===2?'Volledig scherm verlaten':'Volledig scherm');}
  return;

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
    klas: document.getElementById('c-klas')?.value || '',
    pairs: CE.pairs
  };
  localStorage.setItem('sd_draft', JSON.stringify(draft));
}

function ceClearDraft() {
  if (!confirm('Weet je zeker dat je alle velden wilt leegmaken?')) return;
  localStorage.removeItem('sd_draft');
  CE.pairs = [{ term:'', def:'' }, { term:'', def:'' }];
  document.getElementById('c-title').value = '';
  VeliosSelect.setValue('c-vak','Overig','Overig');
  const legacyLabel=document.getElementById('c-vak-label');
  if(legacyLabel)legacyLabel.textContent='Overig';
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

async function ceSave() {
  const title = document.getElementById('c-title').value.trim();
  if (!title) { showToast('Vul een titel in'); return; }
  const schoolClass=document.getElementById('c-klas')?.value||'';
  if (!schoolClass) { showToast('Selecteer een klas'); document.getElementById('c-klas')?.closest('.velios-select')?.querySelector('.velios-select-trigger')?.focus(); return; }

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
    ...(existing || {}),
    id: CE.id || 'set_'+Date.now(),
    slug, title,
    description: document.getElementById('c-desc').value.trim(),
    vak: normalizeSubject(document.getElementById('c-vak').value),
    datum: document.getElementById('c-datum').value,
    klas: schoolClass,
    terms
  };

  const cloudSetId = getCloudSetId(existing);
  if (cloudSetId) {
    const saveButton = document.querySelector('#modal-panel .modal-footer .btn-primary');
    const originalButtonHtml = saveButton?.innerHTML;
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = 'Synchroniseren…';
    }
    try {
      const cloud = await VeliosAuth.updateSyncedSet(cloudSetId, set);
      set._cloudSetId = cloudSetId;
      set._syncedAt = new Date().toISOString();
      if (existing?._cloud) set._cloud = true;
      else set._synced = true;
      if (!set.datum) set.datum = getCloudSetDate(cloud, cloud.updated_at);
    } catch (error) {
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.innerHTML = originalButtonHtml;
      }
      showToast('Synchroniseren mislukt. Je wijzigingen zijn nog niet opgeslagen.');
      return;
    }
  }

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
  showToast(cloudSetId ? 'Set opgeslagen en gesynchroniseerd' : CE.id ? 'Set opgeslagen' : 'Set aangemaakt');
}

/* ══════════════════════════════════════════════════════
   DELETE
══════════════════════════════════════════════════════ */
function confirmDeleteLibrarySelection(){
  const selected=[...librarySelected].filter(id=>DB.sets.some(set=>set.id===id&&isUserSet(set)));
  if(!selected.length)return;
  const amount=selected.length;
  showModal(`
    <h3>${amount===1?'Set':'Sets'} verwijderen?</h3>
    <p style="color:var(--text2);margin-bottom:20px">${amount===1?'De geselecteerde set wordt':'De geselecteerde sets worden'} definitief verwijderd. Dit kan niet ongedaan worden gemaakt.</p>
    <div class="modal-footer">
      <button class="btn btn-glass" onclick="closeModal()">Annuleren</button>
      <button class="btn library-confirm-delete" onclick="deleteLibrarySelection()">Verwijderen</button>
    </div>
  `);
}

function deleteLibrarySelection(){
  const selected=new Set(librarySelected);
  if(!selected.size)return;
  DB.sets=DB.sets.filter(set=>!selected.has(set.id)||!isUserSet(set));
  const amount=selected.size;
  librarySelected.clear();
  librarySelectionMode=false;
  saveDB();
  closeModal();
  renderLibrary();
  showToast(amount===1?'Set verwijderd':`${amount} sets verwijderd`);
}

function confirmDelete(id) {
  const s = DB.sets.find(x => x.id === id);
  if (!s) return;
  if (s.fromServer) { showToast('Lokale sets kunnen niet verwijderd worden'); return; }
  if (isSyncedSet(s)) {
    showModal(`
      <h3>Gesynchroniseerde set verwijderen?</h3>
      <p style="color:var(--text2);margin-bottom:18px">Kies waar <strong>${esc(s.title)}</strong> verwijderd moet worden.</p>
      <div class="sync-delete-options">
        <button class="sync-delete-option" onclick="deleteSyncedSet('${s.id}',false,this)">
          <strong>Alleen van dit apparaat</strong>
          <span>De set blijft op je andere apparaten en in Supabase beschikbaar.</span>
        </button>
        <button class="sync-delete-option danger" onclick="deleteSyncedSet('${s.id}',true,this)">
          <strong>Van alle apparaten</strong>
          <span>De cloudversie en synchronisatie worden definitief verwijderd.</span>
        </button>
      </div>
      <div class="modal-footer">
        <button class="btn btn-glass" onclick="closeModal()">Annuleren</button>
      </div>
    `);
    return;
  }
  showModal(`
    <h3>Set verwijderen?</h3>
    <p style="color:var(--text2);margin-bottom:20px">Dit kan niet ongedaan worden gemaakt.</p>
    <div class="modal-footer">
      <button class="btn btn-glass" onclick="closeModal()">Annuleren</button>
      <button class="btn" style="background:var(--red);color:#fff;border:none;border-radius:var(--r3);padding:9px 18px;font-family:var(--font);font-weight:700;cursor:pointer" onclick="doDelete('${id}')">Verwijderen</button>
    </div>
  `);
}

async function deleteSyncedSet(id, everywhere, clickedButton) {
  const set = DB.sets.find(item => item.id === id);
  const cloudSetId = getCloudSetId(set);
  if (!set || !cloudSetId) return;
  document.querySelectorAll('.sync-delete-option').forEach(button => { button.disabled = true; });
  if (clickedButton) clickedButton.classList.add('loading');

  try {
    const hiddenIds = getHiddenCloudSetIds();
    if (everywhere) {
      await VeliosAuth.unsyncSet(cloudSetId);
      hiddenIds.delete(cloudSetId);
    } else {
      hiddenIds.add(cloudSetId);
    }
    saveHiddenCloudSetIds(hiddenIds);
    DB.sets = DB.sets.filter(item => item.id !== id && getCloudSetId(item) !== cloudSetId);
    librarySelected.delete(id);
    saveDB();
    closeModal();
    if (currentPage === 'library') renderLibrary();
    else if (currentPage === 'subject') renderSubjectDetail();
    else renderHome();
    showToast(everywhere ? 'Set van alle apparaten verwijderd' : 'Set van dit apparaat verwijderd');
  } catch (error) {
    document.querySelectorAll('.sync-delete-option').forEach(button => { button.disabled = false; });
    clickedButton?.classList.remove('loading');
    showToast('Verwijderen is niet gelukt. Probeer het opnieuw.');
  }
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
  const panel=document.getElementById('modal-panel');
  panel.classList.remove('create-modal-panel');
  panel.innerHTML = html;
  const bg = document.getElementById('modal-bg');
  bg.classList.remove('create-modal-bg');
  bg.classList.remove('hidden');
  bg.classList.remove('modal-maximized', 'modal-fullscreen');
  if (CE.viewMode === 1) {
    bg.classList.add('modal-maximized');
  } else if (CE.viewMode === 2) {
    bg.classList.add('modal-fullscreen');
  }
}
function setupCreateModalSwipe(){
  const bg=document.getElementById('modal-bg'),panel=document.getElementById('modal-panel');
  if(!bg||!panel)return;
  const content=panel.querySelector('.create-editor-shell');
  const markReady=()=>panel.classList.add('is-ready');
  panel.addEventListener('animationend',event=>{if(event.target===panel&&event.animationName==='accSheetIn')markReady();},{once:true});
  setTimeout(()=>{if(panel.isConnected)markReady();},450);
  let startY=0,currentY=0,renderedDistance=0,dragging=false,activeScroller=null;
  panel.addEventListener('touchstart',event=>{
    if(window.innerWidth>750||event.touches.length!==1)return;
    activeScroller=null;let candidate=event.target;
    while(candidate&&candidate!==panel){const css=getComputedStyle(candidate);if(candidate.scrollHeight>candidate.clientHeight+1&&/(auto|scroll)/.test(css.overflowY)){activeScroller=candidate;break;}candidate=candidate.parentElement;}
    startY=currentY=event.touches[0].clientY;renderedDistance=0;dragging=true;panel.classList.add('is-dragging');
  },{passive:true});
  panel.addEventListener('touchmove',event=>{
    if(!dragging||event.touches.length!==1)return;
    currentY=event.touches[0].clientY;const distance=Math.max(0,currentY-startY);if(distance<=2)return;
    if(activeScroller&&activeScroller.scrollTop>0){dragging=false;panel.classList.remove('is-dragging');panel.style.removeProperty('transform');content?.style.removeProperty('opacity');return;}
    event.preventDefault();const maxDrag=panel.offsetHeight*.8;renderedDistance=Math.min(distance,maxDrag);const progress=maxDrag?renderedDistance/maxDrag:0;
    panel.style.transform=`translateY(${renderedDistance}px)`;if(content)content.style.opacity=String(1-progress);
  },{passive:false});
  const finish=()=>{
    if(!dragging)return;dragging=false;const distance=Math.max(0,currentY-startY);
    if(distance>=panel.offsetHeight*.4){panel.classList.remove('is-dragging');panel.style.setProperty('--create-dismiss-start',`${renderedDistance}px`);panel.style.setProperty('--create-content-opacity',String(Math.max(0,1-renderedDistance/(panel.offsetHeight*.8))));panel.classList.add('swipe-dismiss');closeModal();return;}
    panel.classList.add('is-returning');panel.classList.remove('is-dragging');panel.getBoundingClientRect();panel.style.transform='translateY(0)';if(content)content.style.opacity='1';
    setTimeout(()=>{if(!panel.isConnected)return;panel.style.removeProperty('transform');content?.style.removeProperty('opacity');panel.classList.remove('is-returning');},340);
  };
  panel.addEventListener('touchend',finish,{passive:true});panel.addEventListener('touchcancel',finish,{passive:true});
}
function finishCloseModal(){
  const bg=document.getElementById('modal-bg'),panel=document.getElementById('modal-panel');
  document.documentElement.classList.remove('modal-open');document.body.classList.remove('modal-open');CE.viewMode=0;
  bg.classList.add('hidden');bg.classList.remove('modal-maximized','modal-fullscreen','create-modal-bg','closing');
  panel.classList.remove('create-modal-panel','closing','swipe-dismiss','is-dragging','is-returning','is-ready');
  ['transform','width','max-width','height','max-height','border-radius','--create-dismiss-start','--create-content-opacity'].forEach(prop=>panel.style.removeProperty(prop));
}
function closeModal() {
  closeSubjectPicker();
  const bg=document.getElementById('modal-bg'),panel=document.getElementById('modal-panel');
  if(bg.classList.contains('create-modal-bg')&&!bg.classList.contains('closing')){bg.classList.add('closing');panel.classList.remove('is-dragging','is-returning');panel.classList.add('closing');setTimeout(finishCloseModal,380);return;}
  finishCloseModal();
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
  if (!force && seen[key]) return false;
  seen[key] = true;
  localStorage.setItem('sd_onboard', JSON.stringify(seen));
  const d = ONBOARD_DEFS[key];
  if (!d) return false;
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
  return true;
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
window.addEventListener('online', () => {
  updateConnectionState();
  renderPageContent(currentPage);
  if(MenuOverlay.open&&MenuOverlay.tab==='notifications')renderOverlayTab('notifications');
  refreshSyncedSetsFromCloud();
  initAccountNav();
});
window.addEventListener('offline', () => {
  updateConnectionState();
  renderPageContent(currentPage);
  if(MenuOverlay.open&&MenuOverlay.tab==='notifications')renderOverlayTab('notifications');
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    loadAllNotifications();
    refreshSyncedSetsFromCloud();
    initAccountNav();
  }
});
window.addEventListener('focus', () => {
  refreshSyncedSetsFromCloud();
  initAccountNav();
});
window.addEventListener('pageshow', event => {
  if (event.persisted) initAccountNav();
});
window.addEventListener('storage', event => {
  if (event.key === 'sd_profile_updated_at') initAccountNav();
});
showOnboarding('home');
syncLocalWithServer();

window.debugDb = function(){
  console.log('Sets in memory:', DB.sets.length, DB.sets);
  return DB.sets;
};
loadSetsFromDirectory().then(loadSyncedSetsIntoLibrary).then(() => {
  syncedLibraryReady = true;
  updateConnectionState();
  showPage(getPageFromLocation());
  setupSearch();
  setupMobileSearch();
  initMobileSidebar();
  loadAllNotifications();
  scheduleNotificationOnboarding();
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
  const editCloudId = urlParams.get('editCloud');
  const editId = urlParams.get('edit') || (editCloudId ? findSetByCloudId(editCloudId)?.id : null);
  if (editId) {
    const newUrl = `${window.location.pathname}${window.location.hash || '#home'}`;
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
  const deleteCloudId = urlParams.get('deleteCloud');
  const deleteId = urlParams.get('delete') || (deleteCloudId ? findSetByCloudId(deleteCloudId)?.id : null);
  if (deleteId) {
    const newUrl = `${window.location.pathname}${window.location.hash || '#home'}`;
    window.history.replaceState({}, '', newUrl);
    setTimeout(() => {
      if (DB.sets.some(set => set.id === deleteId)) confirmDelete(deleteId);
      else showToast('Set niet gevonden');
    }, 200);
  }
});
setInterval(refreshSyncedSetsFromCloud, 12000);
setInterval(() => {
  if (document.visibilityState === 'visible' && navigator.onLine && _currentSession) initAccountNav();
}, 15000);

/* ── ACCOUNT NAV (gekoppeld aan het samengevoegde menu-overlay) ── */

let accountNavRefreshPromise = null;
async function initAccountNav() {
  if (accountNavRefreshPromise) return accountNavRefreshPromise;
  accountNavRefreshPromise = (async () => {
    try {
      const session = await VeliosAuth.getSession();
      _currentSession = session;
      _currentProfile = session ? await VeliosAuth.getProfile() : null;
    } catch (e) {
      console.warn('Kon accountstatus niet laden:', e.message);
    }
    if (_currentSession && !_currentProfile) {
      _currentProfile = VeliosAuth.profileFromUser(_currentSession.user);
    }
    updateMenuTriggerButton();
    updateDashboardWelcome();
    if (_currentSession) ensureRequiredSchoolProfile();
    // Als het menu open staat op het Account-tabblad, herteken het met de nieuwe info
    if (typeof MenuOverlay !== 'undefined' && MenuOverlay.open && MenuOverlay.tab === 'account') {
      renderOverlayTab('account');
    }
  })();
  try {
    await accountNavRefreshPromise;
  } finally {
    accountNavRefreshPromise = null;
  }
}

function updateMenuTriggerButton() {
  const btn = document.getElementById('menuTriggerBtn');
  if (!btn) return;
  const dot = document.getElementById('menuTriggerDot');
  if (_currentSession) {
    const profile = _currentProfile || VeliosAuth.profileFromUser(_currentSession.user);
    const initial = profile?.display_name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase() || '?';
    const avatarUrl=VeliosAuth.resolveAvatarUrl(profile?.avatar_url);
    btn.innerHTML = (avatarUrl
      ? `<img src="${esc(avatarUrl)}" alt="Profielfoto">`
      : `<span style="pointer-events:none">${initial}</span>`) + '<span class="menu-trigger-dot" id="menuTriggerDot"></span>';
  } else {
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 217 256"><g data-name="Group 39" fill="var(--text)"><path data-name="Path 248" d="M0 207.99a85.24 85.24 0 0 1 21.968-34.917 108.7 108.7 0 0 1 35.72-23.837 107.1 107.1 0 0 1 40.918-8.393h20.124a109.58 109.58 0 0 1 76.47 32.231 88.5 88.5 0 0 1 21.8 34.917 146.4 146.4 0 0 1-49.135 35.756 145.3 145.3 0 0 1-59.2 12.254 145.6 145.6 0 0 1-60.036-12.422A148.4 148.4 0 0 1 0 207.99"/><path data-name="Path 249" d="M69.297 16.285Q85.716-.166 108.5.002q22.617.168 39.2 16.619 16.418 16.619 16.586 39.281.335 22.83-16.251 39.281-16.418 16.619-39.2 16.451-22.617-.336-39.2-16.787-16.421-16.451-16.589-39.281-.335-22.83 16.251-39.281" opacity=".6"/></g></svg>`;
  }
  // Het uitgelogde icoon wordt door de gebruiker als één SVG beheerd.
  // Voeg de statusstip daarom los toe, zodat een SVG-wijziging hem niet kan verwijderen.
  if (!btn.querySelector('#menuTriggerDot')) {
    btn.insertAdjacentHTML('beforeend', '<span class="menu-trigger-dot" id="menuTriggerDot"></span>');
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
  { key: 'account', label: 'Account', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path data-name="Rectangle 20" fill="rgba(0,0,0,0)" d="M0 0h256v256H0z"/><path data-name="Path 250" d="M118.442 132.511q-24.929 0-49.413 12.423a112.1 112.1 0 0 0-40.065 33.867q-15.58 21.444-15.58 47.029a29 29 0 0 0 8.9 21.3 29.2 29.2 0 0 0 21.368 8.873h169.164a29.54 29.54 0 0 0 21.665-8.873 29 29 0 0 0 8.9-21.3q0-25.585-15.581-47.029a112.1 112.1 0 0 0-40.065-33.867q-24.484-12.423-49.413-12.423Z" fill="var(--text)"/><path data-name="Path 251" d="M128.384 0a58.41 58.41 0 0 0-58.761 58.565 58.1 58.1 0 0 0 7.865 29.578 59.3 59.3 0 0 0 21.368 21.444 58.59 58.59 0 0 0 59.058 0 59.3 59.3 0 0 0 21.368-21.444 58.1 58.1 0 0 0 7.865-29.578 57.3 57.3 0 0 0-7.865-29.43A58.58 58.58 0 0 0 128.384 0" fill="var(--text)" opacity=".6"/></svg>' },
  { key: 'settings', label: 'Instellingen', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><defs><clipPath id="a"><path fill="none" d="M43 31h256v256H43z"/></clipPath></defs><path data-name="Path 168" d="M128.001 184.153a55.8 55.8 0 0 1-21.857-4.413 56 56 0 0 1-17.848-12.035 56 56 0 0 1-12.034-17.848A55.8 55.8 0 0 1 71.849 128a55.8 55.8 0 0 1 4.413-21.857 56 56 0 0 1 12.034-17.849 56 56 0 0 1 17.848-12.035 55.8 55.8 0 0 1 21.857-4.413 55.8 55.8 0 0 1 21.857 4.413 56 56 0 0 1 17.848 12.035 56 56 0 0 1 12.034 17.849A55.8 55.8 0 0 1 184.153 128a55.8 55.8 0 0 1-4.413 21.857 56 56 0 0 1-12.034 17.848 56 56 0 0 1-17.848 12.035 55.8 55.8 0 0 1-21.857 4.413m.448-98.379a42.724 42.724 0 0 0-42.675 42.675 42.724 42.724 0 0 0 42.675 42.675 42.724 42.724 0 0 0 42.677-42.675 42.724 42.724 0 0 0-42.678-42.675Z" fill="var(--text)" opacity=".6"/><path data-name="Path 167" d="M128.001 153.556a25.556 25.556 0 1 0-25.556-25.555 25.556 25.556 0 0 0 25.556 25.555m0-9.583a15.972 15.972 0 1 0-15.973-15.972 15.97 15.97 0 0 0 15.973 15.972" fill="var(--text)" fill-rule="evenodd"/><g data-name="Scroll Group 1" transform="translate(-43 -31)" clip-path="url(#a)" style="isolation:isolate"><path data-name="Path 169" d="M74.18 211.695c-1.346-2.324-2.642-4.56-3.748-6.883-1.164-2.442-2.026-4.702-2.944-7.113l-.199-.522-13.489-.721a7.305 7.305 0 0 1-6.878-5.323 6.955 6.955 0 0 1 3.159-7.925l11.317-7.23a145 145 0 0 1-1.63-16.162l-12.124-5.144a7.1 7.1 0 0 1 1.034-13.7l13.225-2.956a89 89 0 0 1 4.056-15.687l-9.917-8.84a6.916 6.916 0 0 1-1.657-8.678 7.05 7.05 0 0 1 7.506-4.028l13.418 1.61a95 95 0 0 1 9.536-13.035l-6.369-11.8a6.87 6.87 0 0 1 1.264-8.536 7.69 7.69 0 0 1 8.645-1.119l12.052 6.03a84.4 84.4 0 0 1 13.577-9.242l-1.8-13.143a6.9 6.9 0 0 1 4.111-7.506 7.21 7.21 0 0 1 8.526 1.755l9.139 9.805a87.5 87.5 0 0 1 15.976-4.208l3.032-12.895a7.15 7.15 0 0 1 6.334-5.697 7.3 7.3 0 0 1 7.501 4.548l5.249 12.311a96.6 96.6 0 0 1 16.5 1.311l7.325-11.174a6.95 6.95 0 0 1 7.782-2.929 7.214 7.214 0 0 1 5.732 6.825l.745 13.013a128 128 0 0 1 14.9 7.061l10.52-7.852a7.174 7.174 0 0 1 8.774-.323c2.872 2.122 3.91 5.08 2.722 8.314l-3.67 12.325a160 160 0 0 1 11.619 11.626l12.84-3.761a7.28 7.28 0 0 1 8.251 2.738 7.04 7.04 0 0 1-.155 8.522l-8.116 10.553c.478.912.949 1.764 1.406 2.608.836 1.53 1.646 3.013 2.446 4.699.755 1.582 1.42 3.202 2.096 4.85.359.871.72 1.75 1.098 2.635l13.592.675a7.31 7.31 0 0 1 6.676 5.41 7.2 7.2 0 0 1-3.164 7.933l-11.21 7.184a144 144 0 0 1 1.58 16.063l12.172 5.24a7.06 7.06 0 0 1 4.668 7.444 6.855 6.855 0 0 1-5.799 6.316l-13.02 2.863a121 121 0 0 1-4.057 15.687l9.714 8.932a7.13 7.13 0 0 1 1.656 8.677 6.906 6.906 0 0 1-7.302 3.935l-13.466-1.711a92.3 92.3 0 0 1-9.59 13.184l6.267 11.847a6.78 6.78 0 0 1-1.311 8.436 7.12 7.12 0 0 1-8.495 1.171l-12.053-6.03a96 96 0 0 1-13.53 9.342l1.753 13.045a6.9 6.9 0 0 1-4.112 7.505 7.21 7.21 0 0 1-8.525-1.754l-9.092-9.705a96 96 0 0 1-16.024 4.107l-3.032 12.895a7.1 7.1 0 0 1-6.486 5.647 6.945 6.945 0 0 1-7.452-4.449l-5.147-12.357a90.3 90.3 0 0 1-16.398-1.356l-7.324 11.171a7.25 7.25 0 0 1-7.986 3.022c-3.6-1.058-5.613-3.445-5.731-6.825l-.542-13.104a94 94 0 0 1-14.9-7.062l-10.724 7.943a7.46 7.46 0 0 1-8.778.32 7.155 7.155 0 0 1-2.722-8.314l3.726-12.482A140 140 0 0 1 87.16 230.03l-12.945 3.805a7.54 7.54 0 0 1-8.25-2.738 6.964 6.964 0 0 1 .257-8.568l8.116-10.553Zm113.142-39.271a21.1 21.1 0 0 1-15.699 7.654l29.749 62.41c-43.662 15.337-92.095-3.534-112.392-46.112a88 88 0 0 1-8.748-38.647l59.808 6.832 10.812.616a21.1 21.1 0 0 1 2.15-17.2l-11.285-.713-59.564-6.83c5.62-26.198 23.562-49.428 50.575-61.72a92.02 92.02 0 0 1 81.994 2.376l-40.749 56.953a21.18 21.18 0 0 1 14.796 9.427l40.583-56.5a89.3 89.3 0 0 1 23.909 30.644c20.2 42.376 3.92 90.698-35.994 113.638Z" fill="var(--text)" fill-rule="evenodd"/></g></svg>' },
  { key: 'notifications', label: 'Meldingen', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path data-name="Rectangle 20" fill="rgba(0,0,0,0)" d="M0 0h256v256H0z"/><g data-name="Group 41" fill="var(--text)"><path data-name="Path 252" d="M105.508 247.202a31.7 31.7 0 0 1-10.7-21.709v-.232c.16-.781 66.543-.549 66.543 0a31.47 31.47 0 0 1-10.473 21.824 32.2 32.2 0 0 1-22.8 8.912 32.42 32.42 0 0 1-22.57-8.795" opacity=".6"/><path data-name="Path 253" d="M32.977 208.951a14.9 14.9 0 0 1-10.814-4.225 16.66 16.66 0 0 1-5.057-10.316 15.12 15.12 0 0 1 3.174-11.148l13.287-16.547a21.63 21.63 0 0 0 4.466-13.25v-49.863q0-29.807 17.636-52.678a90 90 0 0 1 45.839-31.443 25.63 25.63 0 0 1 9.753-13.959 27.8 27.8 0 0 1 16.814-5.523 27.66 27.66 0 0 1 16.693 5.406 24.15 24.15 0 0 1 9.522 13.729 87.4 87.4 0 0 1 34.2 18.3 85.5 85.5 0 0 1 21.869 29.568 86.9 86.9 0 0 1 7.405 35.191v51.275a21.25 21.25 0 0 0 4.583 13.25l13.158 16.547a14.52 14.52 0 0 1 3.421 11.033 16.2 16.2 0 0 1-4.939 10.432 14.92 14.92 0 0 1-10.814 4.225Z"/></g></svg>' }
];

// Gebruik overal dezelfde bronbestanden voor instellingen en meldingen.
// De CSS-maskers laten deze witte SVG-assets de kleur van hun omgeving volgen.
MENU_TABS.find(tab=>tab.key==='settings').icon='<span class="ui-asset-icon ui-asset-icon-settings" aria-hidden="true"></span>';
MENU_TABS.find(tab=>tab.key==='notifications').icon='<span class="ui-asset-icon ui-asset-icon-notification" aria-hidden="true"></span>';
MENU_TABS.push({key:'subjects',label:'Vakken',icon:'<span class="ui-asset-icon ui-asset-icon-subjects" aria-hidden="true"></span>'});

function openAccountOverlay(tab) {
  if (document.getElementById('account-overlay')) return; // al open
  MenuOverlay.open = true;
  MenuOverlay.tab = tab || 'account';
  NotifDetailId = null;
  NotifSelectMode = false;
  NotifSelectedIds = [];

  const el = document.createElement('div');
  el.className = 'onboard-overlay';
  el.id = 'account-overlay';
  el.onclick = (e) => { if (e.target === el) closeAccountOverlay(); };
  el.innerHTML = `
    <div class="onboard-panel acc-ov-panel">
      <div class="acc-ov-drag-zone" aria-hidden="true"><span></span></div>
      <div class="acc-ov-body">
        <aside class="acc-ov-sidebar">
          <div class="acc-ov-sidebar-title">Menu</div>
          <div class="acc-ov-sidebar-nav" id="accOvSidebar"></div>
        </aside>
        <section class="acc-ov-main">
          <div class="acc-ov-header">
            <button class="acc-ov-icon-btn acc-ov-back" onclick="backAccountOverlay()" title="Terug" aria-label="Terug">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <h3 id="accOvTitle">Account</h3>
            <button class="acc-ov-icon-btn acc-ov-close" onclick="closeAccountOverlay()" title="Sluiten" aria-label="Menu sluiten">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="acc-ov-divider" aria-hidden="true"></div>
          <div class="acc-ov-content" id="accOvContent"></div>
        </section>
      </div>
    </div>`;
  document.body.appendChild(el);
  document.documentElement.classList.add('menu-overlay-open');
  document.body.classList.add('menu-overlay-open');
  setupAccountOverlaySwipe(el);
  renderOverlaySidebar();
  renderOverlayTab(MenuOverlay.tab);
  loadAllNotifications();
  initAccountNav();
}

function closeAccountOverlay() {
  const el = document.getElementById('account-overlay');
  if (!el) {
    MenuOverlay.open = false;
    document.documentElement.classList.remove('menu-overlay-open');
    document.body.classList.remove('menu-overlay-open');
    return;
  }
  el.classList.add('closing');
  const panel = el.querySelector('.onboard-panel');
  if (panel) {
    panel.classList.remove('is-dragging','is-returning');
    const panelContent=panel.querySelector('.acc-ov-body');
    if(panelContent)panelContent.style.removeProperty('opacity');
    panel.style.removeProperty('transition');
    panel.style.removeProperty('transform');
    panel.classList.add('closing');
  }
  setTimeout(() => {
    el.remove();
    document.documentElement.classList.remove('menu-overlay-open');
    document.body.classList.remove('menu-overlay-open');
  }, 420);
  MenuOverlay.open = false;
}

window.addEventListener('resize', () => {
  if (!MenuOverlay.open) return;
  renderOverlaySidebar();
  updateAccountOverlayPageState();
});

function renderOverlaySidebar() {
  const sidebar = document.getElementById('accOvSidebar');
  if (!sidebar) return;
  const read = getNotifReadIds();
  const unread = AllNotifs.filter(n => !read.includes(n.id)).length;
  sidebar.innerHTML = MENU_TABS.map(t => `
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

function backAccountOverlay(){
  if(MenuOverlay.tab==='account')return;
  switchOverlayTab('account');
}

function updateAccountOverlayPageState(){
  const panel=document.querySelector('#account-overlay .acc-ov-panel');
  const title=document.getElementById('accOvTitle');
  const activeTab=MENU_TABS.find(t=>t.key===MenuOverlay.tab);
  if(title)title.textContent=activeTab?.label||'Menu';
  panel?.classList.toggle('mobile-subpage',window.innerWidth<=750&&MenuOverlay.tab!=='account');
}

function setupAccountOverlaySwipe(overlay){
  const panel=overlay.querySelector('.acc-ov-panel');
  if(!panel)return;
  const panelContent=panel.querySelector('.acc-ov-body');
  const markSheetReady=()=>panel.classList.add('is-ready');
  panel.addEventListener('animationend',event=>{
    if(event.target===panel&&event.animationName==='accSheetIn')markSheetReady();
  });
  setTimeout(()=>{if(panel.isConnected)markSheetReady();},450);
  let startY=0;
  let startX=0;
  let currentY=0;
  let dragging=false;
  let dragStarted=false;
  let renderedDistance=0;
  let activeScroller=null;
  panel.addEventListener('touchstart',e=>{
    if(window.innerWidth>750||e.touches.length!==1)return;
    activeScroller=null;
    let scrollCandidate=e.target;
    while(scrollCandidate&&scrollCandidate!==panel){
      const style=getComputedStyle(scrollCandidate);
      if(scrollCandidate.scrollHeight>scrollCandidate.clientHeight+1&&/(auto|scroll)/.test(style.overflowY)){
        activeScroller=scrollCandidate;
        break;
      }
      scrollCandidate=scrollCandidate.parentElement;
    }
    startY=e.touches[0].clientY;
    startX=e.touches[0].clientX;
    currentY=startY;
    renderedDistance=0;
    dragging=true;
    dragStarted=false;
  },{passive:true});
  panel.addEventListener('touchmove',e=>{
    if(!dragging||e.touches.length!==1)return;
    currentY=e.touches[0].clientY;
    const distance=Math.max(0,currentY-startY);
    const horizontalDistance=Math.abs(e.touches[0].clientX-startX);
    if(!dragStarted&&horizontalDistance>10&&horizontalDistance>distance){
      dragging=false;
      return;
    }
    if(distance>10){
      if(activeScroller&&activeScroller.scrollTop>0){
        dragging=false;
        return;
      }
      if(!dragStarted){
        dragStarted=true;
        panel.classList.add('is-dragging');
      }
      e.preventDefault();
      const maxDrag=panel.offsetHeight*.8;
      renderedDistance=Math.min(distance,maxDrag);
      const progress=maxDrag?renderedDistance/maxDrag:0;
      panel.style.transform=`translateY(${renderedDistance}px)`;
      if(panelContent)panelContent.style.opacity=String(1-progress);
    }
  },{passive:false});
  panel.addEventListener('touchend',()=>{
    if(!dragging)return;
    dragging=false;
    if(!dragStarted)return;
    dragStarted=false;
    const distance=Math.max(0,currentY-startY);
    const closeThreshold=panel.offsetHeight*.4;
    if(distance>=closeThreshold){
      panel.classList.remove('is-dragging');
      panel.style.setProperty('--sheet-dismiss-start',`${renderedDistance}px`);
      panel.style.setProperty('--sheet-content-opacity',String(Math.max(0,1-(renderedDistance/(panel.offsetHeight*.8)))));
      panel.classList.add('swipe-dismiss');
      closeAccountOverlay();
      return;
    }
    panel.classList.add('is-returning');
    panel.classList.remove('is-dragging');
    panel.getBoundingClientRect();
    panel.style.transform='translateY(0)';
    if(panelContent)panelContent.style.opacity='1';
    setTimeout(()=>{
      if(!panel.isConnected)return;
      panel.style.removeProperty('transform');
      if(panelContent)panelContent.style.removeProperty('opacity');
      panel.classList.remove('is-returning');
    },340);
  },{passive:true});
  panel.addEventListener('touchcancel',()=>{
    dragging=false;
    dragStarted=false;
    panel.classList.remove('is-dragging');
    panel.style.removeProperty('transform');
    if(panelContent)panelContent.style.removeProperty('opacity');
  },{passive:true});
}

function renderOverlayTab(tab) {
  MenuOverlay.tab = tab = tab || MenuOverlay.tab;
  const content = document.getElementById('accOvContent');
  if (!content) return;
  let html = '';
  if (tab === 'account') html = renderAccountTabContent();
  else if (tab === 'settings') html = renderSettingsTabContent();
  else if (tab === 'notifications') html = renderNotificationsTabContent();
  else if (tab === 'subjects') html = renderSchoolSubjectsTabContent();
  content.innerHTML = `<div class="acc-ov-content-inner">${html}</div>`;
  if (tab === 'settings') syncThemeUIControls();
  if (tab === 'account' && _currentSession) updateAccountSyncCount();
  renderOverlaySidebar();
  updateAccountOverlayPageState();
}

/* ── Account-tabblad ── */
function getKnownSyncCount() {
  const cloudIds = new Set(DB.sets
    .filter(set => isSyncedSet(set))
    .map(set => getCloudSetId(set))
    .filter(Boolean)
    .map(String));
  return Math.min(5, cloudIds.size);
}

let accountSyncCountRequest = 0;
async function updateAccountSyncCount() {
  const request = ++accountSyncCountRequest;
  const initialElement = document.getElementById('accOvSyncCount');
  if (!initialElement || !_currentSession) return;
  initialElement.textContent = String(getKnownSyncCount());
  if (!navigator.onLine) return;
  try {
    const count = await VeliosAuth.getSyncCount();
    const currentElement = document.getElementById('accOvSyncCount');
    if (request === accountSyncCountRequest && currentElement) {
      currentElement.textContent = String(Math.min(5, Math.max(0, Number(count) || 0)));
    }
  } catch (error) {
    console.warn('Synchronisatieteller kon niet worden geladen:', error.message);
  }
}

function renderAccountTabContent() {
  if (_currentSession) {
    const p = _currentProfile || VeliosAuth.profileFromUser(_currentSession.user);
    const initial = p.display_name?.[0]?.toUpperCase() || p.username?.[0]?.toUpperCase() || '?';
    return `
      <div class="acc-ov-account-card">
        <div class="acc-ov-account-header">
          <div class="acc-ov-account-avatar">${VeliosAuth.resolveAvatarUrl(p.avatar_url) ? `<img src="${esc(VeliosAuth.resolveAvatarUrl(p.avatar_url))}" alt="Profielfoto">` : initial}</div>
          <div>
            <div class="acc-ov-account-name">${esc(p.display_name || p.username || '—')}</div>
            <div class="acc-ov-account-user">@${esc(p.username || '—')}</div>
          </div>
        </div>
        <div class="acc-sync-badge" style="margin-top:10px">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          <span id="accOvSyncCount">${getKnownSyncCount()}</span>/5 gesynchroniseerd
        </div>
      </div>
      <a href="account-options.html" class="acc-dd-item account-manage-link" style="border-radius:var(--r4)" onclick="return openOnlineAccountPage('account-options.html')">
        <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><defs><clipPath id="a"><path fill="none" d="M43 31h256v256H43z"/></clipPath></defs><path data-name="Path 167" d="M128.001 153.556a25.556 25.556 0 1 0-25.556-25.555 25.556 25.556 0 0 0 25.556 25.555m0-9.583a15.972 15.972 0 1 0-15.973-15.972 15.97 15.97 0 0 0 15.973 15.972" fill="#(var(--text)" fill-rule="evenodd"/><g data-name="Scroll Group 1" transform="translate(-43 -31)" clip-path="url(#a)" style="isolation:isolate"><path data-name="Path 169" d="M74.18 211.695c-1.346-2.324-2.642-4.56-3.748-6.883-1.164-2.442-2.026-4.702-2.944-7.113l-.199-.522-13.489-.721a7.305 7.305 0 0 1-6.878-5.323 6.955 6.955 0 0 1 3.159-7.925l11.317-7.23a145 145 0 0 1-1.63-16.162l-12.124-5.144a7.1 7.1 0 0 1 1.034-13.7l13.225-2.956a89 89 0 0 1 4.056-15.687l-9.917-8.84a6.916 6.916 0 0 1-1.657-8.678 7.05 7.05 0 0 1 7.506-4.028l13.418 1.61a95 95 0 0 1 9.536-13.035l-6.369-11.8a6.87 6.87 0 0 1 1.264-8.536 7.69 7.69 0 0 1 8.645-1.119l12.052 6.03a84.4 84.4 0 0 1 13.577-9.242l-1.8-13.143a6.9 6.9 0 0 1 4.111-7.506 7.21 7.21 0 0 1 8.526 1.755l9.139 9.805a87.5 87.5 0 0 1 15.976-4.208l3.032-12.895a7.15 7.15 0 0 1 6.334-5.697 7.3 7.3 0 0 1 7.501 4.548l5.249 12.311a96.6 96.6 0 0 1 16.5 1.311l7.325-11.174a6.95 6.95 0 0 1 7.782-2.929 7.214 7.214 0 0 1 5.732 6.825l.745 13.013a128 128 0 0 1 14.9 7.061l10.52-7.852a7.174 7.174 0 0 1 8.774-.323c2.872 2.122 3.91 5.08 2.722 8.314l-3.67 12.325a160 160 0 0 1 11.619 11.626l12.84-3.761a7.28 7.28 0 0 1 8.251 2.738 7.04 7.04 0 0 1-.155 8.522l-8.116 10.553c.478.912.949 1.764 1.406 2.608.836 1.53 1.646 3.013 2.446 4.699.755 1.582 1.42 3.202 2.096 4.85.359.871.72 1.75 1.098 2.635l13.592.675a7.31 7.31 0 0 1 6.676 5.41 7.2 7.2 0 0 1-3.164 7.933l-11.21 7.184a144 144 0 0 1 1.58 16.063l12.172 5.24a7.06 7.06 0 0 1 4.668 7.444 6.855 6.855 0 0 1-5.799 6.316l-13.02 2.863a121 121 0 0 1-4.057 15.687l9.714 8.932a7.13 7.13 0 0 1 1.656 8.677 6.906 6.906 0 0 1-7.302 3.935l-13.466-1.711a92.3 92.3 0 0 1-9.59 13.184l6.267 11.847a6.78 6.78 0 0 1-1.311 8.436 7.12 7.12 0 0 1-8.495 1.171l-12.053-6.03a96 96 0 0 1-13.53 9.342l1.753 13.045a6.9 6.9 0 0 1-4.112 7.505 7.21 7.21 0 0 1-8.525-1.754l-9.092-9.705a96 96 0 0 1-16.024 4.107l-3.032 12.895a7.1 7.1 0 0 1-6.486 5.647 6.945 6.945 0 0 1-7.452-4.449l-5.147-12.357a90.3 90.3 0 0 1-16.398-1.356l-7.324 11.171a7.25 7.25 0 0 1-7.986 3.022c-3.6-1.058-5.613-3.445-5.731-6.825l-.542-13.104a94 94 0 0 1-14.9-7.062l-10.724 7.943a7.46 7.46 0 0 1-8.778.32 7.155 7.155 0 0 1-2.722-8.314l3.726-12.482A140 140 0 0 1 87.16 230.03l-12.945 3.805a7.54 7.54 0 0 1-8.25-2.738 6.964 6.964 0 0 1 .257-8.568l8.116-10.553Zm113.142-39.271a21.1 21.1 0 0 1-15.699 7.654l29.749 62.41c-43.662 15.337-92.095-3.534-112.392-46.112a88 88 0 0 1-8.748-38.647l59.808 6.832 10.812.616a21.1 21.1 0 0 1 2.15-17.2l-11.285-.713-59.564-6.83c5.62-26.198 23.562-49.428 50.575-61.72a92.02 92.02 0 0 1 81.994 2.376l-40.749 56.953a21.18 21.18 0 0 1 14.796 9.427l40.583-56.5a89.3 89.3 0 0 1 23.909 30.644c20.2 42.376 3.92 90.698-35.994 113.638Z" fill="var(--text)" fill-rule="evenodd"/></g></svg>
        Account beheren
      </a>
      <a href="my-account.html" class="acc-dd-item" style="border-radius:var(--r4)" onclick="return openOnlineAccountPage('my-account.html')">
        <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path data-name="Rectangle 20" fill="rgba(0,0,0,0)" d="M0 0h256v256H0z"/><g data-name="Group 42" fill="var(--text)"><path data-name="Path 259" d="M197.5 214h-139a58 58 0 0 1-24.732-5.47 58.6 58.6 0 0 1-10.565-6.375 59 59 0 0 1-8.818-8.234c.773.816 2.548 1.231 5.277 1.231 8.052 0 24.673-3.611 48.067-10.439 20.916-6.1 46.667-14.627 72.509-24 25.61-9.286 49.458-18.728 67.15-26.587 19.53-8.675 30.592-14.972 31.99-18.209a1.23 1.23 0 0 0-.165-1.435A58.3 58.3 0 0 1 251.5 132.96a58.2 58.2 0 0 1 4.5 22.54 58.1 58.1 0 0 1-4.6 22.771 58.3 58.3 0 0 1-12.537 18.595 58.3 58.3 0 0 1-18.595 12.537A58.1 58.1 0 0 1 197.5 214M.154 151.235a58 58 0 0 1 4.445-18.505 58.3 58.3 0 0 1 12.537-18.595 58.3 58.3 0 0 1 18.595-12.537 58 58 0 0 1 18.506-4.445A58.775 58.775 0 0 0 .154 151.235m238.666-37.143a58.7 58.7 0 0 0-38.545-17.027 58.32 58.32 0 0 1 38.547 17.026Z" opacity=".6"/><path data-name="Path 258" d="M58.5 97h139a58.48 58.48 0 0 1 41.685 17.456c10.315 10.382-213.969 91.822-224.844 79.415A58.5 58.5 0 0 1 58.5 97"/><path data-name="Path 256" d="M212.829 99.029A58.7 58.7 0 0 0 197.5 97h-22.178a64.4 64.4 0 0 0-12.469-29.867c1.2-.088 2.431-.132 3.647-.132a49.2 49.2 0 0 1 19.268 3.89A49.3 49.3 0 0 1 201.5 81.5a49.3 49.3 0 0 1 10.608 15.734c.249.588.491 1.192.719 1.8Z"/><path data-name="Path 255" d="M45.49 98.452a65.4 65.4 0 0 1 21.449-40.868 65.3 65.3 0 0 1 19.85-12.16A65.2 65.2 0 0 1 110.5 41a65.2 65.2 0 0 1 23.381 4.3 65.3 65.3 0 0 1 19.657 11.827 65.6 65.6 0 0 1 14.342 17.765A64.9 64.9 0 0 1 175.316 97H58.5a58.8 58.8 0 0 0-13.009 1.452Z"/></g></svg>
        Gesynchroniseerde sets
      </a>
      <div class="acc-dd-sep"></div>
      <button class="acc-dd-item danger" style="border-radius:var(--r4)" onclick="doSignOut()">
        <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path data-name="Rectangle 20" fill="rgba(0,0,0,0)" d="M256 0v256H0V0z"/><path data-name="Path 261" d="M20 227V29a9.01 9.01 0 0 1 9-9h77a9.01 9.01 0 0 1 9 9v198a9.01 9.01 0 0 1-9 9H29a9.01 9.01 0 0 1-9-9" fill="var(--red)" opacity=".4"/><path data-name="Rectangle 72" d="M115 29a9.01 9.01 0 0 0-9-9H29a9.01 9.01 0 0 0-9 9v198a9.01 9.01 0 0 0 9 9h77a9.01 9.01 0 0 0 9-9zm20 0v198a29 29 0 0 1-29 29H29a29 29 0 0 1-29-29V29A29 29 0 0 1 29 0h77a29 29 0 0 1 29 29" fill="var(--red)" opacity=".6"/><path data-name="Path 260" d="m239.613 121.9-38.751-41.98a9 9 0 0 0-15.614 6.1V113h-125a15 15 0 0 0-15 15 15 15 0 0 0 15 15h125v26.981a9 9 0 0 0 15.614 6.1l38.751-41.981A8.98 8.98 0 0 0 242 128a8.98 8.98 0 0 0-2.387-6.1" fill="var(--red)"/></svg>
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
  const accentButtons=THEME_COLORS.map(color=>`
    <button class="theme-swatch" id="accent-${color.idx}" style="--swatch-main:${color.hex};--swatch-light:${color.light};--swatch-dark:${color.dark}" onclick="setAccentColor('${color.hex}',${color.idx})" title="${color.label}" aria-label="Accentkleur ${color.label}">
      <span class="theme-swatch-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l4 4L19 6"/></svg></span>
    </button>`).join('');
  return `
    <div class="settings-section"><div class="settings-section-title">Accentkleur</div>
      <div class="theme-swatches">${accentButtons}</div>
    </div>
    <div class="settings-section"><div class="settings-section-title">Weergave</div>
      <div class="settings-row">
        <span class="settings-row-copy"><strong>Systeem volgen</strong><small>Neem de lichte of donkere modus van je apparaat over</small></span>
        <label class="toggle"><input type="checkbox" id="theme-system-toggle" onchange="toggleSystemTheme()"><span class="toggle-slider"></span></label>
      </div>
      <div class="settings-row" id="theme-dark-row">
        <span class="settings-row-copy"><strong>Donkere modus</strong><small>Schakel de donkere weergave handmatig in</small></span>
        <label class="toggle"><input type="checkbox" id="theme-dark-toggle" onchange="toggleDarkMode()"><span class="toggle-slider"></span></label>
      </div>
    </div>
    <div class="settings-section">
      <div class="settings-section-title">Meldingen</div>
      <div class="settings-row">
        <span class="settings-row-label">Systeemmeldingen</span>
        ${notifPerm === 'granted'
          ? `<span style="font-size:12px;color:var(--green);font-weight:700">✓ Ingeschakeld</span>`
          : notifPerm === 'denied'
            ? `<button class="btn btn-glass btn-sm" onclick="requestNotifPermission()">Opnieuw toestaan</button>`
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

/* ── Klas- en vakkeninstellingen ── */
let schoolPreferencesSaveTimer=null;
function getSchoolPreferences(){return window.VeliosSchool?VeliosSchool.fromProfile(_currentProfile):{schoolClass:'',schoolProfile:'',gymnasium:false,extraSubjects:[],hideIrrelevant:true}}
function schoolSelect(values,current,handler,labeler=value=>value,placeholder='Maak een keuze'){return VeliosSelect.markup({value:current,onChange:handler,placeholder,ariaLabel:placeholder,options:values.map(value=>({value,label:labeler(value)}))})}
function queueSchoolPreferencesSave(preferences){
  const next=VeliosSchool.saveLocal(preferences);
  _currentProfile={...(_currentProfile||{}),...VeliosSchool.metadata(next)};
  clearTimeout(schoolPreferencesSaveTimer);
  schoolPreferencesSaveTimer=setTimeout(async()=>{
    if(!_currentSession)return;
    try{
      const {error}=await VeliosAuth.client.auth.updateUser({data:VeliosSchool.metadata(next)});
      if(error)throw error;
    }catch(error){console.warn('Klasinstellingen synchroniseren is mislukt:',error.message);showToast('Klasinstellingen konden niet worden gesynchroniseerd');}
  },350);
  renderCurrentDataPage();
  return next;
}
function setSchoolClass(value){
  const current=getSchoolPreferences();
  const next=queueSchoolPreferencesSave({...current,schoolClass:value,schoolProfile:['4','5','6'].includes(value)?current.schoolProfile:'',extraSubjects:['4','5','6'].includes(value)?current.extraSubjects:[]});
  if(MenuOverlay.open&&MenuOverlay.tab==='subjects')renderOverlayTab('subjects');
  return next;
}
function setSchoolProfile(value){const next=queueSchoolPreferencesSave({...getSchoolPreferences(),schoolProfile:value});if(MenuOverlay.open&&MenuOverlay.tab==='subjects')renderOverlayTab('subjects');return next}
function toggleSchoolSetting(key){const current=getSchoolPreferences();const next=queueSchoolPreferencesSave({...current,[key]:!current[key]});if(MenuOverlay.open&&MenuOverlay.tab==='subjects')renderOverlayTab('subjects');return next}
function toggleExtraSchoolSubject(subject){
  const current=getSchoolPreferences(),required=new Set(VeliosSchool.requiredSubjects(current));
  if(required.has(subject))return;
  const extra=new Set(current.extraSubjects);extra.has(subject)?extra.delete(subject):extra.add(subject);
  queueSchoolPreferencesSave({...current,extraSubjects:[...extra]});
  if(MenuOverlay.open&&MenuOverlay.tab==='subjects')renderOverlayTab('subjects');
}
function renderSubjectPills(preferences,editable){
  const required=new Set(VeliosSchool.requiredSubjects(preferences));
  const selected=new Set(VeliosSchool.selectedSubjects(preferences));
  return `<div class="school-subject-grid">${VeliosSchool.ALL_SUBJECTS.map(subject=>{
    const locked=required.has(subject),active=selected.has(subject);
    return `<button type="button" class="school-subject${active?' active':''}${locked?' locked':''}" ${editable&&!locked?`onclick="toggleExtraSchoolSubject('${esc(subject)}')"`:'disabled'}>${esc(subject)}${locked?'<span>Vast</span>':''}</button>`;
  }).join('')}</div>`;
}
function renderSchoolSubjectsTabContent(){
  if(!window.VeliosSchool)return '<div class="notif-empty">Vakken konden niet worden geladen.</div>';
  const p=getSchoolPreferences(),upper=VeliosSchool.isUpper(p);
  return `<div class="school-settings">
    <div class="settings-row school-hide-row"><span class="settings-row-copy"><strong>Niet-relevante vakken verbergen</strong><small>Vakken die niet bij je klas of profielkeuze horen, worden verborgen.</small></span><label class="toggle"><input type="checkbox" ${p.hideIrrelevant?'checked':''} onchange="toggleSchoolSetting('hideIrrelevant')"><span class="toggle-slider"></span></label></div>
    <div class="settings-section"><div class="settings-section-title">Klas</div>${schoolSelect(['1','2','3','4','5','6','overig'],p.schoolClass,'setSchoolClass',value=>value==='overig'?'Overig':`Klas ${value}`,'Selecteer je klas')}</div>
    ${p.schoolClass&&p.schoolClass!=='overig'?`<div class="settings-row"><span class="settings-row-copy"><strong>Gymnasium</strong><small>Voeg Latijn en Grieks toe als vaste vakken.</small></span><label class="toggle"><input type="checkbox" ${p.gymnasium?'checked':''} onchange="toggleSchoolSetting('gymnasium')"><span class="toggle-slider"></span></label></div>`:''}
    ${upper?`<div class="settings-section"><div class="settings-section-title">Profiel</div>${schoolSelect(['NT','NG','EM','CM'],p.schoolProfile,'setSchoolProfile',value=>value,'Selecteer je profiel')}</div>`:''}
    ${p.schoolClass?`<div class="settings-section"><div class="settings-section-title">${upper?'Jouw vakken':'Zichtbare vakken'}</div><p class="school-section-help">${upper?'Profielvakken staan vast. Andere vakken kun je zelf toevoegen.':'Deze vakken horen bij de gekozen klas.'}</p>${renderSubjectPills(p,upper)}</div>`:'<div class="school-empty"><strong>Selecteer je klas</strong><span>Daarna stellen we de juiste vakken voor je in.</span></div>'}
  </div>`;
}

function ensureRequiredSchoolProfile(){
  if(!window.VeliosSchool||!_currentSession||VeliosSchool.isComplete(getSchoolPreferences())||document.getElementById('school-required-overlay'))return;
  const overlay=document.createElement('div');
  overlay.id='school-required-overlay';overlay.className='school-required-overlay';
  overlay.innerHTML='<section class="school-required-panel" role="dialog" aria-modal="true"><div id="schoolRequiredContent"></div></section>';
  document.body.appendChild(overlay);renderRequiredSchoolPanel();
}
function chooseRequiredSchoolClass(value){const p=VeliosSchool.saveLocal({...getSchoolPreferences(),schoolClass:value,schoolProfile:['4','5','6'].includes(value)?getSchoolPreferences().schoolProfile:''});_currentProfile={...(_currentProfile||{}),...VeliosSchool.metadata(p)};renderRequiredSchoolPanel()}
function chooseRequiredSchoolProfile(value){const p=VeliosSchool.saveLocal({...getSchoolPreferences(),schoolProfile:value});_currentProfile={...(_currentProfile||{}),...VeliosSchool.metadata(p)};renderRequiredSchoolPanel()}
function renderRequiredSchoolPanel(){
  const content=document.getElementById('schoolRequiredContent');if(!content)return;
  const p=getSchoolPreferences(),upper=VeliosSchool.isUpper(p),complete=VeliosSchool.isComplete(p);
  content.innerHTML=`<div class="school-required-brand"><img src="assets/branding/logo_full-svg.svg" alt="Velios+"><span></span></div><div class="school-required-progress">Je leeromgeving instellen</div><h1>Selecteer je klas</h1><p>Zo laten we alleen vakken en sets zien die voor jou relevant zijn.</p>${schoolSelect(['1','2','3','4','5','6','overig'],p.schoolClass,'chooseRequiredSchoolClass',value=>value==='overig'?'Overig':`Klas ${value}`,'Selecteer je klas')}${upper?`<h2>Kies je profiel</h2>${schoolSelect(['NT','NG','EM','CM'],p.schoolProfile,'chooseRequiredSchoolProfile',value=>value,'Selecteer je profiel')}`:''}<button class="btn btn-primary school-required-save" type="button" onclick="saveRequiredSchoolProfile()" ${complete?'':'disabled'}>${complete?'Doorgaan':'Maak een keuze'}</button>`;
}
async function saveRequiredSchoolProfile(){
  const p=getSchoolPreferences();if(!VeliosSchool.isComplete(p))return;
  const button=document.querySelector('.school-required-save');if(button){button.disabled=true;button.textContent='Opslaan…'}
  try{
    const {error}=await VeliosAuth.client.auth.updateUser({data:VeliosSchool.metadata(p)});if(error)throw error;
    _currentProfile={...(_currentProfile||{}),...VeliosSchool.metadata(p)};renderCurrentDataPage();
    const overlay=document.getElementById('school-required-overlay');overlay?.classList.add('closing');setTimeout(()=>overlay?.remove(),260);
  }catch(error){if(button){button.disabled=false;button.textContent='Opnieuw proberen'}showToast('Je klas kon niet worden opgeslagen');}
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
    id: String(raw.id || raw.Id || id),
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

const AUTO_NOTIFS_KEY='sd_auto_set_notifications';
function getStoredAutoNotifications(){
  try{
    const stored=JSON.parse(localStorage.getItem(AUTO_NOTIFS_KEY)||'[]');
    return Array.isArray(stored)?stored:[];
  }catch(e){return []}
}
function saveStoredAutoNotifications(notifications){
  try{localStorage.setItem(AUTO_NOTIFS_KEY,JSON.stringify(notifications))}catch(e){}
}

async function readNotificationSetTitle(filename){
  let set=null;
  try{
    const setResponse=await fetch('./sets/'+filename,{cache:'no-store'});
    if(setResponse.ok){
      const content=(await setResponse.text()).trim();
      try{set=decodeVset(content)}
      catch(decodeError){try{set=JSON.parse(content)}catch(jsonError){}}
    }
  }catch(error){
    console.warn('Kon nieuwe set niet lezen voor notificatie:',filename,error.message);
  }
  const loadedSet=set||DB.sets.find(item=>item._serverFile===filename);
  return String(loadedSet?.title||loadedSet?.naam||filename.replace(/\.vset$/i,'')).trim();
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
      return getStoredAutoNotifications();
    }
    let known = [];
    try { known = JSON.parse(storedRaw || '[]'); } catch (e) {}
    const newFiles = fileList.filter(f => !known.includes(f));

    const synthetic = await Promise.all(newFiles.map(async filename => {
      const title = await readNotificationSetTitle(filename);
      return {
        id: 'autoset_' + filename,
        titel: 'Een nieuwe set toegevoegd',
        subtitel: title,
        datum: lastModified ? new Date(lastModified).toLocaleDateString('nl-NL') : '',
        tijd: lastModified ? new Date(lastModified).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) + ' uur' : '',
        subtitel_present: true,
        blog: false,
        inhoud: '',
        _auto: true
      };
    }));

    // Werk ook eerder opgeslagen automatische meldingen bij, zodat bestaande
    // bestandsnamen na deze update door de echte settitel worden vervangen.
    const storedNotifications=await Promise.all(getStoredAutoNotifications().map(async notification=>{
      const filename=notification?._auto&&String(notification.id||'').startsWith('autoset_')
        ? String(notification.id).slice('autoset_'.length)
        : '';
      return filename?{...notification,subtitel:await readNotificationSetTitle(filename)}:notification;
    }));

    localStorage.setItem('sd_known_set_files', JSON.stringify(fileList));
    const merged=[...synthetic,...storedNotifications].filter((notification,index,list)=>
      list.findIndex(item=>item.id===notification.id)===index
    );
    saveStoredAutoNotifications(merged);
    return merged;
  } catch (e) {
    console.warn('Kon nieuwe sets niet controleren:', e.message);
    return getStoredAutoNotifications();
  }
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
  if (n.blog || n.inhoud) { NotifDetailId = id; renderOverlayTab('notifications'); }
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
  const offlineNotice=!navigator.onLine?`
    <div class="notifications-offline-notice" role="status">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 8.8a15.7 15.7 0 0 1 3.1-2.1M8.5 5.3A15.4 15.4 0 0 1 22 8.8M5 12.4a10.8 10.8 0 0 1 3.1-1.8m3.9-.7a10.8 10.8 0 0 1 7 2.5M8.6 16a5.3 5.3 0 0 1 6.8 0M12 20h.01M3 3l18 18"/></svg>
      <div><strong>Geen verbinding</strong><span>Meldingen zijn mogelijk niet up-to-date.</span></div>
    </div>`:'';
  if (NotifDetailId) {
    const n = AllNotifs.find(x => x.id === NotifDetailId);
    if (n) {
      return offlineNotice+`
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
      <div class="notif-toolbar-title">${unreadCount > 0 ? `<span style="color:var(--accent)">${unreadCount} nieuw</span>` : 'Alles bijgewerkt'}</div>
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

  if (!AllNotifs.length) return offlineNotice + toolbar + selectBar + `<div class="notif-empty">Geen notificaties</div>`;

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

  return offlineNotice + toolbar + selectBar + `<div class="notif-list">${list}</div>`;
}

/* ── Systeemmeldingen (browser Notification API) ── */
function isIosNotificationDevice(){
  return /iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
}
function isStandaloneWebApp(){
  return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
}
function showNotificationPermissionHelp(reason='blocked'){
  if(document.getElementById('notification-permission-help'))return;
  const ios=isIosNotificationDevice();
  const iosInstall=reason==='ios-install';
  const unsupported=reason==='unsupported';
  const insecure=reason==='insecure';
  const title=iosInstall?'Installeer Velios+ eerst':unsupported?'Meldingen niet ondersteund':insecure?'Beveiligde verbinding nodig':'Meldingen zijn geblokkeerd';
  const copy=iosInstall
    ? 'Op iPhone en iPad kan de toestemmingsmelding alleen vanuit de geïnstalleerde Velios+-webapp worden geopend.'
    : unsupported
      ? 'Deze browser ondersteunt geen systeemmeldingen voor Velios+.'
      : insecure
        ? 'De browser toont de toestemmingsmelding alleen via HTTPS of localhost.'
        : 'Je browser heeft meldingen voor Velios+ eerder geblokkeerd. Een website mag die systeemmelding daarna niet zelf opnieuw forceren.';
  const steps=iosInstall
    ? '<ol class="notification-permission-steps"><li>Open Velios+ in Safari.</li><li>Tik op Delen en kies ‘Zet op beginscherm’.</li><li>Open Velios+ vanaf je beginscherm en probeer het opnieuw.</li></ol>'
    : reason==='blocked'
      ? ios
        ? '<ol class="notification-permission-steps"><li>Open Instellingen op je iPhone of iPad.</li><li>Ga naar Meldingen en kies Velios+.</li><li>Zet ‘Sta meldingen toe’ aan en open Velios+ opnieuw.</li></ol>'
        : '<ol class="notification-permission-steps"><li>Open de site-informatie van deze pagina.</li><li>Zet Meldingen op Toestaan of Vragen.</li><li>Klik daarna opnieuw op Meldingen aanzetten.</li></ol>'
      : '';
  const dialog=document.createElement('div');
  dialog.id='notification-permission-help';
  dialog.className='connection-dialog-backdrop notification-permission-help';
  dialog.innerHTML=`<div class="connection-dialog" role="dialog" aria-modal="true" aria-labelledby="notification-permission-title">
    <span class="connection-dialog-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/></svg></span>
    <h3 id="notification-permission-title">${title}</h3><p>${copy}</p>${steps}
    <div class="notification-permission-actions"><button class="btn btn-primary" type="button" onclick="closeNotificationPermissionHelp()">Begrepen</button></div>
  </div>`;
  dialog.addEventListener('click',event=>{if(event.target===dialog)closeNotificationPermissionHelp();});
  document.body.appendChild(dialog);
}
function closeNotificationPermissionHelp(){
  const dialog=document.getElementById('notification-permission-help');
  if(!dialog)return;
  dialog.classList.add('closing');
  setTimeout(()=>dialog.remove(),220);
}
async function requestNotifPermission(){
  if(isIosNotificationDevice()&&!isStandaloneWebApp()){showNotificationPermissionHelp('ios-install');return false;}
  if(!window.isSecureContext){showNotificationPermissionHelp('insecure');return false;}
  if(!('Notification' in window)){showNotificationPermissionHelp('unsupported');return false;}
  if(Notification.permission==='granted'){showToast('Meldingen staan al aan');return true;}
  if(Notification.permission==='denied'){showNotificationPermissionHelp('blocked');return false;}
  let perm='default';
  try{
    // Deze aanroep gebeurt direct binnen de klik, zodat Safari en andere
    // browsers hun eigen toestemmingsvenster daadwerkelijk mogen tonen.
    perm=await Notification.requestPermission();
  }catch(error){
    console.warn('Meldingentoestemming aanvragen mislukt:',error);
    showNotificationPermissionHelp('unsupported');
    return false;
  }
  if(perm==='granted'){
    localStorage.setItem('sd_notif_onboard_enabled','1');
    showToast('Systeemmeldingen ingeschakeld');
  }else{
    showToast(perm==='denied'?'Meldingen zijn geweigerd':'Geen keuze gemaakt');
  }
  if(MenuOverlay.open&&MenuOverlay.tab==='settings')renderOverlayTab('settings');
  return perm==='granted';
}
function scheduleNotificationOnboarding(){
  if(!('Notification' in window)||Notification.permission==='granted')return;
  const visit=(parseInt(localStorage.getItem('sd_visit_count')||'0',10)||0)+1;
  localStorage.setItem('sd_visit_count',String(visit));
  const last=parseInt(localStorage.getItem('sd_notif_onboard_last')||'0',10)||0;
  if(last&&visit-last<5)return;
  const waitForWelcome=()=>{
    const modalOpen=!document.getElementById('modal-bg')?.classList.contains('hidden');
    if(document.getElementById('onboard-overlay')||document.getElementById('account-overlay')||document.getElementById('school-required-overlay')||modalOpen){setTimeout(waitForWelcome,300);return;}
    showNotificationOnboarding(visit);
  };
  setTimeout(waitForWelcome,420);
}
function showNotificationOnboarding(visit){
  if(document.getElementById('notification-onboard'))return;
  localStorage.setItem('sd_notif_onboard_last',String(visit));
  const el=document.createElement('div');
  el.className='onboard-overlay notification-onboard';el.id='notification-onboard';
  el.innerHTML=`<div class="onboard-panel notification-onboard-panel">
    <div class="onboard-body">
      <span class="onboard-icon notification-onboard-icon"><svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path data-name="Rectangle 20" fill="rgba(0,0,0,0)" d="M0 0h256v256H0z"/><g data-name="Group 41" fill="var(--accent)"><path data-name="Path 252" d="M105.508 247.202a31.7 31.7 0 0 1-10.7-21.709v-.232c.16-.781 66.543-.549 66.543 0a31.47 31.47 0 0 1-10.473 21.824 32.2 32.2 0 0 1-22.8 8.912 32.42 32.42 0 0 1-22.57-8.795" opacity=".6"/><path data-name="Path 253" d="M32.977 208.951a14.9 14.9 0 0 1-10.814-4.225 16.66 16.66 0 0 1-5.057-10.316 15.12 15.12 0 0 1 3.174-11.148l13.287-16.547a21.63 21.63 0 0 0 4.466-13.25v-49.863q0-29.807 17.636-52.678a90 90 0 0 1 45.839-31.443 25.63 25.63 0 0 1 9.753-13.959 27.8 27.8 0 0 1 16.814-5.523 27.66 27.66 0 0 1 16.693 5.406 24.15 24.15 0 0 1 9.522 13.729 87.4 87.4 0 0 1 34.2 18.3 85.5 85.5 0 0 1 21.869 29.568 86.9 86.9 0 0 1 7.405 35.191v51.275a21.25 21.25 0 0 0 4.583 13.25l13.158 16.547a14.52 14.52 0 0 1 3.421 11.033 16.2 16.2 0 0 1-4.939 10.432 14.92 14.92 0 0 1-10.814 4.225Z"/></g></svg></span>
      <div class="onboard-title">Blijf op de hoogte</div>
      <div class="onboard-desc">Zet meldingen aan voor belangrijke updates en nieuwe berichten in Velios+.</div>
      <div class="onboard-feature"><div class="onboard-feature-icon"><svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg></div><div class="onboard-feature-text"><strong>Jij houdt de controle</strong><span>Je kunt meldingen later altijd weer uitschakelen via Instellingen.</span></div></div>
    </div>
    <div class="onboard-footer onboard-footer-dual"><button class="onboard-btn onboard-btn-secondary" type="button" onclick="closeNotificationOnboarding()">Niet nu</button><button class="onboard-btn" type="button" onclick="enableNotificationOnboarding()">Meldingen aanzetten</button></div>
  </div>`;
  document.body.appendChild(el);
}
function enableNotificationOnboarding(){
  // Eerst aanvragen: requestPermission moet rechtstreeks uit de gebruikersklik
  // voortkomen. Daarna mag de eigen uitleg-overlay sluiten.
  requestNotifPermission();
  closeNotificationOnboarding();
}
function closeNotificationOnboarding(){
  const el=document.getElementById('notification-onboard');if(!el)return;
  el.style.pointerEvents='none';el.classList.add('closing');el.querySelector('.onboard-panel')?.classList.add('closing');
  setTimeout(()=>el.remove(),420);
}
function maybeSendSystemNotification(newCount) {
  if (newCount <= 0) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification('Velios+', { body: newCount === 1 ? '1 nieuwe melding' : `${newCount} nieuwe meldingen`, icon: 'favicon.png' });
  } catch (e) {}
}
