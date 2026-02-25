import { useState, useMemo } from "react";

const TEAL = "#1a7f8e";
const TEAL_DARK = "#145f6b";
const TEAL_LIGHT = "#e8f4f6";

const TASKS = [
  { id: 1, name: "TB Reconciliation", short: "TB Rec" },
  { id: 2, name: "Exchange Rates Confirmed", short: "FX Rates" },
  { id: 3, name: "Data Import Verified", short: "Data Import" },
  { id: 4, name: "Management Adjustments Posted", short: "Mgmt Adj" },
  { id: 5, name: "GAAP Adjustments Posted", short: "GAAP Adj" },
  { id: 6, name: "CTA Processed", short: "CTA" },
  { id: 7, name: "Intercompany Accounts Reviewed", short: "IC Review" },
  { id: 8, name: "Intercompany Reconciliation Complete", short: "IC Recon" },
  { id: 9, name: "Local Reports Reviewed", short: "Local Rpts" },
  { id: 10, name: "Consolidated Reports Approved", short: "Consol Rpts" },
  { id: 11, name: "Reports Distributed", short: "Distributed" },
];

const USERS = ["Sarah Chen", "James Okafor", "Priya Nair", "Tom Müller", "Ana Lima", "Fatima Al-Rashid", "David Park", "Emma Wilson"];

const today = new Date(2026, 1, 24);
const fmt = d => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
const daysFromToday = n => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };

const ENTITIES = [
  "Shaneel UK Ltd", "Shaneel Germany GmbH", "Shaneel Germany Holding GmbH",
  "Shaneel USA Inc", "Shaneel Singapore Pte Ltd", "Shaneel UAE LLC",
  "Shaneel India Pvt Ltd", "Shaneel Australia Pty Ltd", "Shaneel France SAS",
  "Shaneel Netherlands BV", "Shaneel Brazil Ltda", "Shaneel Japan KK",
  "Shaneel Canada Inc", "Shaneel South Africa Ltd", "Shaneel Mexico SA",
  "Shaneel Group Holdings Ltd",
];

function makeCells() {
  const cells = {};
  ENTITIES.forEach((e, ei) => {
    TASKS.forEach((t, ti) => {
      const user = USERS[(ei + ti) % USERS.length];
      let status, dueDate, completedDate, notes = [], attachments = [];
      const r = (ei * 11 + ti) % 17;
      if (r < 5) {
        status = "complete";
        completedDate = fmt(daysFromToday(-3 + (r % 3)));
        dueDate = fmt(daysFromToday(-5 + (r % 3)));
      } else if (r < 8) {
        status = "overdue";
        dueDate = fmt(daysFromToday(-1 - (r % 3)));
      } else if (r < 11) {
        status = "due-soon";
        dueDate = fmt(daysFromToday(1 + (r % 2)));
      } else if (r < 14) {
        status = "on-track";
        dueDate = fmt(daysFromToday(5 + (r % 4)));
      } else {
        status = "unassigned";
        dueDate = fmt(daysFromToday(7));
      }
      if (r === 2) notes = [{ user: "Sarah Chen", time: "24 Feb 09:14", text: "Uploaded SAP B1 TB export. Two minor rounding differences noted in accounts 4100 and 5200 — both < £1, marked as explained." }];
      if (r === 7) notes = [{ user: "Tom Müller", time: "22 Feb 16:30", text: "EUR/GBP rate source updated to ECB reference. Awaiting confirmation from head office before marking complete." }];
      cells[`${e}::${t.id}`] = { status, dueDate, completedDate, user: status === "unassigned" ? null : user, notes, attachments };
    });
  });
  return cells;
}

const initCells = makeCells();

const STATUS_STYLES = {
  complete:      { bg: "#d4edda", color: "#155724", border: "#28a745" },
  overdue:       { bg: "#f8d7da", color: "#721c24", border: "#dc3545" },
  "due-soon":    { bg: "#fff3cd", color: "#856404", border: "#ffc107" },
  "on-track":    { bg: "#f8f9fa", color: "#495057", border: "#dee2e6" },
  unassigned:    { bg: "#e9ecef", color: "#6c757d", border: "#ced4da" },
  "not-required":{ bg: "#e8e8f0", color: "#5a5a7a", border: "#9999bb" },
};

export default function App() {
  const [cells, setCells] = useState(initCells);
  const [tasks, setTasks] = useState(TASKS);
  const [period, setPeriod] = useState("January 2026");
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterEntity, setFilterEntity] = useState("all");
  const [noteInput, setNoteInput] = useState("");
  const [panel, setPanel] = useState("detail");
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskName, setEditTaskName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState("workflow");

  const key = selected ? `${selected.entity}::${selected.taskId}` : null;
  const cell = key ? cells[key] : null;

  const filteredEntities = useMemo(() => {
    if (filterEntity !== "all") return ENTITIES.filter(e => e === filterEntity);
    return ENTITIES;
  }, [filterEntity]);

  const visibleEntities = useMemo(() => {
    if (filterStatus === "all") return filteredEntities;
    return filteredEntities.filter(e =>
      tasks.some(t => {
        const c = cells[`${e}::${t.id}`];
        return c && c.status === filterStatus;
      })
    );
  }, [filterStatus, filteredEntities, cells, tasks]);

  function entityCount(entity) {
    const done = tasks.filter(t => cells[`${entity}::${t.id}`]?.status === "complete").length;
    return { done, total: tasks.length };
  }

  function taskColCount(taskId) {
    const done = ENTITIES.filter(e => cells[`${e}::${taskId}`]?.status === "complete").length;
    return { done, total: ENTITIES.length };
  }

  function markComplete() {
    if (!key || !cell) return;
    setCells(prev => ({
      ...prev,
      [key]: { ...prev[key], status: "complete", completedDate: fmt(today) }
    }));
  }

  function reverseComplete() {
    if (!key || !cell) return;
    setCells(prev => ({
      ...prev,
      [key]: { ...prev[key], status: "overdue", completedDate: null }
    }));
  }

  function addNote() {
    if (!noteInput.trim() || !key) return;
    const note = { user: "Mark Richardson", time: `${fmt(today)} ${today.getHours()}:${String(today.getMinutes()).padStart(2,"0")}`, text: noteInput.trim() };
    setCells(prev => ({
      ...prev,
      [key]: { ...prev[key], notes: [...prev[key].notes, note] }
    }));
    setNoteInput("");
  }

  function addTask() {
    if (!newTaskName.trim()) return;
    const id = Math.max(...tasks.map(t => t.id)) + 1;
    const t = { id, name: newTaskName.trim(), short: newTaskName.trim().slice(0, 10) };
    setTasks(prev => [...prev, t]);
    const newCells = {};
    ENTITIES.forEach(e => {
      newCells[`${e}::${id}`] = { status: "unassigned", dueDate: fmt(daysFromToday(7)), completedDate: null, user: null, notes: [], attachments: [] };
    });
    setCells(prev => ({ ...prev, ...newCells }));
    setNewTaskName("");
    setShowAddTask(false);
  }

  function deleteTask(taskId) {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (selected?.taskId === taskId) setSelected(null);
  }

  function saveTaskName() {
    if (!editTaskName.trim()) return;
    setTasks(prev => prev.map(t => t.id === editingTask ? { ...t, name: editTaskName, short: editTaskName.slice(0, 10) } : t));
    setEditingTask(null);
    setEditTaskName("");
  }

  const navItems = [
    { id: "workflow", label: "Period-End Close", icon: "▦" },
    { id: "reports", label: "Reports", icon: "≡" },
    { id: "adjustments", label: "Accounting Adjustments", icon: "≡" },
    { id: "setup", label: "Enterprise Setup", icon: "≡" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, background: "#f0f2f4" }}>
      <div style={{ width: sidebarOpen ? 220 : 48, background: TEAL_DARK, color: "#fff", display: "flex", flexDirection: "column", transition: "width 0.2s", flexShrink: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 12px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
          <div style={{ width: 32, height: 32, background: "#fff", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: TEAL, fontWeight: 900, fontSize: 15 }}>M</span>
          </div>
          {sidebarOpen && <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: 0.5 }}>Mondial</span>}
        </div>
        <div style={{ padding: "8px 0", flex: 1 }}>
          {navItems.map(n => (
            <div key={n.id} onClick={() => setActiveNav(n.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer",
                background: activeNav === n.id ? "rgba(255,255,255,0.15)" : "transparent",
                borderLeft: activeNav === n.id ? "3px solid #fff" : "3px solid transparent",
                transition: "background 0.15s" }}>
              <span style={{ fontSize: 16, width: 20, textAlign: "center", flexShrink: 0 }}>{n.icon}</span>
              {sidebarOpen && <span style={{ fontSize: 13, whiteSpace: "nowrap" }}>{n.label}</span>}
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16, cursor: "pointer", flexShrink: 0 }} onClick={() => setSidebarOpen(p => !p)}>{sidebarOpen ? "◀" : "▶"}</span>
          {sidebarOpen && <span style={{ fontSize: 11, opacity: 0.7 }}>Collapse</span>}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ background: "#fff", borderBottom: "1px solid #dee2e6", padding: "0 20px", height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#2c3e50" }}>Period-End Close Workflow</span>
            <select value={period} onChange={e => setPeriod(e.target.value)}
              style={{ border: "1px solid #ced4da", borderRadius: 4, padding: "4px 8px", fontSize: 13, color: "#495057" }}>
              {["January 2026","December 2025","November 2025"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: "#6c757d" }}>Logged in as: mark.richardson@mondialsoftware.com</span>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: TEAL, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>MR</div>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: 16, gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, color: "#6c757d" }}>Filter:</span>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  style={{ border: "1px solid #ced4da", borderRadius: 4, padding: "4px 8px", fontSize: 12 }}>
                  <option value="all">All statuses</option>
                  <option value="overdue">Overdue</option>
                  <option value="due-soon">Due soon</option>
                  <option value="complete">Complete</option>
                  <option value="on-track">On track</option>
                  <option value="unassigned">Unassigned</option>
                  <option value="not-required">Not required</option>
                </select>
                <select value={filterEntity} onChange={e => setFilterEntity(e.target.value)}
                  style={{ border: "1px solid #ced4da", borderRadius: 4, padding: "4px 8px", fontSize: 12 }}>
                  <option value="all">All entities</option>
                  {ENTITIES.map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                {showAddTask ? (
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input value={newTaskName} onChange={e => setNewTaskName(e.target.value)}
                      placeholder="New task name..." autoFocus
                      onKeyDown={e => e.key === "Enter" && addTask()}
                      style={{ border: "1px solid #ced4da", borderRadius: 4, padding: "4px 8px", fontSize: 12, width: 200 }} />
                    <button onClick={addTask} style={{ background: TEAL, color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>Add</button>
                    <button onClick={() => setShowAddTask(false)} style={{ background: "#6c757d", color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setShowAddTask(true)}
                    style={{ background: TEAL, color: "#fff", border: "none", borderRadius: 4, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                    + Add Task
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 11 }}>
              {[["complete","#d4edda","#28a745","Complete"],["overdue","#f8d7da","#dc3545","Overdue"],["due-soon","#fff3cd","#ffc107","Due Soon"],["on-track","#f8f9fa","#dee2e6","On Track"],["unassigned","#e9ecef","#ced4da","Unassigned"],["not-required","#e8e8f0","#9999bb","Not Required"]].map(([,bg,border,label]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 14, height: 14, background: bg, border: `2px solid ${border}`, borderRadius: 3 }} />
                  <span style={{ color: "#6c757d" }}>{label}</span>
                </div>
              ))}
            </div>

            <div style={{ flex: 1, overflow: "auto", background: "#fff", borderRadius: 8, border: "1px solid #dee2e6", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: 170 }} />
                  {tasks.map(t => <col key={t.id} style={{ width: 90 }} />)}
                  <col style={{ width: 70 }} />
                </colgroup>
                <thead>
                  <tr style={{ background: TEAL, color: "#fff" }}>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 12, position: "sticky", top: 0, left: 0, zIndex: 10, background: TEAL, borderRight: "1px solid rgba(255,255,255,0.2)" }}>Entity</th>
                    {tasks.map(t => (
                      <th key={t.id} style={{ padding: "8px 4px", textAlign: "center", fontWeight: 600, fontSize: 11, position: "sticky", top: 0, zIndex: 9, background: TEAL, borderRight: "1px solid rgba(255,255,255,0.15)" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                          {editingTask === t.id ? (
                            <input value={editTaskName} onChange={e => setEditTaskName(e.target.value)} onKeyDown={e => e.key === "Enter" && saveTaskName()}
                              autoFocus style={{ fontSize: 10, width: 70, textAlign: "center", borderRadius: 3, border: "none", padding: "2px 4px" }} />
                          ) : (
                            <span style={{ lineHeight: 1.2 }}>{t.short}</span>
                          )}
                          <div style={{ display: "flex", gap: 3 }}>
                            <span onClick={() => { setEditingTask(t.id); setEditTaskName(t.name); }} style={{ cursor: "pointer", opacity: 0.7, fontSize: 10 }} title="Rename">✎</span>
                            <span onClick={() => deleteTask(t.id)} style={{ cursor: "pointer", opacity: 0.7, fontSize: 10 }} title="Delete">✕</span>
                          </div>
                        </div>
                      </th>
                    ))}
                    <th style={{ padding: "10px 6px", textAlign: "center", fontWeight: 600, fontSize: 11, position: "sticky", top: 0, zIndex: 9, background: TEAL }}>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleEntities.map((entity, ei) => {
                    const { done, total } = entityCount(entity);
                    const pct = Math.round((done / total) * 100);
                    return (
                      <tr key={entity} style={{ background: ei % 2 === 0 ? "#fff" : "#f8f9fa", borderBottom: "1px solid #dee2e6" }}>
                        <td style={{ padding: "8px 12px", fontWeight: 600, fontSize: 12, color: "#2c3e50", position: "sticky", left: 0, background: ei % 2 === 0 ? "#fff" : "#f8f9fa", borderRight: "1px solid #dee2e6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                          title={entity}>{entity}</td>
                        {tasks.map(t => {
                          const c = cells[`${entity}::${t.id}`];
                          if (!c) return <td key={t.id} />;
                          const s = STATUS_STYLES[c.status];
                          const isSelected = selected?.entity === entity && selected?.taskId === t.id;
                          return (
                            <td key={t.id}
                              onClick={() => { setSelected({ entity, taskId: t.id }); setPanel("detail"); }}
                              style={{ padding: "4px 3px", textAlign: "center", cursor: "pointer", borderRight: "1px solid #e9ecef" }}>
                              <div style={{
                                background: s.bg, border: `2px solid ${isSelected ? "#0056b3" : s.border}`,
                                borderRadius: 5, padding: "5px 3px", fontSize: 10, lineHeight: 1.3,
                                outline: isSelected ? "2px solid #0056b3" : "none",
                                boxShadow: isSelected ? "0 0 0 2px #0056b3" : "none",
                                transition: "all 0.1s"
                              }}>
                                <div style={{ color: s.color, fontWeight: 600, fontSize: 9, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {c.user ? c.user.split(" ").map(n => n[0]).join("") : "—"}
                                </div>
                                <div style={{ color: s.color, fontSize: 9 }}>
                                  {c.status === "complete" ? c.completedDate : c.status === "not-required" ? "N/A" : c.dueDate}
                                </div>
                                {c.notes.length > 0 && <div style={{ fontSize: 9 }}>📎</div>}
                              </div>
                            </td>
                          );
                        })}
                        <td style={{ padding: "6px 8px", textAlign: "center" }}>
                          <div style={{ fontSize: 10, color: "#495057", fontWeight: 600, marginBottom: 3 }}>{done}/{total}</div>
                          <div style={{ background: "#e9ecef", borderRadius: 3, height: 6, overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#28a745" : pct > 50 ? TEAL : "#ffc107", transition: "width 0.3s" }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: TEAL_LIGHT, borderTop: "2px solid #ced4da", position: "sticky", bottom: 0 }}>
                    <td style={{ padding: "8px 12px", fontWeight: 700, fontSize: 12, color: TEAL_DARK, position: "sticky", left: 0, background: TEAL_LIGHT, borderRight: "1px solid #dee2e6" }}>Summary</td>
                    {tasks.map(t => {
                      const { done, total } = taskColCount(t.id);
                      return (
                        <td key={t.id} style={{ padding: "6px 3px", textAlign: "center", borderRight: "1px solid #e9ecef" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: done === total ? "#28a745" : TEAL_DARK }}>{done}/{total}</div>
                        </td>
                      );
                    })}
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {selected && cell && (
            <div style={{ width: 320, background: "#fff", borderLeft: "1px solid #dee2e6", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
              <div style={{ background: TEAL, color: "#fff", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{tasks.find(t => t.id === selected.taskId)?.name}</div>
                  <div style={{ fontSize: 11, opacity: 0.85, marginTop: 3 }}>{selected.entity}</div>
                </div>
                <span onClick={() => setSelected(null)} style={{ cursor: "pointer", fontSize: 18, lineHeight: 1, opacity: 0.8 }}>✕</span>
              </div>

              <div style={{ display: "flex", borderBottom: "1px solid #dee2e6" }}>
                {["detail","notes"].map(p => (
                  <div key={p} onClick={() => setPanel(p)}
                    style={{ flex: 1, padding: "10px", textAlign: "center", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      color: panel === p ? TEAL : "#6c757d", borderBottom: panel === p ? `2px solid ${TEAL}` : "2px solid transparent",
                      textTransform: "capitalize" }}>
                    {p === "notes" ? `Notes (${cell.notes.length})` : "Detail"}
                  </div>
                ))}
              </div>

              <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
                {panel === "detail" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#6c757d", marginBottom: 4, fontWeight: 600 }}>STATUS</div>
                      <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                        background: STATUS_STYLES[cell.status].bg, color: STATUS_STYLES[cell.status].color,
                        border: `1px solid ${STATUS_STYLES[cell.status].border}` }}>
                        {cell.status === "complete" ? "✓ Complete" : cell.status === "overdue" ? "⚠ Overdue" : cell.status === "due-soon" ? "⏰ Due Soon" : cell.status === "on-track" ? "→ On Track" : cell.status === "not-required" ? "⊘ Not Required" : "— Unassigned"}
                      </div>
                    </div>

                    {[["ASSIGNED TO", cell.user || "Not assigned"], ["DUE DATE", cell.dueDate], ...(cell.status === "complete" ? [["COMPLETED", cell.completedDate]] : [])].map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontSize: 11, color: "#6c757d", marginBottom: 4, fontWeight: 600 }}>{label}</div>
                        <div style={{ fontSize: 13, color: "#2c3e50", fontWeight: 500 }}>{val}</div>
                      </div>
                    ))}

                    <div>
                      <div style={{ fontSize: 11, color: "#6c757d", marginBottom: 4, fontWeight: 600 }}>PERIOD</div>
                      <div style={{ fontSize: 13, color: "#2c3e50", fontWeight: 500 }}>{period}</div>
                    </div>

                    <div style={{ borderTop: "1px solid #dee2e6", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ fontSize: 11, color: "#6c757d", fontWeight: 600, marginBottom: 2 }}>ACTIONS</div>
                      {cell.status !== "complete" && cell.status !== "not-required" ? (
                        <button onClick={markComplete}
                          style={{ background: "#28a745", color: "#fff", border: "none", borderRadius: 5, padding: "9px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600, textAlign: "left" }}>
                          ✓ Mark as Complete
                        </button>
                      ) : cell.status === "complete" ? (
                        <button onClick={reverseComplete}
                          style={{ background: "#6c757d", color: "#fff", border: "none", borderRadius: 5, padding: "9px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600, textAlign: "left" }}>
                          ↩ Reverse Completion
                        </button>
                      ) : null}
                      {cell.status !== "not-required" ? (
                        <button onClick={() => setCells(prev => ({ ...prev, [key]: { ...prev[key], status: "not-required", user: null, completedDate: null } }))}
                          style={{ background: "#e8e8f0", color: "#5a5a7a", border: "1px solid #9999bb", borderRadius: 5, padding: "9px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600, textAlign: "left" }}>
                          ⊘ Mark as Not Required
                        </button>
                      ) : (
                        <button onClick={() => setCells(prev => ({ ...prev, [key]: { ...prev[key], status: "on-track", user: null } }))}
                          style={{ background: "#f8f9fa", color: "#495057", border: "1px solid #ced4da", borderRadius: 5, padding: "9px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600, textAlign: "left" }}>
                          ↩ Restore Task
                        </button>
                      )}
                      <button onClick={() => setPanel("notes")}
                        style={{ background: TEAL_LIGHT, color: TEAL_DARK, border: `1px solid ${TEAL}`, borderRadius: 5, padding: "9px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600, textAlign: "left" }}>
                        📝 Add Note
                      </button>
                      <button style={{ background: "#f8f9fa", color: "#495057", border: "1px solid #ced4da", borderRadius: 5, padding: "9px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600, textAlign: "left" }}>
                        📎 Attach Document
                      </button>
                    </div>
                  </div>
                )}

                {panel === "notes" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
                    {cell.notes.length === 0 && (
                      <div style={{ color: "#6c757d", fontSize: 12, textAlign: "center", padding: "20px 0", fontStyle: "italic" }}>No notes yet. Add the first note below.</div>
                    )}
                    {cell.notes.map((n, i) => (
                      <div key={i} style={{ background: "#f8f9fa", borderRadius: 6, padding: 10, border: "1px solid #e9ecef" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <span style={{ fontWeight: 700, fontSize: 11, color: TEAL_DARK }}>{n.user}</span>
                          <span style={{ fontSize: 10, color: "#6c757d" }}>{n.time}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#2c3e50", lineHeight: 1.5 }}>{n.text}</div>
                      </div>
                    ))}
                    <div style={{ marginTop: "auto", borderTop: "1px solid #dee2e6", paddingTop: 12 }}>
                      <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)}
                        placeholder="Type a note..."
                        style={{ width: "100%", minHeight: 80, border: "1px solid #ced4da", borderRadius: 5, padding: 8, fontSize: 12, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
                      <button onClick={addNote} disabled={!noteInput.trim()}
                        style={{ marginTop: 8, width: "100%", background: noteInput.trim() ? TEAL : "#ced4da", color: "#fff", border: "none", borderRadius: 5, padding: "9px", fontSize: 12, cursor: noteInput.trim() ? "pointer" : "default", fontWeight: 600 }}>
                        Post Note
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}