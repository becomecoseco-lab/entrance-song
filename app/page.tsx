import type { Metadata } from "next";
import { RequestForm } from "./request-form";

export const metadata: Metadata = {
  title: "Request a song",
  description:
    "Upload a short audio file. Approved songs can play at the door. This page does not show what played or when.",
};

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium tracking-wide text-amber-800 dark:text-amber-200">
        Entrance song
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Request a song</h1>
      <p className="mt-3 text-base leading-7 text-zinc-600 dark:text-zinc-400">
        Leave a short audio file and a title. A host approves it before it can
        play. This page never shows what played or when.
      </p>
      <RequestForm />
    </main>
  );
}
