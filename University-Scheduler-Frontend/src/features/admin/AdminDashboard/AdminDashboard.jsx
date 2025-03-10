import React from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import { Outlet } from "react-router-dom";

const sidebarLinks = [{ id: 1, href: "/admin/dashboard", text: "Home" }];

function AdminDashboard() {
  return (
    <div>
      <div className="flex flex-grow overflow-hidden">
        <Sidebar links={sidebarLinks} />
        <div className="flex-grow p-6 bg-gray-100 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
