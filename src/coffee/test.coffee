$ ->
	
	$('#in').on 'keyup', (e) ->
		if $(this).val() isnt '' and e.keyCode is 13
			$('#out').append 'me : ' + $(this).val() + '<br>'
			$('#out').scrollTop $('#out')[0].scrollHeight
			$(this).val ''
			sendMessage 'type', 'data'

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

