exports.controller = function(req,res){
	var templateData = {
		'title': 'controller'
	}
	res.render('controller.html',templateData);
}

exports.screen = function(req,res){
	var templateData = {
		'title': 'screen'
	}
	res.render('screen.html',templateData);
}