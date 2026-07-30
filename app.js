
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
        <button class="nav-btn ${active==="writing"?"active":""}" data-route="writing"><span>✎</span>Redação</button>
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

  const writingEssays = [
    {
      id:"essay-ai",
      title:"Desafios do uso ético da inteligência artificial no Brasil",
      tag:"Tecnologia",
      thesis:"A expansão da inteligência artificial exige educação digital e fiscalização eficiente para proteger direitos sem impedir a inovação.",
      intro:"Na obra “Admirável Mundo Novo”, Aldous Huxley retrata uma sociedade moldada por mecanismos tecnológicos de controle. Fora da ficção, o avanço da inteligência artificial no Brasil amplia oportunidades, mas também evidencia riscos relacionados à desinformação, à privacidade e à desigualdade de acesso. Nesse contexto, a insuficiente educação digital e a fragilidade da regulação dificultam o uso ético dessas ferramentas.",
      d1:"Em primeiro lugar, a baixa formação digital de parte da população favorece o uso acrítico de sistemas automatizados. Sem compreender como algoritmos selecionam conteúdos e produzem respostas, muitos usuários tratam informações geradas por máquinas como verdades absolutas. Esse cenário amplia a circulação de conteúdos falsos e reduz a autonomia do cidadão, o que torna indispensável a inclusão da alfabetização midiática no processo educacional.",
      d2:"Além disso, a ausência de fiscalização clara permite que dados pessoais sejam utilizados sem transparência. Empresas e instituições podem adotar sistemas automatizados que reproduzem preconceitos presentes em suas bases de dados, afetando contratações, concessão de crédito e acesso a serviços. Dessa forma, inovação e responsabilidade precisam avançar juntas, sob regras que garantam explicabilidade e proteção aos usuários.",
      conclusion:"Portanto, cabe ao Ministério da Educação, em parceria com escolas e universidades, criar programas permanentes de educação digital, por meio de oficinas, materiais gratuitos e formação docente, a fim de desenvolver o pensamento crítico dos estudantes. Paralelamente, a Autoridade Nacional de Proteção de Dados deve ampliar auditorias em sistemas de alto impacto e exigir relatórios de transparência das instituições. Assim, será possível aproveitar os benefícios da inteligência artificial sem comprometer direitos fundamentais.",
      repertories:["Aldous Huxley — Admirável Mundo Novo","Educação midiática","Proteção de dados e transparência algorítmica"]
    },
    {
      id:"essay-mental",
      title:"Caminhos para enfrentar o adoecimento mental entre jovens",
      tag:"Saúde",
      thesis:"O enfrentamento do adoecimento mental juvenil depende da ampliação do acolhimento escolar e do acesso contínuo à assistência psicológica.",
      intro:"Segundo a Constituição Federal, a saúde é um direito de todos e dever do Estado. Entretanto, muitos jovens brasileiros ainda enfrentam ansiedade, depressão e isolamento sem atendimento adequado. A pressão por desempenho e a dificuldade de acesso a redes de apoio tornam o problema mais grave, o que exige ações conjuntas entre escola, família e poder público.",
      d1:"Primeiramente, a cultura de produtividade transforma o cotidiano escolar em um espaço de cobrança constante. Comparações nas redes sociais, medo do fracasso e excesso de tarefas podem fazer com que o estudante associe seu valor pessoal ao desempenho. Quando a escola não possui canais de escuta, sinais de sofrimento são interpretados como desinteresse ou indisciplina.",
      d2:"Ademais, o atendimento especializado ainda é desigual. Em muitas regiões, faltam profissionais, orientação e continuidade no acompanhamento. Essa limitação afasta famílias de baixa renda do cuidado adequado e aumenta o risco de agravamento dos sintomas. Portanto, a prevenção deve ocorrer antes que a crise se instale.",
      conclusion:"Diante disso, as secretarias estaduais de Educação devem implementar núcleos de acolhimento nas escolas, compostos por psicólogos e assistentes sociais, com atendimento sigiloso, rodas de conversa e encaminhamento para a rede pública. Ao Ministério da Saúde cabe ampliar equipes de atenção psicossocial para adolescentes, priorizando municípios com baixa cobertura. Desse modo, os jovens poderão encontrar apoio antes que o sofrimento comprometa seus projetos de vida.",
      repertories:["Constituição Federal — direito à saúde","Cultura de produtividade","Rede de atenção psicossocial"]
    },
    {
      id:"essay-environment",
      title:"Obstáculos à preservação ambiental nas cidades brasileiras",
      tag:"Meio ambiente",
      thesis:"A preservação urbana é prejudicada pelo planejamento insuficiente e pela baixa participação coletiva na gestão dos resíduos.",
      intro:"O geógrafo Milton Santos defendia que o espaço é resultado das relações sociais. Nas cidades brasileiras, essa construção frequentemente ocorre sem equilíbrio ambiental, o que se manifesta em enchentes, poluição e descarte irregular de resíduos. A falta de planejamento urbano e a pouca participação da população impedem avanços consistentes na preservação.",
      d1:"De um lado, o crescimento desordenado reduz áreas verdes e impermeabiliza o solo. Sem drenagem adequada, chuvas intensas provocam alagamentos que atingem principalmente bairros periféricos. Assim, problemas ambientais também revelam desigualdades sociais, pois os grupos mais vulneráveis costumam viver em regiões com menor infraestrutura.",
      d2:"De outro, a gestão de resíduos ainda depende de hábitos que não foram plenamente incorporados. A coleta seletiva possui cobertura limitada e muitas pessoas não recebem orientação sobre separação e descarte. Como consequência, materiais recicláveis chegam a aterros e rios, ampliando custos públicos e danos ecológicos.",
      conclusion:"Logo, as prefeituras devem revisar seus planos diretores, ampliar áreas permeáveis e priorizar obras de drenagem nos bairros mais vulneráveis, com fiscalização técnica e metas públicas. Simultaneamente, escolas e cooperativas de reciclagem devem promover campanhas locais de separação de resíduos, oferecendo pontos de coleta acessíveis. Com planejamento e participação social, o espaço urbano poderá tornar-se mais seguro e sustentável.",
      repertories:["Milton Santos — produção do espaço","Planejamento urbano","Cooperativas de reciclagem"]
    }
  ];

  const writingTips = [
    ["Tese clara","Apresente, ainda na introdução, os dois problemas que serão discutidos nos parágrafos seguintes."],
    ["Repertório produtivo","Não apenas cite uma obra ou autor: explique a relação com o tema e com seu argumento."],
    ["Parágrafo completo","Use a sequência tópico frasal, explicação, exemplo ou consequência e fechamento."],
    ["Conectivos variados","Evite repetir “além disso”. Use também “sob essa perspectiva”, “nesse sentido” e “consequentemente”."],
    ["Conclusão detalhada","Inclua agente, ação, meio, finalidade e algum detalhamento que torne a proposta executável."],
    ["Revisão final","Reserve minutos para conferir concordância, pontuação, repetição de palavras e fuga ao tema."]
  ];

  const repertoireBank = [
    ["Educação","Paulo Freire","A educação deve desenvolver autonomia e consciência crítica."],
    ["Tecnologia","Byung-Chul Han","A hiperconexão pode intensificar exposição, desempenho e desgaste."],
    ["Sociedade","Zygmunt Bauman","A fragilidade dos vínculos ajuda a discutir relações e insegurança contemporâneas."],
    ["Cidadania","Constituição Federal de 1988","Garante direitos sociais como educação, saúde, segurança e dignidade."],
    ["Meio ambiente","Agenda 2030 da ONU","Reúne objetivos ligados a sustentabilidade, inclusão e desenvolvimento."],
    ["Desigualdade","Milton Santos","Permite analisar como o espaço reproduz diferenças sociais."]
  ];

  const trainingThemes = [
    "Desafios da educação financeira entre jovens brasileiros",
    "Combate à desinformação em períodos eleitorais",
    "Inclusão de pessoas com deficiência no mercado de trabalho",
    "Impactos do consumo excessivo na sociedade brasileira",
    "Caminhos para valorizar a ciência no Brasil",
    "Prevenção da violência no ambiente escolar"
  ];

  function writingHome(){
    return shell(`
      <section class="writing-hero">
        <div class="eyebrow">Central de Redação</div>
        <h2>Escreva com método.<br>Argumente com confiança.</h2>
        <p>Modelos autorais de alto desempenho, repertórios, dicas práticas e temas para treino.</p>
      </section>

      <div class="writing-actions">
        <button class="writing-action card" data-writing-section="essays"><span>🏆</span><b>Modelos completos</b><small>Estrutura comentada</small></button>
        <button class="writing-action card" data-writing-section="tips"><span>💡</span><b>Dicas essenciais</b><small>Erros e estratégias</small></button>
        <button class="writing-action card" data-writing-section="repertoire"><span>📚</span><b>Repertórios</b><small>Organizados por tema</small></button>
        <button class="writing-action card" data-writing-section="themes"><span>🎯</span><b>Temas de treino</b><small>Pratique toda semana</small></button>
      </div>

      <div class="section-title"><h2>Modelos em destaque</h2><span>${writingEssays.length} redações</span></div>
      <div class="essay-list">${writingEssays.map(essayCard).join("")}</div>
      <p class="writing-note">Os textos desta seção são modelos autorais de estudo inspirados nos critérios do ENEM; não são redações oficiais corrigidas pelo Inep.</p>
    `,"writing");
  }

  function essayCard(e){
    return `<article class="card essay-card" data-essay="${e.id}">
      <div class="essay-icon">✎</div><div class="essay-copy"><span>${e.tag}</span><h3>${e.title}</h3><p>${e.thesis}</p></div><div class="chev">›</div>
    </article>`;
  }

  function essayView(id){
    const e=writingEssays.find(x=>x.id===id) || writingEssays[0];
    const block=(name,text,cls="")=>`<section class="card essay-block ${cls}"><div class="essay-label">${name}</div><p>${text}</p></section>`;
    return shell(`
      <button class="back" data-route="writing">‹ Voltar à Central de Redação</button>
      <section class="card essay-title"><span>${e.tag}</span><h2>${e.title}</h2><p><b>Tese:</b> ${e.thesis}</p></section>
      ${block("Introdução",e.intro,"intro")}
      ${block("Desenvolvimento 1",e.d1)}
      ${block("Desenvolvimento 2",e.d2)}
      ${block("Conclusão",e.conclusion,"conclusion")}
      <section class="card essay-block"><div class="essay-label">Repertórios utilizados</div><div class="repertoire-tags">${e.repertories.map(r=>`<span>${r}</span>`).join("")}</div></section>
      <section class="card essay-analysis"><h3>Por que este modelo funciona?</h3>
        <ul class="study-list"><li>Apresenta uma tese objetiva com dois eixos argumentativos.</li><li>Relaciona repertório ao argumento, sem citação decorativa.</li><li>Desenvolve causa, consequência e impacto social.</li><li>Finaliza com proposta de intervenção detalhada.</li></ul>
      </section>
    `,"writing");
  }

  function writingSectionView(section){
    const titles={essays:"Modelos completos",tips:"Dicas essenciais",repertoire:"Banco de repertórios",themes:"Temas para treinar"};
    let body="";
    if(section==="essays") body=`<div class="essay-list">${writingEssays.map(essayCard).join("")}</div><p class="writing-note">Modelos autorais para estudo da estrutura exigida no ENEM.</p>`;
    if(section==="tips") body=`<div class="tip-list">${writingTips.map((t,i)=>`<article class="card tip-card"><div class="tip-number">${i+1}</div><div><h3>${t[0]}</h3><p>${t[1]}</p></div></article>`).join("")}</div>`;
    if(section==="repertoire") body=`<div class="repertoire-list">${repertoireBank.map(r=>`<article class="card repertoire-card"><span>${r[0]}</span><h3>${r[1]}</h3><p>${r[2]}</p><button class="copy-btn" data-copy="${r[1]} — ${r[2]}">Copiar repertório</button></article>`).join("")}</div>`;
    if(section==="themes") body=`<div class="theme-list">${trainingThemes.map((t,i)=>`<article class="card theme-card"><div><span>Tema ${String(i+1).padStart(2,"0")}</span><h3>${t}</h3><p>Planeje uma tese, dois argumentos e uma proposta de intervenção.</p></div><button class="icon-btn" data-copy="${t}" aria-label="Copiar tema">⧉</button></article>`).join("")}</div>`;
    return shell(`<button class="back" data-route="writing">‹ Central de Redação</button><div class="section-title"><h2>${titles[section]}</h2></div>${body}`,"writing");
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
    else if(r.startsWith("essay:")) app.innerHTML=essayView(r.split(":")[1]);
    else if(r.startsWith("writing:")) app.innerHTML=writingSectionView(r.split(":")[1]);
    else if(r==="weeks") app.innerHTML=weeksView();
    else if(r==="writing") app.innerHTML=writingHome();
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
    const essay=e.target.closest("[data-essay]"); if(essay){setRoute("essay:"+essay.dataset.essay);return}
    const writingSection=e.target.closest("[data-writing-section]"); if(writingSection){setRoute("writing:"+writingSection.dataset.writingSection);return}
    const copy=e.target.closest("[data-copy]"); if(copy){
      navigator.clipboard?.writeText(copy.dataset.copy).then(()=>toast("Copiado!")).catch(()=>toast("Selecione e copie o texto."));
      return;
    }
    const reset=e.target.closest("[data-reset]"); if(reset && confirm("Deseja apagar todo o progresso deste aparelho?")){state={...defaultState,done:{},answers:{},streakDays:[]};save();render()}
  });
  render();
  if("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("./sw.js").catch(()=>{});
})();