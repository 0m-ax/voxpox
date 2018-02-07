var express = require('express');
var multer  = require('multer');
var app = express();
var fs = require('fs');
var server = require('http').Server(app);
var io = require('socket.io')(server);
app.use(express.static('public')); // for serving the HTML file
var fs = require('fs');

var upload = multer({ dest: __dirname + '/output/' });
var type = upload.single('upl');

app.post('/upload/:type/:permissions', type, function (req, res) {
   console.log(req.file);
   let suffix = '';
   switch (req.params.type) {
       case 'video-s':
           suffix += '.sound.'+req.params.permissions+'.webm'
           break;
        case 'video':
           suffix += '.silent.'+req.params.permissions+'.webm'
           break;
        case 'image':
           suffix += '.'+req.params.permissions+'.png'
           break;
        case 'audio':
           suffix += '.'+req.params.permissions+'.ogg'
           break;
   }
   fs.rename(req.file.path, __dirname + '/output/'+req.file.filename+suffix,function (){
    io.local.emit('files',getFiles())
   })
   res.send("ok")
});

function getFiles(){
    var files = fs.readdirSync(__dirname+'/output/').map(function (file){
        return {
            ctime:fs.statSync(__dirname+'/output/'+file).ctime,
            file:file
        }
    }).sort(function(a,b) {
        return a.ctime - b.ctime;
    }).reverse()
    .map(function (file){
        return file.file
    })
    return files
}
io.on('connection', function (socket) {
    socket.emit('files',getFiles())
})

server.listen(3000);

var SerialPort = require('serialport');
var robot = require("robotjs");
var port = new SerialPort('/dev/ttyACM0', {
  baudRate: 115200
});
port.on('data', function (data) {
    switch (data.toString().charAt(0)) {
        case "0":
            robot.keyTap("3");
            break;
        case "1":
            robot.keyTap("2");
            break;
        case "2":
            robot.keyTap("1");
            break;
        default:
            break;
    }
})