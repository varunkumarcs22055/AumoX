"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  company: z.string().optional(),
  phone: z.string().optional(),
  service: z.string().min(1, "Please pick one"),
  budget: z.string().optional(),
  message: z.string().min(10, "Tell us a little more (10+ chars)"),
  hp: z.string().max(0).optional(), // honeypot
});

type FormData = z.infer<typeof schema>;

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const search = useSearchParams();
  const [status, setStatus] = useState<Status>("idle");
  const [serverMsg, setServerMsg] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Pre-fill from chatbot transcript
  useEffect(() => {
    const chat = search.get("chat");
    if (chat) {
      setValue("message", `--- From the AUMO.X assistant ---\n${decodeURIComponent(chat)}\n\n---\n\n`);
    }
  }, [search, setValue]);

  async function onSubmit(data: FormData) {
    setStatus("loading");
    setServerMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus("error");
        setServerMsg(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setServerMsg("Thanks — we'll be in touch within one working day.");
      reset();
    } catch {
      setStatus("error");
      setServerMsg("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Your name" error={errors.name?.message}>
          <input className="input" placeholder="Jane Doe" {...register("name")} />
        </Field>
        <Field label="Work email" error={errors.email?.message}>
          <input
            type="email"
            className="input"
            placeholder="jane@company.com"
            {...register("email")}
          />
        </Field>
        <Field label="Company">
          <input className="input" placeholder="Acme Corp" {...register("company")} />
        </Field>
        <Field label="Phone (optional)">
          <input className="input" placeholder="+1 555 0123" {...register("phone")} />
        </Field>
        <Field label="I'm interested in" error={errors.service?.message}>
          <select className="input" defaultValue="" {...register("service")}>
            <option value="" disabled>
              Choose a service…
            </option>
            <optgroup label="Engineering">
              <option>Web Application</option>
              <option>SaaS Dashboard</option>
              <option>Android Application</option>
              <option>Automation Services</option>
            </optgroup>
            <optgroup label="AI">
              <option>AI Agent</option>
              <option>Chatbot</option>
            </optgroup>
            <optgroup label="Design & Creative">
              <option>UI/UX Design</option>
              <option>3D Modelling</option>
              <option>Video Editing</option>
            </optgroup>
            <optgroup label="Growth & Strategy">
              <option>Social Media Management</option>
              <option>Business Consultancy</option>
            </optgroup>
            <optgroup label="Other">
              <option>Products — AUMO Nexus / Atlas / Pulse</option>
              <option>Partnership inquiry</option>
              <option>Something else</option>
            </optgroup>
          </select>
        </Field>
        <Field label="Indicative budget (optional)">
          <select className="input" defaultValue="" {...register("budget")}>
            <option value="">Select range</option>
            <option>Under $25K</option>
            <option>$25K – $100K</option>
            <option>$100K – $500K</option>
            <option>$500K – $2M</option>
            <option>$2M+</option>
            <option>Not sure yet</option>
          </select>
        </Field>
      </div>

      <Field label="Tell us about your project" error={errors.message?.message}>
        <textarea
          className="input min-h-[140px] resize-y"
          placeholder="What outcomes are you hoping to achieve?"
          {...register("message")}
        />
      </Field>

      {/* Honeypot — invisible to humans */}
      <input
        type="text"
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        className="absolute -left-[9999px]"
        {...register("hp")}
      />

      <div className="flex flex-wrap items-center gap-5 pt-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-gold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "loading" ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Sending…
            </>
          ) : (
            <>
              Send message <Send size={16} />
            </>
          )}
        </button>

        {status === "success" && (
          <div className="inline-flex items-center gap-2 text-sm text-green-400">
            <CheckCircle2 size={18} /> {serverMsg}
          </div>
        )}
        {status === "error" && (
          <div className="inline-flex items-center gap-2 text-sm text-red-400">
            <AlertCircle size={18} /> {serverMsg}
          </div>
        )}
      </div>
      <p className="text-xs text-ink-400 font-light">
        By submitting, you agree to be contacted about your inquiry. We respect
        your privacy.
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-2">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1.5 block text-xs text-red-400">{error}</span>
      )}
    </label>
  );
}
