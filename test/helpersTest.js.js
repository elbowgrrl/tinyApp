const { assert } = require("chai");

const { getUserByemail, urlsForUser } = require("../helper_function");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "bf9c9e" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "bf9c9e" },
  g6NyFw: { longURL: "http://www.cbc.ca", userID: "31egii" },
};

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

describe("getUserByEmail", function () {
  it("should return a user with valid email", function () {
    assert.deepEqual(getUserByemail("user@example.com", users), {
      id: "bf9c9e",
      email: "user@example.com",
      hashedPassword:
        "$2b$10$HidsfNRDXYg1XLmtRfAuW.QR6OSjRRB.Ole263VbM8VVZwCY61FKe",
    });
  });

  it("should return a user with valid email", function () {
    assert.deepEqual(getUserByemail("a@a.com", users), {
      id: "31egii",
      email: "a@a.com",
      hashedPassword:
        "$2b$10$ZNx02XDsCMVIfL7HbsHV8umC3WjenVOz5I0.kK5rbMBZ4rOuY.gNa",
    });
  });

  it("should return null if an email is passed that is not in the database", () => {
    assert.deepEqual(getUserByemail("a@e.com", users), null);
  });

});

describe("urlsForUser", () => {
  it("should return a urls object for a user ID", () => {
    assert.deepEqual(urlsForUser("31egii", urlDatabase), {
      g6NyFw: { longURL: "http://www.cbc.ca", userID: "31egii" },
    });
  });

});
