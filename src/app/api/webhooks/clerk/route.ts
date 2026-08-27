import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

import { clerkUserService, profileFromWebhookUser } from "@/modules/user/services/clerk-user.service";

export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return new Response("Verification failed", { status: 400 });
  }

  try {
    if (evt.type === "user.created" || evt.type === "user.updated") {
      await clerkUserService.syncProfile(profileFromWebhookUser(evt.data));
    }

    if (evt.type === "user.deleted") {
      const id = evt.data.id;
      if (id) {
        await clerkUserService.deleteByClerkId(id);
      }
    }
  } catch (err) {
    console.error("Clerk webhook handler failed:", err);
    return new Response("Handler failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
