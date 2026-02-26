import { useState, useRef } from "react";

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
  const labels = { complete:"Complete","in-progress":"In Progress","not-started":"Not Started",upcoming:"Upcoming" };
  return <span style={{ fontSize:10,padding:"2px 8px",borderRadius:10,background:s.bg,color:s.color,border:`1px solid ${s.border}`,fontWeight:700 }}>{labels[status]||status}</span>;
}

function HoursBar({ used, planned, po }) {
  const pct = planned > 0 ? Math.min((used/planned)*100,100) : 0;
  const over = used > po;
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,color:"#6c757d",marginBottom:4 }}>
        <span>{used}h used of {planned}h planned</span>
        <span style={{ color:over?"#dc3545":"#6c757d",fontWeight:over?700:400 }}>{planned>0?Math.round(used/planned*100):0}%{over?" ⚠ Exceeds PO":""}</span>
      </div>
      <div style={{ background:"#e9ecef",borderRadius:4,height:8 }}>
        <div style={{ width:`${pct}%`,height:"100%",background:over?"#dc3545":pct>75?"#ffc107":TEAL,borderRadius:4 }} />
      </div>
    </div>
  );
}

const inputStyle = { border:"1px solid #ced4da",borderRadius:6,padding:"7px 10px",fontSize:13,width:"100%",boxSizing:"border-box" };
const labelStyle = { fontSize:11,color:"#6c757d",fontWeight:600,marginBottom:3,display:"block" };
const btnPrimary = { background:TEAL,color:"#fff",border:"none",borderRadius:6,padding:"8px 18px",fontSize:12,cursor:"pointer",fontWeight:600 };
const btnGhost   = { background:"#f8f9fa",color:"#495057",border:"1px solid #ced4da",borderRadius:6,padding:"8px 18px",fontSize:12,cursor:"pointer",fontWeight:600 };
const btnDanger  = { background:"#fff",color:"#dc3545",border:"1px solid #dc3545",borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer" };

function Modal({ title, onClose, onSave, saveLabel="Save", children, width=440 }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ background:"#fff",borderRadius:12,padding:28,width,maxHeight:"85vh",overflow:"auto",boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
        <h3 style={{ margin:"0 0 18px",fontSize:15,color:"#2c3e50" }}>{title}</h3>
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>{children}</div>
        <div style={{ display:"flex",gap:10,justifyContent:"flex-end",marginTop:22 }}>
          <button onClick={onClose} style={btnGhost}>Cancel</button>
          <button onClick={onSave} style={btnPrimary}>{saveLabel}</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ background:"#fff",borderRadius:12,padding:28,width:380,boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
        <p style={{ fontSize:14,color:"#2c3e50",marginTop:0 }}>{message}</p>
        <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
          <button onClick={onCancel} style={btnGhost}>Cancel</button>
          <button onClick={onConfirm} style={{ ...btnPrimary,background:"#dc3545" }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ project, state, onUpdate }) {
  const { customers, oemPartners } = state;
  const customer = customers.find(c => c.id === project.customerId);
  const oem = oemPartners.find(o => o.id === customer?.oemId);
  const totalPlanned = project.categories.reduce((s,c)=>s+(c.plannedHours||0),0);
  const totalUsed    = project.categories.reduce((s,c)=>s+(c.usedHours||0),0);
  const hoursRemaining = project.poHours - totalUsed;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [editNotes, setEditNotes] = useState(false);
  const [notesVal, setNotesVal] = useState(project.notes||"");
  const [confirmDeleteNotes, setConfirmDeleteNotes] = useState(false);

  function startEdit() {
    setForm({
      name: project.name,
      status: project.status,
      startDate: project.startDate,
      targetDate: project.targetDate,
      companies: project.companies,
      users: project.users,
      multiCurrency: project.multiCurrency,
      dedicatedServer: project.dedicatedServer,
      poHours: project.poHours,
      anticipatedHours: project.anticipatedHours,
      customerId: project.customerId,
    });
    setEditing(true);
  }
  function saveEdit() {
    onUpdate({ ...project, ...form, poHours: parseFloat(form.poHours)||0, anticipatedHours: parseFloat(form.anticipatedHours)||0, companies: parseInt(form.companies)||0, users: parseInt(form.users)||0 });
    setEditing(false);
  }
  function saveNotes() {
    onUpdate({ ...project, notes: notesVal });
    setEditNotes(false);
  }
  function deleteNotes() {
    onUpdate({ ...project, notes: "" });
    setNotesVal("");
    setConfirmDeleteNotes(false);
    setEditNotes(false);
  }

  const fields = [
    ["Status", project.status.charAt(0).toUpperCase()+project.status.slice(1)],
    ["Customer", customer?.name||"—"],
    ["OEM Partner", oem?.name||"—"],
    ["Start Date", new Date(project.startDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})],
    ["Target Go-Live", new Date(project.targetDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})],
    ["Companies", project.companies],
    ["Users", project.users],
    ["Multi-Currency", project.multiCurrency?"Yes":"No"],
    ["Dedicated Server", project.dedicatedServer?"Yes":"No"],
    ["PO Hours", `${project.poHours}h`],
    ["Anticipated Hours", `${project.anticipatedHours}h`],
  ];

  return (
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>
      {/* Summary card */}
      <div style={{ background:"#fff",borderRadius:12,padding:20,border:"1px solid #e9ecef" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
          <h3 style={{ margin:0,fontSize:14,color:"#2c3e50" }}>Project Summary</h3>
          <button onClick={startEdit} style={{ ...btnGhost,padding:"4px 12px",fontSize:11 }}>✎ Edit</button>
        </div>
        {fields.map(([k,v])=>(
          <div key={k} style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f0f2f4",fontSize:13 }}>
            <span style={{ color:"#6c757d",fontWeight:600 }}>{k}</span>
            <span style={{ color:"#2c3e50",fontWeight:500 }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
        {/* Hours */}
        <div style={{ background:"#fff",borderRadius:12,padding:20,border:"1px solid #e9ecef" }}>
          <h3 style={{ margin:"0 0 14px",fontSize:14,color:"#2c3e50" }}>Hours Overview</h3>
          <HoursBar used={totalUsed} planned={totalPlanned} po={project.poHours} />
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:16 }}>
            {[["PO Hours",project.poHours,TEAL_DARK],["Used",totalUsed,totalUsed>project.poHours?"#dc3545":TEAL],["Remaining",hoursRemaining,hoursRemaining<0?"#dc3545":"#28a745"]].map(([l,v,c])=>(
              <div key={l} style={{ textAlign:"center",padding:12,background:"#f8f9fa",borderRadius:8 }}>
                <div style={{ fontSize:22,fontWeight:800,color:c }}>{v}h</div>
                <div style={{ fontSize:11,color:"#6c757d" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ background: project.notes?"#fffbea":"#f8f9fa",borderRadius:12,padding:16,border:`1px solid ${project.notes?"#ffc107":"#e9ecef"}` }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
            <div style={{ fontSize:11,fontWeight:700,color:project.notes?"#856404":"#6c757d" }}>📝 PROJECT NOTES</div>
            <div style={{ display:"flex",gap:6 }}>
              <button onClick={()=>{setNotesVal(project.notes||"");setEditNotes(true);}} style={{ ...btnGhost,padding:"3px 10px",fontSize:11 }}>✎ Edit</button>
              {project.notes && <button onClick={()=>setConfirmDeleteNotes(true)} style={{ ...btnDanger,padding:"3px 10px" }}>Delete</button>}
            </div>
          </div>
          {editNotes ? (
            <div>
              <textarea value={notesVal} onChange={e=>setNotesVal(e.target.value)} style={{ ...inputStyle,minHeight:80,resize:"vertical",fontFamily:"inherit" }} />
              <div style={{ display:"flex",gap:8,marginTop:8 }}>
                <button onClick={saveNotes} style={{ ...btnPrimary,padding:"5px 14px",fontSize:11 }}>Save</button>
                <button onClick={()=>setEditNotes(false)} style={{ ...btnGhost,padding:"5px 12px",fontSize:11 }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ fontSize:13,color:"#495057",lineHeight:1.6 }}>{project.notes||<em style={{color:"#adb5bd"}}>No notes. Click Edit to add.</em>}</div>
          )}
        </div>

        {totalUsed > project.poHours && (
          <div style={{ background:"#f8d7da",borderRadius:12,padding:16,border:"1px solid #dc3545" }}>
            <div style={{ fontSize:12,fontWeight:700,color:"#721c24" }}>⚠ Hours Exceeded PO</div>
            <div style={{ fontSize:12,color:"#721c24",marginTop:4 }}>Used hours ({totalUsed}h) exceed the PO ({project.poHours}h) by {totalUsed-project.poHours}h.</div>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <Modal title="Edit Project Details" onClose={()=>setEditing(false)} onSave={saveEdit} width={520}>
          <div><label style={labelStyle}>Project Name</label><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={inputStyle} /></div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div><label style={labelStyle}>Start Date</label><input type="date" value={form.startDate} onChange={e=>setForm(p=>({...p,startDate:e.target.value}))} style={inputStyle} /></div>
            <div><label style={labelStyle}>Target Go-Live</label><input type="date" value={form.targetDate} onChange={e=>setForm(p=>({...p,targetDate:e.target.value}))} style={inputStyle} /></div>
            <div><label style={labelStyle}>PO Hours</label><input type="number" value={form.poHours} onChange={e=>setForm(p=>({...p,poHours:e.target.value}))} style={inputStyle} /></div>
            <div><label style={labelStyle}>Anticipated Hours</label><input type="number" value={form.anticipatedHours} onChange={e=>setForm(p=>({...p,anticipatedHours:e.target.value}))} style={inputStyle} /></div>
            <div><label style={labelStyle}>Companies</label><input type="number" value={form.companies} onChange={e=>setForm(p=>({...p,companies:e.target.value}))} style={inputStyle} /></div>
            <div><label style={labelStyle}>Users</label><input type="number" value={form.users} onChange={e=>setForm(p=>({...p,users:e.target.value}))} style={inputStyle} /></div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <label style={{ display:"flex",alignItems:"center",gap:8,fontSize:13 }}>
              <input type="checkbox" checked={form.multiCurrency} onChange={e=>setForm(p=>({...p,multiCurrency:e.target.checked}))} />Multi-Currency
            </label>
            <label style={{ display:"flex",alignItems:"center",gap:8,fontSize:13 }}>
              <input type="checkbox" checked={form.dedicatedServer} onChange={e=>setForm(p=>({...p,dedicatedServer:e.target.checked}))} />Dedicated Server
            </label>
          </div>
          <div><label style={labelStyle}>Status</label>
            <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} style={inputStyle}>
              <option value="not-started">Not Started</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </Modal>
      )}
      {confirmDeleteNotes && <ConfirmModal message="Are you sure you want to delete the project notes? This cannot be undone." onConfirm={deleteNotes} onCancel={()=>setConfirmDeleteNotes(false)} />}
    </div>
  );
}

// ── Team Tab ──────────────────────────────────────────────────────────────────
function TeamTab({ project, state, onUpdate }) {
  const { consultants } = state;
  const [addModal, setAddModal] = useState(false);
  const [addId, setAddId] = useState("");
  const [newLeadId, setNewLeadId] = useState(project.leadConsultantId);

  const available = consultants.filter(u => !project.consultantIds.includes(u.id) && u.active !== false);

  function addMember() {
    if (!addId) return;
    onUpdate({ ...project, consultantIds: [...project.consultantIds, addId] });
    setAddId(""); setAddModal(false);
  }
  function removeMember(uid) {
    if (uid === project.leadConsultantId) return;
    onUpdate({ ...project, consultantIds: project.consultantIds.filter(id=>id!==uid) });
  }
  function saveLead() {
    onUpdate({ ...project, leadConsultantId: newLeadId });
  }

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
        <div style={{ fontSize:12,color:"#6c757d" }}>Team members listed here are available to be assigned to categories.</div>
        <button onClick={()=>setAddModal(true)} style={btnPrimary}>+ Add Member</button>
      </div>

      {/* Lead selector */}
      <div style={{ background:"#fff",borderRadius:10,padding:16,border:"1px solid #e9ecef",marginBottom:16,display:"flex",alignItems:"center",gap:12 }}>
        <span style={{ fontSize:12,fontWeight:600,color:"#6c757d",whiteSpace:"nowrap" }}>Lead Consultant:</span>
        <select value={newLeadId} onChange={e=>setNewLeadId(e.target.value)} style={{ ...inputStyle,width:"auto",flex:1 }}>
          {project.consultantIds.map(uid=>{ const u=consultants.find(c=>c.id===uid); return u?<option key={uid} value={uid}>{u.name}</option>:null; })}
        </select>
        <button onClick={saveLead} style={{ ...btnPrimary,padding:"6px 14px",fontSize:11,whiteSpace:"nowrap" }}>Save Lead</button>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16 }}>
        {project.consultantIds.map(uid=>{
          const u = consultants.find(c=>c.id===uid);
          if (!u) return null;
          const isLead = uid===project.leadConsultantId;
          const cats = project.categories.filter(c=>c.assignedUserId===uid);
          const hours = cats.reduce((s,c)=>s+c.usedHours,0);
          return (
            <div key={uid} style={{ background:"#fff",borderRadius:12,padding:20,border:`2px solid ${isLead?TEAL:"#e9ecef"}` }}>
              <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:12 }}>
                <div style={{ width:40,height:40,borderRadius:"50%",background:TEAL,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700 }}>
                  {u.name.split(" ").map(n=>n[0]).join("")}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700,fontSize:13,color:"#2c3e50" }}>{u.name}</div>
                  <div style={{ fontSize:11,color:"#6c757d" }}>{u.role}</div>
                </div>
                {isLead && <span style={{ fontSize:10,padding:"2px 8px",borderRadius:10,background:TEAL_LIGHT,color:TEAL_DARK,fontWeight:700 }}>Lead</span>}
              </div>
              <div style={{ fontSize:12,color:"#6c757d" }}>
                <div>Assigned categories: {cats.length}</div>
                <div>Hours logged: {hours}h</div>
                {u.billRate && <div>Rate: {u.billCurrency||"GBP"} {u.billRate}/hr</div>}
              </div>
              {!isLead && (
                <button onClick={()=>removeMember(uid)} style={{ ...btnDanger,marginTop:12,fontSize:11,padding:"4px 10px" }}>Remove</button>
              )}
            </div>
          );
        })}
      </div>

      {addModal && (
        <Modal title="Add Team Member" onClose={()=>setAddModal(false)} onSave={addMember} saveLabel="Add">
          <div><label style={labelStyle}>Select Consultant</label>
            <select value={addId} onChange={e=>setAddId(e.target.value)} style={inputStyle}>
              <option value="">— Select —</option>
              {available.map(u=><option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}
            </select>
          </div>
          {available.length===0 && <p style={{ fontSize:12,color:"#6c757d" }}>All active consultants are already on this project.</p>}
        </Modal>
      )}
    </div>
  );
}

// ── Categories Tab ────────────────────────────────────────────────────────────
function CategoriesTab({ project, state, onUpdate }) {
  const { categories, subcategories, consultants, templates } = state;
  const teamConsultants = consultants.filter(u => project.consultantIds.includes(u.id));

  // drag refs for category rows and sub-category rows
  const dragCatIdx = useRef(null);
  const dragSubKey = useRef(null); // "catId::subId"

  const [logModal, setLogModal] = useState(null); // { catId, subId }
  const [logEntry, setLogEntry] = useState({ userId:"", hours:"", date: new Date().toISOString().slice(0,10) });
  const [addCatModal, setAddCatModal] = useState(false);
  const [addCatId, setAddCatId] = useState("");
  const [addSubModal, setAddSubModal] = useState(null); // catId
  const [addSubId, setAddSubId] = useState("");
  const [editPlanned, setEditPlanned] = useState(null); // { catId, subId, val }
  const [applyTmplModal, setApplyTmplModal] = useState(false);
  const [tmplId, setTmplId] = useState("");

  // Flatten project categories into a structured list
  // project.categories: [{ categoryId, subcategoryId?, plannedHours, usedHours, status, assignedUserId, hoursLog:[] }]
  const cats = project.categories;

  function getConsultantName(uid) {
    const u = teamConsultants.find(c=>c.id===uid);
    return u ? u.name : "—";
  }

  function updateCat(catId, subId, changes) {
    onUpdate({ ...project, categories: project.categories.map(c =>
      c.categoryId===catId && (subId===undefined ? !c.subcategoryId : c.subcategoryId===subId)
        ? { ...c, ...changes } : c
    )});
  }

  function logHours() {
    if (!logEntry.userId||!logEntry.hours) return;
    const hrs = parseFloat(logEntry.hours);
    if (isNaN(hrs)||hrs<=0) return;
    const { catId, subId } = logModal;
    const updated = project.categories.map(c => {
      if (c.categoryId!==catId || (subId ? c.subcategoryId!==subId : c.subcategoryId)) return c;
      const log = [...(c.hoursLog||[]), { userId: logEntry.userId, hours: hrs, date: logEntry.date }];
      const usedHours = log.reduce((s,l)=>s+l.hours,0);
      return { ...c, hoursLog: log, usedHours, status: "in-progress" };
    });
    onUpdate({ ...project, categories: updated });
    setLogModal(null); setLogEntry({ userId:"",hours:"",date:new Date().toISOString().slice(0,10) });
  }

  function deleteLogEntry(catId, subId, idx) {
    const updated = project.categories.map(c => {
      if (c.categoryId!==catId || (subId ? c.subcategoryId!==subId : c.subcategoryId)) return c;
      const log = (c.hoursLog||[]).filter((_,i)=>i!==idx);
      return { ...c, hoursLog: log, usedHours: log.reduce((s,l)=>s+l.hours,0) };
    });
    onUpdate({ ...project, categories: updated });
  }

  function savePlanned() {
    if (!editPlanned) return;
    updateCat(editPlanned.catId, editPlanned.subId, { plannedHours: parseFloat(editPlanned.val)||0 });
    setEditPlanned(null);
  }

  function removeCatRow(catId, subId) {
    onUpdate({ ...project, categories: project.categories.filter(c =>
      !(c.categoryId===catId && (subId ? c.subcategoryId===subId : !c.subcategoryId))
    )});
  }

  function addCategory() {
    if (!addCatId) return;
    if (project.categories.some(c=>c.categoryId===addCatId && !c.subcategoryId)) { setAddCatModal(false); return; }
    onUpdate({ ...project, categories: [...project.categories, { categoryId:addCatId, subcategoryId:null, plannedHours:0, usedHours:0, status:"not-started", assignedUserId:null, hoursLog:[] }]});
    setAddCatId(""); setAddCatModal(false);
  }

  function addSubcategory() {
    if (!addSubId || !addSubModal) return;
    onUpdate({ ...project, categories: [...project.categories, { categoryId:addSubModal, subcategoryId:addSubId, plannedHours:0, usedHours:0, status:"not-started", assignedUserId:null, hoursLog:[] }]});
    setAddSubId(""); setAddSubModal(null);
  }

  function applyTemplate() {
    if (!tmplId) return;
    const tmpl = templates.find(t=>t.id===tmplId);
    if (!tmpl) return;
    const newCats = tmpl.items.map(item=>({ categoryId:item.categoryId, subcategoryId:item.subcategoryId||null, plannedHours:item.hours, usedHours:0, status:"not-started", assignedUserId:null, hoursLog:[] }));
    onUpdate({ ...project, categories: newCats, templateId: tmplId });
    setApplyTmplModal(false);
  }

  // Drag category order
  function onDragCatStart(idx) { dragCatIdx.current = idx; }
  function onDropCat(idx) {
    if (dragCatIdx.current===null||dragCatIdx.current===idx) return;
    const arr = [...project.categories];
    const [moved] = arr.splice(dragCatIdx.current,1);
    arr.splice(idx,0,moved);
    onUpdate({ ...project, categories: arr });
    dragCatIdx.current = null;
  }

  // Move sub to another cat
  function moveSubToCat(subId, fromCatId, toCatId) {
    onUpdate({ ...project, categories: project.categories.map(c =>
      c.categoryId===fromCatId && c.subcategoryId===subId ? { ...c, categoryId: toCatId } : c
    )});
  }

  // Group for display
  const catIds = [...new Set(cats.map(c=>c.categoryId))];

  return (
    <div>
      <div style={{ display:"flex",gap:8,marginBottom:16,flexWrap:"wrap" }}>
        <button onClick={()=>setApplyTmplModal(true)} style={btnGhost}>📋 Apply Template</button>
        <button onClick={()=>setAddCatModal(true)} style={btnPrimary}>+ Add Category</button>
      </div>

      {/* Grid header */}
      <div style={{ background:"#fff",borderRadius:12,border:"1px solid #e9ecef",overflow:"hidden" }}>
        <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
          <thead>
            <tr style={{ background:TEAL,color:"#fff" }}>
              <th style={{ padding:"10px 12px",textAlign:"left",fontWeight:600,fontSize:11,width:28 }}></th>
              <th style={{ padding:"10px 12px",textAlign:"left",fontWeight:600,fontSize:11 }}>Category / Sub-category</th>
              <th style={{ padding:"10px 12px",textAlign:"center",fontWeight:600,fontSize:11,width:100 }}>Assigned To</th>
              <th style={{ padding:"10px 12px",textAlign:"center",fontWeight:600,fontSize:11,width:110 }}>Planned Hrs</th>
              <th style={{ padding:"10px 12px",textAlign:"center",fontWeight:600,fontSize:11,width:90 }}>Used Hrs</th>
              <th style={{ padding:"10px 12px",textAlign:"center",fontWeight:600,fontSize:11,width:110 }}>Status</th>
              <th style={{ padding:"10px 12px",textAlign:"center",fontWeight:600,fontSize:11,width:120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {catIds.map((catId, catGroupIdx) => {
              const catDef = categories.find(c=>c.id===catId);
              const catRows = cats.filter(c=>c.categoryId===catId);
              const catMain = catRows.find(c=>!c.subcategoryId);
              const catSubs = catRows.filter(c=>c.subcategoryId);
              const totalUsed = catRows.reduce((s,c)=>s+c.usedHours,0);
              const totalPlanned = catRows.reduce((s,c)=>s+(c.plannedHours||0),0);
              const unusedSubs = subcategories.filter(s=>s.categoryId===catId && !cats.some(c=>c.subcategoryId===s.id));

              return [
                // Category header row
                <tr key={`cat-${catId}`}
                  draggable
                  onDragStart={()=>onDragCatStart(catGroupIdx)}
                  onDragOver={e=>e.preventDefault()}
                  onDrop={()=>onDropCat(catGroupIdx)}
                  style={{ background:TEAL_LIGHT,borderBottom:"1px solid #dee2e6",cursor:"grab" }}>
                  <td style={{ padding:"8px 6px",textAlign:"center",color:"#adb5bd",fontSize:14 }}>⠿</td>
                  <td style={{ padding:"10px 12px",fontWeight:700,fontSize:13,color:TEAL_DARK }}>
                    {catDef?.name||catId}
                    <span style={{ marginLeft:8,fontSize:10,color:"#6c757d",fontWeight:400 }}>{totalUsed}h / {totalPlanned}h</span>
                  </td>
                  <td colSpan={3}></td>
                  <td></td>
                  <td style={{ padding:"8px 12px",textAlign:"center" }}>
                    <button onClick={()=>setAddSubModal(catId)} style={{ ...btnGhost,padding:"3px 8px",fontSize:10 }}>+ Sub</button>
                  </td>
                </tr>,

                // Cat main row (if exists)
                ...catMain ? [
                  <tr key={`catmain-${catId}`} style={{ borderBottom:"1px solid #f0f2f4",background:"#fff" }}>
                    <td></td>
                    <td style={{ padding:"8px 12px",fontSize:12,color:"#495057",paddingLeft:24 }}>
                      <em style={{ color:"#adb5bd" }}>Category total</em>
                    </td>
                    <td style={{ padding:"8px 12px",textAlign:"center" }}>
                      <select value={catMain.assignedUserId||""} onChange={e=>updateCat(catId,undefined,{assignedUserId:e.target.value||null})} style={{ fontSize:11,border:"1px solid #ced4da",borderRadius:4,padding:"3px 6px" }}>
                        <option value="">—</option>
                        {teamConsultants.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:"8px 12px",textAlign:"center" }}>
                      {editPlanned?.catId===catId && !editPlanned?.subId
                        ? <div style={{ display:"flex",gap:4,justifyContent:"center" }}>
                            <input type="number" value={editPlanned.val} onChange={e=>setEditPlanned(p=>({...p,val:e.target.value}))} style={{ width:60,border:"1px solid #ced4da",borderRadius:4,padding:"3px 6px",fontSize:12,textAlign:"center" }} />
                            <button onClick={savePlanned} style={{ ...btnPrimary,padding:"2px 6px",fontSize:10 }}>✓</button>
                          </div>
                        : <span onClick={()=>setEditPlanned({catId,subId:undefined,val:catMain.plannedHours})} style={{ cursor:"pointer",color:TEAL_DARK,fontWeight:700,textDecoration:"underline dotted" }}>{catMain.plannedHours}h</span>
                      }
                    </td>
                    <td style={{ padding:"8px 12px",textAlign:"center",fontWeight:700,color:catMain.usedHours>catMain.plannedHours?"#dc3545":TEAL_DARK }}>{catMain.usedHours}h</td>
                    <td style={{ padding:"8px 12px",textAlign:"center" }}>
                      <select value={catMain.status} onChange={e=>updateCat(catId,undefined,{status:e.target.value})} style={{ fontSize:11,border:"1px solid #ced4da",borderRadius:4,padding:"3px 6px" }}>
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="complete">Complete</option>
                      </select>
                    </td>
                    <td style={{ padding:"8px 12px",textAlign:"center" }}>
                      <div style={{ display:"flex",gap:4,justifyContent:"center" }}>
                        <button onClick={()=>setLogModal({catId,subId:null})} style={{ ...btnPrimary,padding:"3px 8px",fontSize:10 }}>+ Log</button>
                        <button onClick={()=>removeCatRow(catId,null)} style={{ ...btnDanger,padding:"3px 6px",fontSize:10 }}>✕</button>
                      </div>
                    </td>
                  </tr>
                ] : [],

                // Sub-category rows
                ...catSubs.map((cat, subIdx) => {
                  const subDef = subcategories.find(s=>s.id===cat.subcategoryId);
                  return (
                    <tr key={`sub-${catId}-${cat.subcategoryId}`}
                      style={{ borderBottom:"1px solid #f0f2f4",background:subIdx%2===0?"#fff":"#fafbfc" }}>
                      <td></td>
                      <td style={{ padding:"8px 12px",paddingLeft:32,fontSize:12,color:"#495057" }}>
                        ↳ {subDef?.name||cat.subcategoryId}
                        <select onChange={e=>{ if(e.target.value) moveSubToCat(cat.subcategoryId,catId,e.target.value); }} defaultValue="" style={{ marginLeft:8,fontSize:10,border:"1px solid #ced4da",borderRadius:4,padding:"2px 4px",color:"#6c757d" }}>
                          <option value="">Move to…</option>
                          {catIds.filter(id=>id!==catId).map(id=>{ const cd=categories.find(c=>c.id===id); return <option key={id} value={id}>{cd?.name}</option>; })}
                        </select>
                      </td>
                      <td style={{ padding:"8px 12px",textAlign:"center" }}>
                        <select value={cat.assignedUserId||""} onChange={e=>updateCat(catId,cat.subcategoryId,{assignedUserId:e.target.value||null})} style={{ fontSize:11,border:"1px solid #ced4da",borderRadius:4,padding:"3px 6px" }}>
                          <option value="">—</option>
                          {teamConsultants.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                      </td>
                      <td style={{ padding:"8px 12px",textAlign:"center" }}>
                        {editPlanned?.catId===catId && editPlanned?.subId===cat.subcategoryId
                          ? <div style={{ display:"flex",gap:4,justifyContent:"center" }}>
                              <input type="number" value={editPlanned.val} onChange={e=>setEditPlanned(p=>({...p,val:e.target.value}))} style={{ width:60,border:"1px solid #ced4da",borderRadius:4,padding:"3px 6px",fontSize:12,textAlign:"center" }} />
                              <button onClick={savePlanned} style={{ ...btnPrimary,padding:"2px 6px",fontSize:10 }}>✓</button>
                            </div>
                          : <span onClick={()=>setEditPlanned({catId,subId:cat.subcategoryId,val:cat.plannedHours})} style={{ cursor:"pointer",color:TEAL_DARK,fontWeight:700,textDecoration:"underline dotted" }}>{cat.plannedHours}h</span>
                        }
                      </td>
                      <td style={{ padding:"8px 12px",textAlign:"center",fontWeight:700,color:cat.usedHours>cat.plannedHours?"#dc3545":TEAL_DARK }}>{cat.usedHours}h</td>
                      <td style={{ padding:"8px 12px",textAlign:"center" }}>
                        <select value={cat.status} onChange={e=>updateCat(catId,cat.subcategoryId,{status:e.target.value})} style={{ fontSize:11,border:"1px solid #ced4da",borderRadius:4,padding:"3px 6px" }}>
                          <option value="not-started">Not Started</option>
                          <option value="in-progress">In Progress</option>
                          <option value="complete">Complete</option>
                        </select>
                      </td>
                      <td style={{ padding:"8px 12px",textAlign:"center" }}>
                        <div style={{ display:"flex",gap:4,justifyContent:"center" }}>
                          <button onClick={()=>setLogModal({catId,subId:cat.subcategoryId})} style={{ ...btnPrimary,padding:"3px 8px",fontSize:10 }}>+ Log</button>
                          <button onClick={()=>removeCatRow(catId,cat.subcategoryId)} style={{ ...btnDanger,padding:"3px 6px",fontSize:10 }}>✕</button>
                        </div>
                      </td>
                    </tr>
                  );
                }),

                // Hours log detail rows
                ...catRows.flatMap(cat => (cat.hoursLog||[]).length>0 ? [
                  <tr key={`log-${catId}-${cat.subcategoryId||"main"}`} style={{ background:"#f8f9fa" }}>
                    <td colSpan={7} style={{ padding:"4px 12px 4px 48px" }}>
                      <div style={{ fontSize:11,color:"#6c757d" }}>
                        {(cat.hoursLog||[]).map((l,i)=>{
                          const u=consultants.find(c=>c.id===l.userId);
                          return (
                            <span key={i} style={{ marginRight:12,display:"inline-flex",alignItems:"center",gap:4 }}>
                              👤 {u?.name||"?"} — {l.hours}h on {l.date}
                              <button onClick={()=>deleteLogEntry(catId,cat.subcategoryId,i)} style={{ fontSize:10,border:"none",background:"none",cursor:"pointer",color:"#dc3545",padding:0 }}>✕</button>
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ] : [])
              ];
            })}
          </tbody>
        </table>
      </div>

      {/* Log Hours Modal */}
      {logModal && (
        <Modal title="Log Hours" onClose={()=>setLogModal(null)} onSave={logHours} saveLabel="Log Hours">
          <div><label style={labelStyle}>Consultant</label>
            <select value={logEntry.userId} onChange={e=>setLogEntry(p=>({...p,userId:e.target.value}))} style={inputStyle}>
              <option value="">— Select —</option>
              {teamConsultants.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Hours</label><input type="number" min="0.5" step="0.5" value={logEntry.hours} onChange={e=>setLogEntry(p=>({...p,hours:e.target.value}))} style={inputStyle} /></div>
          <div><label style={labelStyle}>Date</label><input type="date" value={logEntry.date} onChange={e=>setLogEntry(p=>({...p,date:e.target.value}))} style={inputStyle} /></div>
        </Modal>
      )}

      {/* Apply Template Modal */}
      {applyTmplModal && (
        <Modal title="Apply Template" onClose={()=>setApplyTmplModal(false)} onSave={applyTemplate} saveLabel="Apply">
          <p style={{ fontSize:12,color:"#6c757d",margin:0 }}>⚠ Applying a template will replace the current category list. Hours already logged will be lost.</p>
          <div><label style={labelStyle}>Template</label>
            <select value={tmplId} onChange={e=>setTmplId(e.target.value)} style={inputStyle}>
              <option value="">— Select template —</option>
              {templates.map(t=><option key={t.id} value={t.id}>{t.name} ({t.totalHours}h)</option>)}
            </select>
          </div>
        </Modal>
      )}

      {/* Add Category Modal */}
      {addCatModal && (
        <Modal title="Add Category" onClose={()=>setAddCatModal(false)} onSave={addCategory} saveLabel="Add">
          <div><label style={labelStyle}>Category</label>
            <select value={addCatId} onChange={e=>setAddCatId(e.target.value)} style={inputStyle}>
              <option value="">— Select —</option>
              {categories.filter(c=>!catIds.includes(c.id)).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </Modal>
      )}

      {/* Add Sub-category Modal */}
      {addSubModal && (
        <Modal title="Add Sub-category" onClose={()=>setAddSubModal(null)} onSave={addSubcategory} saveLabel="Add">
          <div><label style={labelStyle}>Sub-category</label>
            <select value={addSubId} onChange={e=>setAddSubId(e.target.value)} style={inputStyle}>
              <option value="">— Select —</option>
              {subcategories.filter(s=>s.categoryId===addSubModal && !cats.some(c=>c.subcategoryId===s.id)).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Milestones Tab ────────────────────────────────────────────────────────────
function MilestonesTab({ project, onUpdate }) {
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [newMs, setNewMs] = useState({ name:"",date:"",status:"upcoming" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const dragIdx = useRef(null);

  function addMilestone() {
    if (!newMs.name||!newMs.date) return;
    onUpdate({ ...project, milestones: [...project.milestones, { ...newMs, id:"ms-"+Date.now() }]});
    setNewMs({ name:"",date:"",status:"upcoming" }); setAddModal(false);
  }
  function saveEdit() {
    onUpdate({ ...project, milestones: project.milestones.map(m=>m.id===editModal.id?{...editModal}:m)});
    setEditModal(null);
  }
  function deleteMilestone(id) {
    onUpdate({ ...project, milestones: project.milestones.filter(m=>m.id!==id)});
    setConfirmDelete(null);
  }
  function onDragStart(idx) { dragIdx.current=idx; }
  function onDrop(idx) {
    if (dragIdx.current===null||dragIdx.current===idx) return;
    const arr=[...project.milestones];
    const [moved]=arr.splice(dragIdx.current,1);
    arr.splice(idx,0,moved);
    onUpdate({ ...project, milestones:arr });
    dragIdx.current=null;
  }

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:14 }}>
        <button onClick={()=>setAddModal(true)} style={btnPrimary}>+ Add Milestone</button>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
        {project.milestones.map((m,i)=>(
          <div key={m.id} draggable
            onDragStart={()=>onDragStart(i)}
            onDragOver={e=>e.preventDefault()}
            onDrop={()=>onDrop(i)}
            style={{ background:"#fff",borderRadius:10,padding:"12px 16px",border:"1px solid #e9ecef",display:"flex",alignItems:"center",gap:12,cursor:"grab" }}>
            <span style={{ color:"#adb5bd",fontSize:16 }}>⠿</span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700,fontSize:13,color:"#2c3e50" }}>{m.name}</div>
              <div style={{ fontSize:12,color:"#6c757d",marginTop:2 }}>
                {new Date(m.date).toLocaleDateString("en-GB",{weekday:"short",day:"2-digit",month:"short",year:"numeric"})}
              </div>
            </div>
            <StatusPill status={m.status} />
            <button onClick={()=>setEditModal({...m})} style={{ ...btnGhost,padding:"4px 10px",fontSize:11 }}>Edit</button>
            <button onClick={()=>setConfirmDelete(m.id)} style={{ ...btnDanger,padding:"4px 10px" }}>Delete</button>
          </div>
        ))}
      </div>

      {addModal && (
        <Modal title="Add Milestone" onClose={()=>setAddModal(false)} onSave={addMilestone} saveLabel="Add">
          <div><label style={labelStyle}>Name</label><input value={newMs.name} onChange={e=>setNewMs(p=>({...p,name:e.target.value}))} style={inputStyle} /></div>
          <div><label style={labelStyle}>Date</label><input type="date" value={newMs.date} onChange={e=>setNewMs(p=>({...p,date:e.target.value}))} style={inputStyle} /></div>
          <div><label style={labelStyle}>Status</label>
            <select value={newMs.status} onChange={e=>setNewMs(p=>({...p,status:e.target.value}))} style={inputStyle}>
              <option value="upcoming">Upcoming</option><option value="in-progress">In Progress</option><option value="complete">Complete</option>
            </select>
          </div>
        </Modal>
      )}

      {editModal && (
        <Modal title="Edit Milestone" onClose={()=>setEditModal(null)} onSave={saveEdit}>
          <div><label style={labelStyle}>Name</label><input value={editModal.name} onChange={e=>setEditModal(p=>({...p,name:e.target.value}))} style={inputStyle} /></div>
          <div><label style={labelStyle}>Date</label><input type="date" value={editModal.date} onChange={e=>setEditModal(p=>({...p,date:e.target.value}))} style={inputStyle} /></div>
          <div><label style={labelStyle}>Status</label>
            <select value={editModal.status} onChange={e=>setEditModal(p=>({...p,status:e.target.value}))} style={inputStyle}>
              <option value="upcoming">Upcoming</option><option value="in-progress">In Progress</option><option value="complete">Complete</option>
            </select>
          </div>
        </Modal>
      )}

      {confirmDelete && <ConfirmModal message="Are you sure you want to delete this milestone?" onConfirm={()=>deleteMilestone(confirmDelete)} onCancel={()=>setConfirmDelete(null)} />}
    </div>
  );
}

// ── Documents Tab ─────────────────────────────────────────────────────────────
function DocumentsTab({ project, state, onUpdate }) {
  const { consultants } = state;
  const [addModal, setAddModal] = useState(false);
  const [newDoc, setNewDoc] = useState({ name:"",type:"SOW" });
  const [confirmDelete, setConfirmDelete] = useState(null);

  function addDocument() {
    if (!newDoc.name) return;
    const doc = { ...newDoc, id:"doc-"+Date.now(), addedBy:"usr-5", addedDate:new Date().toISOString().slice(0,10) };
    onUpdate({ ...project, documents:[...(project.documents||[]),doc]});
    setNewDoc({ name:"",type:"SOW" }); setAddModal(false);
  }
  function deleteDocument(id) {
    onUpdate({ ...project, documents:(project.documents||[]).filter(d=>d.id!==id)});
    setConfirmDelete(null);
  }

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:14 }}>
        <button onClick={()=>setAddModal(true)} style={btnPrimary}>+ Add Document</button>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
        {(project.documents||[]).map(doc=>{
          const addedBy=consultants.find(u=>u.id===doc.addedBy);
          return (
            <div key={doc.id} style={{ background:"#fff",borderRadius:10,padding:"14px 18px",border:"1px solid #e9ecef",display:"flex",alignItems:"center",gap:14 }}>
              <span style={{ fontSize:24 }}>📄</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700,fontSize:13,color:"#2c3e50" }}>{doc.name}</div>
                <div style={{ fontSize:11,color:"#6c757d",marginTop:2 }}>Type: {doc.type} · Added by {addedBy?.name||"Unknown"} on {new Date(doc.addedDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</div>
              </div>
              <span style={{ fontSize:10,padding:"3px 10px",borderRadius:8,background:"#e9ecef",color:"#495057",fontWeight:600 }}>{doc.type}</span>
              <button onClick={()=>setConfirmDelete(doc.id)} style={{ ...btnDanger,padding:"5px 10px" }}>Delete</button>
            </div>
          );
        })}
        {!(project.documents||[]).length && <div style={{ textAlign:"center",padding:32,color:"#6c757d",fontSize:13 }}>No documents attached yet.</div>}
      </div>

      {addModal && (
        <Modal title="Add Document" onClose={()=>setAddModal(false)} onSave={addDocument} saveLabel="Add">
          <div><label style={labelStyle}>Document Name</label><input value={newDoc.name} onChange={e=>setNewDoc(p=>({...p,name:e.target.value}))} style={inputStyle} placeholder="e.g. Statement of Work v1.pdf" /></div>
          <div><label style={labelStyle}>Type</label>
            <select value={newDoc.type} onChange={e=>setNewDoc(p=>({...p,type:e.target.value}))} style={inputStyle}>
              {["SOW","PO","Meeting","Sign-off","Instructions","Other"].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
        </Modal>
      )}
      {confirmDelete && <ConfirmModal message="Are you sure you want to delete this document? This cannot be undone." onConfirm={()=>deleteDocument(confirmDelete)} onCancel={()=>setConfirmDelete(null)} />}
    </div>
  );
}

// ── Main ProjectDetail ────────────────────────────────────────────────────────
export default function ProjectDetail({ project, state, onUpdate, onBack }) {
  const { customers, oemPartners } = state;
  const [tab, setTab] = useState("overview");

  const customer = customers.find(c=>c.id===project.customerId);
  const oem = oemPartners.find(o=>{ const cust=customers.find(c=>c.id===project.customerId); return o.id===cust?.oemId; });
  const totalUsed = project.categories.reduce((s,c)=>s+c.usedHours,0);
  const hoursRemaining = project.poHours - totalUsed;
  const today = new Date();
  const daysLeft = Math.ceil((new Date(project.targetDate)-today)/86400000);

  const tabs = ["overview","team","categories","milestones","documents"];

  return (
    <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:"#f4f6f9" }}>
      {/* Header */}
      <div style={{ background:"#fff",borderBottom:"1px solid #dee2e6",padding:"14px 24px" }}>
        <button onClick={onBack} style={{ background:"none",border:"none",cursor:"pointer",color:TEAL,fontSize:12,fontWeight:600,marginBottom:8,padding:0 }}>← Back to Dashboard</button>
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between" }}>
          <div>
            <h2 style={{ margin:0,fontSize:20,color:"#2c3e50",fontWeight:800 }}>{project.name}</h2>
            <div style={{ fontSize:12,color:"#6c757d",marginTop:4 }}>{customer?.name} · {oem?.name} · Target: {new Date(project.targetDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</div>
          </div>
          <div style={{ display:"flex",gap:16,alignItems:"center" }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:11,color:"#6c757d" }}>Hours remaining</div>
              <div style={{ fontSize:20,fontWeight:800,color:hoursRemaining<0?"#dc3545":TEAL_DARK }}>{hoursRemaining}h</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:11,color:"#6c757d" }}>Days to go-live</div>
              <div style={{ fontSize:20,fontWeight:800,color:daysLeft<0?"#dc3545":daysLeft<14?"#856404":TEAL_DARK }}>{Math.abs(daysLeft)}{daysLeft<0?" overdue":""}</div>
            </div>
          </div>
        </div>
        <div style={{ display:"flex",gap:0,marginTop:14 }}>
          {tabs.map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{ padding:"8px 20px",border:"none",borderBottom:tab===t?`2px solid ${TEAL}`:"2px solid transparent",background:"none",cursor:"pointer",fontSize:13,fontWeight:600,color:tab===t?TEAL:"#6c757d",textTransform:"capitalize" }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex:1,overflow:"auto",padding:24 }}>
        {tab==="overview"    && <OverviewTab   project={project} state={state} onUpdate={onUpdate} />}
        {tab==="team"        && <TeamTab       project={project} state={state} onUpdate={onUpdate} />}
        {tab==="categories"  && <CategoriesTab project={project} state={state} onUpdate={onUpdate} />}
        {tab==="milestones"  && <MilestonesTab project={project} onUpdate={onUpdate} />}
        {tab==="documents"   && <DocumentsTab  project={project} state={state} onUpdate={onUpdate} />}
      </div>
    </div>
  );
}
