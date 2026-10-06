import dotenv from "dotenv";
dotenv.config();

import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import userModel from "../Model/user.model.js";

const getFrontendUrl = () =>
  (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

// Build the OAuth client lazily so process.env is always loaded,
// even though ESM imports are hoisted above dotenv.config() in app.js.
// This was the root cause of "Missing required parameter: client_id".
const getOAuthClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Google OAuth is misconfigured: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI must be set in Backend/.env"
    );
  }

  return new OAuth2Client(clientId, clientSecret, redirectUri);
};

export const googleLogin = (req, res) => {
  try {
    const client = getOAuthClient();
    const redirectUri = process.env.GOOGLE_REDIRECT_URI.trim();

    console.log("Google OAuth redirect_uri sent to Google:", redirectUri);

    const authUrl = client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["openid", "email", "profile"],
      redirect_uri: redirectUri,
    });

    return res.redirect(authUrl);
  } catch (error) {
    console.error("Google login init failed:", error.message);
    return res.status(500).json({
      message: "Google OAuth is not configured on the server",
    });
  }
};

export const googleCallback = async (req, res) => {
  const frontendUrl = getFrontendUrl();

  try {
    // User denied consent at Google
    if (req.query.error) {
      return res.redirect(
        `${frontendUrl}/signin?error=${encodeURIComponent(req.query.error)}`
      );
    }

    const { code } = req.query;

    if (!code) {
      return res.redirect(`${frontendUrl}/signin?error=missing_code`);
    }

    const client = getOAuthClient();

    const { tokens } = await client.getToken({
      code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI.trim(),
    });

    client.setCredentials(tokens);

    const response = await client.request({
      url: "https://openidconnect.googleapis.com/v1/userinfo",
    });

    const googleUser = response.data; // { sub, email, name, picture, ... }
    if (!googleUser?.email) {
      throw new Error("Google did not return an email address");
    }

    // Find-or-create local user so the rest of the app (JWT + /user/profile)
    // keeps working exactly like email/password signin.
    let user = await userModel.findOne({
      $or: [{ googleId: googleUser.sub }, { email: googleUser.email }],
    });

    if (!user) {
      user = await userModel.create({
        username: googleUser.name || googleUser.email.split("@")[0],
        email: googleUser.email,
        googleId: googleUser.sub,
        picture: googleUser.picture,
      });
    } else if (!user.googleId) {
      user.googleId = googleUser.sub;
      if (!user.picture && googleUser.picture) user.picture = googleUser.picture;
      await user.save();
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not set in Backend/.env");
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Hand back to the SPA via query param; frontend persists it to localStorage.
    return res.redirect(
      `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}`
    );
  } catch (error) {
    console.error("Google authentication failed:", error?.message || error);
    return res.redirect(`${frontendUrl}/signin?error=google_auth_failed`);
  }
};
