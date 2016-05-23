/**
 * Created by jps123 on 5/13/16.
 */

module.exports = function (adminCredentials) {

    var harvest = new require('harvest')(adminCredentials);

    var TimeTracking = harvest.TimeTracking;
    var Projects = harvest.Projects;
    var People = harvest.People;

    //all tasks - not project specific
    var Tasks = harvest.Tasks;

    //project specific tasks
    var TaskAssignment = harvest.TaskAssignment;

    return {

        findProject: function (projectId) {
            return new Promise(function (resolve, reject) {
                Projects.get({id: projectId}, function (err, doc) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(doc);

                });
            });
        },

        listProjects: function (callBack) { //err, data
            Projects.list({}, callBack);
        },

        listProjectTasks: function (projectId) {
            return new Promise(function (resolve, reject) {
                TaskAssignment.listByProject({project_id: projectId}, function (err, doc) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(doc);
                });
            });
        },

        listTasks: function () { //err, data
            return new Promise(function (resolve, reject) {
                Tasks.list({}, function (err, doc) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(doc);
                });
            });
        },

        dailyTimeTrack: function (usrId, callBack) {
            TimeTracking.daily({'of_user': usrId}, callBack);
        },

        //http://help.getharvest.com/api/timesheets-api/timesheets/adding-updating-time/
        //taskid is the higher level task not the task associated with project
        insertTimeRecord: function (projId, taskId, hrs, usrId, notes, callBack) {

            var req = {
                "of_user": usrId,
                "notes": notes,
                "hours": hrs,
                "project_id": projId,
                "task_id": taskId,
            };

            TimeTracking.create(req, callBack);
        },

        listPeople: function () {
            return new Promise(function (resolve, reject) {

                People.list({}, function (err, doc) {

                    if (err) {
                        return reject(err);
                    }
                    resolve(doc);

                });

            });
        },

        getPerson: function (id) {
            return new Promise(function (resolve, reject) {

                People.get({id: id}, function (err, doc) {

                    if (err) {
                        if (err.status == "404") {
                            reject('Can\'t find person: ' + id + '. Are you sure this is the correct id?');
                        } else {
                            reject(err);
                        }
                        return;
                    }
                    resolve(doc);

                });

            });
        }

    };

}