import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

export const googleLogin = (req, res) => {

    const authUrl = client.generateAuthUrl({
        access_type: "offline",

        scope: [
            "openid",
            "email",
            "profile"
        ],

        redirect_uri: process.env.GOOGLE_REDIRECT_URI
    });

    console.log(authUrl);

    res.redirect(authUrl);
};


export const googleCallback = async (req, res) => {

    try {

        const { code } = req.query;

        console.log("Authorization code:", code);

        if (!code) {
            return res.status(400).json({
                message: "Authorization code not received"
            });
        }

        const { tokens } = await client.getToken({
            code,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI
        });

        console.log("Tokens:", tokens);

        client.setCredentials(tokens);

        const response = await client.request({
            url: "https://openidconnect.googleapis.com/v1/userinfo"
        });

        console.log("Google user:", response.data);

        res.json({
            message: "Google authentication successful",
            user: response.data
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Google authentication failed"
        });
    }
};