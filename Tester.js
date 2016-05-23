/**
 * Created by jps123 on 5/23/16.
 */
var cleverbot = require("cleverbot.io");
var cbotkeys = require("./config/cleverbot.json");
cbot = new cleverbot(cbotkeys.API_USER, cbotkeys.API_KEY);

cbot.create(function(err, session){
   console.log('cleverbot session: ' + session)
});

cbot.ask("How are you?", function (err, response) {
   console.log(response);
});