import { useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import ProjectDetail from "./ProjectDetail";
import Setup from "./Setup";
import { loadPSAData, savePSAData, buildInitialState } from "./data";

const TEAL = "#1a7f8e";
const TEAL_DARK = "#145f6b";
const TEAL_LIGHT = "#e8f4f6";

const inputStyle = { border:"1px solid #ced4da",borderRadius:6,padding:"7px 10px",fontSize:13,width:"100%",boxSizing:"border-box" };
const labelStyle = { fontSize:11,color:"#6c757d",fontWeight:600,marginBottom:3,display:"block" };
const btnPrimary = { background:TEAL,color:"#fff",border:"none",borderRadius:6,padding:"8px 18px",fontSize:12,cursor:"pointer",fontWeight:600 };
const btnGhost   = { background:"#f8f9fa",color:"#495057",border:"1px solid #ced4da",borderRadius:6,padding:"8px 18px",fontSize:12,cursor:"pointer",fontWeight:600 };

function AddProjectModal({ state, onClose, onAdd }) {
  const { customers, oemPartners, consultants, templates } = state;
  const [form, setForm] = useState({
    name:"", customerId:"", leadConsultantId:"", consultantIds:[],
    templateId:"", poHours:"", authorizedHours:"",
    startDate: new Date().toISOString().slice(0,10),
    targetDate:"", companies:1, users:1,
    multiCurrency:false, dedicatedServer:false,
    status:"not-started", notes:"",
  });
  const [step, setStep] = useState(1); // 1=basics, 2=team & hours, 3=confirm

  function toggleConsultant(id) {
    setForm(p=>({ ...p, consultantIds: p.consultantIds.includes(id) ? p.consultantIds.filter(x=>x!==id) : [...p.consultantIds, id] }));
  }

  function handleAdd() {
    if (!form.name || !form.customerId) return;
    // Build categories from template
    let categories = [];
    if (form.templateId) {
      const tmpl = templates.find(t=>t.id===form.templateId);
      if (tmpl) categories = tmpl.items.map(item=>({ categoryId:item.categoryId, subcategoryId:item.subcategoryId||null, plannedHours:item.hours, usedHours:0, status:"not-started", assignedUserId:null, hoursLog:[] }));
    }
    // Ensure lead is in consultantIds
    const consultantIds = form.leadConsultantId && !form.consultantIds.includes(form.leadConsultantId)
      ? [form.leadConsultantId, ...form.consultantIds]
      : form.consultantIds;

    const project = {
      id: "proj-"+Date.now(),
      ...form,
      poHours: parseFloat(form.poHours)||0,
      authorizedHours: parseFloat(form.authorizedHours)||parseFloat(form.poHours)||0,
      companies: parseInt(form.companies)||1,
      users: parseInt(form.users)||1,
      consultantIds,
      categories,
      milestones: [],
      documents: [],
    };
    onAdd(project);
  }

  const activeCustomers = customers;
  const activeConsultants = consultants.filter(u=>u.active!==false);

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ background:"#fff",borderRadius:14,width:580,maxHeight:"90vh",overflow:"auto",boxShadow:"0 8px 40px rgba(0,0,0,0.25)" }}>
        {/* Header */}
        <div style={{ background:TEAL,color:"#fff",padding:"18px 24px",borderRadius:"14px 14px 0 0" }}>
          <div style={{ fontWeight:800,fontSize:16 }}>Add New Project</div>
          <div style={{ display:"flex",gap:0,marginTop:12 }}>
            {["1. Basics","2. Team & Hours","3. Confirm"].map((l,i)=>(
              <div key={i} style={{ flex:1,textAlign:"center",fontSize:12,fontWeight:600,padding:"6px 0",borderBottom:step===i+1?"3px solid #fff":"3px solid rgba(255,255,255,0.3)",color:step===i+1?"#fff":"rgba(255,255,255,0.7)",cursor:"pointer" }} onClick={()=>setStep(i+1)}>{l}</div>
            ))}
          </div>
        </div>

        <div style={{ padding:24 }}>
          {step===1 && (
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div><label style={labelStyle}>Customer *</label>
                <select value={form.customerId} onChange={e=>{ const cust=activeCustomers.find(c=>c.id===e.target.value); setForm(p=>({...p,customerId:e.target.value,name:p.name||cust?.name||""})); }} style={inputStyle}>
                  <option value="">— Select customer —</option>
                  {activeCustomers.map(c=>{ const oem=oemPartners.find(o=>o.id===c.oemId); return <option key={c.id} value={c.id}>{c.name}{oem?` (${oem.name})`:""}</option>; })}
                </select>
              </div>
              <div><label style={labelStyle}>Project Name *</label><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={inputStyle} placeholder="Defaults to customer name" /></div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <div><label style={labelStyle}>Start Date</label><input type="date" value={form.startDate} onChange={e=>setForm(p=>({...p,startDate:e.target.value}))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Target Go-Live</label><input type="date" value={form.targetDate} onChange={e=>setForm(p=>({...p,targetDate:e.target.value}))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Companies</label><input type="number" min="1" value={form.companies} onChange={e=>setForm(p=>({...p,companies:e.target.value}))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Users</label><input type="number" min="1" value={form.users} onChange={e=>setForm(p=>({...p,users:e.target.value}))} style={inputStyle} /></div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <label style={{ display:"flex",alignItems:"center",gap:8,fontSize:13,cursor:"pointer" }}><input type="checkbox" checked={form.multiCurrency} onChange={e=>setForm(p=>({...p,multiCurrency:e.target.checked}))} />Multi-Currency</label>
                <label style={{ display:"flex",alignItems:"center",gap:8,fontSize:13,cursor:"pointer" }}><input type="checkbox" checked={form.dedicatedServer} onChange={e=>setForm(p=>({...p,dedicatedServer:e.target.checked}))} />Dedicated Server</label>
              </div>
              <div><label style={labelStyle}>Template (optional)</label>
                <select value={form.templateId} onChange={e=>setForm(p=>({...p,templateId:e.target.value}))} style={inputStyle}>
                  <option value="">— No template (add categories later) —</option>
                  {templates.map(t=><option key={t.id} value={t.id}>{t.name} ({t.totalHours}h)</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Initial Status</label>
                <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} style={inputStyle}>
                  <option value="not-started">Not Started</option>
                  <option value="active">Active</option>
                </select>
              </div>
              <div><label style={labelStyle}>Notes</label><textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} style={{ ...inputStyle,minHeight:70,resize:"vertical",fontFamily:"inherit" }} /></div>
            </div>
          )}

          {step===2 && (
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div><label style={labelStyle}>Lead Consultant</label>
                <select value={form.leadConsultantId} onChange={e=>setForm(p=>({...p,leadConsultantId:e.target.value}))} style={inputStyle}>
                  <option value="">— Select lead —</option>
                  {activeConsultants.map(u=><option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Team Members</label>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                  {activeConsultants.map(u=>(
                    <label key={u.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:8,border:`1px solid ${form.consultantIds.includes(u.id)||form.leadConsultantId===u.id?TEAL:"#e9ecef"}`,background:form.consultantIds.includes(u.id)||form.leadConsultantId===u.id?TEAL_LIGHT:"#fff",cursor:"pointer",fontSize:12 }}>
                      <input type="checkbox" checked={form.consultantIds.includes(u.id)||form.leadConsultantId===u.id} onChange={()=>{ if(form.leadConsultantId===u.id) return; toggleConsultant(u.id); }} />
                      <div><div style={{ fontWeight:600 }}>{u.name}</div><div style={{ fontSize:10,color:"#6c757d" }}>{u.role}{form.leadConsultantId===u.id?" · Lead":""}</div></div>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <div>
                  <label style={labelStyle}>PO Hours</label>
                  <input type="number" min="0" value={form.poHours}
                    onChange={e=>setForm(p=>({...p,poHours:e.target.value,authorizedHours:p.authorizedHours!==p.poHours?p.authorizedHours:e.target.value}))}
                    style={inputStyle} placeholder="e.g. 80" />
                </div>
                <div>
                  <label style={labelStyle}>Authorized Hours *</label>
                  <input type="number" min="0" value={form.authorizedHours}
                    onChange={e=>setForm(p=>({...p,authorizedHours:e.target.value}))}
                    style={{ ...inputStyle, borderColor: form.authorizedHours?"#ced4da":"#dc3545" }}
                    placeholder="Defaults to PO Hours" />
                  {!form.authorizedHours && <div style={{ fontSize:11,color:"#dc3545",marginTop:3 }}>Required</div>}
                </div>
              </div>
            </div>
          )}

          {step===3 && (
            <div>
              <div style={{ background:TEAL_LIGHT,borderRadius:10,padding:16,marginBottom:16 }}>
                <div style={{ fontWeight:700,fontSize:14,color:"#2c3e50",marginBottom:12 }}>Project Summary</div>
                {[
                  ["Customer", customers.find(c=>c.id===form.customerId)?.name||"—"],
                  ["Project Name", form.name||"—"],
                  ["Status", form.status],
                  ["Start", form.startDate||"—"],
                  ["Go-Live", form.targetDate||"—"],
                  ["Template", templates.find(t=>t.id===form.templateId)?.name||"None"],
                  ["Lead", consultants.find(u=>u.id===form.leadConsultantId)?.name||"—"],
                  ["Team size", form.consultantIds.length+(form.leadConsultantId&&!form.consultantIds.includes(form.leadConsultantId)?1:0)],
                  ["PO Hours", form.poHours||"—"],
                  ["Authorized Hours", form.authorizedHours||form.poHours||"—"],
                ].map(([k,v])=>(
                  <div key={k} style={{ display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #d4ecef",fontSize:13 }}>
                    <span style={{ color:"#6c757d",fontWeight:600 }}>{k}</span>
                    <span style={{ color:"#2c3e50" }}>{v}</span>
                  </div>
                ))}
              </div>
              {!form.name && <p style={{ color:"#dc3545",fontSize:12 }}>⚠ Project name is required.</p>}
              {!form.customerId && <p style={{ color:"#dc3545",fontSize:12 }}>⚠ Customer is required.</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:"14px 24px",borderTop:"1px solid #e9ecef",display:"flex",justifyContent:"space-between" }}>
          <button onClick={onClose} style={btnGhost}>Cancel</button>
          <div style={{ display:"flex",gap:10 }}>
            {step>1 && <button onClick={()=>setStep(p=>p-1)} style={btnGhost}>← Back</button>}
            {step<3 && <button onClick={()=>setStep(p=>p+1)} style={btnPrimary}>Next →</button>}
            {step===3 && <button onClick={handleAdd} disabled={!form.name||!form.customerId} style={{ ...btnPrimary,opacity:(!form.name||!form.customerId)?0.5:1 }}>Create Project</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectTracking() {
  const [state, setState] = useState(null);
  const [nav, setNav] = useState("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);

  useEffect(() => {
    loadPSAData().then(saved => {
      setState(saved || buildInitialState());
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded && state) savePSAData(state);
  }, [state, loaded]);

  function updateField(field, value) {
    setState(prev => ({ ...prev, [field]: value }));
  }

  function updateProject(updated) {
    setState(prev => ({ ...prev, projects: prev.projects.map(p => p.id===updated.id ? updated : p) }));
  }

  function addProject(project) {
    setState(prev => ({ ...prev, projects: [...prev.projects, project] }));
    setSelectedProjectId(project.id);
    setShowAddProject(false);
    setNav("dashboard");
  }

  function toggleProjectStatus(id, status) {
    setState(prev => ({ ...prev, projects: prev.projects.map(p => p.id===id ? { ...p, status } : p) }));
  }

  if (!state) return (
    <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:"#6c757d" }}>
      <div style={{ textAlign:"center" }}><div style={{ fontSize:32,marginBottom:12 }}>⏳</div><div>Loading project data...</div></div>
    </div>
  );

  const selectedProject = selectedProjectId ? state.projects.find(p=>p.id===selectedProjectId) : null;
  const activeProjects = state.projects.filter(p=>p.status==="active");

  const subNav = [
    { id:"dashboard", label:"Dashboard", icon:"🗂" },
    { id:"setup",     label:"Setup",     icon:"⚙" },
  ];

  return (
    <div style={{ flex:1,display:"flex",overflow:"hidden",fontFamily:"'Segoe UI', Arial, sans-serif",fontSize:13 }}>
      {/* Sub-sidebar */}
      <div style={{ width:180,background:"#f8f9fa",borderRight:"1px solid #dee2e6",padding:"12px 0",flexShrink:0,display:"flex",flexDirection:"column" }}>
        <div style={{ fontSize:10,fontWeight:700,color:"#6c757d",textTransform:"uppercase",letterSpacing:0.5,padding:"0 14px 8px" }}>Project Tracking</div>
        {subNav.map(s=>(
          <div key={s.id} onClick={()=>{ setNav(s.id); setSelectedProjectId(null); }}
            style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 14px",cursor:"pointer",fontSize:12,fontWeight:600,
              background:nav===s.id?TEAL_LIGHT:"transparent",color:nav===s.id?TEAL_DARK:"#495057",
              borderLeft:nav===s.id?`3px solid ${TEAL}`:"3px solid transparent" }}>
            <span>{s.icon}</span>{s.label}
          </div>
        ))}

        {/* Add Project button */}
        {nav==="dashboard" && (
          <div style={{ padding:"12px 14px",borderTop:"1px solid #dee2e6",marginTop:8 }}>
            <button onClick={()=>setShowAddProject(true)} style={{ ...btnPrimary,width:"100%",fontSize:11,padding:"7px 10px" }}>+ New Project</button>
          </div>
        )}

        {/* Quick project list */}
        {nav==="dashboard" && (
          <div style={{ marginTop:8,flex:1,overflow:"auto" }}>
            <div style={{ fontSize:10,fontWeight:700,color:"#6c757d",textTransform:"uppercase",letterSpacing:0.5,padding:"0 14px 8px" }}>Active Projects</div>
            {activeProjects.map(p=>(
              <div key={p.id} onClick={()=>{ setSelectedProjectId(p.id); setNav("dashboard"); }}
                style={{ padding:"8px 14px",cursor:"pointer",fontSize:11,fontWeight:600,
                  color:selectedProjectId===p.id?TEAL_DARK:"#495057",
                  background:selectedProjectId===p.id?TEAL_LIGHT:"transparent",
                  borderLeft:selectedProjectId===p.id?`3px solid ${TEAL}`:"3px solid transparent",
                  whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}
                title={p.name}>
                {p.name.split("—")[0].trim()}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      {nav==="dashboard" && !selectedProject && <Dashboard state={state} onSelectProject={id=>setSelectedProjectId(id)} />}
      {nav==="dashboard" && selectedProject && <ProjectDetail project={selectedProject} state={state} onUpdate={updateProject} onBack={()=>setSelectedProjectId(null)} />}
      {nav==="setup" && <Setup state={state} onUpdate={updateField} />}

      {showAddProject && <AddProjectModal state={state} onClose={()=>setShowAddProject(false)} onAdd={addProject} />}
    </div>
  );
}
