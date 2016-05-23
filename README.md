# Curt
A slackbot virtual assistant. Version: 0.0.1

###Setup

Create files `cleverbot.json`, `harvest.json` and `slackbot.json` under the `config` directory on the root folder.

Supply the following info accordingly:
    
    //harvest.json - Your harvest account
    {
       "subdomain":"",
       "email":"",
       "password":""
     }`

    //slackbot.json - see: https://api.slack.com/bot-users
    {
         "token": ""
    }
    
    //cleverbot.json - see: https://cleverbot.io/
    {
      "API_USER": "",
      "API_KEY":  ""
    }

Start the application by executing on commandline: `npm start`

###Basic commands

The following commands are available. They should be explicitly addressed to the bot:
###### projects?
    Lists projects in your harvest domain.
###### use [projectid]
    Binds the current thread to a project.
###### current?
    Retrieves info on the project bound to the current thread.
    Also lists down the projects tasks.
###### start session [taskid]
    Initiates a meeting on the current thread for the supplied task and records important details such as the timestamp.
###### session details?
    Retrieves info about the current active session
###### here
    Tell bot you joined the session for attendance records.
###### end session "[notes]"
    Ends the current meeting and pushes timetracking entries to harves for all those who attended.
###### people?
    Lists every active person in your harvest domain.
###### register @[slacker] [harvestid]
    Binds a harvest employee to the slack user


###Features:
- [x] List people in your harvest domain `people?`
- [x] Bind people and their slack accounts `register @[slacker] [harvestid]`
- [x] Show projects `projects?`
- [x] Bind a project to a thread `use [projectid]`
- [x] List tasks on the current project `current?`
- [x] Track open-time meetings. `session details?`
- [x] Track attendance. - `here`
- [ ] Track closed time meetings.
- [ ] Extend closed time meetings
- [x] Show meeting attendance. `session details?`
- [x] Inform members of the session's duration on join. `session details?`
- [ ] Inform members remaining duration of the meeting upon join. `session details?`
- [ ] If closed-time meeting, curtbot can inform everyone if the meeting's duration is almost consumed (default 10mins till end)
- [ ] Automatically terminate a meeting if thread's idle for x time.
- [x] Manually terminate session `end session [notes]`
- [x] After a session, push timetracking entries to harvest for those attended.


###Todo:
- automatic closing of session after a certain period of inactivity on the channel
- detecting unregistered slack users during `here` and `end session`
- check if you are starting a session for a task that exists under the project
- localize timestamps
- instant replies(e.g. “I’m on it” to acknowledge, “Give me a few” to indicate working status, “ok done” to confirm completion).
- React with thinking_face and remove before replying
- bot 'is typing' to indicate long process of commands
- `session details?` should contain attendance
- Permissions, control who can execute certain commands (reg, start session, use, current etc.)
- Automatically record attendance for user if he types a message
- Take down the notes for the session.
- Transfer the note param to start session.
- Provide better setup procedures.
- Allow multiple teams on a server
- Make statuses better


