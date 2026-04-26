// ─────────────────────────────────────────────────────────────────────────────
// PASSPORT GOOGLE OAUTH - CURRENTLY DISABLED (GUEST MODE)
//
// When you're ready to enable auth:
//  1. Run:  npm install passport passport-google-oauth20 express-session
//           npm install -D @types/passport @types/passport-google-oauth20
//                          @types/express-session
//  2. Uncomment everything below.
//  3. In server.ts, add:
//       import session from "express-session";
//       import passport from "passport";
//       import "./config/passport";
//       app.use(session({ secret: process.env.SESSION_SECRET!, resave: false,
//                         saveUninitialized: false }));
//       app.use(passport.initialize());
//       app.use(passport.session());
//  4. In routes/auth.ts, uncomment the Google OAuth routes.
// ─────────────────────────────────────────────────────────────────────────────

/*
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/auth/google/callback",
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            fullName: profile.displayName,
            email: profile.emails?.[0].value ?? "",
            googleId: profile.id,
            profileImage: profile.photos?.[0].value,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

export default passport;
*/

export {};
