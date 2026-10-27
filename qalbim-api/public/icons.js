(function(){
'use strict';
const paths={"heart":"<path d=\"M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z\"/>","mail":"<rect x=\"2.5\" y=\"4.5\" width=\"19\" height=\"15\" rx=\"3\"/><path d=\"m3 6 9 7 9-7\"/>","home":"<path d=\"m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z\"/><path d=\"M9 21v-7h6v7\"/>","chat":"<path d=\"M21 11.5a8.6 8.6 0 0 1-9 8.5 9 9 0 0 1-4-.9L3 21l1.7-4.5a9 9 0 1 1 16.3-5Z\"/><path d=\"M8 11h8M8 14h5\"/>","user":"<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21a8 8 0 0 1 16 0\"/>","users":"<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75\"/>","crown":"<path d=\"m2 7 4.5 5 5.5-8 5.5 8L22 7l-2 12H4L2 7Z\"/><path d=\"M5 21h14\"/>","star":"<path d=\"m12 2 3.1 6.5 7.2 1-5.2 5.1 1.2 7.2-6.3-3.3-6.3 3.3 1.2-7.2-5.2-5.1 7.2-1L12 2Z\"/>","sparkle":"<path d=\"m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3ZM19 17l.7 1.3L21 19l-1.3.7L19 21l-.7-1.3L17 19l1.3-.7L19 17Z\"/>","flower":"<circle cx=\"12\" cy=\"12\" r=\"2.2\"/><path d=\"M12 9c-3.7-7-8-2.5-4 1.4M15 11c7-3.5 3.3-8-1-4M14.4 14c3.1 7.1 8.4 3.3 4.2-1M10 15c-6.7 4-9.8-.8-3-3.9M9 10c-4.5-5.6-9-.5-3.8 2.8\"/>","leaf":"<path d=\"M20 4c-11 0-17 5-17 12a5 5 0 0 0 5 5c7 0 12-6 12-17Z\"/><path d=\"M3 21c3-6 7-10 13-13\"/>","moon":"<path d=\"M20.9 13.3A9 9 0 0 1 10.7 3.1 9 9 0 1 0 20.9 13.3Z\"/>","sun":"<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.3 11.3 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4\"/>","sunrise":"<path d=\"M2 18h20M2 22h20M12 2v2M4.9 6.9l1.4 1.4M19.1 6.9l-1.4 1.4\"/><path d=\"M5 18a7 7 0 0 1 14 0\"/>","waves":"<path d=\"M2 8c2 0 2 2 5 2s3-2 5-2 3 2 5 2 3-2 5-2M2 14c2 0 2 2 5 2s3-2 5-2 3 2 5 2 3-2 5-2M2 20c2 0 2 2 5 2s3-2 5-2 3 2 5 2 3-2 5-2\"/>","snow":"<path d=\"M12 2v20M4 6l16 12M20 6 4 18M9 5l3 3 3-3M9 19l3-3 3 3\"/>","gem":"<path d=\"M6 3h12l4 7-10 12L2 10l4-7ZM2 10h20M6 3l6 7 6-7M12 10v12\"/>","camera":"<path d=\"M5 6h3l2-3h4l2 3h3a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3Z\"/><circle cx=\"12\" cy=\"13\" r=\"4\"/>","image":"<rect x=\"2\" y=\"3\" width=\"20\" height=\"18\" rx=\"2\"/><circle cx=\"8\" cy=\"9\" r=\"2\"/><path d=\"m22 16-5-5L5 21\"/>","gift":"<rect x=\"3\" y=\"8\" width=\"18\" height=\"13\" rx=\"2\"/><path d=\"M12 8v13M2 8h20v-3H2v3Z\"/><path d=\"M12 8C5 8 4 2 8 2c3 0 4 6 4 6Zm0 0c7 0 8-6 4-6-3 0-4 6-4 6Z\"/>","feather":"<path d=\"M20 4C12-1 4 7 5 14l3 3c7 1 15-7 12-13ZM3 21l11-11\"/>","zap":"<path d=\"m13 2-9 12h7l-1 8 10-12h-7V2Z\"/>","pen":"<path d=\"m12 19 7-7 3-3-7-7-3 3-8 8-2 9 9-3Z\"/>","calendar":"<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M7 2v6M17 2v6M3 10h18\"/>","arrow":"<path d=\"M5 12h14m-7-7 7 7-7 7\"/>","arrowup":"<path d=\"M7 17 17 7M7 7h10v10\"/>","link":"<path d=\"M10 13a5 5 0 0 0 7 .2l3-3a5 5 0 0 0-7.1-7.1l-2 2M14 11a5 5 0 0 0-7-.2l-3 3a5 5 0 0 0 7.1 7.1l2-2\"/>","copy":"<rect x=\"8\" y=\"8\" width=\"12\" height=\"13\" rx=\"2\"/><path d=\"M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h2\"/>","lock":"<rect x=\"4\" y=\"10\" width=\"16\" height=\"12\" rx=\"2\"/><path d=\"M8 10V7a4 4 0 0 1 8 0v3M12 15v2\"/>","check":"<path d=\"m4 12 5 5L20 6\"/>","smile":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M8 14s1.5 2 4 2 4-2 4-2M8.5 9h.01M15.5 9h.01\"/>","laugh":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M7 14c0 4 10 4 10 0H7ZM8 9h.01M16 9h.01\"/>","surprise":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M8.5 9h.01M15.5 9h.01\"/><ellipse cx=\"12\" cy=\"16\" rx=\"2\" ry=\"3\"/>","thumbsup":"<path d=\"M7 10 12 3c1-1 3 0 2 2l-1 4h6a3 3 0 0 1 3 3l-1.5 7a3 3 0 0 1-3 2H7V10ZM2 10h5v11H2Z\"/>","eye":"<path d=\"M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>","volume":"<path d=\"M4 9h4l5-4v14l-5-4H4V9ZM17 8a6 6 0 0 1 0 8M19 5a10 10 0 0 1 0 14\"/>","volumex":"<path d=\"M4 9h4l5-4v14l-5-4H4V9ZM17 9l5 6m0-6-5 6\"/>","clock":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6v6l4 2\"/>","search":"<circle cx=\"11\" cy=\"11\" r=\"8\"/><path d=\"m17 17 5 5\"/>","music":"<path d=\"M9 18V5l12-2v13\"/><ellipse cx=\"6\" cy=\"18\" rx=\"3\" ry=\"2\"/><ellipse cx=\"18\" cy=\"16\" rx=\"3\" ry=\"2\"/>","send":"<path d=\"m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13\"/>","card":"<rect x=\"2\" y=\"5\" width=\"20\" height=\"14\" rx=\"3\"/><path d=\"M2 10h20M6 15h3\"/>","settings":"<path d=\"M10 3h4l1 3 2 1 3-1 2 4-2 2v2l2 2-2 4-3-1-2 1-1 3h-4l-1-3-2-1-3 1-2-4 2-2v-2l-2-2 2-4 3 1 2-1 1-3Z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>","book":"<path d=\"M4 3h7a3 3 0 0 1 3 3v15H6a3 3 0 0 0-3 1V6a3 3 0 0 1 1-3ZM20 3h-3a3 3 0 0 0-3 3v15h4a3 3 0 0 1 3 1V6a3 3 0 0 0-1-3Z\"/>","upload":"<path d=\"M12 16V3m-5 5 5-5 5 5M3 16v5h18v-5\"/>","external":"<path d=\"M13 3h8v8m0-8-10 10M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6\"/>","x":"<path d=\"m18 6-12 12M6 6l12 12\"/>","refresh":"<path d=\"M20 7v5h-5M4 17v-5h5\"/><path d=\"M5 9a8 8 0 0 1 13-2l2 5M4 12l2 5a8 8 0 0 0 13-2\"/>"};
const emojiMap={"❤️":"heart","🥹":"smile","😍":"heart","💌":"mail","🌹":"flower","😘":"smile","💗":"heart","♥":"heart","♡":"heart","💕":"heart","💞":"heart","🌸":"flower","🪻":"flower","🌿":"leaf","🌙":"moon","☾":"moon","🌅":"sunrise","☀️":"sun","🌊":"waves","❄️":"snow","👑":"crown","📸":"camera","📷":"camera","🖼️":"image","✨":"sparkle","✦":"sparkle","✧":"sparkle","🎁":"gift","✒️":"feather","📜":"book","💜":"heart","🖤":"gem","🤍":"heart","🎂":"gift","🕊️":"leaf","🥺":"smile","🎧":"music","🎲":"sparkle","📖":"book","✉️":"mail","🔐":"lock","🔒":"lock","🔗":"link","📋":"copy","📨":"send","💳":"card","⭐":"star","📊":"book","⚙️":"settings","🔄":"refresh","☺":"user","☏":"chat","⌂":"home","✎":"pen","▤":"book","↗":"arrowup","→":"arrow"};
const reactions={"❤️":"heart","🥹":"smile","😍":"heart","💌":"mail","🌹":"flower","😘":"smile"};
function svg(name,size=20){
 const markup=paths[name]||paths.heart;
 return '<svg class="ui-icon" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+markup+'</svg>';
}
const re=new RegExp('('+Object.keys(emojiMap).sort((a,b)=>b.length-a.length).join('|')+')','gu');
function convertText(node){
 if(!node.nodeValue||!re.test(node.nodeValue))return;
 re.lastIndex=0;
 const parts=node.nodeValue.split(re),out=document.createDocumentFragment();
 parts.forEach(part=>{
  if(!part)return;
  if(emojiMap[part]){const span=document.createElement('span');span.className='inline-icon';span.innerHTML=svg(emojiMap[part],16);out.appendChild(span)}
  else out.appendChild(document.createTextNode(part));
 });
 node.replaceWith(out);
}
function hydrate(root=document){
 const base=root.nodeType===9?root.documentElement:root;
 if(!base)return;
 const all=Array.from(base.querySelectorAll('button,.discover-icon,.feature .emoji,.upload-mark,.template-option,.scene-kicker,.scene-symbol,.studio-help,.card-title,.page-title,.spark,.library-cover'));
 if(base.matches&&base.matches('button,.discover-icon,.feature .emoji,.upload-mark'))all.unshift(base);
 for(const el of all.slice(0,650)){
  if(el.matches('.reaction')){
   const icon=reactions[el.dataset.emoji]||'heart';
   if(el.querySelector('svg.ui-icon'))continue;
   const count=(el.textContent.match(/\d+/)||[])[0]||'';
   el.innerHTML=svg(icon,19)+(count?'<span class="reaction-count">'+count+'</span>':'');
   continue;
  }
  if(el.closest('svg,.scene-figure,.scene-atmosphere'))continue;
  const walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
  const nodes=[];while(walk.nextNode())if(walk.currentNode.nodeValue)nodes.push(walk.currentNode);
  for(const node of nodes)if(node.isConnected&&!node.parentElement.closest('svg,textarea,option,script'))convertText(node);
 }
}
let queued=false;
function schedule(){
 if(queued)return;queued=true;
 requestAnimationFrame(()=>{queued=false;hydrate(document)});
}
document.addEventListener('DOMContentLoaded',()=>{
 hydrate(document);
 new MutationObserver(m=>{if(m.some(e=>e.addedNodes.length))schedule()}).observe(document.body,{childList:true,subtree:true});
});
window.QalbimIcons={svg,hydrate,emojiMap,reactions};
})();