import type { Metadata } from "next";
import { Player } from "./player";

export const metadata: Metadata = {
  title: "Player",
  robots: { index: false, follow: false },
};

export default function PlayerPage() {
  return <Player />;
}
