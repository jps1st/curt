/**
 * Created by jps123 on 5/13/16.
 */
var db_url = './db/accounts.db'; //relative to the caller - server.js

var model = { //just helps us know things in database
    name: '',
    active: false,
    harvestAccountId: 'Person\'s Account ID in harvest',
    _id: 'Slack account id',
};

var db = require('./db')(db_url);

module.exports = {

    bindAccount: function (slackId, harvestId, name) {

        return new Promise(function (resolve, reject) {
            var i = {
                _id: slackId,
                harvestAccountId: harvestId,
                name: name,
                active: true
            };
            db.update({_id: slackId}, i, { upsert: true }, function (err, doc) {
                if (err) {
                    return reject(err);
                }
                resolve(doc);
            });

        });

    },

    getActiveAccount: function (slackId) {

        return new Promise(function (resolve, reject) {
            db.find({_id: slackId, active: true}, function (err, doc) {
                if (err) {
                    return reject(err);
                }

                resolve(doc);

            });
        });

    },

    getAllAccounts: function () {

        return new Promise(function (resolve, reject) {
            db.find({active: true}, function (err, doc) {
                if (err) {
                    return reject(err);
                }

                resolve(doc);

            });
        });

    },

    deactivateAccount: function (slackId) {

        return new Promise(function (resolve, reject) {
            var i = {
                _id: slackId,
                active: false
            };
            db.update({_id: slackId}, i, { upsert: false }, function (err, doc) {
                if (err) {
                    return reject(err);
                }
                resolve(doc);
            });
        });

    },

    model: model

}