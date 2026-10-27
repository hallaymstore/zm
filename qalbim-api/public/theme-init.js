(function(){
'use strict';
var key='qalbim.ui.theme';
var mode='light';
try{mode=localStorage.getItem(key)==='dark'?'dark':'light'}catch(e){}
document.documentElement.setAttribute('data-theme',mode);
function refresh(){
 var dark=document.documentElement.getAttribute('data-theme')==='dark';
 document.querySelectorAll('[data-theme-toggle]').forEach(function(button){
   button.textContent=dark?'☀':'☾';
   button.setAttribute('aria-label',dark?'Kunduzgi rejimga o‘tish':'Tungi rejimga o‘tish');
   button.setAttribute('title',dark?'Kunduzgi rejim':'Tungi rejim');
   button.setAttribute('aria-pressed',String(dark));
 });
 var meta=document.querySelector('meta[name="theme-color"]');
 if(meta)meta.content=dark?'#17101c':'#fff9fa';
}
document.addEventListener('DOMContentLoaded',refresh);
document.addEventListener('click',function(event){
 var btn=event.target.closest('[data-theme-toggle]');
 if(!btn)return;
 var next=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
 document.documentElement.setAttribute('data-theme',next);
 try{localStorage.setItem(key,next)}catch(e){}
 refresh();
});
})();
