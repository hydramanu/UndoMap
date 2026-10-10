const ext = globalThis.browser || globalThis.chrome;
const isExtension = !!ext?.runtime?.id;
const demo = !isExtension;
const fixtures = {
  subscription: {label:'Start free trial',type:'subscription',url:'https://studio.example',text:'Your free trial lasts 14 days.\nCancel your subscription before the trial ends to avoid a $19 monthly renewal.\nGo to Account > Billing > Cancel subscription.\nPayments after renewal are non-refundable.'},
  purchase: {label:'Buy now',type:'purchase',url:'https://store.example',text:'Returns accepted within 30 days of delivery.\nReturn items unused in original packaging.\nA $5 return shipping fee applies.\nOpen Account > Orders > Request return to start a return.'},
  deletion: {label:'Delete account',type:'deletion',url:'https://cloud.example',text:'Account deletion is permanent and cannot be undone.\nNo recovery is available after deletion.\nDownload your data before requesting deletion.'}
};
async function request(message){
  if(isExtension){const res=await ext.runtime.sendMessage(message);if(res?.error)throw Error(res.error);return res;}
  const cards=JSON.parse(localStorage.getItem('undomap-demo-cards')||'[]');
  if(message.type==='CARDS')return {cards};
  if(message.type==='SAVE'){if(cards.length>=100)throw Error('Maximum 100 cards.');const card=UndoMap.validateCard(message.card);cards.unshift(card);localStorage.setItem('undomap-demo-cards',JSON.stringify(cards));return {card};}
  const i=cards.findIndex(c=>c.id===message.id);if(i<0)throw Error('Card not found.');
  if(message.type==='DONE')cards[i].done=!cards[i].done;
  if(message.type==='REMOVE')cards.splice(i,1);
  localStorage.setItem('undomap-demo-cards',JSON.stringify(cards));return {ok:true};
}
function download(name,text,type='application/json'){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
const $=s=>document.querySelector(s);
function element(tag,text,cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}
function status(text){$('#status').textContent=text;}
