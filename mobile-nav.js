const renderBeforeNavigation=render;
render=function(){
  const section=(location.hash.slice(1)||'home').split('/')[0];
  renderBeforeNavigation();
  const nav=document.querySelector('#nav');
  const selected=section==='home'?'home':['situations','all-situations','moment'].includes(section)?'situations':['browse','identity','create','suggest'].includes(section)?'browse':'';
  nav.hidden=false;
  nav.innerHTML=[['home','My day'],['situations','Situations'],['browse','Egos']].map(([route,label])=>`<a href="#${route}" data-nav="${route}" ${selected===route?'aria-current="page"':''}>${label}</a>`).join('');
  nav.querySelectorAll('[data-nav]').forEach(link=>link.addEventListener('click',event=>{if((link.dataset.nav==='home'||link.dataset.nav==='situations')&&!active()){event.preventDefault();go('browse');}}));
};
render();
