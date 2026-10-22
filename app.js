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

update();
document.querySelectorAll('.equipment').forEach(button=>button.addEventListener('click',()=>{
button.classList.add('pressed');setTimeout(()=>button.classList.remove('pressed'),150);
if(button.dataset.id==='emf')openEmf();else if(button.dataset.id==='temperature')openTemp();else show(names[button.dataset.id],'This is the visual dashboard prototype. The equipment control is pressable; its observation questions will be connected after we approve the design.');
}));
document.querySelectorAll('.nav-key').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.page!=='home')show(b.textContent.trim(),'This navigation control is ready for its future screen. The original investigation prototype remains available unchanged.');}));
document.getElementById('notesBtn').addEventListener('click',()=>show('Notes','The original Notes and observation log are preserved in the existing investigation prototype. We will connect them to this device design later.'));
document.getElementById('menuBtn').addEventListener('click',()=>show('Ghost Intel Menu','Visual design prototype. Use the link below to open the preserved original investigation interface.'));
document.getElementById('closeDrawer').addEventListener('click',hide);
document.getElementById('dismissDrawer').addEventListener('click',hide);
drawer.addEventListener('click',e=>{if(e.target===drawer)hide();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
})();