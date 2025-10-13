import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { NAV } from "../navConfig";

export default function NavBar() {
  const [open, setOpen] = React.useState(false);
  const loc = useLocation();

  // Close menu & scroll to top on route change (safety if Layout hook ever changes)
  React.useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [loc.pathname]);

  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [open]);

  const mainLinks = NAV.main.filter((l) => l.enabled !== false);

  return (
    <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/5 bg-black/10 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E]" />
          <span className="text-lg tracking-tight font-semibold">
            NPS <span className="text-[#7C3AED]">Me</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
          {mainLinks.map((l) => (
            <NavItem key={l.to} to={l.to}>
              {l.label}
            </NavItem>
          ))}
          <a
            href={NAV.cta.href}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium bg-[#7C3AED] hover:bg-[#6D28D9] transition shadow-[0_0_0_0_rgba(124,58,237,0.5)] hover:shadow-[0_0_0_6px_rgba(124,58,237,0.15)]"
          >
            {NAV.cta.label}
          </a>
        </nav>

        {/* Mobile burger */}
        <button
          className="md:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-white/10"
          aria-label="Toggle menu"
          aria-expanded={open ? "true" : "false"}
          onClick={() => setOpen((s) => !s)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0B0F19]/95 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col gap-2">
            {mainLinks.map((l) => (
              <NavItem key={l.to} to={l.to} mobile>
                {l.label}
              </NavItem>
            ))}
            <a
              href={NAV.cta.href}
              className="mt-2 inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium bg-[#7C3AED] hover:bg-[#6D28D9] transition"
            >
              {NAV.cta.label}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function NavItem({ to, children, mobile = false }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "px-2 py-1 rounded-lg transition",
          mobile ? "text-base" : "text-sm",
          isActive ? "text-white" : "text-slate-300 hover:text-white",
        ].join(" ")
      }
      end={to === "/"}
    >
      {children}
    </NavLink>
  );
}
