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
<div class="stats">${stat("Empresas cadastradas",String(accessCompanies.length),"Empresas vinculadas ao seu acesso","♟")}${stat("Funcionários ativos",String(employees.length),"Funcionários cadastrados","♙")}${stat("Marcações de hoje",String(punches.length),"Registros recebidos","◷")}${stat("Pendências","0","Nenhuma pendência cadastrada","▦")}</div>
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
let employeeDirectory=[],generatedEmployeeAccess=[],employeeSelectedCompanyId=null;
function renderEmployees(){
 if(!employeeSelectedCompanyId){
  const cards=(accessCompanies||[]).map(c=>'<button class="company-employee-card" data-action="open-employee-company" data-company-id="'+safeHtml(c.id)+'"><span class="company-card-mark">▦</span><span class="company-card-info"><strong>'+safeHtml(c.trade_name||c.legal_name)+'</strong><small>'+safeHtml(c.cnpj||"CNPJ não informado")+'</small></span><span class="company-card-arrow">›</span></button>').join("");
  return heading("EQUIPE","Funcionários","Selecione uma empresa para consultar e gerenciar os funcionários.")+'<div class="employee-company-toolbar"><input class="search" id="employeeCompanySearch" placeholder="Pesquisar empresa por nome ou CNPJ..."></div><div class="employee-company-grid" id="employeeCompanyGrid">'+(cards||'<div class="panel empty-state">Nenhuma empresa vinculada ao seu acesso.</div>')+'</div>';
 }
 const company=accessCompanies.find(c=>c.id===employeeSelectedCompanyId);
 return heading("EQUIPE","Funcionários",safeHtml(company?.trade_name||company?.legal_name||"Empresa"),'<button class="btn" data-action="back-employee-companies">← Empresas</button><button class="btn" data-action="new-employee">＋ Novo funcionário</button><button class="btn primary" data-action="generate-employee-access">Gerar acessos em lote</button>')+'<div class="table-panel"><div class="table-toolbar"><strong>Funcionários <span class="muted" id="employeeCount">(carregando...)</span></strong><input class="search" id="searchTable" placeholder="Buscar funcionário ou matrícula..."></div><div class="table-wrap"><table id="dataTable"><thead><tr><th><input type="checkbox" id="selectAllEmployees" aria-label="Selecionar todos"></th><th>FUNCIONÁRIO</th><th>MATRÍCULA</th><th>CARGO</th><th>STATUS</th><th>ACESSO</th><th>AÇÃO</th></tr></thead><tbody><tr><td colspan="7" class="empty-cell">Carregando funcionários...</td></tr></tbody></table></div></div><div id="employeeEditor" class="access-wizard" hidden></div><div id="employeeAccessResults" class="access-wizard" hidden></div>';
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
 box.scrollIntoView({behavior:"smooth",block:"start"});
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
 if(!generatedEmployeeAccess.length)return;const rows=[["Funcionário","Empresa","Matrícula","PIN"],...generatedEmployeeAccess.map(x=>[x.name,x.company,x.matricula,x.senha])],csv="\uFEFF"+rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(";")).join("\r\n"),blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="acessos-funcionarios-pontocom.csv";a.click();URL.revokeObjectURL(url);
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
 const mapLink=location?'<p class="wizard-hint"><a href="https://www.google.com/maps?q='+encodeURIComponent(location.latitude+','+location.longitude)+'" target="_blank" rel="noopener">Conferir o ponto cadastrado no Google Maps ↗</a> · As coordenadas salvas são a referência da empresa; o aparelho ainda precisa fornecer sua localização atual com precisão suficiente.</p>':"";
 const codeBox=latestTerminalCode?.companyId===companyId?'<div class="access-wizard"><p class="eyebrow">CÓDIGO DE ATIVAÇÃO · USO ÚNICO</p><h2 style="letter-spacing:.18em;font-size:28px">'+safeHtml(latestTerminalCode.code)+'</h2><p>Expira em '+new Date(latestTerminalCode.expires).toLocaleString("pt-BR")+'. Informe este código no aparelho que será usado como terminal.</p><div class="wizard-actions"><button class="btn primary" data-action="copy-terminal-code">Copiar código</button><button class="btn" data-action="copy-terminal-link">Copiar link do terminal</button></div></div>':"";
 panel.innerHTML=locationError+deviceError+
 '<div class="wizard-head"><div><p class="eyebrow">VALIDAÇÃO POR LOCALIZAÇÃO</p><h2>Localização permitida</h2><p>O ponto só será validado dentro do raio definido para a empresa. O terminal agora aguarda uma leitura GPS mais precisa antes de enviar a tentativa.</p></div></div>'+
 '<form id="companyLocationForm" class="access-form"><label class="full">Link do Google Maps ou coordenadas<input name="maps_reference" id="companyMapsReference" placeholder="Cole o link do local no Google Maps"></label><label>Latitude<input name="latitude" type="number" step="any" required value="'+(location?.latitude??'')+'" placeholder="-15.000000"></label><label>Longitude<input name="longitude" type="number" step="any" required value="'+(location?.longitude??'')+'" placeholder="-47.000000"></label><label>Raio permitido (metros)<input name="radius" type="number" min="10" max="1000" value="'+(location?.allowed_radius_m??50)+'" required></label><div class="wizard-actions"><button class="btn" type="button" data-action="capture-company-location">Usar localização atual</button><button class="btn primary" type="submit">Salvar localização</button></div><p id="companyLocationMessage" class="login-error"></p></form>'+mapLink+
 '<div class="wizard-head" style="margin-top:24px"><div><p class="eyebrow">APARELHOS VINCULADOS</p><h2>Terminais autorizados</h2><p>Gere um código temporário para ativar um novo celular ou tablet.</p></div><button class="btn primary" data-action="issue-terminal-code">＋ Gerar código</button></div>'+codeBox+
 '<div class="table-wrap"><table><thead><tr><th>APARELHO</th><th>STATUS</th><th>ATIVADO EM</th><th>ÚLTIMO ACESSO</th><th>AÇÃO</th></tr></thead><tbody>'+
 (devices.length?devices.map(d=>'<tr><td><strong>'+safeHtml(d.device_name)+'</strong></td><td>'+badge(d.status==="active"?"Ativo":d.status==="revoked"?"Revogado":"Aguardando ativação")+'</td><td>'+(d.activated_at?new Date(d.activated_at).toLocaleString("pt-BR"):"—")+'</td><td>'+(d.last_seen_at?new Date(d.last_seen_at).toLocaleString("pt-BR"):"—")+'</td><td>'+(d.status!=="revoked"?'<button class="btn small" data-action="revoke-terminal" data-device-id="'+d.id+'">Revogar</button>':"—")+'</td></tr>').join(""):'<tr><td colspan="5" class="empty-cell">Nenhum terminal cadastrado para esta empresa.</td></tr>')+
 '</tbody></table></div>';
 
 if(authProfile?.role==="kr_admin") await loadBiometricApprovals(panel);
}
async function loadLocationReviewQueue(host,companyId){
 const {data,error}=await db.functions.invoke("manage-terminal-device",{body:{action:"review_list",company_id:companyId}});
 if(!host?.isConnected)return;
 if(error||data?.error){host.insertAdjacentHTML("beforeend",'<section class="access-wizard"><h2>Tentativas de marcação para análise</h2><p class="login-error">'+safeHtml(data?.error||error?.message||"Não foi possível consultar as tentativas.")+'</p></section>');return;}
 const items=data?.items||[];
 const rows=items.length?items.map(x=>'<div class="biometric-pending-row" style="align-items:flex-start"><div style="flex:1;min-width:220px"><strong>'+safeHtml(x.employee_name)+'</strong><p>'+safeHtml(x.employee_code)+' · '+({clock_in:"Entrada",break_start:"Saída para intervalo",break_end:"Retorno do intervalo",clock_out:"Saída final"}[x.entry_type]||x.entry_type)+'</p><small>'+new Date(x.attempted_at).toLocaleString("pt-BR")+' · GPS: '+(x.accuracy_m==null?"indisponível":Math.round(x.accuracy_m)+" m")+' · Distância estimada: '+(x.distance_m==null?"indisponível":Math.round(x.distance_m)+" m")+'</small><p class="wizard-hint">Motivo: '+safeHtml(x.reason||"Localização não confirmada")+' · Aparelho: '+safeHtml(x.device_name)+'</p><label style="display:block;margin-top:8px">Conferência do responsável<input type="text" data-review-note="'+safeHtml(x.id)+'" placeholder="Ex.: funcionário conferido presencialmente" style="width:100%"></label></div><div class="wizard-actions" style="flex-wrap:wrap"><button class="btn primary small" data-action="review-location-attempt" data-company-id="'+safeHtml(companyId)+'" data-decision="approve" data-attempt-id="'+safeHtml(x.id)+'">Aprovar marcação</button><button class="btn small" data-action="review-location-attempt" data-company-id="'+safeHtml(companyId)+'" data-decision="reject" data-attempt-id="'+safeHtml(x.id)+'">Rejeitar</button></div></div>').join(""):'<p class="empty-state">Nenhuma tentativa de marcação aguardando análise.</p>';
 host.insertAdjacentHTML("beforeend",'<section class="access-wizard"><div class="wizard-head"><div><p class="eyebrow">CONFERÊNCIA DO RESPONSÁVEL</p><h2>Tentativas de marcação para análise ('+items.length+')</h2><p>Use a aprovação manual somente depois de confirmar a presença do funcionário. A aprovação gera o registro no histórico e fica identificada na auditoria.</p></div></div>'+rows+'</section>');
}
async function loadBiometricApprovals(panel){
 const {data,error}=await db.functions.invoke("manage-biometric-enrollment",{body:{action:"list"}});
 if(!panel?.isConnected)return;
 if(error||data?.error){panel.insertAdjacentHTML("beforeend",'<div class="access-wizard"><h2>Cadastros faciais pendentes</h2><p class="login-error">'+safeHtml(data?.error||error?.message||"Falha ao consultar.")+'</p></div>');return;}
 const items=data?.items||[];
 const content=items.length?items.map(x=>'<div class="biometric-pending-row"><div><strong>'+safeHtml(x.employee_name)+'</strong><p>'+safeHtml(x.company_name)+' · Matrícula '+safeHtml(x.employee_code)+'</p><small>Recebido em '+new Date(x.enrolled_at).toLocaleString("pt-BR")+'</small></div><div class="wizard-actions"><button class="btn primary small" data-action="approve-biometric" data-employee-id="'+safeHtml(x.employee_id)+'" data-company-id="'+safeHtml(x.company_id)+'" '+(!x.employee_active?'disabled title="Funcionário inativo"':'')+'>Aprovar</button><button class="btn small" data-action="delete-biometric" data-employee-id="'+safeHtml(x.employee_id)+'" data-company-id="'+safeHtml(x.company_id)+'">Excluir</button></div></div>').join(""):'<p class="empty-state">Nenhum cadastro facial aguardando aprovação.</p>';
 panel.insertAdjacentHTML("beforeend",'<section class="access-wizard biometric-approvals"><div class="wizard-head"><div><p class="eyebrow">CONTROLE DA KR</p><h2>Cadastros faciais pendentes</h2><p>Confira a identidade do funcionário presencialmente antes de aprovar. A aprovação libera o modelo para futuras validações.</p></div></div>'+content+'</section>');
}
let recordsTab="entries",recordsSelectedCompanyId=null;
function renderRecords(){
 const companyId=recordsSelectedCompanyId||state.companyId||accessCompanies[0]?.id||"";
 recordsSelectedCompanyId=companyId||null;
 const options=(accessCompanies||[]).map(c=>'<option value="'+safeHtml(c.id)+'" '+(c.id===companyId?'selected':'')+'>'+safeHtml(c.trade_name||c.legal_name)+'</option>').join("");
 return heading("JORNADA","Lançamentos","Confira as marcações do dia, trate pontos esquecidos e faça lançamentos manuais quando necessário.")+
 '<section class="access-wizard records-toolbar"><label>Empresa<select id="recordsCompanySelect">'+(options||'<option value="">Nenhuma empresa disponível</option>')+'</select></label><button class="btn" data-action="refresh-records">Atualizar</button></section>'+
 '<div class="company-detail-tabs records-tabs"><button class="company-detail-tab '+(recordsTab==="entries"?"active":"")+'" data-action="records-tab" data-tab="entries">Marcações registradas</button><button class="company-detail-tab '+(recordsTab==="missing"?"active":"")+'" data-action="records-tab" data-tab="missing">Marcações esquecidas</button><button class="company-detail-tab '+(recordsTab==="manual"?"active":"")+'" data-action="records-tab" data-tab="manual">Lançamento manual</button></div>'+
 '<div id="recordsPanel" class="table-panel"><div class="empty-state">Carregando lançamentos...</div></div>';
}
function localDateValue(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function localDateForValue(value){const d=new Date(value);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
async function loadRecordsPanel(){
 const host=$("#recordsPanel"),select=$("#recordsCompanySelect");if(!host||!select)return;
 const companyId=select.value;if(!companyId){host.innerHTML='<div class="empty-state">Selecione uma empresa para consultar os lançamentos.</div>';return;}
 recordsSelectedCompanyId=companyId;host.innerHTML='<div class="empty-state">Consultando marcações...</div>';
 const [{data,error},empResult]=await Promise.all([
  db.functions.invoke("manage-time-entries",{body:{action:"list",company_id:companyId}}),
  db.from("employees").select("id,full_name,employee_code").eq("company_id",companyId).eq("status","active").order("full_name")
 ]);
 if(!$("#recordsPanel"))return;
 if(error||data?.error){host.innerHTML='<div class="empty-state">Não foi possível carregar: '+safeHtml(data?.error||error?.message)+'</div>';return;}
 const employees=empResult.data||[],employeeOptions='<option value="">Selecione o funcionário</option>'+employees.map(x=>'<option value="'+safeHtml(x.id)+'">'+safeHtml(x.full_name)+' · '+safeHtml(x.employee_code||"sem matrícula")+'</option>').join("");
 const entries=data?.entries||[],requests=data?.requests||[];
 if(recordsTab==="entries"){
  host.innerHTML='<div class="table-toolbar"><strong>Marcações do dia ('+entries.filter(x=>localDateForValue(x.occurred_at)===( $("#recordsDateFilter")?.value||localDateValue())).length+')</strong><label>Data<input id="recordsDateFilter" type="date" value="'+( $("#recordsDateFilter")?.value||localDateValue())+'" /></label><input class="search" id="recordsSearch" placeholder="Buscar funcionário ou tipo..."></div><div class="table-wrap"><table><thead><tr><th>FUNCIONÁRIO</th><th>TIPO</th><th>DATA/HORA</th><th>ORIGEM</th><th>CONFERÊNCIA</th><th>OBSERVAÇÃO</th></tr></thead><tbody>'+(entries.filter(x=>localDateForValue(x.occurred_at)===( $("#recordsDateFilter")?.value||localDateValue())).length?entries.filter(x=>localDateForValue(x.occurred_at)===( $("#recordsDateFilter")?.value||localDateValue())).map(x=>'<tr><td><strong>'+safeHtml(x.employee_name)+'</strong><small class="access-subline">'+safeHtml(x.employee_code)+'</small></td><td>'+safeHtml(({clock_in:"Entrada",break_start:"Saída intervalo",break_end:"Retorno intervalo",clock_out:"Saída final",adjustment:"Ajuste"})[x.entry_type]||x.entry_type)+'</td><td>'+new Date(x.occurred_at).toLocaleString("pt-BR")+'</td><td>'+safeHtml(x.source==="admin"?"Administrador":x.source==="mobile"?"Terminal":"Sistema")+'</td><td>'+safeHtml(x.location_status==="manual"?"Conferida / manual":x.biometric_verified?"Reconhecimento facial":"Registrada")+'</td><td>'+safeHtml(x.note||x.receipt_code||"—")+'</td></tr>').join(""):'<tr><td colspan="6" class="empty-cell">Nenhuma marcação registrada para esta data.</td></tr>')+'</tbody></table></div>';
  $("#recordsSearch")?.addEventListener("input",e=>{const q=e.target.value.toLocaleLowerCase("pt-BR");host.querySelectorAll("tbody tr").forEach(tr=>tr.hidden=!tr.innerText.toLocaleLowerCase("pt-BR").includes(q));});$("#recordsDateFilter")?.addEventListener("change",()=>loadRecordsPanel());
 }else if(recordsTab==="missing"){
  const pending=requests.filter(x=>x.status==="pending"),history=requests.filter(x=>x.status!=="pending");
  host.innerHTML='<div class="access-wizard"><div class="wizard-head"><div><p class="eyebrow">PONTO ESQUECIDO</p><h2>Informar marcação que o funcionário esqueceu</h2><p>Informe o horário que deveria constar e a justificativa. A marcação ficará pendente até aprovação do responsável.</p></div></div><form id="missingPunchForm" class="access-form"><label>Funcionário<select name="employee_id" required>'+employeeOptions+'</select></label><label>Tipo de marcação<select name="entry_type" required><option value="clock_in">Entrada</option><option value="break_start">Saída para intervalo</option><option value="break_end">Retorno do intervalo</option><option value="clock_out">Saída final</option></select></label><label>Data<input name="date" type="date" value="'+localDateValue()+'" required></label><label>Horário<input name="time" type="time" required></label><label class="full">Justificativa<textarea name="reason" rows="2" minlength="8" required placeholder="Informe por que a marcação não foi realizada."></textarea></label><button class="btn primary full" type="submit">Enviar para aprovação</button><p class="login-error full" id="missingPunchError"></p></form></div><div class="table-toolbar"><strong>Aguardando aprovação ('+pending.length+')</strong></div><div class="table-wrap"><table><thead><tr><th>FUNCIONÁRIO</th><th>MARCAÇÃO</th><th>DATA/HORA INFORMADA</th><th>JUSTIFICATIVA</th><th>DECISÃO</th></tr></thead><tbody>'+(pending.length?pending.map(x=>'<tr><td>'+safeHtml(x.employee_name)+'</td><td>'+safeHtml(({clock_in:"Entrada",break_start:"Saída intervalo",break_end:"Retorno intervalo",clock_out:"Saída final"})[x.entry_type])+'</td><td>'+new Date(x.occurred_at).toLocaleString("pt-BR")+'</td><td>'+safeHtml(x.reason)+'</td><td><input data-missing-note="'+safeHtml(x.id)+'" placeholder="Observação da análise"><div class="wizard-actions"><button class="btn primary small" data-action="resolve-missing-punch" data-request-id="'+safeHtml(x.id)+'" data-decision="approve">Aprovar</button><button class="btn small" data-action="resolve-missing-punch" data-request-id="'+safeHtml(x.id)+'" data-decision="reject">Rejeitar</button></div></td></tr>').join(""):'<tr><td colspan="5" class="empty-cell">Nenhuma marcação esquecida aguardando aprovação.</td></tr>')+'</tbody></table></div>'+(history.length?'<p class="wizard-hint">Solicitações já tratadas: '+history.length+'.</p>':"");
 }else{
  host.innerHTML='<div class="access-wizard"><div class="wizard-head"><div><p class="eyebrow">AJUSTE ADMINISTRATIVO</p><h2>Lançar marcação manual</h2><p>Use quando houver necessidade de incluir ou corrigir uma marcação. A operação será identificada como lançamento do administrador e ficará registrada na auditoria.</p></div></div><form id="manualPunchForm" class="access-form"><label>Funcionário<select name="employee_id" required>'+employeeOptions+'</select></label><label>Tipo de marcação<select name="entry_type" required><option value="clock_in">Entrada</option><option value="break_start">Saída para intervalo</option><option value="break_end">Retorno do intervalo</option><option value="clock_out">Saída final</option></select></label><label>Data<input name="date" type="date" value="'+localDateValue()+'" required></label><label>Horário<input name="time" type="time" required></label><label class="full">Justificativa / motivo<input name="note" minlength="8" required placeholder="Ex.: ajuste autorizado pelo responsável da empresa"></label><button class="btn primary full" type="submit">Salvar lançamento manual</button><p class="login-error full" id="manualPunchError"></p></form></div>';
 }
}
function renderPending(){
 const companyId=state.companyId||accessCompanies[0]?.id||"";
 const options=(accessCompanies||[]).map(c=>'<option value="'+safeHtml(c.id)+'" '+(c.id===companyId?'selected':'')+'>'+safeHtml(c.trade_name||c.legal_name)+'</option>').join("");
 return heading("CONFERÊNCIA","Pendências","Analise somente tentativas de marcação que não puderam ser confirmadas automaticamente.")+
 '<section class="access-wizard records-toolbar"><label>Empresa<select id="pendingCompanySelect">'+(options||'<option value="">Nenhuma empresa disponível</option>')+'</select></label><button class="btn" data-action="refresh-pending">Atualizar</button></section><div id="pendingPanel" class="table-panel"><div class="empty-state">Carregando pendências...</div></div>';
}
async function loadPendingPanel(){const host=$("#pendingPanel"),select=$("#pendingCompanySelect");if(!host||!select)return;const companyId=select.value;if(!companyId){host.innerHTML='<div class="empty-state">Selecione uma empresa para consultar as pendências.</div>';return;}host.innerHTML='<div class="empty-state">Consultando tentativas pendentes...</div>';await loadLocationReviewQueue(host,companyId);}
let auditOpen=false,auditTab="companies",auditCompanyDetailId=null;
function renderReports(){
 if(!auditOpen)return `${heading("DP E RELATÓRIOS","Relatórios","Acesse os relatórios e o histórico administrativo do Ponto.com.")}<div class="report-grid">
 <div class="report-card"><div class="stat-icon">◷</div><h3>Espelho de ponto</h3><p>Visualize as marcações e a jornada individual dos colaboradores.</p><button class="btn" type="button" disabled aria-disabled="true">Em breve</button></div>
 <div class="report-card"><div class="stat-icon">⚑</div><h3>Pendências</h3><p>Consulte tentativas de marcação cuja localização precisa de conferência do responsável.</p><button class="btn primary" type="button" data-view="pending">Analisar tentativas</button></div>
 <div class="report-card"><div class="stat-icon">▤</div><h3>Resumo de jornada</h3><p>Consulte totais de horas trabalhadas, extras, atrasos e faltas.</p><button class="btn" type="button" disabled aria-disabled="true">Em breve</button></div>
 ${authProfile?.role==="kr_admin"?'<div class="report-card"><div class="stat-icon">⌁</div><h3>Auditoria</h3><p>Histórico de alterações, cadastros, usuários e empresas arquivadas.</p><button class="btn primary" data-action="open-audit">Abrir auditoria</button></div>':""}
 </div><p class="wizard-hint" style="margin-top:16px">Espelho de ponto, pendências e resumo de jornada serão habilitados conforme a implantação dos registros de ponto.</p>`;
 return `${heading("CONTROLE ADMINISTRATIVO","Auditoria","Consulte os eventos registrados no sistema.",'<button class="btn" data-action="back-reports">← Voltar aos relatórios</button>')}<div class="company-detail-tabs"><button class="company-detail-tab ${auditTab==="companies"?"active":""}" data-action="audit-tab" data-tab="companies">Empresas</button><button class="company-detail-tab ${auditTab==="archive"?"active":""}" data-action="audit-tab" data-tab="archive">Arquivo morto</button><button class="company-detail-tab ${auditTab==="users"?"active":""}" data-action="audit-tab" data-tab="users">Funcionários/Usuários</button></div><div id="auditPanel" class="table-panel"><div class="empty-state">Carregando auditoria...</div></div>`;
}
async function loadAuditPanel(){
 const panel=$("#auditPanel");if(!panel)return;
 if(authProfile?.role!=="kr_admin"){panel.innerHTML='<div class="empty-state">A auditoria está disponível somente para a KR Admin.</div>';return;}
 panel.innerHTML='<div class="empty-state">Consultando registros...</div>';
 const [companiesResult,logsResult,profilesResult]=await Promise.all([
  db.from("companies").select("id,legal_name,trade_name,cnpj,email,status,created_at,archived_at,archived_reason").order("created_at",{ascending:false}),
  db.from("audit_logs").select("id,company_id,actor_id,action,entity_table,entity_id,details,created_at").order("created_at",{ascending:false}).limit(500),
  db.from("profiles").select("id,full_name,email,role")
 ]);
 if(!$("#auditPanel"))return;
 const err=companiesResult.error||logsResult.error||profilesResult.error;
 if(err){panel.innerHTML='<div class="empty-state">Não foi possível carregar a auditoria: '+safeHtml(err.message)+'</div>';return;}
 const companiesData=companiesResult.data||[],logs=logsResult.data||[],profiles=profilesResult.data||[];
 auditCompanyCache=companiesData;const companyMap=new Map(companiesData.map(c=>[c.id,c])),profileMap=new Map(profiles.map(p=>[p.id,p]));
 if(auditTab==="archive"){
  const archived=companiesData.filter(c=>c.archived_at);
  panel.innerHTML='<div class="table-toolbar"><strong>Empresas arquivadas ('+archived.length+')</strong></div><div class="table-wrap"><table><thead><tr><th>EMPRESA</th><th>CNPJ</th><th>ARQUIVADA EM</th><th>MOTIVO</th><th>AÇÃO</th></tr></thead><tbody>'+(archived.length?archived.map(c=>'<tr><td><strong>'+safeHtml(c.trade_name||c.legal_name)+'</strong></td><td>'+safeHtml(c.cnpj||"—")+'</td><td>'+new Date(c.archived_at).toLocaleString("pt-BR")+'</td><td>'+safeHtml(c.archived_reason||"—")+'</td><td><button class="btn small" data-action="restore-company" data-company-id="'+c.id+'">Restaurar</button></td></tr>').join(""):'<tr><td colspan="5" class="empty-cell">Nenhuma empresa no arquivo morto.</td></tr>')+'</tbody></table></div>';
  return;
 }
 const selectedLogs=logs.filter(l=>auditTab==="companies"?l.entity_table==="companies":["employees","profiles"].includes(l.entity_table));
 if(auditTab==="companies"){
  panel.innerHTML='<div class="table-toolbar"><strong>Empresas cadastradas ('+companiesData.length+')</strong><div class="wizard-actions"><button class="btn" data-action="export-audit-companies">Exportar Excel</button><button class="btn" data-action="print-audit-companies">Salvar PDF / Imprimir</button></div></div><div class="table-wrap"><table><thead><tr><th>EMPRESA</th><th>CNPJ</th><th>CADASTRO</th><th>EVENTOS</th><th>HISTÓRICO</th><th>AÇÃO</th></tr></thead><tbody>'+(companiesData.length?companiesData.map(c=>{const ev=logs.filter(l=>l.company_id===c.id||(l.entity_table==="companies"&&l.entity_id===c.id));return '<tr><td><strong>'+safeHtml(c.trade_name||c.legal_name)+'</strong></td><td>'+safeHtml(c.cnpj||"—")+'</td><td>'+new Date(c.created_at).toLocaleDateString("pt-BR")+'</td><td>'+ev.length+' evento(s)</td><td><button class="btn small" data-action="audit-company-events" data-company-id="'+c.id+'">'+(auditCompanyDetailId===c.id?'Ocultar':'Ver histórico')+'</button></td><td>'+(c.archived_at?'<span class="pill info">Arquivada</span>':'<button class="btn small" data-action="archive-company" data-company-id="'+c.id+'">Arquivar</button>')+'</td></tr>';}).join(""):'<tr><td colspan="6" class="empty-cell">Nenhuma empresa cadastrada.</td></tr>')+'</tbody></table></div>'+(auditCompanyDetailId&&companyMap.has(auditCompanyDetailId)?'<h3 style="margin:22px 0 10px">Histórico: '+safeHtml(companyMap.get(auditCompanyDetailId).trade_name||companyMap.get(auditCompanyDetailId).legal_name)+'</h3>'+auditEventsTable(logs.filter(l=>l.company_id===auditCompanyDetailId||(l.entity_table==="companies"&&l.entity_id===auditCompanyDetailId)).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)),companyMap,profileMap):'<h3 style="margin:22px 0 10px">Histórico geral de empresas</h3>'+auditEventsTable(selectedLogs,companyMap,profileMap));
 }else{
  panel.innerHTML='<div class="table-toolbar"><strong>Alterações de funcionários e usuários ('+selectedLogs.length+')</strong></div>'+auditEventsTable(selectedLogs,companyMap,profileMap);
 }
}
function auditEntityLabel(table){
 return ({companies:"Empresa",profiles:"Usuário / acesso",employees:"Funcionário"})[table]||"Registro";
}
function auditActionLabel(action){
 const labels={
  "companies.insert":"Empresa cadastrada","companies.update":"Dados da empresa alterados","companies.delete":"Empresa excluída",
  "profiles.insert":"Acesso de usuário criado","profiles.update":"Dados do usuário alterados","profiles.delete":"Acesso de usuário removido",
  "employees.insert":"Funcionário cadastrado","employees.update":"Dados do funcionário alterados","employees.delete":"Funcionário excluído",
  "company.created_by_kr":"Cadastro de empresa realizado pela KR",
  "company_admin.access_created":"Acesso do administrador da empresa criado",
  "company_admin.initial_password_set":"Senha inicial definida",
  "company.access.temporary_password_issued":"Senha temporária reenviada"
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
 if(d.operation)return String(d.operation).replaceAll("_"," ").replace(/^./,c=>c.toUpperCase());
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
 const rows=[["Empresa","Razão social","CNPJ","E-mail","Status","Data de cadastro","Arquivada em"],...(auditCompanyCache||[]).map(c=>[c.trade_name||"",c.legal_name||"",c.cnpj||"",c.email||"",c.status||"",c.created_at||"",c.archived_at||""])];
 if(window.XLSX){const ws=XLSX.utils.aoa_to_sheet(rows),wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"Empresas");XLSX.writeFile(wb,"auditoria-empresas-pontocom.xlsx");return;}
 const csv="\\uFEFF"+rows.map(r=>r.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(";")).join("\\r\\n");
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="auditoria-empresas-pontocom.csv";a.click();URL.revokeObjectURL(url);
}
function printAuditCompanies(){
 const panel=$("#auditPanel");if(!panel)return;
 const w=window.open("","_blank");if(!w){toast("Permita a abertura de pop-ups para gerar o PDF.");return;}
 w.document.write('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Auditoria de empresas - Ponto.com</title><style>body{font:12px Arial,sans-serif;padding:24px;color:#222}h1{font-size:20px}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #ccc;padding:7px;text-align:left}button{display:none}.table-toolbar{margin-bottom:14px}</style></head><body><h1>Auditoria de empresas — Ponto.com</h1><p>Emitido em '+new Date().toLocaleString("pt-BR")+'</p>'+panel.innerHTML+'</body></html>');
 w.document.close();w.focus();w.print();
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
function renderClock(){return `${heading("PWA DO FUNCIONÁRIO","Terminal de marcação","Acesse o aplicativo exclusivo para registrar entrada, intervalos e saída dos colaboradores.")}<div class="access-wizard"><div class="wizard-head"><div><p class="eyebrow">PONTO.COM · TERMINAL</p><h2>Marcação de ponto pelo celular ou tablet</h2><p>O terminal é instalado no aparelho da empresa, ativado por um código temporário e vinculado à empresa. Cada funcionário utiliza sua matrícula e seu PIN para registrar o ponto.</p></div></div><div class="wizard-actions"><a class="btn primary" href="./terminal/" target="_blank" rel="noopener">Abrir terminal de ponto ↗</a><button class="btn" data-view="devices">Configurar aparelhos e localização</button></div><p class="wizard-hint">Antes da primeira marcação, gere o código de ativação e configure a localização permitida na aba Dispositivos. O aparelho precisa estar conectado à internet para enviar os registros.</p></div>`}
function applyAnalystActionPermissions(){
 if(authProfile?.role!=="analyst")return;
 const a=authProfile.permissions?.actions||{},view=state.view;
 const rules={
  "new-company":["companies","create"],"new-employee":["employees","create"],"new-vacation":["vacations","create"],
  "generate-employee-access":["employees","create"],"generate-one-employee-access":["employees","create"],"issue-terminal-code":["devices","create"],"revoke-terminal":["devices","delete"],"capture-company-location":["devices","edit"],
  "export-audit-companies":["reports","export"],"print-audit-companies":["reports","export"],
  "open-audit":["reports","view"]
 };
 document.querySelectorAll("[data-action]").forEach(el=>{const rule=rules[el.dataset.action];if(rule&&a[rule[0]]?.[rule[1]]===false)el.hidden=true;});
 const formRules={employeeCreateForm:["employees","create"],vacationCreateForm:["vacations","create"],companyLocationForm:["devices","edit"]};
 document.querySelectorAll("form").forEach(form=>{const rule=formRules[form.id];if(rule&&a[rule[0]]?.[rule[1]]===false)form.hidden=true;});
}
function renderApp(){const views={dashboard:renderDashboard,companies:renderCompanies,employees:renderEmployees,devices:renderDevices,records:renderRecords,pending:renderPending,reports:renderReports,clock:renderClock,vacations:renderVacations};const titles={dashboard:"Visão geral",companies:"Gestão de acessos",employees:"Funcionários",devices:"Dispositivos",records:"Lançamentos",pending:"Pendências",reports:"Relatórios",clock:"PWA de marcação",vacations:"Férias"};const tabs=authProfile?.permissions?.tabs||{};if(authProfile?.role==="analyst"&&tabs[state.view]===false)state.view="dashboard";$("#content").innerHTML=contextBar()+(views[state.view]||renderDashboard)();applyAnalystActionPermissions();const crumb=$("#pageCrumb");if(crumb)crumb.textContent=titles[state.view]||"Configurações";document.querySelectorAll(".nav-item").forEach(b=>{b.hidden=authProfile?.role==="analyst"&&tabs[b.dataset.view]===false;b.classList.toggle("active",b.dataset.view===state.view)});const accessNav=$("#accessNav");if(accessNav)accessNav.hidden=authProfile?.role!=="kr_admin";$("#sidebar").classList.remove("open");const search=$("#searchTable");if(search)search.addEventListener("input",()=>{const q=search.value.toLowerCase();$("#dataTable").querySelectorAll("tbody tr").forEach(tr=>tr.style.display=tr.innerText.toLowerCase().includes(q)?"":"none")});if(state.view==="clock")updateClock();if(state.view==="employees")loadEmployeeDirectory();if(state.view==="devices")loadDevicesPanel();if(state.view==="records")loadRecordsPanel();if(state.view==="pending")loadPendingPanel();if(state.view==="reports"&&auditOpen)loadAuditPanel()}
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
let companyDetailTab="data",companyAdminAccess=null;
async function openCompanyDetails(companyId,tab="data"){
 const box=$("#mainCompanyEditor");if(!box)return;
 const company=(accessCompanies||[]).find(c=>c.id===companyId);
 if(!company){toast("Empresa não encontrada na lista atual.");return;}
 companyDetailTab=tab;
 box.hidden=false;
 box.innerHTML='<div class="wizard-head"><div><p class="eyebrow">CADASTRO DA EMPRESA</p><h2>'+safeHtml(company.trade_name||company.legal_name)+'</h2><p>Consulte os dados e gerencie o acesso do administrador.</p></div><button class="btn" data-action="close-main-company">Fechar</button></div><div class="company-detail-tabs"><button class="company-detail-tab '+(tab==="data"?"active":"")+'" data-action="company-detail-tab" data-tab="data" data-company-id="'+safeHtml(companyId)+'">Dados da empresa</button><button class="company-detail-tab '+(tab==="login"?"active":"")+'" data-action="company-detail-tab" data-tab="login" data-company-id="'+safeHtml(companyId)+'">Login da empresa</button><button class="company-detail-tab '+(tab==="devices"?"active":"")+'" data-action="company-detail-tab" data-tab="devices" data-company-id="'+safeHtml(companyId)+'">Aparelhos cadastrados</button></div><div id="companyDetailPanel" class="company-detail-panel"><p class="wizard-hint">Carregando informações...</p></div>';
 const {data:profile,error}=await db.from("profiles").select("id,email,full_name,must_change_password,created_at").eq("company_id",companyId).eq("role","company_admin").eq("active",true).order("created_at",{ascending:false}).limit(1).maybeSingle();
 companyAdminAccess=profile||null;
 const panel=$("#companyDetailPanel");if(!panel)return;
 if(error){panel.innerHTML='<p class="login-error">Não foi possível consultar os dados do administrador: '+safeHtml(error.message)+'</p>';return;}
 if(tab==="devices"){
  panel.innerHTML='<p class="wizard-hint">Gerencie os aparelhos vinculados a esta empresa.</p><div id="companyDevicesPanel"><p class="empty-state">Carregando aparelhos...</p></div>';
  loadCompanyDevicesPanel(companyId);
 }else if(tab==="data"){
  panel.innerHTML='<div class="access-rule-list"><p><strong>Razão social:</strong> '+safeHtml(company.legal_name||"—")+'</p><p><strong>CNPJ:</strong> '+safeHtml(company.cnpj||"—")+'</p><p><strong>E-mail da empresa:</strong> '+safeHtml(company.email||"—")+'</p><p><strong>Estimativa de funcionários:</strong> '+safeHtml(company.average_employees??"Não informado")+'</p><p><strong>Administrador:</strong> '+safeHtml(profile?.full_name||"Não cadastrado")+(profile?.email?' · '+safeHtml(profile.email):"")+'</p></div><div class="wizard-actions"><button class="btn primary" data-action="company-detail-tab" data-tab="login" data-company-id="'+safeHtml(companyId)+'">Acessar Login da empresa</button></div>';
 }else{
  panel.innerHTML=profile?'<div class="company-login-card"><div class="company-login-card-head"><div><p class="eyebrow">CREDENCIAL CADASTRADA</p><h3>'+safeHtml(profile.full_name||"Administrador")+'</h3></div><span class="pill '+(profile.must_change_password?"pending":"ok")+'">'+(profile.must_change_password?"Aguardando primeiro acesso":"Senha fixa definida")+'</span></div><div class="company-login-data"><p><span>Login (e-mail)</span><strong>'+safeHtml(profile.email||"—")+'</strong></p><p><span>Conta criada em</span><strong>'+(profile.created_at?new Date(profile.created_at).toLocaleDateString("pt-BR"):"—")+'</strong></p><p><span>Endereço do sistema</span><strong>https://appontkr.vercel.app/</strong></p></div><div class="wizard-actions"><button class="btn primary" data-action="regenerate-company-access" data-company-id="'+safeHtml(companyId)+'">Preparar e-mail / reenviar acesso</button><button class="btn" data-action="copy-pwa-link">Copiar link do terminal</button></div><p class="wizard-hint">O login fica vinculado a esta empresa e não será duplicado. Para reenviar, será gerada uma senha temporária para a conta existente; o usuário e o e-mail permanecem os mesmos, e a troca de senha será obrigatória no próximo acesso.</p>':'<div class="empty-state">Ainda não existe um login de administrador cadastrado para esta empresa.</div>';
 }
 box.scrollIntoView({behavior:"smooth",block:"start"});
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
 const subject="Acesso ao Ponto.com - "+(x.company||"Empresa");
 const body=x.mode==="resend"
  ?"Olá, "+(x.full_name||"tudo bem?")+"!\n\nEstamos reenviando seus dados de acesso ao Ponto.com.\n\nEmpresa: "+x.company+"\nLogin (e-mail): "+x.email+"\nSenha temporária: "+x.password+"\nAcesso ao sistema: "+(x.login_url||"https://appontkr.vercel.app/")+"\n\nPor segurança, no próximo acesso será necessário cadastrar uma nova senha pessoal com pelo menos 8 caracteres.\n\nAtenciosamente,\nKR Assessoria Contábil"
  :"Olá, "+(x.full_name||"tudo bem?")+"!\n\nSeu acesso ao Ponto.com foi criado com sucesso.\n\nEmpresa: "+x.company+"\nLogin (e-mail): "+x.email+"\nSenha provisória: "+x.password+"\nAcesso ao sistema: "+(x.login_url||"https://appontkr.vercel.app/")+"\n\nTerminal de ponto: "+(x.terminal_url||"https://appontkr.vercel.app/terminal/")+"\nCódigo de ativação do terminal: "+(x.terminal_code||"Gere o código na aba Dispositivos")+"\n\nAntes da primeira marcação, configure a localização da empresa na aba Dispositivos. O código de ativação é de uso único e expira em sete dias.\n\nNo primeiro acesso, o sistema solicitará que você cadastre sua senha fixa para continuar.\n\nAtenciosamente,\nKR Assessoria Contábil";
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
 const panel=$("#vacationPanel");if(!panel)return;
 panel.insertAdjacentHTML("afterbegin",'<form id="vacationCreateForm" class="access-form"><label>Funcionário<select name="employee_id" id="vacationEmployee" required><option value="">Carregando...</option></select></label><label>Data de início<input type="date" name="start_date" required></label><label>Data de término<input type="date" name="end_date" required></label><label class="full">Observações<input name="notes" placeholder="Opcional"></label><button class="btn primary" type="submit">Salvar período</button><button class="btn" type="button" data-action="cancel-vacation">Cancelar</button><p id="vacationFormError" class="login-error full"></p></form>');
 db.from("employees").select("id,full_name").eq("company_id",state.companyId).order("full_name").then(({data,error})=>{const s=$("#vacationEmployee");if(!s)return;s.innerHTML=error?'<option value="">Falha ao carregar</option>':'<option value="">Selecione</option>'+(data||[]).map(x=>'<option value="'+x.id+'">'+safeHtml(x.full_name)+'</option>').join("");});
}
document.addEventListener("click",async e=>{const nav=e.target.closest("[data-view]");if(nav){state.view=nav.dataset.view;render();return}const b=e.target.closest("[data-action]");if(!b)return;const a=b.dataset.action;if(a==="switch-company"){const select=$("#companySwitcher");select.focus();select.scrollIntoView({block:"nearest",behavior:"smooth"});toast("Escolha a empresa no seletor destacado no topo.");}else if(a==="new-company"){openMainCompanyWizard();}else if(a==="new-vacation"){openVacationWizard();}else if(a==="new-employee"){if(state.view!=="employees"){state.view="employees";render();}openEmployeeWizard();}else if(a==="open-employee-company"){employeeSelectedCompanyId=b.dataset.companyId;renderApp();}else if(a==="back-employee-companies"){employeeSelectedCompanyId=null;employeeDirectory=[];renderApp();}else if(a==="generate-one-employee-access"){generateEmployeeAccess(b.dataset.employeeId);}else if(a==="close-employee-editor"){$("#employeeEditor").hidden=true;}else if(a==="close-employee-results"){$("#employeeAccessResults").hidden=true;}else if(a==="generate-employee-access"){generateEmployeeAccess();}else if(a==="export-employee-access"){exportEmployeeAccess();}else if(a==="copy-employee-access"){GenUI.copy(generatedEmployeeAccess.map(x=>x.name+" | "+x.company+" | Matrícula: "+x.matricula+" | PIN: "+x.senha).join("\n"));toast("Acessos copiados.");}else if(a==="company-detail"){openCompanyDetails(b.dataset.companyId);}else if(a==="company-detail-tab"){openCompanyDetails(b.dataset.companyId,b.dataset.tab||"data");}else if(a==="regenerate-company-access"){regenerateCompanyAccess(b.dataset.companyId);}else if(a==="close-company-email"){$("#companyEmailComposer")?.remove();}else if(a==="open-outlook-email"){const to=$("#companyEmailTo")?.value||"",subject=$("#companyEmailSubject")?.value||"",body=$("#companyEmailBody")?.value||"";const url="https://outlook.office.com/mail/deeplink/compose?to="+encodeURIComponent(to)+"&subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);window.open(url,"_blank","noopener");const confirm=$("#confirmCompanyEmail");if(confirm)confirm.disabled=false;toast("Após enviar no Outlook, volte aqui e confirme o envio.");}else if(a==="confirm-company-email"){if(!lastCreatedCompanyAccess?.company_id||!authUser?.id){toast("Não foi possível identificar a empresa ou o usuário responsável.");return;}const to=$("#companyEmailTo")?.value||lastCreatedCompanyAccess.email||"",subject=$("#companyEmailSubject")?.value||("Acesso ao Ponto.com - "+lastCreatedCompanyAccess.company);const {error}=await db.from("audit_logs").insert({company_id:lastCreatedCompanyAccess.company_id,actor_id:authUser.id,action:"email.sent",entity_table:"companies",entity_id:lastCreatedCompanyAccess.company_id,details:{operation:"email_sent_confirmed",recipient:to,subject,channel:"Outlook"}});if(error){toast("Não foi possível registrar o envio: "+error.message);return;}toast("Envio confirmado e registrado na auditoria.");$("#companyEmailComposer")?.remove();if(auditOpen)loadAuditPanel();}else if(a==="employee-detail")toast("Perfil de "+employees[+b.dataset.index].name+" — .");else if(a==="issue-terminal-code"){const companyId=b.dataset.companyId||$("#deviceCompanySelect")?.value;if(!companyId){toast("Selecione uma empresa.");return;}b.disabled=true;const {data,error}=await db.functions.invoke("manage-terminal-device",{body:{action:"issue",company_id:companyId}});b.disabled=false;if(error||data?.error){toast(data?.error||error?.message||"Não foi possível gerar o código.");return;}latestTerminalCode={companyId,code:data.activation_code,expires:data.expires_at};toast("Código de ativação gerado.");if($("#companyDevicesPanel"))loadCompanyDevicesPanel(companyId);else loadDevicesPanel();}
else if(a==="review-location-attempt"){
 const attemptId=b.dataset.attemptId,decision=b.dataset.decision,companyId=b.dataset.companyId||$("#deviceCompanySelect")?.value||state.companyId;
 const noteInput=document.querySelector('[data-review-note="'+attemptId+'"]'),note=noteInput?.value?.trim()||"";
 if(decision==="approve"&&note.length<8){toast("Descreva como a presença foi conferida antes de aprovar.");noteInput?.focus();return;}
 if(!confirm(decision==="approve"?"Confirma que a presença do funcionário foi conferida e que esta tentativa deve virar uma marcação oficial?":"Confirma rejeitar esta tentativa?"))return;
 b.disabled=true;
 const {data,error}=await db.functions.invoke("manage-terminal-device",{body:{action:"review_resolve",company_id:companyId,attempt_id:attemptId,decision,note}});
 if(error||data?.error){b.disabled=false;toast(data?.error||error?.message||"Não foi possível tratar a tentativa.");return;}
 toast(decision==="approve"?"Marcação aprovada e incluída no histórico.":"Tentativa rejeitada.");
 if($("#pendingPanel"))loadPendingPanel();else if($("#devicePanel"))loadDevicesPanel();else if($("#companyDevicesPanel"))loadCompanyDevicesPanel(companyId);
}
else if(a==="approve-biometric"||a==="delete-biometric"){
 const employeeId=b.dataset.employeeId,companyId=b.dataset.companyId;
 if(a==="approve-biometric"&&!confirm("Confirma que a identidade deste funcionário foi conferida presencialmente e que ele foi informado sobre o uso de biometria?"))return;
 if(a==="delete-biometric"&&!confirm("Excluir permanentemente o modelo biométrico deste funcionário?"))return;
 b.disabled=true;
 const payload=a==="approve-biometric"?{action:"set_status",employee_id:employeeId,company_id:companyId,status:"active"}:{action:"delete",employee_id:employeeId,company_id:companyId};
 const {data,error}=await db.functions.invoke("manage-biometric-enrollment",{body:payload});
 if(error||data?.error){b.disabled=false;toast(data?.error||error?.message||"Não foi possível atualizar o cadastro.");return;}
 toast(a==="approve-biometric"?"Cadastro facial aprovado.":"Modelo biométrico excluído.");
 loadDevicesPanel();
}
else if(a==="copy-terminal-code"){if(latestTerminalCode)GenUI.copy(latestTerminalCode.code);}
else if(a==="copy-terminal-link"){GenUI.copy("https://appontkr.vercel.app/terminal/");toast("Link do terminal copiado.");}
else if(a==="revoke-terminal"){const companyId=b.dataset.companyId||$("#deviceCompanySelect")?.value;if(!confirm("Revogar este aparelho? Ele deixará de registrar ponto até ser ativado novamente."))return;const {data,error}=await db.functions.invoke("manage-terminal-device",{body:{action:"revoke",company_id:companyId,device_id:b.dataset.deviceId}});if(error||data?.error){toast(data?.error||error?.message||"Não foi possível revogar.");return;}toast("Acesso revogado.");if($("#companyDevicesPanel"))loadCompanyDevicesPanel(companyId);else loadDevicesPanel();}
else if(a==="capture-company-location"){const button=b;button.disabled=true;const msg=$("#companyLocationMessage");if(!navigator.geolocation){if(msg)msg.textContent="Este navegador não disponibiliza localização.";button.disabled=false;return;}if(msg)msg.textContent="Aguardando GPS preciso (até 30 segundos)...";let watch=null,best=null,finished=false;const finish=()=>{if(finished)return;finished=true;if(watch!==null)navigator.geolocation.clearWatch(watch);clearTimeout(timer);const form=$("#companyLocationForm");if(best){form.elements.latitude.value=best.latitude.toFixed(7);form.elements.longitude.value=best.longitude.toFixed(7);if(msg)msg.textContent="Coordenadas capturadas · precisão aproximada de "+Math.round(best.accuracy)+" m. Confira o ponto no mapa antes de salvar.";}else if(msg)msg.textContent="Não foi possível obter a localização. Ative a localização precisa do aparelho e permita o acesso do navegador.";button.disabled=false;};const timer=setTimeout(finish,30000);watch=navigator.geolocation.watchPosition(pos=>{const p={latitude:pos.coords.latitude,longitude:pos.coords.longitude,accuracy:pos.coords.accuracy};if(!best||p.accuracy<best.accuracy)best=p;if(msg)msg.textContent="GPS encontrado · precisão atual de "+Math.round(p.accuracy)+" m. Aguardando melhorar...";if(p.accuracy<=75)finish();},()=>finish(),{enableHighAccuracy:true,timeout:30000,maximumAge:0});}
else if(a==="device-info")toast("Nenhum aparelho está vinculado a esta empresa.");else if(a==="revoke-device")toast("A função de revogação será habilitada após a configuração dos dispositivos.");else if(a==="approve-device")toast("A autorização de dispositivos será habilitada após a configuração.");else if(a==="export-demo")toast("A exportação será habilitada após a conexão dos dados da empresa.");else if(a==="report")toast("Módulo em planejamento: "+["Espelho de ponto","Pendências de marcação","Resumo de jornada","Relatório por empresa","Auditoria","Exportação para folha"][+b.dataset.index]+".");else if(a==="open-audit"){auditOpen=true;auditTab="companies";auditCompanyDetailId=null;render();}else if(a==="back-reports"){auditOpen=false;render();}else if(a==="audit-tab"){auditTab=b.dataset.tab;auditCompanyDetailId=null;render();}else if(a==="audit-company-events"){auditCompanyDetailId=auditCompanyDetailId===b.dataset.companyId?null:b.dataset.companyId;loadAuditPanel();}else if(a==="archive-company"){setCompanyArchived(b.dataset.companyId,true);}else if(a==="restore-company"){setCompanyArchived(b.dataset.companyId,false);}else if(a==="export-audit-companies"){exportAuditCompanies();}else if(a==="print-audit-companies"){printAuditCompanies();}else if(a==="close-main-company"){refreshMainCompanies();}else if(a==="cancel-vacation"){$("#vacationPanel form")?.remove();}else if(a==="send-company-email"){if(!lastCreatedCompanyAccess){toast("Não há credenciais recentes para enviar.");return;}openCompanyEmailComposer(lastCreatedCompanyAccess);}else if(a==="copy-company-password"){if(lastCreatedCompanyAccess)navigator.clipboard?.writeText(lastCreatedCompanyAccess.password).then(()=>toast("Senha provisória copiada."));}else if(a==="copy-company-access-link"){if(lastCreatedCompanyAccess?.action_link)navigator.clipboard?.writeText(lastCreatedCompanyAccess.action_link).then(()=>toast("Link seguro copiado."));}else if(a==="copy-pwa-link"){navigator.clipboard?.writeText("https://appontkr.vercel.app/terminal/").then(()=>toast("Link do terminal de ponto copiado. O cliente poderá instalar pelo navegador do celular."));}else if(a.startsWith("clock-")){const pin=$("#pinInput")?.value||"";if(pin.length<4)toast("Informe a identificação do funcionário.");else toast("A marcação será habilitada após a conexão dos dados e a configuração do funcionário.");}});
$("#mobileMenu").addEventListener("click",()=>{const sidebar=$("#sidebar");if(window.matchMedia("(max-width: 760px)").matches){sidebar.classList.toggle("open")}else{document.querySelector(".app-shell").classList.toggle("sidebar-collapsed");$("#mobileMenu").setAttribute("aria-expanded",String(!document.querySelector(".app-shell").classList.contains("sidebar-collapsed")))}});
$("#profileButton").addEventListener("click",()=>toast("Empresa em uso: "+state.company+"."));
$("#companySwitcher").addEventListener("change",e=>{recordsSelectedCompanyId=null;deviceSelectedCompanyId=null;employeeSelectedCompanyId=null;const value=e.target.value;const selected=accessCompanies.find(c=>c.id===value);if(value==="KR Contábil"){state.company="KR Contábil";state.companyId=null;}else if(selected){state.companyId=selected.id;state.company=selected.trade_name||selected.legal_name;}updateCompanyHeader();render();toast("Empresa ativa alterada para: "+state.company+". Confira antes de trabalhar.");});
$("#notificationsButton").addEventListener("click",()=>toast("Não há novas notificações."));



document.addEventListener("change",e=>{
 if(e.target.id==="companyMapsReference"){const coords=parseCompanyMapCoordinates(e.target.value);if(coords){const form=$("#companyLocationForm");form.elements.latitude.value=coords.latitude;form.elements.longitude.value=coords.longitude;$("#companyLocationMessage").textContent="Coordenadas extraídas do link do Google Maps. Confira o ponto antes de salvar.";}else if(e.target.value.trim())$("#companyLocationMessage").textContent="Não consegui extrair as coordenadas. Use um link completo do Maps com o marcador ou informe latitude e longitude."}
 if(e.target.id==="recordsCompanySelect"){recordsSelectedCompanyId=e.target.value;loadRecordsPanel();}
 if(e.target.id==="pendingCompanySelect"){loadPendingPanel();}
});
document.addEventListener("click",async e=>{
 const b=e.target.closest("[data-action]");if(!b)return;
 if(b.dataset.action==="records-tab"){recordsTab=b.dataset.tab;document.querySelectorAll(".records-tabs .company-detail-tab").forEach(x=>x.classList.toggle("active",x===b));loadRecordsPanel();}
 if(b.dataset.action==="refresh-records")loadRecordsPanel();
 if(b.dataset.action==="refresh-pending")loadPendingPanel();
 if(b.dataset.action==="resolve-missing-punch"){
  const requestId=b.dataset.requestId,decision=b.dataset.decision,note=document.querySelector('[data-missing-note="'+requestId+'"]')?.value?.trim()||"",companyId=$("#recordsCompanySelect")?.value||recordsSelectedCompanyId;
  if(note.length<4){toast("Informe uma observação para concluir a análise.");return;}
  if(!confirm(decision==="approve"?"Confirma aprovar esta marcação esquecida e incluí-la nos lançamentos?":"Confirma rejeitar esta solicitação?"))return;
  b.disabled=true;const {data,error}=await db.functions.invoke("manage-time-entries",{body:{action:"resolve_request",company_id:companyId,request_id:requestId,decision,note}});
  if(error||data?.error){b.disabled=false;toast(data?.error||error?.message||"Não foi possível tratar a pendência.");return;}
  toast(decision==="approve"?"Marcação aprovada e incluída nos lançamentos.":"Solicitação rejeitada.");if(decision==="approve"){recordsTab="entries";renderApp();}else loadRecordsPanel();
 }
});
document.addEventListener("submit",async e=>{
 if(e.target.id!=="missingPunchForm"&&e.target.id!=="manualPunchForm")return;
 e.preventDefault();const form=e.target,f=new FormData(form),companyId=$("#recordsCompanySelect")?.value||recordsSelectedCompanyId;
 const occurred_at=new Date(String(f.get("date"))+"T"+String(f.get("time"))+":00").toISOString();
 const isMissing=form.id==="missingPunchForm",errorBox=$(isMissing?"#missingPunchError":"#manualPunchError"),button=form.querySelector('button[type="submit"]');
 const payload=isMissing?{action:"create_request",company_id:companyId,employee_id:f.get("employee_id"),entry_type:f.get("entry_type"),occurred_at,reason:String(f.get("reason")||"").trim()}:{action:"manual_create",company_id:companyId,employee_id:f.get("employee_id"),entry_type:f.get("entry_type"),occurred_at,note:String(f.get("note")||"").trim()};
 button.disabled=true;button.textContent=isMissing?"Enviando...":"Salvando...";
 const {data,error}=await db.functions.invoke("manage-time-entries",{body:payload});
 if(error||data?.error){errorBox.textContent=data?.error||error?.message||"Não foi possível concluir.";button.disabled=false;button.textContent=isMissing?"Enviar para aprovação":"Salvar lançamento manual";return;}
 toast(isMissing?"Marcação esquecida enviada para aprovação.":"Lançamento manual registrado.");
 loadRecordsPanel();
});

/* Autenticação e gestão de acessos */
const SUPABASE_URL = "https://auzrtnuquplhogtqasbb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_7y0Zgojnh0xbPwbsSp1gkQ_6Kv3hJiZ";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let authUser = null, authProfile = null, accessCompanies = [], accessProfiles = [], accessAssignments = [];
let authInitializing = true;
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
$("#logoutButton").addEventListener("click",async()=>{await db.auth.signOut();authUser=null;authProfile=null;passwordChangeRequired=false;passwordRecoveryPending=false;accessCompanies=[];accessProfiles=[];accessAssignments=[];accessDataReady=false;accessFetchPending=false;accessSection="home";state.company="KR Contábil";state.companyId=null;state.view="dashboard";render();});
/* Gestão de acessos — painel por módulos e cadastros guiados */
let accessSection="home", accessDataReady=false, accessFetchPending=false;
function accessCard(id,icon,title,desc,count){return '<button class="access-module-card" data-access-section="'+id+'"><span class="access-module-icon">'+icon+'</span><span class="access-module-copy"><strong>'+title+'</strong><small>'+desc+'</small></span><span class="access-module-count">'+count+'</span><span class="access-module-arrow">↗</span></button>'}
function renderAccess(){
 $("#content").innerHTML=contextBar()+
 (accessSection==="home" ? heading("ADMINISTRAÇÃO","Painel administrativo","Gerencie usuários, empresas, permissões e acompanhe as movimentações.")+
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
 (list.length?list.map(p=>{const n=accessAssignments.filter(a=>a.analyst_id===p.id).length;return '<tr><td><strong>'+accessEsc(p.full_name)+'</strong><small class="access-subline">'+accessEsc(p.phone||"Sem telefone")+'</small></td><td>'+accessEsc(p.cpf||"—")+'</td><td>'+accessEsc(p.email||"—")+'</td><td>'+n+' vinculada(s)</td><td>'+badge(p.active?"Ativo":"Inativo")+'</td><td><button class="btn" data-edit-analyst="'+p.id+'">Editar permissões</button> <button class="btn" data-toggle-user="'+p.id+'" data-active="'+p.active+'">'+(p.active?"Desativar":"Ativar")+'</button></td></tr>'}).join(""):'<tr><td colspan="6" class="empty-cell">Nenhum analista cadastrado. Use “Novo analista” para começar.</td></tr>')+
 '</tbody></table></div></div>'+
 '<div id="analystWizard" class="access-wizard" hidden></div>';
}
function openAnalystPermissionsEditor(id){
 const p=accessProfiles.find(x=>x.id===id);if(!p)return;
 const box=$("#analystWizard");box.hidden=false;
 const tabs={dashboard:"Início",companies:"Empresas",employees:"Funcionários",devices:"Dispositivos",records:"Lançamentos",reports:"Relatórios",vacations:"Férias",leaves:"Afastamentos",settings:"Configurações",clock:"PWA de marcação",timesheet_calculator:"Cálculo de ponto"};
 const current=p.permissions||{},tabValues=current.tabs||{};
 const actions={employees:["Visualizar","Cadastrar","Editar","Excluir"],companies:["Visualizar","Cadastrar","Editar","Excluir"],devices:["Visualizar","Gerar código","Editar localização","Revogar terminal"],records:["Visualizar","Cadastrar","Editar","Excluir","Exportar"],reports:["Visualizar","Exportar","Importar"],timesheet_calculator:["Visualizar","Importar folha","Calcular","Exportar"]};
 const keys={employees:["view","create","edit","delete"],companies:["view","create","edit","delete"],devices:["view","create","edit","delete"],records:["view","create","edit","delete","export"],reports:["view","export","import"],timesheet_calculator:["view","import","calculate","export"]};
 const tabHtml=Object.entries(tabs).map(([k,v])=>'<label class="access-company-option"><input type="checkbox" data-perm-tab="'+k+'" '+(tabValues[k]===false?'':'checked')+'> <span>'+v+'</span></label>').join("");
 const actionHtml=Object.entries(actions).map(([area,names])=>'<div class="permission-action-group"><strong>'+tabs[area]+'</strong><div class="access-company-list">'+names.map((n,i)=>'<label class="access-company-option"><input type="checkbox" data-perm-area="'+area+'" data-perm-key="'+keys[area][i]+'" '+(current.actions?.[area]?.[keys[area][i]]===false?'':'checked')+'> <span>'+n+'</span></label>').join("")+'</div></div>').join("");
 box.innerHTML='<div class="wizard-head"><div><p class="eyebrow">PERMISSÕES INDIVIDUAIS</p><h2>'+accessEsc(p.full_name)+'</h2><p>Defina as abas e as ações permitidas para este analista.</p></div><button class="btn" data-access-action="close-analyst">Fechar</button></div><form id="analystPermissionsForm" data-analyst-id="'+id+'"><section class="access-wizard"><h3>Abas disponíveis</h3><div class="access-company-list">'+tabHtml+'</div></section><section class="access-wizard"><h3>Ações por área</h3><p class="wizard-hint">Marque as ações que o analista poderá executar.</p>'+actionHtml+'</section><button class="btn primary" type="submit">Salvar permissões</button><p id="analystPermissionsError" class="login-error"></p></form>';
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
 const box=$("#analystWizard");box.hidden=false;
 box.innerHTML='<div class="wizard-head"><div><p class="eyebrow">NOVO ACESSO</p><h2>Cadastro de analista</h2><p>Informe os dados de acesso para criar o usuário.</p></div><button class="btn" data-access-action="close-analyst">Fechar</button></div><form id="analystWizardForm" class="access-form"><label class="full">Nome completo<input name="full_name" autocomplete="name" required maxlength="120" placeholder="Nome do analista"></label><label class="full">E-mail profissional<input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="nome@krcontabil.com.br"></label><label class="full">Senha inicial<input name="password" type="password" autocomplete="new-password" minlength="8" required placeholder="Mínimo de 8 caracteres"></label><p class="wizard-hint full">A senha inicial deve ter pelo menos 8 caracteres e ser compartilhada com segurança.</p><button type="submit" class="btn primary full" id="wizardSubmit">Criar analista</button><p id="wizardError" class="login-error full" role="alert"></p></form>';
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
  const terminalResult=await db.functions.invoke("manage-terminal-device",{body:{action:"issue",company_id:data.company_id,device_name:"Terminal principal"}});
  const terminalCode=(!terminalResult.error&&!terminalResult.data?.error)?terminalResult.data:null;
  lastCreatedCompanyAccess={company_id:data.company_id,email:data.email,full_name:data.full_name||payload.admin_name,password:data.password,company:payload.trade_name||payload.legal_name,login_url:"https://appontkr.vercel.app/",terminal_url:"https://appontkr.vercel.app/terminal/",terminal_code:terminalCode?.activation_code||null,terminal_expires:terminalCode?.expires_at||null,mode:"initial"};
  if(!terminalCode)toast("Empresa cadastrada. O código do terminal poderá ser gerado na aba Dispositivos.");
  const box=$("#mainCompanyEditor");box.innerHTML='<div class="wizard-head"><div><p class="eyebrow">CADASTRO CONCLUÍDO</p><h2>Empresa e login criados</h2><p>O login foi salvo no cadastro da empresa. A senha provisória será exibida somente nesta confirmação.</p></div></div><div class="access-rule-list"><p><strong>Empresa:</strong> '+safeHtml(lastCreatedCompanyAccess.company)+'</p><p><strong>Administrador:</strong> '+safeHtml(lastCreatedCompanyAccess.full_name)+'</p><p><strong>Login:</strong> '+safeHtml(data.email)+'</p><p><strong>Senha provisória:</strong> <code>'+safeHtml(data.password)+'</code></p><p><strong>Link do sistema:</strong> https://appontkr.vercel.app/</p><p><strong>Terminal de ponto:</strong> https://appontkr.vercel.app/terminal/</p><p><strong>Código de ativação:</strong> <code>'+safeHtml(terminalCode?.activation_code||"Não gerado")+'</code></p><p class="wizard-hint">O código é de uso único e expira em sete dias. Configure a localização da empresa na aba Dispositivos antes da primeira marcação.</p><p class="wizard-hint">No primeiro login, o administrador será obrigado a cadastrar sua senha fixa.</p></div><div class="wizard-actions"><button class="btn primary" data-action="send-company-email">Preparar e-mail para o cliente</button><button class="btn" data-action="copy-company-password">Copiar senha provisória</button><button class="btn" data-action="copy-pwa-link">Copiar link do PWA</button><button class="btn" data-action="close-main-company">Concluir</button></div>';
  const newCompany={id:data.company_id,legal_name:payload.legal_name,trade_name:payload.trade_name,cnpj:payload.cnpj,email:payload.company_email,phone:payload.phone,status:"active",average_employees:payload.average_employees};accessCompanies=[...(accessCompanies||[]),newCompany];

 }
 if(e.target.id==="companyLocationForm"){
  e.preventDefault();const f=new FormData(e.target),companyId=$("#deviceCompanySelect")?.value,latitude=Number(f.get("latitude")),longitude=Number(f.get("longitude")),radius=Number(f.get("radius")),msg=$("#companyLocationMessage");
  if(!companyId||!Number.isFinite(latitude)||!Number.isFinite(longitude)||latitude < -90||latitude>90||longitude < -180||longitude>180||!Number.isInteger(radius)||radius<10||radius>1000){msg.textContent="Confira as coordenadas e informe um raio entre 10 e 1.000 metros.";return;}
  const button=e.target.querySelector('button[type="submit"]');button.disabled=true;msg.textContent="Salvando localização...";
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
  toast("Analista cadastrado com sucesso.");accessSection="analysts";accessDataReady=false;await loadAccessData();return;
 }
 if(e.target.id==="analystPermissionsForm"){
  e.preventDefault();if(authProfile?.role!=="kr_admin"){toast("Somente a KR pode alterar permissões.");return;}
  const id=e.target.dataset.analystId,permissions={tabs:{audit:false},actions:{}};
  e.target.querySelectorAll("[data-perm-tab]").forEach(x=>permissions.tabs[x.dataset.permTab]=x.checked);
  e.target.querySelectorAll("[data-perm-area]").forEach(x=>{const a=x.dataset.permArea;permissions.actions[a]??={};permissions.actions[a][x.dataset.permKey]=x.checked;});
  const b=e.target.querySelector('button[type="submit"]'),err=$("#analystPermissionsError");b.disabled=true;b.textContent="Salvando...";
  const {error}=await db.from("profiles").update({permissions}).eq("id",id).eq("role","analyst");
  if(error){err.textContent="Não foi possível salvar: "+error.message;b.disabled=false;b.textContent="Salvar permissões";return;}
  toast("Permissões atualizadas.");$("#analystWizard").hidden=true;await loadAccessData();return;
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
