"use strict";

const Memcached = require("memcached");

let memcached = new Memcached('localhost:11211');

function getUserId(req) {
    return req.url.split('/')[2];
}

memcached.connect( 'localhost:11211', function( err, conn ){
    if( err ) throw new Error( err );
    // console.log(conn);
});

module.exports = {
    /**
     * @example curl -v -X GET "http://127.0.0.1:3000/users/2/purchases"
     */
    getAction: function (req, res) {

        let userId = getUserId(req);

        memcached.get(userId, function (err, data) {
            // console.log('eror: ' + err);
            if(data){
                let value = JSON.parse(data);
                // console.log(typeof(value.count));
                res.end(value.count.toString());
            } else {
                console.log('Cannot read data');
                res.end("Cannot read data from memcached");
            }
        });

    },

    /**
     * @example curl -v -X POST "http://127.0.0.1:3000/users/2/purchases" -d '{"count":10}'
     * @param req
     * @param res
     */
    postAction: function (req, res) {

        let userId = getUserId(req);
        // console.log(userId);

        try {
            let body = '';
            req.on('data', function (chunk) {
                console.log('chunk:' + typeof(chunk));
                body += chunk.toString();
            });
            req.on("end", function () {
                console.log('body:' + body);

                memcached.set(userId, body, 1000, function (err) {

                    if (err) {
                        res.end('Error --> Cannot store a value in memcached');
                    } else {
                        res.end("OK");
                    }
                    // console.log('done');
                });
            })
        } catch (e) {
            res.end('Cannot parse request body');
        }


    },
};