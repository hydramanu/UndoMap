let snapshot=null,report=null,activeId=null;
$('#demo-note').hidden=!demo;
if(demo)$('#scan').textContent='Explore example policies ↗';
async function scan(){
  $('#scan').disabled=true;status('Looking for actions and policy evidence…');
  try{
    if(demo){snapshot={actions:Object.values(fixtures).map(f=>({label:f.label,type:f.type})),...fixtures.subscription,guard:false};}
    else {const [tab]=await ext.tabs.query({active:true,currentWindow:true});if(!tab?.id||!/^https?:/.test(tab.url||''))throw Error('Open a regular HTTP or HTTPS webpage first. Browser settings and store pages cannot be scanned.');activeId=tab.id;await ext.scripting.executeScript({target:{tabId:tab.id},files:['core.js','content.js']});snapshot=await ext.tabs.sendMessage(tab.id,{type:'SCAN'});}
    $('#action').replaceChildren();
    const actions=snapshot.actions.length?snapshot.actions:[{label:'Manual policy review',type:'subscription'}];
    actions.forEach((a,i)=>{const o=element('option',a.label);o.value=String(i);$('#action').append(o);});snapshot.actions=actions;
    $('#controls').hidden=false;$('#guard').checked=snapshot.guard;$('#guard').disabled=demo;
    status(snapshot.actions[0].label==='Manual policy review'?'No supported action found. Choose a category and paste relevant policy text.':'Review the detected action and its evidence.');selectAction();
  }catch(e){status(e.message||'This browser page does not allow scanning.');}finally{$('#scan').disabled=false;}
}
function selectAction(){$('#reminder').value='';const a=snapshot.actions[Number($('#action').value)];$('#category').value=a.type;$('#policy').value='';if(demo)snapshot={...snapshot,...fixtures[a.type]};analyze();}
function analyze(){try{const a=snapshot.actions[Number($('#action').value)];report=UndoMap.analyze({type:$('#category').value,label:a.label,text:$('#policy').value||snapshot.text,url:snapshot.url,links:snapshot.links});renderReport();}catch(e){status(e.message);}}
function renderReport(){
  const root=$('#report');root.hidden=false;root.replaceChildren();
  const head=element('div',undefined,'report-head');head.append(element('span',report.type.toUpperCase(),'eyebrow'),element('span',report.caution?'REVIEW CAREFULLY':'VERIFY POLICY','pill'));root.append(head,element('h2',report.state),element('p',report.site,'small'));
  root.append(element('p',`${report.coverage}/4 evidence categories found`,'coverage'),element('p','Coverage is not an undo score or a probability of recovery.','small'));
  for(const [title,items]of [['Time window',report.windows],['Fees & financial terms',report.costs],['Recovery instructions',report.routes]]){const block=element('div',undefined,'fact');block.append(element('h3',title));for(const text of items.length?items:['Not found in the scanned evidence.'])block.append(element('p',text));root.append(block);}
  const details=element('details');details.append(element('summary',`Source evidence (${report.evidence.length} clauses)`));for(const text of report.evidence)details.append(element('blockquote',text));root.append(details);
  if(report.links.length){const p=element('div',undefined,'policy-links');p.append(element('h3','Policy links on this site'));for(const l of report.links){const a=element('a',l.label||'Open policy');a.href=l.url;a.target='_blank';a.rel='noopener noreferrer';p.append(a);}root.append(p);}
  root.append(element('p',report.note,'small'));$('#title').value=report.label;$('#save').hidden=false;
}
$('#scan').onclick=scan;$('#action').onchange=selectAction;$('#category').onchange=analyze;$('#analyze').onclick=analyze;
$('#manual').onclick=()=>{snapshot={actions:[{label:'Manual policy review',type:'subscription'}],text:'',url:'',links:[],guard:false};activeId=null;$('#action').replaceChildren(element('option','Manual policy review'));$('#action').firstElementChild.value='0';$('#category').value='subscription';$('#policy').value='';$('#controls').hidden=false;$('#guard').disabled=true;$('#guard').checked=false;$('#controls details').open=true;analyze();$('#policy').focus();status('Choose a category, paste relevant policy text, and click Analyze added text. No website is attributed to manual text.');};
$('#guard').onchange=async()=>{try{await ext.tabs.sendMessage(activeId,{type:'GUARD',enabled:$('#guard').checked});status($('#guard').checked?'Guard enabled for this page. Close the popup to browse.':'Guard disabled.');}catch(e){$('#guard').checked=false;status('Rescan this page before enabling the guard.');}};
$('#save').onsubmit=async event=>{event.preventDefault();const b=$('#save button');b.disabled=true;try{if(!report)throw Error('Scan a page first.');await request({type:'SAVE',card:{title:$('#title').value,report,reminder:$('#reminder').value?new Date($('#reminder').value).toISOString():null}});status(demo?'Demo card saved. Open the vault to review it.':'Recovery card saved to this browser.');}catch(e){status(e.message);}finally{b.disabled=false;}};
$('#vault').onclick=event=>{if(isExtension){event.preventDefault();ext.tabs.create({url:ext.runtime.getURL('dashboard.html')});}};
