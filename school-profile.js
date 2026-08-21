(function(){
  'use strict';
  const STORAGE_KEY='sd_school_preferences';
  const ALL_SUBJECTS=['Aardrijkskunde','Biologie','Duits','Economie','Engels','Frans','Geschiedenis','Grieks','Latijn','Natuurkunde','Nederlands','Scheikunde','Wiskunde'];
  const LOWER={
    '1':['Aardrijkskunde','Biologie','Engels','Frans','Geschiedenis','Nederlands','Wiskunde'],
    '2':['Aardrijkskunde','Biologie','Duits','Engels','Frans','Geschiedenis','Natuurkunde','Nederlands','Wiskunde'],
    '3':['Aardrijkskunde','Biologie','Duits','Engels','Frans','Geschiedenis','Natuurkunde','Nederlands','Scheikunde','Wiskunde']
  };
  const PROFILES={
    NT:['Wiskunde','Nederlands','Engels','Scheikunde','Natuurkunde'],
    NG:['Wiskunde','Nederlands','Engels','Scheikunde','Biologie'],
    EM:['Wiskunde','Nederlands','Engels','Economie','Geschiedenis'],
    CM:['Wiskunde','Nederlands','Engels','Geschiedenis']
  };
  const defaults={schoolClass:'',schoolProfile:'',gymnasium:false,extraSubjects:[],hideIrrelevant:true};
  const cleanList=value=>[...new Set((Array.isArray(value)?value:[]).map(String).filter(subject=>ALL_SUBJECTS.includes(subject)))];
  function normalize(value={}){
    const schoolClass=String(value.schoolClass||value.school_class||value.klas||'').toLowerCase();
    const schoolProfile=String(value.schoolProfile||value.school_profile||value.profiel||'').toUpperCase();
    return {
      schoolClass:['1','2','3','4','5','6','overig'].includes(schoolClass)?schoolClass:'',
      schoolProfile:Object.prototype.hasOwnProperty.call(PROFILES,schoolProfile)?schoolProfile:'',
      gymnasium:value.gymnasium===true||value.gymnasium==='true',
      extraSubjects:cleanList(value.extraSubjects||value.extra_subjects),
      hideIrrelevant:value.hideIrrelevant!==undefined?value.hideIrrelevant!==false:value.hide_irrelevant_subjects!==false
    };
  }
  function readLocal(){try{return normalize(JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'))}catch(e){return {...defaults}}}
  function saveLocal(value){const next=normalize(value);try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next))}catch(e){}return next}
  function fromProfile(profile){
    const source=profile||{};
    const hasRemote=!!(source.school_class||source.schoolClass||source.klas);
    const value=normalize(source);
    return hasRemote?value:readLocal();
  }
  function isUpper(value){return ['4','5','6'].includes(normalize(value).schoolClass)}
  function isComplete(value){const p=normalize(value);return !!p.schoolClass&&(!isUpper(p)||!!p.schoolProfile)}
  function requiredSubjects(value){
    const p=normalize(value);
    if(p.schoolClass==='overig')return [...ALL_SUBJECTS];
    if(LOWER[p.schoolClass])return [...LOWER[p.schoolClass],...(p.gymnasium?['Latijn','Grieks']:[])];
    if(isUpper(p))return [...(PROFILES[p.schoolProfile]||[]),...(p.gymnasium?['Grieks','Latijn']:[])];
    return [...ALL_SUBJECTS];
  }
  function selectedSubjects(value){
    const p=normalize(value);
    if(p.schoolClass==='overig')return [...ALL_SUBJECTS,'Overig'];
    const selected=[...requiredSubjects(p)];
    if(isUpper(p))selected.push(...p.extraSubjects);
    selected.push('Overig');
    return [...new Set(selected)];
  }
  function visibleSubjects(value){const p=normalize(value);return !isComplete(p)||!p.hideIrrelevant?[...ALL_SUBJECTS,'Overig']:selectedSubjects(p)}
  function inferClassFromFilename(filename){const match=String(filename||'').match(/([1-6])\.vset(?:$|[?#])/i);return match?match[1]:''}
  function setClass(set){return String(set?.klas||set?.schoolClass||inferClassFromFilename(set?._serverFile||set?.filename||'')).toLowerCase()}
  function metadata(value){const p=normalize(value);return {school_class:p.schoolClass,school_profile:p.schoolProfile,gymnasium:p.gymnasium,extra_subjects:p.extraSubjects,hide_irrelevant_subjects:p.hideIrrelevant}}
  window.VeliosSchool={STORAGE_KEY,ALL_SUBJECTS,LOWER,PROFILES,defaults,normalize,readLocal,saveLocal,fromProfile,isUpper,isComplete,requiredSubjects,selectedSubjects,visibleSubjects,inferClassFromFilename,setClass,metadata};
})();
