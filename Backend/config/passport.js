import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:
                "http://localhost:3000/auth/google/callback",
        },

        (accessToken, refreshToken, profile, done) => {

            console.log("Google Profile:");
            console.log(profile);

            const user = {
                id: profile.id,
                name: profile.displayName,
                email: profile.emails?.[0]?.value,
                picture: profile.photos?.[0]?.value,
            };

            done(null, user);
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

export default passport;