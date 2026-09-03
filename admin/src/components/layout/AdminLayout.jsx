import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#090d16] text-[#f1f5f9]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/65 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex-1 md:ml-64 min-h-screen flex flex-col min-w-0">
        <Header onHamburger={() => setSidebarOpen((o) => !o)} />
        <main className="flex-1 p-5 md:p-8 max-w-[1600px] mx-auto w-full animate-fade overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
