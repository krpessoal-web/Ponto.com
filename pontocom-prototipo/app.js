const companies = [];
const employees = [];
const punches = [];
const state={view:"dashboard",company:"KR Contábil",companyId:null};
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
$("#mobileMenu").addEventListener("click",()=>{const sidebar=$("#sidebar");if(window.matchMedia("(max-width: 760px)").matches){sidebar.classList.toggle("open")}else{document.querySelector(".app-shell").classList.toggle("sidebar-collapsed");$("#mobileMenu").setAttribute("aria-expanded",String(!document.querySelector(".app-shell").classList.contains("sidebar-collapsed")))}});
$("#profileButton").addEventListener("click",()=>toast("Empresa em uso: "+state.company+"."));
$("#companySwitcher").addEventListener("change",e=>{const value=e.target.value;const selected=accessCompanies.find(c=>c.id===value);if(value==="KR Contábil"){state.company="KR Contábil";state.companyId=null;}else if(selected){state.companyId=selected.id;state.company=selected.trade_name||selected.legal_name;}const master=state.company==="KR Contábil";document.querySelector(".profile-avatar").textContent=master?"KR":state.company.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();document.querySelector("#profileButton").innerHTML=`<strong>${state.company}</strong><small>${master?"Acesso master · KR Contábil":"Empresa selecionada"}</small><span>⌄</span>`;render();toast("Empresa ativa alterada para: "+state.company+". Confira antes de trabalhar.");});
$("#notificationsButton").addEventListener("click",()=>toast("Não há novas notificações."));


/* Autenticação e gestão de acessos */
const SUPABASE_URL = "https://auzrtnuquplhogtqasbb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_7y0Zgojnh0xbPwbsSp1gkQ_6Kv3hJiZ";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let authUser = null, authProfile = null, accessCompanies = [], accessProfiles = [], accessAssignments = [];
const originalRender = renderApp;
render = function(){
  if(!authUser){ $("#loginScreen").hidden=false; $("#appShell").hidden=true; return; }
  $("#loginScreen").hidden=true; $("#appShell").hidden=false;
  const master = authProfile?.role === "kr_admin";
  $("#accessNav").hidden = !master;
  if(!master && state.view==="access") state.view="dashboard";
  if(master){
    $("#companySwitcher").disabled=false;
  }else{
    const selected=accessCompanies.find(c=>c.id===state.companyId)||accessCompanies[0]||null;
    state.companyId=selected?.id||null;
    state.company=selected?(selected.trade_name||selected.legal_name):"Minha empresa";
    $("#companySwitcher").innerHTML=accessCompanies.map(c=>'<option value="'+c.id+'">'+(c.trade_name||c.legal_name)+'</option>').join("");
    $("#companySwitcher").value=state.companyId||"";
    $("#companySwitcher").disabled=authProfile?.role!=="analyst"||accessCompanies.length<2;
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
 if(data.role==="kr_admin") { state.company="KR Contábil";state.companyId=null;$("#companySwitcher").innerHTML='<option value="KR Contábil">KR Contábil · Master</option>'+accessCompanies.map(c=>'<option value="'+c.id+'">'+(c.trade_name||c.legal_name)+'</option>').join(""); $("#companySwitcher").disabled=false; }
 else { const selected=accessCompanies[0]||null;state.companyId=selected?.id||null;state.company=selected?(selected.trade_name||selected.legal_name):"Minha empresa";$("#companySwitcher").innerHTML=accessCompanies.map(c=>'<option value="'+c.id+'">'+(c.trade_name||c.legal_name)+'</option>').join("");$("#companySwitcher").value=state.companyId||"";$("#companySwitcher").disabled=data.role!=="analyst"||accessCompanies.length<2; }
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
/* Gestão de acessos — painel por módulos e cadastros guiados */
let accessSection="home", accessWizardStep=1, accessDataReady=false, accessFetchPending=false;
function accessCard(id,icon,title,desc,count){return '<button class="access-module-card" data-access-section="'+id+'"><span class="access-module-icon">'+icon+'</span><span class="access-module-copy"><strong>'+title+'</strong><small>'+desc+'</small></span><span class="access-module-count">'+count+'</span><span class="access-module-arrow">↗</span></button>'}
function renderAccess(){
 $("#content").innerHTML=contextBar()+
 (accessSection==="home" ? heading("ADMINISTRAÇÃO","Gestão de acessos","Gerencie usuários, empresas, permissões e acompanhe as movimentações.")+
 '<div class="access-module-grid">'+
 accessCard("analysts","♙","Analistas","Cadastre e gerencie os acessos da equipe KR.",accessProfiles.filter(p=>p.role==="analyst").length)+
 accessCard("companies","▦","Empresas","Cadastre clientes e consulte seus dados.",accessCompanies.length)+
 accessCard("permissions","⌘","Permissões","Defina a cartela de empresas de cada analista.",accessAssignments.length)+
 accessCard("history","◷","Histórico de acessos","Acompanhe alterações e atividades administrativas.","↗")+
 '</div><div class="access-home-note"><strong>Central de administração</strong><p>As permissões são aplicadas no banco de dados. Cada analista visualiza somente as empresas atribuídas à sua cartela.</p></div>'
 : '<div class="access-section-top"><button class="btn" data-access-section="home">← Voltar à gestão de acessos</button></div>'+
 (accessSection==="analysts"?renderAnalystSection():accessSection==="companies"?renderCompanySection():accessSection==="permissions"?renderPermissionSection():renderHistorySection()));
 if(accessSection==="history"){loadAccessHistory();return;}
  if(!accessDataReady&&!accessFetchPending){accessFetchPending=true;loadAccessData();}
}
function renderAnalystSection(){
 const list=accessProfiles.filter(p=>p.role==="analyst");
 return heading("GESTÃO DE ACESSOS · EQUIPE","Analistas","Cadastre profissionais da KR e acompanhe seus acessos.",'<button class="btn primary" data-access-action="new-analyst">＋ Novo analista</button>')+
 '<div class="access-kpis"><div><small>Total de analistas</small><strong>'+list.length+'</strong></div><div><small>Ativos</small><strong>'+list.filter(p=>p.active).length+'</strong></div><div><small>Inativos</small><strong>'+list.filter(p=>!p.active).length+'</strong></div></div>'+
 '<div class="table-panel access-list"><div class="table-toolbar"><strong>Equipe de analistas</strong><input class="search" id="accessSearch" placeholder="Buscar por nome, CPF ou e-mail"></div><div class="table-wrap"><table id="accessUsersTable"><thead><tr><th>ANALISTA</th><th>CPF</th><th>E-MAIL</th><th>EMPRESAS</th><th>STATUS</th><th>AÇÃO</th></tr></thead><tbody>'+
 (list.length?list.map(p=>{const n=accessAssignments.filter(a=>a.analyst_id===p.id).length;return '<tr><td><strong>'+accessEsc(p.full_name)+'</strong><small class="access-subline">'+accessEsc(p.phone||"Sem telefone")+'</small></td><td>'+accessEsc(p.cpf||"—")+'</td><td>'+accessEsc(p.email||"—")+'</td><td>'+n+' vinculada(s)</td><td>'+badge(p.active?"Ativo":"Inativo")+'</td><td><button class="btn" data-toggle-user="'+p.id+'" data-active="'+p.active+'">'+(p.active?"Desativar":"Ativar")+'</button></td></tr>'}).join(""):'<tr><td colspan="6" class="empty-cell">Nenhum analista cadastrado. Use “Novo analista” para começar.</td></tr>')+
 '</tbody></table></div></div>'+
 '<div id="analystWizard" class="access-wizard" hidden></div>';
}
function accessEsc(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderCompanySection(){
 return heading("GESTÃO DE ACESSOS · CLIENTES","Empresas","Cadastre empresas e mantenha os dados de acesso organizados.",'<button class="btn primary" data-access-action="new-company">＋ Nova empresa</button>')+
 '<div class="access-kpis"><div><small>Empresas cadastradas</small><strong>'+accessCompanies.length+'</strong></div><div><small>Administradores</small><strong>'+accessProfiles.filter(p=>p.role==="company_admin").length+'</strong></div><div><small>Com acesso ativo</small><strong>'+accessCompanies.filter(c=>c.status!=="inactive").length+'</strong></div></div>'+
 '<div id="companyEditor" class="access-wizard" hidden></div><div class="table-panel access-list"><div class="table-toolbar"><strong>Base de empresas</strong><input class="search" id="companySearch" placeholder="Buscar por razão social, nome ou CNPJ"></div><div class="table-wrap"><table><thead><tr><th>EMPRESA</th><th>CNPJ</th><th>E-MAIL</th><th>TELEFONE</th><th>STATUS</th></tr></thead><tbody>'+
 (accessCompanies.length?accessCompanies.map(c=>'<tr><td><strong>'+accessEsc(c.trade_name||c.legal_name)+'</strong><small class="access-subline">'+accessEsc(c.legal_name)+'</small></td><td>'+accessEsc(c.cnpj||"—")+'</td><td>'+accessEsc(c.email||"—")+'</td><td>'+accessEsc(c.phone||"—")+'</td><td>'+badge(c.status==="inactive"?"Inativo":"Ativo")+'</td></tr>').join(""):'<tr><td colspan="5" class="empty-cell">Nenhuma empresa cadastrada.</td></tr>')+
 '</tbody></table></div></div>';
}
function renderPermissionSection(){
 const analysts=accessProfiles.filter(p=>p.role==="analyst");
 return heading("GESTÃO DE ACESSOS · SEGURANÇA","Permissões","Monte a cartela de empresas que cada analista poderá consultar.")+
 '<div class="access-permission-layout"><section class="access-wizard"><h2>Vincular empresas</h2><p>Selecione um analista para visualizar e alterar sua cartela.</p><label>Analista<select id="permissionAnalyst"><option value="">Selecione um analista</option>'+analysts.map(p=>'<option value="'+p.id+'">'+accessEsc(p.full_name)+'</option>').join("")+'</select></label><div id="permissionCompanyList" class="access-company-list"><p class="empty-state">Escolha um analista para carregar as empresas.</p></div><button class="btn primary" id="savePermissionSet" disabled>Salvar permissões</button></section><section class="access-wizard"><h2>Resumo das regras</h2><ul class="access-rule-list"><li>Analistas acessam somente empresas atribuídas.</li><li>Uma empresa pode ser compartilhada entre vários analistas.</li><li>Administradores de empresa ficam restritos à própria empresa.</li><li>Alterações são protegidas pelas políticas de acesso do banco.</li></ul></section></div>';
}
function renderHistorySection(){
 return heading("GESTÃO DE ACESSOS · AUDITORIA","Histórico de acessos","Consulte ações administrativas registradas no sistema.")+
 '<div class="table-panel"><div class="table-toolbar"><strong>Atividades recentes</strong><button class="btn" data-access-action="reload">Atualizar</button></div><div id="accessHistoryContent" class="empty-state">Carregando histórico...</div></div>';
}
async function loadAccessData(){
 const [co,pr,as]=await Promise.all([
 db.from("companies").select("*").order("trade_name"),
 db.from("profiles").select("id,full_name,email,cpf,phone,role,company_id,active").in("role",["analyst","company_admin"]).order("full_name"),
 db.from("analyst_company_access").select("id,analyst_id,company_id")
 ]);
 if(co.error||pr.error||as.error){accessFetchPending=false;accessDataReady=false;const message=co.error?.message||pr.error?.message||as.error?.message||"Falha ao consultar o banco.";const panel=$("#accessPanel");if(panel)panel.innerHTML='<p class="login-error">Não foi possível carregar os acessos: '+accessEsc(message)+'</p>';else $("#content").insertAdjacentHTML("beforeend",'<p class="login-error">Não foi possível carregar os acessos: '+accessEsc(message)+'</p>');return;}
 accessCompanies=co.data||[];accessProfiles=pr.data||[];accessAssignments=as.data||[];accessDataReady=true;accessFetchPending=false;
 if(accessSection==="home"||accessSection==="analysts"||accessSection==="companies"||accessSection==="permissions")renderAccess();
 if(accessSection==="history")loadAccessHistory();
}
async function loadAccessHistory(){
 const el=$("#accessHistoryContent");if(!el)return;
 const {data,error}=await db.from("audit_logs").select("id,action,entity_table,entity_id,details,created_at,actor_id").order("created_at",{ascending:false}).limit(50);
 if(error){el.innerHTML='<p class="login-error">O histórico ainda não está disponível para esta conta ou não há permissão de leitura.</p>';return;}
 el.innerHTML=data?.length?'<div class="table-wrap"><table><thead><tr><th>DATA/HORA</th><th>AÇÃO</th><th>ÁREA</th><th>DETALHES</th></tr></thead><tbody>'+data.map(x=>'<tr><td>'+new Date(x.created_at).toLocaleString("pt-BR")+'</td><td>'+accessEsc(x.action)+'</td><td>'+accessEsc(x.entity_table)+'</td><td>'+accessEsc(JSON.stringify(x.details||{}))+'</td></tr>').join("")+'</tbody></table></div>':'<p class="empty-state">Nenhuma movimentação registrada até o momento.</p>';
}
function openAnalystWizard(){
 accessWizardStep=1;const box=$("#analystWizard");box.hidden=false;box.innerHTML='<div class="wizard-head"><div><p class="eyebrow">NOVO ACESSO</p><h2>Cadastro de analista</h2><p>Preencha os dados em etapas para concluir o cadastro.</p></div><button class="btn" data-access-action="close-analyst">Fechar</button></div><div class="wizard-steps"><span class="current">1 · Dados pessoais</span><span>2 · Contato</span><span>3 · Credenciais</span></div><form id="analystWizardForm"><div class="wizard-fields" id="wizardFields"></div><div class="wizard-actions"><button type="button" class="btn" id="wizardBack" disabled>Voltar</button><button type="button" class="btn primary" id="wizardNext">Continuar →</button><button type="submit" class="btn primary" id="wizardSubmit" hidden>Criar analista</button></div><p id="wizardError" class="login-error"></p></form>';paintAnalystStep();}
function paintAnalystStep(){
 const form=$("#analystWizardForm");if(!form)return;
 const fields=$("#wizardFields");
 const steps=[
 '<label>Nome completo<input name="full_name" required placeholder="Nome do analista"></label><label>CPF<input name="cpf" required inputmode="numeric" placeholder="000.000.000-00"></label>',
 '<label>E-mail profissional<input name="email" type="email" required placeholder="nome@krcontabil.com.br"></label><label>Telefone<input name="phone" type="tel" placeholder="(00) 00000-0000"></label>',
 '<label class="full">Senha inicial<input name="password" type="password" minlength="8" required placeholder="Mínimo de 8 caracteres"></label><p class="wizard-hint full">A senha inicial deve ser compartilhada com segurança e alterada pelo usuário após o primeiro acesso.</p>'
 ];
 const previous={};new FormData(form).forEach((v,k)=>previous[k]=v);
 fields.innerHTML=steps[accessWizardStep-1];
 Object.entries(previous).forEach(([k,v])=>{const input=form.elements[k];if(input)input.value=v});
 $(".wizard-steps").innerHTML=['Dados pessoais','Contato','Credenciais'].map((s,i)=>'<span class="'+(i+1===accessWizardStep?'current':i+1<accessWizardStep?'done':'')+'">'+(i+1)+' · '+s+'</span>').join("");
 $("#wizardBack").disabled=accessWizardStep===1;$("#wizardNext").hidden=accessWizardStep===3;$("#wizardSubmit").hidden=accessWizardStep!==3;
}
document.addEventListener("click",async e=>{
 const section=e.target.closest("[data-access-section]");if(section){accessSection=section.dataset.accessSection;renderAccess();return;}
 const action=e.target.closest("[data-access-action]")?.dataset.accessAction;
 if(action==="new-analyst"){openAnalystWizard();return}
 if(action==="close-analyst"){$("#analystWizard").hidden=true;return}
 if(action==="new-company"){const box=$("#companyEditor");box.hidden=false;box.innerHTML='<div class="wizard-head"><div><p class="eyebrow">NOVO CADASTRO</p><h2>Dados da empresa</h2><p>Informe os dados cadastrais do cliente.</p></div><button class="btn" data-access-action="close-company">Fechar</button></div><form id="companyCreateForm" class="access-form"><label>Razão social<input name="legal_name" required></label><label>Nome fantasia<input name="trade_name"></label><label>CNPJ<input name="cnpj" required></label><label>E-mail<input name="email" type="email"></label><label>Telefone<input name="phone" type="tel"></label><label>Status<select name="status"><option value="active">Ativa</option><option value="inactive">Inativa</option></select></label><button class="btn primary full" type="submit">Salvar empresa</button><p id="companyFormError" class="login-error full"></p></form>';return}
 if(action==="close-company"){$("#companyEditor").hidden=true;return}
 if(action==="reload"){loadAccessHistory();return}
});
document.addEventListener("click",e=>{
 if(e.target.id==="wizardNext"){const form=$("#analystWizardForm");const required=[...form.querySelectorAll("#wizardFields [required]")];if(required.some(x=>!x.reportValidity()))return;accessWizardStep=Math.min(3,accessWizardStep+1);paintAnalystStep();}
 if(e.target.id==="wizardBack"){accessWizardStep=Math.max(1,accessWizardStep-1);paintAnalystStep();}
});
document.addEventListener("submit",async e=>{
 if(e.target.id==="analystWizardForm"){
  e.preventDefault();const f=new FormData(e.target);const payload={email:f.get("email"),full_name:f.get("full_name"),cpf:f.get("cpf"),phone:f.get("phone"),role:"analyst",password:f.get("password"),company_id:null};
  const submitButton=$("#wizardSubmit");submitButton.disabled=true;submitButton.textContent="Criando...";
  const {data,error}=await db.functions.invoke("create-access-user",{body:payload});
  if(error||data?.error){let detail=data?.error||"";if(!detail&&error?.context){try{const response=error.context.clone?error.context.clone():error.context;const body=await response.json();detail=body?.error||body?.message||"";}catch(_){}}$("#wizardError").textContent=detail||error?.message||"Não foi possível criar o usuário.";submitButton.disabled=false;submitButton.textContent="Criar analista";return;}
  toast("Analista cadastrado com sucesso.");accessSection="analysts";accessDataReady=false;await loadAccessData();return;
 }
 if(e.target.id==="companyCreateForm"){
  e.preventDefault();const f=new FormData(e.target);const payload={legal_name:f.get("legal_name"),trade_name:f.get("trade_name")||null,cnpj:f.get("cnpj"),email:f.get("email")||null,phone:f.get("phone")||null,status:f.get("status")};
  const {error}=await db.from("companies").insert(payload);
  if(error){$("#companyFormError").textContent="Não foi possível salvar: "+error.message;return;}
  toast("Empresa cadastrada.");$("#companyEditor").hidden=true;await loadAccessData();return;
 }
});
document.addEventListener("change",e=>{
 if(e.target.id==="permissionAnalyst"){
  const id=e.target.value,box=$("#permissionCompanyList");if(!id){box.innerHTML='<p class="empty-state">Escolha um analista.</p>';$("#savePermissionSet").disabled=true;return;}
  box.innerHTML=accessCompanies.map(c=>'<label class="access-company-option"><input type="checkbox" value="'+c.id+'" '+(accessAssignments.some(a=>a.analyst_id===id&&a.company_id===c.id)?'checked':'')+'> <span><strong>'+accessEsc(c.trade_name||c.legal_name)+'</strong><small>'+accessEsc(c.cnpj||"")+'</small></span></label>').join("")||'<p class="empty-state">Cadastre empresas primeiro.</p>';
  $("#savePermissionSet").disabled=false;
 }
});
document.addEventListener("click",async e=>{
 if(e.target.id==="savePermissionSet"){
  const id=$("#permissionAnalyst")?.value;if(!id)return;
  const selected=[...document.querySelectorAll("#permissionCompanyList input:checked")].map(x=>x.value);
  const del=await db.from("analyst_company_access").delete().eq("analyst_id",id);
  if(del.error){toast("Não foi possível atualizar as permissões.");return;}
  if(selected.length){const ins=await db.from("analyst_company_access").insert(selected.map(company_id=>({analyst_id:id,company_id,assigned_by:authUser.id})));if(ins.error){toast("Erro ao salvar: "+ins.error.message);return;}}
  toast("Permissões atualizadas.");await loadAccessData();
 }
});
document.addEventListener("input",e=>{if(e.target.id==="accessSearch"||e.target.id==="companySearch"){const q=e.target.value.toLowerCase();const table=e.target.id==="accessSearch"?"#accessUsersTable":"#companyEditor ~ .table-panel table";document.querySelectorAll(table+" tbody tr").forEach(tr=>tr.style.display=tr.innerText.toLowerCase().includes(q)?"":"none");}});

db.auth.onAuthStateChange((_event)=>{setTimeout(()=>loadAuthProfile(),0);});
loadAuthProfile();

render();setInterval(updateClock,1000);
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
