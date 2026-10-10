(function(root){
  'use strict';
  const patterns={subscription:/\b(subscrib(?:e|ing)|start.{0,25}(?:trial|membership)|try.{0,20}free|free (?:trial|month)|join.{0,15}plan)\b/i,purchase:/\b(buy now|place (?:your )?order|complete purchase|pay now|checkout|purchase|confirm order)\b/i,deletion:/\b(delete|close|remove|erase)\b.{0,30}\b(account|profile|workspace|all data)\b/i};
  const terms={subscription:/cancel|refund|renew|trial|billing|subscription/i,purchase:/return|refund|cancel|exchange|shipping|replacement/i,deletion:/delet|recover|restor|retention|permanent|backup/i};
  function redact(value){return String(value??'').replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,'[email removed]').replace(/\b(?:\d[ -]?){13,19}\b/g,'[long number removed]').replace(/\b(?:token|api[_-]?key|password|secret)\s*[:=]\s*[^\s,;]+/gi,'[secret removed]').slice(0,12000);}
  function classify(label){const text=String(label||'').trim();if(/\b(cancel|manage|undo|restore|recover)\b/i.test(text))return null;return Object.keys(patterns).find(k=>patterns[k].test(text))||null;}
  function safeURL(value){try{const u=new URL(value);if(!['http:','https:'].includes(u.protocol)||u.username||u.password)return null;return u.origin+u.pathname;}catch{return null;}}
  function origin(value){try{return new URL(safeURL(value)).origin;}catch{return 'Unknown site';}}
  function clauses(text,type){const seen=new Set();return redact(text).split(/\n+|(?<=[.!?])\s+(?=[A-Z])/).map(t=>t.trim()).filter(t=>t.length>12&&t.length<=700&&terms[type]?.test(t)&&!seen.has(t)&&seen.add(t)).slice(0,24);}
  function analyze(input){
    const type=input.type||classify(input.label);if(!Object.hasOwn(terms,type))throw Error('Choose subscription, purchase, or account deletion.');
    const evidence=clauses(input.text,type);
    const negative={subscription:/non.?refundable|no refunds?|cannot (?:cancel|be cancel)|can.t cancel|not (?:eligible for|entitled to) (?:a )?refund/i,purchase:/non.?refundable|non.?returnable|no (?:returns|refunds)|cannot be (?:returned|refunded)|not eligible for (?:a )?(?:return|refund)/i,deletion:/cannot be (?:undone|recovered|restored)|can.t be (?:undone|recovered|restored)|irreversible|permanent(?:ly)? (?:delet|remov)|no recovery/i};
    const positive={subscription:/cancel (?:at any time|anytime|before|within|your subscription)|refund.{0,40}(?:within|available|eligible)|(?:can|may) cancel/i,purchase:/(?:can|may) (?:be )?(?:return|cancel)|returns? (?:within|accepted|available)|refunds? (?:available|within)|eligible for (?:a )?refund/i,deletion:/(?:can|may) (?:be )?(?:restor|recover)|(?:restor|recover).{0,45}within|recovery (?:period|window)/i};
    const yes=evidence.filter(s=>positive[type].test(s)&&!negative[type].test(s));
    const no=evidence.filter(s=>negative[type].test(s));
    const windows=evidence.filter(s=>/\b\d+\s*(?:business |calendar )?(?:days?|hours?|weeks?|months?)\b|\b(?:before|until)\s+(?:the\s+)?(?:trial|renewal|next billing|billing date|\d|January|February|March|April|May|June|July|August|September|October|November|December)\b/i.test(s));
    const costs=evidence.filter(s=>/(?:[$€£₹]\s*\d|\b(?:USD|INR|EUR|GBP)\s*\d|\d\s*%|\bfee\b|free (?:returns?|cancellation)|no (?:fee|charge)|non.?refundable)/i.test(s));
    const routes=evidence.filter(s=>/(?:go to|open|visit|navigate|contact|log ?in|sign in).{0,120}(?:cancel|return|recover|restore|refund)|(?:cancel|return|restore|recover).{0,80}(?:via|through|from|under).{0,30}(?:settings|billing|support|account)|[→>]/i.test(s));
    const state=yes.length&&no.length?'Mixed or conditional':no.length?'Restrictions found':yes.length?'Recovery language found':'Not established';
    const covered=[yes.length||no.length,windows.length,costs.length,routes.length].filter(Boolean).length;
    return {schema:1,type,label:redact(input.label||type).slice(0,140),site:origin(input.url),checkedAt:new Date().toISOString(),state,coverage:covered,
      caution:type==='deletion'||no.length>0||covered<2,
      evidence,windows:windows.slice(0,3),costs:costs.slice(0,3),routes:routes.slice(0,3),
      links:(input.links||[]).filter(l=>safeURL(l.url)&&origin(l.url)===origin(input.url)).slice(0,6).map(l=>({label:redact(l.label).slice(0,100),url:safeURL(l.url)})),
      note:'Page text is evidence, not a guarantee. Scope, eligibility and exceptions may be missing. Verify the policy with the provider.'};
  }
  function validateCard(raw,now=Date.now()){
    if(!raw||!raw.report||!Object.hasOwn(terms,raw.report.type))throw Error('Invalid recovery card.');
    const report=raw.report;
    if(!Array.isArray(report.evidence)||report.evidence.length>24)throw Error('Invalid evidence.');
    const reminder=raw.reminder?new Date(raw.reminder).getTime():null;
    if(reminder!==null&&(!Number.isFinite(reminder)||reminder<=now))throw Error('Choose a future reminder date and time.');
    const clean=analyze({type:report.type,label:report.label,text:report.evidence.join('\n'),url:report.site,links:report.links});
    clean.checkedAt=typeof report.checkedAt==='string'&&!Number.isNaN(Date.parse(report.checkedAt))?report.checkedAt:clean.checkedAt;
    return {id:crypto.randomUUID(),title:redact(raw.title||clean.label).slice(0,100),report:clean,createdAt:new Date(now).toISOString(),reminder,done:false,notified:false};
  }
  const api={classify,redact,safeURL,origin,clauses,analyze,validateCard};
  if(typeof module!=='undefined')module.exports=api;else root.UndoMap=api;
})(globalThis);
