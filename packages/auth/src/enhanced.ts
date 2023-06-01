import { type GetServerSidePropsContext } from "next";
import { withPresets } from "@zenstackhq/runtime";

import { prisma } from "@acme/db";

import { getServerSession } from "./get-session";

/**
 * Get an authorization-enabled database client
 * @param ctx
 */
export async function getEnhancedPrisma(ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) {
  const session = await getServerSession(ctx);
  return withPresets(prisma, { user: session?.user });
}
