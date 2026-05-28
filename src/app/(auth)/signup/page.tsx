"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await signup(form.name, form.email, form.password);
    router.push("/");
  };

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Create your account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        {(["name", "email", "password"] as const).map((k) => (
          <input
            key={k}
            required
            type={k === "password" ? "password" : k === "email" ? "email" : "text"}
            placeholder={k[0].toUpperCase() + k.slice(1)}
            value={form[k]}
            onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-primary"
          />
        ))}
        <Button type="submit" disabled={busy} className="w-full glow-primary">
          {busy ? "Creating…" : "Sign up"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-white/50">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
