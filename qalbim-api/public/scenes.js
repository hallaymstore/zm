/* Qalbim Scene Studio v3 — 18 visually distinct recipient experiences.
   Visuals are CSS/SVG-free and lightweight for Telegram WebApp and low-memory phones. */
(function(){
'use strict';
const I=[
{id:1,name:'Atirgul bog‘i',icon:'🌹',tag:'Petal Garden',family:'garden',action:'Gullarni uyg‘otish',orn:'✿'},
{id:2,name:'Oy ostida',icon:'🌙',tag:'Moonlight Letter',family:'night',action:'Yulduzlarni yoqish',orn:'✦'},
{id:3,name:'Quyosh botishi',icon:'🌅',tag:'Golden Horizon',family:'sunset',action:'Quyoshni uyg‘otish',orn:'☼'},
{id:4,name:'Bahor bog‘i',icon:'🌿',tag:'Spring Botanica',family:'garden',action:'Bog‘ni jonlantirish',orn:'❧'},
{id:5,name:'Pushti orzu',icon:'💗',tag:'Cotton Candy',family:'dream',action:'Orzuni uchirish',orn:'♡'},
{id:6,name:'Qadimiy maktub',icon:'✒️',tag:'Ink & Paper',family:'vintage',action:'Muhrni ochish',orn:'❦'},
{id:7,name:'Lavanda dalasi',icon:'🪻',tag:'Lavender Haze',family:'garden',action:'Lavandani tebratish',orn:'✾'},
{id:8,name:'Yulduzli osmon',icon:'✨',tag:'Cosmic Promise',family:'night',action:'Tilak tilash',orn:'✧'},
{id:9,name:'Retro postcard',icon:'📜',tag:'Postcard 1989',family:'vintage',action:'Xatni aylantirish',orn:'✉'},
{id:10,name:'Sakura bahori',icon:'🌸',tag:'Cherry Blossom',family:'garden',action:'Gulbarglarni uchirish',orn:'❀'},
{id:11,name:'Okean maktubi',icon:'🌊',tag:'Ocean Whisper',family:'ocean',action:'To‘lqinni chaqirish',orn:'≈'},
{id:12,name:'Qirollik oltini',icon:'👑',tag:'Royal Invitation',family:'royal',action:'Oltin jiloni yoqish',orn:'♛'},
{id:13,name:'Polaroid xotira',icon:'📸',tag:'Memory Frame',family:'vintage',action:'Xotirani aylantirish',orn:'▧'},
{id:14,name:'Neon yurak',icon:'💜',tag:'Electric Love',family:'night',action:'Yurakni yoritish',orn:'♥'},
{id:15,name:'Qorli tun',icon:'❄️',tag:'Snowfall Magic',family:'night',action:'Qor yog‘dirish',orn:'❄'},
{id:16,name:'Qora marmar',icon:'🖤',tag:'Noir Maison',family:'royal',action:'Marmarni yoritish',orn:'◆'},
{id:17,name:'Quyosh nuri',icon:'☀️',tag:'Sunlit Letter',family:'sunset',action:'Nurlarni uyg‘otish',orn:'☀'},
{id:18,name:'Oq minimal',icon:'🤍',tag:'Timeless Poetry',family:'minimal',action:'Yurakchani ko‘rsatish',orn:'♡'}
];
const $=id=>document.getElementById(id);
const escapeText=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const choice=n=>I[Math.min(18,Math.max(1,Number(n)||1))-1];
const decoration={
 1:['✿','❀','❁','✿','❀','✼','❁'],
 2:['✦','·','✧','⋆','✦','✧','·','⋆'],
 3:['☁','☁','✧','☁'],
 4:['❧','❦','✿','❧','✿','❦'],
 5:['♡','♥','♡','✧','♡','♥','✧'],
 6:['❧','✦','❦'],
 7:['✾','✿','❊','✾','✿','❊'],
 8:['✧','✦','⋆','·','✧','✦','⋆','·'],
 9:['✉','✦','❦'],
 10:['❀','❁','✿','❀','❁','✿','❀'],
 11:['≈','﹏','≈'],
 12:['✧','✦','◆','✦','✧'],
 13:['✧','♡'],
 14:['✦','♥','✧','♥','✦','✧'],
 15:['❄','✧','❅','❄','❅','✧','❄'],
 16:['◆','◇','✦','◇'],
 17:['☼','✧','☀','✧'],
 18:['·']
};
function ornaments(t){
 const list=decoration[t.id]||['♡'];
 return '<div class="scene-atmosphere" aria-hidden="true">'+list.map((mark,i)=>
 '<span class="atmo atmo-'+(i+1)+'" style="--i:'+i+'">'+escapeText(mark)+'</span>').join('')+'</div>';
}
const FIGURES={
1:'<div class="scene-figure figure-rose" aria-hidden="true"><span class="rose-stem"></span><span class="rose-bloom">✿</span><span class="rose-leaf leaf-left"></span><span class="rose-leaf leaf-right"></span></div>',
2:'<div class="scene-figure figure-moon" aria-hidden="true"><div class="moon-disc"></div><div class="moon-halo"></div></div>',
3:'<div class="scene-figure figure-sunset" aria-hidden="true"><span class="sunset-disc"></span><span class="sunset-horizon"></span></div>',
4:'<div class="scene-figure figure-spring" aria-hidden="true"><span class="sprig sprig-a">❧</span><span class="sprig sprig-b">❧</span><span class="spring-flower">✿</span></div>',
5:'<div class="scene-figure figure-dream" aria-hidden="true"><span class="dream-bubble">♡</span><span class="dream-cloud">☁</span></div>',
6:'<div class="scene-figure figure-ink" aria-hidden="true"><span class="ink-stamp">S</span><span class="ink-feather">✒</span></div>',
7:'<div class="scene-figure figure-lavender" aria-hidden="true"><span>✾</span><span>✾</span><span>✾</span></div>',
8:'<div class="scene-figure figure-cosmos" aria-hidden="true"><span class="cosmos-orbit"></span><span class="cosmos-center">✧</span></div>',
9:'<div class="scene-figure figure-postcard" aria-hidden="true"><span class="postmark">LOVE<br>POST<br>27</span><span class="post-stamp">♡</span></div>',
10:'<div class="scene-figure figure-sakura" aria-hidden="true"><span class="sakura-tree">✿</span><span class="sakura-branch"></span></div>',
11:'<div class="scene-figure figure-ocean" aria-hidden="true"><span class="ocean-moon">☾</span><span class="ocean-waves"></span></div>',
12:'<div class="scene-figure figure-crown" aria-hidden="true"><span class="crown-line">✧ — ♛ — ✧</span></div>',
13:'<div class="scene-figure figure-polaroid" aria-hidden="true"><div class="polaroid-back">♡</div><div class="polaroid-front"><span>♥</span><small>OUR STORY</small></div></div>',
14:'<div class="scene-figure figure-neon" aria-hidden="true"><span class="neon-heart">♡</span><span class="neon-grid"></span></div>',
15:'<div class="scene-figure figure-snow" aria-hidden="true"><span class="snowglobe">❄</span><span class="snow-base"></span></div>',
16:'<div class="scene-figure figure-marble" aria-hidden="true"><span class="marble-diamond">◇</span></div>',
17:'<div class="scene-figure figure-daylight" aria-hidden="true"><span class="day-disc"></span><span class="day-rays">✺</span></div>',
18:'<div class="scene-figure figure-purity" aria-hidden="true"><span>♡</span></div>'
};
const LABELS={
 1:'BIR QALBDAN BIR QALBGA',2:'OSTIDA BIR OY · IKKI QALB',3:'BIZNING SHAFAG‘IMIZ',
 4:'BAHOR BILAN KELGAN MUHABBAT',5:'KICHIK ORZULAR · KATTA BAHT',
 6:'YURAKDAN BITILGAN XAT',7:'LAVANDA IFORI · BIR HIKOYA',
 8:'OSMONDAGI BIR YULDUZ SENGA',9:'MAXSUS POCHTA · FAQAT SEN UCHUN',
 10:'SAKURA OSTIDA YUBORILGAN XAT',11:'TO‘LQINLAR OLIB KELGAN SO‘ZLAR',
 12:'OLTINDAN QIMMAT SO‘ZLAR',13:'BIZNING ENG GO‘ZAL KADRIMIZ',
 14:'YURAK URISHI · BIR RITM',15:'QOR TINCHLIGIDAGI IZROR',
 16:'ABADIY MUHABBAT QASAMI',17:'HAR KUNINGGA QUYOSH',18:'FAQAT SO‘ZLAR VA HISLAR'
};
function render({title,message,theme,from,to,preview=false}={}){
 const t=choice(theme),p=!!preview,mark=t.orn;
 const attrib='data-scene="'+t.id+'"';
 return '<section class="letter-scene scene-'+t.id+' '+(p?'scene-preview':'scene-full')+'" '+attrib+' aria-label="'+escapeText(t.name)+' — maktub dizayni">'+
 '<div class="scene-world" aria-hidden="true"><span class="scene-world-glow"></span><span class="scene-world-detail"></span></div>'+
 ornaments(t)+FIGURES[t.id]+
 '<div class="scene-composition"><div class="scene-topline"><span class="scene-symbol">'+escapeText(mark)+'</span><span class="scene-kicker">'+escapeText(LABELS[t.id])+'</span><span class="scene-symbol">'+escapeText(mark)+'</span></div>'+
 '<div class="scene-story"><div class="scene-recipient">SENGA · <span data-field="to">'+escapeText(to||'Azizim')+'</span></div>'+
 '<div class="scene-rule"></div><h2 data-field="title">'+escapeText(title||'Senga bir maktubim bor')+'</h2>'+
 '<p class="scene-message" data-field="message">'+escapeText(message||'Yuragimdagi so‘zlar shu yerda paydo bo‘ladi...')+'</p>'+
 '<div class="scene-signature">Mehr bilan, <em data-field="from">'+escapeText(from||'Men')+'</em><span>♡</span></div></div>'+
 '<div class="scene-bottomline"><span>'+escapeText(t.tag)+'</span><span>'+String(t.id).padStart(2,'0')+' / 18</span></div></div>'+
 (p?'':'<button type="button" class="scene-action" data-scene-action aria-label="'+escapeText(t.action)+'"><span>'+escapeText(mark)+'</span> '+escapeText(t.action)+'</button>')+
 '</section>';
}
function thumb(theme){
 const t=choice(theme);
 return '<span class="scene-thumb scene-'+t.id+'" data-scene="'+t.id+'" aria-hidden="true">'+
 '<span class="thumb-art">'+t.orn+'</span><span class="thumb-rule"></span><span class="thumb-letterline"></span><span class="thumb-letterline short"></span><span class="thumb-seal">♡</span></span>';
}
function sceneIntro(theme){
 const t=choice(theme);
 return '<div class="scene-intro-backdrop scene-'+t.id+'" data-scene="'+t.id+'" aria-hidden="true">'+
 ornaments(t)+FIGURES[t.id]+'</div>'+
 '<div class="scene-intro-detail">'+escapeText(t.tag)+' · '+escapeText(t.name)+'</div>';
}
function decorateIntro(theme){
 const ceremony=document.querySelector('.letter-ceremony');
 if(!ceremony)return;
 const t=choice(theme);
 ceremony.dataset.scene=String(t.id);
 ceremony.classList.add('scene-ceremony','scene-'+t.id);
 let stage=ceremony.querySelector('.scene-intro-backdrop');
 if(!stage)ceremony.insertAdjacentHTML('afterbegin',sceneIntro(t.id));
 const hint=document.getElementById('openHint');
 if(hint)hint.textContent='✦ '+t.name+' — konvertni oching';
 const seal=ceremony.querySelector('.envelope .seal');
 if(seal)seal.textContent=t.orn;
}
function activate(button){
 const stage=button.closest('.letter-scene');
 if(!stage)return;
 stage.classList.remove('scene-awake');
 void stage.offsetWidth;
 stage.classList.add('scene-awake');
 button.setAttribute('aria-pressed','true');
 const original=button.dataset.label||button.textContent;
 if(!button.dataset.label)button.dataset.label=original;
 const feedback=document.createElement('span');
 feedback.className='scene-feedback';feedback.textContent='✧';
 stage.appendChild(feedback);
 setTimeout(()=>feedback.remove(),1350);
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-scene-action]');
 if(b)activate(b);
});
window.QalbimScenes={I,render,thumb,decorateIntro};
})();