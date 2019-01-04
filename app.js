const Express = require("express");
const Util = require("util");
const Path = require("path");
const expshb = require("express-handlebars");
const mongoose = require("mongoose");
const bodyPasrser = require("body-parser");
const fileUpload = require("express-fileupload");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const redirectToHTTPS = require("express-http-to-https").redirectToHTTPS;

// -- setup database connectivity
const databasrUrl = "mongodb://localhost:27017/cms";

mongoose.Promise = global.Promise;
mongoose
  .connect(
    databasrUrl,
    { useNewUrlParser: true }
  )
  .then(db => {
    Util.log("DB Connected");
  })
  .catch(err => {
    util.log(err);
  });

// -- Setting up Node Server for CMS App
const port = process.env.PORT || 9090;
const app = Express();

app.listen(port, () => {
  Util.log(`Server started on ${port} and listening...`);
});

// -- For using public folder
app.use(Express.static(Path.join(__dirname, "public")));

// -- For using request body
app.use(bodyPasrser.json());
app.use(bodyPasrser.urlencoded({ extended: true }));

// -- Integrate passport and session
app.use(passport.initialize());
app.use(passport.session());

// -- For handlebars engine to work
const {
  select,
  startsWith,
  getDateInFormat,
  isEqual
} = require("./helpers/handlebars-helpers");

app.engine(
  "handlebars",
  expshb({
    defaultLayout: "home",
    helpers: {
      select: select,
      startsWith: startsWith,
      getDateInFormat: getDateInFormat,
      isEqual: isEqual
    }
  })
);
app.set("view engine", "handlebars");

// Don't redirect if the hostname is `localhost:port` or the route is `/insecure`
const isSecureString = process.argv.slice(2).toString();
if (isSecureString != "nonsecure") {
  app.use(redirectToHTTPS([/localhost:(\d{4})/], [/\/insecure/], 301));
}

// -- Upload middleware
app.use(fileUpload());

// -- load session
app.use(
  session({
    secret: "RahulDange19989",
    resave: true,
    saveUninitialized: true
  })
);

// -- Load routes
const home = require("./routes/home");
const admin = require("./routes/admin");
const posts = require("./routes/admin/posts");
const categories = require("./routes/admin/categories");
const comments = require("./routes/admin/comments");

// -- Use routes using express middleware
app.use("/", home);
app.use("/admin", admin);
app.use("/admin/posts", posts);
app.use("/admin/categories", categories);
app.use("/admin/comments", comments);
