/**
 * New node file
 */
// Liste les hashtags
exports.list = function(req, res){
	res.send('liste tous les hashtags');
}
// Crée un nouveau hashtag
exports.create = function(req, res){
	res.send('cree le tag ' + req.body);
}
// Donne l’historique d’un hashtag
exports.history = function(req, res){
	res.send('history de ' + req.params.id);
}
// Supprime un hashtag
exports.delete = function(req, res){
	res.send('suppression du tag ' + req.params.id);
}