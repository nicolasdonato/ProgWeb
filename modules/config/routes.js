var tags = require('../tags');

exports.setup = function(app){
	app.post('/ws/tags', tags.create);
	app.get('/ws/tags', tags.list);
	app.get('/ws/tags/:id', tags.history);
	app.delete('/ws/tags/:id', tags.delete);
};