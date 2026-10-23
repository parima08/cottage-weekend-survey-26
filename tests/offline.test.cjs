const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const project=path.join(__dirname,'..');
const root=fs.existsSync(path.join(project,'index.html'))?project:path.join(project,'dist');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
function dataHarness(){
 const memory=new Map(),navigator={onLine:true};
 const start=html.indexOf('  // Successful responses only:');
 const end=html.indexOf('  // ---------- Analytics ----------',start);
 const context={navigator,document:{getElementById:()=>null},store:{get:k=>memory.get(k),set:(k,v)=>memory.set(k,v)},URL,location:{href:'https://example.com/cottage/'},AbortSignal,fetch:async()=>{throw Error('No network');}};
 const api=vm.runInNewContext(html.slice(start,end)+';({restoreCSV,saveCSV,failedData,dataStatus,getText})',context);
 return {api,memory,navigator};
}
test('saved CSV survives offline and failures retain its saved time',async()=>{
 const {api,memory,navigator}=dataHarness();
 api.saveCSV('rooms','sheet-A','names');
 const at=memory.get('cw26-csv-v1-rooms').at;
 navigator.onLine=false;
 assert.deepEqual(api.restoreCSV('rooms','sheet-A',s=>s.split(',')),['names']);
 api.failedData('rooms');
 assert.match(api.dataStatus('rooms'),/^Offline · saved /);
 assert.equal(memory.get('cw26-csv-v1-rooms').at,at);
 await assert.rejects(api.getText('https://sheets.example/data'),/Offline/);
 navigator.onLine=true;
 assert.match(api.dataStatus('rooms'),/^Couldn’t refresh · saved /);
});
test('wrong source and malformed CSV cannot replace valid assignments',()=>{
 const {api,memory}=dataHarness();
 api.saveCSV('seva','source-A','good');
 assert.equal(api.restoreCSV('seva','source-B',s=>s),null);
 assert.equal(api.restoreCSV('seva','source-A',()=>{throw Error('bad CSV')}),null);
 assert.equal(memory.get('cw26-csv-v1-seva').text,'good');
});
function workerHarness(prefix='/cottage-weekend-survey-26/'){
 const handlers={},values=new Map(),requests=[];
 let online=true,badResponse=false;
 const key=v=>typeof v==='string'?v:v.url;
 const cache={addAll:async list=>{for(const req of list)values.set(key(req),new Response('saved '+key(req)));},add:async req=>values.set(key(req),new Response('image')),put:async(k,v)=>values.set(key(k),v),match:async k=>values.get(key(k))?.clone()};
 const context={self:{location:{href:'https://example.com'+prefix+'sw.js'},clients:{claim:async()=>{}},skipWaiting:async()=>{},addEventListener:(n,f)=>handlers[n]=f},caches:{open:async()=>cache,keys:async()=>['other-app','cw26-shell-old','cw26-shell-v1'],delete:async k=>requests.push('delete '+k)},URL,Request,Response,AbortController,setTimeout,clearTimeout,fetch:async request=>{requests.push(key(request));if(!online)throw Error('Offline');return new Response('fresh',{status:badResponse?503:200});}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),context);
 return {handlers,values,requests,goOffline:()=>online=false,badResponse:()=>badResponse=true,async install(){let p;handlers.install({waitUntil:v=>p=v});await p;},async request(url,extra={}){let p;handlers.fetch({request:{url,method:'GET',mode:'cors',...extra},respondWith:v=>p=v});return p&&await p;}};
}
test('offline worker opens deep links at root and GitHub project paths',async()=>{
 for(const prefix of ['/','/cottage-weekend-survey-26/']){
  const h=workerHarness(prefix);await h.install();h.goOffline();
  const result=await h.request('https://example.com'+prefix+'?from=home#rooms',{mode:'navigate'});
  assert.match(await result.text(),new RegExp('saved https://example.com'+prefix+'index.html'));
  const config=await h.request('https://example.com'+prefix+'config.js?v=new');
  assert.match(await config.text(),/saved .*config.js/);
 }
});
test('worker never caches writes, sheet data, or unrelated pages',async()=>{
 const h=workerHarness();await h.install();
 assert.equal(await h.request('https://script.google.com/macros/exec',{method:'POST'}),undefined);
 assert.equal(await h.request('https://docs.google.com/spreadsheets/data.csv'),undefined);
 assert.equal(await h.request('https://example.com/cottage-weekend-survey-26/survey/',{mode:'navigate'}),undefined);
 let p;h.handlers.activate({waitUntil:v=>p=v});await p;
 assert.deepEqual(h.requests,['delete cw26-shell-old']);
});
test('HTTP failures retain the last good app shell',async()=>{
 const h=workerHarness();await h.install();h.badResponse();
 const response=await h.request('https://example.com/cottage-weekend-survey-26/',{mode:'navigate'});
 assert.match(await response.text(),/^saved /);
});

test('every precached local file is packaged with the app',()=>{
 const worker=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 for(const name of ['CORE','OPTIONAL']){
  const files=JSON.parse(worker.match(new RegExp('const '+name+'=(\\[[^;]+\\]);'))[1]);
  for(const file of files)assert.ok(fs.existsSync(path.join(root,file)),file);
 }
});
