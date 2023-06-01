import { withPresets } from "@zenstackhq/runtime";
import RestApiHandler from "@zenstackhq/server/api/rest";
import { ZenStackMiddleware } from "@zenstackhq/server/express";
import { compareSync } from "bcryptjs";
import cors from "cors";
import express, { type Request, type Response } from "express";
import jwt from "jsonwebtoken";

import { prisma } from "@acme/db";

import { env } from "./env";

function getUser(req: Request) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return undefined;
  }
  try {
    const decoded: any = jwt.verify(token, env.NEXTAUTH_SECRET);
    return { id: decoded.sub };
  } catch {
    // bad token
    return undefined;
  }
}

// init express
const app: express.Application = express();

// allow CORS
app.use(cors());

// enable JSON body parser
app.use(express.json());

/**
 * Login input
 * @typedef {object} LoginInput
 * @property {string} email.required - The email
 * @property {string} password.required - The password
 */

/**
 * Login response
 * @typedef {object} LoginResponse
 * @property {string} id.required - The user id
 * @property {string} email.required - The user email
 * @property {string} token.required - The access token
 */

/**
 * POST /api/login
 * @tags user
 * @tags auth
 * @param {LoginInput} request.body.required - input
 * @return {LoginResponse} 200 - login response
 */
app.post("/api/login", async (req: Request, res: Response) => {
  const { email, password = "" } = req.body;
  const user = await prisma.user.findFirst({
    where: { email },
  });
  if (!user || !user.password || !compareSync(password, user.password)) {
    res.status(401).json({ error: "Invalid credentials" });
  } else {
    // sign a JWT token and return it in the response
    const token = jwt.sign(
      { sub: user.id },
      process.env.NEXTAUTH_SECRET as string,
    );
    res.json({ id: user.id, email: user.email, token });
  }
});

// Add ZenStack middleware
app.use(
  "/api",
  ZenStackMiddleware({
    getPrisma: (req) => withPresets(prisma, { user: getUser(req) }),
    zodSchemas: false, // require("./generated/zod")
    handler: RestApiHandler({ endpoint: "http://127.0.0.1:8000/api" }),
  }),
);

// Start server
app.listen(8000, () =>
  console.log("🚀 Server ready at: http://127.0.0.1:8000"),
);

// export default app;
