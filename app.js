
const D=window.APP_DATA,$=s=>document.querySelector(s);
let st=JSON.parse(localStorage.getItem('e14state')||'{"view":"home","week":1,"day":0,"done":{},"sims":{}}');
let installPrompt=null;
const save=()=>localStorage.setItem('e14state',JSON.stringify(st));
const key=(w,d)=>`${w}-${d}`;
const doneCount=()=>Object.values(st.done).filter(Boolean).length;
const nextLesson=()=>{for(let w=1;w<=14;w++)for(let d=0;d<7;d++)if(!st.done[key(w,d)])return[w,d];return[14,6]};
const subjDone=s=>{let n=0;D.weeks.forEach(w=>w.days.forEach(d=>{if(d.subject===s&&st.done[key(w.number,w.days.indexOf(d))])n++}));return n};
function toast(t){const x=$("#toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1800)}
function nav(active){return `<nav class="bottom">${[['home','⌂','Início'],['weeks','▦','Semanas'],['sims','✓','Simulados'],['progress','◔','Progresso']].map(x=>`<button class="navbtn ${active===x[0]?'active':''}" onclick="go('${x[0]}')"><b>${x[1]}</b>${x[2]}</button>`).join('')}</nav>`}
function topbar(title,back=false){return `<header class="top">${back?`<button class="iconbtn" onclick="historyBack()">←</button>`:''}<h1>${title}</h1><button class="iconbtn" onclick="showInstall()">＋</button></header>`}
function layout(body,active='home',title='ENEM 14',back=false){$("#app").innerHTML=`<div class="shell">${topbar(title,back)}<main class="content">${body}</main>${nav(active)}</div>`}
function go(v){st.view=v;save();render()}
function historyBack(){if(st.view==='lesson')st.view='week';else if(st.view==='week')st.view='weeks';else if(st.view==='subjectSims')st.view='sims';else if(st.view==='quiz')st.view='subjectSims';else st.view='home';save();render()}
function home(){
 const n=nextLesson(),pct=Math.round(doneCount()/98*100), d=D.weeks[n[0]-1].days[n[1]];
 layout(`<section class="hero"><span class="eyebrow" style="color:#bcd0ff">PLANO DE 14 SEMANAS</span><h2>Estude uma hora por dia.</h2><p>Abra, estude, conclua e continue. Todo o plano foi feito primeiro para celular.</p><div class="progress"><i style="width:${pct}%"></i></div><p style="font-size:12px">${doneCount()} de 98 dias concluídos</p><button class="btn primary" onclick="openLesson(${n[0]},${n[1]})">Continuar: ${d.subject}</button></section>
 <section class="section"><span class="eyebrow">HOJE</span><h3>${d.topic}</h3><button class="card day-card" onclick="openLesson(${n[0]},${n[1]})"><span class="badge" style="background:${d.color}">${d.icon}</span><span><h4>${d.subject}</h4><span class="meta">Semana ${n[0]} • ${d.day} • 1 hora</span></span><span class="check">›</span></button></section>
 <section class="install"><b>Use como aplicativo</b><p class="meta">Adicione à tela inicial do iPhone ou Android para abrir em tela cheia.</p><button class="btn ghost" onclick="showInstall()">Como instalar</button></section>`,'home');
}
function weeks(){
 layout(`<span class="eyebrow">CRONOGRAMA</span><h2 style="margin:6px 0 16px">14 semanas</h2><div class="week-list">${D.weeks.map(w=>{let c=w.days.filter((_,i)=>st.done[key(w.number,i)]).length;return`<button class="card week-card" onclick="openWeek(${w.number})"><span class="num">SEMANA ${String(w.number).padStart(2,'0')}</span><h4>${c===7?'Semana concluída':'Plano semanal'}</h4><div class="progress"><i style="width:${c/7*100}%"></i></div><div class="row between" style="margin-top:9px"><span class="meta">${c}/7 dias</span><span class="meta">Abrir ›</span></div></button>`}).join('')}</div>`,'weeks','Semanas');
}
function openWeek(w){st.week=w;st.view='week';save();render()}
function week(){
 const w=D.weeks[st.week-1];
 layout(`<span class="eyebrow">SEMANA ${st.week} DE 14</span><h2 style="margin:6px 0 16px">Escolha o dia</h2><div class="week-list">${w.days.map((d,i)=>`<button class="card day-card ${st.done[key(st.week,i)]?'done':''}" onclick="openLesson(${st.week},${i})"><span class="badge" style="background:${d.color}">${d.icon}</span><span><h4>${d.day} • ${d.subject}</h4><span class="meta">${d.topic} • 1 hora</span></span><span class="check">${st.done[key(st.week,i)]?'✓':'›'}</span></button>`).join('')}</div>`,'weeks',`Semana ${st.week}`,true)
}
function openLesson(w,d){st.week=w;st.day=d;st.view='lesson';save();render()}
function lesson(){
 const d=D.weeks[st.week-1].days[st.day],done=!!st.done[key(st.week,st.day)];
 layout(`<article class="lesson"><header class="lesson-head" style="background:linear-gradient(145deg,${d.color},#0b1739)"><span class="badge">${d.icon}</span><h2>${d.subject}</h2><p>${d.day} • Semana ${st.week}</p></header><div class="lesson-body"><span class="time-pill">◷ 1 hora de estudo</span><h2 style="font-size:24px;margin:20px 0 8px">${d.topic}</h2><div class="study-point">${d.study[0]}</div><div class="study-point">${d.study[1]}</div><a class="video" href="${d.video}" target="_blank" rel="noopener"><span class="play">▶</span><span><b>Assistir videoaula</b><small>${d.channel} • abre no YouTube</small></span></a><div class="lesson-actions"><button class="btn ${done?'ghost':'primary'}" onclick="toggleDone()">${done?'✓ Estudo concluído':'Marcar estudo como concluído'}</button><button class="btn ghost" onclick="nextDay()">Próximo dia →</button></div></div></article>`,'weeks',d.topic,true)
}
function toggleDone(){st.done[key(st.week,st.day)]=!st.done[key(st.week,st.day)];save();toast(st.done[key(st.week,st.day)]?'Dia concluído':'Conclusão removida');render()}
function nextDay(){let w=st.week,d=st.day+1;if(d>6){d=0;w=Math.min(14,w+1)}openLesson(w,d)}
function sims(){
 layout(`<span class="eyebrow">PRÁTICA</span><h2 style="margin:6px 0 8px">Simulados por matéria</h2><p class="meta" style="line-height:1.55;margin-bottom:18px">Cada matéria tem 5 mini-simulados. Eles são liberados depois que você conclui pelo menos um dia daquela matéria.</p><div class="subject-list">${D.subjects.map(s=>{const info=D.weeks[0].days.find(d=>d.subject===s),n=subjDone(s),un=n===0;return`<button class="card subject-card ${un?'locked':''}" onclick="${un?"toast('Conclua um estudo dessa matéria primeiro')":`openSubjectSims('${s}')`}"><span class="badge" style="background:${info.color}">${info.icon}</span><span style="flex:1"><b>${s}</b><div class="progress"><i style="width:${Math.min(n/14*100,100)}%"></i></div><span class="meta">${un?'Bloqueado':`${n} estudos concluídos`}</span></span><span>›</span></button>`}).join('')}</div>`,'sims','Simulados')
}
function openSubjectSims(s){st.subject=s;st.view='subjectSims';save();render()}
function subjectSims(){
 const s=st.subject;
 layout(`<span class="eyebrow">${s.toUpperCase()}</span><h2 style="margin:6px 0 8px">5 mini-simulados</h2><p class="meta" style="margin-bottom:18px">Cada simulado tem 5 questões e resultado imediato.</p><div class="sim-list">${[1,2,3,4,5].map(i=>{const r=st.sims[`${s}-${i}`];return`<button class="card sim-card" onclick="startQuiz('${s}',${i})"><span class="round">${i}</span><span style="flex:1"><h4>Simulado ${i}</h4><span class="meta">${r!=null?`Melhor resultado: ${r}/5`:'5 questões • cerca de 8 min'}</span></span><span>›</span></button>`}).join('')}</div>`,'sims',s,true)
}
let quiz=null;
function startQuiz(s,n){const pool=[...D.banks[s]];for(let i=pool.length-1;i>0;i--){const j=Math.floor((Math.sin((n+1)*(i+3))*10000%1+1)%1*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}quiz={s,n,qs:pool.slice(0,5),at:0,answers:[]};st.view='quiz';render()}
function quizView(){
 const q=quiz.qs[quiz.at],sel=quiz.answers[quiz.at];
 layout(`<div class="quiz-head"><span class="eyebrow">${quiz.s} • SIMULADO ${quiz.n}</span><h2>Questão ${quiz.at+1} de 5</h2><div class="progress"><i style="width:${(quiz.at+1)/5*100}%"></i></div></div><section class="question"><h3>${q[0]}</h3><div class="options">${q[1].map((o,i)=>`<button class="option ${sel===i?'selected':''}" onclick="answer(${i})"><b>${'ABCD'[i]}.</b> ${o}</button>`).join('')}</div></section><div class="quiz-footer"><button class="btn primary" onclick="advanceQuiz()">${quiz.at===4?'Finalizar simulado':'Próxima questão'}</button></div>`,'sims','Simulado',true)
}
function answer(i){quiz.answers[quiz.at]=i;render()}
function advanceQuiz(){if(quiz.answers[quiz.at]==null)return toast('Escolha uma alternativa');if(quiz.at<4){quiz.at++;render()}else finishQuiz()}
function finishQuiz(){let score=quiz.qs.reduce((n,q,i)=>n+(quiz.answers[i]===q[2]),0),k=`${quiz.s}-${quiz.n}`;st.sims[k]=Math.max(st.sims[k]||0,score);save();layout(`<section class="result"><span class="eyebrow">RESULTADO</span><div class="score">${score}/5</div><h2>${score>=4?'Excelente trabalho!':score>=3?'Bom caminho!':'Continue praticando'}</h2><p class="meta">Seu melhor resultado fica salvo neste aparelho.</p><button class="btn primary" onclick="openSubjectSims('${quiz.s}')">Voltar aos simulados</button><button class="btn ghost" style="margin-top:10px" onclick="startQuiz('${quiz.s}',${quiz.n})">Tentar novamente</button></section>`,'sims','Resultado',true)}
function progress(){
 const pct=Math.round(doneCount()/98*100),simDone=Object.keys(st.sims).length;
 layout(`<section class="hero"><span class="eyebrow" style="color:#bcd0ff">SEU PROGRESSO</span><h2>${pct}% concluído</h2><div class="progress"><i style="width:${pct}%"></i></div><p>${doneCount()} de 98 estudos • ${simDone} simulados realizados</p></section><section class="section"><h3>Por matéria</h3><div class="subject-list">${D.subjects.map(s=>{let n=subjDone(s),info=D.weeks[0].days.find(d=>d.subject===s);return`<div class="card subject-card"><span class="badge" style="background:${info.color}">${info.icon}</span><span style="flex:1"><b>${s}</b><div class="progress"><i style="width:${n/14*100}%"></i></div><span class="meta">${n}/14 estudos</span></span></div>`}).join('')}</div></section>`,'progress','Progresso')
}
function showInstall(){
 const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
 if(installPrompt){installPrompt.prompt();installPrompt.userChoice.then(()=>installPrompt=null);return}
 $("#app").insertAdjacentHTML('beforeend',`<div class="modal" onclick="this.remove()"><div class="sheet" onclick="event.stopPropagation()"><span class="eyebrow">INSTALAR NO CELULAR</span><h2>${ios?'No iPhone':'No Android'}</h2><p>${ios?'No Safari, toque no botão Compartilhar e depois em “Adicionar à Tela de Início”.':'Abra o menu do navegador e toque em “Instalar aplicativo” ou “Adicionar à tela inicial”.'}</p><button class="btn primary" onclick="this.closest('.modal').remove()">Entendi</button></div></div>`)
}
function render(){if(st.view==='home')home();else if(st.view==='weeks')weeks();else if(st.view==='week')week();else if(st.view==='lesson')lesson();else if(st.view==='sims')sims();else if(st.view==='subjectSims')subjectSims();else if(st.view==='quiz')quizView();else if(st.view==='progress')progress();else home()}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e});
if(('serviceWorker' in navigator) && location.protocol.startsWith('http')) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
