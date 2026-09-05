"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, AlertCircle } from "lucide-react";

const SESSION_TYPES = [
  { value: "Senior Photos", label: "Senior Photos" },
  { value: "Family Photos", label: "Family Photos" },
  { value: "Nature Photos", label: "Nature Photos" },
  { value: "Custom Shots", label: "Custom Shots" },
  { value: "Something Else", label: "Something Else" },
];

type Status = "idle" | "sending" | "sent" | "error";

// Netlify Forms — no API key or third-party account needed. Netlify's
// build bot detects the `data-netlify="true"` form below directly in this
// page's static HTML output and handles submissions for free; the AJAX
// submit pattern here follows Netlify's documented approach
// (https://docs.netlify.com/manage/forms/setup/#submit-html-forms-with-ajax).
async function submitToNetlify(form: HTMLFormElement) {
  const formData = new FormData(form);
  const body = new URLSearchParams();
  formData.forEach((value, key) => body.append(key, value.toString()));

  const response = await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!response.ok) throw new Error("Form submission failed");
}

export function ContactForm() {
  const [sessionType, setSessionType] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    try {
      await submitToNetlify(event.currentTarget);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-10 text-center">
        <CheckCircle2 className="size-10 text-primary" aria-hidden="true" />
        <h3 className="font-heading text-lg font-semibold text-foreground">
          Thanks for reaching out!
        </h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          I respond personally to every inquiry — I&apos;ll get back to you
          soon to talk through the details.
        </p>
      </div>
    );
  }

  return (
    <form
      name="contact"
      method="POST"
      data-netlify="true"
      netlify-honeypot="botcheck"
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <input type="hidden" name="form-name" value="contact" />
      {/* Honeypot — bots fill this, real visitors never see it */}
      <input
        type="checkbox"
        name="botcheck"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" name="phone" type="tel" placeholder="(555) 555-5555" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="session-type">Session Type</Label>
          <Select
            value={sessionType}
            onValueChange={(value) => setSessionType(value)}
          >
            <SelectTrigger id="session-type" className="w-full">
              <SelectValue placeholder="Choose a type" />
            </SelectTrigger>
            <SelectContent>
              {SESSION_TYPES.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="subject" value={sessionType ?? ""} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        {/* Guidance sits here, not in a placeholder. Grey text inside the
            box reads as content that's already there, and it disappears
            the moment you start typing — so it's gone exactly when you
            need it. */}
        <p id="message-hint" className="text-sm text-muted-foreground">
          Roughly when, where, how many people — whatever you have so far.
        </p>
        <Textarea
          id="message"
          name="message"
          required
          rows={5}
          aria-describedby="message-hint"
        />
      </div>

      {status === "error" && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Something went wrong sending that — please try again, or email{" "}
            <a href="mailto:rpetersen2008@gmail.com" className="underline">
              rpetersen2008@gmail.com
            </a>{" "}
            directly.
          </span>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full shadow-lg shadow-primary/30 sm:w-auto"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
