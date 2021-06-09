const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const morgan = require("morgan");
app.use(morgan('dev'))

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}


//Generate random string
const generateRandomString = function (length = 6) {
  return Math.random().toString(20).substr(2, length);
};

//Get user by email

const getUserByemail = function(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

app.post("/urls/login", (req, res) => {
  const username = req.body.Username;
  // console.log("username", username)
  const userCookie = req.cookies;
  res.cookie("username", username)
  console.log(users);
  // console.log("userCookie", userCookie);
res.redirect("/urls")
});

app.post("/urls/logout", (req, res) => {
res.clearCookie("username");
res.redirect("/urls")
});

app.get("/urls/new", (req, res) => {
  console.log("get urls/new")
  let shortURL = req.params.shortURL;
  const templateVars = { shortURL, longURL: urlDatabase[shortURL], username: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const username = req.body.Username;
  let shortURL = req.params.shortURL;
  const templateVars = { shortURL, longURL: urlDatabase[shortURL], username: users[req.cookies["user_id"]] };
  res.render("register", templateVars)
});

app.post("/register", (req, res) => {
const email = req.body.email;
const password = req.body.password;
const id = generateRandomString();
console.log("email", email);
console.log("password", password);
console.log("id", id);

if (!email || !password) {
  res.status(400).send("Must enter an email and password");
  return;
}

if (getUserByemail(email)) {
  res.status(400).send("Please log in");
  return;
}

const user = { id, email, password };
users[id] = user;
res.cookie("user_id", id)
console.log(users);
res.redirect("/urls")
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log(req.params.shortURL);
  const shortURL = req.params.shortURL;
  // console.log(urlDatabase);
  delete urlDatabase[shortURL];
  res.redirect("/urls") 
});

//Edits/ Updates an existing short URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const url = req.body.longURL;
  urlDatabase[shortURL] = url;
res.redirect("/urls") // redirect to main
});

app.get("/urls/:shortURL", (req, res) => {
  // console.log("params", req.params);
  // console.log("body", req.body);
  // console.log("data", urlDatabase)
  let shortURL = req.params.shortURL;
  const templateVars = { shortURL, longURL: urlDatabase[shortURL], username: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  // console.log(req);
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: users[req.cookies["user_id"]]};
  res.render("index_urls", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log(req.body);
  const shortURL = generateRandomString();
  // console.log("new short url", shortURL);
  urlDatabase [shortURL] = req.body.longURL;
  // console.log("urlDatabase", urlDatabase);
  res.redirect("/urls");
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