"use client";

import { useState } from "react";

const NAME_MAX = 80;
const TITLE_MAX = 160;

export function RequestForm() {
  const [note, setNote] = useState<string | null>(null);

  return (
    <form
      className="mt-8 flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        // TODO: Upload the file with the anon browser client
        // (lib/supabase/browser.ts) to the private `songs` bucket, then insert
        // a requests row with status 'pending' and played_at null. Do not read
        // requests back — play history must stay off this page.
        setNote("Upload is not connected yet. Nothing was sent.");
      }}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="requester_name" className="text-sm font-medium">
          Your name
        </label>
        <input
          id="requester_name"
          name="requester_name"
          type="text"
          required
          maxLength={NAME_MAX}
          autoComplete="name"
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 outline-none focus:border-amber-700 dark:border-zinc-700 dark:focus:border-amber-200"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-sm font-medium">
          Song title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={TITLE_MAX}
          autoComplete="off"
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 outline-none focus:border-amber-700 dark:border-zinc-700 dark:focus:border-amber-200"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="audio" className="text-sm font-medium">
          Audio file
        </label>
        <input
          id="audio"
          name="audio"
          type="file"
          required
          accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,.mp3,.m4a,.wav"
          aria-describedby="audio-hint"
          className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-zinc-200 file:px-3 file:py-2 file:text-sm file:font-medium dark:file:bg-zinc-800"
        />
        <p id="audio-hint" className="text-sm text-zinc-600 dark:text-zinc-400">
          MP3, M4A, or WAV. 10 MB maximum. Held until a host approves it.
        </p>
      </div>
      <button
        type="submit"
        className="h-11 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        Submit request
      </button>
      {note ? (
        <p role="status" className="text-sm text-zinc-600 dark:text-zinc-400">
          {note}
        </p>
      ) : null}
    </form>
  );
}
