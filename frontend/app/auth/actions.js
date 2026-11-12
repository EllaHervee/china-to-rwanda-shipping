"use server";

import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

export async function signIn(formData) {
  const email = clean(formData.get("email"));
  const password = String(formData.get("password") || "");
  if (!email || !password) redirect("/login?error=missing");

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect("/login?error=setup");
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=credentials");
  redirect("/account");
}

export async function signUp(formData) {
  const name = clean(formData.get("name"));
  const email = clean(formData.get("email"));
  const phone = clean(formData.get("phone"));
  const password = String(formData.get("password") || "");
  if (!name || !email || password.length < 8 || (phone && !/^\+[1-9]\d{7,14}$/.test(phone))) redirect("/signup?error=invalid");

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect("/signup?error=setup");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name, ...(phone ? { contact_phone: phone } : {}) },
      emailRedirectTo: `${siteUrl}/auth/confirm`,
    },
  });
  if (error) redirect("/signup?error=signup");
  redirect("/login?message=check-email");
}

export async function signInWithGoogle(formData) {
  const destination = formData.get("destination") === "signup" ? "/signup" : "/login";
  let supabase;
  try { supabase = await createClient(); } catch {
    redirect(`${destination}?error=setup`);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${siteUrl}/auth/confirm` },
  });
  if (error || !data?.url) redirect(`${destination}?error=google`);
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?message=signed-out");
}

export async function requestPasswordReset(formData) {
  const email = clean(formData.get("email"));
  if (!email) redirect("/forgot-password?error=missing");
  let supabase;
  try { supabase = await createClient(); } catch { redirect("/forgot-password?error=setup"); }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm?next=%2Fupdate-password`,
  });
  redirect("/forgot-password?message=sent");
}

export async function updatePassword(formData) {
  const password = String(formData.get("password") || "");
  if (password.length < 8) redirect("/update-password?error=weak");
  let supabase;
  try { supabase = await createClient(); } catch { redirect("/login?error=setup"); }
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect("/update-password?error=update");
  redirect("/account?message=password-updated");
}
