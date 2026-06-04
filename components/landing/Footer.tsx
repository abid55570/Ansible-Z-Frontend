import { Boxes } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-500 md:flex-row">
        <div className="flex items-center gap-2 text-slate-300">
          <Boxes className="h-4 w-4 text-brand" />
          Ansible-Z
        </div>
        <p>© {new Date().getFullYear()} Ansible-Z. Generate infrastructure, the right way.</p>
      </div>
    </footer>
  );
}
