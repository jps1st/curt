/**
 * Created by jps123 on 5/13/16.
 */
var cleverbot = require("cleverbot.io");
var cbotkeys = require("../config/cleverbot.json");
cbot = new cleverbot(cbotkeys.API_USER, cbotkeys.API_KEY);

cbot.create(function(err, session){
    console.log('cleverbot session: ' + session)
});

var Botkit = require('botkit');
var botcnf = require('../config/slackbot.json');
var controller = Botkit.slackbot();
var bot = controller.spawn(botcnf);

bot.startRTM(function (err, bot, payload) {

    if (err) {
        console.log(JSON.stringify(err));
        throw new Error('Could not connect to Slack');
    }

});

controller.hears('(.*)', ['message', 'direct_message', 'direct_mention', 'mention'], function (robot, message) {

    process(robot, message);

});

function process(robot, botmessage) {

    if(!handler){
        return;
    }

    var reply_msg = botmessage.event === 'direct_mention' ? ('<@' + botmessage.user + '>: ') : '';

    handler(botmessage)
        .then(function (handlerMessage) {

            if (handlerMessage) {

                reply_msg += '```' + handlerMessage + '```';
                return robot.reply(botmessage, reply_msg);

            }

            cbot.ask(botmessage.text, function (err, response) {
                reply_msg += response.message;
                robot.reply(botmessage, reply_msg);
            });

        })

        .catch(function (errmsg) {
            reply_msg += '`' + errmsg + '`';
            robot.reply(botmessage, reply_msg);
        });

};

var handler = null;

module.exports = function (processHandler) {

    handler = processHandler;

}
