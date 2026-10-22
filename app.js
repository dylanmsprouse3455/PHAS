(() => {
'use strict';
const names={emf:'EMF Activity',temperature:'Temperature',uv:'UV / Footprints',orbs:'Ghost Orbs',spirit:'Spirit Box',dots:'D.O.T.S. Projector',writing:'Ghost Writing',salt:'Salt / Interaction'};
const drawer=document.getElementById('drawer'),title=document.getElementById('drawerTitle'),message=document.getElementById('drawerMessage'),actions=drawer.querySelector('.drawer-actions');
function show(t,b){title.textContent=t;message.textContent=b;actions.hidden=false;drawer.hidden=false;document.getElementById('closeDrawer').focus();}
function hide(){drawer.hidden=true;}
const key='ghost-intel-emf-v1';let entries=[];
try{const x=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(x))entries=x.filter(v=>[1,2,3,4,5].includes(v.level)&&typeof v.eligible==='boolean');}catch(e){}
const save=()=>{try{localStorage.setItem(key,JSON.stringify(entries));}catch(e){}};
let lastTap=0;
try{localStorage.removeItem('ghost-intel-emf-active');}catch(e){}
function update(){
const confirmed=entries.some(x=>x.level===5);const tile=document.querySelector('[data-id="emf"]');if(tile){tile.classList.toggle('evidence-confirmed',confirmed);tile.setAttribute('aria-label',confirmed?'EMF Activity — EMF Level 5 confirmed':'EMF Activity');}
const five=document.querySelector('.emf-5');if(five){five.classList.toggle('emf-five-confirmed',confirmed);five.setAttribute('aria-pressed',String(confirmed));}const check=document.getElementById('emfConfirmed');if(check){check.hidden=!confirmed;}
const el=document.getElementById('emfStatus'),undo=document.getElementById('emfUndo');
if(!el)return;
const count=Math.min(entries.length,7);
el.textContent='Readings recorded: '+count+'/7'+(entries.length>7?' ('+entries.length+' total)':'');
const checks=document.getElementById('emfChecks');if(checks)checks.querySelectorAll('.emf-check').forEach((b,i)=>{b.classList.toggle('checked',i<count);b.setAttribute('aria-checked',String(i<count));});
const caution=document.getElementById('emfCaution');if(caution)caution.hidden=count<7||confirmed;
undo.disabled=entries.length===0;
const clear=document.getElementById('emfClear');if(clear)clear.disabled=!entries.length;
}
function log(level){
const now=Date.now();if(now-lastTap<500)return;lastTap=now;
if(level===5&&entries.some(x=>x.level===5)){document.getElementById('emfFeedback').textContent='EMF Level 5 already recorded.';return;}
entries.push({level,eligible:level===2||level===3,time:new Date().toISOString()});
save();update();
document.getElementById('emfFeedback').textContent='EMF '+level+' recorded. Only tap again for a separate interaction.';
}
function openEmf(){
title.textContent='EMF Activity';actions.hidden=true;
message.innerHTML='<span class="emf-prompt">What did you observe?</span><span class="emf-levels" role="group" aria-label="Observed EMF level">'+[1,2,3,4,5].map(n=>'<button type="button" class="emf-level emf-'+n+'" data-level="'+n+'" aria-label="Record EMF level '+n+'"><span class="emf-dot"></span><strong>'+n+'</strong></button>').join('')+'</span><span id="emfConfirmed" class="emf-confirmed" hidden>☑ EMF LEVEL 5 REACHED</span><span class="emf-warning"><strong>One tap per separate interaction.</strong> Do not tap repeatedly for the same EMF reading; duplicate entries can distort your results.</span><span class="emf-status" id="emfStatus"></span><span class="emf-checks" id="emfChecks" role="group" aria-label="Seven EMF reading checkpoints">'+Array.from({length:7},(_,i)=>'<span class="emf-check" role="checkbox" aria-checked="false" aria-label="Reading '+(i+1)+'" >'+(i+1)+'</span>').join('')+'</span><span id="emfCaution" class="emf-caution" hidden>Seven readings without EMF 5 make it less likely, but do not rule it out.</span><span class="emf-feedback" id="emfFeedback" role="status" aria-live="polite"></span><button type="button" class="emf-undo" id="emfUndo">Undo last reading</button><button type="button" class="emf-clear" id="emfClear">CLEAR INTERACTIONS</button><span class="emf-clear-confirm" id="emfClearConfirm" hidden><strong>Clear all EMF readings?</strong><span>This resets only EMF. Other equipment will not be affected.</span><span class="emf-clear-actions"><button type="button" id="emfClearYes">YES, CLEAR ALL</button><button type="button" id="emfClearNo">CANCEL</button></span></span>';
drawer.hidden=false;update();
message.querySelectorAll('[data-level]').forEach(b=>b.addEventListener('click',()=>log(Number(b.dataset.level))));

const clearConfirm=document.getElementById('emfClearConfirm');
document.getElementById('emfClear').addEventListener('click',()=>{clearConfirm.hidden=false;requestAnimationFrame(()=>clearConfirm.scrollIntoView({behavior:'smooth',block:'end'}));});
document.getElementById('emfClearNo').addEventListener('click',()=>{clearConfirm.hidden=true;});
document.getElementById('emfClearYes').addEventListener('click',()=>{entries=[];try{localStorage.removeItem(key);localStorage.removeItem('ghost-intel-emf-active');}catch(e){}clearConfirm.hidden=true;update();document.getElementById('emfFeedback').textContent='All EMF interactions cleared. Ready for a new investigation.';});
document.getElementById('emfUndo').addEventListener('click',()=>{entries.pop();save();update();document.getElementById('emfFeedback').textContent='Last reading removed.';});
document.getElementById('closeDrawer').focus();
}

const tempKey='ghost-intel-temperature-v1',tempDuration=180000;
let temp={phase:'placement',started:0,confirmed:false,checks:[]};
try{const t=JSON.parse(localStorage.getItem(tempKey)||'null');if(t&&['placement','waiting','ready','confirmed'].includes(t.phase)){temp={...temp,...t,checks:Array.isArray(t.checks)?t.checks:[]};}}catch(e){}
const saveTemp=()=>{try{localStorage.setItem(tempKey,JSON.stringify(temp));}catch(e){}};
function tempRemaining(){return Math.max(0,tempDuration-(Date.now()-temp.started));}
function tempTick(){
 if(temp.phase==='waiting'&&tempRemaining()===0){temp.phase='ready';saveTemp();}
 const banner=document.getElementById('tempBanner'),tile=document.querySelector('[data-id="temperature"]');
 if(tile)tile.classList.toggle('evidence-confirmed',temp.confirmed);
 const visible=['waiting','ready'].includes(temp.phase);
 if(banner){banner.hidden=!visible;if(visible){
  const remain=tempRemaining(),pct=temp.phase==='ready'?0:Math.ceil(remain/tempDuration*100);
  document.getElementById('tempBannerPct').textContent=temp.phase==='ready'?'READY TO CHECK':pct+'% left';
  document.getElementById('tempBannerFill').style.width=pct+'%';
  document.getElementById('tempBannerTime').textContent=temp.phase==='ready'?'Tap to check thermometer':'Next check in '+Math.floor(Math.ceil(remain/1000)/60)+':'+String(Math.ceil(remain/1000)%60).padStart(2,'0');
 }}
 if(!drawer.hidden&&document.getElementById('tempCountdown')){const el=document.getElementById('tempCountdown');el.textContent=temp.phase==='ready'?'Ready to check': 'Next check in '+Math.floor(Math.ceil(tempRemaining()/1000)/60)+':'+String(Math.ceil(tempRemaining()/1000)%60).padStart(2,'0');if(temp.phase==='ready')openTemp();}
}
function startTempCycle(){temp.phase='waiting';temp.started=Date.now();saveTemp();tempTick();openTemp();}
function tempChoice(freezing){
 temp.checks.push({freezing,time:new Date().toISOString()});
 if(freezing){temp.confirmed=true;temp.phase='confirmed';saveTemp();tempTick();openTemp();}
 else{startTempCycle();}
}
function openTemp(){
 title.textContent='Temperature';actions.hidden=true;drawer.hidden=false;tempTickBannerOnly();
 if(temp.phase==='placement'){
 message.innerHTML='<span class="temp-heading">PLACE YOUR THERMOMETER</span><span class="temp-description">Put the thermometer in the suspected ghost room, ideally where you have noticed cold breath or unusually low temperatures. Once placed, continue to begin a three-minute check cycle.</span><button class="temp-primary" id="tempContinue">CONTINUE</button>';
 document.getElementById('tempContinue').onclick=()=>{
  message.innerHTML='<span class="temp-heading">PREPARING THERMOMETER CHECK</span><span class="temp-description">Simulated setup — this app does not connect to Phasmophobia.</span><span class="temp-track temp-sync"><span id="tempSyncFill"></span></span><span id="tempSyncText">Preparing…</span>';
  let i=0;const interval=setInterval(()=>{if(drawer.hidden){clearInterval(interval);return;}i+=20;const fill=document.getElementById('tempSyncFill');if(!fill){clearInterval(interval);return;}fill.style.width=i+'%';document.getElementById('tempSyncText').textContent=i===100?'READY — 100%':'Preparing — '+i+'%';if(i>=100){clearInterval(interval);setTimeout(()=>{if(!drawer.hidden)startTempCycle();else{temp.phase='waiting';temp.started=Date.now();saveTemp();tempTick();}},450);}},170);
 };
 }else if(temp.phase==='waiting'){
 message.innerHTML='<span class="temp-heading">THERMOMETER ACCLIMATING</span><span class="temp-description">Leave the thermometer in the suspected ghost room. You can close this panel; the countdown continues on the dashboard.</span><span class="temp-countdown" id="tempCountdown"></span><button class="temp-secondary" id="tempCheckEarly">CHECK NOW</button>';
 document.getElementById('tempCheckEarly').onclick=()=>{temp.phase='ready';saveTemp();openTemp();};
 }else if(temp.phase==='ready'){
 message.innerHTML='<span class="temp-heading">CHECK THE ROOM TEMPERATURE</span><span class="temp-description">Look at the thermometer in-game. What did you observe?</span><span class="temp-options"><button id="tempFreezing" class="temp-freezing">❄ FREEZING TEMPERATURE</button><button id="tempNotFreezing">NO FREEZING TEMPERATURE</button></span><span class="temp-description">Not freezing means not observed yet; it does not eliminate freezing evidence.</span>';
 document.getElementById('tempFreezing').onclick=()=>tempChoice(true);
 document.getElementById('tempNotFreezing').onclick=()=>tempChoice(false);
 }else{
 message.innerHTML='<span class="temp-heading">❄ FREEZING TEMPERATURE RECORDED</span><span class="temp-description">Freezing evidence is marked as observed. Only record this when the thermometer shows a valid freezing reading.</span><button class="temp-secondary" id="tempReset">START A NEW TEMPERATURE CHECK</button>';
 document.getElementById('tempReset').onclick=()=>{temp.phase='placement';temp.confirmed=false;saveTemp();tempTick();openTemp();};
 }
 document.getElementById('closeDrawer').focus();
 tempTick();
}
function tempTickBannerOnly(){const b=document.getElementById('tempBanner');if(b)b.hidden=!['waiting','ready'].includes(temp.phase);}
document.getElementById('tempBanner').addEventListener('click',openTemp);
setInterval(tempTick,1000);
tempTick();



const uvKey='ghost-intel-uv-v1';let uvEntries=[];
try{const saved=JSON.parse(localStorage.getItem(uvKey)||'[]');if(Array.isArray(saved))uvEntries=saved.filter(x=>x&&['yes','no','unsure'].includes(x.result));}catch(e){}
function uvSave(){localStorage.setItem(uvKey,JSON.stringify(uvEntries));}
function uvSync(){document.querySelector('[data-id="uv"]').classList.toggle('evidence-confirmed',(uvEntries.some(x=>x.result==='yes')||saltHistory.some(x=>x.salt==='yes'&&x.uv==='found')));}
function openUv(){
 title.textContent='UV / Fingerprints';actions.hidden=true;drawer.hidden=false;
 const count=uvEntries.filter(x=>x.result==='no'&&x.valid===true&&x.type==='object').length;
 const found=uvEntries.some(x=>x.result==='yes');
 const probability=100*Math.pow(.25,count);
 const percent=count===0?'100%':probability<.01?'<0.01%':Number(probability.toFixed(2))+'%';
 const trickCount=count===1?'':count===2?' twice in a row':count===3?' three times in a row':count===4?' four times in a row':count===5?' five times in a row':' '+count+' times in a row';
 const trickText=count===0?'Record an interaction to see whether an Obake could have tricked you.':"There's a "+percent+' chance an Obake could have tricked you'+trickCount+' by leaving no UV.';
 const heading=found?'UV CONFIRMED':count>=5?'UV is looking unlikely':count>=3?'UV is becoming less likely':'Keep investigating';
 const explanation=found?'UV evidence recorded. Continue collecting other evidence.':count===0?'Record a ghost interaction to begin.':count+' separate ghost interaction'+(count===1?'':'s')+' checked promptly without UV.';
 const next=found?'Evidence confirmed.':count>=5?'Consider other evidence, but do not rule out UV completely.':'Check the next ghost interaction for UV.';
 message.innerHTML='<section class="uv-live uv-counter"><strong class="uv-title">UV INVESTIGATION</strong><span class="uv-counter-label">GHOST INTERACTIONS WITH NO UV</span><div class="uv-counter-controls"><button type="button" id="uvMinus" aria-label="Remove one interaction" '+(count===0||found?'disabled':'')+'>−</button><div class="uv-counter-number"><strong>'+count+'</strong><small>RECORDED</small></div><button type="button" id="uvPlus" aria-label="Record another interaction without UV" '+(found?'disabled':'')+'>+</button></div><p class="uv-counter-hint">Tap + to record what the ghost touched. Only prompt checks of UV-capable surfaces count.</p><div class="uv-probability"><div class="uv-probability-heading"><strong>Chance an Obake could have tricked you</strong><button type="button" id="uvInfo" aria-label="Explain Obake probability">ⓘ</button></div><strong class="uv-percent">'+percent+'</strong><div class="uv-probability-track"><span style="width:'+probability+'%"></span></div><small>'+trickText+'</small></div><div class="uv-live-result"><strong>'+heading+'</strong><span>'+explanation+'</span><small>'+next+'</small></div><label class="uv-live-found"><input id="uvFound" type="checkbox" '+(found?'checked':'')+'> UV FOUND</label><small class="uv-counter-details" id="uvDetails" hidden></small></section>';
 document.getElementById('uvPlus').onclick=()=>{
  title.textContent='UV — What was touched?';
  const choice=message;choice.className='uv-surface-choice';
  choice.innerHTML='<strong>What did the ghost touch?</strong><div class="uv-surface-grid"><button type="button" data-surface="door">Door</button><button type="button" data-surface="window">Window</button><button type="button" data-surface="switch">Light switch</button><button type="button" data-surface="other">Salt / thrown object / unsure</button></div><small>Only count a fresh interaction on a UV-capable surface checked promptly.</small>';
  choice.innerHTML+='<button type="button" id="uvChoiceBack">BACK TO COUNTER</button>';
  document.getElementById('uvChoiceBack').onclick=openUv;
  choice.querySelectorAll('[data-surface]').forEach(button=>button.onclick=()=>{
   if(button.dataset.surface==='other'){choice.innerHTML='<strong>Not counted</strong><small>That interaction cannot reliably lower the Obake no-UV percentage. Wait for a UV-capable surface interaction.</small><button type="button" id="uvChoiceClose">OK</button>';document.getElementById('uvChoiceClose').onclick=openUv;return;}
   uvEntries.push({type:'object',surface:button.dataset.surface,result:'no',valid:true,time:new Date().toISOString()});uvSave();uvSync();openUv();
  });
 };
 document.getElementById('uvMinus').onclick=()=>{for(let i=uvEntries.length-1;i>=0;i--){const x=uvEntries[i];if(x.result==='no'&&x.valid===true&&x.type==='object'){uvEntries.splice(i,1);break;}}uvSave();uvSync();openUv();};
 document.getElementById('uvFound').onchange=e=>{if(e.target.checked){uvEntries.push({type:'object',result:'yes',time:new Date().toISOString()});}else{uvEntries=uvEntries.filter(x=>x.result!=='yes');}uvSave();uvSync();openUv();};
 document.getElementById('uvInfo').onclick=()=>{const el=document.getElementById('uvDetails');el.textContent='Assuming each qualifying interaction independently has a 25% chance of no UV for an Obake, this is the chance of no UV across all recorded interactions. It is NOT the probability the ghost is an Obake. A UV observation confirms UV evidence. Salt and uncertain observations do not count toward this calculation.';el.hidden=!el.hidden;};
}


// ===== SHARED CHECKLIST CONTROLS =====
// Each equipment section owns its steps and evidence; these helpers keep
// skip and remembered checklist preferences consistent across devices.
function checklistHidden(key,forceShow){try{return !forceShow&&localStorage.getItem(key)==='true';}catch(e){return false;}}
function rememberChecklistHidden(key){try{localStorage.setItem(key,'true');}catch(e){}}
function wireChecklistNavigation(prefix,hideKey,open,skip){
 const checkbox=document.getElementById(prefix+'Never');
 checkbox.checked=checklistHidden(hideKey,false);
 checkbox.onchange=()=>{try{if(checkbox.checked)localStorage.setItem(hideKey,'true');else localStorage.removeItem(hideKey);}catch(e){}};
 document.getElementById(prefix+'Skip').onclick=()=>skip(false);
}

// ===== EQUIPMENT: SPIRIT BOX =====
const spiritKey='ghost-intel-spirit-v1';
let spirit={checks:[],answer:''};
try{const saved=JSON.parse(localStorage.getItem(spiritKey)||'null');if(saved&&Array.isArray(saved.checks))spirit={checks:saved.checks.filter(x=>['lights','near','on','asked'].includes(x)),answer:['yes','no',''].includes(saved.answer)?saved.answer:''};}catch(e){}
let spiritSkip=false;
let spiritShowChecklist=false;
const spiritHideKey='ghost-intel-spirit-hide-checklist';
const spiritItems=[['lights','Room lights are turned off'],['near',"I'm close to the ghost's location"],['on','Spirit Box is turned on'],['asked',"I've asked the ghost a question"]];
function spiritSave(){try{localStorage.setItem(spiritKey,JSON.stringify(spirit));}catch(e){}}
function spiritSync(){const tile=document.querySelector('[data-id="spirit"]');if(tile)tile.classList.toggle('evidence-confirmed',spirit.answer==='yes');}
function openSpirit(){
 title.textContent='Spirit Box';actions.hidden=true;drawer.hidden=false;message.className='';

 const done=spiritItems.every(([id])=>spirit.checks.includes(id))||spiritSkip||checklistHidden(spiritHideKey,spiritShowChecklist);
 if(!done){
  message.innerHTML='<section class="spirit-panel"><span class="spirit-step">STEP 1 OF 2</span><strong class="spirit-heading">PREPARE YOUR SPIRIT BOX</strong><small>Check each item as you complete it.</small><div class="spirit-checks">'+spiritItems.map(([id,label])=>'<button type="button" class="spirit-check '+(spirit.checks.includes(id)?'is-checked':'')+'" data-spirit-check="'+id+'" aria-pressed="'+spirit.checks.includes(id)+'"><span class="spirit-checkmark">'+(spirit.checks.includes(id)?'✓':'□')+'</span><span>'+label+'</span></button>').join('')+'</div><span class="spirit-progress">'+spirit.checks.length+' OF 4 COMPLETE</span><small>Some ghosts respond only when you are alone. Try that if needed.</small><button type="button" class="spirit-back checklist-skip" id="spiritSkip">SKIP CHECKLIST</button><label class="help-dismiss"><input type="checkbox" id="spiritNever"> Don&#39;t show this checklist again</label></section>';
  wireChecklistNavigation('spirit',spiritHideKey,openSpirit,(remember)=>{spiritSkip=true;spiritShowChecklist=false;openSpirit();});
  message.querySelectorAll('[data-spirit-check]').forEach(b=>b.onclick=()=>{const id=b.dataset.spiritCheck;spirit.checks=spirit.checks.includes(id)?spirit.checks.filter(x=>x!==id):[...spirit.checks,id];spiritSave();openSpirit();});
 }else{
  message.innerHTML='<section class="spirit-panel"><span class="spirit-step">STEP 2 OF 2</span><strong class="spirit-heading">DID THE GHOST SPEAK?</strong><small>Only an actual voice response through the Spirit Box confirms evidence.</small><div class="spirit-answers"><button type="button" id="spiritYes" class="'+(spirit.answer==='yes'?'selected':'')+'">SPOKE</button><button type="button" id="spiritNo" class="'+(spirit.answer==='no'?'selected':'')+'">NO ANSWER</button></div><p class="spirit-result">'+(spirit.answer==='yes'?'SPIRIT BOX CONFIRMED':spirit.answer==='no'?'No response recorded. Spirit Box is NOT ruled out. Try being alone, moving closer, or asking again.':'Choose what happened after you asked.')+'</p><button type="button" class="spirit-back" id="spiritBack">BACK TO CHECKLIST</button>'+(spirit.answer==='no'?'<button type="button" class="spirit-back" id="spiritRetry">TRY AGAIN</button>':'')+'</section>';
  document.getElementById('spiritYes').onclick=()=>{spirit.answer='yes';spiritSave();spiritSync();openSpirit();};
  document.getElementById('spiritNo').onclick=()=>{spirit.answer='no';spiritSave();spiritSync();openSpirit();};
  document.getElementById('spiritBack').onclick=()=>{spiritSkip=false;spiritShowChecklist=true;spirit.checks=spirit.checks.filter(x=>x!=='asked');spiritSave();openSpirit();};
  const retry=document.getElementById('spiritRetry');if(retry)retry.onclick=()=>{spirit.checks=spirit.checks.filter(x=>x!=='asked');spirit.answer='';spiritSave();openSpirit();};
 }
}
spiritSync();

// ===== EQUIPMENT: GHOST ORBS =====
const orbsKey='ghost-intel-orbs-v1';
let orbs={checks:[],answer:''};
try{const saved=JSON.parse(localStorage.getItem(orbsKey)||'null');if(saved&&Array.isArray(saved.checks))orbs={checks:saved.checks.filter(x=>['camera','night','lights','aim'].includes(x)),answer:['yes','no',''].includes(saved.answer)?saved.answer:''};}catch(e){}
let orbsSkip=false;
let orbsShowChecklist=false;
const orbsHideKey='ghost-intel-orbs-hide-checklist';
const orbsItems=[['camera','Video camera is turned on'],['night','Night vision is enabled'],['lights','Room lights are off'],['aim',"Camera is aimed at the ghost's room"]];
function orbsSave(){try{localStorage.setItem(orbsKey,JSON.stringify(orbs));}catch(e){}}
function orbsSync(){const tile=document.querySelector('[data-id="orbs"]');if(tile)tile.classList.toggle('evidence-confirmed',orbs.answer==='yes');}
function openOrbs(){
 title.textContent='Video Camera / Ghost Orbs';actions.hidden=true;drawer.hidden=false;message.className='';

 const done=orbsItems.every(([id])=>orbs.checks.includes(id))||orbsSkip||checklistHidden(orbsHideKey,orbsShowChecklist);
 if(!done){
  message.innerHTML='<section class="spirit-panel"><span class="spirit-step">STEP 1 OF 2</span><strong class="spirit-heading">SET UP YOUR CAMERA</strong><small>Check each item as you complete it.</small><div class="spirit-checks">'+orbsItems.map(([id,label])=>'<button type="button" class="spirit-check '+(orbs.checks.includes(id)?'is-checked':'')+'" data-orbs-check="'+id+'" aria-pressed="'+orbs.checks.includes(id)+'"><span class="spirit-checkmark">'+(orbs.checks.includes(id)?'✓':'□')+'</span><span>'+label+'</span></button>').join('')+'</div><span class="spirit-progress">'+orbs.checks.length+' OF 4 COMPLETE</span><button type="button" class="spirit-back checklist-skip" id="orbsSkip">SKIP CHECKLIST</button><label class="help-dismiss"><input type="checkbox" id="orbsNever"> Don&#39;t show this checklist again</label></section>';
  wireChecklistNavigation('orbs',orbsHideKey,openOrbs,(remember)=>{orbsSkip=true;orbsShowChecklist=false;openOrbs();});
  message.querySelectorAll('[data-orbs-check]').forEach(b=>b.onclick=()=>{const id=b.dataset.orbsCheck;orbs.checks=orbs.checks.includes(id)?orbs.checks.filter(x=>x!==id):[...orbs.checks,id];orbsSave();openOrbs();});
 }else{
  message.innerHTML='<section class="spirit-panel"><span class="spirit-step">STEP 2 OF 2</span><strong class="spirit-heading">DID YOU SEE GHOST ORBS?</strong><small>Look for floating orbs moving independently in the camera view. Snow or particles can be misleading.</small><div class="spirit-answers"><button type="button" id="orbsYes" class="'+(orbs.answer==='yes'?'selected':'')+'">YES</button><button type="button" id="orbsNo" class="'+(orbs.answer==='no'?'selected':'')+'">NO</button></div><p class="spirit-result">'+(orbs.answer==='yes'?'GHOST ORBS RECORDED. Remember: The Mimic can also show orbs.':orbs.answer==='no'?'No orb seen. Ghost Orbs are NOT ruled out. Try another angle or watch longer.':'Choose what you observed.')+'</p><button type="button" class="spirit-back" id="orbsBack">BACK TO CHECKLIST</button></section>';
  document.getElementById('orbsYes').onclick=()=>{orbs.answer='yes';orbsSave();orbsSync();openOrbs();};
  document.getElementById('orbsNo').onclick=()=>{orbs.answer='no';orbsSave();orbsSync();openOrbs();};
  document.getElementById('orbsBack').onclick=()=>{orbsSkip=false;orbsShowChecklist=true;orbs.checks=orbs.checks.filter(x=>x!=='aim');orbsSave();openOrbs();};
 }
}
orbsSync();

// ===== EQUIPMENT: D.O.T.S. =====
const dotsKey='ghost-intel-dots-v1';
let dots={checks:[],answer:''};
try{const saved=JSON.parse(localStorage.getItem(dotsKey)||'null');if(saved&&Array.isArray(saved.checks))dots={checks:saved.checks.filter(x=>['place','area','view','watch'].includes(x)),answer:['yes','no',''].includes(saved.answer)?saved.answer:''};}catch(e){}
let dotsSkip=false;
let dotsShowChecklist=false;
const dotsHideKey='ghost-intel-dots-hide-checklist';
const dotsItems=[['place','D.O.T.S. Projector is placed and turned on'],['area',"Projector covers the ghost's activity area"],['view','I can clearly see the projected dots'],['watch',"I've watched for the ghost to pass through"]];
function dotsSave(){try{localStorage.setItem(dotsKey,JSON.stringify(dots));}catch(e){}}
function dotsSync(){const tile=document.querySelector('[data-id="dots"]');if(tile)tile.classList.toggle('evidence-confirmed',dots.answer==='yes');}
function openDots(){
 title.textContent='D.O.T.S. Projector';actions.hidden=true;drawer.hidden=false;message.className='';
 const done=dotsItems.every(([id])=>dots.checks.includes(id))||dotsSkip||checklistHidden(dotsHideKey,dotsShowChecklist);
 if(!done){
  message.innerHTML='<section class="spirit-panel"><span class="spirit-step">STEP 1 OF 2</span><strong class="spirit-heading">SET UP D.O.T.S.</strong><small>Check each step as you complete it. Finish all four to continue, or skip below.</small><div class="spirit-checks">'+dotsItems.map(([id,label])=>'<button type="button" class="spirit-check '+(dots.checks.includes(id)?'is-checked':'')+'" data-dots-check="'+id+'" aria-pressed="'+dots.checks.includes(id)+'"><span class="spirit-checkmark">'+(dots.checks.includes(id)?'✓':'□')+'</span><span>'+label+'</span></button>').join('')+'</div><span class="spirit-progress">'+dots.checks.length+' OF 4 COMPLETE</span><button type="button" class="spirit-back checklist-skip" id="dotsSkip">SKIP CHECKLIST</button><label class="help-dismiss"><input type="checkbox" id="dotsNever"> Don&#39;t show this checklist again</label></section>';
  wireChecklistNavigation('dots',dotsHideKey,openDots,(remember)=>{dotsSkip=true;dotsShowChecklist=false;openDots();});
  message.querySelectorAll('[data-dots-check]').forEach(b=>b.onclick=()=>{const id=b.dataset.dotsCheck;dots.checks=dots.checks.includes(id)?dots.checks.filter(x=>x!==id):[...dots.checks,id];dotsSave();openDots();});
 }else{
  message.innerHTML='<section class="spirit-panel"><span class="spirit-step">STEP 2 OF 2</span><strong class="spirit-heading">DID YOU SEE A GHOST SILHOUETTE?</strong><small>Look for a ghost-shaped figure briefly passing through the projected dots.</small><div class="spirit-answers"><button type="button" id="dotsYes" class="'+(dots.answer==='yes'?'selected':'')+'">YES</button><button type="button" id="dotsNo" class="'+(dots.answer==='no'?'selected':'')+'">NO</button></div><p class="spirit-result">'+(dots.answer==='yes'?'D.O.T.S. EVIDENCE CONFIRMED.':dots.answer==='no'?'D.O.T.S. is NOT ruled out. Try repositioning the projector or watching longer. Goryo D.O.T.S. is visible through a video camera only when nobody is in the room.':'Choose what you observed.')+'</p><button type="button" class="spirit-back" id="dotsBack">BACK TO CHECKLIST</button></section>';
  document.getElementById('dotsYes').onclick=()=>{dots.answer='yes';dotsSave();dotsSync();openDots();};
  document.getElementById('dotsNo').onclick=()=>{dots.answer='no';dotsSave();dotsSync();openDots();};
  document.getElementById('dotsBack').onclick=()=>{dotsSkip=false;dotsShowChecklist=true;dots.checks=dots.checks.filter(x=>x!=='watch');dotsSave();openDots();};
 }
}
dotsSync();


 // ===== EQUIPMENT: GHOST WRITING =====
const writingKey='ghost-intel-writing-v1';
const writingHideKey='ghost-intel-writing-hide-checklist';
let writing={checks:[],answer:''};
try{const saved=JSON.parse(localStorage.getItem(writingKey)||'null');if(saved&&Array.isArray(saved.checks))writing={checks:saved.checks.filter(x=>['book','room','placed','wait'].includes(x)),answer:['yes','no',''].includes(saved.answer)?saved.answer:''};}catch(e){}
let writingSkip=false,writingShowChecklist=false;
const writingItems=[['book','Ghost Writing Book is available'],['room',"Book is in the ghost's activity area"],['placed','Book is placed where the ghost can reach it'],['wait',"I've waited and checked the book for writing"]];
function writingSave(){try{localStorage.setItem(writingKey,JSON.stringify(writing));}catch(e){}}
function writingSync(){const tile=document.querySelector('[data-id="writing"]');if(tile)tile.classList.toggle('evidence-confirmed',writing.answer==='yes');}
function openWriting(){
 title.textContent='Ghost Writing';actions.hidden=true;drawer.hidden=false;message.className='';
 const done=writingItems.every(([id])=>writing.checks.includes(id))||writingSkip||checklistHidden(writingHideKey,writingShowChecklist);
 if(!done){
  message.innerHTML='<section class="spirit-panel"><span class="spirit-step">STEP 1 OF 2</span><strong class="spirit-heading">SET UP GHOST WRITING</strong><small>Check each step as you complete it. Finish all four to continue, or skip below.</small><div class="spirit-checks">'+writingItems.map(([id,label])=>'<button type="button" class="spirit-check '+(writing.checks.includes(id)?'is-checked':'')+'" data-writing-check="'+id+'" aria-pressed="'+writing.checks.includes(id)+'"><span class="spirit-checkmark">'+(writing.checks.includes(id)?'✓':'□')+'</span><span>'+label+'</span></button>').join('')+'</div><span class="spirit-progress">'+writing.checks.length+' OF 4 COMPLETE</span><button type="button" class="spirit-back checklist-skip" id="writingSkip">SKIP CHECKLIST</button><label class="help-dismiss"><input type="checkbox" id="writingNever"> Don&#39;t show this checklist again</label></section>';
  wireChecklistNavigation('writing',writingHideKey,openWriting,()=>{writingSkip=true;writingShowChecklist=false;openWriting();});
  message.querySelectorAll('[data-writing-check]').forEach(b=>b.onclick=()=>{const id=b.dataset.writingCheck;writing.checks=writing.checks.includes(id)?writing.checks.filter(x=>x!==id):[...writing.checks,id];writingSave();openWriting();});
 }else{
  message.innerHTML='<section class="spirit-panel"><span class="spirit-step">STEP 2 OF 2</span><strong class="spirit-heading">DID THE GHOST WRITE IN THE BOOK?</strong><small>Only actual writing in the book confirms Ghost Writing evidence.</small><div class="spirit-answers"><button type="button" id="writingYes" class="'+(writing.answer==='yes'?'selected':'')+'">YES</button><button type="button" id="writingNo" class="'+(writing.answer==='no'?'selected':'')+'">NO</button></div><p class="spirit-result">'+(writing.answer==='yes'?'GHOST WRITING CONFIRMED.':writing.answer==='no'?'No writing observed. Ghost Writing is NOT ruled out. Leave the book in the activity area and check again.':'Choose what you observed.')+'</p><button type="button" class="spirit-back" id="writingBack">BACK TO CHECKLIST</button></section>';
  document.getElementById('writingYes').onclick=()=>{writing.answer='yes';writingSave();writingSync();openWriting();};
  document.getElementById('writingNo').onclick=()=>{writing.answer='no';writingSave();writingSync();openWriting();};
  document.getElementById('writingBack').onclick=()=>{writingSkip=false;writingShowChecklist=true;writing.checks=writing.checks.filter(x=>x!=='wait');writingSave();openWriting();};
 }
}
writingSync();


 // ===== EQUIPMENT: SALT & INTERACTION =====
const saltKey='ghost-intel-salt-v1';
const saltUvKey='ghost-intel-salt-uv-v1';
let saltHistory=[];
try{const saved=JSON.parse(localStorage.getItem(saltKey)||'[]');if(Array.isArray(saved))saltHistory=saved.filter(x=>x&&typeof x.salt==='string');}catch(e){}
let saltStage='salt',saltCurrent='';
function saltSave(){try{localStorage.setItem(saltKey,JSON.stringify(saltHistory));}catch(e){}}
function saltSync(){const tile=document.querySelector('[data-id="salt"]');if(tile){tile.classList.toggle('observation-recorded',saltHistory.length>0);tile.setAttribute('aria-label','Salt and Interaction'+(saltHistory.length?' — '+saltHistory.length+' observations saved':''));}}
function saltRecord(salt,uv){
 const observation={id:'salt-'+Date.now()+'-'+saltHistory.length,time:new Date().toISOString(),salt,uv};
 saltHistory.push(observation);saltSave();
 // Verified ghost UV footprints after stepping in salt count as UV evidence; they do not affect Obake fingerprint-failure counts.
 try{localStorage.setItem(saltUvKey,JSON.stringify(saltHistory.filter(x=>x.uv!=='not checked')));}catch(e){}
 saltStage='result';saltSync();uvSync();openSalt();
}
function openSalt(){
 title.textContent='Salt & Interaction';actions.hidden=true;drawer.hidden=false;message.className='';
 if(saltStage==='result'){
  const last=saltHistory[saltHistory.length-1];if(!last){saltStage='salt';openSalt();return;}
  const saltText=last.salt==='yes'?'Yes':last.salt==='no'?'No':'Not sure';
  const uvText=last.uv==='found'?'Found':last.uv==='not seen'?'Not seen':last.uv==='unsure'?'Not sure':'Not checked';
  const reason=last.salt==='yes'?'A confirmed ghost salt step is strong evidence against Wraith.':last.salt==='no'?'No salt interaction observed; no ghost can be excluded.':'Salt interaction uncertain; no ghost can be excluded.';
  message.innerHTML='<section class="salt-panel"><div class="salt-captured"><strong class="salt-captured-title">✓ &nbsp;OBSERVATION CAPTURED</strong><div class="salt-fact"><span>Salt interaction</span><b>'+saltText+'</b></div><div class="salt-fact"><span>UV footprints</span><b>'+uvText+'</b></div><div class="salt-rule"></div><div class="salt-confirm">✓ &nbsp;Added to observation history</div>'+(last.uv!=='not checked'?'<div class="salt-confirm">✓ &nbsp;UV observations synchronized</div>':'')+'<p>'+reason+'</p><small>Obake fingerprint counter unchanged. Salt footprints do not qualify for that counter.</small></div><button type="button" class="salt-again" id="saltAgain">RECORD ANOTHER</button><button type="button" class="spirit-back" id="saltDone">BACK TO DASHBOARD</button></section>';
  document.getElementById('saltAgain').onclick=()=>{saltStage='salt';openSalt();};
  document.getElementById('saltDone').onclick=()=>{saltStage='salt';hide();};
 }else{
  const second=saltStage==='uv';
  message.innerHTML='<section class="spirit-panel salt-questions"><span class="spirit-step">OBSERVATION '+(second?'2':'1')+'</span><strong class="spirit-heading">'+(second?'DID YOU SEE UV FOOTPRINTS?':'DID THE GHOST STEP IN SALT?')+'</strong><small>'+(second?'Check the disturbed salt area promptly with UV.':'Look for a disturbed salt pile.')+'</small><div class="spirit-answers"><button type="button" id="saltYes">YES</button><button type="button" id="saltNo">NO</button></div><button type="button" class="spirit-back" id="saltUnsure">NOT SURE</button>'+(second?'<button type="button" class="spirit-back" id="saltBack">BACK</button>':'')+'</section>';
  const choose=value=>{if(second)saltRecord(saltCurrent,value==='yes'?'found':value==='no'?'not seen':'unsure');else if(value==='yes'){saltCurrent='yes';saltStage='uv';openSalt();}else saltRecord(value,'not checked');};
  document.getElementById('saltYes').onclick=()=>choose('yes');
  document.getElementById('saltNo').onclick=()=>choose('no');
  document.getElementById('saltUnsure').onclick=()=>choose('unsure');
  if(second)document.getElementById('saltBack').onclick=()=>{saltStage='salt';openSalt();};
 }
}
saltSync();

uvSync();

update();
document.querySelectorAll('.equipment').forEach(button=>button.addEventListener('click',()=>{
button.classList.add('pressed');setTimeout(()=>button.classList.remove('pressed'),150);
if(button.dataset.id==='emf')openEmf();else if(button.dataset.id==='temperature')openTemp();else if(button.dataset.id==='uv')openUv();else if(button.dataset.id==='spirit')openSpirit();else if(button.dataset.id==='orbs')openOrbs();else if(button.dataset.id==='dots')openDots();else if(button.dataset.id==='writing')openWriting();else if(button.dataset.id==='salt'){saltStage='salt';openSalt();}else show(names[button.dataset.id],'This is the visual dashboard prototype. The equipment control is pressable; its observation questions will be connected after we approve the design.');
}));

 // ===== UNIFIED INVESTIGATION: NOTES + GHOST LIST (PHASE ONE) =====
const ghostEvidence=Object.fromEntries("Aswang:writing freezing dots;Banshee:uv orbs dots;Dayan:emf orbs spirit;Deildegast:emf writing dots;Demon:uv writing freezing;Deogen:spirit writing dots;Gallu:emf uv spirit;Goryo:emf uv dots;Hantu:uv orbs freezing;Jinn:emf uv freezing;Kormos:orbs spirit uv;Mare:spirit orbs writing;Moroi:spirit writing freezing;Myling:emf uv writing;Obake:emf uv orbs;Obambo:uv writing dots;Oni:emf freezing dots;Onryo:spirit orbs freezing;Phantom:spirit uv dots;Poltergeist:spirit uv writing;Raiju:emf orbs dots;Revenant:orbs writing freezing;Shade:emf writing freezing;Spirit:emf spirit writing;Thaye:orbs writing dots;The Mimic:spirit uv freezing;The Twins:emf spirit freezing;Wraith:emf spirit dots;Yokai:spirit orbs dots;Yurei:orbs freezing dots".split(";").map(x=>{const i=x.indexOf(":");return [x.slice(0,i),x.slice(i+1).split(" ")];}));
const ghostRoster=Object.keys(ghostEvidence);
function confirmedEvidence(){const e=new Set();if(entries.some(x=>x.level===5))e.add('emf');if(temp.confirmed)e.add('freezing');if(uvEntries.some(x=>x.result==='yes')||saltHistory.some(x=>x.salt==='yes'&&x.uv==='found'))e.add('uv');if(spirit.answer==='yes')e.add('spirit');if(orbs.answer==='yes')e.add('orbs');if(dots.answer==='yes')e.add('dots');if(writing.answer==='yes')e.add('writing');return e;}

function investigationSnapshot(){
 const notes=[];
 const add=(source,label,reason,important,time,links)=>notes.push({source,label,reason,important,time:time||'',links:links||[source]});
 entries.forEach((e,i)=>add('EMF','EMF Level '+e.level,e.level===5?'EMF Level 5 confirmed as journal evidence.':'Lower EMF readings are not EMF 5 evidence.',e.level===5,e.time||'', ['EMF']));
 if(temp.confirmed)add('Temperature','Freezing temperatures confirmed','Freezing temperatures count as journal evidence.',true,'',['Temperature']);
 uvEntries.forEach(e=>add('UV',e.result==='yes'?'UV evidence found':e.result==='no'?'No UV found after interaction':'UV observation uncertain',e.result==='yes'?'UV journal evidence confirmed.':e.valid?'A prompt check on a UV-capable surface found no UV. This does not definitively exclude UV.':'This observation does not qualify for the Obake fingerprint-failure counter.',e.result==='yes',e.time,['UV']));
 [['Spirit Box',spirit],['Ghost Orbs',orbs],['D.O.T.S.',dots],['Ghost Writing',writing]].forEach(([name,state])=>{if(state.answer)add(name,state.answer==='yes'?name+' confirmed':name+' not observed',state.answer==='yes'?'Confirmed journal evidence.':'Not observed is not proof of absence.',state.answer==='yes','',[name]);});
 saltHistory.filter(e=>e.salt==='yes'&&e.uv==='found').forEach(e=>add('UV','UV footprints confirmed','Verified ghost UV footprints after a salt step count as UV journal evidence.',true,e.time,['Salt','UV']));
 saltHistory.forEach(e=>add('Salt','Salt: '+(e.salt==='yes'?'stepped in':e.salt==='no'?'not disturbed':'uncertain')+(e.uv==='found'?' · UV footprints found':e.uv==='not seen'?' · UV footprints not seen':''),e.salt==='yes'?'Confirmed salt step contradicts Wraith behavior. Verified ghost UV footprints confirm UV evidence.':'No definitive ghost exclusion from this salt observation.',e.salt==='yes',e.time,['Salt','UV']));
 notes.sort((a,b)=>a.time&&b.time?a.time.localeCompare(b.time):a.time?-1:b.time?1:0);
 return notes;
}
function safeText(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function ghostAssessment(name){const seen=confirmedEvidence();const allowed=new Set(ghostEvidence[name]);if(name==='The Mimic')allowed.add('orbs');const bad=[...seen].filter(e=>!allowed.has(e));const saltBad=name==='Wraith'&&saltHistory.some(e=>e.salt==='yes');if(bad.length||saltBad)return {status:'red',label:'INCOMPATIBLE',reason:'Conflicting evidence: '+bad.join(', ')+(saltBad?'; salt step contradicts Wraith.':''),source:'Evidence and observations'};return {status:'yellow',label:'POSSIBLE',reason:'Compatible with '+seen.size+' confirmed evidence types. Remaining clues: '+[...allowed].filter(e=>!seen.has(e)).join(', ')+'. Not a confirmed identity.',source:'Evidence chart'};}

function openGhostList(){
 title.textContent='Ghost Analysis';actions.hidden=true;drawer.hidden=false;message.className='';
 const statuses=ghostRoster.map(name=>({name,...ghostAssessment(name)}));
 const possible=statuses.filter(g=>g.status!=='red'), eliminated=statuses.filter(g=>g.status==='red');
 const labels={emf:'EMF Level 5',freezing:'Freezing Temperatures',uv:'UV Evidence',spirit:'Spirit Box',orbs:'Ghost Orbs',dots:'D.O.T.S.',writing:'Ghost Writing'};
 const seen=confirmedEvidence();
 const notes=investigationSnapshot();
 const behaviorLabels={Obake:'Watch for a brief appearance change during a hunt.',Wraith:'Test salt: a confirmed step rules out Wraith.',Phantom:'Photograph a visible ghost and watch whether it disappears.',Banshee:'Listen for the unique parabolic microphone scream.',Deogen:'Check whether it slows dramatically when close during a hunt.',Revenant:'Compare its speed before and after spotting a player.',Hantu:'Compare hunt speed in cold versus warm rooms.',Raiju:'Compare speed near switched-on electronics.',Poltergeist:'Watch for multiple objects thrown at once.','The Mimic':'Look for extra Ghost Orbs and changing copied behaviors.',Goryo:'Check D.O.T.S. through a video camera from outside the room.'};
 function why(g){
  const allowed=new Set(ghostEvidence[g.name]);if(g.name==='The Mimic')allowed.add('orbs');
  const reasons=[...seen].filter(e=>!allowed.has(e)).map(e=>labels[e]+' is confirmed, but '+g.name+' cannot have it.');
  if(g.name==='Wraith'&&saltHistory.some(x=>x.salt==='yes'))reasons.push('The ghost stepped in salt; Wraith cannot disturb salt.');
  return reasons;
 }
 function row(label,done,detail){return '<div class="case-check"><span class="case-check-icon '+(done?'checked':'')+'">'+(done?'✓':'○')+'</span><span><strong>'+safeText(label)+'</strong><small>'+safeText(detail)+'</small></span></div>';}
 function card(g){
  const reasons=why(g), required=ghostEvidence[g.name];
  const checklist=required.map(e=>row(labels[e],seen.has(e),seen.has(e)?'Confirmed in your investigation':'Not confirmed yet — check this evidence')).join('');
  const special=g.name==='The Mimic'?row('Extra Ghost Orbs',seen.has('orbs'),seen.has('orbs')?'Observed — Mimic can show extra orbs':'Special Mimic clue; not standard evidence'):'';
  const behavior=behaviorLabels[g.name]||'Compare ghost-specific behavior after collecting more observations.';
  const next=required.filter(e=>!seen.has(e)).map(e=>labels[e]);
  const nextText=g.status==='red'?'Already ruled out — review the contradiction below.':next.length?'Check next: '+next.join(' / ')+'.':'All standard evidence recorded. Compare behavior to verify.';
  return '<details class="case-accordion '+(g.status==='red'?'case-rejected':'')+'"><summary><span class="case-symbol">'+(g.status==='red'?'×':'✓')+'</span><span class="case-copy"><strong>'+safeText(g.name)+'</strong><small>'+(g.status==='red'?safeText(reasons[0]||'Conflicting observation'):'Still possible · '+required.filter(e=>seen.has(e)).length+'/3 evidence confirmed')+'</small></span><span class="case-arrow">⌄</span></summary><div class="case-accordion-body">'+(reasons.length?'<div class="case-verdict"><strong>WHY RULED OUT</strong><p>'+reasons.map(safeText).join('<br>')+'</p></div>':'<div class="case-verdict case-possible"><strong>STILL POSSIBLE</strong><p>No confirmed contradiction so far.</p></div>')+'<div class="case-subhead">Evidence checklist</div>'+checklist+special+'<div class="case-next"><strong>WHAT TO CHECK NEXT</strong><p>'+safeText(nextText)+'</p><p>'+safeText(behavior)+'</p></div><small class="case-disclaimer">Checkmarks reflect recorded evidence. Missing observations do not automatically eliminate a ghost.</small></div></details>';
 }
 message.innerHTML='<section class="case-analysis"><div class="case-counts"><div><small>STILL POSSIBLE</small><strong class="case-green">'+possible.length+' ghosts</strong></div><div><small>RULED OUT</small><strong>'+eliminated.length+' ghosts</strong></div></div><div class="case-section-title">Remaining suspects</div><div class="case-list">'+(possible.length?possible.map(card).join(''):'<p class="case-empty">No ghost matches every confirmed observation. Review your entries.</p>')+'</div><details class="case-group"><summary>Ruled out ('+eliminated.length+') <span>⌄</span></summary><div class="case-list">'+eliminated.map(card).join('')+'</div></details></section>';
}
const behaviorBank=[
 ['phantom-photo','When you took a picture of the ghost while you could see it, did it disappear right away?',['Phantom'],'A disappearing apparition after a successful photo is a distinctive Phantom clue.','strong'],
 ['phantom-flash','During a hunt, was the ghost invisible for most of the time between flashes?',['Phantom'],'Phantoms tend to be less visible during hunts.','suggestive'],
 ['polter-pile','Did the ghost throw several objects at the same time?',['Poltergeist'],'A simultaneous multi-object throw is a distinctive Poltergeist clue.','strong'],
 ['polter-throws','While hunting, did the ghost keep throwing things around?',['Poltergeist'],'Frequent throws support Poltergeist but are not unique.','suggestive'],
 ['mimic-shift','Did the ghost act like two very different types of ghost in separate hunts?',['The Mimic'],'A Mimic can copy different ghost behaviors, but apparent changes alone do not confirm it.','suggestive'],
 ['mimic-model','While the ghost was chasing you, did it briefly look like a completely different person?',['Obake','The Mimic'],'A model shift is associated with Obake behavior, which a Mimic may copy.','strong'],
 ['gallu-protect','After you used incense, a crucifix, or salt, did the ghost start moving faster?',['Gallu'],'Potential Gallu behavior; compare controlled hunts before drawing conclusions.','suggestive'],
 ['kormos-motion','Did the ghost seem to notice players more when they were walking or running?',['Kormos'],'Potential movement-related behavior; requires controlled observation.','suggestive'],
 ['banshee-target','Did the ghost keep chasing the same player even when other players were closer?',['Banshee'],'Banshee may favor a single target; line of sight and player position matter.','suggestive'],
 ['banshee-scream','Did you hear a strange, high-pitched scream through the parabolic microphone?',['Banshee'],'The special scream is a strong Banshee clue.','strong'],
 ['deogen-close','When the ghost got close to someone during a hunt, did it slow down a lot?',['Deogen'],'Deogen slows dramatically near its target.','strong'],
 ['revenant-speed','Was the ghost slow until it found someone, then suddenly very fast?',['Revenant'],'Revenant speed is strongly affected by detecting a player.','strong'],
 ['hantu-cold','Was the ghost faster in cold rooms and slower in warmer rooms?',['Hantu'],'Hantu speed depends on temperature.','strong'],
 ['raiju-electric','Did the ghost move faster near electronics that were turned on?',['Raiju'],'Raiju can accelerate around active electronic equipment.','strong'],
 ['myling-audio','Could you only hear the ghost’s footsteps once it was very close?',['Myling'],'Myling footsteps have a shorter audible range.','suggestive'],
 ['oni-visible','During hunts, could you see the ghost almost the whole time instead of it disappearing between flashes?',['Oni'],'Oni tends to blink less frequently during hunts.','suggestive'],
 ['oni-airball','Did you see a floating ball of mist move toward a player and vanish?',['Oni'],'Oni cannot perform the airball ghost event; this would argue against Oni if verified.','strong'],
 ['shade-hunt','Did a normal hunt start while someone was standing in the same room as the ghost?',['Shade'],'Under standard conditions, this observation argues against Shade.','strong'],
 ['spirit-incense','After using incense near the ghost, did it wait a long time before hunting again?',['Spirit'],'Spirit has a longer incense hunt-prevention period.','strong'],
 ['demon-cooldown','Did the ghost start another hunt very soon after the last one ended?',['Demon'],'Demon can hunt more frequently than most ghosts.','suggestive'],
 ['onryo-flames','Did the ghost start hunting right after blowing out a third flame?',['Onryo'],'The flame-triggered hunt is an Onryo clue; proximity and other conditions matter.','strong'],
 ['mare-light','Did the ghost turn off a light right after someone switched it on?',['Mare'],'Mare has a light-switch interaction ability.','suggestive'],
 ['twins-pair','Did the ghost touch or move things in two different places almost at the same time?',['The Twins'],'Twins can produce unusually paired interactions.','suggestive'],
 ['yurei-door','Did a door shut all the way by itself when there was no hunt or ghost event?',['Yurei'],'Yurei has a distinctive door interaction ability.','suggestive'],
 ['thaye-aging','As time passed, did the ghost seem to get slower and hunt less often?',['Thaye'],'Thaye can age and become less dangerous.','suggestive'],
 ['yokai-voice','Did the ghost start hunting soon after someone talked near it?',['Yokai'],'Yokai can hunt at higher sanity when players speak nearby.','suggestive'],
 ['obake-shift','While the ghost was chasing you, did it briefly look like a completely different person?',['Obake','The Mimic'],'A hunt-model change supports Obake or a Mimic copying it.','strong'],
 ['goryo-stay','Did the ghost stay near the same room instead of wandering around?',['Goryo'],'Goryo tends to roam less, but room behavior alone is not definitive.','suggestive'],
 ['jinn-breaker','With the power on, did the ghost suddenly speed up when it saw someone far away?',['Jinn'],'Jinn has a conditional speed ability.','suggestive'],
 ['moroi-curse','After hearing the ghost respond, did someone’s sanity start dropping unusually fast?',['Moroi'],'Moroi can curse players, but sanity changes have other causes.','suggestive']
];
let behaviorAnswers={};try{const v=JSON.parse(localStorage.getItem('ghost-intel-behavior-v1')||'{}');if(v&&typeof v==='object'&&!Array.isArray(v))behaviorAnswers=v;}catch{}
function behaviorCandidates(){return ghostRoster.filter(name=>ghostAssessment(name).status!=='red');}
function behaviorRanked(){const remaining=behaviorCandidates();return behaviorBank.filter(q=>q[2].some(name=>remaining.includes(name))&&!behaviorAnswers[q[0]]).sort((a,b)=>{const ac=a[2].filter(x=>remaining.includes(x)).length,bc=b[2].filter(x=>remaining.includes(x)).length;return (a[4]==='strong'?0:1)-(b[4]==='strong'?0:1)||ac-bc;});}
function openBehaviorCoach(){
 title.textContent="I'm Stuck — Behavior";actions.hidden=true;drawer.hidden=false;message.className='behavior-coach';
 const remaining=behaviorCandidates(),answered=Object.entries(behaviorAnswers).filter(([id,v])=>behaviorBank.some(q=>q[0]===id)&&v!=='skip');
 const ranked=behaviorRanked(),next=ranked[0];
 const hints=answered.filter(([id,v])=>v==='yes').map(([id])=>behaviorBank.find(q=>q[0]===id)).filter(q=>q&&q[2].some(g=>remaining.includes(g)));
 const candidateSummary=remaining.length+' candidates remain from confirmed equipment evidence.';
 message.innerHTML='<section class="intel-panel"><p class="intel-hint">'+safeText(candidateSummary)+' Behavioral observations are clues, not automatic exclusions.</p><div class="intel-detail"><strong>BEHAVIOR QUESTION '+(answered.length+1)+'</strong>'+(next?'<p class="behavior-question">'+safeText(next[1])+'</p><div class="behavior-buttons"><button type="button" data-behavior="yes">YES</button><button type="button" data-behavior="no">NO</button><button type="button" data-behavior="skip">NOT SURE</button></div><small>Relevant to: '+safeText(next[2].filter(g=>remaining.includes(g)).join(', '))+'</small>':'<p>No more relevant unanswered behavior questions. Revisit evidence or reset your behavioral answers.</p>')+'</div><div class="intel-detail"><strong>OBSERVATIONS</strong><p>'+safeText(answered.length+' answered · '+hints.length+' positive clue(s)')+'</p>'+(hints.length?hints.map(q=>'<p><b>'+safeText(q[2].filter(g=>remaining.includes(g)).join(', '))+':</b> '+safeText(q[3])+'</p>').join(''):'<p>No positive behavioral clues recorded yet.</p>')+'</div><button type="button" class="intel-stuck" id="behaviorReset">RESET BEHAVIOR ANSWERS</button><small>Answers are stored on this device. They do not alter evidence or turn ghost boxes red.</small></section>';
 message.querySelectorAll('[data-behavior]').forEach(btn=>btn.onclick=()=>{behaviorAnswers[next[0]]=btn.dataset.behavior;try{localStorage.setItem('ghost-intel-behavior-v1',JSON.stringify(behaviorAnswers));}catch{}openBehaviorCoach();});
 document.getElementById('behaviorReset').onclick=()=>{if(!confirm('Clear all behavioral answers for this device?'))return;behaviorAnswers={};try{localStorage.removeItem('ghost-intel-behavior-v1');}catch{}openBehaviorCoach();};
}
function openNotes(all=false,expanded=-1){
 title.textContent='Investigation Notes';actions.hidden=true;drawer.hidden=false;message.className='';
 const notes=investigationSnapshot(),shown=all?notes:notes.filter(n=>n.important);
 message.innerHTML='<section class="intel-panel"><div class="intel-tabs"><button type="button" id="intelImportant" '+(!all?'class="active"':'')+'>IMPORTANT</button><button type="button" id="intelAll" '+(all?'class="active"':'')+'>ALL HISTORY</button></div><small class="intel-hint">'+shown.length+' observation'+(shown.length===1?'':'s')+' shown. Existing equipment history is read without changing it.</small><div class="intel-history">'+(shown.length?shown.map((n,i)=>'<button type="button" class="intel-note" data-note="'+i+'"><strong>'+safeText(n.label)+'</strong><small>'+safeText(n.source)+(n.time?' · '+safeText(new Date(n.time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})):'')+'</small><span class="intel-note-reason" '+(expanded===i?'':'hidden')+'>'+safeText(n.reason)+'<br>Linked: '+safeText(n.links.join(', '))+'</span></button>').join(''):'<p>No observations in this view yet.</p>')+'</div><button type="button" id="intelStuck" class="intel-stuck">I&#39;M STUCK</button><div id="intelAdvice" class="intel-detail" hidden></div></section>';
 document.getElementById('intelImportant').onclick=()=>openNotes(false);
 document.getElementById('intelAll').onclick=()=>openNotes(true);
 message.querySelectorAll('[data-note]').forEach(b=>b.onclick=()=>{const d=b.querySelector('.intel-note-reason');d.hidden=!d.hidden;message.querySelectorAll('.intel-note-reason').forEach(other=>{if(other!==d)other.hidden=true;});});
 document.getElementById('intelStuck').onclick=()=>openBehaviorCoach();

}
document.querySelectorAll('.nav-key').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.page==='ghosts')openGhostList();else if(b.dataset.page==='log')openNotes();else if(b.dataset.page!=='home')show(b.textContent.trim(),'Settings will be available in a future update.');}));
document.getElementById('notesBtn').addEventListener('click',()=>openNotes());
function openMenu(){
 title.textContent='Menu';actions.hidden=true;drawer.hidden=false;
 message.innerHTML='<div class="menu-simple"><button type="button" class="menu-item" id="menuClear"><span class="menu-item-icon">↻</span><span><strong>New Investigation</strong><small>Start a fresh ghost hunt</small></span><b>›</b></button><a class="menu-item" href="investigation-original.html"><span class="menu-item-icon">▤</span><span><strong>Original Prototype</strong><small>Open the previous version</small></span><b>›</b></a><button type="button" class="menu-item" id="menuBack"><span class="menu-item-icon">⌂</span><span><strong>Device Dashboard</strong><small>Return to equipment</small></span><b>›</b></button><div class="menu-confirm" id="menuConfirm" hidden><strong>Start a new investigation?</strong><span>Your current evidence and observations will be cleared. This cannot be undone.</span><span class="menu-confirm-actions"><button type="button" id="menuClearYes">START NEW</button><button type="button" id="menuClearNo">CANCEL</button></span></div></div>';
 document.getElementById('menuBack').onclick=hide;
 const confirm=document.getElementById('menuConfirm');
 document.getElementById('menuClear').onclick=()=>{confirm.hidden=false;document.getElementById('menuClearYes').focus();};
 document.getElementById('menuClearNo').onclick=()=>{confirm.hidden=true;document.getElementById('menuClear').focus();};
 document.getElementById('menuClearYes').onclick=()=>{
  entries=[];temp={phase:'placement',started:0,confirmed:false,checks:[]};uvEntries=[];spirit={checks:[],answer:''};orbs={checks:[],answer:''};spiritSkip=false;spiritShowChecklist=false;orbsSkip=false;orbsShowChecklist=false;dots={checks:[],answer:''};dotsSkip=false;dotsShowChecklist=false;writing={checks:[],answer:''};writingSkip=false;writingShowChecklist=false;saltHistory=[];saltStage='salt';
  try{[...Array(localStorage.length)].map((_,i)=>localStorage.key(i)).filter(k=>k&&k.startsWith('ghost-intel-')).forEach(k=>localStorage.removeItem(k));}catch(e){}
  update();tempTick();uvSync();spiritSync();orbsSync();dotsSync();writingSync();saltSync();confirm.hidden=true;
  message.innerHTML='<span class="menu-success">New investigation ready.</span><button type="button" class="menu-clear-done" id="menuDone">RETURN TO DASHBOARD</button>';
  document.getElementById('menuDone').onclick=hide;
 };
 document.getElementById('closeDrawer').focus();
}
document.getElementById('menuBtn').addEventListener('click',openMenu);
document.getElementById('closeDrawer').addEventListener('click',hide);
document.getElementById('dismissDrawer').addEventListener('click',hide);
drawer.addEventListener('click',e=>{if(e.target===drawer)hide();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
})();