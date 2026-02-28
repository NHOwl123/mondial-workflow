// ─── AdminPage.jsx ────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { createUser, updateUser, resetPassword, toggleUserActive, deleteUser, fullName } from "./auth";
import { loadBackups, createBackup, restoreBackup, deleteBackup, loadPSAData, savePSAData, buildInitialState } from "./ProjectTracking/data";

const TEAL       = "#1a7f8e";
const TEAL_DARK  = "#145f6b";
const TEAL_LIGHT = "#e8f4f6";

const inp  = { border:"1px solid #ced4da", borderRadius:6, padding:"8px 11px", fontSize:13, width:"100%", boxSizing:"border-box", fontFamily:"inherit" };
const lbl  = { fontSize:11, color:"#6c757d", fontWeight:600, marginBottom:4, display:"block" };
const btnP = { background:TEAL, color:"#fff", border:"none", borderRadius:6, padding:"8px 18px", fontSize:12, cursor:"pointer", fontWeight:600 };
const btnG = { background:"#f8f9fa", color:"#495057", border:"1px solid #ced4da", borderRadius:6, padding:"8px 18px", fontSize:12, cursor:"pointer", fontWeight:600 };
const btnD = { background:"#fff", color:"#dc3545", border:"1px solid #dc3545", borderRadius:6, padding:"6px 12px", fontSize:11, cursor:"pointer", fontWeight:600 };

function Modal({ title, onClose, onSave, saveLabel="Save", children, width=480 }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:12, padding:28, width, maxHeight:"88vh", overflow:"auto", boxShadow:"0 8px 40px rgba(0,0,0,0.22)" }}>
        <h3 style={{ margin:"0 0 20px", fontSize:15, color:"#2c3e50" }}>{title}</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:13 }}>{children}</div>
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:24 }}>
          <button onClick={onClose} style={btnG}>Cancel</button>
          <button onClick={onSave}  style={btnP}>{saveLabel}</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel, confirmLabel="Confirm", danger=false }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:2100, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:12, padding:28, width:400, boxShadow:"0 8px 40px rgba(0,0,0,0.22)" }}>
        <p style={{ fontSize:14, color:"#2c3e50", marginTop:0, lineHeight:1.6 }}>{message}</p>
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button onClick={onCancel}  style={btnG}>Cancel</button>
          <button onClick={onConfirm} style={danger ? {...btnP, background:"#dc3545"} : btnP}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const s = role === "administrator"
    ? { bg:"#d4edda", color:"#155724", border:"#28a745", label:"Administrator" }
    : { bg:"#cce5ff", color:"#004085", border:"#0066cc", label:"User" };
  return <span style={{ fontSize:10, padding:"2px 9px", borderRadius:10, background:s.bg, color:s.color, border:`1px solid ${s.border}`, fontWeight:700 }}>{s.label}</span>;
}

function StatusBadge({ active }) {
  return (
    <span style={{ fontSize:10, padding:"2px 9px", borderRadius:10, fontWeight:700,
      background: active ? "#d4edda" : "#e9ecef",
      color:      active ? "#155724" : "#6c757d",
      border:    `1px solid ${active ? "#28a745" : "#ced4da"}` }}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function UserForm({ form, setForm, isEdit=false }) {
  const [showPw, setShowPw] = useState(false);
  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div><label style={lbl}>First Name *</label><input value={form.firstName} onChange={e=>setForm(p=>({...p,firstName:e.target.value}))} style={inp} /></div>
        <div><label style={lbl}>Last Name *</label><input value={form.lastName} onChange={e=>setForm(p=>({...p,lastName:e.target.value}))} style={inp} /></div>
      </div>
      <div>
        <label style={lbl}>Email address *</label>
        <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} style={inp} disabled={isEdit} />
        {isEdit && <div style={{ fontSize:11, color:"#6c757d", marginTop:3 }}>Email address cannot be changed.</div>}
      </div>
      {!isEdit && (
        <div>
          <label style={lbl}>Initial Password *</label>
          <div style={{ position:"relative" }}>
            <input type={showPw?"text":"password"} value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} style={{ ...inp, paddingRight:40 }} placeholder="Min. 8 characters" />
            <button type="button" onClick={()=>setShowPw(p=>!p)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:15, color:"#6c757d", padding:0 }}>
              {showPw?"🙈":"👁"}
            </button>
          </div>
        </div>
      )}
      <div>
        <label style={lbl}>Role *</label>
        <select value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))} style={inp}>
          <option value="user">User</option>
          <option value="administrator">Administrator</option>
        </select>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10, padding:"12px 14px", background:"#f8f9fa", borderRadius:8, border:"1px solid #e9ecef" }}>
        <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer", fontSize:13 }}>
          <input type="checkbox" checked={form.testFeatures} onChange={e=>setForm(p=>({...p,testFeatures:e.target.checked}))} style={{ marginTop:2, flexShrink:0 }} />
          <div><div style={{ fontWeight:600 }}>Access test features</div><div style={{ fontSize:11, color:"#6c757d", marginTop:1 }}>Period-End Close, Reports, Accounting Adjustments, Enterprise Set Up</div></div>
        </label>
        <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer", fontSize:13 }}>
          <input type="checkbox" checked={form.isConsultant} onChange={e=>setForm(p=>({...p,isConsultant:e.target.checked}))} style={{ marginTop:2, flexShrink:0 }} />
          <div><div style={{ fontWeight:600 }}>Is a consultant</div><div style={{ fontSize:11, color:"#6c757d", marginTop:1 }}>Appears in the consultant list and can be assigned to projects</div></div>
        </label>
      </div>
    </>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab({ users, currentUser, onUsersChange }) {
  const blankForm = { firstName:"", lastName:"", email:"", password:"", role:"user", testFeatures:false, isConsultant:false };
  const [showAdd,    setShowAdd]    = useState(false);
  const [editUser,   setEditUser]   = useState(null);
  const [resetUser,  setResetUser]  = useState(null);
  const [newPw,      setNewPw]      = useState("");
  const [showNewPw,  setShowNewPw]  = useState(false);
  const [confirmAct, setConfirmAct] = useState(null);
  const [addForm,    setAddForm]    = useState(blankForm);
  const [editForm,   setEditForm]   = useState(null);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");

  function flash(msg) { setSuccess(msg); setTimeout(()=>setSuccess(""), 3500); }
  function err(msg)   { setError(msg);   setTimeout(()=>setError(""),   4000); }

  async function handleAdd() {
    setError("");
    if (!addForm.firstName.trim()||!addForm.lastName.trim()) { err("First and last name are required."); return; }
    if (!addForm.email.trim())    { err("Email address is required."); return; }
    if (!addForm.password||addForm.password.length<8) { err("Password must be at least 8 characters."); return; }
    try {
      const updated = await createUser(users, addForm);
      onUsersChange(updated);
      setAddForm(blankForm);
      setShowAdd(false);
      flash(`User ${addForm.firstName} ${addForm.lastName} created successfully.`);
    } catch (e) { err(e.message); }
  }

  function openEdit(u) {
    setEditForm({ firstName:u.firstName, lastName:u.lastName, email:u.email, role:u.role, testFeatures:u.testFeatures, isConsultant:u.isConsultant });
    setEditUser(u);
  }
  function handleEdit() {
    setError("");
    if (!editForm.firstName.trim()||!editForm.lastName.trim()) { err("First and last name are required."); return; }
    try {
      const updated = updateUser(users, editUser.id, { firstName:editForm.firstName.trim(), lastName:editForm.lastName.trim(), role:editForm.role, testFeatures:editForm.testFeatures, isConsultant:editForm.isConsultant });
      onUsersChange(updated);
      setEditUser(null);
      flash("User updated successfully.");
    } catch (e) { err(e.message); }
  }

  async function handleResetPw() {
    if (!newPw||newPw.length<8) { err("New password must be at least 8 characters."); return; }
    try {
      const updated = await resetPassword(users, resetUser.id, newPw);
      onUsersChange(updated);
      setResetUser(null); setNewPw("");
      flash(`Password reset for ${fullName(resetUser)}.`);
    } catch (e) { err(e.message); }
  }

  function handleToggleActive(u) {
    try {
      const updated = toggleUserActive(users, u.id);
      onUsersChange(updated);
      flash(`${fullName(u)} ${u.active?"deactivated":"reactivated"}.`);
    } catch (e) { err(e.message); }
    setConfirmAct(null);
  }
  function handleDelete(u) {
    try {
      const updated = deleteUser(users, u.id);
      onUsersChange(updated);
      flash(`${fullName(u)} deleted.`);
    } catch (e) { err(e.message); }
    setConfirmAct(null);
  }

  const sorted = [...users].sort((a,b) => {
    if (a.role!==b.role) return a.role==="administrator"?-1:1;
    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
  });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <p style={{ margin:0, fontSize:13, color:"#6c757d" }}>
          {users.filter(u=>u.active).length} active user{users.filter(u=>u.active).length!==1?"s":""} · {users.filter(u=>u.role==="administrator").length} administrator{users.filter(u=>u.role==="administrator").length!==1?"s":""}
        </p>
        <button onClick={()=>{ setAddForm(blankForm); setShowAdd(true); }} style={btnP}>+ Add User</button>
      </div>

      {success && <div style={{ background:"#d4edda", border:"1px solid #28a745", borderRadius:8, padding:"10px 16px", fontSize:13, color:"#155724", fontWeight:600 }}>✓ {success}</div>}
      {error   && <div style={{ background:"#f8d7da", border:"1px solid #dc3545", borderRadius:8, padding:"10px 16px", fontSize:13, color:"#721c24" }}>⚠ {error}</div>}

      <div style={{ overflow:"auto", background:"#fff", borderRadius:12, border:"1px solid #e9ecef" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:TEAL, color:"#fff" }}>
              {["Name","Email","Role","Status","Test Features","Consultant","Actions"].map(h=>(
                <th key={h} style={{ padding:"11px 14px", textAlign:"left", fontWeight:600, fontSize:11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((u,i) => {
              const isMe = u.id===currentUser.id;
              return (
                <tr key={u.id} style={{ background:i%2===0?"#fff":"#f8f9fa", borderBottom:"1px solid #f0f2f4" }}>
                  <td style={{ padding:"12px 14px", fontWeight:700, color:"#2c3e50" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:32, height:32, borderRadius:"50%", background:TEAL, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 }}>
                        {(u.firstName?.[0]||"")+(u.lastName?.[0]||"")}
                      </div>
                      <div>
                        {fullName(u)}
                        {isMe && <span style={{ marginLeft:6, fontSize:10, background:TEAL_LIGHT, color:TEAL_DARK, padding:"1px 6px", borderRadius:8, fontWeight:600 }}>You</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"12px 14px", color:"#6c757d" }}>{u.email}</td>
                  <td style={{ padding:"12px 14px" }}><RoleBadge role={u.role} /></td>
                  <td style={{ padding:"12px 14px" }}><StatusBadge active={u.active} /></td>
                  <td style={{ padding:"12px 14px", textAlign:"center" }}>{u.testFeatures?"✓":"—"}</td>
                  <td style={{ padding:"12px 14px", textAlign:"center" }}>{u.isConsultant?"✓":"—"}</td>
                  <td style={{ padding:"12px 14px" }}>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      <button onClick={()=>openEdit(u)} style={{ ...btnG, padding:"4px 11px", fontSize:11 }}>Edit</button>
                      <button onClick={()=>{ setResetUser(u); setNewPw(""); }} style={{ ...btnG, padding:"4px 11px", fontSize:11 }}>Reset PW</button>
                      {!isMe && (
                        <>
                          <button onClick={()=>setConfirmAct({ type:"toggle", user:u })} style={{ ...btnG, padding:"4px 11px", fontSize:11, color:u.active?"#856404":"#155724" }}>
                            {u.active?"Deactivate":"Activate"}
                          </button>
                          <button onClick={()=>setConfirmAct({ type:"delete", user:u })} style={{ ...btnD, padding:"4px 10px" }}>Delete</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAdd && <Modal title="Add New User" onClose={()=>setShowAdd(false)} onSave={handleAdd} saveLabel="Create User"><UserForm form={addForm} setForm={setAddForm} /></Modal>}
      {editUser && editForm && <Modal title={`Edit User — ${fullName(editUser)}`} onClose={()=>setEditUser(null)} onSave={handleEdit}><UserForm form={editForm} setForm={setEditForm} isEdit /></Modal>}
      {resetUser && (
        <Modal title={`Reset Password — ${fullName(resetUser)}`} onClose={()=>setResetUser(null)} onSave={handleResetPw} saveLabel="Reset Password">
          <p style={{ fontSize:13, color:"#6c757d", margin:0 }}>Set a new temporary password for <strong>{fullName(resetUser)}</strong>.</p>
          <div>
            <label style={lbl}>New Password *</label>
            <div style={{ position:"relative" }}>
              <input type={showNewPw?"text":"password"} value={newPw} onChange={e=>setNewPw(e.target.value)} style={{ ...inp, paddingRight:40 }} placeholder="Min. 8 characters" />
              <button type="button" onClick={()=>setShowNewPw(p=>!p)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:15, color:"#6c757d", padding:0 }}>
                {showNewPw?"🙈":"👁"}
              </button>
            </div>
          </div>
        </Modal>
      )}
      {confirmAct?.type==="toggle" && (
        <ConfirmModal
          message={confirmAct.user.active ? `Deactivate ${fullName(confirmAct.user)}? They will no longer be able to log in.` : `Reactivate ${fullName(confirmAct.user)}? They will be able to log in again.`}
          confirmLabel={confirmAct.user.active?"Deactivate":"Reactivate"} danger={confirmAct.user.active}
          onConfirm={()=>handleToggleActive(confirmAct.user)} onCancel={()=>setConfirmAct(null)} />
      )}
      {confirmAct?.type==="delete" && (
        <ConfirmModal message={`Permanently delete ${fullName(confirmAct.user)}? This cannot be undone.`} confirmLabel="Delete" danger
          onConfirm={()=>handleDelete(confirmAct.user)} onCancel={()=>setConfirmAct(null)} />
      )}
    </div>
  );
}

// ─── Data Management Tab ──────────────────────────────────────────────────────
function DataTab() {
  const [backups,     setBackups]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [working,     setWorking]     = useState(false);
  const [success,     setSuccess]     = useState("");
  const [error,       setError]       = useState("");
  const [confirmAct,  setConfirmAct]  = useState(null);

  function flash(msg) { setSuccess(msg); setTimeout(()=>setSuccess(""), 4000); }
  function err(msg)   { setError(msg);   setTimeout(()=>setError(""),   5000); }

  useEffect(() => {
    loadBackups().then(b => { setBackups(b); setLoading(false); });
  }, []);

  async function handleCreateBackup() {
    setWorking(true);
    try {
      const data = await loadPSAData();
      if (!data) { err("No data found to back up."); setWorking(false); return; }
      const label = `Manual — ${new Date().toLocaleString("en-GB")}`;
      const updated = await createBackup(data, label);
      setBackups(updated);
      flash("Backup created successfully.");
    } catch (e) { err("Backup failed: " + e.message); }
    setWorking(false);
  }

 async function handleRestore(backupId) {
  setWorking(true);
  try {
    const current = await loadPSAData();
    if (current) {
      const label = `Pre-restore backup — ${new Date().toLocaleString("en-GB")}`;
      const updated = await createBackup(current, label);
      setBackups(updated);
    }
    await restoreBackup(backupId);
    flash("Data restored successfully. Refresh the page to see the changes.");
  } catch (e) { err("Restore failed: " + e.message); }
  setWorking(false);
  setConfirmAct(null);
}

  async function handleDelete(backupId) {
    setWorking(true);
    try {
      const updated = await deleteBackup(backupId);
      setBackups(updated);
      flash("Backup deleted.");
    } catch (e) { err("Delete failed: " + e.message); }
    setWorking(false);
    setConfirmAct(null);
  }

  async function handleReset() {
    setWorking(true);
    try {
      // Auto-backup before reset
      const current = await loadPSAData();
      if (current) {
        const label = `Pre-reset backup — ${new Date().toLocaleString("en-GB")}`;
        const updated = await createBackup(current, label);
        setBackups(updated);
      }
      await savePSAData(buildInitialState());
      flash("Data reset to seed data. A backup of your previous data was saved automatically. Refresh the page.");
    } catch (e) { err("Reset failed: " + e.message); }
    setWorking(false);
    setConfirmAct(null);
  }

  async function handleExport() {
    try {
      const data = await loadPSAData();
      if (!data) { err("No data to export."); return; }
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type:"application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `mondial-data-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      flash("Data exported successfully.");
    } catch (e) { err("Export failed: " + e.message); }
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      // Basic validation
      if (!data.projects || !data.customers) { err("Invalid data file — missing required fields."); return; }
      // Auto-backup before import
      const current = await loadPSAData();
      if (current) {
        const label = `Pre-import backup — ${new Date().toLocaleString("en-GB")}`;
        const updated = await createBackup(current, label);
        setBackups(updated);
      }
      await savePSAData(data);
      flash("Data imported successfully. Refresh the page to see the changes.");
    } catch (e) { err("Import failed — invalid JSON file."); }
    e.target.value = "";
  }

  const fmtDate = iso => new Date(iso).toLocaleString("en-GB", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {success && <div style={{ background:"#d4edda", border:"1px solid #28a745", borderRadius:8, padding:"10px 16px", fontSize:13, color:"#155724", fontWeight:600 }}>✓ {success}</div>}
      {error   && <div style={{ background:"#f8d7da", border:"1px solid #dc3545", borderRadius:8, padding:"10px 16px", fontSize:13, color:"#721c24" }}>⚠ {error}</div>}

      {/* Backups */}
      <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e9ecef", padding:20 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:"#2c3e50" }}>Backups</div>
            <div style={{ fontSize:12, color:"#6c757d", marginTop:2 }}>Up to 3 backups are kept. Oldest are removed automatically.</div>
          </div>
          <button onClick={handleCreateBackup} disabled={working} style={{ ...btnP, opacity:working?0.6:1 }}>
            {working?"Working…":"+ Create Backup"}
          </button>
        </div>

        {loading && <div style={{ color:"#6c757d", fontSize:13 }}>Loading backups…</div>}
        {!loading && backups.length===0 && (
          <div style={{ color:"#6c757d", fontSize:13, fontStyle:"italic", padding:"12px 0" }}>No backups yet. Create one manually or they will be created automatically before resets and imports.</div>
        )}
        {!loading && backups.map((b, i) => (
          <div key={b.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderTop: i===0?"none":"1px solid #f0f2f4" }}>
            <div>
              <div style={{ fontWeight:600, fontSize:13, color:"#2c3e50" }}>{b.label}</div>
              <div style={{ fontSize:11, color:"#6c757d", marginTop:2 }}>{fmtDate(b.timestamp)}</div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>setConfirmAct({ type:"restore", id:b.id, label:b.label })} style={{ ...btnG, padding:"5px 12px", fontSize:11 }}>Restore</button>
              <button onClick={()=>setConfirmAct({ type:"deleteBackup", id:b.id, label:b.label })} style={{ ...btnD, padding:"5px 10px" }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Export / Import */}
      <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e9ecef", padding:20 }}>
        <div style={{ fontWeight:700, fontSize:14, color:"#2c3e50", marginBottom:4 }}>Export / Import</div>
        <div style={{ fontSize:12, color:"#6c757d", marginBottom:16 }}>Download a copy of all project data as a JSON file, or re-import a previously exported file.</div>
        <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
          <button onClick={handleExport} style={btnG}>⬇ Export Data</button>
          <label style={{ ...btnG, cursor:"pointer", display:"inline-block" }}>
            ⬆ Import Data
            <input type="file" accept=".json" onChange={handleImport} style={{ display:"none" }} />
          </label>
        </div>
      </div>

      {/* Reset to seed data */}
      <div style={{ background:"#fff", borderRadius:12, border:"1px solid #fee2e2", padding:20 }}>
        <div style={{ fontWeight:700, fontSize:14, color:"#dc3545", marginBottom:4 }}>Reset to Seed Data</div>
        <div style={{ fontSize:12, color:"#6c757d", marginBottom:16 }}>Wipes all project data and restores the original demo dataset. A backup of your current data will be saved automatically before the reset. User accounts are never affected.</div>
        <button onClick={()=>setConfirmAct({ type:"reset" })} style={{ ...btnP, background:"#dc3545" }}>Reset to Seed Data</button>
      </div>

      {/* Confirm modals */}
      {confirmAct?.type==="restore" && (
        <ConfirmModal
          message={`Restore from backup "${confirmAct.label}"? This will overwrite your current data. A backup of your current data will be saved first.`}
          confirmLabel="Restore" danger
          onConfirm={()=>handleRestore(confirmAct.id)}
          onCancel={()=>setConfirmAct(null)} />
      )}
      {confirmAct?.type==="deleteBackup" && (
        <ConfirmModal
          message={`Delete backup "${confirmAct.label}"? This cannot be undone.`}
          confirmLabel="Delete" danger
          onConfirm={()=>handleDelete(confirmAct.id)}
          onCancel={()=>setConfirmAct(null)} />
      )}
      {confirmAct?.type==="reset" && (
        <ConfirmModal
          message="Reset all project data to the original seed dataset? Your current data will be backed up automatically first. User accounts will not be affected."
          confirmLabel="Reset Data" danger
          onConfirm={handleReset}
          onCancel={()=>setConfirmAct(null)} />
      )}
    </div>
  );
}

// ─── Main AdminPage ───────────────────────────────────────────────────────────
export default function AdminPage({ users, currentUser, onUsersChange }) {
  const [tab, setTab] = useState("users");

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", padding:24, gap:16, background:"#f4f6f9", fontFamily:"'Segoe UI', Arial, sans-serif" }}>
      {/* Header */}
      <div>
        <h2 style={{ margin:0, fontSize:20, color:"#2c3e50", fontWeight:800 }}>Admin</h2>
        <p style={{ margin:"4px 0 0", fontSize:13, color:"#6c757d" }}>Manage users and application data.</p>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:"2px solid #dee2e6", gap:0 }}>
        {[["users","👥 User Management"],["data","🗄 Data Management"]].map(([id,label])=>(
          <div key={id} onClick={()=>setTab(id)}
            style={{ padding:"10px 20px", cursor:"pointer", fontSize:13, fontWeight:600,
              color: tab===id ? TEAL : "#6c757d",
              borderBottom: tab===id ? `2px solid ${TEAL}` : "2px solid transparent",
              marginBottom:-2 }}>
            {label}
          </div>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex:1, overflow:"auto" }}>
        {tab==="users" && <UsersTab users={users} currentUser={currentUser} onUsersChange={onUsersChange} />}
        {tab==="data"  && <DataTab />}
      </div>
    </div>
  );
}