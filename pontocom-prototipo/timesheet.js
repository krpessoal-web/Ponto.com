/* Ponto.com — módulo Cálculo de Folha de Ponto */
(function(){
  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const pad = n => String(n).padStart(2,"0");
  const today = new Date();
  const monthStart = new Date(today.getFullYear(),today.getMonth(),1);
  const monthEnd = new Date(today.getFullYear(),today.getMonth()+1,0);
  const iso = d => d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
  const parse = v => {if(!/^\d{2}:\d{2}$/.test(String(v||"")))return null;const [h,m]=v.split(":").map(Number);return h<24&&m<60?h*60+m:null};
  const fmt = n => {n=Math.round(Number(n)||0);const sign=n<0?"-":"";n=Math.abs(n);return sign+pad(Math.floor(n/60))+":"+pad(n%60)};
  const dates = (a,b) => {const out=[];let d=new Date(a+"T12:00:00");const end=new Date(b+"T12:00:00");while(d<=end&&out.length<400){out.push(iso(d));d.setDate(d.getDate()+1)}return out};
  const weekday = s => new Date(s+"T12:00:00").getDay();
  const daysNames=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  const statusNames={work:"Dia útil",off:"Folga",vacation:"Férias",leave:"Afastamento",absence:"Falta",medical:"Atestado",holiday:"Feriado",comp:"Folga compensatória"};
  let records=[], analysts=[], current=null, days={}, config={}, schedule={}, companyId="", ownerId="", editing=false;
  let companyOptions=[], companyLabel="", companyMode="registered";
  const isAdmin=()=>authProfile?.role==="kr_admin";
  const activeCompany=()=>accessCompanies.find(c=>c.id===(state.companyId||$("#companySwitcher")?.value))||accessCompanies[0]||null;
  const toastMsg=m=>{if(typeof toast==="function")toast(m);else alert(m)};
  const defaultConfig=()=>({type:"personalizado",monthly_minutes:13200,weekly_minutes:2640,salary_enabled:false,base_salary:0});
  const money=n=>Number(n||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  function calcInss(base){const bands=[{limit:1621,rate:.075},{limit:2902.84,rate:.09},{limit:4354.27,rate:.12},{limit:8475.55,rate:.14}];let previous=0,total=0;for(const band of bands){const part=Math.max(0,Math.min(base,band.limit)-previous);total+=part*band.rate;previous=band.limit;if(base<=band.limit)break;}return Math.round(total*100)/100;}
  const defaultRates=()=>({weekday:50,saturday:50,sunday:100,holiday:100});
  function duration(start,end){let a=parse(start),b=parse(end);if(a==null||b==null)return 0;if(b<a)b+=1440;return b-a}
  function overlaps(a,b,lo,hi){return Math.max(0,Math.min(b,hi)-Math.max(a,lo))}
  function plannedMinutes(date,wd){const weekly=Number(schedule.weekly_minutes??2640);return wd>=1&&wd<=5?Math.round(weekly/5):0;}
  function computeDay(date,entry){
    const st=entry.status||"work",wd=weekday(date),planned=["work","medical","absence"].includes(st)?plannedMinutes(date,wd):0;
    const marks=entry.marks||["","","",""];
    let worked=0;
    if(marks[0]&&marks[3]){
      if(marks[1]&&marks[2])worked=duration(marks[0],marks[1])+duration(marks[2],marks[3]);
      else worked=duration(marks[0],marks[3]);
    }
    let night=0;
    const pairs=marks[1]&&marks[2]?[[marks[0],marks[1]],[marks[2],marks[3]]]:[[marks[0],marks[3]]];
    for(const pair of pairs){
      const a=parse(pair[0]),b=parse(pair[1]);
      if(a==null||b==null)continue;
      const end=b<a?b+1440:b;
      for(let day=-1;day<=1;day++){const base=day*1440;night+=overlaps(a,end,base+1320,base+1740);}
    }
    const nightExtra=Math.round(night/7);
    const counted=worked+nightExtra;
    const extra=Math.max(0,counted-planned);
    const late=st==="absence"?planned:(st==="medical"?0:Math.max(0,planned-counted));
    const rateKey=st==="holiday"?"holiday":wd===0?"sunday":wd===6?"saturday":"weekday";
    const rate=Number(config[rateKey]??50);
    const attested=st==="medical";
    const hourly=Number(schedule.salary_enabled?schedule.base_salary:0)/(Number(schedule.monthly_minutes||13200)/60||220);
    const extraPay=(extra/60)*hourly*(1+rate/100),nightPremium=(night/52.5)*hourly*.20;
    return {planned,worked,counted,extra,late,night,nightExtra,rate,rateKey,extraValue:extra*rate/100,extraPay,nightPremium,absence:st==="absence"?1:0,attested};
  }
  function summarize(){
    const s={planned:0,worked:0,extra:0,late:0,night:0,nightExtra:0,absences:0,medical:0,off:0,vacation:0,leave:0,holiday:0,comp:0,extra50:0,extra60:0,extra100:0,extraPay:0,nightPremium:0};
    dates($("#tsStart")?.value||iso(monthStart),$("#tsEnd")?.value||iso(monthEnd)).forEach(d=>{
      const e=days[d]||{status:"work",marks:["","","",""]};const r=computeDay(d,e);s.planned+=r.planned;s.worked+=r.worked;s.extra+=r.extra;s.late+=r.late;s.night+=r.night;s.nightExtra+=r.nightExtra;s.absences+=r.absence;s.extraPay+=r.extraPay;s.nightPremium+=r.nightPremium;
      if(r.attested)s.medical++;
      if(e.status==="off")s.off++;if(e.status==="vacation")s.vacation++;if(e.status==="leave")s.leave++;if(e.status==="holiday")s.holiday++;if(e.status==="comp")s.comp++;
      if(r.rate===50)s.extra50+=r.extra;if(r.rate===60)s.extra60+=r.extra;if(r.rate>=100)s.extra100+=r.extra;
    });return s;
  }
  function card(label,value){return '<div class="ts-kpi"><small>'+label+'</small><strong>'+value+'</strong></div>'}
  function payrollSummary(){const s=summarize(),salary=Number(schedule.salary_enabled?schedule.base_salary:0),gross=salary+s.extraPay+s.nightPremium,inss=calcInss(gross);return {salary,extraPay:s.extraPay,nightPremium:s.nightPremium,gross,inss,net:gross-inss};}
  function renderRows(){
    const a=$("#tsStart").value,b=$("#tsEnd").value;
    return dates(a,b).map(d=>{
      const e=days[d]||{status:"work",marks:["","","",""],note:""};const r=computeDay(d,e);
      const marks=e.marks||["","","",""];
      const status=Object.keys(statusNames).map(k=>'<option value="'+k+'" '+(e.status===k?"selected":"")+'>'+statusNames[k]+'</option>').join("");
      const marksHtml=marks.map((v,i)=>'<td><input class="ts-time" data-date="'+d+'" data-mark="'+i+'" type="time" value="'+esc(v)+'"></td>').join("");
      return '<tr data-date="'+d+'"><td>'+d.split("-").reverse().join("/")+'</td><td>'+daysNames[weekday(d)]+'</td><td><select class="ts-status" data-date="'+d+'">'+status+'</select></td>'+marksHtml+'<td class="ts-num">'+fmt(r.worked)+'</td><td class="ts-num">'+fmt(r.extra)+'</td><td class="ts-num">'+fmt(r.late)+'</td><td class="ts-num">'+fmt(r.night)+'</td><td><input class="ts-note" data-date="'+d+'" value="'+esc(e.note||"")+'" placeholder="Observação"></td></tr>';
    }).join("");
  }
  function refreshSummary(){
    const s=summarize(),el=$("#tsSummary");if(!el)return;
    el.innerHTML=card("Horas previstas",fmt(s.planned))+card("Horas trabalhadas",fmt(s.worked))+card("Horas extras",fmt(s.extra))+card("Atrasos",fmt(s.late))+card("Adicional noturno (horas reais)",fmt(s.night))+card("Redução noturna",fmt(s.nightExtra))+card("Faltas",String(s.absences))+card("Atestados",String(s.medical));
    const p=payrollSummary(),details=$("#tsPayrollValues");if(details)details.innerHTML=card("Salário-base",money(p.salary))+card("Horas extras",money(p.extraPay))+card("Adicional noturno (20%)",money(p.nightPremium))+card("Remuneração bruta estimada",money(p.gross))+card("INSS estimado",money(p.inss))+card("Líquido após INSS",money(p.net));
    const toggle=$("#tsDetailsToggle");if(toggle)toggle.hidden=!schedule.salary_enabled;
    const body=$("#tsRows");if(body)body.innerHTML=renderRows();
  }
  function renderList(){
    const list=$("#tsSaved");if(!list)return;
    list.innerHTML=records.length?'<div class="ts-saved-list">'+records.map(r=>'<button class="ts-saved-item" data-sheet="'+r.id+'"><strong>'+esc(r.employee_name)+'</strong><span>'+esc(r.company_label||accessCompanies.find(c=>c.id===r.company_id)?.trade_name||"Empresa")+'</span><small>'+r.period_start.split("-").reverse().join("/")+' a '+r.period_end.split("-").reverse().join("/")+'</small></button>').join("")+'</div>':'<p class="muted">Ainda não existem cálculos salvos para este acesso.</p>';
  }
  async function loadRecords(){
    let q=db.from("timesheet_sheets").select("*").order("period_start",{ascending:false});
    if(!isAdmin())q=q.eq("analyst_id",authUser.id);
    const {data,error}=await q;
    if(error){toastMsg("Não foi possível carregar os cálculos: "+error.message);return}
    records=data||[];renderList();
  }
  async function loadAnalysts(){
    if(!isAdmin())return;
    const {data,error}=await db.from("profiles").select("id,full_name").eq("role","analyst").eq("active",true).order("full_name");
    if(error){toastMsg("Não foi possível carregar os analistas: "+error.message);return}
    analysts=data||[];
    const sel=$("#tsOwner");if(sel)sel.innerHTML='<option value="">Selecione o analista</option>'+analysts.map(a=>'<option value="'+a.id+'">'+esc(a.full_name)+'</option>').join("");
  }
  function setActiveCompany(id){
    const co=accessCompanies.find(x=>x.id===id);if(!co)return;
    state.companyId=co.id;state.company=co.trade_name||co.legal_name;
    const sw=$("#companySwitcher");if(sw)sw.value=co.id;
    updateCompanyHeader();const label=document.querySelector(".active-company-bar strong");if(label)label.textContent=state.company;
  }
  function fresh(){
    current=null;editing=true;days={};schedule=defaultConfig();config=defaultRates();
    const co=activeCompany();companyId=co?.id||"";companyLabel=co?.trade_name||co?.legal_name||"";companyMode="registered";ownerId=isAdmin()?"":authUser.id;
    $("#tsEmployee").value="";$("#tsStart").value=iso(monthStart);$("#tsEnd").value=iso(monthEnd);
    $("#tsMonthlyHours").value=220;$("#tsWeeklyHours").value=44;$("#tsSalaryEnabled").value="no";$("#tsSalary").value="";$("#tsSalaryWrap").hidden=true;schedule=defaultConfig();
    $("#tsRateWeekday").value=50;$("#tsRateSaturday").value=50;$("#tsRateSunday").value=100;$("#tsRateHoliday").value=100;
    $("#tsCompanyMode").value="registered";$("#tsCompany").value=companyId;$("#tsCompanyName").value="";$("#tsCompanyNameWrap").hidden=true;$("#tsCompanySelectWrap").hidden=false;if(companyId)setActiveCompany(companyId);if(isAdmin())$("#tsOwner").value="";
    refreshSummary();$("#tsEditor").hidden=false;$("#tsDelete").hidden=true;
  }
  function readConfig(){
    const monthly=Math.max(0,Number($("#tsMonthlyHours")?.value||220))*60,weekly=Math.max(0,Number($("#tsWeeklyHours")?.value||44))*60;
    schedule={type:"personalizado",monthly_minutes:monthly,weekly_minutes:weekly,salary_enabled:$("#tsSalaryEnabled")?.value==="yes",base_salary:Math.max(0,Number($("#tsSalary")?.value||0))};
    config={weekday:Number($("#tsRateWeekday").value)||0,saturday:Number($("#tsRateSaturday").value)||0,sunday:Number($("#tsRateSunday").value)||0,holiday:Number($("#tsRateHoliday").value)||0};
    companyMode=$("#tsCompanyMode")?.value||"registered";companyId=companyMode==="registered"?$("#tsCompany").value:"";companyLabel=companyMode==="registered"?(accessCompanies.find(c=>c.id===companyId)?.trade_name||accessCompanies.find(c=>c.id===companyId)?.legal_name||""):(($("#tsCompanyName")?.value||"").trim());ownerId=isAdmin()?$("#tsOwner").value:authUser.id;
  }
  function fillEditor(row){
    current=row;editing=true;days=row.day_entries||{};companyMode=row.company_id?"registered":"adhoc";companyLabel=row.company_label||"";schedule=row.schedule_config||defaultConfig();if(!schedule.type)schedule.type="personalizado";config=row.overtime_config||defaultRates();
    if(schedule.days&&!schedule.weekly_minutes){schedule.weekly_minutes=2640;schedule.monthly_minutes=13200;schedule.weekend_enabled=true;schedule.weekend_days=[6];schedule.weekend_minutes=Number(schedule.days[6]||0);}
    $("#tsEmployee").value=row.employee_name;$("#tsStart").value=row.period_start;$("#tsEnd").value=row.period_end;
    $("#tsMonthlyHours").value=Math.round(Number(schedule.monthly_minutes??13200)/60);$("#tsWeeklyHours").value=Math.round(Number(schedule.weekly_minutes??2640)/60);$("#tsSalaryEnabled").value=schedule.salary_enabled?"yes":"no";$("#tsSalaryWrap").hidden=!schedule.salary_enabled;$("#tsSalary").value=schedule.base_salary||"";
    $("#tsRateWeekday").value=config.weekday;$("#tsRateSaturday").value=config.saturday;$("#tsRateSunday").value=config.sunday;$("#tsRateHoliday").value=config.holiday;
    $("#tsCompanyMode").value=companyMode;$("#tsCompany").value=row.company_id||"";$("#tsCompanyName").value=companyMode==="adhoc"?companyLabel:"";$("#tsCompanySelectWrap").hidden=companyMode==="adhoc";$("#tsCompanyNameWrap").hidden=companyMode!=="adhoc";if(row.company_id)setActiveCompany(row.company_id);if(isAdmin())$("#tsOwner").value=row.analyst_id;
    $("#tsDelete").hidden=false;$("#tsEditor").hidden=false;refreshSummary();$("#tsEditor").scrollIntoView({behavior:"smooth",block:"start"});
  }
  function getExportData(){
    readConfig();
    const start=$("#tsStart").value,end=$("#tsEnd").value;
    const company=companyMode==="adhoc"?companyLabel:(accessCompanies.find(c=>c.id===companyId)?.trade_name||accessCompanies.find(c=>c.id===companyId)?.legal_name||"Empresa");
    const owner=analysts.find(a=>a.id===ownerId)?.full_name||authProfile?.full_name||"KR Contábil";
    const summary=summarize();
    const rows=dates(start,end).map(d=>{
      const e=days[d]||{status:"work",marks:["","","",""],note:""};
      const r=computeDay(d,e),m=e.marks||["","","",""];
      return {Data:d.split("-").reverse().join("/"),Dia:daysNames[weekday(d)],Situação:statusNames[e.status||"work"],Entrada:m[0]||"","Saída intervalo":m[1]||"",Retorno:m[2]||"",Saída:m[3]||"","Horas trabalhadas":fmt(r.worked),"Horas extras":fmt(r.extra),"Percentual HE":r.rate+"%","Atrasos":fmt(r.late),"Horas noturnas":fmt(r.night),"Redução noturna":fmt(r.nightExtra),Observações:e.note||""};
    });
    return {company,name:$("#tsEmployee").value.trim(),start,end,owner,summary,rows};
  }
  function exportExcel(){
    const d=getExportData(),pay=payrollSummary();
    const meta=[["PONTO.COM — KR ASSESSORIA CONTÁBIL"],["Empresa",d.company],["Funcionário",d.name],["Período",d.start.split("-").reverse().join("/")+" a "+d.end.split("-").reverse().join("/")],["Responsável",d.owner],[],["RESUMO"],["Horas previstas",fmt(d.summary.planned)],["Horas trabalhadas",fmt(d.summary.worked)],["Horas extras",fmt(d.summary.extra)],["Atrasos",fmt(d.summary.late)],["Horas noturnas",fmt(d.summary.night)],["Redução noturna",fmt(d.summary.nightExtra)],["Faltas",d.summary.absences],["Atestados",d.summary.medical],...(schedule.salary_enabled?[[],["DETALHES DA FOLHA"],["Salário-base",money(pay.salary)],["Horas extras",money(pay.extraPay)],["Adicional noturno",money(pay.nightPremium)],["Remuneração bruta",money(pay.gross)],["INSS estimado",money(pay.inss)],["Líquido após INSS",money(pay.net)]]:[]),[],["DETALHAMENTO DIÁRIO"]];
    const headers=Object.keys(d.rows[0]||{Data:"Data"});
    if(window.XLSX){
      const wb=XLSX.utils.book_new();
      const ws=XLSX.utils.aoa_to_sheet([...meta,headers,...d.rows.map(row=>headers.map(h=>row[h]))]);
      ws["!cols"]=headers.map(h=>({wch:Math.max(13,h.length+3)}));
      XLSX.utils.book_append_sheet(wb,ws,"Folha de ponto");
      const safe=(d.name||"funcionario").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/gi,"_");
      XLSX.writeFile(wb,"Folha_de_ponto_"+safe+".xlsx");
    }else{
      const csv="\uFEFF"+[...meta,headers,...d.rows.map(row=>headers.map(h=>row[h]))].map(row=>row.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(";")).join("\r\n");
      const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
      const a=document.createElement("a");a.href=url;a.download="Folha_de_ponto.csv";a.click();URL.revokeObjectURL(url);
      toastMsg("Arquivo compatível com Excel exportado em CSV.");
    }
  }
  function exportPdf(){
    const d=getExportData(),w=window.open("","_blank");
    if(!w){toastMsg("Permita a abertura de pop-ups para gerar o PDF.");return}
    const headers=Object.keys(d.rows[0]||{Data:"Data"});
    const th=headers.map(h=>"<th>"+esc(h)+"</th>").join("");
    const body=d.rows.map(row=>"<tr>"+headers.map(h=>"<td>"+esc(row[h])+"</td>").join("")+"</tr>").join("");
    const period=d.start.split("-").reverse().join("/")+" a "+d.end.split("-").reverse().join("/");
    let html='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Folha de ponto</title><style>';
    html+='body{font:10px Arial,sans-serif;color:#24131a;margin:22px}h1{font-size:20px;color:#681b39;margin:0 0 5px}.brand{font-weight:bold;color:#681b39;font-size:12px;margin-bottom:16px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:7px 18px;margin:16px 0;padding:12px;background:#f7f1f3;border:1px solid #e6d8de}.summary{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0 18px}.summary span{padding:7px;border:1px solid #e6d8de;border-radius:5px}table{width:100%;border-collapse:collapse;font-size:8px}th{background:#681b39;color:white}th,td{border:1px solid #d9cdd2;padding:5px;text-align:left}tr:nth-child(even){background:#faf7f8}.sign{display:flex;gap:50px;margin-top:55px}.sign div{flex:1;border-top:1px solid #555;text-align:center;padding-top:7px}@page{size:landscape;margin:12mm}@media print{body{margin:0}}';
    html+='</style></head><body><div class="brand">KR ASSESSORIA CONTÁBIL · PONTO.COM</div><h1>Folha de ponto</h1><div class="meta"><div><b>Empresa:</b> '+esc(d.company)+'</div><div><b>Funcionário:</b> '+esc(d.name)+'</div><div><b>Período:</b> '+esc(period)+'</div><div><b>Responsável:</b> '+esc(d.owner)+'</div></div><h3>Resumo do período</h3><div class="summary"><span>Previstas: '+fmt(d.summary.planned)+'</span><span>Trabalhadas: '+fmt(d.summary.worked)+'</span><span>Extras: '+fmt(d.summary.extra)+'</span><span>Atrasos: '+fmt(d.summary.late)+'</span><span>Noturnas: '+fmt(d.summary.night)+'</span><span>Faltas: '+d.summary.absences+'</span><span>Atestados: '+d.summary.medical+'</span></div>'+(schedule.salary_enabled?'<h3>Detalhes da folha</h3><div class="summary"><span>Salário-base: '+money(payrollSummary().salary)+'</span><span>Horas extras: '+money(payrollSummary().extraPay)+'</span><span>Adicional noturno: '+money(payrollSummary().nightPremium)+'</span><span>Bruto: '+money(payrollSummary().gross)+'</span><span>INSS: '+money(payrollSummary().inss)+'</span><span>Líquido após INSS: '+money(payrollSummary().net)+'</span></div>':'')+'<table><thead><tr>'+th+'</tr></thead><tbody>'+body+'</tbody></table><div class="sign"><div>Assinatura do funcionário</div><div>Responsável pela empresa</div></div><script>window.onload=()=>setTimeout(()=>window.print(),300)<'+'/script></body></html>';
    w.document.write(html);w.document.close();
  }

  function viewHtml(){
    const co=activeCompany();
    const companies=isAdmin()?accessCompanies:accessCompanies;
    const companySelect=companies.map(c=>'<option value="'+c.id+'">'+esc(c.trade_name||c.legal_name)+'</option>').join("");
    return '<div class="page-heading"><div><p class="eyebrow">DEPARTAMENTO PESSOAL</p><h1>Cálculo de Folha de Ponto</h1><p>Apure jornadas, horas extras, faltas, atestados e adicional noturno.</p></div><div class="ts-head-actions">'+'<button class="btn primary" id="tsNew">＋ Novo cálculo</button></div></div>'+
    '<section class="panel ts-intro"><strong>Área individual de trabalho</strong><p>'+ (isAdmin()?"A KR pode consultar os cálculos de todos os analistas.":"Seus cálculos ficam privados e somente a KR administradora pode consultá-los.")+'</p></section>'+
    '<section class="panel"><div class="panel-heading"><div><h2>Cálculos salvos</h2><p>Selecione um cálculo para continuar a edição.</p></div><button class="btn" id="tsReload">Atualizar</button></div><div id="tsSaved" class="ts-saved"></div></section>'+
    '<section id="tsEditor" class="panel ts-editor" hidden><div class="panel-heading"><div><h2>Dados do cálculo</h2><p>Informe funcionário, empresa, período e regras da jornada.</p></div><button class="btn" id="tsClose">Fechar</button></div>'+
    '<div class="ts-form">'+(isAdmin()?'<label>Analista responsável<select id="tsOwner"><option value="">Selecione o analista</option></select></label>':'')+
    '<label>A empresa é cadastrada?<select id="tsCompanyMode"><option value="registered">Sim, está cadastrada</option><option value="adhoc">Não, é uma empresa avulsa</option></select></label><label id="tsCompanySelectWrap">Empresa cadastrada<select id="tsCompany">'+companySelect+'</select></label><label id="tsCompanyNameWrap" hidden>Nome da empresa avulsa<input id="tsCompanyName" maxlength="180" placeholder="Digite o nome da empresa"></label><label>Funcionário<input id="tsEmployee" maxlength="140" placeholder="Nome completo do funcionário"></label><label>Data inicial<input id="tsStart" type="date" value="'+iso(monthStart)+'"></label><label>Data final<input id="tsEnd" type="date" value="'+iso(monthEnd)+'"></label>'+
    '<label>Carga horária mensal<input id="tsMonthlyHours" type="number" min="1" step="0.01" value="220"></label><label>Carga horária semanal<input id="tsWeeklyHours" type="number" min="1" step="0.01" value="44"></label><label>Quer calcular com o salário?<select id="tsSalaryEnabled"><option value="no">Não</option><option value="yes">Sim</option></select></label><label id="tsSalaryWrap" hidden>Salário-base (R$)<input id="tsSalary" type="number" min="0" step="0.01" placeholder="Ex.: 2500,00"></label></div>'+
    '<h3 class="ts-subtitle">Percentuais de horas extras</h3><div class="ts-form ts-rates"><label>Dias úteis (%)<input id="tsRateWeekday" type="number" min="0" max="300" value="50"></label><label>Sábado (%)<input id="tsRateSaturday" type="number" min="0" max="300" value="50"></label><label>Domingo (%)<input id="tsRateSunday" type="number" min="0" max="300" value="100"></label><label>Feriado (%)<input id="tsRateHoliday" type="number" min="0" max="300" value="100"></label></div>'+
    '<p class="ts-note-info">O adicional noturno é apurado automaticamente entre 22h e 5h, com hora reduzida de 52min30s. A apuração considera os horários informados.</p>'+
    '<div id="tsSummary" class="ts-kpis"></div><button type="button" id="tsDetailsToggle" class="ts-detail-card" hidden><small>Detalhes da folha</small><strong>Toque para visualizar os valores calculados</strong></button><section id="tsPayrollDetails" class="ts-payroll-details" hidden><div class="panel-heading"><div><h3>Detalhes da folha</h3><p>Estimativa da remuneração e do desconto previdenciário.</p></div></div><div id="tsPayrollValues" class="ts-kpis"></div><p class="ts-note-info">Estimativa com base no salário informado, horas extras e adicional noturno de 20%. O INSS usa a tabela progressiva de 2026 e o teto previdenciário. Não inclui DSR sobre extras, IRRF, dependentes, outros descontos, múltiplos vínculos ou particularidades de convenção coletiva.</p></section><div class="ts-table-wrap"><table class="ts-table"><thead><tr><th>Data</th><th>Dia</th><th>Situação</th><th>Entrada</th><th>Saída intervalo</th><th>Retorno</th><th>Saída</th><th>Trabalhadas</th><th>Extras</th><th>Atrasos</th><th>Noturnas</th><th>Observação</th></tr></thead><tbody id="tsRows"></tbody></table></div>'+
    '<div class="ts-actions"><button class="btn" id="tsDelete" hidden>Excluir cálculo</button><button class="btn" id="tsExportPdf">Exportar PDF</button><button class="btn" id="tsExportExcel">Exportar Excel</button><button class="btn primary" id="tsSave">Salvar cálculo</button></div></section>';
  }
  function show(){
    $("#content").innerHTML='<div class="active-company-bar"><span class="active-company-dot"></span><span class="company-context-label">Empresa ativa: <strong>'+esc(state.company)+'</strong></span></div>'+viewHtml();
    renderList();loadRecords();if(isAdmin())loadAnalysts();
  }
  const oldRender=render;
  render=function(){
    if(authUser&&state.view==="timesheets"){
      $("#loginScreen").hidden=true;$("#appShell").hidden=false;
      $("#accessNav").hidden=authProfile?.role!=="kr_admin";
      updateCompanyHeader();
      document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view==="timesheets"));
      $("#pageCrumb")&&($("#pageCrumb").textContent="Cálculo de Folha de Ponto");
      show();return;
    }
    oldRender();
  };
  function recalcFromInputs(){
    readConfig();refreshSummary();
  }
  document.addEventListener("click",async e=>{
    if(e.target.closest("#tsDetailsToggle")){$("#tsPayrollDetails").hidden=!$("#tsPayrollDetails").hidden;return}
    if(e.target.closest("#tsExportPdf")){exportPdf();return}
    if(e.target.closest("#tsExportExcel")){exportExcel();return}
    if(e.target.closest("#tsNew")){fresh();return}
    if(e.target.closest("#tsClose")){$("#tsEditor").hidden=true;return}
    if(e.target.closest("#tsReload")){loadRecords();return}
    const item=e.target.closest("[data-sheet]");if(item){const row=records.find(r=>r.id===item.dataset.sheet);if(row)fillEditor(row);return}
    if(e.target.closest("#tsSave")){
      readConfig();const name=$("#tsEmployee").value.trim(),start=$("#tsStart").value,end=$("#tsEnd").value;
      if(schedule.monthly_minutes<=0||schedule.weekly_minutes<=0){toastMsg("Informe uma carga horária mensal e semanal válida.");return}
      if(schedule.salary_enabled&&schedule.base_salary<=0){toastMsg("Informe o salário-base para calcular os valores da folha.");return}
      if((companyMode==="registered"&&!companyId)||(companyMode==="adhoc"&&!companyLabel)||!ownerId||!name||!start||!end||end<start){toastMsg("Preencha analista, empresa, funcionário e um período válido.");return}
      if(isAdmin()&&companyMode==="registered"){const {data:link,error:linkError}=await db.from("analyst_company_access").select("id").eq("analyst_id",ownerId).eq("company_id",companyId).maybeSingle();if(linkError||!link){toastMsg("Essa empresa ainda não está vinculada à cartela do analista selecionado. Ajuste as permissões antes de salvar.");return}}
      if(dates(start,end).length>=400){toastMsg("O período máximo é de 399 dias.");return}
      const payload={analyst_id:ownerId,company_id:companyId||null,company_label:companyMode==="adhoc"?companyLabel:null,employee_name:name,period_start:start,period_end:end,schedule_config:schedule,overtime_config:config,day_entries:days};
      const btn=$("#tsSave");btn.disabled=true;btn.textContent="Salvando...";
      const result=current?await db.from("timesheet_sheets").update(payload).eq("id",current.id).select().single():await db.from("timesheet_sheets").insert(payload).select().single();
      btn.disabled=false;btn.textContent="Salvar cálculo";
      if(result.error){toastMsg("Não foi possível salvar: "+result.error.message);return}
      current=result.data;toastMsg("Cálculo salvo com sucesso.");await loadRecords();return;
    }
    if(e.target.closest("#tsDelete")&&current){
      if(!confirm("Excluir este cálculo e todos os lançamentos deste período?"))return;
      const {error}=await db.from("timesheet_sheets").delete().eq("id",current.id);
      if(error){toastMsg("Não foi possível excluir: "+error.message);return}
      toastMsg("Cálculo excluído.");$("#tsEditor").hidden=true;current=null;await loadRecords();return;
    }
  });
  document.addEventListener("change",e=>{
    const t=e.target;
    if(t.matches(".ts-time")){const d=t.dataset.date,k=Number(t.dataset.mark);days[d]=days[d]||{status:"work",marks:["","","",""],note:""};days[d].marks=days[d].marks||["","","",""];days[d].marks[k]=t.value;refreshSummary();return}
    if(t.matches(".ts-status")){const d=t.dataset.date;days[d]=days[d]||{status:"work",marks:["","","",""],note:""};days[d].status=t.value;refreshSummary();return}
    if(t.matches(".ts-note")){const d=t.dataset.date;days[d]=days[d]||{status:"work",marks:["","","",""],note:""};days[d].note=t.value;return}
    if(t.id==="tsSalaryEnabled"){$("#tsSalaryWrap").hidden=t.value!=="yes";recalcFromInputs();return;}if(t.id==="tsCompany"){setActiveCompany(t.value);readConfig();return;}if(t.id==="tsCompanyMode"){companyMode=t.value;$("#tsCompanySelectWrap").hidden=companyMode!=="registered";$("#tsCompanyNameWrap").hidden=companyMode!=="adhoc";readConfig();return;}if(t.id&&t.id.startsWith("ts")){recalcFromInputs()}
  });
  document.addEventListener("input",e=>{
    const t=e.target;if(t.matches(".ts-note")){const d=t.dataset.date;days[d]=days[d]||{status:"work",marks:["","","",""],note:""};days[d].note=t.value}
    else if(t.id&&t.id.startsWith("ts")&&t.id!=="tsRows")recalcFromInputs();
  });
  document.addEventListener("DOMContentLoaded",()=>{});
  const nav=document.createElement("button");nav.className="nav-item";nav.dataset.view="timesheets";nav.innerHTML='<span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/><path d="M17.5 4.8 19 3.5"/></svg></span> Cálculo de ponto <b>›</b>';
  const accessNav=$("#accessNav");if(accessNav)accessNav.parentNode.insertBefore(nav,accessNav);
  else $("#nav")?.appendChild(nav);
})();