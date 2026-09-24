/* Shared Velios controls and persistent accessibility preferences. */
function displaySetDate(value){
  const date=new Date(String(value).slice(0,10)+'T12:00:00');
  return Number.isNaN(date.getTime())?'':new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'short',year:'numeric'}).format(date);
}
// Keep Tab within an open dialog, while preserving native controls and scroll regions.
document.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const dialog=document.querySelector('.onboard-overlay:not(.closing) .onboard-panel') || document.querySelector('#modal-bg:not(.hidden) [role="dialog"]');
  if(!dialog)return;
  const controls=[...dialog.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select,textarea,[tabindex="0"],[contenteditable="true"]')].filter(el=>el.getClientRects().length&&!el.closest('[inert]'));
  const first=controls[0],last=controls.at(-1);
  if(!first){event.preventDefault();return;}
  if(!dialog.contains(document.activeElement)||(event.shiftKey&&document.activeElement===first)){event.preventDefault();(event.shiftKey?last:first).focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});

function actionIcon(name){
  const paths={check:'<path d="m5 12 4 4L19 6"/>',cross:'<path d="m6 6 12 12M6 18 18 6"/>',restart:'<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7"/>',next:'<path d="M4 12h16m-6-6 6 6-6 6"/>'};
  return `<svg class="ui-action-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]||''}</svg>`;
}

const ACCESSIBILITY_KEY='sd_accessibility';
function getAccessibilityPreferences(){
  try{return {highContrast:false,reducedMotion:false,underlineLinks:false,...JSON.parse(localStorage.getItem(ACCESSIBILITY_KEY)||'{}')};}catch{return {highContrast:false,reducedMotion:false,underlineLinks:false};}
}
function applyAccessibilityPreferences(){
  const preferences=getAccessibilityPreferences(),root=document.documentElement;
  root.classList.toggle('high-contrast',preferences.highContrast);
  root.classList.toggle('reduce-motion',preferences.reducedMotion);
  root.classList.toggle('underline-links',preferences.underlineLinks);
  const accent=getComputedStyle(root).getPropertyValue('--accent').trim()||'#ff9f0a';
  let rgb=accent.match(/^#([a-f0-9]{6})$/i)?.[1];
  let channels=rgb?[0,2,4].map(i=>parseInt(rgb.slice(i,i+2),16)):[255,159,10];
  if(preferences.highContrast){
    const lum=values=>values.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
    while(1.05/(lum(channels)+.05)<7)channels=channels.map(v=>Math.floor(v*.95));
  }
  root.style.setProperty('--action-fill',`rgb(${channels.join(',')})`);
  root.style.setProperty('--accent-contrast','#fff');
}
function setAccessibilityPreference(key,value){
  if(!['highContrast','reducedMotion','underlineLinks'].includes(key))return;
  const preferences=getAccessibilityPreferences();preferences[key]=!!value;
  localStorage.setItem(ACCESSIBILITY_KEY,JSON.stringify(preferences));applyAccessibilityPreferences();
}
applyAccessibilityPreferences();
window.addEventListener('storage',event=>{if(event.key===ACCESSIBILITY_KEY||event.key==='sd_theme')applyAccessibilityPreferences();});
