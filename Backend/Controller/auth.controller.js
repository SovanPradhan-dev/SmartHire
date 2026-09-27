// Controller/auth.controller.js

import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);


// ==========================================
// 1. Start Google OAuth
// ==========================================
0
export const googleLogin = (req, res) => {
    try {
        const authUrl = client.generateAuthUrl({
            access_type: "offline",

            scope: [
                "openid",
                "email",
                "profile"
            ],

            prompt: "consent"
        });

        res.redirect(authUrl);

    } catch (error) {
        console.error("Google login error:", error);

        res.status(500).json({
            message: "Unable to start Google authentication"
        });
    }
};


// ==========================================
// 2. Google OAuth Callback
// ==========================================

export const googleCallback = async (req, res) => {
    try {

        const { code } = req.query;

        // Make sure Google returned a code
        if (!code) {
            return res.status(400).json({
                message: "Authorization code not received"
            });
        }


        // ======================================
        // Exchange authorization code for tokens
        // ======================================

        const { tokens } = await client.getToken(code);

        client.setCredentials(tokens);


        console.log("Google tokens received");


        // ======================================
        // Get Google user information
        // ======================================

        const response = await client.request({
            url: "https://openidconnect.googleapis.com/v1/userinfo"
        });


        const googleUser = response.data;


        console.log("Google User:");
        console.log(googleUser);


        // ======================================
        // Extract required information
        // ======================================

        const user = {
            id: googleUser.sub,
            name: googleUser.name,
            email: googleUser.email,
            picture: googleUser.picture
        };


        // ======================================
        // Send user information
        // ======================================

        res.json({
            message: "Google authentication successful",
            user
        });


    } catch (error) {

        console.error(
            "Google authentication error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            message: "Google authentication failed"
        });
    }
};