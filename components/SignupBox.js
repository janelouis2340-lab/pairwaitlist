"use client";
import { useState } from "react";

export default function SignupBox() {
  const [form, setForm] = useState({ first: "", last: "", phone: "" });

  const submit = async (e) => {
    e.preventDefault();

    await fetch("/api/waitlist", {
      method: "POST",
      body: JSON.stringify(form),
    });
  };

  return (
    <form id="signup" onSubmit={submit} className="bg-black text-white p-6 rounded-2xl">
      
      <div className="flex gap-2 mb-3">
        <input placeholder="First name" className="w-full p-3 bg-white/10 rounded" />
        <input placeholder="Last name" className="w-full p-3 bg-white/10 rounded" />
      </div>

      <input placeholder="Phone number" className="w-full p-3 bg-white/10 rounded mb-3" />

      <button className="w-full bg-green-700 py-3 rounded font-bold">
        Join Waitlist
      </button>

      <p className="text-xs text-gray-400 text-center mt-3">
        No spam. Only early access perks.
      </p>
    </form>
  );
}