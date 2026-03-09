"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Gauge, PanelLeftClose, PanelLeftOpen, Settings, TriangleAlert, Waypoints } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/log-analytics", label: "Log Analytics", icon: BarChart3 },
  { href: "/error-insights", label: "Error Insights", icon: TriangleAlert },
  { href: "/ip-activity", label: "IP Activity", icon: Waypoints },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 84 : 256 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className="glass sticky top-3 hidden h-[calc(100vh-1.5rem)] flex-col rounded-2xl p-3 md:flex"
    >
      <div className="mb-4 flex items-center justify-between">
        <AnimatePresence>
          {!collapsed ? (
            <motion.p
              key="logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm font-semibold tracking-wide text-muted"
            >
              LOG OPS
            </motion.p>
          ) : null}
        </AnimatePresence>
        <button
          className="rounded-lg border border-white/15 p-2 text-muted hover:text-text"
          onClick={() => setCollapsed((value) => !value)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (pathname === "/" && item.href === "/dashboard");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                active
                  ? "bg-gradient-to-r from-accent/30 to-accent2/30 text-text"
                  : "text-muted hover:bg-white/5 hover:text-text"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}