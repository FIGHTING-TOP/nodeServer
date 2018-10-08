/**
 * Created by wangmw on 2015/9/30 15:01.
 */
let path = require('path');
let url = require('url');
let handler = require('../handler');
exports.routes = routes;
function routes(req, res){

	let reqMethod = req.method.toLowerCase();
	let reqUrl = req.url;
	console.log(reqUrl)
	let pathName = url.parse(reqUrl).pathname;
	pathName = decodeURI(pathName);

	if(reqMethod === 'post'){
		switch(pathName){
			case '/form':
				handler.handleForm(req, res);
				// let data = '';
				// req.addListener('data', function(chunk){
				// 	console.log(chunk);
				// 	data += chunk;
				// })
				// req.addListener('end', function(){
				// 	data = data.toString();
				// 	res.end('success');
				// })
				// res.end('success');
				break;
			case '/uploadFile':
				
				break;
			default:
				return;
		}
	}

}

