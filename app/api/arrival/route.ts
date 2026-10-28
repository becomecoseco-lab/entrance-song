import { timingSafeEqual } from "node:crypto";

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Record an arrivals row and notify the private player. Playback,
  // the 30s cap, quiet hours, and cooldown are not implemented in this stub.
  return Response.json({ error: "Not Implemented" }, { status: 501 });
}

function authorized(request: Request): boolean {
  const expected = process.env.ARRIVAL_WEBHOOK_TOKEN;
  if (!expected) {
    return false;
  }

  const header = request.headers.get("authorization");
  const prefix = "bearer ";
  if (
    !header ||
    header.length <= prefix.length ||
    header.slice(0, prefix.length).toLowerCase() !== prefix
  ) {
    return false;
  }

  const provided = Buffer.from(header.slice(prefix.length));
  const secret = Buffer.from(expected);
  if (provided.length !== secret.length) {
    return false;
  }

  return timingSafeEqual(provided, secret);
}
