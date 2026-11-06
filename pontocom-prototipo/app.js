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
function renderDashboard(){
 return '<section class="welcome-banner"><div class="welcome-copy"><h1>Olá, <span>'+safeHtml(authProfile?.role==="analyst"?(authProfile.full_name||"Analista"):state.company)+'!</span> <span class="wave">👋</span></h1><p>Bem-vindo ao Ponto.com. Gerencie as empresas e acompanhe a jornada dos colaboradores.</p></div><div class="welcome-art"><span class="welcome-script">Gestão simples<br><b>e organizada</b><br><em>para sua equipe.</em></span><div class="hero-monogram" aria-hidden="true"></div></div></section>'+
 '<div class="quick-actions"><button class="quick-action" data-action="new-company"><span class="quick-icon">＋</span><span><strong>Nova empresa</strong><small>Cadastrar cliente</small></span><span class="quick-arrow">↗</span></button><button class="quick-action" data-action="new-employee"><span class="quick-icon">♟</span><span><strong>Adicionar funcionário</strong><small>Incluir colaborador</small></span><span class="quick-arrow">↗</span></button><button class="quick-action" data-view="records"><span class="quick-icon">◷</span><span><strong>Consultar ponto</strong><small>Ver marcações</small></span><span class="quick-arrow">↗</span></button><button class="quick-action" data-view="reports"><span class="quick-icon">▤</span><span><strong>Relatórios</strong><small>Consultar dados</small></span><span class="quick-arrow">↗</span></button></div>'+
 '<div class="stats">'+stat("Empresas cadastradas",String(accessCompanies.length),"Empresas vinculadas ao seu acesso","♟")+stat("Funcionários ativos",'<span id="dashActiveEmployees">—</span>',"Na empresa selecionada","♙")+stat("Marcações de hoje",'<span id="dashTodayPunches">—</span>',"Na empresa selecionada","◷")+stat("Pendências",'<span id="dashPendingCount">—</span>',"Na empresa selecionada","▦")+'</div>'+
 '<div class="two-col"><section class="panel"><div class="panel-heading"><div><h2>Últimas marcações</h2><p>Registros recentes da empresa selecionada</p></div><button class="text-link" data-view="records">Ver todas →</button></div><div class="empty-state" id="dashboardRecentEntries">Selecione uma empresa no topo.</div></section><section class="panel"><div class="panel-heading"><div><h2>Empresa em uso</h2><p>Contexto dos indicadores exibidos</p></div><button class="text-link" data-view="companies">Ver cadastro →</button></div><div class="empty-state" id="dashboardCompanyContext">'+safeHtml(state.company)+'</div></section></div>'+
 '<div id="mainCompanyEditor" class="access-wizard" hidden></div><div class="dashboard-bottom"><section class="time-widget"><div class="time-copy"><span class="time-eyebrow">HOJE É</span><strong>'+new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})+'</strong><div class="live-time" id="dashboardClock">--:--</div><p>Organização hoje,<br>resultados amanhã.</p></div><div class="mini-calendar"><div class="calendar-title"><strong>Calendário</strong></div><div class="empty-state">O calendário será preenchido conforme os registros forem cadastrados.</div></div></section></div>';
}
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
async function loadBiometricApprovals(panel){
 const {data,error}=await db.functions.invoke("manage-biometric-enrollment",{body:{action:"list"}});
 if(!panel?.isConnected)return;
 if(error||data?.error){panel.insertAdjacentHTML("beforeend",'<div class="access-wizard"><h2>Cadastros faciais pendentes</h2><p class="login-error">'+safeHtml(data?.error||error?.message||"Falha ao consultar.")+'</p></div>');return;}
 const items=data?.items||[];
 const content=items.length?items.map(x=>'<div class="biometric-pending-row"><div><strong>'+safeHtml(x.employee_name)+'</strong><p>'+safeHtml(x.company_name)+' · Matrícula '+safeHtml(x.employee_code)+'</p><small>Recebido em '+new Date(x.enrolled_at).toLocaleString("pt-BR")+'</small></div><div class="wizard-actions"><button class="btn primary small" data-action="approve-biometric" data-employee-id="'+safeHtml(x.employee_id)+'" data-company-id="'+safeHtml(x.company_id)+'" '+(!x.employee_active?'disabled title="Funcionário inativo"':'')+'>Aprovar</button><button class="btn small" data-action="delete-biometric" data-employee-id="'+safeHtml(x.employee_id)+'" data-company-id="'+safeHtml(x.company_id)+'">Excluir</button></div></div>').join(""):'<p class="empty-state">Nenhum cadastro facial aguardando aprovação.</p>';
 panel.insertAdjacentHTML("beforeend",'<section class="access-wizard biometric-approvals"><div class="wizard-head"><div><p class="eyebrow">CONTROLE DA KR</p><h2>Cadastros faciais pendentes</h2><p>Confira a identidade do funcionário presencialmente antes de aprovar. A aprovação libera o modelo para futuras validações.</p></div></div>'+content+'</section>');
}
let recordsTab="entries",recordsSelectedCompanyId=null,recordsSelectedDate=null,recordsFromDate=localDateValue().slice(0,8)+"01",recordsToDate=localDateValue();
function renderRecords(){
 const companyId=recordsSelectedCompanyId||state.companyId||accessCompanies[0]?.id||"";recordsSelectedCompanyId=companyId||null;
 const options=(accessCompanies||[]).map(c=>'<option value="'+safeHtml(c.id)+'" '+(c.id===companyId?'selected':'')+'>'+safeHtml(c.trade_name||c.legal_name)+'</option>').join("");
 return heading("JORNADA","Lançamentos","Consulte as marcações por empresa e período, confira pontos esquecidos ou faça lançamentos manuais.")+
 '<section class="access-wizard records-toolbar records-toolbar-modern"><label>Empresa<select id="recordsCompanySelect">'+(options||'<option value="">Nenhuma empresa disponível</option>')+'</select></label><label>Data inicial<input id="recordsFromDate" type="date" value="'+recordsFromDate+'"></label><label>Data final<input id="recordsToDate" type="date" value="'+recordsToDate+'"></label><button class="btn primary" data-action="refresh-records">Consultar período</button></section>'+
 '<div class="company-detail-tabs records-tabs"><button class="company-detail-tab '+(recordsTab==="entries"?"active":"")+'" data-action="records-tab" data-tab="entries">Marcações registradas</button><button class="company-detail-tab '+(recordsTab==="missing"?"active":"")+'" data-action="records-tab" data-tab="missing">Marcações esquecidas</button><button class="company-detail-tab '+(recordsTab==="manual"?"active":"")+'" data-action="records-tab" data-tab="manual">Lançamento manual</button></div><div id="recordsPanel" class="table-panel"><div class="empty-state">Carregando lançamentos...</div></div>';
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
  const rows=entries.slice().sort((a,b)=>new Date(a.occurred_at)-new Date(b.occurred_at));
  host.innerHTML='<div class="table-toolbar"><div><strong>Marcações encontradas ('+rows.length+')</strong><small class="access-subline">'+new Date(recordsFromDate+"T12:00:00").toLocaleDateString("pt-BR")+' até '+new Date(recordsToDate+"T12:00:00").toLocaleDateString("pt-BR")+'</small></div><input class="search" id="recordsSearch" placeholder="Buscar funcionário ou tipo..."></div><div class="table-wrap"><table><thead><tr><th>FUNCIONÁRIO</th><th>TIPO</th><th>DATA/HORA</th><th>ORIGEM</th><th>CONFERÊNCIA</th><th>OBSERVAÇÃO</th></tr></thead><tbody>'+(rows.length?rows.map(x=>'<tr><td><strong>'+safeHtml(x.employee_name)+'</strong><small class="access-subline">'+safeHtml(x.employee_code)+'</small></td><td>'+safeHtml(({clock_in:"Entrada",break_start:"Saída intervalo",break_end:"Retorno intervalo",clock_out:"Saída final",adjustment:"Ajuste"})[x.entry_type]||x.entry_type)+'</td><td>'+new Date(x.occurred_at).toLocaleString("pt-BR")+'</td><td>'+safeHtml(x.source==="admin"?"Administrador":x.source==="mobile"?"Terminal":x.source==="import"?"Importação":"Sistema")+'</td><td>'+safeHtml(x.location_status==="manual"?"Conferida / manual":x.location_status==="offline"?"Sincronizada offline":x.location_status==="valid"?"Localização da empresa validada":x.biometric_verified?"Reconhecimento facial":"Registrada")+'</td><td>'+safeHtml(x.note||x.receipt_code||"—")+'</td></tr>').join(""):'<tr><td colspan="6" class="empty-cell">Nenhuma marcação encontrada neste período.</td></tr>')+'</tbody></table></div>';
  $("#recordsSearch")?.addEventListener("input",e=>{const q=e.target.value.toLocaleLowerCase("pt-BR");host.querySelectorAll("tbody tr").forEach(tr=>tr.hidden=!tr.innerText.toLocaleLowerCase("pt-BR").includes(q));});
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
async function loadPendingPanel(){const host=$("#pendingPanel"),select=$("#pendingCompanySelect");if(!host||!select)return;const companyId=select.value;if(!companyId){host.innerHTML='<div class="empty-state">Selecione uma empresa para consultar as pendências.</div>';return;}host.innerHTML='<div class="empty-state">Consultando tentativas pendentes...</div>';await loadLocationReviewQueue(host,companyId);}
let auditOpen=false,auditTab="companies",auditCompanyDetailId=null;
let reportType="mirror",reportFromDate=localDateValue().slice(0,8)+"01",reportToDate=localDateValue();
function renderReports(){
 if(auditOpen)return heading("CONTROLE ADMINISTRATIVO","Auditoria","Consulte os eventos registrados no sistema.",'<button class="btn" data-action="back-reports">← Voltar aos relatórios</button>')+'<div class="company-detail-tabs"><button class="company-detail-tab '+(auditTab==="companies"?"active":"")+'" data-action="audit-tab" data-tab="companies">Empresas</button><button class="company-detail-tab '+(auditTab==="archive"?"active":"")+'" data-action="audit-tab" data-tab="archive">Arquivo morto</button><button class="company-detail-tab '+(auditTab==="users"?"active":"")+'" data-action="audit-tab" data-tab="users">Funcionários/Usuários</button></div><div id="auditPanel" class="table-panel"><div class="empty-state">Carregando auditoria...</div></div>';
 const options=(accessCompanies||[]).map(c=>'<option value="'+safeHtml(c.id)+'" '+(c.id===state.companyId?'selected':'')+'>'+safeHtml(c.trade_name||c.legal_name)+'</option>').join("");
 return heading("DP E RELATÓRIOS","Relatórios","Escolha o tipo de relatório e depois informe a empresa e o período.")+
 '<div class="company-detail-tabs report-tabs"><button class="company-detail-tab '+(reportType==="mirror"?"active":"")+'" data-action="report-type" data-report-type="mirror">Espelho de ponto</button><button class="company-detail-tab '+(reportType==="summary"?"active":"")+'" data-action="report-type" data-report-type="summary">Resumo de jornada</button>'+(authProfile?.role==="kr_admin"?'<button class="company-detail-tab" data-action="open-audit">Auditoria</button>':"")+'</div>'+
 '<section class="access-wizard report-filters"><label>Empresa<select id="reportCompanySelect">'+(options||'<option value="">Selecione uma empresa</option>')+'</select></label><label>Data inicial<input type="date" id="reportFromDate" value="'+reportFromDate+'"></label><label>Data final<input type="date" id="reportToDate" value="'+reportToDate+'"></label><button class="btn primary" data-action="run-report">Consultar</button></section><div id="reportsPanel" class="table-panel"><div class="empty-state">Escolha o relatório e o período e clique em Consultar.</div></div>';
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
function renderSettings(){
 const company=accessCompanies.find(c=>c.id===state.companyId);
 if(!company)return heading("SISTEMA","Configurações","Selecione uma empresa no topo para consultar suas configurações.")+'<div class="access-wizard"><p class="empty-state">A visão master não altera configurações de uma empresa sem seleção.</p></div>';
 return heading("SISTEMA","Configurações","Confira e atualize os dados cadastrais da empresa em uso.")+'<section class="access-wizard"><div class="wizard-head"><div><p class="eyebrow">DADOS DA EMPRESA</p><h2>'+safeHtml(company.trade_name||company.legal_name)+'</h2><p>As alterações são salvas no cadastro da empresa selecionada.</p></div></div><form id="companySettingsForm" class="access-form"><label class="full">Razão social<input name="legal_name" required value="'+safeHtml(company.legal_name||"")+'"></label><label>Nome fantasia<input name="trade_name" value="'+safeHtml(company.trade_name||"")+'"></label><label>CNPJ<input value="'+safeHtml(company.cnpj||"")+'" disabled></label><label>E-mail<input name="email" type="email" value="'+safeHtml(company.email||"")+'"></label><label>Telefone<input name="phone" value="'+safeHtml(company.phone||"")+'"></label><button class="btn primary full" type="submit">Salvar configurações</button><p id="companySettingsError" class="login-error full"></p></form></section>';
}

function renderApp(){
 const views={dashboard:renderDashboard,companies:renderCompanies,employees:renderEmployees,devices:renderDevices,records:renderRecords,pending:renderPending,reports:renderReports,clock:renderClock,vacations:renderVacations,leaves:renderLeaves,settings:renderSettings,"bank-hours":renderTimeBank};
 const titles={dashboard:"Visão geral",companies:"Gestão de acessos",employees:"Funcionários",devices:"Dispositivos",records:"Lançamentos",pending:"Pendências",reports:"Relatórios",clock:"PWA de marcação",vacations:"Férias",leaves:"Afastamentos",settings:"Configurações","bank-hours":"Banco de horas"};
 const tabs=authProfile?.permissions?.tabs||{};if(authProfile?.role==="analyst"&&tabs[state.view]===false)state.view="dashboard";
 $("#content").innerHTML=contextBar()+(views[state.view]||renderDashboard)();applyAnalystActionPermissions();
 const crumb=$("#pageCrumb");if(crumb)crumb.textContent=titles[state.view]||"Configurações";
 document.querySelectorAll(".nav-item").forEach(b=>{b.hidden=authProfile?.role==="analyst"&&tabs[b.dataset.view]===false;b.classList.toggle("active",b.dataset.view===state.view)});
 const accessNav=$("#accessNav");if(accessNav)accessNav.hidden=authProfile?.role!=="kr_admin";
 const bankNav=$("#timeBankNav");if(bankNav)bankNav.hidden=!["kr_admin","company_admin","company_user","analyst"].includes(authProfile?.role);
 $("#sidebar").classList.remove("open");
 const search=$("#searchTable");if(search)search.addEventListener("input",()=>{const q=search.value.toLowerCase();$("#dataTable")?.querySelectorAll("tbody tr").forEach(tr=>tr.style.display=tr.innerText.toLowerCase().includes(q)?"":"none");});
 if(state.view==="clock")updateClock();if(state.view==="employees")loadEmployeeDirectory();if(state.view==="devices")loadDevicesPanel();if(state.view==="records")loadRecordsPanel();if(state.view==="pending")loadPendingPanel();if(state.view==="reports"&&auditOpen)loadAuditPanel();if(state.view==="reports"&&!auditOpen)loadReportsData();if(state.view==="leaves")loadLeavesPanel();if(state.view==="bank-hours")loadTimeBankPanel();if(state.view==="dashboard")loadDashboardStats();
}
async function loadDashboardStats(){
 if(!$("#dashActiveEmployees"))return;
 if(!state.companyId){$("#dashActiveEmployees").textContent="—";$("#dashTodayPunches").textContent="—";$("#dashPendingCount").textContent="—";$("#dashboardRecentEntries").textContent="Selecione uma empresa no topo para visualizar somente os dados dela.";$("#dashboardCompanyContext").textContent="Visão master · selecione uma empresa para abrir os indicadores.";return;}
 const companyId=state.companyId,today=localDateValue();
 const [emp,entriesResult,pendingResult]=await Promise.all([db.from("employees").select("id",{count:"exact",head:true}).eq("company_id",companyId).eq("status","active"),db.functions.invoke("manage-time-entries",{body:{action:"list",company_id:companyId}}),db.functions.invoke("manage-terminal-device",{body:{action:"review_list",company_id:companyId}})]);
 if(!$("#dashActiveEmployees"))return;const entries=entriesResult.data?.entries||[],requests=entriesResult.data?.requests||[],todays=entries.filter(x=>localDateForValue(x.occurred_at)===today);
 $("#dashActiveEmployees").textContent=emp.error?"—":String(emp.count??0);$("#dashTodayPunches").textContent=entriesResult.error?"—":String(todays.length);$("#dashPendingCount").textContent=entriesResult.error?"—":String(requests.filter(x=>x.status==="pending").length+(pendingResult.data?.items||[]).length);
 const recent=todays.slice().sort((a,b)=>new Date(b.occurred_at)-new Date(a.occurred_at)).slice(0,5);
 $("#dashboardRecentEntries").innerHTML=recent.length?'<div class="record-list">'+recent.map(x=>'<div class="record"><span class="record-icon">◷</span><div><div class="record-name">'+safeHtml(x.employee_name||"Funcionário")+'</div><div class="record-meta">'+safeHtml(({clock_in:"Entrada",break_start:"Saída intervalo",break_end:"Retorno intervalo",clock_out:"Saída final",adjustment:"Ajuste"})[x.entry_type]||x.entry_type)+'</div></div><strong class="record-time">'+new Date(x.occurred_at).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})+'</strong></div>').join("")+'</div>':'Nenhuma marcação registrada hoje para esta empresa.';
 $("#dashboardCompanyContext").textContent=(accessCompanies.find(x=>x.id===companyId)?.trade_name||state.company)+" · Indicadores isolados desta empresa.";
}

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
 const companyId=state.companyId||accessCompanies[0]?.id;if(!companyId){toast("Selecione uma empresa.");return;}
 db.from("employees").select("id,full_name").eq("company_id",companyId).order("full_name").then(({data,error})=>{
  if(error){toast("Não foi possível carregar os funcionários.");return;}
  const opts='<option value="">Selecione</option>'+(data||[]).map(x=>'<option value="'+x.id+'">'+safeHtml(x.full_name)+'</option>').join("");
  openLaunchModal("Registrar férias","Informe o funcionário e o período programado.",'<form id="vacationCreateForm" class="access-form"><label>Funcionário<select name="employee_id" required>'+opts+'</select></label><label>Data de início<input type="date" name="start_date" required></label><label>Data de término<input type="date" name="end_date" required></label><label class="full">Observações<input name="notes" placeholder="Opcional"></label><button class="btn primary full" type="submit">Salvar período</button><p id="vacationFormError" class="login-error full"></p></form>');
 });
}
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
 const actions={employees:["Visualizar","Cadastrar","Editar","Excluir"],companies:["Visualizar","Cadastrar","Editar","Excluir"],devices:["Visualizar","Gerar código","Editar localização","Revogar terminal"],records:["Visualizar","Cadastrar","Editar","Excluir","Exportar"],reports:["Visualizar","Exportar","Importar"],leaves:["Visualizar","Cadastrar","Editar","Excluir"],vacations:["Visualizar","Cadastrar","Editar","Excluir"],settings:["Visualizar","Editar cadastro da empresa"],timesheet_calculator:["Visualizar","Importar folha","Calcular","Exportar"]};
 const keys={employees:["view","create","edit","delete"],companies:["view","create","edit","delete"],devices:["view","create","edit","delete"],records:["view","create","edit","delete","export"],reports:["view","export","import"],leaves:["view","create","edit","delete"],vacations:["view","create","edit","delete"],settings:["view","edit"],timesheet_calculator:["view","import","calculate","export"]};
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
 return heading("GESTÃO DE ACESSOS · SEGURANÇA","Permissões","Monte e confira a cartela de empresas de cada analista, com seleção individual ou em lote.")+
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

document.addEventListener("change",e=>{
 if(e.target.id==="permissionAnalyst"){
  const id=e.target.value,box=$("#permissionCompanyList"),search=$("#permissionCompanySearch"),all=document.querySelector('[data-action="permission-select-all"]'),none=document.querySelector('[data-action="permission-clear-all"]');
  if(!id){box.innerHTML='<p class="empty-state">Escolha um analista.</p>';$("#savePermissionSet").disabled=true;if(search)search.disabled=true;if(all)all.disabled=true;if(none)none.disabled=true;return;}
  box.innerHTML=accessCompanies.map(c=>'<label class="permission-company-card"><input type="checkbox" value="'+c.id+'" '+(accessAssignments.some(a=>a.analyst_id===id&&a.company_id===c.id)?'checked':'')+'><span class="permission-company-copy"><strong>'+accessEsc(c.trade_name||c.legal_name)+'</strong><small>'+accessEsc(c.cnpj||"CNPJ não informado")+'</small></span><span class="permission-checkmark">✓</span></label>').join("")||'<p class="empty-state">Cadastre empresas primeiro.</p>';
  $("#savePermissionSet").disabled=false;if(search)search.disabled=false;if(all)all.disabled=false;if(none)none.disabled=false;updatePermissionSelectionCount();
 }
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
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-action]");if(!b)return;
 if(b.dataset.action==="permission-select-all"){document.querySelectorAll("#permissionCompanyList input[type=checkbox]").forEach(x=>x.checked=true);updatePermissionSelectionCount();}
 if(b.dataset.action==="permission-clear-all"){document.querySelectorAll("#permissionCompanyList input[type=checkbox]").forEach(x=>x.checked=false);updatePermissionSelectionCount();}
 if(b.dataset.action==="report-type"){reportType=b.dataset.reportType;renderApp();}
 if(b.dataset.action==="run-report")loadReportsData();
 if(b.dataset.action==="new-leave")openLeaveWizard();
 if(b.dataset.action==="close-leave")$("#leaveEditor").hidden=true;
 if(b.dataset.action==="refresh-leaves")loadLeavesPanel();
 if(b.dataset.action==="export-report"){
  const panel=$("#reportsPanel");if(panel){const rows=[...panel.querySelectorAll("table tr")].map(tr=>[...tr.querySelectorAll("th,td")].map(td=>td.innerText.trim()));const csv="\uFEFF"+rows.map(row=>row.map(v=>'"'+v.replace(/"/g,'""')+'"').join(";")).join("\r\n");const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="relatorio-pontocom.csv";a.click();URL.revokeObjectURL(url);}
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
 closeLaunchModal();const overlay=document.createElement("div");overlay.className="launch-modal-backdrop";overlay.id="launchModal";overlay.innerHTML='<section class="launch-modal" role="dialog" aria-modal="true"><header class="launch-modal-header"><div><small>REGISTRO NO PONTO.COM</small><h2>'+safeHtml(title)+'</h2><p>'+safeHtml(description||"Preencha os dados para continuar.")+'</p></div><button type="button" class="launch-modal-close" data-action="close-launch-modal">×</button></header><div class="launch-modal-body" id="launchModalBody">'+content+'</div></section>';document.body.appendChild(overlay);overlay.addEventListener("click",e=>{if(e.target===overlay)closeLaunchModal();});
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
function renderTimeBank(){
 const companyId=state.companyId||accessCompanies[0]?.id||"";timeBankCompanyId=companyId;const canEdit=["kr_admin","company_admin"].includes(authProfile?.role);const opts=(accessCompanies||[]).map(c=>'<option value="'+c.id+'" '+(c.id===companyId?'selected':'')+'>'+safeHtml(c.trade_name||c.legal_name)+'</option>').join("");
 return heading("GESTÃO DE JORNADA","Banco de horas","Consulte os saldos e controle compensações ou pagamentos de horas extras.")+'<section class="access-wizard records-toolbar"><label>Empresa<select id="timeBankCompanySelect">'+(opts||'<option value="">Selecione uma empresa</option>')+'</select></label><button class="btn" data-action="refresh-time-bank">Atualizar</button>'+(canEdit?'<button class="btn primary" data-action="new-time-bank-movement">＋ Nova movimentação</button>':"")+'</section><div id="timeBankPanel" class="table-panel"><div class="empty-state">Carregando banco de horas...</div></div>';
}
function timeBankTime(minutes){const n=Math.abs(Number(minutes)||0);return (minutes<0?"−":"")+String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0");}
async function loadTimeBankPanel(){
 const host=$("#timeBankPanel"),companyId=$("#timeBankCompanySelect")?.value||timeBankCompanyId;if(!host)return;if(!companyId){host.innerHTML='<div class="empty-state">Selecione uma empresa.</div>';return;}timeBankCompanyId=companyId;host.innerHTML='<div class="empty-state">Consultando movimentações...</div>';
 const {data,error}=await db.functions.invoke("manage-time-bank",{body:{action:"list",company_id:companyId}});if(!$("#timeBankPanel"))return;if(error||data?.error){host.innerHTML='<div class="empty-state">Não foi possível carregar: '+safeHtml(data?.error||error?.message)+'</div>';return;}
 timeBankCache={employees:data.employees||[],movements:data.movements||[]};const totals=new Map(timeBankCache.employees.map(e=>[e.id,{employee:e,credit:0,compensation:0,paid:0}]));for(const m of timeBankCache.movements){const t=totals.get(m.employee_id);if(t)t[m.movement_type]+=Number(m.minutes)||0;}
 const canEdit=["kr_admin","company_admin"].includes(authProfile?.role),active=[...totals.values()].filter(x=>x.employee.status==="active");
 host.innerHTML='<div class="table-toolbar"><div><strong>Saldos individuais</strong><small class="access-subline">Saldo = créditos − compensações − horas extras pagas</small></div><span>'+active.length+' funcionário(s)</span></div><div class="table-wrap"><table><thead><tr><th>FUNCIONÁRIO</th><th>CRÉDITOS</th><th>COMPENSADO</th><th>PAGO</th><th>SALDO ATUAL</th><th>AÇÃO</th></tr></thead><tbody>'+(active.length?active.map(t=>'<tr><td><strong>'+safeHtml(t.employee.full_name)+'</strong><small class="access-subline">'+safeHtml(t.employee.employee_code||"")+'</small></td><td>'+timeBankTime(t.credit)+'</td><td>'+timeBankTime(t.compensation)+'</td><td>'+timeBankTime(t.paid)+'</td><td><strong>'+timeBankTime(t.credit-t.compensation-t.paid)+'</strong></td><td>'+(canEdit?'<button class="btn small" data-action="new-time-bank-movement" data-employee-id="'+t.employee.id+'">Movimentar</button>':"—")+'</td></tr>').join(""):'<tr><td colspan="6" class="empty-cell">Nenhum funcionário ativo.</td></tr>')+'</tbody></table></div><div class="table-toolbar"><strong>Histórico de movimentações</strong><small class="access-subline">'+timeBankCache.movements.length+' registro(s)</small></div><div class="table-wrap"><table><thead><tr><th>DATA</th><th>FUNCIONÁRIO</th><th>MOVIMENTAÇÃO</th><th>QUANTIDADE</th><th>DESCRIÇÃO</th></tr></thead><tbody>'+(timeBankCache.movements.length?timeBankCache.movements.map(m=>{const emp=timeBankCache.employees.find(x=>x.id===m.employee_id);return '<tr><td>'+new Date(m.occurred_on+"T12:00:00").toLocaleDateString("pt-BR")+'</td><td>'+safeHtml(emp?.full_name||"Funcionário")+'</td><td>'+safeHtml(({credit:"Crédito no banco",compensation:"Compensação / folga",paid:"Hora extra paga"})[m.movement_type])+'</td><td><strong>'+timeBankTime(m.minutes)+'</strong></td><td>'+safeHtml(m.note)+'</td></tr>';}).join(""):'<tr><td colspan="5" class="empty-cell">Nenhuma movimentação registrada.</td></tr>')+'</tbody></table></div>';
}
function openTimeBankMovement(employeeId=""){
 if(!["kr_admin","company_admin"].includes(authProfile?.role)){toast("Somente o administrador da empresa ou a KR pode movimentar o banco de horas.");return;}const employees=timeBankCache.employees.filter(x=>x.status==="active");if(!employees.length){toast("Não há funcionários ativos nesta empresa.");return;}
 const opts='<option value="">Selecione o funcionário</option>'+employees.map(x=>'<option value="'+x.id+'" '+(x.id===employeeId?'selected':'')+'>'+safeHtml(x.full_name)+' · '+safeHtml(x.employee_code||"")+'</option>').join("");
 openLaunchModal("Nova movimentação","Registre crédito, compensação de folga ou pagamento de horas extras.",'<form id="timeBankMovementForm" class="access-form"><label class="full">Funcionário<select name="employee_id" required>'+opts+'</select></label><label class="full">Tipo de movimentação<select name="movement_type" required><option value="credit">Crédito de horas no banco</option><option value="compensation">Compensação / funcionário retirou folga</option><option value="paid">Horas extras pagas pelo empregador</option></select></label><label>Quantidade de horas<input type="number" name="hours" min="0.02" max="1666" step="0.01" placeholder="Ex.: 2,5" required></label><label>Data<input type="date" name="occurred_on" value="'+localDateValue()+'" required></label><label class="full">Descrição / observação<input name="note" minlength="5" required></label><button class="btn primary full" type="submit">Salvar movimentação</button><p class="login-error full" id="timeBankFormError"></p></form>');
}

document.addEventListener("click",e=>{
 const b=e.target.closest("[data-action]");if(!b)return;const a=b.dataset.action;
 if(a==="close-launch-modal"){closeLaunchModal();return;}
 if(a==="open-manual-form"){openExistingFormModal("manualPunchForm","Lançamento manual de ponto","Inclua uma marcação autorizada, identificada como lançamento administrativo.");return;}
 if(a==="open-missing-form"){openExistingFormModal("missingPunchForm","Solicitar marcação esquecida","A solicitação ficará pendente até aprovação do responsável.");return;}
 if(a==="new-time-bank-movement"){openTimeBankMovement(b.dataset.employeeId||"");return;}
 if(a==="refresh-time-bank"){loadTimeBankPanel();return;}
 if(a==="close-employee-editor"||a==="close-leave"||a==="close-main-company"||a==="cancel-vacation"){closeLaunchModal();return;}
});
document.addEventListener("change",e=>{if(e.target.id==="timeBankCompanySelect")loadTimeBankPanel();});
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
 if(b.dataset.action==="export-report-excel"){
  const panel=$("#reportsPanel"),tables=[...(panel?.querySelectorAll("table")||[])];if(!tables.length||!window.XLSX){toast("Consulte um relatório antes de exportar.");return;}
  const wb=XLSX.utils.book_new();tables.forEach((table,index)=>{const title=table.closest(".report-employee")?.querySelector(".report-employee-head strong")?.textContent||"Resumo";const ws=XLSX.utils.table_to_sheet(table);const sheet=(title||"Relatório").replace(/[\\\\/?*\\[\\]:]/g," ").slice(0,26)+" "+(index+1);XLSX.utils.book_append_sheet(wb,ws,sheet);});XLSX.writeFile(wb,"Ponto.com-relatorio.xlsx");
 }
 if(b.dataset.action==="export-report-pdf"){
  const panel=$("#reportsPanel");if(!panel?.querySelector("table")){toast("Consulte um relatório antes de exportar.");return;}const w=window.open("","_blank");if(!w){toast("Permita a abertura de janelas para gerar o PDF.");return;}
  w.document.write('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório Ponto.com</title><style>body{font:12px Arial;color:#222;padding:22px}h1{font-size:18px}table{width:100%;border-collapse:collapse;margin:10px 0 18px;font-size:10px}th,td{border:1px solid #bbb;padding:6px;text-align:left}th{background:#f0e8eb}.report-employee{page-break-inside:avoid;margin-bottom:16px}@media print{body{padding:0}}</style></head><body><h1>Ponto.com · '+(reportType==="mirror"?"Espelho de ponto":"Resumo de jornada")+'</h1><p>Período: '+new Date(reportFromDate+"T12:00:00").toLocaleDateString("pt-BR")+' a '+new Date(reportToDate+"T12:00:00").toLocaleDateString("pt-BR")+'</p>'+panel.innerHTML+'</body></html>');w.document.close();w.focus();setTimeout(()=>w.print(),300);
 }
});
