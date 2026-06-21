import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar.jsx";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const userId = localStorage.getItem("nexus:user-id") || "";

  return (
    <div className="h-screen overflow-hidden bg-nexus-bg text-nexus-text">
      <Sidebar
        userId={userId}
        collapsed={collapsed}
        mobileOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        onToggleCollapse={() => setCollapsed((value) => !value)}
      />

      <main
        className={`h-screen overflow-hidden transition-all duration-300 ${
          collapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        <div className="border-b border-nexus-border bg-nexus-bg/95 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="focus-ring rounded-md border border-nexus-border bg-nexus-surface px-3 py-2 text-sm text-nexus-text"
          >
            Menu
          </button>
        </div>
        <Outlet context={{ collapsed }} />
      </main>
    </div>
  );
}
