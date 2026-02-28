import { useState, useRef } from "react";
import HelpModal, { HelpButton } from "./HelpModal.jsx";
import { helpContent } from "./helpContent.js";

const TEAL = "#1a7f8e";
const TEAL_DARK = "#145f6b";
const TEAL_LIGHT = "#e8f4f6";

const inputStyle = { border: "1px solid #ced4da", borderRadius: 6, padding: "7px 10px", fontSize: 13, width: "100%", boxSizing: "border-box" };
const labelStyle = { fontSize: 11, color: "#6c757d", fontWeight: 600, marginBottom: 3, display: "block" };
const btnPrimary = { background: TEAL, color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontSize: 12, cursor: "pointer", fontWeight: 600 };
const btnGhost   = { background: "#f8f9fa", color: "#495057", border: "1px solid #ced4da", borderRadius: 6, padding: "8px 18px", fontSize: 12, cursor: "pointer", fontWeight: 600 };
const btnDanger  = { background: "#fff", color: "#dc3545", border: "1px solid #dc3545", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer" };

const CURRENCIES = ["GBP","USD","EUR","AUD","CAD","SGD","AED","INR","JPY","BRL","ZAR","MXN"];

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

function Modal({ title, onClose, onSave, children, width = 460 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 28, width, maxHeight: "85vh", overflow: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
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
  const [editId, setEditId] = useState(null);
  const blank = { name: "", email: "", role: "Consultant", active: true, billRate: "", billCurrency: "GBP" };
  const [form, setForm] = useState(blank);

  function openAdd() { setForm(blank); setEditId(null); setModal(true); }
  function openEdit(u) { setForm({ ...u, billRate: u.billRate || "", billCurrency: u.billCurrency || "GBP" }); setEditId(u.id); setModal(true); }

  function save() {
    if (!form.name || !form.email) return;
    if (editId) {
      onUpdate("consultants", state.consultants.map(u => u.id === editId ? { ...u, ...form } : u));
    } else {
      onUpdate("consultants", [...state.consultants, { ...form, id: "usr-" + Date.now() }]);
    }
    setModal(false);
  }

  function canDelete(uid) {
    return !state.projects.some(p => p.consultantIds.includes(uid) || p.leadConsultantId === uid);
  }

  function deleteConsultant(uid) {
    if (!canDelete(uid)) return;
    onUpdate("consultants", state.consultants.filter(u => u.id !== uid));
  }

  function toggleActive(uid) {
    onUpdate("consultants", state.consultants.map(u => u.id === uid ? { ...u, active: !u.active } : u));
  }

  return (
    <>
      <Section title="Consultants" action={<button onClick={openAdd} style={btnPrimary}>+ Add</button>}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr style={{ background: "#f8f9fa" }}>
            {["Name","Email","Role","Bill Rate","Status",""].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#6c757d" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {state.consultants.map((u, i) => (
              <tr key={u.id} style={{ borderTop: "1px solid #f0f2f4", background: i%2===0?"#fff":"#f8f9fa" }}>
                <td style={{ padding: "10px 12px", fontWeight: 600 }}>{u.name}</td>
                <td style={{ padding: "10px 12px", color: "#6c757d" }}>{u.email}</td>
                <td style={{ padding: "10px 12px" }}>{u.role}</td>
                <td style={{ padding: "10px 12px", color: "#6c757d" }}>{u.billRate ? `${u.billCurrency || "GBP"} ${u.billRate}/hr` : "—"}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: u.active ? "#d4edda" : "#e9ecef", color: u.active ? "#155724" : "#6c757d", fontWeight: 700 }}>
                    {u.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openEdit(u)} style={{ ...btnGhost, padding: "4px 10px", fontSize: 11 }}>Edit</button>
                    <button onClick={() => toggleActive(u.id)} style={{ ...btnGhost, padding: "4px 10px", fontSize: 11 }}>{u.active ? "Deactivate" : "Activate"}</button>
                    {canDelete(u.id)
                      ? <button onClick={() => deleteConsultant(u.id)} style={btnDanger}>Delete</button>
                      : <button disabled style={{ ...btnDanger, opacity: 0.4, cursor: "not-allowed" }} title="Associated with project(s)">Delete</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {modal && (
        <Modal title={editId ? "Edit Consultant" : "Add Consultant"} onClose={() => setModal(false)} onSave={save}>
          <div><label style={labelStyle}>Full Name *</label><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={inputStyle} /></div>
          <div><label style={labelStyle}>Email *</label><input value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} style={inputStyle} /></div>
          <div><label style={labelStyle}>Role</label>
            <select value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))} style={inputStyle}>
              {["Director","Implementation Lead","Senior Consultant","Consultant","Report Specialist"].map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
            <div><label style={labelStyle}>Currency</label>
              <select value={form.billCurrency} onChange={e=>setForm(p=>({...p,billCurrency:e.target.value}))} style={inputStyle}>
                {CURRENCIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Standard Hourly Bill Rate</label>
              <input type="number" min="0" step="0.01" placeholder="e.g. 150.00" value={form.billRate} onChange={e=>setForm(p=>({...p,billRate:e.target.value}))} style={inputStyle} />
            </div>
          </div>
          {editId && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label style={{ ...labelStyle, margin: 0 }}>Active</label>
              <input type="checkbox" checked={form.active} onChange={e=>setForm(p=>({...p,active:e.target.checked}))} style={{ width: 16, height: 16 }} />
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

// ── OEM Partners & Customers ──────────────────────────────────────────────────
function CustomersSetup({ state, onUpdate }) {
  const [oemModal, setOemModal] = useState(false);
  const [oemEditId, setOemEditId] = useState(null);
  const [oemForm, setOemForm] = useState({ name: "", contacts: [], active: true });
  const [oemContactRow, setOemContactRow] = useState({ name: "", email: "", primary: false });

  const [custModal, setCustModal] = useState(false);
  const [custEditId, setCustEditId] = useState(null);
  const [custForm, setCustForm] = useState({ name: "", oemId: "", contacts: [] });
  const [contactRow, setContactRow] = useState({ name: "", email: "", title: "" });

  function openAddOem() {
    setOemForm({ name: "", contacts: [], active: true });
    setOemEditId(null); setOemModal(true);
  }
  function openEditOem(o) {
    let contacts = o.contacts || [];
    if (!contacts.length && o.contact) contacts = [{ name: o.contact, email: o.email || "", primary: true }];
    setOemForm({ ...o, contacts });
    setOemEditId(o.id); setOemModal(true);
  }
  function saveOem() {
    if (!oemForm.name) return;
    const data = { ...oemForm };
    if (data.contacts.length > 0 && !data.contacts.some(c => c.primary)) {
      data.contacts = data.contacts.map((c, i) => ({ ...c, primary: i === 0 }));
    }
    if (oemEditId) {
      onUpdate("oemPartners", state.oemPartners.map(o => o.id === oemEditId ? { ...o, ...data } : o));
    } else {
      onUpdate("oemPartners", [...state.oemPartners, { ...data, id: "oem-" + Date.now() }]);
    }
    setOemModal(false);
  }
  function addOemContact() {
    if (!oemContactRow.name) return;
    const contacts = [...oemForm.contacts, { ...oemContactRow }];
    if (oemContactRow.primary) {
      contacts.forEach((c, i) => { if (i < contacts.length - 1) c.primary = false; });
    }
    setOemForm(p => ({ ...p, contacts }));
    setOemContactRow({ name: "", email: "", primary: false });
  }
  function setPrimaryOemContact(idx) {
    setOemForm(p => ({ ...p, contacts: p.contacts.map((c, i) => ({ ...c, primary: i === idx })) }));
  }
  function removeOemContact(idx) {
    const contacts = oemForm.contacts.filter((_, i) => i !== idx);
    if (contacts.length > 0 && !contacts.some(c => c.primary)) contacts[0].primary = true;
    setOemForm(p => ({ ...p, contacts }));
  }

  function oemHasCustomers(oemId) {
    return state.customers.some(c => c.oemId === oemId);
  }
  function toggleOemActive(o) {
    if (!o.active && oemHasCustomers(o.id)) return;
    onUpdate("oemPartners", state.oemPartners.map(x => x.id === o.id ? { ...x, active: !x.active } : x));
  }

  function openAddCust() {
    setCustForm({ name: "", oemId: "", contacts: [] });
    setCustEditId(null); setCustModal(true);
  }
  function openEditCust(c) {
    setCustForm({ ...c });
    setCustEditId(c.id); setCustModal(true);
  }
  function saveCust() {
    if (!custForm.name) return;
    if (custEditId) {
      onUpdate("customers", state.customers.map(c => c.id === custEditId ? { ...c, ...custForm } : c));
    } else {
      onUpdate("customers", [...state.customers, { ...custForm, id: "cust-" + Date.now() }]);
    }
    setCustModal(false);
  }
  function addContact() {
    if (!contactRow.name) return;
    const contacts = [...custForm.contacts, { ...contactRow }];
    if (contacts.length === 1) contacts[0].primary = true;
    setCustForm(p => ({ ...p, contacts }));
    setContactRow({ name: "", email: "", title: "" });
  }
  function setPrimaryCustContact(idx) {
    setCustForm(p => ({ ...p, contacts: p.contacts.map((c, i) => ({ ...c, primary: i === idx })) }));
  }
  function removeCustContact(idx) {
    const contacts = custForm.contacts.filter((_, i) => i !== idx);
    if (contacts.length > 0 && !contacts.some(c => c.primary)) contacts[0].primary = true;
    setCustForm(p => ({ ...p, contacts }));
  }

  function getPrimary(contacts) {
    if (!contacts || !contacts.length) return null;
    return contacts.find(c => c.primary) || contacts[0];
  }

  const activeOems = state.oemPartners.filter(o => o.active !== false);

  return (
    <>
      <Section title="OEM Partners" action={<button onClick={openAddOem} style={btnPrimary}>+ Add OEM</button>}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr style={{ background: "#f8f9fa" }}>
            {["Partner Name","Primary Contact","Email","Status",""].map(h=><th key={h} style={{ padding:"8px 12px",textAlign:"left",fontWeight:600,fontSize:11,color:"#6c757d"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {state.oemPartners.map((o, i) => {
              const primary = getPrimary(o.contacts) || { name: o.contact, email: o.email };
              const hasCustomers = oemHasCustomers(o.id);
              const isActive = o.active !== false;
              return (
                <tr key={o.id} style={{ borderTop:"1px solid #f0f2f4", background: i%2===0?"#fff":"#f8f9fa", opacity: isActive ? 1 : 0.6 }}>
                  <td style={{ padding:"10px 12px",fontWeight:600 }}>{o.name}</td>
                  <td style={{ padding:"10px 12px",color:"#6c757d" }}>{primary?.name || "—"}</td>
                  <td style={{ padding:"10px 12px",color:"#6c757d" }}>{primary?.email || "—"}</td>
                  <td style={{ padding:"10px 12px" }}>
                    <span style={{ fontSize:10,padding:"2px 8px",borderRadius:10,background:isActive?"#d4edda":"#e9ecef",color:isActive?"#155724":"#6c757d",fontWeight:700 }}>
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding:"10px 12px" }}>
                    <div style={{ display:"flex",gap:6 }}>
                      <button onClick={() => openEditOem(o)} style={{ ...btnGhost, padding:"4px 10px",fontSize:11 }}>Edit</button>
                      {isActive
                        ? <button onClick={() => !hasCustomers && toggleOemActive(o)} disabled={hasCustomers}
                            title={hasCustomers ? "Cannot deactivate: has associated customers" : "Deactivate"}
                            style={{ ...btnGhost, padding:"4px 10px", fontSize:11, opacity: hasCustomers ? 0.4 : 1, cursor: hasCustomers ? "not-allowed" : "pointer" }}>
                            Deactivate
                          </button>
                        : <button onClick={() => toggleOemActive(o)} style={{ ...btnGhost, padding:"4px 10px", fontSize:11 }}>Activate</button>
                      }
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>

      <Section title="Customers" action={<button onClick={openAddCust} style={btnPrimary}>+ Add Customer</button>}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr style={{ background: "#f8f9fa" }}>
            {["Customer","OEM Partner","Primary Contact",""].map(h=><th key={h} style={{ padding:"8px 12px",textAlign:"left",fontWeight:600,fontSize:11,color:"#6c757d"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {state.customers.map((c, i) => {
              const oem = state.oemPartners.find(o => o.id === c.oemId);
              const primary = getPrimary(c.contacts);
              return (
                <tr key={c.id} style={{ borderTop:"1px solid #f0f2f4",background:i%2===0?"#fff":"#f8f9fa" }}>
                  <td style={{ padding:"10px 12px",fontWeight:600 }}>{c.name}</td>
                  <td style={{ padding:"10px 12px",color:"#6c757d" }}>{oem?.name || "—"}</td>
                  <td style={{ padding:"10px 12px",color:"#6c757d" }}>{primary ? `${primary.name}${primary.title ? ` (${primary.title})` : ""}` : "—"}</td>
                  <td style={{ padding:"10px 12px" }}>
                    <button onClick={() => openEditCust(c)} style={{ ...btnGhost, padding:"4px 10px",fontSize:11 }}>Edit</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>

      {oemModal && (
        <Modal title={oemEditId ? "Edit OEM Partner" : "Add OEM Partner"} onClose={() => setOemModal(false)} onSave={saveOem} width={520}>
          <div><label style={labelStyle}>Partner Name *</label><input value={oemForm.name} onChange={e=>setOemForm(p=>({...p,name:e.target.value}))} style={inputStyle} /></div>
          <div style={{ borderTop: "1px solid #e9ecef", paddingTop: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: "#2c3e50", marginBottom: 10 }}>Contacts</div>
            {oemForm.contacts.map((ct, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: 6, alignItems: "center", padding: "7px 10px", background: ct.primary ? TEAL_LIGHT : "#f8f9fa", borderRadius: 6, marginBottom: 6, border: `1px solid ${ct.primary ? TEAL : "#e9ecef"}` }}>
                <input value={ct.name} onChange={e => setOemForm(p => ({ ...p, contacts: p.contacts.map((c,i) => i===idx ? {...c, name: e.target.value} : c) }))} style={{ ...inputStyle, fontSize: 12, padding: "5px 8px" }} placeholder="Name" />
                <input value={ct.email} onChange={e => setOemForm(p => ({ ...p, contacts: p.contacts.map((c,i) => i===idx ? {...c, email: e.target.value} : c) }))} style={{ ...inputStyle, fontSize: 12, padding: "5px 8px" }} placeholder="Email" />
                {ct.primary
                  ? <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: TEAL, color: "#fff", fontWeight: 700, whiteSpace: "nowrap" }}>Primary</span>
                  : <button onClick={() => setPrimaryOemContact(idx)} style={{ ...btnGhost, padding: "3px 8px", fontSize: 10, whiteSpace: "nowrap" }}>Set Primary</button>}
                <button onClick={() => removeOemContact(idx)} style={{ ...btnDanger, padding: "3px 8px" }}>✕</button>
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, marginTop: 10, alignItems: "end" }}>
              <div><label style={labelStyle}>Name</label><input placeholder="Contact name" value={oemContactRow.name} onChange={e=>setOemContactRow(p=>({...p,name:e.target.value}))} style={inputStyle} /></div>
              <div><label style={labelStyle}>Email</label><input placeholder="Email" value={oemContactRow.email} onChange={e=>setOemContactRow(p=>({...p,email:e.target.value}))} style={inputStyle} /></div>
              <button onClick={addOemContact} style={{ ...btnGhost, padding: "7px 12px", fontSize: 12, whiteSpace: "nowrap" }}>+ Add</button>
            </div>
          </div>
        </Modal>
      )}

      {custModal && (
        <Modal title={custEditId ? "Edit Customer" : "Add Customer"} onClose={() => setCustModal(false)} onSave={saveCust} width={520}>
          <div><label style={labelStyle}>Customer Name *</label><input value={custForm.name} onChange={e=>setCustForm(p=>({...p,name:e.target.value}))} style={inputStyle} /></div>
          <div><label style={labelStyle}>OEM Partner</label>
            <select value={custForm.oemId} onChange={e=>setCustForm(p=>({...p,oemId:e.target.value}))} style={inputStyle}>
              <option value="">— Select OEM —</option>
              {activeOems.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div style={{ borderTop: "1px solid #e9ecef", paddingTop: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: "#2c3e50", marginBottom: 10 }}>Contacts</div>
            {custForm.contacts.map((ct, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto auto", gap: 6, alignItems: "center", padding: "7px 10px", background: ct.primary ? TEAL_LIGHT : "#f8f9fa", borderRadius: 6, marginBottom: 6, border: `1px solid ${ct.primary ? TEAL : "#e9ecef"}` }}>
                <input value={ct.name} onChange={e => setCustForm(p => ({ ...p, contacts: p.contacts.map((c,i) => i===idx ? {...c, name: e.target.value} : c) }))} style={{ ...inputStyle, fontSize: 12, padding: "5px 8px" }} placeholder="Name" />
                <input value={ct.title||""} onChange={e => setCustForm(p => ({ ...p, contacts: p.contacts.map((c,i) => i===idx ? {...c, title: e.target.value} : c) }))} style={{ ...inputStyle, fontSize: 12, padding: "5px 8px" }} placeholder="Title" />
                <input value={ct.email} onChange={e => setCustForm(p => ({ ...p, contacts: p.contacts.map((c,i) => i===idx ? {...c, email: e.target.value} : c) }))} style={{ ...inputStyle, fontSize: 12, padding: "5px 8px" }} placeholder="Email" />
                {ct.primary
                  ? <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: TEAL, color: "#fff", fontWeight: 700, whiteSpace: "nowrap" }}>Primary</span>
                  : <button onClick={() => setPrimaryCustContact(idx)} style={{ ...btnGhost, padding: "3px 8px", fontSize: 10, whiteSpace: "nowrap" }}>Set Primary</button>}
                <button onClick={() => removeCustContact(idx)} style={{ ...btnDanger, padding: "3px 8px" }}>✕</button>
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginTop: 10, alignItems: "end" }}>
              <div><label style={labelStyle}>Name</label><input placeholder="Name" value={contactRow.name} onChange={e=>setContactRow(p=>({...p,name:e.target.value}))} style={inputStyle} /></div>
              <div><label style={labelStyle}>Title</label><input placeholder="Title" value={contactRow.title} onChange={e=>setContactRow(p=>({...p,title:e.target.value}))} style={inputStyle} /></div>
              <div><label style={labelStyle}>Email</label><input placeholder="Email" value={contactRow.email} onChange={e=>setContactRow(p=>({...p,email:e.target.value}))} style={inputStyle} /></div>
              <button onClick={addContact} style={{ ...btnGhost, padding: "7px 12px", fontSize: 12, whiteSpace: "nowrap" }}>+ Add</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

// ── Categories ────────────────────────────────────────────────────────────────
function CategoriesSetup({ state, onUpdate }) {
  const [modal, setModal] = useState(false);
  const [editCatId, setEditCatId] = useState(null);
  const [form, setForm] = useState({ name: "", categoryId: "" });
  const [tab, setTab] = useState("categories");
  const [editSubId, setEditSubId] = useState(null);
  const [editSubForm, setEditSubForm] = useState({ name: "", categoryId: "" });

  const dragItem = useRef(null);
  const dragOver = useRef(null);

  function catHasSubs(catId) { return state.subcategories.some(s => s.categoryId === catId); }
  function catInProjects(catId) { return state.projects.some(p => p.categories.some(c => c.categoryId === catId)); }
  function subInProjects(subId) { return state.projects.some(p => p.categories.some(c => c.subcategoryId === subId)); }

  function openAddCat() { setForm({ name: "" }); setEditCatId(null); setModal("cat"); }
  function openEditCat(c) { setForm({ name: c.name }); setEditCatId(c.id); setModal("cat"); }
  function saveCat() {
    if (!form.name) return;
    if (editCatId) {
      onUpdate("categories", state.categories.map(c => c.id === editCatId ? { ...c, name: form.name } : c));
    } else {
      onUpdate("categories", [...state.categories, { id: "cat-"+Date.now(), name: form.name, active: true, order: state.categories.length+1 }]);
    }
    setModal(false);
  }
  function deleteCat(id) {
    if (catHasSubs(id) || catInProjects(id)) return;
    onUpdate("categories", state.categories.filter(c => c.id !== id));
  }
  function toggleCatActive(id) {
    onUpdate("categories", state.categories.map(c => c.id === id ? {...c, active: !c.active} : c));
  }

  function openAddSub() { setForm({ name: "", categoryId: "" }); setModal("sub"); }
  function saveSub() {
    if (!form.name || !form.categoryId) return;
    onUpdate("subcategories", [...state.subcategories, { id: "sub-"+Date.now(), categoryId: form.categoryId, name: form.name, active: true }]);
    setModal(false);
  }
  function saveEditSub() {
    onUpdate("subcategories", state.subcategories.map(s => s.id === editSubId ? { ...s, name: editSubForm.name, categoryId: editSubForm.categoryId } : s));
    setEditSubId(null);
  }
  function deleteSub(id) {
    if (subInProjects(id)) return;
    onUpdate("subcategories", state.subcategories.filter(s => s.id !== id));
  }
  function toggleSubActive(id) {
    onUpdate("subcategories", state.subcategories.map(s => s.id === id ? {...s, active: !s.active} : s));
  }

  function onDragStart(subId) { dragItem.current = subId; }
  function onDragEnterSub(subId) { dragOver.current = subId; }
  function onDrop(targetCatId) {
    if (!dragItem.current) return;
    const draggedId = dragItem.current;
    const targetId  = dragOver.current;
    dragItem.current = null;
    dragOver.current = null;

    const subs = state.subcategories;
    const dragged = subs.find(s => s.id === draggedId);
    if (!dragged) return;

    if (!targetId || targetId === draggedId) {
      onUpdate("subcategories", subs.map(s => s.id === draggedId ? { ...s, categoryId: targetCatId } : s));
      return;
    }

    const target = subs.find(s => s.id === targetId);
    if (!target) return;

    const catSubs = subs.filter(s => s.categoryId === targetCatId && s.id !== draggedId);
    const targetIdx = catSubs.findIndex(s => s.id === targetId);
    catSubs.splice(targetIdx, 0, { ...dragged, categoryId: targetCatId });

    const reordered = catSubs.map((s, i) => ({ ...s, order: i }));
    const others = subs.filter(s => s.categoryId !== targetCatId && s.id !== draggedId);
    onUpdate("subcategories", [...others, ...reordered]);
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
        <Section title="Categories" action={<button onClick={openAddCat} style={btnPrimary}>+ Add</button>}>
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
            <thead><tr style={{background:"#f8f9fa"}}>{["Order","Name","Status",""].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontWeight:600,fontSize:11,color:"#6c757d"}}>{h}</th>)}</tr></thead>
            <tbody>
              {[...state.categories].sort((a,b)=>a.order-b.order).map((c,i,arr)=>{
                const canDel = !catHasSubs(c.id) && !catInProjects(c.id);
                function moveCategory(dir) {
                  const sorted = [...state.categories].sort((a,b)=>a.order-b.order);
                  const idx = sorted.findIndex(x=>x.id===c.id);
                  const swapIdx = idx+dir;
                  if (swapIdx<0||swapIdx>=sorted.length) return;
                  const newCats = state.categories.map(x=>{
                    if (x.id===sorted[idx].id) return {...x,order:sorted[swapIdx].order};
                    if (x.id===sorted[swapIdx].id) return {...x,order:sorted[idx].order};
                    return x;
                  });
                  onUpdate("categories",newCats);
                }
                return (
                  <tr key={c.id} style={{ borderTop:"1px solid #f0f2f4",background:i%2===0?"#fff":"#f8f9fa" }}>
                    <td style={{padding:"10px 12px"}}>
                      <div style={{display:"flex",gap:2,alignItems:"center"}}>
                        <button onClick={()=>moveCategory(-1)} disabled={i===0} style={{border:"1px solid #ced4da",borderRadius:4,background:"#fff",cursor:i===0?"not-allowed":"pointer",padding:"1px 6px",fontSize:11,color:"#6c757d",opacity:i===0?0.3:1}}>▲</button>
                        <button onClick={()=>moveCategory(1)} disabled={i===arr.length-1} style={{border:"1px solid #ced4da",borderRadius:4,background:"#fff",cursor:i===arr.length-1?"not-allowed":"pointer",padding:"1px 6px",fontSize:11,color:"#6c757d",opacity:i===arr.length-1?0.3:1}}>▼</button>
                      </div>
                    </td>
                    <td style={{padding:"10px 12px",fontWeight:600}}>{c.name}</td>
                    <td style={{padding:"10px 12px"}}>
                      <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:c.active?"#d4edda":"#e9ecef",color:c.active?"#155724":"#6c757d",fontWeight:700}}>
                        {c.active?"Active":"Inactive"}
                      </span>
                    </td>
                    <td style={{padding:"10px 12px"}}>
                      <div style={{ display:"flex",gap:6 }}>
                        <button onClick={()=>openEditCat(c)} style={{...btnGhost,padding:"4px 10px",fontSize:11}}>Edit</button>
                        <button onClick={()=>toggleCatActive(c.id)} style={{...btnGhost,padding:"4px 10px",fontSize:11}}>{c.active?"Deactivate":"Activate"}</button>
                        <button onClick={() => canDel && deleteCat(c.id)} disabled={!canDel}
                          title={!canDel ? (catHasSubs(c.id) ? "Has sub-categories" : "Used in project(s)") : "Delete"}
                          style={{ ...btnDanger, opacity: canDel ? 1 : 0.4, cursor: canDel ? "pointer" : "not-allowed" }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Section>
      )}

      {tab === "subcategories" && (
        <Section title="Sub-categories" action={<button onClick={openAddSub} style={btnPrimary}>+ Add</button>}>
          <p style={{ fontSize: 12, color: "#6c757d", marginTop: 0, marginBottom: 16 }}>Drag sub-categories between category groups to reassign them.</p>
          {[...state.categories].filter(c=>c.active).sort((a,b)=>a.order-b.order).map(cat=>{
            const subs = state.subcategories.filter(s=>s.categoryId===cat.id);
            return (
              <div key={cat.id} style={{marginBottom:20}}
                onDragOver={e=>{e.preventDefault();}}
                onDrop={()=>onDrop(cat.id)}>
                <div style={{fontSize:12,fontWeight:700,color:TEAL_DARK,marginBottom:8,textTransform:"uppercase",letterSpacing:0.5,padding:"6px 10px",background:TEAL_LIGHT,borderRadius:6}}>{cat.name}</div>
                {subs.length === 0 && <div style={{fontSize:12,color:"#adb5bd",fontStyle:"italic",padding:"8px 10px"}}>Drop sub-categories here</div>}
                {[...subs].sort((a,b)=>(a.order??0)-(b.order??0)).map((s,i)=>{
                  const canDel = !subInProjects(s.id);
                  if (editSubId === s.id) {
                    return (
                      <div key={s.id} style={{display:"flex",gap:8,alignItems:"center",padding:"8px 10px",background:"#fffbea",borderRadius:6,marginBottom:4,border:"1px solid #ffc107"}}>
                        <input value={editSubForm.name} onChange={e=>setEditSubForm(p=>({...p,name:e.target.value}))} style={{...inputStyle,width:200}} />
                        <select value={editSubForm.categoryId} onChange={e=>setEditSubForm(p=>({...p,categoryId:e.target.value}))} style={{...inputStyle,width:180}}>
                          {state.categories.filter(c=>c.active).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button onClick={saveEditSub} style={{...btnPrimary,padding:"5px 12px",fontSize:11}}>Save</button>
                        <button onClick={()=>setEditSubId(null)} style={{...btnGhost,padding:"5px 10px",fontSize:11}}>Cancel</button>
                      </div>
                    );
                  }
                  return (
                    <div key={s.id} draggable
                      onDragStart={()=>onDragStart(s.id)}
                      onDragEnter={()=>onDragEnterSub(s.id)}
                      onDragOver={e=>e.preventDefault()}
                      style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:i%2===0?"#fff":"#f8f9fa",borderRadius:6,marginBottom:4,border:"1px solid #f0f2f4",cursor:"grab"}}>
                      <span style={{color:"#adb5bd",fontSize:14}}>⠿</span>
                      <span style={{flex:1,fontWeight:500,fontSize:13}}>{s.name}</span>
                      <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:s.active?"#d4edda":"#e9ecef",color:s.active?"#155724":"#6c757d",fontWeight:700}}>{s.active?"Active":"Inactive"}</span>
                      <button onClick={()=>{setEditSubId(s.id);setEditSubForm({name:s.name,categoryId:s.categoryId});}} style={{...btnGhost,padding:"3px 9px",fontSize:11}}>Edit</button>
                      <button onClick={()=>toggleSubActive(s.id)} style={{...btnGhost,padding:"3px 9px",fontSize:11}}>{s.active?"Deactivate":"Activate"}</button>
                      <button onClick={()=>canDel&&deleteSub(s.id)} disabled={!canDel} title={!canDel?"Used in project(s)":"Delete"}
                        style={{...btnDanger,padding:"3px 8px",opacity:canDel?1:0.4,cursor:canDel?"pointer":"not-allowed"}}>Delete</button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </Section>
      )}

      {modal === "cat" && (
        <Modal title={editCatId ? "Edit Category" : "Add Category"} onClose={()=>setModal(false)} onSave={saveCat}>
          <div><label style={labelStyle}>Category Name *</label><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={inputStyle} /></div>
        </Modal>
      )}
      {modal === "sub" && (
        <Modal title="Add Sub-category" onClose={()=>setModal(false)} onSave={saveSub}>
          <div><label style={labelStyle}>Category *</label>
            <select value={form.categoryId} onChange={e=>setForm(p=>({...p,categoryId:e.target.value}))} style={inputStyle}>
              <option value="">— Select category —</option>
              {state.categories.filter(c=>c.active).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Sub-category Name *</label><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={inputStyle} /></div>
        </Modal>
      )}
    </>
  );
}

// ── Templates ─────────────────────────────────────────────────────────────────
function TemplatesSetup({ state, onUpdate }) {
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [newTmpl, setNewTmpl] = useState({ name: "", description: "", totalHours: "", startFrom: "blank", copyFromId: "" });

  const tmpl = selected ? state.templates.find(t=>t.id===selected) : null;

  function openNew() {
    setNewTmpl({ name: "", description: "", totalHours: "", startFrom: "blank", copyFromId: "" });
    setAddModal(true);
  }

  function createTemplate() {
    if (!newTmpl.name) return;
    let items = [];
    if (newTmpl.startFrom === "copy" && newTmpl.copyFromId) {
      const src = state.templates.find(t => t.id === newTmpl.copyFromId);
      if (src) items = src.items.map(i => ({ ...i }));
    }
    const t = {
      id: "tmpl-" + Date.now(),
      name: newTmpl.name,
      description: newTmpl.description,
      totalHours: parseFloat(newTmpl.totalHours) || 0,
      items,
    };
    onUpdate("templates", [...state.templates, t]);
    setSelected(t.id);
    setAddModal(false);
  }

  function startEdit(t) {
    setEditForm({ ...t, totalHours: t.totalHours, items: t.items.map(i => ({ ...i })) });
    setEditing(true);
  }

  function saveEdit() {
    const tot = parseFloat(editForm.totalHours) || 0;
    const itemSum = editForm.items.reduce((s,i) => s + (parseFloat(i.hours)||0), 0);
    if (itemSum > tot) {
      alert(`Item hours (${itemSum}h) exceed total template hours (${tot}h). Please adjust.`);
      return;
    }
    onUpdate("templates", state.templates.map(t => t.id === editForm.id ? { ...editForm, totalHours: tot } : t));
    setEditing(false);
  }

  function deleteTemplate(id) {
    const inUse = state.projects.some(p => p.templateId === id);
    if (inUse) { alert("Cannot delete: template is associated with one or more projects."); return; }
    onUpdate("templates", state.templates.filter(t => t.id !== id));
    if (selected === id) setSelected(null);
  }

  function updateItem(idx, field, val) {
    setEditForm(p => ({ ...p, items: p.items.map((it, i) => i === idx ? { ...it, [field]: val } : it) }));
  }
  function removeItem(idx) {
    setEditForm(p => ({ ...p, items: p.items.filter((_,i) => i !== idx) }));
  }
  function addItem() {
    setEditForm(p => ({ ...p, items: [...p.items, { categoryId: "", subcategoryId: null, hours: 0 }] }));
  }

  const dragItemIdx = useRef(null);
  function onItemDragStart(idx) { dragItemIdx.current = idx; }
  function onItemDrop(idx) {
    if (dragItemIdx.current === null || dragItemIdx.current === idx) return;
    setEditForm(p => {
      const items = [...p.items];
      const [moved] = items.splice(dragItemIdx.current, 1);
      items.splice(idx, 0, moved);
      dragItemIdx.current = null;
      return { ...p, items };
    });
  }

  function itemLabel(item) {
    const cat = state.categories.find(c => c.id === item.categoryId);
    const sub = item.subcategoryId ? state.subcategories.find(s => s.id === item.subcategoryId) : null;
    if (!cat) return "Unknown";
    return sub ? `${cat.name} › ${sub.name}` : cat.name;
  }

  const editItemSum = editForm ? editForm.items.reduce((s,i) => s + (parseFloat(i.hours)||0), 0) : 0;
  const editTotal = editForm ? parseFloat(editForm.totalHours)||0 : 0;
  const editOver = editItemSum > editTotal;

  return (
    <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:20 }}>
      <div>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
          <div style={{fontWeight:700,fontSize:13,color:"#2c3e50"}}>Templates</div>
          <button onClick={openNew} style={{...btnPrimary,padding:"5px 12px",fontSize:11}}>+ New</button>
        </div>
        {state.templates.map(t=>(
          <div key={t.id}
            style={{padding:"12px 16px",borderRadius:10,border:`2px solid ${selected===t.id?TEAL:"#e9ecef"}`,background:selected===t.id?TEAL_LIGHT:"#fff",cursor:"pointer",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}
            onClick={()=>{setSelected(t.id);setEditing(false);}}>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:"#2c3e50"}}>{t.name}</div>
              <div style={{fontSize:11,color:"#6c757d",marginTop:3}}>{t.totalHours}h total</div>
            </div>
            <button onClick={e=>{e.stopPropagation();deleteTemplate(t.id);}} style={{...btnDanger,padding:"2px 7px",fontSize:10}}>✕</button>
          </div>
        ))}
      </div>

      {tmpl && !editing && (
        <div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #e9ecef"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
            <div>
              <h3 style={{margin:"0 0 4px",fontSize:16}}>{tmpl.name}</h3>
              <p style={{margin:"0 0 4px",color:"#6c757d",fontSize:13}}>{tmpl.description || <em style={{color:"#adb5bd"}}>No description</em>}</p>
              <p style={{margin:0,fontSize:12,color:"#6c757d"}}>Total: <strong>{tmpl.totalHours}h</strong></p>
            </div>
            <button onClick={()=>startEdit(tmpl)} style={btnPrimary}>Edit Template</button>
          </div>
          <div style={{fontWeight:700,fontSize:12,color:"#6c757d",marginBottom:10,marginTop:16,textTransform:"uppercase"}}>Allocation ({tmpl.totalHours}h total)</div>
          {tmpl.items.map((item,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f0f2f4",fontSize:13}}>
              <span style={{color:"#495057"}}>{itemLabel(item)}</span>
              <span style={{fontWeight:700,color:TEAL_DARK}}>{item.hours}h</span>
            </div>
          ))}
          {tmpl.items.length === 0 && <div style={{color:"#adb5bd",fontSize:12,fontStyle:"italic"}}>No line items yet. Click Edit Template to add.</div>}
          <div style={{display:"flex",justifyContent:"flex-end",paddingTop:12,borderTop:"1px solid #e9ecef",marginTop:8,fontWeight:700,fontSize:13}}>
            <span>Total allocated: <span style={{color:TEAL_DARK}}>{tmpl.items.reduce((s,i)=>s+(i.hours||0),0)}h</span></span>
          </div>
        </div>
      )}

      {tmpl && editing && editForm && (
        <div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #e9ecef"}}>
          <h3 style={{margin:"0 0 16px",fontSize:15}}>Editing: {editForm.name}</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <div><label style={labelStyle}>Template Name</label>
              <input value={editForm.name} onChange={e=>setEditForm(p=>({...p,name:e.target.value}))} style={inputStyle} />
            </div>
            <div><label style={labelStyle}>Total Hours</label>
              <input type="number" min="0" value={editForm.totalHours} onChange={e=>setEditForm(p=>({...p,totalHours:e.target.value}))} style={inputStyle} />
            </div>
            <div style={{gridColumn:"1/-1"}}><label style={labelStyle}>Description</label>
              <input value={editForm.description} onChange={e=>setEditForm(p=>({...p,description:e.target.value}))} style={inputStyle} />
            </div>
          </div>

          <div style={{marginBottom:16,padding:12,background:editOver?"#f8d7da":"#f0f9f0",borderRadius:8,border:`1px solid ${editOver?"#dc3545":"#28a745"}`}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
              <span>Allocated: <strong>{editItemSum}h</strong></span>
              <span>Budget: <strong>{editTotal}h</strong></span>
              <span style={{color:editOver?"#dc3545":"#28a745",fontWeight:700}}>{editOver?"⚠ Over budget":"Remaining: "+(editTotal-editItemSum)+"h"}</span>
            </div>
            <div style={{background:"#e9ecef",borderRadius:4,height:6}}>
              <div style={{width:`${Math.min(editTotal>0?(editItemSum/editTotal)*100:0,100)}%`,height:"100%",background:editOver?"#dc3545":editItemSum/editTotal>0.9?"#ffc107":TEAL,borderRadius:4}} />
            </div>
          </div>

          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,marginBottom:12}}>
            <thead><tr style={{background:"#f8f9fa"}}>
              <th style={{width:24}}></th>
              <th style={{padding:"8px 10px",textAlign:"left",fontWeight:600,fontSize:11,color:"#6c757d"}}>Category</th>
              <th style={{padding:"8px 10px",textAlign:"left",fontWeight:600,fontSize:11,color:"#6c757d"}}>Sub-category</th>
              <th style={{padding:"8px 10px",textAlign:"right",fontWeight:600,fontSize:11,color:"#6c757d",width:80}}>Hours</th>
              <th style={{width:40}}></th>
            </tr></thead>
            <tbody>
              {editForm.items.map((item,idx)=>(
                <tr key={idx} draggable onDragStart={()=>onItemDragStart(idx)} onDragOver={e=>e.preventDefault()} onDrop={()=>onItemDrop(idx)} style={{borderTop:"1px solid #f0f2f4",cursor:"grab"}}>
                  <td style={{padding:"6px 4px 6px 10px",width:24,color:"#adb5bd",fontSize:16,userSelect:"none"}}>⠿</td>
                  <td style={{padding:"6px 10px"}}>
                    <select value={item.categoryId} onChange={e=>updateItem(idx,"categoryId",e.target.value)} style={{...inputStyle,padding:"5px 8px",fontSize:12}}>
                      <option value="">— Category —</option>
                      {state.categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </td>
                  <td style={{padding:"6px 10px"}}>
                    <select value={item.subcategoryId||""} onChange={e=>updateItem(idx,"subcategoryId",e.target.value||null)} style={{...inputStyle,padding:"5px 8px",fontSize:12}}>
                      <option value="">— None —</option>
                      {state.subcategories.filter(s=>s.categoryId===item.categoryId).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </td>
                  <td style={{padding:"6px 10px"}}>
                    <input type="number" min="0" step="0.5" value={item.hours} onChange={e=>updateItem(idx,"hours",parseFloat(e.target.value)||0)} style={{...inputStyle,padding:"5px 8px",fontSize:12,textAlign:"right"}} />
                  </td>
                  <td style={{padding:"6px 10px",textAlign:"center"}}>
                    <button onClick={()=>removeItem(idx)} style={{...btnDanger,padding:"3px 8px"}}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addItem} style={{...btnGhost,fontSize:11,padding:"5px 12px",marginBottom:16}}>+ Add Line Item</button>

          <div style={{display:"flex",gap:10,justifyContent:"flex-end",borderTop:"1px solid #e9ecef",paddingTop:14}}>
            <button onClick={()=>setEditing(false)} style={btnGhost}>Cancel</button>
            <button onClick={saveEdit} style={btnPrimary}>Save Template</button>
          </div>
        </div>
      )}

      {!tmpl && (
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",color:"#6c757d",fontSize:13}}>Select a template to view details</div>
      )}

      {addModal && (
        <Modal title="New Template" onClose={()=>setAddModal(false)} onSave={createTemplate} width={460}>
          <div><label style={labelStyle}>Template Name *</label><input value={newTmpl.name} onChange={e=>setNewTmpl(p=>({...p,name:e.target.value}))} style={inputStyle} placeholder="e.g. Advanced Multi-Ledger" /></div>
          <div><label style={labelStyle}>Description</label><input value={newTmpl.description} onChange={e=>setNewTmpl(p=>({...p,description:e.target.value}))} style={inputStyle} placeholder="e.g. Multi-currency, up to 10 companies" /></div>
          <div><label style={labelStyle}>Total Hours</label><input type="number" min="0" value={newTmpl.totalHours} onChange={e=>setNewTmpl(p=>({...p,totalHours:e.target.value}))} style={inputStyle} placeholder="e.g. 120" /></div>
          <div>
            <label style={labelStyle}>Start from</label>
            <div style={{display:"flex",gap:10}}>
              {["blank","copy"].map(v=>(
                <label key={v} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:13}}>
                  <input type="radio" value={v} checked={newTmpl.startFrom===v} onChange={()=>setNewTmpl(p=>({...p,startFrom:v}))} />
                  {v==="blank"?"Blank template":"Copy existing template"}
                </label>
              ))}
            </div>
          </div>
          {newTmpl.startFrom === "copy" && (
            <div><label style={labelStyle}>Copy from</label>
              <select value={newTmpl.copyFromId} onChange={e=>setNewTmpl(p=>({...p,copyFromId:e.target.value}))} style={inputStyle}>
                <option value="">— Select template —</option>
                {state.templates.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ── Seed data ─────────────────────────────────────────────────────────────────
const SEED_CATEGORIES = [
  { id: "cat-setup",    name: "Setup and Configuration",      active: true, order: 1 },
  { id: "cat-training", name: "Training",                     active: true, order: 2 },
  { id: "cat-reports",  name: "Report Writing",               active: true, order: 3 },
  { id: "cat-testing",  name: "Testing",                      active: true, order: 4 },
  { id: "cat-planning", name: "Planning and Review Meetings", active: true, order: 5 },
];
const SEED_SUBCATEGORIES = [
  { id: "sub-gl",       categoryId: "cat-setup",    name: "Default GL Accounts",         active: true },
  { id: "sub-ledgers",  categoryId: "cat-setup",    name: "Ledgers",                     active: true },
  { id: "sub-altchart", categoryId: "cat-setup",    name: "Alternate Chart Setup",       active: true },
  { id: "sub-fxcurr",   categoryId: "cat-setup",    name: "Setup Reporting Currencies",  active: true },
  { id: "sub-users",    categoryId: "cat-setup",    name: "Setup Users",                 active: true },
  { id: "sub-tcourse",  categoryId: "cat-training", name: "Training Courses",            active: true },
  { id: "sub-support",  categoryId: "cat-training", name: "Additional Support",          active: true },
  { id: "sub-mrep",     categoryId: "cat-reports",  name: "Mondial Reports",             active: true },
  { id: "sub-exrep",    categoryId: "cat-reports",  name: "Excel Reports",               active: true },
  { id: "sub-test",     categoryId: "cat-testing",  name: "Testing",                     active: true },
  { id: "sub-plan",     categoryId: "cat-planning", name: "Planning and Review Meetings", active: true },
];
const SEED_CONSULTANTS = [
  { id: "usr-1", name: "Sarah Chen",      email: "s.chen@mondialsoftware.com",       role: "Senior Consultant",   active: true, billRate: "120", billCurrency: "GBP" },
  { id: "usr-2", name: "James Okafor",    email: "j.okafor@mondialsoftware.com",     role: "Implementation Lead", active: true, billRate: "150", billCurrency: "GBP" },
  { id: "usr-3", name: "Priya Nair",      email: "p.nair@mondialsoftware.com",       role: "Report Specialist",   active: true, billRate: "110", billCurrency: "GBP" },
  { id: "usr-4", name: "Tom Müller",      email: "t.muller@mondialsoftware.com",     role: "Consultant",          active: true, billRate: "95",  billCurrency: "GBP" },
  { id: "usr-5", name: "Mark Richardson", email: "m.richardson@mondialsoftware.com", role: "Director",            active: true, billRate: "200", billCurrency: "GBP" },
];
const SEED_OEM_PARTNERS = [
  { id: "oem-1", name: "Apex ERP Solutions",   active: true, contacts: [{ name: "David Walsh", email: "d.walsh@apexerp.com",    primary: true  }, { name: "Karen Lee", email: "k.lee@apexerp.com", primary: false }] },
  { id: "oem-2", name: "CoreFinance Systems",  active: true, contacts: [{ name: "Linda Park",  email: "l.park@corefinance.com", primary: true  }] },
  { id: "oem-3", name: "Nexus Business Suite", active: true, contacts: [{ name: "Raj Patel",   email: "r.patel@nexusbs.com",    primary: true  }] },
];
const SEED_CUSTOMERS = [
  { id: "cust-1", name: "Hartwell Manufacturing Group", oemId: "oem-1", contacts: [{ name: "Claire Burton", email: "c.burton@hartwell.com", title: "CFO",              primary: true  }, { name: "Steve Nolan", email: "s.nolan@hartwell.com", title: "IT Director", primary: false }] },
  { id: "cust-2", name: "Meridian Logistics Ltd",       oemId: "oem-1", contacts: [{ name: "Fiona Marsh",   email: "f.marsh@meridian.com",  title: "Finance Director", primary: true  }] },
  { id: "cust-3", name: "Castello Retail Group",        oemId: "oem-2", contacts: [{ name: "Antonio Reyes", email: "a.reyes@castello.com",  title: "Group CFO",        primary: true  }] },
  { id: "cust-4", name: "Brightside Financial Services",oemId: "oem-3", contacts: [{ name: "Neil Thompson", email: "n.thompson@brightside.com", title: "COO",          primary: true  }] },
  { id: "cust-5", name: "Verano Property Holdings",     oemId: "oem-2", contacts: [{ name: "Lucy Huang",    email: "l.huang@verano.com",    title: "Finance Manager",  primary: true  }] },
];
const SEED_TEMPLATES = [
  { id: "tmpl-1", name: "Standard SME Implementation", description: "Single-ledger, single-currency, up to 5 companies", totalHours: 80,
    items: [{ categoryId:"cat-setup",subcategoryId:null,hours:30 },{ categoryId:"cat-training",subcategoryId:null,hours:20 },{ categoryId:"cat-reports",subcategoryId:null,hours:15 },{ categoryId:"cat-testing",subcategoryId:null,hours:10 },{ categoryId:"cat-planning",subcategoryId:null,hours:5 }] },
  { id: "tmpl-2", name: "Multi-Currency Enterprise", description: "Multi-ledger, multi-currency, consolidation reporting", totalHours: 200,
    items: [{ categoryId:"cat-setup",subcategoryId:"sub-fxcurr",hours:20 },{ categoryId:"cat-setup",subcategoryId:"sub-gl",hours:10 },{ categoryId:"cat-training",subcategoryId:"sub-tcourse",hours:30 },{ categoryId:"cat-reports",subcategoryId:"sub-mrep",hours:25 },{ categoryId:"cat-testing",subcategoryId:"sub-test",hours:15 },{ categoryId:"cat-planning",subcategoryId:"sub-plan",hours:10 }] },
];
const SEED_PROJECTS = [
  { id:"proj-1",customerId:"cust-1",name:"Hartwell — Phase 1 Go-Live",status:"active",leadConsultantId:"usr-2",consultantIds:["usr-2","usr-1","usr-3"],templateId:"tmpl-2",poHours:200,categories:[{categoryId:"cat-setup",plannedHours:90,usedHours:85},{categoryId:"cat-training",plannedHours:40,usedHours:28}] },
  { id:"proj-2",customerId:"cust-3",name:"Castello — Mondial Onboarding",status:"active",leadConsultantId:"usr-1",consultantIds:["usr-1","usr-4"],templateId:"tmpl-1",poHours:80,categories:[] },
];

// ── Help key map: section id → helpContent key ────────────────────────────────
const SECTION_HELP = {
  consultants: "setupConsultants",
  customers:   "setupCustomersOem",
  categories:  "setupCategories",
  templates:   "setupTemplates",
};

// ── Main Setup page ───────────────────────────────────────────────────────────
export default function Setup({ state: externalState, onUpdate: externalUpdate }) {
  const isStandalone = !externalState;
  const [internalState, setInternalState] = useState({
    categories: SEED_CATEGORIES, subcategories: SEED_SUBCATEGORIES,
    consultants: SEED_CONSULTANTS, oemPartners: SEED_OEM_PARTNERS,
    customers: SEED_CUSTOMERS, templates: SEED_TEMPLATES, projects: SEED_PROJECTS,
  });

  const state = externalState || internalState;
  function onUpdate(field, value) {
    if (externalUpdate) externalUpdate(field, value);
    else setInternalState(p => ({ ...p, [field]: value }));
  }

  const sections = [
    { id: "consultants", label: "Consultants",     icon: "👤" },
    { id: "customers",   label: "Customers & OEM", icon: "🏢" },
    { id: "categories",  label: "Categories",      icon: "📂" },
    { id: "templates",   label: "Templates",       icon: "📋" },
  ];
  const [section, setSection] = useState("consultants");
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div style={{ flex:1, display:"flex", overflow:"hidden", fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13 }}>
      {/* Sidebar */}
      <div style={{ width:180, background:"#f8f9fa", borderRight:"1px solid #dee2e6", padding:"12px 0" }}>
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

      {/* Main content */}
      <div style={{flex:1,overflow:"auto",padding:24}}>
        {/* Section header with help button */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"flex-end",marginBottom:4 }}>
          <HelpButton onClick={() => setShowHelp(true)} />
        </div>

        {section==="consultants" && <ConsultantsSetup state={state} onUpdate={onUpdate} />}
        {section==="customers"   && <CustomersSetup   state={state} onUpdate={onUpdate} />}
        {section==="categories"  && <CategoriesSetup  state={state} onUpdate={onUpdate} />}
        {section==="templates"   && <TemplatesSetup   state={state} onUpdate={onUpdate} />}
      </div>

      {/* Help modal — content changes with active section */}
      {showHelp && (
        <HelpModal content={helpContent[SECTION_HELP[section]]} onClose={() => setShowHelp(false)} />
      )}
    </div>
  );
}
