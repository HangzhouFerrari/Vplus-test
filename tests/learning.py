"""Real-time Chrome DevTools checks for hover transitions and 3D card faces."""
import base64,hashlib,json,os,socket,struct,subprocess,tempfile,time,urllib.request
from pathlib import Path
root=Path(__file__).resolve().parent.parent
class CDP:
 def __init__(self,url):
  from urllib.parse import urlparse
  u=urlparse(url);self.s=socket.create_connection((u.hostname,u.port));self.s.settimeout(15);self.seq=0
  key=base64.b64encode(os.urandom(16)).decode();self.s.sendall(f'GET {u.path} HTTP/1.1\r\nHost: {u.netloc}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n'.encode())
  header=b''
  while not header.endswith(b'\r\n\r\n'):header+=self.s.recv(1)
  assert b'101' in header,header
 def read(self,n):
  out=b''
  while len(out)<n:out+=self.s.recv(n-len(out))
  return out
 def call(self,method,params={}):
  self.seq+=1;data=json.dumps({'id':self.seq,'method':method,'params':params}).encode();mask=os.urandom(4);n=len(data)
  header=bytes([129,128|n]) if n<126 else bytes([129,254])+struct.pack('!H',n)
  self.s.sendall(header+mask+bytes(v^mask[i%4] for i,v in enumerate(data)))
  while True:
   first,second=self.read(2);n=second&127
   if n==126:n=struct.unpack('!H',self.read(2))[0]
   elif n==127:n=struct.unpack('!Q',self.read(8))[0]
   msg=json.loads(self.read(n))
   if msg.get('id')==self.seq:
    if 'error'in msg:raise RuntimeError(msg)
    return msg.get('result',{})
 def evaluate(self,expression):
  r=self.call('Runtime.evaluate',{'expression':expression,'returnByValue':True,'awaitPromise':True})
  if 'exceptionDetails'in r:raise RuntimeError(r)
  return r.get('result',{}).get('value')
with tempfile.TemporaryDirectory(prefix='velios-hover-',ignore_cleanup_errors=True) as profile:
 proc=subprocess.Popen(['google-chrome','--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 try:
  portfile=Path(profile)/'DevToolsActivePort'
  for _ in range(100):
   if portfile.exists():break
   time.sleep(.1)
  port=portfile.read_text().splitlines()[0]
  targets=json.load(urllib.request.urlopen('http://127.0.0.1:'+port+'/json'))
  c=CDP(next(t['webSocketDebuggerUrl'] for t in targets if t['type']=='page'))
  c.call('Emulation.setDeviceMetricsOverride',{'width':1363,'height':936,'deviceScaleFactor':1,'mobile':False})
  c.call('Page.addScriptToEvaluateOnNewDocument',{'source':"sessionStorage.setItem('velios-sw-reloaded-20260919-1','1');if(navigator.serviceWorker)navigator.serviceWorker.register=()=>Promise.resolve({update:async()=>{}});"})
  c.call('Page.navigate',{'url':'http://127.0.0.1:8765/index.html?skipWelcome'})
  for _ in range(100):
   if c.evaluate("typeof showCreateModal==='function'"):break
   time.sleep(.1)
  c.evaluate("sessionStorage.setItem('velios-sw-reloaded-20260919-1','1');localStorage.setItem('sd_onboard','{\"home\":true,\"set\":true,\"flashcards\":true}');document.getElementById('onboard-overlay')?.remove();setAccessibilityPreference('reducedMotion',false);showPage('home')")
  for _ in range(200):
   if c.evaluate("document.readyState==='complete'&&!!document.body"):break
   time.sleep(.1)
  time.sleep(1);checks=[]
  def check(name,ok,data=None):checks.append({'name':name,'ok':ok,'data':data})
  c.call('Page.navigate',{'url':'http://127.0.0.1:8765/set.html?set=040402033'})
  for _ in range(200):
   if c.evaluate("document.readyState==='complete'&&typeof SET!=='undefined'&&!!SET"):break
   time.sleep(.1)

  c.evaluate("localStorage.setItem('sd_onboard',JSON.stringify({set:true,stampen:true,flashcards:true,overhoren:true}));document.getElementById('onboard-overlay')?.remove()")


  c.evaluate("window.confirm=()=>true;starModeActive=false;saveStarMode();clearFCProgress();FC={};startMode('flashcards');FC.shuffleOn=false;fcHardReset()")
  c.evaluate("fcMark(false)");time.sleep(.6)
  c.evaluate("toggleStarCurrentTerm({stopPropagation(){}},getTermIndex(FC.terms[FC.idx]));fcMark(true)");time.sleep(.6)
  check('star during flashcards keeps saving',c.evaluate("FC._active&&loadFCProgress().idx===2&&loadFCProgress().correctAnswers===1&&loadFCProgress().wrongAnswers===1"))
  c.evaluate("backToSet();saveStarredTerms(getSetStorageId(),[0,1,2]);toggleStarMode();startMode('flashcards')")
  check('starred flashcards start separately',c.evaluate("FC.idx===0&&FC.terms.length===3&&FC.terms.every(t=>[0,1,2].includes(getTermIndex(t)))"))
  c.evaluate("fcMark(true)");time.sleep(.6)
  c.evaluate("backToSet();toggleStarMode();startMode('flashcards')")
  check('all flashcards resume independently',c.evaluate("FC.idx===2&&FC.correctAnswers===1&&FC.wrongAnswers===1"))
  c.evaluate("backToSet();toggleStarMode();startMode('flashcards')")
  check('starred flashcards resume independently',c.evaluate("FC.idx===1&&FC.correctAnswers===1"))
  c.evaluate("backToSet();saveStarredTerms(getSetStorageId(),[0,1,2,3]);startMode('flashcards')")
  check('changed star selection gets correct terms',c.evaluate("FC.idx===0&&FC.terms.length===4"))
  c.evaluate("backToSet();saveStarredTerms(getSetStorageId(),[0,1,2]);startMode('flashcards')")
  check('returning to star selection restores progress',c.evaluate("FC.idx===1&&FC.terms.length===3"))
  c.evaluate("backToSet();starModeActive=false;saveStarMode();clearSTProgress();ST={};startMode('stampen');ST.shuffleOn=false;stHardReset();stPickMC(ST._mcOptions.findIndex(o=>o.value===ST._currentA),ST._currentA,ST._currentA);cancelStAdvance();stNext();toggleStarCurrentTerm({stopPropagation(){}},getTermIndex(ST._currentT));stSkip()")
  check('star and skip keep study progress',c.evaluate("ST._active&&loadSTProgress().correct===1&&loadSTProgress().wrong===1&&loadSTProgress().pendingRetryIndices.length===1"))
  c.evaluate("backToSet();saveStarredTerms(getSetStorageId(),[0]);toggleStarMode();clearSTProgress();ST={};startMode('stampen')")
  check('learning defaults to separate starred session',c.evaluate("ST.itype==='learn'&&ST.correct===0&&ST._learnOrder.length===1"))
  # Simulate advancing past feedback without waiting for audio or milestone dialogs.
  c.evaluate("window.answerLearning=()=>{if(ST._useType==='mc')stPickMC(ST._mcOptions.findIndex(o=>o.value===ST._currentA),ST._currentA,ST._currentA);else{document.getElementById('st-inp').value=ST._currentA;stCheckOpen();}cancelStAdvance();document.getElementById('milestone-overlay').classList.remove('active');ST._cpDoneAt=ST.correct+ST.wrong;stNext();}")
  check('first round is multiple choice 1',c.evaluate("ST._learnRound===0&&ST._useType==='mc'&&learnRoundLabel()==='Meerkeuze · Ronde 1'"))
  c.evaluate("answerLearning()")
  check('second round is multiple choice 2',c.evaluate("ST._learnRound===1&&ST._useType==='mc'"))
  c.evaluate("stSkip();cancelStAdvance();ST._cpDoneAt=ST.correct+ST.wrong;stNext()")
  check('wrong multiple choice cannot unlock writing',c.evaluate("ST._learnRound===1&&ST._useType==='mc'&&ST._isRetry"))
  c.evaluate("saveSTProgress();ST._active=false;renderStampen()")
  check('pending retry and round resume correctly',c.evaluate("ST._learnRound===1&&ST._useType==='mc'&&ST._isRetry"))
  c.evaluate("answerLearning()")
  check('writing unlocked by correct multiple choice',c.evaluate("ST._learnRound===2&&ST._useType==='open'&&ST._learnPassedMC.includes(getTermIndex(ST._currentT))"))
  for phase,kind,label in [(3,'mc','Meerkeuze · Ronde 3'),(4,'open','Schriftelijk · Ronde 2'),(5,'mc','Meerkeuze · Ronde 4'),(6,'open','Schriftelijk · Ronde 3'),(7,'mc','Meerkeuze · Ronde 5')]:
   c.evaluate("answerLearning()")
   check('learning round '+str(phase),c.evaluate("ST._learnRound==="+str(phase)+"&&ST._useType==='"+kind+"'&&learnRoundLabel()==='"+label+"'&&!ST._finished"))
  c.evaluate("backToSet();toggleStarMode();startMode('stampen')")
  check('all study progress survives starred learning',c.evaluate("ST.correct===1&&ST.wrong===1&&ST._learnRound===0"))
  c.evaluate("backToSet();toggleStarMode();startMode('stampen')")
  check('starred study round survives filter switch',c.evaluate("ST._learnRound===7&&ST._learnOrder.length===1"))
  expected=c.evaluate("({round:ST._learnRound,correct:ST.correct,wrong:ST.wrong,key:ST._progressKey})")
  c.evaluate("saveSTProgress()")
  c.call('Page.reload')
  for _ in range(200):
   if c.evaluate("document.readyState==='complete'&&typeof SET!=='undefined'&&!!SET&&typeof startMode==='function'"):break
   time.sleep(.1)
  c.evaluate("startMode('stampen')")
  actual=c.evaluate("({round:ST._learnRound,correct:ST.correct,wrong:ST.wrong,key:ST._progressKey})")
  check('actual page reload restores scoped round',actual==expected,actual)
  c.evaluate("window.confirm=()=>true;backToSet();starModeActive=false;saveStarMode();clearSTProgress();ST={};startMode('stampen');ST.shuffleOn=false;stHardReset();window.answerLearning=()=>{if(ST._useType==='mc')stPickMC(ST._mcOptions.findIndex(o=>o.value===ST._currentA),ST._currentA,ST._currentA);else{document.getElementById('st-inp').value=ST._currentA;stCheckOpen();}cancelStAdvance();document.getElementById('milestone-overlay').classList.remove('active');ST._cpDoneAt=ST.correct+ST.wrong;stNext();}")
  first=c.evaluate("ST._queue.map(getTermIndex)")
  check('round has seven distinct terms',len(first)==7 and len(set(first))==7,first)
  for _ in range(6):c.evaluate("answerLearning()")
  check('six answers stay in first round',c.evaluate("ST._learnRound===0&&ST._queue.length===1"))
  c.evaluate("answerLearning()")
  second=c.evaluate("ST._queue.map(getTermIndex)")
  check('seventh answer starts next batch',c.evaluate("ST._learnRound===1&&ST._queue.length===7") and second!=first,second)
  c.evaluate("stSkip();ST._cpDoneAt=ST.correct+ST.wrong;stNext()")
  for _ in range(6):c.evaluate("answerLearning()")
  check('batch waits for wrong answer retry',c.evaluate("ST._learnRound===1&&ST._isRetry&&ST._useType==='mc'"))
  c.evaluate("answerLearning()")
  check('written round repeats batch one',c.evaluate("ST._useType==='open'&&ST._learnRound===2") and c.evaluate("ST._queue.map(getTermIndex)")==first)
  for _ in range(3):c.evaluate("answerLearning()")
  before=c.evaluate("({round:ST._learnRound,queue:ST._queue.map(getTermIndex),order:ST._learnOrder.map(getTermIndex)})")
  c.evaluate("saveSTProgress();ST._active=false;renderStampen()")
  check('partial seven-term batch resumes',before==c.evaluate("({round:ST._learnRound,queue:ST._queue.map(getTermIndex),order:ST._learnOrder.map(getTermIndex)})"))
  for _ in range(4):c.evaluate("answerLearning()")
  check('written one leads to multiple choice three',c.evaluate("ST._learnRound===3&&ST._useType==='mc'&&ST._queue.length===7"))
  for _ in range(7):c.evaluate("answerLearning()")
  check('written two repeats batch two',c.evaluate("ST._learnRound===4&&ST._useType==='open'") and c.evaluate("ST._queue.map(getTermIndex)")==second)
  for mode,prefix in [('flashcards','fc'),('stampen','st'),('overhoren','oh')]:
   c.evaluate("startMode('"+mode+"')")
   check('restart label '+mode,c.evaluate("document.querySelector('#"+prefix+"-dd .mode-settings-footer button').textContent.trim()==='Opnieuw'"))
  c.evaluate("backToSet();starModeActive=false;saveStarMode();startMode('flashcards');saveFCProgress();window.originalTerm=SET.terms[0].term;SET.terms[0].term+=' changed'")
  check('edited set cannot restore mismatched indices',c.evaluate("loadFCProgress()===null"))
  c.evaluate("SET.terms[0].term=window.originalTerm")
  (root/'docs/design-review/learning.json').write_text(json.dumps(checks,indent=2)+'\n');print(json.dumps(checks,indent=2));assert all(x['ok'] for x in checks)
 finally:
  proc.terminate();proc.wait(timeout=10)
