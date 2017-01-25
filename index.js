"use strict";

const http = require("http");

let server = http.createServer(function (req, res) {
    try {
        require(`./controllers/${req.url.split("/").splice(1).shift()}Controller`)[`${req.method.toLocaleLowerCase()}Action`](req, res);
    } catch (e) {
        console.log(e);
        res.end("Error");
    }


});

server.listen(3000);