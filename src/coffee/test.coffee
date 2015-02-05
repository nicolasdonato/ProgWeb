window.GEOCHAT_VIEW =
	login: (event) ->
		if event.keyCode is 13
			AUTH.requestLogin 	$('#login').val(),
								$('#pass').val()

	loginSuccess: ->
		$("#loginForm")			.hide()
	    $("#pass")				.val('')
		$("#rooms, #logout")	.show()

	loginFail: ->
		$('#loginForm')			.addClass 'fail'

	logout: ->
		AUTH.requestLogout()
		$("#loginForm")			.hide()
		$("#rooms, #logout")	.hide()


	addVideo: (member, video) ->
		$(
			"""
			<div id="#{member}" class="cam">
				<p>#{member}</p>
				#{$(video).prop('outerHTML')}
			</div>
			"""
		)	.appendTo					('#cams')
			.on 'dragover dragenter', 	GEOCHAT_VIEW.dragCancel
			.on 'drop', 				GEOCHAT_VIEW.dropFile

	writeChat: (user, msg) ->
		$('#out').append 		user + ' : ' + msg + '<br>'
		$('#out').scrollTop 	$('#out')[0].scrollHeight

	readChat: (event) ->
		msg = $(this).val()
		if msg isnt '' and event.keyCode is 13
			$(this).val ''
			if typeof sendMessage is 'undefined'
				GEOCHAT_VIEW.writeChat 	'WARNING', 'You are not connected !'
			else
				GEOCHAT_VIEW.writeChat 	'me',
								msg
				sendMessage 	'messageChat',
								user: AUTH.getMember()
								message: msg

	dragCancel: (event) ->
		if event.preventDefault
			event.preventDefault()
		return off

	dropFile: (event) ->
		if event.preventDefault
			event.preventDefault()

		event = event.originalEvent
		# console.log 'drop event, target: ' + event.target
		console.log event.dataTransfer.files[0]
		# console.log event.target.file

$ ->
	#########################################
	# 				Event handlers			#
	#########################################

	# login / logout
    window.AUTH.initialize()

	# Drop on local video
	$('#localMember')
		.parent()		.on 'dragover dragenter', 	GEOCHAT_VIEW.dragCancel
						.on 'drop', 				GEOCHAT_VIEW.dropFile

	# Chat
	$('#in')			.on 'keyup', 				GEOCHAT_VIEW.readChat



	#########################################
	# 				Tests					#
	#########################################
	if window.FileReader
		console.log 'FILEREADER'
	else
		console.log 'NO FILEREADER !'

	if window.FileList
		console.log 'FILELIST'
	else
		console.log 'NO FILELIST !'
	

	data = data: [
		text: 'Projet 1'
		children: [
			text: 'ch 1 1'
			children: [
				text: 'ch 1 1 1'
			]
			'leaf'
		]
		'Projet 2'
	]

	$('#files').jstree core: data

