const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({
  extended: true
}));

const morgan = require("morgan");
app.use(morgan("dev"));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const bcrypt = require("bcrypt");

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: 'bf9c9e' },
  i3BoGr: { longURL: "https://www.google.ca", userID: 'bf9c9e' },
  g6NyFw: { longURL: "http://www.cbc.ca", userID: '31egii'}
};

const users = {
  bf9c9e: {
    id: 'bf9c9e',
    email: 'user@example.com',
    hashedPassword: '$2b$10$HidsfNRDXYg1XLmtRfAuW.QR6OSjRRB.Ole263VbM8VVZwCY61FKe'
  },
  '31egii': {
    id: '31egii',
    email: 'a@a.com',
    hashedPassword: '$2b$10$ZNx02XDsCMVIfL7HbsHV8umC3WjenVOz5I0.kK5rbMBZ4rOuY.gNa'
  }

};


//Generate random string
const generateRandomString = function (length = 6) {
  return Math.random().toString(20).substr(2, length);
};

//Get user by email
const getUserByemail = function (email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

//Get urls for users
const urlsForUser = function(id) {
  let userURLs = {};
for (const key in urlDatabase) {
  urlInfo = urlDatabase[key];
  if (urlInfo.userID === id) {
    userURLs[key] = urlInfo;
  }
}
return userURLs;
};

app.post("/login", (req, res) => {
  // console.log("email", email);
  // console.log("password", password);
  const email = req.body.email;
  const password = req.body.password;

  console.log(users);

  userID = getUserByemail(email);

  if (!userID) {
    return res.status(403).send("Please enter valid login info");
  }

  if (userID) {
    const checkPassword = bcrypt.compareSync(password, userID.hashedPassword);
    if (!checkPassword) {
      return res.status(403).send("Please enter valid login info");
    }
  }

  res.cookie("user_id", userID.id);
  res.redirect("/urls");
});

app.post("/urls/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});


app.get("/urls/new", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = users[req.cookies["user_id"]];
  const longURL = urlDatabase[shortURL]
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
  // console.log("url", req.body.longURL);
  // console.log("id", users[req.cookies["user_id"]].id)
  
  const shortURL = generateRandomString();
  const url = req.body.longURL;
  const userURL = {longURL: req.body.longURL, userID: users[req.cookies["user_id"]].id}
  urlDatabase[shortURL] = userURL;
  res.redirect("/urls");
});


app.get("/register", (req, res) => {
  // const username = req.body.Username;
  const shortURL = req.params.shortURL;
  const userID = users[req.cookies["user_id"]];
  const longURL = urlDatabase[shortURL]
  const templateVars = {
    shortURL,
    longURL,
    userID,
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  // console.log("email", email);
  // console.log("password", password);
  // console.log("id", id);
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    res.status(400).send("Must enter an email and password");
    return;
  }

  if (getUserByemail(email)) {
    res.status(400).send("Please log in");
    return;
  }

  const user = { id, email, hashedPassword };
  users[id] = user;
  res.cookie("user_id", id);
  console.log(users);
  res.redirect("/urls");
});


app.get("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = users[req.cookies["user_id"]];
  const templateVars = { userID };
  res.render("login", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log(req.params.shortURL);
  const shortURL = req.params.shortURL;
  // console.log(urlDatabase);
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//Edits/ Updates an existing short URL//refactor variables
app.post("/urls/:shortURL", (req, res) => {
  // console.log("short", req.params.shortURL);
  // console.log("url", req.body.longURL);
  // console.log("id", users[req.cookies["user_id"]].id)
  // console.log("userURL", userURL);
  const shortURL = req.params.shortURL;
  const url = req.body.longURL;
  const userURL = {longURL: req.body.longURL, userID: users[req.cookies["user_id"]].id}
  urlDatabase[shortURL] = userURL;
  res.redirect("/urls"); // redirect to main
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = users[req.cookies["user_id"]];
  const longURL = urlDatabase[shortURL].longURL;
  // console.log("params", req.params);
  // console.log("body", req.body);
  // console.log("data", urlDatabase)
  const hasCookie = users[req.cookies["user_id"]]
  if (!hasCookie) {
    res.redirect("/login")
    return;
  }

  urls = urlsForUser(users[req.cookies["user_id"]].id)
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
  // console.log(req);
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userID = users[req.cookies["user_id"]];
  const hasCookie = users[req.cookies["user_id"]]
  if (!hasCookie) {
    res.redirect("/login")
    return;
  }

  urls = urlsForUser(users[req.cookies["user_id"]].id)
  
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