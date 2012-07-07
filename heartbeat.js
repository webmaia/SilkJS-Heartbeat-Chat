/**
 * Created with IntelliJ IDEA.
 * User: Brian McCann
 * Date: 7/1/12
 * Time: 2:35 PM
 * To change this template use File | Settings | File Templates.
 */
var Chats = [];
var lastId = 0;
var currChatter = 0;
var currChatterId = 0;
var Users = [];


var HeartbeatMethods = function() {
  this.lastId = 0;

  //Function will be used for sending messages in the future
  this.returnSent = function(params) {

  };


  /*
   * @params messageId {int} | message {string} | datetime {int} | sendUser {int} | toUser {int} | sendAlias {string}
   *
   * @returns void
   *
   * @tasks creates tabs for new converstations as well as adds to old ones
   *
   * @TODO Allow for alerts of some sort when a user hasn't seen a message they recieved ideally
   * @TODO on the tab where the username is.
   *
   * @status 5 functional - Todo neccessary
   */
  this.processMessages = function(params) {

    var msgsLen = params.length;

    for (var i = 0; i < msgsLen; i++) {
      if (this.lastId === 0) {
        var id = parseInt(params[i].messageId, 10);
        console.log(id);
        this.lastId = id;
      }
      if (this.lastId < parseInt(params[i].messageId, 10)) {
        this.lastId = parseInt(params[i].messageId, 10);
      }

      heartbeat.methods.Msgs.params.lastId = this.lastId;

      if (!$("#chat" + params[i].sendUser).length > 0) {

        // If the initial chat tab exists replace it
        if ($("#chat").length > 0) {

          //Get the tabs set element and generate the content from the message and replace the old tab with the new one.
          var chatTab = $("#chatcontent");
          var chat = $("#chat");

          chat.attr("id", "");

          var content = '<div id="chat' + params[i].sendUser + '"><span style="margin: 0; padding: 0; border: 0;"><span style="color: #ff001b;">' + (params[i].sendAlias).replace(/'/g, "\'") + ': </span> ' + (params[i].message).replace(/'/g, "\'") + '</span><br /></div>';

          chatTab.jqxTabs('setTitleAt', 0, params[i].sendAlias);
          chatTab.jqxTabs('setContentAt', 0, content);

          $("#chat").attr("id", "chat" + params[i].sendUser);

        } else {

          //Get the tabs set element and generate the content from the message and replace the old tab with the new one.
          var chatTabs = $("#chatcontent");

          var title = (params[i].sendAlias).replace(/'/g, "\'");

          var content = '<div id="chat' + params[i].sendUser + '"><span style="margin: 0; padding: 0; border: 0;"><span style="color: #ff0007;">' + (params[i].sendAlias).replace(/'/g, "\'") + ': </span> ' + (params[i].message).replace(/'/g, "\'") + '</span><br /></div>';


          chatTabs.jqxTabs('addAt', chatTabs.jqxTabs("length"), title, content);
          // $("div.jqx-tabs-content").last().attr("id", "chat" + params[i].sendUser);
        }
      } else {

        var chatTab = $("#chat" + params[i].sendUser);

        var contentHtml = '<span style="color: #ff0007;">' + (params[i].sendAlias).replace(/'/g, "\'") + ': </span> ' + (params[i].message).replace(/'/g, "\'") + '</span><br />';

        chatTab.append(contentHtml);

        //Scroll to the bottom of the content
        var chatMain = $("#chatcontent");
        chatMain.scrollTop(chatMain.get(0).scrollHeight);

      }
    }
  };


  /* @param params | UserId {int} | sendAlias {string} | [status {int}]
   *
   * @returns void
   *
   * @tasks Create the dropdown containing all the users who are available to the current users
   *
   * * @status 2 developing
   */
  this.checkUsers = function(params) {

    var len = params.length;
    var selectUser = $("#chatuserpick");
    var html = "";

    for (var i = 0; i < len; i++) {
      console.log("User: " + i);
      html += '<option value="' + params[i].UserId + '">' + (params[i].alias).replace(/'/g, "\'") + '</option>';
    }
    selectUser.html(html)
    selectUser.trigger("liszt:updated");
  };


  /* @param params | success {boolean}
   *
   * @returns void
   *
   * @tasks Alert user if their change in status was successful or not with a noty alert.
   */
  this.statusChange = function(params) {
    if (!params.success) {
      /*noty({
       text: '<strong>Failed</strong>, to update your status. There appears to be something wrong with chat at this moment',
       type: 'error',
       theme: 'noty_theme_twitter',
       layout: 'topCenter',
       speed: 1,
       force: true
       });*/
    } else {
      /*noty({
       text: '<strong>Successfully</strong>, changed chat status',
       type: 'success',
       theme: 'noty_theme_twitter',
       layout: 'centerRight',
       speed: 75,
       force: true
       });*/
    }
  };

};
var heartbeatMethods = new HeartbeatMethods();

var Heartbeat = function() {
  this.heartbeatSleep = 500; // time in millisecond for the heartbeat
  this.heartbeatUrl = 'heartbeat.sjs';
  this.heartbeats = 0;
  this.timeUserActive = 0; // How long has it been since the user has been active on the server page
  this.enabled = true;
  this.methods = {};
  this.heartbeat = true;

  /* @param key {string} | params {object} | callback {function} | beats {int}
   *
   * @return void
   *
   * @tasks Adds a method to the list of methods that will get executed every x amount of beats
   */
  this.addSingleTask = function(key, method, params, callback) {
    this.addMethod(key, method, params, callback, 1);
  };
  this.addMethod = function(key, method, params, callback, beats) {
    // var methodId = this.methods.length;
    heartbeat.methods[key] = {
      key: key,
      method: method,
      params: params,
      callback: callback,
      beats: beats
    };
  };
  /* @param sleep {int}
   *
   * @return void
   *
   * @tasks Starts the heart at what ever they set it too, can default to 500ms
   */
  this.startHeart = function(sleep) {
    if (sleep) {
      heartbeat.heartbeatSleep = sleep;
    }
    heartbeat.heartbeat = setInterval("heartbeat.startFunction()", heartbeat.heartbeatSleep);
  };

  this.killMethod = function(key) {
    delete this.methods[key];
  }
  this.startFunction = function() {
    console.log('starting');

    var methodsLen = this.methods.length;
    var params = [];
    var keys = [];
    var methods = [];

    for (var i in this.methods) {
      params.push(this.methods[i].params);
      keys.push(this.methods[i].key);
      methods.push(this.methods[i].method);

      //if(this.methods[i].beats - 1 === 0) {
      // if the method is out of beats then purge it out of the methods
      //delete this.methods[i]
      //} else {
      // remove a beat from the method so it is closer to being evaluated
      this.methods[i].beats = this.methods[i].beats - 1;
      //}
    }

    var jsonData = JSON.stringify({
      params: params,
      keys: keys,
      methods: methods
    });

    $.ajax({
      url: this.heartbeatUrl,
      data: "data=" + jsonData,
      type: "POST",
      dataType: "json",
      cache: false,
      success: function(data) {
        var len = data.length;

        for (var x in data) {
          var key = data[x];

          heartbeatMethods[heartbeat.methods[x].callback](key);
          if (heartbeat.methods[x].beats === 0) {
            heartbeat.killMethod(x);
          }
        }
      }
    });
  };
};

var heartbeat = new Heartbeat();

$(function() {

  heartbeat.addMethod("Msgs", "getMessages", {
    lastId: heartbeatMethods.lastId
  }, "processMessages", 9999);

  heartbeat.addMethod("Users", "getActive", {}, "checkUsers", 1);

  heartbeat.addMethod("Status", "changeStatus", {
    userStatus: 1
  }, "statusChange", 1);

  // heartbeat.startFunction();
  heartbeat.startHeart(500);
  $("#chatcontent").bind('created', function(e) {

    console.log(e);
  });
  $("#chatcontent").jqxTabs({
    theme: "classic",
    showCloseButtons: true,
    reorder: false,
    enableDropAnimation: true,
    width: "245px",
    keyboardNavigation: true,
  });

  $("#chatuserpick").on("change", function() {
    var title = $("#chatuserpick option:selected").text();
    var chatSelect = $(this);
    var id = chatSelect.val();
    var chat = $("#chatcontent");

    if (!$("#chat" + id).length > 0) {
      // add the new tab with the same standards as the new sender option
      chat.jqxTabs('addAt', chat.jqxTabs("length"), title, '<div id="chat' + id + '"></div>');
    }

  }).chosen();

  $("#send-chat-btn").on("click", function() {
    var selectedTab = $("#chatcontent").jqxTabs("selectedItem");
    var div = $("div.jqx-tabs-content-element:eq(" + selectedTab + ")").children();
    var str = $(div).attr("id");
    var msg = $("#send-chat-msg").val();
    var id = parseInt(str.substr(4));
    var alias = $.globalVar.alias;

    $(div).append('<span style=\'margin: 0; padding: 0; border: 0;\'>' + '<span style="color: #0000ff;">You: </span>' + msg + '</span><br />');
    $("#send-chat-msg").val('');
    heartbeat.addMethod("sent", "sendMessage", {
      msg: msg,
      to: id,
      alias: alias
    }, "returnSent", 1);
  });

  $(window).bind('beforeunload', function() {
    $.ajax({
      url: "chatajax.sjs",
      data: "action=userstatus&userStatus=0",
      cache: false,
      type: "POST",
      dataType: "json",
      success: function(data) {

      }
    });
  });

  $("#send-chat-msg").on("focusin", function(e) {

    $(window).on("keypress", function(key) {
      if (key.which === 13) {
        key.preventDefault
        $("#send-chat-btn").click();
      }
    });
  });

  $("#send-chat-msg").on("focusout", function(e) {
    $(window).off("keypress");
  });

  var chatBtn = $("#chatbtn");

  chatBtn.on("click", function(e) {

    $(this).hide();

    $("#chatboss").animate({
      right: "0"
    }, "slow");

  });

  $("#chathidebtn").on("click", function(e) {

    chatBtn.show();

    $("#chatboss").animate({
      right: "-250px"
    }, "slow");

  });
});