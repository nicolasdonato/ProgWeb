// Generated by CoffeeScript 1.8.0
(function() {
  window.GEOCHAT_VIEW = {
    login: function(event) {
      if (event.keyCode === 13) {
        return AUTH.requestLogin($('#login').val(), $('#pass').val());
      }
    },
    loginSuccess: function() {
      $("#loginForm").hide();
      $("#pass").val('');
      $("#rooms, #logout").show();
      return $("#localVideo").parent().show();
    },
    loginFail: function() {
      return $('#loginForm').addClass('fail');
    },
    logout: function() {
      AUTH.requestLogout();
      $("#loginForm").show();
      return $("#rooms, #logout").hide();
    },
    addVideo: function(member, video) {
      return $("<div id=\"" + member + "\" class=\"cam\">\n	<p>" + member + "</p>\n	" + ($(video).prop('outerHTML')) + "\n</div>").appendTo('#cams').on('dragenter dragstart dragend dragleave dragover drag drop', GEOCHAT_VIEW.dragCancel).on('drop', GEOCHAT_VIEW.dropFile);
    },
    deleteVideo: function(video) {
      return $(video).parent().remove();
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
          return GEOCHAT_VIEW.writeChat('WARNING', 'You are not connected !');
        } else {
          GEOCHAT_VIEW.writeChat('me', msg);
          return sendMessage('messageChat', {
            user: AUTH.getMember(),
            message: msg
          });
        }
      }
    },
    dragCancel: function(event) {
      console.log('dragover');
      event.preventDefault();
      event.stopPropagation();
      return false;
    },
    dropFile: function(event) {
      var files, member;
      member = this.id;
      files = event.originalEvent.dataTransfer.files;
      return FILE_TRANSFER.sendFile(member, files);
    }
  };

  $(function() {
    var data;
    window.AUTH.initialize();
    $('#localMember').parent().on('dragover dragenter', GEOCHAT_VIEW.dragCancel).on('drop', GEOCHAT_VIEW.dropFile);
    $('#in').on('keyup', GEOCHAT_VIEW.readChat);
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
