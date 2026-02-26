// ─── Storage ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = "mondial-psa-v1";

export async function loadPSAData() {
  try {
    const res = await window.storage.get(STORAGE_KEY, true);
    return res ? JSON.parse(res.value) : null;
  } catch { return null; }
}

export async function savePSAData(data) {
  try {
    await window.storage.set(STORAGE_KEY, JSON.stringify(data), true);
  } catch (e) { console.error("PSA storage save failed", e); }
}

// ─── Seed data ────────────────────────────────────────────────────────────────
export const SEED_CATEGORIES = [
  { id: "cat-setup",    name: "Setup and Configuration", active: true, order: 1 },
  { id: "cat-training", name: "Training",                active: true, order: 2 },
  { id: "cat-reports",  name: "Report Writing",          active: true, order: 3 },
  { id: "cat-testing",  name: "Testing",                 active: true, order: 4 },
  { id: "cat-planning", name: "Planning and Review Meetings", active: true, order: 5 },
];

export const SEED_SUBCATEGORIES = [
  // Setup and Configuration
  { id: "sub-gl",       categoryId: "cat-setup",    name: "Default GL Accounts",        active: true },
  { id: "sub-ledgers",  categoryId: "cat-setup",    name: "Ledgers",                    active: true },
  { id: "sub-altchart", categoryId: "cat-setup",    name: "Alternate Chart Setup",      active: true },
  { id: "sub-altmap",   categoryId: "cat-setup",    name: "Alternate Chart Mapping",    active: true },
  { id: "sub-fxmap",    categoryId: "cat-setup",    name: "Fx Type Mapping",            active: true },
  { id: "sub-budget",   categoryId: "cat-setup",    name: "Budget Import",              active: true },
  { id: "sub-fxcurr",   categoryId: "cat-setup",    name: "Setup Reporting Currencies", active: true },
  { id: "sub-users",    categoryId: "cat-setup",    name: "Setup Users",                active: true },
  { id: "sub-security", categoryId: "cat-setup",    name: "Setup User Security",        active: true },
  { id: "sub-tmpl",     categoryId: "cat-setup",    name: "Setup Transaction Templates",active: true },
  { id: "sub-mreports", categoryId: "cat-setup",    name: "Configure Mondial Reports",  active: true },
  // Training
  { id: "sub-tcourse",  categoryId: "cat-training", name: "Training Courses",           active: true },
  { id: "sub-support",  categoryId: "cat-training", name: "Additional Support",         active: true },
  // Report Writing
  { id: "sub-mrep",     categoryId: "cat-reports",  name: "Mondial Reports",            active: true },
  { id: "sub-exrep",    categoryId: "cat-reports",  name: "Excel Reports",              active: true },
  // Testing
  { id: "sub-test",     categoryId: "cat-testing",  name: "Testing",                    active: true },
  // Planning
  { id: "sub-plan",     categoryId: "cat-planning", name: "Planning and Review Meetings",active: true },
];

export const SEED_CONSULTANTS = [
  { id: "usr-1", name: "Sarah Chen",       email: "s.chen@mondialsoftware.com",      role: "Senior Consultant", active: true },
  { id: "usr-2", name: "James Okafor",     email: "j.okafor@mondialsoftware.com",    role: "Implementation Lead", active: true },
  { id: "usr-3", name: "Priya Nair",       email: "p.nair@mondialsoftware.com",      role: "Report Specialist", active: true },
  { id: "usr-4", name: "Tom Müller",       email: "t.muller@mondialsoftware.com",    role: "Consultant", active: true },
  { id: "usr-5", name: "Mark Richardson",  email: "m.richardson@mondialsoftware.com",role: "Director", active: true },
];

export const SEED_OEM_PARTNERS = [
  { id: "oem-1", name: "Apex ERP Solutions",    contact: "David Walsh",    email: "d.walsh@apexerp.com" },
  { id: "oem-2", name: "CoreFinance Systems",   contact: "Linda Park",     email: "l.park@corefinance.com" },
  { id: "oem-3", name: "Nexus Business Suite",  contact: "Raj Patel",      email: "r.patel@nexusbs.com" },
];

export const SEED_CUSTOMERS = [
  { id: "cust-1", name: "Hartwell Manufacturing Group", oemId: "oem-1", contacts: [
    { name: "Claire Burton",  email: "c.burton@hartwell.com",  title: "CFO" },
    { name: "Steve Nolan",    email: "s.nolan@hartwell.com",   title: "IT Director" },
  ]},
  { id: "cust-2", name: "Meridian Logistics Ltd", oemId: "oem-1", contacts: [
    { name: "Fiona Marsh",    email: "f.marsh@meridian.com",   title: "Finance Director" },
  ]},
  { id: "cust-3", name: "Castello Retail Group", oemId: "oem-2", contacts: [
    { name: "Antonio Reyes",  email: "a.reyes@castello.com",   title: "Group CFO" },
    { name: "Maria Silva",    email: "m.silva@castello.com",   title: "Systems Manager" },
  ]},
  { id: "cust-4", name: "Brightside Financial Services", oemId: "oem-3", contacts: [
    { name: "Neil Thompson",  email: "n.thompson@brightside.com", title: "COO" },
  ]},
  { id: "cust-5", name: "Verano Property Holdings", oemId: "oem-2", contacts: [
    { name: "Lucy Huang",     email: "l.huang@verano.com",     title: "Finance Manager" },
  ]},
];

export const SEED_TEMPLATES = [
  {
    id: "tmpl-1", name: "Standard SME Implementation",
    description: "Single-ledger, single-currency, up to 5 companies",
    totalHours: 80,
    items: [
      { categoryId: "cat-setup",    subcategoryId: null,         hours: 30 },
      { categoryId: "cat-training", subcategoryId: null,         hours: 20 },
      { categoryId: "cat-reports",  subcategoryId: null,         hours: 15 },
      { categoryId: "cat-testing",  subcategoryId: null,         hours: 10 },
      { categoryId: "cat-planning", subcategoryId: null,         hours: 5  },
    ],
  },
  {
    id: "tmpl-2", name: "Multi-Currency Enterprise",
    description: "Multi-ledger, multi-currency, consolidation reporting",
    totalHours: 200,
    items: [
      { categoryId: "cat-setup",    subcategoryId: "sub-fxcurr", hours: 20 },
      { categoryId: "cat-setup",    subcategoryId: "sub-fxmap",  hours: 10 },
      { categoryId: "cat-setup",    subcategoryId: "sub-altchart",hours: 15 },
      { categoryId: "cat-setup",    subcategoryId: "sub-altmap", hours: 15 },
      { categoryId: "cat-setup",    subcategoryId: "sub-gl",     hours: 10 },
      { categoryId: "cat-setup",    subcategoryId: "sub-ledgers",hours: 10 },
      { categoryId: "cat-setup",    subcategoryId: "sub-users",  hours: 5  },
      { categoryId: "cat-setup",    subcategoryId: "sub-security",hours: 5 },
      { categoryId: "cat-training", subcategoryId: "sub-tcourse",hours: 30 },
      { categoryId: "cat-training", subcategoryId: "sub-support",hours: 15 },
      { categoryId: "cat-reports",  subcategoryId: "sub-mrep",   hours: 25 },
      { categoryId: "cat-reports",  subcategoryId: "sub-exrep",  hours: 15 },
      { categoryId: "cat-testing",  subcategoryId: "sub-test",   hours: 15 },
      { categoryId: "cat-planning", subcategoryId: "sub-plan",   hours: 10 },
    ],
  },
];

// Projects
const today = new Date(2026, 1, 24);
const d = (y,m,day) => new Date(y,m-1,day).toISOString().slice(0,10);

export const SEED_PROJECTS = [
  {
    id: "proj-1",
    customerId: "cust-1",
    name: "Hartwell — Phase 1 Go-Live",
    status: "active",
    leadConsultantId: "usr-2",
    consultantIds: ["usr-2","usr-1","usr-3"],
    templateId: "tmpl-2",
    poHours: 200,
    anticipatedHours: 195,
    hoursLevel: "category",
    startDate: d(2025,11,1),
    targetDate: d(2026,3,31),
    companies: 8,
    users: 24,
    multiCurrency: true,
    dedicatedServer: true,
    subscriptionStart: d(2026,4,1),
    subscriptionEnd: d(2027,3,31),
    milestones: [
      { id: "ms-1a", name: "Kick-off Meeting",        date: d(2025,11,5),  status: "complete" },
      { id: "ms-1b", name: "Setup Complete",           date: d(2026,1,15), status: "complete" },
      { id: "ms-1c", name: "UAT Sign-off",             date: d(2026,2,28), status: "in-progress" },
      { id: "ms-1d", name: "Go-Live",                  date: d(2026,3,31), status: "upcoming" },
    ],
    categories: [
      { categoryId: "cat-setup",    plannedHours: 90, usedHours: 85, status: "complete",     assignedUserId: "usr-2", completedDate: d(2026,1,10) },
      { categoryId: "cat-training", plannedHours: 40, usedHours: 28, status: "in-progress",  assignedUserId: "usr-1", plannedDate: d(2026,2,20) },
      { categoryId: "cat-reports",  plannedHours: 35, usedHours: 12, status: "in-progress",  assignedUserId: "usr-3", plannedDate: d(2026,3,5)  },
      { categoryId: "cat-testing",  plannedHours: 20, usedHours: 0,  status: "not-started",  assignedUserId: "usr-2", plannedDate: d(2026,3,15) },
      { categoryId: "cat-planning", plannedHours: 10, usedHours: 8,  status: "in-progress",  assignedUserId: "usr-2", plannedDate: d(2026,3,28) },
    ],
    documents: [
      { id: "doc-1a", name: "Hartwell SOW v2.pdf",       type: "SOW",         addedBy: "usr-2", addedDate: d(2025,10,28) },
      { id: "doc-1b", name: "Kick-off Agenda.docx",      type: "Meeting",     addedBy: "usr-2", addedDate: d(2025,11,4)  },
      { id: "doc-1c", name: "Setup Sign-off.pdf",        type: "Sign-off",    addedBy: "usr-1", addedDate: d(2026,1,12)  },
    ],
    notes: "Multi-entity group with intercompany eliminations required. FX complexity is high — 6 currencies.",
  },
  {
    id: "proj-2",
    customerId: "cust-3",
    name: "Castello — Mondial Onboarding",
    status: "active",
    leadConsultantId: "usr-1",
    consultantIds: ["usr-1","usr-4"],
    templateId: "tmpl-1",
    poHours: 80,
    anticipatedHours: 80,
    hoursLevel: "category",
    startDate: d(2026,1,10),
    targetDate: d(2026,4,15),
    companies: 3,
    users: 10,
    multiCurrency: false,
    dedicatedServer: false,
    subscriptionStart: d(2026,4,15),
    subscriptionEnd: d(2027,4,14),
    milestones: [
      { id: "ms-2a", name: "Kick-off Meeting",     date: d(2026,1,12), status: "complete"    },
      { id: "ms-2b", name: "Setup Complete",        date: d(2026,2,20), status: "upcoming"   },
      { id: "ms-2c", name: "Training Complete",     date: d(2026,3,15), status: "upcoming"   },
      { id: "ms-2d", name: "Go-Live",               date: d(2026,4,15), status: "upcoming"   },
    ],
    categories: [
      { categoryId: "cat-setup",    plannedHours: 30, usedHours: 14, status: "in-progress", assignedUserId: "usr-1", plannedDate: d(2026,2,20) },
      { categoryId: "cat-training", plannedHours: 20, usedHours: 0,  status: "not-started", assignedUserId: "usr-4", plannedDate: d(2026,3,5)  },
      { categoryId: "cat-reports",  plannedHours: 15, usedHours: 0,  status: "not-started", assignedUserId: "usr-3", plannedDate: d(2026,3,20) },
      { categoryId: "cat-testing",  plannedHours: 10, usedHours: 0,  status: "not-started", assignedUserId: "usr-1", plannedDate: d(2026,4,1)  },
      { categoryId: "cat-planning", plannedHours: 5,  usedHours: 2,  status: "in-progress", assignedUserId: "usr-1", plannedDate: d(2026,4,10) },
    ],
    documents: [
      { id: "doc-2a", name: "Castello Proposal v1.pdf", type: "SOW",     addedBy: "usr-5", addedDate: d(2026,1,5) },
    ],
    notes: "Standard single-ledger GBP implementation. Low complexity.",
  },
  {
    id: "proj-3",
    customerId: "cust-2",
    name: "Meridian — Consolidation Module",
    status: "active",
    leadConsultantId: "usr-3",
    consultantIds: ["usr-3","usr-2"],
    templateId: "tmpl-2",
    poHours: 160,
    anticipatedHours: 170,
    hoursLevel: "category",
    startDate: d(2026,2,1),
    targetDate: d(2026,6,30),
    companies: 6,
    users: 18,
    multiCurrency: true,
    dedicatedServer: false,
    subscriptionStart: d(2026,7,1),
    subscriptionEnd: d(2027,6,30),
    milestones: [
      { id: "ms-3a", name: "Kick-off Meeting",    date: d(2026,2,3),  status: "complete"  },
      { id: "ms-3b", name: "Chart Design Agreed", date: d(2026,3,15), status: "upcoming"  },
      { id: "ms-3c", name: "Reports Signed Off",  date: d(2026,5,30), status: "upcoming"  },
      { id: "ms-3d", name: "Go-Live",             date: d(2026,6,30), status: "upcoming"  },
    ],
    categories: [
      { categoryId: "cat-setup",    plannedHours: 70, usedHours: 8,  status: "in-progress", assignedUserId: "usr-2", plannedDate: d(2026,4,1)  },
      { categoryId: "cat-training", plannedHours: 30, usedHours: 0,  status: "not-started", assignedUserId: "usr-3", plannedDate: d(2026,5,1)  },
      { categoryId: "cat-reports",  plannedHours: 40, usedHours: 0,  status: "not-started", assignedUserId: "usr-3", plannedDate: d(2026,5,15) },
      { categoryId: "cat-testing",  plannedHours: 20, usedHours: 0,  status: "not-started", assignedUserId: "usr-2", plannedDate: d(2026,6,10) },
      { categoryId: "cat-planning", plannedHours: 10, usedHours: 3,  status: "in-progress", assignedUserId: "usr-3", plannedDate: d(2026,6,25) },
    ],
    documents: [
      { id: "doc-3a", name: "Meridian Consolidation Brief.pdf", type: "SOW", addedBy: "usr-3", addedDate: d(2026,1,28) },
    ],
    notes: "Anticipated hours exceed PO — flagged for partner discussion. Complex multi-currency consolidation.",
  },
  {
    id: "proj-4",
    customerId: "cust-4",
    name: "Brightside — Financial Reporting Setup",
    status: "closed",
    leadConsultantId: "usr-4",
    consultantIds: ["usr-4","usr-1"],
    templateId: "tmpl-1",
    poHours: 80,
    anticipatedHours: 78,
    hoursLevel: "category",
    startDate: d(2025,7,1),
    targetDate: d(2025,10,31),
    companies: 2,
    users: 8,
    multiCurrency: false,
    dedicatedServer: false,
    subscriptionStart: d(2025,11,1),
    subscriptionEnd: d(2026,10,31),
    milestones: [
      { id: "ms-4a", name: "Kick-off Meeting",  date: d(2025,7,3),   status: "complete" },
      { id: "ms-4b", name: "Setup Complete",    date: d(2025,8,29),  status: "complete" },
      { id: "ms-4c", name: "Training Complete", date: d(2025,9,26),  status: "complete" },
      { id: "ms-4d", name: "Go-Live",           date: d(2025,10,31), status: "complete" },
    ],
    categories: [
      { categoryId: "cat-setup",    plannedHours: 30, usedHours: 29, status: "complete", assignedUserId: "usr-4", completedDate: d(2025,8,29) },
      { categoryId: "cat-training", plannedHours: 20, usedHours: 21, status: "complete", assignedUserId: "usr-1", completedDate: d(2025,9,26) },
      { categoryId: "cat-reports",  plannedHours: 15, usedHours: 14, status: "complete", assignedUserId: "usr-4", completedDate: d(2025,10,10) },
      { categoryId: "cat-testing",  plannedHours: 8,  usedHours: 8,  status: "complete", assignedUserId: "usr-4", completedDate: d(2025,10,20) },
      { categoryId: "cat-planning", plannedHours: 5,  usedHours: 6,  status: "complete", assignedUserId: "usr-4", completedDate: d(2025,10,28) },
    ],
    documents: [
      { id: "doc-4a", name: "Brightside SOW.pdf",       type: "SOW",      addedBy: "usr-5", addedDate: d(2025,6,25) },
      { id: "doc-4b", name: "Go-Live Sign-off.pdf",     type: "Sign-off", addedBy: "usr-4", addedDate: d(2025,10,31) },
    ],
    notes: "Completed successfully. Customer very happy. Upsell opportunity for consolidation module.",
  },
  {
    id: "proj-5",
    customerId: "cust-5",
    name: "Verano — Multi-Entity Rollout",
    status: "pipeline",
    leadConsultantId: "usr-2",
    consultantIds: ["usr-2"],
    templateId: "tmpl-2",
    poHours: 160,
    anticipatedHours: 160,
    hoursLevel: "category",
    startDate: d(2026,4,1),
    targetDate: d(2026,9,30),
    companies: 5,
    users: 15,
    multiCurrency: true,
    dedicatedServer: true,
    subscriptionStart: d(2026,10,1),
    subscriptionEnd: d(2027,9,30),
    milestones: [
      { id: "ms-5a", name: "PO Received",       date: d(2026,3,15), status: "complete"  },
      { id: "ms-5b", name: "Kick-off Meeting",  date: d(2026,4,3),  status: "upcoming"  },
      { id: "ms-5c", name: "Setup Complete",    date: d(2026,6,30), status: "upcoming"  },
      { id: "ms-5d", name: "Go-Live",           date: d(2026,9,30), status: "upcoming"  },
    ],
    categories: [
      { categoryId: "cat-setup",    plannedHours: 65, usedHours: 0, status: "not-started", assignedUserId: "usr-2", plannedDate: d(2026,6,30) },
      { categoryId: "cat-training", plannedHours: 35, usedHours: 0, status: "not-started", assignedUserId: null,    plannedDate: d(2026,7,31) },
      { categoryId: "cat-reports",  plannedHours: 30, usedHours: 0, status: "not-started", assignedUserId: null,    plannedDate: d(2026,8,20) },
      { categoryId: "cat-testing",  plannedHours: 20, usedHours: 0, status: "not-started", assignedUserId: null,    plannedDate: d(2026,9,10) },
      { categoryId: "cat-planning", plannedHours: 10, usedHours: 0, status: "not-started", assignedUserId: "usr-2", plannedDate: d(2026,9,25) },
    ],
    documents: [
      { id: "doc-5a", name: "Verano PO #VER-2026-004.pdf", type: "PO", addedBy: "usr-5", addedDate: d(2026,3,14) },
    ],
    notes: "PO received. Awaiting kick-off scheduling. Property group with 5 SPVs.",
  },
];

export function buildInitialState() {
  return {
    categories:    SEED_CATEGORIES,
    subcategories: SEED_SUBCATEGORIES,
    consultants:   SEED_CONSULTANTS,
    oemPartners:   SEED_OEM_PARTNERS,
    customers:     SEED_CUSTOMERS,
    templates:     SEED_TEMPLATES,
    projects:      SEED_PROJECTS,
  };
}
