const companies = [];
const employees = [];
const punches = [];
const state={view:"dashboard",company:"KR Contábil"};
const isMaster=()=>state.company==="KR Contábil";
const inCompany=row=>isMaster()||row.company===state.company;
const scopedEmployees=()=>employees.filter(inCompany);
const scopedPunches=()=>punches.filter(inCompany);
const contextBar=()=>`<div class="active-company-bar" role="status"><span class="active-company-dot"></span><span class="company-context-label">Empresa ativa: <strong>${state.company}</strong></span><button type="button" data-action="switch-company">Trocar ↗</button></div>`;
const $=s=>document.querySelector(s);
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),3200)}
function heading(kicker,title,desc,action=""){return `<div class="page-heading"><div><p class="eyebrow">${kicker}</p><h1>${title}</h1><p>${desc}</p></div>${action}</div>`}
function stat(label,value,foot,icon){return `<div class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-foot">${foot}</div><span class="stat-arrow">›</span>${label==="Pendências"?'<span class="stat-alert">!</span>':""}</div>`}
function badge(text){let cls=text==="Recebida"||text==="Ativa"||text==="Autorizado"||text==="Ativo"?"ok":text==="Pendente"||text==="Verificar"||text==="Atenção"?"pending":text==="Revogado"?"error":"info";return `<span class="pill ${cls}">${text}</span>`}
function renderDashboard(){return `
<section class="welcome-banner"><div class="welcome-copy"><h1>Olá, <span>${state.company}!</span> <span class="wave">👋</span></h1><p>Bem-vindo ao Ponto.com. Gerencie as empresas e acompanhe a jornada dos colaboradores.</p></div><div class="welcome-art"><span class="welcome-script">Gestão simples<br><b>e organizada</b><br><em>para sua equipe.</em></span><div class="hero-monogram" aria-hidden="true"></div></div></section>
<div class="quick-actions">
<button class="quick-action" data-action="new-company"><span class="quick-icon">＋</span><span><strong>Nova empresa</strong><small>Cadastrar cliente</small></span><span class="quick-arrow">↗</span></button>
<button class="quick-action" data-action="new-employee"><span class="quick-icon">♟</span><span><strong>Adicionar funcionário</strong><small>Incluir colaborador</small></span><span class="quick-arrow">↗</span></button>
<button class="quick-action" data-view="records"><span class="quick-icon">◷</span><span><strong>Consultar ponto</strong><small>Ver marcações</small></span><span class="quick-arrow">↗</span></button>
<button class="quick-action" data-view="reports"><span class="quick-icon">▤</span><span><strong>Relatórios</strong><small>Consultar dados</small></span><span class="quick-arrow">↗</span></button>
</div>
<div class="stats">${stat("Empresas cadastradas",String(companies.length),"Clientes cadastrados","♟")}${stat("Funcionários ativos",String(employees.length),"Funcionários cadastrados","♙")}${stat("Marcações de hoje",String(punches.length),"Registros recebidos","◷")}${stat("Pendências","0","Nenhuma pendência cadastrada","▦")}</div>
<div class="two-col"><section class="panel"><div class="panel-heading"><div><h2>Últimas marcações</h2><p>Registros mais recentes das empresas</p></div><button class="text-link" data-view="records">Ver todas →</button></div><div class="empty-state">Ainda não há marcações cadastradas.</div></section>
<section class="panel"><div class="panel-heading"><div><h2>Empresas</h2><p>Clientes vinculados à KR Contábil</p></div><button class="text-link" data-view="companies">Ver todas →</button></div><div class="empty-state">Cadastre a primeira empresa para começar.</div></section></div>
<div class="dashboard-bottom"><section class="time-widget"><div class="time-copy"><span class="time-eyebrow">HOJE É</span><strong>${new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}</strong><div class="live-time" id="dashboardClock">--:--</div><p>Organização hoje,<br>resultados amanhã.</p></div><div class="mini-calendar"><div class="calendar-title"><strong>Calendário</strong></div><div class="empty-state">O calendário será preenchido conforme os registros forem cadastrados.</div></div></section></div>`}
function renderCompanies(){return `${heading("CADASTRO","Empresas","Cadastre e gerencie os clientes vinculados à KR Contábil.",'<button class="btn primary" data-action="new-company">＋ Nova empresa</button>')}<div class="table-panel"><div class="table-toolbar"><strong>Empresas cadastradas <span class="muted">(${companies.length})</span></strong><input class="search" id="searchTable" placeholder="Buscar por empresa ou CNPJ..." /></div><div class="table-wrap"><table id="dataTable"><thead><tr><th>EMPRESA</th><th>CNPJ</th><th>FUNCIONÁRIOS</th><th>STATUS</th><th>AÇÃO</th></tr></thead><tbody><tr><td colspan="5" class="empty-cell">Nenhuma empresa cadastrada. Clique em “Nova empresa” para começar.</td></tr></tbody></table></div></div>`}
function renderEmployees(){return `${heading("EQUIPE","Funcionários","Gerencie os funcionários vinculados às empresas.",'<button class="btn primary" data-action="new-employee">＋ Novo funcionário</button>')}<div class="table-panel"><div class="table-toolbar"><strong>Funcionários <span class="muted">(0)</span></strong><input class="search" id="searchTable" placeholder="Buscar por nome ou empresa..." /></div><div class="table-wrap"><table id="dataTable"><thead><tr><th>FUNCIONÁRIO</th><th>EMPRESA</th><th>CARGO</th><th>STATUS</th><th>AÇÃO</th></tr></thead><tbody><tr><td colspan="5" class="empty-cell">Nenhum funcionário cadastrado.</td></tr></tbody></table></div></div>`}
function renderDevices(){return `${heading("DISPOSITIVOS","Celulares autorizados","Gerencie os celulares oficiais usados para registrar ponto.")}<div class="panel empty-state">Nenhum dispositivo vinculado a uma empresa.</div>`}
function renderRecords(){return `${heading("JORNADA","Marcações de ponto","Consulte as marcações registradas pelas empresas.")}<div class="table-panel"><div class="table-toolbar"><strong>Marcações recentes</strong><input class="search" id="searchTable" placeholder="Buscar funcionário ou empresa..." /></div><div class="table-wrap"><table id="dataTable"><thead><tr><th>FUNCIONÁRIO</th><th>EMPRESA</th><th>TIPO</th><th>HORÁRIO</th><th>STATUS</th></tr></thead><tbody><tr><td colspan="5" class="empty-cell">Nenhuma marcação registrada.</td></tr></tbody></table></div></div>`}
function renderReports(){return `${heading("DP E RELATÓRIOS","Relatórios","Prévia das ferramentas que serão implementadas na versão conectada.")}<div class="report-grid">${[["Espelho de ponto","Resumo individual por funcionário e competência.","▤"],["Pendências de marcação","Identifique dias com registros incompletos.","!"],["Resumo de jornada","Horas previstas e apuradas conforme regras configuradas.","◷"],["Relatório por empresa","Visão consolidada para conferência do DP.","▣"],["Auditoria","Histórico de solicitações e ações administrativas.","⌁"],["Exportação para folha","Preparação de dados para conferência e integração.","⇩"]].map((r,i)=>`<div class="report-card"><div class="stat-icon">${r[2]}</div><h3>${r[0]}</h3><p>${r[1]}</p><button class="btn" data-action="report" data-index="${i}">Visualizar módulo</button></div>`).join("")}</div>`}
function renderClock(){return `${heading("PWA DO FUNCIONÁRIO","Marcação de ponto","Tela de marcação para o celular oficial da empresa.")}<div class="clock-demo"><div class="clock-logo">P</div><h2 style="margin:0;font-size:18px">Ponto.com</h2><p class="muted" style="margin:6px 0">Dispositivo vinculado à empresa</p><div class="clock-time" id="clockTime">--:--:--</div><div class="clock-date" id="clockDate"></div><label for="pinInput" style="display:block;margin-top:20px;font-weight:700;font-size:12px">Identificação do funcionário</label><input class="pin-input" id="pinInput" inputmode="numeric" maxlength="6" placeholder="••••" aria-label="Identificação do funcionário"><div class="clock-actions"><button class="btn primary" data-action="clock-in">Entrada</button><button class="btn" data-action="clock-break">Saída intervalo</button><button class="btn" data-action="clock-return">Retorno intervalo</button><button class="btn" data-action="clock-out">Saída final</button></div><div class="clock-warning">A marcação será liberada após a configuração do funcionário e do dispositivo.</div></div>`}
function renderApp(){const views={dashboard:renderDashboard,companies:renderCompanies,employees:renderEmployees,devices:renderDevices,records:renderRecords,reports:renderReports,clock:renderClock};const titles={dashboard:"Visão geral",companies:"Empresas",employees:"Funcionários",devices:"Dispositivos",records:"Marcações de ponto",reports:"Relatórios",clock:"PWA de marcação"};$("#content").innerHTML=contextBar()+(views[state.view]||renderDashboard)();const crumb=$("#pageCrumb");if(crumb)crumb.textContent=titles[state.view]||"Configurações";document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===state.view));$("#sidebar").classList.remove("open");const search=$("#searchTable");if(search)search.addEventListener("input",()=>{const q=search.value.toLowerCase();$("#dataTable").querySelectorAll("tbody tr").forEach(tr=>tr.style.display=tr.innerText.toLowerCase().includes(q)?"":"none")});if(state.view==="clock")updateClock()}
function updateClock(){const d=new Date();const t=$("#clockTime"),dt=$("#clockDate");if(t)t.textContent=d.toLocaleTimeString("pt-BR");if(dt)dt.textContent=d.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"})}
document.addEventListener("click",e=>{const nav=e.target.closest("[data-view]");if(nav){state.view=nav.dataset.view;render();return}const b=e.target.closest("[data-action]");if(!b)return;const a=b.dataset.action;if(a==="switch-company"){const select=$("#companySwitcher");select.focus();select.scrollIntoView({block:"nearest",behavior:"smooth"});toast("Escolha a empresa no seletor destacado no topo.");}else if(a==="new-company")toast("O cadastro de empresas será habilitado na integração do sistema.");else if(a==="new-employee")toast("O cadastro de funcionários será habilitado na integração do sistema.");else if(a==="company-detail")toast("Detalhes de "+companies[+b.dataset.index].name+" .");else if(a==="employee-detail")toast("Perfil de "+employees[+b.dataset.index].name+" — .");else if(a==="device-info")toast("Nenhum aparelho está vinculado a esta empresa.");else if(a==="revoke-device")toast("A função de revogação será habilitada após a configuração dos dispositivos.");else if(a==="approve-device")toast("A autorização de dispositivos será habilitada após a configuração.");else if(a==="export-demo")toast("A exportação será habilitada após a conexão dos dados da empresa.");else if(a==="report")toast("Módulo em planejamento: "+["Espelho de ponto","Pendências de marcação","Resumo de jornada","Relatório por empresa","Auditoria","Exportação para folha"][+b.dataset.index]+".");else if(a.startsWith("clock-")){const pin=$("#pinInput")?.value||"";if(pin.length<4)toast("Informe a identificação do funcionário.");else toast("A marcação será habilitada após a conexão dos dados e a configuração do funcionário.");}});
$("#nav").addEventListener("click",e=>{const b=e.target.closest("[data-view]");if(b){state.view=b.dataset.view;render()}});
$("#mobileMenu").addEventListener("click",()=>{const sidebar=$("#sidebar");if(window.matchMedia("(max-width: 760px)").matches){sidebar.classList.toggle("open")}else{document.querySelector(".app-shell").classList.toggle("sidebar-collapsed");$("#mobileMenu").setAttribute("aria-expanded",String(!document.querySelector(".app-shell").classList.contains("sidebar-collapsed")))}});
$("#profileButton").addEventListener("click",()=>toast("Empresa em uso: "+state.company+"."));
$("#companySwitcher").addEventListener("change",e=>{state.company=e.target.value;const master=state.company==="KR Contábil";document.querySelector(".profile-avatar").textContent=master?"KR":state.company.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();document.querySelector("#profileButton").innerHTML=`<strong>${state.company}</strong><small>${master?"Acesso master · KR Contábil":"Empresa selecionada"}</small><span>⌄</span>`;render();toast("Empresa ativa alterada para: "+state.company+". Confira antes de trabalhar.");});
$("#notificationsButton").addEventListener("click",()=>toast("Não há novas notificações."));


/* Autenticação e gestão de acessos */
const SUPABASE_URL = "https://auzrtnuquplhogtqasbb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_7y0Zgojnh0xbPwbsSp1gkQ_6Kv3hJiZ";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let authUser = null, authProfile = null, accessTab = "analysts", accessCompanies = [], accessProfiles = [], accessAssignments = [];
const originalRender = renderApp;
render = function(){
  if(!authUser){ $("#loginScreen").hidden=false; $("#appShell").hidden=true; return; }
  $("#loginScreen").hidden=true; $("#appShell").hidden=false;
  const master = authProfile?.role === "kr_admin";
  $("#accessNav").hidden = !master;
  if(!master && state.view==="access") state.view="dashboard";
  if(master) $("#companySwitcher").disabled=false;
  else {
    $("#companySwitcher").innerHTML = accessCompanies.map(c=>'<option value="'+c.id+'">'+(c.trade_name||c.legal_name)+'</option>').join("");
    $("#companySwitcher").disabled=true;
    state.company = accessCompanies[0]?.trade_name || accessCompanies[0]?.legal_name || "Minha empresa";
  }
  originalRender();
  if(state.view==="access") renderAccess();
};
function showLoginError(message){ $("#loginError").textContent=message||""; }
async function loadAuthProfile(){
 const {data:{user}}=await db.auth.getUser(); authUser=user;
 if(!user){authProfile=null;render();return;}
 const {data,error}=await db.from("profiles").select("*").eq("id",user.id).maybeSingle();
 if(error||!data||!data.active){await db.auth.signOut();authUser=null;showLoginError("Acesso não autorizado ou usuário inativo.");render();return;}
 authProfile=data;
 const {data:links}=await db.from("analyst_company_access").select("company_id,companies(id,legal_name,trade_name,status)");
 if(data.role==="analyst") accessCompanies=(links||[]).map(x=>x.companies).filter(Boolean);
 else if(data.company_id){const {data:company}=await db.from("companies").select("*").eq("id",data.company_id).maybeSingle();accessCompanies=company?[company]:[];}
 else {const {data:all}=await db.from("companies").select("*").order("trade_name");accessCompanies=all||[];}
 if(data.role==="kr_admin") { state.company="KR Contábil"; $("#companySwitcher").innerHTML='<option value="KR Contábil">KR Contábil · Master</option>'+accessCompanies.map(c=>'<option value="'+(c.trade_name||c.legal_name)+'">'+(c.trade_name||c.legal_name)+'</option>').join(""); $("#companySwitcher").disabled=false; }
 else if(data.role==="analyst"){ $("#companySwitcher").innerHTML=accessCompanies.map(c=>'<option value="'+(c.trade_name||c.legal_name)+'">'+(c.trade_name||c.legal_name)+'</option>').join(""); $("#companySwitcher").disabled=accessCompanies.length<2; if(accessCompanies.length) state.company=accessCompanies[0].trade_name||accessCompanies[0].legal_name; }
 else { $("#companySwitcher").innerHTML=accessCompanies.map(c=>'<option value="'+(c.trade_name||c.legal_name)+'">'+(c.trade_name||c.legal_name)+'</option>').join(""); $("#companySwitcher").disabled=true; }
 render();
}
$("#loginForm").addEventListener("submit",async e=>{
 e.preventDefault();showLoginError("");
 const button=$("#loginForm button[type=submit]");button.disabled=true;button.textContent="Entrando...";
 const {error}=await db.auth.signInWithPassword({email:$("#loginEmail").value.trim(),password:$("#loginPassword").value});
 if(error)showLoginError("E-mail ou senha inválidos. Confira os dados e tente novamente.");
 else await loadAuthProfile();
 button.disabled=false;button.textContent="Entrar";
});
$("#forgotPassword").addEventListener("click",async()=>{
 const email=$("#loginEmail").value.trim();if(!email){showLoginError("Informe seu e-mail para receber o link de recuperação.");return;}
 const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
 showLoginError(error?"Não foi possível enviar o link. Confira o e-mail.":"Se o e-mail estiver cadastrado, você receberá o link de recuperação.");
});
$("#logoutButton").addEventListener("click",async()=>{await db.auth.signOut();authUser=null;authProfile=null;state.view="dashboard";render();});
function renderAccess(){
 const tabs=[["analysts","Cadastro de Analistas"],["admins","Administrador da Empresa"],["assign","Definir Cartela de Analistas"]];
 $("#content").innerHTML=contextBar()+heading("ADMINISTRAÇÃO","Gestão de acessos","Cadastre usuários e controle quais empresas cada analista pode visualizar.")+
 '<div class="access-tabs">'+tabs.map(([id,label])=>'<button class="access-tab '+(accessTab===id?'active':'')+'" data-tab="'+id+'">'+label+'</button>').join("")+'</div><div id="accessPanel" class="access-panel"><div class="empty-state">Carregando informações...</div></div>';
 loadAccessData();
}
async function loadAccessData(){
 const [co,pr,as]=await Promise.all([
 db.from("companies").select("*").order("trade_name"),
 db.from("profiles").select("id,full_name,email,cpf,phone,role,company_id,active").in("role",["analyst","company_admin"]).order("full_name"),
 db.from("analyst_company_access").select("id,analyst_id,company_id")
 ]);
 if(co.error||pr.error||as.error){$("#accessPanel").innerHTML='<p class="login-error">Não foi possível carregar os acessos. Verifique as permissões do banco.</p>';return;}
 accessCompanies=co.data||[];accessProfiles=pr.data||[];accessAssignments=as.data||[];
 paintAccessPanel();
}
function paintAccessPanel(){
 const panel=$("#accessPanel");if(!panel)return;
 const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 if(accessTab==="assign"){
  panel.innerHTML='<div class="access-intro"><h2>Cartela de analistas</h2><p>Selecione um analista e marque as empresas que ele poderá acessar.</p></div><label>Analista<select id="assignmentAnalyst"><option value="">Selecione...</option>'+accessProfiles.filter(p=>p.role==="analyst").map(p=>'<option value="'+p.id+'">'+esc(p.full_name)+'</option>').join("")+'</select></label><div id="companyChecks" class="company-checks">'+accessCompanies.map(c=>'<label><input type="checkbox" disabled> '+esc(c.trade_name||c.legal_name)+'</label>').join("")+'</div><button class="btn primary" id="saveAssignments" disabled>Salvar cartela</button>';
  $("#assignmentAnalyst").addEventListener("change",e=>{const id=e.target.value;document.querySelectorAll("#companyChecks input").forEach((cb,i)=>{cb.disabled=!id;cb.checked=accessAssignments.some(a=>a.analyst_id===id&&a.company_id===accessCompanies[i].id)});$("#saveAssignments").disabled=!id;});
  $("#saveAssignments").addEventListener("click",async()=>{const id=$("#assignmentAnalyst").value;if(!id)return;const selected=[...document.querySelectorAll("#companyChecks input")].map((cb,i)=>cb.checked?accessCompanies[i].id:null).filter(Boolean);const del=await db.from("analyst_company_access").delete().eq("analyst_id",id);if(del.error){toast("Não foi possível atualizar a cartela.");return;}if(selected.length){const ins=await db.from("analyst_company_access").insert(selected.map(company_id=>({analyst_id:id,company_id,assigned_by:authUser.id})));if(ins.error){toast("Erro ao salvar empresas: "+ins.error.message);return;}}toast("Cartela atualizada com sucesso.");await loadAccessData();});
 }else{
  const analyst=accessTab==="analysts",role=analyst?"analyst":"company_admin";
  const list=accessProfiles.filter(p=>p.role===role);
  panel.innerHTML='<div class="access-intro"><h2>'+ (analyst?"Analistas cadastrados":"Administradores das empresas")+'</h2><p>'+ (analyst?"Cadastre os profissionais da KR que terão uma cartela de empresas.":"Cada administrador terá acesso restrito à empresa vinculada.")+'</p></div><form id="accessCreateForm" class="access-form"><label>Nome completo<input name="full_name" required></label><label>CPF<input name="cpf" inputmode="numeric" required></label><label>E-mail<input name="email" type="email" required></label><label>Telefone<input name="phone" type="tel"></label>'+(analyst?'':'<label class="full">Empresa<select name="company_id" required><option value="">Selecione...</option>'+accessCompanies.map(c=>'<option value="'+c.id+'">'+esc(c.trade_name||c.legal_name)+'</option>').join("")+'</select></label>')+'<label>Senha inicial<input name="password" type="password" minlength="8" required placeholder="Mínimo de 8 caracteres"></label><button class="btn primary full" type="submit">＋ Cadastrar '+(analyst?"analista":"administrador")+'</button><p id="accessFormError" class="login-error full"></p></form><div class="table-panel access-list"><div class="table-toolbar"><strong>Usuários cadastrados ('+list.length+')</strong></div><div class="table-wrap"><table><thead><tr><th>NOME</th><th>CPF</th><th>E-MAIL</th><th>EMPRESA</th><th>STATUS</th><th>AÇÃO</th></tr></thead><tbody>'+(list.length?list.map(p=>'<tr><td>'+esc(p.full_name)+'</td><td>'+esc(p.cpf)+'</td><td>'+esc(p.email||"")+'</td><td>'+esc(accessCompanies.find(c=>c.id===p.company_id)?.trade_name||accessCompanies.find(c=>c.id===p.company_id)?.legal_name||(p.role==="analyst"?"Cartela de empresas":"—"))+'</td><td>'+(p.active?"Ativo":"Inativo")+'</td><td><button class="btn" data-toggle-user="'+p.id+'" data-active="'+p.active+'">'+(p.active?"Desativar":"Ativar")+'</button></td></tr>').join(""):'<tr><td colspan="6" class="empty-cell">Nenhum usuário cadastrado.</td></tr>')+'</tbody></table></div></div>';
  $("#accessCreateForm").addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const payload={email:f.get("email"),full_name:f.get("full_name"),cpf:f.get("cpf"),phone:f.get("phone"),role,password:f.get("password"),company_id:analyst?null:f.get("company_id")};const {data,error}=await db.functions.invoke("create-access-user",{body:payload});if(error||data?.error){$("#accessFormError").textContent=data?.error||error?.message||"Falha no cadastro. A função segura de criação precisa estar publicada.";return;}toast("Usuário cadastrado. Oriente-o a confirmar o e-mail e entrar.");e.currentTarget.reset();await loadAccessData();});
  panel.querySelectorAll("[data-toggle-user]").forEach(btn=>btn.addEventListener("click",async()=>{const id=btn.dataset.toggleUser,active=btn.dataset.active==="true";const {error}=await db.from("profiles").update({active:!active}).eq("id",id);if(error){toast("Não foi possível alterar o status: "+error.message);return;}toast("Status do acesso atualizado.");await loadAccessData();}));
 }
}
document.addEventListener("click",e=>{const tab=e.target.closest("[data-tab]");if(tab){accessTab=tab.dataset.tab;renderAccess();}});
db.auth.onAuthStateChange((_event)=>{setTimeout(()=>loadAuthProfile(),0);});
loadAuthProfile();

render();setInterval(updateClock,1000);
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
