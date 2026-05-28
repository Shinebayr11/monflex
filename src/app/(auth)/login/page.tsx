"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";

export default function LoginPage() {
  const { login, loginAsGuest } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await login(email, password);
    router.push("/");
  };

  return (
    <>
      <div className="mb-8 flex flex-col items-center gap-2">
        <Film className="size-8 text-primary" />
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-white/50">Sign in to continue streaming.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-primary"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-primary"
        />
        <Button type="submit" disabled={busy} className="w-full glow-primary">
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-white/40">
        <div className="h-px flex-1 bg-white/10" /> or{" "}
        <div className="h-px flex-1 bg-white/10" />
      </div>
      <Button
        variant="secondary"
        className="w-full bg-white/10 border border-white/10"
        onClick={() => {
          loginAsGuest();
          router.push("/");
        }}
      >
        Continue as guest
      </Button>
      <p className="mt-6 text-center text-sm text-white/50">
        New here?{" "}
        <Link href="/signup" className="text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
