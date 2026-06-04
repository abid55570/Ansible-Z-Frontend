"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Boxes } from "lucide-react";

declare global {
  interface Window {
    google?: any;
  }
}

const GIS_SRC = "https://accounts.google.com/gsi/client";

export default function LoginPage() {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    function init() {
      if (!window.google || !clientId) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          try {
            const res = await fetch(`${apiUrl}/auth/google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ id_token: response.credential }),
            });
            if (!res.ok) throw new Error("login failed");
            router.push("/dashboard");
          } catch {
            setError("Sign-in failed. Please try again.");
          }
        },
      });
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "filled_black",
          size: "large",
          shape: "pill",
          text: "continue_with",
          width: 280,
        });
      }
    }

    let script = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = GIS_SRC;
      script.async = true;
      script.defer = true;
      script.onload = init;
      document.body.appendChild(script);
    } else {
      init();
    }
  }, [router]);

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6">
      <div className="grid-bg absolute inset-0 -z-10" />
      <div className="panel w-full max-w-md p-8 text-center">
        <Link href="/" className="mx-auto mb-6 inline-flex items-center gap-2 font-semibold text-white">
          <Boxes className="h-6 w-6 text-brand" />
          Ansible-Z
        </Link>
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-400">Sign in to generate and manage your infrastructure projects.</p>

        <div className="mt-8 flex justify-center">
          <div ref={buttonRef} />
        </div>

        {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}

        <p className="mt-8 text-xs text-slate-500">
          We only use Google to sign you in. By continuing you agree to our terms.
        </p>
      </div>
    </main>
  );
}
