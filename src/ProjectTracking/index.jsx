import { useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import ProjectDetail from "./ProjectDetail";
import Setup from "./Setup";
import { loadPSAData, savePSAData, buildInitialState } from "./data";

const TEAL = "#1a7f8e";
const TEAL_DARK = "#145f6b";
const TEAL_LIGHT = "#e8f4f6";

export default function ProjectTracking() {
  const [state, setState] = useState(null);
  const [nav, setNav] = useState("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loaded, setLoaded] = useState(false);

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
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === updated.id ? updated : p)
    }));
  }

  if (!state) {
    return (
      <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:"#6c757d" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:32,marginBottom:12 }}>⏳</div>
          <div>Loading project data...</div>
        </div>
      </div>
    );
  }

  const selectedProject = selectedProjectId ? state.projects.find(p => p.id === selectedProjectId) : null;

  const subNav = [
    { id: "dashboard", label: "Dashboard", icon: "🗂" },
    { id: "setup",     label: "Setup",     icon: "⚙" },
  ];

  return (
    <div style={{ flex:1,display:"flex",overflow:"hidden" }}>
      {/* Sub-sidebar */}
      <div style={{ width:180,background:"#f8f9fa",borderRight:"1px solid #dee2e6",padding:"12px 0",flexShrink:0 }}>
        <div style={{fontSize:10,fontWeight:700,color:"#6c757d",textTransform:"uppercase",letterSpacing:0.5,padding:"0 14px 8px"}}>
          Project Tracking
        </div>
        {subNav.map(s => (
          <div key={s.id} onClick={() => { setNav(s.id); setSelectedProjectId(null); }}
            style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 14px",cursor:"pointer",fontSize:12,fontWeight:600,
              background: nav===s.id ? TEAL_LIGHT : "transparent",
              color: nav===s.id ? TEAL_DARK : "#495057",
              borderLeft: nav===s.id ? `3px solid ${TEAL}` : "3px solid transparent" }}>
            <span>{s.icon}</span>{s.label}
          </div>
        ))}

        {/* Quick project list */}
        {nav === "dashboard" && (
          <div style={{ marginTop:16,paddingTop:16,borderTop:"1px solid #dee2e6" }}>
            <div style={{fontSize:10,fontWeight:700,color:"#6c757d",textTransform:"uppercase",letterSpacing:0.5,padding:"0 14px 8px"}}>
              Active Projects
            </div>
            {state.projects.filter(p=>p.status==="active").map(p => (
              <div key={p.id}
                onClick={() => { setSelectedProjectId(p.id); setNav("dashboard"); }}
                style={{ padding:"8px 14px",cursor:"pointer",fontSize:11,fontWeight:600,
                  color: selectedProjectId===p.id ? TEAL_DARK : "#495057",
                  background: selectedProjectId===p.id ? TEAL_LIGHT : "transparent",
                  borderLeft: selectedProjectId===p.id ? `3px solid ${TEAL}` : "3px solid transparent",
                  whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}
                title={p.name}>
                {p.name.split("—")[0].trim()}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      {nav === "dashboard" && !selectedProject && (
        <Dashboard
          state={state}
          onSelectProject={id => setSelectedProjectId(id)}
        />
      )}
      {nav === "dashboard" && selectedProject && (
        <ProjectDetail
          project={selectedProject}
          state={state}
          onUpdate={updateProject}
          onBack={() => setSelectedProjectId(null)}
        />
      )}
      {nav === "setup" && (
        <Setup state={state} onUpdate={updateField} />
      )}
    </div>
  );
}
