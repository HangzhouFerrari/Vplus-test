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


  c.evaluate("window.confirm=()=>true;starModeActive=false;clearFCProgress();FC={};startMode('flashcards')")
  check('normal cards continuous',c.evaluate("document.getElementById('fc-prog').classList.contains('progress-track')"))
  c.evaluate("FC.learn=true;FC.shuffleOn=false;fcHardReset();window.learnMark=async value=>{fcMark(value);await new Promise(r=>setTimeout(r,550));}")
  c.evaluate("fcMark(true)")
  check('learning uses card transition',c.evaluate("FC._transitioning&&!!document.querySelector('.fc-card-ghost.fc-card-exit')&&document.getElementById('fc-scene').classList.contains('fc-card-enter')"))
  time.sleep(.6)
  c.evaluate("fcHardReset();showMilestone(5)")
  check('milestone countdown lasts two seconds',c.evaluate("getComputedStyle(document.querySelector('.milestone-close .btn-timer-fill')).animationDuration==='2s'"))
  time.sleep(2.4)
  check('milestone closes automatically',c.evaluate("!document.getElementById('milestone-overlay').classList.contains('active')"))
  c.evaluate("showEncourage('Goed gedaan!')")
  check('encouragement sits above answer button',c.evaluate("(()=>{const e=document.querySelector('.encourage').getBoundingClientRect(),b=document.querySelector('.fc-answer-actions .btn-green').getBoundingClientRect();return e.bottom<=b.top&&Math.abs((e.left+e.width/2)-(b.left+b.width/2))<80})()"))
  check('learning segments once per seven',c.evaluate("document.querySelectorAll('#fc-prog .round-progress-segment').length===Math.ceil(FC.terms.length/7)"))
  c.evaluate("(async()=>{await learnMark(false);for(let i=0;i<6;i++)await learnMark(true)})()")
  check('overview after seven',c.evaluate("FC.learnState.summary&&FC.learnState.round===0&&FC.idx===6&&FC.learnState.retries[0]===0&&!!document.querySelector('#checkpoint-layer .checkpoint-panel')"))
  c.evaluate("saveFCProgress();FC._active=false;renderFlashcards();window.savedRail=document.querySelector('#fc-prog .round-progress-rail')")
  check('overview restored',c.evaluate("FC.learnState.summary&&!!document.querySelector('#checkpoint-layer .checkpoint-panel')"))
  c.evaluate("(async()=>{window.savedRail=document.querySelector('#fc-prog .round-progress-rail');fcContinueLearn();await learnMark(false)})()")
  check('wrong retry pauses at checkpoint without inflating mistakes',c.evaluate("FC.learnState.round===0&&FC.idx===0&&FC.learnState.summary&&FC.learnState.retries.length===1&&FC.wrongAnswers===1"))
  c.evaluate("fcUndoLastAction()")
  check('undo retry restores counters and queue',c.evaluate("FC.wrongAnswers===1&&FC.learnState.retries.length===1&&FC.idx===0"))
  c.evaluate("saveFCProgress();FC._active=false;renderFlashcards();window.savedRail=document.querySelector('#fc-prog .round-progress-rail')")
  check('retry restored',c.evaluate("FC.learnState.retrying&&FC.idx===0"))
  c.evaluate("(async()=>{await learnMark(true)})()")
  check('next round preserves the progress rail',c.evaluate("window.savedRail===document.querySelector('#fc-prog .round-progress-rail')"))
  check('correct retry unlocks second round',c.evaluate("FC.learnState.round===1&&FC.idx===7&&!FC.learnState.retrying&&FC.wrongAnswers===0&&FC.correctAnswers===7&&FC.learnState.mistakes.includes(0)"))
  c.evaluate("(async()=>{while(!FC.learnState.summary)await learnMark(true)})()")
  check('short last round has overview',c.evaluate("FC.learnState.summary&&!FC._finished"))
  c.evaluate("fcContinueLearn()")
  check('learning completes after all cards',c.evaluate("FC._finished&&FC.known.size===FC.terms.length&&FC.wrongAnswers===0&&FC.correctAnswers===FC.terms.length&&!!document.getElementById('study-results-title')"))
  c.evaluate("fcMarkMistakesWithStars()")
  check('historical mistakes can be starred after completion',c.evaluate("getStarredTerms(getSetStorageId()).includes(getTermIndex(FC.terms[0]))"))
  c.evaluate("fcHardReset()")
  check('restart preserves learning choice',c.evaluate("FC.learn&&FC.learnState.round===0&&FC.idx===0&&FC.correctAnswers===0"))
  c.evaluate("FC.learn=false;fcHardReset()")
  check('switch back restores continuous bar',c.evaluate("document.getElementById('fc-prog').classList.contains('progress-track')&&!FC.learn"))
  c.evaluate("backToSet();startMode('overhoren');OH.answers[0]={chosen:'test'};ohCheckAll()")
  check('exam continuous and filling',c.evaluate("document.getElementById('oh-prog').classList.contains('progress-track')&&parseFloat(document.querySelector('#oh-prog .progress-fill').style.width)>0"))
  c.evaluate("backToSet();startMode('flashcards');FC.learn=true;FC.shuffleOn=false;fcHardReset()")
  c.evaluate("(async()=>{await learnMark(false);await learnMark(false);for(let i=0;i<5;i++)await learnMark(true);fcContinueLearn();await learnMark(false);})()")
  check('wrong retry yields to another card',c.evaluate("FC.idx===1&&!FC.learnState.summary&&FC.learnState.retries.length===1&&FC.learnState.deferredRetries[0]===0&&FC.wrongAnswers===2"))
  c.evaluate("(async()=>{await learnMark(false)})()")
  check('retry pass pauses with unique errors',c.evaluate("FC.learnState.summary&&FC.learnState.retries.join(',')==='0,1'&&FC.wrongAnswers===2"))
  c.evaluate("fcContinueLearn();backToSet()")
  check('leaving clears checkpoint and countdown',c.evaluate("!document.getElementById('checkpoint-layer').innerHTML&&studyCheckpointTimer===null"))
  (root/'docs/design-review/flashcard-learning.json').write_text(json.dumps(checks,indent=2)+'\n');print(json.dumps(checks,indent=2));assert all(x['ok'] for x in checks)
 finally:
  proc.terminate();proc.wait(timeout=10)
