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
  let companyOptions=[];
  const isAdmin=()=>authProfile?.role==="kr_admin";
  const activeCompany=()=>accessCompanies.find(c=>c.id===(state.companyId||$("#companySwitcher")?.value));
  const toastMsg=m=>{if(typeof toast==="function")toast(m);else alert(m)};
  const defaultConfig=()=>({weekday:480,saturday:0,sunday:0});
  const defaultRates=()=>({weekday:50,saturday:50,sunday:100,holiday:100});
  function duration(start,end){let a=parse(start),b=parse(end);if(a==null||b==null)return 0;if(b<a)b+=1440;return b-a}
  function overlaps(a,b,lo,hi){return Math.max(0,Math.min(b,hi)-Math.max(a,lo))}
  function computeDay(date,entry){
    const st=entry.status||"work",wd=weekday(date),planned=st==="work"?(wd===0?schedule.sunday:wd===6?schedule.saturday:schedule.weekday):0;
    const marks=entry.marks||["","","",""];
    let worked=0;
    if(marks[0]&&marks[3]){
      if(marks[1]&&marks[2])worked=duration(marks[0],marks[1])+duration(marks[2],marks[3]);
      else worked=duration(marks[0],marks[3]);
    }
    let night=0;
    for(let i=0;i<4;i+=2){
      const a=parse(marks[i]),b=parse(marks[i+1]);
      if(a==null||b==null)continue;
      const end=b<a?b+1440:b;
      night+=overlaps(a,end,1320,1440)+overlaps(a,end,1440,1740)+overlaps(a,end,2760,2880);
    }
    const nightExtra=Math.round(night/7);
    const counted=worked+nightExtra;
    const extra=Math.max(0,counted-planned);
    const late=Math.max(0,planned-counted);
    const rateKey=st==="holiday"?"holiday":wd===0?"sunday":wd===6?"saturday":"weekday";
    const rate=Number(config[rateKey]??50);
    const attested=st==="medical";
    return {planned,worked,counted,extra,late,night,nightExtra,rate,rateKey,extraValue:extra*rate/100,absence:st==="absence"?1:0,attested};
  }
  function summarize(){
    const s={planned:0,worked:0,extra:0,late:0,night:0,nightExtra:0,absences:0,medical:0,off:0,vacation:0,leave:0,holiday:0,comp:0,extra50:0,extra60:0,extra100:0};
    dates($("#tsStart")?.value||iso(monthStart),$("#tsEnd")?.value||iso(monthEnd)).forEach(d=>{
      const e=days[d]||{status:"work",marks:["","","",""]};const r=computeDay(d,e);s.planned+=r.planned;s.worked+=r.worked;s.extra+=r.extra;s.late+=r.late;s.night+=r.night;s.nightExtra+=r.nightExtra;s.absences+=r.absence;
      if(r.attested)s.medical++;
      if(e.status==="off")s.off++;if(e.status==="vacation")s.vacation++;if(e.status==="leave")s.leave++;if(e.status==="holiday")s.holiday++;if(e.status==="comp")s.comp++;
      if(r.rate===50)s.extra50+=r.extra;if(r.rate===60)s.extra60+=r.extra;if(r.rate>=100)s.extra100+=r.extra;
    });return s;
  }
  function card(label,value){return '<div class="ts-kpi"><small>'+label+'</small><strong>'+value+'</strong></div>'}
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
    const body=$("#tsRows");if(body)body.innerHTML=renderRows();
  }
  function renderList(){
    const list=$("#tsSaved");if(!list)return;
    list.innerHTML=records.length?'<div class="ts-saved-list">'+records.map(r=>'<button class="ts-saved-item" data-sheet="'+r.id+'"><strong>'+esc(r.employee_name)+'</strong><span>'+esc(r.company_label||companyOptions.find(c=>c.id===r.company_id)?.trade_name||"Empresa")+'</span><small>'+r.period_start.split("-").reverse().join("/")+' a '+r.period_end.split("-").reverse().join("/")+'</small></button>').join("")+'</div>':'<p class="muted">Ainda não existem cálculos salvos para este acesso.</p>';
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
  function fresh(){
    current=null;editing=true;days={};schedule=defaultConfig();config=defaultRates();
    const co=activeCompany();companyId=co?.id||"";ownerId=isAdmin()?"":authUser.id;
    $("#tsEmployee").value="";$("#tsStart").value=iso(monthStart);$("#tsEnd").value=iso(monthEnd);
    $("#tsWeekday").value="08:00";$("#tsSaturday").value="00:00";$("#tsSunday").value="00:00";
    $("#tsRateWeekday").value=50;$("#tsRateSaturday").value=50;$("#tsRateSunday").value=100;$("#tsRateHoliday").value=100;
    $("#tsCompany").value=companyId;if(isAdmin())$("#tsOwner").value="";
    refreshSummary();$("#tsEditor").hidden=false;$("#tsDelete").hidden=true;
  }
  function readConfig(){
    schedule={weekday:parse($("#tsWeekday").value)||0,saturday:parse($("#tsSaturday").value)||0,sunday:parse($("#tsSunday").value)||0};
    config={weekday:Number($("#tsRateWeekday").value)||0,saturday:Number($("#tsRateSaturday").value)||0,sunday:Number($("#tsRateSunday").value)||0,holiday:Number($("#tsRateHoliday").value)||0};
    companyId=$("#tsCompany").value;ownerId=isAdmin()?$("#tsOwner").value:authUser.id;
  }
  function fillEditor(row){
    current=row;editing=true;days=row.day_entries||{};schedule=row.schedule_config||defaultConfig();config=row.overtime_config||defaultRates();
    $("#tsEmployee").value=row.employee_name;$("#tsStart").value=row.period_start;$("#tsEnd").value=row.period_end;
    $("#tsWeekday").value=fmt(schedule.weekday);$("#tsSaturday").value=fmt(schedule.saturday);$("#tsSunday").value=fmt(schedule.sunday);
    $("#tsRateWeekday").value=config.weekday;$("#tsRateSaturday").value=config.saturday;$("#tsRateSunday").value=config.sunday;$("#tsRateHoliday").value=config.holiday;
    $("#tsCompany").value=row.company_id;if(isAdmin())$("#tsOwner").value=row.analyst_id;
    $("#tsDelete").hidden=false;$("#tsEditor").hidden=false;refreshSummary();$("#tsEditor").scrollIntoView({behavior:"smooth",block:"start"});
  }
  function viewHtml(){
    const co=activeCompany();
    const companies=isAdmin()?accessCompanies:accessCompanies;
    const companySelect=companies.map(c=>'<option value="'+c.id+'">'+esc(c.trade_name||c.legal_name)+'</option>').join("");
    return '<div class="page-heading"><div><p class="eyebrow">DEPARTAMENTO PESSOAL</p><h1>Cálculo de Folha de Ponto</h1><p>Apure jornadas, horas extras, faltas, atestados e adicional noturno.</p></div><button class="btn primary" id="tsNew">＋ Novo cálculo</button></div>'+
    '<section class="panel ts-intro"><strong>Área individual de trabalho</strong><p>'+ (isAdmin()?"A KR pode consultar os cálculos de todos os analistas.":"Seus cálculos ficam privados e somente a KR administradora pode consultá-los.")+'</p></section>'+
    '<section class="panel"><div class="panel-heading"><div><h2>Cálculos salvos</h2><p>Selecione um cálculo para continuar a edição.</p></div><button class="btn" id="tsReload">Atualizar</button></div><div id="tsSaved" class="ts-saved"></div></section>'+
    '<section id="tsEditor" class="panel ts-editor" hidden><div class="panel-heading"><div><h2>Dados do cálculo</h2><p>Informe funcionário, empresa, período e regras da jornada.</p></div><button class="btn" id="tsClose">Fechar</button></div>'+
    '<div class="ts-form">'+(isAdmin()?'<label>Analista responsável<select id="tsOwner"><option value="">Selecione o analista</option></select></label>':'')+
    '<label>Empresa<select id="tsCompany">'+companySelect+'</select></label><label>Funcionário<input id="tsEmployee" maxlength="140" placeholder="Nome completo do funcionário"></label><label>Data inicial<input id="tsStart" type="date" value="'+iso(monthStart)+'"></label><label>Data final<input id="tsEnd" type="date" value="'+iso(monthEnd)+'"></label>'+
    '<label>Carga diária (seg. a sex.)<input id="tsWeekday" type="time" value="08:00"></label><label>Carga sábado<input id="tsSaturday" type="time" value="00:00"></label><label>Carga domingo<input id="tsSunday" type="time" value="00:00"></label></div>'+
    '<h3 class="ts-subtitle">Percentuais de horas extras</h3><div class="ts-form ts-rates"><label>Dias úteis (%)<input id="tsRateWeekday" type="number" min="0" max="300" value="50"></label><label>Sábado (%)<input id="tsRateSaturday" type="number" min="0" max="300" value="50"></label><label>Domingo (%)<input id="tsRateSunday" type="number" min="0" max="300" value="100"></label><label>Feriado (%)<input id="tsRateHoliday" type="number" min="0" max="300" value="100"></label></div>'+
    '<p class="ts-note-info">O adicional noturno é apurado automaticamente entre 22h e 5h, com hora reduzida de 52min30s. A apuração considera os horários informados.</p>'+
    '<div id="tsSummary" class="ts-kpis"></div><div class="ts-table-wrap"><table class="ts-table"><thead><tr><th>Data</th><th>Dia</th><th>Situação</th><th>Entrada</th><th>Saída intervalo</th><th>Retorno</th><th>Saída</th><th>Trabalhadas</th><th>Extras</th><th>Atrasos</th><th>Noturnas</th><th>Observação</th></tr></thead><tbody id="tsRows"></tbody></table></div>'+
    '<div class="ts-actions"><button class="btn" id="tsDelete" hidden>Excluir cálculo</button><button class="btn primary" id="tsSave">Salvar cálculo</button></div></section>';
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
    if(e.target.closest("#tsNew")){fresh();return}
    if(e.target.closest("#tsClose")){$("#tsEditor").hidden=true;return}
    if(e.target.closest("#tsReload")){loadRecords();return}
    const item=e.target.closest("[data-sheet]");if(item){const row=records.find(r=>r.id===item.dataset.sheet);if(row)fillEditor(row);return}
    if(e.target.closest("#tsSave")){
      readConfig();const name=$("#tsEmployee").value.trim(),start=$("#tsStart").value,end=$("#tsEnd").value;
      if(!companyId||!ownerId||!name||!start||!end||end<start){toastMsg("Preencha analista, empresa, funcionário e um período válido.");return}
      if(dates(start,end).length>=400){toastMsg("O período máximo é de 399 dias.");return}
      const payload={analyst_id:ownerId,company_id:companyId,employee_name:name,period_start:start,period_end:end,schedule_config:schedule,overtime_config:config,day_entries:days};
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
    if(t.id&&t.id.startsWith("ts")){recalcFromInputs()}
  });
  document.addEventListener("input",e=>{
    const t=e.target;if(t.matches(".ts-note")){const d=t.dataset.date;days[d]=days[d]||{status:"work",marks:["","","",""],note:""};days[d].note=t.value}
    else if(t.id&&t.id.startsWith("ts")&&t.id!=="tsRows")recalcFromInputs();
  });
  document.addEventListener("DOMContentLoaded",()=>{});
  const nav=document.createElement("button");nav.className="nav-item";nav.dataset.view="timesheets";nav.innerHTML='<span>◷</span> Cálculo de ponto <b>›</b>';
  const accessNav=$("#accessNav");if(accessNav)accessNav.parentNode.insertBefore(nav,accessNav);
  else $("#nav")?.appendChild(nav);
})();