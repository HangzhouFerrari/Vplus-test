let jsPDFReady = false;
let jsPDFCheckInterval = setInterval(function() {
  if (window.jsPDF && window.jsPDF.jsPDF) {
    jsPDFReady = true;
    clearInterval(jsPDFCheckInterval);
  }
}, 100);
setTimeout(() => { if (jsPDFCheckInterval) clearInterval(jsPDFCheckInterval); }, 10000);

const _k=['S','t','u','d','y','D','e','c','k','V','S','e','t','2','0','2','5'];
const VSET_KEY=_k.join('');
function xorStr(str,key){return str.split('').map((c,i)=>String.fromCharCode(c.charCodeAt(0)^key.charCodeAt(i%key.length))).join('');}
function decodeVset(b64){const xored=decodeURIComponent(escape(atob(b64.trim())));return JSON.parse(xorStr(xored,VSET_KEY));}

/* ── THEME LOADING ── */
function getSetThemeSettings(){
  try{
    const saved=JSON.parse(localStorage.getItem('sd_theme')||'null')||{};
    const accentColor=saved.accentColor&&!(saved.accentColor==='#0062ff'&&!saved.accentWasChosen)?saved.accentColor:'#ff9f0a';
    return {darkMode:!!saved.darkMode,followSystem:saved.followSystem!==false,accentColor};
  }catch(e){return {darkMode:false,followSystem:true,accentColor:'#ff9f0a'};}
}

function setSystemPrefersDark(){
  return !!(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);
}

function setEffectiveDarkMode(settings){
  return settings.followSystem?setSystemPrefersDark():settings.darkMode;
}

function loadThemeSettings(){
  try{
    const saved=getSetThemeSettings();
    const root=document.documentElement.style;
    const body=document.body;
    const darkMode=setEffectiveDarkMode(saved);
    body.classList.toggle('dark-mode',darkMode);
    document.getElementById('theme-color-meta')?.setAttribute('content',darkMode?'#000000':'#f2f2f7');
    if(darkMode){
      root.setProperty('--bg-grad','#000');
      root.setProperty('--glass','#1c1c1e');
      root.setProperty('--glass2','#1c1c1e');
      root.setProperty('--text','#ffffff');
      root.setProperty('--text2','#e9e9e9');
      root.setProperty('--text3','rgba(255,255,255,0.65)');
      root.setProperty('--glass-border','rgba(62,64,70,0.56)');
      root.setProperty('--glass-shadow','none');
      root.setProperty('--glass-shadow-lg','none');
      root.setProperty('--select-bg','#2c2c2e');
      root.setProperty('--select-color','#ffffff');
      root.setProperty('--select-border','rgba(62,64,70,0.56)');
    }else{
      root.setProperty('--bg-grad','#f2f2f7');
      root.setProperty('--glass','rgba(255,255,255,0.90)');
      root.setProperty('--glass2','rgba(255,255,255,0.80)');
      root.setProperty('--text','#0b0f2a');
      root.setProperty('--text2','#3d3a55');
      root.setProperty('--text3','#7c7899');
      root.setProperty('--glass-border','rgba(200,195,230,0.6)');
      root.setProperty('--glass-shadow','none');
      root.setProperty('--glass-shadow-lg','none');
      root.setProperty('--select-bg','rgba(255,255,255,0.9)');
      root.setProperty('--select-color','#0b0f2a');
      root.setProperty('--select-border','rgba(200,195,225,0.6)');
    }
    if(saved.accentColor){
        root.setProperty('--accent',saved.accentColor);
        const hex=saved.accentColor.replace('#','');
        const r=parseInt(hex.substr(0,2),16);
        const g=parseInt(hex.substr(2,2),16);
        const b=parseInt(hex.substr(4,2),16);
        root.setProperty('--accent2',`rgb(${Math.max(0,r-20)},${Math.max(0,g-20)},${Math.max(0,b-20)})`);
        root.setProperty('--accent-light',`rgba(${r},${g},${b},0.12)`);
        root.setProperty('--accent-contrast','#fff');
    }
  }catch(e){console.error('Theme load error:',e);}
}

if(window.matchMedia){
  const setSystemThemeQuery=window.matchMedia('(prefers-color-scheme: dark)');
  const handleSetSystemThemeChange=()=>{
    if(getSetThemeSettings().followSystem)loadThemeSettings();
  };
  if(setSystemThemeQuery.addEventListener)setSystemThemeQuery.addEventListener('change',handleSetSystemThemeChange);
  else if(setSystemThemeQuery.addListener)setSystemThemeQuery.addListener(handleSetSystemThemeChange);
}

let SET=null,currentMode='home';

function setNavigationChromeVisible(visible){
  document.getElementById('app')?.classList.toggle('navigation-visible', visible);
}
function updateSetConnectionState(){
  const offline=!navigator.onLine;
  const notice=document.getElementById('set-offline-page-notice');
  if(notice)notice.hidden=!offline;
  document.body.classList.toggle('is-offline',offline);
}
function openIndexPage(page){
  window.location.href=`index.html#${page}`;
}
function openIndexCreate(){
  window.location.href='index.html?create=1';
}
function openIndexMenu(){
  window.location.href='index.html?menu=account';
}

function setHeaderFallbackMarkup(){
  return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 217 256"><g data-name="Group 39" fill="var(--text)"><path data-name="Path 248" d="M0 207.99a85.24 85.24 0 0 1 21.968-34.917 108.7 108.7 0 0 1 35.72-23.837 107.1 107.1 0 0 1 40.918-8.393h20.124a109.58 109.58 0 0 1 76.47 32.231 88.5 88.5 0 0 1 21.8 34.917 146.4 146.4 0 0 1-49.135 35.756 145.3 145.3 0 0 1-59.2 12.254 145.6 145.6 0 0 1-60.036-12.422A148.4 148.4 0 0 1 0 207.99"/><path data-name="Path 249" d="M69.297 16.285Q85.716-.166 108.5.002q22.617.168 39.2 16.619 16.418 16.619 16.586 39.281.335 22.83-16.251 39.281-16.418 16.619-39.2 16.451-22.617-.336-39.2-16.787-16.421-16.451-16.589-39.281-.335-22.83 16.251-39.281" opacity=".6"/></g></svg>';
}

async function updateSetNotificationDot(){
  const dot=document.getElementById('setMenuTriggerDot');
  if(!dot)return;
  try{
    const [notifResponse,setResponse]=await Promise.all([
      fetch('./notifications/index.json',{cache:'no-store'}),
      fetch('./sets/index.json',{cache:'no-store'})
    ]);
    const notificationIds=notifResponse.ok?await notifResponse.json():[];
    const currentSetFiles=setResponse.ok?await setResponse.json():[];
    let knownSetFiles=[],readIds=[],deletedIds=[];
    try{knownSetFiles=JSON.parse(localStorage.getItem('sd_known_set_files')||'[]');}catch(e){}
    try{readIds=JSON.parse(localStorage.getItem('sd_notif_read')||'[]');}catch(e){}
    try{deletedIds=JSON.parse(localStorage.getItem('sd_notif_deleted')||'[]');}catch(e){}
    const automaticIds=currentSetFiles.filter(file=>!knownSetFiles.includes(file)).map(file=>'autoset_'+file);
    const unread=[...automaticIds,...notificationIds].some(id=>!readIds.includes(id)&&!deletedIds.includes(id));
    dot.classList.toggle('show',unread);
  }catch(e){
    dot.classList.remove('show');
  }
}

let setHeaderAccountRefresh=null;
async function initSetHeaderAccount(){
  if(setHeaderAccountRefresh)return setHeaderAccountRefresh;
  setHeaderAccountRefresh=(async()=>{
  const btn=document.getElementById('setMenuTriggerBtn');
  if(!btn)return;
  btn.innerHTML=setHeaderFallbackMarkup()+'<span class="set-menu-trigger-dot" id="setMenuTriggerDot"></span>';
  if(window.VeliosAuth){
    try{
      const session=await VeliosAuth.getSession();
      const profile=session?await VeliosAuth.getProfile():null;
      if(profile){
        const avatarUrl=VeliosAuth.resolveAvatarUrl(profile.avatar_url);
        const fallback=(profile.display_name?.[0]||profile.username?.[0]||'?').toUpperCase();
        btn.innerHTML='';
        if(avatarUrl){
          const img=document.createElement('img');
          img.src=avatarUrl;
          img.alt='Profielfoto';
          img.addEventListener('error',()=>{
            img.remove();
            const initial=document.createElement('span');
            initial.className='set-menu-trigger-initial';
            initial.textContent=fallback;
            btn.prepend(initial);
          },{once:true});
          btn.appendChild(img);
        }else{
          const initial=document.createElement('span');
          initial.className='set-menu-trigger-initial';
          initial.textContent=fallback;
          btn.appendChild(initial);
        }
        const dot=document.createElement('span');
        dot.className='set-menu-trigger-dot';
        dot.id='setMenuTriggerDot';
        btn.appendChild(dot);
      }
    }catch(e){console.warn('Accountstatus kon niet worden geladen:',e.message);}
  }
  updateSetNotificationDot();
  })();
  try{await setHeaderAccountRefresh;}
  finally{setHeaderAccountRefresh=null;}
}
function openRecentSet(slug){
  window.location.href=`set.html?set=${encodeURIComponent(slug)}`;
}
function renderSetRecentSidebar(){
  const container=document.getElementById('setRecentSidebar');
  if(!container)return;
  let recent=[];
  let stored=[];
  try{
    recent=JSON.parse(localStorage.getItem('sd_recent_sets')||'[]');
    stored=JSON.parse(localStorage.getItem('sd_sets')||'[]');
  }catch(e){}
  const recentSets=recent
    .map(id=>stored.find(set=>set.id===id))
    .filter(Boolean)
    .slice(0,3);
  container.innerHTML=recentSets.map(set=>{
    const slug=set.slug||toSlug(set.title||'set');
    return `<button class="set-recent-item" data-slug="${esc(slug)}" onclick="openRecentSet(this.dataset.slug)" title="${esc(set.title)}">
      <svg width="24" height="24" viewBox="0 0 256 256"><path fill="rgba(149,0,0,0)" d="M0 0h256v256H0z"/><g transform="translate(-3613 1432)" fill="currentColor"><path d="M3815.387-1215.553a33.3 33.3 0 0 1-5.766-.507l-105.483-18.6 93.315-16.454a32.78 32.78 0 0 0 21.3-13.57 32.78 32.78 0 0 0 5.467-24.658l-12.621-71.574 22.852 4.029a32.8 32.8 0 0 1 12.2 4.784 32.9 32.9 0 0 1 9.1 8.786 32.9 32.9 0 0 1 5.143 11.558 32.8 32.8 0 0 1 .324 13.1l-13.371 75.83a32.9 32.9 0 0 1-4.053 11.016 32.9 32.9 0 0 1-7.343 8.625 33.04 33.04 0 0 1-21.064 7.635m-120.77-162.634a33 33 0 0 1 6.686-1.177Z"/><rect width="193" height="143" rx="33" transform="rotate(-10.02 -5974.64 -21305.009)" opacity=".6"/></g></svg>
      <span class="set-recent-label">${esc(set.title)}</span>
    </button>`;
  }).join('');
}

/* ── AUDIO ── */
let _audioMuted = false;
try { _audioMuted = localStorage.getItem('sd_audio_muted') === 'true'; } catch(e){}

const _sfxNames=['correct','incorrect','checkpoint','finish'];
const _sfxEncoded=Object.create(null);
const _sfxBuffers=Object.create(null);
const _sfxDecodePromises=Object.create(null);
const _sfxSources=Object.create(null);
let _sfxContext=null;
let _sfxLoadPromise=null;

function _configureSFXAudioSession(){
  // Web Audio-buffers zijn zelf al korte effecten. Laat de browser de sessie
  // automatisch kiezen: het expliciete type 'transient' kan op iOS stil zijn.
  try{
    if(navigator.audioSession&&'type' in navigator.audioSession){
      navigator.audioSession.type='auto';
    }
  }catch(e){}
}

function _loadSFX(){
  _sfxLoadPromise=Promise.all(_sfxNames.map(async name=>{
    try{
      const response=await fetch(`./SFX/${name}.wav`,{cache:'force-cache'});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      _sfxEncoded[name]=await response.arrayBuffer();
    }catch(error){
      console.warn(`Geluidseffect ${name} kon niet worden geladen:`,error);
    }
  }));
}
_loadSFX();

function _getSFXContext(){
  const AudioContextClass=window.AudioContext||window.webkitAudioContext;
  if(!AudioContextClass)return null;
  if(!_sfxContext||_sfxContext.state==='closed'){
    _configureSFXAudioSession();
    try{_sfxContext=new AudioContextClass({latencyHint:'interactive'});}
    catch(e){_sfxContext=new AudioContextClass();}
  }
  return _sfxContext;
}

function _readWavChunkId(view,offset){
  return String.fromCharCode(view.getUint8(offset),view.getUint8(offset+1),view.getUint8(offset+2),view.getUint8(offset+3));
}

function _decodeSFXWav(context,encoded){
  const view=new DataView(encoded);
  if(view.byteLength<44||_readWavChunkId(view,0)!=='RIFF'||_readWavChunkId(view,8)!=='WAVE'){
    return context.decodeAudioData(encoded.slice(0));
  }
  let format=null,dataOffset=0,dataSize=0,offset=12;
  while(offset+8<=view.byteLength){
    const id=_readWavChunkId(view,offset);
    const size=view.getUint32(offset+4,true);
    const body=offset+8;
    if(body+size>view.byteLength)break;
    if(id==='fmt '&&size>=16){
      format={
        type:view.getUint16(body,true),
        channels:view.getUint16(body+2,true),
        sampleRate:view.getUint32(body+4,true),
        bits:view.getUint16(body+14,true)
      };
    }else if(id==='data'){
      dataOffset=body;dataSize=size;
    }
    offset=body+size+(size%2);
  }
  if(!format||format.type!==1||format.bits!==16||!format.channels||!dataOffset){
    return context.decodeAudioData(encoded.slice(0));
  }
  const frameSize=format.channels*2;
  const frameCount=Math.floor(dataSize/frameSize);
  const buffer=context.createBuffer(format.channels,frameCount,format.sampleRate);
  const outputs=Array.from({length:format.channels},(_,channel)=>buffer.getChannelData(channel));
  for(let frame=0;frame<frameCount;frame++){
    const frameOffset=dataOffset+frame*frameSize;
    for(let channel=0;channel<format.channels;channel++){
      outputs[channel][frame]=view.getInt16(frameOffset+channel*2,true)/32768;
    }
  }
  return Promise.resolve(buffer);
}

async function _getSFXBuffer(name,context){
  if(_sfxBuffers[name])return _sfxBuffers[name];
  if(!_sfxDecodePromises[name]){
    _sfxDecodePromises[name]=(async()=>{
      await _sfxLoadPromise;
      const encoded=_sfxEncoded[name];
      if(!encoded)throw new Error(`Geen audiogegevens voor ${name}`);
      const buffer=await _decodeSFXWav(context,encoded);
      _sfxBuffers[name]=buffer;
      return buffer;
    })().catch(error=>{
      delete _sfxDecodePromises[name];
      throw error;
    });
  }
  return _sfxDecodePromises[name];
}

function _stopSFX(name){
  const source=_sfxSources[name];
  if(!source)return;
  try{source.stop();}catch(e){}
  delete _sfxSources[name];
}

function unlockSFX(){
  if(_audioMuted)return;
  const context=_getSFXContext();
  if(!context)return;
  _configureSFXAudioSession();
  const resumePromise=context.state==='running'?Promise.resolve():context.resume();
  resumePromise.then(()=>Promise.all(_sfxNames.map(name=>_getSFXBuffer(name,context)))).catch(error=>{
    console.warn('Geluidseffecten konden niet worden voorbereid:',error);
  });
}

function isSFXEnabled() {
  if (_audioMuted) return false;
  if (currentMode === 'stampen') return ST.sound !== false;
  if (currentMode === 'overhoren') return OH.sound !== false;
  if (currentMode === 'flashcards') return FC.sound !== false;
  return true;
}

function playSFX(name) {
  if(!isSFXEnabled()||!_sfxNames.includes(name))return;
  const context=_getSFXContext();
  if(!context)return;
  _configureSFXAudioSession();

  // resume() wordt meteen binnen de klik gestart; dat is op iOS nodig om
  // Web Audio te ontgrendelen. Laden/decoderen mag daarna asynchroon doorgaan.
  const resumePromise=context.state==='running'?Promise.resolve():context.resume();
  resumePromise.then(()=>_getSFXBuffer(name,context)).then(buffer=>{
    if(!isSFXEnabled())return;
    _stopSFX(name);
    const source=context.createBufferSource();
    source.buffer=buffer;
    source.connect(context.destination);
    _sfxSources[name]=source;
    source.onended=()=>{if(_sfxSources[name]===source)delete _sfxSources[name]};
    source.start(0);
  }).catch(error=>console.warn(`Geluidseffect ${name} kon niet worden afgespeeld:`,error));
}

function toggleAudioMute() {
  _audioMuted = !_audioMuted;
  try { localStorage.setItem('sd_audio_muted', _audioMuted); } catch(e) {}
  if(_audioMuted)_sfxNames.forEach(_stopSFX);
  document.querySelectorAll('.audio-toggle-btn').forEach(btn => {
    btn.innerHTML = _audioMuted ? _iconAudioOff() : _iconAudioOn();
    btn.title = _audioMuted ? 'Audio aan' : 'Audio uit';
  });
}

function _iconAudioOn() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>`;
}

function _iconAudioOff() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <line x1="23" y1="9" x2="17" y2="15"/>
    <line x1="17" y1="9" x2="23" y2="15"/>
  </svg>`;
}

function _audioToggleBtnHTML() {
  return `<button class="btn-icon audio-toggle-btn" onclick="toggleAudioMute()" title="${_audioMuted ? 'Audio aan' : 'Audio uit'}">
    ${_audioMuted ? _iconAudioOff() : _iconAudioOn()}
  </button>`;
}

let _modeHelpButtonsVisible=true;
try{_modeHelpButtonsVisible=localStorage.getItem('sd_mode_help_buttons')!=='false';}catch(e){}

function _iconHelp(){
  const existing=document.querySelector('.set-info-card-nav-left button[title="Help"] svg,.mode-help-btn svg');
  if(existing){
    const icon=existing.cloneNode(true);
    icon.setAttribute('width','18');
    icon.setAttribute('height','18');
    return icon.outerHTML;
  }
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" opacity=".45"/><path d="M9.7 9a2.5 2.5 0 0 1 4.85.85c0 1.8-2.55 2.05-2.55 3.65"/><path d="M12 17h.01"/></svg>`;
}

function _iconAnswerHelp(){
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.6 8.2a4.7 4.7 0 0 1 9.1 1.6c0 3.3-4.7 3.6-4.7 6.2"/><path d="M12 20h.01"/></svg>`;
}

function modeHelpButtonHTML(){
  return `<button class="btn-icon mode-help-btn" style="${_modeHelpButtonsVisible?'':'display:none'}" onclick="showCurrentHelp()" title="Help">${_iconHelp()}</button>`;
}

function modeHelpSettingHTML(){
  return `<div class="settings-row"><span class="settings-row-label">Helpknop tonen</span><label class="toggle"><input type="checkbox" ${_modeHelpButtonsVisible?'checked':''} onchange="setModeHelpButtonsVisible(this.checked)"><span class="toggle-slider"></span></label></div>`;
}

function setModeHelpButtonsVisible(visible){
  _modeHelpButtonsVisible=!!visible;
  try{localStorage.setItem('sd_mode_help_buttons',String(_modeHelpButtonsVisible));}catch(e){}
  document.querySelectorAll('.mode-help-btn').forEach(btn=>{btn.style.display=_modeHelpButtonsVisible?'inline-flex':'none';});
}

/* ── LOAD SETS FROM /sets/ ── */
async function loadServerSets(){
  try{
    const baseURL=window.location.protocol==='file:'?'./sets/':'./sets/';
    const controller=new AbortController();
    const timeoutId=setTimeout(()=>controller.abort(),3000);
    const indexResp=await fetch(baseURL+'index.json',{signal:controller.signal});
    clearTimeout(timeoutId);
    if(indexResp.ok){
      const fileList=await indexResp.json();
      const serverSets={};
      for(const filename of fileList){
        try{
          let filePath=baseURL+filename;
          if(window.location.protocol==='file:') filePath=baseURL+encodeURIComponent(filename);
          const sr=await fetch(filePath);
          if(sr.ok){
            const content=await sr.text();
            let set=null;
            try{set=decodeVset(content.trim());}catch{try{set=JSON.parse(content.trim());}catch(e){}}
            if(set&&set.title){
              set.slug=set.slug||toSlug(set.title);
              serverSets[set.slug.toLowerCase()]=set;
            }
          }
        }catch(e){}
      }
      return serverSets;
    }
  }catch(e){}
  return {};
}

/* ══════════════════════════════════════════
   ONBOARDING (set.html)
══════════════════════════════════════════ */
const ONBOARD_DEFS = {
  set: {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="84" height="84" viewBox="0 0 256 256"><path data-name="Rectangle 20" fill="rgba(255,255,255,0)" d="M0 0h256v256H0z"/><path data-name="Path 220" d="M86.181 208.808c3.143-3.788 6.766-12.4 9.252-18.964 2.651-7 4.67-13.4 4.689-13.463a17.52 17.52 0 0 1 4.083-11.465 12.95 12.95 0 0 1 9.857-4.749v-17.212a128 128 0 0 0 16.356.952 83 83 0 0 0 11.524-.647v16.9a12.94 12.94 0 0 1 9.857 4.749 17.52 17.52 0 0 1 4.083 11.465v.012c.21.665 2.124 6.691 4.685 13.451 2.485 6.559 6.108 15.173 9.249 18.964-.309-.043-21.921-.063-41.871-.063-20.044.005-41.671.025-41.764.07" fill="var(--accent)" opacity=".6"/><path data-name="Path 219" d="M188.401 241.237H67.591c-5.125 0-9.294-4.849-9.294-10.81a23.37 23.37 0 0 1 5.444-15.286 17.26 17.26 0 0 1 13.142-6.332h9.293c-.063-.087 83.549-.087 83.64 0h9.293a17.26 17.26 0 0 1 13.142 6.332 23.37 23.37 0 0 1 5.444 15.287c.006 5.96-4.165 10.809-9.294 10.809" fill="var(--accent)"/><path data-name="Path 217" d="M82.969 125.4a47.4 47.4 0 0 1-7.945-3.8 58.2 58.2 0 0 1-16.992-15.755 77.9 77.9 0 0 1-11.421-22.91 93 93 0 0 1-4.179-27.857c0-.664.007-1.342.021-2.015a14.7 14.7 0 0 1 2.14-7.462 9.23 9.23 0 0 1 5.188-4.108 300 300 0 0 1 13.759-3.458c-.072 15.476.087 32.967.429 46.79.255 10.389 6.321 21.972 11.363 29.86 2.854 4.464 5.728 8.289 7.636 10.712Zm91.884-.264c1.894-2.4 4.743-6.186 7.564-10.62a85.6 85.6 0 0 0 8.384-16.573 65 65 0 0 0 2.553-18.082c.246-20.38.294-31.326.181-41.832a300 300 0 0 1 13.8 3.468 9.23 9.23 0 0 1 5.188 4.108 14.7 14.7 0 0 1 2.139 7.462c.014.658.022 1.336.022 2.015a93 93 0 0 1-4.179 27.857 77.9 77.9 0 0 1-11.421 22.91 58.2 58.2 0 0 1-16.987 15.751 47.7 47.7 0 0 1-7.241 3.533Z" fill="var(--accent)" opacity=".4"/><path data-name="Path 212" d="M130.416 143.908a115 115 0 0 1-18.13-1.237 64.5 64.5 0 0 1-14.307-5.571 65 65 0 0 1-12.423-8.637h-.099a136 136 0 0 1-10.125-13.773c-5.043-7.889-11.108-19.473-11.363-29.86-.357-14.478-.6-37.173-.325-58.651a8.01 8.01 0 0 1 7.11-8A527 527 0 0 1 128.5 15a527 527 0 0 1 57.748 3.177 8.01 8.01 0 0 1 7.109 8c.283 15.3.353 24.489 0 53.684a65 65 0 0 1-2.553 18.082 85.6 85.6 0 0 1-8.385 16.573 128 128 0 0 1-10.216 13.855l.148.059h-.022c-.3.011-.588.023-.886.032a65 65 0 0 1-12.421 8.638 64.5 64.5 0 0 1-14.307 5.573c-2.488.784-7.699 1.235-14.299 1.235" fill="var(--accent)"/></svg>',
    title: 'Een set geopend!',
    desc: 'Kies een oefenmodus om te beginnen, of bekijk alle begrippen hieronder.',
    features: [
      { icon: '<svg width="32px" height="32px" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><g transform="translate(-3598 1414)"><path data-name="Rectangle 30" fill="rgba(149,0,0,0)" d="M3598-1414h256v256h-256z"/><rect data-name="Rectangle 40" width="256" height="164" rx="33" transform="translate(3598 -1368)" fill="var(--text)" opacity=".6"/><path data-name="Path 182" d="m3713.357-1165.764-.292-97.8h-42.029c-5.654 0-9.656-7.638-7.889-15.059l60.1-125.777c6.014-12.673 15.425-12.283 15.4-1.832l.292 97.8h42.029c5.655 0 9.656 7.639 7.889 15.059l-60.1 125.783c-3.1 6.534-7.105 9.6-10.253 9.6-2.96-.01-5.16-2.71-5.147-7.774" fill="var(--text)"/></g></svg>', title: 'Flitskaarten', desc: 'Handig voor lange definities. Klik om de kaart om te draaien.' },
      { icon: '<svg width="32px" height="32px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path data-name="Rectangle 30" fill="rgba(149,0,0,0)" d="M0 0h256v256H0z"/><g data-name="Group 22" fill="var(--text)"><path data-name="Path 183" d="M104.824 240.655a114 114 0 0 1-21.587-6.727A115 115 0 0 1 63.7 223.283a116 116 0 0 1-17.02-14.1A116 116 0 0 1 32.64 192.1a115.5 115.5 0 0 1-10.6-19.612 115 115 0 0 1-6.7-21.671 116.8 116.8 0 0 1-2.34-23.27 115.6 115.6 0 0 1 6.693-38.905 115.1 115.1 0 0 1 18.53-33.252 115.5 115.5 0 0 1 28.042-25.266A113.9 113.9 0 0 1 101.5 15.176v24.293c-38.352 11.654-65.137 47.873-65.137 88.079 0 50.73 41.111 92 91.641 92s91.641-41.272 91.641-92v-.451h22.911v-9.828c.3 3.4.449 6.861.449 10.279a116.8 116.8 0 0 1-2.336 23.268 115.3 115.3 0 0 1-6.7 21.671 115.5 115.5 0 0 1-10.6 19.612 116 116 0 0 1-14.042 17.086 116 116 0 0 1-17.02 14.1 115 115 0 0 1-19.534 10.645 114 114 0 0 1-21.587 6.727A115.4 115.4 0 0 1 128 243a115.4 115.4 0 0 1-23.176-2.345M219.642 127.1a11.66 11.66 0 0 1 11.771-11.3 11.68 11.68 0 0 1 11.137 8.438v2.855Zm-4.176-27.873a90.6 90.6 0 0 0-5.329-13.2 11.613 11.613 0 0 1 5.266-15.594 11.7 11.7 0 0 1 15.656 5.245q1.908 3.825 3.533 7.808l.051.126.024.059v.009l.024.058.023.058v.012l.023.058.023.054v.011l.023.056v.011l.021.053c.011.027 0 0 0 .007s.015.037.023.055 0 .007.006.015l.022.055v.011l.02.05v.012l.022.054s.006.014.006.018.013.031.019.046v.01l.021.053q-.002.01.008.02c.01.01.013.034.02.052l.006.015.017.042.007.02.02.05.008.019.015.039.01.025c0 .014.01.028.016.041l.01.024.015.038c0 .01.01.024.013.033l.012.031.01.026.018.045.01.028c0 .009.007.02.011.028s.01.027.015.041l.011.028.012.03.011.029.016.042q.002.013.01.027c.008.014.01.028.018.045l.01.025.013.033.006.019.022.056.007.018c0 .014.007.019.013.033l.007.019.021.054.008.021.042.109v.012l.027.068v.007l.015.039.027.071v.013l.044.115.029.077.044.118v.008l.044.119.075.2v.007l.12.324.12.326c.242.658.475 1.313.706 1.976v.007l.042.121.07.2v.01q.022.059.04.118v.007l.023.068v.014l.012.037v.011l.021.063.007.02.02.06v.015c0 .011.008.024.012.035l.006.018.019.057.006.019.011.034v.014l.021.061.006.021.017.05c0 .008.006.016.009.025l.01.031.008.027.015.045c0 .009.006.019.009.028l.011.03c.005.011.01.03.015.045l.008.025.011.033.008.024c0 .016.01.032.015.048l.009.025.012.037c0 .007.008.024.01.031l.013.038.007.023.017.052.006.016.015.046v.014l.018.055.006.017.019.057.019.059v.013l.019.058v.008l.019.057v.007l.02.061v.008l.041.127.021.066.043.134.214.671a11.625 11.625 0 0 1-7.652 14.58 11.7 11.7 0 0 1-3.5.535 11.68 11.68 0 0 1-11.024-8.116ZM193.619 62.85a92.5 92.5 0 0 0-10.766-9.413 11.6 11.6 0 0 1-2.35-16.284 11.71 11.71 0 0 1 16.343-2.345l.023.017.017.012.044.033.019.014.028.021.015.011.047.036.017.012.044.033.019.014.027.02.022.017.04.029.021.015.038.029.023.017.027.02.022.016.036.028.024.019.024.018.038.029.023.017.024.018.036.028.026.019.023.017.035.027.026.02.024.019.023.017.038.028.024.019.027.02.032.024.027.021.021.016.04.031.019.015.029.022.026.019.033.025.02.016.039.029.021.016.029.023.019.015.04.031.02.016.035.026.021.016.033.026.018.013.042.032.018.014.032.025.02.016.039.03.016.012.043.033.016.012.034.026.015.011.043.033.018.014.042.033.011.009.039.03.015.011.044.034.015.011.04.032.007.006.047.037.012.01.048.037.007.006.046.036h.006l.049.037.01.009.049.039.05.038.007.007.049.039.007.006.049.038.049.039.009.007.049.04.05.04.05.04.008.007.051.041.051.041h.006l.051.041.107.085.053.042.107.085.434.349a115 115 0 0 1 8.81 7.9l.147.147.093.093.007.007.044.044.008.008.038.038.008.008.041.041.012.011.04.041.012.012.032.033.013.013.038.038.017.017.032.032.017.017.028.029.019.018.035.036.019.019.021.022.034.034.019.019.023.023.018.019.038.038.014.014.083.084.008.008.051.052.089.09.034.034a11.6 11.6 0 0 1-.215 16.445 11.67 11.67 0 0 1-8.153 3.3 11.67 11.67 0 0 1-8.327-3.476Zm-35.962-22.683a91.4 91.4 0 0 0-13.834-3.528 11.64 11.64 0 0 1-9.508-13.453 11.676 11.676 0 0 1 13.489-9.474q5.064.876 9.968 2.184l.128.034.127.034.075.021h.012l.12.032h.01l.118.032h.016l.061.017h.018l.036.01h.015l.064.018h.016l.036.01h.013l.063.017.022.006.053.015.024.007.033.01.023.006.048.014.028.008.03.008.037.011.036.01.032.008.027.008.049.014.023.006.037.011.021.007.052.015.021.006.045.013.023.006.044.012h.018l.057.016h.013l.049.013h.015l.055.016h.017l.052.015h.007l.059.017h.014l.06.017.058.017h.014l.059.017h.007l.058.017h.006l.062.018h.006l.128.037q2.514.729 4.981 1.57a11.62 11.62 0 0 1 7.275 14.77 11.68 11.68 0 0 1-11.051 7.874 11.7 11.7 0 0 1-3.77-.574ZM101.5 15.073l.065-.015h.007l.129-.031h.006l.133-.031.068-.015.135-.031.133-.031.133-.03.2-.046.133-.03.134-.03.068-.015.135-.03.133-.029.134-.029.341-.074.136-.029.205-.044.137-.029.136-.028q.412-.086.826-.17l.827-.163.136-.026.133-.026.2-.039.134-.025h.006l.134-.025.137-.026.068-.012.133-.024h.006l.132-.024h.006l.134-.024.066-.012.133-.024h.007l.131-.024h.006l.066-.012.065-.011h.006l.065-.011h.009l.061-.011.063-.011h.011l.125-.022h.015l.061-.011h.007l.057-.01h.012l.061-.011h.011l.056-.01h.009l.061-.01h.015l.059-.011h.006l.056-.01h.019l.057-.009h.016l.048-.008h.016l.057-.01h.018l.048-.008h.015l.057-.01h.019l.053-.009h.013l.053-.009h.019l.057-.009h.018l.042-.007h.023l.053-.009h.023l.039-.006h.022l.052-.008h.026l.036-.006.04-.007.035-.006h.028l.04-.007.036-.006h.06l.049-.007h.058l.051-.008h.086l.055-.009h.023l.035-.006h.027l.053-.008h.023l.036-.006h.013l.066-.011h.021l.068-.011h.011l.038-.006h.019l.061-.009h.019l.038-.006h.011l.074-.011h.012l.126-.019h.006q.62-.093 1.243-.179a11.673 11.673 0 0 1 13.161 9.924 11.64 11.64 0 0 1-9.962 13.123 92 92 0 0 0-13.748 3Z" opacity=".6"/><path data-name="Path 184" d="M206 138a25 25 0 0 1 25-25 25 25 0 0 1 25 25 25 25 0 0 1-25 25 25 25 0 0 1-25-25M79 25a25 25 0 0 1 25-25 25 25 0 0 1 25 25 25 25 0 0 1-25 25 25 25 0 0 1-25-25"/></g></svg>', title: 'Stampen', desc: 'Typ het antwoord in — de meest effectieve methode.' },
      { icon: '<svg height="32px" width="32px" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><g transform="translate(-3598 1414)"><path data-name="Rectangle 30" fill="rgba(149,0,0,0)" d="M3598-1414h256v256h-256z"/><path data-name="Path 187" d="M3802-1158h-151a15.9 15.9 0 0 1-11.313-4.686A15.9 15.9 0 0 1 3635-1174v-224a15.9 15.9 0 0 1 4.686-11.314A15.9 15.9 0 0 1 3651-1414h117l50 50v190a15.9 15.9 0 0 1-4.686 11.314A15.9 15.9 0 0 1 3802-1158" fill="var(--text)" opacity=".4"/><rect data-name="Rectangle 41" width="112" height="7" rx="3.5" transform="translate(3661 -1331)" fill="var(--text)" opacity=".6"/><rect data-name="Rectangle 42" width="130" height="7" rx="3.5" transform="translate(3661 -1314)" fill="var(--text)" opacity=".6"/><rect data-name="Rectangle 43" width="109" height="7" rx="3.5" transform="translate(3661 -1298)" fill="var(--text)" opacity=".6"/><rect data-name="Rectangle 44" width="80" height="7" rx="3.5" transform="translate(3661 -1281)" fill="var(--text)" opacity=".6"/><rect data-name="Rectangle 45" width="91" height="7" rx="3.5" transform="translate(3661 -1264)" fill="var(--text)" opacity=".6"/><rect data-name="Rectangle 46" width="40" height="7" rx="3.5" transform="translate(3661 -1248)" fill="var(--text)" opacity=".6"/><path data-name="Path 186" d="M3768-1414v34a15.9 15.9 0 0 0 4.686 11.314A15.9 15.9 0 0 0 3784-1364h34z" fill="var(--text)"/></g></svg>', title: 'Overhoren', desc: 'Maak een volledige oefentoets en zie je score achteraf.' },
    ]
  },
  flashcards: {
    icon: '<svg width="84" height="84" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><g transform="translate(-3598 1414)"><path data-name="Rectangle 30" fill="rgba(149,0,0,0)" d="M3598-1414h256v256h-256z"/><rect data-name="Rectangle 40" width="256" height="164" rx="33" transform="translate(3598 -1368)" fill="var(--accent)" opacity=".6"/><path data-name="Path 182" d="m3713.357-1165.764-.292-97.8h-42.029c-5.654 0-9.656-7.638-7.889-15.059l60.1-125.777c6.014-12.673 15.425-12.283 15.4-1.832l.292 97.8h42.029c5.655 0 9.656 7.639 7.889 15.059l-60.1 125.783c-3.1 6.534-7.105 9.6-10.253 9.6-2.96-.01-5.16-2.71-5.147-7.774" fill="var(--accent)"/></g></svg>',
    title: 'Flitskaarten',
    desc: 'Klik op de kaart om hem om te draaien. Geef aan of je het wist of niet.',
    features: [
      { icon: '→', title: 'Wist ik!', desc: 'Druk op de groene knop of pijltje rechts.' },
      { icon: '←', title: 'Wist ik niet', desc: 'Druk op de rode knop of pijltje links.' },
      { icon: '⎵', title: 'Omdraaien', desc: 'Druk op spatie of klik op de kaart.' },
    ]
  },
  stampen: {
    icon: '<svg width="84" height="84" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path data-name="Rectangle 30" fill="rgba(149,0,0,0)" d="M0 0h256v256H0z"/><g data-name="Group 22" fill="var(--accent)"><path data-name="Path 183" d="M104.824 240.655a114 114 0 0 1-21.587-6.727A115 115 0 0 1 63.7 223.283a116 116 0 0 1-17.02-14.1A116 116 0 0 1 32.64 192.1a115.5 115.5 0 0 1-10.6-19.612 115 115 0 0 1-6.7-21.671 116.8 116.8 0 0 1-2.34-23.27 115.6 115.6 0 0 1 6.693-38.905 115.1 115.1 0 0 1 18.53-33.252 115.5 115.5 0 0 1 28.042-25.266A113.9 113.9 0 0 1 101.5 15.176v24.293c-38.352 11.654-65.137 47.873-65.137 88.079 0 50.73 41.111 92 91.641 92s91.641-41.272 91.641-92v-.451h22.911v-9.828c.3 3.4.449 6.861.449 10.279a116.8 116.8 0 0 1-2.336 23.268 115.3 115.3 0 0 1-6.7 21.671 115.5 115.5 0 0 1-10.6 19.612 116 116 0 0 1-14.042 17.086 116 116 0 0 1-17.02 14.1 115 115 0 0 1-19.534 10.645 114 114 0 0 1-21.587 6.727A115.4 115.4 0 0 1 128 243a115.4 115.4 0 0 1-23.176-2.345M219.642 127.1a11.66 11.66 0 0 1 11.771-11.3 11.68 11.68 0 0 1 11.137 8.438v2.855Zm-4.176-27.873a90.6 90.6 0 0 0-5.329-13.2 11.613 11.613 0 0 1 5.266-15.594 11.7 11.7 0 0 1 15.656 5.245q1.908 3.825 3.533 7.808l.051.126.024.059v.009l.024.058.023.058v.012l.023.058.023.054v.011l.023.056v.011l.021.053c.011.027 0 0 0 .007s.015.037.023.055 0 .007.006.015l.022.055v.011l.02.05v.012l.022.054s.006.014.006.018.013.031.019.046v.01l.021.053q-.002.01.008.02c.01.01.013.034.02.052l.006.015.017.042.007.02.02.05.008.019.015.039.01.025c0 .014.01.028.016.041l.01.024.015.038c0 .01.01.024.013.033l.012.031.01.026.018.045.01.028c0 .009.007.02.011.028s.01.027.015.041l.011.028.012.03.011.029.016.042q.002.013.01.027c.008.014.01.028.018.045l.01.025.013.033.006.019.022.056.007.018c0 .014.007.019.013.033l.007.019.021.054.008.021.042.109v.012l.027.068v.007l.015.039.027.071v.013l.044.115.029.077.044.118v.008l.044.119.075.2v.007l.12.324.12.326c.242.658.475 1.313.706 1.976v.007l.042.121.07.2v.01q.022.059.04.118v.007l.023.068v.014l.012.037v.011l.021.063.007.02.02.06v.015c0 .011.008.024.012.035l.006.018.019.057.006.019.011.034v.014l.021.061.006.021.017.05c0 .008.006.016.009.025l.01.031.008.027.015.045c0 .009.006.019.009.028l.011.03c.005.011.01.03.015.045l.008.025.011.033.008.024c0 .016.01.032.015.048l.009.025.012.037c0 .007.008.024.01.031l.013.038.007.023.017.052.006.016.015.046v.014l.018.055.006.017.019.057.019.059v.013l.019.058v.008l.019.057v.007l.02.061v.008l.041.127.021.066.043.134.214.671a11.625 11.625 0 0 1-7.652 14.58 11.7 11.7 0 0 1-3.5.535 11.68 11.68 0 0 1-11.024-8.116ZM193.619 62.85a92.5 92.5 0 0 0-10.766-9.413 11.6 11.6 0 0 1-2.35-16.284 11.71 11.71 0 0 1 16.343-2.345l.023.017.017.012.044.033.019.014.028.021.015.011.047.036.017.012.044.033.019.014.027.02.022.017.04.029.021.015.038.029.023.017.027.02.022.016.036.028.024.019.024.018.038.029.023.017.024.018.036.028.026.019.023.017.035.027.026.02.024.019.023.017.038.028.024.019.027.02.032.024.027.021.021.016.04.031.019.015.029.022.026.019.033.025.02.016.039.029.021.016.029.023.019.015.04.031.02.016.035.026.021.016.033.026.018.013.042.032.018.014.032.025.02.016.039.03.016.012.043.033.016.012.034.026.015.011.043.033.018.014.042.033.011.009.039.03.015.011.044.034.015.011.04.032.007.006.047.037.012.01.048.037.007.006.046.036h.006l.049.037.01.009.049.039.05.038.007.007.049.039.007.006.049.038.049.039.009.007.049.04.05.04.05.04.008.007.051.041.051.041h.006l.051.041.107.085.053.042.107.085.434.349a115 115 0 0 1 8.81 7.9l.147.147.093.093.007.007.044.044.008.008.038.038.008.008.041.041.012.011.04.041.012.012.032.033.013.013.038.038.017.017.032.032.017.017.028.029.019.018.035.036.019.019.021.022.034.034.019.019.023.023.018.019.038.038.014.014.083.084.008.008.051.052.089.09.034.034a11.6 11.6 0 0 1-.215 16.445 11.67 11.67 0 0 1-8.153 3.3 11.67 11.67 0 0 1-8.327-3.476Zm-35.962-22.683a91.4 91.4 0 0 0-13.834-3.528 11.64 11.64 0 0 1-9.508-13.453 11.676 11.676 0 0 1 13.489-9.474q5.064.876 9.968 2.184l.128.034.127.034.075.021h.012l.12.032h.01l.118.032h.016l.061.017h.018l.036.01h.015l.064.018h.016l.036.01h.013l.063.017.022.006.053.015.024.007.033.01.023.006.048.014.028.008.03.008.037.011.036.01.032.008.027.008.049.014.023.006.037.011.021.007.052.015.021.006.045.013.023.006.044.012h.018l.057.016h.013l.049.013h.015l.055.016h.017l.052.015h.007l.059.017h.014l.06.017.058.017h.014l.059.017h.007l.058.017h.006l.062.018h.006l.128.037q2.514.729 4.981 1.57a11.62 11.62 0 0 1 7.275 14.77 11.68 11.68 0 0 1-11.051 7.874 11.7 11.7 0 0 1-3.77-.574ZM101.5 15.073l.065-.015h.007l.129-.031h.006l.133-.031.068-.015.135-.031.133-.031.133-.03.2-.046.133-.03.134-.03.068-.015.135-.03.133-.029.134-.029.341-.074.136-.029.205-.044.137-.029.136-.028q.412-.086.826-.17l.827-.163.136-.026.133-.026.2-.039.134-.025h.006l.134-.025.137-.026.068-.012.133-.024h.006l.132-.024h.006l.134-.024.066-.012.133-.024h.007l.131-.024h.006l.066-.012.065-.011h.006l.065-.011h.009l.061-.011.063-.011h.011l.125-.022h.015l.061-.011h.007l.057-.01h.012l.061-.011h.011l.056-.01h.009l.061-.01h.015l.059-.011h.006l.056-.01h.019l.057-.009h.016l.048-.008h.016l.057-.01h.018l.048-.008h.015l.057-.01h.019l.053-.009h.013l.053-.009h.019l.057-.009h.018l.042-.007h.023l.053-.009h.023l.039-.006h.022l.052-.008h.026l.036-.006.04-.007.035-.006h.028l.04-.007.036-.006h.06l.049-.007h.058l.051-.008h.086l.055-.009h.023l.035-.006h.027l.053-.008h.023l.036-.006h.013l.066-.011h.021l.068-.011h.011l.038-.006h.019l.061-.009h.019l.038-.006h.011l.074-.011h.012l.126-.019h.006q.62-.093 1.243-.179a11.673 11.673 0 0 1 13.161 9.924 11.64 11.64 0 0 1-9.962 13.123 92 92 0 0 0-13.748 3Z" opacity=".6"/><path data-name="Path 184" d="M206 138a25 25 0 0 1 25-25 25 25 0 0 1 25 25 25 25 0 0 1-25 25 25 25 0 0 1-25-25M79 25a25 25 0 0 1 25-25 25 25 0 0 1 25 25 25 25 0 0 1-25 25 25 25 0 0 1-25-25"/></g></svg>',
    title: 'Stampen',
    desc: 'Type het juiste antwoord in. Fouten komen automatisch terug voor herhaling.',
    features: [
      { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 256 256"><path data-name="Rectangle 20" fill="rgba(255,255,255,0)" d="M0 0h256v256H0z"/><g data-name="Group 31" transform="translate(-2426.382 -906.135)" fill="var(--text)"><rect data-name="Rectangle 58" width="103.785" height="42.999" rx="14" transform="rotate(40 -154.55 3922.286)" opacity=".6"/><path data-name="Path 234" d="m2503.766 1089.176 105.7-126.96a13.726 13.726 0 0 1 19.441-1.715l11.326 9.577a13.984 13.984 0 0 1 1.702 19.596l-96.83 116.306a13.726 13.726 0 0 1-19.442 1.714Z"/></g></svg>', title: 'Correct antwoord', desc: 'Tikfouten worden soepel beoordeeld.' },
      { icon: '<svg height="32" width="32" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256.001 256"><path data-name="Rectangle 20" fill="rgba(0,0,0,0)" d="M0 0h256v256H0z"/><g data-name="Group 16" fill="var(--text)"><path data-name="Path 187" d="M25.153 210.575H21.61a14.69 14.69 0 0 1-14.757-14.623 14.693 14.693 0 0 1 14.759-14.625h163.541a41.187 41.187 0 0 0 41.327-40.952 41.187 41.187 0 0 0-41.327-40.95H23.974v-29.25h161.179a71 71 0 0 1 27.577 5.517 70.7 70.7 0 0 1 22.52 15.045 69.9 69.9 0 0 1 15.183 22.315 69.2 69.2 0 0 1 5.568 27.325 69.2 69.2 0 0 1-5.568 27.326 70 70 0 0 1-15.18 22.313 70.7 70.7 0 0 1-22.52 15.045 71 71 0 0 1-27.58 5.514Z" opacity=".6"/><path data-name="Path 188" d="M5.915 93.479a9.329 9.329 0 0 1 0-17.362L81.022 46.11a9.438 9.438 0 0 1 12.979 8.681v60.018a9.438 9.438 0 0 1-12.979 8.682Z"/></g></svg>', title: 'Herhaling', desc: 'Fout beantwoorde termen komen na een checkpoint terug.' },
    ]
  },
  overhoren: {
    icon: '<svg height="84" width="84" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><g transform="translate(-3598 1414)"><path data-name="Rectangle 30" fill="rgba(149,0,0,0)" d="M3598-1414h256v256h-256z"/><path data-name="Path 187" d="M3802-1158h-151a15.9 15.9 0 0 1-11.313-4.686A15.9 15.9 0 0 1 3635-1174v-224a15.9 15.9 0 0 1 4.686-11.314A15.9 15.9 0 0 1 3651-1414h117l50 50v190a15.9 15.9 0 0 1-4.686 11.314A15.9 15.9 0 0 1 3802-1158" fill="var(--accent)" opacity=".4"/><rect data-name="Rectangle 41" width="112" height="7" rx="3.5" transform="translate(3661 -1331)" fill="var(--accent)" opacity=".6"/><rect data-name="Rectangle 42" width="130" height="7" rx="3.5" transform="translate(3661 -1314)" fill="var(--accent)" opacity=".6"/><rect data-name="Rectangle 43" width="109" height="7" rx="3.5" transform="translate(3661 -1298)" fill="var(--accent)" opacity=".6"/><rect data-name="Rectangle 44" width="80" height="7" rx="3.5" transform="translate(3661 -1281)" fill="var(--accent)" opacity=".6"/><rect data-name="Rectangle 45" width="91" height="7" rx="3.5" transform="translate(3661 -1264)" fill="var(--accent)" opacity=".6"/><rect data-name="Rectangle 46" width="40" height="7" rx="3.5" transform="translate(3661 -1248)" fill="var(--accent)" opacity=".6"/><path data-name="Path 186" d="M3768-1414v34a15.9 15.9 0 0 0 4.686 11.314A15.9 15.9 0 0 0 3784-1364h34z" fill="var(--accent)"/></g></svg>',
    title: 'Overhoren',
    desc: 'Beantwoord alle vragen en lever dan in. Je ziet het resultaat pas daarna.',
    features: [
      { icon: '<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><g transform="translate(-2433 -926)"><path data-name="Rectangle 20" fill="rgba(0,0,0,0)" d="M2433 926h256v256h-256z"/><path data-name="Subtraction 1" d="M2674 1114h-169.013a30 30 0 0 0 4.013-15 30 30 0 0 0-4.013-15H2674a14.9 14.9 0 0 1 10.606 4.394A14.9 14.9 0 0 1 2689 1099a14.9 14.9 0 0 1-4.393 10.606A14.9 14.9 0 0 1 2674 1114m-220.987 0H2448a14.9 14.9 0 0 1-10.606-4.393A14.9 14.9 0 0 1 2433 1099a14.9 14.9 0 0 1 4.393-10.606A14.9 14.9 0 0 1 2448 1084h5.015a30 30 0 0 0-4.014 15 30 30 0 0 0 4.012 15M2674 1024h-25.013a30 30 0 0 0 4.013-15 30 30 0 0 0-4.013-15H2674a14.9 14.9 0 0 1 10.606 4.394A14.9 14.9 0 0 1 2689 1009a14.9 14.9 0 0 1-4.393 10.605A14.9 14.9 0 0 1 2674 1024m-76.987 0H2448a14.9 14.9 0 0 1-10.606-4.393A14.9 14.9 0 0 1 2433 1009a14.9 14.9 0 0 1 4.393-10.607A14.9 14.9 0 0 1 2448 994h149.014a30 30 0 0 0-4.013 15 30 30 0 0 0 4.012 15" fill="var(--text)" opacity=".6"/><rect data-name="Rectangle 56" width="60" height="60" rx="30" transform="translate(2593 979)" fill="var(--text)" opacity=".4"/><rect data-name="Rectangle 55" width="60" height="60" rx="30" transform="translate(2449 1069)" fill="var(--text)" opacity=".4"/><path data-name="Rectangle 53" d="M2623 995a14 14 0 1 0 14 14 14.016 14.016 0 0 0-14-14m0-16a30 30 0 1 1-30 30 30 30 0 0 1 30-30" fill="var(--text)"/><path data-name="Rectangle 54" d="M2479 1085a14 14 0 1 0 14 14 14.016 14.016 0 0 0-14-14m0-16a30 30 0 1 1-30 30 30 30 0 0 1 30-30" fill="var(--text)"/></g></svg>', title: 'Meerkeuze of open', desc: 'Kies je voorkeur via de instellingen.' },
      { icon: '<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path data-name="Rectangle 17" fill="rgba(152,37,37,0)" d="M0 0h256v256H0z"/><g data-name="Group 13" transform="rotate(45 2187.158 -2777.125)" fill="var(--text)"><path data-name="Path 170" d="M2785 888.133a7.9 7.9 0 0 1-3.778-.941 7 7 0 0 1-2.831-2.824l-17.6-32.459a6.4 6.4 0 0 1-.779-2.688h49.978a6.4 6.4 0 0 1-.779 2.688l-17.6 32.459a7.03 7.03 0 0 1-2.831 2.824 7.9 7.9 0 0 1-3.78.941m25-54.655h-50V600.523a21.35 21.35 0 0 1 1.965-8.969 23 23 0 0 1 5.358-7.324 25.1 25.1 0 0 1 7.947-4.938 26.7 26.7 0 0 1 9.731-1.811 26.7 26.7 0 0 1 9.731 1.811 25.1 25.1 0 0 1 7.947 4.938 23 23 0 0 1 5.358 7.324 21.4 21.4 0 0 1 1.965 8.969v232.954Zm-24.5-237.083c-4.687 0-8.5 3.515-8.5 7.834v216.6c0 4.32 3.813 7.835 8.5 7.835s8.5-3.515 8.5-7.835v-216.6c0-4.32-3.81-7.835-8.499-7.835Z"/><rect data-name="Rectangle 19" width="17" height="232.271" rx="8.5" transform="translate(2777 596.393)" opacity=".6"/></g></svg>', title: 'Wijzigen', desc: 'Je kunt antwoorden aanpassen vóór het inleveren.' },
      { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 256 256"><path data-name="Rectangle 20" fill="rgba(255,255,255,0)" d="M0 0h256v256H0z"/><g data-name="Group 31" transform="translate(-2426.382 -906.135)" fill="var(--text)"><rect data-name="Rectangle 58" width="103.785" height="42.999" rx="14" transform="rotate(40 -154.55 3922.286)" opacity=".6"/><path data-name="Path 234" d="m2503.766 1089.176 105.7-126.96a13.726 13.726 0 0 1 19.441-1.715l11.326 9.577a13.984 13.984 0 0 1 1.702 19.596l-96.83 116.306a13.726 13.726 0 0 1-19.442 1.714Z"/></g></svg>', title: 'Resultaten', desc: 'Na het inleveren zie je elk antwoord terug met de correctie.' },
    ]
  }
};

let _onboardingNextStep=null;

function showOnboarding(key, force=false, nextStep=null) {
  const seen = JSON.parse(localStorage.getItem('sd_onboard') || '{}');
  if (!force && seen[key]) return false;
  seen[key] = true;
  localStorage.setItem('sd_onboard', JSON.stringify(seen));
  const d = ONBOARD_DEFS[key];
  if (!d) return false;
  _onboardingNextStep=typeof nextStep==='function'?nextStep:null;
  const el = document.createElement('div');
  el.className = 'onboard-overlay';
  el.id = 'onboard-overlay';
  el.innerHTML = `
    <div class="onboard-panel">
      <div class="onboard-handle"></div>
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

function dismissOnboardingOverlay(el,onDone){
  if(!el){if(onDone)onDone();return;}
  el.style.pointerEvents='none';
  const panel=el.querySelector('.onboard-panel');
  if(panel)panel.classList.add('closing');
  el.classList.add('closing');
  setTimeout(()=>{el.remove();if(onDone)onDone();},420);
}

function closeOnboarding() {
  const el=document.getElementById('onboard-overlay');
  if(!el)return;
  if(_onboardingNextStep){
    const nextStep=_onboardingNextStep;
    _onboardingNextStep=null;
    const keepOpen=nextStep(el);
    if(keepOpen!==false)return;
  }
  dismissOnboardingOverlay(el);
}

function showCurrentHelp() {
  const modeMap = { flashcards:'flashcards', stampen:'stampen', overhoren:'overhoren' };
  const key = modeMap[currentMode] || 'set';
  _onboardingNextStep=null;
  showOnboarding(key, true);
}

async function boot(){
  loadThemeSettings();
  initSetHeaderAccount();
  const params=new URLSearchParams(window.location.search);
  const slug=params.get('set');
  if(!slug){showError('Geen set opgegeven. Ga terug naar de <a href="index.html">startpagina</a>.');return;}
  const slugLower=slug.toLowerCase();

  const stored=JSON.parse(localStorage.getItem('sd_sets')||'[]');
  for(let s of stored){
    if((s.slug&&s.slug.toLowerCase()===slugLower)||(s.id&&s.id===slug)||(s.title&&toSlug(s.title)===slugLower)){
      SET=s;
      if(SET._cloud||SET._synced||SET._cloudSetId)await refreshOpenSyncedSet();
      if(SET)renderSetView();
      return;
    }
  }

  try{
    const baseURL=window.location.protocol==='file:'?'./sets/':'./sets/';
    let filePath=baseURL+slug+'.vset';
    if(window.location.protocol==='file:') filePath=baseURL+encodeURIComponent(slug+'.vset');
    const controller=new AbortController();
    const timeoutId=setTimeout(()=>controller.abort(),2000);
    const resp=await fetch(filePath,{signal:controller.signal});
    clearTimeout(timeoutId);
    if(resp.ok){
      const raw=await resp.text();
      try{SET=decodeVset(raw);}catch{SET=JSON.parse(raw);}
      SET.slug=slug;renderSetView();return;
    }
  }catch(e){}

  const serverSets=await loadServerSets();
  if(serverSets[slugLower]){SET=serverSets[slugLower];renderSetView();return;}
  showError(`Set "<strong>${esc(slug)}</strong>" niet gevonden.<br><a href="index.html">← Terug naar home</a>`);
}
function showError(msg){document.getElementById('loading').innerHTML=`<div style="font-size:48px;margin-bottom:16px">😕</div><div style="font-size:20px;font-weight:800;margin-bottom:12px">Set niet gevonden</div><p style="color:var(--text2);max-width:400px;line-height:1.6">${msg}</p><a href="index.html" class="btn btn-primary" style="margin-top:24px;text-decoration:none">← Terug naar home</a>`;}
function toSlug(str){return str.toLowerCase().replace(/[àáâäãåā]/g,'a').replace(/[èéêëē]/g,'e').replace(/[ìíîïī]/g,'i').replace(/[òóôöõøō]/g,'o').replace(/[ùúûüū]/g,'u').replace(/[ñ]/g,'n').replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-').slice(0,60)||'set';}

function isLocalSet(s){
  return s && !s.fromServer && !s._serverFile;
}

function normalizeOpenCloudTerms(raw){
  let data=raw;
  if(typeof data==='string'){try{data=JSON.parse(data)}catch(e){data=[]}}
  if(data&&!Array.isArray(data)&&Array.isArray(data.terms))data=data.terms;
  if(!Array.isArray(data))return[];
  return data.map((item,index)=>{
    if(Array.isArray(item))return{id:`cloud-term-${index}`,term:String(item[0]||''),def:String(item[1]||'')};
    return{
      ...item,
      id:item?.id||`cloud-term-${index}`,
      term:String(item?.term??item?.begrip??item?.question??''),
      def:String(item?.def??item?.definition??item?.definitie??item?.answer??'')
    };
  });
}

async function refreshOpenSyncedSet(){
  const cloudSetId=String(SET?._cloudSetId||(SET?._cloud?String(SET.id||'').replace(/^cloud_/,''):'')||'');
  if(!cloudSetId||!window.VeliosAuth)return false;
  try{
    const rows=await VeliosAuth.getSyncedSets();
    const item=rows.find(row=>String(row.set_id)===cloudSetId);
    if(!item?.sets){
      const stored=JSON.parse(localStorage.getItem('sd_sets')||'[]');
      localStorage.setItem('sd_sets',JSON.stringify(stored.filter(set=>set.id!==SET.id&&String(set._cloudSetId||'')!==cloudSetId)));
      SET=null;
      window.location.href='index.html#home';
      return false;
    }
    const cloud=item.sets;
    let cloudData=cloud.data;
    if(typeof cloudData==='string'){try{cloudData=JSON.parse(cloudData)}catch(e){cloudData=[]}}
    const next={
      ...SET,
      title:cloud.naam||cloud.title||SET.title||'Naamloze set',
      description:cloud.beschrijving||cloud.description||'',
      vak:cloud.vak||'',
      datum:formatSetDate(cloudData?.datum||cloud.datum||cloud.updated_at||cloud.created_at||item.synced_at),
      terms:normalizeOpenCloudTerms(cloud.data),
      _cloudSetId:cloudSetId,
      _syncedAt:item.synced_at
    };
    const before=JSON.stringify([SET.title,SET.description,SET.vak,SET.datum,SET.terms]);
    const after=JSON.stringify([next.title,next.description,next.vak,next.datum,next.terms]);
    SET=next;
    const stored=JSON.parse(localStorage.getItem('sd_sets')||'[]');
    const index=stored.findIndex(set=>set.id===SET.id||String(set._cloudSetId||'')===cloudSetId);
    if(index>=0)stored[index]=SET;else stored.push(SET);
    localStorage.setItem('sd_sets',JSON.stringify(stored));
    return before!==after;
  }catch(error){
    console.warn('Geopende cloudset kon niet worden vernieuwd:',error.message);
    return false;
  }
}

function renderSetView(){
  setNavigationChromeVisible(true);
  renderSetRecentSidebar();
  try{
    const opened=JSON.parse(localStorage.getItem('sd_opened_sets')||'[]');
    if(SET.id&&!opened.includes(SET.id)){
      opened.push(SET.id);
      localStorage.setItem('sd_opened_sets',JSON.stringify(opened));
    }
  }catch(e){}
  document.title=`${SET.title} — Velios+`;
  document.getElementById('nav-set-title').textContent=SET.title;
const navRight = document.getElementById('nav-right-btns');
if (navRight) navRight.style.display = 'flex';
showOnboarding('set');

  const isLocal=isLocalSet(SET);
  const localActions=document.getElementById('local-set-actions');
  if(localActions) localActions.style.display=isLocal?'block':'none';

  // Auto-save local sets as offline
  if(isLocal&&!isSetOffline()){
    let offline=getOfflineSets();
    offline.push({id:SET.id,slug:SET.slug,title:SET.title});
    saveOfflineSets(offline);
  }

  // Hide offline actions and divider for local sets
  const offlineActions=document.getElementById('offline-actions');
  const offlineDivider=document.getElementById('offline-divider');
  if(offlineActions) offlineActions.style.display=isLocal?'none':'block';
  if(offlineDivider) offlineDivider.style.display=isLocal?'none':'block';

  // Laad ster-modus vanuit opslag
  loadStarMode();

  const el=document.getElementById('main-screen');
  // De begrippenlijst krijgt hieronder een eigen, vertraagde fade-in.
  // Animeer daarom niet het hele scherm: dan zou de lijst alsnog meebewegen.
  el.style.animation='none';

  // ── Bereken hoogte van de 3 mode-cards voor de kaart
  // Kaart breedte = 0.5x breedte van de 3 mode-cards samen (incl gap)
  // We zetten dit via CSS: de mode-grid heeft een vaste breedte, de kaart is 0.5x daarvan

  el.innerHTML=`
    <button class="back-btn set-view-enter" onclick="window.location.href='index.html'">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      Alle sets
    </button>
    <div class="set-view-heading set-view-enter" style="margin-bottom:28px">
          <div class="set-detail-title">${esc(SET.title)}</div>
          ${SET.description?`<p style="color:var(--text2);margin-bottom:10px">${esc(SET.description)}</p>`:''}
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <span class="badge badge-purple">${SET.terms.length} begrippen</span>
            ${SET.vak?`<span class="badge badge-orange">${esc(SET.vak)}</span>`:''}
            ${formatSetDate(SET.datum)?`<span class="badge badge-gray">${formatSetDate(SET.datum)}</span>`:''}
          </div>
        </div>
    <div class="set-detail-layout">
      <div class="set-detail-left">
        <div class="mode-grid set-view-enter" id="mode-grid">
          <div class="mode-card" id="mc-flash" onclick="startModeFiltered('flashcards')"><div class="mode-card-icon"><svg width="30px" height="30px" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><g transform="translate(-3598 1414)"><path data-name="Rectangle 30" fill="rgba(149,0,0,0)" d="M3598-1414h256v256h-256z"/><rect data-name="Rectangle 40" width="256" height="164" rx="33" transform="translate(3598 -1368)" fill="var(--accent)" opacity=".6"/><path data-name="Path 182" d="m3713.357-1165.764-.292-97.8h-42.029c-5.654 0-9.656-7.638-7.889-15.059l60.1-125.777c6.014-12.673 15.425-12.283 15.4-1.832l.292 97.8h42.029c5.655 0 9.656 7.639 7.889 15.059l-60.1 125.783c-3.1 6.534-7.105 9.6-10.253 9.6-2.96-.01-5.16-2.71-5.147-7.774" fill="var(--accent)"/></g></svg></div><div class="mode-card-title">Flitskaarten</div><div class="mode-card-desc">Handig voor lange definities</div></div>
          <div class="mode-card" id="mc-stamp" onclick="startModeFiltered('stampen')"><div class="mode-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 256 256"><path data-name="Rectangle 30" fill="rgba(149,0,0,0)" d="M0 0h256v256H0z"/><g data-name="Group 22" fill="var(--accent)"><path data-name="Path 183" d="M104.824 240.655a114 114 0 0 1-21.587-6.727A115 115 0 0 1 63.7 223.283a116 116 0 0 1-17.02-14.1A116 116 0 0 1 32.64 192.1a115.5 115.5 0 0 1-10.6-19.612 115 115 0 0 1-6.7-21.671 116.8 116.8 0 0 1-2.34-23.27 115.6 115.6 0 0 1 6.693-38.905 115.1 115.1 0 0 1 18.53-33.252 115.5 115.5 0 0 1 28.042-25.266A113.9 113.9 0 0 1 101.5 15.176v24.293c-38.352 11.654-65.137 47.873-65.137 88.079 0 50.73 41.111 92 91.641 92s91.641-41.272 91.641-92v-.451h22.911v-9.828c.3 3.4.449 6.861.449 10.279a116.8 116.8 0 0 1-2.336 23.268 115.3 115.3 0 0 1-6.7 21.671 115.5 115.5 0 0 1-10.6 19.612 116 116 0 0 1-14.042 17.086 116 116 0 0 1-17.02 14.1 115 115 0 0 1-19.534 10.645 114 114 0 0 1-21.587 6.727A115.4 115.4 0 0 1 128 243a115.4 115.4 0 0 1-23.176-2.345M219.642 127.1a11.66 11.66 0 0 1 11.771-11.3 11.68 11.68 0 0 1 11.137 8.438v2.855Zm-4.176-27.873a90.6 90.6 0 0 0-5.329-13.2 11.613 11.613 0 0 1 5.266-15.594 11.7 11.7 0 0 1 15.656 5.245q1.908 3.825 3.533 7.808l.051.126.024.059v.009l.024.058.023.058v.012l.023.058.023.054v.011l.023.056v.011l.021.053c.011.027 0 0 0 .007s.015.037.023.055 0 .007.006.015l.022.055v.011l.02.05v.012l.022.054s.006.014.006.018.013.031.019.046v.01l.021.053q-.002.01.008.02c.01.01.013.034.02.052l.006.015.017.042.007.02.02.05.008.019.015.039.01.025c0 .014.01.028.016.041l.01.024.015.038c0 .01.01.024.013.033l.012.031.01.026.018.045.01.028c0 .009.007.02.011.028s.01.027.015.041l.011.028.012.03.011.029.016.042q.002.013.01.027c.008.014.01.028.018.045l.01.025.013.033.006.019.022.056.007.018c0 .014.007.019.013.033l.007.019.021.054.008.021.042.109v.012l.027.068v.007l.015.039.027.071v.013l.044.115.029.077.044.118v.008l.044.119.075.2v.007l.12.324.12.326c.242.658.475 1.313.706 1.976v.007l.042.121.07.2v.01q.022.059.04.118v.007l.023.068v.014l.012.037v.011l.021.063.007.02.02.06v.015c0 .011.008.024.012.035l.006.018.019.057.006.019.011.034v.014l.021.061.006.021.017.05c0 .008.006.016.009.025l.01.031.008.027.015.045c0 .009.006.019.009.028l.011.03c.005.011.01.03.015.045l.008.025.011.033.008.024c0 .016.01.032.015.048l.009.025.012.037c0 .007.008.024.01.031l.013.038.007.023.017.052.006.016.015.046v.014l.018.055.006.017.019.057.019.059v.013l.019.058v.008l.019.057v.007l.02.061v.008l.041.127.021.066.043.134.214.671a11.625 11.625 0 0 1-7.652 14.58 11.7 11.7 0 0 1-3.5.535 11.68 11.68 0 0 1-11.024-8.116ZM193.619 62.85a92.5 92.5 0 0 0-10.766-9.413 11.6 11.6 0 0 1-2.35-16.284 11.71 11.71 0 0 1 16.343-2.345l.023.017.017.012.044.033.019.014.028.021.015.011.047.036.017.012.044.033.019.014.027.02.022.017.04.029.021.015.038.029.023.017.027.02.022.016.036.028.024.019.024.018.038.029.023.017.024.018.036.028.026.019.023.017.035.027.026.02.024.019.023.017.038.028.024.019.027.02.032.024.027.021.021.016.04.031.019.015.029.022.026.019.033.025.02.016.039.029.021.016.029.023.019.015.04.031.02.016.035.026.021.016.033.026.018.013.042.032.018.014.032.025.02.016.039.03.016.012.043.033.016.012.034.026.015.011.043.033.018.014.042.033.011.009.039.03.015.011.044.034.015.011.04.032.007.006.047.037.012.01.048.037.007.006.046.036h.006l.049.037.01.009.049.039.05.038.007.007.049.039.007.006.049.038.049.039.009.007.049.04.05.04.05.04.008.007.051.041.051.041h.006l.051.041.107.085.053.042.107.085.434.349a115 115 0 0 1 8.81 7.9l.147.147.093.093.007.007.044.044.008.008.038.038.008.008.041.041.012.011.04.041.012.012.032.033.013.013.038.038.017.017.032.032.017.017.028.029.019.018.035.036.019.019.021.022.034.034.019.019.023.023.018.019.038.038.014.014.083.084.008.008.051.052.089.09.034.034a11.6 11.6 0 0 1-.215 16.445 11.67 11.67 0 0 1-8.153 3.3 11.67 11.67 0 0 1-8.327-3.476Zm-35.962-22.683a91.4 91.4 0 0 0-13.834-3.528 11.64 11.64 0 0 1-9.508-13.453 11.676 11.676 0 0 1 13.489-9.474q5.064.876 9.968 2.184l.128.034.127.034.075.021h.012l.12.032h.01l.118.032h.016l.061.017h.018l.036.01h.015l.064.018h.016l.036.01h.013l.063.017.022.006.053.015.024.007.033.01.023.006.048.014.028.008.03.008.037.011.036.01.032.008.027.008.049.014.023.006.037.011.021.007.052.015.021.006.045.013.023.006.044.012h.018l.057.016h.013l.049.013h.015l.055.016h.017l.052.015h.007l.059.017h.014l.06.017.058.017h.014l.059.017h.007l.058.017h.006l.062.018h.006l.128.037q2.514.729 4.981 1.57a11.62 11.62 0 0 1 7.275 14.77 11.68 11.68 0 0 1-11.051 7.874 11.7 11.7 0 0 1-3.77-.574ZM101.5 15.073l.065-.015h.007l.129-.031h.006l.133-.031.068-.015.135-.031.133-.031.133-.03.2-.046.133-.03.134-.03.068-.015.135-.03.133-.029.134-.029.341-.074.136-.029.205-.044.137-.029.136-.028q.412-.086.826-.17l.827-.163.136-.026.133-.026.2-.039.134-.025h.006l.134-.025.137-.026.068-.012.133-.024h.006l.132-.024h.006l.134-.024.066-.012.133-.024h.007l.131-.024h.006l.066-.012.065-.011h.006l.065-.011h.009l.061-.011.063-.011h.011l.125-.022h.015l.061-.011h.007l.057-.01h.012l.061-.011h.011l.056-.01h.009l.061-.01h.015l.059-.011h.006l.056-.01h.019l.057-.009h.016l.048-.008h.016l.057-.01h.018l.048-.008h.015l.057-.01h.019l.053-.009h.013l.053-.009h.019l.057-.009h.018l.042-.007h.023l.053-.009h.023l.039-.006h.022l.052-.008h.026l.036-.006.04-.007.035-.006h.028l.04-.007.036-.006h.06l.049-.007h.058l.051-.008h.086l.055-.009h.023l.035-.006h.027l.053-.008h.023l.036-.006h.013l.066-.011h.021l.068-.011h.011l.038-.006h.019l.061-.009h.019l.038-.006h.011l.074-.011h.012l.126-.019h.006q.62-.093 1.243-.179a11.673 11.673 0 0 1 13.161 9.924 11.64 11.64 0 0 1-9.962 13.123 92 92 0 0 0-13.748 3Z" opacity=".6"/><path data-name="Path 184" d="M206 138a25 25 0 0 1 25-25 25 25 0 0 1 25 25 25 25 0 0 1-25 25 25 25 0 0 1-25-25M79 25a25 25 0 0 1 25-25 25 25 0 0 1 25 25 25 25 0 0 1-25 25 25 25 0 0 1-25-25"/></g></svg></div><div class="mode-card-title">Stampen</div><div class="mode-card-desc">Meest effectief</div></div>
          <div class="mode-card" id="mc-over" onclick="startModeFiltered('overhoren')"><div class="mode-card-icon"><svg height="30px" width="30px" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><g transform="translate(-3598 1414)"><path data-name="Rectangle 30" fill="rgba(149,0,0,0)" d="M3598-1414h256v256h-256z"/><path data-name="Path 187" d="M3802-1158h-151a15.9 15.9 0 0 1-11.313-4.686A15.9 15.9 0 0 1 3635-1174v-224a15.9 15.9 0 0 1 4.686-11.314A15.9 15.9 0 0 1 3651-1414h117l50 50v190a15.9 15.9 0 0 1-4.686 11.314A15.9 15.9 0 0 1 3802-1158" fill="var(--accent)" opacity=".4"/><rect data-name="Rectangle 41" width="112" height="7" rx="3.5" transform="translate(3661 -1331)" fill="var(--accent)" opacity=".6"/><rect data-name="Rectangle 42" width="130" height="7" rx="3.5" transform="translate(3661 -1314)" fill="var(--accent)" opacity=".6"/><rect data-name="Rectangle 43" width="109" height="7" rx="3.5" transform="translate(3661 -1298)" fill="var(--accent)" opacity=".6"/><rect data-name="Rectangle 44" width="80" height="7" rx="3.5" transform="translate(3661 -1281)" fill="var(--accent)" opacity=".6"/><rect data-name="Rectangle 45" width="91" height="7" rx="3.5" transform="translate(3661 -1264)" fill="var(--accent)" opacity=".6"/><rect data-name="Rectangle 46" width="40" height="7" rx="3.5" transform="translate(3661 -1248)" fill="var(--accent)" opacity=".6"/><path data-name="Path 186" d="M3768-1414v34a15.9 15.9 0 0 0 4.686 11.314A15.9 15.9 0 0 0 3784-1364h34z" fill="var(--accent)"/></g></svg></div><div class="mode-card-title">Overhoren</div><div class="mode-card-desc">Oefentoets</div></div>
        </div>
        <div class="set-terms-section">
          <div class="section-hdr"><h3>Alle begrippen</h3><span style="font-size:13px;color:var(--text2)">${SET.terms.length}</span></div>
          <div class="terms-list" id="terms-list-el">
            ${SET.terms.map((t,i)=>{
              const sid=getSetStorageId();
              const starred=isTermStarred(sid,i);
              return `<div class="term-item" data-term-idx="${i}" style="--term-index:${Math.min(i,6)}">
                <div class="term-item-inner">
                  <div><div class="term-label">Begrip</div><div style="font-weight:800;font-size:15px">${renderTerm(t,'term')}</div>${renderImages(t)}</div>
                  <div class="term-divider"></div>
                  <div><div class="term-label">Definitie</div><div style="color:var(--text2);font-size:14px">${renderTerm(t,'def')}</div></div>
                </div>
                <button class="star-btn${starred?' starred':''}" onclick="toggleStarTerm(event,${i})" title="${starred?'Ster verwijderen':'Markeer als moeilijk'}">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </button>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
      <!-- Zijkaart -->
      <div class="set-info-card set-view-enter" id="set-info-card">
        <div class="set-info-card-nav">
          <div class="set-info-card-nav-left">
            <button class="btn-icon" id="searchContainer2" onclick="openTermsSearch()"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256"><g transform="translate(-2433 -926)"><path data-name="Rectangle 20" fill="rgba(0,0,0,0)" d="M2433 926h256v256h-256z"/><rect data-name="Rectangle 28" width="170" height="170" rx="85" transform="translate(2460 953)" fill="var(--text)" opacity=".2"/><path data-name="Rectangle 26" d="M2545 978a60 60 0 1 0 60 60 60.07 60.07 0 0 0-60-60m0-25a85 85 0 1 1-85 85 85 85 0 0 1 85-85" fill="var(--text)"/><rect data-name="Rectangle 27" width="30" height="94" rx="15" transform="rotate(-45 2612.226 -2568.255)" fill="var(--text)" opacity=".4"/></g></svg></button>
            <button class="btn-icon" onclick="showCurrentHelp()" title="Help"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256"><path data-name="Rectangle 20" fill="rgba(255,255,255,0)" d="M0 0h256v256H0z"/><g data-name="Group 28" fill="var(--text)"><path data-name="Path 210" d="M128 246a119 119 0 0 1-23.781-2.4 117.4 117.4 0 0 1-22.15-6.876 118 118 0 0 1-20.044-10.88 119 119 0 0 1-17.464-14.409 119 119 0 0 1-14.409-17.464 118 118 0 0 1-10.879-20.044 117.4 117.4 0 0 1-6.876-22.15A119 119 0 0 1 10 128a119 119 0 0 1 2.4-23.781 117.4 117.4 0 0 1 6.876-22.15 118 118 0 0 1 10.879-20.044 119 119 0 0 1 14.409-17.464 119 119 0 0 1 17.464-14.409 118 118 0 0 1 20.044-10.879 117.4 117.4 0 0 1 22.15-6.876A119 119 0 0 1 128 10a119 119 0 0 1 23.781 2.4 117.4 117.4 0 0 1 22.15 6.876 118 118 0 0 1 20.044 10.879 119 119 0 0 1 17.464 14.409 119 119 0 0 1 14.409 17.464 118 118 0 0 1 10.879 20.044 117.4 117.4 0 0 1 6.876 22.15A119 119 0 0 1 246 128a119 119 0 0 1-2.4 23.781 117.4 117.4 0 0 1-6.876 22.15 118 118 0 0 1-10.879 20.044 119 119 0 0 1-14.409 17.464 119 119 0 0 1-17.464 14.409 118 118 0 0 1-20.044 10.88 117.4 117.4 0 0 1-22.15 6.876A119 119 0 0 1 128 246m-12.094-48c.205.011.42.016.657.016a15.8 15.8 0 0 0 5.6-1.023 15.7 15.7 0 0 0 5.357-3.383 15.32 15.32 0 0 0 4.451-10.837 15.33 15.33 0 0 0-4.451-10.837 15.7 15.7 0 0 0-5.357-3.383 15.8 15.8 0 0 0-5.6-1.024c-.219 0-.441 0-.66.014a16 16 0 0 0-.624-.012 16.1 16.1 0 0 0-5.672 1.027 16 16 0 0 0-5.412 3.373 15.1 15.1 0 0 0-3.365 4.961 15.1 15.1 0 0 0-1.184 5.876 15.1 15.1 0 0 0 1.184 5.876 15.1 15.1 0 0 0 3.365 4.961 16.1 16.1 0 0 0 5.412 3.376 16.1 16.1 0 0 0 5.672 1.029c.206 0 .416 0 .623-.012Zm-3.288-76.537a8.94 8.94 0 0 0-6.467 2.737 8.94 8.94 0 0 0-2.538 6.549L104 143.2a9.955 9.955 0 0 0 9.994 9.692h6.313a7.3 7.3 0 0 0 7.311-7.014 7.5 7.5 0 0 1 2.258-5.02 8.55 8.55 0 0 1 5.07-2.392 62.4 62.4 0 0 0 16.478-4.126 34.2 34.2 0 0 0 15.87-13.088c3.788-5.83 5.709-13.32 5.709-22.26 0-8.681-1.921-16.17-5.709-22.259a36.5 36.5 0 0 0-15.87-13.956 53.8 53.8 0 0 0-22.277-4.794c-.346 0-.7 0-1.044.01-9.375 0-17.547 1.807-24.288 5.37a38.4 38.4 0 0 0-15.58 14.546 39 39 0 0 0-4.368 11.3 7.32 7.32 0 0 0 1.49 6.246 9.42 9.42 0 0 0 7.311 3.35h4.635c6.273 0 10.648-6.185 12.7-9.872l.094-.166.01-.017a18.1 18.1 0 0 1 6.967-6.639 22.36 22.36 0 0 1 10.155-2.45c.227 0 .457 0 .682.01.176 0 .356-.006.533-.006a22.25 22.25 0 0 1 9.921 2.348 16.5 16.5 0 0 1 6.871 6.639A20.83 20.83 0 0 1 147.651 99c0 4.664-.911 8.507-2.709 11.423a17.83 17.83 0 0 1-7.455 6.737 38 38 0 0 1-11.128 3.318 91.4 91.4 0 0 1-13.313.978Z" opacity=".4"/><path data-name="Path 209" d="M113.991 152.9a10 10 0 0 1-9.991-9.7l-.384-12.461a9.01 9.01 0 0 1 9-9.286 91 91 0 0 0 13.741-.976 38 38 0 0 0 11.128-3.319 17.86 17.86 0 0 0 7.454-6.736q2.711-4.388 2.711-11.422a20.8 20.8 0 0 0-2.419-10.349 16.56 16.56 0 0 0-6.87-6.639 22.1 22.1 0 0 0-10.454-2.342 22.26 22.26 0 0 0-10.838 2.44 18.1 18.1 0 0 0-6.969 6.643l-.1.184c-2.737 4.923-7.064 9.872-12.7 9.872h-4.634c-5.388 0-9.94-4.33-8.8-9.6a39 39 0 0 1 4.367-11.3 38.5 38.5 0 0 1 15.579-14.539Q113.973 58 128.1 58a54.15 54.15 0 0 1 23.32 4.784 36.6 36.6 0 0 1 15.871 13.956Q173 85.917 173 99q0 13.473-5.709 22.259a34.37 34.37 0 0 1-15.87 13.088 62.4 62.4 0 0 1-16.477 4.126 8.02 8.02 0 0 0-7.328 7.412 7.316 7.316 0 0 1-7.311 7.015Zm1.917 45.1a16.15 16.15 0 0 1-11.708-4.4 15.185 15.185 0 0 1 0-21.674 16.15 16.15 0 0 1 11.709-4.388 15.82 15.82 0 0 1 11.612 4.393 15.417 15.417 0 0 1 0 21.674A15.82 15.82 0 0 1 115.91 198z"/></g></svg></button>
          </div>
          <div class="set-info-card-nav-right">
            <div class="settings-dropdown-wrap" id="set-menu-wrap">
        <button class="btn-icon" onclick="toggleDD('set-menu')" title="Set menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle fill="var(--text)" opacity="0.6" cx="12" cy="5" r="1"/><circle fill="var(--text)" cx="12" cy="12" r="1"/><circle fill="var(--text)" cx="12" cy="19" r="1"/>
          </svg>
        </button>
        <div id="set-menu" class="settings-dropdown" style="display: none; width:240px">
          <div class="settings-section">
            <div id="offline-actions">
              <button class="btn btn-glass" id="btn-offline-toggle" style="width:100%;padding:8px 12px;font-size:13px;margin-bottom:6px;text-align:left;justify-content:flex-start;gap:8px" onclick="toggleOfflineSet()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10" opacity=".3"/><path d="M8 17l4 4 4-4M12 21v-8"/></svg>
                <span id="offline-btn-label">Offline gebruiken</span>
              </button>
            </div>
            <div id="offline-divider" style="height:1px;background:rgba(180,170,210,0.3);margin:8px 0"></div>
            <button class="btn btn-glass" style="width:100%;padding:8px 12px;font-size:13px;margin-bottom:6px;text-align:left;justify-content:flex-start;gap:8px" onclick="showShareModal()">
              <svg width="13" height="13" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><g transform="translate(-3606.135 1413.942)" fill="var(--text)"><rect width="208" height="208" rx="41" transform="translate(3630 -1366)" opacity=".4"/><path d="M3797.051-1158H3671.22a41.186 41.186 0 0 1-41.22-41.22v-125.831a41.186 41.186 0 0 1 41.22-41.22h20.068v17.356h-20.068a23.89 23.89 0 0 0-23.864 23.864v125.831a23.89 23.89 0 0 0 23.864 23.865h125.831a23.89 23.89 0 0 0 23.865-23.865v-125.831a23.89 23.89 0 0 0-23.865-23.864h-20.068v-17.356h20.067a41.186 41.186 0 0 1 41.22 41.22v125.831a41.185 41.185 0 0 1-41.22 41.22Z" opacity=".6"/><rect width="18" height="132" rx="8" transform="translate(3725 -1363)" opacity=".6"/><path d="M3727.565-1408.569a7.5 7.5 0 0 1 2.879-3.645 7.17 7.17 0 0 1 4.055-1.158 7.34 7.34 0 0 1 4.042 1.3 7.83 7.83 0 0 1 2.855 3.73l23.565 62.058a8.15 8.15 0 0 1-.718 7.249 7.64 7.64 0 0 1-2.537 2.5 7 7 0 0 1-3.518.991l-47.813.565a7.25 7.25 0 0 1-3.659-.927 7.65 7.65 0 0 1-2.65-2.5 8.1 8.1 0 0 1-1.261-3.491 8.2 8.2 0 0 1 .508-3.912Z"/></g></svg>
              Delen
            </button>
            <button class="btn btn-glass" style="width:100%;padding:8px 12px;font-size:13px;margin-bottom:6px;text-align:left;justify-content:flex-start;gap:8px" onclick="showCombineSetsModal()">
              <svg width="13" height="13" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><g transform="translate(-2854 -334)"><path data-name="Rectangle 17" fill="rgba(152,37,37,0)" d="M2854 334h256v256h-256z"/><rect data-name="Rectangle 37" width="164" height="164" rx="33" transform="translate(2854 380)" fill="var(--text)" opacity=".6"/><rect data-name="Rectangle 38" width="164" height="164" rx="33" transform="translate(2946 380)" fill="var(--text)" opacity=".4"/><rect data-name="Rectangle 39" width="72" height="164" rx="31" transform="translate(2946 380)" fill="var(--text)"/></g></svg>
              Sets combineren
            </button>
            <button class="btn btn-glass" style="width:100%;padding:8px 12px;font-size:13px;margin-bottom:6px;text-align:left;justify-content:flex-start;gap:8px" onclick="makeCopyOfSet()">
              <svg width="13" height="13" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><g transform="translate(-3611 1401)" fill="var(--text)"><rect width="193" height="193" rx="33" transform="translate(3660 -1357)" opacity=".4"/><rect width="193" height="193" rx="33" transform="translate(3626 -1382)"/></g></svg>
              Kopie maken
            </button>
            <button class="btn btn-glass" style="width:100%;padding:8px 12px;font-size:13px;margin-bottom:6px;text-align:left;justify-content:flex-start;gap:8px" onclick="printSetPDF()">
              <svg width="13" height="13" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><g fill="var(--text)"><path d="M199.168 33.443H58.112a25.67 25.67 0 0 1 8.789-14.622 25.5 25.5 0 0 1 7.487-4.3 25.5 25.5 0 0 1 8.812-1.558h90.88a25.5 25.5 0 0 1 8.811 1.557 25.5 25.5 0 0 1 7.487 4.3 25.67 25.67 0 0 1 8.789 14.62Z" opacity=".6"/><path d="M218.88 174.243H37.12A37.09 37.09 0 0 1 0 137.123v-66.56a37.09 37.09 0 0 1 37.12-37.12h181.76A37.09 37.09 0 0 1 256 70.563v66.56a37.09 37.09 0 0 1-37.12 37.12M46.721 37.283a5.76 5.76 0 1 0 5.76 5.76 5.767 5.767 0 0 0-5.76-5.76" opacity=".4"/><path d="M58.409 104.464h140.983v113.273a20 20 0 0 1-20 20H78.409a20 20 0 0 1-20-20z"/></g></svg>
              Afdrukken
            </button>
            <div id="local-set-actions" style="display:none">
              <div style="height:1px;background:rgba(180,170,210,0.3);margin:8px 0"></div>
              <button class="btn btn-glass" style="width:100%;padding:8px 12px;font-size:13px;margin-bottom:6px;text-align:left;justify-content:flex-start;gap:8px" onclick="downloadVset()">
                <svg width="13" height="13" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><g transform="translate(-2433 -926)"><path data-name="Rectangle 20" fill="rgba(0,0,0,0)" d="M2433 926h256v256h-256z"/><path data-name="Path 186" d="m2433 1108 5.667-3.964h240.488L2689 1108v45a29 29 0 0 1-29 29h-198a29 29 0 0 1-29-29Z" fill="var(--text)" opacity=".4"/><path data-name="Path 185" d="M2462 1182a28.8 28.8 0 0 1-11.288-2.279 28.9 28.9 0 0 1-9.219-6.214 28.9 28.9 0 0 1-6.215-9.218A28.8 28.8 0 0 1 2433 1153v-43.5h.021a6 6 0 0 1 5.979-5.5h8a6 6 0 0 1 5.98 5.5h.021v43.5a9.01 9.01 0 0 0 9 9h198a9.01 9.01 0 0 0 9-9v-43.5h.021a6 6 0 0 1 5.978-5.5h8a6 6 0 0 1 5.98 5.5h.021v43.5a28.8 28.8 0 0 1-2.279 11.289 28.9 28.9 0 0 1-6.214 9.218 28.9 28.9 0 0 1-9.219 6.214A28.8 28.8 0 0 1 2660 1182Z" fill="var(--text)" opacity=".6"/><rect data-name="Rectangle 38" width="30" height="170" rx="15" transform="translate(2546 940)" fill="var(--text)"/><path data-name="Polygon 1" d="M2567.1 1134.365a9 9 0 0 1-12.209 0l-41.981-38.752a9 9 0 0 1 6.109-15.613h83.962a9 9 0 0 1 6.1 15.613Z" fill="var(--text)"/></g></svg>
                Set downloaden (.vset)
              </button>
              <button class="btn btn-glass" style="width:100%;padding:8px 12px;font-size:13px;margin-bottom:6px;text-align:left;justify-content:flex-start;gap:8px" onclick="editCurrentSet()">
                <svg width="13" height="13" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path data-name="Rectangle 17" fill="rgba(152,37,37,0)" d="M0 0h256v256H0z"/><g data-name="Group 13" transform="rotate(45 2187.158 -2777.125)" fill="var(--text)"><path data-name="Path 170" d="M2785 888.133a7.9 7.9 0 0 1-3.778-.941 7 7 0 0 1-2.831-2.824l-17.6-32.459a6.4 6.4 0 0 1-.779-2.688h49.978a6.4 6.4 0 0 1-.779 2.688l-17.6 32.459a7.03 7.03 0 0 1-2.831 2.824 7.9 7.9 0 0 1-3.78.941m25-54.655h-50V600.523a21.35 21.35 0 0 1 1.965-8.969 23 23 0 0 1 5.358-7.324 25.1 25.1 0 0 1 7.947-4.938 26.7 26.7 0 0 1 9.731-1.811 26.7 26.7 0 0 1 9.731 1.811 25.1 25.1 0 0 1 7.947 4.938 23 23 0 0 1 5.358 7.324 21.4 21.4 0 0 1 1.965 8.969v232.954Zm-24.5-237.083c-4.687 0-8.5 3.515-8.5 7.834v216.6c0 4.32 3.813 7.835 8.5 7.835s8.5-3.515 8.5-7.835v-216.6c0-4.32-3.81-7.835-8.499-7.835Z"/><rect data-name="Rectangle 19" width="17" height="232.271" rx="8.5" transform="translate(2777 596.393)" opacity=".6"/></g></svg>
                Set bewerken
              </button>
              <button class="btn" style="width:100%;padding:8px 12px;font-size:13px;margin-bottom:0;text-align:left;justify-content:flex-start;gap:8px;background:rgba(232,58,74,0.08);color:var(--red);border:none;border-radius:var(--r3);cursor:pointer;font-family:var(--font);font-weight:700" onclick="deleteCurrentSet()">
                <svg width="13" height="13" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path data-name="Rectangle 20" fill="rgba(0,0,0,0)" d="M0 0h256v256H0z"/><g data-name="Group 15" fill="var(--red)"><path data-name="Path 181" d="M190.628 256H66.231a22.12 22.12 0 0 1-15.521-6.256 20.93 20.93 0 0 1-6.429-15.1L27.774 72.076a20.93 20.93 0 0 1 6.429-15.1 22.12 22.12 0 0 1 15.521-6.259h155.345a22.12 22.12 0 0 1 15.521 6.256 20.93 20.93 0 0 1 6.429 15.1l-14.445 162.568a20.93 20.93 0 0 1-6.429 15.1A22.12 22.12 0 0 1 190.628 256M162.914 74.908a12.03 12.03 0 0 0-12.061 11.654l-4.635 132.749a12.09 12.09 0 0 0 11.646 12.489q.201.008.429.008a12.025 12.025 0 0 0 12.06-11.654l4.636-132.749a12.075 12.075 0 0 0-11.646-12.488 10 10 0 0 0-.429-.009m-69.829 0q-.215-.002-.429.007a12.09 12.09 0 0 0-11.646 12.49l4.635 132.749a12.025 12.025 0 0 0 12.059 11.654q.23.002.43-.008a12.09 12.09 0 0 0 11.647-12.489l-4.635-132.749a12.026 12.026 0 0 0-12.061-11.654"/><path data-name="Path 179" d="M30.793 41.057A8.453 8.453 0 0 1 22.34 32.6a16.906 16.906 0 0 1 16.906-16.9h27.773A15.7 15.7 0 0 1 82.718 0h90.566a15.7 15.7 0 0 1 15.7 15.7h27.774a16.906 16.906 0 0 1 16.902 16.9 8.45 8.45 0 0 1-8.452 8.453Z"/><path data-name="Path 180" d="M157.86 231.8a12.075 12.075 0 0 1-11.646-12.489l4.639-132.746a12.076 12.076 0 0 1 24.137.843l-4.637 132.746a12.076 12.076 0 0 1-12.061 11.654q-.212 0-.432-.008m-72.214-11.646L81.01 87.405a12.075 12.075 0 0 1 24.136-.84l4.636 132.749a12.075 12.075 0 0 1-11.647 12.489c-.143 0-.287.007-.429.007a12.076 12.076 0 0 1-12.06-11.656" opacity=".4"/></g></svg>
                Set verwijderen
              </button>
            </div>
          </div>
        </div>
      </div>
          </div>
        </div>
        <div class="set-info-card-footer">
          <button class="star-mode-btn${starModeActive?' active':''}" id="star-mode-btn" onclick="toggleStarMode()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span>Alleen termen met een ster leren</span>
          </button>
        </div>
      </div>
    </div>`;
  currentMode='home';


  setTimeout(() => { updateOfflineBtn(); updateStarModeUI(); }, 100);
}

/* ══════════════════════════════════════════
   STER SYSTEEM & PERSISTENTIE
══════════════════════════════════════════ */

// Unieke sleutel per set
function getSetStorageId(){
  if(!SET)return'unknown';
  return 'stars_'+(SET.id||SET.slug||SET.title||'set');
}

// Haal sterren op (array van indices) - persistent
function getStarredTerms(sid){
  try{return JSON.parse(localStorage.getItem(sid)||'[]');}catch(e){return[];}
}

// Sla sterren op
function saveStarredTerms(sid,arr){
  try{localStorage.setItem(sid,JSON.stringify(arr));}catch(e){}
}

// Is term gemarkeerd?
function isTermStarred(sid,idx){
  return getStarredTerms(sid).includes(idx);
}

function getTermIndex(term){
  if(!SET||!term) return -1;
  const idx=SET.terms.indexOf(term);
  if(idx>=0) return idx;
  return SET.terms.findIndex(t=>t.term===term.term&&t.def===term.def);
}

function toggleStarCurrentTerm(e,idx){
  e.stopPropagation();
  if(idx<0) return;
  toggleStarTerm(e, idx);
}

function updateModeStarButtons(){
  const btns=document.querySelectorAll('.card-star-btn');
  if(!btns.length) return;
  let idx=-1;
  if(currentMode==='flashcards' && FC && FC.terms && typeof FC.idx==='number'){ idx=getTermIndex(FC.terms[FC.idx]); }
  else if(currentMode==='stampen' && ST && ST._currentT){ idx=getTermIndex(ST._currentT); }
  const starred=idx>=0 && isTermStarred(getSetStorageId(), idx);
  btns.forEach(btn=>{
    btn.classList.toggle('starred', starred);
    btn.title = starred ? 'Ster verwijderen' : 'Markeer als moeilijk';
  });
}
// Toggle ster op een term
function toggleStarTerm(e,idx){
  e.stopPropagation();
  const sid=getSetStorageId();
  let starred=getStarredTerms(sid);
  if(starred.includes(idx)){starred=starred.filter(i=>i!==idx);}
  else{starred.push(idx);}
  saveStarredTerms(sid,starred);
  // Update knop visueel
  const item=document.querySelector(`.term-item[data-term-idx="${idx}"]`);
  if(item){
    const btn=item.querySelector('.star-btn');
    if(btn){
      const isStarred=starred.includes(idx);
      btn.classList.toggle('starred',isStarred);
    }
  }
  // Update teller in kaart
  const disp=document.getElementById('star-count-display');
  if(disp)disp.textContent=starred.length+' termen met ster';
  // Reset actieve modi zodat ze de nieuwe sterren oppikken bij volgende start
  FC._active=false; ST._active=false;
  // Update zichtbare star-knoppen in actieve modi (flashcards / stampen)
  try{ updateModeStarButtons(); }catch(e){}
}

// Ster-modus actief?
let starModeActive=false;

function getStarModeKey(){return'star_mode_'+(SET?SET.id||SET.slug:'');}

function loadStarMode(){
  try{starModeActive=localStorage.getItem(getStarModeKey())==='true';}catch(e){starModeActive=false;}
}

function saveStarMode(){
  try{localStorage.setItem(getStarModeKey(),starModeActive);}catch(e){}
}

function toggleStarMode(){
  starModeActive=!starModeActive;
  saveStarMode();
  updateStarModeUI();
  // Reset actieve modi
  FC._active=false; ST._active=false;
}

function updateStarModeUI(){
  const btn=document.getElementById('star-mode-btn');
  if(!btn)return;
  if(starModeActive){
    btn.classList.add('active');
    const svg=btn.querySelector('svg');
    if(svg){svg.setAttribute('fill','#fff');svg.setAttribute('stroke','#fff');}
  } else {
    btn.classList.remove('active');
    const svg=btn.querySelector('svg');
    if(svg){svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');}
  }
}

// Geef de te gebruiken termen terug (gefilterd op ster indien modus actief)
function getActiveTerms(){
  if(!starModeActive)return SET.terms;
  const sid=getSetStorageId();
  const starred=getStarredTerms(sid);
  if(starred.length===0){
    showToast('⚠️ Geen termen met ster! Zet eerst een ster op termen.');
    return SET.terms;
  }
  return starred.map(i=>SET.terms[i]).filter(Boolean);
}

function startModeFiltered(mode){
  // Controleer of ster-modus actief is en er sterren zijn
  if(starModeActive){
    const sid=getSetStorageId();
    const starred=getStarredTerms(sid);
    if(starred.length===0){
      showToast('⚠️ Geen termen met ster geselecteerd!');
      return;
    }
  }
  startMode(mode);
}

/* ── PERSISTENTE VOORTGANG (FC / ST) ── */

function getFCProgressKey(){return'fc_prog_'+(SET?SET.id||SET.slug:'');}
function getSTProgressKey(){return'st_prog_'+(SET?SET.id||SET.slug:'');}

function saveFCProgress(){
  if(!SET||!FC._active)return;
  try{
    const data={
      idx:FC.idx,front:FC.front,shuffleOn:FC.shuffleOn,loop:FC.loop,
      knownIndices:FC.terms.filter(t=>FC.known.has(t)).map(t=>SET.terms.indexOf(t)),
      termOrder:FC.terms.map(t=>SET.terms.indexOf(t)),
      streak:FC.streak,sound:FC.sound,_finished:FC._finished,
      starMode:starModeActive
    };
    localStorage.setItem(getFCProgressKey(),JSON.stringify(data));
  }catch(e){}
}

function loadFCProgress(){
  try{
    const raw=localStorage.getItem(getFCProgressKey());
    if(!raw)return null;
    const data=JSON.parse(raw);
    // Controleer of ster-modus overeenkomt
    if(!!data.starMode!==!!starModeActive)return null;
    return data;
  }catch(e){return null;}
}

function clearFCProgress(){
  try{localStorage.removeItem(getFCProgressKey());}catch(e){}
}

function saveSTProgress(){
  if(!SET||!ST._active)return;
  try{
    const data={
      correct:ST.correct,wrong:ST.wrong,qmode:ST.qmode,itype:ST.itype,
      shuffleOn:ST.shuffleOn,typoLevel:ST.typoLevel,hints:ST.hints,
      copyCorrect:ST.copyCorrect,allowSingle:ST.allowSingle,sound:ST.sound,
      streak:ST.streak,_finished:ST._finished,
      queueIndices:ST._queue.map(t=>SET.terms.indexOf(t)),
      wrongRetryIndices:ST._wrongRetry.map(t=>SET.terms.indexOf(t)),
      pendingRetryIndices:ST._pendingRetry.map(t=>SET.terms.indexOf(t)),
      _retryBlock:ST._retryBlock,_cpDoneAt:ST._cpDoneAt,
      starMode:starModeActive
    };
    localStorage.setItem(getSTProgressKey(),JSON.stringify(data));
  }catch(e){}
}

function loadSTProgress(){
  try{
    const raw=localStorage.getItem(getSTProgressKey());
    if(!raw)return null;
    const data=JSON.parse(raw);
    if(!!data.starMode!==!!starModeActive)return null;
    return data;
  }catch(e){return null;}
}

function clearSTProgress(){
  try{localStorage.removeItem(getSTProgressKey());}catch(e){}
}

function startMode(mode){
  currentMode=mode;
  unlockSFX();
  setNavigationChromeVisible(false);
  const el=document.getElementById('main-screen');
  el.style.animation='none';el.offsetHeight;el.style.animation='set-iosOpen .44s cubic-bezier(.2,.7,.2,1) both';
  if(mode==='flashcards'){renderFlashcards();showOnboarding('flashcards');}
  else if(mode==='stampen'){
    const helpShown=showOnboarding('stampen',false,overlay=>maybeShowAnswerModePopup(()=>stRenderQ(),overlay));
    renderStampen(helpShown);
  }
  else if(mode==='overhoren'){
    const helpShown=showOnboarding('overhoren',false,overlay=>maybeShowAnswerModeForOH(()=>ohBuild(),overlay));
    renderOverhoren(helpShown);
  }
}
function backToSet(){
  renderSetView();
}

/* ── HELPERS ── */
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function esc(s){if(!s)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function escA(s){return esc(s).replace(/'/g,'&#39;').replace(/"/g,'&quot;');}
function formatSetDate(value){const match=String(value||'').match(/^\d{4}-\d{2}-\d{2}/);return match?match[0]:'';}
function renderTerm(t,type='term'){
  const html=type==='term'?t.termHtml:t.defHtml;if(html)return html;
  const segments=type==='term'?t.termSegments:t.defSegments;
  const text=type==='term'?t.term:t.def;
  if(segments&&segments.length){return segments.map(s=>{if(!s.text)return'';const style=`${s.color?`color:${s.color};`:''}${s.bold?'font-weight:700;':''}${s.italic?'font-style:italic;':''}`;return style?`<span style="${style}">${esc(s.text)}</span>`:esc(s.text);}).join('');}
  return esc(text);
}
function renderImages(t){
  if(!t.images||!t.images.length)return'';
  return`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${t.images.map(img=>`<img src="data:image/png;base64,${img.base64}" style="max-width:120px;max-height:120px;border-radius:6px;object-fit:cover">`).join('')}</div>`;
}
function lev(a,b){const m=a.length,n=b.length;const d=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i===0?j:j===0?i:0));for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=a[i-1]===b[j-1]?d[i-1][j-1]:1+Math.min(d[i-1][j],d[i][j-1],d[i-1][j-1]);return d[m][n];}

/* ── Strip parenthetical content for grading ── */
function stripParens(s){
  // Remove all content inside parentheses (and the parens themselves) for answer checking
  return s.replace(/\s*\([^)]*\)/g,'').trim();
}

/* ── Check if answer has multiple alternatives (comma/semicolon separated) ── */
function hasMultipleAlternatives(answer){
  return /[,;]/.test(answer);
}

/* ── ANSWER CHECKING ── */
// allowSingle: if true, any one of the comma/semicolon parts is accepted
function checkAns(inp,correct,level=2,allowSingle=false){
  if(level===3){
    // Strict mode: compare without parens
    const cleanInp=stripParens(inp).trim();
    const cleanCorrect=stripParens(correct).trim();
    if(cleanInp===cleanCorrect)return true;
    if(allowSingle&&hasMultipleAlternatives(correct)){
      const parts=correct.split(/[,;]/).map(p=>stripParens(p).trim());
      return parts.some(p=>cleanInp===p);
    }
    return false;
  }
  const clean=s=>stripParens(s).toLowerCase().trim().replace(/[.,;:!?]/g,'').replace(/\s+/g,' ');
  const a=clean(inp),b=clean(correct);
  // Always check each part individually
  const parts=correct.split(/[,;]/).map(clean);
  if(allowSingle){
    // Accept if input matches any single part
    if(parts.some(p=>a===p||(p.length>3&&lev(a,p)<=Math.max(1,Math.floor(p.length*0.25)))))return true;
  }
  if(a===b)return true;
  // Level-1: generous typo tolerance on any individual part
  if(level===1){
    if(parts.some(p=>a===p||(p.length>3&&lev(a,p)<=Math.max(1,Math.floor(p.length*0.25)))))return true;
  }
  const maxDist=level===1?Math.floor(b.length*0.25):Math.floor(b.length*0.12);
  return lev(a,b)<=Math.max(1,maxDist);
}

function streakCircleHTML(id,streak){
  const f=streak>=3;
  const fillId=`${id}-flame-fill`;
  const borderId=`${id}-flame-border`;
  const shadowId=`${id}-flame-shadow`;
  return`<div class="streak-circle${f?' on-fire':''}" id="${id}" aria-label="${f?`${streak} goed op rij`:'Nog geen streak'}"><svg class="flame-icon" viewBox="0 0 64 70" aria-hidden="true"><defs><radialGradient id="${fillId}" gradientUnits="userSpaceOnUse" cx="32" cy="76" r="70"><stop offset="0" stop-color="#fff5bd"/><stop offset=".4" stop-color="#ffe36d"/><stop offset="1" stop-color="#ffad1f"/></radialGradient><linearGradient id="${borderId}" gradientUnits="userSpaceOnUse" x1="32" y1="5" x2="32" y2="66"><stop offset="0" stop-color="#ff7700"/><stop offset=".55" stop-color="#ff982f"/><stop offset="1" stop-color="#ffbb68"/></linearGradient><filter id="${shadowId}" x="-25%" y="-25%" width="150%" height="165%" color-interpolation-filters="sRGB"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#d34b00" flood-opacity=".2"/></filter></defs><g class="flame-shape flame-border" fill="url(#${borderId})" filter="url(#${shadowId})"><path class="flame-base" d="M8 28C4 39 6 52 14 60c9 9 26 10 36 1 9-8 11-21 6-33-6 8-14 13-24 16-11-2-19-7-24-16Z"/><path class="flame-tongue flame-tongue-left" d="M8 37c4-7 6-14 7-20 8 6 13 15 11 25l-2 12H8Z"/><path class="flame-tongue flame-tongue-center" d="M17 39c9-9 13-20 15-30 9 10 14 22 10 34l-2 11H17Z"/><path class="flame-tongue flame-tongue-right" d="M36 41c9-7 13-15 16-22 7 9 8 19 4 27l-2 8H36Z"/></g><g class="flame-shape flame-fill" fill="url(#${fillId})"><path class="flame-base" d="M8 28C4 39 6 52 14 60c9 9 26 10 36 1 9-8 11-21 6-33-6 8-14 13-24 16-11-2-19-7-24-16Z"/><path class="flame-tongue flame-tongue-left" d="M8 37c4-7 6-14 7-20 8 6 13 15 11 25l-2 12H8Z"/><path class="flame-tongue flame-tongue-center" d="M17 39c9-9 13-20 15-30 9 10 14 22 10 34l-2 11H17Z"/><path class="flame-tongue flame-tongue-right" d="M36 41c9-7 13-15 16-22 7 9 8 19 4 27l-2 8H36Z"/></g></svg><span class="streak-num">${streak||0}</span></div>`;
}
function updateStreakCircle(id,streak){const el=document.getElementById(id);if(!el)return;el.className='streak-circle'+(streak>=3?' on-fire':'');el.setAttribute('aria-label',streak>=3?`${streak} goed op rij`:'Nog geen reeks');const n=el.querySelector('.streak-num');if(n)n.textContent=streak||0;}

/* ── FLASHCARDS ── */
let FC={};
function renderFlashcards(){
  const activeTerms = getActiveTerms();
  const savedProg = loadFCProgress();
  if(!FC._active||FC._setId!==SET.id){
    if(savedProg && savedProg.termOrder){
      // Herstel opgeslagen voortgang
      const terms = savedProg.termOrder.map(i=>SET.terms[i]).filter(Boolean);
      if(terms.length>0){
        FC={
          terms,idx:savedProg.idx||0,flipped:false,
          front:savedProg.front||'term',shuffleOn:savedProg.shuffleOn!==undefined?savedProg.shuffleOn:true,
          loop:savedProg.loop||false,
          known:new Set((savedProg.knownIndices||[]).map(i=>SET.terms[i]).filter(Boolean)),
          history:[],streak:savedProg.streak||0,sound:savedProg.sound!==false,
          _active:true,_setId:SET.id,_origOrder:[...activeTerms],
          _finished:savedProg._finished||false
        };
      } else {
        FC={terms:shuffle([...activeTerms]),idx:0,flipped:false,front:'term',shuffleOn:true,loop:false,known:new Set(),history:[],streak:0,sound:true,_active:true,_setId:SET.id,_origOrder:[...activeTerms],_finished:false};
      }
    } else {
      FC={terms:shuffle([...activeTerms]),idx:0,flipped:false,front:'term',shuffleOn:true,loop:false,known:new Set(),history:[],streak:0,sound:true,_active:true,_setId:SET.id,_origOrder:[...activeTerms],_finished:false};
    }
  }
  FC._transitioning=false;
  const currentTermIndex = getTermIndex(FC.terms[FC.idx]);
  const isCurrentStarred = currentTermIndex >= 0 && isTermStarred(getSetStorageId(), currentTermIndex);
  const el=document.getElementById('main-screen');
  el.innerHTML=`
    <button class="back-btn" onclick="backToSet()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>Terug</button>
    <div class="fc-wrap">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;gap:12px">
        <div><div style="font-size:20px;font-weight:800"><svg width="16px" height="16px" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><g transform="translate(-3598 1414)"><path data-name="Rectangle 30" fill="rgba(149,0,0,0)" d="M3598-1414h256v256h-256z"/><rect data-name="Rectangle 40" width="256" height="164" rx="33" transform="translate(3598 -1368)" fill="var(--text)" opacity=".6"/><path data-name="Path 182" d="m3713.357-1165.764-.292-97.8h-42.029c-5.654 0-9.656-7.638-7.889-15.059l60.1-125.777c6.014-12.673 15.425-12.283 15.4-1.832l.292 97.8h42.029c5.655 0 9.656 7.639 7.889 15.059l-60.1 125.783c-3.1 6.534-7.105 9.6-10.253 9.6-2.96-.01-5.16-2.71-5.147-7.774" fill="var(--text)"/></g></svg> Flitskaarten</div><div style="font-size:13px;color:var(--text2)">${esc(SET.title)}</div></div>
        <div class="mode-actions">
          ${modeHelpButtonHTML()}
          <button class="btn-icon" onclick="fcUndoLastAction()" title="Laatste actie ongedaan"><svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" width="256.001" height="256" viewBox="0 0 256.001 256"><path data-name="Rectangle 20" fill="rgba(0,0,0,0)" d="M0 0h256v256H0z"/><g data-name="Group 16" fill="var(--text)"><path data-name="Path 187" d="M25.153 210.575H21.61a14.69 14.69 0 0 1-14.757-14.623 14.693 14.693 0 0 1 14.759-14.625h163.541a41.187 41.187 0 0 0 41.327-40.952 41.187 41.187 0 0 0-41.327-40.95H23.974v-29.25h161.179a71 71 0 0 1 27.577 5.517 70.7 70.7 0 0 1 22.52 15.045 69.9 69.9 0 0 1 15.183 22.315 69.2 69.2 0 0 1 5.568 27.325 69.2 69.2 0 0 1-5.568 27.326 70 70 0 0 1-15.18 22.313 70.7 70.7 0 0 1-22.52 15.045 71 71 0 0 1-27.58 5.514Z" opacity=".6"/><path data-name="Path 188" d="M5.915 93.479a9.329 9.329 0 0 1 0-17.362L81.022 46.11a9.438 9.438 0 0 1 12.979 8.681v60.018a9.438 9.438 0 0 1-12.979 8.682Z"/></g></svg></button>
          <div class="settings-dropdown-wrap">
            <button class="btn-icon" onclick="toggleDD('fc-dd')"><svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><g transform="translate(-2433 -926)"><path data-name="Rectangle 20" fill="rgba(0,0,0,0)" d="M2433 926h256v256h-256z"/><path data-name="Subtraction 1" d="M2674 1114h-169.013a30 30 0 0 0 4.013-15 30 30 0 0 0-4.013-15H2674a14.9 14.9 0 0 1 10.606 4.394A14.9 14.9 0 0 1 2689 1099a14.9 14.9 0 0 1-4.393 10.606A14.9 14.9 0 0 1 2674 1114m-220.987 0H2448a14.9 14.9 0 0 1-10.606-4.393A14.9 14.9 0 0 1 2433 1099a14.9 14.9 0 0 1 4.393-10.606A14.9 14.9 0 0 1 2448 1084h5.015a30 30 0 0 0-4.014 15 30 30 0 0 0 4.012 15M2674 1024h-25.013a30 30 0 0 0 4.013-15 30 30 0 0 0-4.013-15H2674a14.9 14.9 0 0 1 10.606 4.394A14.9 14.9 0 0 1 2689 1009a14.9 14.9 0 0 1-4.393 10.605A14.9 14.9 0 0 1 2674 1024m-76.987 0H2448a14.9 14.9 0 0 1-10.606-4.393A14.9 14.9 0 0 1 2433 1009a14.9 14.9 0 0 1 4.393-10.607A14.9 14.9 0 0 1 2448 994h149.014a30 30 0 0 0-4.013 15 30 30 0 0 0 4.012 15" fill="var(--text)" opacity=".6"/><rect data-name="Rectangle 56" width="60" height="60" rx="30" transform="translate(2593 979)" fill="var(--text)" opacity=".4"/><rect data-name="Rectangle 55" width="60" height="60" rx="30" transform="translate(2449 1069)" fill="var(--text)" opacity=".4"/><path data-name="Rectangle 53" d="M2623 995a14 14 0 1 0 14 14 14.016 14.016 0 0 0-14-14m0-16a30 30 0 1 1-30 30 30 30 0 0 1 30-30" fill="var(--text)"/><path data-name="Rectangle 54" d="M2479 1085a14 14 0 1 0 14 14 14.016 14.016 0 0 0-14-14m0-16a30 30 0 1 1-30 30 30 30 0 0 1 30-30" fill="var(--text)"/></g></svg></button>
            <div id="fc-dd" class="settings-dropdown" style="display:none">
              <div class="settings-section"><div class="settings-section-title">Voorzijde</div><div class="settings-row"><span class="settings-row-label">Toon eerst</span><select class="settings-select" onchange="FC.front=this.value;fcUpdate()"><option value="term" ${FC.front==='term'?'selected':''}>Begrip</option><option value="def" ${FC.front==='def'?'selected':''}>Definitie</option></select></div></div>
              <div class="settings-section"><div class="settings-section-title">Opties</div><div class="settings-row"><span class="settings-row-label">Schudden</span><label class="toggle"><input type="checkbox" ${FC.shuffleOn?'checked':''} onchange="FC.shuffleOn=this.checked;fcApplyShuffle()"><span class="toggle-slider"></span></label></div><div class="settings-row"><span class="settings-row-label">Herhalen</span><label class="toggle"><input type="checkbox" ${FC.loop?'checked':''} onchange="FC.loop=this.checked"><span class="toggle-slider"></span></label></div><div class="settings-row"><span class="settings-row-label">Geluid afspelen</span><label class="toggle"><input type="checkbox" ${FC.sound?'checked':''} onchange="FC.sound=this.checked"><span class="toggle-slider"></span></label></div>${modeHelpSettingHTML()}</div>
              <div style="margin-top:10px"><button class="btn btn-glass btn-sm" style="width:100%" onclick="fcHardReset();closeDD('fc-dd')">↺ Opnieuw beginnen</button></div>
            </div>
          </div>
        </div>
      </div>
      <div class="progress-row"><div class="progress-track"><div class="progress-fill" id="fc-prog" style="width:0%"></div></div>${streakCircleHTML('fc-streak',FC.streak||0)}</div>
      <div style="text-align:center;font-size:13px;color:var(--text3);margin-bottom:14px" id="fc-ctr"></div>
      <div class="fc-card-stage" id="fc-stage">
        <div class="fc-card-scene" id="fc-scene" onclick="fcFlip()">
          <div class="fc-card-inner" id="fc-inner">
            <button class="card-star-btn fc-star-btn${isCurrentStarred?' starred':''}" title="${isCurrentStarred?'Ster verwijderen':'Markeer als moeilijk'}" onclick="event.stopPropagation();toggleStarCurrentTerm(event, ${currentTermIndex})">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </button>
            <div class="fc-face"><div class="fc-face-label" id="fc-fl"></div><div class="fc-face-text" id="fc-ft"></div></div>
            <div class="fc-face fc-face-back"><div class="fc-face-label" id="fc-bl"></div><div class="fc-face-text" id="fc-bt"></div></div>
          </div>
        </div>
      </div>
      <div style="font-size:13px;color:var(--text3);text-align:center;margin-bottom:16px">Klik om te draaien · ← Wist ik niet &nbsp;·&nbsp; Wist ik → · spatie om te draaien</div>
      <div style="display:flex;gap:16px;justify-content:center">
        <button class="btn btn-red" onclick="fcMark(false)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Wist ik niet</button>
        <button class="btn btn-green" onclick="fcMark(true)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>Wist ik!</button>
      </div>
      <div style="text-align:center;margin-top:14px;font-size:13px;color:var(--text2);font-weight:600" id="fc-known-stat"></div>
      <div class="results-overlay" id="fc-results"></div>
    </div>`;
  fcUpdate();if(FC._finished)showFCResults();
}
function fcUpdate(){
  const t=FC.terms[FC.idx];
  if(!t)return;
  const fi=FC.front==='term';
  document.getElementById('fc-fl').textContent=fi?'Begrip':'Definitie';
  document.getElementById('fc-ft').innerHTML=fi?renderTerm(t,'term')+renderImages(t):renderTerm(t,'def');
  document.getElementById('fc-bl').textContent=fi?'Definitie':'Begrip';
  document.getElementById('fc-bt').innerHTML=fi?renderTerm(t,'def'):renderTerm(t,'term')+renderImages(t);
  const inner=document.getElementById('fc-inner');
  inner.classList.add('fc-resetting');
  inner.classList.remove('flipped');
  inner.offsetHeight;
  inner.classList.remove('fc-resetting');
  FC.flipped=false;
  document.getElementById('fc-prog').style.width=Math.round((FC.idx/FC.terms.length)*100)+'%';
  document.getElementById('fc-ctr').textContent=`${FC.idx+1} / ${FC.terms.length}`;
  updateStreakCircle('fc-streak',FC.streak||0);
  const ks=document.getElementById('fc-known-stat');
  if(ks)ks.textContent=`✓ ${FC.known.size} van ${FC.terms.length} gekend`;
  const starBtn=document.querySelector('.fc-card-inner .card-star-btn');
  if(starBtn){
    const starIdx=getTermIndex(t);
    const starred=starIdx>=0&&isTermStarred(getSetStorageId(),starIdx);
    starBtn.classList.toggle('starred',starred);
    starBtn.title=starred?'Ster verwijderen':'Markeer als moeilijk';
    starBtn.onclick=(e)=>{e.stopPropagation();toggleStarCurrentTerm(e,starIdx);};
  }
}
function fcFlip(){
  if(FC._transitioning)return;
  FC.flipped=!FC.flipped;
  document.getElementById('fc-inner').classList.toggle('flipped',FC.flipped);
}
function fcMark(known){
  if(FC._finished||FC._transitioning)return;
  FC._transitioning=true;
  const term=FC.terms[FC.idx];
  FC.history.push({idx:FC.idx,known,streak:FC.streak});
  const scene=document.getElementById('fc-scene');
  if(known){FC.known.add(term);FC.streak++;playSFX('correct');}else{FC.known.delete(term);FC.streak=0;playSFX('incorrect');}
  checkStreak(FC.streak);
  if(FC.idx<FC.terms.length-1){
    const stage=document.getElementById('fc-stage');
    const outgoing=scene.cloneNode(true);
    outgoing.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
    outgoing.removeAttribute('id');
    outgoing.removeAttribute('onclick');
    outgoing.classList.remove('fc-card-enter');
    outgoing.classList.add('fc-card-ghost','fc-card-exit');
    stage.appendChild(outgoing);

    scene.classList.remove('fc-card-exit','fc-card-enter');
    scene.offsetHeight;
    scene.classList.add('fc-card-enter');
    FC.idx++;
    fcUpdate();
    saveFCProgress();
    setTimeout(()=>{
      outgoing.remove();
      scene.classList.remove('fc-card-enter');
      FC._transitioning=false;
    },520);
  }else{
    scene.classList.remove('fc-card-enter');
    scene.offsetHeight;
    scene.classList.add('fc-card-exit');
    saveFCProgress();
    setTimeout(()=>{
      scene.classList.remove('fc-card-exit');
      FC._finished=true;
      FC._transitioning=false;
      saveFCProgress();
      showFCResults();
    },340);
  }
}
function showFCResults(){playSFX('finish');const pct=Math.round((FC.known.size/FC.terms.length)*100);const o=document.getElementById('fc-results');if(!o)return;o.style.display='flex';o.innerHTML=`<div style="font-size:40px;margin-bottom:8px">🎉</div><div class="results-pct">${pct}%</div><div style="color:var(--text2);margin-bottom:20px;font-weight:600">${FC.known.size} van ${FC.terms.length} gekend</div><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="btn btn-primary" onclick="fcHardReset()">↺ Opnieuw</button>${FC.known.size<FC.terms.length?`<button class="btn btn-red" onclick="fcReviewMistakes()">Fouten opnieuw</button>`:''}<button class="btn btn-glass" onclick="backToSet()">Terug naar set</button></div>`;}
function fcHardReset(){clearFCProgress();const activeTerms=getActiveTerms();FC={terms:FC.shuffleOn?shuffle([...activeTerms]):[...activeTerms],idx:0,flipped:false,front:FC.front||'term',shuffleOn:FC.shuffleOn!==undefined?FC.shuffleOn:true,loop:FC.loop||false,known:new Set(),history:[],streak:0,_active:true,_setId:SET.id,_origOrder:[...activeTerms],_finished:false};renderFlashcards();}
function fcUndoLastAction(){if(!FC.history.length)return;const last=FC.history.pop();FC.idx=last.idx;FC.streak=last.streak;const term=FC.terms[FC.idx];if(last.known)FC.known.delete(term);FC._finished=false;const o=document.getElementById('fc-results');if(o)o.style.display='none';fcUpdate();showToast('Actie ongedaan gemaakt');}
function fcReviewMistakes(){const mistakes=FC.terms.filter(t=>!FC.known.has(t));clearFCProgress();FC={terms:shuffle(mistakes),idx:0,flipped:false,front:FC.front,shuffleOn:true,loop:false,known:new Set(),history:[],streak:0,_active:true,_setId:SET.id,_origOrder:[...mistakes],_finished:false};renderFlashcards();}
function fcApplyShuffle(){const activeTerms=getActiveTerms();FC.terms=FC.shuffleOn?shuffle([...activeTerms]):[...activeTerms];FC.idx=0;FC.known.clear();FC._finished=false;clearFCProgress();fcUpdate();}

/* ══════════════════════════════════════════
   ANSWER MODE POPUP
   Shown once per session when first encountering multi-answer terms
══════════════════════════════════════════ */
let _answerModeAsked=false;
let _answerModeCallback=null;

function answerModeStepHTML(){
  return `
    <div class="onboard-handle"></div>
    <div class="onboard-body answer-mode-body">
      <span class="onboard-icon answer-mode-icon">${_iconAnswerHelp()}</span>
      <div class="onboard-title">Hoe moeten vragen beantwoord worden?</div>
      <div class="onboard-desc">Sommige antwoorden bevatten meerdere mogelijkheden. Kies hoe je die wilt beantwoorden.</div>
      <div class="answer-mode-options">
        <button class="answer-mode-btn" onclick="setAnswerMode(false)">
          <div class="answer-mode-btn-title">Alle antwoorden</div>
          <div class="answer-mode-btn-desc">Je geeft het volledige antwoord, inclusief alle alternatieven.</div>
        </button>
        <button class="answer-mode-btn" onclick="setAnswerMode(true)">
          <div class="answer-mode-btn-title">Eén antwoord</div>
          <div class="answer-mode-btn-desc">Eén van de mogelijke antwoorden is voldoende.</div>
        </button>
      </div>
    </div>`;
}

function showAnswerModeStep(overlay,reuseOverlay){
  const panel=overlay.querySelector('.onboard-panel');
  const applyStep=()=>{
    overlay.id='answer-mode-overlay';
    overlay.style.pointerEvents='';
    panel.classList.add('answer-mode-panel');
    panel.innerHTML=answerModeStepHTML();
    panel.classList.remove('answer-mode-step-out');
    panel.classList.add('answer-mode-step-in');
    setTimeout(()=>panel.classList.remove('answer-mode-step-in'),300);
  };
  if(reuseOverlay){
    overlay.style.pointerEvents='none';
    panel.classList.add('answer-mode-step-out');
    setTimeout(applyStep,180);
  }else{
    applyStep();
  }
}

function maybeShowAnswerModePopup(onDone,reuseOverlay=null){
  const hasMulti=SET.terms.some(t=>hasMultipleAlternatives(t.def)||hasMultipleAlternatives(t.term));
  if(_answerModeAsked||!hasMulti){
    if(onDone)onDone();
    return false;
  }
  _answerModeAsked=true;
  _answerModeCallback=typeof onDone==='function'?onDone:null;

  const overlay=reuseOverlay||document.createElement('div');
  if(!reuseOverlay){
    overlay.className='onboard-overlay';
    overlay.id='answer-mode-overlay';
    overlay.innerHTML='<div class="onboard-panel answer-mode-panel"></div>';
    document.body.appendChild(overlay);
  }
  showAnswerModeStep(overlay,!!reuseOverlay);
  return true;
}

function setAnswerMode(allowSingle){
  ST.allowSingle=allowSingle;
  OH.allowSingle=allowSingle;
  const stToggle=document.getElementById('st-allowsingle-toggle');
  const ohToggle=document.getElementById('oh-allowsingle-toggle');
  if(stToggle)stToggle.checked=allowSingle;
  if(ohToggle)ohToggle.checked=allowSingle;
  const overlay=document.getElementById('answer-mode-overlay');
  const onDone=_answerModeCallback;
  _answerModeCallback=null;
  dismissOnboardingOverlay(overlay,onDone);
}

/* ══════════════════════════════════════════
   STAMPEN
══════════════════════════════════════════ */
let ST={};

// Hold-to-skip timer state
let _skipHoldTimer = null;
let _skipHoldStarted = false;
let _skipHoldTriggered = false;
let _stAutoAdvanceTimer = null;

function renderStampen(deferAnswerPrompt=false){
  const activeTerms=getActiveTerms();
  if(!ST._active||ST._setId!==SET.id){
    const savedProg=loadSTProgress();
    if(savedProg&&savedProg.queueIndices){
      ST={
        terms:activeTerms,correct:savedProg.correct||0,wrong:savedProg.wrong||0,
        qmode:savedProg.qmode||'term',itype:savedProg.itype||'open',
        shuffleOn:savedProg.shuffleOn!==undefined?savedProg.shuffleOn:true,
        typoLevel:savedProg.typoLevel||2,hints:savedProg.hints!==false,
        copyCorrect:savedProg.copyCorrect||false,allowSingle:savedProg.allowSingle||false,
        sound:savedProg.sound!==false,streak:savedProg.streak||0,wrongItems:[],
        _active:true,_setId:SET.id,_finished:savedProg._finished||false,
        _queue:(savedProg.queueIndices||[]).map(i=>SET.terms[i]).filter(Boolean),
        _wrongRetry:(savedProg.wrongRetryIndices||[]).map(i=>SET.terms[i]).filter(Boolean),
        _pendingRetry:(savedProg.pendingRetryIndices||[]).map(i=>SET.terms[i]).filter(Boolean),
        _retryBlock:savedProg._retryBlock||false,
        _cpDoneAt:savedProg._cpDoneAt||-1
      };
    } else {
      ST={terms:activeTerms,correct:0,wrong:0,qmode:'term',itype:'open',shuffleOn:true,typoLevel:2,hints:true,copyCorrect:false,allowSingle:false,sound:true,streak:0,wrongItems:[],_active:true,_setId:SET.id,_finished:false,_queue:[],_wrongRetry:[],_pendingRetry:[],_retryBlock:false,_cpDoneAt:-1};
      stBuildQueue(activeTerms);
    }
  }
  const el=document.getElementById('main-screen');
  el.innerHTML=`
    <button class="back-btn" onclick="backToSet()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>Terug</button>
    <div class="st-wrap">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <div><div style="font-size:20px;font-weight:800"><svg width="16px" height="16px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path data-name="Rectangle 30" fill="rgba(149,0,0,0)" d="M0 0h256v256H0z"/><g data-name="Group 22" fill="var(--text)"><path data-name="Path 183" d="M104.824 240.655a114 114 0 0 1-21.587-6.727A115 115 0 0 1 63.7 223.283a116 116 0 0 1-17.02-14.1A116 116 0 0 1 32.64 192.1a115.5 115.5 0 0 1-10.6-19.612 115 115 0 0 1-6.7-21.671 116.8 116.8 0 0 1-2.34-23.27 115.6 115.6 0 0 1 6.693-38.905 115.1 115.1 0 0 1 18.53-33.252 115.5 115.5 0 0 1 28.042-25.266A113.9 113.9 0 0 1 101.5 15.176v24.293c-38.352 11.654-65.137 47.873-65.137 88.079 0 50.73 41.111 92 91.641 92s91.641-41.272 91.641-92v-.451h22.911v-9.828c.3 3.4.449 6.861.449 10.279a116.8 116.8 0 0 1-2.336 23.268 115.3 115.3 0 0 1-6.7 21.671 115.5 115.5 0 0 1-10.6 19.612 116 116 0 0 1-14.042 17.086 116 116 0 0 1-17.02 14.1 115 115 0 0 1-19.534 10.645 114 114 0 0 1-21.587 6.727A115.4 115.4 0 0 1 128 243a115.4 115.4 0 0 1-23.176-2.345M219.642 127.1a11.66 11.66 0 0 1 11.771-11.3 11.68 11.68 0 0 1 11.137 8.438v2.855Zm-4.176-27.873a90.6 90.6 0 0 0-5.329-13.2 11.613 11.613 0 0 1 5.266-15.594 11.7 11.7 0 0 1 15.656 5.245q1.908 3.825 3.533 7.808l.051.126.024.059v.009l.024.058.023.058v.012l.023.058.023.054v.011l.023.056v.011l.021.053c.011.027 0 0 0 .007s.015.037.023.055 0 .007.006.015l.022.055v.011l.02.05v.012l.022.054s.006.014.006.018.013.031.019.046v.01l.021.053q-.002.01.008.02c.01.01.013.034.02.052l.006.015.017.042.007.02.02.05.008.019.015.039.01.025c0 .014.01.028.016.041l.01.024.015.038c0 .01.01.024.013.033l.012.031.01.026.018.045.01.028c0 .009.007.02.011.028s.01.027.015.041l.011.028.012.03.011.029.016.042q.002.013.01.027c.008.014.01.028.018.045l.01.025.013.033.006.019.022.056.007.018c0 .014.007.019.013.033l.007.019.021.054.008.021.042.109v.012l.027.068v.007l.015.039.027.071v.013l.044.115.029.077.044.118v.008l.044.119.075.2v.007l.12.324.12.326c.242.658.475 1.313.706 1.976v.007l.042.121.07.2v.01q.022.059.04.118v.007l.023.068v.014l.012.037v.011l.021.063.007.02.02.06v.015c0 .011.008.024.012.035l.006.018.019.057.006.019.011.034v.014l.021.061.006.021.017.05c0 .008.006.016.009.025l.01.031.008.027.015.045c0 .009.006.019.009.028l.011.03c.005.011.01.03.015.045l.008.025.011.033.008.024c0 .016.01.032.015.048l.009.025.012.037c0 .007.008.024.01.031l.013.038.007.023.017.052.006.016.015.046v.014l.018.055.006.017.019.057.019.059v.013l.019.058v.008l.019.057v.007l.02.061v.008l.041.127.021.066.043.134.214.671a11.625 11.625 0 0 1-7.652 14.58 11.7 11.7 0 0 1-3.5.535 11.68 11.68 0 0 1-11.024-8.116ZM193.619 62.85a92.5 92.5 0 0 0-10.766-9.413 11.6 11.6 0 0 1-2.35-16.284 11.71 11.71 0 0 1 16.343-2.345l.023.017.017.012.044.033.019.014.028.021.015.011.047.036.017.012.044.033.019.014.027.02.022.017.04.029.021.015.038.029.023.017.027.02.022.016.036.028.024.019.024.018.038.029.023.017.024.018.036.028.026.019.023.017.035.027.026.02.024.019.023.017.038.028.024.019.027.02.032.024.027.021.021.016.04.031.019.015.029.022.026.019.033.025.02.016.039.029.021.016.029.023.019.015.04.031.02.016.035.026.021.016.033.026.018.013.042.032.018.014.032.025.02.016.039.03.016.012.043.033.016.012.034.026.015.011.043.033.018.014.042.033.011.009.039.03.015.011.044.034.015.011.04.032.007.006.047.037.012.01.048.037.007.006.046.036h.006l.049.037.01.009.049.039.05.038.007.007.049.039.007.006.049.038.049.039.009.007.049.04.05.04.05.04.008.007.051.041.051.041h.006l.051.041.107.085.053.042.107.085.434.349a115 115 0 0 1 8.81 7.9l.147.147.093.093.007.007.044.044.008.008.038.038.008.008.041.041.012.011.04.041.012.012.032.033.013.013.038.038.017.017.032.032.017.017.028.029.019.018.035.036.019.019.021.022.034.034.019.019.023.023.018.019.038.038.014.014.083.084.008.008.051.052.089.09.034.034a11.6 11.6 0 0 1-.215 16.445 11.67 11.67 0 0 1-8.153 3.3 11.67 11.67 0 0 1-8.327-3.476Zm-35.962-22.683a91.4 91.4 0 0 0-13.834-3.528 11.64 11.64 0 0 1-9.508-13.453 11.676 11.676 0 0 1 13.489-9.474q5.064.876 9.968 2.184l.128.034.127.034.075.021h.012l.12.032h.01l.118.032h.016l.061.017h.018l.036.01h.015l.064.018h.016l.036.01h.013l.063.017.022.006.053.015.024.007.033.01.023.006.048.014.028.008.03.008.037.011.036.01.032.008.027.008.049.014.023.006.037.011.021.007.052.015.021.006.045.013.023.006.044.012h.018l.057.016h.013l.049.013h.015l.055.016h.017l.052.015h.007l.059.017h.014l.06.017.058.017h.014l.059.017h.007l.058.017h.006l.062.018h.006l.128.037q2.514.729 4.981 1.57a11.62 11.62 0 0 1 7.275 14.77 11.68 11.68 0 0 1-11.051 7.874 11.7 11.7 0 0 1-3.77-.574ZM101.5 15.073l.065-.015h.007l.129-.031h.006l.133-.031.068-.015.135-.031.133-.031.133-.03.2-.046.133-.03.134-.03.068-.015.135-.03.133-.029.134-.029.341-.074.136-.029.205-.044.137-.029.136-.028q.412-.086.826-.17l.827-.163.136-.026.133-.026.2-.039.134-.025h.006l.134-.025.137-.026.068-.012.133-.024h.006l.132-.024h.006l.134-.024.066-.012.133-.024h.007l.131-.024h.006l.066-.012.065-.011h.006l.065-.011h.009l.061-.011.063-.011h.011l.125-.022h.015l.061-.011h.007l.057-.01h.012l.061-.011h.011l.056-.01h.009l.061-.01h.015l.059-.011h.006l.056-.01h.019l.057-.009h.016l.048-.008h.016l.057-.01h.018l.048-.008h.015l.057-.01h.019l.053-.009h.013l.053-.009h.019l.057-.009h.018l.042-.007h.023l.053-.009h.023l.039-.006h.022l.052-.008h.026l.036-.006.04-.007.035-.006h.028l.04-.007.036-.006h.06l.049-.007h.058l.051-.008h.086l.055-.009h.023l.035-.006h.027l.053-.008h.023l.036-.006h.013l.066-.011h.021l.068-.011h.011l.038-.006h.019l.061-.009h.019l.038-.006h.011l.074-.011h.012l.126-.019h.006q.62-.093 1.243-.179a11.673 11.673 0 0 1 13.161 9.924 11.64 11.64 0 0 1-9.962 13.123 92 92 0 0 0-13.748 3Z" opacity=".6"/><path data-name="Path 184" d="M206 138a25 25 0 0 1 25-25 25 25 0 0 1 25 25 25 25 0 0 1-25 25 25 25 0 0 1-25-25M79 25a25 25 0 0 1 25-25 25 25 0 0 1 25 25 25 25 0 0 1-25 25 25 25 0 0 1-25-25"/></g></svg> Stampen</div><div style="font-size:13px;color:var(--text2)">${esc(SET.title)}</div></div>
        <div class="mode-actions">
          ${modeHelpButtonHTML()}
          <div class="settings-dropdown-wrap">
          <button class="btn-icon" onclick="toggleDD('st-dd')"><svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><g transform="translate(-2433 -926)"><path data-name="Rectangle 20" fill="rgba(0,0,0,0)" d="M2433 926h256v256h-256z"/><path data-name="Subtraction 1" d="M2674 1114h-169.013a30 30 0 0 0 4.013-15 30 30 0 0 0-4.013-15H2674a14.9 14.9 0 0 1 10.606 4.394A14.9 14.9 0 0 1 2689 1099a14.9 14.9 0 0 1-4.393 10.606A14.9 14.9 0 0 1 2674 1114m-220.987 0H2448a14.9 14.9 0 0 1-10.606-4.393A14.9 14.9 0 0 1 2433 1099a14.9 14.9 0 0 1 4.393-10.606A14.9 14.9 0 0 1 2448 1084h5.015a30 30 0 0 0-4.014 15 30 30 0 0 0 4.012 15M2674 1024h-25.013a30 30 0 0 0 4.013-15 30 30 0 0 0-4.013-15H2674a14.9 14.9 0 0 1 10.606 4.394A14.9 14.9 0 0 1 2689 1009a14.9 14.9 0 0 1-4.393 10.605A14.9 14.9 0 0 1 2674 1024m-76.987 0H2448a14.9 14.9 0 0 1-10.606-4.393A14.9 14.9 0 0 1 2433 1009a14.9 14.9 0 0 1 4.393-10.607A14.9 14.9 0 0 1 2448 994h149.014a30 30 0 0 0-4.013 15 30 30 0 0 0 4.012 15" fill="var(--text)" opacity=".6"/><rect data-name="Rectangle 56" width="60" height="60" rx="30" transform="translate(2593 979)" fill="var(--text)" opacity=".4"/><rect data-name="Rectangle 55" width="60" height="60" rx="30" transform="translate(2449 1069)" fill="var(--text)" opacity=".4"/><path data-name="Rectangle 53" d="M2623 995a14 14 0 1 0 14 14 14.016 14.016 0 0 0-14-14m0-16a30 30 0 1 1-30 30 30 30 0 0 1 30-30" fill="var(--text)"/><path data-name="Rectangle 54" d="M2479 1085a14 14 0 1 0 14 14 14.016 14.016 0 0 0-14-14m0-16a30 30 0 1 1-30 30 30 30 0 0 1 30-30" fill="var(--text)"/></g></svg></button>
          <div id="st-dd" class="settings-dropdown" style="display:none">
            <div class="settings-section"><div class="settings-section-title">Vraagrichting</div><div class="settings-row"><span class="settings-row-label">Naar</span><select class="settings-select" onchange="ST.qmode=this.value"><option value="term" ${ST.qmode==='term'?'selected':''}>Begrip → Def.</option><option value="def" ${ST.qmode==='def'?'selected':''}>Def. → Begrip</option><option value="mix" ${ST.qmode==='mix'?'selected':''}>Gemengd</option></select></div></div>
            <div class="settings-section"><div class="settings-section-title">Type invoer</div><div class="settings-row"><span class="settings-row-label">Modus</span><select class="settings-select" onchange="ST.itype=this.value;stHardReset()"><option value="open" ${ST.itype==='open'?'selected':''}>Schriftelijk</option><option value="mc" ${ST.itype==='mc'?'selected':''}>Meerkeuze</option><option value="mix" ${ST.itype==='mix'?'selected':''}>Gemengd</option></select></div></div>
            <div class="settings-section"><div class="settings-section-title">Extra</div>
              <div class="settings-row"><span class="settings-row-label">Niveau</span><select class="settings-select" onchange="ST.typoLevel=+this.value"><option value="1" ${ST.typoLevel===1?'selected':''}>Soepel</option><option value="2" ${ST.typoLevel===2?'selected':''}>Gemiddeld</option><option value="3" ${ST.typoLevel===3?'selected':''}>Streng</option></select></div>
              <div class="settings-row"><span class="settings-row-label">Enkele antwoorden</span><label class="toggle"><input type="checkbox" id="st-allowsingle-toggle" ${ST.allowSingle?'checked':''} onchange="ST.allowSingle=this.checked"><span class="toggle-slider"></span></label></div>
              <div class="settings-row"><span class="settings-row-label">Schudden</span><label class="toggle"><input type="checkbox" ${ST.shuffleOn?'checked':''} onchange="ST.shuffleOn=this.checked;stHardReset()"><span class="toggle-slider"></span></label></div>
              <div class="settings-row"><span class="settings-row-label">Hint tonen</span><label class="toggle"><input type="checkbox" ${ST.hints?'checked':''} onchange="ST.hints=this.checked"><span class="toggle-slider"></span></label></div>
              <div class="settings-row"><span class="settings-row-label">Geluid afspelen</span><label class="toggle"><input type="checkbox" ${ST.sound?'checked':''} onchange="ST.sound=this.checked"><span class="toggle-slider"></span></label></div>
              <div class="settings-row"><span class="settings-row-label">Juiste antw. overnemen</span><label class="toggle"><input type="checkbox" ${ST.copyCorrect?'checked':''} onchange="ST.copyCorrect=this.checked"><span class="toggle-slider"></span></label></div>
              ${modeHelpSettingHTML()}
            </div>
            <div style="margin-top:10px"><button class="btn btn-glass btn-sm" style="width:100%" onclick="stHardReset();closeDD('st-dd')">↺ Opnieuw</button></div>
          </div>
          </div>
        </div>
      </div>
      <div class="progress-row"><div class="progress-track"><div class="progress-fill" id="st-prog" style="width:0%"></div></div>${streakCircleHTML('st-streak',ST.streak||0)}</div>
      <div class="stats-row" style="margin-top:12px">
        <div class="stat-box"><div class="stat-num stat-blue" id="st-left">${ST._queue.length}</div><div class="stat-label">Resterend</div></div>
        <div class="stat-box"><div class="stat-num stat-green" id="st-cor">${ST.correct}</div><div class="stat-label">Goed</div></div>
        <div class="stat-box" title="Termen die herhaling nodig hebben"><div class="stat-num stat-red" id="st-wr">${ST._pendingRetry.length+ST._wrongRetry.length}</div><div class="stat-label">Fout</div></div>
      </div>
      <div id="st-main"></div>
      <div class="results-overlay" id="st-results"></div>
    </div>`;
  if(ST._finished){ stShowResultsOverlay(); }
  else if(!deferAnswerPrompt){
    maybeShowAnswerModePopup(()=>stRenderQ());
  }
}

function stBuildQueue(terms){
  const src=terms||getActiveTerms();
  ST._queue=ST.shuffleOn?shuffle([...src]):[...src];
  ST._wrongRetry=[];ST._pendingRetry=[];ST._retryBlock=false;
}

function stGetCurrent(){
  if(ST._retryBlock && ST._wrongRetry.length > 0){
    return {t: ST._wrongRetry[0], isRetry: true};
  }
  ST._retryBlock = false;
  if(ST._queue.length > 0){
    return {t: ST._queue[0], isRetry: false};
  }
  if(ST._pendingRetry.length > 0){
    ST._wrongRetry.push(...ST._pendingRetry);
    ST._pendingRetry = [];
    ST._retryBlock = ST._wrongRetry.length > 0;
    if(ST._wrongRetry.length > 0) return {t: ST._wrongRetry[0], isRetry: true};
  }
  return null;
}

function stGetPair(t){
  let d=ST.qmode==='mix'?(ST._lastDir==='term'?'def':'term'):ST.qmode;
  ST._dir=d;ST._lastDir=d;
  return{q:d==='term'?t.term:t.def,a:d==='term'?t.def:t.term};
}

function stRenderQ(){
  const el=document.getElementById('st-main');if(!el)return;
  const done=ST.correct+ST.wrong;
  if(done>0&&done%7===0&&done!==(ST._cpDoneAt||0)&&!ST._retryBlock){
    ST._cpDoneAt=done;
    showCheckpoint();
    return;
  }
  const cur=stGetCurrent();
  if(!cur){ST._finished=true;stShowResultsOverlay();return;}
  const{t,isRetry}=cur;
  const{q,a}=stGetPair(t);
  ST._currentQ=q;ST._currentA=a;ST._currentT=t;ST._isRetry=isRetry;ST.answered=false;ST._copyDone=false;
  const useType=ST.itype==='mix'?(Math.random()>.5?'open':'mc'):ST.itype;
  ST._useType=useType;
  const hintLen=Math.ceil(a.length/3);
  const hintText=a.slice(0,hintLen)+'...';
  const qlabel=ST._dir==='term'?'Definitie van:':'Begrip voor:';

  // Show multi-answer hint if applicable
  const multiHint = ST.allowSingle && hasMultipleAlternatives(a)
    ? `<div style="font-size:12px;color:var(--accent);font-weight:600;margin-top:6px;opacity:0.8">Eén antwoord volstaat</div>`
    : '';

  let body='';
  if(useType==='mc'){
    const allTermsForDistractors=SET.terms;
    const opts=shuffle([a,...shuffle(allTermsForDistractors.filter(x=>x!==t)).slice(0,3).map(x=>ST._dir==='term'?x.def:x.term)]);
    body=`<div class="mc-options" id="st-mc-opts">${opts.map((o,i)=>`<button class="mc-option" id="st-opt-${i}" onclick="stPickMC(${i},'${escA(o)}','${escA(a)}')">${'ABCD'[i]}. ${esc(o)}</button>`).join('')}</div>
    <div style="display:flex;justify-content:center;margin-top:8px"><button class="btn btn-glass btn-sm" id="st-skip-btn" onclick="stSkip()"><span>Vraag overslaan</span></button></div>
    <div id="st-fb" style="display:none;margin-top:12px"></div>
    <div id="st-next-area" style="display:none;text-align:center;margin-top:10px"><button class="btn btn-glass btn-sm" onclick="stNext()">Volgende →</button></div>`;
  } else {
    body=`<div style="margin-bottom:12px"><input type="text" id="st-inp" placeholder="Jouw antwoord..." onkeydown="stHandleInputKey(event)" autocomplete="off"></div>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="stCheckOpen()">Controleer</button>
      ${ST.hints?`<button class="st-hint-btn" onclick="document.getElementById('st-hint-area').innerHTML='<span style=color:var(--accent);font-weight:700>Hint: ${escA(hintText)}</span>'">Hint</button>`:''}
      <button class="btn btn-glass" id="st-skip-btn" onclick="stSkip()">
        <span>Sla over</span>
      </button>
    </div>
    <div id="st-fb" style="display:none;margin-top:12px"></div>
    <div id="st-copy-area" style="display:none;margin-top:12px"></div>
    <div id="st-next-area" style="display:none;text-align:center;margin-top:10px"><button class="btn btn-glass btn-sm" onclick="stNext()">Volgende →</button></div>`;
  }
  const currentStIndex = getTermIndex(ST._currentT);
  const currentStStarred = currentStIndex >= 0 && isTermStarred(getSetStorageId(), currentStIndex);
  el.innerHTML=`
    <div class="st-qbox" style="animation:set-cardLeft .3s var(--ease2);position:relative;">
      <button class="card-star-btn st-star-btn${currentStStarred?' starred':''}" title="${currentStStarred?'Ster verwijderen':'Markeer als moeilijk'}" onclick="event.stopPropagation();toggleStarCurrentTerm(event, ${currentStIndex})">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      </button>
      <div class="st-qlabel">${qlabel}${isRetry?' <span style="font-size:10px;background:rgba(232,58,74,0.15);color:var(--red);padding:2px 8px;border-radius:20px;margin-left:6px">Herhaling</span>':''}</div>
      <div class="st-qtext">${ST._dir==='term'?renderTerm(ST._currentT,'term')+renderImages(ST._currentT):renderTerm(ST._currentT,'def')}</div>
      ${multiHint}
      <div id="st-hint-area" style="margin:8px 0;font-size:14px"></div>
    </div>${body}`;
  if(useType==='open')setTimeout(()=>document.getElementById('st-inp')?.focus(),60);
}

/* ── Hold-to-skip logic ── */
function startSkipHold(e){
  if(e&&e.type==='touchstart') e.preventDefault();
  if(ST.answered) return;
  cancelSkipHold();
  _skipHoldStarted = true;
  _skipHoldTriggered = false;
  const btn = document.getElementById('st-skip-btn');
  if(btn){
    // Add fill animation
    const fill = document.createElement('div');
    fill.className = 'btn-skip-fill';
    fill.id = 'skip-fill-anim';
    btn.appendChild(fill);
  }
  _skipHoldTimer = setTimeout(()=>{
    if(_skipHoldStarted){
      _skipHoldTriggered=true;
      stSkip();
      cancelSkipHold(true);
    }
  }, 2000);
}

function cancelSkipHold(keepTriggered=false){
  _skipHoldStarted = false;
  clearTimeout(_skipHoldTimer);
  _skipHoldTimer = null;
  const fill = document.getElementById('skip-fill-anim');
  if(fill) fill.remove();
  if(!keepTriggered)_skipHoldTriggered=false;
}

/* ── Input keydown handler ── */
function stHandleInputKey(e){
  if(e.key==='Enter')e.preventDefault();
}

function stPickMC(idx,chosen,answer){
  if(ST.answered)return;
  const ok=chosen===answer;ST.answered=true;
  document.querySelectorAll('#st-mc-opts .mc-option').forEach(b=>{b.classList.remove('sel-correct','sel-wrong');b.style.pointerEvents='none';});
  document.getElementById('st-opt-'+idx).classList.add(ok?'sel-correct':'sel-wrong');
  if(ok){
    ST.correct++;ST.streak++;
    playSFX('correct');
    if(!ST._isRetry){ST._queue.shift();}
    else{ST._wrongRetry.shift();ST.wrongItems=ST.wrongItems.filter(w=>w.t!==ST._currentT);}
    checkStreak(ST.streak);stUpdateStats();saveSTProgress();
    const fb=document.getElementById('st-fb');if(fb){fb.style.display='block';fb.className='st-feedback fb-correct';fb.innerHTML='✓ Correct! 🎉';}
    scheduleStAutoAdvance(1000);
  } else {
    ST.streak=0;
    playSFX('incorrect');
    if(!ST._isRetry){ST.wrong++;ST.wrongItems.push({q:ST._currentQ,a:ST._currentA,given:chosen,t:ST._currentT});ST._pendingRetry.push(ST._currentT);ST._queue.shift();}
    else{ST._wrongRetry.shift();ST._pendingRetry.push(ST._currentT);}
    stUpdateStats();saveSTProgress();
    const fb=document.getElementById('st-fb');if(fb){fb.style.display='block';fb.className='st-feedback fb-wrong';fb.innerHTML=`✗ Fout. Juist: <strong>${esc(answer)}</strong>`;}
    const na=document.getElementById('st-next-area');if(na)na.style.display='block';
  }
}

function stCheckOpen(){
  const inp=document.getElementById('st-inp');if(!inp)return;
  if(ST.answered)return;
  const val=inp.value.trim();
  if(!val){inp.classList.add('shake-anim');setTimeout(()=>inp.classList.remove('shake-anim'),400);return;}
  ST.answered=true;inp.disabled=true;
  const ok=checkAns(val,ST._currentA,ST.typoLevel,ST.allowSingle);
  if(ok){
    ST.correct++;ST.streak++;
    playSFX('correct');
    if(!ST._isRetry){ST._queue.shift();}
    else{ST._wrongRetry.shift();ST.wrongItems=ST.wrongItems.filter(w=>w.t!==ST._currentT);}
    checkStreak(ST.streak);stUpdateStats();saveSTProgress();
    const fb=document.getElementById('st-fb');
    if(fb){
      fb.style.display='block';fb.className='st-feedback fb-correct';
      const fullAnsNote = ST.allowSingle && hasMultipleAlternatives(ST._currentA)
        ? `<div style="font-size:12px;margin-top:6px;opacity:0.8">Volledig: <em>${esc(ST._currentA)}</em></div>` : '';
      fb.innerHTML='✓ Correct! 🎉'+fullAnsNote;
    }
    const na=document.getElementById('st-next-area');if(na)na.style.display='block';
    scheduleStAutoAdvance(1200);
  } else {
    ST.streak=0;
    playSFX('incorrect');
    if(!ST._isRetry){ST.wrong++;ST.wrongItems.push({q:ST._currentQ,a:ST._currentA,given:val,t:ST._currentT});ST._pendingRetry.push(ST._currentT);ST._queue.shift();}
    else{ST._wrongRetry.shift();ST._pendingRetry.push(ST._currentT);}
    stUpdateStats();saveSTProgress();
    const fb=document.getElementById('st-fb');
    if(fb){
      fb.style.display='block';fb.className='st-feedback fb-wrong';
      fb.innerHTML=`✗ Fout. Juist: <strong>${esc(ST._currentA)}</strong><br><button class="fb-override-btn" onclick="stOverride()">✓ Ik had het toch goed</button>`;
    }
    if(ST.copyCorrect){stShowCopyInput();}
    else{const na=document.getElementById('st-next-area');if(na)na.style.display='block';}
  }
}

function stShowCopyInput(){
  const ca=document.getElementById('st-copy-area');if(!ca)return;
  ca.style.display='block';
  ca.innerHTML=`
    <div style="font-size:13px;font-weight:700;color:var(--text2);margin-bottom:6px">✏️ Typ het juiste antwoord over om door te gaan:</div>
    <input type="text" id="st-copy-inp" placeholder="${escA(ST._currentA)}" autocomplete="off"
      oninput="stCheckCopyInput(this)"
      onkeydown="if(event.key==='Enter')stCheckCopyInput(document.getElementById('st-copy-inp'),true)">
    <div id="st-copy-fb" style="font-size:12px;color:var(--text3);margin-top:4px">Typ exact: <em>${esc(ST._currentA)}</em></div>`;
  setTimeout(()=>document.getElementById('st-copy-inp')?.focus(),60);
}

function stCheckCopyInput(inp,forceCheck){
  if(!inp)return;
  const val=inp.value;
  const correct=ST._currentA;
  if(val===correct){
    inp.classList.add('copy-inp-correct');inp.disabled=true;
    const fb=document.getElementById('st-copy-fb');
    if(fb){fb.style.color='var(--green)';fb.textContent='✓ Goed overgenomen!';}
    const na=document.getElementById('st-next-area');if(na)na.style.display='block';
    ST._copyDone=true;
  } else if(forceCheck){
    inp.classList.add('shake-anim');setTimeout(()=>inp.classList.remove('shake-anim'),400);
  }
}

function stOverride(){
  if(!ST._isRetry){ST.wrong=Math.max(0,ST.wrong-1);ST.correct++;}else{ST.correct++;}
  ST.streak=(ST._streakBeforeWrong||0)+1;
  if(ST._isRetry){ST._pendingRetry=ST._pendingRetry.filter(x=>x!==ST._currentT);}
  else{ST._pendingRetry=ST._pendingRetry.filter(x=>x!==ST._currentT);}
  ST.wrongItems=ST.wrongItems.filter(w=>w.t!==ST._currentT);
  const fb=document.getElementById('st-fb');if(fb){fb.className='st-feedback fb-correct';fb.innerHTML='✓ Als goed gerekend!';}
  const ca=document.getElementById('st-copy-area');if(ca)ca.style.display='none';
  checkStreak(ST.streak);stUpdateStats();
  scheduleStAutoAdvance(800);
}

function stSkip(){
  if(ST.answered)return;
  ST.answered=true;ST.streak=0;
  if(!ST._isRetry){ST.wrong++;ST.wrongItems.push({q:ST._currentQ,a:ST._currentA,given:'(overgeslagen)',t:ST._currentT});ST._pendingRetry.push(ST._currentT);ST._queue.shift();}
  else{ST._wrongRetry.shift();ST._pendingRetry.push(ST._currentT);}
  stUpdateStats();
  const fb=document.getElementById('st-fb');
  if(fb){
    fb.style.display='block';fb.className='st-feedback fb-wrong';
    fb.innerHTML=`Overgeslagen. Juist antwoord: <strong>${esc(ST._currentA)}</strong>`;
  }
  if(ST.copyCorrect&&ST._useType==='open'){stShowCopyInput();}
  else{const na=document.getElementById('st-next-area');if(na)na.style.display='block';}
  const inp=document.getElementById('st-inp');if(inp)inp.disabled=true;
  document.querySelectorAll('.st-hint-btn').forEach(b=>b.disabled=true);
}

function stNext(){
  if(_stAutoAdvanceTimer){clearTimeout(_stAutoAdvanceTimer);_stAutoAdvanceTimer=null;}
  if(ST.copyCorrect&&ST._useType==='open'&&ST.answered&&!ST._copyDone){
    const ca=document.getElementById('st-copy-area');
    if(ca&&ca.style.display!=='none'){
      const inp=document.getElementById('st-copy-inp');
      if(inp){inp.classList.add('shake-anim');setTimeout(()=>inp.classList.remove('shake-anim'),400);}
      return;
    }
  }
  stRenderQ();
}

function scheduleStAutoAdvance(delay){
  if(_stAutoAdvanceTimer)clearTimeout(_stAutoAdvanceTimer);
  _stAutoAdvanceTimer=setTimeout(()=>{_stAutoAdvanceTimer=null;stRenderQ();},delay);
}

function stUpdateStats(){
  const retryCount=ST._pendingRetry.length+ST._wrongRetry.length;
  const remaining=ST._queue.length;
  document.getElementById('st-left').textContent=remaining;
  document.getElementById('st-cor').textContent=ST.correct;
  document.getElementById('st-wr').textContent=retryCount;
  const done=ST.correct+ST.wrong;
  const total=done+remaining+retryCount;
  const prog=document.getElementById('st-prog');
  if(prog)prog.style.width=Math.round((done/Math.max(total,1))*100)+'%';
  updateStreakCircle('st-streak',ST.streak||0);
}

function stShowResultsOverlay(){
  playSFX('finish');
  clearSTProgress();
  const pct=Math.round((ST.correct/(ST.correct+ST.wrong||1))*100);
  const o=document.getElementById('st-results');if(!o)return;o.style.display='flex';
  o.innerHTML=`<div style="font-size:40px;margin-bottom:8px">🎉</div><div class="results-pct">${pct}%</div><div style="color:var(--text2);font-weight:600;font-size:17px;margin-bottom:24px">${ST.correct} goed, ${ST.wrong} fout</div>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="btn btn-primary btn-lg" onclick="stHardReset()">↺ Opnieuw</button><button class="btn btn-glass btn-lg" onclick="backToSet()">Terug</button></div>
    ${ST.wrongItems.length?`<div style="text-align:left;width:100%;max-width:500px;margin-top:24px"><div style="font-size:16px;font-weight:800;margin-bottom:12px">Foute antwoorden (${ST.wrongItems.length})</div>${ST.wrongItems.map(w=>`<div class="wrong-item"><div style="font-size:12px;color:var(--text3);font-weight:600;margin-bottom:3px">Vraag: ${esc(w.q)}</div><div style="color:var(--red);font-size:14px;font-weight:700">✗ ${esc(w.given)}</div><div style="color:var(--green);font-size:14px;font-weight:700">✓ ${esc(w.a)}</div></div>`).join('')}</div>`:''}`;
}

function stHardReset(){
  if(confirm('Weet je zeker dat je opnieuw wilt beginnen?')){
    clearSTProgress();
    const s={qmode:ST.qmode,itype:ST.itype,shuffleOn:ST.shuffleOn,typoLevel:ST.typoLevel,hints:ST.hints,copyCorrect:ST.copyCorrect,allowSingle:ST.allowSingle};
    const activeTerms=getActiveTerms();
    ST={...s,terms:activeTerms,correct:0,wrong:0,streak:0,wrongItems:[],_active:true,_setId:SET.id,_finished:false,_queue:[],_wrongRetry:[],_pendingRetry:[],_retryBlock:false,_cpDoneAt:-1};
    stBuildQueue(activeTerms);renderStampen();
  }
}

function showCheckpoint(){
  playSFX('checkpoint');
  if(ST._pendingRetry.length>0){
    ST._wrongRetry.push(...ST._pendingRetry);ST._pendingRetry=[];
    ST._retryBlock=ST._wrongRetry.length>0;
  }
  const done=ST.correct+ST.wrong;
  const retryCount=ST._wrongRetry.length+ST._pendingRetry.length;
  const remaining=ST._queue.length;
  const total=done+remaining+retryCount;
  const pct=Math.round((done/Math.max(total,1))*100);
  document.getElementById('checkpoint-layer').innerHTML=`
    <div class="checkpoint-overlay"><div class="checkpoint-panel">
      <div style="font-size:24px;font-weight:800;margin-bottom:4px">Voortgang: ${pct}%</div>
      <div style="color:var(--text2);font-size:15px;margin-bottom:16px">${done} vragen beantwoord</div>
      <div class="progress-track" style="margin-bottom:20px"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:${ST._wrongRetry.length?'16px':'0'}">
        <div class="stat-box"><div class="stat-num stat-green">${ST.correct}</div><div class="stat-label">Goed</div></div>
        <div class="stat-box"><div class="stat-num stat-red">${ST.wrong}</div><div class="stat-label">Fout</div></div>
      </div>
      ${ST._wrongRetry.length?`<div style="margin:12px 0 8px;font-size:13px;font-weight:700;color:var(--red)">Nu herhalen (${ST._wrongRetry.length} term${ST._wrongRetry.length===1?'':'en'})</div><div class="cp-mistake-list">${ST._wrongRetry.map(t=>`<div class="cp-term unknown">✗ ${esc(t.term)}</div>`).join('')}</div>`:''}
      <button class="btn btn-primary btn-lg" style="width:100%;margin-top:8px;position:relative;overflow:hidden" onclick="closeCheckpoint()">
        <div class="btn-timer-fill"></div><span style="position:relative;z-index:2">Doorgaan →</span>
      </button>
    </div></div>`;
  setTimeout(()=>{if(document.getElementById('checkpoint-layer').innerHTML)closeCheckpoint();},10000);
}
function closeCheckpoint(){document.getElementById('checkpoint-layer').innerHTML='';stRenderQ();}

/* ── OVERHOREN ── */
let OH={};
function renderOverhoren(deferAnswerPrompt=false){
  const activeTerms=getActiveTerms();
  if(!OH._setId||OH._setId!==SET.id){OH={qmode:'term',itype:'mc',shuffleOn:true,typoLevel:2,numOpts:4,numQuestions:Math.min(10,activeTerms.length),allowSingle:false,sound:true,_setId:SET.id};}
  OH.numQuestions=Math.min(OH.numQuestions,activeTerms.length);
  OH.answers={};OH._active=true;
  const el=document.getElementById('main-screen');
  el.innerHTML=`
    <button class="back-btn" onclick="backToSet()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>Terug</button>
    <div class="st-wrap">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <div><div style="font-size:20px;font-weight:800"><svg height="16px" width="16px" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><g transform="translate(-3598 1414)"><path data-name="Rectangle 30" fill="rgba(149,0,0,0)" d="M3598-1414h256v256h-256z"/><path data-name="Path 187" d="M3802-1158h-151a15.9 15.9 0 0 1-11.313-4.686A15.9 15.9 0 0 1 3635-1174v-224a15.9 15.9 0 0 1 4.686-11.314A15.9 15.9 0 0 1 3651-1414h117l50 50v190a15.9 15.9 0 0 1-4.686 11.314A15.9 15.9 0 0 1 3802-1158" fill="var(--text)" opacity=".4"/><rect data-name="Rectangle 41" width="112" height="7" rx="3.5" transform="translate(3661 -1331)" fill="var(--text)" opacity=".6"/><rect data-name="Rectangle 42" width="130" height="7" rx="3.5" transform="translate(3661 -1314)" fill="var(--text)" opacity=".6"/><rect data-name="Rectangle 43" width="109" height="7" rx="3.5" transform="translate(3661 -1298)" fill="var(--text)" opacity=".6"/><rect data-name="Rectangle 44" width="80" height="7" rx="3.5" transform="translate(3661 -1281)" fill="var(--text)" opacity=".6"/><rect data-name="Rectangle 45" width="91" height="7" rx="3.5" transform="translate(3661 -1264)" fill="var(--text)" opacity=".6"/><rect data-name="Rectangle 46" width="40" height="7" rx="3.5" transform="translate(3661 -1248)" fill="var(--text)" opacity=".6"/><path data-name="Path 186" d="M3768-1414v34a15.9 15.9 0 0 0 4.686 11.314A15.9 15.9 0 0 0 3784-1364h34z" fill="var(--text)"/></g></svg> Overhoren</div><div style="font-size:13px;color:var(--text2)">${esc(SET.title)}</div></div>
        <div class="mode-actions">
          ${modeHelpButtonHTML()}
          <div class="settings-dropdown-wrap">
          <button class="btn-icon" onclick="toggleDD('oh-dd')"><svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><g transform="translate(-2433 -926)"><path data-name="Rectangle 20" fill="rgba(0,0,0,0)" d="M2433 926h256v256h-256z"/><path data-name="Subtraction 1" d="M2674 1114h-169.013a30 30 0 0 0 4.013-15 30 30 0 0 0-4.013-15H2674a14.9 14.9 0 0 1 10.606 4.394A14.9 14.9 0 0 1 2689 1099a14.9 14.9 0 0 1-4.393 10.606A14.9 14.9 0 0 1 2674 1114m-220.987 0H2448a14.9 14.9 0 0 1-10.606-4.393A14.9 14.9 0 0 1 2433 1099a14.9 14.9 0 0 1 4.393-10.606A14.9 14.9 0 0 1 2448 1084h5.015a30 30 0 0 0-4.014 15 30 30 0 0 0 4.012 15M2674 1024h-25.013a30 30 0 0 0 4.013-15 30 30 0 0 0-4.013-15H2674a14.9 14.9 0 0 1 10.606 4.394A14.9 14.9 0 0 1 2689 1009a14.9 14.9 0 0 1-4.393 10.605A14.9 14.9 0 0 1 2674 1024m-76.987 0H2448a14.9 14.9 0 0 1-10.606-4.393A14.9 14.9 0 0 1 2433 1009a14.9 14.9 0 0 1 4.393-10.607A14.9 14.9 0 0 1 2448 994h149.014a30 30 0 0 0-4.013 15 30 30 0 0 0 4.012 15" fill="var(--text)" opacity=".6"/><rect data-name="Rectangle 56" width="60" height="60" rx="30" transform="translate(2593 979)" fill="var(--text)" opacity=".4"/><rect data-name="Rectangle 55" width="60" height="60" rx="30" transform="translate(2449 1069)" fill="var(--text)" opacity=".4"/><path data-name="Rectangle 53" d="M2623 995a14 14 0 1 0 14 14 14.016 14.016 0 0 0-14-14m0-16a30 30 0 1 1-30 30 30 30 0 0 1 30-30" fill="var(--text)"/><path data-name="Rectangle 54" d="M2479 1085a14 14 0 1 0 14 14 14.016 14.016 0 0 0-14-14m0-16a30 30 0 1 1-30 30 30 30 0 0 1 30-30" fill="var(--text)"/></g></svg></button>
          <div id="oh-dd" class="settings-dropdown" style="display:none">
            <div class="settings-section"><div class="settings-section-title">Type vragen</div>
              <div class="settings-row"><span class="settings-row-label">Aantal vragen</span><input type="number" class="settings-select" style="width:60px;padding:5px 8px" value="${OH.numQuestions}" min="1" max="${SET.terms.length}" onchange="OH.numQuestions=Math.min(+this.value,SET.terms.length);ohRestart()"></div>
              <div class="settings-row"><span class="settings-row-label">Modus</span><select class="settings-select" onchange="OH.itype=this.value;ohRestart()"><option value="mc" ${OH.itype==='mc'?'selected':''}>Meerkeuze</option><option value="open" ${OH.itype==='open'?'selected':''}>Schriftelijk</option><option value="mix" ${OH.itype==='mix'?'selected':''}>Gemengd</option></select></div>
              <div class="settings-row"><span class="settings-row-label">Richting</span><select class="settings-select" onchange="OH.qmode=this.value;ohRestart()"><option value="term" ${OH.qmode==='term'?'selected':''}>Begrip → Def.</option><option value="def" ${OH.qmode==='def'?'selected':''}>Def. → Begrip</option><option value="mix" ${OH.qmode==='mix'?'selected':''}>Gemengd</option></select></div>
              <div class="settings-row"><span class="settings-row-label">MC-opties</span><select class="settings-select" onchange="OH.numOpts=+this.value;ohRestart()"><option value="4" ${OH.numOpts===4?'selected':''}>4</option><option value="3" ${OH.numOpts===3?'selected':''}>3</option><option value="6" ${OH.numOpts===6?'selected':''}>6</option></select></div>
            </div>
            <div class="settings-section"><div class="settings-section-title">Extra</div>
              <div class="settings-row"><span class="settings-row-label">Niveau</span><select class="settings-select" onchange="OH.typoLevel=+this.value"><option value="1" ${OH.typoLevel===1?'selected':''}>Soepel</option><option value="2" ${OH.typoLevel===2?'selected':''}>Gemiddeld</option><option value="3" ${OH.typoLevel===3?'selected':''}>Streng</option></select></div>
              <div class="settings-row"><span class="settings-row-label">Enkele antwoorden</span><label class="toggle"><input type="checkbox" id="oh-allowsingle-toggle" ${OH.allowSingle?'checked':''} onchange="OH.allowSingle=this.checked"><span class="toggle-slider"></span></label></div>
              <div class="settings-row"><span class="settings-row-label">Schudden</span><label class="toggle"><input type="checkbox" ${OH.shuffleOn?'checked':''} onchange="OH.shuffleOn=this.checked;ohRestart()"><span class="toggle-slider"></span></label></div>
              <div class="settings-row"><span class="settings-row-label">Geluid afspelen</span><label class="toggle"><input type="checkbox" ${OH.sound?'checked':''} onchange="OH.sound=this.checked"><span class="toggle-slider"></span></label></div>
              ${modeHelpSettingHTML()}
            </div>
            <div style="margin-top:10px"><button class="btn btn-glass btn-sm" style="width:100%" onclick="ohRestart();closeDD('oh-dd')">↺ Nieuwe toets</button></div>
          </div>
          </div>
        </div>
      </div>
      <div class="progress-row" style="margin-bottom:12px"><div class="progress-track"><div class="progress-fill" id="oh-prog" style="width:0%"></div></div><span style="font-size:13px;color:var(--text2)" id="oh-ctr">0 / ${OH.numQuestions} beantwoord</span></div>
      <div id="oh-questions"></div>
      <button class="btn btn-primary btn-lg" style="width:100%;margin-top:20px" id="oh-submit" onclick="ohSubmit()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Toets inleveren</button>
    </div>`;

  if(!deferAnswerPrompt)maybeShowAnswerModeForOH(()=>ohBuild());
}

function maybeShowAnswerModeForOH(onDone,reuseOverlay=null){
  return maybeShowAnswerModePopup(onDone,reuseOverlay);
}

function ohBuild(){
  const activeTerms=getActiveTerms();
  const source=OH.shuffleOn?shuffle([...activeTerms]):[...activeTerms];
  const numQ=Math.min(OH.numQuestions,source.length);
  OH.questions=source.slice(0,numQ).map((t,i)=>{
    let d=OH.qmode==='mix'?(Math.random()>.5?'term':'def'):OH.qmode;
    const q=d==='term'?t.term:t.def,a=d==='term'?t.def:t.term;
    let type=OH.itype==='mix'?(Math.random()>.5?'mc':'open'):OH.itype;
    let opts=null;
    if(type==='mc'){const others=shuffle(SET.terms.filter(x=>x!==t)).slice(0,OH.numOpts-1).map(x=>d==='term'?x.def:x.term);opts=shuffle([a,...others]);}
    return{i,t,q,a,type,opts,dir:d};
  });
  OH.answers={};
  document.getElementById('oh-questions').innerHTML=OH.questions.map((qq,i)=>`
    <div class="oh-question-card" style="--oh-question-index:${Math.min(i,7)}" id="oh-q-${i}">
      <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:14px">
        <span style="background:var(--accent-light);color:var(--accent);border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0">${i+1}</span>
        <div style="font-size:15px;font-weight:700">${qq.dir==='term'?renderTerm(qq.t,'term')+renderImages(qq.t):renderTerm(qq.t,'def')}</div>
      </div>
      ${OH.allowSingle && hasMultipleAlternatives(qq.a) ? `<div style="font-size:12px;color:var(--accent);font-weight:600;margin-bottom:8px;opacity:0.8">Eén antwoord volstaat</div>` : ''}
      ${qq.type==='mc'?`<div class="mc-options" id="oh-opts-${i}">${qq.opts.map((o,j)=>`<button type="button" class="mc-option" id="oh-opt-${i}-${j}" aria-pressed="false" onclick="ohPickMC(${i},${j})">${'ABCDEF'[j]}. ${esc(o)}</button>`).join('')}</div>`
      :`<input type="text" id="oh-open-${i}" placeholder="Jouw antwoord..." oninput="ohOpenInput(${i},this.value)" autocomplete="off">`}
    </div>`).join('');
}

function ohPickMC(qi,oi){
  const question=OH.questions[qi];
  if(!question||!question.opts||question.opts[oi]===undefined)return;
  document.querySelectorAll(`#oh-opts-${qi} .mc-option`).forEach(b=>{b.classList.remove('is-selected');b.setAttribute('aria-pressed','false');});
  const btn=document.getElementById(`oh-opt-${qi}-${oi}`);
  if(!btn)return;
  btn.classList.add('is-selected');
  btn.setAttribute('aria-pressed','true');
  const chosen=question.opts[oi],answer=question.a;
  OH.answers[qi]={type:'mc',chosen,answer,correct:chosen===answer};ohCheckAll();
}
function ohOpenInput(qi,val){OH.answers[qi]={type:'open',chosen:val,answer:OH.questions[qi].a};ohCheckAll();}
function ohCheckAll(){
  const total=OH.questions.length,done=Object.keys(OH.answers).length;
  const prog=document.getElementById('oh-prog');if(prog)prog.style.width=Math.round((done/total)*100)+'%';
  const ctr=document.getElementById('oh-ctr');if(ctr)ctr.textContent=`${done} / ${total} beantwoord`;
  const sb=document.getElementById('oh-submit');if(sb){sb.style.display='';sb.disabled=false;}
}
function ohSubmit(){
  playSFX('finish');
  let correct=0;
  OH.questions.forEach((qq,i)=>{
    const ans=OH.answers[i]||{correct:false,chosen:'—',answer:qq.a,type:qq.type};
    if(ans.type==='open') ans.correct=checkAns(ans.chosen,qq.a,OH.typoLevel,OH.allowSingle);
    OH.answers[i]=ans;
    if(ans.correct)correct++;
  });
  const tot=OH.questions.length,pct=Math.round((correct/tot)*100);
  const el=document.querySelector('#main-screen .st-wrap');
  el.innerHTML=`
    <div style="background:var(--glass);border:1px solid var(--glass-border);border-radius:var(--r2);padding:32px;text-align:center;margin-bottom:24px;box-shadow:var(--glass-shadow)">
      <div style="font-size:72px;font-weight:800;letter-spacing:-2px;line-height:1;background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent">${pct}%</div>
      <div style="color:var(--text2);font-size:18px;font-weight:600;margin-bottom:24px">${correct} van ${tot} goed</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><button class="btn btn-primary btn-lg" onclick="ohRestart()">↺ Nieuwe toets</button><button class="btn btn-glass btn-lg" onclick="backToSet()">Terug</button></div>
    </div>
    <div class="section-hdr" style="margin-top:24px"><h3>Alle vragen</h3></div>
    ${OH.questions.map((qq,i)=>{const ans=OH.answers[i]||{correct:false,chosen:'—'};return`<div class="exam-review-item ${ans.correct?'exam-review-correct':'exam-review-wrong'}" style="animation:set-slideUp ${.08+i*.04}s var(--ease2) both"><div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:6px"><span style="background:${ans.correct?'rgba(24,182,114,0.15)':'rgba(232,58,74,0.12)'};color:${ans.correct?'var(--green)':'var(--red)'};border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0">${i+1}</span><div style="font-size:14px;font-weight:700">${renderTerm(qq.t,qq.dir)}${qq.dir==='term'?renderImages(qq.t):''}</div></div>${!ans.correct?`<div style="font-size:13px;color:var(--red);font-weight:700">✗ Jij: ${esc(ans.chosen)}</div>`:''}<div style="font-size:13px;color:var(--green);font-weight:700">✓ ${renderTerm(qq.t,qq.dir==='term'?'def':'term')}${qq.dir==='def'?renderImages(qq.t):''}</div></div>`;}).join('')}`;
  OH._active=false;
}
function ohRestart(){renderOverhoren();}

/* ── STREAK ── */
const ENCOURAGE=['🔥 Op rolletjes!','💪 Geweldig!','⚡ Scherp!','🎯 Raak!','✨ Fantastisch!','🚀 Bijna perfect!'];
function checkStreak(n){if(n>0&&n%5===0)showMilestone(n);else if(n===3)showEncourage('🔥 Op rolletjes!');else if(n>0&&n%2===0)showEncourage(ENCOURAGE[Math.floor(Math.random()*ENCOURAGE.length)]);}
function showEncourage(msg){const e=document.createElement('div');e.className='encourage';e.textContent=msg;document.body.appendChild(e);setTimeout(()=>e.remove(),1000);}
function showMilestone(n){const msgs={5:'5 op rij!',10:'10 op rij!',15:'15 op rij!',20:'Onstopbaar!',25:'Legendarisch!'};document.getElementById('milestone-panel').innerHTML=`<div style="font-size:54px;margin-bottom:10px;animation:set-pulseFlame 1s ease-in-out infinite">🔥</div><div class="milestone-num">${n}</div><div class="milestone-text">${msgs[n]||n+' op rij!'}</div><div style="color:var(--text2);font-size:16px;margin-top:4px">Geweldige streak!</div><button class="btn btn-primary" style="margin-top:20px" onclick="document.getElementById('milestone-overlay').classList.remove('active')">Doorgaan</button>`;document.getElementById('milestone-overlay').classList.add('active');}

/* ── DROPDOWN ── */
let openDD=null;
function toggleDD(id){
  const el=document.getElementById(id);if(!el)return;
  if(openDD&&openDD!==id)closeDD(openDD);
  if(el.style.display==='none'||!el.style.display){
    const originalWrap=el.parentElement;
    const trigger=el.previousElementSibling;
    el.style.display='block';openDD=id;
    if(id==='set-menu'&&window.innerWidth>640){
      const rect=trigger?.getBoundingClientRect();
      if(rect){
        const width=Math.min(280,window.innerWidth-24);
        el.dataset.portalWrap=originalWrap?.id||'';
        document.body.appendChild(el);
        el.style.position='fixed';el.style.width=`${width}px`;el.style.right='auto';
        el.style.left=`${Math.max(12,Math.min(rect.right-width,window.innerWidth-width-12))}px`;
        el.style.top=`${Math.min(rect.bottom+8,window.innerHeight-120)}px`;
        el.style.maxHeight=`${Math.max(110,window.innerHeight-Math.min(rect.bottom+8,window.innerHeight-120)-12)}px`;
      }
    }
  }else closeDD(id);
}
function closeDD(id){
  const el=document.getElementById(id);
  if(!el)return;
  el.classList.add('closing');
  setTimeout(()=>{
    el.classList.remove('closing');el.style.display='none';
    const wrap=el.dataset.portalWrap&&document.getElementById(el.dataset.portalWrap);
    if(wrap){wrap.appendChild(el);delete el.dataset.portalWrap;['position','width','right','left','top','max-height'].forEach(prop=>el.style.removeProperty(prop));}
  },200);
  if(openDD===id)openDD=null;
}
document.addEventListener('click',e=>{if(openDD&&!e.target.closest('.settings-dropdown-wrap'))closeDD(openDD);});

/* ── MODAL / TOAST ── */
function showModal(html){const panel=document.getElementById('modal-panel');const bg=document.getElementById('modal-bg');panel.className='';bg.classList.remove('share-modal-bg','closing');panel.innerHTML=html;bg.style.display='flex';document.body.style.overflow='hidden';}
function closeModal(){
  const bg=document.getElementById('modal-bg');
  const panel=document.getElementById('modal-panel');
  if(bg.classList.contains('share-modal-bg')&&!bg.classList.contains('closing')){
    const content=panel.querySelector('.share-sheet-content');
    panel.classList.remove('is-dragging','is-returning');
    panel.style.removeProperty('transition');
    panel.style.removeProperty('transform');
    if(content){content.style.removeProperty('transition');content.style.removeProperty('opacity');}
    bg.classList.add('closing');
    setTimeout(()=>{
      bg.style.display='none';
      bg.classList.remove('share-modal-bg','closing');
      panel.className='';
      panel.style.removeProperty('transition');
      panel.style.removeProperty('transform');
      panel.style.removeProperty('--share-dismiss-start');
      panel.style.removeProperty('--share-content-opacity');
      document.body.style.overflow='';
    },420);
    return;
  }
  bg.style.display='none';
  bg.classList.remove('share-modal-bg','closing');
  panel.className='';
  panel.style.removeProperty('transition');
  panel.style.removeProperty('transform');
  panel.style.removeProperty('--share-dismiss-start');
  panel.style.removeProperty('--share-content-opacity');
  document.body.style.overflow='';
}

function setupShareSheetSwipe(panel){
  const content=panel.querySelector('.share-sheet-content');
  const markSheetReady=()=>panel.classList.add('is-ready');
  panel.addEventListener('animationend',event=>{
    if(event.target===panel&&(event.animationName==='set-shareSheetMobileIn'||event.animationName==='set-shareSheetIn'))markSheetReady();
  });
  setTimeout(()=>{if(panel.isConnected)markSheetReady();},380);
  let startX=0,startY=0,currentY=0,renderedDistance=0,dragging=false,directionLocked=false,activeScroller=null;
  panel.addEventListener('touchstart',event=>{
    if(window.innerWidth>640||event.touches.length!==1)return;
    let candidate=event.target;
    activeScroller=null;
    while(candidate&&candidate!==panel){
      const style=getComputedStyle(candidate);
      if(candidate.scrollHeight>candidate.clientHeight+1&&/(auto|scroll)/.test(style.overflowY)){activeScroller=candidate;break;}
      candidate=candidate.parentElement;
    }
    startX=event.touches[0].clientX;
    startY=event.touches[0].clientY;
    currentY=startY;
    renderedDistance=0;
    dragging=true;
    directionLocked=false;
    panel.classList.add('is-dragging');
  },{passive:true});
  panel.addEventListener('touchmove',event=>{
    if(!dragging||event.touches.length!==1)return;
    const deltaX=event.touches[0].clientX-startX;
    const deltaY=event.touches[0].clientY-startY;
    if(!directionLocked&&Math.max(Math.abs(deltaX),Math.abs(deltaY))>6){
      directionLocked=true;
      if(Math.abs(deltaX)>Math.abs(deltaY)){dragging=false;panel.classList.remove('is-dragging');return;}
    }
    currentY=event.touches[0].clientY;
    const distance=Math.max(0,deltaY);
    if(distance<=2)return;
    if(activeScroller&&activeScroller.scrollTop>0){dragging=false;panel.classList.remove('is-dragging');return;}
    event.preventDefault();
    const maxDrag=panel.offsetHeight*.8;
    renderedDistance=Math.min(distance,maxDrag);
    const progress=maxDrag?renderedDistance/maxDrag:0;
    panel.style.transform=`translateY(${renderedDistance}px)`;
    if(content)content.style.opacity=String(1-progress);
  },{passive:false});
  const finishGesture=()=>{
    if(!dragging)return;
    dragging=false;
    const distance=Math.max(0,currentY-startY);
    if(distance>=panel.offsetHeight*.4){
      const maxDrag=panel.offsetHeight*.8;
      panel.style.setProperty('--share-dismiss-start',`${renderedDistance}px`);
      panel.style.setProperty('--share-content-opacity',String(Math.max(0,1-(renderedDistance/maxDrag))));
      panel.classList.remove('is-dragging');
      panel.classList.add('swipe-dismiss');
      closeModal();
      return;
    }
    panel.classList.add('is-returning');
    panel.classList.remove('is-dragging');
    panel.getBoundingClientRect();
    panel.style.transform='translateY(0)';
    if(content)content.style.opacity='1';
    setTimeout(()=>{
      if(!panel.isConnected)return;
      panel.style.removeProperty('transform');
      if(content)content.style.removeProperty('opacity');
      panel.classList.remove('is-returning');
    },340);
  };
  panel.addEventListener('touchend',finishGesture,{passive:true});
  panel.addEventListener('touchcancel',()=>{
    if(!dragging)return;
    dragging=false;
    panel.classList.remove('is-dragging');
    panel.style.removeProperty('transform');
    if(content)content.style.removeProperty('opacity');
  },{passive:true});
}
let _tt;function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(_tt);_tt=setTimeout(()=>t.classList.remove('show'),2500);}

/* ── KEYBOARD ── */
document.addEventListener('keydown',e=>{
  // Ctrl+F / Cmd+F opent zoekbalk
  if((e.ctrlKey||e.metaKey)&&e.key==='f'){
    if(currentMode==='home'){
      e.preventDefault();
      openTermsSearch();
      return;
    }
  }
  if(e.key==='Escape'){
    closeModal();
    document.getElementById('milestone-overlay').classList.remove('active');
    if(openDD)closeDD(openDD);
    if(termsSearchState.active)closeTermsSearch();
  }
  if(currentMode==='stampen'&&e.key==='Enter'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){
    if(e.target?.id==='st-copy-inp')return;
    e.preventDefault();
    if(ST.answered){
      if(!e.repeat)stNext();
      return;
    }
    if(!e.repeat)startSkipHold(e);
    return;
  }
  if(currentMode==='flashcards'){
    if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
    if(e.key==='ArrowLeft'){e.preventDefault();fcMark(false);}
    else if(e.key==='ArrowRight'){e.preventDefault();fcMark(true);}
    else if(e.key===' '){e.preventDefault();fcFlip();}
  }
});
document.addEventListener('keyup',e=>{
  if(currentMode!=='stampen'||e.key!=='Enter'||e.target?.id==='st-copy-inp')return;
  e.preventDefault();
  const wasTriggered=_skipHoldTriggered;
  cancelSkipHold();
  if(wasTriggered)return;
  if(!ST.answered&&ST._useType==='open')stCheckOpen();
});
window.addEventListener('blur',()=>cancelSkipHold());

/* ══════════════════════════════════════════
   SET ACTIONS
══════════════════════════════════════════ */
let activeSharePayload=null;
function showShareModal(){
  const url=`${window.location.origin}${window.location.pathname}?set=${encodeURIComponent(SET.slug)}`;
  activeSharePayload={title:SET.title,text:`Bekijk deze set op Velios+: ${SET.title}`,url};
  showModal(`
    <div class="share-sheet-handle" aria-hidden="true"></div>
    <div class="share-sheet-content">
      <div class="share-sheet-header"><div><h3>Delen</h3><p>${esc(SET.title)}</p></div><button class="share-close-btn" onclick="closeModal()" aria-label="Sluiten"><svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
      <div class="share-apps" aria-label="Delen via app">
        <button class="share-app" onclick="shareViaApp('whatsapp')"><img class="share-app-icon" src="assets/share/whatsapp.png" alt=""><span>WhatsApp</span></button>
        <button class="share-app" onclick="shareViaApp('messages')"><img class="share-app-icon" src="assets/share/messages.png" alt=""><span>Berichten</span></button>
        <button class="share-app" onclick="shareViaApp('messenger')"><img class="share-app-icon" src="assets/share/messenger.png" alt=""><span>Messenger</span></button>
        <button class="share-app" onclick="shareViaApp('mail')"><img class="share-app-icon" src="assets/share/mail.png" alt=""><span>Mail</span></button>
        <button class="share-app" onclick="shareViaApp('telegram')"><img class="share-app-icon" src="assets/share/telegram.png" alt=""><span>Telegram</span></button>
      </div>
      <div class="share-actions">
        <button class="share-action" onclick="copyShareLink()"><span class="share-action-icon"><svg viewBox="0 0 24 24"><rect x="8" y="8" width="11" height="11" rx="3"/><path d="M16 8V6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h2"/></svg></span><span>Link kopiëren</span><svg class="share-action-chevron" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button>
        <button class="share-action" onclick="shareViaSystem()"><span class="share-action-icon"><svg viewBox="0 0 24 24"><path d="M12 3v12m0-12L8 7m4-4 4 4"/><path d="M5 11v7a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-7"/></svg></span><span>Meer</span><svg class="share-action-chevron" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button>
      </div>
    </div>`);
  document.getElementById('modal-bg').classList.add('share-modal-bg');
  const panel=document.getElementById('modal-panel');
  panel.classList.add('share-modal-panel');
  setupShareSheetSwipe(panel);
}

async function copyShareLink(){
  if(!activeSharePayload)return;
  try{
    if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(activeSharePayload.url);
    else{const input=document.createElement('textarea');input.value=activeSharePayload.url;input.style.position='fixed';input.style.opacity='0';document.body.appendChild(input);input.select();document.execCommand('copy');input.remove();}
    showToast('Link gekopieerd');
  }catch(e){showToast('Kopiëren is mislukt');}
}

function shareViaApp(app){
  if(!activeSharePayload)return;
  const {title,text,url}=activeSharePayload;
  if(app==='whatsapp')window.open(`https://wa.me/?text=${encodeURIComponent(text+' '+url)}`,'_blank','noopener');
  else if(app==='messages')window.location.href=`sms:?&body=${encodeURIComponent(text+' '+url)}`;
  else if(app==='messenger')window.location.href=`fb-messenger://share?link=${encodeURIComponent(url)}`;
  else if(app==='mail')window.location.href=`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text+'\n\n'+url)}`;
  else if(app==='telegram')window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,'_blank','noopener');
}

async function shareViaSystem(){
  if(!activeSharePayload)return;
  if(navigator.share){
    try{await navigator.share(activeSharePayload);return;}catch(e){if(e&&e.name==='AbortError')return;}
  }
  await copyShareLink();
  showToast('Systeemdelen wordt hier niet ondersteund; de link is gekopieerd');
}

function makeCopyOfSet(){
  if(!SET)return;
  const newTitle=`Copy of ${SET.title}`;
  const newSlug=toSlug(newTitle);
  const newSet={id:'set_copy_'+Date.now(),slug:newSlug,title:newTitle,description:SET.description||'',vak:SET.vak||'',datum:SET.datum||'',terms:SET.terms.map(t=>({...t}))};
  try{
    const sets=JSON.parse(localStorage.getItem('sd_sets')||'[]');
    sets.push(newSet);localStorage.setItem('sd_sets',JSON.stringify(sets));
    showToast('✓ Kopie aangemaakt!');
    setTimeout(()=>{window.location.href=`set.html?set=${encodeURIComponent(newSlug)}`;},500);
  }catch(e){showToast('Fout bij kopie maken');}
}

function editCurrentSet(){
  if(!SET||!isLocalSet(SET)){showToast('Alleen je eigen sets zijn bewerkbaar');return;}
  closeDD('set-menu');
  window.location.href=`index.html?edit=${encodeURIComponent(SET.id)}`;
}

function deleteCurrentSet(){
  if(!SET||!isLocalSet(SET)){showToast('Alleen je eigen sets kunnen verwijderd worden');return;}
  closeDD('set-menu');
  if(SET._cloud||SET._synced||SET._cloudSetId){
    window.location.href=`index.html?delete=${encodeURIComponent(SET.id)}`;
    return;
  }
  showModal(`
    <h3 style="margin-bottom:12px">Set verwijderen?</h3>
    <p style="color:var(--text2);margin-bottom:20px">Weet je zeker dat je <strong>${esc(SET.title)}</strong> wilt verwijderen? Dit kan niet ongedaan worden gemaakt.</p>
    <div style="display:flex;gap:8px;justify-content:flex-end">
      <button class="btn btn-glass" onclick="closeModal()">Annuleren</button>
      <button class="btn btn-red" onclick="confirmDeleteSet()">Verwijderen</button>
    </div>
  `);
}
function confirmDeleteSet(){
  try{
    let sets=JSON.parse(localStorage.getItem('sd_sets')||'[]');
    sets=sets.filter(s=>s.id!==SET.id);
    localStorage.setItem('sd_sets',JSON.stringify(sets));
    closeModal();showToast('Set verwijderd');
    setTimeout(()=>{window.location.href='index.html';},600);
  }catch(e){showToast('Fout bij verwijderen');}
}

/* ══════════════════════════════════════════
   COMBINE SETS MODAL
══════════════════════════════════════════ */
let _combineSelected = new Set();

function showCombineSetsModal(){
  closeDD('set-menu');
  _combineSelected = new Set();
  _combineSelected.add(SET.id);
  const allSets = JSON.parse(localStorage.getItem('sd_sets')||'[]');
  showModal(`
    <h3 style="margin-bottom:4px">Sets combineren</h3>
    <p style="color:var(--text2);font-size:13px;margin-bottom:16px">Selecteer maximaal 5 sets om samen te voegen (huidige set is al geselecteerd).</p>
    <input type="text" class="combine-search" id="combine-search-inp" placeholder="Zoek een set..." oninput="renderCombineList(this.value)">
    <div id="combine-selected-info" style="font-size:13px;color:var(--accent);font-weight:700;margin-bottom:8px"></div>
    <div class="combine-sets-list" id="combine-sets-list"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
      <button class="btn btn-glass" onclick="closeModal()">Annuleren</button>
      <button class="btn btn-primary" onclick="doCombinateSets()" id="combine-confirm-btn">Combineer</button>
    </div>
  `);
  renderCombineList('');
  updateCombineInfo();
}

function renderCombineList(query){
  const allSets = JSON.parse(localStorage.getItem('sd_sets')||'[]');
  const q = (query||'').toLowerCase().trim();
  const filtered = allSets.filter(s=>!q||s.title.toLowerCase().includes(q)||(s.vak&&s.vak.toLowerCase().includes(q)));
  const el = document.getElementById('combine-sets-list');if(!el)return;
  if(!filtered.length){el.innerHTML='<div style="text-align:center;padding:20px;color:var(--text3);font-size:13px">Geen sets gevonden</div>';return;}
  el.innerHTML = filtered.map(s => {
    const isSelected = _combineSelected.has(s.id);
    const isCurrent = s.id === SET.id;
    const isDisabled = !isSelected && _combineSelected.size >= 5;
    return `<div class="combine-set-item${isSelected?' selected':''}${isDisabled?' disabled':''}" onclick="toggleCombineSet('${s.id}')" id="csi-${s.id}">
      <div class="combine-check">${isSelected?'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>':''}</div>
      <div><div class="combine-set-title">${esc(s.title)}${isCurrent?' <span style="font-size:11px;background:var(--accent-light);color:var(--accent);padding:1px 6px;border-radius:10px;margin-left:4px">Huidig</span>':''}</div><div class="combine-set-meta">${s.terms.length} begrippen${s.vak?' · '+esc(s.vak):''}</div></div>
    </div>`;
  }).join('');
}

function toggleCombineSet(id){
  if(id === SET.id) return;
  if(_combineSelected.has(id)){_combineSelected.delete(id);}
  else{if(_combineSelected.size >= 5){showToast('Maximum 5 sets selecteerbaar');return;}_combineSelected.add(id);}
  const q = document.getElementById('combine-search-inp')?.value || '';
  renderCombineList(q);updateCombineInfo();
}

function updateCombineInfo(){
  const el = document.getElementById('combine-selected-info');
  if(el) el.textContent = `${_combineSelected.size} van max. 5 sets geselecteerd`;
}

function doCombinateSets(){
  if(_combineSelected.size < 2){showToast('Selecteer minimaal 2 sets');return;}
  const allSets = JSON.parse(localStorage.getItem('sd_sets')||'[]');
  const selected = [..._combineSelected].map(id => allSets.find(s=>s.id===id)).filter(Boolean);
  if(selected.length < 2){showToast('Kon niet alle geselecteerde sets vinden');return;}
  const seenTerms = new Set();
  const combinedTerms = [];
  selected.forEach(s => {s.terms.forEach(t => {const key=(t.term||'').toLowerCase().trim();if(!seenTerms.has(key)){seenTerms.add(key);combinedTerms.push({...t});}});});
  const existingSets = allSets.map(s=>s.title);
  let num = 1;
  while(existingSets.includes(`Mijn combinatie (${num})`)) num++;
  const newTitle = `Mijn combinatie (${num})`;
  const newSlug = toSlug(newTitle);
  const newSet = {id:'set_combo_'+Date.now(),slug:newSlug,title:newTitle,description:'Combinatie van: '+selected.map(s=>s.title).join(', '),vak:'',datum:new Date().toISOString().split('T')[0],terms:combinedTerms};
  allSets.push(newSet);
  localStorage.setItem('sd_sets', JSON.stringify(allSets));
  closeModal();
  showToast(`✓ "${newTitle}" aangemaakt (${combinedTerms.length} begrippen)!`);
  setTimeout(()=>{ window.location.href=`set.html?set=${encodeURIComponent(newSlug)}`; }, 700);
}

/* PDF */
function printSetPDF(){
  if(!SET||!SET.terms.length){showToast('Geen begrippen om af te drukken');return;}
  let attempts=0;
  const checkInterval=setInterval(()=>{
    attempts++;
    let jsPDFClass=null;
    if(window.jspdf&&window.jspdf.jsPDF)jsPDFClass=window.jspdf.jsPDF;
    else if(window.jsPDF&&window.jsPDF.jsPDF)jsPDFClass=window.jsPDF.jsPDF;
    else if(window.jsPDF)jsPDFClass=window.jsPDF;
    if(jsPDFClass){clearInterval(checkInterval);generatePDF(jsPDFClass);}
    else if(attempts>30){clearInterval(checkInterval);showToast('PDF bibliotheek laadt niet. Probeer later opnieuw');}
  },100);
}
function generatePDF(jsPDFClass){
  try{
    const doc=new jsPDFClass();
    let yPos=30;
    const pageHeight=doc.internal.pageSize.height;
    const margins={left:20,right:20,top:20,bottom:20};
    doc.setFont('Helvetica','bold');doc.setFontSize(18);
    doc.text(`${SET.title}`,margins.left,20);
    const col1X=margins.left,col2X=105,colWidth=80;
    SET.terms.forEach((term)=>{
      if(yPos>pageHeight-margins.bottom){doc.addPage();yPos=margins.top;}
      doc.setFont('Helvetica','bold');doc.setFontSize(10);
      const termText=(term.term||'').replace(/[\x00-\x1F]/g,' ').replace(/<[^>]*>/g,'');
      const termLines=doc.splitTextToSize(termText,colWidth);
      doc.text(termLines,col1X,yPos);
      doc.setFont('Helvetica','normal');
      const defText=(term.def||'').replace(/[\x00-\x1F]/g,' ').replace(/<[^>]*>/g,'');
      const defLines=doc.splitTextToSize(defText,colWidth);
      doc.text(defLines,col2X,yPos);
      yPos+=Math.max(termLines.length,defLines.length)*7+5;
    });
    const filename=(SET.title||'begrippen').replace(/[^a-zA-Z0-9_-]/g,'_')+'.pdf';
    doc.save(filename);showToast('✓ PDF gedownload!');
  }catch(e){console.error('PDF generation error:',e);showToast('Fout bij PDF genereren: '+e.message);}
}

/* ── OFFLINE ── */
function getOfflineSets(){try{return JSON.parse(localStorage.getItem('sd_offline_sets')||'[]');}catch(e){return[];}}
function saveOfflineSets(arr){try{localStorage.setItem('sd_offline_sets',JSON.stringify(arr));}catch(e){}}
function isSetOffline(){if(!SET)return false;const offline=getOfflineSets();return offline.some(s=>s.id===SET.id||s.slug===SET.slug);}

function updateOfflineBtn(){
  const btn=document.getElementById('btn-offline-toggle');
  const label=document.getElementById('offline-btn-label');
  const svg=btn?.querySelector('svg');
  if(!btn||!label||!svg)return;
  if(isSetOffline()){
    btn.style.color='var(--red)';label.textContent='Niet meer opslaan';
    svg.outerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256"><path data-name="Rectangle 20" fill="rgba(0,0,0,0)" d="M0 0h256v256H0z"/><g data-name="Group 15" fill="var(--red)"><path data-name="Path 181" d="M190.628 256H66.231a22.12 22.12 0 0 1-15.521-6.256 20.93 20.93 0 0 1-6.429-15.1L27.774 72.076a20.93 20.93 0 0 1 6.429-15.1 22.12 22.12 0 0 1 15.521-6.259h155.345a22.12 22.12 0 0 1 15.521 6.256 20.93 20.93 0 0 1 6.429 15.1l-14.445 162.568a20.93 20.93 0 0 1-6.429 15.1A22.12 22.12 0 0 1 190.628 256M162.914 74.908a12.03 12.03 0 0 0-12.061 11.654l-4.635 132.749a12.09 12.09 0 0 0 11.646 12.489q.201.008.429.008a12.025 12.025 0 0 0 12.06-11.654l4.636-132.749a12.075 12.075 0 0 0-11.646-12.488 10 10 0 0 0-.429-.009m-69.829 0q-.215-.002-.429.007a12.09 12.09 0 0 0-11.646 12.49l4.635 132.749a12.025 12.025 0 0 0 12.059 11.654q.23.002.43-.008a12.09 12.09 0 0 0 11.647-12.489l-4.635-132.749a12.026 12.026 0 0 0-12.061-11.654"/><path data-name="Path 179" d="M30.793 41.057A8.453 8.453 0 0 1 22.34 32.6a16.906 16.906 0 0 1 16.906-16.9h27.773A15.7 15.7 0 0 1 82.718 0h90.566a15.7 15.7 0 0 1 15.7 15.7h27.774a16.906 16.906 0 0 1 16.902 16.9 8.45 8.45 0 0 1-8.452 8.453Z"/><path data-name="Path 180" d="M157.86 231.8a12.075 12.075 0 0 1-11.646-12.489l4.639-132.746a12.076 12.076 0 0 1 24.137.843l-4.637 132.746a12.076 12.076 0 0 1-12.061 11.654q-.212 0-.432-.008m-72.214-11.646L81.01 87.405a12.075 12.075 0 0 1 24.136-.84l4.636 132.749a12.075 12.075 0 0 1-11.647 12.489c-.143 0-.287.007-.429.007a12.076 12.076 0 0 1-12.06-11.656" opacity=".4"/></g></svg>`;
  } else {
    btn.style.color='';label.textContent='Offline gebruiken';
    svg.outerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256"><path data-name="Rectangle 20" fill="rgba(0,0,0,0)" d="M0 0h256v256H0z"/><g data-name="Group 24" transform="translate(-2446 -936.951)" fill="var(--text)"><g data-name="Group 23"><path data-name="Path 189" d="M2642.946 1106.865a15.41 15.41 0 0 1-12.337-6.617 84 84 0 0 0-24.246-16.065 79 79 0 0 0-32.126-6.6 79 79 0 0 0-32.125 6.6 84 84 0 0 0-24.245 16.063 15.4 15.4 0 0 1-12.609 6.62 15.75 15.75 0 0 1-15.545-15.949 16.12 16.12 0 0 1 4.354-11.072l-.143-.149a114.7 114.7 0 0 1 35.882-24.673 108.65 108.65 0 0 1 44.431-9.1 107.3 107.3 0 0 1 44.432 9.236 114.6 114.6 0 0 1 33.691 22.86 16.07 16.07 0 0 1 6.4 13.18 15.744 15.744 0 0 1-15.537 15.672Zm43.485-45.364a15.17 15.17 0 0 1-12.12-6.479 146.1 146.1 0 0 0-43.724-29.29 139.3 139.3 0 0 0-56.349-11.479 139.3 139.3 0 0 0-56.349 11.479 146.1 146.1 0 0 0-46.245 31.8l-.08-.082a15.03 15.03 0 0 1-10.257 4.055h-.273a15.523 15.523 0 0 1-15.034-15.977 15.83 15.83 0 0 1 5.174-11.5 172.7 172.7 0 0 1 54.407-37.458 168.9 168.9 0 0 1 68.657-13.983 168.9 168.9 0 0 1 68.656 13.987 172.7 172.7 0 0 1 55.7 38.791l-.25.255a15.9 15.9 0 0 1 3.656 10.456 15.5 15.5 0 0 1-15.294 15.428Z" opacity=".4"/><path data-name="Path 190" d="M2555.828 1153.209a24.76 24.76 0 0 1-7.519-18.275 24.76 24.76 0 0 1 7.519-18.276 25.14 25.14 0 0 1 18.411-7.464 25.13 25.13 0 0 1 18.411 7.464 24.76 24.76 0 0 1 7.52 18.276 24.76 24.76 0 0 1-7.52 18.275 25.13 25.13 0 0 1-18.411 7.464 25.14 25.14 0 0 1-18.411-7.464" opacity=".6"/></g><rect data-name="Rectangle 47" width="22.261" height="282.713" rx="11.13" transform="rotate(45 177.689 3696.811)"/></g></svg>`;
  }
}

function toggleOfflineSet(){
  if(!SET)return;
  let offline=getOfflineSets();
  if(isSetOffline()){
    offline=offline.filter(s=>s.id!==SET.id&&s.slug!==SET.slug);
    saveOfflineSets(offline);
    if(SET.fromServer||SET._serverFile){let sets=JSON.parse(localStorage.getItem('sd_sets')||'[]');sets=sets.filter(s=>s.id!==SET.id&&s.slug!==SET.slug);localStorage.setItem('sd_sets',JSON.stringify(sets));}
    showToast('Set verwijderd uit offline opslag');
  } else {
    const setToSave={...SET,_offlineSaved:true,_offlineSavedAt:Date.now()};
    offline.push({id:SET.id,slug:SET.slug,title:SET.title});
    saveOfflineSets(offline);
    let sets=JSON.parse(localStorage.getItem('sd_sets')||'[]');
    const idx=sets.findIndex(s=>s.id===SET.id||s.slug===SET.slug);
    if(idx>=0){sets[idx]=setToSave;}else{sets.push(setToSave);}
    localStorage.setItem('sd_sets',JSON.stringify(sets));
    showToast('✓ Set beschikbaar gemaakt voor offline gebruik!');
  }
  updateOfflineBtn();closeDD('set-menu');
}

function downloadVset(){
  if(!SET)return;
  const json=JSON.stringify(SET);
  const encoded=btoa(unescape(encodeURIComponent(xorStr(json,VSET_KEY))));
  const blob=new Blob([encoded],{type:'application/octet-stream'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=(SET.slug||toSlug(SET.title))+'.vset';a.click();URL.revokeObjectURL(url);
  showToast('✓ .vset bestand gedownload!');closeDD('set-menu');
}

let termsSearchState={active:false,matches:[],currentIdx:-1,highlighted:false};
let termsSearchCloseTimer=null;

function openTermsSearch(){
  const searchBox=document.getElementById('searchBox');
  const input=document.getElementById('termsSearchInput');
  clearTimeout(termsSearchCloseTimer);
  searchBox.classList.remove('search-closing');
  searchBox.style.display='flex';
  searchBox.offsetHeight;
  searchBox.classList.add('search-open');
  input.focus();
  termsSearchState.active=true;
}

function closeTermsSearch(){
  const searchBox=document.getElementById('searchBox');
  const input=document.getElementById('termsSearchInput');
  clearTimeout(termsSearchCloseTimer);
  searchBox.classList.remove('search-open');
  searchBox.classList.add('search-closing');
  termsSearchCloseTimer=setTimeout(()=>{
    searchBox.classList.remove('search-closing');
    searchBox.style.display='none';
  },180);
  input.value='';
  termsSearchState={active:false,matches:[],currentIdx:-1,highlighted:false};
  restoreTermsHTML();
  const termsList=document.querySelector('.terms-list');
  if(termsList) termsList.querySelectorAll('.term-item').forEach(el=>el.classList.remove('term-search-hidden'));
  document.getElementById('searchCounter').textContent='0/0';
  document.getElementById('searchNext').disabled=true;
  document.getElementById('searchPrev').disabled=true;
}

// Sla originele innerHTML op zodat we altijd kunnen resetten
function saveTermsHTML(){
  const termsList=document.querySelector('.terms-list');
  if(!termsList)return;
  termsList.querySelectorAll('.term-item').forEach((item,i)=>{
    if(!item.dataset.originalHtml) item.dataset.originalHtml = item.innerHTML;
  });
}

function restoreTermsHTML(){
  const termsList=document.querySelector('.terms-list');
  if(!termsList)return;
  termsList.querySelectorAll('.term-item').forEach(item=>{
    if(item.dataset.originalHtml) item.innerHTML = item.dataset.originalHtml;
  });
  const sid=getSetStorageId();
  termsList.querySelectorAll('.term-item').forEach(item=>{
    const idx=Number(item.dataset.termIdx);
    const starred=isTermStarred(sid,idx);
    const btn=item.querySelector('.star-btn');
    if(btn){
      btn.classList.toggle('starred', starred);
      const svg=btn.querySelector('svg');
      if(svg){svg.setAttribute('fill', starred?'#f5a623':'none');svg.setAttribute('stroke', starred?'#f5a623':'currentColor');}
    }
  });
}

function filterTerms(){
  const input=document.getElementById('termsSearchInput');
  const query=input.value.toLowerCase().trim();
  const termsList=document.querySelector('.terms-list');
  if(!termsList)return;

  // Zorg dat originele HTML opgeslagen is
  saveTermsHTML();
  // Reset naar origineel
  restoreTermsHTML();

  termsSearchState.matches=[];
  termsSearchState.currentIdx=-1;

  if(!query){
    termsList.querySelectorAll('.term-item').forEach(el=>el.classList.remove('term-search-hidden'));
    document.getElementById('searchCounter').textContent='0/0';
    document.getElementById('searchNext').disabled=true;
    document.getElementById('searchPrev').disabled=true;
    return;
  }

  const allItems=Array.from(termsList.querySelectorAll('.term-item'));
  allItems.forEach((item,idx)=>{
  // Zoek alleen in de echte inhoud, niet in labels of knopnamen.
  const searchableItem=item.cloneNode(true);
  searchableItem.querySelectorAll('.term-label,button').forEach(el=>el.remove());
  const searchableText=searchableItem.textContent.toLowerCase();
  
  if(searchableText.includes(query)){
    item.classList.remove('term-search-hidden');
    termsSearchState.matches.push({item,idx});
  }else{
    item.classList.add('term-search-hidden');
  }
});

  // Highlight alle matches met dim stijl
  termsSearchState.matches.forEach(({item})=>applyHighlight(item,query,false));

  updateSearchCounter();
  if(termsSearchState.matches.length>0){
    termsSearchState.currentIdx=0;
    activateCurrentMatch(query);
  }else{
    document.getElementById('searchCounter').textContent='Geen resultaten gevonden';
  }
}

function activateCurrentMatch(query){
  if(!query){
    const input=document.getElementById('termsSearchInput');
    query=input.value.toLowerCase().trim();
  }
  if(!query||termsSearchState.currentIdx<0)return;

  // Reset alles naar origineel en hermarkeer
  restoreTermsHTML();
  termsSearchState.matches.forEach(({item},i)=>{
    applyHighlight(item,query,i===termsSearchState.currentIdx);
  });

  const currentItem=termsSearchState.matches[termsSearchState.currentIdx].item;
  currentItem.scrollIntoView({behavior:'smooth',block:'center'});
  termsSearchState.highlighted=true;
  updateSearchCounter();
}

function applyHighlight(item, query, isCurrent){
  const allDivs = item.querySelectorAll('div');
  allDivs.forEach(div=>{
    // Sla label-divs over (BEGRIP / DEFINITIE tekst)
    if(div.classList.contains('term-label')) return;
    // Sla containers over die weer divs bevatten (alleen leaf-divs met echte tekst)
    const hasChildDivs = div.querySelector('div');
    if(hasChildDivs) return;
    walkAndHighlight(div, query, isCurrent);
  });
}
function highlightInContainer(container, query, isCurrent){
  // Gebruik innerHTML-based replace op alleen tekstnodes, veilig via recursie
  walkAndHighlight(container, query, isCurrent);
}

function walkAndHighlight(node, query, isCurrent){
  if(node.nodeType===Node.TEXT_NODE){
    const text=node.textContent;
    if(text.toLowerCase().includes(query)){
      const regex=new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
      const cls=isCurrent?'term-highlight term-highlight--active':'term-highlight term-highlight--dim';
      const wrapper=document.createElement('span');
      wrapper.innerHTML=text.replace(regex,`<span class="${cls}">$1</span>`);
      node.parentNode.replaceChild(wrapper,node);
    }
    return;
  }
  // Sla highlight-spans over (niet opnieuw highlighten)
  if(node.classList&&node.classList.contains('term-highlight'))return;
  // Kloon childNodes want we muteren de lijst
  Array.from(node.childNodes).forEach(child=>walkAndHighlight(child,query,isCurrent));
}

function highlightCurrentMatch(){
  const input=document.getElementById('termsSearchInput');
  const query=input.value.toLowerCase().trim();
  activateCurrentMatch(query);
}

function nextTermResult(){
  if(termsSearchState.matches.length===0)return;
  termsSearchState.currentIdx=(termsSearchState.currentIdx+1)%termsSearchState.matches.length;
  highlightCurrentMatch();
}

function prevTermResult(){
  if(termsSearchState.matches.length===0)return;
  termsSearchState.currentIdx=(termsSearchState.currentIdx-1+termsSearchState.matches.length)%termsSearchState.matches.length;
  highlightCurrentMatch();
}

function updateSearchCounter(){
  const total=termsSearchState.matches.length;
  const current=total>0?termsSearchState.currentIdx+1:0;
  document.getElementById('searchCounter').textContent=`${current}/${total}`;
  document.getElementById('searchNext').disabled=total<=1;
  document.getElementById('searchPrev').disabled=total<=1;
}

function handleSearchKeydown(e){
  if(e.key==='Escape'){closeTermsSearch();}
  else if(e.key==='ArrowDown'){e.preventDefault();nextTermResult();}
  else if(e.key==='ArrowUp'){e.preventDefault();prevTermResult();}
}

boot();

updateSetConnectionState();
window.addEventListener('online',updateSetConnectionState);
window.addEventListener('offline',updateSetConnectionState);

document.addEventListener('visibilitychange',async()=>{
  if(document.visibilityState==='visible'){
    updateSetConnectionState();
    loadThemeSettings();
    initSetHeaderAccount();
    if(currentMode==='home'&&await refreshOpenSyncedSet())renderSetView();
  }
});
setInterval(async()=>{
  if(document.visibilityState!=='visible')return;
  initSetHeaderAccount();
  if(currentMode==='home'&&await refreshOpenSyncedSet())renderSetView();
},12000);
window.addEventListener('storage',event=>{
  if(event.key==='sd_theme')loadThemeSettings();
  if(['sd_notif_read','sd_notif_deleted'].includes(event.key))updateSetNotificationDot();
  if(event.key==='sd_profile_updated_at')initSetHeaderAccount();
});
window.addEventListener('focus',initSetHeaderAccount);
window.addEventListener('pageshow',event=>{if(event.persisted)initSetHeaderAccount();});
