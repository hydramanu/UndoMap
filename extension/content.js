(()=>{
  if(globalThis.__undoMapInstalled)return;globalThis.__undoMapInstalled=true;
  const api=globalThis.browser||chrome;let guard=false,allowed=null,expiry=0,overlay=null;
  const selector='button,a[href],[role="button"],input[type="submit"],input[type="button"]';
  function visible(el){const style=getComputedStyle(el);return el.getClientRects().length>0&&style.visibility!=='hidden'&&style.display!=='none';}
  function label(el){return String(el.getAttribute('aria-label')||((el.tagName==='INPUT')?el.value:el.innerText)||'').trim().slice(0,140);}
  function snapshot(){
    const actions=[...document.querySelectorAll(selector)].filter(visible).map(el=>({label:label(el),type:UndoMap.classify(label(el))})).filter(a=>a.type).filter((a,i,all)=>all.findIndex(b=>b.label===a.label&&b.type===a.type)===i).slice(0,30);
    // Read static visible policy blocks only. Never read form fields, editable areas, scripts or hidden text.
    const blocks=[...document.querySelectorAll('p,li,dd,blockquote,article h2,section h2')].filter(el=>visible(el)&&!el.closest('form,[contenteditable],#undomap-guard')).slice(0,1000);
    const text=blocks.map(el=>el.innerText).filter(t=>t&&t.length<1400&&/refund|cancel|return|recover|restor|delet|renew|trial|billing|subscription|permanent/i.test(t)).join('\n').slice(0,12000);
    const links=[...document.querySelectorAll('a[href]')].filter(el=>visible(el)&&/policy|refund|return|cancel|billing|recovery|support/i.test(label(el))).map(el=>({label:label(el),url:el.href}));
    return {actions,text:UndoMap.redact(text),links:links.slice(0,30),url:location.origin,guard};
  }
  function showWarning(el){
    if(overlay)overlay.remove();overlay=document.createElement('div');overlay.id='undomap-guard';
    const shadow=overlay.attachShadow({mode:'closed'});const box=document.createElement('div');
    const style=document.createElement('style');style.textContent=':host{all:initial;position:fixed;inset:0;z-index:2147483647;background:#10223999;display:grid;place-items:center;font:15px system-ui;color:#1b2b43}section{background:#fff;border-radius:18px;padding:28px;max-width:430px;box-shadow:0 24px 80px #0004}h2{font-size:24px;margin:8px 0}p{line-height:1.6}button{border:0;border-radius:9px;padding:12px 16px;margin:6px 6px 0 0;cursor:pointer;background:#183b42;color:white}button.secondary{background:#eef2ef;color:#183b42}small{color:#637277}';
    const section=document.createElement('section');section.setAttribute('role','dialog');section.setAttribute('aria-modal','true');section.setAttribute('aria-label','UndoMap action review');
    const title=document.createElement('h2');title.textContent='Pause. Know your way back.';
    const text=document.createElement('p');text.textContent='You are about to choose “'+label(el)+'”. Open UndoMap to check recovery evidence before proceeding.';
    const note=document.createElement('p');note.textContent='This guard is a best-effort reminder, not a guarantee. It does not verify the action or undo it.';
    const back=document.createElement('button');back.textContent='Keep reviewing';
    const proceed=document.createElement('button');proceed.className='secondary';proceed.textContent='Allow my next click';
    function close(){overlay?.remove();overlay=null;el.focus();}
    back.onclick=close;proceed.onclick=()=>{allowed=el;expiry=Date.now()+15000;close();};
    section.append(title,text,note,back,proceed);box.append(section);shadow.append(style,box);document.documentElement.append(overlay);back.focus();
    shadow.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close();}if(event.key==='Tab'){event.preventDefault();(shadow.activeElement===back?proceed:back).focus();}});
  }
  document.addEventListener('click',event=>{if(!guard||!event.isTrusted)return;const el=event.target.closest?.(selector);if(!el||!UndoMap.classify(label(el)))return;if(allowed===el&&Date.now()<expiry){allowed=null;return;}event.preventDefault();event.stopImmediatePropagation();showWarning(el);},true);
  api.runtime.onMessage.addListener((message,sender,respond)=>{if(message.type==='SCAN'){respond(snapshot());}else if(message.type==='GUARD'){guard=!!message.enabled;allowed=null;respond({guard});}return false;});
})();
