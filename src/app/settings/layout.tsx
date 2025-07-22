
"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/settings", label: "Settings" },
  { href: "/settings/credits", label: "Credits" },
  { href: "/settings/activity", label: "Activity" },
  { href: "/settings/presets", label: "Presets" },
  { href: "/settings/keys", label: "API Keys" },
  { href: "/settings/provisioning", label: "Provisioning Keys" },
  { href: "/settings/integrations", label: "Integrations (BYOK)" },
  { href: "/settings/privacy", label: "Privacy" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-1/5">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => (
               <Link 
                key={item.href} 
                href={item.href} 
                className={cn(
                  "px-3 py-2 rounded-md text-sm",
                  pathname === item.href
                    ? "font-semibold text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
