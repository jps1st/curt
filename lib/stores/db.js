/**
 * Created by jps123 on 5/13/16.
 */
var Datastore = require('nedb');

module.exports = function(db_url){

    return new Datastore({ filename: db_url, inMemoryOnly: false, autoload: true});

}
