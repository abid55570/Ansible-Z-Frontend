"use client";

import { LogOut } from "lucide-react";

export default function UserMenu({ email, onLogout }: { email: string; onLogout: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-slate-400 sm:inline">{email}</span>
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand to-accent" aria-hidden />
      <button
        onClick={onLogout}
        aria-label="Log out"
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:text-white"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </div>
  );
}
