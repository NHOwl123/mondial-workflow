import { useState } from "react";

const TEAL = "#1a7f8e";
const TEAL_DARK = "#145f6b";
const TEAL_LIGHT = "#e8f4f6";

const STATUS_COLOR = {
  complete:      { bg: "#d4edda", color: "#155724", border: "#28a745" },
  "in-progress": { bg: "#cce5ff", color: "#004085", border: "#0066cc" },
  "not-started": { bg: "#e9ecef", color: "#6c757d", border: "#ced4da" },
  upcoming:      { bg: "#fff3cd", color: "#856404", border: "#ffc107" },
};

function StatusPill({ status }) {
  const s = STATUS_COLOR[status] || STATUS_COLOR["not-started"];
  const labels = { complete: "Complete", "in-progress": "In Progress", "not-started": "Not Started", upcoming: "Upcoming" };
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontWeight: 700 }}>
      {labels[status] || status}
    </span>
  );
}

function HoursBar({ used, planned, po }) {
  const pct = planned > 0 ? Math.min((used/planned)*100,100) : 0;
  const over = used > po;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6c757d", marginBottom: 4 }}>
        <span>{used}h used of {planned}h planned</span>
        <span style={{ color: over ? "#dc3545" : "#6c757d", fontWeight: over ? 700 : 400 }}>{planned > 0 ? Math.round(used/planned*100) : 0}%{over ? " ⚠ Exceeds PO" : ""}</span>
      </div>
      <div style={{ background: "#e9ecef", borderRadius: 4, height: 8 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: over ? "#dc3545" : pct>75 ? "#ffc107" : TEAL, borderRadius: 4 }} />
      </div>
    </div>
  );
}

export default function ProjectDetail({ project, state, onUpdate, onBack }) {
  const { customers, oemPartners, consultants, categories, subcategories } = state;
  const [tab, setTab] = useState("overview");
  const [logHoursFor, setLogHoursFor] = useState(null);
  const [logHoursVal, setLogHoursVal] = useState("");
  const [logUserId, setLogUserId] = useState("");
  const [addMsModal, setAddMsModal] = useState(false);
  const [newMs, setNewMs] = useState({ name: "", date: "", status: "upcoming" });
  const [addDocModal, setAddDocModal] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: "", type: "SOW" });

  const customer = customers.find(c => c.id === project.customerId);
  const oem = oemPartners.find(o => o.id === customer?.oemId);
  const totalPlanned = project.categories.reduce((s,c) => s + (c.plannedHours||0), 0);
  const totalUsed    = project.categories.reduce((s,c) => s + (c.usedHours||0), 0);
  const hoursRemaining = project.poHours - totalUsed;

  function logHours() {
    if (!logHoursFor || !logHoursVal) return;
    const hrs = parseFloat(logHoursVal);
    if (isNaN(hrs) || hrs <= 0) return;
    const updated = { ...project, categories: project.categories.map(c =>
      c.categoryId === logHoursFor ? { ...c, usedHours: c.usedHours + hrs, status: "in-progress" } : c
    )};
    onUpdate(updated);
    setLogHoursFor(null); setLogHoursVal(""); setLogUserId("");
  }

  function updateCategoryStatus(catId, status) {
    const updated = { ...project, categories: project.categories.map(c =>
      c.categoryId === catId ? { ...c, status, completedDate: status === "complete" ? new Date().toISOString().slice(0,10) : c.completedDate } : c
    )};
    onUpdate(updated);
  }

  function updateMilestoneStatus(msId, status) {
    const updated = { ...project, milestones: project.milestones.map(m =>
      m.id === msId ? { ...m, status } : m
    )};
    onUpdate(updated);
  }

  function addMilestone() {
    if (!newMs.name || !newMs.date) return;
    const ms = { ...newMs, id: "ms-" + Date.now() };
    onUpdate({ ...project, milestones: [...project.milestones, ms] });
    setNewMs({ name: "", date: "", status: "upcoming" }); setAddMsModal(false);
  }

  function addDocument() {
    if (!newDoc.name) return;
    const doc = { ...newDoc, id: "doc-" + Date.now(), addedBy: "usr-5", addedDate: new Date().toISOString().slice(0,10) };
    onUpdate({ ...project, documents: [...(project.documents||[]), doc] });
    setNewDoc({ name: "", type: "SOW" }); setAddDocModal(false);
  }

  const inputStyle = { border: "1px solid #ced4da", borderRadius: 6, padding: "7px 10px", fontSize: 13, width: "100%", boxSizing: "border-box" };
  const labelStyle = { fontSize: 11, color: "#6c757d", fontWeight: 600, marginBottom: 3, display: "block" };
  const btnPrimary = { background: TEAL, color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontSize: 12, cursor: "pointer", fontWeight: 600 };
  const btnGhost   = { background: "#f8f9fa", color: "#495057", border: "1px solid #ced4da", borderRadius: 6, padding: "8px 18px", fontSize: 12, cursor: "pointer", fontWeight: 600 };

  const tabs = ["overview","categories","milestones","documents","team"];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f4f6f9" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #dee2e6", padding: "14px 24px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: TEAL, fontSize: 12, fontWeight: 600, marginBottom: 8, padding: 0 }}>← Back to Dashboard</button>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, color: "#2c3e50", fontWeight: 800 }}>{project.name}</h2>
            <div style={{ fontSize: 12, color: "#6c757d", marginTop: 4 }}>{customer?.name} · {oem?.name} · Target: {new Date(project.targetDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#6c757d" }}>Hours remaining</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: hoursRemaining < 0 ? "#dc3545" : TEAL_DARK }}>{hoursRemaining}h</div>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginTop: 14 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "8px 20px", border: "none", borderBottom: tab===t ? `2px solid ${TEAL}` : "2px solid transparent", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: tab===t ? TEAL : "#6c757d", textTransform: "capitalize" }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 24 }}>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e9ecef" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#2c3e50" }}>Project Summary</h3>
              {[
                ["Status", project.status.charAt(0).toUpperCase()+project.status.slice(1)],
                ["Start Date", new Date(project.startDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})],
                ["Target Go-Live", new Date(project.targetDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})],
                ["Companies", project.companies],
                ["Users", project.users],
                ["Multi-Currency", project.multiCurrency ? "Yes" : "No"],
                ["Dedicated Server", project.dedicatedServer ? "Yes" : "No"],
                ["PO Hours", `${project.poHours}h`],
                ["Anticipated Hours", `${project.anticipatedHours}h`],
              ].map(([k,v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f2f4", fontSize: 13 }}>
                  <span style={{ color: "#6c757d", fontWeight: 600 }}>{k}</span>
                  <span style={{ color: "#2c3e50", fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e9ecef" }}>
                <h3 style={{ margin: "0 0 14px", fontSize: 14, color: "#2c3e50" }}>Hours Overview</h3>
                <HoursBar used={totalUsed} planned={totalPlanned} po={project.poHours} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
                  {[["PO Hours", project.poHours, TEAL_DARK], ["Used", totalUsed, totalUsed>project.poHours?"#dc3545":TEAL], ["Remaining", hoursRemaining, hoursRemaining<0?"#dc3545":"#28a745"]].map(([l,v,c]) => (
                    <div key={l} style={{ textAlign: "center", padding: 12, background: "#f8f9fa", borderRadius: 8 }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{v}h</div>
                      <div style={{ fontSize: 11, color: "#6c757d" }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              {project.notes && (
                <div style={{ background: "#fffbea", borderRadius: 12, padding: 16, border: "1px solid #ffc107" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#856404", marginBottom: 6 }}>📝 PROJECT NOTES</div>
                  <div style={{ fontSize: 13, color: "#495057", lineHeight: 1.6 }}>{project.notes}</div>
                </div>
              )}
              {totalUsed > project.poHours && (
                <div style={{ background: "#f8d7da", borderRadius: 12, padding: 16, border: "1px solid #dc3545" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#721c24" }}>⚠ Hours Exceeded PO</div>
                  <div style={{ fontSize: 12, color: "#721c24", marginTop: 4 }}>Used hours ({totalUsed}h) exceed the PO ({project.poHours}h) by {totalUsed - project.poHours}h. Please discuss with OEM partner.</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CATEGORIES ── */}
        {tab === "categories" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {project.categories.map(cat => {
              const catDef = categories.find(c => c.id === cat.categoryId);
              const consultant = consultants.find(u => u.id === cat.assignedUserId);
              return (
                <div key={cat.categoryId} style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e9ecef" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "#2c3e50" }}>{catDef?.name}</span>
                      <StatusPill status={cat.status} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {cat.status !== "complete" && (
                        <button onClick={() => setLogHoursFor(cat.categoryId)} style={{ ...btnPrimary, padding: "6px 14px", fontSize: 11 }}>+ Log Hours</button>
                      )}
                      <select value={cat.status} onChange={e => updateCategoryStatus(cat.categoryId, e.target.value)}
                        style={{ border: "1px solid #ced4da", borderRadius: 6, padding: "6px 10px", fontSize: 11, cursor: "pointer" }}>
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="complete">Complete</option>
                      </select>
                    </div>
                  </div>
                  <HoursBar used={cat.usedHours} planned={cat.plannedHours} po={project.poHours} />
                  <div style={{ display: "flex", gap: 20, marginTop: 12, fontSize: 12, color: "#6c757d" }}>
                    <span>👤 {consultant?.name || "Unassigned"}</span>
                    {cat.plannedDate && <span>📅 Planned: {new Date(cat.plannedDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</span>}
                    {cat.completedDate && <span style={{ color: "#28a745" }}>✓ Completed: {new Date(cat.completedDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</span>}
                  </div>
                  {/* Log hours inline */}
                  {logHoursFor === cat.categoryId && (
                    <div style={{ marginTop: 14, padding: 14, background: TEAL_LIGHT, borderRadius: 8, display: "flex", gap: 10, alignItems: "flex-end" }}>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Hours to Log</label>
                        <input type="number" min="0.5" step="0.5" value={logHoursVal} onChange={e => setLogHoursVal(e.target.value)} style={{ ...inputStyle, width: 120 }} placeholder="e.g. 3.5" />
                      </div>
                      <div style={{ flex: 2 }}>
                        <label style={labelStyle}>Consultant</label>
                        <select value={logUserId} onChange={e => setLogUserId(e.target.value)} style={inputStyle}>
                          <option value="">— Select —</option>
                          {consultants.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                      </div>
                      <button onClick={logHours} style={btnPrimary}>Save</button>
                      <button onClick={() => setLogHoursFor(null)} style={btnGhost}>Cancel</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── MILESTONES ── */}
        {tab === "milestones" && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
              <button onClick={() => setAddMsModal(true)} style={btnPrimary}>+ Add Milestone</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {project.milestones.map(m => (
                <div key={m.id} style={{ background: "#fff", borderRadius: 10, padding: "14px 18px", border: "1px solid #e9ecef", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#2c3e50" }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: "#6c757d", marginTop: 3 }}>
                      {new Date(m.date).toLocaleDateString("en-GB",{weekday:"short",day:"2-digit",month:"short",year:"numeric"})}
                    </div>
                  </div>
                  <StatusPill status={m.status} />
                  <select value={m.status} onChange={e => updateMilestoneStatus(m.id, e.target.value)}
                    style={{ border: "1px solid #ced4da", borderRadius: 6, padding: "5px 8px", fontSize: 11 }}>
                    <option value="upcoming">Upcoming</option>
                    <option value="in-progress">In Progress</option>
                    <option value="complete">Complete</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DOCUMENTS ── */}
        {tab === "documents" && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
              <button onClick={() => setAddDocModal(true)} style={btnPrimary}>+ Add Document</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(project.documents||[]).map(doc => {
                const addedBy = consultants.find(u => u.id === doc.addedBy);
                return (
                  <div key={doc.id} style={{ background: "#fff", borderRadius: 10, padding: "14px 18px", border: "1px solid #e9ecef", display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 24 }}>📄</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#2c3e50" }}>{doc.name}</div>
                      <div style={{ fontSize: 11, color: "#6c757d", marginTop: 2 }}>Type: {doc.type} · Added by {addedBy?.name || "Unknown"} on {new Date(doc.addedDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</div>
                    </div>
                    <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 8, background: "#e9ecef", color: "#495057", fontWeight: 600 }}>{doc.type}</span>
                  </div>
                );
              })}
              {!(project.documents||[]).length && (
                <div style={{ textAlign: "center", padding: 32, color: "#6c757d", fontSize: 13 }}>No documents attached yet.</div>
              )}
            </div>
          </div>
        )}

        {/* ── TEAM ── */}
        {tab === "team" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
            {project.consultantIds.map(uid => {
              const u = consultants.find(c => c.id === uid);
              if (!u) return null;
              const isLead = uid === project.leadConsultantId;
              const cats = project.categories.filter(c => c.assignedUserId === uid);
              const hours = cats.reduce((s,c) => s + c.usedHours, 0);
              return (
                <div key={uid} style={{ background: "#fff", borderRadius: 12, padding: 20, border: `2px solid ${isLead ? TEAL : "#e9ecef"}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: TEAL, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700 }}>
                      {u.name.split(" ").map(n=>n[0]).join("")}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#2c3e50" }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: "#6c757d" }}>{u.role}</div>
                    </div>
                    {isLead && <span style={{ marginLeft: "auto", fontSize: 10, padding: "2px 8px", borderRadius: 10, background: TEAL_LIGHT, color: TEAL_DARK, fontWeight: 700 }}>Lead</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "#6c757d" }}>
                    <div>Assigned categories: {cats.length}</div>
                    <div>Hours logged: {hours}h</div>
                    <div style={{ marginTop: 6 }}>{u.email}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add milestone modal */}
      {addMsModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 400 }}>
            <h3 style={{ margin: "0 0 18px", fontSize: 15 }}>Add Milestone</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div><label style={labelStyle}>Milestone Name</label><input value={newMs.name} onChange={e=>setNewMs(p=>({...p,name:e.target.value}))} style={inputStyle} /></div>
              <div><label style={labelStyle}>Date</label><input type="date" value={newMs.date} onChange={e=>setNewMs(p=>({...p,date:e.target.value}))} style={inputStyle} /></div>
              <div><label style={labelStyle}>Status</label>
                <select value={newMs.status} onChange={e=>setNewMs(p=>({...p,status:e.target.value}))} style={inputStyle}>
                  <option value="upcoming">Upcoming</option><option value="in-progress">In Progress</option><option value="complete">Complete</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setAddMsModal(false)} style={btnGhost}>Cancel</button>
              <button onClick={addMilestone} style={btnPrimary}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Add document modal */}
      {addDocModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 400 }}>
            <h3 style={{ margin: "0 0 18px", fontSize: 15 }}>Add Document</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div><label style={labelStyle}>Document Name</label><input value={newDoc.name} onChange={e=>setNewDoc(p=>({...p,name:e.target.value}))} style={inputStyle} placeholder="e.g. Statement of Work v1.pdf" /></div>
              <div><label style={labelStyle}>Type</label>
                <select value={newDoc.type} onChange={e=>setNewDoc(p=>({...p,type:e.target.value}))} style={inputStyle}>
                  {["SOW","PO","Meeting","Sign-off","Instructions","Other"].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setAddDocModal(false)} style={btnGhost}>Cancel</button>
              <button onClick={addDocument} style={btnPrimary}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
