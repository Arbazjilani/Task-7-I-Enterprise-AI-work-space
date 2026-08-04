import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Breadcrumb() {
  const location = useLocation();

  const pathnames = location.pathname
    .split("/")
    .filter(Boolean);

  const breadcrumbNameMap = {
    dashboard: "Dashboard",
    employees: "Employees",
    settings: "Settings",
  };

  return (
    <div className="mb-6 text-sm text-slate-500">
      <Link
        to="/dashboard"
        className="hover:text-indigo-600"
      >
        Dashboard
      </Link>

      {pathnames.map((value, index) => {
        const to =
          "/" + pathnames.slice(0, index + 1).join("/");

        let name =
          breadcrumbNameMap[value] || value;

        // Employee Profile Route
        if (
          pathnames[index - 1] === "employees" &&
          !isNaN(value)
        ) {
          name = "Employee Details";
        }

        return (
          <span key={to}>
            {" > "}
            <Link
              to={to}
              className="hover:text-indigo-600"
            >
              {name}
            </Link>
          </span>
        );
      })}
    </div>
  );
}