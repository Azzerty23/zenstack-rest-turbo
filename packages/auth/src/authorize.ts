import { compare } from "bcryptjs";

import type { PrismaClient } from "@mct/db";

export function loginOrSignin(prisma: PrismaClient) {
  return async (
    credentials: Record<"email" | "password" | "name", string> | undefined,
  ) => {
    if (!credentials) throw new Error("Missing credentials");
    if (!credentials.email)
      throw new Error('"email" is required in credentials');
    if (!credentials.password)
      throw new Error('"password" is required in credentials');

    const maybeUser = await prisma.user.findFirst({
      where: { email: credentials.email },
      select: { id: true, email: true, password: true, name: true },
    });

    // if no user found, create a new user
    if (!maybeUser) {
      const newUser = await prisma.user.create({
        data: {
          name: credentials.name,
          email: credentials.email,
          password: credentials.password,
        },
        select: { id: true, email: true, name: true },
      });
      return { id: newUser.id, email: newUser.email, name: newUser.name };
    }

    // a user has been created but no password
    if (!maybeUser.password) {
      return null;
    }

    // verify the input password with stored hash
    const isValid = await compare(credentials.password, maybeUser.password);
    if (!isValid) return null;
    return {
      id: maybeUser.id,
      email: maybeUser.email,
      name: maybeUser.name || "",
    };
  };
}
