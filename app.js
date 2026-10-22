(() => {
  'use strict';
  const names = {emf:'EMF Activity',temperature:'Temperature',uv:'UV / Footprints',orbs:'Ghost Orbs',spirit:'Spirit Box',dots:'D.O.T.S. Projector',writing:'Ghost Writing',salt:'Salt / Interaction'};
  const drawer=document.getElementById('drawer');
  const title=document.getElementById('drawerTitle');
  const message=document.getElementById('drawerMessage');
  function show(titleText,body){title.textContent=titleText;message.textContent=body;drawer.hidden=false;document.getElementById('closeDrawer').focus();}
  function hide(){drawer.hidden=true;}
  document.querySelectorAll('.equipment').forEach(button=>{
    button.addEventListener('click',()=>{
      const name=names[button.dataset.id];
      button.classList.add('pressed');
      window.setTimeout(()=>button.classList.remove('pressed'),150);
      show(name,'This is the visual dashboard prototype. The equipment control is pressable; its observation questions will be connected after we approve the design.');
    });
  });
  document.querySelectorAll('.nav-key').forEach(button=>button.addEventListener('click',()=>{
    if(button.dataset.page==='home')return;
    show(button.textContent.trim(),'This navigation control is ready for its future screen. The original investigation prototype remains available unchanged.');
  }));
  document.getElementById('notesBtn').addEventListener('click',()=>show('Notes','The original Notes and observation log are preserved in the existing investigation prototype. We will connect them to this device design later.'));
  document.getElementById('menuBtn').addEventListener('click',()=>show('Ghost Intel Menu','Visual design prototype. Use the link below to open the preserved original investigation interface.'));
  document.getElementById('closeDrawer').addEventListener('click',hide);
  document.getElementById('dismissDrawer').addEventListener('click',hide);
  drawer.addEventListener('click',e=>{if(e.target===drawer)hide();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
})();
