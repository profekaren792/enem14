
(() => {
  "use strict";
  const DATA = window.ENEM_DATA;
  const KEY = "enem14_state_v3";
  const defaultState = {done:{}, answers:{}, theme:"light", lastLesson:"w1d1", streakDays:[], route:"home"};
  let state;
  try { state = {...defaultState, ...(JSON.parse(localStorage.getItem(KEY)) || {})}; }
  catch { state = {...defaultState}; }

  const app = document.getElementById("app");
  const icons = {Matemática:"∑",Linguagens:"Aa",Geografia:"◎",Redação:"✎",Química:"⚗",Biologia:"⌁",História:"⌛",Física:"⚡",Filosofia:"◈",Sociologia:"♟",Revisão:"↻",Simulado:"✓"};
  const allDays = DATA.weeks.flatMap(w => w.days.map(d => ({...d, week:w.number})));

  function save(){ localStorage.setItem(KEY, JSON.stringify(state)); document.documentElement.dataset.theme=state.theme; }
  function completed(){ return Object.values(state.done).filter(Boolean).length; }
  function pct(){ return Math.round(completed()/allDays.length*100); }
  function weekPct(w){ const n=w.days.filter(d=>state.done[d.id]).length; return Math.round(n/w.days.length*100); }
  function toast(text){ const t=document.createElement("div");t.className="toast";t.textContent=text;document.body.appendChild(t);setTimeout(()=>t.remove(),1700); }
  function setRoute(route){ state.route=route; save(); render(); window.scrollTo({top:0,behavior:"smooth"}); }
  function findDay(id){ return allDays.find(d=>d.id===id) || allDays[0]; }
  function todayKey(){ return new Date().toISOString().slice(0,10); }
  function streak(){
    const s=new Set(state.streakDays||[]); let n=0,d=new Date();
    while(s.has(d.toISOString().slice(0,10))){ n++; d.setDate(d.getDate()-1); }
    return n;
  }
  function shell(content, active="home"){
    return `<div class="app">
      <header class="topbar"><div class="topbar-inner">
        <div class="brand"><div class="brandmark">14</div><div><h1>ENEM 14</h1><small>Seu plano até a prova</small></div></div>
        <button class="icon-btn" data-action="theme" aria-label="Alternar tema">${state.theme==="dark"?"☀":"☾"}</button>
      </div></header>
      <main class="shell">${content}</main>
      <nav class="bottom-nav"><div class="bottom-inner">
        <button class="nav-btn ${active==="home"?"active":""}" data-route="home"><span>⌂</span>Início</button>
        <button class="nav-btn ${active==="weeks"?"active":""}" data-route="weeks"><span>▦</span>Semanas</button>
        <button class="nav-btn ${active==="progress"?"active":""}" data-route="progress"><span>◔</span>Progresso</button>
      </div></nav></div>`;
  }
  function home(){
    const last=findDay(state.lastLesson);
    const content=`<section class="hero">
      <div class="eyebrow">Plano de 14 semanas</div><h2>Um passo por dia.<br>Até a aprovação.</h2>
      <p>Continue de onde parou e acompanhe sua evolução em cada matéria.</p>
      <div class="hero-meta"><span>${completed()} de ${allDays.length} aulas</span><b>${pct()}%</b></div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct()}%"></div></div>
      <button class="primary-btn" data-lesson="${last.id}" style="margin-top:18px">▶ Continuar estudando</button>
    </section>
    <div class="section-title"><h2>Seu desempenho</h2></div>
    <section class="stats">
      <div class="card stat"><strong>${pct()}%</strong><span>concluído</span></div>
      <div class="card stat"><strong>${streak()}</strong><span>dias seguidos</span></div>
      <div class="card stat"><strong>${completed()}</strong><span>aulas feitas</span></div>
    </section>
    <div class="section-title"><h2>Próxima aula</h2><span>1 hora</span></div>
    <article class="card day-card"><div class="subject-icon">${icons[last.subject]||"•"}</div><div class="day-copy"><b>${last.subject}</b><small>${last.topic}</small></div><button class="icon-btn" data-lesson="${last.id}">›</button></article>
    <div class="section-title"><h2>Semanas recentes</h2><button class="back" data-route="weeks">Ver todas</button></div>
    <div class="week-grid">${DATA.weeks.slice(0,2).map(weekCard).join("")}</div>`;
    return shell(content,"home");
  }
  function weekCard(w){return `<article class="card week-card"><button data-week="${w.number}">
    <div class="week-badge">${String(w.number).padStart(2,"0")}</div><div class="week-info"><h3>${w.title}</h3><p>${weekPct(w)}% concluído</p><div class="mini-track"><div class="mini-fill" style="width:${weekPct(w)}%"></div></div></div><div class="chev">›</div>
  </button></article>`}
  function weeksView(){return shell(`<div class="section-title"><h2>14 semanas</h2><span>${completed()}/${allDays.length} aulas</span></div><div class="week-grid">${DATA.weeks.map(weekCard).join("")}</div>`,"weeks")}
  function weekView(n){
    const w=DATA.weeks[n-1];
    return shell(`<button class="back" data-route="weeks">‹ Voltar às semanas</button><div class="section-title"><h2>Semana ${String(w.number).padStart(2,"0")}</h2><span>${weekPct(w)}%</span></div><p style="color:var(--muted);margin-top:-5px">${w.title}</p><div class="day-list">${w.days.map(d=>`<article class="card day-card ${state.done[d.id]?"done":""}" data-lesson="${d.id}"><div class="subject-icon">${icons[d.subject]||"•"}</div><div class="day-copy"><b>${d.day} · ${d.subject}</b><small>${d.topic}</small></div><div class="status-dot">${state.done[d.id]?"✓":""}</div></article>`).join("")}</div>`,"weeks");
  }
  function lessonView(id){
    const d=findDay(id); state.lastLesson=id; save();
    const yq=encodeURIComponent(d.videoQuery);
    return shell(`<button class="back" data-week="${d.week}">‹ Semana ${d.week}</button>
      <section class="card lesson-head"><div class="eyebrow" style="color:var(--primary)">${d.day} · Semana ${d.week}</div><h2>${d.subject}</h2><p>${d.topic}</p><div class="pills"><span class="pill">⏱ ${d.duration}</span><span class="pill">5 simulados</span></div></section>
      <section class="card lesson-section"><h3>🎯 Objetivo</h3><p>${d.objective}</p></section>
      <section class="card lesson-section"><h3>📚 O que estudar</h3><ul class="study-list">${d.study.map(x=>`<li>${x}</li>`).join("")}</ul>
      <a class="video-btn" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${yq}">▶ Abrir videoaula no YouTube</a></section>
      <div class="section-title"><h2>Mini-simulados</h2><span>5 questões</span></div>
      ${d.simulations.map((q,i)=>quiz(d,q,i)).join("")}
      <button class="complete-btn ${state.done[d.id]?"done":""}" data-complete="${d.id}">${state.done[d.id]?"✓ Aula concluída":"Marcar aula como concluída"}</button>`,"weeks");
  }
  function quiz(d,q,i){
    const key=d.id+"q"+i, picked=state.answers[key];
    return `<article class="card quiz-card"><div class="eyebrow" style="color:var(--primary)">${q.title}</div><h3>Questão ${i+1}</h3><p>${q.question}</p><div class="options">${q.options.map((o,j)=>{
      let c="option"; if(picked!==undefined){if(j===q.answer)c+=" correct";else if(j===picked)c+=" wrong";}
      return `<button class="${c}" data-answer="${key}" data-choice="${j}" data-correct="${q.answer}" ${picked!==undefined?"disabled":""}>${String.fromCharCode(65+j)}. ${o}</button>`}).join("")}</div>${picked!==undefined?`<div class="quiz-result">${picked===q.answer?"✅ Resposta correta":"❌ Revise o conteúdo e tente aplicar a estratégia indicada."}</div>`:""}</article>`;
  }
  function progressView(){
    const subjectMap={};
    allDays.forEach(d=>{subjectMap[d.subject]??={total:0,done:0};subjectMap[d.subject].total++;if(state.done[d.id])subjectMap[d.subject].done++;});
    return shell(`<div class="section-title"><h2>Seu progresso</h2><span>${pct()}% geral</span></div>
      <section class="hero"><div class="eyebrow">Evolução geral</div><h2>${completed()} aulas concluídas</h2><p>Continue com constância. O progresso fica salvo neste aparelho.</p><div class="progress-track"><div class="progress-fill" style="width:${pct()}%"></div></div></section>
      <div class="section-title"><h2>Por matéria</h2></div><div class="week-grid">${Object.entries(subjectMap).map(([s,v])=>{const p=Math.round(v.done/v.total*100);return `<article class="card week-card"><div class="week-badge">${icons[s]||"•"}</div><div class="week-info"><h3>${s}</h3><p>${v.done} de ${v.total}</p><div class="mini-track"><div class="mini-fill" style="width:${p}%"></div></div></div><b>${p}%</b></article>`}).join("")}</div>
      <button class="secondary-btn" data-reset style="width:100%;margin-top:22px">Reiniciar progresso</button>`,"progress");
  }
  function render(){
    document.documentElement.dataset.theme=state.theme;
    const r=state.route||"home";
    if(r.startsWith("week:")) app.innerHTML=weekView(Number(r.split(":")[1]));
    else if(r.startsWith("lesson:")) app.innerHTML=lessonView(r.split(":")[1]);
    else if(r==="weeks") app.innerHTML=weeksView();
    else if(r==="progress") app.innerHTML=progressView();
    else app.innerHTML=home();
  }
  document.addEventListener("click",e=>{
    const route=e.target.closest("[data-route]"); if(route){setRoute(route.dataset.route);return}
    const week=e.target.closest("[data-week]"); if(week){setRoute("week:"+week.dataset.week);return}
    const lesson=e.target.closest("[data-lesson]"); if(lesson){setRoute("lesson:"+lesson.dataset.lesson);return}
    const theme=e.target.closest("[data-action='theme']"); if(theme){state.theme=state.theme==="dark"?"light":"dark";save();render();return}
    const answer=e.target.closest("[data-answer]"); if(answer){state.answers[answer.dataset.answer]=Number(answer.dataset.choice);save();render();return}
    const complete=e.target.closest("[data-complete]"); if(complete){
      const id=complete.dataset.complete; state.done[id]=!state.done[id];
      if(state.done[id] && !state.streakDays.includes(todayKey())) state.streakDays.push(todayKey());
      save(); toast(state.done[id]?"Aula concluída!":"Conclusão removida."); render(); return;
    }
    const reset=e.target.closest("[data-reset]"); if(reset && confirm("Deseja apagar todo o progresso deste aparelho?")){state={...defaultState,done:{},answers:{},streakDays:[]};save();render()}
  });
  render();
  if("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("./sw.js").catch(()=>{});
})();