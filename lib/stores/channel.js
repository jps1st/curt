/**
 * Created by jps123 on 5/13/16.
 */
var db_url = './db/channels.db'; //relative to the caller - server.js

var model = {
    harvestProject: '',
    _id: '', //slack channel id
};

var db = require('./db')(db_url);

module.exports = {

    bindThread: function (channelId, projectId) {

        return new Promise(function (resolve, reject) {
            var i = {
                _id: channelId,
                harvestProject: projectId
            };
            db.update({_id: channelId}, i, { upsert: true }, function (err, doc) {
                if (err) {
                    return reject(err);
                }
                resolve(doc);
            });

        });

    },

    getBoundSession: function (threadId) {

        return new Promise(function (resolve, reject) {
            db.find({_id: threadId}, function (err, doc) {
                if (err) {
                    return reject(err);
                }

                resolve(doc);

            });
        });

    },

    model: model

}