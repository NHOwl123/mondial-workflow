import { useState, useMemo, useEffect, useCallback } from "react";
import ProjectTracking from "./ProjectTracking/index.jsx";

// ─── Theme ────────────────────────────────────────────────────────────────────
const TEAL = "#1a7f8e";
const TEAL_DARK = "#145f6b";
const TEAL_LIGHT = "#e8f4f6";

// ─── Workflow data (unchanged) ────────────────────────────────────────────────
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

const USERS = ["Sarah Chen","James Okafor","Priya Nair","Tom Müller","Ana Lima","Fatima Al-Rashid","David Park","Emma Wilson"];
const today = new Date(2026, 1, 24);
const fmt = d => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
const daysFromToday = n => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };

const ENTITIES = [
  "Shaneel UK Ltd","Shaneel Germany GmbH","Shaneel Germany Holding GmbH",
  "Shaneel USA Inc","Shaneel Singapore Pte Ltd","Shaneel UAE LLC",
  "Shaneel India Pvt Ltd","Shaneel Australia Pty Ltd","Shaneel France SAS",
  "Shaneel Netherlands BV","Shaneel Brazil Ltda","Shaneel Japan KK",
  "Shaneel Canada Inc","Shaneel South Africa Ltd","Shaneel Mexico SA",
  "Shaneel Group Holdings Ltd",
];

function makeCells() {
  const cells = {};
  ENTITIES.forEach((e, ei) => {
    TASKS.forEach((t, ti) => {
      const user = USERS[(ei + ti) % USERS.length];
      let status, dueDate, completedDate, notes = [], attachments = [];
      const r = (ei * 11 + ti) % 17;
      if (r < 5) { status = "complete"; completedDate = fmt(daysFromToday(-3 + (r % 3))); dueDate = fmt(daysFromToday(-5 + (r % 3))); }
      else if (r < 8) { status = "overdue"; dueDate = fmt(daysFromToday(-1 - (r % 3))); }
      else if (r < 11) { status = "due-soon"; dueDate = fmt(daysFromToday(1 + (r % 2))); }
      else if (r < 14) { status = "on-track"; dueDate = fmt(daysFromToday(5 + (r % 4))); }
      else { status = "unassigned"; dueDate = fmt(daysFromToday(7)); }
      if (r === 2) notes = [{ user: "Sarah Chen", time: "24 Feb 09:14", text: "Uploaded SAP B1 TB export. Two minor rounding differences noted in accounts 4100 and 5200 — both < £1, marked as explained." }];
      if (r === 7) notes = [{ user: "Tom Müller", time: "22 Feb 16:30", text: "EUR/GBP rate source updated to ECB reference. Awaiting confirmation from head office before marking complete." }];
      cells[`${e}::${t.id}`] = { status, dueDate, completedDate, user: status === "unassigned" ? null : user, notes, attachments };
    });
  });
  return cells;
}

const STATUS_STYLES = {
  complete:       { bg: "#d4edda", color: "#155724", border: "#28a745" },
  overdue:        { bg: "#f8d7da", color: "#721c24", border: "#dc3545" },
  "due-soon":     { bg: "#fff3cd", color: "#856404", border: "#ffc107" },
  "on-track":     { bg: "#f8f9fa", color: "#495057", border: "#dee2e6" },
  unassigned:     { bg: "#e9ecef", color: "#6c757d", border: "#ced4da" },
  "not-required": { bg: "#e8e8f0", color: "#5a5a7a", border: "#9999bb" },
};

// ─── Hierarchy seed data ──────────────────────────────────────────────────────
const HIERARCHY_TYPES = [
  { id: "legal",    label: "Legal",    description: "Legal ownership structure for statutory consolidation" },
  { id: "regional", label: "Regional", description: "Geographic grouping for management reporting" },
  { id: "industry", label: "Industry", description: "Segment reporting by industry type" },
  { id: "tax",      label: "Tax",      description: "Tax authority groupings for tax planning" },
];

const ALL_COMPANIES = [
  { id: "SEN",  name: "Shaneel Enterprises Ltd",                    regNum: "UK 2171783",      country: "UK",      type: "ultimate-parent" },
  { id: "SAD",  name: "SA Designer Parfums Limited",                regNum: "UK 4198899",      country: "UK",      type: "intermediate" },
  { id: "PSH",  name: "Perfumeshopping.com Ltd",                    regNum: "UK 3606499",      country: "UK",      type: "subsidiary" },
  { id: "SEE",  name: "Shaneel Enterprises (Europe) Limited",       regNum: "Malta C103530",   country: "Malta",   type: "intermediate" },
  { id: "SMX",  name: "Shaneel Mexico Ltd",                         regNum: "UK 12855825",     country: "UK",      type: "intermediate" },
  { id: "FEL",  name: "Fragrance Expert Ltd",                       regNum: "UK 6005330",      country: "UK",      type: "subsidiary" },
  { id: "GFL",  name: "Ghost Fragrances Limited",                   regNum: "UK 7904193",      country: "UK",      type: "subsidiary" },
  { id: "EAC",  name: "E.A. Cosmetics Distribution GmbH",           regNum: "Germany HRB 86497",country: "Germany",type: "subsidiary" },
  { id: "MPL",  name: "Mayfair Perfumes Ltd",                       regNum: "UK 3696250",      country: "UK",      type: "subsidiary" },
  { id: "SDE",  name: "SA Designer Parfums (Europe) Limited",       regNum: "Malta C103547",   country: "Malta",   type: "subsidiary" },
  { id: "SDM",  name: "Shaneel Designer Parfums Mexico S.A. de C.V.",regNum: "SDP2009224X8",   country: "Mexico",  type: "subsidiary" },
  { id: "DMH",  name: "Dilesh Mehta",                               regNum: "",                country: "UK",      type: "ultimate-parent" },
  { id: "NBH",  name: "Nirvana Brands Holdings Ltd",                regNum: "UK 13550616",     country: "UK",      type: "intermediate" },
  { id: "NBW",  name: "Nirvana Brands Worldwide Ltd",               regNum: "UK 13552578",     country: "UK",      type: "intermediate" },
  { id: "NBL",  name: "Nirvana Brands Ltd",                         regNum: "",                country: "UK",      type: "intermediate" },
  { id: "HOW",  name: "House of Worth Ltd",                         regNum: "",                country: "UK",      type: "subsidiary" },
  { id: "NBI",  name: "Nirvana Brands Inc",                         regNum: "",                country: "USA",     type: "subsidiary" },
  { id: "NBG",  name: "Nirvana Beauty GmbH",                        regNum: "Germany HRB 267441",country:"Germany",type: "subsidiary" },
  { id: "TBD",  name: "The Beautiful Distribution Company Ltd",     regNum: "UK 09119960",     country: "UK",      type: "subsidiary" },
  { id: "LDC",  name: "The Lovely Distribution Company Limited",    regNum: "",                country: "UK",      type: "subsidiary" },
];

const SEED_RELATIONSHIPS = [
  { id: "r1",  parentId: "SEN", childId: "SAD", directPct: 100,  hierarchyType: "legal", consolidationMethod: "FULL",   effectiveFrom: "2010-01-01" },
  { id: "r2",  parentId: "SEN", childId: "PSH", directPct: 100,  hierarchyType: "legal", consolidationMethod: "FULL",   effectiveFrom: "2010-01-01" },
  { id: "r3",  parentId: "SEN", childId: "SEE", directPct: 100,  hierarchyType: "legal", consolidationMethod: "FULL",   effectiveFrom: "2010-01-01" },
  { id: "r4",  parentId: "SEN", childId: "SMX", directPct: 100,  hierarchyType: "legal", consolidationMethod: "FULL",   effectiveFrom: "2010-01-01" },
  { id: "r5",  parentId: "SEN", childId: "FEL", directPct: 100,  hierarchyType: "legal", consolidationMethod: "FULL",   effectiveFrom: "2010-01-01" },
  { id: "r6",  parentId: "SEN", childId: "GFL", directPct: 100,  hierarchyType: "legal", consolidationMethod: "FULL",   effectiveFrom: "2010-01-01" },
  { id: "r7",  parentId: "SEN", childId: "EAC", directPct: 100,  hierarchyType: "legal", consolidationMethod: "FULL",   effectiveFrom: "2010-01-01" },
  { id: "r8",  parentId: "SEN", childId: "MPL", directPct: 100,  hierarchyType: "legal", consolidationMethod: "FULL",   effectiveFrom: "2010-01-01" },
  { id: "r9",  parentId: "SAD", childId: "SDE", directPct: 100,  hierarchyType: "legal", consolidationMethod: "FULL",   effectiveFrom: "2010-01-01" },
  { id: "r10", parentId: "SEE", childId: "EAC", directPct: 100,  hierarchyType: "legal", consolidationMethod: "FULL",   effectiveFrom: "2010-01-01" },
  { id: "r11", parentId: "SMX", childId: "SDM", directPct: 99.9, hierarchyType: "legal", consolidationMethod: "FULL",   effectiveFrom: "2010-01-01" },
  { id: "r12", parentId: "FEL", childId: "MPL", directPct: 100,  hierarchyType: "legal", consolidationMethod: "FULL",   effectiveFrom: "2010-01-01" },
  { id: "r13", parentId: "DMH", childId: "NBH", directPct: 100,  hierarchyType: "legal", consolidationMethod: "FULL",   effectiveFrom: "2021-01-01" },
  { id: "r14", parentId: "NBH", childId: "NBW", directPct: 100,  hierarchyType: "legal", consolidationMethod: "FULL",   effectiveFrom: "2021-01-01" },
  { id: "r15", parentId: "NBH", childId: "NBL", directPct: 100,  hierarchyType: "legal", consolidationMethod: "FULL",   effectiveFrom: "2021-01-01" },
  { id: "r16", parentId: "NBW", childId: "HOW", directPct: 100,  hierarchyType: "legal", consolidationMethod: "FULL",   effectiveFrom: "2021-01-01" },
  { id: "r17", parentId: "NBL", childId: "NBI", directPct: 100,  hierarchyType: "legal", consolidationMethod: "FULL",   effectiveFrom: "2021-01-01" },
  { id: "r18", parentId: "NBL", childId: "NBG", directPct: 100,  hierarchyType: "legal", consolidationMethod: "FULL",   effectiveFrom: "2021-01-01" },
  { id: "r19", parentId: "NBL", childId: "TBD", directPct: 100,  hierarchyType: "legal", consolidationMethod: "FULL",   effectiveFrom: "2021-01-01" },
];

// ─── Consolidation logic ──────────────────────────────────────────────────────
function calcUltimateOwnership(relationships, rootId, hierarchyType) {
  const rels = relationships.filter(r => r.hierarchyType === hierarchyType);
  const results = {};
  function traverse(currentId, runningPct) {
    const children = rels.filter(r => r.parentId === currentId);
    children.forEach(r => {
      const contrib = (runningPct * r.directPct) / 100;
      results[r.childId] = (results[r.childId] || 0) + contrib;
      traverse(r.childId, contrib);
    });
  }
  traverse(rootId, 100);
  return results;
}

function suggestMethod(pct) {
  if (pct > 50) return "FULL";
  if (pct >= 20) return "EQUITY";
  return "NONE";
}

// ─── Storage helpers ──────────────────────────────────────────────────────────
const STORAGE_KEY = "mondial-hierarchies-v1";

async function loadHierarchyData() {
  try {
    const res = await window.storage.get(STORAGE_KEY, true);
    return res ? JSON.parse(res.value) : null;
  } catch { return null; }
}

async function saveHierarchyData(data) {
  try {
    await window.storage.set(STORAGE_KEY, JSON.stringify(data), true);
  } catch (e) { console.error("Storage save failed", e); }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CompanyBadge({ type }) {
  const map = {
    "ultimate-parent": { label: "Ultimate Parent", bg: "#1a7f8e", color: "#fff" },
    "intermediate":    { label: "Intermediate",    bg: "#6f42c1", color: "#fff" },
    "subsidiary":      { label: "Subsidiary",      bg: "#6c757d", color: "#fff" },
  };
  const s = map[type] || map["subsidiary"];
  return (
    <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 10, background: s.bg, color: s.color, fontWeight: 700, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

function MethodBadge({ method }) {
  const map = {
    FULL:   { bg: "#d4edda", color: "#155724", border: "#28a745" },
    EQUITY: { bg: "#fff3cd", color: "#856404", border: "#ffc107" },
    NONE:   { bg: "#e9ecef", color: "#6c757d", border: "#ced4da" },
  };
  const s = map[method] || map.NONE;
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontWeight: 700 }}>
      {method}
    </span>
  );
}

function TreeNode({ companyId, companies, relationships, hierarchyType, depth = 0, ultimateOwnership }) {
  const [collapsed, setCollapsed] = useState(false);
  const co = companies.find(c => c.id === companyId);
  if (!co) return null;
  const children = relationships.filter(r => r.parentId === companyId && r.hierarchyType === hierarchyType);
  const hasChildren = children.length > 0;
  const ult = ultimateOwnership?.[companyId];

  return (
    <div style={{ marginLeft: depth === 0 ? 0 : 24, position: "relative" }}>
      {depth > 0 && (
        <div style={{ position: "absolute", left: -16, top: 0, bottom: 0, borderLeft: "2px dashed #ced4da" }} />
      )}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6, position: "relative" }}>
        {depth > 0 && <div style={{ position: "absolute", left: -16, top: 18, width: 16, borderTop: "2px dashed #ced4da" }} />}
        {hasChildren && (
          <button onClick={() => setCollapsed(p => !p)}
            style={{ width: 18, height: 18, borderRadius: 3, border: "1px solid #ced4da", background: "#fff", cursor: "pointer", fontSize: 10, flexShrink: 0, marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {collapsed ? "+" : "−"}
          </button>
        )}
        {!hasChildren && <div style={{ width: 18, flexShrink: 0 }} />}
        <div style={{ background: "#fff", border: `2px solid ${depth === 0 ? TEAL : "#ced4da"}`, borderRadius: 8, padding: "8px 12px", minWidth: 220, maxWidth: 340, boxShadow: depth === 0 ? "0 2px 6px rgba(0,0,0,0.1)" : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 12, color: "#2c3e50" }}>{co.name}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
            <CompanyBadge type={co.type} />
            <span style={{ fontSize: 10, color: "#6c757d" }}>{co.country}</span>
            {co.regNum && <span style={{ fontSize: 9, color: "#adb5bd" }}>{co.regNum}</span>}
            {ult !== undefined && depth > 0 && (
              <span style={{ fontSize: 10, color: TEAL_DARK, fontWeight: 600 }}>Ult: {ult.toFixed(2)}%</span>
            )}
          </div>
        </div>
      </div>
      {!collapsed && children.map(r => {
        return (
          <div key={r.id} style={{ marginLeft: 26 }}>
            <div style={{ fontSize: 10, color: "#6c757d", marginBottom: 2, marginLeft: 18, display: "flex", gap: 8 }}>
              <span>Direct: <strong>{r.directPct}%</strong></span>
              <MethodBadge method={r.consolidationMethod} />
            </div>
            <TreeNode
              companyId={r.childId}
              companies={companies}
              relationships={relationships}
              hierarchyType={hierarchyType}
              depth={depth + 1}
              ultimateOwnership={ultimateOwnership}
            />
          </div>
        );
      })}
    </div>
  );
}

function HierarchiesPage({ companies, setCompanies, relationships, setRelationships, hierarchyTypes, setHierarchyTypes }) {
  const [activeHType, setActiveHType] = useState("legal");
  const [view, setView] = useState("tree");
  const [showAddRel, setShowAddRel] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showAddHType, setShowAddHType] = useState(false);
  const [editRel, setEditRel] = useState(null);
  const [newRel, setNewRel] = useState({ parentId: "", childId: "", directPct: 100, consolidationMethod: "FULL", effectiveFrom: "2024-01-01" });
  const [newCo, setNewCo] = useState({ name: "", regNum: "", country: "", type: "subsidiary" });
  const [newHType, setNewHType] = useState({ id: "", label: "", description: "" });
  const [filterRoot, setFilterRoot] = useState("ALL");

  const hRels = relationships.filter(r => r.hierarchyType === activeHType);
  const childIds = new Set(hRels.map(r => r.childId));
  const parentIds = new Set(hRels.map(r => r.parentId));
  const rootCos = companies.filter(c => parentIds.has(c.id) && !childIds.has(c.id));
  const roots = rootCos.length > 0 ? rootCos : companies.filter(c => c.type === "ultimate-parent");

  const ultimateOwnershipByRoot = useMemo(() => {
    const combined = {};
    roots.forEach(r => {
      const uo = calcUltimateOwnership(relationships, r.id, activeHType);
      Object.entries(uo).forEach(([id, pct]) => {
        combined[id] = (combined[id] || 0) + pct;
      });
    });
    return combined;
  }, [relationships, roots, activeHType]);

  function addRelationship() {
    if (!newRel.parentId || !newRel.childId || newRel.parentId === newRel.childId) return;
    const id = "r" + Date.now();
    setRelationships(prev => [...prev, { ...newRel, id, hierarchyType: activeHType, directPct: parseFloat(newRel.directPct) || 0 }]);
    setNewRel({ parentId: "", childId: "", directPct: 100, consolidationMethod: "FULL", effectiveFrom: "2024-01-01" });
    setShowAddRel(false);
  }

  function updateRelationship() {
    if (!editRel) return;
    setRelationships(prev => prev.map(r => r.id === editRel.id ? { ...editRel, directPct: parseFloat(editRel.directPct) || 0 } : r));
    setEditRel(null);
  }

  function deleteRelationship(id) {
    setRelationships(prev => prev.filter(r => r.id !== id));
  }

  function addCompany() {
    if (!newCo.name.trim()) return;
    const id = "CO" + Date.now();
    setCompanies(prev => [...prev, { ...newCo, id, name: newCo.name.trim() }]);
    setNewCo({ name: "", regNum: "", country: "", type: "subsidiary" });
    setShowAddCompany(false);
  }

  function addHierarchyType() {
    if (!newHType.id.trim() || !newHType.label.trim()) return;
    setHierarchyTypes(prev => [...prev, { ...newHType }]);
    setNewHType({ id: "", label: "", description: "" });
    setShowAddHType(false);
  }

  const displayedRoots = filterRoot === "ALL" ? roots : roots.filter(r => r.id === filterRoot);

  const inputStyle = { border: "1px solid #ced4da", borderRadius: 4, padding: "6px 10px", fontSize: 12, width: "100%", boxSizing: "border-box" };
  const labelStyle = { fontSize: 11, color: "#6c757d", fontWeight: 600, marginBottom: 3, display: "block" };
  const btnPrimary = { background: TEAL, color: "#fff", border: "none", borderRadius: 5, padding: "7px 16px", fontSize: 12, cursor: "pointer", fontWeight: 600 };
  const btnGhost = { background: "#f8f9fa", color: "#495057", border: "1px solid #ced4da", borderRadius: 5, padding: "7px 16px", fontSize: 12, cursor: "pointer", fontWeight: 600 };
  const btnDanger = { background: "#fff", color: "#dc3545", border: "1px solid #dc3545", borderRadius: 5, padding: "4px 10px", fontSize: 11, cursor: "pointer" };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: 16, gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, color: "#2c3e50", fontWeight: 700 }}>Group Hierarchies</h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6c757d" }}>
            Define parent-child relationships between group companies. Used to determine consolidation scope in report generation.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowAddHType(true)} style={btnGhost}>+ Hierarchy Type</button>
          <button onClick={() => setShowAddCompany(true)} style={btnGhost}>+ Company</button>
          <button onClick={() => setShowAddRel(true)} style={btnPrimary}>+ Add Relationship</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, background: "#fff", borderRadius: 8, border: "1px solid #dee2e6", overflow: "hidden", flexShrink: 0 }}>
        {hierarchyTypes.map(ht => (
          <button key={ht.id} onClick={() => setActiveHType(ht.id)}
            style={{ flex: 1, padding: "10px 16px", border: "none", borderRight: "1px solid #dee2e6", cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: activeHType === ht.id ? TEAL : "#fff",
              color: activeHType === ht.id ? "#fff" : "#495057",
              transition: "all 0.15s" }}>
            {ht.label}
            <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.8, marginTop: 2 }}>{ht.description}</div>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {["tree","table","companies"].map(v => (
          <button key={v} onClick={() => setView(v)}
            style={{ padding: "6px 14px", border: "1px solid #ced4da", borderRadius: 5, fontSize: 12, cursor: "pointer", fontWeight: 600,
              background: view === v ? TEAL_LIGHT : "#fff", color: view === v ? TEAL_DARK : "#495057",
              borderColor: view === v ? TEAL : "#ced4da" }}>
            {v === "tree" ? "🌳 Tree View" : v === "table" ? "📋 Relationship Table" : "🏢 Companies"}
          </button>
        ))}
        {view === "tree" && roots.length > 1 && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#6c757d" }}>Root:</span>
            <select value={filterRoot} onChange={e => setFilterRoot(e.target.value)}
              style={{ border: "1px solid #ced4da", borderRadius: 4, padding: "4px 8px", fontSize: 12 }}>
              <option value="ALL">All</option>
              {roots.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        )}
        <div style={{ marginLeft: view === "tree" ? 0 : "auto", fontSize: 11, color: "#6c757d" }}>
          {hRels.length} relationship{hRels.length !== 1 ? "s" : ""} defined
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", background: "#fff", borderRadius: 8, border: "1px solid #dee2e6", padding: 20 }}>
        {view === "tree" && (
          <div>
            {hRels.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: "#6c757d", fontSize: 13 }}>
                No relationships defined for this hierarchy type yet.<br />
                <button onClick={() => setShowAddRel(true)} style={{ ...btnPrimary, marginTop: 12 }}>+ Add First Relationship</button>
              </div>
            )}
            {displayedRoots.map(root => (
              <div key={root.id} style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 11, color: "#6c757d", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Group: {root.name}
                </div>
                <TreeNode
                  companyId={root.id}
                  companies={companies}
                  relationships={relationships}
                  hierarchyType={activeHType}
                  depth={0}
                  ultimateOwnership={ultimateOwnershipByRoot}
                />
              </div>
            ))}
          </div>
        )}

        {view === "table" && (
          <div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: TEAL, color: "#fff" }}>
                  {["Parent Company","Child Company","Direct %","Ultimate %","Method","Effective From",""].map(h => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hRels.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#6c757d" }}>No relationships defined.</td></tr>
                )}
                {hRels.map((r, i) => {
                  const parent = companies.find(c => c.id === r.parentId);
                  const child = companies.find(c => c.id === r.childId);
                  const ult = ultimateOwnershipByRoot[r.childId];
                  return (
                    <tr key={r.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa", borderBottom: "1px solid #dee2e6" }}>
                      <td style={{ padding: "10px 12px", fontWeight: 600, color: "#2c3e50" }}>{parent?.name || r.parentId}</td>
                      <td style={{ padding: "10px 12px", color: "#495057" }}>{child?.name || r.childId}</td>
                      <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, color: TEAL_DARK }}>{r.directPct}%</td>
                      <td style={{ padding: "10px 12px", textAlign: "center", color: "#6c757d" }}>{ult !== undefined ? `${ult.toFixed(2)}%` : "—"}</td>
                      <td style={{ padding: "10px 12px" }}><MethodBadge method={r.consolidationMethod} /></td>
                      <td style={{ padding: "10px 12px", color: "#6c757d" }}>{r.effectiveFrom}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => setEditRel({ ...r })} style={{ ...btnGhost, padding: "3px 10px", fontSize: 11 }}>Edit</button>
                          <button onClick={() => deleteRelationship(r.id)} style={btnDanger}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {hRels.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#2c3e50", marginBottom: 10 }}>Computed Ultimate Ownership</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: TEAL_LIGHT }}>
                      {["Company","Ultimate % (by root)","Suggested Consolidation Method"].map(h => (
                        <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: TEAL_DARK, borderBottom: `2px solid ${TEAL}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(ultimateOwnershipByRoot).sort((a,b) => b[1]-a[1]).map(([id, pct], i) => {
                      const co = companies.find(c => c.id === id);
                      return (
                        <tr key={id} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa", borderBottom: "1px solid #dee2e6" }}>
                          <td style={{ padding: "8px 12px", fontWeight: 600, color: "#2c3e50" }}>{co?.name || id}</td>
                          <td style={{ padding: "8px 12px", fontWeight: 700, color: TEAL_DARK }}>{pct.toFixed(2)}%</td>
                          <td style={{ padding: "8px 12px" }}><MethodBadge method={suggestMethod(pct)} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {view === "companies" && (
          <div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: TEAL, color: "#fff" }}>
                  {["Company Name","Reg. Number","Country","Type"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {companies.map((co, i) => (
                  <tr key={co.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa", borderBottom: "1px solid #dee2e6" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: "#2c3e50" }}>{co.name}</td>
                    <td style={{ padding: "10px 12px", color: "#6c757d" }}>{co.regNum || "—"}</td>
                    <td style={{ padding: "10px 12px", color: "#495057" }}>{co.country || "—"}</td>
                    <td style={{ padding: "10px 12px" }}><CompanyBadge type={co.type} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(showAddRel || editRel) && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: 28, width: 480, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, color: "#2c3e50" }}>{editRel ? "Edit Relationship" : "Add Relationship"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Parent Company</label>
                <select value={editRel ? editRel.parentId : newRel.parentId}
                  onChange={e => editRel ? setEditRel(p => ({...p, parentId: e.target.value})) : setNewRel(p => ({...p, parentId: e.target.value}))}
                  style={inputStyle}>
                  <option value="">— Select parent —</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Child Company</label>
                <select value={editRel ? editRel.childId : newRel.childId}
                  onChange={e => editRel ? setEditRel(p => ({...p, childId: e.target.value})) : setNewRel(p => ({...p, childId: e.target.value}))}
                  style={inputStyle}>
                  <option value="">— Select child —</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Direct Ownership %</label>
                <input type="number" min="0" max="100" step="0.1"
                  value={editRel ? editRel.directPct : newRel.directPct}
                  onChange={e => editRel ? setEditRel(p => ({...p, directPct: e.target.value, consolidationMethod: suggestMethod(parseFloat(e.target.value))}))
                    : setNewRel(p => ({...p, directPct: e.target.value, consolidationMethod: suggestMethod(parseFloat(e.target.value))}))}
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Consolidation Method</label>
                <select value={editRel ? editRel.consolidationMethod : newRel.consolidationMethod}
                  onChange={e => editRel ? setEditRel(p => ({...p, consolidationMethod: e.target.value})) : setNewRel(p => ({...p, consolidationMethod: e.target.value}))}
                  style={inputStyle}>
                  <option value="FULL">FULL - Full consolidation (over 50%)</option>
                  <option value="EQUITY">EQUITY - Equity method (20 to 50%)</option>
                  <option value="NONE">NONE - No consolidation (under 20%)</option>
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Effective From</label>
                <input type="date" value={editRel ? editRel.effectiveFrom : newRel.effectiveFrom}
                  onChange={e => editRel ? setEditRel(p => ({...p, effectiveFrom: e.target.value})) : setNewRel(p => ({...p, effectiveFrom: e.target.value}))}
                  style={{ ...inputStyle, width: "50%" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
              <button onClick={() => { setShowAddRel(false); setEditRel(null); }} style={btnGhost}>Cancel</button>
              <button onClick={editRel ? updateRelationship : addRelationship} style={btnPrimary}>
                {editRel ? "Save Changes" : "Add Relationship"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddCompany && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: 28, width: 440, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, color: "#2c3e50" }}>Add Company</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>Company Name *</label>
                <input value={newCo.name} onChange={e => setNewCo(p => ({...p, name: e.target.value}))} style={inputStyle} placeholder="e.g. Shaneel Holdings Ltd" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Registration Number</label>
                  <input value={newCo.regNum} onChange={e => setNewCo(p => ({...p, regNum: e.target.value}))} style={inputStyle} placeholder="e.g. UK 12345678" />
                </div>
                <div>
                  <label style={labelStyle}>Country</label>
                  <input value={newCo.country} onChange={e => setNewCo(p => ({...p, country: e.target.value}))} style={inputStyle} placeholder="e.g. UK" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Company Type</label>
                <select value={newCo.type} onChange={e => setNewCo(p => ({...p, type: e.target.value}))} style={inputStyle}>
                  <option value="ultimate-parent">Ultimate Parent</option>
                  <option value="intermediate">Intermediate Holding</option>
                  <option value="subsidiary">Subsidiary</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
              <button onClick={() => setShowAddCompany(false)} style={btnGhost}>Cancel</button>
              <button onClick={addCompany} style={btnPrimary}>Add Company</button>
            </div>
          </div>
        </div>
      )}

      {showAddHType && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: 28, width: 420, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, color: "#2c3e50" }}>Add Hierarchy Type</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>ID (lowercase, no spaces) *</label>
                <input value={newHType.id} onChange={e => setNewHType(p => ({...p, id: e.target.value.toLowerCase().replace(/\s/g,"")}))} style={inputStyle} placeholder="e.g. segment" />
              </div>
              <div>
                <label style={labelStyle}>Display Label *</label>
                <input value={newHType.label} onChange={e => setNewHType(p => ({...p, label: e.target.value}))} style={inputStyle} placeholder="e.g. Segment" />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <input value={newHType.description} onChange={e => setNewHType(p => ({...p, description: e.target.value}))} style={inputStyle} placeholder="e.g. Business segment reporting" />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
              <button onClick={() => setShowAddHType(false)} style={btnGhost}>Cancel</button>
              <button onClick={addHierarchyType} style={btnPrimary}>Add Type</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EnterpriseSetupPage({ companies, setCompanies, relationships, setRelationships, hierarchyTypes, setHierarchyTypes }) {
  const [subNav, setSubNav] = useState("hierarchies");
  const subItems = [{ id: "hierarchies", label: "Hierarchies", icon: "🏗" }];
  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <div style={{ width: 180, background: "#f8f9fa", borderRight: "1px solid #dee2e6", padding: "12px 0" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#6c757d", textTransform: "uppercase", letterSpacing: 0.5, padding: "0 14px 8px" }}>Enterprise Set Up</div>
        {subItems.map(si => (
          <div key={si.id} onClick={() => setSubNav(si.id)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: subNav === si.id ? TEAL_LIGHT : "transparent",
              color: subNav === si.id ? TEAL_DARK : "#495057",
              borderLeft: subNav === si.id ? `3px solid ${TEAL}` : "3px solid transparent" }}>
            <span>{si.icon}</span>{si.label}
          </div>
        ))}
      </div>
      {subNav === "hierarchies" && (
        <HierarchiesPage
          companies={companies} setCompanies={setCompanies}
          relationships={relationships} setRelationships={setRelationships}
          hierarchyTypes={hierarchyTypes} setHierarchyTypes={setHierarchyTypes}
        />
      )}
    </div>
  );
}

function PlaceholderPage({ title }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#6c757d" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🚧</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13 }}>This module is under construction.</div>
      </div>
    </div>
  );
}

export default function App() {
  const [cells, setCells] = useState(() => makeCells());
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

  const [companies, setCompanies] = useState(ALL_COMPANIES);
  const [relationships, setRelationships] = useState(SEED_RELATIONSHIPS);
  const [hierarchyTypes, setHierarchyTypes] = useState(HIERARCHY_TYPES);
  const [storageLoaded, setStorageLoaded] = useState(false);

  useEffect(() => {
    loadHierarchyData().then(data => {
      if (data) {
        if (data.companies) setCompanies(data.companies);
        if (data.relationships) setRelationships(data.relationships);
        if (data.hierarchyTypes) setHierarchyTypes(data.hierarchyTypes);
      }
      setStorageLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!storageLoaded) return;
    saveHierarchyData({ companies, relationships, hierarchyTypes });
  }, [companies, relationships, hierarchyTypes, storageLoaded]);

  const key = selected ? `${selected.entity}::${selected.taskId}` : null;
  const cell = key ? cells[key] : null;

  const filteredEntities = useMemo(() => {
    if (filterEntity !== "all") return ENTITIES.filter(e => e === filterEntity);
    return ENTITIES;
  }, [filterEntity]);

  const visibleEntities = useMemo(() => {
    if (filterStatus === "all") return filteredEntities;
    return filteredEntities.filter(e =>
      tasks.some(t => { const c = cells[`${e}::${t.id}`]; return c && c.status === filterStatus; })
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
    setCells(prev => ({ ...prev, [key]: { ...prev[key], status: "complete", completedDate: fmt(today) } }));
  }

  function reverseComplete() {
    if (!key || !cell) return;
    setCells(prev => ({ ...prev, [key]: { ...prev[key], status: "overdue", completedDate: null } }));
  }

  function addNote() {
    if (!noteInput.trim() || !key) return;
    const note = { user: "Mark Richardson", time: `${fmt(today)} ${today.getHours()}:${String(today.getMinutes()).padStart(2,"0")}`, text: noteInput.trim() };
    setCells(prev => ({ ...prev, [key]: { ...prev[key], notes: [...prev[key].notes, note] } }));
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
    setNewTaskName(""); setShowAddTask(false);
  }

  function deleteTask(taskId) {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (selected?.taskId === taskId) setSelected(null);
  }

  function saveTaskName() {
    if (!editTaskName.trim()) return;
    setTasks(prev => prev.map(t => t.id === editingTask ? { ...t, name: editTaskName, short: editTaskName.slice(0, 10) } : t));
    setEditingTask(null); setEditTaskName("");
  }

  const navItems = [
    { id: "workflow",     label: "Period-End Close",        icon: "▦" },
    { id: "reports",      label: "Reports",                 icon: "≡" },
    { id: "adjustments",  label: "Accounting Adjustments",  icon: "≡" },
    { id: "setup",        label: "Enterprise Set Up",        icon: "⚙" },
    { id: "projects",     label: "Project Tracking",        icon: "📊" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, background: "#f0f2f4" }}>
      {/* ── Sidebar ── */}
      <div style={{ width: sidebarOpen ? 220 : 48, background: "teal", color: "#fff", display: "flex", flexDirection: "column", transition: "width 0.2s", flexShrink: 0, overflow: "hidden" }}>
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

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ background: "#fff", borderBottom: "1px solid #dee2e6", padding: "0 20px", height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#2c3e50" }}>
              {activeNav === "workflow" ? "Period-End Close Workflow"
               : activeNav === "reports" ? "Reports"
               : activeNav === "adjustments" ? "Accounting Adjustments"
               : activeNav === "projects" ? "Project Tracking"
               : "Enterprise Set Up"}
            </span>
            {activeNav === "workflow" && (
              <select value={period} onChange={e => setPeriod(e.target.value)}
                style={{ border: "1px solid #ced4da", borderRadius: 4, padding: "4px 8px", fontSize: 13, color: "#495057" }}>
                {["January 2026","December 2025","November 2025"].map(p => <option key={p}>{p}</option>)}
              </select>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: "#6c757d" }}>Logged in as: mark.richardson@mondialsoftware.com</span>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: TEAL, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>MR</div>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {activeNav === "projects" && <ProjectTracking />}
          {activeNav === "reports" && <PlaceholderPage title="Reports" />}
          {activeNav === "adjustments" && <PlaceholderPage title="Accounting Adjustments" />}
          {activeNav === "setup" && (
            <EnterpriseSetupPage
              companies={companies} setCompanies={setCompanies}
              relationships={relationships} setRelationships={setRelationships}
              hierarchyTypes={hierarchyTypes} setHierarchyTypes={setHierarchyTypes}
            />
          )}

          {activeNav === "workflow" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: 16, gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, color: "#6c757d" }}>Filter:</span>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ border: "1px solid #ced4da", borderRadius: 4, padding: "4px 8px", fontSize: 12 }}>
                    <option value="all">All statuses</option>
                    <option value="overdue">Overdue</option>
                    <option value="due-soon">Due soon</option>
                    <option value="complete">Complete</option>
                    <option value="on-track">On track</option>
                    <option value="unassigned">Unassigned</option>
                    <option value="not-required">Not required</option>
                  </select>
                  <select value={filterEntity} onChange={e => setFilterEntity(e.target.value)} style={{ border: "1px solid #ced4da", borderRadius: 4, padding: "4px 8px", fontSize: 12 }}>
                    <option value="all">All entities</option>
                    {ENTITIES.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  {showAddTask ? (
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input value={newTaskName} onChange={e => setNewTaskName(e.target.value)} placeholder="New task name..." autoFocus onKeyDown={e => e.key === "Enter" && addTask()}
                        style={{ border: "1px solid #ced4da", borderRadius: 4, padding: "4px 8px", fontSize: 12, width: 200 }} />
                      <button onClick={addTask} style={{ background: TEAL, color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>Add</button>
                      <button onClick={() => setShowAddTask(false)} style={{ background: "#6c757d", color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setShowAddTask(true)} style={{ background: TEAL, color: "#fff", border: "none", borderRadius: 4, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>+ Add Task</button>
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
                              <input value={editTaskName} onChange={e => setEditTaskName(e.target.value)} onKeyDown={e => e.key === "Enter" && saveTaskName()} autoFocus style={{ fontSize: 10, width: 70, textAlign: "center", borderRadius: 3, border: "none", padding: "2px 4px" }} />
                            ) : <span style={{ lineHeight: 1.2 }}>{t.short}</span>}
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
                          <td style={{ padding: "8px 12px", fontWeight: 600, fontSize: 12, color: "#2c3e50", position: "sticky", left: 0, background: ei % 2 === 0 ? "#fff" : "#f8f9fa", borderRight: "1px solid #dee2e6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={entity}>{entity}</td>
                          {tasks.map(t => {
                            const c = cells[`${entity}::${t.id}`];
                            if (!c) return <td key={t.id} />;
                            const s = STATUS_STYLES[c.status];
                            const isSelected = selected?.entity === entity && selected?.taskId === t.id;
                            return (
                              <td key={t.id} onClick={() => { setSelected({ entity, taskId: t.id }); setPanel("detail"); }}
                                style={{ padding: "4px 3px", textAlign: "center", cursor: "pointer", borderRight: "1px solid #e9ecef" }}>
                                <div style={{ background: s.bg, border: `2px solid ${isSelected ? "#0056b3" : s.border}`, borderRadius: 5, padding: "5px 3px", fontSize: 10, lineHeight: 1.3, outline: isSelected ? "2px solid #0056b3" : "none", boxShadow: isSelected ? "0 0 0 2px #0056b3" : "none", transition: "all 0.1s" }}>
                                  <div style={{ color: s.color, fontWeight: 600, fontSize: 9, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {c.user ? c.user.split(" ").map(n => n[0]).join("") : "—"}
                                  </div>
                                  <div style={{ color: s.color, fontSize: 9 }}>{c.status === "complete" ? c.completedDate : c.status === "not-required" ? "N/A" : c.dueDate}</div>
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
          )}

          {activeNav === "workflow" && selected && cell && (
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
                      color: panel === p ? TEAL : "#6c757d", borderBottom: panel === p ? `2px solid ${TEAL}` : "2px solid transparent", textTransform: "capitalize" }}>
                    {p === "notes" ? `Notes (${cell.notes.length})` : "Detail"}
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
                {panel === "detail" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#6c757d", marginBottom: 4, fontWeight: 600 }}>STATUS</div>
                      <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: STATUS_STYLES[cell.status].bg, color: STATUS_STYLES[cell.status].color, border: `1px solid ${STATUS_STYLES[cell.status].border}` }}>
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
                        <button onClick={markComplete} style={{ background: "#28a745", color: "#fff", border: "none", borderRadius: 5, padding: "9px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600, textAlign: "left" }}>✓ Mark as Complete</button>
                      ) : cell.status === "complete" ? (
                        <button onClick={reverseComplete} style={{ background: "#6c757d", color: "#fff", border: "none", borderRadius: 5, padding: "9px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600, textAlign: "left" }}>↩ Reverse Completion</button>
                      ) : null}
                      {cell.status !== "not-required" ? (
                        <button onClick={() => setCells(prev => ({ ...prev, [key]: { ...prev[key], status: "not-required", user: null, completedDate: null } }))}
                          style={{ background: "#e8e8f0", color: "#5a5a7a", border: "1px solid #9999bb", borderRadius: 5, padding: "9px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600, textAlign: "left" }}>⊘ Mark as Not Required</button>
                      ) : (
                        <button onClick={() => setCells(prev => ({ ...prev, [key]: { ...prev[key], status: "on-track", user: null } }))}
                          style={{ background: "#f8f9fa", color: "#495057", border: "1px solid #ced4da", borderRadius: 5, padding: "9px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600, textAlign: "left" }}>↩ Restore Task</button>
                      )}
                      <button onClick={() => setPanel("notes")} style={{ background: TEAL_LIGHT, color: TEAL_DARK, border: `1px solid ${TEAL}`, borderRadius: 5, padding: "9px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600, textAlign: "left" }}>📝 Add Note</button>
                      <button style={{ background: "#f8f9fa", color: "#495057", border: "1px solid #ced4da", borderRadius: 5, padding: "9px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600, textAlign: "left" }}>📎 Attach Document</button>
                    </div>
                  </div>
                )}
                {panel === "notes" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
                    {cell.notes.length === 0 && <div style={{ color: "#6c757d", fontSize: 12, textAlign: "center", padding: "20px 0", fontStyle: "italic" }}>No notes yet. Add the first note below.</div>}
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
                      <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="Type a note..."
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
