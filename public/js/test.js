// Generated by CoffeeScript 1.8.0
(function() {
  window.view = {
    login: function(event) {
      if (event.keyCode === 13) {
        return AUTH.requestLogin($('#login').val(), $('#pass').val());
      }
    },
    loginSuccess: function() {
      $("#loginForm").hide();
      return $("#rooms, #logout").show();
    },
    loginFail: function() {
      return $('#loginForm').addClass('fail');
    },
    logout: function() {
      AUTH.requestLogout();
      $("#loginForm").hide();
      return $("#rooms, #logout").show();
    },
    addVideo: function(member, video) {
      return $("<div id=\"" + member + "\" class=\"cam\">\n	<p>" + member + "</p>\n	" + ($(video).prop('outerHTML')) + "\n</div>").appendTo('#cams').on('dragover dragenter', view.dragCancel).on('drop', view.dropFile);
    },
    writeChat: function(user, msg) {
      $('#out').append(user + ' : ' + msg + '<br>');
      return $('#out').scrollTop($('#out')[0].scrollHeight);
    },
    readChat: function(event) {
      var msg;
      msg = $(this).val();
      if (msg !== '' && event.keyCode === 13) {
        $(this).val('');
        if (typeof sendMessage === 'undefined') {
          return view.writeChat('WARNING', 'You are not connected !');
        } else {
          view.writeChat('me', msg);
          return sendMessage('messageChat', {
            user: AUTH.connectionData.userName,
            message: msg
          });
        }
      }
    },
    dragCancel: function(event) {
      if (event.preventDefault) {
        event.preventDefault();
      }
      return false;
    },
    dropFile: function(event) {
      if (event.preventDefault) {
        event.preventDefault();
      }
      event = event.originalEvent;
      return console.log(event.dataTransfer.files[0]);
    }
  };

  $(function() {
    var data;
    $('#loginForm').on('keyup', view.login);
    $('#logout').on('click', view.logout);
    $('#localMember').parent().on('dragover dragenter', view.dragCancel).on('drop', view.dropFile);
    $('#in').on('keyup', view.readChat);
    if (window.FileReader) {
      console.log('FILEREADER');
    } else {
      console.log('NO FILEREADER !');
    }
    if (window.FileList) {
      console.log('FILELIST');
    } else {
      console.log('NO FILELIST !');
    }
    data = {
      data: [
        {
          text: 'Projet 1',
          children: [
            {
              text: 'ch 1 1',
              children: [
                {
                  text: 'ch 1 1 1'
                }
              ]
            }, 'leaf'
          ]
        }, 'Projet 2'
      ]
    };
    return $('#files').jstree({
      core: data
    });
  });

}).call(this);
