/**
 * Created by jps123 on 5/13/16.
 */
'use strict';

var cleverbot = require("cleverbot.io");
var cbotkeys = require("../config/cleverbot.json");

var Botkit = require('botkit');
var botcnf = require('../config/slackbot.json');

//slackbot config constants
var msgKeyword = '(.*)';
var msgTypes = [
    'message',
    'direct_message',
    'direct_mention',
    'mention'
];

module.exports = function (processHandler) {

    var handler = processHandler;

    //slackbot init
    var controller = Botkit.slackbot();
    var sbot = controller.spawn(botcnf);
    sbot.startRTM(function (err, bot, payload) {

        if (err) {
            console.log(JSON.stringify(err));
            throw new Error('Could not connect to Slack');
        }

    });
    controller.hears(msgKeyword, msgTypes,
        function (robot, message) {
            process(robot, message);
        }
    );

    //cleverbot init
    var cbot = new cleverbot(cbotkeys.API_USER, cbotkeys.API_KEY);
    cbot.create(function (err, session) {
        cbot.setNick(session);
        console.log('cleverbot session: ' + session)
    });

    //processes received messages from slack
    function process(robot, botmessage) {

        if (!handler) {
            return;
        }

        var reply_msg = botmessage.event === 'direct_mention'
            ? ('<@' + botmessage.user + '>: ')
            : '';

        handler(botmessage)
            .then(function (handlerMessage) {


                if (handlerMessage) {
                    reply_msg += '```' + handlerMessage + '```';
                    return robot.reply(botmessage, reply_msg);
                }

                cbot.ask(botmessage.text, function (err, response) {
                    reply_msg += response;
                    robot.reply(botmessage, reply_msg);
                });

            })

            .catch(function (errmsg) {
                reply_msg += '`' + errmsg + '`';
                robot.reply(botmessage, reply_msg);
            });

    };

}
