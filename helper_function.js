const urlDatabase = require("./express_server");

//Generate random string


//Get user by email
const getUserByemail = function (email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
      // return "User Object";
    }
  }
  return null;
  // return "No User";
};

//Get urls for users
const urlsForUser = function (id, urlDatabase) {
  let userURLs = {};
  for (const key in urlDatabase) {
    urlInfo = urlDatabase[key];
    if (urlInfo.userID === id) {
      userURLs[key] = urlInfo;
    }
  }
  return userURLs;
};


module.exports = {
  getUserByemail,
  urlsForUser,
};
