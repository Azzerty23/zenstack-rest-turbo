import type { NextFunction, Request, Response } from "express";

// Ask for credentials before showing docs
// https://stackoverflow.com/questions/64377434/ask-for-credentials-before-showing-my-swagger
const auth = (req: Request) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return undefined;
  }
  // remove "Basic " from the header
  const base64Credentials = authorizationHeader.slice(6);
  const credentials = atob(base64Credentials);
  const [username, password] = credentials.split(":");
  return { username, password };
};

export function basicAuth(req: Request, res: Response, next: NextFunction) {
  const user = auth(req);
  if (
    user === undefined ||
    user.username !== process.env.SWAGGER_USERNAME ||
    user.password !== process.env.SWAGGER_PASSWORD
  ) {
    res.statusCode = 401;
    res.setHeader("WWW-Authenticate", 'Basic realm="Node"');
    res.json({ detail: "Unauthorized" });
  } else {
    next();
  }
}
