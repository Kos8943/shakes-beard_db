const http = require('http'),
        fs = require('fs');
http.createServer((request, response) =>{
    fs.writeFile(__dirname + ' /header01.json', JSON.stringify(require.headers), error=>{
        if(error) return console.log(error);
        console.log('HTTP檔頭儲存');
    });
    fs.readFile(__dirname+ '/data01.html', (error, data)=>{
        if(error) {
            response.writeHead(500, {'Content-Type': 'text/Plain'});
            response.end('500 - data01.html not found');
        } else {
            response.writeHead(200, {'Content-Type' : 'text/html'});
            response.end(data);
        }
    });
});