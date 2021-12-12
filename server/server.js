
var http = require("http")
var notion = require("./index")
var eventEmitter = require("events")
var event = new eventEmitter()

//define events
event.on('getnotion', ()=> {
    console.log("let notion gotten??")
})


//open server
var server = http.createServer(function(request, response){
    response.writeHead(200,{'ContentType':'text/html'})
    response.end('Hello node.js!!');

})

server.listen(8080, function(){ 
    console.log('Server is running...');
});