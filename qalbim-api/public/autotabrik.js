/* Qalbim AutoTabrik: professional 10-item anketa + local audio/video maker.
 * Uploaded media is only sent with explicit order submission.
 * Preview/exports are rendered on the user's device, not on Render. */
(function(){
'use strict';
const I=(n,size=19)=>window.QalbimIcons.svg(n,size);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=s=>document.querySelector(s);
const EVENTS=[
 ['birthday','Tug‘ilgan kun'],['mother','Onajonimga'],['love','Sevgi izhori'],
 ['wedding','Nikoh va to‘y'],['anniversary','Yillik sana'],['thanks','Minnatdorchilik'],['achievement','Yutuq']
];
const SKINS=[
 ['blossom','Bahor gullari','flower'],['gold','Oltin bayram','star'],
 ['moon','Oyli tun','moon'],['cinema','Kino kadri','image'],['rose','Romantik','heart']
];
const state={app:null,photos:[],preview:[],audio:null,audioUrl:null,recording:null,mic:null,recordChunks:[],
 recorder:null,run:null,sceneTime:0,animation:null,tab:'order',activeOrder:null,uploading:false,lastMsg:'',
 orderStatus:'',canvas:null};
const isAlive=()=>!!$('#atRoot');
const notify=s=>{const el=$('#atAlert');if(el){el.textContent=s;el.hidden=false}else state.app?.notify(s)};
function setNotice(text){let el=$('#atNotice');if(el)el.textContent=text}
function fmt(s){const n=Math.max(0,Math.floor(Number(s)||0));return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')}
function preset(){
 const name=String($('#atRecipient')?.value||'aziz insonim').trim();
 const from=String($('#atFrom')?.value||'yaqinlaringiz').trim();
 const address=String($('#atFormality')?.value||'siz');
 const t=String($('#atEvent')?.value||'birthday');
 const you=address==='sen'?'Seni':'Sizni';
 const wish={
 birthday:'Tug‘ilgan kuningiz muborak bo‘lsin! Hayotingizga har kuni yangicha quvonch, sog‘lik va fayz-baraka kirib kelsin.',
 mother:'Mehribon onajon! Yillar davomida bergan mehringiz va duolaringiz uchun cheksiz minnatdormiz. Umringiz uzun, qalbingiz xotirjam bo‘lsin.',
 love:'Hayotimizdagi eng yorqin lahzalar mehr va sadoqatdan boshlanadi. Yoningizdagi har bir on bebaho.',
 wedding:'Oilangizga tinchlik, totuvlik va mehr tilayman. Birgalikdagi har bir kuningiz go‘zal xotiraga aylansin.',
 anniversary:'Yana bir yilni chiroyli xotiralar bilan kutib oldik. Munosabatimizga mehr, sabr va samimiyat hamroh bo‘lsin.',
 thanks:'Ko‘rsatgan yaxshiligingiz, samimiy so‘zlaringiz va e’tiboringiz uchun chin dildan rahmat.',
 achievement:'Mehnatingiz va sabringiz samara bergani bilan tabriklayman. Bundan-da katta zafarlar nasib etsin.'
 }[t];
 return 'Assalomu alaykum, '+name+'!\n\n'+wish+'\n\n'+you+
 ' chin qalbimizdan tabriklaymiz. Hayot yo‘lingiz doimo yorug‘, orzularingiz esa ro‘yobga chiqsin.'+
 '\n\nEng samimiy tilaklar bilan, '+from+'.';
}
function build(){
 return '<section id="atRoot" class="at-app">'+
 '<div class="at-hero"><div class="at-hero-body"><div class="at-eyebrow">'+I('sparkle',16)+' QALBIM / AUTO TABRIK</div>'+
 '<h1>Yurakdan chiqqan so‘zlar — <em>unutilmas lahzalarga.</em></h1>'+
 '<p>Tabrik uchun anketani to‘ldiring, ovoz va rasmlarni birlashtiring yoki professional tabrik xizmatiga buyurtma qoldiring.</p>'+
 '<div class="at-highlights"><span>'+I('mic',16)+' Audio</span><span>'+I('clapperboard',16)+' Animatsiyali video</span>'+
 '<span>'+I('shield',16)+' Maxfiy ma’lumotlar</span></div></div>'+
 '<div class="at-hero-figure" aria-hidden="true"><div class="at-hero-disc">'+I('heart',91)+'</div><div class="at-float one">'+I('music',28)+'</div><div class="at-float two">'+I('image',25)+'</div><div class="at-float three">'+I('gift',24)+'</div></div></div>'+
 '<div class="at-tabs" role="tablist"><button data-at-tab="order" class="active" role="tab" aria-selected="true">'+I('clipboard-list',18)+' Anketa va buyurtma</button>'+
 '<button data-at-tab="studio" role="tab" aria-selected="false">'+I('film',18)+' Avto video studiya</button>'+
 '<button data-at-tab="orders" role="tab" aria-selected="false">'+I('folder',18)+' Buyurtmalarim</button></div>'+
 '<div class="at-content" id="atContent"></div><div id="atAlert" class="at-alert" role="status" hidden></div></section>';
}
function orderForm(){
 const me=state.app?.getMe?.();
 return '<div class="at-grid"><div class="at-card"><div class="at-panel-heading"><span class="at-heading-index">01 / 03</span>'+
 '<div><div class="at-kicker">BUYURTMA ANKETASI</div><h2>Tabrik oluvchi haqida</h2><p>Buyurtmalar shaxsiy hisobda saqlanadi. Aloqa raqamlari ommaga ko‘rsatilmaydi.</p></div></div>'+
 '<form id="atOrderForm"><div class="at-field-row"><label class="at-field"><span>1. Tug‘ilgan kun egasining ismi *</span>'+
 '<input id="atRecipient" name="recipient" maxlength="90" placeholder="Masalan, Gulmira opa" required></label>'+
 '<label class="at-field"><span>2. Yoshi *</span><input name="age" type="number" min="0" max="120" placeholder="Masalan, 35" required></label></div>'+
 '<div class="at-field-row"><label class="at-field"><span>3. Tug‘ilgan kun, oy, yil *</span><input type="date" name="birthday" required></label>'+
 '<label class="at-field"><span>4. Telefon raqami *</span><input name="recipientPhone" type="tel" maxlength="32" placeholder="+998 90 123 45 67" required></label></div>'+
 '<div class="at-field"><span>Chet elda bo‘lsa qaysi tarmoqda bog‘lanamiz?</span><div class="at-pills" data-at-choice="contactChannel">'+
 choices('contactChannel',[['phone','Oddiy telefon'],['telegram','Telegram'],['whatsapp','WhatsApp']],'phone')+'</div></div>'+
 '<div class="at-field-row"><label class="at-field"><span>5. Tabrik oluvchiga kim bo‘lasiz? *</span><input name="relation" maxlength="80" placeholder="Qizi, ukasi, singlisi..." required></label>'+
 '<label class="at-field"><span>6. Asosiy tabriklovchi kim? *</span><input id="atFrom" name="fromName" maxlength="100" placeholder="Ism, familiya" required></label></div>'+
 '<div class="at-field-row"><div class="at-field"><span>7. Qanday murojaat qilinsin? *</span><div class="at-pills" data-at-choice="formality">'+
 choices('formality',[['siz','Siz deb'],['sen','Sen deb']],'siz')+'</div></div>'+
 '<div class="at-field"><span>8. Oilaviy holati *</span><select name="family" required><option value="">Tanlang</option>'+
 '<option value="married_children">Oilali, farzandlari bor</option><option value="married">Oilali, farzandsiz</option>'+
 '<option value="single">Bo‘ydoq / turmush qurmagan</option><option value="other">Boshqa</option></select></div></div>'+
 '<label class="at-field"><span>9. Viloyat, tuman, shahar yoki qishloq *</span><input name="address" maxlength="180" placeholder="Masalan, Qashqadaryo, Qarshi shahri..." required></label>'+
 '<div class="at-panel-heading at-inner-heading"><span class="at-heading-index">02 / 03</span><div><div class="at-kicker">TABRIK TURI</div>'+
 '<h2>Qanday tabrik bo‘lsin?</h2></div></div>'+
 '<div class="at-service-types">'+
 serviceCard('audio','Audio tabrik','Ovozli tabrikni tayyorlash', 'mic')+
 serviceCard('video','Video tabrik','30+ rasm bilan montaj','film')+
 serviceCard('phone','Telefon orqali','Jonli operator tabrigi','phone-call')+'</div>'+
 '<div class="at-field-row"><label class="at-field"><span>Munosabat</span><select id="atEvent" name="occasion">'+EVENTS.map(([v,l])=>'<option value="'+v+'">'+l+'</option>').join('')+'</select></label>'+
 '<div class="at-field"><span>Video uchun suratlar</span><label class="at-upload">'+I('image-plus',18)+
 '<span id="atFileLabel">Rasmlarni tanlash (kamida 30 ta)</span><input type="file" id="atPhotoFiles" accept="image/jpeg,image/png,image/webp" multiple hidden></label></div></div>'+
 '<div class="at-photo-grid" id="atPhotoGrid"></div><p class="at-helper" id="atPhotoHint">Video buyurtmasida kamida 30 ta surat majburiy. Bir buyurtmaga 50 tagacha.</p>'+
 '<div class="at-field"><span>Ovozli tabrik matni *</span><div class="at-compose-hint"><span>Ism va murojaatga moslab yozishingiz mumkin.</span>'+
 '<button type="button" class="at-text-gen" id="atGenerateText">'+I('sparkle',15)+' Matn tuzish</button></div>'+
 '<textarea name="message" id="atMessage" minlength="30" maxlength="3500" rows="7" required placeholder="Tabrik matnini yozing yoki avtomatik namuna oling..."></textarea></div>'+
 '<label class="at-field"><span>Qo‘shimcha istaklar / izoh</span><textarea name="notes" maxlength="1000" rows="3" placeholder="Qaysi qo‘shiq, qaysi xotira, qanday kayfiyatda..."></textarea></label>'+
 '<div class="at-panel-heading at-inner-heading"><span class="at-heading-index">03 / 03</span><div><div class="at-kicker">TASDIQLASH</div><h2>Buyurtmani yuborish</h2></div></div>'+
 '<label class="at-consent"><input type="checkbox" name="agreed" required><span>Tabrik egasining aloqa ma’lumoti va rasmlaridan ushbu buyurtma uchun foydalanishga huquqim borligini tasdiqlayman. '+ 
 'Ma’lumotlar ommaviy ko‘rsatilmaydi.</span></label>'+
 '<div class="at-order-bar"><div><strong>To‘lov hozir olinmaydi</strong><small>Audio va video narxlari operator tomonidan aniqlashtiriladi. Chek avtomatik tasdiqlash emas.</small></div>'+
 '<button class="at-main-btn" id="atSubmitOrder" type="submit">'+I('send',17)+' Buyurtma yuborish</button></div>'+
 '<div class="at-progress" id="atOrderProgress" hidden><div class="at-progress-track"><span id="atOrderProgressLine"></span></div><p id="atOrderProgressText"></p></div>'+
 '</form></div>'+
 '<aside class="at-side"><div class="at-side-card"><span class="at-kicker">BUYURTMA QANDAY ISHLAYDI?</span>'+
 '<div class="at-timeline"><div><b>01</b><p><strong>Anketani to‘ldiring</strong><small>Mijoz va tabrik egasi ma’lumotlari</small></p></div>'+
 '<div><b>02</b><p><strong>Rasmlarni biriktiring</strong><small>Video uchun 30–50 ta surat</small></p></div>'+
 '<div><b>03</b><p><strong>Buyurtmani yuboring</strong><small>Operator to‘lov va muddatni aniqlashtiradi</small></p></div>'+
 '<div><b>04</b><p><strong>Tabrik tayyorlanadi</strong><small>To‘lov tekshirilgach ish boshlanadi</small></p></div></div></div>'+
 '<div class="at-side-card at-side-note">'+I('shield-check',24)+'<h3>Shaxsiy ma’lumotlar himoyasi</h3>'+
 '<p>Telefon raqamlari, oilaviy ma’lumot va rasmlar faqat buyurtma egasi hamda administrator uchun ochiladi. Suratlar 30 kundan keyin avtomatik o‘chiriladi.</p></div>'+
 (!me?'<div class="at-side-card"><h3>Buyurtma uchun kirish kerak</h3><p>Formani ko‘rib chiqing, keyin hisobingizga kiring.</p><a href="/" class="at-main-btn">Kirish</a></div>':'')+'</aside></div>';
}
function choices(name,items,selected){
 return items.map(([id,label])=>'<label class="at-choice"><input type="radio" name="'+name+'" value="'+id+'" '+(id===selected?'checked':'')+
 '><span>'+label+'</span></label>').join('');
}
function serviceCard(id,name,sub,icon){
 return '<label class="at-service"><input type="radio" name="kind" value="'+id+'" '+(id==='audio'?'checked':'')+'>'+
 '<span class="at-service-face">'+I(icon,26)+'<strong>'+name+'</strong><small>'+sub+'</small></span></label>';
}
function photoThumbs(){
 const el=$('#atPhotoGrid'),l=$('#atFileLabel'),h=$('#atPhotoHint');if(!el)return;
 el.innerHTML=state.photos.slice(0,15).map((file,i)=>'<div class="at-photo-thumb"><img src="'+file.url+'" alt="Surat '+(i+1)+'"></div>').join('')+
 (state.photos.length>15?'<div class="at-photo-extra">+'+(state.photos.length-15)+' ta</div>':'');
 if(l)l.textContent=state.photos.length+' ta rasm tanlandi';
 if(h)h.textContent=state.photos.length<30?'Video uchun yana '+(30-state.photos.length)+' ta rasm kerak':'Video uchun yetarli: '+state.photos.length+' ta rasm.';
}
function syncMediaInfo(){
 const node=$('#atAudioInfo');if(node)node.textContent=state.audio?
   state.audio.name+' · '+(state.audio.size/1024/1024).toFixed(1)+' MB':'Hali audio tanlanmagan.';
 const more=$('#atStudioPhotoGrid');if(more)more.innerHTML=state.photos.slice(0,12).map(x=>'<img src="'+x.url+'" alt="Foto" loading="lazy">').join('')+
  (state.photos.length>12?'<span class="at-more-images">+'+(state.photos.length-12)+'</span>':'');
 const p=$('#atStudioPhotoCount');if(p)p.textContent=state.photos.length+' ta rasm';
}
function disposeMedia(){
 for(const p of state.photos)URL.revokeObjectURL(p.url);
 state.photos=[];
 if(state.audioUrl)URL.revokeObjectURL(state.audioUrl);
 state.audioUrl=null;state.audio=null;
}
function readForm(){
 const f=$('#atOrderForm'),d=new FormData(f);
 return {kind:String(d.get('kind')||'audio'),occasion:String(d.get('occasion')||'birthday'),
 recipient:String(d.get('recipient')||'').trim(),age:Number(d.get('age')),
 birthday:String(d.get('birthday')||''),recipientPhone:String(d.get('recipientPhone')||'').trim(),
 contactChannel:String(d.get('contactChannel')||'phone'),relation:String(d.get('relation')||'').trim(),
 fromName:String(d.get('fromName')||'').trim(),formality:String(d.get('formality')||'siz'),
 family:String(d.get('family')||''),address:String(d.get('address')||'').trim(),
 message:String(d.get('message')||'').trim(),notes:String(d.get('notes')||'').trim(),agreed:d.get('agreed')==='on'};
}
async function postImage(route,file){
 const d=new FormData();d.append('image',file,file.name);
 const response=await fetch(route,{method:'POST',credentials:'same-origin',body:d});
 let value;try{value=await response.json()}catch(e){throw Error('Server javobi o‘qilmadi')}
 if(!response.ok)throw Error(value.error||'Faylni yuklashda xato');
 return value;
}
async function submitOrder(ev){
 ev.preventDefault();if(state.uploading)return;
 if(!state.app?.getMe?.()){notify('Buyurtma yaratish uchun akkauntga kiring.');return}
 const f=$('#atOrderForm');if(!f.reportValidity())return;
 const body=readForm();
 if(body.kind==='video'&&(state.photos.length<30||state.photos.length>50)){
  notify('Video buyurtma uchun 30–50 ta rasm tanlang.');return}
 state.uploading=true;const b=$('#atSubmitOrder'),p=$('#atOrderProgress');
 b.disabled=true;p.hidden=false;
 try{
  let id=state.activeOrder;
  if(!id){
   const result=await state.app.api('/api/autotabrik/orders',{method:'POST',body});id=result.order.id;
   state.activeOrder=id;
  }
  if(body.kind==='video'){
   const files=state.photos.map(p=>p.file);
   for(let i=0;i<files.length;i++){
    await postImage('/api/autotabrik/orders/'+encodeURIComponent(id)+'/photos',files[i]);
    const pct=Math.round((i+1)/files.length*100);
    $('#atOrderProgressLine').style.width=pct+'%';
    $('#atOrderProgressText').textContent=(i+1)+' / '+files.length+' ta rasm xavfsiz yuklandi';
   }
  }
  const result=await state.app.api('/api/autotabrik/orders/'+encodeURIComponent(id)+'/submit',{method:'POST',body:{}});
  state.activeOrder=null;state.orderStatus=result.status;
  $('#atContent').innerHTML='<div class="at-success"><span>'+I('check-circle',47)+'</span><h2>Buyurtma qabul qilindi!</h2>'+
  '<p>Buyurtma raqami: <strong>'+esc(id)+'</strong></p>'+
  '<p>Holati: <b>To‘lovni tasdiqlash kutilmoqda</b>. Operator buyurtmani ko‘rib chiqadi; chekni keyinroq shaxsiy buyurtma sahifasidan yuklash mumkin.</p>'+
  '<button class="at-main-btn" data-at-tab="orders">'+I('folder',18)+' Buyurtmalarim</button></div>';
 }catch(e){
  $('#atOrderProgressText').textContent='Xatolik: '+e.message;
  notify('Yuklash to‘xtadi: '+e.message+' · agar buyurtma yaratilgan bo‘lsa, uni buyurtmalar ro‘yxatida ko‘rish mumkin.');
  state.activeOrder=null;
 }finally{state.uploading=false;if(b)b.disabled=false}
}
function audioPlayerHTML(){
 return '<div class="at-audio-box"><div class="at-audio-icon">'+I('mic',30)+'</div><div><strong>Ovozli tabrik</strong>'+
 '<small id="atAudioInfo">Hali audio tanlanmagan.</small></div><label class="at-outline-btn">'+I('upload',16)+' MP3 / Audio tanlash'+
 '<input type="file" id="atAudioFile" accept="audio/*" hidden></label></div>'+
 '<div class="at-record-controls"><button id="atStartRecord" type="button">'+I('mic',17)+' Ovoz yozish</button>'+
 '<button id="atStopRecord" disabled type="button">'+I('square',17)+' To‘xtatish</button>'+
 '<button id="atListen" type="button">'+I('play',17)+' Tinglash</button>'+
 '<span id="atRecordTimer">00:00</span></div>';
}
function studio(){
 return '<div class="at-studio-layout"><div class="at-card at-studio-controls">'+
 '<div class="at-panel-heading"><span class="at-heading-index">STUDIO</span><div><div class="at-kicker">VIDEO / AUDIO YASASH</div>'+
 '<h2>Tabrik videosini yarating</h2><p>Barcha montaj ushbu qurilmangizda amalga oshadi. Foto va audio serverga yuklanmaydi.</p></div></div>'+
 '<div class="at-field"><span>Video uchun rasmlar (1–50 ta)</span><label class="at-upload">'+I('images',19)+
 ' Rasmlarni tanlash <input type="file" id="atStudioPhotos" accept="image/jpeg,image/png,image/webp" multiple hidden></label></div>'+
 '<div class="at-studio-photo-heading"><span id="atStudioPhotoCount">'+state.photos.length+' ta rasm</span>'+
 '<span>Animatsiyalar: siljish, yaqinlashish, yumshoq o‘tish</span></div>'+
 '<div class="at-studio-photos" id="atStudioPhotoGrid"></div>'+
 '<div class="at-field"><span>Animatsiya mavzusi</span><div class="at-skin-options">'+
 SKINS.map(([id,name,icon],i)=>'<button class="at-skin '+(i===0?'active':'')+'" data-at-skin="'+id+'">'+I(icon,18)+' '+name+'</button>').join('')+'</div></div>'+
 '<div class="at-field"><span>Video formati</span><div class="at-pills">'+
 choices('ratio',[['vertical','9:16 · Shorts / Status'],['wide','16:9 · YouTube']],'vertical')+'</div></div>'+
 audioPlayerHTML()+
 '<div class="at-action-row"><button class="at-main-btn" id="atRenderVideo">'+I('film',18)+' Videoni tayyorlash</button>'+
 '<button class="at-outline-btn" id="atStopVideo" disabled>'+I('square',16)+' To‘xtatish</button></div>'+
 '<p class="at-helper">Video WebM formatida yaratiladi (brauzer MP4 kodlashni qo‘llasa MP4). Ovozli video real vaqtda yoziladi: 5 daqiqalik audio ≈ 5 daqiqa eksport. Tabni yopmang.</p>'+
 '<p id="atNotice" class="at-live-status">Tayyorlash uchun rasmlar va audio tanlang.</p><div id="atExportLink"></div>'+
 '</div><div class="at-preview-side"><div class="at-preview-header">'+I('eye',18)+' JONLI PREVIEW <span>Qalbim Creative Studio</span></div>'+
 '<div class="at-video-shell"><canvas id="atCanvas" width="540" height="960"></canvas>'+
 '<div class="at-video-overlay"><span>QALBIM / AUTO TABRIK</span></div></div>'+
 '<div class="at-preview-foot">'+I('shield',17)+' Media qurilmangizda qoladi. Eksport tayyor bo‘lgach, telefoningizga yuklab olasiz.</div></div></div>';
}
function orders(){
 const me=state.app?.getMe?.();
 return '<div class="at-card"><div class="at-panel-heading"><span class="at-heading-index">'+I('folder',21)+'</span>'+
 '<div><div class="at-kicker">BUYURTMALAR TARIXI</div><h2>Mening buyurtmalarim</h2>'+
 '<p>Buyurtma holati, suratlar soni va to‘lov chekini shu yerdan kuzating.</p></div></div>'+
 '<div id="atOrderList" class="at-order-list">'+(me?'Yuklanmoqda...':'Ko‘rish uchun hisobingizga kiring.')+'</div>'+
 (me?.role==='admin'?'<div class="at-admin-section"><h3>'+I('shield',18)+' Admin / Operator buyurtmalari</h3><div id="atAdminOrders">Yuklanmoqda...</div></div>':'')+
 '</div>';
}
function statusName(x){return ({
 draft:'Qoralama / rasmlar kutilmoqda',awaiting_payment:'To‘lov kutilmoqda',
 payment_review:'Chek tekshirilmoqda',paid:'To‘lov tasdiqlandi',in_progress:'Tayyorlanmoqda',
 delivered:'Yetkazilgan',cancelled:'Bekor qilingan'
 })[x]||x}
function orderCard(o,admin=false){
 return '<div class="at-order-item"><div class="at-order-head"><strong>'+esc(o.recipient)+' · '+esc(o.kind==='video'?'Video':o.kind==='audio'?'Audio':'Telefon')+'</strong>'+
 '<span class="at-order-badge" data-status="'+esc(o.status)+'">'+esc(statusName(o.status))+'</span></div>'+
 '<div class="at-order-meta"><span>'+I('calendar',15)+' '+new Date(o.createdAt).toLocaleDateString('uz-UZ')+'</span>'+
 '<span>'+I('images',15)+' '+(o.photosCount||0)+' ta surat</span>'+
 '<span>'+I('user',15)+' '+esc(o.fromName)+'</span></div>'+
 (admin?'<div class="at-order-personal">'+esc(o.recipientPhone)+' · '+esc(o.address)+' · '+esc(o.message)+'</div>'+
 '<label class="at-field"><span>Holatini o‘zgartirish</span><select data-at-admin-status="'+o.id+'">'+
 ['awaiting_payment','payment_review','paid','in_progress','delivered','cancelled'].map(x=>
 '<option value="'+x+'" '+(o.status===x?'selected':'')+'>'+statusName(x)+'</option>').join('')+'</select></label>'+
 '<button class="at-outline-btn" data-at-admin-save="'+o.id+'">Saqlash</button>'+
 '<button class="at-outline-btn" data-at-assets="'+o.id+'">Rasmlar / Chek</button>':
 '<div class="at-order-actions"><button class="at-outline-btn" data-at-assets="'+o.id+'">'+I('images',16)+' Rasmlar</button>'+
 (!o.hasReceipt&&o.status!=='cancelled'&&o.status!=='delivered'?
 '<label class="at-outline-btn">'+I('receipt',16)+' Chek yuklash<input type="file" data-at-receipt="'+o.id+'" accept="image/jpeg,image/png,image/webp" hidden></label>':
 o.hasReceipt?'<span class="at-receipt-flag">'+I('check',15)+' Chek yuklangan (tekshiruvda)</span>':'')+
 (o.status==='draft'&&o.kind==='video'?'<small>Rasmlar yetmasa, yangi buyurtmada qayta yuboring.</small>':'')+'</div>')+'</div>';
}
async function loadOrders(){
 const list=$('#atOrderList');if(!list)return;
 if(!state.app?.getMe?.()){list.innerHTML='<p>Ro‘yxatdan o‘tish yoki kirish kerak.</p>';return}
 try{
  const result=await state.app.api('/api/autotabrik/orders');
  if(!list.isConnected)return;
  list.innerHTML=result.orders?.length?result.orders.map(o=>orderCard(o)).join(''):
   '<div class="at-empty">'+I('folder',29)+'<h3>Hali buyurtmalar yo‘q</h3><p>Yangi tabrik yaratish uchun anketa bo‘limiga o‘ting.</p></div>';
  if(state.app.getMe().role==='admin'){
   const all=await state.app.api('/api/autotabrik/admin/orders');
   const el=$('#atAdminOrders');if(el)el.innerHTML=all.orders?.length?all.orders.map(o=>orderCard(o,true)).join(''):'Buyurtmalar mavjud emas';
  }
 }catch(e){list.textContent='Yuklab bo‘lmadi: '+e.message}
}
function openAssets(id){
 state.app.api('/api/autotabrik/orders/'+id+'/assets').then(result=>{
  const target=document.querySelector('[data-at-assets="'+id+'"]')?.closest('.at-order-item');
  if(!target)return;
  target.querySelector('.at-asset-panel')?.remove();
  const el=document.createElement('div');el.className='at-asset-panel';
  el.innerHTML=result.assets?.length?result.assets.map(a=>'<a target="_blank" rel="noopener" href="/api/autotabrik/assets/'+
    encodeURIComponent(a.id)+'"><img src="/api/autotabrik/assets/'+encodeURIComponent(a.id)+'" alt="'+
    (a.kind==='receipt'?'To‘lov cheki':'Rasm')+'" loading="lazy"><small>'+ (a.kind==='receipt'?'Chek':'Foto')+'</small></a>').join(''):'Fayllar yo‘q';
  target.appendChild(el);
 }).catch(e=>notify(e.message));
}
async function receipt(id,file){
 if(!file)return;
 try{await postImage('/api/autotabrik/orders/'+encodeURIComponent(id)+'/receipt',file);
  notify('Chek qabul qilindi. To‘lov tekshiruvda, hali tasdiqlanmagan.');loadOrders()}
 catch(e){notify(e.message)}
}
async function adminSave(id){
 const node=document.querySelector('[data-at-admin-status="'+id+'"]');if(!node)return;
 try{await state.app.api('/api/autotabrik/admin/orders/'+id,{method:'PATCH',body:{status:node.value}});
  notify('Buyurtma holati yangilandi');loadOrders()}catch(e){notify(e.message)}
}
function draw(time=0){
 const canvas=$('#atCanvas');if(!canvas)return;
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return;
 const wide=document.querySelector('input[name="ratio"]:checked')?.value==='wide';
 const W=wide?960:540,H=wide?540:960;
 if(canvas.width!==W||canvas.height!==H){canvas.width=W;canvas.height=H}
 const color=state.theme;
 let themes={
 blossom:['#fff1f7','#c36695'],gold:['#332240','#d9aa6f'],moon:['#111f43','#7c83bb'],
 cinema:['#16141b','#7f6982'],rose:['#5e2746','#efa2b2']
 };
 const [a,b]=themes[color]||themes.blossom;
 const gradient=ctx.createLinearGradient(0,0,W,H);gradient.addColorStop(0,a);gradient.addColorStop(1,b);
 ctx.fillStyle=gradient;ctx.fillRect(0,0,W,H);
 const n=state.photos.length;
 if(n){
  const idx=Math.floor(time/4.5)%n;
  const p=state.photos[idx];
  if(p?.image?.complete&&p.image.naturalWidth){
   ctx.save();ctx.globalAlpha=.9;
   const im=p.image,scale=Math.max(W/im.naturalWidth,H/im.naturalHeight)*(1+.065*Math.sin((time%4.5)/4.5*Math.PI));
   const iw=im.naturalWidth*scale,ih=im.naturalHeight*scale;
   ctx.drawImage(im,(W-iw)/2,(H-ih)/2,iw,ih);ctx.restore();
   ctx.fillStyle='rgba(19,13,36,.36)';ctx.fillRect(0,0,W,H);
  }
 }
 ctx.save();const t=time;
 for(let i=0;i<28;i++){
  const x=(i*79.3+W*.21+Math.sin(t*.5+i)*14)%W;
  const y=(i*159.4-t*(11+i%4)*.5+H*10)%H;
  ctx.globalAlpha=(Math.sin(t+i*1.4)+2)*.14;
  ctx.fillStyle=color==='gold'?'#ffe7a9':color==='moon'?'#d5d9ff':'#fff1f8';
  ctx.beginPath();ctx.arc(x,y,2+(i%4),0,2*Math.PI);ctx.fill();
 }
 ctx.restore();
 const min=W<H?W:H;const centralY=H*.64;
 ctx.textAlign='center';ctx.fillStyle='#fff';
 const heading=$('#atRecipient')?.value?.trim()||'Aziz insonim';
 const occ=$('#atEvent')?.selectedOptions[0]?.text||'Tabriklaymiz!';
 const top=H*.15;
 ctx.font='bold '+Math.round(min*.028)+'px sans-serif';ctx.letterSpacing='3px';ctx.fillText('Q A L B I M  /  A U T O  T A B R I K',W/2,top);
 ctx.font='bold '+Math.round(min*.072)+'px Georgia';ctx.shadowColor='#281a3d';ctx.shadowBlur=12;
 ctx.fillText(heading.length>22?heading.slice(0,21)+'…':heading,W/2,centralY);
 ctx.font=Math.round(min*.033)+'px sans-serif';ctx.fillText(occ,W/2,centralY+min*.075);
 ctx.shadowBlur=0;ctx.fillStyle='#ffe7f2';ctx.font=Math.round(min*.023)+'px sans-serif';
 ctx.fillText('Siz uchun eng samimiy tilaklar',W/2,H*.88);
 ctx.textAlign='left';
}
function runPreview(){
 if(!isAlive()||state.tab!=='studio'){cancelAnimationFrame(state.animation);state.animation=null;return}
 if(!state.run)state.sceneTime+=.022;
 draw(state.run?state.run.audio?.currentTime||state.sceneTime:state.sceneTime);
 state.animation=requestAnimationFrame(runPreview);
}
function openTab(t){
 if(state.run&&t!=='studio'){notify('Video yozilayotganda sahifani o‘zgartirmang.');return}
 state.tab=t;
 document.querySelectorAll('[data-at-tab]').forEach(b=>{const selected=b.dataset.atTab===t;b.classList.toggle('active',selected);
 b.setAttribute('aria-selected',String(selected))});
 $('#atContent').innerHTML=t==='order'?orderForm():t==='studio'?studio():orders();
 if(t==='order'){photoThumbs();const f=$('#atOrderForm');f.addEventListener('submit',submitOrder)}
 if(t==='studio'){syncMediaInfo();runPreview()}
 if(t==='orders')loadOrders();
}
async function setupImages(files){
 if(state.run)return notify('Video yozilayotganda suratlarni o‘zgartirib bo‘lmaydi.');
 const selected=[...files].filter(f=>/^image\/(jpeg|png|webp)$/.test(f.type)).slice(0,50);
 for(const old of state.photos)URL.revokeObjectURL(old.url);
 state.photos=selected.map(f=>{const url=URL.createObjectURL(f),im=new Image();im.src=url;return {file:f,url,image:im}});
 photoThumbs();syncMediaInfo();
 if(state.tab==='studio')draw(0);
}
function audioChosen(file){
 if(!file)return;
 if(!file.type.startsWith('audio/')&&!/\.(mp3|m4a|wav|ogg|webm)$/i.test(file.name))return notify('Audio faylni tanlang');
 if(file.size>65*1024*1024)return notify('Audio 65 MB dan oshmasligi kerak');
 if(state.audioUrl)URL.revokeObjectURL(state.audioUrl);
 state.audio=file;state.audioUrl=URL.createObjectURL(file);syncMediaInfo();
 setNotice('Audio tanlandi. Video eksportda ovoz ham yoziladi.');
}
async function recordStart(){
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)return notify('Bu brauzerda ovoz yozish qo‘llab-quvvatlanmaydi.');
 if(state.recording)return;
 try{
  const stream=await navigator.mediaDevices.getUserMedia({audio:true});
  const chunks=[];state.mic=stream;
  const type=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(x=>MediaRecorder.isTypeSupported(x));
  const rec=new MediaRecorder(stream,type?{mimeType:type}:{});state.recording=rec;state.recordChunks=chunks;state.recordStart=Date.now();
  rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  rec.onstop=()=>{
   stream.getTracks().forEach(t=>t.stop());state.recording=null;clearInterval(state.recordInterval);
   const extension=rec.mimeType.includes('mp4')?'m4a':'webm';
   audioChosen(new File([new Blob(chunks,{type:rec.mimeType})],'qalbim-ovoz.'+extension,{type:rec.mimeType}));
   const start=$('#atStartRecord'),stop=$('#atStopRecord');if(start)start.disabled=false;if(stop)stop.disabled=true;
  };
  rec.start(1000);$('#atStartRecord').disabled=true;$('#atStopRecord').disabled=false;
  state.recordInterval=setInterval(()=>{const x=$('#atRecordTimer');if(x)x.textContent=fmt((Date.now()-state.recordStart)/1000)},800);
  setNotice('Ovoz yozilmoqda… mikrofon ochiq');
 }catch(e){notify('Mikrofon ruxsati berilmadi: '+e.message)}
}
function recordStop(){if(state.recording?.state==='recording')state.recording.stop()}
function listen(){
 if(!state.audioUrl)return notify('Avval audio tanlang yoki ovoz yozing.');
 if(state.playingAudio){state.playingAudio.pause();state.playingAudio=null;return}
 const p=new Audio(state.audioUrl);p.onended=()=>state.playingAudio=null;
 p.play().then(()=>{state.playingAudio=p}).catch(e=>notify('Audio ochilmadi: '+e.message));
}
function codec(){
 if(!window.MediaRecorder)return null;
 return ['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm']
  .find(t=>MediaRecorder.isTypeSupported(t))||'';
}
async function videoStart(){
 if(state.run)return;
 if(!state.photos.length)return notify('Avval kamida bitta rasm tanlang.');
 if(!state.audioUrl)return notify('Video ovozi uchun MP3/audio yuklang yoki mikrofon bilan yozing.');
 const canvas=$('#atCanvas');
 if(!canvas?.captureStream||!window.MediaRecorder||!window.AudioContext)return notify('Brauzer bu eksportni qo‘llamaydi. Chrome/Edge/Android Chrome’dan foydalaning.');
 const mime=codec();if(!mime)return notify('Bu brauzerda video yozish kodeki yo‘q.');
 let context=null,run=null;
 try{
  const audio=new Audio(state.audioUrl);audio.preload='auto';
  await new Promise((ok,no)=>{audio.addEventListener('loadedmetadata',ok,{once:true});audio.addEventListener('error',()=>no(new Error('Audio ochilmadi')),{once:true});audio.load()});
  if(!Number.isFinite(audio.duration)||audio.duration<=0||audio.duration>3600)throw Error('Audio davomiyligi noto‘g‘ri yoki 60 daqiqadan uzun');
  context=new AudioContext();await context.resume();
  const source=context.createMediaElementSource(audio),dest=context.createMediaStreamDestination();
  source.connect(dest);source.connect(context.destination);
  const video=canvas.captureStream(24);
  const stream=new MediaStream([...video.getVideoTracks(),...dest.stream.getAudioTracks()]);
  const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:2400000,audioBitsPerSecond:128000});
  const chunks=[];
  run={audio,context,stream,rec,chunks,started:Date.now(),stopped:false};state.run=run;
  rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  rec.onerror=e=>{notify('Video yozuvda xatolik yuz berdi: '+(e.error?.message||''));videoStop()};
  rec.onstop=()=>{
   stream.getTracks().forEach(t=>t.stop());audio.pause();context.close().catch(()=>{});
   if(!isAlive())return;
   const blob=new Blob(chunks,{type:rec.mimeType});
   if(state.renderURL)URL.revokeObjectURL(state.renderURL);
   state.renderURL=URL.createObjectURL(blob);state.run=null;
   const ext=rec.mimeType.startsWith('video/mp4')?'mp4':'webm';
   const link=$('#atExportLink');
   if(link)link.innerHTML='<a class="at-main-btn" download="qalbim-autotabrik.'+ext+'" href="'+state.renderURL+'">'+I('download',19)+' Tayyor videoni yuklab olish · '+(blob.size/1048576).toFixed(1)+' MB</a>';
   $('#atRenderVideo').disabled=false;$('#atStopVideo').disabled=true;
   setNotice('Video tayyor! Faylni yuklab olib Telegram, Instagram yoki YouTube orqali yuborishingiz mumkin.');
  };
  audio.onended=()=>{if(state.run===run)videoStop()};
  rec.start(1000);
  $('#atRenderVideo').disabled=true;$('#atStopVideo').disabled=false;
  setNotice('Video yozilmoqda: '+fmt(audio.duration)+' davom etadi. Sahifani yopmang.');
  await audio.play();
 }catch(e){
  if(run?.rec?.state==='recording')try{run.rec.stop()}catch(ignore){}
  if(!run&&context)context.close().catch(()=>{});
  state.run=null;$('#atRenderVideo').disabled=false;$('#atStopVideo').disabled=true;
  notify('Video ishga tushmadi: '+e.message);
 }
}
function videoStop(){
 const r=state.run;if(!r)return;
 try{if(r.rec.state!=='inactive')r.rec.stop()}catch(e){}
 try{r.audio.pause()}catch(e){}
}
function cleanup(){
 cancelAnimationFrame(state.animation);state.animation=null;
 clearInterval(state.recordInterval);
 recordStop();state.mic?.getTracks().forEach(t=>t.stop());state.mic=null;
 if(state.run)videoStop();
 if(state.playingAudio)state.playingAudio.pause();
 disposeMedia();
}
function activate(){
 openTab('order');
 const root=$('#atRoot');if(!root)return;
 root.addEventListener('click',e=>{
  const tab=e.target.closest('[data-at-tab]');if(tab){openTab(tab.dataset.atTab);return}
  const generate=e.target.closest('#atGenerateText');
  if(generate){$('#atMessage').value=preset();notify('Tahrirlash mumkin bo‘lgan namunaviy matn yaratildi.');return}
  const skin=e.target.closest('[data-at-skin]');if(skin){
   state.theme=skin.dataset.atSkin;root.querySelectorAll('[data-at-skin]').forEach(x=>x.classList.toggle('active',x===skin));
   draw(state.sceneTime);return;
  }
  if(e.target.closest('#atStartRecord'))return recordStart();
  if(e.target.closest('#atStopRecord'))return recordStop();
  if(e.target.closest('#atListen'))return listen();
  if(e.target.closest('#atRenderVideo'))return videoStart();
  if(e.target.closest('#atStopVideo'))return videoStop();
  const assets=e.target.closest('[data-at-assets]');if(assets)return openAssets(assets.dataset.atAssets);
  const admin=e.target.closest('[data-at-admin-save]');if(admin)return adminSave(admin.dataset.atAdminSave);
 });
 root.addEventListener('change',e=>{
  if(e.target.id==='atPhotoFiles'||e.target.id==='atStudioPhotos')setupImages(e.target.files);
  if(e.target.id==='atAudioFile')audioChosen(e.target.files[0]);
  if(e.target.matches('[data-at-receipt]'))receipt(e.target.dataset.atReceipt,e.target.files[0]);
  if(e.target.name==='ratio')draw(state.sceneTime);
 });
}
window.QalbimAutoTabrik={setup(app){state.app=app},build,activate,cleanup};
})();