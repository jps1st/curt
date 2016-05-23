/**
 * Created by jps123 on 5/13/16.
 */

var db_url = './db/admins.db'; //relative to the caller - server.js

var model = {
    slack_usr: '',
    subdomain: 'naem',
    user_agent: 'curtbot',
    email: '',
    password: ''
};

var db = require('./db')( db_url);

module.exports = {

    insert: function(adminObj, callBack){
        db.insert(adminObj, callBack);//TODO: refine
    },

    getAdmin : function(subDomain, callBack){
        db.findOne({subdomain: subDomain}, callBack);
    },

    model : model

}


