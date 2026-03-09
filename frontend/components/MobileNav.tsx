"use client";

import { BarChart3, Gauge, Settings, TriangleAlert, Waypoints } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/log-analytics", label: "Logs", icon: BarChart3 },
  { href: "/error-insights", label: "Errors", icon: TriangleAlert },
  { href: "/ip-activity", label: "IPs", icon: Waypoints },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="glass fixed bottom-3 left-3 right-3 z-30 rounded-2xl p-2 md:hidden">
      <ul className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (pathname === "/" && item.href === "/dashboard");
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] ${
                  active ? "bg-accent/25 text-text" : "text-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}