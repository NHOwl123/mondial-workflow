import { useState, useMemo } from "react";
import * as XLSX from "xlsx";

const TEAL = "#1a7f8e";
const TEAL_DARK = "#145f6b";
const TEAL_LIGHT = "#e8f4f6";

const STATUS_META = {
  "not-started": { bg:"#e2d9f3",color:"#4a235a",border:"#9b59b6",label:"Not Started" },
  active:        { bg:"#cce5ff",color:"#004085",border:"#0066cc",label:"Active" },
  inactive:      { bg:"#e9ecef",color:"#495057",border:"#ced4da",label:"Inactive" },
  closed:        { bg:"#d4edda",color:"#155724",border:"#28a745",label:"Closed" },
  overdue:       { bg:"#f8d7da",color:"#721c24",border:"#dc3545",label:"Overdue" },
};

function StatusPill({ status }) {
  const s = STATUS_META[status] || STATUS_META["not-started"];
  return <span style={{ fontSize:10,padding:"2px 8px",borderRadius:10,background:s.bg,color:s.color,border:`1px solid ${s.border}`,fontWeight:700,whiteSpace:"nowrap" }}>{s.label}</span>;
}

function KpiCard({ label, value, sub, color }) {
  return (
    <div style={{ background:"#fff",borderRadius:12,padding:"18px 22px",border:"1px solid #e9ecef",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",flex:1,minWidth:130 }}>
      <div style={{ fontSize:28,fontWeight:800,color:color||TEAL_DARK }}>{value}</div>
      <div style={{ fontSize:12,fontWeight:600,color:"#495057",marginTop:4 }}>{label}</div>
      {sub && <div style={{ fontSize:11,color:"#6c757d",marginTop:3 }}>{sub}</div>}
    </div>
  );
}

function getEffectiveStatus(p) {
  if (p.status === "active") {
    const daysLeft = Math.ceil((new Date(p.targetDate) - new Date()) / 86400000);
    if (daysLeft < 0) return "overdue";
  }
  return p.status;
}

function HoursBar({ used, po }) {
  const pct = po > 0 ? Math.min((used/po)*100,100) : 0;
  const over = used > po;
  return (
    <div style={{ background:"#e9ecef",borderRadius:4,height:6 }}>
      <div style={{ width:`${pct}%`,height:"100%",background:over?"#dc3545":pct>75?"#ffc107":TEAL,borderRadius:4,transition:"width 0.3s" }} />
    </div>
  );
}

// ── Project Card ──────────────────────────────────────────────────────────────
function ProjectCard({ project, customer, oem, consultants, onClick }) {
  const totalUsed = project.categories.reduce((s,c)=>s+(c.usedHours||0),0);
  const pct = project.poHours>0?Math.round((totalUsed/project.poHours)*100):0;
  const lead = consultants.find(u=>u.id===project.leadConsultantId);
  const nextMs = project.milestones.find(m=>m.status!=="complete");
  const effStatus = getEffectiveStatus(project);
  const today = new Date();
  const daysLeft = Math.ceil((new Date(project.targetDate)-today)/86400000);
  const hoursOver = totalUsed>project.poHours;
  const barColor = effStatus==="closed"?"#28a745":effStatus==="inactive"?"#ced4da":effStatus==="overdue"?"#dc3545":TEAL;

  return (
    <div onClick={onClick} style={{ background:"#fff",borderRadius:14,padding:20,border:`1px solid ${effStatus==="overdue"?"#dc3545":"#e9ecef"}`,boxShadow:"0 2px 12px rgba(0,0,0,0.07)",cursor:"pointer",transition:"all 0.15s",position:"relative",overflow:"hidden" }}
      onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 24px rgba(0,0,0,0.13)"}
      onMouseLeave={e=>e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.07)"}>
      <div style={{ position:"absolute",top:0,left:0,right:0,height:4,background:barColor }} />
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
        <div style={{ flex:1,paddingRight:10 }}>
          <div style={{ fontWeight:700,fontSize:14,color:"#2c3e50",lineHeight:1.3 }}>{project.name}</div>
          <div style={{ fontSize:11,color:"#6c757d",marginTop:3 }}>{customer?.name} · {oem?.name}</div>
        </div>
        <StatusPill status={effStatus} />
      </div>
      {project.status!=="not-started" && (
        <div style={{ marginBottom:12 }}>
          <div style={{ display:"flex",justifyContent:"space-between",fontSize:10,color:"#6c757d",marginBottom:4 }}>
            <span>Hours: {totalUsed} / {project.poHours}</span>
            <span style={{ color:hoursOver?"#dc3545":"#6c757d",fontWeight:hoursOver?700:400 }}>{pct}%{hoursOver?" ⚠":""}</span>
          </div>
          <HoursBar used={totalUsed} po={project.poHours} />
        </div>
      )}
      <div style={{ display:"flex",gap:16,fontSize:11,color:"#6c757d" }}>
        <span>👤 {lead?.name||"Unassigned"}</span>
        {nextMs && <span>📍 {nextMs.name}</span>}
        {project.status==="active" && <span style={{ marginLeft:"auto",color:effStatus==="overdue"?"#dc3545":daysLeft<14?"#856404":"#6c757d",fontWeight:daysLeft<14?700:400 }}>
          {effStatus==="overdue"?`${Math.abs(daysLeft)}d overdue`:`${daysLeft}d left`}
        </span>}
      </div>
    </div>
  );
}

// ── List View Row ─────────────────────────────────────────────────────────────
function ProjectRow({ project, customer, oem, consultants, onClick }) {
  const totalUsed = project.categories.reduce((s,c)=>s+(c.usedHours||0),0);
  const pct = project.poHours>0?Math.round((totalUsed/project.poHours)*100):0;
  const lead = consultants.find(u=>u.id===project.leadConsultantId);
  const effStatus = getEffectiveStatus(project);
  const daysLeft = Math.ceil((new Date(project.targetDate)-new Date())/86400000);

  return (
    <tr onClick={onClick} style={{ cursor:"pointer",borderBottom:"1px solid #f0f2f4" }}
      onMouseEnter={e=>e.currentTarget.style.background="#f0f9fa"}
      onMouseLeave={e=>e.currentTarget.style.background=""}>
      <td style={{ padding:"12px 16px",fontWeight:700,color:"#2c3e50",fontSize:13 }}>
        <div>{project.name}</div>
        <div style={{ fontSize:11,color:"#6c757d",fontWeight:400,marginTop:2 }}>{customer?.name}</div>
      </td>
      <td style={{ padding:"12px 16px",fontSize:12,color:"#6c757d" }}>{oem?.name||"—"}</td>
      <td style={{ padding:"12px 16px" }}><StatusPill status={effStatus} /></td>
      <td style={{ padding:"12px 16px",fontSize:12,color:"#6c757d" }}>{lead?.name||"—"}</td>
      <td style={{ padding:"12px 16px",fontSize:12 }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <div style={{ flex:1,minWidth:80 }}><HoursBar used={totalUsed} po={project.poHours} /></div>
          <span style={{ color:totalUsed>project.poHours?"#dc3545":"#6c757d",fontSize:11,whiteSpace:"nowrap" }}>{totalUsed}/{project.poHours}h</span>
        </div>
      </td>
      <td style={{ padding:"12px 16px",fontSize:12,color:"#6c757d",textAlign:"center" }}>
        {new Date(project.targetDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
      </td>
      <td style={{ padding:"12px 16px",fontSize:12,textAlign:"center" }}>
        {project.status==="active"
          ? <span style={{ color:effStatus==="overdue"?"#dc3545":daysLeft<14?"#856404":"#28a745",fontWeight:700 }}>
              {effStatus==="overdue"?`${Math.abs(daysLeft)}d over`:`${daysLeft}d`}
            </span>
          : <span style={{ color:"#adb5bd" }}>—</span>}
      </td>
    </tr>
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────────
function MilestoneTimeline({ projects, customers, filter }) {
  const today = new Date();
  const weeks = Array.from({length:12},(_,w)=>{
    const start=new Date(today); start.setDate(start.getDate()+w*7);
    const end=new Date(start); end.setDate(end.getDate()+6);
    return { start,end,label:start.toLocaleDateString("en-GB",{day:"2-digit",month:"short"}) };
  });
  const allMs = projects.flatMap(p=>{
    if (filter!=="all" && getEffectiveStatus(p)!==filter) return [];
    const cust=customers.find(c=>c.id===p.customerId);
    return p.milestones.map(m=>({...m,projectName:p.name,customerName:cust?.name}));
  }).filter(m=>m.status!=="complete");

  return (
    <div style={{ overflow:"auto" }}>
      <table style={{ borderCollapse:"collapse",minWidth:"100%",fontSize:11 }}>
        <thead><tr>
          <th style={{ padding:"8px 12px",textAlign:"left",fontWeight:600,color:"#6c757d",background:"#f8f9fa",borderBottom:"1px solid #dee2e6",minWidth:200 }}>Milestone</th>
          {weeks.map((w,i)=><th key={i} style={{ padding:"8px 10px",textAlign:"center",fontWeight:600,color:"#6c757d",background:"#f8f9fa",borderBottom:"1px solid #dee2e6",minWidth:80 }}>{w.label}</th>)}
        </tr></thead>
        <tbody>
          {allMs.length===0 && <tr><td colSpan={13} style={{ padding:24,textAlign:"center",color:"#6c757d" }}>No upcoming milestones.</td></tr>}
          {allMs.map((m,i)=>{
            const ms=new Date(m.date);
            return (
              <tr key={m.id||i} style={{ background:i%2===0?"#fff":"#f8f9fa",borderBottom:"1px solid #f0f2f4" }}>
                <td style={{ padding:"10px 12px" }}>
                  <div style={{ fontWeight:600,color:"#2c3e50" }}>{m.name}</div>
                  <div style={{ color:"#6c757d",fontSize:10,marginTop:2 }}>{m.projectName}</div>
                </td>
                {weeks.map((w,wi)=>{
                  const inWeek=ms>=w.start&&ms<=w.end;
                  return <td key={wi} style={{ padding:"10px",textAlign:"center" }}>
                    {inWeek && <div style={{ display:"inline-block",background:TEAL,color:"#fff",borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:700,whiteSpace:"nowrap" }}>🚩 {ms.toLocaleDateString("en-GB",{day:"2-digit",month:"short"})}</div>}
                  </td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard({ state, onSelectProject }) {
  const { projects, customers, oemPartners, consultants } = state;

  const [view, setView] = useState("list"); // list | cards | timeline
  const [timelineFilter, setTimelineFilter] = useState("active");

  // Filter state
  const [filterStatuses, setFilterStatuses] = useState(["not-started","active","overdue","inactive","closed"]);
  const [filterOems, setFilterOems] = useState("all"); // "all" or array of oemIds
  const [filterOemIds, setFilterOemIds] = useState([]);
  const [oemOrder, setOemOrder] = useState([]); // custom order
  const [filterConsultants, setFilterConsultants] = useState("all"); // "all" or array
  const [filterConsultantIds, setFilterConsultantIds] = useState([]);

  // Sort state (list view)
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  // Group by (cards)
  const [groupBy, setGroupBy] = useState("status");

  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const allStatuses = ["not-started","active","overdue","inactive","closed"];

  function toggleStatus(s) {
    setFilterStatuses(p => p.includes(s) ? p.filter(x=>x!==s) : [...p,s]);
  }
  function toggleOemId(id) {
    setFilterOemIds(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id]);
  }
  function toggleConsultantId(id) {
    setFilterConsultantIds(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id]);
  }
  function moveOem(id, dir) {
    const order = oemOrder.length ? [...oemOrder] : oemPartners.map(o=>o.id);
    const idx = order.indexOf(id);
    if (idx<0) return;
    const next = idx+dir;
    if (next<0||next>=order.length) return;
    [order[idx],order[next]] = [order[next],order[idx]];
    setOemOrder(order);
  }

  // Filtered & sorted projects
  const filteredProjects = useMemo(() => {
    let ps = projects.filter(p => {
      const eff = getEffectiveStatus(p);
      if (!filterStatuses.includes(eff)) return false;
      if (filterOems !== "all" && filterOemIds.length > 0) {
        const cust = customers.find(c=>c.id===p.customerId);
        if (!filterOemIds.includes(cust?.oemId)) return false;
      }
      if (filterConsultants !== "all" && filterConsultantIds.length > 0) {
        if (!p.consultantIds.some(id=>filterConsultantIds.includes(id))) return false;
      }
      return true;
    });
    // Sort
    ps = [...ps].sort((a,b) => {
      let va, vb;
      if (sortField==="name") { va=a.name; vb=b.name; }
      else if (sortField==="status") { va=getEffectiveStatus(a); vb=getEffectiveStatus(b); }
      else if (sortField==="target") { va=a.targetDate; vb=b.targetDate; }
      else if (sortField==="hours") { va=a.categories.reduce((s,c)=>s+c.usedHours,0); vb=b.categories.reduce((s,c)=>s+c.usedHours,0); }
      else if (sortField==="oem") {
        const ca=customers.find(c=>c.id===a.customerId); const cb=customers.find(c=>c.id===b.customerId);
        const oa=oemPartners.find(o=>o.id===ca?.oemId); const ob=oemPartners.find(o=>o.id===cb?.oemId);
        va=oa?.name||""; vb=ob?.name||"";
      }
      if (va<vb) return sortDir==="asc"?-1:1;
      if (va>vb) return sortDir==="asc"?1:-1;
      return 0;
    });
    return ps;
  }, [projects, customers, oemPartners, filterStatuses, filterOems, filterOemIds, filterConsultants, filterConsultantIds, sortField, sortDir]);

  // KPIs
  const active   = projects.filter(p=>p.status==="active");
  const notStarted = projects.filter(p=>p.status==="not-started");
  const closed   = projects.filter(p=>p.status==="closed");
  const totalPO  = active.reduce((s,p)=>s+p.poHours,0);
  const totalUsed= active.reduce((s,p)=>s+p.categories.reduce((x,c)=>x+c.usedHours,0),0);

  // Grouped for cards
  const orderedOems = oemOrder.length ? oemOrder.map(id=>oemPartners.find(o=>o.id===id)).filter(Boolean) : oemPartners;
  const grouped = useMemo(() => {
    if (groupBy==="status") {
      return allStatuses.map(s=>({ label:STATUS_META[s].label, color:STATUS_META[s].border, items:filteredProjects.filter(p=>getEffectiveStatus(p)===s) })).filter(g=>g.items.length>0);
    }
    if (groupBy==="oem") {
      return orderedOems.map(o=>({ label:o.name, color:TEAL, items:filteredProjects.filter(p=>{ const cust=customers.find(c=>c.id===p.customerId); return cust?.oemId===o.id; }) })).filter(g=>g.items.length>0);
    }
    if (groupBy==="consultant") {
      return consultants.map(u=>({ label:u.name, color:TEAL, items:filteredProjects.filter(p=>p.consultantIds.includes(u.id)) })).filter(g=>g.items.length>0);
    }
    return [{ label:"All Projects", color:TEAL, items:filteredProjects }];
  }, [groupBy, filteredProjects, customers, orderedOems, consultants]);

  function exportToExcel() {
    const rows = filteredProjects.map(p => {
      const effStatus = getEffectiveStatus(p);
      const cust = customers.find(c => c.id === p.customerId);
      const oem  = oemPartners.find(o => o.id === cust?.oemId);
      const lead = consultants.find(u => u.id === p.leadConsultantId);
      const totalUsed = p.categories.reduce((s,c) => s + (c.usedHours||0), 0);
      const pct  = p.poHours > 0 ? Math.round((totalUsed / p.poHours) * 100) : 0;
      const daysLeft = Math.ceil((new Date(p.targetDate) - new Date()) / 86400000);
      return {
        "Project":        p.name,
        "Customer":       cust?.name || "—",
        "OEM Partner":    oem?.name  || "—",
        "Status":         STATUS_META[effStatus]?.label || effStatus,
        "Lead Consultant":lead?.name || "—",
        "PO Hours":       p.poHours,
        "Hours Used":     totalUsed,
        "Hours Remaining":p.poHours - totalUsed,
        "Progress (%)":   pct,
        "Complete Date":  p.targetDate || "—",
        "Days Left":      p.status === "active" ? daysLeft : "—",
        "Companies":      p.companies,
        "Users":          p.users,
        "Multi-Currency": p.multiCurrency ? "Yes" : "No",
        "Dedicated Server":p.dedicatedServer ? "Yes" : "No",
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);

    // Column widths
    ws["!cols"] = [
      { wch: 36 }, { wch: 28 }, { wch: 22 }, { wch: 14 },
      { wch: 22 }, { wch: 10 }, { wch: 10 }, { wch: 16 },
      { wch: 13 }, { wch: 14 }, { wch: 10 }, { wch: 11 },
      { wch: 7  }, { wch: 14 }, { wch: 16 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Projects");

    // Build a filename that reflects active filters
    const datePart = new Date().toISOString().slice(0,10);
    const statusPart = filterStatuses.length < Object.keys(STATUS_META).length
      ? `_${filterStatuses.map(s=>STATUS_META[s]?.label||s).join("-")}`
      : "";
    XLSX.writeFile(wb, `Projects${statusPart}_${datePart}.xlsx`);
  }

  function SortTh({ field, label }) {
    const active = sortField===field;
    return (
      <th onClick={()=>{ if(active) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortField(field); setSortDir("asc"); } }}
        style={{ padding:"10px 16px",textAlign:"left",fontWeight:600,fontSize:11,color:active?TEAL:"#6c757d",cursor:"pointer",whiteSpace:"nowrap",userSelect:"none" }}>
        {label} {active?(sortDir==="asc"?"▲":"▼"):""}
      </th>
    );
  }

  const activeFilterCount = [
    filterStatuses.length < allStatuses.length,
    filterOems !== "all" && filterOemIds.length > 0,
    filterConsultants !== "all" && filterConsultantIds.length > 0,
  ].filter(Boolean).length;

  return (
    <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden",padding:20,gap:16,background:"#f4f6f9" }}>
      {/* KPIs */}
      <div style={{ display:"flex",gap:14,flexWrap:"wrap" }}>
        <KpiCard label="Active"      value={active.length}     color={TEAL_DARK} />
        <KpiCard label="Not Started" value={notStarted.length} color="#9b59b6" />
        <KpiCard label="Closed"      value={closed.length}     color="#28a745" />
        <KpiCard label="Customers"   value={[...new Set(projects.map(p=>p.customerId))].length} color="#e67e22" />
        <KpiCard label="PO Hours (Active)" value={`${totalPO}h`} sub={`${totalUsed}h used`} color={TEAL_DARK} />
        <KpiCard label="Utilisation" value={totalPO>0?`${Math.round(totalUsed/totalPO*100)}%`:"—"} color={totalPO>0&&totalUsed/totalPO>0.8?"#dc3545":"#28a745"} />
      </div>

      {/* Controls */}
      <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
        {/* View toggle */}
        <div style={{ display:"flex",gap:0,background:"#fff",borderRadius:8,border:"1px solid #dee2e6",overflow:"hidden" }}>
          {[["list","☰ List"],["cards","🗂 Board"],["timeline","📅 Timeline"]].map(([v,l])=>(
            <button key={v} onClick={()=>setView(v)} style={{ padding:"8px 16px",border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:view===v?TEAL:"#fff",color:view===v?"#fff":"#495057",transition:"all 0.15s" }}>{l}</button>
          ))}
        </div>

        {/* Filters */}
        <button onClick={()=>setShowFilterPanel(p=>!p)} style={{ ...showFilterPanel?{background:TEAL,color:"#fff",border:"none"}:{background:"#fff",color:"#495057",border:"1px solid #ced4da"},borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:600,cursor:"pointer",position:"relative" }}>
          ⚙ Filters {activeFilterCount>0 && <span style={{ marginLeft:6,background:"#dc3545",color:"#fff",borderRadius:10,padding:"1px 6px",fontSize:10,fontWeight:700 }}>{activeFilterCount}</span>}
        </button>

        {/* Group by — cards only */}
        {view==="cards" && (
          <div style={{ display:"flex",gap:6,alignItems:"center" }}>
            <span style={{ fontSize:12,color:"#6c757d" }}>Group:</span>
            {["status","oem","consultant","all"].map(g=>(
              <button key={g} onClick={()=>setGroupBy(g)} style={{ padding:"6px 12px",border:"1px solid #ced4da",borderRadius:6,fontSize:11,cursor:"pointer",background:groupBy===g?TEAL_LIGHT:"#fff",color:groupBy===g?TEAL_DARK:"#495057",borderColor:groupBy===g?TEAL:"#ced4da",fontWeight:groupBy===g?700:400 }}>
                {g==="all"?"All":g==="oem"?"OEM":g==="status"?"Status":"Consultant"}
              </button>
            ))}
          </div>
        )}

        {/* Timeline filter */}
        {view==="timeline" && (
          <div style={{ display:"flex",gap:6,alignItems:"center" }}>
            <span style={{ fontSize:12,color:"#6c757d" }}>Show:</span>
            {["all","active","not-started"].map(f=>(
              <button key={f} onClick={()=>setTimelineFilter(f)} style={{ padding:"6px 12px",border:"1px solid #ced4da",borderRadius:6,fontSize:11,cursor:"pointer",background:timelineFilter===f?TEAL_LIGHT:"#fff",color:timelineFilter===f?TEAL_DARK:"#495057",borderColor:timelineFilter===f?TEAL:"#ced4da",fontWeight:timelineFilter===f?700:400 }}>
                {f==="all"?"All":f==="active"?"Active":"Not Started"}
              </button>
            ))}
          </div>
        )}

        <span style={{ marginLeft:"auto",fontSize:12,color:"#6c757d" }}>{filteredProjects.length} project{filteredProjects.length!==1?"s":""}</span>
        {view==="list" && (
          <button onClick={exportToExcel} style={{ background:"#1d6f42",color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
            ⬇ Export to Excel
          </button>
        )}
      </div>

      {/* Filter panel */}
      {showFilterPanel && (
        <div style={{ background:"#fff",borderRadius:12,border:"1px solid #dee2e6",padding:20,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:24 }}>
          {/* Status filter */}
          <div>
            <div style={{ fontWeight:700,fontSize:12,color:"#2c3e50",marginBottom:10,textTransform:"uppercase",letterSpacing:0.5 }}>Status</div>
            {allStatuses.map(s=>(
              <label key={s} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8,cursor:"pointer",fontSize:13 }}>
                <input type="checkbox" checked={filterStatuses.includes(s)} onChange={()=>toggleStatus(s)} />
                <StatusPill status={s} />
              </label>
            ))}
          </div>

          {/* OEM filter */}
          <div>
            <div style={{ fontWeight:700,fontSize:12,color:"#2c3e50",marginBottom:10,textTransform:"uppercase",letterSpacing:0.5 }}>OEM Partner</div>
            <label style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8,cursor:"pointer",fontSize:13 }}>
              <input type="radio" checked={filterOems==="all"} onChange={()=>setFilterOems("all")} /> All partners
            </label>
            <label style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12,cursor:"pointer",fontSize:13 }}>
              <input type="radio" checked={filterOems==="select"} onChange={()=>setFilterOems("select")} /> Select partners
            </label>
            {filterOems==="select" && (
              <div>
                {(oemOrder.length?oemOrder.map(id=>oemPartners.find(o=>o.id===id)).filter(Boolean):oemPartners).map(o=>(
                  <div key={o.id} style={{ display:"flex",alignItems:"center",gap:6,marginBottom:6 }}>
                    <input type="checkbox" checked={filterOemIds.includes(o.id)} onChange={()=>toggleOemId(o.id)} />
                    <span style={{ flex:1,fontSize:12 }}>{o.name}</span>
                    <button onClick={()=>moveOem(o.id,-1)} style={{ border:"none",background:"none",cursor:"pointer",color:"#6c757d",fontSize:12,padding:"0 4px" }}>▲</button>
                    <button onClick={()=>moveOem(o.id,1)} style={{ border:"none",background:"none",cursor:"pointer",color:"#6c757d",fontSize:12,padding:"0 4px" }}>▼</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Consultant filter */}
          <div>
            <div style={{ fontWeight:700,fontSize:12,color:"#2c3e50",marginBottom:10,textTransform:"uppercase",letterSpacing:0.5 }}>Consultant</div>
            <label style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8,cursor:"pointer",fontSize:13 }}>
              <input type="radio" checked={filterConsultants==="all"} onChange={()=>setFilterConsultants("all")} /> All consultants
            </label>
            <label style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12,cursor:"pointer",fontSize:13 }}>
              <input type="radio" checked={filterConsultants==="select"} onChange={()=>setFilterConsultants("select")} /> Select consultants
            </label>
            {filterConsultants==="select" && consultants.map(u=>(
              <label key={u.id} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6,cursor:"pointer",fontSize:12 }}>
                <input type="checkbox" checked={filterConsultantIds.includes(u.id)} onChange={()=>toggleConsultantId(u.id)} />
                {u.name} <span style={{ fontSize:10,color:"#6c757d" }}>— {u.role}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex:1,overflow:"auto" }}>

        {/* ── LIST VIEW ── */}
        {view==="list" && (
          <div style={{ background:"#fff",borderRadius:12,border:"1px solid #e9ecef",overflow:"hidden" }}>
            <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13,tableLayout:"fixed" }}>
              <colgroup>
                <col style={{ width:"22%" }} />
                <col style={{ width:"13%" }} />
                <col style={{ width:"10%" }} />
                <col style={{ width:"12%" }} />
                <col style={{ width:"18%" }} />
                <col style={{ width:"13%" }} />
                <col style={{ width:"12%" }} />
              </colgroup>
              <thead>
                <tr style={{ background:TEAL }}>
                  {[
                    { field:"name",    label:"Project",       align:"left"   },
                    { field:"oem",     label:"OEM Partner",   align:"left"   },
                    { field:"status",  label:"Status",        align:"left"   },
                    { field:"lead",    label:"Lead",          align:"left",   noSort:true },
                    { field:"hours",   label:"Progress",      align:"left",   noSort:true },
                    { field:"target",  label:"Complete Date", align:"left"   },
                    { field:"days",    label:"Days Left",     align:"center", noSort:true },
                  ].map(col => (
                    <th key={col.field}
                      onClick={() => {
                        if (col.noSort) return;
                        if (sortField===col.field) setSortDir(d => d==="asc"?"desc":"asc");
                        else { setSortField(col.field); setSortDir("asc"); }
                      }}
                      style={{
                        padding:"10px 12px",
                        textAlign:col.align,
                        fontWeight:600,
                        fontSize:11,
                        color:"#ffffff",
                        whiteSpace:"nowrap",
                        cursor:col.noSort?"default":"pointer",
                        userSelect:"none",
                        overflow:"hidden",
                        textOverflow:"ellipsis",
                      }}>
                      {col.label}{!col.noSort && sortField===col.field ? (sortDir==="asc"?" ▲":" ▼") : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length===0 && <tr><td colSpan={7} style={{ padding:32,textAlign:"center",color:"#6c757d" }}>No projects match the current filters.</td></tr>}
                {filteredProjects.map(p=>(
                  <ProjectRow key={p.id} project={p}
                    customer={customers.find(c=>c.id===p.customerId)}
                    oem={oemPartners.find(o=>{ const cust=customers.find(c=>c.id===p.customerId); return o.id===cust?.oemId; })}
                    consultants={consultants}
                    onClick={()=>onSelectProject(p.id)} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── CARDS VIEW ── */}
        {view==="cards" && grouped.map(grp=>(
          <div key={grp.label} style={{ marginBottom:24 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
              <div style={{ width:12,height:12,borderRadius:"50%",background:grp.color }} />
              <span style={{ fontWeight:700,fontSize:13,color:"#2c3e50" }}>{grp.label}</span>
              <span style={{ fontSize:11,color:"#6c757d",background:"#e9ecef",padding:"1px 8px",borderRadius:10 }}>{grp.items.length}</span>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14 }}>
              {grp.items.map(p=>(
                <ProjectCard key={p.id} project={p}
                  customer={customers.find(c=>c.id===p.customerId)}
                  oem={oemPartners.find(o=>{ const cust=customers.find(c=>c.id===p.customerId); return o.id===cust?.oemId; })}
                  consultants={consultants}
                  onClick={()=>onSelectProject(p.id)} />
              ))}
            </div>
          </div>
        ))}

        {/* ── TIMELINE VIEW ── */}
        {view==="timeline" && (
          <div style={{ background:"#fff",borderRadius:12,border:"1px solid #e9ecef",overflow:"hidden" }}>
            <div style={{ padding:"14px 16px",borderBottom:"1px solid #e9ecef",fontWeight:700,fontSize:13,color:"#2c3e50" }}>Upcoming Milestones — Next 12 Weeks</div>
            <MilestoneTimeline projects={filteredProjects} customers={customers} filter={timelineFilter} />
          </div>
        )}
      </div>
    </div>
  );
}
