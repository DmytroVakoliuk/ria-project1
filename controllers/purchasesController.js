"use strict";

const Memcached = require("memcached");

let memcached = new Memcached('localhost:11211');

function getUserId(req) {
    return req.url.split('/')[2];
}

/*memcached.connect( 'localhost:11211', function( err, conn ){
    if( err ) throw new Error( err );
    console.log(conn.server);
});*/

module.exports = {
    /**
     * @example curl -v -X GET "http://127.0.0.1:3000/users/2/purchases"
     */
    getAction: function (req, res) {

        let userId = getUserId(req);

        memcached.get(userId, function (err, data) {
            if(data){
                let value = JSON.parse(data);
                res.end(value.count.toString());
            } else {
                // console.log('Cannot read data');
                res.end("invalid data");
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
        try {
            let body = '';
            req.on('data', function (chunk) {
                body += chunk.toString();
            });
            req.on("end", function () {

                memcached.set(userId, body, 1000, function (err) {
                    if (err) {
                        res.end('Error --> Cannot store a value in memcached');
                    } else {
                        res.end("OK");
                    }
                });
            });
        } catch (e) {
            res.end('Cannot parse request body');
        }
    },

    /**
     * @example curl -v -X DELETE "http://127.0.0.1:3000/users/2/purchases"
     */
    deleteAction: function (req, res) {
        let userId = getUserId(req);
        if (userId) {
            memcached.get(userId, function (err, data) {
                if(data){
                    memcached.del(userId, function (err) {
                        console.log(err);
                        if (err) {
                            res.end('Error --> Cannot delete a value in memcached');
                        } else {
                            res.end("OK");
                        }
                    });
                } else {
                    res.end("invalid data");
                }
            });
        } else {
            res.end("Invalid userId");
        }
    }
};