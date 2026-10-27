/* Qalbim Couples Arena API. Server-authoritative, pair-bound rooms (24h TTL).
 * Creating rooms requires Pro; invited connected partner may join without Pro.
 * Optimistic compare-and-set protects moves against simultaneous requests. */
'use strict';
const MATCH_QUESTIONS=[
 {q:'Yakshanbani qanday o‘tkazishni afzal ko‘rasiz?',opts:['Sayr qilish','Birga film ko‘rish','Yangi joyga borish']},
 {q:'Kutilmagan sovg‘alardan qaysi biri yoqimliroq?',opts:['Shaxsiy maktub','Gullar','Birgalikdagi sayohat']},
 {q:'Uchrashuvning eng romantik vaqti?',opts:['Tong','Quyosh botishi','Yulduzli tun']},
 {q:'Birgalikda nimani o‘rganishni xohlaysiz?',opts:['Raqs','Ovqat pishirish','Til o‘rganish']},
 {q:'Yaqiningizni qanday xursand qilasiz?',opts:['Samimiy suhbat','Syurpriz','Birga vaqt o‘tkazish']},
 {q:'Qaysi joyda dam olish yoqimli?',opts:['Tog‘lar','Dengiz bo‘yi','Tarixiy shaharlar']}
];
const MEM_SYMBOLS=['heart','flower','star','moon','gem','gift'];
const NEW_ID='0123456789abcdef';
const STR=(x)=>String(x);
const GAME_TYPES=['xo','memory','match'];
const MAX_ROOMS=3;
function boardWin(board,s){
 return [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]].some(path=>path.every(i=>board[i]===s));
}
function shuffledDeck(){
 const arr=[...MEM_SYMBOLS,...MEM_SYMBOLS];
 for(let i=arr.length-1;i>0;i--){const j=require('crypto').randomInt(i+1);[arr[i],arr[j]]=[arr[j],arr[i]]}
 return arr;
}
const userKey=x=>String(x);
function project(room,user){
 const uid=userKey(user);
 const me=room.participants.findIndex(x=>userKey(x)===uid);
 if(me<0)return null;
 const base={id:STR(room._id),type:room.type,status:room.status,createdBy:STR(room.owner),turn:room.turn?STR(room.turn):null,
   myIndex:me,participants:room.participants.map(STR),createdAt:room.createdAt,
   updatedAt:room.updatedAt,expiresAt:room.expiresAt,
   winner:room.winner===null?null:room.winner==='draw'?'draw':STR(room.winner),
   revision:room.version};
 if(room.type==='xo'){base.board=room.board}
 if(room.type==='memory'){
   base.cards=room.deck.map((symbol,i)=>
     room.matched.includes(i)||room.selections.includes(i)||room.lastReveal.includes(i)?symbol:null);
   base.matched=room.matched;base.selections=room.selections;base.lastReveal=room.lastReveal;base.scores=room.scores;base.moves=room.moves;
 }
 if(room.type==='match'){
   base.round=room.round;base.total=MATCH_QUESTIONS.length;base.matches=room.matches;
   base.question=room.round<MATCH_QUESTIONS.length?MATCH_QUESTIONS[room.round]:null;
   base.myAnswered=Object.prototype.hasOwnProperty.call(room.answers,uid);
   base.otherAnswered=Object.keys(room.answers).length>0&&!base.myAnswered;
   base.answersCount=Object.keys(room.answers).length;
   base.lastResult=room.lastResult;
 }
 return base;
}
function changed(room,actor,input){
 const id=userKey(actor),me=room.participants.findIndex(x=>STR(x)===id);
 if(me<0)throw Object.assign(new Error('Siz bu juftlik o‘yinida emassiz'),{status:403});
 if(room.status!=='playing')throw Object.assign(new Error('Juftingiz taklifni qabul qilishini kuting'),{status:409});
 if(room.type==='xo'){
   if(STR(room.turn)!==id)throw Object.assign(new Error('Hozir juftingiz navbati'),{status:409});
   const i=Number(input.index);
   if(!Number.isInteger(i)||i<0||i>8||room.board[i]!==null)throw Object.assign(new Error('Katak band yoki noto‘g‘ri'),{status:400});
   const token=me===0?'heart':'star';room.board[i]=token;
   if(boardWin(room.board,token)){room.status='finished';room.winner=actor}
   else if(room.board.every(x=>x!==null)){room.status='finished';room.winner='draw'}
   else room.turn=room.participants[1-me];
 }else if(room.type==='memory'){
   if(STR(room.turn)!==id)throw Object.assign(new Error('Hozir juftingiz navbati'),{status:409});
   const i=Number(input.index);
   if(!Number.isInteger(i)||i<0||i>=room.deck.length||room.matched.includes(i)||room.selections.includes(i))
     throw Object.assign(new Error('Karta noto‘g‘ri yoki allaqachon ochilgan'),{status:400});
   room.lastReveal=[];
   room.selections.push(i);
   if(room.selections.length===2){
     const [a,b]=room.selections;
     room.lastReveal=[a,b];
     room.moves++;
     if(room.deck[a]===room.deck[b]){
       room.matched.push(a,b);room.scores[me]++;
       if(room.matched.length===room.deck.length){room.status='finished';room.winner=room.scores[0]===room.scores[1]?'draw':room.participants[room.scores[0]>room.scores[1]?0:1]}
     }else room.turn=room.participants[1-me];
     room.selections=[];
   }
 }else if(room.type==='match'){
   if(room.round>=MATCH_QUESTIONS.length)throw Object.assign(new Error('O‘yin yakunlangan'),{status:409});
   const answer=Number(input.answer);
   if(!Number.isInteger(answer)||answer<0||answer>2)throw Object.assign(new Error('Javob noto‘g‘ri'),{status:400});
   if(Object.prototype.hasOwnProperty.call(room.answers,id))throw Object.assign(new Error('Siz bu raundga javob bergansiz'),{status:409});
   room.answers[id]=answer;
   if(Object.keys(room.answers).length===2){
     const a=room.answers[STR(room.participants[0])],b=room.answers[STR(room.participants[1])];
     const match=a===b;
     if(match)room.matches++;
     room.lastResult={round:room.round,match,answers:[a,b]};
     room.round++;room.answers={};
     if(room.round>=MATCH_QUESTIONS.length){room.status='finished';room.winner=room.matches+' / '+MATCH_QUESTIONS.length}
   }
 }
 return room;
}
module.exports=function registerCoupleGames({app,auth,wrap,c,pro,oid,bad}){
 const collection=()=>c('couple_game_rooms');
 const publicRoom=(res,room,user)=>res.json({room:project(room,user)});
 async function pair(req,res){
  const partnerId=req.user.partnerId;
  if(!partnerId)return {error:bad(res,403,'Avval sevgan insoningizni juftlikka ulang')};
  const other=await c('users').findOne({_id:partnerId,partnerId:req.user._id,banned:false},{projection:{name:1,proUntil:1,partnerId:1}});
  if(!other)return {error:bad(res,403,'Juftlik aloqasini qayta tekshiring')};
  return {other};
 }
 async function ownRoom(req,res){
  const id=oid(req.params.id);
  if(!id)return {error:bad(res,404,'O‘yin topilmadi')};
  const r=await collection().findOne({_id:id,participants:req.user._id,expiresAt:{$gt:new Date()}});
  if(!r)return {error:bad(res,404,'O‘yin topilmadi yoki kirishga ruxsat yo‘q')};
  const state=await pair(req,res);
  if(state.error)return state;
  if(!r.participants.some(x=>STR(x)===STR(state.other._id)))return {error:bad(res,403,'Bu o‘yinda juftingiz qatnashmayapti')};
  return {room:r};
 }
 app.get('/api/games/rooms',auth,wrap(async(req,res)=>{
  if(!req.user.partnerId)return res.json({rooms:[],partnerConnected:false,isPro:pro(req.user)});
  const state=await pair(req,res);if(state.error)return;
  const rooms=await collection().find({participants:req.user._id,status:{$in:['waiting','playing']},expiresAt:{$gt:new Date()}}).sort({createdAt:-1}).limit(8).toArray();
  res.set('Cache-Control','no-store').json({rooms:rooms.filter(r=>r.participants.some(x=>STR(x)===STR(state.other._id))).map(r=>project(r,req.user._id)),partnerConnected:true,isPro:pro(req.user),partnerName:state.other.name});
 }));
 app.post('/api/games/rooms',auth,wrap(async(req,res)=>{
  if(!pro(req.user))return bad(res,403,'Juftlik Pro o‘yinini ochish uchun Pro obuna kerak');
  const type=String(req.body.type||'');
  if(!GAME_TYPES.includes(type))return bad(res,400,'O‘yin turi noto‘g‘ri');
  const state=await pair(req,res);if(state.error)return;
  const pairKey=[STR(req.user._id),STR(state.other._id)].sort().join(':');
  const n=await collection().countDocuments({pairKey,status:{$in:['waiting','playing']},expiresAt:{$gt:new Date()}});
  if(n>=MAX_ROOMS)return bad(res,429,'Juftlik uchun 3 ta faol o‘yin mavjud. Avval ulardan birini yakunlang');
  const room={type,pairKey,participants:[req.user._id,state.other._id],owner:req.user._id,status:'waiting',
    turn:req.user._id,winner:null,board:Array(9).fill(null),
    deck:type==='memory'?shuffledDeck():[],matched:[],selections:[],lastReveal:[],scores:[0,0],moves:0,
    round:0,answers:{},matches:0,lastResult:null,version:0,
    createdAt:new Date(),updatedAt:new Date(),expiresAt:new Date(Date.now()+24*60*60*1000)};
  const result=await collection().insertOne(room);room._id=result.insertedId;
  // Every new game becomes a durable invite card inside the existing private chat.
  // This system card lasts for the game lifetime, independently of ephemeral text TTL.
  try{
   await c('messages').insertOne({from:req.user._id,to:state.other._id,
     kind:'game',gameId:room._id,gameType:type,mode:'game',
     text:'',createdAt:new Date(),expiresAt:room.expiresAt});
  }catch(error){
    await collection().deleteOne({_id:room._id});
    throw error;
  }
  res.status(201).json({room:project(room,req.user._id)});
 }));
 app.get('/api/games/rooms/:id',auth,wrap(async(req,res)=>{
  const x=await ownRoom(req,res);if(x.error)return;
  res.set('Cache-Control','no-store');publicRoom(res,x.room,req.user._id);
 }));
 app.post('/api/games/rooms/:id/accept',auth,wrap(async(req,res)=>{
  const x=await ownRoom(req,res);if(x.error)return;
  if(STR(x.room.owner)===STR(req.user._id))return bad(res,400,'O‘yin taklifini juftingiz qabul qiladi');
  if(x.room.status!=='waiting')return bad(res,409,'Bu taklif faol emas');
  const r=await collection().findOneAndUpdate({_id:x.room._id,status:'waiting',version:x.room.version},
   {$set:{status:'playing',updatedAt:new Date()},$inc:{version:1}},{returnDocument:'after'});
  if(!r)return bad(res,409,'O‘yin boshqa oynada yangilangan');
  publicRoom(res,r,req.user._id);
 }));
 app.post('/api/games/rooms/:id/move',auth,wrap(async(req,res)=>{
  const x=await ownRoom(req,res);if(x.error)return;
  const room=x.room;const modified={...room,board:[...room.board],matched:[...room.matched],selections:[...room.selections],
     lastReveal:[...room.lastReveal],scores:[...room.scores],answers:{...room.answers}};
  try{changed(modified,req.user._id,req.body)}catch(e){return bad(res,e.status||400,e.message)}
  const operations={$set:{board:modified.board,matched:modified.matched,selections:modified.selections,lastReveal:modified.lastReveal,
      scores:modified.scores,moves:modified.moves,round:modified.round,answers:modified.answers,
      matches:modified.matches,lastResult:modified.lastResult,status:modified.status,winner:modified.winner,
      turn:modified.turn,updatedAt:new Date()},$inc:{version:1}};
  const latest=await collection().findOneAndUpdate({_id:room._id,version:room.version,status:'playing'},operations,{returnDocument:'after'});
  if(!latest)return bad(res,409,'O‘yin yangilangan. Holatni qayta yuklang');
  res.set('Cache-Control','no-store');publicRoom(res,latest,req.user._id);
 }));
 app.post('/api/games/rooms/:id/close',auth,wrap(async(req,res)=>{
  const x=await ownRoom(req,res);if(x.error)return;
  if(!['waiting','playing'].includes(x.room.status))return bad(res,409,'O‘yin allaqachon yakunlangan');
  await collection().updateOne({_id:x.room._id},{$set:{status:'closed',updatedAt:new Date()}});
  res.json({closed:true});
 }));
};
// Export isolated game logic for unit testing without a live database.
module.exports.test={boardWin,shuffledDeck,project,changed};
