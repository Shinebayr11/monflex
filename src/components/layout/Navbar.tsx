"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bookmark, Film, LogOut, Menu, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";
import { useAuth } from "@/providers/AuthProvider";
import { SearchModal } from "./SearchModal";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/watchlist", label: "My List" },
  { href: "/genre/28", label: "Action" },
  { href: "/genre/35", label: "Comedy" },
  { href: "/genre/27", label: "Horror" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useKeyboardShortcut({ key: "k", meta: true }, () => setSearchOpen(true));

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-black/70 backdrop-blur-xl border-b border-white/10"
            : "bg-gradient-to-b from-black/80 to-transparent",
        )}
      >
        <nav className="mx-auto flex h-16 max-w-[1600px] items-center gap-8 px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Film className="size-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">{SITE_NAME}</span>
          </Link>

          <ul className="hidden md:flex items-center gap-6 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-white",
                    pathname === item.href ? "text-white" : "text-white/60",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-white/70 hover:text-white"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-4" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline ml-2 rounded border border-white/15 bg-white/5 px-1.5 text-[10px]">
                ⌘K
              </kbd>
            </Button>

            <Link href="/watchlist" aria-label="Watchlist" className="hidden sm:block">
              <Button variant="ghost" size="icon">
                <Bookmark className="size-4" />
              </Button>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden md:inline text-sm text-white/80">{user.name}</span>
                <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout">
                  <LogOut className="size-4" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm" className="gap-2">
                  <User className="size-4" />
                  Sign in
                </Button>
              </Link>
            )}

            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="size-4" />
            </Button>
          </div>
        </nav>
      </header>

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
