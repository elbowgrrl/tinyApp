const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bcrypt = require("bcrypt");
const morgan = require("morgan");
app.use(morgan("dev"));
app.set("view engine", "ejs");

app.use(
  express.urlencoded({
    extended: true,
  })
);

const cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "wumplepuff",
    keys: ["key1"],
  })
);


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

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = getUserByemail(email, users);
  const hash = userID.hashedPassword;

  if (!userID) {
    return res.status(403).send("Please enter valid login info");
  }

  if (userID) {
    const checkPassword = bcrypt.compareSync(password, hash);
    if (!checkPassword) {
      return res.status(403).send("Please enter valid login info");
    }
  }

  req.session.user_id = userID.id;
  res.redirect("/urls");
});

app.post("/urls/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = users[req.session.user_id];
  const longURL = urlDatabase[shortURL];
  const templateVars = {
    shortURL,
    longURL,
    userID,
  };
  //Only allow logged in users to create new urls
  if (!userID) {
    res.status(403).redirect("/login");
    return;
  }
  res.render("urls_new", templateVars);
});

app.post("/urls/new", (req, res) => {
  const shortURL = generateRandomString();
  const url = req.body.longURL;
  const userURL = {
    longURL: req.body.longURL,
    userID: users[req.session.user_id].id,
  };
  urlDatabase[shortURL] = userURL;
  res.redirect("/urls");
});

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
  const email = req.body.email;
  const password = req.body.password;
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
  req.session.user_id = user.id;
  console.log(users);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = users[req.session["user_id"]];
  const templateVars = { userID };
  res.render("login", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const url = req.body.longURL;
  const userURL = {
    longURL: req.body.longURL,
    userID: users[req.session.user_id].id,
  };
  urlDatabase[shortURL] = userURL;
  res.redirect("/urls"); 
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = users[req.session.user_id];
  const longURL = urlDatabase[shortURL].longURL;
  const isLoggedIn = users[req.session.user_id];
  if (!isLoggedIn) {
    res.redirect("/login");
    return;
  }

  urls = urlsForUser(users[req.session.user_id].id, urlDatabase);
  const templateVars = {
    shortURL,
    longURL,
    userID,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userID = users[req.session.user_id];
  const isLoggedIn = users[req.session.user_id];
  if (!isLoggedIn) {
    res.redirect("/login");
    return;
  }

  urls = urlsForUser(users[req.session.user_id].id, urlDatabase);

  const templateVars = {
    urls,
    userID,
  };
  res.render("index_urls", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
