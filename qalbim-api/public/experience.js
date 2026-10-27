/* Qalbim Experience v2 — progressive, mobile-first enhancements with no framework dependency. */
(function(){
'use strict';
const THEMES=[
 {id:1,name:'Atirgul',emoji:'🌹',group:'romance',label:'Rose silk'},
 {id:2,name:'Oy nuri',emoji:'🌙',group:'romance',label:'Midnight'},
 {id:3,name:'Shafaq',emoji:'🌅',group:'nature',label:'Golden hour'},
 {id:4,name:'Bahor',emoji:'🌿',group:'nature',label:'Botanical'},
 {id:5,name:'Orzu',emoji:'💗',group:'romance',label:'Sweet dream'},
 {id:6,name:'Klassik',emoji:'✒️',group:'minimal',label:'Letterpress'},
 {id:7,name:'Lavanda',emoji:'🪻',group:'nature',label:'Lavender haze'},
 {id:8,name:'Yulduzlar',emoji:'✨',group:'romance',label:'Stardust'},
 {id:9,name:'Vintage',emoji:'📜',group:'minimal',label:'Old memories'},
 {id:10,name:'Sakura',emoji:'🌸',group:'nature',label:'Pink blossom'},
 {id:11,name:'Okean',emoji:'🌊',group:'nature',label:'Blue lagoon'},
 {id:12,name:'Oltin',emoji:'👑',group:'royal',label:'Golden promise'},
 {id:13,name:'Polaroid',emoji:'📸',group:'minimal',label:'Photo story'},
 {id:14,name:'Neon Love',emoji:'💜',group:'royal',label:'City lights'},
 {id:15,name:'Qorli oqshom',emoji:'❄️',group:'nature',label:'Winter wish'},
 {id:16,name:'Qora marmar',emoji:'🖤',group:'royal',label:'Noir luxury'},
 {id:17,name:'Quyosh',emoji:'☀️',group:'nature',label:'Sunny day'},
 {id:18,name:'Minimal',emoji:'🤍',group:'minimal',label:'Pure love'}
];
const IDEAS=[
 {title:'Sevgi izhori',icon:'💗',heading:'Senga aytolmagan gaplarim',text:'Bilasanmi, sen bilan oddiy kunlarim ham bayramga aylanadi. Tabassumingni ko‘rsam, butun dunyo chiroyliroq tuyuladi. Har kuni seni tanlaganimdan baxtiyorman. Sen men uchun juda qadrlisan. ♡'},
 {title:'Sog‘inch',icon:'🥺',heading:'Seni sog‘indim...',text:'Bugun ham xayolim beixtiyor senga ketdi. Birga kulgan lahzalarimizni, ovozingni, eng oddiy suhbatlarimizni sog‘indim. Masofa qancha bo‘lmasin, yuragimdagi o‘rning doim yaqin. ♡'},
 {title:'Kechirim',icon:'🕊️',heading:'Yuragimdan bir uzr',text:'Ba’zan hislarimizni to‘g‘ri ifodalay olmaymiz. Sening ko‘nglingni og‘ritgan bo‘lsam, chin dildan kechir. Menga sening baxting, ishonching va tabassuming muhim. Bir-birimizni yaxshiroq tushunishni istayman.'},
 {title:'Rahmat',icon:'🌷',heading:'Borliging uchun rahmat',text:'Sen mening hayotimda borligingning o‘zi katta baxt. Meni tinglaganing, tushunganing va oddiy lahzalarimni yoritganing uchun rahmat. Sening borligingni hech qachon oddiy qabul qilmayman.'},
 {title:'Tug‘ilgan kun',icon:'🎂',heading:'Tug‘ilgan kuning muborak!',text:'Bugun dunyoga eng aziz insonlarimdan biri kelgan kun. Yangi yoshing quvonch, sog‘lik, orzular va chiroyli xotiralarga boy bo‘lsin. Har doim kulib yur, chunki tabassuming juda qadrli! 🎉'},
 {title:'Yubiley',icon:'💍',heading:'Bizning unutilmas kunimiz',text:'Birinchi uchrashuvimizdan bugungacha qancha chiroyli xotiralar yig‘dik! Har bir kunimiz yangi hikoya, har bir kulgimiz yangi baxt bo‘ldi. Kelajakda ham birga yana ko‘plab yodda qoladigan lahzalarni yaratishni tilayman. ♡'},
 {title:'Xayrli tong',icon:'☀️',heading:'Xayrli tong, sevgilim!',text:'Bugun tong seni o‘ylab boshlandi. Kuning yorug‘, qalbing xotirjam va tabassuming doimiy bo‘lsin. O‘zingni asra, seni kimdir juda qadrlashini unutma. 🌼'},
 {title:'Xayrli tun',icon:'🌙',heading:'Shirin tushlar ko‘r',text:'Tun sokin, yulduzlar esa go‘yo sen uchun porlayotgandek. Bugungi barcha charchoqlaring ortda qolsin. Ko‘zlaringni yum, ertangi kun seni go‘zal yangiliklar bilan qarshi olsin. Shirin tushlar! ✨'},
 {title:'Kutilmagan syurpriz',icon:'🎁',heading:'Faqat sen uchun kichik sir',text:'Senga bir sir aytsam bo‘ladimi? Eng yaxshi kunlarimning aksariyatida sen borsan. Shuning uchun bugun hech qanday sababsiz yana bir bor aytmoqchiman: sen men uchun juda azizsan. 💝'}
];
const DATE_IDEAS=[
 ['☕','Ikkingiz uchun 20 daqiqalik choy va samimiy suhbat'],
 ['📸','Birinchi uchrashuvni eslatuvchi suratni topib, unga izoh yozing'],
 ['🎧','Bir-biringizga ma’noli bitta qo‘shiq yuboring'],
 ['✍️','Bir-biringiz haqingizda 5 ta yaxshi xususiyat yozing'],
 ['🌆','Birgalikda shom manzarasini tomosha qiling'],
 ['🎲','Navbat bilan bir-biringizga 3 tadan kutilmagan savol bering'],
 ['💌','Bir daqiqada kichkina sevgi maktubi yozing'],
 ['🎯','Kelajakdagi birgalikdagi bitta orzuingizni kelishib oling']
];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const allowReduced=()=>window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let currentStudio=null;
function card(title,content,theme,from,to){
 return window.QalbimScenes.render({title,message:content,theme,from,to,preview:true});
}
function gallery(active,filter='all'){
 return '<div class="template-grid" role="group" aria-label="Maktub yuboriladigan sahifa dizaynlari">'+
 THEMES.filter(t=>filter==='all'||t.group===filter).map(t=>
 '<button type="button" class="template-option '+(t.id===active?'chosen':'')+'" data-a="theme" data-id="'+t.id+
 '" aria-pressed="'+(t.id===active)+'" title="'+esc(t.name)+'">'+
 window.QalbimScenes.thumb(t.id)+
 '<strong>'+esc(t.name)+'</strong><small>'+esc(t.label)+'</small></button>').join('')+'</div>';
}
function renderStudio({name,theme,photos=[]}){
 return '<div class="studio-heading"><div><div class="eyebrow">QALBIM STUDIO / YANGI MAKTUB</div><h1 class="page-title">Maktubingizni yarating <span aria-hidden="true">✦</span></h1><p class="muted">Bir necha qadamda unutilmas, shaxsiy raqamli maktub.</p></div><div class="studio-help">✦ <span>Real vaqtda ko‘rinish</span></div></div>'+
 '<form data-form="letter" id="letterStudio" class="studio-layout">'+
 '<div class="studio-editor"><section class="studio-section"><div class="studio-section-head"><span class="step-count">01</span><div><h2>Hikoyangiz</h2><p>Siz yozasiz, biz go‘zallashtiramiz</p></div></div>'+
 '<div class="studio-persons"><label class="field"><span>Kimga yuborasiz?</span><input name="to" class="input" maxlength="80" autocomplete="off" placeholder="Masalan, mening baxtim..." required></label>'+
 '<label class="field"><span>Kimdan?</span><input name="from" class="input" maxlength="80" value="'+esc(name)+'" required></label></div>'+
 '<label class="field"><span>Maktub sarlavhasi</span><input name="title" class="input" maxlength="90" value="Sen — qalbimdagi eng go‘zal hikoya" required></label>'+
 '<label class="field"><span>Maktub matni</span><textarea name="message" class="input" required maxlength="1400" rows="7">Sen hayotimga kirgan kundan beri oddiy lahzalar ham boshqacha ma’no kasb etdi. Har bir tabassuming — mening eng go‘zal xotiram. Seni juda qadrlayman. ♡</textarea><span class="char-indicator" id="messageLength">0 / 1400</span></label>'+
 '<div class="caption-hint">✨ Yozishga ilhom kerakmi? Tayyor g‘oyalardan foydalaning:</div><div class="idea-strip" role="group" aria-label="Maktub g‘oyalari">'+IDEAS.map((p,i)=>'<button class="idea-chip" type="button" data-idea="'+i+'">'+p.icon+' '+p.title+'</button>').join('')+'</div>'+
 '<div class="studio-secret-note"><strong>🎁 Maxfiy syurpriz xabari (ixtiyoriy)</strong><p>Oluvchi maktubni ochib, sovg‘a tugmasini bosganda alohida paydo bo‘ladi. Bu faqat vizual yashirin xabar — parol yoki maxfiy ma’lumot yozmang.</p><textarea class="input" name="secretNote" maxlength="220" rows="3" placeholder="Faqat ikkimiz biladigan eng yoqimli so‘zlar..."></textarea></div></section>'+
 '<section class="studio-section"><div class="studio-section-head"><span class="step-count">02</span><div><h2>O‘z uslubingizni tanlang</h2><p>18 xil alohida sahifa · har biri boshqacha</p></div></div>'+
 '<div class="filter-row" id="templateFilters"><button type="button" class="filter-chip selected" data-template-filter="all">Hammasi</button><button type="button" class="filter-chip" data-template-filter="romance">Romantik</button><button type="button" class="filter-chip" data-template-filter="nature">Tabiat</button><button type="button" class="filter-chip" data-template-filter="minimal">Minimal</button><button type="button" class="filter-chip" data-template-filter="royal">Premium uslub</button></div>'+
 '<div id="templateGallery">'+gallery(theme)+'</div></section>'+
 '<section class="studio-section"><div class="studio-section-head"><span class="step-count">03</span><div><h2>Xotiralar qo‘shing</h2><p>Shaxsiy suratlar maktubni jonlantiradi</p></div></div>'+
 '<label class="upload-zone" for="letterPhoto"><span class="upload-mark">🖼️</span><strong>Surat tanlang</strong><small>JPG, PNG yoki WebP · 5 MB · ko‘pi bilan 4 ta</small><input id="letterPhoto" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Surat tanlash"></label>'+
 '<label class="checkline"><input type="checkbox" id="privatePhoto"><span>Yangi rasm maxfiy bo‘lsin (egasi va Pro foydalanuvchilar ko‘radi)</span></label><div id="attached" class="photo-row"></div>'+
 '<button type="submit" class="btn block studio-submit">Maktubni yaratish ↗</button><p class="small muted studio-legal">Yaratilgan maktub havolasini bilgan insonlar uning ochiq matnini ko‘rishi mumkin.</p></section></div>'+
 '<aside class="studio-preview-panel"><div class="studio-preview-top"><span>◎ JONLI KO‘RINISH</span><span id="previewTheme">'+esc(THEMES[theme-1]?.name||'Atirgul')+'</span></div><div class="studio-paper-wrap" id="letterLivePreview">'+card('Sen — qalbimdagi eng go‘zal hikoya','Sen hayotimga kirgan kundan beri oddiy lahzalar ham boshqacha ma’no kasb etdi. Har bir tabassuming — mening eng go‘zal xotiram. Seni juda qadrlayman. ♡',theme,name,'Sevgilim')+'</div><button type="button" class="scene-preview-button" data-scene-demo>⛶ To‘liq ekranda ko‘rish</button><div id="livePhotoCount" class="preview-footnote">💗 Maktubingiz tayyorlanmoqda</div><p class="muted small">Ko‘rib turgan dizayningiz maktubni olgan insonda ham ochiladi.</p></aside>'+
 '</form>';
}
function attachStudio({getTheme}){
 const form=document.getElementById('letterStudio');if(!form)return;
 currentStudio={form,getTheme,filter:'all'};
 const sync=()=>{
   if(!currentStudio||currentStudio.form!==form)return;
   const d=new FormData(form),theme=Number(currentStudio.getTheme());
   const container=document.getElementById('letterLivePreview');
   if(!container)return;
   const existing=container.querySelector('.letter-scene');
   const note=String(d.get('secretNote')||'');
   if(!existing||Number(existing.dataset.scene)!==theme||Boolean(existing.querySelector('.scene-secret-preview'))!==Boolean(note.trim())){
     container.innerHTML=window.QalbimScenes.render({
       title:String(d.get('title')||''),message:String(d.get('message')||''),
       theme,from:String(d.get('from')||''),to:String(d.get('to')||''),secretNote:note,preview:true
     });
   }else{
     const values={title:d.get('title')||'Senga yozilgan maktub',message:d.get('message')||'Yuragimdagi so‘zlar...',from:d.get('from')||'Men',to:d.get('to')||'Azizim'};
     for(const [key,value] of Object.entries(values)){
       const el=existing.querySelector('[data-field="'+key+'"]');
       if(el)el.textContent=value;
     }
   }
   const len=form.querySelector('[name=message]').value.length;
   const count=document.getElementById('messageLength');if(count)count.textContent=len+' / 1400';
   const themeNode=document.getElementById('previewTheme');if(themeNode)themeNode.textContent=(THEMES[theme-1]||THEMES[0]).name;
 };
 form.addEventListener('input',sync);
 sync();
 return sync;
}
function changeTheme(t){
 if(!currentStudio||!document.contains(currentStudio.form))return;
 currentStudio.form.dispatchEvent(new Event('input',{bubbles:true}));
 const gallery=document.getElementById('templateGallery');
 if(gallery)gallery.innerHTML=galleryFn();
 function galleryFn(){return galleryHtml(currentStudio.getTheme(),currentStudio.filter)}
}
function galleryHtml(theme,filter){return gallery(theme,filter)}
function attachGlobalHandlers(){
 document.addEventListener('input',event=>{
  if(event.target.id!=='letterSearch')return;
  const search=String(event.target.value||'').trim().toLowerCase();
  let visible=0;
  document.querySelectorAll('[data-library-item]').forEach(item=>{item.hidden=!item.dataset.search.includes(search);if(!item.hidden)visible++});
  const count=document.getElementById('libraryCount');if(count)count.textContent=visible+' ta maktub';
 });
 document.addEventListener('click',event=>{
   const filter=event.target.closest('[data-template-filter]');
   if(filter&&currentStudio&&document.contains(currentStudio.form)){
     const group=filter.dataset.templateFilter;
     if(!['all','romance','nature','minimal','royal'].includes(group))return;
     currentStudio.filter=group;
     const box=document.getElementById('templateGallery');if(box)box.innerHTML=galleryHtml(Number(currentStudio.getTheme()),group);
     document.querySelectorAll('[data-template-filter]').forEach(el=>el.classList.toggle('selected',el===filter));
   }
   const idea=event.target.closest('[data-idea]');
   if(idea&&currentStudio&&document.contains(currentStudio.form)){
     const chosen=IDEAS[Number(idea.dataset.idea)];if(!chosen)return;
     const form=currentStudio.form;
     const message=form.querySelector('[name=message]');const title=form.querySelector('[name=title]');
     title.value=chosen.heading;message.value=chosen.text;
     form.dispatchEvent(new Event('input',{bubbles:true}));
     document.querySelectorAll('.idea-chip').forEach(x=>x.classList.toggle('selected',x===idea));
     message.focus();
   }
   const surprise=event.target.closest('[data-surprise]');
   if(surprise){
     const picked=DATE_IDEAS[Math.floor(Math.random()*DATE_IDEAS.length)];
     const result=document.getElementById('surpriseIdea');if(result){result.textContent=picked[0]+' '+picked[1];result.classList.remove('animate-idea');void result.offsetWidth;result.classList.add('animate-idea')}
   }
 });
}
function burst(target,amount=16){
 if(allowReduced()||!target||!document.body.contains(target))return;
 const box=document.createElement('div');box.className='heart-burst';box.setAttribute('aria-hidden','true');
 const rect=target.getBoundingClientRect();const x=rect.left+rect.width/2,y=rect.top+rect.height/2;
 box.style.left=x+'px';box.style.top=y+'px';document.body.appendChild(box);
 for(let i=0;i<amount;i++){
   const el=document.createElement('span');
   el.textContent=['♥','✧','♡','✿'][i%4];
   el.style.setProperty('--tx',((Math.random()-.5)*270).toFixed(1)+'px');
   el.style.setProperty('--ty',((Math.random()-.5)*250-25).toFixed(1)+'px');
   el.style.animationDelay=(Math.random()*.15).toFixed(2)+'s';
   box.appendChild(el);
 }
 setTimeout(()=>box.remove(),1800);
}
function homeWidget(user,partner){
 const first=esc((user.name||'Do‘stim').split(' ')[0]);
 return '<div class="home-welcome"><div class="home-welcome-copy">'+
 '<div class="home-eyebrow"><span class="live-spark"></span> QALBIM STUDIO <span class="eyebrow-divider"></span> HISLAR UCHUN MAKON</div>'+
 '<h2>Har bir sevgi<br>hikoyaga <em>loyiq.</em></h2>'+
 '<p>'+first+', eng samimiy so‘zlaringizni oddiy xabardan ko‘ra chiroyliroq qilib yuboring.</p>'+
 '<div class="row wrap"><button class="btn hero-primary" data-a="create">Maktub yaratish <span aria-hidden="true">↗</span></button>'+
 '<button class="btn alt hero-secondary" data-a="'+(partner?'chat':'pair')+'">'+(partner?'Juftingiz bilan suhbat':'Juftlikni bog‘lash')+' <span aria-hidden="true">→</span></button></div>'+
 '<div class="hero-bottom"><span><strong>18</strong> dizayn kolleksiyasi</span><span class="hero-bottom-separator"></span><span>Bir havolada butun hikoya</span></div></div>'+
 '<div class="hero-art" aria-hidden="true"><div class="hero-art-halo"></div><div class="hero-art-card card-behind"></div>'+
 '<div class="hero-art-card card-front"><span class="art-top">QALBIM <span>— 01 / 18</span></span>'+
 '<div class="art-center"><div class="art-orb"><div class="art-orb-inner">♡</div></div><span class="art-small">A LETTER, JUST FOR YOU</span>'+
 '<strong>Words become<br><em>memories.</em></strong></div><div class="art-bottom"><span>With love, always.</span><span>✦</span></div></div>'+
 '<div class="hero-art-orbit orbit-a"></div><div class="hero-art-orbit orbit-b"></div></div></div>'+
 '<div class="dashboard-heading"><div><span class="eyebrow">SIZNING MAKONINGIZ</span><h2>Hammasi bir joyda<span class="heading-dot">.</span></h2></div>'+
 '<span class="status">'+(partner?'● Juftlik ulangan':'○ Juftlik hali ulanmagan')+'</span></div>'+
 '<div class="discover-grid">'+
 '<button class="discover-card" data-a="create"><span class="discover-icon">✎</span><div><small>01 / CREATE</small><strong>Maktub yozish</strong><p>Yangi hislaringizni sahifaga aylantiring</p></div><span class="discover-arrow">↗</span></button>'+
 '<button class="discover-card" data-a="letters"><span class="discover-icon">▤</span><div><small>02 / LIBRARY</small><strong>Maktublarim</strong><p>Barcha yaratgan xotiralaringiz</p></div><span class="discover-arrow">↗</span></button>'+
 '<button class="discover-card" data-a="pair"><span class="discover-icon">♡</span><div><small>03 / TOGETHER</small><strong>Bizning hikoya</strong><p>Ikki qalb uchun umumiy makon</p></div><span class="discover-arrow">↗</span></button>'+
 '<button class="discover-card" data-a="pro"><span class="discover-icon">✦</span><div><small>04 / EXCLUSIVE</small><strong>Qalbim Pro</strong><p>Ko‘proq imkoniyat, ko‘proq sehr</p></div><span class="discover-arrow">↗</span></button></div>';
}
function anniversaryWidget(user){
 const current=user.anniversary;
 let days=null;
 if(current){
   const ms=new Date(current+'T12:00:00').getTime();
   if(Number.isFinite(ms)){
     const today=new Date();today.setHours(12,0,0,0);
     days=Math.max(0,Math.round((today.getTime()-ms)/86400000));
   }
 }
 return '<div class="anniversary-widget"><div class="anniversary-content"><div class="eyebrow">♡ BIZNING TARIX</div><h2>'+(days===null?'Birgalikdagi birinchi kunni saqlang':days+' <small>kundan beri birgamiz</small>')+'</h2>'+
 '<p>'+(days===null?'Eng qadrli sanangizni belgilang — Qalbim uni eslab qoladi.':'Har bir kun — sizlarning yana bir kichik hikoyangiz. ♡')+'</p></div>'+
 '<form data-form="anniversary" class="anniversary-form"><label class="field"><span>Bizning sana</span><input type="date" class="input" name="anniversary" max="'+new Date().toISOString().slice(0,10)+'" value="'+esc(current||'')+'" required></label><button type="submit" class="btn">'+(days===null?'Saqlash':'Sanani yangilash')+'</button></form></div>'+
 '<div class="surprise-box"><div><span class="eyebrow">HAR KUNI BIR SYURPRIZ</span><h3>Bugun birga nima qilamiz?</h3><p id="surpriseIdea">Bir tugma — yangi romantik g‘oya.</p></div><button class="btn alt" type="button" data-surprise>🎲 Syurpriz tanlash</button></div>';
}
function updatePhotoCount(photos){
 const el=document.getElementById('livePhotoCount');if(el)el.textContent=photos.length?'📷 '+photos.length+' ta xotira qo‘shildi':'💗 Maktubingiz tayyorlanmoqda';
}
attachGlobalHandlers();
window.QalbimExperience={THEMES,renderStudio,attachStudio,changeTheme,paper:card,burst,homeWidget,anniversaryWidget,updatePhotoCount};
})();