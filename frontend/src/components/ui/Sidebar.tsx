"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Cpu, Server, RefreshCw, Menu, X } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navigation: NavItem[] = [
  {
    name: "MCP External Service",
    href: "/dashboard/mcp-external-service",
    icon: Server,
    /*   description: "MCP protocol with external APIs", */
  },
  {
    name: "MCP with Logic",
    href: "/dashboard/mcp-with-logic",
    icon: Cpu,
    /*   description: "MCP protocol with business logic", */
  },
  {
    name: "REST API",
    href: "/dashboard/rest-api",
    icon: RefreshCw,
    /* description: "Traditional REST API approach", */
  },
  {
    name: "Comparison",
    href: "/dashboard/comparision",
    icon: BarChart3,
    /*  description: "Compare different methods", */
  },
];

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-8 px-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-2 transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive
                      ? "text-blue-500"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                />
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Dashboard
                </h2>
              </div>
              <nav className="mt-8 flex-1 px-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-2 transition-colors ${
                        isActive
                          ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 flex-shrink-0 ${
                          isActive
                            ? "text-blue-500"
                            : "text-gray-400 group-hover:text-gray-500"
                        }`}
                      />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </>
  );
}
