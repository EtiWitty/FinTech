const express = require("express");
const plaid = require("plaid");
const router = express.Router();
const passport = require("passport");
const moment = require("moment");
const mongoose = require("mongoose");
// Load Account and User models
const Account = require("../../models/Account");
const User = require("../../models/User");

const secrets = require("./secrets");
const PLAID_CLIENT_ID = secrets.PLAID_CLIENT_ID;
const PLAID_SECRET = secrets.PLAID_SECRET;
const PLAID_PUBLIC_KEY = secrets.PLAID_PUBLIC_KEY;

const client = new plaid.Client(
	PLAID_CLIENT_ID,
	PLAID_SECRET,
	PLAID_PUBLIC_KEY,
	plaid.environments.sandbox,
	{ version:"2019-05-29" }
);

var PUBLIC_TOKEN = null;
var ACCESS_TOKEN = null;
var ITEM_ID = null;

module.exports = router;