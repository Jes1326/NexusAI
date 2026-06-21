import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import { clearHistory } from "../../services/nexusApi";

const navItems = [
  { label: "Chat", path: "/chat", marker: "C" },
  { label: "Memory", path: "/memory", marker: "M" },
  { label: "Settings", path: "/settings", marker: "S" },
];

export default function Sidebar({ userId = "", collapsed, mobileOpen, onCloseMobile, onToggleCollapse }) {
  const navigate = useNavigate();
  const [recentChats, setRecentChats] = useState([]);

  async function startNewChat() {
    try { await clearHistory(userId); } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent("nexus:new-chat"));
    navigate("/chat");
    onCloseMobile();
  }

  function switchUser() {
    localStorage.removeItem("nexus:user-id");
    window.location.reload();
  }

  const sidebar = (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-nexus-border bg-nexus-panel transition-all duration-300",
        collapsed ? "w-20" : "w-72"
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-nexus-border px-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-nexus-accent text-sm font-semibold text-white">
          {userId ? userId[0].toUpperCase() : "N"}
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{userId || "Nexus AI"}</p>
            <button onClick={switchUser} className="text-xs text-nexus-muted hover:text-nexus-accent transition">
              Switch user
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <button
          type="button"
          onClick={startNewChat}
          className={cn(
            "focus-ring mb-5 flex w-full items-center justify-center gap-2 rounded-lg bg-nexus-accent px-3 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500",
            collapsed && "px-0"
          )}
        >
          <span className="text-lg leading-none">+</span>
          {!collapsed && <span>New Chat</span>}
        </button>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  "focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-nexus-muted transition hover:bg-nexus-surface hover:text-nexus-text",
                  isActive && "bg-nexus-surface text-nexus-text",
                  collapsed && "justify-center px-0"
                )
              }
            >
              <span className="grid h-6 w-6 place-items-center rounded-md border border-nexus-border text-xs">
                {item.marker}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

      </div>

      <div className="border-t border-nexus-border p-3">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="focus-ring hidden w-full rounded-lg border border-nexus-border bg-nexus-surface px-3 py-2 text-sm text-nexus-muted transition hover:text-nexus-text lg:block"
        >
          {collapsed ? "Open" : "Collapse"}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block">{sidebar}</div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={onCloseMobile}
            className="absolute inset-0 bg-black/60"
          />
          <div className="relative h-full w-72">{sidebar}</div>
        </div>
      )}
    </>
  );
}
