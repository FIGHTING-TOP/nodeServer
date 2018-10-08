/**
 * Created by wangmw on 2015/9/30 15:01.
 */
let sd = require("silly-datetime");
let formidable = require('formidable');
let path = require('path');
let fs = require('fs');
exports.handleForm = function(req, res){
	let data = '';
	req.addListener('data', function(chunk){
		console.log(chunk);
		data += chunk;
	})
	req.addListener('end', function(){
		data = data.toString();
		res.end('success');
	})
	
    var form = formidable.IncomingForm({
       encoding : 'utf-8',//上传编码
       uploadDir : "./uploads",//上传目录，指的是服务器的路径，如果不存在将会报错。
       keepExtensions : true,//保留后缀
       maxFieldsSize : 2 * 1024 * 1024//byte//最大可上传大小
    });
    //执行里面的回调函数的时候，表单已经全部接收完毕了。
    var allFile=[];
    form.on('progress', function(bytesReceived, bytesExpected) {//在控制台打印文件上传进度
        var progressInfo = { 
            value: bytesReceived, 
            total: bytesExpected 
        }; 
        console.log('[progress]: ' + JSON.stringify(progressInfo));
    })
    .on('file', function (filed, file) {
        allFile.push([filed, file]);//收集传过来的所有文件
    })
    .on('end', function() { 
        res.end('上传成功！'); 
    })
    .on('error', function(err) {
        console.error('上传失败：', err.message); 
        next(err); 
    })
    .parse(req, function(err, fields, files) {
        allFile.forEach(function(file, index){
            var ttt = sd.format(new Date(), 'YYYYMMDDHHmmss');
            var ran = parseInt(Math.random() * 89999 + 10000);

            var extname = path.extname(file[1].name);
            var oldpath = path.resolve(__dirname, '..') + "/" + file[1].path;
            var newpath = path.resolve(__dirname, '..') + "/uploads/" + ttt + ran + extname;

            //改名
            fs.renameSync(oldpath,newpath)
            // fs.rename(oldpath,newpath,function(err){
            //     if(err){
            //         throw Error("改名失败");
            //     }
            //     res.writeHead(200, {'content-type': 'text/plain'});
            //     res.end('success');
            // });
        });
    });
}


