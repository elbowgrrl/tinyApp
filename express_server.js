//Dependacies
const express = require("express");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const morgan = require("morgan");

const PORT = 8080;

const app = express();

app.use(morgan("dev"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({ name: "wumplepuff", keys: ["key1"] }));

//Test URLs for test users
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "bf9c9e" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "bf9c9e" },
  g6NyFw: { longURL: "http://www.cbc.ca", userID: "31egii" },
};

// Test users
const users = {
  bf9c9e: {
    id: "bf9c9e",
    email: "user@example.com",
    hashedPassword:
      "$2b$10$HidsfNRDXYg1XLmtRfAuW.QR6OSjRRB.Ole263VbM8VVZwCY61FKe",
  },
  "31egii": {
    id: "31egii",
    email: "a@a.com",
    hashedPassword:
      "$2b$10$ZNx02XDsCMVIfL7HbsHV8umC3WjenVOz5I0.kK5rbMBZ4rOuY.gNa",
  },
};

//Helper functions
const generateRandomString = function (length = 6) {
  return Math.random().toString(20).substr(2, length);
};

const { getUserByemail, urlsForUser } = require("./helper_function");

//Endpoints

//Allows a registered user to log in. Also displays registration button in header.
app.get("/login", (req, res) => {
  const userID = users[req.session.user_id];
  const templateVars = { userID };
  res.render("login", templateVars);
});

//Checks user database for email of user//if exists checks password and logs in if correct
//throws relevant errors OR sets cookie and redirects to protected area
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const userID = getUserByemail(email, users);

  if (!userID) {
    return res.status(403).send("Please enter valid login info");
  }

  const checkPassword = bcrypt.compareSync(password, userID.hashedPassword);
  if (!checkPassword) {
    return res.status(403).send("Please enter valid login info");
  }
  //sets a new cookie to indicate that user is logged in
  req.session.user_id = userID.id;
  res.redirect("/urls");
});

//Allows logged in users to view the new short url page
app.get("/urls/new", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = users[req.session.user_id];
  const longURL = urlDatabase[shortURL];
  const templateVars = {
    shortURL,
    longURL,
    userID,
  };

  if (!userID) {
    return res.status(403).redirect("/login");
  }

  res.render("urls_new", templateVars);
});

//clears cookies and redirects
app.post("/urls/logout", (req, res) => {
  //clears cookies to log user out
  req.session = null;

  res.redirect("/login");
});

//allows a new user to register with an e-mail and password. SAves to in-memory database
app.get("/register", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = users[req.session.user_id];
  const longURL = urlDatabase[shortURL];
  const templateVars = {
    shortURL,
    longURL,
    userID,
  };

  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    res.status(400).send("Must enter an email and password");
    return;
  }

  if (getUserByemail(email, users)) {
    res.status(400).send("Please log in");
    return;
  }

  const user = { id, email, hashedPassword };
  users[id] = user;

  //sets a cookie to indicate user is logged in
  req.session.user_id = user.id;
  res.redirect("/urls");
});

//allows logged in users to delete saved short urls
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send("You must be logged in to view that page");
  }

  const shortURL = req.params.shortURL;

  //removes a short url from in-memory database
  delete urlDatabase[shortURL];

  res.redirect("/urls");
});

//allows logged in users to view and edit the short urls associated with their userID
app.get("/urls/:shortURL", (req, res) => {
  //checking if user has cookie and is therefore logged in
  if (!req.session.user_id) {
    return res.status(403).send("You must be logged in to view that page");
  }

  //checks to see if short url exists in in-memory database
  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]) {
    res.status(404).send("the page you have requested does not exist");
  }

  const userID = users[req.session.user_id];
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = {
    shortURL,
    longURL,
    userID,
  };

  //prevents users from viewing urls that do not belong to them
  if (urlDatabase[shortURL].userID !== req.session.user_id) {
    return res.status(404).send("Please log in to view this page");
  }

  res.render("urls_show", templateVars);
});

//Allows logged in users to create new short urls
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userURL = {
    longURL: req.body.longURL,
    userID: users[req.session.user_id].id,
  };
  //adds new short url to database
  urlDatabase[shortURL] = userURL;

  res.redirect("/urls");
});

//redirects from short url to long url
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;

  res.redirect(longURL);
});

//devs only
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Shows a logged in user the short urls associated with their userID
//redirects non logged in user to log in
app.get("/urls", (req, res) => {
  //checking if user has cookie and is therefore logged in
  if (!req.session.user_id) {
    return res.status(403).send("Please log in");
  }

  //retrieves urls for a given user
  const userID = users[req.session.user_id];
  const urls = urlsForUser(users[req.session.user_id].id, urlDatabase);
  const templateVars = {
    urls,
    userID,
  };

  res.render("index_urls", templateVars);
});

//Allows logged in users to create
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const userURL = {
    longURL: req.body.longURL,
    userID: users[req.session.user_id].id,
  };
  console.log("post urls line 236");
  //adds a new short url to in-memory database
  urlDatabase[shortURL] = userURL;

  res.redirect("/urls");
});

//sends a greeting to a user, either logged in or not
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//redirects a logged in user to urls
//redirects a non logged in user to log in
app.get("/", (req, res) => {
  //checking if user has cookie and is therefore logged in
  if (!req.session.user_id) {
    return res.redirect("/login");
  }

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
