const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Generate random string
const generateRandomString = function (length = 6) {
  return Math.random().toString(20).substr(2, length);
};

app.post("/urls/login", (req, res) => {
  const username = req.body.Username;
  // console.log("username", username)
  const userCookie = req.cookies;
  res.cookie("username", username)
  console.log("login")
  // console.log("userCookie", userCookie);
res.redirect("/urls")
});

app.post("/urls/logout", (req, res) => {
res.clearCookie("username");
console.log("logout")
res.redirect("/urls")
});

app.get("/urls/new", (req, res) => {
  console.log("get urls/new")
  res.render("urls_new");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log(req.params.shortURL);
  const shortURL = req.params.shortURL;
  // console.log(urlDatabase);
  delete urlDatabase[shortURL];
  console.log("post short delete")
  res.redirect("/urls") 
});

//Edits/ Updates an existing short URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const url = req.body.longURL;
  urlDatabase[shortURL] = url;
  console.log("post, update")
res.redirect("/urls") // redirect to main
});

app.get("/urls/:shortURL", (req, res) => {
  // console.log("params", req.params);
  // console.log("body", req.body);
  // console.log("data", urlDatabase)
  let shortURL = req.params.shortURL;
  console.log("get shortUrls")
  const templateVars = { shortURL, longURL: urlDatabase[shortURL], username: req.cookies["username"] };
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
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
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