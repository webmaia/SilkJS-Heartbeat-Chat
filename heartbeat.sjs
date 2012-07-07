/**
 * Maintain the shortpolling functions for the chat, other services can be added as well
 *
 */

session.start();

var userId = 0; /* set the session data to a variable so you can close it early if you want **/
if (session.data.userId) {
  userId = parseInt(session.data.userId, 10);
}

var Msgs = [];


/* @task Initiate the beats list of tasks
 *
 * @params void
 *
 * @returns creates Json containing the information the front end needs to display new data
 *
 */

function HeartbeatService_action() {

  var Methods = function() {
    this.results = {};
    this.results.Message

    this.sendMessage = function(params) {
      /**
       * @tasks Sends messages
       *
       * @param msg {string} | to {int} | alias {string}
       *
       * @return Json { status {string} };
       */

      var now = new Date(),
        error = false;

      SQL.startTransaction();
      try {

        SQL.update("INSERT INTO Messages (sendUser,toUser,message,datetime,sendAlias) VALUES (" + userId + "," + parseInt(params.to, 10) + "," + SQL.quote(params.msg) + "," + Math.round(now.getTime() / 1000) + "," + SQL.quote(params.alias) + ")");
        SQL.commit();
      } catch (e) {
        error = true;
        console.log('SQL Error: ' + e.query + '\n' + e.message);
        SQL.rollback();
        return {
          success: false
        };
      }
      if (!error) {
        return {
          success: true
        };
      }

    };

    this.getActive = function(params) {
      /** @tasks Determines which users are on for the requesting user to contact
       *
       * @param void
       *
       *  @returns Json { user list, count: total amount of users };
       *
       *  @TODO add more status for users and add the user count as well
       *
       *  4 function but could use more features, no plans to freeze
       */
      var users = SQL.getDataRows("SELECT * FROM userChatStatus WHERE status != 0 AND UserId != " + userId);

      // How many users can I speak too
      if (users.length > 0) {

        //Return data to get processed on the front end
        return users;
      } else {
        return {
          success: true
        };
      }
    };


    this.getMessages = function(params) {

      /** @tasks Determines if any new messages have been created for the user and notifies them of them or appends them to the chat
       *
       * @param params {object} contains the following information
       * which is used to change the users status
       *
       *  params.lastId {integer} the userId of the last message you recieved, this prevent duplicate messages and minmizes the size of the query,
       *
       * @returns Json { message info, count: total amount of messages };
       *
       * @status 5 functional - Todo neccessary
       */

      if (!session.data.lastMsgId >= 0) {
        session.data.lastMsgId = 0;
      }

      if (session.data.lastMsgId > params.lastId) {
        params.lastId = session.data.lastMsgId;
      }

      var messages = SQL.getDataRows("SELECT messageId,message,datetime,sendUser,toUser,sendAlias FROM Messages WHERE messageId > " + params.lastId + " AND toUser = " + userId);
      // this.results["Messages"] = SQL.getDataRows("SELECT messageId,message,datetime,sendUser,toUser,sendAlias FROM Messages WHERE messageId > " + params.lastId + " AND toUser = " + userId);
      // How many messages do we have
      if (messages.length > 0) {
        var len = messages.length;

        for (var i = 0; i < len; i++) {
          if (session.data.lastId < messages[i].messageId) {
            session.data.lastId = messages[i].messageId;
          }
        }
      }
      // this.results["Messages"] = messages;
      //Return data to get processed on the front end
      return messages;
    };


    this.changeStatus = function(params) {

      /**  @tasks Update the users status to make sure users only see people who are actively using the site
       *
       * @param params {object} contains the following information
       * which is used to change the users status
       *
       *  params.userStatus {integer} used to determine who is available to chat. 0 = offline, 1= online.
       *
       *  @TODO Add more status like away, idle etc
       *
       *  @returns Json { "success": true/false, ["message": "error message goes here"] }; and potentially an error message if needed
       *
       *  @status 6 almost frozen
       */

      // Used to determine if a SQL error has occured
      var error = false;
      //Get rid of the globals by assigning them to a local variable
      var user = userId;
      // Check to see what the users current status is to determine if an update or insert will take place
      var status = SQL.getDataRow("SELECT status FROM userChatStatus WHERE UserId = " + user);

      if (status.status) {
        var newStatus = params.userStatus;
        if (status.status != newStatus) {
          SQL.startTransaction();
          try {
            SQL.update("UPDATE userChatStatus SET status = " + newStatus + " WHERE UserId = " + user);
            SQL.commit();
          } catch (e) {
            error = true;
            console.log('SQL Error: ' + e.query + '\n' + e.message);
            SQL.rollback();
          }
          if (!error) {
            session.data.status = newStatus;
            return {
              status: newStatus,
              success: true
            };
          }
        }
      } else {
        var newStatus = params.userStatus;

        var userInfo = SQL.getDataRow("SELECT firstName,lastName,alias FROM Users WHERE userId = " + user);
        // The future username
        var username;

        if ((userInfo.alias).trim()) {
          username = userInfo.alias;
        } else {
          username = userInfo.firstName + " " + userInfo.lastName;
        }
        if (username) {
          SQL.startTransaction();
          try {
            SQL.update("INSERT INTO userChatStatus (alias,UserId,status) VALUES ('" + username + "'," + user + "," + newStatus + ")");
            SQL.commit();
          } catch (e) {
            error = true;
            console.log('SQL Error: ' + e.query + '\n' + e.message);
            SQL.rollback();
          }
          if (!error) {
            session.data.status = newStatus;
            return {
              status: newStatus,
              success: true
            };
          }
        }
      }
    };

  };

  var HeartbeatMethods = new Methods();
  var result = {};

  var data = Json.decode(req.data.data);

  /*
   var methods = data.methods;

   var params = data.params;

   var keys = data.keys;
   */

  var count = data.keys.length;

  for (var i = 0; i < count; i++) {

    if (HeartbeatMethods[data.methods[i]]) {
      result[data.keys[i]] = HeartbeatMethods[data.methods[i]](data.params[i]);
    }

  }
  res.write(Json.encode(result));

}

if (userId) {
  HeartbeatService_action();
}