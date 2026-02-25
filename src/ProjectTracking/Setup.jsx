import { useState } from "react";

const TEAL = "#1a7f8e";
const TEAL_DARK = "#145f6b";
const TEAL_LIGHT = "#e8f4f6";

const inputStyle = { border: "1px solid #ced4da", borderRadius: 6, padding: "7px 10px", fontSize: 13, width: "100%", boxSizing: "border-box" };
const labelStyle = { fontSize: 11, color: "#6c757d", fontWeight: 600, marginBottom: 3, display: "block" };
const btnPrimary = { background: TEAL, color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontSize: 12, cursor: "pointer", fontWeight: 600 };
const btnGhost   = { background: "#f8f9fa", color: "#495057", border: "1px solid #ced4da", borderRadius: 6, padding: "8px 18px", fontSize: 12, cursor: "pointer", fontWeight: 600 };
const btnDanger  = { background: "#fff", color: "#dc3545", border: "1px solid #dc3545", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer" };

function Section({ title, children, action }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e9ecef", overflow: "hidden", marginBottom: 20 }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #e9ecef", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8f9fa" }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#2c3e50" }}>{title}</span>
        {action}
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function Modal({ title, onClose, onSave, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 460, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
        <h3 style={{ margin: "0 0 18px", fontSize: 15, color: "#2c3e50" }}>{title}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
          <button onClick={onClose} style={btnGhost}>Cancel</button>
          <button onClick={onSave} style={btnPrimary}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Consultants ───────────────────────────────────────────────────────────────
function ConsultantsSetup({ state, onUpdate }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Consultant" });
  function save() {
    if (!form.name || !form.email) return;
    onUpdate("consultants", [...state.consultants, { ...form, id: "usr-" + Date.now(), active: true }]);
    setForm({ name: "", email: "", role: "Consultant" }); setModal(false);
  }
  return (
    <>
      <Section title="Consultants" action={<button onClick={() => setModal(true)} style={btnPrimary}>+ Add</button>}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr style={{ background: "#f8f9fa" }}>
            {["Name","Email","Role","Status"].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#6c757d" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {state.consultants.map((u,i) => (
              <tr key={u.id} style={{ borderTop: "1px solid #f0f2f4", background: i%2===0?"#fff":"#f8f9fa" }}>
                <td style={{ padding: "10px 12px", fontWeight: 600 }}>{u.name}</td>
                <td style={{ padding: "10px 12px", color: "#6c757d" }}>{u.email}</td>
                <td style={{ padding: "10px 12px" }}>{u.role}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: u.active ? "#d4edda" : "#e9ecef", color: u.active ? "#155724" : "#6c757d", fontWeight: 700 }}>
                    {u.active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
      {modal && (
        <Modal title="Add Consultant" onClose={() => setModal(false)} onSave={save}>
          <div><label style={labelStyle}>Full Name</label><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={inputStyle} /></div>
          <div><label style={labelStyle}>Email</label><input value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} style={inputStyle} /></div>
          <div><label style={labelStyle}>Role</label>
            <select value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))} style={inputStyle}>
              {["Director","Implementation Lead","Senior Consultant","Consultant","Report Specialist"].map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
        </Modal>
      )}
    </>
  );
}

// ── OEM Partners & Customers ──────────────────────────────────────────────────
function CustomersSetup({ state, onUpdate }) {
  const [custModal, setCustModal] = useState(false);
  const [oemModal, setOemModal]   = useState(false);
  const [custForm, setCustForm] = useState({ name: "", oemId: "", contacts: [] });
  const [oemForm, setOemForm]   = useState({ name: "", contact: "", email: "" });
  const [contactRow, setContactRow] = useState({ name: "", email: "", title: "" });

  function saveCustomer() {
    if (!custForm.name) return;
    onUpdate("customers", [...state.customers, { ...custForm, id: "cust-" + Date.now() }]);
    setCustForm({ name: "", oemId: "", contacts: [] }); setCustModal(false);
  }
  function saveOem() {
    if (!oemForm.name) return;
    onUpdate("oemPartners", [...state.oemPartners, { ...oemForm, id: "oem-" + Date.now() }]);
    setOemForm({ name: "", contact: "", email: "" }); setOemModal(false);
  }
  function addContact() {
    if (!contactRow.name) return;
    setCustForm(p => ({ ...p, contacts: [...p.contacts, { ...contactRow }] }));
    setContactRow({ name: "", email: "", title: "" });
  }

  return (
    <>
      <Section title="OEM Partners" action={<button onClick={() => setOemModal(true)} style={btnPrimary}>+ Add OEM</button>}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr style={{ background: "#f8f9fa" }}>
            {["Partner Name","Contact","Email"].map(h=><th key={h} style={{ padding:"8px 12px",textAlign:"left",fontWeight:600,fontSize:11,color:"#6c757d"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {state.oemPartners.map((o,i)=>(
              <tr key={o.id} style={{ borderTop:"1px solid #f0f2f4",background:i%2===0?"#fff":"#f8f9fa"}}>
                <td style={{padding:"10px 12px",fontWeight:600}}>{o.name}</td>
                <td style={{padding:"10px 12px",color:"#6c757d"}}>{o.contact}</td>
                <td style={{padding:"10px 12px",color:"#6c757d"}}>{o.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Customers" action={<button onClick={() => setCustModal(true)} style={btnPrimary}>+ Add Customer</button>}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr style={{ background: "#f8f9fa" }}>
            {["Customer","OEM Partner","Contacts"].map(h=><th key={h} style={{ padding:"8px 12px",textAlign:"left",fontWeight:600,fontSize:11,color:"#6c757d"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {state.customers.map((c,i)=>{
              const oem = state.oemPartners.find(o=>o.id===c.oemId);
              return (
                <tr key={c.id} style={{ borderTop:"1px solid #f0f2f4",background:i%2===0?"#fff":"#f8f9fa"}}>
                  <td style={{padding:"10px 12px",fontWeight:600}}>{c.name}</td>
                  <td style={{padding:"10px 12px",color:"#6c757d"}}>{oem?.name||"—"}</td>
                  <td style={{padding:"10px 12px",color:"#6c757d"}}>{c.contacts.map(x=>x.name).join(", ")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>

      {oemModal && (
        <Modal title="Add OEM Partner" onClose={() => setOemModal(false)} onSave={saveOem}>
          <div><label style={labelStyle}>Partner Name</label><input value={oemForm.name} onChange={e=>setOemForm(p=>({...p,name:e.target.value}))} style={inputStyle} /></div>
          <div><label style={labelStyle}>Contact Name</label><input value={oemForm.contact} onChange={e=>setOemForm(p=>({...p,contact:e.target.value}))} style={inputStyle} /></div>
          <div><label style={labelStyle}>Contact Email</label><input value={oemForm.email} onChange={e=>setOemForm(p=>({...p,email:e.target.value}))} style={inputStyle} /></div>
        </Modal>
      )}

      {custModal && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{ background:"#fff",borderRadius:12,padding:28,width:500,maxHeight:"80vh",overflow:"auto",boxShadow:"0 8px 32px rgba(0,0,0,0.2)"}}>
            <h3 style={{margin:"0 0 18px",fontSize:15}}>Add Customer</h3>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div><label style={labelStyle}>Customer Name</label><input value={custForm.name} onChange={e=>setCustForm(p=>({...p,name:e.target.value}))} style={inputStyle} /></div>
              <div><label style={labelStyle}>OEM Partner</label>
                <select value={custForm.oemId} onChange={e=>setCustForm(p=>({...p,oemId:e.target.value}))} style={inputStyle}>
                  <option value="">— Select OEM —</option>
                  {state.oemPartners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div style={{borderTop:"1px solid #e9ecef",paddingTop:12}}>
                <div style={{fontWeight:700,fontSize:12,color:"#2c3e50",marginBottom:10}}>Contacts</div>
                {custForm.contacts.map((ct,i)=>(
                  <div key={i} style={{fontSize:12,color:"#495057",padding:"6px 0",borderBottom:"1px solid #f0f2f4"}}>
                    {ct.name} · {ct.title} · {ct.email}
                  </div>
                ))}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:10}}>
                  <input placeholder="Name" value={contactRow.name} onChange={e=>setContactRow(p=>({...p,name:e.target.value}))} style={inputStyle} />
                  <input placeholder="Title" value={contactRow.title} onChange={e=>setContactRow(p=>({...p,title:e.target.value}))} style={inputStyle} />
                  <input placeholder="Email" value={contactRow.email} onChange={e=>setContactRow(p=>({...p,email:e.target.value}))} style={inputStyle} />
                </div>
                <button onClick={addContact} style={{...btnGhost,marginTop:8,fontSize:11}}>+ Add Contact</button>
              </div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:22}}>
              <button onClick={()=>setCustModal(false)} style={btnGhost}>Cancel</button>
              <button onClick={saveCustomer} style={btnPrimary}>Save Customer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Categories ────────────────────────────────────────────────────────────────
function CategoriesSetup({ state, onUpdate }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", categoryId: "" });
  const [tab, setTab] = useState("categories");

  function addCat() {
    if (!form.name) return;
    onUpdate("categories", [...state.categories, { id: "cat-"+Date.now(), name: form.name, active: true, order: state.categories.length+1 }]);
    setForm({ name: "", categoryId: "" }); setModal(false);
  }
  function addSub() {
    if (!form.name || !form.categoryId) return;
    onUpdate("subcategories", [...state.subcategories, { id: "sub-"+Date.now(), categoryId: form.categoryId, name: form.name, active: true }]);
    setForm({ name: "", categoryId: "" }); setModal(false);
  }
  function toggleActive(list, id) {
    onUpdate(list, state[list].map(x => x.id===id ? {...x,active:!x.active} : x));
  }

  return (
    <>
      <div style={{ display:"flex",gap:0,marginBottom:20,background:"#fff",borderRadius:8,border:"1px solid #dee2e6",overflow:"hidden",width:"fit-content" }}>
        {["categories","subcategories"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:"8px 20px",border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:tab===t?TEAL:"#fff",color:tab===t?"#fff":"#495057" }}>
            {t==="categories"?"Categories":"Sub-categories"}
          </button>
        ))}
      </div>

      {tab === "categories" && (
        <Section title="Categories" action={<button onClick={()=>{setModal("cat");setForm({name:"",categoryId:""});}} style={btnPrimary}>+ Add</button>}>
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
            <thead><tr style={{background:"#f8f9fa"}}>{["Order","Name","Status",""].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontWeight:600,fontSize:11,color:"#6c757d"}}>{h}</th>)}</tr></thead>
            <tbody>
              {state.categories.map((c,i)=>(
                <tr key={c.id} style={{borderTop:"1px solid #f0f2f4",background:i%2===0?"#fff":"#f8f9fa"}}>
                  <td style={{padding:"10px 12px",color:"#6c757d"}}>{c.order}</td>
                  <td style={{padding:"10px 12px",fontWeight:600}}>{c.name}</td>
                  <td style={{padding:"10px 12px"}}>
                    <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:c.active?"#d4edda":"#e9ecef",color:c.active?"#155724":"#6c757d",fontWeight:700}}>
                      {c.active?"Active":"Inactive"}
                    </span>
                  </td>
                  <td style={{padding:"10px 12px"}}>
                    <button onClick={()=>toggleActive("categories",c.id)} style={btnGhost}>{c.active?"Deactivate":"Activate"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {tab === "subcategories" && (
        <Section title="Sub-categories" action={<button onClick={()=>{setModal("sub");setForm({name:"",categoryId:""});}} style={btnPrimary}>+ Add</button>}>
          {state.categories.filter(c=>c.active).map(cat=>{
            const subs = state.subcategories.filter(s=>s.categoryId===cat.id);
            return (
              <div key={cat.id} style={{marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:700,color:TEAL_DARK,marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>{cat.name}</div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <tbody>
                    {subs.map((s,i)=>(
                      <tr key={s.id} style={{borderTop:"1px solid #f0f2f4",background:i%2===0?"#fff":"#f8f9fa"}}>
                        <td style={{padding:"8px 12px",fontWeight:500}}>{s.name}</td>
                        <td style={{padding:"8px 12px"}}>
                          <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:s.active?"#d4edda":"#e9ecef",color:s.active?"#155724":"#6c757d",fontWeight:700}}>
                            {s.active?"Active":"Inactive"}
                          </span>
                        </td>
                        <td style={{padding:"8px 12px"}}>
                          <button onClick={()=>toggleActive("subcategories",s.id)} style={{...btnGhost,padding:"3px 10px",fontSize:11}}>{s.active?"Deactivate":"Activate"}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </Section>
      )}

      {modal === "cat" && (
        <Modal title="Add Category" onClose={()=>setModal(false)} onSave={addCat}>
          <div><label style={labelStyle}>Category Name</label><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={inputStyle} /></div>
        </Modal>
      )}
      {modal === "sub" && (
        <Modal title="Add Sub-category" onClose={()=>setModal(false)} onSave={addSub}>
          <div><label style={labelStyle}>Category</label>
            <select value={form.categoryId} onChange={e=>setForm(p=>({...p,categoryId:e.target.value}))} style={inputStyle}>
              <option value="">— Select category —</option>
              {state.categories.filter(c=>c.active).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Sub-category Name</label><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={inputStyle} /></div>
        </Modal>
      )}
    </>
  );
}

// ── Templates ─────────────────────────────────────────────────────────────────
function TemplatesSetup({ state, onUpdate }) {
  const [selected, setSelected] = useState(null);
  const tmpl = selected ? state.templates.find(t=>t.id===selected) : null;

  return (
    <div style={{ display:"grid",gridTemplateColumns:"280px 1fr",gap:20 }}>
      <div>
        <div style={{fontWeight:700,fontSize:13,color:"#2c3e50",marginBottom:12}}>Templates</div>
        {state.templates.map(t=>(
          <div key={t.id} onClick={()=>setSelected(t.id)}
            style={{padding:"12px 16px",borderRadius:10,border:`2px solid ${selected===t.id?TEAL:"#e9ecef"}`,background:selected===t.id?TEAL_LIGHT:"#fff",cursor:"pointer",marginBottom:8}}>
            <div style={{fontWeight:700,fontSize:13,color:"#2c3e50"}}>{t.name}</div>
            <div style={{fontSize:11,color:"#6c757d",marginTop:3}}>{t.totalHours}h total</div>
          </div>
        ))}
      </div>
      {tmpl ? (
        <div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #e9ecef"}}>
          <h3 style={{margin:"0 0 6px",fontSize:16}}>{tmpl.name}</h3>
          <p style={{margin:"0 0 16px",color:"#6c757d",fontSize:13}}>{tmpl.description}</p>
          <div style={{fontWeight:700,fontSize:12,color:"#6c757d",marginBottom:10,textTransform:"uppercase"}}>Allocation ({tmpl.totalHours}h total)</div>
          {tmpl.items.map((item,i)=>{
            const cat = state.categories.find(c=>c.id===item.categoryId);
            const sub = item.subcategoryId ? state.subcategories.find(s=>s.id===item.subcategoryId) : null;
            return (
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f0f2f4",fontSize:13}}>
                <span style={{color:"#495057"}}>{sub ? `${cat?.name} › ${sub.name}` : cat?.name}</span>
                <span style={{fontWeight:700,color:TEAL_DARK}}>{item.hours}h</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",color:"#6c757d",fontSize:13}}>Select a template to view details</div>
      )}
    </div>
  );
}

// ── Main Setup page ───────────────────────────────────────────────────────────
export default function Setup({ state, onUpdate }) {
  const sections = [
    { id: "consultants", label: "Consultants", icon: "👤" },
    { id: "customers",   label: "Customers & OEM", icon: "🏢" },
    { id: "categories",  label: "Categories", icon: "📂" },
    { id: "templates",   label: "Templates", icon: "📋" },
  ];
  const [section, setSection] = useState("consultants");

  return (
    <div style={{ flex:1,display:"flex",overflow:"hidden" }}>
      <div style={{ width:180,background:"#f8f9fa",borderRight:"1px solid #dee2e6",padding:"12px 0" }}>
        <div style={{fontSize:10,fontWeight:700,color:"#6c757d",textTransform:"uppercase",letterSpacing:0.5,padding:"0 14px 8px"}}>Setup</div>
        {sections.map(s=>(
          <div key={s.id} onClick={()=>setSection(s.id)}
            style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",cursor:"pointer",fontSize:12,fontWeight:600,
              background:section===s.id?TEAL_LIGHT:"transparent",color:section===s.id?TEAL_DARK:"#495057",
              borderLeft:section===s.id?`3px solid ${TEAL}`:"3px solid transparent"}}>
            <span>{s.icon}</span>{s.label}
          </div>
        ))}
      </div>
      <div style={{flex:1,overflow:"auto",padding:24}}>
        {section==="consultants" && <ConsultantsSetup state={state} onUpdate={onUpdate} />}
        {section==="customers"   && <CustomersSetup   state={state} onUpdate={onUpdate} />}
        {section==="categories"  && <CategoriesSetup  state={state} onUpdate={onUpdate} />}
        {section==="templates"   && <TemplatesSetup   state={state} onUpdate={onUpdate} />}
      </div>
    </div>
  );
}
