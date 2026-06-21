import React, { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import MemoryPage from "./pages/MemoryPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import UsernameGate from "./components/UsernameGate.jsx";

const STORAGE_KEY = "nexus:user-id";

export default function App() {
  const [userId, setUserId] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [greeting, setGreeting] = useState("");

  function handleConfirm(username, isReturning) {
    localStorage.setItem(STORAGE_KEY, username);
    setUserId(username);
    setGreeting(
      isReturning
        ? `Welcome back, ${username}! I remember our previous conversations.`
        : `Hi ${username}! I'm Nexus AI. Tell me about yourself and I'll remember it for future conversations.`
    );
  }

  if (!userId) {
    return <UsernameGate onConfirm={handleConfirm} />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<ChatPage userId={userId} greeting={greeting} />} />
        <Route path="/memory" element={<MemoryPage userId={userId} />} />
        <Route path="/settings" element={<SettingsPage userId={userId} />} />
      </Route>
    </Routes>
  );
}
