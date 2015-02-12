window.GEOCHAT_VIEW =
	login: (event) ->
		if event.keyCode is 13
			AUTH.requestLogin 	$('#login').val(),
								$('#pass').val()

	loginSuccess: ->
		GEOCHAT_COMPONENTS.connect()
		$("#courses-div").hide()
		$("#classes-div").hide()
		GEOCHAT_VIEW.swap $("#loginForm"), $("#logout")
		GEOCHAT_VIEW.swap $("#loginForm"), $("#courses-div")
		GEOCHAT_VIEW.swap $("#loginForm"), $("#classes-div")
		$("#pass")					.val ''

	loginFail: ->
		$('#loginForm')			.addClass 'fail'

	logout: ->
		AUTH.requestLogout()
		GEOCHAT_VIEW.swap $("#logout"), $("#loginForm")
		GEOCHAT_VIEW.swap $('#courses-div')
		GEOCHAT_VIEW.swap $('#classes-div')
		GEOCHAT_VIEW.swap $('#geochat')
		GEOCHAT_VIEW.swap $('#repository')
		GEOCHAT_VIEW.swap $('#cams')
		GEOCHAT_VIEW.swap $('#classes-details-submit-leave')
		GEOCHAT_VIEW.swap $('#classes-details-submit-end')

	addVideo: (member, video) ->
		$(
			"""
			<div id="#{member}" class="cam">
				<p>#{member}</p>
				#{$(video).prop('outerHTML')}
			</div>
			"""
		)	.appendTo			('#cams')
			.on 'dragenter
				dragstart
				dragend
				dragleave
				dragover
				drag
				drop', 			GEOCHAT_VIEW.dragCancel
			.on 'drop', 		GEOCHAT_VIEW.dropFile

	deleteVideo: (video) ->
		$(video).parent().remove();

	writeChat: (user, msg) ->
		$('#out').append 		user + ' : ' + msg + '<br>'
		$('#out').scrollTop 	$('#out')[0].scrollHeight

	readChat: (event) ->
		msg = $(this).val()
		if msg isnt '' and event.keyCode is 13
			$(this).val ''
			GEOCHAT_VIEW.writeChat 	'moi',
							msg
			sendMessage 	'messageChat',
							user: AUTH.getMember()
							message: msg

	dragCancel: (event) ->
		console.log 'dragover'
		event.preventDefault()
		event.stopPropagation()
		off

	dropFile: (event) ->
		member 	= this.id
		files 	= event.originalEvent.dataTransfer.files

		FILE_TRANSFER.sendFile member, files

	join: () ->
		$('#geochat').hide()
		$('#repository').hide()
		GEOCHAT_VIEW.swap $('#courses-div'), $('#geochat')
		GEOCHAT_VIEW.swap $('#classes-div'), $('#repository')
		GEOCHAT_VIEW.show $('#cams')
		GEOCHAT_VIEW.show $('classes-details-submit-leave')#.css 'display', 'block'
		GEOCHAT_VIEW.show $('classes-details-submit-end')#.css 'display', 'block'
		yes

	leave: () ->
		GEOCHAT_VIEW.swap $('#geochat'), $('#courses-div')
		GEOCHAT_VIEW.swap $('#repository'), $('#classes-div')
		GEOCHAT_VIEW.swap $('#cams')
		yes

	show: (elem) ->
		console.log 'show'
		console.log elem.selector
		cb = () =>
				elem.removeClass 'showOpac'

		elem.show()
			.addClass 'showOpac'
			.one 'animationend', cb
			.one 'webkitAnimationEnd', cb

	swap: (elem, elem2) ->
		console.log 'hide'
		console.log elem.selector
		cb = () =>
				console.log elem.selector
				console.log elem2.selector
				elem.removeClass 'hideOpac'
					.hide()
				if elem2
					GEOCHAT_VIEW.show elem2

		elem#.show()
			.addClass 'hideOpac'
			.one 'animationend', cb
			.one 'webkitAnimationEnd', cb

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

	$('#classes-details-submit-join')	.on 'click', 	GEOCHAT_VIEW.join
	
	$('#classes-details-submit-leave')	.on 'click', 	GEOCHAT_VIEW.leave

	$('#classes-details-submit-start')	.on 'click', 	GEOCHAT_VIEW.join
	
	$('#classes-details-submit-end')	.on 'click', 	GEOCHAT_VIEW.leave
