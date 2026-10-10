/* Chrome worker imports explicitly; Firefox manifest loads core.js first. */
if(typeof importScripts==='function')importScripts('core.js');
const api=globalThis.browser||chrome;
let queue=Promise.resolve();
const serialized=fn=>{const next=queue.then(fn);queue=next.catch(()=>{});return next;};
async function read(){return (await api.storage.local.get('cards')).cards||[];}
async function syncAlarms(){const cards=await read();const alarms=await api.alarms.getAll();for(const alarm of alarms)if(alarm.name.startsWith('undo:')&&!cards.some(c=>'undo:'+c.id===alarm.name&&!c.done&&!c.notified&&c.reminder))await api.alarms.clear(alarm.name);for(const c of cards)if(c.reminder&&!c.done&&!c.notified)await api.alarms.create('undo:'+c.id,{when:Math.max(Date.now()+1000,c.reminder)});}
async function handle(message){
  if(message.type==='CARDS')return {cards:await read()};
  if(message.type==='SAVE'){
    const cards=await read();if(cards.length>=100)throw Error('Your vault holds 100 cards. Remove an old card first.');
    const card=UndoMap.validateCard(message.card);cards.unshift(card);await api.storage.local.set({cards});await syncAlarms();return {card};
  }
  if(message.type==='REMOVE'||message.type==='DONE'){
    let cards=await read();const card=cards.find(c=>c.id===message.id);if(!card)throw Error('Card not found.');
    if(message.type==='REMOVE')cards=cards.filter(c=>c.id!==message.id);else card.done=!card.done;
    await api.storage.local.set({cards});await syncAlarms();return {ok:true};
  }
  throw Error('Unknown request.');
}
api.runtime.onMessage.addListener((message,sender,respond)=>{
  // Only extension UI may access the vault; injected page scripts cannot write cards.
  if(!sender.url?.startsWith(api.runtime.getURL(''))){respond({error:'Open UndoMap to manage recovery cards.'});return false;}
  serialized(()=>handle(message)).then(respond,e=>respond({error:e.message}));return true;
});
api.alarms.onAlarm.addListener(alarm=>{if(!alarm.name.startsWith('undo:'))return;serialized(async()=>{const cards=await read();const card=cards.find(c=>'undo:'+c.id===alarm.name);if(!card||card.done||card.notified)return;
  await api.notifications.create(alarm.name,{type:'basic',iconUrl:api.runtime.getURL('icons/icon128.png'),title:'UndoMap reminder',message:'A recovery card you saved is due for review. Open your vault to check it.'});
  card.notified=true;await api.storage.local.set({cards});
}).catch(()=>{});});
api.notifications.onClicked.addListener(id=>{if(id.startsWith('undo:'))api.tabs.create({url:api.runtime.getURL('dashboard.html')});});
api.runtime.onStartup.addListener(()=>serialized(syncAlarms).catch(()=>{}));
api.runtime.onInstalled.addListener(()=>serialized(syncAlarms).catch(()=>{}));
