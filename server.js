/**
 * Created by wangmw on 2015/9/20 16:59.
 */
console.time('[HttpServer][Start]')
let http = require('http');
let url = require('url');//url解析
let util = require('util');
let fs = require('fs');
let path = require('path');//路径解析
let ejs = require('ejs');
let sd = require("silly-datetime");
let formidable = require('formidable');

let router = require('./router');

let host = '127.0.0.1';
let port = 80;
 
// 创建一个服务
let httpServer = http.createServer((req, res) => {

  var reqUrl = req.url;
  var pathName = url.parse(reqUrl).pathname;
  pathName = decodeURI(pathName);
  var pathExtName = path.extname(pathName);

  //处理网页图标
  if(pathName === '/favicon.ico'){
    fs.readFile("./favicon.ico",function(err,data){
      if(err)throw Error('favicon.ico not found');
      res.end(data);
    });
    return
  };

  //添加其他功能
  router.routes(req, res);


  // 判断URL中有没有扩展名
  if(pathExtName === ''){
    if(pathName === '/' || pathName === ''){
      showMenu(req, res, './static/')
    }else{
      let s = pathName.split('/');
      let ls = s[s.length-1];
      if(ls === ''){
        pathName = '.' + pathName;
      }else{
        pathName = '.' + pathName + '/';
      }

      let filePath = pathName.slice(1,pathName.length-1);
      filePath = path.join(__dirname, filePath.slice(filePath.lastIndexOf('/')))
      fs.exists(filePath, function(exist){
        if(exist){
          let stats = fs.statSync(pathName.slice(0,pathName.lastIndexOf('/')));
          if(stats.isDirectory()){
            showMenu(req, res, pathName);
          }else{
            not404(res);
          }
        }else{
          let html = '<h1>not found</h1>';
          res.writeHead(200, {"content-type":"text/html;charset=utf-8"});
          res.end(html);
        }
      })
      
      // fs.stat(pathName.slice(0,pathName.lastIndexOf('/')), function(err, stats){
        
      
    }
  }else{//有扩展名
      //获取资源文件的相对路径反斜线转换
      var filePath = path.join(__dirname,pathName);
      //如果文件名存在
      fs.exists(filePath, function(exists){
        if(exists){
          var contentType = getContentType(pathExtName);
          res.writeHead(200, {"content-type":contentType});
          var stream = fs.createReadStream(filePath,{flags:"r",encoding:null});
          stream.on('error', function(){
            res.writeHead(500,{"content-type": "text/html"});
            res.end("<h1>500 Server Error</h1>");
          });
          //返回文件内容
          stream.pipe(res);
        }else{
          not404(res);
        }
      })
  }

})

function showMenu(req, res, p){

    fs.readFile('./index.ejs', function(err, result){
      var template = result.toString();
      var data = {};
      var html = '';

      try{
        //获取用户访问路径下的文件列表
        var files = fs.readdirSync(p);
        // fs.readdir('./static', function(error, filess){
        //     console.log(filess);
        // });

        data.files = [];
        //将访问路径下的所有文件都列出来，并添加超链接
        for(let i = 0; i < files.length; i++){
            let filename = files[i];

            let stats = fs.statSync(p + filename);

            data.files.push({
              name: filename,
              path: (p.slice(1)) + filename,
              size: stats.size,
              time: sd.format(stats.ctime, 'YYYY-MM-DD HH:mm:ss')
            });
        }
        html = ejs.render(template, data);

      }catch (e){
        html += '<h1>您访问的目录不存在</h1>';
      }

      res.writeHead(200, {"content-type": "text/html;charset=utf-8"});
      res.end(html);
    })
}


function getContentType(extName){
  // fs.readFile('./mime.json', function(error, data){
  //   if(error){
  //     throw Error('mime.json not found');
  //     return
  //   }else{
  //     var mime = JSON.parse(data);
  //     var contentType = mime[extName] || 'text/plain';
  //     return contentType;
  //   }
  // })

  let data = fs.readFileSync('./mime.json');
  var mime = JSON.parse(data);
  var contentType = mime[extName] || 'text/plain';
  console.log(contentType);
  return contentType;
}

function not404(res){
  let html = '<h1>404 Not Found</h1>';
  res.writeHead(404, {"content-type":"text/html;charset=utf-8"});
  res.end(html);
}


function redirect(){
    // //重定向
    // var redirect = 'http://' + host +':'+ port + pathName +'/';
    // res.writeHead(301, {location:redirect});
    // res.end();
}


//在指定的端口监听
httpServer.listen(port, host, () => {
  console.log('服务器已经运行，请打开浏览器，输入：http://'+host+':'+port+'/来访问');
  console.timeEnd('[HttpServer][Start]')
})