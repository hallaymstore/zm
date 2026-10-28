/* Qalbim Tabrik — responsive celebration experience, live composer and saved memories. */
(function(){
'use strict';
const ico=(n,s=20)=>window.QalbimIcons.svg(n,s);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const EVENTS=[
 {id:'love',name:'Sevgi izhori',icon:'heart',title:'Sen bilan hayot go‘zal',text:'Hayotimdagi eng yorqin lahzalar sen bilan bog‘liq. Har bir kunimiz mehr va quvonchga to‘lsin!'},
 {id:'birthday',name:'Tug‘ilgan kun',icon:'gift',title:'Tug‘ilgan kuning muborak!',text:'Bugun sen tug‘ilgan eng go‘zal kun! Barcha orzularing amalga oshsin, kulging hech so‘nmasin.'},
 {id:'anniversary',name:'Bizning sana',icon:'calendar',title:'Bizning kunimiz muborak!',text:'Birga o‘tgan har lahzamiz uchun rahmat. Oldinda hali qancha chiroyli kunlarimiz bor.'},
 {id:'thanks',name:'Rahmat aytish',icon:'flower',title:'Borliging uchun rahmat',text:'Qiyin kunlarimni ham iliqlikka aylantirganing, har doim yonimda bo‘lganing uchun rahmat.'},
 {id:'miss',name:'Sog‘indim',icon:'mail',title:'Seni juda sog‘indim',text:'Masofalar uzoq bo‘lsa ham qalbimiz yaqin. Seni ko‘rish va bag‘rimga bosish lahzasini kutyapman.'},
 {id:'achievement',name:'Yutuq va quvonch',icon:'star',title:'Sen bilan faxrlanaman!',text:'Harakatlaring samarasini ko‘rish naqadar quvonchli! Yutuqlaring ko‘paysin, doim yoningdaman.'}
];
const SKINS=[{id:'blush',name:'Blush',hex:'#f6a4c0'},{id:'lilac',name:'Lavanda',hex:'#bfa6ec'},{id:'pearl',name:'Marvarid',hex:'#eac7ad'},{id:'rose',name:'Rose',hex:'#c65e83'},{id:'night',name:'Moonlight',hex:'#685483'}];
let api,notify,go,getMe,getPartner,section;
let saved=[],draft=null,editing=false,busy=false,opened=null;
function setup(x){({api,notify,go,getMe,getPartner,section}=x)}
function currentDate(){
 const now=new Date();
 const months=['yanvar','fevral','mart','aprel','may','iyun','iyul','avgust','sentabr','oktabr','noyabr','dekabr'];
 return now.getDate()+'-'+months[now.getMonth()]+', '+now.getFullYear();
}
function personName(s){return String(s||'Azizim').split(' ')[0]}
function cardEntry(item){
 const ev=EVENTS.find(x=>x.id===item.event)||EVENTS[0];
 return '<div class="cel-saved-card"><div class="cel-saved-symbol">'+ico(ev.icon,21)+'</div>'+
 '<div class="cel-saved-description"><div class="cel-saved-kicker">'+esc(ev.name)+' · '+new Date(item.createdAt).toLocaleDateString('uz-UZ')+'</div>'+
 '<strong>'+esc(item.title)+'</strong><small>'+esc(item.to)+' uchun</small></div>'+
 '<div class="cel-saved-actions">'+
 '<button data-cel="open" data-id="'+item.id+'" title="Tabrikni ochish">'+ico('eye',17)+'</button>'+
 (getPartner?.()?'<button data-cel="send" data-id="'+item.id+'" title="Chatga yuborish">'+ico('send',17)+'</button>':'')+
 '<button data-cel="copy" data-id="'+item.id+'" title="Havola nusxalash">'+ico('link',17)+'</button>'+
 '<button data-cel="delete" data-id="'+item.id+'" title="O‘chirish">'+ico('x',16)+'</button></div></div>';
}
function hero(){
 return '<div class="cel-hero"><div class="cel-hero-content"><div class="cel-overline">'+ico('heart',17)+' SIZ VA SEVGILINGIZ UCHUN</div>'+
 '<h1>Tabriklaymiz! <span class="cel-small-heart">'+ico('heart',36)+'</span></h1>'+
 '<p>Bugungi lahzangiz yanada<br>unutilmas bo‘lsin.</p></div>'+
 '<div class="cel-hero-art"><img src="/celebration-hearts.svg" alt="Birlashgan pushti va lavanda yuraklar, gullar va lenta" loading="eager"></div>'+
 '<span class="cel-handwritten" aria-hidden="true">Birga har doim<br>chiroyliroq.</span>'+
 '<div class="cel-petal p1"></div><div class="cel-petal p2"></div><div class="cel-petal p3"></div><div class="cel-petal p4"></div></div>';
}
function home(){
 const me=getMe?.(),partner=getPartner?.();
 const s='<div class="cel-app"><div class="cel-intro-label">'+ico('sparkle',16)+' QALBIM / TABRIKLAR MAKONI <span>01 — IN LOVE</span></div>'+
 hero()+
 '<div class="cel-action-grid">'+
 '<button class="cel-action tone-blush" data-cel="compose"><span class="cel-action-ico">'+ico('message-square',30)+'</span>'+
 '<strong>Tabrik yuborish</strong><small>Sevgilingizga maxsus<br>tabriknoma yarating</small><span class="cel-go">'+ico('arrow',19)+'</span></button>'+
 '<button class="cel-action tone-lilac" data-cel="surprise"><span class="cel-action-ico">'+ico('gift',30)+'</span>'+
 '<strong>Syurpriz ochish</strong><small>Sizni kutayotgan<br>kichik bir quvonch</small><span class="cel-go">'+ico('arrow',19)+'</span></button>'+
 '<button class="cel-action tone-pearl" data-cel="memories"><span class="cel-action-ico">'+ico('image',30)+'</span>'+
 '<strong>Xotira saqlash</strong><small>Yaratgan tabriklaringiz<br>shaxsiy kolleksiyada</small><span class="cel-go">'+ico('arrow',19)+'</span></button></div>'+
 '<div class="cel-date-card"><span class="cel-date-icon">'+ico('calendar',29)+'</span><div class="cel-date-content">'+
 '<small>Bugungi sana</small><strong>'+currentDate()+'</strong><p>Bizning yana bir go‘zal kunimiz '+ico('heart',16)+'</p></div>'+
 '<div class="cel-date-quote"><span>“</span>Birga bo‘lgan har lahza — bu baxt <span>”</span></div></div>'+
 '<div class="cel-section-head" id="cel-occasions"><div><span class="cel-eyebrow">ALOHIDA LAHZALAR UCHUN</span><h2>Tabrik turlari</h2></div>'+
 '<span>Har kuni yangicha hislar</span></div>'+
 '<div class="cel-occasions">'+EVENTS.map(e=>'<button class="cel-occasion" data-cel="occasion" data-event="'+e.id+'">'+ico(e.icon,23)+
 '<strong>'+e.name+'</strong><span>'+ico('arrow',16)+'</span></button>').join('')+'</div>'+
 '<div class="cel-section-head" id="cel-memories"><div><span class="cel-eyebrow">FAQAT SIZNING XOTIRALARINGIZ</span><h2>Saqlangan tabriklar</h2></div>'+
 (me?'<button class="cel-section-btn" data-cel="compose">'+ico('pen',16)+' Yangisi</button>':'<a class="cel-section-btn" href="/">Kirish</a>')+'</div>'+
 '<div id="celSaved" class="cel-saved-list">'+(me?'<div class="cel-loading">Tabriklar yuklanmoqda...</div>':
 '<div class="cel-empty">'+ico('lock',29)+'<strong>Tabriklaringiz shu yerda saqlanadi</strong><p>Tabrik yaratish va saqlash uchun akkauntga kiring.</p></div>')+'</div>'+
 '<div class="cel-footnote">'+ico('shield',17)+' '+(partner?
   esc(personName(partner.name))+' bilan juftligingiz ulangan. Tabrikni chatga bir bosishda yuborishingiz mumkin.':
   'Tabriklarni saqlang, havola orqali ulashing yoki juftingiz bilan bog‘lanib chatga yuboring.')+'</div></div>';
 return s;
}
async function hydrate(){
 const el=document.getElementById('celSaved');if(!el||!getMe?.())return;
 try{const result=await api('/api/celebrations/mine');saved=result.cards||[];
   if(!el.isConnected)return;
   el.innerHTML=saved.length?saved.map(cardEntry).join(''):
    '<div class="cel-empty">'+ico('heart',28)+'<strong>Hozircha tabrik yo‘q</strong><p>Birinchi tabrigingizni yaratib, shu yerda saqlang.</p>'+
    '<button class="cel-primary" data-cel="compose">'+ico('pen',17)+' Tabrik yaratish</button></div>';
 }catch(e){if(el.isConnected)el.textContent=e.message}
}
function defaultDraft(event='love'){
 const found=EVENTS.find(x=>x.id===event)||EVENTS[0];
 const user=getMe?.();return {event:found.id,skin:'blush',title:found.title,message:found.text,to:getPartner?.()?.name||'Sevgilim',
 from:user?.name||'Men',secret:''};
}
function previewHTML(d,full=false){
 const found=EVENTS.find(x=>x.id===d.event)||EVENTS[0];
 return '<div class="cel-preview-card skin-'+esc(d.skin)+' '+(full?'cel-full-card':'')+'">'+
 '<span class="cel-preview-pill">'+ico(found.icon,16)+' '+esc(found.name)+'</span>'+
 '<div class="cel-preview-icon">'+ico('heart',26)+'</div>'+
 '<h2>'+esc(d.title||'Tabriklaymiz!')+'</h2>'+
 '<div class="cel-preview-art"><img src="/celebration-hearts.svg" alt="" loading="lazy"></div>'+
 '<div class="cel-preview-to">AZIZ <strong>'+esc(d.to||'Sevgilim')+'</strong></div>'+
 '<p class="cel-preview-message">'+esc(d.message||'Tabrigingiz matni...')+'</p>'+
 '<div class="cel-preview-bottom"><span>QALBIM / MADE WITH LOVE</span><em>'+esc(d.from||'Men')+'</em></div>'+
 (d.secret?'<button type="button" class="cel-secret-button" data-cel="reveal">'+ico('gift',18)+' Maxsus syurprizni ochish</button>'+
 '<div class="cel-secret-message" hidden><span>'+ico('heart',18)+' Faqat sen uchun</span><p>'+esc(d.secret)+'</p></div>':'')+
 '</div>';
}
function composer(event='love'){
 const me=getMe?.();if(!me){
  try{sessionStorage.setItem('qalbim_celebrate_return',event)}catch(e){}
  showOverlay('<div class="cel-result"><span class="cel-result-icon">'+ico('lock',34)+'</span>'+
    '<span class="cel-eyebrow">TABRIK YARATISH</span><h2>Hisobingizga kiring</h2>'+
    '<p>Tabrikni saqlash, chat orqali yuborish va xotiralar kolleksiyasini yuritish uchun akkauntga kirish kerak.</p>'+
    '<a href="/" class="cel-primary">'+ico('user',17)+' Kirish yoki ro‘yxatdan o‘tish</a>'+
    '<button class="cel-secondary" data-cel="dismiss">Hozircha ko‘rish</button></div>');
  return;
 }
 if(!editing)draft=defaultDraft(event);
 editing=true;
 const form='<div class="cel-editor-overlay" id="celEditorOverlay" role="dialog" aria-modal="true" aria-label="Tabrik yaratish">'+
 '<div class="cel-editor-dialog"><div class="cel-editor-top"><div><span class="cel-eyebrow">QALBIM / STUDIO</span><h2>Tabrik yarating</h2><p>Har bir detalni o‘zingiz belgilang</p></div>'+
 '<button class="cel-icon-button" type="button" data-cel="close" aria-label="Yopish">'+ico('x',21)+'</button></div>'+
 '<div class="cel-editor-grid"><form id="celCompose" class="cel-form" data-form-cel>'+
 '<div class="cel-form-title"><span class="cel-form-step">01</span><strong>Qaysi munosabat bilan?</strong></div>'+
 '<div class="cel-event-tabs">'+EVENTS.map(e=>'<button type="button" data-cel="event" data-event="'+e.id+'" class="'+(e.id===draft.event?'active':'')+'">'+ico(e.icon,16)+' '+e.name+'</button>').join('')+'</div>'+
 '<div class="cel-form-title"><span class="cel-form-step">02</span><strong>Yurakdagi so‘zlar</strong></div>'+
 '<div class="cel-form-two"><label><span>Kimga</span><input name="to" maxlength="75" required value="'+esc(draft.to)+'" placeholder="Sevgilim"></label>'+
 '<label><span>Kimdan</span><input name="from" maxlength="75" required value="'+esc(draft.from)+'" placeholder="Ismingiz"></label></div>'+
 '<label><span>Sarlavha</span><input name="title" maxlength="100" minlength="3" required value="'+esc(draft.title)+'"></label>'+
 '<label><span>Tabrik matni</span><textarea name="message" maxlength="900" minlength="8" required rows="5">'+esc(draft.message)+'</textarea>'+
 '<small class="cel-count" id="celCount">'+draft.message.length+' / 900</small></label>'+
 '<label><span>Maxfiy syurpriz (ixtiyoriy)</span><textarea name="secret" maxlength="220" rows="2" placeholder="Tabrik ochilganda sovg‘a tugmasi orqali chiqadi..."></textarea></label>'+
 '<div class="cel-form-title"><span class="cel-form-step">03</span><strong>Rang va kayfiyat</strong></div>'+
 '<div class="cel-skin-row">'+SKINS.map(t=>'<button type="button" data-cel="skin" data-skin="'+t.id+'" class="'+(t.id===draft.skin?'active':'')+'" aria-label="'+esc(t.name)+'" aria-pressed="'+(t.id===draft.skin)+'">'+
 '<span style="--skin-dot:'+t.hex+'"></span><small>'+t.name+'</small></button>').join('')+'</div>'+
 '<div class="cel-form-actions"><button class="cel-primary" type="submit" id="celSubmit">'+ico('check',18)+' Tabrikni saqlash</button>'+
 '<button class="cel-secondary" type="button" data-cel="preview">'+ico('eye',18)+' To‘liq ko‘rish</button></div></form>'+
 '<aside class="cel-editor-preview"><div class="cel-preview-heading">'+ico('eye',17)+' JONLI KO‘RINISH <span>Oluvchi shuni ko‘radi</span></div><div id="celPreview">'+previewHTML(draft)+'</div></aside></div></div></div>';
 document.body.insertAdjacentHTML('beforeend',form);
 document.body.classList.add('cel-dialog-open');
 document.getElementById('celCompose').addEventListener('input',sync);
 document.getElementById('celEditorOverlay').querySelector('[data-cel="close"]').focus();
}
function values(){
 const form=document.getElementById('celCompose');if(!form)return draft;
 const f=new FormData(form);
 return {...draft,to:String(f.get('to')||''),from:String(f.get('from')||''),title:String(f.get('title')||''),
 message:String(f.get('message')||''),secret:String(f.get('secret')||'')};
}
function sync(){
 if(!document.getElementById('celCompose'))return;
 draft=values();
 const preview=document.getElementById('celPreview');if(preview)preview.innerHTML=previewHTML(draft);
 const count=document.getElementById('celCount');if(count)count.textContent=draft.message.length+' / 900';
}
function close(){
 document.getElementById('celEditorOverlay')?.remove();
 document.body.classList.remove('cel-dialog-open');
 editing=false;
}
async function submit(e){
 e.preventDefault();if(busy)return;
 const form=document.getElementById('celCompose');if(!form||!form.reportValidity())return;
 sync();busy=true;
 const button=document.getElementById('celSubmit');if(button){button.disabled=true;button.textContent='Saqlanmoqda...'}
 try{
  const result=await api('/api/celebrations',{method:'POST',body:draft});
  close();await hydrate();
  success(result.card);
 }catch(e){notify(e.message)}
 finally{busy=false;if(button){button.disabled=false;button.innerHTML=ico('check',18)+' Tabrikni saqlash'}}
}
function success(card){
 const partner=getPartner?.();
 showOverlay('<div class="cel-result"><div class="cel-result-icon">'+ico('check-circle',38)+'</div>'+
 '<span class="cel-eyebrow">YANGI XOTIRA YARATILDI</span><h2>Tabrigingiz tayyor!</h2><p>Tabrik MongoDB’da saqlandi. Endi sevgan insoningizga yuborishingiz mumkin.</p>'+
 '<div class="cel-result-actions">'+(partner?'<button class="cel-primary" data-cel="send" data-id="'+card.id+'">'+ico('send',18)+' Chatga yuborish</button>':'')+
 '<button class="cel-secondary" data-cel="open" data-id="'+card.id+'">'+ico('eye',18)+' Tabrikni ko‘rish</button>'+
 '<button class="cel-secondary" data-cel="copy" data-id="'+card.id+'">'+ico('link',18)+' Havola nusxalash</button></div></div>');
}
function showOverlay(content){
 document.getElementById('celMiniModal')?.remove();
 document.body.insertAdjacentHTML('beforeend','<div id="celMiniModal" class="cel-mini-overlay" role="dialog" aria-modal="true">'+
 '<div class="cel-mini-dialog"><button class="cel-mini-close" type="button" aria-label="Yopish" data-cel="dismiss">'+ico('x',21)+'</button>'+content+'</div></div>');
 document.getElementById('celMiniModal')?.querySelector('[data-cel="dismiss"]')?.focus();
}
function dismiss(){document.getElementById('celMiniModal')?.remove()}
const surprises=[
 'Sizga eng yoqimli syurpriz — sizni chin dildan tushunadigan inson bilan birga o‘tkazilgan oddiy kun.',
 'Muhabbat katta sovg‘alarda emas, kichik e’tiborlarning davomiyligida yashaydi.',
 'Bugun sevgan insoningizga bitta yoqimli so‘z yozing — bu kunni o‘zgartirishi mumkin.',
 'Har kuni bir-biringiz uchun yangi, unutilmas xotira yaratishingiz mumkin.'
];
function surprise(){
 const n=Math.floor(Math.random()*surprises.length);
 showOverlay('<div class="cel-surprise-view"><span class="cel-surprise-petal">'+ico('gift',49)+'</span>'+
 '<span class="cel-eyebrow">SIZ UCHUN KICHIK SYURPRIZ</span><h2>Bugungi iliq tilak</h2><p>'+esc(surprises[n])+'</p>'+
 '<button class="cel-primary" data-cel="compose">'+ico('heart',17)+' Sevgilimga tabrik yaratish</button></div>');
}
async function send(id,button){
 if(busy)return;busy=true;
 if(button)button.disabled=true;
 try{const res=await api('/api/celebrations/'+encodeURIComponent(id)+'/send',{method:'POST',body:{}});
  notify(res.alreadySent?'Tabrik chatga avval yuborilgan':'Tabrik juftingizning chatiga yuborildi');
  await hydrate();
  dismiss();
 }catch(e){notify(e.message)}finally{busy=false;if(button)button.disabled=false}
}
async function copyLink(id){
 const link=location.origin+'/t/'+encodeURIComponent(id);
 try{await navigator.clipboard.writeText(link);notify('Tabrik havolasi nusxalandi')}
 catch(e){window.prompt('Tabrik havolasi',link)}
}
async function remove(id){
 if(!window.confirm('Bu tabrik kolleksiyadan o‘chirilsinmi? Ulangan havola ham ishlamay qoladi.'))return;
 try{await api('/api/celebrations/'+encodeURIComponent(id),{method:'DELETE'});notify('Tabrik o‘chirildi');hydrate()}
 catch(e){notify(e.message)}
}
function publicCard(card){
 const ev=EVENTS.find(e=>e.id===card.event)||EVENTS[0];
 return '<div class="cel-public"><div class="cel-public-top"><span>'+ico('heart',17)+' SIZGA MAXSUS TABRIK</span>'+
 '<a href="/?view=tabrik">'+ico('arrow',16)+' Qalbim tabriklar</a></div>'+
 previewHTML(card,true)+
 '<div class="cel-public-bottom"><p>'+ico('heart',16)+' Qalbim orqali samimiy tabrik yo‘llang</p>'+
 '<a class="cel-primary" href="/?view=tabrik">'+ico(ev.icon,18)+' O‘z tabrigimni yaratish</a></div></div>';
}
async function openPublic(id){
 section('<div class="cel-public-load">'+ico('heart',30)+' Tabrik yuklanmoqda...</div>');
 try{
  const res=await api('/api/celebrations/'+encodeURIComponent(id));
  section(publicCard(res.card));
  opened=res.card;
 }catch(e){section('<div class="cel-public-error"><h1>Tabrik topilmadi</h1><p>'+esc(e.message)+'</p><a class="cel-primary" href="/?view=tabrik">Tabriklar bo‘limiga qaytish</a></div>')}
}
function renderChat(message){
 return '<div class="chatbubble cel-chatbubble '+(message.mine?'mine':'')+'"><div class="cel-chat-kicker">'+ico('heart',16)+' SIZGA TABRIK KELDI</div>'+
 '<div class="cel-chat-art"><img src="/celebration-hearts.svg" alt="" loading="lazy"></div>'+
 '<strong>Yurakdan maxsus tabrik</strong><p>Qalbim orqali yuborilgan shaxsiy tabriknoma</p>'+
 '<a class="cel-chat-open" href="/t/'+encodeURIComponent(message.celebrationId)+'">'+ico('mail',17)+' Tabrikni ochish '+ico('arrow',16)+'</a></div>';
}
document.addEventListener('click',e=>{
 const button=e.target.closest('[data-cel]');if(!button)return;
 const action=button.dataset.cel,id=button.dataset.id;
 if(action==='compose'){dismiss();if(!editing)composer();return}
 if(action==='close'){close();return}
 if(action==='dismiss'){dismiss();return}
 if(action==='surprise'){surprise();return}
 if(action==='memories'){document.getElementById('cel-memories')?.scrollIntoView({behavior:'smooth',block:'start'});return}
 if(action==='occasion'){if(!editing)composer(button.dataset.event);return}
 if(action==='event'){
   if(!editing)return;draft=values();const item=EVENTS.find(x=>x.id===button.dataset.event);if(!item)return;
   draft.event=item.id;draft.title=item.title;draft.message=item.text;
   document.getElementById('celCompose').querySelector('[name="title"]').value=item.title;
   document.getElementById('celCompose').querySelector('[name="message"]').value=item.text;
   document.querySelectorAll('[data-cel="event"]').forEach(x=>x.classList.toggle('active',x===button));sync();return;
 }
 if(action==='skin'){if(!editing)return;draft=values();draft.skin=button.dataset.skin;
   document.querySelectorAll('[data-cel="skin"]').forEach(x=>{x.classList.toggle('active',x===button);x.setAttribute('aria-pressed',String(x===button))});
   sync();return}
 if(action==='preview'){
   sync();showOverlay('<div class="cel-modal-preview">'+previewHTML(draft,true)+'</div>');return}
 if(action==='reveal'){
   const region=button.closest('.cel-preview-card');
   const secret=region?.querySelector('.cel-secret-message');
   if(secret){secret.hidden=!secret.hidden;button.setAttribute('aria-expanded',String(!secret.hidden));
     button.innerHTML=ico(secret.hidden?'gift':'check',18)+(secret.hidden?' Maxsus syurprizni ochish':' Syurpriz ochildi')}
   return;
 }
 if(action==='open'&&id){location.href='/t/'+encodeURIComponent(id);return}
 if(action==='send'&&id){send(id,button);return}
 if(action==='copy'&&id){copyLink(id);return}
 if(action==='delete'&&id){remove(id);return}
});
document.addEventListener('submit',e=>{if(e.target.id==='celCompose')submit(e)});
document.addEventListener('keydown',e=>{
 if(e.key!=='Escape')return;
 if(document.getElementById('celMiniModal'))dismiss();
 else if(editing)close();
});
window.QalbimCelebrate={setup,home,hydrate,openPublic,renderChat};
})();