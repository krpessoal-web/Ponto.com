const companies = [];
const employees = [];
const punches = [];
const state={view:"dashboard",company:"KR Contábil",companyId:null};
const safeHtml=value=>String(value??"").replace(/[&<>"\']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","\'":"&#39;"}[ch]));
const isMaster=()=>state.company==="KR Contábil";
const isCompanyRole=()=>["company_admin","company_user"].includes(authProfile?.role);
const inCompanyCtx=()=>isCompanyRole()||(authProfile?.role==="kr_admin"&&!!state.companyId);
const isMasterHome=()=>authProfile?.role==="kr_admin"&&!state.companyId;
const TAX_REGIMES={simples_nacional:"Simples Nacional",mei:"MEI",lucro_presumido:"Lucro Presumido",lucro_real:"Lucro Real",imune_isenta:"Imune/Isenta",outro:"Outro"};
const regimeLabel=v=>TAX_REGIMES[v]||"Não informado";
const regimeOptions=sel=>'<option value="">Não informado</option>'+Object.entries(TAX_REGIMES).map(([k,l])=>'<option value="'+k+'"'+(k===sel?' selected':'')+'>'+l+'</option>').join("");
function applyNavContext(){
 const master=authProfile?.role==="kr_admin";
 document.body.dataset.ctx=master?(state.companyId?"company":"home"):"";
 if(isCompanyRole()){const cn=document.querySelector('.nav-item[data-view="companies"]');if(cn)cn.hidden=true;}
 if(!master)return;
 const sn=document.querySelector('.nav-item[data-view="settings"]');if(sn){const t=[...sn.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());if(t)t.textContent=state.companyId?" Cadastro da empresa ":" Configurações ";}
 document.querySelectorAll(".nav-item").forEach(item=>{const v=item.dataset.view;item.hidden=state.companyId?["companies","access"].includes(v):!["companies","reports","access"].includes(v);});
}
const inCompany=row=>isMaster()||row.company===state.company;
const scopedEmployees=()=>employees.filter(inCompany);
const scopedPunches=()=>punches.filter(inCompany);
const contextBar=()=>(authProfile?.role==='kr_admin'&&!state.companyId)?'':authProfile?.role==='kr_admin'?`<div class="active-company-bar" role="status"><span class="active-company-dot"></span><span class="company-context-label">Empresa ativa: <strong>${state.company}</strong></span><button type="button" data-action="leave-company">← Painel administrativo</button></div>`:`<div class="active-company-bar" role="status"><span class="active-company-dot"></span><span class="company-context-label">Empresa ativa: <strong>${state.company}</strong></span><button type="button" data-action="switch-company">Trocar ↗</button></div>`;
const $=s=>document.querySelector(s);
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),3200)}
function heading(kicker,title,desc,action=""){return `<div class="page-heading"><div><p class="eyebrow">${kicker}</p><h1>${title}</h1><p>${desc}</p></div>${action?(String(action).includes("page-actions")?action:'<div class="page-actions">'+action+'</div>'):""}</div>`}
function stat(label,value,foot,icon){return `<div class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-foot">${foot}</div>${label==="Pendências"?'<span class="stat-alert" id="dashPendingAlert" hidden>!</span>':""}</div>`}
function badge(text){let cls=text==="Recebida"||text==="Ativa"||text==="Autorizado"||text==="Ativo"?"ok":text==="Pendente"||text==="Verificar"||text==="Atenção"?"pending":text==="Revogado"?"error":"info";return `<span class="pill ${cls}">${text}</span>`}
const DASH_ICONS={
 plus:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
 userPlus:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="8" r="3.6"/><path d="M3.5 20v-1a6.5 6.5 0 0 1 13 0v1M19 8v6m-3-3h6"/></svg>',
 clock:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
 report:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5"/></svg>',
 building:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h3m-3 4h3m-3 4h3m4-8h1m-1 4h1m-1 4h1"/></svg>',
 users:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.4"/><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5.2a3.2 3.2 0 0 1 0 5.6M18 14.2a5.4 5.4 0 0 1 3 4.8v1"/></svg>',
 alert:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2.8 19a1 1 0 0 0 .9 1.5h16.6a1 1 0 0 0 .9-1.5zM12 9.5v5m0 3h.01"/></svg>'
};
function dashGreeting(){const h=new Date().getHours();return h<12?"Bom dia":h<18?"Boa tarde":"Boa noite";}
function dashCalendarHtml(marked){
 const now=new Date(),y=now.getFullYear(),m=now.getMonth(),first=new Date(y,m,1).getDay(),total=new Date(y,m+1,0).getDate(),set=marked||new Set();
 const month=now.toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
 let cells="";for(let i=0;i<first;i++)cells+='<span class="blank"></span>';
 for(let d=1;d<=total;d++){const key=y+"-"+String(m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");cells+='<span class="'+(d===now.getDate()?"today ":"")+(set.has(key)?"has-punch":"")+'" title="'+(set.has(key)?"Há marcações neste dia":"")+'">'+d+'</span>';}
 return '<div class="calendar-title"><strong>'+safeHtml(month)+'</strong><small>'+set.size+' dia(s) com marcação</small></div><div class="calendar-grid calendar-head">'+["D","S","T","Q","Q","S","S"].map(x=>'<b>'+x+'</b>').join("")+'</div><div class="calendar-grid">'+cells+'</div>';
}
function renderDashboard(){
 const name=safeHtml(authProfile?.role==="analyst"?(authProfile.full_name||"Analista"):state.company),now=new Date();
 const dateLong=now.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});
 const qa=(attrs,icon,title,small)=>'<button class="quick-action" '+attrs+'><span class="quick-icon">'+icon+'</span><span><strong>'+title+'</strong><small>'+small+'</small></span><span class="quick-arrow">↗</span></button>';
 return '<section class="welcome-banner"><div class="welcome-copy"><p class="eyebrow">'+dashGreeting().toUpperCase()+' · '+safeHtml(dateLong)+'</p><h1>Olá, <span>'+name+'!</span> <span class="wave">👋</span></h1><p>Bem-vindo ao Kronius. Gerencie as empresas e acompanhe a jornada dos colaboradores.</p><div class="hero-chips"><span class="hero-chip"><i class="live-dot"></i>Sistema online</span><span class="hero-chip" id="dashUpdated">Atualizando indicadores…</span></div></div><div class="welcome-art"><svg class="gem-art" viewBox="0 0 620 260" preserveAspectRatio="xMaxYMid meet" aria-hidden="true"><defs><clipPath id="gC"><polygon points="430,-115 605,60 430,235 255,60"/></clipPath><linearGradient id="gb1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e040a"/><stop offset="1" stop-color="#6a0c19"/></linearGradient><linearGradient id="gb2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a0a16"/><stop offset="1" stop-color="#a51a2e"/></linearGradient><linearGradient id="gb3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8e1426"/><stop offset="1" stop-color="#e8405a"/></linearGradient><linearGradient id="gb4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b01f33"/><stop offset="1" stop-color="#ff7186"/></linearGradient><linearGradient id="gb5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a0812"/><stop offset="1" stop-color="#8c1628"/></linearGradient><linearGradient id="gSw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".34"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><linearGradient id="gEl" gradientUnits="userSpaceOnUse" x1="255" y1="60" x2="430" y2="235"><stop offset="0" stop-color="#ffd0d7" stop-opacity="0"/><stop offset=".4" stop-color="#ffd9de"/><stop offset=".56" stop-color="#fff"/><stop offset="1" stop-color="#ff9aa9"/></linearGradient><linearGradient id="gEr" gradientUnits="userSpaceOnUse" x1="430" y1="235" x2="605" y2="60"><stop offset="0" stop-color="#ff9aa9"/><stop offset=".55" stop-color="#ffd9de"/><stop offset="1" stop-color="#ffd0d7" stop-opacity="0"/></linearGradient><linearGradient id="gSt" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#ffb3bd" stop-opacity="0"/><stop offset=".5" stop-color="#ffc9d0" stop-opacity=".5"/><stop offset="1" stop-color="#ffb3bd" stop-opacity="0"/></linearGradient><radialGradient id="gGl"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#ff8fa0" stop-opacity=".8"/><stop offset="1" stop-color="#ff5a70" stop-opacity="0"/></radialGradient><filter id="gBl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter></defs><line class="gem-streak" x1="120" y1="270" x2="400" y2="-10" stroke="url(#gSt)" stroke-width="1"/><line class="gem-streak" x1="170" y1="280" x2="470" y2="-20" stroke="url(#gSt)" stroke-width=".7"/><polygon points="430,-175 665,60 430,295 195,60" fill="none" stroke="#ffc2ca" stroke-opacity=".14"/><polygon points="430,-145 635,60 430,265 225,60" fill="none" stroke="#ffc2ca" stroke-opacity=".2"/><g clip-path="url(#gC)"><g transform="rotate(45 430 60)"><rect x="300" y="-80" width="46" height="280" fill="url(#gb1)"/><rect x="346" y="-80" width="40" height="280" fill="url(#gb2)"/><rect x="386" y="-80" width="56" height="280" fill="url(#gb3)"/><rect x="442" y="-80" width="48" height="280" fill="url(#gb4)"/><rect x="490" y="-80" width="70" height="280" fill="url(#gb5)"/><g stroke="#fff" stroke-opacity=".2"><line x1="346" y1="-80" x2="346" y2="200"/><line x1="386" y1="-80" x2="386" y2="200"/><line x1="442" y1="-80" x2="442" y2="200"/><line x1="490" y1="-80" x2="490" y2="200"/></g><rect class="gem-sweep" x="260" y="-80" width="70" height="280" fill="url(#gSw)"/></g></g><path d="M255 60 L430 235" stroke="#ff6d82" stroke-width="7" opacity=".55" filter="url(#gBl)" fill="none"/><path d="M430 235 L605 60" stroke="#ff6d82" stroke-width="5" opacity=".4" filter="url(#gBl)" fill="none"/><path d="M255 60 L430 235" stroke="url(#gEl)" stroke-width="1.6" fill="none"/><path d="M430 235 L605 60" stroke="url(#gEr)" stroke-width="1.2" fill="none"/><g class="gem-glint" style="--d:0s"><circle cx="352" cy="157" r="16" fill="url(#gGl)"/><path d="M352 129 L354 155 L380 157 L354 159 L352 185 L350 159 L324 157 L350 155Z" fill="#fff"/></g><g class="gem-glint" style="--d:1.4s"><circle cx="548" cy="117" r="12" fill="url(#gGl)"/><path d="M548 95 L549.6 115.4 L570 117 L549.6 118.6 L548 139 L546.4 118.6 L526 117 L546.4 115.4Z" fill="#fff"/></g></svg><span class="welcome-script">Gestão de Pessoas,<br><b>de um jeito mais</b><br><em>inteligente.</em></span></div></section>'+
 '<div class="quick-actions">'+qa('data-action="new-employee"',DASH_ICONS.userPlus,"Adicionar funcionário","Incluir colaborador")+qa('data-view="records"',DASH_ICONS.clock,"Consultar ponto","Ver marcações")+qa('data-view="reports"',DASH_ICONS.report,"Relatórios","Consultar dados")+'</div>'+
 '<div class="stats">'+(state.companyId?stat("Estimativa de funcionários",String((accessCompanies.find(c=>c.id===state.companyId)||{}).average_employees??"—"),"Informada no cadastro da empresa",DASH_ICONS.building):stat("Empresas cadastradas",String(accessCompanies.length),"Empresas vinculadas ao seu acesso",DASH_ICONS.building))+stat("Funcionários ativos",'<span id="dashActiveEmployees">—</span>',"Na empresa selecionada",DASH_ICONS.users)+stat("Marcações de hoje",'<span id="dashTodayPunches">—</span>',"Na empresa selecionada",DASH_ICONS.clock)+stat("Pendências",'<span id="dashPendingCount">—</span>',"Na empresa selecionada",DASH_ICONS.alert)+'</div>'+
 '<div class="two-col"><section class="panel"><div class="panel-heading"><div><h2>Últimas marcações</h2><p>Registros recentes da empresa selecionada</p></div><button class="text-link" data-view="records">Ver todas →</button></div><div class="empty-state" id="dashboardRecentEntries">Selecione uma empresa no topo.</div></section><section class="panel"><div class="panel-heading"><div><h2>Empresa em uso</h2><p>Contexto dos indicadores exibidos</p></div></div><div class="empty-state" id="dashboardCompanyContext">'+safeHtml(state.company)+'</div></section></div>'+
 '<div id="mainCompanyEditor" class="access-wizard" hidden></div><div class="dashboard-bottom"><section class="time-widget"><div class="time-copy"><span class="time-eyebrow">HOJE É</span><strong>'+now.toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})+'</strong><div class="live-time" id="dashboardClock">'+now.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})+'</div><p>Organização hoje,<br>resultados amanhã.</p></div><div class="mini-calendar" id="dashCalendar">'+dashCalendarHtml()+'</div></section><section class="panel week-panel"><div class="panel-heading"><div><h2>Atividade da semana</h2><p>Marcações registradas nos últimos 7 dias</p></div></div><div id="dashWeek" class="week-chart"><div class="empty-state">Selecione uma empresa no topo.</div></div></section></div>';
}
function renderCompanies(){
 const master=authProfile?.role==="kr_admin";
 const rows=accessCompanies||[];
 const active=rows.filter(c=>c.status!=="inactive").length,staff=rows.reduce((n,c)=>n+(Number(c.average_employees)||0),0);
 const kpis=master?'<div class="exec-kpis"><div class="exec-kpi"><small>Empresas cadastradas</small><strong>'+rows.length+'</strong></div><div class="exec-kpi"><small>Ativas</small><strong>'+active+'</strong></div><div class="exec-kpi"><small>Inativas</small><strong>'+(rows.length-active)+'</strong></div><div class="exec-kpi"><small>Estimativa de funcionários</small><strong>'+staff+'</strong></div></div>':"";
 return `${heading(master?"MASTER":"CADASTRO",master?"Painel administrativo":"Empresas",master?"Gerencie as empresas: cadastre novas, edite o cadastro ou acesse a empresa.":"Consulte as empresas vinculadas ao seu acesso.",master?'<button class="btn primary" data-action="new-company">＋ Nova empresa</button>':"")}
 ${kpis}<div class="table-panel"><div class="table-toolbar"><strong>Empresas cadastradas <span class="muted">(${rows.length})</span></strong><input class="search" id="searchTable" placeholder="Buscar por empresa ou CNPJ..." /></div>
 <div class="table-wrap"><table id="dataTable"><thead><tr><th>EMPRESA</th><th>CNPJ</th>${master?'<th>REGIME</th>':''}<th>ESTIMATIVA DE FUNCIONÁRIOS</th><th>STATUS</th>${master?'<th>AÇÃO</th>':''}</tr></thead><tbody>
 ${rows.length?rows.map(x=>'<tr><td><strong>'+safeHtml(x.trade_name||x.legal_name)+'</strong><small class="access-subline">'+safeHtml(x.legal_name)+'</small></td><td>'+safeHtml(x.cnpj||"—")+'</td>'+(master?'<td>'+safeHtml(regimeLabel(x.tax_regime))+'</td>':'')+'<td>'+safeHtml(x.average_employees??"Não informado")+'</td><td>'+badge(x.status==="inactive"?"Inativo":"Ativo")+'</td>'+(master?'<td><div class="company-row-actions"><button class="btn small" data-action="company-detail" data-company-id="'+x.id+'">Ver / editar</button><button class="btn primary small" data-action="enter-company-context" data-company-id="'+x.id+'">Acessar empresa</button></div></td>':'')+'</tr>').join(""):'<tr><td colspan="'+(master?6:4)+'" class="empty-cell">Nenhuma empresa vinculada ao seu acesso.</td></tr>'}
 </tbody></table></div></div><div id="mainCompanyEditor" class="access-wizard" hidden></div>`;
}
let employeeDirectory=[],generatedEmployeeAccess=[],employeeSelectedCompanyId=null,employeeTab="team";
function employeeTabsHtml(){
 const tab=(id,label)=>'<button class="company-detail-tab '+(employeeTab===id?'active':'')+'" data-action="employee-tab" data-tab="'+id+'">'+label+'</button>';
 return '<div class="company-detail-tabs employee-tabs">'+tab("team","Equipe")+tab("mirror","Espelho de ponto")+tab("summary","Resumo de jornada")+'</div>';
}
function reportFiltersHtml(lockedCompanyId){
 const list=lockedCompanyId?(accessCompanies||[]).filter(c=>c.id===lockedCompanyId):(accessCompanies||[]);
 const options=list.map(c=>'<option value="'+safeHtml(c.id)+'" '+(c.id===(lockedCompanyId||state.companyId)?'selected':'')+'>'+safeHtml(c.trade_name||c.legal_name)+'</option>').join("");
 return '<section class="access-wizard report-filters"><label>Empresa<select id="reportCompanySelect"'+(lockedCompanyId?' disabled':'')+'>'+(options||'<option value="">Selecione uma empresa</option>')+'</select></label><label>Data inicial<input type="date" id="reportFromDate" value="'+reportFromDate+'"></label><label>Data final<input type="date" id="reportToDate" value="'+reportToDate+'"></label><button class="btn primary" data-action="run-report">Consultar</button></section>';
}
function renderEmployees(){
 if(authProfile?.role==="kr_admin"&&state.companyId)employeeSelectedCompanyId=state.companyId;
 if(isCompanyRole()&&!employeeSelectedCompanyId&&(accessCompanies||[]).length===1)employeeSelectedCompanyId=accessCompanies[0].id;
 if(!employeeSelectedCompanyId){
  const cards=(accessCompanies||[]).map(c=>'<button class="company-employee-card" data-action="open-employee-company" data-company-id="'+safeHtml(c.id)+'"><span class="company-card-mark">▦</span><span class="company-card-info"><strong>'+safeHtml(c.trade_name||c.legal_name)+'</strong><small>'+safeHtml(c.cnpj||"CNPJ não informado")+'</small></span><span class="company-card-arrow">›</span></button>').join("");
  return heading("EQUIPE","Funcionários","Selecione uma empresa para consultar e gerenciar os funcionários.")+'<div class="employee-company-toolbar"><input class="search" id="employeeCompanySearch" placeholder="Pesquisar empresa por nome ou CNPJ..."></div><div class="employee-company-grid" id="employeeCompanyGrid">'+(cards||'<div class="panel empty-state">Nenhuma empresa vinculada ao seu acesso.</div>')+'</div>';
 }
 const company=accessCompanies.find(c=>c.id===employeeSelectedCompanyId);
 const companyView=inCompanyCtx();
 if(companyView&&employeeTab!=="team"){
  reportType=employeeTab==="summary"?"summary":"mirror";
  return heading("EQUIPE","Funcionários",safeHtml(company?.trade_name||company?.legal_name||"Empresa"),"")+employeeTabsHtml()+reportFiltersHtml(employeeSelectedCompanyId)+'<div id="reportsPanel" class="table-panel"><div class="empty-state">Escolha o período e clique em Consultar.</div></div>';
 }
 return heading("EQUIPE","Funcionários",safeHtml(company?.trade_name||company?.legal_name||"Empresa"),(companyView?'':'<button class="btn" data-action="back-employee-companies">← Empresas</button>')+'<button class="btn" data-action="new-employee">＋ Novo funcionário</button><button class="btn primary" data-action="generate-employee-access">Gerar acessos em lote</button>')+(companyView?employeeTabsHtml():"")+'<div class="table-panel"><div class="table-toolbar"><strong>Funcionários <span class="muted" id="employeeCount">(carregando...)</span></strong><input class="search" id="searchTable" placeholder="Buscar funcionário ou matrícula..."></div><div class="table-wrap"><table id="dataTable"><thead><tr><th><input type="checkbox" id="selectAllEmployees" aria-label="Selecionar todos"></th><th>FUNCIONÁRIO</th><th>MATRÍCULA</th><th>CARGO</th><th>STATUS</th><th>ACESSO</th><th>AÇÃO</th></tr></thead><tbody><tr><td colspan="7" class="empty-cell">Carregando funcionários...</td></tr></tbody></table></div></div><div id="employeeEditor" class="access-wizard" hidden></div><div id="employeeAccessResults" class="access-wizard" hidden></div>';
}
async function loadEmployeeDirectory(){
 if(!employeeSelectedCompanyId){
  const input=$("#employeeCompanySearch");if(input)input.addEventListener("input",()=>{const q=input.value.toLocaleLowerCase("pt-BR");document.querySelectorAll(".company-employee-card").forEach(card=>card.hidden=!card.innerText.toLocaleLowerCase("pt-BR").includes(q));});
  return;
 }
 const body=$("#dataTable tbody");if(!body)return;
 body.innerHTML='<tr><td colspan="7" class="empty-cell">Carregando funcionários...</td></tr>';
 const {data,error}=await db.from("employees").select("id,company_id,employee_code,full_name,cpf,job_title,admission_date,status").eq("company_id",employeeSelectedCompanyId).order("full_name");
 if(error){body.innerHTML='<tr><td colspan="7" class="empty-cell">Falha ao carregar: '+safeHtml(error.message)+'</td></tr>';return;}
 employeeDirectory=data||[];$("#employeeCount").textContent="("+employeeDirectory.length+")";
 body.innerHTML=employeeDirectory.length?employeeDirectory.map(x=>'<tr><td><input type="checkbox" class="employee-select" value="'+x.id+'"></td><td><strong>'+safeHtml(x.full_name)+'</strong><small class="access-subline">'+(x.cpf?"CPF cadastrado":"CPF ausente")+'</small></td><td>'+safeHtml(x.employee_code||"Não gerada")+'</td><td>'+safeHtml(x.job_title||"—")+'</td><td>'+badge(x.status==="active"?"Ativo":x.status==="terminated"?"Desligado":"Inativo")+'</td><td>'+badge(x.employee_code?"Matrícula gerada":"Pendente")+'</td><td><button class="btn small" data-action="generate-one-employee-access" data-employee-id="'+x.id+'">Gerar acesso</button></td></tr>').join(""):'<tr><td colspan="7" class="empty-cell">Nenhum funcionário cadastrado nesta empresa.</td></tr>';
}
function openEmployeeWizard(){
 const box=$("#employeeEditor");if(!box)return;const companyId=employeeSelectedCompanyId||state.companyId||accessCompanies[0]?.id||"";
 box.hidden=false;box.innerHTML='<div class="wizard-head"><div><p class="eyebrow">CADASTRO DE EQUIPE</p><h2>Novo funcionário</h2><p>Vincule o cadastro à empresa correta.</p></div><button class="btn" type="button" data-action="close-employee-editor">Fechar</button></div><form id="employeeCreateForm" class="access-form"><label class="full">Empresa<select name="company_id" required>'+(accessCompanies||[]).map(c=>'<option value="'+safeHtml(c.id)+'" '+(c.id===companyId?'selected':'')+'>'+safeHtml(c.trade_name||c.legal_name)+'</option>').join("")+'</select></label><label>Nome completo<input name="full_name" required></label><label>CPF<input name="cpf" inputmode="numeric" maxlength="14" required></label><label>Cargo<input name="job_title"></label><label>Admissão<input name="admission_date" type="date"></label><button class="btn primary full" type="submit">Salvar funcionário</button><p id="employeeCreateError" class="login-error full"></p></form>';
 mountEditorModal("employeeEditor","Novo funcionário","Preencha os dados para cadastrar o colaborador.");
}
async function generateEmployeeAccess(employeeId=null){
 const chosen=[...document.querySelectorAll(".employee-select:checked")].map(x=>x.value),list=employeeId?employeeDirectory.filter(x=>x.id===employeeId):(chosen.length?employeeDirectory.filter(x=>chosen.includes(x.id)):employeeDirectory),results=[],errors=[],used=new Map();
 if(!list.length){toast("Não há funcionários para gerar acessos.");return;}
 for(const emp of list){
  const cpf=String(emp.cpf||"").replace(/\D/g,"");if(cpf.length!==11){errors.push(emp.full_name+": CPF inválido");continue;}
  let code=String(emp.employee_code||"");
  if(!/^\d{4}$/.test(code)){
   if(!used.has(emp.company_id))used.set(emp.company_id,new Set(employeeDirectory.filter(x=>x.company_id===emp.company_id&&x.employee_code).map(x=>String(x.employee_code))));
   const set=used.get(emp.company_id);for(let n=1;n<=9999;n++){const candidate=String(n).padStart(4,"0");if(!set.has(candidate)){code=candidate;set.add(candidate);break;}}
   if(!code){errors.push(emp.full_name+": sem matrícula disponível");continue;}
   const {error}=await db.from("employees").update({employee_code:code}).eq("id",emp.id).eq("company_id",emp.company_id);if(error){errors.push(emp.full_name+": "+error.message);continue;}emp.employee_code=code;
  }
  const pin=cpf.slice(0,4);
  const {data:pinData,error:pinError}=await db.functions.invoke("set-employee-pin",{body:{employee_id:emp.id,pin}});
  if(pinError||pinData?.error){errors.push(emp.full_name+": não foi possível cadastrar o PIN. "+(pinData?.error||pinError?.message||""));continue;}
  const c=accessCompanies.find(v=>v.id===emp.company_id);results.push({name:emp.full_name,company:c?.trade_name||c?.legal_name||"Empresa",matricula:code,senha:pin});
 }
 generatedEmployeeAccess=results;const box=$("#employeeAccessResults");if(box){box.hidden=false;box.innerHTML='<div class="wizard-head"><div><p class="eyebrow">ACESSOS GERADOS</p><h2>'+results.length+' funcionário(s)</h2><p>PIN inicial: primeiros 4 dígitos do CPF.</p></div><button class="btn" data-action="close-employee-results">Fechar</button></div>'+(results.length?'<div class="table-wrap"><table><thead><tr><th>Funcionário</th><th>Empresa</th><th>Matrícula</th><th>PIN</th></tr></thead><tbody>'+results.map(x=>'<tr><td>'+safeHtml(x.name)+'</td><td>'+safeHtml(x.company)+'</td><td><strong>'+x.matricula+'</strong></td><td><strong>'+x.senha+'</strong></td></tr>').join("")+'</tbody></table></div><div class="wizard-actions"><button class="btn primary" data-action="export-employee-access">Exportar CSV</button><button class="btn" data-action="copy-employee-access">Copiar</button></div>':'')+(errors.length?'<p class="wizard-hint">'+errors.map(safeHtml).join("<br>")+'</p>':'')+'<p class="wizard-hint">O PIN é cadastrado com proteção criptográfica e não fica visível no banco de dados. Guarde o arquivo de acesso em local seguro.</p>';}
 await loadEmployeeDirectory();box?.scrollIntoView({behavior:"smooth",block:"start"});
}
function exportEmployeeAccess(){
 if(!generatedEmployeeAccess.length)return;const rows=[["Funcionário","Empresa","Matrícula","PIN"],...generatedEmployeeAccess.map(x=>[x.name,x.company,x.matricula,x.senha])],csv="\uFEFF"+rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(";")).join("\r\n"),blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="acessos-funcionarios-kronius.csv";a.click();URL.revokeObjectURL(url);
}
function parseCompanyMapCoordinates(value){const text=String(value||"").trim(),patterns=[/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,/[?&](?:q|query|center)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,/^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/];for(const re of patterns){const m=text.match(re);if(m){const latitude=Number(m[1]),longitude=Number(m[2]);if(latitude>=-90&&latitude<=90&&longitude>=-180&&longitude<=180)return{latitude,longitude}}}return null}
let deviceSelectedCompanyId=null,latestTerminalCode=null;
function renderDevices(){
 const companyId=deviceSelectedCompanyId||state.companyId||accessCompanies[0]?.id||"";
 deviceSelectedCompanyId=companyId||null;
 const options=(accessCompanies||[]).map(c=>'<option value="'+safeHtml(c.id)+'" '+(c.id===companyId?'selected':'')+'>'+safeHtml(c.trade_name||c.legal_name)+'</option>').join("");
 return heading("PWA DO FUNCIONÁRIO","Terminais de ponto","Ative aparelhos, configure a localização da empresa e gerencie os terminais autorizados.")+
 '<section class="access-wizard"><div class="access-form"><label>Empresa<select id="deviceCompanySelect">'+(options||'<option value="">Nenhuma empresa disponível</option>')+'</select></label><a class="btn" href="./terminal/" target="_blank" rel="noopener">Abrir terminal de ponto ↗</a></div></section>'+
 '<div id="devicePanel" class="access-wizard"><p class="empty-state">Carregando configuração dos terminais...</p></div>';
}
async function loadDevicesPanel(){
 const panel=$("#devicePanel"),select=$("#deviceCompanySelect");if(!panel||!select)return;
 const companyId=select.value;if(!companyId){panel.innerHTML='<div class="empty-state">Cadastre ou selecione uma empresa para configurar o terminal.</div>';return;}
 deviceSelectedCompanyId=companyId;panel.innerHTML='<p class="empty-state">Consultando dispositivos e localização...</p>';
 const [locationResult,deviceResult]=await Promise.all([
  db.from("company_locations").select("latitude,longitude,allowed_radius_m,active").eq("company_id",companyId).maybeSingle(),
  db.functions.invoke("manage-terminal-device",{body:{action:"list",company_id:companyId}})
 ]);
 if(!$("#devicePanel"))return;
 const location=locationResult.data||null,devices=deviceResult.data?.devices||[];
 const locationError=locationResult.error?'<p class="login-error">Não foi possível consultar a localização: '+safeHtml(locationResult.error.message)+'</p>':"";
 const deviceError=deviceResult.error||deviceResult.data?.error?'<p class="login-error">Não foi possível consultar os terminais: '+safeHtml(deviceResult.data?.error||deviceResult.error?.message)+'</p>':"";
 const mapLink=location?'<p class="wizard-hint"><a href="https://www.google.com/maps?q='+encodeURIComponent(location.latitude+','+location.longitude)+'" target="_blank" rel="noopener">Conferir o ponto cadastrado no Google Maps ↗</a> · O GPS do aparelho é conferido em cada marcação.</p>':"";
 const codeBox=latestTerminalCode?.companyId===companyId?'<div class="access-wizard"><p class="eyebrow">CÓDIGO DE ATIVAÇÃO · USO ÚNICO</p><h2 style="letter-spacing:.18em;font-size:28px">'+safeHtml(latestTerminalCode.code)+'</h2><p>Expira em '+new Date(latestTerminalCode.expires).toLocaleString("pt-BR")+'. Informe este código no aparelho que será usado como terminal.</p><div class="wizard-actions"><button class="btn primary" data-action="copy-terminal-code">Copiar código</button><button class="btn" data-action="copy-terminal-link">Copiar link do terminal</button></div></div>':"";
 const locationCard=location?'<div class="location-defined"><div><span class="location-defined-icon">✓</span><div><strong>Localização definida</strong><small>Raio permitido: '+safeHtml(location.allowed_radius_m)+' metros</small></div></div><button class="btn" type="button" data-action="edit-company-location">Alterar localização</button></div>':"";
 panel.innerHTML=locationError+deviceError+
 '<div class="wizard-head"><div><p class="eyebrow">SEGURANÇA DO TERMINAL</p><h2>Localização da empresa</h2><p>O terminal valida o GPS em cada marcação e só aceita registros dentro do raio autorizado.</p></div></div>'+locationCard+
 '<form id="companyLocationForm" class="access-form location-config-form" '+(location?'hidden':'')+'><label class="full">Link do Google Maps ou coordenadas<input name="maps_reference" id="companyMapsReference" placeholder="Cole o link do local no Google Maps"></label><label>Latitude<input name="latitude" type="number" step="any" required value="'+(location?.latitude??'')+'" placeholder="-15.000000"></label><label>Longitude<input name="longitude" type="number" step="any" required value="'+(location?.longitude??'')+'" placeholder="-47.000000"></label><label>Raio permitido (metros)<input name="radius" type="number" min="10" max="1000" value="'+(location?.allowed_radius_m??50)+'" required></label><label class="full">Confirme sua senha de administrador<input name="admin_password" type="password" autocomplete="current-password" required placeholder="Digite sua senha para autorizar a alteração"></label><div class="wizard-actions"><button class="btn" type="button" data-action="capture-company-location">Usar localização atual</button><button class="btn primary" type="submit">Confirmar e salvar localização</button></div><p id="companyLocationMessage" class="login-error"></p></form>'+mapLink+
 '<div class="wizard-head" style="margin-top:24px"><div><p class="eyebrow">APARELHOS VINCULADOS</p><h2>Terminais autorizados</h2><p>Gere um código temporário para ativar um novo celular ou tablet.</p></div><button class="btn primary" data-action="issue-terminal-code">＋ Gerar código</button></div>'+codeBox+
 '<div class="table-wrap"><table><thead><tr><th>APARELHO</th><th>STATUS</th><th>ATIVADO EM</th><th>ÚLTIMO ACESSO</th><th>AÇÃO</th></tr></thead><tbody>'+
 (devices.length?devices.map(d=>'<tr><td><strong>'+safeHtml(d.device_name)+'</strong></td><td>'+badge(d.status==="active"?"Ativo":d.status==="revoked"?"Revogado":"Aguardando ativação")+'</td><td>'+(d.activated_at?new Date(d.activated_at).toLocaleString("pt-BR"):"—")+'</td><td>'+(d.last_seen_at?new Date(d.last_seen_at).toLocaleString("pt-BR"):"—")+'</td><td>'+(d.status!=="revoked"?'<button class="btn small" data-action="revoke-terminal" data-device-id="'+d.id+'">Revogar</button>':"—")+'</td></tr>').join(""):'<tr><td colspan="5" class="empty-cell">Nenhum terminal cadastrado para esta empresa.</td></tr>')+
 '</tbody></table></div>';
 
 /* Reconhecimento facial descontinuado no terminal; novas marcações usam PIN e foto temporária. */
}
function explainPunchReason(reason){
 const key=String(reason||"").toLowerCase().trim(),labels={company_location_not_configured:"Localização da empresa ainda não configurada",company_location_inactive:"Localização da empresa desativada",location_not_configured:"Localização da empresa não cadastrada",location_missing:"O aparelho não informou a localização",gps_unavailable:"GPS indisponível no aparelho",gps_accuracy_low:"Precisão do GPS insuficiente",location_outside_radius:"A marcação foi feita fora do raio configurado",outside_allowed_radius:"Distância maior que a permitida para a empresa",employee_not_found:"Funcionário não localizado",invalid_pin:"PIN ou identificação inválida",invalid_device:"Aparelho não autorizado",device_revoked:"Aparelho teve o acesso revogado",duplicate_attempt:"Tentativa de marcação duplicada",invalid_sequence:"Ordem de marcações inválida",stale_timestamp:"Horário da marcação fora do limite permitido",offline_sync:"Marcação realizada sem conexão e sincronizada depois",company_location_admin_confirmed:"Localização cadastrada e confirmada pela administração",biometric_not_enrolled:"Reconhecimento facial ainda não cadastrado",biometric_verification_failed:"Não foi possível confirmar a biometria"};
 return labels[key]|| (key?key.replace(/[_-]+/g," ").replace(/^./,x=>x.toUpperCase()):"Motivo não informado");
}

async function loadLocationReviewQueue(host,companyId){
 const {data,error}=await db.functions.invoke("manage-terminal-device",{body:{action:"review_list",company_id:companyId}});
 if(!host?.isConnected)return;
 if(error||data?.error){host.insertAdjacentHTML("beforeend",'<section class="access-wizard"><h2>Tentativas de marcação para análise</h2><p class="login-error">'+safeHtml(data?.error||error?.message||"Não foi possível consultar as tentativas.")+'</p></section>');return;}
 const items=data?.items||[];
 const rows=items.length?items.map(x=>'<div class="biometric-pending-row" style="align-items:flex-start"><div style="flex:1;min-width:220px"><strong>'+safeHtml(x.employee_name)+'</strong><p>'+safeHtml(x.employee_code)+' · '+({clock_in:"Entrada",break_start:"Saída para intervalo",break_end:"Retorno do intervalo",clock_out:"Saída final"}[x.entry_type]||x.entry_type)+'</p><small>'+new Date(x.attempted_at).toLocaleString("pt-BR")+' · GPS: '+(x.accuracy_m==null?"indisponível":Math.round(x.accuracy_m)+" m")+' · Distância estimada: '+(x.distance_m==null?"indisponível":Math.round(x.distance_m)+" m")+'</small><p class="wizard-hint">Motivo: '+safeHtml(explainPunchReason(x.reason||"Localização não confirmada"))+' · Aparelho: '+safeHtml(x.device_name)+'</p><label style="display:block;margin-top:8px">Conferência do responsável<input type="text" data-review-note="'+safeHtml(x.id)+'" placeholder="Ex.: funcionário conferido presencialmente" style="width:100%"></label></div><div class="wizard-actions" style="flex-wrap:wrap"><button class="btn primary small" data-action="review-location-attempt" data-company-id="'+safeHtml(companyId)+'" data-decision="approve" data-attempt-id="'+safeHtml(x.id)+'" data-attempted-at="'+safeHtml(x.attempted_at)+'">Aprovar marcação</button><button class="btn small" data-action="review-location-attempt" data-company-id="'+safeHtml(companyId)+'" data-decision="reject" data-attempt-id="'+safeHtml(x.id)+'">Rejeitar</button></div></div>').join(""):'<p class="empty-state">Nenhuma tentativa de marcação aguardando análise.</p>';
 host.insertAdjacentHTML("beforeend",'<section class="access-wizard"><div class="wizard-head"><div><p class="eyebrow">CONFERÊNCIA DO RESPONSÁVEL</p><h2>Tentativas de marcação para análise ('+items.length+')</h2><p>Use a aprovação manual somente depois de confirmar a presença do funcionário. A aprovação gera o registro no histórico e fica identificada na auditoria.</p></div></div>'+rows+'</section>');
}
async function loadBiometricApprovals(panel,companyId){
 const {data,error}=await db.functions.invoke("manage-biometric-enrollment",{body:{action:"list",company_id:companyId}});
 if(!panel?.isConnected)return;
 if(error||data?.error){panel.insertAdjacentHTML("beforeend",'<div class="access-wizard"><h2>Cadastros faciais pendentes</h2><p class="login-error">'+safeHtml(data?.error||error?.message||"Falha ao consultar.")+'</p></div>');return;}
 const items=data?.items||[];
 const content=items.length?items.map(x=>'<div class="biometric-pending-row"><div><strong>'+safeHtml(x.employee_name)+'</strong><p>'+safeHtml(x.company_name)+' · Matrícula '+safeHtml(x.employee_code)+'</p><small>Recebido em '+new Date(x.enrolled_at).toLocaleString("pt-BR")+'</small></div><div class="wizard-actions"><button class="btn primary small" data-action="approve-biometric" data-employee-id="'+safeHtml(x.employee_id)+'" data-company-id="'+safeHtml(x.company_id)+'" '+(!x.employee_active?'disabled title="Funcionário inativo"':'')+'>Aprovar</button><button class="btn small" data-action="delete-biometric" data-employee-id="'+safeHtml(x.employee_id)+'" data-company-id="'+safeHtml(x.company_id)+'">Excluir</button></div></div>').join(""):'<p class="empty-state">Nenhum cadastro facial aguardando aprovação.</p>';
 panel.insertAdjacentHTML("beforeend",'<section class="access-wizard biometric-approvals"><div class="wizard-head"><div><p class="eyebrow">ADMINISTRAÇÃO DA EMPRESA</p><h2>Cadastros faciais pendentes</h2><p>Confira a identidade do funcionário presencialmente antes de aprovar. A aprovação libera o reconhecimento facial para futuras marcações nesta empresa.</p></div></div>'+content+'</section>');
}
let recordsTab="entries",recordsSelectedCompanyId=null,recordsSelectedDate=null,recordsFromDate=localDateValue().slice(0,8)+"01",recordsToDate=localDateValue();
function renderRecords(){
 const companyId=recordsSelectedCompanyId||state.companyId||accessCompanies[0]?.id||"";recordsSelectedCompanyId=companyId||null;
 const options=(accessCompanies||[]).map(c=>'<option value="'+safeHtml(c.id)+'" '+(c.id===companyId?'selected':'')+'>'+safeHtml(c.trade_name||c.legal_name)+'</option>').join("");
 return heading("JORNADA","Lançamentos","Consulte as marcações organizadas por funcionário e dia ou faça lançamentos manuais.")+
 '<section class="access-wizard records-toolbar records-toolbar-modern"><label>Empresa<select id="recordsCompanySelect">'+(options||'<option value="">Nenhuma empresa disponível</option>')+'</select></label><label>Data inicial<input id="recordsFromDate" type="date" value="'+recordsFromDate+'"></label><label>Data final<input id="recordsToDate" type="date" value="'+recordsToDate+'"></label><button class="btn primary" data-action="refresh-records">Consultar período</button></section>'+
 '<div class="company-detail-tabs records-tabs"><button class="company-detail-tab '+(recordsTab==="entries"?"active":"")+'" data-action="records-tab" data-tab="entries">Marcações registradas</button><button class="company-detail-tab '+(recordsTab==="manual"?"active":"")+'" data-action="records-tab" data-tab="manual">Lançamento manual</button></div><div id="recordsPanel" class="table-panel"><div class="empty-state">Carregando lançamentos...</div></div>';
}
function localDateValue(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function localDateForValue(value){const d=new Date(value);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
async function loadRecordsPanel(){
 const host=$("#recordsPanel"),select=$("#recordsCompanySelect");if(!host||!select)return;const companyId=select.value;if(!companyId){host.innerHTML='<div class="empty-state">Selecione uma empresa para consultar os lançamentos.</div>';return;}
 recordsSelectedCompanyId=companyId;recordsFromDate=$("#recordsFromDate")?.value||recordsFromDate;recordsToDate=$("#recordsToDate")?.value||recordsToDate;if(recordsFromDate>recordsToDate){host.innerHTML='<div class="empty-state">A data inicial não pode ser posterior à data final.</div>';return;}
 host.innerHTML='<div class="empty-state">Consultando marcações...</div>';
 const [{data,error},empResult]=await Promise.all([db.functions.invoke("manage-time-entries",{body:{action:"list",company_id:companyId}}),db.from("employees").select("id,full_name,employee_code").eq("company_id",companyId).eq("status","active").order("full_name")]);
 if(!$("#recordsPanel"))return;if(error||data?.error){host.innerHTML='<div class="empty-state">Não foi possível carregar: '+safeHtml(data?.error||error?.message)+'</div>';return;}
 const employees=empResult.data||[],employeeOptions='<option value="">Selecione o funcionário</option>'+employees.map(x=>'<option value="'+safeHtml(x.id)+'">'+safeHtml(x.full_name)+' · '+safeHtml(x.employee_code||"sem matrícula")+'</option>').join("");
 const entries=(data?.entries||[]).filter(x=>{const d=localDateForValue(x.occurred_at);return d>=recordsFromDate&&d<=recordsToDate;}),requests=data?.requests||[];
 if(recordsTab==="entries"){
  const rows=entries.slice().sort((a,b)=>new Date(b.occurred_at)-new Date(a.occurred_at));
  const groupedRows=new Map();
  rows.forEach(x=>{const key=x.employee_id||x.employee_name||"sem-identificacao";if(!groupedRows.has(key))groupedRows.set(key,[]);groupedRows.get(key).push(x);});
  const employeeGroups=[...groupedRows.entries()].sort((a,b)=>String(a[1][0].employee_name||"").localeCompare(String(b[1][0].employee_name||""),"pt-BR"));
  const entryLabels={clock_in:"Entrada",break_start:"Saída para intervalo",break_end:"Retorno do intervalo",clock_out:"Saída final",adjustment:"Ajuste"};
  const renderEntryRows=list=>list.map(x=>'<tr><td>'+safeHtml(entryLabels[x.entry_type]||x.entry_type)+'</td><td>'+new Date(x.occurred_at).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})+'</td><td>'+safeHtml(x.source==="admin"?"Administrador":x.source==="mobile"?"Terminal":x.source==="import"?"Importação":"Sistema")+'</td><td>'+safeHtml(x.location_status==="manual"?"Conferida / manual":x.location_status==="offline"?"Sincronizada offline":x.location_status==="valid"?"Localização da empresa validada":x.biometric_verified?"Reconhecimento facial":"Registrada")+'</td><td>'+(x.photo_url?'<a class="photo-eye" href="'+safeHtml(x.photo_url)+'" target="_blank" rel="noopener" aria-label="Abrir foto da marcação" title="Ver foto"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.7"/></svg><span class="photo-eye-preview"><img src="'+safeHtml(x.photo_url)+'" alt="Foto da marcação" loading="lazy" decoding="async"></span></a>':'—')+'</td><td>'+safeHtml(x.note||x.receipt_code||"—")+'</td></tr>').join("");
  const employeeCards=employeeGroups.map(([id,list])=>{
   const days=new Map();list.forEach(x=>{const day=localDateForValue(x.occurred_at);if(!days.has(day))days.set(day,[]);days.get(day).push(x);});
   const dayCards=[...days.entries()].sort((a,b)=>b[0].localeCompare(a[0])).map(([day,dayRows])=>'<details class="records-day-card"><summary><span>'+new Date(day+"T12:00:00").toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"})+'</span><small>'+dayRows.length+' marcação(ões)</small></summary><div class="table-wrap"><table class="records-table records-day-table"><thead><tr><th>TIPO</th><th>HORÁRIO</th><th>ORIGEM</th><th>CONFERÊNCIA</th><th>FOTO</th><th>OBSERVAÇÃO</th></tr></thead><tbody>'+renderEntryRows(dayRows.slice().sort((a,b)=>new Date(a.occurred_at)-new Date(b.occurred_at)))+'</tbody></table></div></details>').join("");
   const initials=String(list[0].employee_name||"F").trim().split(/\s+/).slice(0,2).map(part=>part[0]||"").join("").toUpperCase();
   return '<details class="records-employee-card"><summary class="records-employee-trigger"><span class="records-employee-avatar">'+safeHtml(initials)+'</span><span class="records-employee-identity"><strong class="records-employee-name">'+safeHtml(list[0].employee_name||"Funcionário")+'</strong><small class="records-employee-meta">'+(list[0].employee_code?'Matrícula '+safeHtml(list[0].employee_code):"Histórico de marcações") +'</small></span><span class="records-employee-count">'+list.length+' registros</span><span class="records-employee-chevron">⌄</span></summary><div class="records-employee-popover"><div class="records-popover-heading"><span>HISTÓRICO DO FUNCIONÁRIO</span><button type="button" class="records-modal-close" aria-label="Fechar janela">×</button><small>'+dayCards.length+' dia(s) com marcação</small></div><div class="records-days">'+dayCards+'</div></div></details>';
  }).join("");
  host.innerHTML='<div class="table-toolbar records-toolbar-inner"><div><strong>Funcionários com marcações ('+employeeGroups.length+')</strong><small class="access-subline">'+rows.length+' marcação(ões) no período · '+new Date(recordsFromDate+"T12:00:00").toLocaleDateString("pt-BR")+' até '+new Date(recordsToDate+"T12:00:00").toLocaleDateString("pt-BR")+'</small></div><div class="records-filters"><input class="search" id="recordsSearch" placeholder="Buscar funcionário..."></div></div><div class="records-employee-list">'+(employeeGroups.length?employeeCards:'<div class="empty-state">Nenhuma marcação encontrada neste período.</div>')+'</div>';
  $("#recordsSearch")?.addEventListener("input",e=>{
   const q=e.target.value.toLocaleLowerCase("pt-BR");
   host.querySelectorAll(".records-employee-card").forEach(card=>{const show=card.querySelector("summary")?.innerText.toLocaleLowerCase("pt-BR").includes(q);card.hidden=!show;if(show&&q)card.open=true;});
  });
 }else if(recordsTab==="missing"){
  const pending=requests.filter(x=>x.status==="pending"),history=requests.filter(x=>x.status!=="pending");
  host.innerHTML='<div class="access-wizard"><div class="wizard-head"><div><p class="eyebrow">PONTO ESQUECIDO</p><h2>Informar marcação que o funcionário esqueceu</h2><p>Informe o horário que deveria constar e a justificativa. A marcação ficará pendente até aprovação do responsável.</p></div></div><button class="btn primary" data-action="open-missing-form">＋ Nova solicitação</button><form id="missingPunchForm" class="access-form" hidden><label>Funcionário<select name="employee_id" required>'+employeeOptions+'</select></label><label>Tipo de marcação<select name="entry_type" required><option value="clock_in">Entrada</option><option value="break_start">Saída para intervalo</option><option value="break_end">Retorno do intervalo</option><option value="clock_out">Saída final</option></select></label><label>Data<input name="date" type="date" value="'+localDateValue()+'" required></label><label>Horário<input name="time" type="time" required></label><label class="full">Justificativa<textarea name="reason" rows="2" minlength="8" required placeholder="Informe por que a marcação não foi realizada."></textarea></label><button class="btn primary full" type="submit">Enviar para aprovação</button><p class="login-error full" id="missingPunchError"></p></form></div><div class="table-toolbar"><strong>Aguardando aprovação ('+pending.length+')</strong></div><div class="table-wrap"><table><thead><tr><th>FUNCIONÁRIO</th><th>MARCAÇÃO</th><th>DATA/HORA INFORMADA</th><th>JUSTIFICATIVA</th><th>DECISÃO</th></tr></thead><tbody>'+(pending.length?pending.map(x=>'<tr><td>'+safeHtml(x.employee_name)+'</td><td>'+safeHtml(({clock_in:"Entrada",break_start:"Saída intervalo",break_end:"Retorno intervalo",clock_out:"Saída final"})[x.entry_type]||x.entry_type)+'</td><td>'+new Date(x.occurred_at).toLocaleString("pt-BR")+'</td><td>'+safeHtml(x.reason)+'</td><td><input data-missing-note="'+safeHtml(x.id)+'" placeholder="Observação da análise"><div class="wizard-actions"><button class="btn primary small" data-action="resolve-missing-punch" data-request-id="'+safeHtml(x.id)+'" data-decision="approve">Aprovar</button><button class="btn small" data-action="resolve-missing-punch" data-request-id="'+safeHtml(x.id)+'" data-decision="reject">Rejeitar</button></div></td></tr>').join(""):'<tr><td colspan="5" class="empty-cell">Nenhuma marcação esquecida aguardando aprovação.</td></tr>')+'</tbody></table></div>'+(history.length?'<p class="wizard-hint">Solicitações já tratadas: '+history.length+'.</p>':"");
 }else{
  host.innerHTML='<div class="access-wizard"><div class="wizard-head"><div><p class="eyebrow">AJUSTE ADMINISTRATIVO</p><h2>Lançar marcação manual</h2><p>Use quando houver necessidade de incluir ou corrigir uma marcação. A operação será identificada como lançamento do administrador e ficará registrada na auditoria.</p></div></div><button class="btn primary" data-action="open-manual-form">＋ Lançar marcação</button><form id="manualPunchForm" class="access-form" hidden><label>Funcionário<select name="employee_id" required>'+employeeOptions+'</select></label><label>Tipo de marcação<select name="entry_type" required><option value="clock_in">Entrada</option><option value="break_start">Saída para intervalo</option><option value="break_end">Retorno do intervalo</option><option value="clock_out">Saída final</option></select></label><label>Data<input name="date" type="date" value="'+localDateValue()+'" required></label><label>Horário<input name="time" type="time" required></label><label class="full">Justificativa / motivo<input name="note" minlength="8" required placeholder="Ex.: ajuste autorizado pelo responsável da empresa"></label><button class="btn primary full" type="submit">Salvar lançamento manual</button><p class="login-error full" id="manualPunchError"></p></form></div>';
 }
}
function renderPending(){
 const companyId=state.companyId||accessCompanies[0]?.id||"",options=(accessCompanies||[]).map(c=>'<option value="'+safeHtml(c.id)+'" '+(c.id===companyId?'selected':'')+'>'+safeHtml(c.trade_name||c.legal_name)+'</option>').join("");
 return heading("CONFERÊNCIA","Pendências","Veja situações que precisam de conferência, com o motivo explicado em linguagem clara.")+
 '<section class="access-wizard records-toolbar"><label>Empresa<select id="pendingCompanySelect">'+(options||'<option value="">Nenhuma empresa disponível</option>')+'</select></label><button class="btn primary" data-action="refresh-pending">Atualizar pendências</button></section><div id="pendingPanel" class="pending-panel"><div class="empty-state">Carregando pendências...</div></div>';
}
async function loadPendingPanel(){
 const host=$("#pendingPanel"),select=$("#pendingCompanySelect");if(!host||!select)return;const companyId=select.value;
 if(!companyId){host.innerHTML='<div class="empty-state">Selecione uma empresa para consultar as pendências.</div>';return;}
 host.innerHTML='<div class="empty-state">Consultando pendências...</div>';
 const [{data,error},empResult]=await Promise.all([db.functions.invoke("manage-time-entries",{body:{action:"list",company_id:companyId}}),db.from("employees").select("id,full_name,employee_code").eq("company_id",companyId).eq("status","active").order("full_name")]);
 if(!host.isConnected)return;
 if(error||data?.error){host.innerHTML='<div class="empty-state">Não foi possível consultar: '+safeHtml(data?.error||error?.message)+'</div>';return;}
 const requests=data?.requests||[],pending=requests.filter(x=>x.status==="pending"),history=requests.filter(x=>x.status!=="pending");
 const employeeOptions='<option value="">Selecione o funcionário</option>'+(empResult.data||[]).map(x=>'<option value="'+safeHtml(x.id)+'">'+safeHtml(x.full_name)+' · '+safeHtml(x.employee_code||"sem matrícula")+'</option>').join("");
 const labels={clock_in:"Entrada",break_start:"Saída para intervalo",break_end:"Retorno do intervalo",clock_out:"Saída final"};
 const rows=pending.length?pending.map(x=>'<tr><td><strong>'+safeHtml(x.employee_name||"Funcionário")+'</strong><small class="access-subline">'+safeHtml(x.employee_code||"")+'</small></td><td>'+safeHtml(labels[x.entry_type]||x.entry_type)+'</td><td>'+new Date(x.occurred_at).toLocaleString("pt-BR")+'</td><td>'+safeHtml(x.reason)+'</td><td><input data-missing-note="'+safeHtml(x.id)+'" placeholder="Observação da análise"><div class="wizard-actions"><button class="btn primary small" data-action="resolve-missing-punch" data-request-id="'+safeHtml(x.id)+'" data-company-id="'+safeHtml(companyId)+'" data-decision="approve">Aprovar</button><button class="btn small" data-action="resolve-missing-punch" data-request-id="'+safeHtml(x.id)+'" data-company-id="'+safeHtml(companyId)+'" data-decision="reject">Rejeitar</button></div></td></tr>').join(""):'<tr><td colspan="5" class="empty-cell">Nenhuma marcação esquecida aguardando aprovação.</td></tr>';
 host.innerHTML='<section class="access-wizard"><div class="wizard-head"><div><p class="eyebrow">PONTO ESQUECIDO</p><h2>Marcações esquecidas pendentes ('+pending.length+')</h2><p>Solicitações aguardando análise e aprovação do responsável.</p></div><button class="btn primary" data-action="open-missing-form">＋ Nova solicitação</button></div><form id="missingPunchForm" class="access-form" hidden><label>Funcionário<select name="employee_id" required>'+employeeOptions+'</select></label><label>Tipo de marcação<select name="entry_type" required><option value="clock_in">Entrada</option><option value="break_start">Saída para intervalo</option><option value="break_end">Retorno do intervalo</option><option value="clock_out">Saída final</option></select></label><label>Data<input name="date" type="date" value="'+localDateValue()+'" required></label><label>Horário<input name="time" type="time" required></label><label class="full">Justificativa<textarea name="reason" rows="2" minlength="8" required placeholder="Informe por que a marcação não foi realizada."></textarea></label><button class="btn primary full" type="submit">Enviar para aprovação</button><p class="login-error full" id="missingPunchError"></p></form><div class="table-wrap"><table><thead><tr><th>FUNCIONÁRIO</th><th>MARCAÇÃO</th><th>DATA/HORA</th><th>JUSTIFICATIVA</th><th>DECISÃO</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+(history.length?'<p class="wizard-hint">Solicitações já tratadas: '+history.length+'.</p>':"")+'</section>';
 await loadLocationReviewQueue(host,companyId);
}
let auditOpen=false,auditTab="companies",auditCompanyDetailId=null;
let reportType="mirror",reportMenuOpen=false,reportFromDate=localDateValue().slice(0,8)+"01",reportToDate=localDateValue();
function renderReports(){
 if(inCompanyCtx())return heading("DP E RELATÓRIOS","Relatórios","Em breve novos relatórios estarão disponíveis aqui.")+'<div class="panel reports-soon"><span class="reports-soon-icon">▤</span><div><strong>Espelho de ponto e Resumo de jornada</strong><p>Esses relatórios agora ficam na aba <b>Funcionários</b>, junto da equipe.</p></div><button class="btn primary" data-view="employees">Ir para Funcionários</button></div>';
 if(auditOpen)return '<div class="audit-wrap">'+heading("CONTROLE ADMINISTRATIVO","Auditoria","Acompanhe o histórico de cada empresa, o arquivo morto e os eventos gerais.",'<button class="btn" data-action="back-reports">← Voltar aos relatórios</button>')+'<div class="company-detail-tabs">'+[["companies","Histórico por empresa"],["archive","Arquivo morto"],["all","Eventos gerais"]].map(t=>'<button class="company-detail-tab '+(auditTab===t[0]?"active":"")+'" data-action="audit-tab" data-tab="'+t[0]+'">'+t[1]+'</button>').join("")+'</div><div id="auditPanel" class="table-panel audit-panel"><div class="empty-state">Carregando auditoria...</div></div></div>';
 if(isMasterHome())return renderExecutiveReports();
 if(!reportMenuOpen)return heading("DP E RELATÓRIOS","Relatórios","Selecione qual relatório deseja acessar.")+
 '<div class="quick-actions report-choice-grid"><button class="quick-action" data-action="report-type" data-report-type="mirror"><span class="quick-icon">▤</span><span><strong>Espelho de ponto</strong><small>Marcações diárias por funcionário</small></span><span class="quick-arrow">›</span></button><button class="quick-action" data-action="report-type" data-report-type="summary"><span class="quick-icon">◷</span><span><strong>Resumo de jornada</strong><small>Total de horas por funcionário</small></span><span class="quick-arrow">›</span></button>'+'</div>';
 return heading("DP E RELATÓRIOS",reportType==="mirror"?"Espelho de ponto":"Resumo de jornada","Configure a empresa e o período para consultar o relatório.",'<button class="btn" data-action="back-report-menu">← Voltar aos relatórios</button>')+
 reportFiltersHtml()+'<div id="reportsPanel" class="table-panel"><div class="empty-state">Escolha a empresa e o período e clique em Consultar.</div></div>';
}
function reportExportContext(){
 const panel=$("#reportsPanel");if(!panel||!window.PontoDocs)return null;const D=window.PontoDocs;
 const select=$("#reportCompanySelect"),company=select?.selectedOptions?.[0]?.textContent?.trim()||state.company,period=new Date(reportFromDate+"T12:00:00").toLocaleDateString("pt-BR")+" a "+new Date(reportToDate+"T12:00:00").toLocaleDateString("pt-BR");
 const title=reportType==="mirror"?"Espelho de ponto":"Resumo de jornada";
 const groups=[...panel.querySelectorAll(".report-employee")];
 const meta=[["Empresa",company],["Período",period],["Tipo",title]];
 if(reportType==="mirror"&&groups.length){
  const sections=groups.map(g=>{const name=g.querySelector(".report-employee-head strong")?.textContent.trim()||"Funcionário",code=g.querySelector(".report-employee-head small")?.textContent.trim()||"",t=D.readTable(g.querySelector("table"));return {name,code,t};});
  const totalMin=sections.reduce((n,x)=>n+x.t.rows.reduce((m,r)=>{const v=(r[r.length-1]||"").split(":");return m+(Number(v[0])||0)*60+(Number(v[1])||0);},0),0);
  return {title,company,period,meta:[...meta,["Funcionários",String(sections.length)]],slug:"espelho-de-ponto",kpis:[["Funcionários",String(sections.length)],["Dias com marcação",String(sections.reduce((n,x)=>n+x.t.rows.length,0))],["Horas trabalhadas",reportMinutesLabel(totalMin)]],
   pdfSections:sections.map(x=>({title:x.name,note:x.code?"Matrícula "+x.code:"",html:D.tableHtml(x.t.headers,x.t.rows,{numeric:[1,2,3,4,5],strong:[5]})})),
   sheets:sections.map((x,i)=>({name:x.name,headers:x.t.headers,rows:x.t.rows}))};
 }
 const table=panel.querySelector("table");if(!table)return null;const t=D.readTable(table);
 if(reportType==="mirror")return null;
 const hours=t.rows.reduce((m,r)=>{const v=(r[r.length-1]||"").split(":");return m+(Number(v[0])||0)*60+(Number(v[1])||0);},0);
 return {title,company,period,meta,slug:"resumo-de-jornada",kpis:[["Funcionários",String(t.rows.length)],["Horas trabalhadas",reportMinutesLabel(hours)]],pdfSections:[{title:"Horas por funcionário",note:"Horas calculadas pelas marcações registradas no período",html:D.tableHtml(t.headers,t.rows,{numeric:[2,3],strong:[0,3]})}],sheets:[{name:"Resumo de jornada",headers:t.headers,rows:t.rows}]};
}
function reportMinutesLabel(value){const n=Math.max(0,Math.round(value||0));return String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0");}
function reportTimeCell(value){return value?new Date(value).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}):"—";}
function buildDailyWork(entries){
 const byDay=new Map();for(const x of entries){const day=localDateForValue(x.occurred_at);if(!byDay.has(day))byDay.set(day,[]);byDay.get(day).push(x);}
 return [...byDay.entries()].map(([day,rows])=>{rows.sort((a,b)=>new Date(a.occurred_at)-new Date(b.occurred_at));const times={};for(const row of rows)if(!times[row.entry_type])times[row.entry_type]=row.occurred_at;let mins=0;if(times.clock_in&&times.break_start)mins+=Math.max(0,(new Date(times.break_start)-new Date(times.clock_in))/60000);if(times.break_end&&times.clock_out)mins+=Math.max(0,(new Date(times.clock_out)-new Date(times.break_end))/60000);if(times.clock_in&&times.clock_out&&!times.break_start&&!times.break_end)mins=Math.max(0,(new Date(times.clock_out)-new Date(times.clock_in))/60000);return {day,rows,times,minutes:mins};}).sort((a,b)=>a.day.localeCompare(b.day));
}
async function loadReportsData(){
 const host=$("#reportsPanel"),companyId=$("#reportCompanySelect")?.value;if(!host)return;if(!companyId){host.innerHTML='<div class="empty-state">Selecione uma empresa para consultar o relatório.</div>';return;}
 reportFromDate=$("#reportFromDate")?.value||reportFromDate;reportToDate=$("#reportToDate")?.value||reportToDate;if(reportFromDate>reportToDate){host.innerHTML='<div class="empty-state">A data inicial não pode ser posterior à data final.</div>';return;}
 host.innerHTML='<div class="empty-state">Gerando relatório...</div>';
 const [{data,error},emp]=await Promise.all([db.functions.invoke("manage-time-entries",{body:{action:"list",company_id:companyId}}),db.from("employees").select("id,full_name,employee_code").eq("company_id",companyId).order("full_name")]);
 if(!$("#reportsPanel"))return;if(error||data?.error){host.innerHTML='<div class="empty-state">Não foi possível gerar: '+safeHtml(data?.error||error?.message)+'</div>';return;}
 const employees=emp.data||[],all=(data?.entries||[]).filter(x=>{const d=localDateForValue(x.occurred_at);return d>=reportFromDate&&d<=reportToDate;}),empMap=new Map(employees.map(x=>[x.id,x]));
 if(reportType==="mirror"){
  const grouped=new Map();for(const x of all){if(!grouped.has(x.employee_id))grouped.set(x.employee_id,[]);grouped.get(x.employee_id).push(x);}
  const groups=[...grouped.entries()].sort((a,b)=>(empMap.get(a[0])?.full_name||"").localeCompare(empMap.get(b[0])?.full_name||""));
  host.innerHTML='<div class="table-toolbar"><div><strong>Espelho de ponto · '+groups.length+' funcionário(s)</strong><small class="access-subline">'+new Date(reportFromDate+"T12:00:00").toLocaleDateString("pt-BR")+' até '+new Date(reportToDate+"T12:00:00").toLocaleDateString("pt-BR")+'</small></div><div class="report-export-actions"><button class="btn" data-action="export-report-excel">Exportar Excel</button><button class="btn primary" data-action="export-report-pdf">Exportar PDF</button></div></div>'+(groups.length?groups.map(([id,items])=>{const employee=empMap.get(id)||{},days=buildDailyWork(items);return '<section class="report-employee"><div class="report-employee-head"><strong>'+safeHtml(employee.full_name||items[0]?.employee_name||"Funcionário")+'</strong><small>'+safeHtml(employee.employee_code||"")+'</small></div><div class="table-wrap"><table><thead><tr><th>DATA</th><th>ENTRADA</th><th>SAÍDA INTERVALO</th><th>RETORNO</th><th>SAÍDA</th><th>TOTAL</th></tr></thead><tbody>'+days.map(d=>'<tr><td>'+new Date(d.day+"T12:00:00").toLocaleDateString("pt-BR")+'</td><td>'+reportTimeCell(d.times.clock_in)+'</td><td>'+reportTimeCell(d.times.break_start)+'</td><td>'+reportTimeCell(d.times.break_end)+'</td><td>'+reportTimeCell(d.times.clock_out)+'</td><td><strong>'+reportMinutesLabel(d.minutes)+'</strong></td></tr>').join("")+'</tbody></table></div></section>';}).join(""):'<div class="empty-state">Nenhuma marcação encontrada no período.</div>');
 }else{
  const summary=employees.map(employee=>{const days=buildDailyWork(all.filter(x=>x.employee_id===employee.id));return {...employee,days:days.length,minutes:days.reduce((n,d)=>n+d.minutes,0)};}).filter(x=>x.days>0).sort((a,b)=>a.full_name.localeCompare(b.full_name));
  host.innerHTML='<div class="table-toolbar"><div><strong>Resumo de jornada · '+summary.length+' funcionário(s)</strong><small class="access-subline">Horas calculadas pelas marcações registradas no período</small></div><div class="report-export-actions"><button class="btn" data-action="export-report-excel">Exportar Excel</button><button class="btn primary" data-action="export-report-pdf">Exportar PDF</button></div></div><div class="table-wrap"><table><thead><tr><th>FUNCIONÁRIO</th><th>MATRÍCULA</th><th>DIAS COM MARCAÇÃO</th><th>TOTAL TRABALHADO</th></tr></thead><tbody>'+(summary.length?summary.map(x=>'<tr><td><strong>'+safeHtml(x.full_name)+'</strong></td><td>'+safeHtml(x.employee_code||"—")+'</td><td>'+x.days+'</td><td><strong>'+reportMinutesLabel(x.minutes)+'</strong></td></tr>').join(""):'<tr><td colspan="4" class="empty-cell">Nenhuma jornada encontrada no período.</td></tr>')+'</tbody></table></div>';
 }
}
let auditLogsCache=[],auditCompanyMap=new Map(),auditProfileMap=new Map();
async function loadAuditPanel(){
 const panel=$("#auditPanel");if(!panel)return;
 if(authProfile?.role!=="kr_admin"){panel.innerHTML='<div class="empty-state">A auditoria está disponível somente para a KR Admin.</div>';return;}
 panel.innerHTML='<div class="empty-state">Consultando registros...</div>';
 const [companiesResult,logsResult,profilesResult]=await Promise.all([
  db.from("companies").select("id,legal_name,trade_name,cnpj,email,status,created_at,archived_at,archived_reason").order("trade_name"),
  db.from("audit_logs").select("id,company_id,actor_id,action,entity_table,entity_id,details,created_at").order("created_at",{ascending:false}).limit(2000),
  db.from("profiles").select("id,full_name,email,role")
 ]);
 if(!$("#auditPanel"))return;
 const err=companiesResult.error||logsResult.error||profilesResult.error;
 if(err){panel.innerHTML='<div class="empty-state">Não foi possível carregar a auditoria: '+safeHtml(err.message)+'</div>';return;}
 const companiesData=companiesResult.data||[];
 auditLogsCache=logsResult.data||[];auditCompanyCache=companiesData;
 auditCompanyMap=new Map(companiesData.map(c=>[c.id,c]));auditProfileMap=new Map((profilesResult.data||[]).map(p=>[p.id,p]));
 paintAuditPanel();
}
function auditCompanyLogs(id,logs){return (logs||auditLogsCache).filter(l=>l.company_id===id||(l.entity_table==="companies"&&l.entity_id===id));}
function paintAuditPanel(){
 const panel=$("#auditPanel");if(!panel)return;
 const logs=auditLogsCache,companies=auditCompanyCache||[];
 if(auditTab==="archive"){
  const archived=companies.filter(c=>c.archived_at);
  panel.innerHTML='<div class="audit-toolbar"><strong>Empresas arquivadas <span class="muted">('+archived.length+')</span></strong></div>'+(archived.length?'<div class="audit-company-grid">'+archived.map(c=>'<article class="audit-company-card archived"><div class="audit-card-head"><span class="company-card-mark">▦</span><div><strong>'+safeHtml(c.trade_name||c.legal_name)+'</strong><small>'+safeHtml(c.cnpj||"CNPJ não informado")+'</small></div></div><p class="audit-card-meta">Arquivada em '+new Date(c.archived_at).toLocaleDateString("pt-BR")+(c.archived_reason?' · '+safeHtml(c.archived_reason):'')+'</p><div class="audit-card-actions"><button class="btn small" data-action="audit-company-events" data-company-id="'+c.id+'">Ver histórico</button><button class="btn small primary" data-action="restore-company" data-company-id="'+c.id+'">Restaurar</button></div></article>').join("")+'</div>':'<div class="empty-state">Nenhuma empresa no arquivo morto.</div>');
  return;
 }
 if(auditTab==="all"){
  panel.innerHTML='<div class="audit-toolbar"><strong>Todos os eventos <span class="muted">(últimos '+Math.min(logs.length,200)+')</span></strong></div>'+auditTimeline(logs.slice(0,200),true);
  return;
 }
 const q=(window.__auditSearch||"").toLocaleLowerCase("pt-BR");
 const active=companies.filter(c=>!c.archived_at);
 panel.innerHTML='<div class="audit-toolbar"><strong>Empresas <span class="muted">('+active.length+')</span></strong><input class="search" id="auditSearch" placeholder="Buscar empresa ou CNPJ..." value="'+safeHtml(window.__auditSearch||"")+'"><div class="wizard-actions"><button class="btn" data-action="export-audit-companies">Exportar Excel</button><button class="btn" data-action="print-audit-companies">Salvar PDF</button></div></div>'+
 (active.length?'<div class="audit-company-grid" id="auditGrid">'+active.map(c=>{const ev=auditCompanyLogs(c.id),last=ev[0];return '<article class="audit-company-card" data-search="'+safeHtml(((c.trade_name||"")+" "+(c.legal_name||"")+" "+(c.cnpj||"")).toLocaleLowerCase("pt-BR"))+'"'+(q&&!((c.trade_name||"")+" "+(c.legal_name||"")+" "+(c.cnpj||"")).toLocaleLowerCase("pt-BR").includes(q)?' hidden':'')+'><div class="audit-card-head"><span class="company-card-mark">▦</span><div><strong>'+safeHtml(c.trade_name||c.legal_name)+'</strong><small>'+safeHtml(c.cnpj||"CNPJ não informado")+'</small></div></div><div class="audit-card-stats"><div><b>'+ev.length+'</b><small>evento(s)</small></div><div><b>'+(last?new Date(last.created_at).toLocaleDateString("pt-BR"):"—")+'</b><small>último registro</small></div></div><div class="audit-card-actions"><button class="btn small primary" data-action="audit-company-events" data-company-id="'+c.id+'">Ver histórico</button><button class="btn small" data-action="archive-company" data-company-id="'+c.id+'">Arquivar</button></div></article>';}).join("")+'</div>':'<div class="empty-state">Nenhuma empresa cadastrada.</div>');
}
function auditTimeline(logs,showCompany){
 if(!logs.length)return '<div class="empty-state">Nenhum evento registrado. Eventos antigos não são recuperados retroativamente.</div>';
 return '<div class="audit-timeline">'+logs.map(l=>{const p=auditProfileMap.get(l.actor_id),c=auditCompanyMap.get(l.company_id);return '<div class="audit-event"><span class="audit-dot '+safeHtml(l.entity_table||"")+'"></span><div class="audit-event-body"><div class="audit-event-top"><strong>'+safeHtml(auditActionLabel(l.action))+'</strong><span class="pill info">'+safeHtml(auditEntityLabel(l.entity_table))+'</span><time>'+new Date(l.created_at).toLocaleString("pt-BR")+'</time></div><p>'+safeHtml(auditDetailsText(l))+'</p><small>Por '+safeHtml(p?.full_name||p?.email||"KR / Sistema")+(showCompany&&c?' · '+safeHtml(c.trade_name||c.legal_name):'')+'</small></div></div>';}).join("")+'</div>';
}
async function openCompanyAuditModal(companyId){
 const c=auditCompanyMap.get(companyId);if(!c)return;
 openLaunchModal("Histórico · "+(c.trade_name||c.legal_name),"Tudo o que foi registrado para esta empresa: cadastro, funcionários e usuários.","<div class=\"empty-state\">Carregando histórico...</div>");
 $("#launchModal .launch-modal")?.classList.add("wide");
 const {data,error}=await db.from("audit_logs").select("id,company_id,actor_id,action,entity_table,entity_id,details,created_at").or("company_id.eq."+companyId+",and(entity_table.eq.companies,entity_id.eq."+companyId+")").order("created_at",{ascending:false}).limit(500);
 const body=$("#launchModalBody");if(!body)return;
 if(error){body.innerHTML='<p class="login-error">Não foi possível carregar: '+safeHtml(error.message)+'</p>';return;}
 const logs=data||[];window.__auditModalLogs=logs;window.__auditModalCompany=companyId;
 const cnt=t=>logs.filter(l=>l.entity_table===t).length;
 body.innerHTML='<div class="exec-kpis"><div class="exec-kpi"><small>Total de eventos</small><strong>'+logs.length+'</strong></div><div class="exec-kpi"><small>Empresa</small><strong>'+cnt("companies")+'</strong></div><div class="exec-kpi"><small>Funcionários</small><strong>'+cnt("employees")+'</strong></div><div class="exec-kpi"><small>Usuários</small><strong>'+cnt("profiles")+'</strong></div></div><div class="audit-export-bar"><label>Exportar<select id="auditExportScope"><option value="all">Todas as movimentações</option><option value="companies">Somente da empresa</option><option value="employees">Somente dos funcionários</option><option value="profiles">Somente dos usuários</option></select></label><button class="btn" data-action="audit-export-excel">Excel</button><button class="btn primary" data-action="audit-export-pdf">PDF</button></div><div class="audit-filter" id="auditFilter">'+[["all","Todos"],["companies","Empresa"],["employees","Funcionários"],["profiles","Usuários"]].map((f,i)=>'<button type="button" class="company-detail-tab'+(i?"":" active")+'" data-action="audit-filter" data-filter="'+f[0]+'">'+f[1]+'</button>').join("")+'</div><div id="auditModalList">'+auditTimeline(logs,false)+'</div>';
}
function auditEntityLabel(table){
 return ({companies:"Empresa",profiles:"Usuário / acesso",employees:"Funcionário",terminal_devices:"Terminal de marcação",employee_biometrics:"Biometria",company_locations:"Local da empresa",time_bank_movements:"Banco de horas",time_entries:"Lançamento"})[table]||"Registro";
}
function auditActionLabel(action){
 const labels={
  "companies.insert":"Empresa cadastrada","companies.update":"Dados da empresa alterados","companies.delete":"Empresa excluída",
  "profiles.insert":"Acesso de usuário criado","profiles.update":"Dados do usuário alterados","profiles.delete":"Acesso de usuário removido",
  "employees.insert":"Funcionário cadastrado","employees.update":"Dados do funcionário alterados","employees.delete":"Funcionário excluído",
  "company.created_by_kr":"Cadastro de empresa realizado pela KR",
  "company_admin.access_created":"Acesso do administrador da empresa criado",
  "company_admin.initial_password_set":"Senha inicial definida",
  "company.access.temporary_password_issued":"Senha temporária reenviada",
  "employee.pin.updated":"PIN do funcionário alterado","employee.pin.created":"PIN do funcionário criado",
  "terminal.device.activated":"Terminal ativado","terminal.device.revoked":"Terminal revogado","terminal.device.issued":"Código de terminal gerado",
  "employee.biometric.approved":"Biometria aprovada","employee.biometric.enrollment_pending":"Cadastro de biometria iniciado","employee.biometric.revoked":"Biometria revogada",
  "company.location.updated_from_terminal":"Local da empresa atualizado pelo terminal",
  "time_bank.movement_created":"Movimentação de banco de horas registrada","company.updated_by_kr":"Cadastro da empresa atualizado pela KR"
 };
 return labels[action]||"Movimentação registrada";
}
function auditDetailsText(log){
 const d=log.details||{},before=d.before||{},after=d.after||{};
 if(log.action==="company.created_by_kr")return "Empresa: "+(d.company||"não informada")+(d.cnpj?" • CNPJ: "+d.cnpj:"");
 if(log.action==="company_admin.access_created")return "Acesso criado para: "+(d.email||"e-mail não informado");
 if(log.action==="company_admin.initial_password_set")return "Senha inicial emitida. A troca será solicitada no primeiro acesso.";
 if(log.action==="company.access.temporary_password_issued")return "Senha temporária reenviada para: "+(d.email||"e-mail não informado")+". A troca será solicitada no próximo acesso.";
 if(log.action==="companies.insert"||log.action==="companies.update"){
  const item=after.trade_name||after.legal_name||d.company;
  return (item?"Empresa: "+item+". ":"")+(after.status?"Situação: "+(after.status==="active"?"Ativa":after.status):"Cadastro/alteração registrado.");
 }
 if(log.action==="profiles.insert")return "Usuário: "+(after.full_name||"não identificado")+". Perfil: "+(after.role==="analyst"?"Analista":after.role==="company_admin"?"Administrador da empresa":after.role||"não informado")+".";
 if(log.action==="profiles.update"){
  const changes=[];
  if(before.full_name!==after.full_name&&after.full_name)changes.push("nome para "+after.full_name);
  if(before.role!==after.role&&after.role)changes.push("perfil para "+(after.role==="analyst"?"Analista":after.role==="company_admin"?"Administrador da empresa":after.role));
  if(before.active!==after.active&&after.active!==undefined)changes.push(after.active?"acesso ativado":"acesso desativado");
  return changes.length?"Alteração: "+changes.join("; ")+".":"Dados do usuário revisados/atualizados.";
 }
 if(log.action==="employees.insert"||log.action==="employees.update"||log.action==="employees.delete"){const n=after.full_name||before.full_name;return (n?"Funcionário: "+n+". ":"")+(log.action==="employees.insert"?"Cadastro realizado.":log.action==="employees.delete"?"Cadastro removido.":"Dados atualizados.");}
 const hm=m=>{m=Math.abs(Number(m)||0);return Math.floor(m/60)+"h"+String(m%60).padStart(2,"0");};
 if(log.action==="employee.pin.updated"||log.action==="employee.pin.created")return "O PIN de marcação do funcionário foi definido ou redefinido. O valor não é exibido.";
 if(log.action==="terminal.device.activated")return "Terminal de marcação ativado para uso.";
 if(log.action==="terminal.device.revoked")return "Acesso do terminal de marcação revogado.";
 if(log.action==="employee.biometric.approved")return "Biometria facial aprovada e ativada para o funcionário.";
 if(log.action==="employee.biometric.enrollment_pending")return "Cadastro de biometria facial iniciado e aguardando aprovação.";
 if(log.action==="company.location.updated_from_terminal")return "Localização da empresa definida pelo terminal"+(d.allowed_radius_m?" com raio permitido de "+d.allowed_radius_m+" m.":".");
 if(log.action==="time_bank.movement_created")return (d.movement_type==="debit"?"Débito":"Crédito")+" de "+hm(d.minutes)+(d.occurred_on?" em "+new Date(d.occurred_on+"T12:00:00").toLocaleDateString("pt-BR"):"")+(d.note?" — "+d.note:"")+".";
 if(d.operation==="company_updated")return "Cadastro da empresa atualizado"+(d.company?": "+d.company:"")+".";
 return "Movimentação registrada.";
}
function auditEventsTable(logs,companyMap,profileMap){
 return '<div class="table-wrap"><table><thead><tr><th>DATA/HORA</th><th>EMPRESA</th><th>TIPO</th><th>AÇÃO</th><th>RESPONSÁVEL</th><th>DETALHES</th></tr></thead><tbody>'+(logs.length?logs.map(l=>{const p=profileMap.get(l.actor_id),c=companyMap.get(l.company_id),d=l.details||{};return '<tr><td>'+new Date(l.created_at).toLocaleString("pt-BR")+'</td><td>'+safeHtml(c?.trade_name||c?.legal_name||"KR / Geral")+'</td><td>'+safeHtml(auditEntityLabel(l.entity_table))+'</td><td>'+safeHtml(auditActionLabel(l.action))+'</td><td>'+safeHtml(p?.full_name||p?.email||"KR / Sistema")+'</td><td>'+safeHtml(auditDetailsText(l))+'</td></tr>';}).join(""):'<tr><td colspan="6" class="empty-cell">Nenhum evento disponível. Eventos antigos não são recuperados retroativamente.</td></tr>')+'</tbody></table></div>';
}
async function setCompanyArchived(companyId,archived){
 if(authProfile?.role!=="kr_admin"){toast("Somente a KR Admin pode arquivar empresas.");return;}
 const reason=archived?(window.prompt("Motivo do arquivamento (opcional):")||""):null;
 const patch=archived?{archived_at:new Date().toISOString(),archived_by:authUser.id,archived_reason:reason}:{archived_at:null,archived_by:null,archived_reason:null};
 const {error}=await db.from("companies").update(patch).eq("id",companyId);
 if(error){toast("Não foi possível atualizar o arquivo morto: "+error.message);return;}
 toast(archived?"Empresa arquivada.":"Empresa restaurada.");loadAuditPanel();
}
function exportAuditCompanies(){
 const D=window.PontoDocs;if(!D){toast("Exportação indisponível.");return;}
 const rows=(auditCompanyCache||[]).map(c=>[c.trade_name||c.legal_name||"",c.legal_name||"",c.cnpj||"",c.status==="inactive"?"Inativa":"Ativa",c.created_at?new Date(c.created_at).toLocaleDateString("pt-BR"):"",String(auditCompanyLogs(c.id).length),c.archived_at?new Date(c.archived_at).toLocaleDateString("pt-BR"):""]);
 if(!D.saveExcel({filename:"Kronius-auditoria-empresas.xlsx",title:"Auditoria de empresas",meta:[["Emitido por",authProfile?.full_name||"KR Contábil"],["Data",new Date().toLocaleDateString("pt-BR")]],sheets:[{name:"Empresas",headers:["Empresa","Razão social","CNPJ","Situação","Cadastro","Eventos","Arquivada em"],rows}]}))toast("Não foi possível gerar o Excel agora.");
}
function printAuditCompanies(){
 const D=window.PontoDocs;if(!D)return;
 const rows=(auditCompanyCache||[]).map(c=>[c.trade_name||c.legal_name||"",c.cnpj||"—",c.status==="inactive"?"Inativa":"Ativa",c.created_at?new Date(c.created_at).toLocaleDateString("pt-BR"):"—",String(auditCompanyLogs(c.id).length),c.archived_at?"Arquivada":"—"]);
 if(!D.openPdf({kicker:"Controle administrativo",title:"Auditoria de empresas",subtitle:"Emitido por "+(authProfile?.full_name||"KR Contábil"),meta:[["Empresas",String(rows.length)]],sections:[{title:"Empresas",html:D.tableHtml(["Empresa","CNPJ","Situação","Cadastro","Eventos","Arquivo"],rows,{strong:[0],numeric:[4]})}],landscape:false}))toast("Permita a abertura de pop-ups para gerar o PDF.");
}
let auditCompanyCache=[];
function renderVacations(){
 const companyId=state.companyId;
 const html=heading("GESTÃO DE PESSOAS","Férias","Acompanhe os períodos de férias dos funcionários da empresa selecionada.",'<button class="btn primary" data-action="new-vacation">＋ Registrar férias</button>')+
 '<div id="vacationPanel" class="table-panel"><div class="empty-state">Carregando períodos de férias...</div></div>';
 setTimeout(async()=>{
  const panel=$("#vacationPanel");if(!panel)return;
  if(!companyId){panel.innerHTML='<div class="empty-state">Selecione uma empresa no seletor superior para consultar os períodos de férias.</div>';return;}
  const {data,error}=await db.from("employee_vacations").select("id,start_date,end_date,notes,employees(full_name)").eq("company_id",companyId).order("start_date");
  if(!$("#vacationPanel"))return;
  if(error){panel.innerHTML='<div class="empty-state">Não foi possível carregar as férias: '+safeHtml(error.message)+'</div>';return;}
  panel.innerHTML='<div class="table-toolbar"><strong>Períodos programados ('+(data||[]).length+')</strong></div><div class="table-wrap"><table><thead><tr><th>FUNCIONÁRIO</th><th>INÍCIO</th><th>TÉRMINO</th><th>OBSERVAÇÕES</th></tr></thead><tbody>'+
  ((data||[]).length?(data||[]).map(v=>'<tr><td><strong>'+safeHtml(v.employees?.full_name||"Funcionário")+'</strong></td><td>'+new Date(v.start_date+"T12:00:00").toLocaleDateString("pt-BR")+'</td><td>'+new Date(v.end_date+"T12:00:00").toLocaleDateString("pt-BR")+'</td><td>'+safeHtml(v.notes||"—")+'</td></tr>').join(""):'<tr><td colspan="4" class="empty-cell">Nenhum período de férias cadastrado para esta empresa.</td></tr>')+'</tbody></table></div>';
 },0);
 return html;
}
function renderClock(){return `${heading("PWA DO FUNCIONÁRIO","Terminal de marcação","Acesse o aplicativo exclusivo para registrar entrada, intervalos e saída dos colaboradores.")}<div class="access-wizard"><div class="wizard-head"><div><p class="eyebrow">KRONIUS · TERMINAL</p><h2>Marcação de ponto pelo celular ou tablet</h2><p>O terminal é instalado no aparelho da empresa, ativado por um código temporário e vinculado à empresa. Cada funcionário utiliza sua matrícula e seu PIN para registrar o ponto.</p></div></div><div class="wizard-actions"><a class="btn primary" href="./terminal/" target="_blank" rel="noopener">Abrir terminal de ponto ↗</a>${authProfile?.role==="kr_admin"?'<button class="btn" data-view="devices">Configurar aparelhos e localização</button>':""}</div><p class="wizard-hint">Antes da primeira marcação, gere o código de ativação e configure a localização permitida na aba Dispositivos. O aparelho precisa estar conectado à internet para enviar os registros.</p></div>`}
function applyAnalystActionPermissions(){
 if(authProfile?.role!=="analyst")return;
 const a=authProfile.permissions?.actions||{};
 const rules={"new-company":["companies","create"],"new-employee":["employees","create"],"new-vacation":["vacations","create"],"new-leave":["leaves","create"],"generate-employee-access":["employees","create"],"generate-one-employee-access":["employees","create"],"issue-terminal-code":["devices","create"],"revoke-terminal":["devices","delete"],"capture-company-location":["devices","edit"],"export-audit-companies":["reports","export"],"print-audit-companies":["reports","export"],"open-audit":["reports","view"]};
 document.querySelectorAll("[data-action]").forEach(el=>{const rule=rules[el.dataset.action];if(rule&&a[rule[0]]?.[rule[1]]===false)el.hidden=true;});
 const formRules={employeeCreateForm:["employees","create"],vacationCreateForm:["vacations","create"],leaveCreateForm:["leaves","create"],companyLocationForm:["devices","edit"],companySettingsForm:["settings","edit"]};
 document.querySelectorAll("form").forEach(form=>{const rule=formRules[form.id];if(rule&&a[rule[0]]?.[rule[1]]===false)form.hidden=true;});
}
function renderLeaves(){
 const options=(accessCompanies||[]).map(c=>'<option value="'+c.id+'" '+(c.id===state.companyId?'selected':'')+'>'+safeHtml(c.trade_name||c.legal_name)+'</option>').join("");
 return heading("GESTÃO DE PESSOAS","Afastamentos","Registre e acompanhe períodos de afastamento dos funcionários da empresa selecionada.",'<button class="btn primary" data-action="new-leave">＋ Registrar afastamento</button>')+
 '<section class="access-wizard records-toolbar"><label>Empresa<select id="leavesCompanySelect">'+(options||'<option value="">Selecione uma empresa</option>')+'</select></label><button class="btn" data-action="refresh-leaves">Atualizar</button></section><div id="leaveEditor" class="access-wizard" hidden></div><div id="leavesPanel" class="table-panel"><div class="empty-state">Carregando afastamentos...</div></div>';
}
async function loadLeavesPanel(){
 const host=$("#leavesPanel"),companyId=$("#leavesCompanySelect")?.value||state.companyId;if(!host)return;if(!companyId){host.innerHTML='<div class="empty-state">Selecione uma empresa para consultar os afastamentos.</div>';return;}
 host.innerHTML='<div class="empty-state">Consultando afastamentos...</div>';
 const {data,error}=await db.from("employee_leaves").select("id,employee_id,leave_type,start_date,end_date,notes,employees(full_name,employee_code)").eq("company_id",companyId).order("start_date",{ascending:false});
 if(!$("#leavesPanel"))return;if(error){host.innerHTML='<div class="empty-state">Não foi possível consultar: '+safeHtml(error.message)+'</div>';return;}
 const types={atestado:"Atestado",maternidade:"Licença-maternidade",acidente_trabalho:"Acidente de trabalho",servico_militar:"Serviço militar",licenca_nao_remunerada:"Licença não remunerada",outros:"Outros"},rows=data||[];
 host.innerHTML='<div class="table-toolbar"><strong>Afastamentos registrados ('+rows.length+')</strong></div><div class="table-wrap"><table><thead><tr><th>FUNCIONÁRIO</th><th>TIPO</th><th>INÍCIO</th><th>TÉRMINO</th><th>SITUAÇÃO</th><th>OBSERVAÇÕES</th></tr></thead><tbody>'+(rows.length?rows.map(x=>'<tr><td><strong>'+safeHtml(x.employees?.full_name||"Funcionário")+'</strong><small class="access-subline">'+safeHtml(x.employees?.employee_code||"")+'</small></td><td>'+types[x.leave_type]+'</td><td>'+new Date(x.start_date+"T12:00:00").toLocaleDateString("pt-BR")+'</td><td>'+(x.end_date?new Date(x.end_date+"T12:00:00").toLocaleDateString("pt-BR"):"Em aberto")+'</td><td>'+badge(!x.end_date||x.end_date>=localDateValue()?"Em andamento":"Encerrado")+'</td><td>'+safeHtml(x.notes||"—")+'</td></tr>').join(""):'<tr><td colspan="6" class="empty-cell">Nenhum afastamento cadastrado para esta empresa.</td></tr>')+'</tbody></table></div>';
}
function openLeaveWizard(){
 const box=$("#leaveEditor"),companyId=$("#leavesCompanySelect")?.value||state.companyId;if(!box||!companyId){toast("Selecione uma empresa antes de registrar o afastamento.");return;}
 box.hidden=false;box.innerHTML='<div class="wizard-head"><div><p class="eyebrow">NOVO REGISTRO</p><h2>Registrar afastamento</h2><p>Informe o período e a categoria. Não inclua diagnóstico, CID ou detalhes médicos nas observações.</p></div><button class="btn" data-action="close-leave">Fechar</button></div><form id="leaveCreateForm" class="access-form"><input type="hidden" name="company_id" value="'+companyId+'"><label>Funcionário<select name="employee_id" id="leaveEmployee" required><option value="">Carregando...</option></select></label><label>Tipo de afastamento<select name="leave_type" required><option value="atestado">Atestado</option><option value="maternidade">Licença-maternidade</option><option value="acidente_trabalho">Acidente de trabalho</option><option value="servico_militar">Serviço militar</option><option value="licenca_nao_remunerada">Licença não remunerada</option><option value="outros">Outros</option></select></label><label>Data de início<input type="date" name="start_date" required></label><label>Data de término<input type="date" name="end_date"></label><label class="full">Observações administrativas<textarea name="notes" rows="2" placeholder="Sem informações clínicas ou diagnóstico."></textarea></label><button class="btn primary full" type="submit">Salvar afastamento</button><p id="leaveFormError" class="login-error full"></p></form>';
 mountEditorModal("leaveEditor","Registrar afastamento","Informe o período e a categoria do afastamento.");
 db.from("employees").select("id,full_name,employee_code").eq("company_id",companyId).eq("status","active").order("full_name").then(({data,error})=>{const sel=$("#leaveEmployee");if(!sel)return;sel.innerHTML=error?'<option value="">Falha ao carregar</option>':'<option value="">Selecione o funcionário</option>'+(data||[]).map(x=>'<option value="'+x.id+'">'+safeHtml(x.full_name)+' · '+safeHtml(x.employee_code||"")+'</option>').join("");});
}
function companyEditFormHtml(company,profile,withLogin){
  const companyId=company.id;const v=x=>safeHtml(x??"");
  return '<form id="companyEditForm" class="access-form" data-company-id="'+safeHtml(companyId)+'"><label>Razão social<input name="legal_name" required value="'+v(company.legal_name)+'"></label><label>Nome fantasia<input name="trade_name" value="'+v(company.trade_name)+'"></label><label>CNPJ<input name="cnpj" value="'+v(company.cnpj)+'" readonly title="O CNPJ não pode ser alterado"></label><label>Regime tributário<select name="tax_regime">'+regimeOptions(company.tax_regime)+'</select></label><label>E-mail da empresa<input name="email" type="email" value="'+v(company.email)+'"></label><label>Telefone<input name="phone" type="tel" value="'+v(company.phone)+'"></label><label>Responsável legal<input name="legal_representative" value="'+v(company.legal_representative)+'"></label><label>Estimativa de funcionários<input name="average_employees" type="number" min="0" step="1" value="'+v(company.average_employees)+'"></label><label>Status<select name="status"><option value="active"'+(company.status!=="inactive"?' selected':'')+'>Ativa</option><option value="inactive"'+(company.status==="inactive"?' selected':'')+'>Inativa</option></select></label>'+(profile?'<div class="access-rule-list full"><p><strong>Administrador:</strong> '+safeHtml(profile.full_name||"Não cadastrado")+(profile.email?' · '+safeHtml(profile.email):"")+'</p></div>':'')+'<div class="wizard-actions full"><button class="btn primary" type="submit">Salvar alterações</button>'+(withLogin?'<button class="btn" type="button" data-action="company-detail-tab" data-tab="login" data-company-id="'+safeHtml(companyId)+'">Acessar Login da empresa</button>':'')+'</div><p id="companyEditMsg" class="login-error full" role="alert"></p></form>';
}
function renderSettings(){
 const company=accessCompanies.find(c=>c.id===state.companyId);
 if(!company)return heading("SISTEMA","Configurações","Selecione uma empresa no topo para consultar suas configurações.")+'<div class="access-wizard"><p class="empty-state">A visão master não altera configurações de uma empresa sem seleção.</p></div>';
 if(authProfile?.role==="kr_admin")return heading("CADASTRO","Cadastro da empresa","Dados completos da empresa em uso. As alterações valem para o cadastro oficial.")+'<section class="access-wizard">'+companyEditFormHtml(company,null,false)+'</section>';
 return heading("SISTEMA","Configurações","Confira e atualize os dados cadastrais da empresa em uso.")+'<section class="access-wizard"><div class="wizard-head"><div><p class="eyebrow">DADOS DA EMPRESA</p><h2>'+safeHtml(company.trade_name||company.legal_name)+'</h2><p>As alterações são salvas no cadastro da empresa selecionada.</p></div></div><form id="companySettingsForm" class="access-form"><label class="full">Razão social<input name="legal_name" required value="'+safeHtml(company.legal_name||"")+'"></label><label>Nome fantasia<input name="trade_name" value="'+safeHtml(company.trade_name||"")+'"></label><label>CNPJ<input value="'+safeHtml(company.cnpj||"")+'" disabled></label><label>E-mail<input name="email" type="email" value="'+safeHtml(company.email||"")+'"></label><label>Telefone<input name="phone" value="'+safeHtml(company.phone||"")+'"></label><button class="btn primary full" type="submit">Salvar configurações</button><p id="companySettingsError" class="login-error full"></p></form></section>';
}

function renderApp(){
 const views={dashboard:renderDashboard,companies:renderCompanies,employees:renderEmployees,devices:renderDevices,records:renderRecords,pending:renderPending,reports:renderReports,clock:renderClock,vacations:renderVacations,leaves:renderLeaves,settings:renderSettings,"bank-hours":renderTimeBank};
 const titles={dashboard:"Visão geral",companies:"Gestão de acessos",employees:"Funcionários",devices:"Dispositivos",records:"Lançamentos",pending:"Pendências",reports:"Relatórios",clock:"PWA de marcação",vacations:"Férias",leaves:"Afastamentos",settings:authProfile?.role==="kr_admin"?"Cadastro da empresa":"Configurações","bank-hours":"Banco de horas"};
 const tabs=authProfile?.permissions?.tabs||{};if(authProfile?.role!=="kr_admin"&&state.view==="devices")state.view="dashboard";if(isCompanyRole()&&["pending","timesheets","companies"].includes(state.view))state.view="dashboard";if(authProfile?.role==="analyst"&&tabs[state.view]===false)state.view="dashboard";if(authProfile?.role==="kr_admin"){if(state.companyId&&["companies","access"].includes(state.view))state.view="dashboard";if(!state.companyId&&!["companies","reports","access"].includes(state.view))state.view="companies";}
 persistNavigationState();
 $("#content").innerHTML=contextBar()+(views[state.view]||renderDashboard)();applyAnalystActionPermissions();
 const crumb=$("#pageCrumb");if(crumb)crumb.textContent=titles[state.view]||"Configurações";
 document.querySelectorAll(".nav-item").forEach(b=>{b.hidden=(b.dataset.view==="devices"&&authProfile?.role!=="kr_admin")||(authProfile?.role==="analyst"&&tabs[b.dataset.view]===false);b.classList.toggle("active",b.dataset.view===state.view)});
 const accessNav=$("#accessNav");if(accessNav)accessNav.hidden=authProfile?.role!=="kr_admin";
 const bankNav=$("#timeBankNav");if(bankNav)bankNav.hidden=!["kr_admin","company_admin","company_user","analyst"].includes(authProfile?.role);
 if(state.view!=="reports")execData=null; applyNavContext();$("#sidebar").classList.remove("open");
 const search=$("#searchTable");if(search)search.addEventListener("input",()=>{const q=search.value.toLowerCase();$("#dataTable")?.querySelectorAll("tbody tr").forEach(tr=>tr.style.display=tr.innerText.toLowerCase().includes(q)?"":"none");});
 if(state.view==="clock")updateClock();if(state.view==="employees")loadEmployeeDirectory();if(state.view==="devices")loadDevicesPanel();if(state.view==="records")loadRecordsPanel();if(state.view==="pending")loadPendingPanel();if(state.view==="reports"&&auditOpen)loadAuditPanel();if(state.view==="reports"&&isMasterHome()&&!auditOpen)loadExecutivePanel();if(state.view==="leaves")loadLeavesPanel();if(state.view==="bank-hours")loadTimeBankPanel();if(state.view==="dashboard")loadDashboardStats();
}
let dashRefreshTimer=null;
async function loadDashboardStats(){
 if(!$("#dashActiveEmployees"))return;
 clearInterval(dashRefreshTimer);dashRefreshTimer=null;
 if(!state.companyId){$("#dashActiveEmployees").textContent="—";$("#dashTodayPunches").textContent="—";$("#dashPendingCount").textContent="—";$("#dashboardRecentEntries").textContent="Selecione uma empresa no topo para visualizar somente os dados dela.";$("#dashboardCompanyContext").textContent="Visão master · selecione uma empresa para abrir os indicadores.";const up=$("#dashUpdated");if(up)up.textContent="Sem empresa selecionada";return;}
 dashRefreshTimer=setInterval(()=>{if(state.view==="dashboard"&&!document.hidden)loadDashboardStats();},60000);
 const companyId=state.companyId,today=localDateValue();
 const [emp,entriesResult,pendingResult]=await Promise.all([db.from("employees").select("id",{count:"exact",head:true}).eq("company_id",companyId).eq("status","active"),db.functions.invoke("manage-time-entries",{body:{action:"list",company_id:companyId}}),db.functions.invoke("manage-terminal-device",{body:{action:"review_list",company_id:companyId}})]);
 if(!$("#dashActiveEmployees"))return;const entries=(entriesResult.data?.entries||[]).filter(x=>["clock_in","break_start","break_end","clock_out","adjustment"].includes(x.entry_type)),requests=entriesResult.data?.requests||[],todays=entries.filter(x=>localDateForValue(x.occurred_at)===today),activeCount=emp.error?0:(emp.count??0);
 const pendingTotal=requests.filter(x=>x.status==="pending").length+(pendingResult.data?.items||[]).length;
 $("#dashActiveEmployees").textContent=emp.error?"—":String(activeCount);$("#dashTodayPunches").textContent=entriesResult.error?"—":String(todays.length);$("#dashPendingCount").textContent=entriesResult.error?"—":String(pendingTotal);
 const alertBadge=$("#dashPendingAlert");if(alertBadge)alertBadge.hidden=!(pendingTotal>0);
 const typeLabel={clock_in:"Entrada",break_start:"Saída intervalo",break_end:"Retorno intervalo",clock_out:"Saída final",adjustment:"Ajuste"},typeTone={clock_in:"ok",break_end:"ok",break_start:"pending",clock_out:"info",adjustment:"info"};
 const initials=n=>String(n||"?").trim().split(/\s+/).slice(0,2).map(w=>w[0]).join("").toUpperCase();
 const recent=todays.slice().sort((a,b)=>new Date(b.occurred_at)-new Date(a.occurred_at)).slice(0,6);
 $("#dashboardRecentEntries").className=recent.length?"":"empty-state";
 $("#dashboardRecentEntries").innerHTML=recent.length?'<div class="record-list">'+recent.map(x=>'<div class="record"><span class="record-icon">'+safeHtml(initials(x.employee_name))+'</span><div><div class="record-name">'+safeHtml(x.employee_name||"Funcionário")+'</div><div class="record-meta">'+safeHtml(x.employee_code?("Matrícula "+x.employee_code):"Marcação de hoje")+'</div></div><span class="pill '+(typeTone[x.entry_type]||"info")+'">'+safeHtml(typeLabel[x.entry_type]||x.entry_type)+'</span><strong class="record-time">'+new Date(x.occurred_at).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})+'</strong></div>').join("")+'</div>':'Nenhuma marcação registrada hoje para esta empresa.';
 // presença da equipe, calculada automaticamente pelo último registro de cada funcionário hoje
 const last=new Map();todays.filter(x=>x.entry_type!=="adjustment").slice().sort((a,b)=>new Date(a.occurred_at)-new Date(b.occurred_at)).forEach(x=>last.set(x.employee_id,x.entry_type));
 let working=0,onBreak=0,done=0;last.forEach(t=>{if(t==="clock_in"||t==="break_end")working++;else if(t==="break_start")onBreak++;else if(t==="clock_out")done++;});
 const waiting=Math.max(0,activeCount-last.size),company=accessCompanies.find(x=>x.id===companyId);
 const tile=(cls,label,value)=>'<div class="presence-tile '+cls+'"><strong>'+value+'</strong><span>'+label+'</span></div>';
 const ctx=$("#dashboardCompanyContext");ctx.className="";
 ctx.innerHTML='<div class="company-context"><div class="company-context-head"><span class="company-context-mark">'+DASH_ICONS.building+'</span><div><strong>'+safeHtml(company?.trade_name||company?.legal_name||state.company)+'</strong><small>'+safeHtml(company?.cnpj||"CNPJ não informado")+' · Indicadores isolados desta empresa.</small></div></div><div class="presence-grid">'+tile("is-work","Trabalhando agora",working)+tile("is-break","Em intervalo",onBreak)+tile("is-done","Jornada encerrada",done)+tile("is-wait","Sem marcação hoje",waiting)+'</div></div>';
 // atividade da semana + calendário do mês
 const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days.push({key:localDateForValue(d.toISOString()),label:d.toLocaleDateString("pt-BR",{weekday:"short"}).replace(".",""),count:0});}
 const marked=new Set(),monthPrefix=today.slice(0,7);
 entries.forEach(x=>{const k=localDateForValue(x.occurred_at);const day=days.find(d=>d.key===k);if(day)day.count++;if(k.startsWith(monthPrefix))marked.add(k);});
 const max=Math.max(1,...days.map(d=>d.count)),total=days.reduce((n,d)=>n+d.count,0),week=$("#dashWeek");
 if(week)week.innerHTML=total?'<div class="week-bars">'+days.map(d=>'<div class="week-col '+(d.key===today?"is-today":"")+'"><span class="week-value">'+d.count+'</span><div class="week-bar"><i style="height:'+Math.max(6,Math.round(d.count/max*100))+'%"></i></div><small>'+safeHtml(d.label)+'</small></div>').join("")+'</div><p class="week-total"><strong>'+total+'</strong> marcações na semana</p>':'<div class="empty-state">Sem marcações nos últimos 7 dias.</div>';
 const cal=$("#dashCalendar");if(cal)cal.innerHTML=dashCalendarHtml(marked);
 const up=$("#dashUpdated");if(up)up.textContent="Atualizado às "+new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
}

function updateClock(){const d=new Date();const dc=$("#dashboardClock");if(dc)dc.textContent=d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});const t=$("#clockTime"),dt=$("#clockDate");if(t)t.textContent=d.toLocaleTimeString("pt-BR");if(dt)dt.textContent=d.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});const sec=d.getSeconds(),min=d.getMinutes(),hour=d.getHours()%12;const sh=$("#authSecondHand"),mh=$("#authMinuteHand"),hh=$("#authHourHand");if(sh)sh.style.transform="translateX(-50%) rotate("+((sec*6))+"deg)";if(mh)mh.style.transform="translateX(-50%) rotate("+((min*6+sec*.1))+"deg)";if(hh)hh.style.transform="translateX(-50%) rotate("+((hour*30+min*.5))+"deg)";const digital=$("#authDigitalClock");if(digital)digital.textContent=d.toLocaleTimeString("pt-BR")}
let lastCreatedCompanyAccess=null;
async function openMainCompanyWizard(){
 if(authProfile?.role!=="kr_admin"){toast("Somente a KR pode cadastrar empresas.");return;}
 const box=$("#mainCompanyEditor");if(!box)return;
 box.hidden=false;box.innerHTML='<div class="wizard-head"><div><p class="eyebrow">NOVO CLIENTE</p><h2>Cadastro de empresa</h2><p>Informe o CNPJ para buscar os dados e complete os dados de acesso.</p></div><button class="btn" data-action="close-main-company">Fechar</button></div><form id="mainCompanyForm" class="access-form">'+
 '<div class="cnpj-lookup full"><label>CNPJ<input name="cnpj" id="companyCnpj" inputmode="numeric" maxlength="18" placeholder="00.000.000/0000-00" required></label><button type="button" class="btn" id="lookupCompanyCnpj">Buscar CNPJ</button><p id="cnpjLookupStatus" class="wizard-hint full" aria-live="polite"></p></div>'+
 '<label>Razão social<input name="legal_name" id="companyLegalName" required></label><label>Nome fantasia<input name="trade_name" id="companyTradeName"></label>'+
 '<label>Situação cadastral<input name="registration_status" id="companyRegistrationStatus"></label><label>Data de abertura<input name="opening_date" id="companyOpeningDate" type="date"></label>'+
 '<label>E-mail da empresa<input name="email" type="email" required></label><label>Telefone<input name="phone" type="tel"></label>'+
 '<label class="full">Responsável legal<input name="legal_representative" id="companyLegalRepresentative" placeholder="Nome do responsável legal"></label><div id="companyPartnersWrap" class="full" hidden><label>Quadro societário encontrado<select id="companyPartners"><option value="">Selecione o responsável legal</option></select></label></div>'+
 '<label>Regime tributário<select name="tax_regime">'+regimeOptions("")+'</select></label><label>Média de funcionários<input name="average_employees" type="number" min="0" step="1" required placeholder="Ex.: 25"></label>'+
 '<label>Analista responsável<select name="analyst_id" id="companyAnalyst" required><option value="">Carregando analistas...</option></select></label>'+
 '<div class="form-section-title full">Acesso do administrador da empresa</div><label>Nome do administrador<input name="admin_name" required></label><label>E-mail de acesso<input name="admin_email" type="email" required placeholder="Pode ser o e-mail da empresa"></label>'+
 '<p class="wizard-hint full">Ao concluir, o sistema criará uma senha provisória segura. A KR poderá copiar os dados ou abrir um e-mail padronizado para enviar ao cliente.</p>'+
 '<button class="btn primary full" id="saveCompanyAccount" type="submit">Cadastrar empresa e gerar acesso</button><p id="mainCompanyError" class="login-error full" role="alert"></p></form>';
 const {data,error}=await db.from("profiles").select("id,full_name").eq("role","analyst").eq("active",true).order("full_name");
 const select=$("#companyAnalyst");if(select)select.innerHTML='<option value="">Selecione o analista</option>'+(data||[]).map(x=>'<option value="'+x.id+'">'+safeHtml(x.full_name)+'</option>').join("");
 if(error&&select)select.innerHTML='<option value="">Erro ao carregar analistas</option>';
 mountEditorModal("mainCompanyEditor","Cadastro de empresa","Informe os dados do cliente e configure o acesso.");
}
let companyDetailTab="data",companyAdminAccess=null;
async function openCompanyDetails(companyId,tab="data"){
 const box=$("#mainCompanyEditor");if(!box)return;
 const company=(accessCompanies||[]).find(c=>c.id===companyId);
 if(!company){toast("Empresa não encontrada na lista atual.");return;}
 companyDetailTab=tab;
 box.hidden=false;
 box.innerHTML='<div class="wizard-head"><div><p class="eyebrow">CADASTRO DA EMPRESA</p><h2>'+safeHtml(company.trade_name||company.legal_name)+'</h2><p>Consulte os dados e gerencie o acesso do administrador.</p></div><button class="btn" data-action="close-main-company">Fechar</button></div><div class="company-detail-tabs"><button class="company-detail-tab '+(tab==="data"?"active":"")+'" data-action="company-detail-tab" data-tab="data" data-company-id="'+safeHtml(companyId)+'">Dados da empresa</button><button class="company-detail-tab '+(tab==="login"?"active":"")+'" data-action="company-detail-tab" data-tab="login" data-company-id="'+safeHtml(companyId)+'">Login da empresa</button><button class="company-detail-tab '+(tab==="devices"?"active":"")+'" data-action="company-detail-tab" data-tab="devices" data-company-id="'+safeHtml(companyId)+'">Aparelhos cadastrados</button></div><div id="companyDetailPanel" class="company-detail-panel"><p class="wizard-hint">Carregando informações...</p></div>';

 mountEditorModal("mainCompanyEditor","Cadastro da empresa","Consulte os dados cadastrais, o login e os aparelhos vinculados."); const {data:profile,error}=await db.from("profiles").select("id,email,full_name,must_change_password,created_at").eq("company_id",companyId).eq("role","company_admin").eq("active",true).order("created_at",{ascending:false}).limit(1).maybeSingle();
 companyAdminAccess=profile||null;
 const panel=$("#companyDetailPanel");if(!panel)return;
 if(error){panel.innerHTML='<p class="login-error">Não foi possível consultar os dados do administrador: '+safeHtml(error.message)+'</p>';return;}
 if(tab==="devices"){
  panel.innerHTML='<p class="wizard-hint">Gerencie os aparelhos vinculados a esta empresa.</p><div id="companyDevicesPanel"><p class="empty-state">Carregando aparelhos...</p></div>';
  loadCompanyDevicesPanel(companyId);
 }else if(tab==="data"){
  panel.innerHTML=companyEditFormHtml(company,profile,true);
 }else{
  panel.innerHTML=profile?'<div class="company-login-card"><div class="company-login-card-head"><div><p class="eyebrow">CREDENCIAL CADASTRADA</p><h3>'+safeHtml(profile.full_name||"Administrador")+'</h3></div><span class="pill '+(profile.must_change_password?"pending":"ok")+'">'+(profile.must_change_password?"Aguardando primeiro acesso":"Senha fixa definida")+'</span></div><div class="company-login-data"><p><span>Login (e-mail)</span><strong>'+safeHtml(profile.email||"—")+'</strong></p><p><span>Conta criada em</span><strong>'+(profile.created_at?new Date(profile.created_at).toLocaleDateString("pt-BR"):"—")+'</strong></p><p><span>Endereço do sistema</span><strong>https://appontkr.vercel.app/</strong></p></div><div class="wizard-actions"><button class="btn primary" data-action="regenerate-company-access" data-company-id="'+safeHtml(companyId)+'">Preparar e-mail / reenviar acesso</button><button class="btn" data-action="copy-pwa-link">Copiar link do terminal</button></div><p class="wizard-hint">O login fica vinculado a esta empresa e não será duplicado. Para reenviar, será gerada uma senha temporária para a conta existente; o usuário e o e-mail permanecem os mesmos, e a troca de senha será obrigatória no próximo acesso.</p>':'<div class="empty-state">Ainda não existe um login de administrador cadastrado para esta empresa.</div>';
 }
}

async function loadCompanyDevicesPanel(companyId){
 const host=$("#companyDevicesPanel");if(!host)return;
 host.innerHTML='<p class="empty-state">Consultando aparelhos cadastrados...</p>';
 const {data,error}=await db.functions.invoke("manage-terminal-device",{body:{action:"list",company_id:companyId}});
 if(!$("#companyDevicesPanel"))return;
 if(error||data?.error){host.innerHTML='<p class="login-error">'+safeHtml(data?.error||error?.message||"Não foi possível consultar os aparelhos.")+'</p>';return;}
 const devices=data?.devices||[];
 const codeBox=latestTerminalCode?.companyId===companyId?'<div class="access-wizard"><p class="eyebrow">CÓDIGO DE ATIVAÇÃO · USO ÚNICO</p><h2 style="letter-spacing:.18em;font-size:28px">'+safeHtml(latestTerminalCode.code)+'</h2><p>Expira em '+new Date(latestTerminalCode.expires).toLocaleString("pt-BR")+'. Informe no aparelho novo. O código só pode ser usado uma vez.</p><div class="wizard-actions"><button class="btn primary" data-action="copy-terminal-code">Copiar código</button><button class="btn" data-action="copy-terminal-link">Copiar link do terminal</button></div></div>':"";
 host.innerHTML=codeBox+'<div class="wizard-head" style="margin-top:16px"><div><p class="eyebrow">APARELHOS DA EMPRESA</p><h3>Aparelhos cadastrados</h3><p>Você pode revogar um acesso ou ativar um novo aparelho.</p></div><button class="btn primary" data-action="issue-terminal-code" data-company-id="'+safeHtml(companyId)+'">＋ Ativar aparelho</button></div><div class="table-wrap"><table><thead><tr><th>APARELHO</th><th>STATUS</th><th>ATIVADO EM</th><th>ÚLTIMO ACESSO</th><th>AÇÃO</th></tr></thead><tbody>'+(devices.length?devices.map(d=>'<tr><td><strong>'+safeHtml(d.device_name||"Terminal de ponto")+'</strong></td><td>'+badge(d.status==="active"?"Ativo":d.status==="revoked"?"Revogado":"Aguardando ativação")+'</td><td>'+(d.activated_at?new Date(d.activated_at).toLocaleString("pt-BR"):"—")+'</td><td>'+(d.last_seen_at?new Date(d.last_seen_at).toLocaleString("pt-BR"):"—")+'</td><td>'+(d.status!=="revoked"?'<button class="btn small" data-action="revoke-terminal" data-company-id="'+safeHtml(companyId)+'" data-device-id="'+safeHtml(d.id)+'">Excluir acesso</button>':"—")+'</td></tr>').join(""):'<tr><td colspan="5" class="empty-cell">Nenhum aparelho cadastrado para esta empresa.</td></tr>')+'</tbody></table></div>';
}
async function regenerateCompanyAccess(companyId){
 const result=$("#companyDetailPanel");if(result)result.insertAdjacentHTML("beforeend",'<p class="wizard-hint" id="companyAccessLoading">Gerando senha temporária...</p>');
 const {data,error}=await db.functions.invoke("company-access-link",{body:{company_id:companyId}});
 $("#companyAccessLoading")?.remove();
 if(error||data?.error){toast(data?.error||error?.message||"Não foi possível preparar o acesso.");return;}
 const company=(accessCompanies||[]).find(c=>c.id===companyId);
 lastCreatedCompanyAccess={company_id:companyId,email:data.email,full_name:data.full_name,password:data.password,company:company?.trade_name||company?.legal_name||data.company||"Empresa",mode:"resend",login_url:data.login_url||"https://appontkr.vercel.app/"};
 openCompanyEmailComposer(lastCreatedCompanyAccess);
}
function openCompanyEmailComposer(x){
 if(!x)return;
 const host=$("#mainCompanyEditor")||document.body;
 $("#companyEmailComposer")?.remove();
 const subject="Acesso ao Kronius - "+(x.company||"Empresa");
 const body=x.mode==="resend"
  ?"Olá, "+(x.full_name||"tudo bem?")+"!\n\nEstamos reenviando seus dados de acesso ao Kronius.\n\nEmpresa: "+x.company+"\nLogin (e-mail): "+x.email+"\nSenha temporária: "+x.password+"\nAcesso ao sistema: "+(x.login_url||"https://appontkr.vercel.app/")+"\n\nPor segurança, no próximo acesso será necessário cadastrar uma nova senha pessoal com pelo menos 8 caracteres.\n\nAtenciosamente,\nKR Assessoria Contábil"
  :"Olá, "+(x.full_name||"tudo bem?")+"!\n\nSeu acesso ao Kronius foi criado com sucesso.\n\nEmpresa: "+x.company+"\nLogin (e-mail): "+x.email+"\nSenha provisória: "+x.password+"\nAcesso ao sistema: "+(x.login_url||"https://appontkr.vercel.app/")+"\n\nTerminal de ponto: "+(x.terminal_url||"https://appontkr.vercel.app/terminal/")+"\nCódigo de ativação do terminal: "+(x.terminal_code||"Gere o código na aba Dispositivos")+"\n\nAntes da primeira marcação, configure a localização da empresa na aba Dispositivos. O código de ativação é de uso único e expira em sete dias.\n\nNo primeiro acesso, o sistema solicitará que você cadastre sua senha fixa para continuar.\n\nAtenciosamente,\nKR Assessoria Contábil";
 host.insertAdjacentHTML("beforeend",'<div class="email-compose-overlay" id="companyEmailComposer"><section class="email-compose-card" role="dialog" aria-modal="true" aria-labelledby="companyEmailTitle"><div class="wizard-head"><div><p class="eyebrow">MENSAGEM AO CLIENTE</p><h2 id="companyEmailTitle">E-mail preparado</h2><p>Confira o conteúdo antes de abrir o Outlook.</p></div><button class="btn" data-action="close-company-email">Fechar</button></div><label>Para<input id="companyEmailTo" type="email" readonly value="'+safeHtml(x.email)+'"></label><label>Assunto<input id="companyEmailSubject" value="'+safeHtml(subject)+'"></label><label>Mensagem<textarea id="companyEmailBody" rows="12">'+safeHtml(body)+'</textarea></label><div class="wizard-actions"><button class="btn" data-action="close-company-email">Voltar</button><button class="btn primary" data-action="open-outlook-email">Ir para o Outlook ↗</button><button class="btn" id="confirmCompanyEmail" data-action="confirm-company-email" disabled>Confirmar que enviei</button></div><p class="wizard-hint">Depois de enviar pelo Outlook, volte aqui e confirme para registrar o envio no histórico.</p></section></div>');
}
async function refreshMainCompanies(){
 const {data,error}=await db.from("companies").select("*").order("trade_name");
 if(error){toast("Não foi possível atualizar a lista de empresas.");return;}
 accessCompanies=data||[];
 $("#companySwitcher").innerHTML='<option value="KR Contábil">KR Contábil · Master</option>'+accessCompanies.map(c=>'<option value="'+c.id+'">'+safeHtml(c.trade_name||c.legal_name)+'</option>').join("");
 $("#companySwitcher").value=state.companyId||"KR Contábil";
 $("#mainCompanyEditor").hidden=true;
 render();
}
function openVacationWizard(){
 const companyId=state.companyId||accessCompanies[0]?.id;if(!companyId){toast("Selecione uma empresa.");return;}
 db.from("employees").select("id,full_name").eq("company_id",companyId).order("full_name").then(({data,error})=>{
  if(error){toast("Não foi possível carregar os funcionários.");return;}
  const opts='<option value="">Selecione</option>'+(data||[]).map(x=>'<option value="'+x.id+'">'+safeHtml(x.full_name)+'</option>').join("");
  openLaunchModal("Registrar férias","Informe o funcionário e o período programado.",'<form id="vacationCreateForm" class="access-form"><label>Funcionário<select name="employee_id" required>'+opts+'</select></label><label>Data de início<input type="date" name="start_date" required></label><label>Data de término<input type="date" name="end_date" required></label><label class="full">Observações<input name="notes" placeholder="Opcional"></label><button class="btn primary full" type="submit">Salvar período</button><p id="vacationFormError" class="login-error full"></p></form>');
 });
}
/* Autenticação e gestão de acessos */
const SUPABASE_URL = "https://auzrtnuquplhogtqasbb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_7y0Zgojnh0xbPwbsSp1gkQ_6Kv3hJiZ";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let authUser = null, authProfile = null, accessCompanies = [], accessProfiles = [], accessAssignments = [];
let authInitializing = true;
/* Persistência da navegação por usuário: restaura tela e empresa após atualizar ou voltar à aba */
const NAVIGATION_VIEWS=["dashboard","companies","employees","devices","records","pending","reports","clock","vacations","leaves","settings","bank-hours","access"];
const navigationStorageKey=userId=>"pontocom:last-navigation:"+userId;
function readNavigationState(userId){try{return JSON.parse(localStorage.getItem(navigationStorageKey(userId))||"null");}catch(_){return null;}}
function persistNavigationState(){
 if(!authUser?.id||!authProfile)return;
 try{localStorage.setItem(navigationStorageKey(authUser.id),JSON.stringify({version:1,view:state.view,companyId:state.companyId,employeeSelectedCompanyId:employeeSelectedCompanyId||null,recordsTab,recordsSelectedCompanyId,recordsSelectedDate,recordsFromDate,recordsToDate,auditOpen,auditTab,auditCompanyDetailId,reportType,reportMenuOpen,reportFromDate,reportToDate,accessSection,deviceSelectedCompanyId}));}catch(_){}
}
function restoreNavigationState(profile,companies){
 const saved=readNavigationState(authUser?.id)||{},list=companies||[],savedCompany=list.find(c=>c.id===saved.companyId)||null;
 if(profile?.role==="kr_admin"){state.companyId=savedCompany?.id||null;state.company=savedCompany?(savedCompany.trade_name||savedCompany.legal_name):"KR Contábil";state.view=NAVIGATION_VIEWS.includes(saved.view)?saved.view:"companies";if(!state.companyId&&!["companies","reports","access"].includes(state.view))state.view="companies";if(state.companyId&&["companies","access"].includes(state.view))state.view="dashboard";if(state.view==="access")accessSection=["home","analysts","companies","permissions","history"].includes(saved.accessSection)?saved.accessSection:"home";}
 else{const selected=savedCompany||list[0]||null;state.companyId=selected?.id||null;state.company=selected?(selected.trade_name||selected.legal_name):"Minha empresa";const requested=NAVIGATION_VIEWS.includes(saved.view)?saved.view:"dashboard",tabs=profile?.permissions?.tabs||{};state.view=requested==="access"||requested==="devices"||tabs[requested]===false?"dashboard":requested;}
 employeeSelectedCompanyId=list.some(c=>c.id===saved.employeeSelectedCompanyId)?saved.employeeSelectedCompanyId:null;
 recordsTab=["entries","manual","missing"].includes(saved.recordsTab)?saved.recordsTab:"entries";recordsSelectedCompanyId=saved.recordsSelectedCompanyId||null;recordsSelectedDate=saved.recordsSelectedDate||null;
 if(/^\d{4}-\d{2}-\d{2}$/.test(saved.recordsFromDate||""))recordsFromDate=saved.recordsFromDate;if(/^\d{4}-\d{2}-\d{2}$/.test(saved.recordsToDate||""))recordsToDate=saved.recordsToDate;
 auditOpen=saved.auditOpen===true;auditTab=["companies","archive","all"].includes(saved.auditTab)?saved.auditTab:"companies";auditCompanyDetailId=saved.auditCompanyDetailId||null;
 reportType=["mirror","summary"].includes(saved.reportType)?saved.reportType:"mirror";reportMenuOpen=saved.reportMenuOpen===true;
 if(/^\d{4}-\d{2}-\d{2}$/.test(saved.reportFromDate||""))reportFromDate=saved.reportFromDate;if(/^\d{4}-\d{2}-\d{2}$/.test(saved.reportToDate||""))reportToDate=saved.reportToDate;
 deviceSelectedCompanyId=list.some(c=>c.id===saved.deviceSelectedCompanyId)?saved.deviceSelectedCompanyId:null;
}
window.addEventListener("pagehide",persistNavigationState);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")persistNavigationState();});document.addEventListener("change",()=>persistNavigationState(),true);

let passwordRecoveryPending=false,passwordChangeRequired=false;
const originalRender = renderApp;
render = function(){
  if(passwordRecoveryPending||passwordChangeRequired){renderPasswordRecovery();return;}
  if(!authUser){
    $("#appShell").hidden=!authInitializing;
    $("#loginScreen").hidden=authInitializing;
    const loading=$("#authLoading");if(loading)loading.hidden=!authInitializing;
    return;
  }
  const loading=$("#authLoading");if(loading)loading.hidden=true;
  $("#loginScreen").hidden=true; $("#appShell").hidden=false;
  const master = authProfile?.role === "kr_admin";
  document.body.dataset.role=authProfile?.role||"";
  $("#accessNav").hidden = !master;
  if(!master && state.view==="access") state.view="dashboard";
  if(master){
    if(!state.companyId&&!["companies","reports","access"].includes(state.view))state.view="companies";
    if(state.companyId&&["companies","access"].includes(state.view))state.view="dashboard";
    $("#companySwitcher").disabled=false;
  }else{
    const selected=accessCompanies.find(c=>c.id===state.companyId)||accessCompanies[0]||null;
    state.companyId=selected?.id||null;
    state.company=selected?(selected.trade_name||selected.legal_name):"Minha empresa";
    $("#companySwitcher").innerHTML=accessCompanies.map(c=>'<option value="'+c.id+'">'+(c.trade_name||c.legal_name)+'</option>').join("");
    $("#companySwitcher").value=state.companyId||"";
    $("#companySwitcher").disabled=authProfile?.role!=="analyst"||accessCompanies.length<2;
  }
  updateCompanyHeader();
  persistNavigationState();
  originalRender();
  applyNavContext();
  if(state.view==="access") renderAccess();
};
function renderPasswordRecovery(){
 let box=$("#passwordRecoveryScreen");
 if(!box){
  document.body.insertAdjacentHTML("beforeend",`<section id="passwordRecoveryScreen" class="login-screen"><div class="login-card"><div class="login-brand">Ponto<span>.com</span></div><p class="eyebrow">SEGURANÇA DA CONTA</p><h1>${passwordChangeRequired?"Crie sua senha fixa":"Defina sua nova senha"}</h1><p class="login-description">${passwordChangeRequired?"Este é seu primeiro acesso. Crie uma senha pessoal e fixa para continuar.":"Crie uma nova senha para recuperar seu acesso."}</p><form id="passwordRecoveryForm"><label>Nova senha<input name="password" type="password" minlength="8" autocomplete="new-password" required></label><label>Confirme a nova senha<input name="confirm_password" type="password" minlength="8" autocomplete="new-password" required></label><button class="btn primary login-submit" type="submit">Salvar nova senha</button><p id="passwordRecoveryError" class="login-error" role="alert"></p></form></div></section>`);
  box=$("#passwordRecoveryScreen");
 }
 const title=box.querySelector("h1"),description=box.querySelector(".login-description");
 if(title)title.textContent=passwordChangeRequired?"Crie sua senha fixa":"Defina sua nova senha";
 if(description)description.textContent=passwordChangeRequired?"Este é seu primeiro acesso. Crie uma senha pessoal e fixa para continuar.":"Crie uma nova senha para recuperar seu acesso.";
 $("#authLoading").hidden=true;$("#loginScreen").hidden=true;$("#appShell").hidden=true;box.hidden=false;
}
function updateCompanyHeader(){
 const master=state.company==="KR Contábil";
 const avatar=$(".profile-avatar"),button=$("#profileButton");
 if(avatar)avatar.textContent=master?"KR":state.company.split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase();
 if(button)button.innerHTML=`<strong>${safeHtml(state.company)}</strong><small>${master?"Acesso master · KR Contábil":"Empresa selecionada"}</small><span>⌄</span>`;
}
function showLoginError(message){ $("#loginError").textContent=message||""; }
async function loadAuthProfile(){
 const previousUserId=authUser?.id||null;
 const {data:{user}}=await db.auth.getUser(); authUser=user;
 if(previousUserId!==(user?.id||null)){accessCompanies=[];accessProfiles=[];accessAssignments=[];accessDataReady=false;accessFetchPending=false;accessSection="home";}
 if(!user){authProfile=null;passwordChangeRequired=false;authInitializing=false;render();return;}
 const {data,error}=await db.from("profiles").select("*").eq("id",user.id).maybeSingle();
 if(error||!data||!data.active){await db.auth.signOut();authUser=null;authInitializing=false;showLoginError("Acesso não autorizado ou usuário inativo.");render();return;}
 authProfile=data;
 passwordChangeRequired=data.must_change_password===true;
 authInitializing=false;
 const {data:links}=await db.from("analyst_company_access").select("company_id,companies(*)");
 if(data.role==="analyst") accessCompanies=(links||[]).map(x=>x.companies).filter(Boolean);
 else if(data.company_id){const {data:company}=await db.from("companies").select("*").eq("id",data.company_id).maybeSingle();accessCompanies=company?[company]:[];}
 else {const {data:all}=await db.from("companies").select("*").order("trade_name");accessCompanies=all||[];}
 if(data.role==="kr_admin") { $("#companySwitcher").innerHTML='<option value="KR Contábil">KR Contábil · Master</option>'+accessCompanies.map(c=>'<option value="'+c.id+'">'+(c.trade_name||c.legal_name)+'</option>').join("");$("#companySwitcher").disabled=false; }
 else { $("#companySwitcher").innerHTML=accessCompanies.map(c=>'<option value="'+c.id+'">'+(c.trade_name||c.legal_name)+'</option>').join("");$("#companySwitcher").disabled=data.role!=="analyst"||accessCompanies.length<2; }
 restoreNavigationState(data,accessCompanies);
 $("#companySwitcher").value=state.companyId||(data.role==="kr_admin"?"KR Contábil":"");
 render();
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
$("#logoutButton").addEventListener("click",async()=>{await db.auth.signOut();authUser=null;authProfile=null;passwordChangeRequired=false;passwordRecoveryPending=false;accessCompanies=[];accessProfiles=[];accessAssignments=[];accessDataReady=false;accessFetchPending=false;accessSection="home";state.company="KR Contábil";state.companyId=null;state.view="dashboard";render();});
/* Gestão de acessos — painel por módulos e cadastros guiados */
let accessSection="home", accessDataReady=false, accessFetchPending=false;
function accessCard(id,icon,title,desc,count){return '<button class="access-module-card" data-access-section="'+id+'"><span class="access-module-icon">'+icon+'</span><span class="access-module-copy"><strong>'+title+'</strong><small>'+desc+'</small></span><span class="access-module-count">'+count+'</span><span class="access-module-arrow">↗</span></button>'}
function renderAccess(){
 $("#content").innerHTML=contextBar()+
 (accessSection==="home" ? heading("ADMINISTRAÇÃO","Gestão de acessos","Gerencie usuários, empresas, permissões e acompanhe as movimentações.")+
 '<div class="access-module-grid">'+
 accessCard("analysts","♙","Analistas","Cadastre e gerencie os acessos da equipe KR.",accessProfiles.filter(p=>p.role==="analyst").length)+
 accessCard("companies","▦","Empresas","Cadastre clientes e consulte seus dados.",accessCompanies.length)+
 accessCard("permissions","⌘","Gestão de cartelas","Defina a cartela de empresas de cada analista.",accessAssignments.length)+
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
 '<div class="access-kpis"><div><small>Líder do departamento</small><strong class="kpi-text">'+accessEsc((list.find(p=>p.permissions?.leader)||{}).full_name||'Não definido')+'</strong></div><div><small>Total de analistas</small><strong>'+list.length+'</strong></div><div><small>Ativos</small><strong>'+list.filter(p=>p.active).length+'</strong></div><div><small>Inativos</small><strong>'+list.filter(p=>!p.active).length+'</strong></div></div>'+
 '<div class="table-panel access-list"><div class="table-toolbar"><strong>Equipe de analistas</strong><input class="search" id="accessSearch" placeholder="Buscar por nome, CPF ou e-mail"></div><div class="table-wrap"><table id="accessUsersTable"><thead><tr><th>ANALISTA</th><th>CPF</th><th>E-MAIL</th><th>EMPRESAS</th><th>STATUS</th><th>AÇÃO</th></tr></thead><tbody>'+
 (list.length?list.map(p=>{const n=accessAssignments.filter(a=>a.analyst_id===p.id).length;return '<tr><td><strong>'+accessEsc(p.full_name)+(p.permissions?.leader?' <em class="leader-badge">Líder</em>':'')+'</strong><small class="access-subline">'+accessEsc(p.phone||"Sem telefone")+'</small></td><td>'+accessEsc(p.cpf||"—")+'</td><td>'+accessEsc(p.email||"—")+'</td><td>'+n+' vinculada(s)</td><td>'+badge(p.active?"Ativo":"Inativo")+'</td><td><button class="btn" data-edit-analyst="'+p.id+'">Editar permissões</button> <button class="btn" data-toggle-user="'+p.id+'" data-active="'+p.active+'">'+(p.active?"Desativar":"Ativar")+'</button></td></tr>'}).join(""):'<tr><td colspan="6" class="empty-cell">Nenhum analista cadastrado. Use “Novo analista” para começar.</td></tr>')+
 '</tbody></table></div></div>'+
 '<div id="analystWizard" class="access-wizard" hidden></div>';
}
function openAnalystPermissionsEditor(id){
 const p=accessProfiles.find(x=>x.id===id);if(!p)return;
 const tabs={dashboard:"Início",companies:"Empresas",employees:"Funcionários",devices:"Dispositivos",records:"Lançamentos",reports:"Relatórios",vacations:"Férias",leaves:"Afastamentos",settings:"Configurações",clock:"PWA de marcação",timesheet_calculator:"Cálculo de ponto"};
 const current=p.permissions||{},tabValues=current.tabs||{};
 const actions={employees:["Visualizar","Cadastrar","Editar","Excluir"],companies:["Visualizar","Cadastrar","Editar","Excluir"],devices:["Visualizar","Gerar código","Editar localização","Revogar terminal"],records:["Visualizar","Cadastrar","Editar","Excluir","Exportar"],reports:["Visualizar","Exportar","Importar"],leaves:["Visualizar","Cadastrar","Editar","Excluir"],vacations:["Visualizar","Cadastrar","Editar","Excluir"],settings:["Visualizar","Editar cadastro da empresa"],timesheet_calculator:["Visualizar","Importar folha","Calcular","Exportar"]};
 const keys={employees:["view","create","edit","delete"],companies:["view","create","edit","delete"],devices:["view","create","edit","delete"],records:["view","create","edit","delete","export"],reports:["view","export","import"],leaves:["view","create","edit","delete"],vacations:["view","create","edit","delete"],settings:["view","edit"],timesheet_calculator:["view","import","calculate","export"]};
 const other=accessProfiles.find(x=>x.role==="analyst"&&x.id!==id&&x.permissions?.leader===true);
 const cards=Object.entries(tabs).map(([k,label])=>{const acts=actions[k]||[];return '<section class="perm-card"><label class="perm-switch"><input type="checkbox" data-perm-tab="'+k+'" '+(tabValues[k]===false?'':'checked')+'><span class="perm-track"></span><strong>'+label+'</strong></label>'+(acts.length?'<div class="perm-actions">'+acts.map((n,i)=>'<label class="perm-chip"><input type="checkbox" data-perm-area="'+k+'" data-perm-key="'+keys[k][i]+'" '+(current.actions?.[k]?.[keys[k][i]]===false?'':'checked')+'><span>'+n+'</span></label>').join("")+'</div>':'<p class="perm-note">Sem ações específicas.</p>')+'</section>';}).join("");
 openLaunchModal("Permissões · "+(p.full_name||"Analista"),"Escolha o que este analista vê no menu e o que ele pode fazer em cada área.","");
 $("#launchModal .launch-modal")?.classList.add("wide");
 $("#launchModalBody").innerHTML='<form id="analystPermissionsForm" data-analyst-id="'+id+'" class="perm-form"><section class="perm-leader'+(current.leader?' on':'')+'"><label class="perm-switch"><input type="checkbox" data-perm-leader '+(current.leader?'checked':'')+'><span class="perm-track"></span><span><strong>Líder do departamento</strong><small>Tem a permissão extra de cadastrar e excluir funcionários e outros analistas.'+(other?' Hoje o líder é <b>'+accessEsc(other.full_name)+'</b>; ao escolher este analista, ele deixa de ser o líder.':' Só pode haver um líder por vez.')+'</small></span></label></section><div class="perm-grid">'+cards+'</div><div class="perm-footer"><p id="analystPermissionsError" class="login-error"></p><div class="wizard-actions"><button class="btn" type="button" data-action="close-launch-modal">Cancelar</button><button class="btn primary" type="submit">Salvar permissões</button></div></div></form>';
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
 return heading("GESTÃO DE ACESSOS · SEGURANÇA","Gestão de cartelas","Monte e confira a cartela de empresas de cada analista, com seleção individual ou em lote.")+
 '<div class="permission-workspace"><section class="access-wizard permission-picker"><div class="wizard-head"><div><p class="eyebrow">CARTELA DE EMPRESAS</p><h2>Vínculos do analista</h2><p>Escolha o analista e marque somente as empresas às quais ele terá acesso.</p></div></div><label>Analista<select id="permissionAnalyst"><option value="">Selecione um analista</option>'+analysts.map(p=>'<option value="'+p.id+'">'+accessEsc(p.full_name)+'</option>').join("")+'</select></label><div class="permission-list-toolbar"><input class="search" id="permissionCompanySearch" placeholder="Buscar empresa ou CNPJ..." disabled><div class="permission-list-actions"><button class="btn small" type="button" data-action="permission-select-all" disabled>Selecionar todas</button><button class="btn small" type="button" data-action="permission-clear-all" disabled>Limpar seleção</button></div></div><div class="permission-selection-count" id="permissionSelectionCount">Selecione um analista para começar.</div><div id="permissionCompanyList" class="permission-company-grid"><p class="empty-state">Escolha um analista para carregar as empresas.</p></div><button class="btn primary" id="savePermissionSet" disabled>Salvar cartela de empresas</button><p class="wizard-hint">A cartela define quais empresas o analista pode consultar. As permissões de telas e ações continuam no cadastro individual do analista.</p></section><section class="access-wizard"><h2>Como funciona</h2><ul class="access-rule-list"><li>O analista verá somente as empresas marcadas.</li><li>Uma empresa pode estar vinculada a mais de um analista.</li><li>Marque ou desmarque empresas e confira o total antes de salvar.</li><li>O acesso é aplicado pelas regras de segurança do banco de dados.</li></ul></section></div>';
}
function renderHistorySection(){
 return heading("GESTÃO DE ACESSOS · AUDITORIA","Histórico de acessos","Consulte ações administrativas registradas no sistema.")+
 '<div class="table-panel"><div class="table-toolbar"><strong>Atividades recentes</strong><button class="btn" data-access-action="reload">Atualizar</button></div><div id="accessHistoryContent" class="empty-state">Carregando histórico...</div></div>';
}
async function loadAccessData(){
 const [co,pr,as]=await Promise.all([
 db.from("companies").select("*").order("trade_name"),
 db.from("profiles").select("id,full_name,email,cpf,phone,role,company_id,active,permissions").in("role",["analyst","company_admin"]).order("full_name"),
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
 openLaunchModal("Novo analista","Informe os dados de acesso para criar o usuário.","");
 $("#launchModalBody").innerHTML='<form id="analystWizardForm" class="access-form"><label class="full">Nome completo<input name="full_name" autocomplete="name" required maxlength="120" placeholder="Nome do analista"></label><label class="full">E-mail profissional<input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="nome@krcontabil.com.br"></label><label class="full">Senha inicial<input name="password" type="password" autocomplete="new-password" minlength="8" required placeholder="Mínimo de 8 caracteres"></label><p class="wizard-hint full">A senha inicial deve ter pelo menos 8 caracteres e ser compartilhada com segurança.</p><p id="wizardError" class="login-error full" role="alert"></p><div class="wizard-actions full"><button type="button" class="btn" data-action="close-launch-modal">Cancelar</button><button type="submit" class="btn primary" id="wizardSubmit">Criar analista</button></div></form>';
 $("#analystWizardForm input")?.focus();
}
document.addEventListener("click",async e=>{
 const section=e.target.closest("[data-access-section]");if(section){accessSection=section.dataset.accessSection;renderAccess();return;}
 const action=e.target.closest("[data-access-action]")?.dataset.accessAction;
 if(action==="new-analyst"){openAnalystWizard();return} if(e.target.closest("[data-edit-analyst]")){openAnalystPermissionsEditor(e.target.closest("[data-edit-analyst]").dataset.editAnalyst);return}
 if(action==="close-analyst"){$("#analystWizard").hidden=true;return}
 if(action==="new-company"){state.view="companies";render();openMainCompanyWizard();return;const box=$("#companyEditor");box.hidden=false;box.innerHTML='<div class="wizard-head"><div><p class="eyebrow">NOVO CADASTRO</p><h2>Dados da empresa</h2><p>Informe os dados cadastrais do cliente.</p></div><button class="btn" data-access-action="close-company">Fechar</button></div><form id="companyCreateForm" class="access-form"><label>Razão social<input name="legal_name" required></label><label>Nome fantasia<input name="trade_name"></label><label>CNPJ<input name="cnpj" required></label><label>E-mail<input name="email" type="email"></label><label>Telefone<input name="phone" type="tel"></label><label>Status<select name="status"><option value="active">Ativa</option><option value="inactive">Inativa</option></select></label><button class="btn primary full" type="submit">Salvar empresa</button><p id="companyFormError" class="login-error full"></p></form>';return}
 if(action==="close-company"){$("#companyEditor").hidden=true;return}
 if(action==="reload"){loadAccessHistory();return}
});
document.addEventListener("input",e=>{
 if(e.target.id==="companyCnpj"){let v=e.target.value.replace(/\D/g,"").slice(0,14);v=v.replace(/^(\d{2})(\d)/,"$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/,"$1.$2.$3").replace(/\.(\d{3})(\d)/,".$1/$2").replace(/(\d{4})(\d)/,"$1-$2");e.target.value=v;}
});
document.addEventListener("click",async e=>{
 if(e.target.id==="lookupCompanyCnpj"){
  const button=e.target,input=$("#companyCnpj"),status=$("#cnpjLookupStatus"),cnpj=(input?.value||"").replace(/\D/g,"");
  if(cnpj.length!==14){status.textContent="Informe os 14 dígitos do CNPJ.";return;}
  button.disabled=true;button.textContent="Consultando...";status.textContent="Consultando CNPJ.ws, BrasilAPI e MUAC, nesta ordem...";
  const {data,error}=await db.functions.invoke("lookup-company-cnpj",{body:{cnpj}});
  button.disabled=false;button.textContent="Buscar CNPJ";
  if(error||data?.error){status.textContent=data?.error||"Falha na consulta. Você pode preencher os dados manualmente.";return;}
  $("#companyLegalName").value=data.legal_name||"";$("#companyTradeName").value=data.trade_name||"";
  $("#companyRegistrationStatus").value=data.registration_status||"";$("#companyOpeningDate").value=(data.opening_date||"").slice(0,10);
  const partners=data.partners||[],wrap=$("#companyPartnersWrap"),select=$("#companyPartners");
  if(partners.length>1){wrap.hidden=false;select.innerHTML='<option value="">Selecione o responsável legal</option>'+partners.map((p,i)=>'<option value="'+i+'">'+safeHtml(p.name)+(p.qualification?' — '+safeHtml(p.qualification):"")+'</option>').join("");}
  else if(partners.length===1){$("#companyLegalRepresentative").value=partners[0].name;wrap.hidden=true;}
  else wrap.hidden=true;
  status.textContent="Dados localizados em "+(data.sources||[]).join(", ")+". Confira as informações antes de salvar."+(data.failures?.length?" Alguns provedores não responderam.":"");
 }
 if(e.target.id==="companyPartners"){const i=Number(e.target.value);const form=$("#mainCompanyForm");const {data}=form?{}:{};const opt=e.target.selectedOptions[0];if(opt&&i>=0&&opt.value!=="")$("#companyLegalRepresentative").value=opt.textContent.split(" — ")[0];}
});
document.addEventListener("submit",async e=>{
 if(e.target.id==="missingPunchForm"){
  e.preventDefault();const form=e.target,f=new FormData(form),companyId=$("#pendingCompanySelect")?.value,button=form.querySelector('button[type="submit"]'),err=$("#missingPunchError");
  const occurredAt=new Date(String(f.get("date"))+"T"+String(f.get("time"))+":00").toISOString();
  button.disabled=true;err.textContent="";
  const {data,error}=await db.functions.invoke("manage-time-entries",{body:{action:"create_request",company_id:companyId,employee_id:String(f.get("employee_id")),entry_type:String(f.get("entry_type")),occurred_at:occurredAt,reason:String(f.get("reason"))}});
  if(error||data?.error||!data?.success){err.textContent=data?.error||error?.message||"Não foi possível enviar a solicitação.";button.disabled=false;return;}
  toast("Solicitação enviada para análise.");await loadPendingPanel();return;
 }

 if(e.target.id!=="employeeCreateForm")return;e.preventDefault();
 const f=new FormData(e.target),cpf=String(f.get("cpf")||"").replace(/\D/g,""),err=$("#employeeCreateError");
 if(cpf.length!==11){err.textContent="Informe um CPF com 11 dígitos.";return;}
 const payload={company_id:f.get("company_id"),full_name:String(f.get("full_name")||"").trim(),cpf,job_title:String(f.get("job_title")||"").trim()||null,admission_date:f.get("admission_date")||null,status:"active"};
 const button=e.target.querySelector('button[type="submit"]');button.disabled=true;button.textContent="Salvando...";
 const {data:createdEmployee,error}=await db.from("employees").insert(payload).select("id").single();if(error){err.textContent="Não foi possível cadastrar: "+error.message;button.disabled=false;button.textContent="Salvar funcionário";return;}
 toast("Funcionário cadastrado. Preparando o acesso ao terminal...");$("#employeeEditor").hidden=true;const filter=$("#employeeCompanyFilter");if(filter)filter.value=payload.company_id;await loadEmployeeDirectory();if(createdEmployee?.id)await generateEmployeeAccess(createdEmployee.id);
});
document.addEventListener("change",e=>{
 
 if(e.target.id==="selectAllEmployees"){document.querySelectorAll(".employee-select").forEach(x=>x.checked=e.target.checked);return;}if(e.target.id==="companyPartners"){const opt=e.target.selectedOptions[0];if(opt&&opt.value!=="")$("#companyLegalRepresentative").value=opt.textContent.split(" — ")[0];}});
document.addEventListener("submit",async e=>{
 if(e.target.id==="mainCompanyForm"){
  e.preventDefault();const f=new FormData(e.target),errorBox=$("#mainCompanyError"),button=$("#saveCompanyAccount");
  const payload={legal_name:f.get("legal_name"),trade_name:f.get("trade_name"),cnpj:f.get("cnpj"),email:f.get("admin_email"),company_email:f.get("email"),phone:f.get("phone"),registration_status:f.get("registration_status"),opening_date:f.get("opening_date")||null,legal_representative:f.get("legal_representative"),average_employees:Number(f.get("average_employees")),analyst_id:f.get("analyst_id"),admin_name:f.get("admin_name")};
  if(!payload.email){errorBox.textContent="Informe o e-mail que será usado no acesso do administrador.";return;}
  button.disabled=true;button.textContent="Cadastrando e criando acesso...";errorBox.textContent="";
  const {data,error}=await db.functions.invoke("create-company-account",{body:payload});
  if(error||data?.error){errorBox.textContent=data?.error||error?.message||"Não foi possível concluir o cadastro.";button.disabled=false;button.textContent="Cadastrar empresa e gerar acesso";return;}
  const auditEvents=[
   {company_id:data.company_id,actor_id:authUser.id,action:"company.created_by_kr",entity_table:"companies",entity_id:data.company_id,details:{operation:"company_created",company:payload.trade_name||payload.legal_name,cnpj:payload.cnpj}},
   {company_id:data.company_id,actor_id:authUser.id,action:"company_admin.access_created",entity_table:"profiles",entity_id:data.user_id,details:{operation:"company_admin_access_created",email:data.email}},
   {company_id:data.company_id,actor_id:authUser.id,action:"company_admin.initial_password_set",entity_table:"profiles",entity_id:data.user_id,details:{operation:"temporary_password_issued",must_change_password:true}}
  ];
  const {error:auditError}=await db.from("audit_logs").insert(auditEvents);
  if(auditError)toast("Empresa cadastrada, mas o evento de auditoria não pôde ser registrado: "+auditError.message);
  const taxRegime=f.get("tax_regime")||null;if(taxRegime){const {error:regimeError}=await db.from("companies").update({tax_regime:taxRegime}).eq("id",data.company_id);if(regimeError)toast("Empresa criada, mas o regime tributário não pôde ser salvo: "+regimeError.message);}
  const terminalResult=await db.functions.invoke("manage-terminal-device",{body:{action:"issue",company_id:data.company_id,device_name:"Terminal principal"}});
  const terminalCode=(!terminalResult.error&&!terminalResult.data?.error)?terminalResult.data:null;
  lastCreatedCompanyAccess={company_id:data.company_id,email:data.email,full_name:data.full_name||payload.admin_name,password:data.password,company:payload.trade_name||payload.legal_name,login_url:"https://appontkr.vercel.app/",terminal_url:"https://appontkr.vercel.app/terminal/",terminal_code:terminalCode?.activation_code||null,terminal_expires:terminalCode?.expires_at||null,mode:"initial"};
  if(!terminalCode)toast("Empresa cadastrada. O código do terminal poderá ser gerado na aba Dispositivos.");
  const box=$("#mainCompanyEditor");box.innerHTML='<div class="wizard-head"><div><p class="eyebrow">CADASTRO CONCLUÍDO</p><h2>Empresa e login criados</h2><p>O login foi salvo no cadastro da empresa. A senha provisória será exibida somente nesta confirmação.</p></div></div><div class="access-rule-list"><p><strong>Empresa:</strong> '+safeHtml(lastCreatedCompanyAccess.company)+'</p><p><strong>Administrador:</strong> '+safeHtml(lastCreatedCompanyAccess.full_name)+'</p><p><strong>Login:</strong> '+safeHtml(data.email)+'</p><p><strong>Senha provisória:</strong> <code>'+safeHtml(data.password)+'</code></p><p><strong>Link do sistema:</strong> https://appontkr.vercel.app/</p><p><strong>Terminal de ponto:</strong> https://appontkr.vercel.app/terminal/</p><p><strong>Código de ativação:</strong> <code>'+safeHtml(terminalCode?.activation_code||"Não gerado")+'</code></p><p class="wizard-hint">O código é de uso único e expira em sete dias. Configure a localização da empresa na aba Dispositivos antes da primeira marcação.</p><p class="wizard-hint">No primeiro login, o administrador será obrigado a cadastrar sua senha fixa.</p></div><div class="wizard-actions"><button class="btn primary" data-action="send-company-email">Preparar e-mail para o cliente</button><button class="btn" data-action="copy-company-password">Copiar senha provisória</button><button class="btn" data-action="copy-pwa-link">Copiar link do PWA</button><button class="btn" data-action="close-main-company">Concluir</button></div>';
  const newCompany={id:data.company_id,legal_name:payload.legal_name,trade_name:payload.trade_name,cnpj:payload.cnpj,email:payload.company_email,phone:payload.phone,status:"active",average_employees:payload.average_employees,tax_regime:f.get("tax_regime")||null};accessCompanies=[...(accessCompanies||[]),newCompany];

 }
 if(e.target.id==="companyLocationForm"){
  e.preventDefault();const f=new FormData(e.target),companyId=$("#deviceCompanySelect")?.value,latitude=Number(f.get("latitude")),longitude=Number(f.get("longitude")),radius=Number(f.get("radius")),password=String(f.get("admin_password")||""),msg=$("#companyLocationMessage");
  if(!companyId||!Number.isFinite(latitude)||!Number.isFinite(longitude)||latitude < -90||latitude>90||longitude < -180||longitude>180||!Number.isInteger(radius)||radius<10||radius>1000){msg.textContent="Confira as coordenadas e informe um raio entre 10 e 1.000 metros.";return;}
  if(!password){msg.textContent="Informe a senha do administrador para confirmar.";return;}
  if(!["kr_admin","company_admin"].includes(authProfile?.role)){msg.textContent="Somente o administrador pode alterar a localização.";return;}
  const button=e.target.querySelector('button[type="submit"]');button.disabled=true;msg.textContent="Confirmando a senha do administrador...";
  const {error:authError}=await db.auth.signInWithPassword({email:authUser.email,password});
  if(authError){msg.textContent="Senha incorreta. A localização não foi alterada.";button.disabled=false;return;}
  msg.textContent="Salvando a localização...";
  const {error}=await db.from("company_locations").upsert({company_id:companyId,latitude,longitude,allowed_radius_m:radius,active:true,updated_by:authUser.id,updated_at:new Date().toISOString()},{onConflict:"company_id"});
  if(error){msg.textContent="Não foi possível salvar: "+error.message;button.disabled=false;return;}msg.textContent="Localização da empresa salva.";button.disabled=false;toast("Localização configurada.");loadDevicesPanel();return;
 }
 if(e.target.id==="vacationCreateForm"){
  e.preventDefault();const f=new FormData(e.target),payload={company_id:state.companyId,employee_id:f.get("employee_id"),start_date:f.get("start_date"),end_date:f.get("end_date"),notes:f.get("notes")||null,created_by:authUser.id};
  if(payload.end_date<payload.start_date){$("#vacationFormError").textContent="A data de término não pode ser anterior ao início.";return;}
  const {error}=await db.from("employee_vacations").insert(payload);if(error){$("#vacationFormError").textContent=error.message;return;}toast("Período de férias registrado.");render();
 }
});
document.addEventListener("submit",async e=>{
 if(e.target.id==="analystWizardForm"){
  e.preventDefault();const f=new FormData(e.target);const email=String(f.get("email")||"").trim().toLowerCase();const full_name=String(f.get("full_name")||"").trim();const password=String(f.get("password")||"");
  const errorBox=$("#wizardError");const submitButton=$("#wizardSubmit");
  if(!full_name||!email||password.length<8){errorBox.textContent="Confira o nome, o e-mail e informe uma senha com pelo menos 8 caracteres.";return;}
  const payload={email,full_name,role:"analyst",password,company_id:null};
  submitButton.disabled=true;submitButton.textContent="Criando...";errorBox.textContent="";
  const {data,error}=await db.functions.invoke("create-access-user",{body:payload});
  if(error||data?.error){let detail=data?.error||"";if(!detail&&error?.context){try{const response=error.context.clone?error.context.clone():error.context;const body=await response.json();detail=body?.error||body?.message||"";}catch(_){}}errorBox.textContent=detail||error?.message||"Não foi possível criar o usuário.";submitButton.disabled=false;submitButton.textContent="Criar analista";return;}
  toast("Analista cadastrado com sucesso.");closeLaunchModal();execData=null;accessSection="analysts";accessDataReady=false;await loadAccessData();return;
 }
 if(e.target.id==="analystPermissionsForm"){
  e.preventDefault();if(authProfile?.role!=="kr_admin"){toast("Somente a KR pode alterar permissões.");return;}
  const id=e.target.dataset.analystId,permissions={tabs:{audit:false},actions:{}};
  permissions.leader=!!e.target.querySelector("[data-perm-leader]")?.checked;
  e.target.querySelectorAll("[data-perm-tab]").forEach(x=>permissions.tabs[x.dataset.permTab]=x.checked);
  e.target.querySelectorAll("[data-perm-area]").forEach(x=>{const a=x.dataset.permArea;permissions.actions[a]??={};permissions.actions[a][x.dataset.permKey]=x.checked;});
  const b=e.target.querySelector('button[type="submit"]'),err=$("#analystPermissionsError");b.disabled=true;b.textContent="Salvando...";
  if(permissions.leader){permissions.actions.employees??={};permissions.actions.employees.create=true;permissions.actions.employees.delete=true;}
  const {error}=await db.from("profiles").update({permissions}).eq("id",id).eq("role","analyst");
  if(error){err.textContent="Não foi possível salvar: "+error.message;b.disabled=false;b.textContent="Salvar permissões";return;}
  if(permissions.leader){for(const o of accessProfiles.filter(x=>x.role==="analyst"&&x.id!==id&&x.permissions?.leader===true))await db.from("profiles").update({permissions:{...o.permissions,leader:false}}).eq("id",o.id).eq("role","analyst");}
  toast("Permissões atualizadas.");closeLaunchModal();execData=null;await loadAccessData();return;
 }
 if(e.target.id==="companyCreateForm"){
  e.preventDefault();const f=new FormData(e.target);const payload={legal_name:f.get("legal_name"),trade_name:f.get("trade_name")||null,cnpj:f.get("cnpj"),email:f.get("email")||null,phone:f.get("phone")||null,status:f.get("status")};
  const {error}=await db.from("companies").insert(payload);
  if(error){$("#companyFormError").textContent="Não foi possível salvar: "+error.message;return;}
  toast("Empresa cadastrada.");$("#companyEditor").hidden=true;await loadAccessData();return;
 }
});
document.addEventListener("change",e=>{
 if(e.target.id==="deviceCompanySelect"){deviceSelectedCompanyId=e.target.value;latestTerminalCode=null;loadDevicesPanel();return;}if(e.target.id==="permissionAnalyst"){
  const id=e.target.value,box=$("#permissionCompanyList");if(!id){box.innerHTML='<p class="empty-state">Escolha um analista.</p>';$("#savePermissionSet").disabled=true;return;}
  box.innerHTML=accessCompanies.map(c=>'<label class="access-company-option"><input type="checkbox" value="'+c.id+'" '+(accessAssignments.some(a=>a.analyst_id===id&&a.company_id===c.id)?'checked':'')+'> <span><strong>'+accessEsc(c.trade_name||c.legal_name)+'</strong><small>'+accessEsc(c.cnpj||"")+'</small></span></label>').join("")||'<p class="empty-state">Cadastre empresas primeiro.</p>';
  $("#savePermissionSet").disabled=false;
 }
});
document.addEventListener("click",async e=>{
 if(e.target.id==="savePermissionSet"){
  const id=$("#permissionAnalyst")?.value;if(!id)return;
  const selected=[...document.querySelectorAll("#permissionCompanyList input:checked")].map(x=>x.value);
  if(selected.length){
   const assignments=selected.map(company_id=>({analyst_id:id,company_id,assigned_by:authUser.id}));
   const {error:saveError}=await db.from("analyst_company_access").upsert(assignments,{onConflict:"analyst_id,company_id",ignoreDuplicates:true});
   if(saveError){toast("Não foi possível salvar as novas permissões: "+saveError.message);return;}
   const {error:removeError}=await db.from("analyst_company_access").delete().eq("analyst_id",id).not("company_id","in","("+selected.join(",")+")");
   if(removeError){toast("As novas permissões foram incluídas, mas não foi possível remover todos os vínculos anteriores: "+removeError.message);await loadAccessData();return;}
  }else{
   const {error:removeError}=await db.from("analyst_company_access").delete().eq("analyst_id",id);
   if(removeError){toast("Não foi possível remover os vínculos: "+removeError.message);return;}
  }
  toast("Permissões atualizadas.");await loadAccessData();
 }
});
document.addEventListener("input",e=>{if(e.target.id==="accessSearch"||e.target.id==="companySearch"){const q=e.target.value.toLowerCase();const table=e.target.id==="accessSearch"?"#accessUsersTable":"#companyEditor ~ .table-panel table";document.querySelectorAll(table+" tbody tr").forEach(tr=>tr.style.display=tr.innerText.toLowerCase().includes(q)?"":"none");}});

document.addEventListener("submit",async e=>{
 if(e.target.id!=="passwordRecoveryForm")return;
 e.preventDefault();
 const f=new FormData(e.target),password=String(f.get("password")||""),confirm=String(f.get("confirm_password")||""),error=$("#passwordRecoveryError"),button=e.target.querySelector('button[type="submit"]');
 if(password.length<8){error.textContent="A senha deve ter pelo menos 8 caracteres.";return;}
 if(password!==confirm){error.textContent="As senhas não conferem.";return;}
 button.disabled=true;button.textContent="Salvando...";
 const {data:finishData,error:finishError}=await db.functions.invoke("complete-first-login",{body:{password}});
 if(finishError||finishData?.error){error.textContent=finishData?.error||finishError?.message||"Não foi possível atualizar a senha.";button.disabled=false;button.textContent="Salvar nova senha";return;}
 if(finishError){error.textContent="A senha foi atualizada, mas não foi possível concluir a liberação do acesso. Tente salvar novamente. "+finishError.message;button.disabled=false;button.textContent="Salvar nova senha";return;}
 passwordChangeRequired=false;
 if(authProfile)authProfile.must_change_password=false;
 passwordRecoveryPending=false;$("#passwordRecoveryScreen").hidden=true;toast("Senha atualizada com sucesso.");await loadAuthProfile();
});
db.auth.onAuthStateChange((event)=>{if(event==="PASSWORD_RECOVERY"){passwordRecoveryPending=true;renderPasswordRecovery();return;}setTimeout(()=>loadAuthProfile(),0);});
loadAuthProfile();

render();setInterval(updateClock,1000);
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));

document.addEventListener("change",e=>{
 if(e.target.id==="permissionAnalyst"){
  const id=e.target.value,box=$("#permissionCompanyList"),search=$("#permissionCompanySearch"),all=document.querySelector('[data-action="permission-select-all"]'),none=document.querySelector('[data-action="permission-clear-all"]');
  if(!id){box.innerHTML='<p class="empty-state">Escolha um analista.</p>';$("#savePermissionSet").disabled=true;if(search)search.disabled=true;if(all)all.disabled=true;if(none)none.disabled=true;return;}
  box.innerHTML=accessCompanies.map(c=>'<label class="permission-company-card"><input type="checkbox" value="'+c.id+'" '+(accessAssignments.some(a=>a.analyst_id===id&&a.company_id===c.id)?'checked':'')+'><span class="permission-company-copy"><strong>'+accessEsc(c.trade_name||c.legal_name)+'</strong><small>'+accessEsc(c.cnpj||"CNPJ não informado")+'</small></span><span class="permission-checkmark">✓</span></label>').join("")||'<p class="empty-state">Cadastre empresas primeiro.</p>';
  $("#savePermissionSet").disabled=false;if(search)search.disabled=false;if(all)all.disabled=false;if(none)none.disabled=false;updatePermissionSelectionCount();
 }
 if(e.target.id==="recordsCompanySelect")loadRecordsPanel();
 if(e.target.id==="reportCompanySelect")loadReportsData();
 if(e.target.id==="leavesCompanySelect")loadLeavesPanel();
 if(e.target.id==="recordsFromDate"||e.target.id==="recordsToDate"){recordsFromDate=$("#recordsFromDate")?.value||recordsFromDate;recordsToDate=$("#recordsToDate")?.value||recordsToDate;}
});
function updatePermissionSelectionCount(){
 const total=$("#permissionCompanyList")?.querySelectorAll('input[type="checkbox"]').length||0,selected=$("#permissionCompanyList")?.querySelectorAll('input[type="checkbox"]:checked').length||0,el=$("#permissionSelectionCount");if(el)el.textContent=selected+" de "+total+" empresa(s) selecionada(s).";
}
document.addEventListener("input",e=>{
 if(e.target.id==="permissionCompanySearch"){const q=e.target.value.toLocaleLowerCase("pt-BR");document.querySelectorAll("#permissionCompanyList .permission-company-card").forEach(card=>card.hidden=!card.innerText.toLocaleLowerCase("pt-BR").includes(q));}
 if(e.target.matches("#permissionCompanyList input[type=checkbox]"))updatePermissionSelectionCount();
 if(e.target.id==="reportFromDate"||e.target.id==="reportToDate"){reportFromDate=$("#reportFromDate")?.value||reportFromDate;reportToDate=$("#reportToDate")?.value||reportToDate;}
});
document.addEventListener("click",async e=>{
 const b=e.target.closest("[data-action]");if(!b)return;
 if(b.dataset.action==="approve-biometric"||b.dataset.action==="delete-biometric"){
  if(authProfile?.role!=="company_admin"){toast("Somente o administrador da empresa pode gerenciar os cadastros faciais.");return;}
  const approve=b.dataset.action==="approve-biometric";
  const employeeId=b.dataset.employeeId,companyId=b.dataset.companyId;
  if(!employeeId||!companyId)return;
  if(approve&&!confirm("Confirma que a identidade do funcionário foi conferida presencialmente e deseja liberar o reconhecimento facial?"))return;
  if(!approve&&!confirm("Deseja excluir o cadastro facial deste funcionário?"))return;
  b.disabled=true;
  const {data,error}=await db.functions.invoke("manage-biometric-enrollment",{body:{action:approve?"set_status":"delete",employee_id:employeeId,company_id:companyId,...(approve?{status:"active"}:{})}});
  if(error||data?.error||!data?.success){toast(data?.error||error?.message||"Não foi possível atualizar o cadastro facial.");b.disabled=false;return;}
  toast(approve?"Reconhecimento facial aprovado.":"Cadastro facial excluído.");
  await loadDevicesPanel();
  return;
 }
 if(b.dataset.action==="leave-company"){auditOpen=false;reportMenuOpen=false;state.company="KR Contábil";state.companyId=null;state.view="companies";$("#companySwitcher").value="KR Contábil";updateCompanyHeader();render();return;}
 if(b.dataset.action==="enter-company-context"){
  const company=accessCompanies.find(c=>c.id===b.dataset.companyId);if(!company)return;
  auditOpen=false;reportMenuOpen=false;state.companyId=company.id;state.company=company.trade_name||company.legal_name;state.view="dashboard";
  $("#companySwitcher").value=company.id;updateCompanyHeader();render();return;
 }
 if(b.dataset.action==="new-employee"){
  if(!employeeSelectedCompanyId){
   if((accessCompanies||[]).length===1)employeeSelectedCompanyId=accessCompanies[0].id;
   else{state.view="employees";renderApp();return;}
  }
  if(state.view!=="employees"){state.view="employees";renderApp();}
  openEmployeeWizard();return;
 }
 if(b.dataset.action==="close-employee-editor"){$("#employeeEditor").hidden=true;return;}
 if(b.dataset.action==="generate-employee-access"){generateEmployeeAccess();return;}
 if(b.dataset.action==="generate-one-employee-access"){generateEmployeeAccess(b.dataset.employeeId);return;}
 if(b.dataset.action==="issue-terminal-code"){
  const companyId=b.dataset.companyId||$("#deviceCompanySelect")?.value||deviceSelectedCompanyId||state.companyId;
  if(!companyId){toast("Selecione uma empresa antes de gerar o código.");return;}
  b.disabled=true;
  const {data,error}=await db.functions.invoke("manage-terminal-device",{body:{action:"issue",company_id:companyId,device_name:"Terminal de ponto"}});
  if(error||data?.error||!data?.activation_code){toast(data?.error||error?.message||"Não foi possível gerar o código.");b.disabled=false;return;}
  latestTerminalCode={companyId,code:data.activation_code,expires:data.expires_at};
  toast("Novo código de ativação gerado. Ele é de uso único.");
  if($("#companyDevicesPanel"))await loadCompanyDevicesPanel(companyId);else await loadDevicesPanel();
  return;
 }
 if(b.dataset.action==="revoke-terminal"){
  const companyId=b.dataset.companyId||$("#deviceCompanySelect")?.value||deviceSelectedCompanyId||state.companyId,deviceId=b.dataset.deviceId;
  if(!companyId||!deviceId){toast("Não foi possível identificar o aparelho.");return;}
  if(!confirm("Deseja revogar o acesso deste aparelho? Ele deixará de registrar ponto imediatamente."))return;
  b.disabled=true;
  const {data,error}=await db.functions.invoke("manage-terminal-device",{body:{action:"revoke",company_id:companyId,device_id:deviceId}});
  if(error||data?.error||!data?.success){toast(data?.error||error?.message||"Não foi possível revogar o acesso.");b.disabled=false;return;}
  if(latestTerminalCode?.companyId===companyId)latestTerminalCode=null;
  toast("Acesso do aparelho revogado.");
  if($("#companyDevicesPanel"))await loadCompanyDevicesPanel(companyId);else await loadDevicesPanel();
  return;
 }
 if(b.dataset.action==="copy-terminal-code"){if(latestTerminalCode?.code){await navigator.clipboard.writeText(latestTerminalCode.code);toast("Código copiado.");}return;}
 if(b.dataset.action==="copy-terminal-link"){await navigator.clipboard.writeText("https://appontkr.vercel.app/terminal/");toast("Link do terminal copiado.");return;}
 if(b.dataset.action==="records-tab"){recordsTab=b.dataset.tab||"entries";renderApp();return;}
 if(b.dataset.action==="refresh-records"){loadRecordsPanel();return;}
 if(b.dataset.action==="open-audit"){if(!isMasterHome())return;auditOpen=true;renderApp();return;}
 if(b.dataset.action==="back-reports"){auditOpen=false;reportMenuOpen=false;renderApp();return;}
 if(b.dataset.action==="audit-tab"){auditTab=b.dataset.tab||"companies";auditCompanyDetailId=null;renderApp();return;}
 if(b.dataset.action==="permission-select-all"){document.querySelectorAll("#permissionCompanyList input[type=checkbox]").forEach(x=>x.checked=true);updatePermissionSelectionCount();}
 if(b.dataset.action==="permission-clear-all"){document.querySelectorAll("#permissionCompanyList input[type=checkbox]").forEach(x=>x.checked=false);updatePermissionSelectionCount();}
 if(b.dataset.action==="report-type"){reportType=b.dataset.reportType;reportMenuOpen=true;auditOpen=false;renderApp();}
 if(b.dataset.action==="back-report-menu"){reportMenuOpen=false;renderApp();}
 if(b.dataset.action==="employee-tab"){employeeTab=["team","mirror","summary"].includes(b.dataset.tab)?b.dataset.tab:"team";renderApp();return;}
 if(b.dataset.action==="run-report")loadReportsData();
 if(b.dataset.action==="edit-company-location"){const form=$("#companyLocationForm");if(form){form.hidden=false;form.scrollIntoView({behavior:"smooth",block:"center"});}return;}
 if(b.dataset.action==="capture-company-location"){
  const msg=$("#companyLocationMessage");if(!navigator.geolocation){if(msg)msg.textContent="Este aparelho não disponibiliza GPS.";return;}
  if(msg)msg.textContent="Obtendo localização atual...";
  navigator.geolocation.getCurrentPosition(pos=>{const lat=$("#companyLocationForm [name=latitude]"),lng=$("#companyLocationForm [name=longitude]");if(lat)lat.value=pos.coords.latitude;if(lng)lng.value=pos.coords.longitude;if(msg)msg.textContent="Localização capturada. Precisão aproximada: "+Math.round(pos.coords.accuracy)+" m. Confira antes de salvar.";},()=>{if(msg)msg.textContent="Não foi possível obter o GPS. Verifique a permissão de localização."},{enableHighAccuracy:true,timeout:20000,maximumAge:0});return;
 }
 if(b.dataset.action==="new-leave")openLeaveWizard();
 if(b.dataset.action==="close-leave")$("#leaveEditor").hidden=true;
 if(b.dataset.action==="refresh-leaves")loadLeavesPanel();
 if(b.dataset.action==="export-report"){
  const panel=$("#reportsPanel");if(panel){const rows=[...panel.querySelectorAll("table tr")].map(tr=>[...tr.querySelectorAll("th,td")].map(td=>td.innerText.trim()));const csv="\uFEFF"+rows.map(row=>row.map(v=>'"'+v.replace(/"/g,'""')+'"').join(";")).join("\r\n");const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="relatorio-kronius.csv";a.click();URL.revokeObjectURL(url);}
 }
});
document.addEventListener("submit",async e=>{
 if(e.target.id==="leaveCreateForm"){
  e.preventDefault();const f=new FormData(e.target),payload={company_id:f.get("company_id"),employee_id:f.get("employee_id"),leave_type:f.get("leave_type"),start_date:f.get("start_date"),end_date:f.get("end_date")||null,notes:String(f.get("notes")||"").trim()||null,created_by:authUser?.id||null},button=e.target.querySelector('button[type="submit"]'),err=$("#leaveFormError");
  if(payload.end_date&&payload.end_date<payload.start_date){err.textContent="A data final não pode ser anterior à inicial.";return;}
  button.disabled=true;const {error}=await db.from("employee_leaves").insert(payload);if(error){err.textContent="Não foi possível salvar: "+error.message;button.disabled=false;return;}toast("Afastamento registrado.");$("#leaveEditor").hidden=true;loadLeavesPanel();return;
 }
 if(e.target.id==="companySettingsForm"){
  e.preventDefault();const f=new FormData(e.target),payload={legal_name:f.get("legal_name"),trade_name:f.get("trade_name")||null,email:f.get("email")||null,phone:f.get("phone")||null},{error}=await db.from("companies").update(payload).eq("id",state.companyId);if(error){$("#companySettingsError").textContent="Não foi possível salvar: "+error.message;return;}state.company=payload.trade_name||payload.legal_name;updateCompanyHeader();toast("Configurações atualizadas.");await refreshMainCompanies();return;
 }
});

let timeBankCache={employees:[],movements:[]},timeBankCompanyId=null,launchModalPlaceholder=null,launchModalElement=null;
function openLaunchModal(title,description,content){
 closeLaunchModal();const overlay=document.createElement("div");overlay.className="launch-modal-backdrop";overlay.id="launchModal";overlay.innerHTML='<section class="launch-modal" role="dialog" aria-modal="true"><header class="launch-modal-header"><div><small>REGISTRO NO KRONIUS</small><h2>'+safeHtml(title)+'</h2><p>'+safeHtml(description||"Preencha os dados para continuar.")+'</p></div><button type="button" class="launch-modal-close" data-action="close-launch-modal">×</button></header><div class="launch-modal-body" id="launchModalBody">'+content+'</div></section>';document.body.appendChild(overlay);overlay.addEventListener("click",e=>{if(e.target===overlay)closeLaunchModal();});
}
function mountEditorModal(id,title,description){
 const el=$("#"+id);if(!el)return;closeLaunchModal();openLaunchModal(title,description,"");launchModalPlaceholder=document.createComment("modal-placeholder");el.parentNode.insertBefore(launchModalPlaceholder,el);launchModalElement=el;el.hidden=false;$("#launchModalBody").appendChild(el);el.hidden=false;
}
function openExistingFormModal(id,title,description){
 const form=$("#"+id);if(!form){toast("O formulário não está disponível. Atualize a tela e tente novamente.");return;}closeLaunchModal();openLaunchModal(title,description,"");launchModalPlaceholder=document.createComment("form-placeholder");form.parentNode.insertBefore(launchModalPlaceholder,form);launchModalElement=form;form.hidden=false;$("#launchModalBody").appendChild(form);form.hidden=false;
}
function closeLaunchModal(){
 const overlay=$("#launchModal");if(launchModalElement&&launchModalPlaceholder?.parentNode){launchModalPlaceholder.parentNode.insertBefore(launchModalElement,launchModalPlaceholder);launchModalElement.hidden=true;launchModalPlaceholder.remove();}launchModalElement=null;launchModalPlaceholder=null;overlay?.remove();
}
let timeBankFromDate=localDateValue().slice(0,8)+"01",timeBankToDate=localDateValue(),timeBankView=null;
function tbConfigKey(id){return "pontocom.timebank.cfg."+id;}
function tbReadConfig(id){try{const c=JSON.parse(localStorage.getItem(tbConfigKey(id))||"null");const wk=Number(c?.weekday),sat=Number(c?.saturday);return {weekday:Number.isFinite(wk)&&wk>=0&&wk<=24?wk:8,saturday:Number.isFinite(sat)&&sat>=0&&sat<=24?sat:0};}catch(_){return {weekday:8,saturday:0};}}
function tbSaveConfig(id,cfg){try{localStorage.setItem(tbConfigKey(id),JSON.stringify(cfg));}catch(_){}}
function timeBankDelta(minutes){const n=Math.round(Number(minutes)||0);return (n>0?"+":n<0?"−":"")+timeBankTime(Math.abs(n));}
function tbTone(minutes){return minutes>0?"tb-pos":minutes<0?"tb-neg":"tb-zero";}
function computeTimeBank(entries,cfg,from,to){
 const types=["clock_in","break_start","break_end","clock_out"],byEmp=new Map();
 for(const x of entries||[]){if(!types.includes(x.entry_type))continue;const d=localDateForValue(x.occurred_at);if(d<from||d>to)continue;if(!byEmp.has(x.employee_id))byEmp.set(x.employee_id,[]);byEmp.get(x.employee_id).push(x);}
 const out=new Map();
 for(const [id,list] of byEmp){
  const days=buildDailyWork(list).map(d=>{const wd=new Date(d.day+"T12:00:00").getDay(),expected=Math.round((wd===0?0:wd===6?cfg.saturday:cfg.weekday)*60),complete=!!(d.times.clock_in&&d.times.clock_out),worked=Math.round(d.minutes);return {...d,expected,worked,complete,balance:complete?worked-expected:0};});
  out.set(id,{days,worked:days.filter(d=>d.complete).reduce((n,d)=>n+d.worked,0),expected:days.filter(d=>d.complete).reduce((n,d)=>n+d.expected,0),auto:days.reduce((n,d)=>n+d.balance,0),incomplete:days.filter(d=>!d.complete).length});
 }
 return out;
}
function renderTimeBank(){
 const companyId=state.companyId||accessCompanies[0]?.id||"";timeBankCompanyId=companyId;const canEdit=["kr_admin","company_admin"].includes(authProfile?.role),cfg=tbReadConfig(companyId);
 const opts=(accessCompanies||[]).map(c=>'<option value="'+c.id+'" '+(c.id===companyId?'selected':'')+'>'+safeHtml(c.trade_name||c.legal_name)+'</option>').join("");
 return heading("GESTÃO DE JORNADA","Banco de horas","Saldo apurado automaticamente a partir dos Lançamentos, somado às movimentações registradas.",'<div class="page-actions"><button class="btn" data-action="tb-export-excel">Exportar Excel</button><button class="btn" data-action="tb-export-pdf">Exportar PDF</button>'+(canEdit?'<button class="btn primary" data-action="new-time-bank-movement">＋ Nova movimentação</button>':"")+'</div>')+
 '<section class="access-wizard tb-filters"><label>Empresa<select id="timeBankCompanySelect">'+(opts||'<option value="">Selecione uma empresa</option>')+'</select></label><label>Período inicial<input type="date" id="tbFrom" value="'+timeBankFromDate+'"></label><label>Período final<input type="date" id="tbTo" value="'+timeBankToDate+'"></label><label>Jornada seg–sex (h/dia)<input type="number" id="tbWeekday" min="0" max="24" step="0.25" value="'+cfg.weekday+'"></label><label>Jornada sábado (h)<input type="number" id="tbSaturday" min="0" max="24" step="0.25" value="'+cfg.saturday+'"></label><button class="btn primary" data-action="refresh-time-bank">Atualizar</button></section><div id="timeBankPanel"><div class="table-panel"><div class="empty-state">Carregando banco de horas...</div></div></div>';
}
function timeBankTime(minutes){const n=Math.abs(Number(minutes)||0);return (minutes<0?"−":"")+String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0");}
async function loadTimeBankPanel(){
 const host=$("#timeBankPanel"),companyId=$("#timeBankCompanySelect")?.value||timeBankCompanyId;if(!host)return;if(!companyId){host.innerHTML='<div class="table-panel"><div class="empty-state">Selecione uma empresa.</div></div>';return;}timeBankCompanyId=companyId;
 const from=$("#tbFrom")?.value||timeBankFromDate,to=$("#tbTo")?.value||timeBankToDate;if(from>to){host.innerHTML='<div class="table-panel"><div class="empty-state">O período inicial não pode ser posterior ao final.</div></div>';return;}
 timeBankFromDate=from;timeBankToDate=to;
 const wk=Number(String($("#tbWeekday")?.value||"8").replace(",",".")),sat=Number(String($("#tbSaturday")?.value||"0").replace(",","."));
 const cfg={weekday:Number.isFinite(wk)&&wk>=0&&wk<=24?wk:8,saturday:Number.isFinite(sat)&&sat>=0&&sat<=24?sat:0};tbSaveConfig(companyId,cfg);
 host.innerHTML='<div class="table-panel"><div class="empty-state">Consultando lançamentos e movimentações...</div></div>';
 const canSeeEntries=["kr_admin","analyst","company_admin"].includes(authProfile?.role);
 const [bank,entriesRes]=await Promise.all([db.functions.invoke("manage-time-bank",{body:{action:"list",company_id:companyId}}),canSeeEntries?db.functions.invoke("manage-time-entries",{body:{action:"list",company_id:companyId}}):Promise.resolve({data:null,error:null})]);
 if(!$("#timeBankPanel"))return;const data=bank.data,error=bank.error;
 if(error||data?.error){host.innerHTML='<div class="table-panel"><div class="empty-state">Não foi possível carregar: '+safeHtml(data?.error||error?.message)+'</div></div>';return;}
 const entriesFailed=canSeeEntries&&(entriesRes.error||entriesRes.data?.error),entries=entriesFailed?[]:(entriesRes.data?.entries||[]),truncated=entries.length>=500;
 timeBankCache={employees:data.employees||[],movements:data.movements||[]};
 const auto=computeTimeBank(entries,cfg,from,to),totals=new Map(timeBankCache.employees.map(e=>[e.id,{employee:e,credit:0,compensation:0,paid:0}]));
 for(const m of timeBankCache.movements){const t=totals.get(m.employee_id);if(t)t[m.movement_type]+=Number(m.minutes)||0;}
 const canEdit=["kr_admin","company_admin"].includes(authProfile?.role);
 const rows=[...totals.values()].filter(x=>x.employee.status==="active").map(t=>{const a=auto.get(t.employee.id)||{days:[],worked:0,expected:0,auto:0,incomplete:0},manual=t.credit-t.compensation-t.paid;return {...t,a,manual,total:a.auto+manual};});
 const sum=f=>rows.reduce((n,r)=>n+f(r),0);
 timeBankView={rows,from,to,cfg,companyId,truncated,entriesFailed:!!entriesFailed,canSeeEntries};
 const period=new Date(from+"T12:00:00").toLocaleDateString("pt-BR")+" a "+new Date(to+"T12:00:00").toLocaleDateString("pt-BR");
 const kpi=(label,value,tone,foot)=>'<div class="tb-kpi '+(tone||"")+'"><span>'+label+'</span><strong>'+value+'</strong><small>'+foot+'</small></div>';
 const notices=(entriesFailed?'<div class="notice tb-notice"><span class="notice-icon">!</span><div><strong>Lançamentos indisponíveis</strong><p>Não foi possível ler as marcações agora. Exibindo somente as movimentações registradas.</p></div></div>':!canSeeEntries?'<div class="notice tb-notice"><span class="notice-icon">i</span><div><strong>Apuração automática indisponível para este perfil</strong><p>O seu perfil consulta apenas as movimentações registradas no banco de horas.</p></div></div>':"")+(truncated?'<div class="notice tb-notice"><span class="notice-icon">i</span><div><strong>Limite de marcações</strong><p>A consulta de Lançamentos retorna as 500 marcações mais recentes. Períodos muito antigos podem aparecer incompletos.</p></div></div>':"");
 const summary='<div class="tb-kpis">'+kpi("Funcionários ativos",String(rows.length),"","Na empresa selecionada")+kpi("Horas trabalhadas",timeBankTime(sum(r=>r.a.worked)),"","Período "+period)+kpi("Saldo do período",timeBankDelta(sum(r=>r.a.auto)),tbTone(sum(r=>r.a.auto)),"Trabalhado − previsto")+kpi("Saldo total do banco",timeBankDelta(sum(r=>r.total)),tbTone(sum(r=>r.total)),"Período + movimentações")+'</div>';
 const table='<div class="table-panel"><div class="table-toolbar"><div><strong>Saldos individuais</strong><small class="access-subline">Previsto: '+cfg.weekday+'h seg–sex · '+cfg.saturday+'h sábado · domingo sem jornada. Dias sem saída final ficam fora do cálculo.</small></div><input class="search" id="tbSearch" placeholder="Buscar funcionário..."></div><div class="table-wrap"><table id="tbTable"><thead><tr><th>FUNCIONÁRIO</th><th>DIAS</th><th>TRABALHADO</th><th>PREVISTO</th><th>APURADO</th><th>MOVIMENTAÇÕES</th><th>SALDO ATUAL</th><th>AÇÃO</th></tr></thead><tbody>'+(rows.length?rows.map(r=>'<tr><td><strong>'+safeHtml(r.employee.full_name)+'</strong><small class="access-subline">'+safeHtml(r.employee.employee_code||"")+(r.a.incomplete?' · <span class="tb-warn">'+r.a.incomplete+' dia(s) incompleto(s)</span>':'')+'</small></td><td>'+r.a.days.length+'</td><td>'+timeBankTime(r.a.worked)+'</td><td>'+timeBankTime(r.a.expected)+'</td><td><span class="tb-chip '+tbTone(r.a.auto)+'">'+timeBankDelta(r.a.auto)+'</span></td><td><span class="tb-chip '+tbTone(r.manual)+'">'+timeBankDelta(r.manual)+'</span></td><td><strong class="tb-total '+tbTone(r.total)+'">'+timeBankDelta(r.total)+'</strong></td><td>'+(canEdit?'<button class="btn small" data-action="new-time-bank-movement" data-employee-id="'+r.employee.id+'">Movimentar</button>':"—")+'</td></tr>').join(""):'<tr><td colspan="8" class="empty-cell">Nenhum funcionário ativo.</td></tr>')+'</tbody></table></div></div>';
 const withDays=rows.filter(r=>r.a.days.length);
 const details='<div class="table-panel tb-details"><div class="table-toolbar"><div><strong>Apuração diária</strong><small class="access-subline">Detalhe das marcações usadas no cálculo, por funcionário</small></div></div>'+(withDays.length?withDays.map(r=>'<details class="tb-employee"><summary><span>'+safeHtml(r.employee.full_name)+'</span><small>'+r.a.days.length+' dia(s)</small><span class="tb-chip '+tbTone(r.a.auto)+'">'+timeBankDelta(r.a.auto)+'</span></summary><div class="table-wrap"><table><thead><tr><th>DATA</th><th>ENTRADA</th><th>SAÍDA</th><th>TRABALHADO</th><th>PREVISTO</th><th>SALDO</th></tr></thead><tbody>'+r.a.days.map(d=>'<tr><td>'+new Date(d.day+"T12:00:00").toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"2-digit"})+'</td><td>'+reportTimeCell(d.times.clock_in)+'</td><td>'+reportTimeCell(d.times.clock_out)+'</td><td>'+(d.complete?timeBankTime(d.worked):'—')+'</td><td>'+(d.complete?timeBankTime(d.expected):'—')+'</td><td>'+(d.complete?'<span class="tb-chip '+tbTone(d.balance)+'">'+timeBankDelta(d.balance)+'</span>':'<span class="pill pending">Incompleto</span>')+'</td></tr>').join("")+'</tbody></table></div></details>').join(""):'<div class="empty-state">Nenhuma marcação encontrada no período selecionado.</div>')+'</div>';
 const history='<div class="table-panel"><div class="table-toolbar"><div><strong>Histórico de movimentações</strong><small class="access-subline">'+timeBankCache.movements.length+' registro(s) · créditos, compensações e horas pagas</small></div></div><div class="table-wrap"><table><thead><tr><th>DATA</th><th>FUNCIONÁRIO</th><th>MOVIMENTAÇÃO</th><th>QUANTIDADE</th><th>DESCRIÇÃO</th></tr></thead><tbody>'+(timeBankCache.movements.length?timeBankCache.movements.map(m=>{const emp=timeBankCache.employees.find(x=>x.id===m.employee_id),label=({credit:"Crédito no banco",compensation:"Compensação / folga",paid:"Hora extra paga"})[m.movement_type];return '<tr><td>'+new Date(m.occurred_on+"T12:00:00").toLocaleDateString("pt-BR")+'</td><td>'+safeHtml(emp?.full_name||"Funcionário")+'</td><td><span class="pill '+(m.movement_type==="credit"?"ok":m.movement_type==="paid"?"info":"pending")+'">'+safeHtml(label)+'</span></td><td><strong>'+timeBankTime(m.minutes)+'</strong></td><td>'+safeHtml(m.note)+'</td></tr>';}).join(""):'<tr><td colspan="5" class="empty-cell">Nenhuma movimentação registrada.</td></tr>')+'</tbody></table></div></div>';
 host.innerHTML=notices+summary+table+details+history;
 const search=$("#tbSearch");if(search)search.addEventListener("input",()=>{const q=search.value.toLocaleLowerCase("pt-BR");$("#tbTable")?.querySelectorAll("tbody tr").forEach(tr=>tr.style.display=tr.innerText.toLocaleLowerCase("pt-BR").includes(q)?"":"none");});
}
function timeBankDocData(){
 const v=timeBankView;if(!v)return null;const company=(accessCompanies||[]).find(c=>c.id===v.companyId),name=company?.trade_name||company?.legal_name||state.company;
 const period=new Date(v.from+"T12:00:00").toLocaleDateString("pt-BR")+" a "+new Date(v.to+"T12:00:00").toLocaleDateString("pt-BR");
 const tot=f=>v.rows.reduce((n,r)=>n+f(r),0);
 return {name,period,v,tot,headers:["Funcionário","Matrícula","Dias","Trabalhado","Previsto","Apurado","Movimentações","Saldo atual"],rows:v.rows.map(r=>[r.employee.full_name,r.employee.employee_code||"—",r.a.days.length,timeBankTime(r.a.worked),timeBankTime(r.a.expected),timeBankDelta(r.a.auto),timeBankDelta(r.manual),timeBankDelta(r.total)])};
}
function exportTimeBankPdf(){
 const d=timeBankDocData();if(!d){toast("Aguarde o carregamento do banco de horas.");return;}const D=window.PontoDocs;
 const sections=[{title:"Saldos individuais",note:"Previsto: "+d.v.cfg.weekday+"h seg–sex · "+d.v.cfg.saturday+"h sábado. Saldo atual = apurado nos lançamentos + movimentações registradas.",html:D.tableHtml(d.headers,d.rows,{numeric:[2,3,4,5,6,7],strong:[0,7],tone:[5,6,7]})}];
 d.v.rows.filter(r=>r.a.days.length).forEach(r=>sections.push({title:r.employee.full_name,note:"Apuração diária · saldo do período "+timeBankDelta(r.a.auto),html:D.tableHtml(["Data","Entrada","Saída","Trabalhado","Previsto","Saldo"],r.a.days.map(x=>[new Date(x.day+"T12:00:00").toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"2-digit"}),reportTimeCell(x.times.clock_in),reportTimeCell(x.times.clock_out),x.complete?timeBankTime(x.worked):"—",x.complete?timeBankTime(x.expected):"—",x.complete?timeBankDelta(x.balance):"Incompleto"]),{numeric:[3,4,5],tone:[5]})}));
 if(!D.openPdf({kicker:"Gestão de jornada",title:"Banco de horas",subtitle:d.name+" · "+d.period,meta:[["Empresa",d.name],["Período",d.period],["Jornada prevista",d.v.cfg.weekday+"h seg–sex · "+d.v.cfg.saturday+"h sáb."],["Funcionários",String(d.v.rows.length)]],kpis:[["Horas trabalhadas",timeBankTime(d.tot(r=>r.a.worked))],["Saldo do período",timeBankDelta(d.tot(r=>r.a.auto)),d.tot(r=>r.a.auto)<0?"neg":"pos"],["Saldo total do banco",timeBankDelta(d.tot(r=>r.total)),d.tot(r=>r.total)<0?"neg":"pos"]],sections,landscape:false}))toast("Permita a abertura de janelas para gerar o PDF.");
}
function exportTimeBankExcel(){
 const d=timeBankDocData();if(!d){toast("Aguarde o carregamento do banco de horas.");return;}
 const sheets=[{name:"Saldos",headers:d.headers,rows:d.rows},{name:"Apuração diária",headers:["Funcionário","Data","Entrada","Saída","Trabalhado","Previsto","Saldo"],rows:d.v.rows.flatMap(r=>r.a.days.map(x=>[r.employee.full_name,new Date(x.day+"T12:00:00").toLocaleDateString("pt-BR"),reportTimeCell(x.times.clock_in),reportTimeCell(x.times.clock_out),x.complete?timeBankTime(x.worked):"—",x.complete?timeBankTime(x.expected):"—",x.complete?timeBankDelta(x.balance):"Incompleto"]))},{name:"Movimentações",headers:["Data","Funcionário","Tipo","Quantidade","Descrição"],rows:timeBankCache.movements.map(m=>[new Date(m.occurred_on+"T12:00:00").toLocaleDateString("pt-BR"),timeBankCache.employees.find(x=>x.id===m.employee_id)?.full_name||"Funcionário",({credit:"Crédito no banco",compensation:"Compensação / folga",paid:"Hora extra paga"})[m.movement_type],timeBankTime(m.minutes),m.note])}];
 if(!window.PontoDocs?.saveExcel({filename:"Kronius-banco-de-horas.xlsx",title:"Banco de horas",meta:[["Empresa",d.name],["Período",d.period]],sheets}))toast("Não foi possível gerar o Excel agora.");
}
function openTimeBankMovement(employeeId=""){
 if(!["kr_admin","company_admin"].includes(authProfile?.role)){toast("Somente o administrador da empresa ou a KR pode movimentar o banco de horas.");return;}const employees=timeBankCache.employees.filter(x=>x.status==="active");if(!employees.length){toast("Não há funcionários ativos nesta empresa.");return;}
 const opts='<option value="">Selecione o funcionário</option>'+employees.map(x=>'<option value="'+x.id+'" '+(x.id===employeeId?'selected':'')+'>'+safeHtml(x.full_name)+' · '+safeHtml(x.employee_code||"")+'</option>').join("");
 openLaunchModal("Nova movimentação","Registre crédito, compensação de folga ou pagamento de horas extras.",'<form id="timeBankMovementForm" class="access-form"><label class="full">Funcionário<select name="employee_id" required>'+opts+'</select></label><label class="full">Tipo de movimentação<select name="movement_type" required><option value="credit">Crédito de horas no banco</option><option value="compensation">Compensação / funcionário retirou folga</option><option value="paid">Horas extras pagas pelo empregador</option></select></label><label>Quantidade de horas<input type="number" name="hours" min="0.02" max="1666" step="0.01" placeholder="Ex.: 2,5" required></label><label>Data<input type="date" name="occurred_on" value="'+localDateValue()+'" required></label><label class="full">Descrição / observação<input name="note" minlength="5" required></label><button class="btn primary full" type="submit">Salvar movimentação</button><p class="login-error full" id="timeBankFormError"></p></form>');
}

document.addEventListener("click",async e=>{
 const b=e.target.closest("[data-action]");if(!b)return;const a=b.dataset.action;
 if(a==="records-tab"){recordsTab=b.dataset.tab||"entries";renderApp();return;}
 if(a==="refresh-records"){loadRecordsPanel();return;}
 if(a==="refresh-pending"){loadPendingPanel();return;}
 if(a==="resolve-missing-punch"){
  const requestId=b.dataset.requestId,companyId=b.dataset.companyId||$("#pendingCompanySelect")?.value,decision=b.dataset.decision,note=document.querySelector('[data-missing-note="'+requestId+'"]')?.value.trim()||"";
  if(note.length<4){toast("Informe uma observação da análise com pelo menos 4 caracteres.");return;}
  b.disabled=true;const {data,error}=await db.functions.invoke("manage-time-entries",{body:{action:"resolve_request",company_id:companyId,request_id:requestId,decision,note}});
  if(error||data?.error||!data?.success){toast(data?.error||error?.message||"Não foi possível concluir a análise.");b.disabled=false;return;}
  toast(decision==="approve"?"Marcação aprovada e incluída nos lançamentos.":"Solicitação rejeitada.");await loadPendingPanel();return;
 }
 if(a==="close-launch-modal"){closeLaunchModal();return;}
 if(a==="open-manual-form"){openExistingFormModal("manualPunchForm","Lançamento manual de ponto","Inclua uma marcação autorizada, identificada como lançamento administrativo.");return;}
 if(a==="open-missing-form"){openExistingFormModal("missingPunchForm","Solicitar marcação esquecida","A solicitação ficará pendente até aprovação do responsável.");return;}
 if(a==="new-time-bank-movement"){openTimeBankMovement(b.dataset.employeeId||"");return;}
 if(a==="refresh-time-bank"){loadTimeBankPanel();return;}
 if(a==="tb-export-pdf"){exportTimeBankPdf();return;}
 if(a==="tb-export-excel"){exportTimeBankExcel();return;}
 if(a==="close-employee-editor"||a==="close-leave"||a==="close-main-company"||a==="cancel-vacation"){closeLaunchModal();return;}
});
document.addEventListener("change",e=>{if(["timeBankCompanySelect","tbFrom","tbTo","tbWeekday","tbSaturday"].includes(e.target.id))loadTimeBankPanel();});
document.addEventListener("submit",async e=>{
 if(e.target.id==="timeBankMovementForm"){
  e.preventDefault();const form=e.target,f=new FormData(form),hours=Number(String(f.get("hours")).replace(",",".")),minutes=Math.round(hours*60),companyId=$("#timeBankCompanySelect")?.value||timeBankCompanyId,err=$("#timeBankFormError"),button=form.querySelector('button[type="submit"]');
  if(!Number.isFinite(hours)||hours<=0||minutes<1){err.textContent="Informe uma quantidade de horas válida.";return;}
  button.disabled=true;const {data,error}=await db.functions.invoke("manage-time-bank",{body:{action:"create",company_id:companyId,employee_id:f.get("employee_id"),movement_type:f.get("movement_type"),minutes,occurred_on:f.get("occurred_on"),note:String(f.get("note")||"").trim()}});
  if(error||data?.error){err.textContent=data?.error||error?.message||"Não foi possível salvar.";button.disabled=false;return;}
  toast("Movimentação registrada no banco de horas.");closeLaunchModal();loadTimeBankPanel();return;
 }
 if(["employeeCreateForm","mainCompanyForm","leaveCreateForm","vacationCreateForm"].includes(e.target.id)){
  const form=e.target;setTimeout(()=>{const err=form.querySelector(".login-error");if($("#launchModal")&&(!err||!err.textContent.trim()))closeLaunchModal();},900);
 }
});
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-action]");if(!b)return;
 if(b.dataset.action==="export-report-excel"||b.dataset.action==="export-report-pdf"){
  const ctx=reportExportContext();if(!ctx){toast("Consulte um relatório antes de exportar.");return;}
  if(b.dataset.action==="export-report-excel"){if(!window.PontoDocs?.saveExcel({filename:"Kronius-"+ctx.slug+".xlsx",title:ctx.title,meta:ctx.meta,sheets:ctx.sheets}))toast("Não foi possível gerar o Excel agora.");return;}
  if(!window.PontoDocs.openPdf({kicker:"DP e relatórios",title:ctx.title,subtitle:ctx.company+" · "+ctx.period,meta:ctx.meta,kpis:ctx.kpis,sections:ctx.pdfSections,landscape:false}))toast("Permita a abertura de janelas para gerar o PDF.");
 }
});


// Navegação global, seleção de empresa e ações do dashboard
document.addEventListener("click",e=>{
 const viewButton=e.target.closest("[data-view]");
 if(viewButton){
  const view=viewButton.dataset.view;
  if(view==="devices"&&authProfile?.role!=="kr_admin"){toast("A aba Dispositivos está disponível somente para o perfil master.");return;}
  if(view){state.view=view;render();return;}
 }
 const actionButton=e.target.closest("[data-action]");
 if(!actionButton)return;
 if(actionButton.dataset.action==="new-company"){
  state.view="companies";renderApp();openMainCompanyWizard();return;
 }
 if(actionButton.dataset.action==="company-detail"){
  if(authProfile?.role!=="kr_admin"){toast("Apenas o perfil master pode abrir o cadastro das empresas.");return;}
  openCompanyDetails(actionButton.dataset.companyId,"data");return;
 }
 if(actionButton.dataset.action==="company-detail-tab"){
  if(authProfile?.role!=="kr_admin"){toast("Apenas o perfil master pode acessar esta área.");return;}
  openCompanyDetails(actionButton.dataset.companyId,actionButton.dataset.tab||"data");return;
 }
 if(actionButton.dataset.action==="open-employee-company"){
  const companyId=actionButton.dataset.companyId;
  if(!(accessCompanies||[]).some(c=>c.id===companyId)){toast("Empresa não encontrada na lista atual.");return;}
  employeeSelectedCompanyId=companyId;state.view="employees";renderApp();return;
 }
 if(actionButton.dataset.action==="back-employee-companies"){
  employeeSelectedCompanyId=null;employeeDirectory=[];renderApp();return;
 }
});
document.addEventListener("change",e=>{
 if(e.target.id==="companySwitcher"){
  const id=e.target.value;
  auditOpen=false;reportMenuOpen=false;if(id==="KR Contábil"||!id){state.company="KR Contábil";state.companyId=null;if(authProfile?.role==="kr_admin")state.view="companies";}
  else{
   const company=accessCompanies.find(c=>c.id===id);
   if(!company)return;
   state.companyId=company.id;state.company=company.trade_name||company.legal_name;
   if(authProfile?.role==="kr_admin")state.view="dashboard";
  }
  updateCompanyHeader();
  render();
 }
});
document.addEventListener("click",e=>{
 if(e.target.closest("#mobileMenu")){
  const shell=$("#appShell"),sidebar=$("#sidebar");
  if(!shell||!sidebar)return;
  if(window.matchMedia("(min-width: 761px)").matches){
   shell.classList.toggle("sidebar-collapsed");
   const collapsed=shell.classList.contains("sidebar-collapsed");
   e.target.closest("#mobileMenu").setAttribute("aria-expanded",String(!collapsed));
  }else{
   sidebar.classList.toggle("open");
   e.target.closest("#mobileMenu").setAttribute("aria-expanded",String(sidebar.classList.contains("open")));
  }
 }
});



/* Lançamentos: janela modal centralizada, com fundo escurecido */
(function setupEmployeeHistoryModal(){
  function openModal(card){
    if(!card?.open)return;
    document.querySelectorAll(".records-employee-card[open]").forEach(other=>{if(other!==card)other.open=false;});
    const modal=card.querySelector(".records-employee-popover");
    if(!modal)return;
    modal.style.setProperty("position","fixed","important");
    modal.style.setProperty("left","50%","important");
    modal.style.setProperty("right","auto","important");
    modal.style.setProperty("top","50%","important");
    modal.style.setProperty("bottom","auto","important");
    modal.style.setProperty("width","min(1480px, calc(100vw - 260px))","important");
    modal.style.setProperty("height","min(750px, 82vh)","important");
    modal.style.setProperty("max-width","calc(100vw - 260px)","important");
    modal.style.setProperty("max-height","82vh","important");
    modal.style.setProperty("transform","translate(-50%,-50%)","important");
    modal.style.setProperty("display","flex","important");
    modal.style.setProperty("flex-direction","column","important");
    modal.style.setProperty("overflow","hidden","important");
    modal.setAttribute("role","dialog");
    modal.setAttribute("aria-modal","true");
  }
  document.addEventListener("toggle",event=>{
    const card=event.target;
    if(card?.matches?.(".records-employee-card")&&card.open)requestAnimationFrame(()=>openModal(card));
  },true);
  document.addEventListener("click",event=>{
    const close=event.target.closest(".records-modal-close");
    if(close){close.closest(".records-employee-card")?.removeAttribute("open");return;}
  });
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape")document.querySelectorAll(".records-employee-card[open]").forEach(card=>card.open=false);
  });
})();


/* Prévia flutuante da foto posicionada ao lado do ícone do olho */
(function setupPhotoHoverPreview(){
  function showPreview(eye){
    const preview=eye?.querySelector(".photo-eye-preview");
    if(!preview)return;
    preview.style.display="block";
    const rect=eye.getBoundingClientRect();
    const width=Math.min(250,window.innerWidth-28);
    const height=Math.min(220,preview.getBoundingClientRect().height||190);
    let left=rect.left+(rect.width/2)-(width/2);
    left=Math.max(14,Math.min(left,window.innerWidth-width-14));
    let top=rect.top-height-10;
    if(top<10)top=rect.bottom+10;
    if(top+height>window.innerHeight-10)top=Math.max(10,window.innerHeight-height-10);
    preview.style.left=left+"px";
    preview.style.top=top+"px";
  }
  function hidePreview(eye){
    const preview=eye?.querySelector(".photo-eye-preview");
    if(preview)preview.style.display="none";
  }
  document.addEventListener("mouseover",event=>{
    const eye=event.target.closest?.(".photo-eye");
    if(eye&&!eye.contains(event.relatedTarget))showPreview(eye);
  });
  document.addEventListener("mouseout",event=>{
    const eye=event.target.closest?.(".photo-eye");
    if(eye&&!eye.contains(event.relatedTarget))hidePreview(eye);
  });
  document.addEventListener("focusin",event=>{
    const eye=event.target.closest?.(".photo-eye");
    if(eye)showPreview(eye);
  });
  document.addEventListener("focusout",event=>{
    const eye=event.target.closest?.(".photo-eye");
    if(eye)hidePreview(eye);
  });
  document.addEventListener("scroll",()=>{
    document.querySelectorAll(".photo-eye-preview").forEach(preview=>preview.style.display="none");
  },true);
})();


// ===== Relatórios executivos (perfil master, página inicial) =====
let execTab="portfolio",execData=null,execLoading=false;
const EXEC_TABS=[["portfolio","Carteira de empresas"],["employees","Funcionários por empresa"],["analysts","Analistas e carteiras"]];
function renderExecutiveReports(){
 const tab=(id,l)=>'<button class="company-detail-tab '+(execTab===id?'active':'')+'" data-action="exec-tab" data-tab="'+id+'">'+l+'</button>';
 return heading("MASTER","Relatórios executivos","Visão geral da carteira de empresas, equipes e analistas.",'<button class="btn" data-action="open-audit">Auditoria</button><button class="btn" data-action="exec-export-excel">Exportar Excel</button><button class="btn primary" data-action="exec-export-pdf">Exportar PDF</button>')+
 '<div class="company-detail-tabs exec-tabs">'+EXEC_TABS.map(t=>tab(t[0],t[1])).join("")+'</div><div id="execPanel"><div class="empty-state">Carregando relatório...</div></div>';
}
async function loadExecutivePanel(force){
 if(execLoading)return;
 if(execData&&!force){paintExecutivePanel();return;}
 execLoading=true;
 const [co,pr,as,em]=await Promise.all([
  db.from("companies").select("*").order("trade_name"),
  db.from("profiles").select("id,full_name,email,role,company_id,active,permissions").in("role",["analyst","company_admin"]).order("full_name"),
  db.from("analyst_company_access").select("analyst_id,company_id"),
  db.from("employees").select("id,company_id,status")
 ]);
 execLoading=false;
 const err=co.error||pr.error||as.error||em.error;
 if(err){const box=$("#execPanel");if(box)box.innerHTML='<p class="login-error">Não foi possível carregar o relatório: '+safeHtml(err.message)+'</p>';return;}
 execData={companies:co.data||[],profiles:pr.data||[],assignments:as.data||[],employees:em.data||[]};
 paintExecutivePanel();
}
function execModel(tab){
 const d=execData;if(!d)return null;
 const cos=d.companies,analysts=d.profiles.filter(p=>p.role==="analyst"),admins=d.profiles.filter(p=>p.role==="company_admin");
 const staff=id=>{const l=d.employees.filter(e=>e.company_id===id);const a=l.filter(e=>(e.status||"active")==="active").length;return {active:a,inactive:l.length-a,total:l.length};};
 const nameOf=c=>c.trade_name||c.legal_name;
 const analystsOf=id=>d.assignments.filter(a=>a.company_id===id).map(a=>analysts.find(x=>x.id===a.analyst_id)?.full_name).filter(Boolean);
 const adminOf=id=>admins.find(a=>a.company_id===id&&a.active!==false);
 const totalActive=cos.reduce((n,c)=>n+staff(c.id).active,0);
 if(tab==="employees"){
  const rows=cos.map(c=>{const t=staff(c.id),est=Number(c.average_employees)||0;return [nameOf(c),String(t.active),String(t.inactive),String(t.total),c.average_employees==null?"—":String(est)];});
  return {slug:"funcionarios-por-empresa",title:"Funcionários por empresa",headers:["Empresa","Ativos","Inativos","Total cadastrado","Estimativa informada"],rows,numeric:[1,2,3,4],strong:[0,1],
   kpis:[["Empresas",String(cos.length)],["Funcionários ativos",String(totalActive)],["Média por empresa",cos.length?(totalActive/cos.length).toFixed(1).replace(".",","):"0"]]};
 }
 if(tab==="analysts"){
  const rows=analysts.map(a=>{const ids=d.assignments.filter(x=>x.analyst_id===a.id).map(x=>x.company_id),names=ids.map(id=>cos.find(c=>c.id===id)).filter(Boolean).map(nameOf);return [a.full_name||"—",a.email||"—",String(names.length),names.join(", ")||"—",String(ids.reduce((n,id)=>n+staff(id).active,0)),a.active===false?"Inativo":"Ativo"];});
  const without=cos.filter(c=>!analystsOf(c.id).length).length;
  return {slug:"analistas-e-carteiras",title:"Analistas e carteiras",headers:["Analista","E-mail","Empresas","Carteira","Funcionários ativos","Status"],rows,numeric:[2,4],strong:[0],
   kpis:[["Analistas",String(analysts.length)],["Empresas com analista",String(cos.length-without)],["Empresas sem analista",String(without)]]};
 }
 const rows=cos.map(c=>{const a=adminOf(c.id);return [nameOf(c),c.cnpj||"—",regimeLabel(c.tax_regime),a?(a.full_name||a.email||"—"):"Não cadastrado",analystsOf(c.id).join(", ")||"—",String(staff(c.id).active),c.status==="inactive"?"Inativa":"Ativa"];});
 return {slug:"carteira-de-empresas",title:"Carteira de empresas",headers:["Empresa","CNPJ","Regime","Administrador","Analista","Funcionários ativos","Status"],rows,numeric:[5],strong:[0],
  kpis:[["Empresas cadastradas",String(cos.length)],["Ativas",String(cos.filter(c=>c.status!=="inactive").length)],["Funcionários ativos",String(totalActive)],["Analistas",String(analysts.length)]],
  regimes:Object.entries(cos.reduce((m,c)=>{const k=regimeLabel(c.tax_regime);m[k]=(m[k]||0)+1;return m;},{})).sort((a,b)=>b[1]-a[1])};
}
function analystCards(){
 const d=execData,cos=d.companies;
 const staff=id=>d.employees.filter(e=>e.company_id===id&&(e.status||"active")==="active").length;
 const analysts=d.profiles.filter(p=>p.role==="analyst");
 if(!analysts.length)return '<div class="empty-state">Nenhum analista cadastrado.</div>';
 return '<div class="analyst-grid">'+analysts.map(a=>{const ids=d.assignments.filter(x=>x.analyst_id===a.id).map(x=>x.company_id).filter(id=>cos.some(c=>c.id===id));const ini=(a.full_name||"?").split(" ").filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();return '<button type="button" class="analyst-card" data-action="exec-analyst" data-analyst-id="'+a.id+'"><span class="analyst-avatar">'+safeHtml(ini)+'</span><span class="analyst-info"><strong>'+safeHtml(a.full_name||"—")+(a.permissions?.leader?' <em class="leader-badge">Líder</em>':'')+'</strong><small>'+safeHtml(a.email||"—")+'</small></span><span class="analyst-stats"><b>'+ids.length+'</b><small>empresa(s)</small></span><span class="analyst-stats"><b>'+ids.reduce((n,id)=>n+staff(id),0)+'</b><small>funcionários</small></span>'+badge(a.active===false?"Inativo":"Ativo")+'<span class="analyst-arrow">›</span></button>';}).join("")+'</div>';
}
function openAnalystModal(id){
 const d=execData;if(!d)return;
 const a=d.profiles.find(p=>p.id===id);if(!a)return;
 const nameOf=c=>c.trade_name||c.legal_name;
 const ids=d.assignments.filter(x=>x.analyst_id===id).map(x=>x.company_id);
 const cos=ids.map(i=>d.companies.find(c=>c.id===i)).filter(Boolean);
 const staff=cid=>d.employees.filter(e=>e.company_id===cid&&(e.status||"active")==="active").length;
 const admin=cid=>d.profiles.find(p=>p.role==="company_admin"&&p.company_id===cid&&p.active!==false);
 const total=cos.reduce((n,c)=>n+staff(c.id),0),activeCos=cos.filter(c=>c.status!=="inactive").length;
 const reg=Object.entries(cos.reduce((m,c)=>{const k=regimeLabel(c.tax_regime);m[k]=(m[k]||0)+1;return m;},{})).sort((x,y)=>y[1]-x[1]);
 const max=Math.max(1,...reg.map(r=>r[1]));
 openLaunchModal(a.full_name||"Analista","Carteira de empresas e resumo do analista.","");
 $("#launchModal .launch-modal")?.classList.add("wide");
 $("#launchModalBody").innerHTML='<div class="analyst-modal-head"><span class="analyst-avatar big">'+safeHtml((a.full_name||"?").split(" ").filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase())+'</span><div><strong>'+safeHtml(a.full_name||"—")+(a.permissions?.leader?' <em class="leader-badge">Líder do departamento</em>':'')+'</strong><small>'+safeHtml(a.email||"—")+'</small></div>'+badge(a.active===false?"Inativo":"Ativo")+'</div>'+
 '<div class="exec-kpis"><div class="exec-kpi"><small>Empresas na carteira</small><strong>'+cos.length+'</strong></div><div class="exec-kpi"><small>Empresas ativas</small><strong>'+activeCos+'</strong></div><div class="exec-kpi"><small>Funcionários ativos</small><strong>'+total+'</strong></div><div class="exec-kpi"><small>Média por empresa</small><strong>'+(cos.length?(total/cos.length).toFixed(1).replace(".",","):"0")+'</strong></div></div>'+
 (reg.length?'<section class="panel exec-regimes"><div class="panel-heading"><div><h2>Regimes da carteira</h2></div></div>'+reg.map(r=>'<div class="exec-bar"><span>'+safeHtml(r[0])+'</span><div><i style="width:'+Math.round(r[1]/max*100)+'%"></i></div><b>'+r[1]+'</b></div>').join("")+'</section>':'')+
 '<h3 class="analyst-list-title">Empresas do analista</h3>'+(cos.length?'<div class="analyst-company-list">'+cos.map(c=>{const ad=admin(c.id);return '<div class="analyst-company-row"><span class="company-card-mark">▦</span><div class="acr-main"><strong>'+safeHtml(nameOf(c))+'</strong><small>'+safeHtml(c.cnpj||"CNPJ não informado")+' · '+safeHtml(regimeLabel(c.tax_regime))+'</small></div><div class="acr-meta"><small>Administrador</small><b>'+safeHtml(ad?(ad.full_name||ad.email):"Não cadastrado")+'</b></div><div class="acr-meta"><small>Funcionários</small><b>'+staff(c.id)+'</b></div>'+badge(c.status==="inactive"?"Inativa":"Ativa")+'<button class="btn small primary" data-action="enter-company-context" data-company-id="'+c.id+'">Acessar</button></div>';}).join("")+'</div>':'<div class="empty-state">Este analista ainda não tem empresas na carteira.</div>');
}
function paintExecutivePanel(){
 const box=$("#execPanel");if(!box||!execData)return;
 const m=execModel(execTab);
 if(execTab==="analysts"){
  const kp='<div class="exec-kpis">'+m.kpis.map(k=>'<div class="exec-kpi"><small>'+safeHtml(k[0])+'</small><strong>'+safeHtml(k[1])+'</strong></div>').join("")+'</div>';
  box.innerHTML=kp+'<p class="wizard-hint analyst-hint">Clique em um analista para ver a carteira completa e o resumo.</p>'+analystCards();return;
 }
 const kpis='<div class="exec-kpis">'+m.kpis.map(k=>'<div class="exec-kpi"><small>'+safeHtml(k[0])+'</small><strong>'+safeHtml(k[1])+'</strong></div>').join("")+'</div>';
 const max=m.regimes?Math.max(1,...m.regimes.map(r=>r[1])):1;
 const reg=m.regimes&&m.regimes.length?'<section class="panel exec-regimes"><div class="panel-heading"><div><h2>Regimes tributários</h2><p>Distribuição das empresas da carteira</p></div></div>'+m.regimes.map(r=>'<div class="exec-bar"><span>'+safeHtml(r[0])+'</span><div><i style="width:'+Math.round(r[1]/max*100)+'%"></i></div><b>'+r[1]+'</b></div>').join("")+'</section>':"";
 const th=m.headers.map(h=>'<th>'+safeHtml(h.toUpperCase())+'</th>').join("");
 const body=m.rows.length?m.rows.map(r=>'<tr>'+r.map((c,i)=>'<td'+(m.numeric.includes(i)?' class="num"':'')+'>'+(m.strong.includes(i)?'<strong>'+safeHtml(c)+'</strong>':safeHtml(c))+'</td>').join("")+'</tr>').join(""):'<tr><td colspan="'+m.headers.length+'" class="empty-cell">Nenhum registro encontrado.</td></tr>';
 box.innerHTML=kpis+reg+'<div class="table-panel"><div class="table-toolbar"><strong>'+safeHtml(m.title)+' <span class="muted">('+m.rows.length+')</span></strong></div><div class="table-wrap"><table><thead><tr>'+th+'</tr></thead><tbody>'+body+'</tbody></table></div></div>';
}
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-action]");if(!b)return;
 const a=b.dataset.action;
 if(a==="exec-tab"){execTab=b.dataset.tab;renderApp();return;}
 if(a==="exec-export-excel"||a==="exec-export-pdf"){
  const m=execModel(execTab);if(!m||!window.PontoDocs){toast("Aguarde o relatório carregar.");return;}
  const meta=[["Relatório",m.title],["Emitido por",authProfile?.full_name||"KR Contábil"],["Data",new Date().toLocaleDateString("pt-BR")]];
  if(a==="exec-export-excel"){if(!window.PontoDocs.saveExcel({filename:"Kronius-"+m.slug+".xlsx",title:m.title,meta,sheets:[{name:m.title.slice(0,30),headers:m.headers,rows:m.rows}]}))toast("Não foi possível gerar o Excel agora.");return;}
  const D=window.PontoDocs,sections=[{title:m.title,html:D.tableHtml(m.headers,m.rows,{numeric:m.numeric,strong:m.strong})}];
  if(m.regimes&&m.regimes.length)sections.unshift({title:"Regimes tributários",html:D.tableHtml(["Regime","Empresas"],m.regimes.map(r=>[r[0],String(r[1])]),{numeric:[1],strong:[0]})});
  if(!D.openPdf({kicker:"Relatório executivo",title:m.title,subtitle:"KR Contábil · Visão geral da carteira",meta,kpis:m.kpis,sections,landscape:m.headers.length>5}))toast("Permita a abertura de janelas para gerar o PDF.");
 }
});
document.addEventListener("submit",async e=>{
 if(e.target.id!=="companyEditForm")return;
 e.preventDefault();
 if(authProfile?.role!=="kr_admin")return;
 const form=e.target,id=form.dataset.companyId,f=new FormData(form),msg=$("#companyEditMsg"),btn=form.querySelector('button[type="submit"]');
 const avg=f.get("average_employees");
 const patch={legal_name:(f.get("legal_name")||"").trim(),trade_name:(f.get("trade_name")||"").trim()||null,tax_regime:f.get("tax_regime")||null,email:(f.get("email")||"").trim()||null,phone:(f.get("phone")||"").trim()||null,legal_representative:(f.get("legal_representative")||"").trim()||null,average_employees:avg===""||avg==null?null:Number(avg),status:f.get("status")==="inactive"?"inactive":"active"};
 if(!patch.legal_name){msg.textContent="Informe a razão social.";return;}
 btn.disabled=true;btn.textContent="Salvando...";msg.textContent="";
 const {error}=await db.from("companies").update(patch).eq("id",id);
 btn.disabled=false;btn.textContent="Salvar alterações";
 if(error){msg.textContent="Não foi possível salvar: "+error.message;return;}
 const c=(accessCompanies||[]).find(x=>x.id===id);if(c)Object.assign(c,patch);if(id===state.companyId){state.company=patch.trade_name||patch.legal_name;updateCompanyHeader();}
 execData=null;
 toast("Cadastro da empresa atualizado.");
 db.from("audit_logs").insert({company_id:id,actor_id:authUser.id,action:"company.updated_by_kr",entity_table:"companies",entity_id:id,details:{operation:"company_updated",company:patch.trade_name||patch.legal_name}}).then(()=>{});
 const row=document.querySelector('#dataTable [data-company-id="'+id+'"]');
 if(state.view==="companies"){const open=$("#mainCompanyEditor");const keep=open&&!open.hidden;$("#content").querySelector(".table-panel")&&refreshCompaniesTable();}
});
function refreshCompaniesTable(){
 const tp=$("#content .table-panel");if(!tp)return;
 const tmp=document.createElement("div");tmp.innerHTML=renderCompanies();
 const fresh=tmp.querySelector(".table-panel");if(fresh)tp.replaceWith(fresh);
 const kp=document.querySelector("#content .exec-kpis"),nk=tmp.querySelector(".exec-kpis");if(kp&&nk)kp.replaceWith(nk);
}

document.addEventListener("click",e=>{
 const b=e.target.closest("[data-action]");if(!b)return;
 const a=b.dataset.action,cid=b.dataset.companyId;
 if(a==="exec-analyst"){openAnalystModal(b.dataset.analystId);return;}
 if(a==="audit-company-events"){openCompanyAuditModal(cid);return;}
 if(a==="archive-company"){setCompanyArchived(cid,true);return;}
 if(a==="restore-company"){setCompanyArchived(cid,false);return;}
 if(a==="export-audit-companies"){exportAuditCompanies();return;}
 if(a==="print-audit-companies"){printAuditCompanies();return;}
 if(a==="audit-filter"){
  const f=b.dataset.filter;document.querySelectorAll("#auditFilter .company-detail-tab").forEach(x=>x.classList.toggle("active",x===b));
  const logs=(window.__auditModalLogs||[]).filter(l=>f==="all"||l.entity_table===f);const list=$("#auditModalList");if(list)list.innerHTML=auditTimeline(logs,false);return;
 }
 if(a==="enter-company-context")setTimeout(closeLaunchModal,0);
});
document.addEventListener("input",e=>{
 if(e.target.id!=="auditSearch")return;
 window.__auditSearch=e.target.value;const q=e.target.value.toLocaleLowerCase("pt-BR");
 document.querySelectorAll("#auditGrid .audit-company-card").forEach(c=>c.hidden=!c.dataset.search.includes(q));
});

function auditExportData(){
 const scope=$("#auditExportScope")?.value||"all",c=auditCompanyMap.get(window.__auditModalCompany);
 const logs=(window.__auditModalLogs||[]).filter(l=>scope==="all"||l.entity_table===scope);
 const scopeLabel={all:"Todas as movimentações",companies:"Somente da empresa",employees:"Somente dos funcionários",profiles:"Somente dos usuários"}[scope];
 const rows=logs.map(l=>{const p=auditProfileMap.get(l.actor_id);return [new Date(l.created_at).toLocaleString("pt-BR"),auditEntityLabel(l.entity_table),auditActionLabel(l.action),auditDetailsText(l),p?.full_name||p?.email||"KR / Sistema"];});
 return {name:c?(c.trade_name||c.legal_name):"Empresa",scopeLabel,rows,headers:["Data/hora","Tipo","Ação","Detalhes","Responsável"],scope};
}
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-action]");if(!b)return;
 const a=b.dataset.action;if(a!=="audit-export-excel"&&a!=="audit-export-pdf")return;
 const D=window.PontoDocs,m=auditExportData();if(!D)return;
 if(!m.rows.length){toast("Não há movimentações para exportar neste filtro.");return;}
 const meta=[["Empresa",m.name],["Filtro",m.scopeLabel],["Emitido por",authProfile?.full_name||"KR Contábil"],["Data",new Date().toLocaleDateString("pt-BR")]];
 const slug=m.name.normalize("NFD").replace(/[^\w\s-]/g,"").trim().replace(/\s+/g,"-").toLowerCase();
 if(a==="audit-export-excel"){if(!D.saveExcel({filename:"Kronius-auditoria-"+slug+".xlsx",title:"Histórico · "+m.name,meta,sheets:[{name:"Histórico",headers:m.headers,rows:m.rows}]}))toast("Não foi possível gerar o Excel agora.");return;}
 if(!D.openPdf({kicker:"Auditoria",title:"Histórico · "+m.name,subtitle:m.scopeLabel,meta,kpis:[["Movimentações",String(m.rows.length)]],sections:[{title:"Movimentações",html:D.tableHtml(m.headers,m.rows,{strong:[2]})}],landscape:true}))toast("Permita a abertura de pop-ups para gerar o PDF.");
});
