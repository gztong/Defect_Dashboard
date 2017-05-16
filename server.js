var connect = require('connect');
var serveStatic = require('serve-static');
var dirname = ".";
connect().use(serveStatic(dirname)).listen(8080, function(){
    console.log('Server running on 8080...');
});