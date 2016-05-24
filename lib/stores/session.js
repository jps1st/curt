/**
 * Created by jps123 on 5/13/16.
 */

"use strict";

var db_url = './db/sessions.db'; //relative to the caller - main.js
var moment = require("moment");
var mixins = require('../mixins');

var model = { //just helps us know things in database
    active: false,
    attendance: [{account: {}, joined: moment()}],
    started: new Date,
    harvestProjectTask: 'Project taskId. This is different from high level task',
    _id: 'slackThreadId',
    project: 'project id'
};

var db = require('./db')(db_url);

module.exports = {


    addAttendance: function (slackThread, account) {

        return new Promise(function (resolve, reject) {

            getBoundSession(slackThread)
                .then(function (doc) {

                    if (doc.length === 0 || !doc[0].active) {
                        return reject('No active session on thread. ' +
                            'Start using: start session [taskid]');
                    }

                    var session = doc[0];

                    //check if person already joined
                    for(var x = 0 ; x < session.attendance.length; x++){
                        var a = session.attendance[x];
                        if (a.account._id == account._id) {

                            return reject('You\'ve already joined the session '
                                + mixins.getDiffMins(moment(a.joined), moment()).toFixed(2)
                                + 'm ago');

                        }
                    }

                    session.attendance.push({
                        account: account,
                        joined: moment().format()
                    });

                    db.update({_id: session._id}, session, {upsert: true}, function (err, doc) {
                        if (err) {
                            return reject(err);
                        }
                        resolve(doc);
                    });

                });
        });
    },

    startSession: function (slackThread, projectId, harvestRawTask) { //should be the task id of the raw task reffered to by the project task

        return new Promise(function (resolve, reject) {
            var i = {
                _id: slackThread,
                project: projectId,
                harvestRawTask: harvestRawTask,
                started: moment().format(),
                attendance: [],
                active: true
            };
            db.update({_id: slackThread}, i, {upsert: true}, function (err, doc) {
                if (err) {
                    return reject(err);
                }
                resolve(doc);
            });

        });

    },
    
    endSession: function(slackThread){
        return new Promise(function (resolve, reject) {
            var i = {
                active: false
            };
            db.update({_id: slackThread}, i, {upsert: true}, function (err, doc) {
                if (err) {
                    return reject(err);
                }
                resolve(doc);
            });

        });
    },

    getBoundSession: getBoundSession,

    model: model

}

function getBoundSession(threadId) {

    return new Promise(function (resolve, reject) {
        db.find({_id: threadId}, function (err, doc) {
            if (err) {
                return reject(err);
            }

            resolve(doc);

        });
    });

}
