// helpContent.js
// Default help text for all screens.
// Each entry: { title, sections: [{ heading, body }] }
// Review and edit body text to match your team's language.

export const helpContent = {

  // ── Dashboard ───────────────────────────────────────────────────────────────
  dashboard: {
    title: "Dashboard — Project List",
    sections: [
      {
        heading: "What you're looking at",
        body: "The dashboard gives you a live overview of every active project. Each row shows the customer, project name, assigned consultant, current status, and a progress bar comparing hours used against the hours plan.",
      },
      {
        heading: "Progress bar colours",
        body: "Green means more than 10% of the authorised hours remain. Amber means you're within 10% of the limit. Red means actual hours have already exceeded the authorised total.",
      },
      {
        heading: "Hours at a glance",
        body: "Below each progress bar you'll see four small figures: PO Hours (what the OEM partner is paying for), Authorised Hours (management's internal approval), Planned Hours (the sum of all template category targets), and Actual Hours logged to date.",
      },
      {
        heading: "Sorting and filtering",
        body: "Click any column header to sort. The default sort is by Customer name. Use the search box at the top to filter by any text visible on screen.",
      },
      {
        heading: "Opening a project",
        body: "Click anywhere on a project row to open the full project detail view.",
      },
      {
        heading: "Adding a project",
        body: "Click the '+ Add Project' button in the top-right corner. The wizard will walk you through customer, project name, team assignment, and hours in three steps.",
      },
    ],
  },

  // ── Project Detail — Overview ────────────────────────────────────────────────
  projectOverview: {
    title: "Project Overview",
    sections: [
      {
        heading: "Hours comparison table",
        body: "This table is the financial health check for the project. It compares PO Hours, Authorised Hours, and Planned Hours against actuals, showing how many hours remain on each measure.",
      },
      {
        heading: "Remaining colour coding",
        body: "Green = more than 10% remaining. Amber = within 10% of the limit. Red = already exceeded. If multiple rows show red, the most urgent risk is flagged with a warning banner below the table.",
      },
      {
        heading: "Warning banners",
        body: "Banners appear automatically when Actual Hours exceed any of PO, Authorised, or Planned Hours. They are informational — no action is locked until you decide how to respond.",
      },
      {
        heading: "Project details panel",
        body: "The right-hand panel shows the OEM partner, customer, assigned consultant, status, and key dates. Click the edit (pencil) icon to update any of these fields.",
      },
    ],
  },

  // ── Project Detail — Team ────────────────────────────────────────────────────
  projectTeam: {
    title: "Project — Team",
    sections: [
      {
        heading: "What this tab shows",
        body: "The Team tab lists everyone assigned to this project, their role, and the hours they have personally logged. The total across all team members feeds into the Actual Hours figure shown in the Overview.",
      },
      {
        heading: "Adding a team member",
        body: "Click '+ Add Member'. Select a consultant from the dropdown (drawn from the Consultants list in Setup), assign a role, and save. The same consultant can appear on multiple projects simultaneously.",
      },
      {
        heading: "Logging hours",
        body: "Each team member row has a 'Log Hours' button. Enter the number of hours worked and an optional note. Hours are added cumulatively — you cannot subtract hours once logged, so enter them carefully.",
      },
      {
        heading: "Removing a team member",
        body: "A team member can be removed provided they have no hours logged against the project. If hours exist, the record is retained for audit purposes.",
      },
    ],
  },

  // ── Project Detail — Categories ──────────────────────────────────────────────
  projectCategories: {
    title: "Project — Categories",
    sections: [
      {
        heading: "What categories represent",
        body: "Categories and subcategories break the project down into its component workstreams (for example: Analysis, Design, Development, Testing). Each subcategory has a planned hours target and tracks hours actually used.",
      },
      {
        heading: "Planned Hours",
        body: "The sum of all subcategory planned hours becomes the project's Planned Hours total — the figure used in the Overview table and on the dashboard progress bar.",
      },
      {
        heading: "Applying a template",
        body: "If a template was chosen when the project was created, its categories and planned hours are pre-populated here. You can adjust individual subcategory targets at any time.",
      },
      {
        heading: "Adding categories manually",
        body: "Click '+ Add Category' to attach an additional category to this project. Only categories already defined in Setup → Categories are available for selection.",
      },
      {
        heading: "Logging hours by category",
        body: "Use the '+ Log Hours' button on each subcategory row to record work against that specific workstream. This gives more granular tracking than logging hours at the team-member level.",
      },
    ],
  },

  // ── Project Detail — Milestones ──────────────────────────────────────────────
  projectMilestones: {
    title: "Project — Milestones",
    sections: [
      {
        heading: "What milestones are for",
        body: "Milestones mark significant points in the project timeline — sign-offs, delivery dates, go-live events, or any checkpoint that matters to the customer or OEM partner.",
      },
      {
        heading: "Adding a milestone",
        body: "Click '+ Add Milestone'. Give it a name, a target date, and optionally a description. Milestones are shown in date order.",
      },
      {
        heading: "Marking complete",
        body: "Tick the checkbox next to a milestone to mark it complete. Completed milestones are shown with a strikethrough and moved to the bottom of the list.",
      },
      {
        heading: "Overdue milestones",
        body: "Any milestone whose target date has passed and is not yet marked complete is highlighted in amber. This is a prompt for review — it does not affect any hours calculations.",
      },
    ],
  },

  // ── Project Detail — Documents ───────────────────────────────────────────────
  projectDocuments: {
    title: "Project — Documents",
    sections: [
      {
        heading: "What this tab is for",
        body: "The Documents tab holds links and references to files related to this project — proposals, statements of work, delivery reports, or any other document the team needs quick access to.",
      },
      {
        heading: "Adding a document",
        body: "Click '+ Add Document'. Enter a display name and paste the URL or file path. Documents are stored as links — files are not uploaded into the application itself.",
      },
      {
        heading: "Opening a document",
        body: "Click the document name or the open icon to follow the link. Links open in a new browser tab.",
      },
      {
        heading: "Removing a document",
        body: "Click the delete icon on any document row to remove the link. This does not delete the underlying file — only the reference stored in the project.",
      },
    ],
  },

  // ── Setup — Consultants ──────────────────────────────────────────────────────
  setupConsultants: {
    title: "Setup — Consultants",
    sections: [
      {
        heading: "What this list is",
        body: "This is the master list of consultants who can be assigned to projects. Only people on this list can appear in the Team tab of any project.",
      },
      {
        heading: "Adding a consultant",
        body: "Click '+ Add Consultant'. Enter their name and any relevant details. They become immediately available for project assignment.",
      },
      {
        heading: "Editing or removing",
        body: "Consultants who are currently assigned to active projects can be edited but not deleted. Remove all project assignments first if you need to delete a consultant record.",
      },
      {
        heading: "Reordering",
        body: "Use the ▲/▼ buttons to adjust the display order. This order is used in dropdown lists throughout the application.",
      },
    ],
  },

  // ── Setup — Customers & OEM Partners ────────────────────────────────────────
  setupCustomersOem: {
    title: "Setup — Customers & OEM Partners",
    sections: [
      {
        heading: "Customers",
        body: "Customers are the end clients a project is delivered for. Every project must have a customer. The customer name is the primary identifier shown on the dashboard.",
      },
      {
        heading: "OEM Partners",
        body: "OEM partners are the organisations funding the project via a Purchase Order. PO Hours come from the OEM partner agreement. One OEM partner can be associated with multiple projects.",
      },
      {
        heading: "Adding and editing",
        body: "Use the '+ Add' button in each section. Existing names can be edited — changes will be reflected on all projects that reference that customer or OEM partner.",
      },
      {
        heading: "Deleting",
        body: "A customer or OEM partner cannot be deleted while they are referenced by any project. Reassign or close those projects first.",
      },
    ],
  },

  // ── Setup — Categories ───────────────────────────────────────────────────────
  setupCategories: {
    title: "Setup — Categories",
    sections: [
      {
        heading: "Categories and subcategories",
        body: "Categories are the top-level workstream groups (e.g. Analysis, Development). Each category contains one or more subcategories that represent more specific tasks within that group.",
      },
      {
        heading: "Adding a category",
        body: "Click '+ Add Category'. Give it a name. It will appear at the bottom of the list and can be reordered using the ▲/▼ buttons.",
      },
      {
        heading: "Adding subcategories",
        body: "Expand a category row and click '+ Add Subcategory'. Subcategories belong to one parent category and can be dragged to reorder or moved to a different category by dragging across groups.",
      },
      {
        heading: "Reordering",
        body: "Categories: use ▲/▼ buttons. Subcategories: drag and drop within or between category groups. The order set here determines the display order in projects and templates.",
      },
      {
        heading: "Deleting",
        body: "A category or subcategory referenced by any live project or template cannot be deleted. Remove the reference from those projects or templates first.",
      },
    ],
  },

  // ── Setup — Templates ────────────────────────────────────────────────────────
  setupTemplates: {
    title: "Setup — Templates",
    sections: [
      {
        heading: "What templates do",
        body: "Templates are pre-configured sets of categories and subcategories with default planned hours. Applying a template to a new project pre-populates its Categories tab, saving setup time for recurring project types.",
      },
      {
        heading: "Creating a template",
        body: "Click '+ Add Template'. Give it a name, then add categories and subcategories from the master list. Set a planned hours target for each subcategory.",
      },
      {
        heading: "Applying a template",
        body: "Templates are applied at project creation in the Add Project wizard. You can only apply a template at that point — there is no automated way to apply a template to an existing project, though you can add categories manually.",
      },
      {
        heading: "Editing a template",
        body: "Changes to a template do not retrospectively affect projects that have already used it. Each project stores its own copy of the category structure at the time of creation.",
      },
    ],
  },

  // ── Admin — User Management ──────────────────────────────────────────────────
  adminUsers: {
    title: "Admin — User Management",
    sections: [
      {
        heading: "Who can access this tab",
        body: "Only administrators can see the Admin menu and this tab. There is no self-registration — all accounts must be created here.",
      },
      {
        heading: "Creating a user",
        body: "Click '+ Add User'. Enter their email address, a temporary password, and assign a role (Administrator or User). Send them their credentials directly — the system does not send invitation emails.",
      },
      {
        heading: "Roles",
        body: "Users can view and edit project data. Administrators can do everything a User can, plus manage accounts, access the Admin menu, and perform data management operations.",
      },
      {
        heading: "Editing and deactivating",
        body: "Click the edit icon on any user row to change their name, role, or password. Accounts can be deactivated rather than deleted to preserve the audit trail.",
      },
      {
        heading: "Forgotten passwords",
        body: "If a user cannot log in, reset their password from this tab. There is no automated self-service password reset — users are directed to contact an administrator.",
      },
    ],
  },

  // ── Admin — Data Management ──────────────────────────────────────────────────
  adminData: {
    title: "Admin — Data Management",
    sections: [
      {
        heading: "Backups",
        body: "Up to three rolling backups are stored automatically. A backup is created before any reset, restore, or import operation. You can also create a manual backup at any time by clicking 'Create Backup'.",
      },
      {
        heading: "Restoring a backup",
        body: "Click 'Restore' on any backup entry. Your current data is backed up first, then the selected snapshot is restored. User accounts are never affected by a restore.",
      },
      {
        heading: "Export",
        body: "Downloads all current project and setup data as a dated JSON file. Use this to keep an off-system archive or to transfer data to another environment.",
      },
      {
        heading: "Import",
        body: "Re-uploads a previously exported JSON file. The system validates the file before importing. Your current data is backed up automatically before the import completes.",
      },
      {
        heading: "Reset to seed data",
        body: "Wipes all project and setup data and restores the original demo dataset. Use with caution — this cannot be undone except via a restore. User accounts are not affected.",
      },
    ],
  },
};