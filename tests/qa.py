"""Run browser regressions against a local server (python3 -m http.server 8765)."""
import html,json,re,subprocess,tempfile
from pathlib import Path
root=Path(__file__).resolve().parent.parent
source=(root/'index.html').read_text().replace('<head>','<head><base href="/">')
source=re.sub(r'<script[^>]+(?:cdn.jsdelivr.net|supabase-client.js)[^>]*></script>','',source)
stub="<script>const originalFetch=window.fetch;window.fetch=(url,...args)=>String(url).includes('sets/')?new Promise(()=>{}):originalFetch(url,...args);window.VeliosAuth={getSession:()=>new Promise(()=>{})};</script>"
fixture=root/'tests/.slow-index-fixture.html'
fixture.write_text(source.replace('<head>','<head>'+stub))
import atexit
atexit.register(lambda:fixture.unlink(missing_ok=True))
for page,budget in [('design-review',18000),('slow-index',4000),('responsive',22000),('motion',4000),('preferences',10000)]:
 with tempfile.TemporaryDirectory(prefix='velios-qa-') as profile:
  result=subprocess.run(['google-chrome','--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--user-data-dir='+profile,'--virtual-time-budget='+str(budget),*(['--force-prefers-reduced-motion'] if page=='motion' else []),'--dump-dom','http://127.0.0.1:8765/tests/'+page+'.html'],capture_output=True,text=True,timeout=60)
  match=re.search(r'<pre id="out">(.*?)</pre>',result.stdout,re.S)
  if not match:raise RuntimeError(result.stderr[-2000:])
  checks=json.loads(html.unescape(match[1]))
  (root/'docs/design-review'/f'{page}.json').write_text(json.dumps(checks,indent=2,ensure_ascii=False)+'\n')
  print(page, json.dumps(checks,ensure_ascii=False))
  assert all(c.get('ok') for c in checks),checks
