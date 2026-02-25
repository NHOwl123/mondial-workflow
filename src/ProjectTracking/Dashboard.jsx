import { useState, useMemo } from "react";

const TEAL = "#1a7f8e";
const TEAL_DARK = "#145f6b";
const TEAL_LIGHT = "#e8f4f6";

const STATUS_COLOR = {
  complete:     { bg: "#d4edda", color: "#155724", border: "#28a745", label: "Complete" },
  "in-progress":{ bg: "#cce5ff", color: "#004085", border: "#0066cc", label: "In Progress" },
  upcoming:     { bg: "#fff3cd", color: "#856404", border: "#ffc107", label: "Upcoming" },
  "not-started":{ bg: "#e9ecef", color: "#6c757d", border: "#ced4da", label: "Not Started" },
  pipeline:     { bg: "#e2d9f3", color: "#4a235a", border: "#9b59b6", label: "Pipeline" },
  closed:       { bg: "#f8f9fa", color: "#495057", border: "#ced4da", label: "Closed" },
  active:       { bg: "#cce5ff", color: "#004085", border: "#0066cc", label: "Active" },
  overdue:      { bg: "#f8d7da", color: "#721c24", border: "#dc3545", label: "Overdue" },
};

function StatusPill({ status }) {
  const s = STATUS_COLOR[status] || STATUS_COLOR["not-started"];
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontWeight: 700, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

function KpiCard({ label, value, sub, color }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "18px 22px", border: "1px solid #e9ecef", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || TEAL_DARK }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#495057", marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#6c757d", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function ProjectCard({ project, customer, oem, categories, consultants, onClick }) {
  const totalPlanned = project.categories.reduce((s,c) => s + (c.plannedHours||0), 0);
  const totalUsed    = project.categories.reduce((s,c) => s + (c.usedHours||0), 0);
  const pct = totalPlanned > 0 ? Math.round((totalUsed/totalPlanned)*100) : 0;
  const lead = consultants.find(u => u.id === project.leadConsultantId);
  const nextMs = project.milestones.find(m => m.status !== "complete");
  const today = new Date();
  const target = new Date(project.targetDate);
  const daysLeft = Math.ceil((target - today) / 86400000);
  const isOverdue = daysLeft < 0 && project.status === "active";
  const hoursOver = totalUsed > project.poHours;

  return (
    <div onClick={onClick} style={{ background: "#fff", borderRadius: 14, padding: 20, border: `1px solid ${isOverdue ? "#dc3545" : "#e9ecef"}`, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", cursor: "pointer", transition: "all 0.15s", position: "relative", overflow: "hidden" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.13)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)"}>
      {/* Colour bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: project.status === "closed" ? "#28a745" : project.status === "pipeline" ? "#9b59b6" : isOverdue ? "#dc3545" : TEAL }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ flex: 1, paddingRight: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#2c3e50", lineHeight: 1.3 }}>{project.name}</div>
          <div style={{ fontSize: 11, color: "#6c757d", marginTop: 3 }}>{customer?.name} · {oem?.name}</div>
        </div>
        <StatusPill status={isOverdue ? "overdue" : project.status} />
      </div>

      {/* Progress bar */}
      {project.status !== "pipeline" && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6c757d", marginBottom: 4 }}>
            <span>Hours used: {totalUsed} / {project.poHours}</span>
            <span style={{ color: hoursOver ? "#dc3545" : "#6c757d", fontWeight: hoursOver ? 700 : 400 }}>{pct}%{hoursOver ? " ⚠" : ""}</span>
          </div>
          <div style={{ background: "#e9ecef", borderRadius: 4, height: 6 }}>
            <div style={{ width: `${Math.min(pct,100)}%`, height: "100%", background: hoursOver ? "#dc3545" : pct > 75 ? "#ffc107" : TEAL, borderRadius: 4, transition: "width 0.3s" }} />
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#6c757d" }}>
        <span>👤 {lead?.name || "Unassigned"}</span>
        {nextMs && <span>📍 {nextMs.name}</span>}
        {project.status === "active" && <span style={{ marginLeft: "auto", color: isOverdue ? "#dc3545" : daysLeft < 14 ? "#856404" : "#6c757d", fontWeight: daysLeft < 14 ? 700 : 400 }}>
          {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
        </span>}
      </div>
    </div>
  );
}

function MilestoneTimeline({ projects, customers, filter }) {
  const today = new Date();
  const weeks = [];
  for (let w = 0; w < 12; w++) {
    const start = new Date(today); start.setDate(start.getDate() + w*7);
    const end   = new Date(start); end.setDate(end.getDate() + 6);
    weeks.push({ start, end, label: start.toLocaleDateString("en-GB",{day:"2-digit",month:"short"}) });
  }

  const allMilestones = projects.flatMap(p => {
    if (filter !== "all" && p.status !== filter) return [];
    const cust = customers.find(c => c.id === p.customerId);
    return p.milestones.map(m => ({ ...m, projectName: p.name, customerName: cust?.name, projectStatus: p.status }));
  }).filter(m => m.status !== "complete");

  return (
    <div style={{ overflow: "auto" }}>
      <table style={{ borderCollapse: "collapse", minWidth: "100%", fontSize: 11 }}>
        <thead>
          <tr>
            <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#6c757d", whiteSpace: "nowrap", background: "#f8f9fa", borderBottom: "1px solid #dee2e6", minWidth: 200 }}>Milestone</th>
            {weeks.map((w,i) => (
              <th key={i} style={{ padding: "8px 10px", textAlign: "center", fontWeight: 600, color: "#6c757d", background: "#f8f9fa", borderBottom: "1px solid #dee2e6", minWidth: 80 }}>
                {w.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allMilestones.length === 0 && (
            <tr><td colSpan={13} style={{ padding: 24, textAlign: "center", color: "#6c757d" }}>No upcoming milestones.</td></tr>
          )}
          {allMilestones.map((m,i) => {
            const ms = new Date(m.date);
            return (
              <tr key={m.id} style={{ background: i%2===0?"#fff":"#f8f9fa", borderBottom: "1px solid #f0f2f4" }}>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ fontWeight: 600, color: "#2c3e50" }}>{m.name}</div>
                  <div style={{ color: "#6c757d", fontSize: 10, marginTop: 2 }}>{m.projectName}</div>
                </td>
                {weeks.map((w,wi) => {
                  const inWeek = ms >= w.start && ms <= w.end;
                  return (
                    <td key={wi} style={{ padding: "10px 10px", textAlign: "center" }}>
                      {inWeek && (
                        <div style={{ display: "inline-block", background: TEAL, color: "#fff", borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>
                          🚩 {ms.toLocaleDateString("en-GB",{day:"2-digit",month:"short"})}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard({ state, onSelectProject }) {
  const { projects, customers, oemPartners, consultants, categories } = state;
  const [groupBy, setGroupBy] = useState("status");
  const [timelineFilter, setTimelineFilter] = useState("active");
  const [view, setView] = useState("cards");

  const active   = projects.filter(p => p.status === "active");
  const pipeline = projects.filter(p => p.status === "pipeline");
  const closed   = projects.filter(p => p.status === "closed");
  const totalPOHours = projects.filter(p=>p.status==="active").reduce((s,p)=>s+p.poHours,0);
  const totalUsed    = projects.filter(p=>p.status==="active").reduce((s,p)=>s+p.categories.reduce((x,c)=>x+c.usedHours,0),0);

  const grouped = useMemo(() => {
    if (groupBy === "status") {
      return [
        { label: "Active", color: "#0066cc", items: active },
        { label: "Pipeline", color: "#9b59b6", items: pipeline },
        { label: "Closed", color: "#28a745", items: closed },
      ].filter(g => g.items.length > 0);
    }
    if (groupBy === "oem") {
      return oemPartners.map(o => ({
        label: o.name, color: TEAL,
        items: projects.filter(p => {
          const cust = customers.find(c => c.id === p.customerId);
          return cust?.oemId === o.id;
        })
      })).filter(g => g.items.length > 0);
    }
    if (groupBy === "consultant") {
      return consultants.map(u => ({
        label: u.name, color: TEAL,
        items: projects.filter(p => p.consultantIds.includes(u.id))
      })).filter(g => g.items.length > 0);
    }
    return [{ label: "All Projects", color: TEAL, items: projects }];
  }, [groupBy, projects, customers, oemPartners, consultants]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: 20, gap: 16, background: "#f4f6f9" }}>
      {/* KPI row */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <KpiCard label="Active Projects"  value={active.length}   color={TEAL_DARK} />
        <KpiCard label="Pipeline"         value={pipeline.length} color="#9b59b6" />
        <KpiCard label="Closed Projects"  value={closed.length}   color="#28a745" />
        <KpiCard label="Total Customers"  value={[...new Set(projects.map(p=>p.customerId))].length} color="#e67e22" />
        <KpiCard label="Hours Committed (Active)" value={`${totalPOHours}h`} sub={`${totalUsed}h used`} color={TEAL_DARK} />
        <KpiCard label="Utilization" value={totalPOHours>0?`${Math.round(totalUsed/totalPOHours*100)}%`:"—"} color={totalUsed/totalPOHours>0.8?"#dc3545":"#28a745"} />
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 0, background: "#fff", borderRadius: 8, border: "1px solid #dee2e6", overflow: "hidden" }}>
          {["cards","timeline"].map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: "8px 18px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                background: view===v ? TEAL : "#fff", color: view===v ? "#fff" : "#495057", transition: "all 0.15s" }}>
              {v === "cards" ? "🗂 Board" : "📅 Timeline"}
            </button>
          ))}
        </div>
        {view === "cards" && (
          <>
            <span style={{ fontSize: 12, color: "#6c757d" }}>Group by:</span>
            {["status","oem","consultant","all"].map(g => (
              <button key={g} onClick={() => setGroupBy(g)}
                style={{ padding: "6px 14px", border: "1px solid #ced4da", borderRadius: 6, fontSize: 12, cursor: "pointer",
                  background: groupBy===g ? TEAL_LIGHT : "#fff", color: groupBy===g ? TEAL_DARK : "#495057",
                  borderColor: groupBy===g ? TEAL : "#ced4da", fontWeight: groupBy===g ? 700 : 400 }}>
                {g === "all" ? "All" : g === "oem" ? "OEM Partner" : g === "status" ? "Status" : "Consultant"}
              </button>
            ))}
          </>
        )}
        {view === "timeline" && (
          <>
            <span style={{ fontSize: 12, color: "#6c757d" }}>Show:</span>
            {["all","active","pipeline"].map(f => (
              <button key={f} onClick={() => setTimelineFilter(f)}
                style={{ padding: "6px 14px", border: "1px solid #ced4da", borderRadius: 6, fontSize: 12, cursor: "pointer",
                  background: timelineFilter===f ? TEAL_LIGHT : "#fff", color: timelineFilter===f ? TEAL_DARK : "#495057",
                  borderColor: timelineFilter===f ? TEAL : "#ced4da", fontWeight: timelineFilter===f ? 700 : 400 }}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {view === "cards" && grouped.map(grp => (
          <div key={grp.label} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: grp.color }} />
              <span style={{ fontWeight: 700, fontSize: 13, color: "#2c3e50" }}>{grp.label}</span>
              <span style={{ fontSize: 11, color: "#6c757d", background: "#e9ecef", padding: "1px 8px", borderRadius: 10 }}>{grp.items.length}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
              {grp.items.map(p => (
                <ProjectCard key={p.id} project={p}
                  customer={customers.find(c=>c.id===p.customerId)}
                  oem={oemPartners.find(o=>{const cust=customers.find(c=>c.id===p.customerId);return o.id===cust?.oemId;})}
                  categories={categories} consultants={consultants}
                  onClick={() => onSelectProject(p.id)} />
              ))}
            </div>
          </div>
        ))}
        {view === "timeline" && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e9ecef", overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #e9ecef", fontWeight: 700, fontSize: 13, color: "#2c3e50" }}>
              Upcoming Milestones — Next 12 Weeks
            </div>
            <MilestoneTimeline projects={projects} customers={customers} filter={timelineFilter} />
          </div>
        )}
      </div>
    </div>
  );
}
