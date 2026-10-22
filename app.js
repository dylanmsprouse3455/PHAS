(() => {
'use strict';
const names={emf:'EMF Activity',temperature:'Temperature',uv:'UV / Footprints',orbs:'Ghost Orbs',spirit:'Spirit Box',dots:'D.O.T.S. Projector',writing:'Ghost Writing',salt:'Salt / Interaction'};
const drawer=document.getElementById('drawer'),title=document.getElementById('drawerTitle'),message=document.getElementById('drawerMessage'),actions=drawer.querySelector('.drawer-actions');
function show(t,b){title.textContent=t;message.textContent=b;actions.hidden=false;drawer.hidden=false;document.getElementById('closeDrawer').focus();}
function hide(){drawer.hidden=true;}
const key='ghost-intel-emf-v1';let entries=[];
try{const x=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(x))entries=x.filter(v=>[1,2,3,4,5].includes(v.level)&&typeof v.eligible==='boolean');}catch(e){}
const save=()=>{try{localStorage.setItem(key,JSON.stringify(entries));}catch(e){}};
let lastTap=0;let active=null;let ticker=null;
try{const a=JSON.parse(localStorage.getItem('ghost-intel-emf-active')||'null');if(a&&[1,2,3,4,5].includes(a.level)&&Number.isFinite(a.start)&&a.start<=Date.now())active=a;}catch(e){}
function clock(){if(!active)return;const sec=Math.max(0,Math.floor((Date.now()-active.start)/1000));const t=document.getElementById('emfTimer');if(t)t.textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');}
function syncActive(){const running=!!active;document.querySelectorAll('.emf-level').forEach(b=>{b.disabled=running;b.classList.toggle('emf-running',running&&Number(b.dataset.level)===active?.level);});const box=document.getElementById('emfRunning');if(box)box.hidden=!running;const undo=document.getElementById('emfUndo');if(undo)undo.disabled=running||!entries.length;clock();if(ticker)clearInterval(ticker);ticker=running?setInterval(clock,250):null;}
function stopReading(){if(!active)return;const a=active;active=null;try{localStorage.removeItem('ghost-intel-emf-active');}catch(e){};entries.push({level:a.level,eligible:a.level===2||a.level===3,time:new Date(a.start).toISOString(),durationMs:Math.max(0,Date.now()-a.start)});save();update();syncActive();const f=document.getElementById('emfFeedback');if(f)f.textContent='EMF '+a.level+' saved: '+(entries[entries.length-1].durationMs/1000).toFixed(1)+' seconds. Ready for the next interaction.';}
function update(){
const confirmed=entries.some(x=>x.level===5);const tile=document.querySelector('[data-id="emf"]');if(tile){tile.classList.toggle('evidence-confirmed',confirmed);tile.setAttribute('aria-label',confirmed?'EMF Activity — EMF Level 5 confirmed':'EMF Activity');}
const five=document.querySelector('.emf-5');if(five){five.classList.toggle('emf-five-confirmed',confirmed);five.setAttribute('aria-pressed',String(confirmed));}const check=document.getElementById('emfConfirmed');if(check){check.hidden=!confirmed;}
const el=document.getElementById('emfStatus'),undo=document.getElementById('emfUndo');
if(!el)return;
const count=entries.filter(x=>x.eligible).length;
el.textContent='Eligible interactions: '+count+'/7'+(count>=7?' — EMF 5 remains possible.':'');
undo.disabled=!!active||entries.length===0;
const clear=document.getElementById('emfClear');if(clear)clear.disabled=!active&&!entries.length;
}
function log(level){
const now=Date.now();if(active||now-lastTap<650)return;lastTap=now;
if(level===5&&entries.some(x=>x.level===5)){document.getElementById('emfFeedback').textContent='EMF Level 5 is already recorded. Undo to correct it.';return;}
active={level,start:now};try{localStorage.setItem('ghost-intel-emf-active',JSON.stringify(active));}catch(e){}
document.getElementById('emfFeedback').textContent='Reading in progress. Wait until the EMF stops, then press STOP READING.';
syncActive();
}
function openEmf(){
title.textContent='EMF Activity';actions.hidden=true;
message.innerHTML='<span class="emf-prompt">What did you observe?</span><span class="emf-levels" role="group" aria-label="Observed EMF level">'+[1,2,3,4,5].map(n=>'<button type="button" class="emf-level emf-'+n+'" data-level="'+n+'" aria-label="Record EMF level '+n+'"><span class="emf-dot"></span><strong>'+n+'</strong></button>').join('')+'</span><span id="emfConfirmed" class="emf-confirmed" hidden>☑ EMF LEVEL 5 REACHED</span><span class="emf-warning"><strong>One reading at a time.</strong> Tap the observed level to start timing. Do not select another number while EMF is active. When the reading ends in-game, press the large STOP button.</span><span id="emfRunning" class="emf-running-panel" hidden><span class="emf-running-label">EMF READING ACTIVE — DO NOT TAP OTHER LEVELS</span><span class="emf-timer" id="emfTimer">00:00</span><button type="button" class="emf-stop" id="emfStop">■ STOP READING</button></span><span class="emf-status" id="emfStatus"></span><span class="emf-feedback" id="emfFeedback" role="status" aria-live="polite"></span><button type="button" class="emf-undo" id="emfUndo">Undo last reading</button><button type="button" class="emf-clear" id="emfClear">CLEAR INTERACTIONS</button><span class="emf-clear-confirm" id="emfClearConfirm" hidden><strong>Clear all EMF readings and stop the active timer?</strong><span>This resets only EMF. Other equipment will not be affected.</span><span class="emf-clear-actions"><button type="button" id="emfClearYes">YES, CLEAR ALL</button><button type="button" id="emfClearNo">CANCEL</button></span></span>';
drawer.hidden=false;update();syncActive();
message.querySelectorAll('[data-level]').forEach(b=>b.addEventListener('click',()=>log(Number(b.dataset.level))));
document.getElementById('emfStop').addEventListener('click',stopReading);
const clearConfirm=document.getElementById('emfClearConfirm');
document.getElementById('emfClear').addEventListener('click',()=>{clearConfirm.hidden=false;requestAnimationFrame(()=>clearConfirm.scrollIntoView({behavior:'smooth',block:'end'}));});
document.getElementById('emfClearNo').addEventListener('click',()=>{clearConfirm.hidden=true;});
document.getElementById('emfClearYes').addEventListener('click',()=>{entries=[];active=null;if(ticker){clearInterval(ticker);ticker=null;}try{localStorage.removeItem(key);localStorage.removeItem('ghost-intel-emf-active');}catch(e){}clearConfirm.hidden=true;update();syncActive();document.getElementById('emfFeedback').textContent='All EMF interactions cleared. Ready for a new investigation.';});
document.getElementById('emfUndo').addEventListener('click',()=>{if(active)return;entries.pop();save();update();document.getElementById('emfFeedback').textContent='Last reading removed.';});
document.getElementById('closeDrawer').focus();
}
update();
document.querySelectorAll('.equipment').forEach(button=>button.addEventListener('click',()=>{
button.classList.add('pressed');setTimeout(()=>button.classList.remove('pressed'),150);
if(button.dataset.id==='emf')openEmf();else show(names[button.dataset.id],'This is the visual dashboard prototype. The equipment control is pressable; its observation questions will be connected after we approve the design.');
}));
document.querySelectorAll('.nav-key').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.page!=='home')show(b.textContent.trim(),'This navigation control is ready for its future screen. The original investigation prototype remains available unchanged.');}));
document.getElementById('notesBtn').addEventListener('click',()=>show('Notes','The original Notes and observation log are preserved in the existing investigation prototype. We will connect them to this device design later.'));
document.getElementById('menuBtn').addEventListener('click',()=>show('Ghost Intel Menu','Visual design prototype. Use the link below to open the preserved original investigation interface.'));
document.getElementById('closeDrawer').addEventListener('click',hide);
document.getElementById('dismissDrawer').addEventListener('click',hide);
drawer.addEventListener('click',e=>{if(e.target===drawer)hide();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
})();