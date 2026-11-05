const companies = [];
const employees = [];
const punches = [];
const state={view:"dashboard",company:"KR Contábil",companyId:null};
const safeHtml=value=>String(value??"").replace(/[&<>"\']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","\'":"&#39;"}[ch]));
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
<section class="welcome-banner"><div class="welcome-copy"><h1>Olá, <span>${safeHtml(authProfile?.role==="analyst"?(authProfile.full_name||"Analista"):state.company)}!</span> <span class="wave">👋</span></h1><p>Bem-vindo ao Ponto.com. Gerencie as empresas e acompanhe a jornada dos colaboradores.</p></div><div class="welcome-art"><span class="welcome-script">Gestão simples<br><b>e organizada</b><br><em>para sua equipe.</em></span><div class="hero-monogram" aria-hidden="true"></div></div></section>
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
function renderCompanies(){
 const master=authProfile?.role==="kr_admin";
 const rows=accessCompanies||[];
 return `${heading("CADASTRO","Empresas","Consulte as empresas vinculadas ao seu acesso.",master?'<button class="btn primary" data-action="new-company">＋ Nova empresa</button>':"")}
 <div class="table-panel"><div class="table-toolbar"><strong>Empresas cadastradas <span class="muted">(${rows.length})</span></strong><input class="search" id="searchTable" placeholder="Buscar por empresa ou CNPJ..." /></div>
 <div class="table-wrap"><table id="dataTable"><thead><tr><th>EMPRESA</th><th>CNPJ</th><th>ESTIMATIVA DE FUNCIONÁRIOS</th><th>STATUS</th>${master?'<th>AÇÃO</th>':''}</tr></thead><tbody>
 ${rows.length?rows.map(x=>'<tr><td><strong>'+safeHtml(x.trade_name||x.legal_name)+'</strong><small class="access-subline">'+safeHtml(x.legal_name)+'</small></td><td>'+safeHtml(x.cnpj||"—")+'</td><td>'+safeHtml(x.average_employees??"Não informado")+'</td><td>'+badge(x.status==="inactive"?"Inativo":"Ativo")+'</td>'+(master?'<td><button class="btn" data-action="company-detail" data-company-id="'+x.id+'">Abrir cadastro</button></td>':'')+'</tr>').join(""):'<tr><td colspan="'+(master?5:4)+'" class="empty-cell">Nenhuma empresa vinculada ao seu acesso.</td></tr>'}
 </tbody></table></div></div><div id="mainCompanyEditor" class="access-wizard" hidden></div>`;
}
let employeeDirectory=[],generatedEmployeeAccess=[];
function renderEmployees(){
 const opts=(accessCompanies||[]).map(c=>'<option value="'+safeHtml(c.id)+'">'+safeHtml(c.trade_name||c.legal_name)+'</option>').join("");
 return heading("EQUIPE","Funcionários","Consulte os funcionários de todas as empresas vinculadas ao seu acesso.",'<button class="btn primary" data-action="new-employee">＋ Novo funcionário</button>')+'<div class="table-panel"><div class="table-toolbar employee-toolbar"><strong>Funcionários <span class="muted" id="employeeCount">(carregando...)</span></strong><select id="employeeCompanyFilter" class="search"><option value="all">Todas as empresas</option>'+opts+'</select><button class="btn" data-action="generate-employee-access">Gerar acessos em lote</button><input class="search" id="searchTable" placeholder="Buscar por nome, matrícula ou empresa..." /></div><div class="table-wrap"><table id="dataTable"><thead><tr><th><input type="checkbox" id="selectAllEmployees" aria-label="Selecionar todos"></th><th>FUNCIONÁRIO</th><th>MATRÍCULA</th><th>EMPRESA</th><th>CARGO</th><th>STATUS</th></tr></thead><tbody><tr><td colspan="6" class="empty-cell">Carregando funcionários...</td></tr></tbody></table></div></div><div id="employeeEditor" class="access-wizard" hidden></div><div id="employeeAccessResults" class="access-wizard" hidden></div>';
}
async function loadEmployeeDirectory(){
 const body=$("#dataTable tbody"),filter=$("#employeeCompanyFilter");if(!body||!filter)return;const ids=(accessCompanies||[]).map(c=>c.id);
 if(!ids.length){body.innerHTML='<tr><td colspan="6" class="empty-cell">Nenhuma empresa vinculada ao seu acesso.</td></tr>';$("#employeeCount").textContent="(0)";return;}
 let q=db.from("employees").select("id,company_id,employee_code,full_name,cpf,job_title,admission_date,status").in("company_id",ids).order("full_name");if(filter.value!=="all")q=q.eq("company_id",filter.value);
 const {data,error}=await q;if(error){body.innerHTML='<tr><td colspan="6" class="empty-cell">Falha ao carregar: '+safeHtml(error.message)+'</td></tr>';return;}
 employeeDirectory=data||[];$("#employeeCount").textContent="("+employeeDirectory.length+")";
 body.innerHTML=employeeDirectory.length?employeeDirectory.map(x=>{const c=accessCompanies.find(v=>v.id===x.company_id);return '<tr><td><input type="checkbox" class="employee-select" value="'+x.id+'"></td><td><strong>'+safeHtml(x.full_name)+'</strong><small class="access-subline">'+(x.cpf?"CPF cadastrado":"CPF ausente")+'</small></td><td>'+safeHtml(x.employee_code||"Não gerada")+'</td><td>'+safeHtml(c?.trade_name||c?.legal_name||"Empresa")+'</td><td>'+safeHtml(x.job_title||"—")+'</td><td>'+badge(x.status==="active"?"Ativo":x.status==="terminated"?"Desligado":"Inativo")+'</td></tr>';}).join(""):'<tr><td colspan="6" class="empty-cell">Nenhum funcionário cadastrado para esta seleção.</td></tr>';
}
function openEmployeeWizard(){
 const box=$("#employeeEditor");if(!box)return;const selected=$("#employeeCompanyFilter")?.value||"all",companyId=selected!=="all"?selected:(state.companyId||accessCompanies[0]?.id||"");
 box.hidden=false;box.innerHTML='<div class="wizard-head"><div><p class="eyebrow">CADASTRO DE EQUIPE</p><h2>Novo funcionário</h2><p>Vincule o cadastro à empresa correta.</p></div><button class="btn" type="button" data-action="close-employee-editor">Fechar</button></div><form id="employeeCreateForm" class="access-form"><label class="full">Empresa<select name="company_id" required>'+(accessCompanies||[]).map(c=>'<option value="'+safeHtml(c.id)+'" '+(c.id===companyId?'selected':'')+'>'+safeHtml(c.trade_name||c.legal_name)+'</option>').join("")+'</select></label><label>Nome completo<input name="full_name" required></label><label>CPF<input name="cpf" inputmode="numeric" maxlength="14" required></label><label>Cargo<input name="job_title"></label><label>Admissão<input name="admission_date" type="date"></label><button class="btn primary full" type="submit">Salvar funcionário</button><p id="employeeCreateError" class="login-error full"></p></form>';
 box.scrollIntoView({behavior:"smooth",block:"start"});
}
async function generateEmployeeAccess(){
 const chosen=[...document.querySelectorAll(".employee-select:checked")].map(x=>x.value),list=chosen.length?employeeDirectory.filter(x=>chosen.includes(x.id)):employeeDirectory,results=[],errors=[],used=new Map();
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
  const c=accessCompanies.find(v=>v.id===emp.company_id);results.push({name:emp.full_name,company:c?.trade_name||c?.legal_name||"Empresa",matricula:code,senha:cpf.slice(0,4)});
 }
 generatedEmployeeAccess=results;const box=$("#employeeAccessResults");if(box){box.hidden=false;box.innerHTML='<div class="wizard-head"><div><p class="eyebrow">ACESSOS GERADOS</p><h2>'+results.length+' funcionário(s)</h2><p>Senha: primeiros 4 dígitos do CPF.</p></div><button class="btn" data-action="close-employee-results">Fechar</button></div>'+(results.length?'<div class="table-wrap"><table><thead><tr><th>Funcionário</th><th>Empresa</th><th>Matrícula</th><th>Senha</th></tr></thead><tbody>'+results.map(x=>'<tr><td>'+safeHtml(x.name)+'</td><td>'+safeHtml(x.company)+'</td><td><strong>'+x.matricula+'</strong></td><td><strong>'+x.senha+'</strong></td></tr>').join("")+'</tbody></table></div><div class="wizard-actions"><button class="btn primary" data-action="export-employee-access">Exportar CSV</button><button class="btn" data-action="copy-employee-access">Copiar</button></div>':'')+(errors.length?'<p class="wizard-hint">'+errors.map(safeHtml).join("<br>")+'</p>':'')+'<p class="wizard-hint">A senha não é gravada no cadastro. Guarde o arquivo em local seguro.</p>';}
 await loadEmployeeDirectory();box?.scrollIntoView({behavior:"smooth",block:"start"});
}
function exportEmployeeAccess(){
 if(!generatedEmployeeAccess.length)return;const rows=[["Funcionário","Empresa","Matrícula","Senha"],...generatedEmployeeAccess.map(x=>[x.name,x.company,x.matricula,x.senha])],csv="\uFEFF"+rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(";")).join("\r\n"),blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="acessos-funcionarios-pontocom.csv";a.click();URL.revokeObjectURL(url);
}
function renderDevices(){return `${heading("DISPOSITIVOS","Celulares autorizados","Gerencie os celulares oficiais usados para registrar ponto.")}<div class="panel empty-state">Nenhum dispositivo vinculado a uma empresa.</div>`}
function renderRecords(){return `${heading("JORNADA","Marcações de ponto","Consulte as marcações registradas pelas empresas.")}<div class="table-panel"><div class="table-toolbar"><strong>Marcações recentes</strong><input class="search" id="searchTable" placeholder="Buscar funcionário ou empresa..." /></div><div class="table-wrap"><table id="dataTable"><thead><tr><th>FUNCIONÁRIO</th><th>EMPRESA</th><th>TIPO</th><th>HORÁRIO</th><th>STATUS</th></tr></thead><tbody><tr><td colspan="5" class="empty-cell">Nenhuma marcação registrada.</td></tr></tbody></table></div></div>`}
function renderReports(){return `${heading("DP E RELATÓRIOS","Relatórios","Prévia das ferramentas que serão implementadas na versão conectada.")}<div class="report-grid">${[["Espelho de ponto","Resumo individual por funcionário e competência.","▤"],["Pendências de marcação","Identifique dias com registros incompletos.","!"],["Resumo de jornada","Horas previstas e apuradas conforme regras configuradas.","◷"],["Relatório por empresa","Visão consolidada para conferência do DP.","▣"],["Auditoria","Histórico de solicitações e ações administrativas.","⌁"],["Exportação para folha","Preparação de dados para conferência e integração.","⇩"]].map((r,i)=>`<div class="report-card"><div class="stat-icon">${r[2]}</div><h3>${r[0]}</h3><p>${r[1]}</p><button class="btn" data-action="report" data-index="${i}">Visualizar módulo</button></div>`).join("")}</div>`}
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
function renderClock(){return `${heading("PWA DO FUNCIONÁRIO","Marcação de ponto","Tela de marcação para o celular oficial da empresa.")}<div class="clock-demo"><div class="clock-logo">P</div><h2 style="margin:0;font-size:18px">Ponto.com</h2><p class="muted" style="margin:6px 0">Dispositivo vinculado à empresa</p><div class="clock-time" id="clockTime">--:--:--</div><div class="clock-date" id="clockDate"></div><label for="pinInput" style="display:block;margin-top:20px;font-weight:700;font-size:12px">Identificação do funcionário</label><input class="pin-input" id="pinInput" inputmode="numeric" maxlength="6" placeholder="••••" aria-label="Identificação do funcionário"><div class="clock-actions"><button class="btn primary" data-action="clock-in">Entrada</button><button class="btn" data-action="clock-break">Saída intervalo</button><button class="btn" data-action="clock-return">Retorno intervalo</button><button class="btn" data-action="clock-out">Saída final</button></div><div class="clock-warning">A marcação será liberada após a configuração do funcionário e do dispositivo.</div></div>`}
function renderApp(){const views={dashboard:renderDashboard,companies:renderCompanies,employees:renderEmployees,devices:renderDevices,records:renderRecords,reports:renderReports,clock:renderClock,vacations:renderVacations};const titles={dashboard:"Visão geral",companies:"Empresas",employees:"Funcionários",devices:"Dispositivos",records:"Marcações de ponto",reports:"Relatórios",clock:"PWA de marcação",vacations:"Férias"};$("#content").innerHTML=contextBar()+(views[state.view]||renderDashboard)();const crumb=$("#pageCrumb");if(crumb)crumb.textContent=titles[state.view]||"Configurações";document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===state.view));$("#sidebar").classList.remove("open");const search=$("#searchTable");if(search)search.addEventListener("input",()=>{const q=search.value.toLowerCase();$("#dataTable").querySelectorAll("tbody tr").forEach(tr=>tr.style.display=tr.innerText.toLowerCase().includes(q)?"":"none")});if(state.view==="clock")updateClock();if(state.view==="employees")loadEmployeeDirectory()}
function updateClock(){const d=new Date();const t=$("#clockTime"),dt=$("#clockDate");if(t)t.textContent=d.toLocaleTimeString("pt-BR");if(dt)dt.textContent=d.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});const sec=d.getSeconds(),min=d.getMinutes(),hour=d.getHours()%12;const sh=$("#authSecondHand"),mh=$("#authMinuteHand"),hh=$("#authHourHand");if(sh)sh.style.transform="translateX(-50%) rotate("+((sec*6))+"deg)";if(mh)mh.style.transform="translateX(-50%) rotate("+((min*6+sec*.1))+"deg)";if(hh)hh.style.transform="translateX(-50%) rotate("+((hour*30+min*.5))+"deg)";const digital=$("#authDigitalClock");if(digital)digital.textContent=d.toLocaleTimeString("pt-BR")}
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
 '<label>Média de funcionários<input name="average_employees" type="number" min="0" step="1" required placeholder="Ex.: 25"></label>'+
 '<label>Analista responsável<select name="analyst_id" id="companyAnalyst" required><option value="">Carregando analistas...</option></select></label>'+
 '<div class="form-section-title full">Acesso do administrador da empresa</div><label>Nome do administrador<input name="admin_name" required></label><label>E-mail de acesso<input name="admin_email" type="email" required placeholder="Pode ser o e-mail da empresa"></label>'+
 '<p class="wizard-hint full">Ao concluir, o sistema criará uma senha provisória segura. A KR poderá copiar os dados ou abrir um e-mail padronizado para enviar ao cliente.</p>'+
 '<button class="btn primary full" id="saveCompanyAccount" type="submit">Cadastrar empresa e gerar acesso</button><p id="mainCompanyError" class="login-error full" role="alert"></p></form>';
 const {data,error}=await db.from("profiles").select("id,full_name").eq("role","analyst").eq("active",true).order("full_name");
 const select=$("#companyAnalyst");if(select)select.innerHTML='<option value="">Selecione o analista</option>'+(data||[]).map(x=>'<option value="'+x.id+'">'+safeHtml(x.full_name)+'</option>').join("");
 if(error&&select)select.innerHTML='<option value="">Erro ao carregar analistas</option>';
 box.scrollIntoView({behavior:"smooth",block:"start"});
}
async function openCompanyDetails(companyId){
 const box=$("#mainCompanyEditor");if(!box)return;
 const company=(accessCompanies||[]).find(c=>c.id===companyId);
 if(!company){toast("Empresa não encontrada na lista atual.");return;}
 box.hidden=false;box.innerHTML='<div class="wizard-head"><div><p class="eyebrow">CADASTRO DA EMPRESA</p><h2>'+safeHtml(company.trade_name||company.legal_name)+'</h2><p>Consulte os dados e gerencie o acesso do administrador.</p></div><button class="btn" data-action="close-main-company">Fechar</button></div><div class="access-rule-list"><p><strong>Razão social:</strong> '+safeHtml(company.legal_name||"—")+'</p><p><strong>CNPJ:</strong> '+safeHtml(company.cnpj||"—")+'</p><p><strong>E-mail da empresa:</strong> '+safeHtml(company.email||"—")+'</p><p><strong>Estimativa de funcionários:</strong> '+safeHtml(company.average_employees??"Não informado")+'</p><p id="companyAdminEmail"><strong>Administrador:</strong> Carregando...</p></div><div id="companyAccessResult" class="wizard-hint" aria-live="polite"></div><div class="wizard-actions"><button class="btn primary" data-action="regenerate-company-access" data-company-id="${companyId}">Gerar link de acesso e preparar envio</button><button class="btn" data-action="copy-pwa-link">Copiar link do PWA</button></div>';
 const {data,error}=await db.from("profiles").select("email,full_name").eq("company_id",companyId).eq("role","company_admin").eq("active",true).limit(1).maybeSingle();
 const target=$("#companyAdminEmail");if(target)target.innerHTML='<strong>Administrador:</strong> '+safeHtml(data?.full_name||"Não localizado")+' · '+safeHtml(data?.email||"Sem e-mail cadastrado");
 if(error&&target)target.textContent="Não foi possível consultar o administrador: "+error.message;
 box.scrollIntoView({behavior:"smooth",block:"start"});
}
async function regenerateCompanyAccess(companyId){
 const result=$("#companyAccessResult");if(result)result.textContent="Gerando link seguro de recuperação...";
 const {data,error}=await db.functions.invoke("company-access-link",{body:{company_id:companyId}});
 if(error||data?.error){if(result)result.textContent=data?.error||error?.message||"Não foi possível renovar o acesso.";return;}
 const company=(accessCompanies||[]).find(c=>c.id===companyId);
 lastCreatedCompanyAccess={email:data.email,action_link:data.action_link,company:company?.trade_name||company?.legal_name||"Empresa"};
 if(result)result.innerHTML='<div class="access-rule-list"><p><strong>Link seguro para definir nova senha:</strong> <a href="'+safeHtml(data.action_link)+'" target="_blank" rel="noopener">Abrir link de recuperação</a></p><p>O link é individual e de uso único.</p><p><strong>Login:</strong> '+safeHtml(data.email)+'</p><p><strong>Link:</strong> https://appontkr.vercel.app/</p></div><div class="wizard-actions"><button class="btn primary" data-action="send-company-email">Preparar e-mail para o cliente</button><button class="btn" data-action="copy-company-access-link">Copiar link de acesso</button></div>';
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
 const panel=$("#vacationPanel");if(!panel)return;
 panel.insertAdjacentHTML("afterbegin",'<form id="vacationCreateForm" class="access-form"><label>Funcionário<select name="employee_id" id="vacationEmployee" required><option value="">Carregando...</option></select></label><label>Data de início<input type="date" name="start_date" required></label><label>Data de término<input type="date" name="end_date" required></label><label class="full">Observações<input name="notes" placeholder="Opcional"></label><button class="btn primary" type="submit">Salvar período</button><button class="btn" type="button" data-action="cancel-vacation">Cancelar</button><p id="vacationFormError" class="login-error full"></p></form>');
 db.from("employees").select("id,full_name").eq("company_id",state.companyId).order("full_name").then(({data,error})=>{const s=$("#vacationEmployee");if(!s)return;s.innerHTML=error?'<option value="">Falha ao carregar</option>':'<option value="">Selecione</option>'+(data||[]).map(x=>'<option value="'+x.id+'">'+safeHtml(x.full_name)+'</option>').join("");});
}
document.addEventListener("click",e=>{const nav=e.target.closest("[data-view]");if(nav){state.view=nav.dataset.view;render();return}const b=e.target.closest("[data-action]");if(!b)return;const a=b.dataset.action;if(a==="switch-company"){const select=$("#companySwitcher");select.focus();select.scrollIntoView({block:"nearest",behavior:"smooth"});toast("Escolha a empresa no seletor destacado no topo.");}else if(a==="new-company"){openMainCompanyWizard();}else if(a==="new-vacation"){openVacationWizard();}else if(a==="new-employee"){if(state.view!=="employees"){state.view="employees";render();}openEmployeeWizard();}else if(a==="close-employee-editor"){$("#employeeEditor").hidden=true;}else if(a==="close-employee-results"){$("#employeeAccessResults").hidden=true;}else if(a==="generate-employee-access"){generateEmployeeAccess();}else if(a==="export-employee-access"){exportEmployeeAccess();}else if(a==="copy-employee-access"){GenUI.copy(generatedEmployeeAccess.map(x=>x.name+" | "+x.company+" | Matrícula: "+x.matricula+" | Senha: "+x.senha).join("\n"));toast("Acessos copiados.");}else if(a==="company-detail"){openCompanyDetails(b.dataset.companyId);}else if(a==="regenerate-company-access"){regenerateCompanyAccess(b.dataset.companyId);}else if(a==="employee-detail")toast("Perfil de "+employees[+b.dataset.index].name+" — .");else if(a==="device-info")toast("Nenhum aparelho está vinculado a esta empresa.");else if(a==="revoke-device")toast("A função de revogação será habilitada após a configuração dos dispositivos.");else if(a==="approve-device")toast("A autorização de dispositivos será habilitada após a configuração.");else if(a==="export-demo")toast("A exportação será habilitada após a conexão dos dados da empresa.");else if(a==="report")toast("Módulo em planejamento: "+["Espelho de ponto","Pendências de marcação","Resumo de jornada","Relatório por empresa","Auditoria","Exportação para folha"][+b.dataset.index]+".");else if(a==="close-main-company"){refreshMainCompanies();}else if(a==="cancel-vacation"){$("#vacationPanel form")?.remove();}else if(a==="send-company-email"){if(!lastCreatedCompanyAccess){toast("Não há credenciais recentes para enviar.");return;}const x=lastCreatedCompanyAccess;const subject="Acesso ao Ponto.com - "+x.company;const body=x.action_link?"Olá!\n\nPara atualizar seu acesso ao Ponto.com, utilize o link seguro abaixo para definir uma nova senha.\n\nEmpresa: "+x.company+"\nAcesso ao sistema: https://appontkr.vercel.app/\nE-mail: "+x.email+"\nLink para definir nova senha (uso único): "+x.action_link+"\n\nAtenciosamente,\nKR Assessoria Contábil":"Olá!\n\nSeu acesso ao Ponto.com foi criado.\n\nEmpresa: "+x.company+"\nLink: https://appontkr.vercel.app/\nE-mail: "+x.email+"\nSenha provisória: "+x.password+"\n\nRecomendamos alterar a senha após o primeiro acesso.\n\nAtenciosamente,\nKR Assessoria Contábil";location.href="mailto:"+encodeURIComponent(x.email)+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);}else if(a==="copy-company-password"){if(lastCreatedCompanyAccess)navigator.clipboard?.writeText(lastCreatedCompanyAccess.password).then(()=>toast("Senha provisória copiada."));}else if(a==="copy-company-access-link"){if(lastCreatedCompanyAccess?.action_link)navigator.clipboard?.writeText(lastCreatedCompanyAccess.action_link).then(()=>toast("Link seguro copiado."));}else if(a==="copy-pwa-link"){navigator.clipboard?.writeText("https://appontkr.vercel.app/").then(()=>toast("Link do Ponto.com copiado. O cliente poderá instalar pelo navegador do celular."));}else if(a.startsWith("clock-")){const pin=$("#pinInput")?.value||"";if(pin.length<4)toast("Informe a identificação do funcionário.");else toast("A marcação será habilitada após a conexão dos dados e a configuração do funcionário.");}});
$("#mobileMenu").addEventListener("click",()=>{const sidebar=$("#sidebar");if(window.matchMedia("(max-width: 760px)").matches){sidebar.classList.toggle("open")}else{document.querySelector(".app-shell").classList.toggle("sidebar-collapsed");$("#mobileMenu").setAttribute("aria-expanded",String(!document.querySelector(".app-shell").classList.contains("sidebar-collapsed")))}});
$("#profileButton").addEventListener("click",()=>toast("Empresa em uso: "+state.company+"."));
$("#companySwitcher").addEventListener("change",e=>{const value=e.target.value;const selected=accessCompanies.find(c=>c.id===value);if(value==="KR Contábil"){state.company="KR Contábil";state.companyId=null;}else if(selected){state.companyId=selected.id;state.company=selected.trade_name||selected.legal_name;}updateCompanyHeader();render();toast("Empresa ativa alterada para: "+state.company+". Confira antes de trabalhar.");});
$("#notificationsButton").addEventListener("click",()=>toast("Não há novas notificações."));


/* Autenticação e gestão de acessos */
const SUPABASE_URL = "https://auzrtnuquplhogtqasbb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_7y0Zgojnh0xbPwbsSp1gkQ_6Kv3hJiZ";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let authUser = null, authProfile = null, accessCompanies = [], accessProfiles = [], accessAssignments = [];
let authInitializing = true;
let passwordRecoveryPending=false;
const originalRender = renderApp;
render = function(){
  if(passwordRecoveryPending){renderPasswordRecovery();return;}
  if(!authUser){
    $("#appShell").hidden=!authInitializing;
    $("#loginScreen").hidden=authInitializing;
    const loading=$("#authLoading");if(loading)loading.hidden=!authInitializing;
    return;
  }
  const loading=$("#authLoading");if(loading)loading.hidden=true;
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
  updateCompanyHeader();
  originalRender();
  if(state.view==="access") renderAccess();
};
function renderPasswordRecovery(){
 let box=$("#passwordRecoveryScreen");
 if(!box){document.body.insertAdjacentHTML("beforeend",'<section id="passwordRecoveryScreen" class="login-screen"><div class="login-card"><div class="login-brand">Ponto<span>.com</span></div><p class="eyebrow">SEGURANÇA DA CONTA</p><h1>Defina sua nova senha</h1><p class="login-description">Crie uma senha para continuar acessando o Ponto.com.</p><form id="passwordRecoveryForm"><label>Nova senha<input name="password" type="password" minlength="8" autocomplete="new-password" required></label><label>Confirme a nova senha<input name="confirm_password" type="password" minlength="8" autocomplete="new-password" required></label><button class="btn primary login-submit" type="submit">Salvar nova senha</button><p id="passwordRecoveryError" class="login-error" role="alert"></p></form></div></section>');box=$("#passwordRecoveryScreen");}
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
 if(!user){authProfile=null;authInitializing=false;render();return;}
 const {data,error}=await db.from("profiles").select("*").eq("id",user.id).maybeSingle();
 if(error||!data||!data.active){await db.auth.signOut();authUser=null;authInitializing=false;showLoginError("Acesso não autorizado ou usuário inativo.");render();return;}
 authProfile=data;
 authInitializing=false;
 const {data:links}=await db.from("analyst_company_access").select("company_id,companies(*)");
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
$("#logoutButton").addEventListener("click",async()=>{await db.auth.signOut();authUser=null;authProfile=null;accessCompanies=[];accessProfiles=[];accessAssignments=[];accessDataReady=false;accessFetchPending=false;accessSection="home";state.company="KR Contábil";state.companyId=null;state.view="dashboard";render();});
/* Gestão de acessos — painel por módulos e cadastros guiados */
let accessSection="home", accessDataReady=false, accessFetchPending=false;
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
 const box=$("#analystWizard");box.hidden=false;
 box.innerHTML='<div class="wizard-head"><div><p class="eyebrow">NOVO ACESSO</p><h2>Cadastro de analista</h2><p>Informe os dados de acesso para criar o usuário.</p></div><button class="btn" data-access-action="close-analyst">Fechar</button></div><form id="analystWizardForm" class="access-form"><label class="full">Nome completo<input name="full_name" autocomplete="name" required maxlength="120" placeholder="Nome do analista"></label><label class="full">E-mail profissional<input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="nome@krcontabil.com.br"></label><label class="full">Senha inicial<input name="password" type="password" autocomplete="new-password" minlength="8" required placeholder="Mínimo de 8 caracteres"></label><p class="wizard-hint full">A senha inicial deve ter pelo menos 8 caracteres e ser compartilhada com segurança.</p><button type="submit" class="btn primary full" id="wizardSubmit">Criar analista</button><p id="wizardError" class="login-error full" role="alert"></p></form>';
}
document.addEventListener("click",async e=>{
 const section=e.target.closest("[data-access-section]");if(section){accessSection=section.dataset.accessSection;renderAccess();return;}
 const action=e.target.closest("[data-access-action]")?.dataset.accessAction;
 if(action==="new-analyst"){openAnalystWizard();return}
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
 if(e.target.id!=="employeeCreateForm")return;e.preventDefault();
 const f=new FormData(e.target),cpf=String(f.get("cpf")||"").replace(/\D/g,""),err=$("#employeeCreateError");
 if(cpf.length!==11){err.textContent="Informe um CPF com 11 dígitos.";return;}
 const payload={company_id:f.get("company_id"),full_name:String(f.get("full_name")||"").trim(),cpf,job_title:String(f.get("job_title")||"").trim()||null,admission_date:f.get("admission_date")||null,status:"active"};
 const button=e.target.querySelector('button[type="submit"]');button.disabled=true;button.textContent="Salvando...";
 const {error}=await db.from("employees").insert(payload);if(error){err.textContent="Não foi possível cadastrar: "+error.message;button.disabled=false;button.textContent="Salvar funcionário";return;}
 toast("Funcionário cadastrado.");$("#employeeEditor").hidden=true;const filter=$("#employeeCompanyFilter");if(filter)filter.value=payload.company_id;await loadEmployeeDirectory();
});
document.addEventListener("change",e=>{
 if(e.target.id==="employeeCompanyFilter"){loadEmployeeDirectory();return;}
 if(e.target.id==="selectAllEmployees"){document.querySelectorAll(".employee-select").forEach(x=>x.checked=e.target.checked);return;}if(e.target.id==="companyPartners"){const opt=e.target.selectedOptions[0];if(opt&&opt.value!=="")$("#companyLegalRepresentative").value=opt.textContent.split(" — ")[0];}});
document.addEventListener("submit",async e=>{
 if(e.target.id==="mainCompanyForm"){
  e.preventDefault();const f=new FormData(e.target),errorBox=$("#mainCompanyError"),button=$("#saveCompanyAccount");
  const payload={legal_name:f.get("legal_name"),trade_name:f.get("trade_name"),cnpj:f.get("cnpj"),email:f.get("admin_email"),company_email:f.get("email"),phone:f.get("phone"),registration_status:f.get("registration_status"),opening_date:f.get("opening_date")||null,legal_representative:f.get("legal_representative"),average_employees:Number(f.get("average_employees")),analyst_id:f.get("analyst_id"),admin_name:f.get("admin_name")};
  if(!payload.email){errorBox.textContent="Informe o e-mail que será usado no acesso do administrador.";return;}
  button.disabled=true;button.textContent="Cadastrando e criando acesso...";errorBox.textContent="";
  const {data,error}=await db.functions.invoke("create-company-account",{body:payload});
  if(error||data?.error){errorBox.textContent=data?.error||error?.message||"Não foi possível concluir o cadastro.";button.disabled=false;button.textContent="Cadastrar empresa e gerar acesso";return;}
  lastCreatedCompanyAccess={email:data.email,password:data.password,company:payload.trade_name||payload.legal_name};
  const box=$("#mainCompanyEditor");box.innerHTML='<div class="wizard-head"><div><p class="eyebrow">CADASTRO CONCLUÍDO</p><h2>Empresa e acesso criados</h2><p>Guarde a senha provisória. Ela será exibida somente nesta confirmação.</p></div></div><div class="access-rule-list"><p><strong>Empresa:</strong> '+safeHtml(lastCreatedCompanyAccess.company)+'</p><p><strong>Login:</strong> '+safeHtml(data.email)+'</p><p><strong>Senha provisória:</strong> <code>'+safeHtml(data.password)+'</code></p><p><strong>Link do sistema:</strong> https://appontkr.vercel.app/</p></div><div class="wizard-actions"><button class="btn primary" data-action="send-company-email">Preparar e-mail para o cliente</button><button class="btn" data-action="copy-company-password">Copiar senha</button><button class="btn" data-action="copy-pwa-link">Copiar link do PWA</button><button class="btn" data-action="close-main-company">Concluir</button></div>';
  const newCompany={id:data.company_id,legal_name:payload.legal_name,trade_name:payload.trade_name,cnpj:payload.cnpj,email:payload.company_email,phone:payload.phone,status:"active",average_employees:payload.average_employees};accessCompanies=[...(accessCompanies||[]),newCompany];

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
 const {error:saveError}=await db.auth.updateUser({password});
 if(saveError){error.textContent=saveError.message||"Não foi possível atualizar a senha.";button.disabled=false;button.textContent="Salvar nova senha";return;}
 passwordRecoveryPending=false;$("#passwordRecoveryScreen").hidden=true;toast("Senha atualizada com sucesso.");await loadAuthProfile();
});
db.auth.onAuthStateChange((event)=>{if(event==="PASSWORD_RECOVERY"){passwordRecoveryPending=true;renderPasswordRecovery();return;}setTimeout(()=>loadAuthProfile(),0);});
loadAuthProfile();

render();setInterval(updateClock,1000);
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
