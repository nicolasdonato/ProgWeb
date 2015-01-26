$ ->
	
	$('#in').on 'keyup', (e) ->
		if $(this).val() isnt '' and e.keyCode is 13
			val = $(this).val()
			$('#out').append 'me : ' + val + '<br>'
			$('#out').scrollTop $('#out')[0].scrollHeight
			$(this).val ''
			sendMessage 'messageChat', {user: AUTH.connectionData.userName, message: val}

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

