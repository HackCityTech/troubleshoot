const express = require("express");
const session = require("express-session");
const passport = require("passport");
const TwitterStrategy = require("passport-twitter").Strategy;
const cors = require("cors");

const app = express();

app.use(
  session({ secret: "234eaB6f9", resave: true, saveUninitialized: true })
);

app.use(
  cors({
    origin: "http://localhost:5174", // Replace with the actual origin of your frontend application
    credentials: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const TWITTER_CONSUMER_KEY = "wn6X31apWQ3TdF3VyoNS4L5xi";
const TWITTER_CONSUMER_SECRET =
  "g62HYGA1jVzqQkMQ53kRPGyDAYaFlCSghdqShFGL2DQh4ByFrU";

passport.use(
  new TwitterStrategy(
    {
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_CONSUMER_SECRET,
      callbackURL: "http://localhost:3001/auth/twitter/callback",
      userProfileURL:
        "https://api.twitter.com/2/account/verify_credentials.json", // Add this line
    },
    (token, tokenSecret, profile, done) => {
      try {
        if (profile) {
          return done(null, profile, token, tokenSecret);
        } else {
          console.error("Failed to fetch user profile.");
          return done(null, false, {
            message: "Failed to fetch user profile.",
          });
        }
      } catch (error) {
        console.error("Error in authentication callback:", error);
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.get("/auth/twitter", passport.authenticate("twitter"));

app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", {
    successRedirect: "http://localhost:5173",
    failureRedirect: "/",
    failureFlash: true,
    session: true,
  })
);

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.get("/protected", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ message: "User is authenticated!", user: req.user });
  } else {
    res.status(401).json({ message: "User is not authenticated!" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
