"use client";

import { useRef, useState } from "react";

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [unlocked, setUnlocked] = useState(false);

  // TODO: Subscribe to a private Supabase Realtime channel for arrival events
  // from the browser client (lib/supabase/browser.ts). The public request page
  // must not subscribe to requests or arrivals.
  // TODO: When an arrival arrives, play the newest approved, unplayed request
  // for at most 30 seconds, then mark it played through the server. Enforce
  // the 30s cap on this audio element (pause and reset at 30s) as well as on
  // the server so a long file cannot keep playing.

  function unlockAutoplay() {
    const audio = audioRef.current;
    if (audio) {
      // No source is loaded yet. The user gesture still unlocks autoplay.
      void audio.play().catch(() => undefined);
    }
    setUnlocked(true);
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium tracking-wide text-amber-800 dark:text-amber-200">
        Private player
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Door player</h1>
      <p className="mt-3 text-base leading-7 text-zinc-600 dark:text-zinc-400">
        Keep this tab open on the MacBook by the door. Press Start once so the
        browser allows playback.
      </p>
      <button
        type="button"
        onClick={unlockAutoplay}
        className="mt-8 h-11 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        disabled={unlocked}
      >
        Start
      </button>
      {unlocked ? (
        <p role="status" className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Autoplay unlocked. Waiting for the arrival hookup.
        </p>
      ) : null}
      <audio
        ref={audioRef}
        className="mt-6 w-full"
        controls
        preload="none"
        aria-label="Entrance song"
      />
    </main>
  );
}
