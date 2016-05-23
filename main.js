"use strict";

var channelStore = require('./lib/stores/channel');
var accountStore = require('./lib/stores/account');
var sessionStore = require('./lib/stores/session');

var mixins = require('./lib/mixins');
var moment = require("moment");

var adminCredentials = require('./config/harvest.json');
var harvest = require('./lib/harvest')(adminCredentials);

require('./lib/slackbot')(slackMessageHandler);

function slackMessageHandler(botmessage) {

    var slacker = botmessage.user.toLowerCase();
    slacker = '<@' + slacker + '>'; //all slack ids should be in this form
    var slackChannel = botmessage.channel;
    var team = botmessage.team;
    var ts = botmessage.ts;
    var txt = botmessage.text.toLowerCase().trim();

    return new Promise(function (resolve, reject) {

        if (txt === 'projects?') {
            harvest.listProjects(function (err, docs) {

                if (err) {
                    return resolve(err);
                }

                var summary = '';

                for (var x in docs) {
                    var proj = docs[x].project;
                    if (proj.active) {
                        summary += '[' + proj.id + '] ' + proj.name + '\n';
                    }

                }

                resolve(summary);

            });
        }
        else if (txt === 'projects_raw?') {
            harvest.listProjects(function (err, docs) {

                if (err) {
                    return resolve(err);
                }

                resolve(JSON.stringify(docs));

            });
        }
        else if (txt === 'current?') {
            processCurrentCmd(slackChannel)
                .then(function (output) {
                    resolve(output);
                })
                .catch(function (err) {
                    reject(err);
                });
        }
        else if (txt.startsWith('define project')) {
            var projectId = txt.replace('define project', '').trim();

            harvest.findProject(projectId)
                .then(function (doc) {
                    resolve(JSON.stringify(doc.project, null, 2));
                })
                .catch(function (err) {
                    reject('Project not found.');
                });
        }
        else if (txt.startsWith('use')) { //TODO: refine use command
            var projectId = txt.replace('use', '').trim();
            //TODO: verify if the projectId exists.

            harvest.findProject(projectId)
                .then(function (projObj) {
                    //bind the channel and thread
                    channelStore.bindThread(slackChannel, projectId)
                        .then(function (doc) {
                            resolve('Channel sucessfully bound to project [' + projectId + ']' + projObj.project.name + '.');
                        })
                        .catch(function (err) {
                            reject('An error occured while binding the channel to the project.\n' + JSON.stringify(err));
                        });

                })
                .catch(function (err) {
                    reject('Project not found.');
                });
        }
        else if (txt === 'people?') {

            harvest.listPeople()
                .then(function (data) {

                    var msg = 'People in your harvest:\n';
                    data.forEach(function (person) {
                        person = person.user;
                        if (person.is_active) {
                            msg += '[' + person.id + ']' + person.first_name + ' ' + person.last_name + '(' + person.email + ')\n';
                        }
                    });

                    resolve(msg);
                })
                .catch(function (err) {
                    reject('Could not retrieve people.')
                });
        }
        else if (txt.startsWith('register')) {
            var args = mixins.splitInWords(txt.replace('register', ''));

            if (args.length < 2) {
                return reject('Invalid arguments. Try: register @[slackusr] [harvestid]');
            }

            var slackId = args[0]; //this in the form of <@uslackbot>
            var harvestId = args[1];
            var name;
            harvest.getPerson(harvestId)  //see if person valid
                .then(function (doc) {
                    name = doc.user.first_name + ' ' + doc.user.last_name;
                    return accountStore.bindAccount(slackId, harvestId, name);
                })
                .then(function (doc) {
                    resolve(slackId + ' registered as [' + harvestId + ']' + name);
                })
                .catch(function (err) {
                    reject(err);
                });
        }
        else if (txt.startsWith('start session')) {
            var args = mixins.splitInWords(txt.replace('start session', ''));
            if (args.length < 1) {
                return reject('Invalid arguments. Try: start session [taskId]');
            }

            var taskId = args[0];
            var projectId;
            channelStore.getBoundSession(slackChannel)
                .then(function (doc) {

                    if (doc.length === 0) {
                        return reject('Channel not associated to a project.');
                    }

                    projectId = doc[0].harvestProject;
                    return sessionStore.startSession(slackChannel, projectId, taskId);
                })
                .then(function (doc) {
                    //resolve(JSON.stringify(doc));
                    resolve('Session started. Proj: ' + projectId + ' Task: ' + taskId + ' Channel: <@' + slackChannel + ">");
                })
                .catch(function (err) {
                    reject(err);
                });

        }
        else if (txt === 'session details?') {
            sessionStore.getBoundSession(slackChannel)
                .then(function (doc) {

                    if (doc.length === 0 || !doc[0].active) {
                        return reject('No session active on channel.');
                    }

                    var session = doc[0];
                    var msg = 'Project: ' + session.project + ' Task: ' + session.harvestRawTask + '\n';
                    var duration = mixins.getDiffMins(moment(session.started), moment());
                    msg += 'Started: ' + session.started + '\nDuration: ' + duration.toFixed(2) + 'm / ' + (duration / 60).toFixed(2) + 'h\n';

                    var now = moment();
                    if (session.attendance.length > 0) {
                        msg += 'Joined:\n';
                        session.attendance.forEach(function (attnd) {
                            msg += attnd.account.name
                                + ' - '
                                + mixins.getDiffMins(moment(attnd.joined), now).toFixed(2)
                                + 'm\n';
                        });
                    }

                    resolve(msg);

                })
                .catch(function (err) {
                    reject(err);
                });
        }
        else if (txt === 'here') {
            //see if person registered
            console.log('slacker: ' + slacker);
            var account;
            var duration;
            accountStore.getActiveAccount(slacker)
                .then(function (doc) {
                    console.log('account: ' + JSON.stringify(doc));
                    if (doc.length < 1 || !doc[0].active) {
                        return resolve('You are either unregistered or inactive. Please contact admin.');
                    }
                    account = doc[0];
                    return sessionStore.getBoundSession(slackChannel);
                })

                .then(function (doc) {

                    if (doc.length < 1) {
                        return reject('No active session started on thread.');
                    }

                    duration = mixins.getDiffHrs(moment(doc[0].started), moment());

                    return sessionStore.addAttendance(slackChannel, account);

                })

                .then(function () {
                    var msg = 'Welcome!';
                    if (duration < 0.1) {
                        msg = "Welcome. We\'ve just started."
                        return resolve(msg);
                    }
                    else if (duration > 0.25) {
                        msg = 'Welcome! Glad you could make it!';
                    } else if (duration > 0.5) {
                        msg = 'You\'re here! Welcome! I was starting to miss you!';
                    } else if (duration > 0.75) {
                        msg = 'Hello! I was just thinking about you. Glad you\'re here!';
                    }
                    msg += ' Session started ' + (duration * 60).toFixed(2) + 'mins ago.';
                    resolve(msg);
                })

                .catch(function (err) {
                    reject(err);
                });
        }
        else if (txt.startsWith('end session')) {

            var s = txt.indexOf('\"');
            var e = txt.lastIndexOf('\"')
            var note = txt.substr(s + 1, e - s - 1);
            if (!note) {
                return reject('Notes empty. Try: end session \"[notes]\"');
            }

            var durationHrs;
            sessionStore.getBoundSession(slackChannel)
                .then(function (doc) {


                    if (doc.length === 0 || !doc[0].active) {
                        return reject('No session active on channel.');
                    }

                    var session = doc[0];
                    var task = session.harvestRawTask;
                    var project = session.project;
                    durationHrs = mixins.getDiffHrs(moment(session.started), moment());
                    session.attendance.forEach(function (a) {

                        var empTime = mixins.getDiffHrs(moment(a.joined), moment());

                        harvest.insertTimeRecord(project, task, empTime, a.account.harvestAccountId, note,
                            function (err, doc) {
                                if (err) {
                                    console.log('Error pushing time record for emp: [' + a.account.harvestAccountId + '] ' + a.account.name);
                                }

                                console.log(JSON.stringify(doc));

                            });
                    });


                    return sessionStore.endSession(slackChannel);
                })
                .then(function (doc) {
                    resolve('Session ended and pushed to harvest. Duration: ' + durationHrs.toFixed(2) + 'h');
                });

        }
        else if (txt === 'help') {
            resolve('' +
                'The following commands are available:\n' +
                'projects?\n' +
                'use [projectid]\n' +
                'current?\n' +
                'start session [taskid]\n' +
                'here\n' +
                'end session \"[notes]\"\n' +
                'people?\n' +
                'register @[slacker] [harvestid]'
            )
        }
        else {
            resolve(null); //allow cleverbot to take over
        }

    });

}

function processCurrentCmd(slackChannel) {
    var project;
    var projectTasks;
    var taskMap = {};

    return channelStore.getBoundSession(slackChannel)
        .then(function (doc) {
            if (doc.length === 0) {
                return Promise.reject('Channel not associated to a project.');
            }

            var projectId = doc[0].harvestProject;
            return harvest.findProject(projectId);

        })
        .then(function (doc) {
            project = doc.project;
            return harvest.listTasks();
        })
        .then(function (doc) {
            doc.forEach(function (task) {
                var key = '_' + task.task.id;
                taskMap[key] = task.task;
            });

            return harvest.listProjectTasks(project.id);

        })
        .then(function (doc) {
            projectTasks = doc;

            var taskSummaryStr = '';
            projectTasks.forEach(function (ptaskraw) {
                var ptask = ptaskraw.task_assignment;
                var tasknm = taskMap['_' + ptask.task_id].name;
                taskSummaryStr += '[' + ptask.task_id + '] ' + tasknm + '\n';
            });

            var finalStr = 'Channel bound to ' +
                'project [' + project.id + '] ' + project.name + '\n' +
                'Tasks in project:\n' + taskSummaryStr;
            return Promise.resolve(finalStr);

        })
        .catch(function (err) {
            return Promise.reject(err);
        });
}


