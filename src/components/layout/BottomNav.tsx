"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Users, ClipboardList, type LucideProps } from "lucide-react";
import type { FC } from "react";

const tabs: { href: string; label: string; icon: FC<LucideProps> }[] = [
  { href: "/", label: "Juegos", icon: Gamepad2 },
  { href: "/jugadores", label: "Jugadores", icon: Users },
  { href: "/historial", label: "Historial", icon: ClipboardList },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-heavy border-x-0 border-b-0" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);

          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-1 flex-col items-center gap-1 pt-3 pb-2.5 text-xs transition-colors ${
                isActive
                  ? "text-accent-400"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 h-0.5 w-6 rounded-full bg-accent-400" />
              )}
              <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
              <span className="font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
