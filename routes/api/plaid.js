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

// @route POST api/plaid/accounts/add
// @desc Trades public token for access token and stores credentials in database
// @access Private
router.post(
	"/accounts/add",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		PUBLIC_TOKEN = req.body.public_token;
  		const userId = req.user.id;
  		const institution = req.body.metadata.institution;
	  	const { name, institution_id } = institution;
  			if (PUBLIC_TOKEN) {
				client
				.exchangePublicToken(PUBLIC_TOKEN)
				.then(exchangeResponse => {
					ACCESS_TOKEN = exchangeResponse.access_token;
					ITEM_ID = exchangeResponse.item_id;

					// Check if account already exists for specific user
					Account.findOne({
						userId: req.user.id,
						institutionId: institution_id
					})
					.then(account => {
						if (account) {
							console.log("Account already exists");
						} else {
							const newAccount = new Account({
								userId: userId,
								accessToken: ACCESS_TOKEN,
								itemId: ITEM_ID,
								institutionId: institution_id,
								institutionName: name
						});
							newAccount.save().then(account => res.json(account));
						}
			  		})
			  		.catch(err => console.log(err)); // Mongo Error
		  		})
		.catch(err => console.log(err)); // Plaid Error
	  }
	}
  );

// @route DELETE api/plaid/accounts/:id
// @desc Delete account with given id

router.delete(
	"/accounts/:id",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
	  Account.findById(req.params.id).then(account => {
		// Delete account
		account.remove().then(() => res.json({ success: true }));
	  });
})
	

module.exports = router;