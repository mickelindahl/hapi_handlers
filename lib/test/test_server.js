/**
 * Created by Mikael Lindahl (mikael) on 10/3/16.
 */

'use strict';

const hapiWH = require( "../index.js" );

const Hapi = require( 'hapi' );
const Promise = require( 'bluebird' );
const hapiWaterline = require( 'hapi-waterline' );
const debug = require( 'debug' )( 'hapi_account:test_server' );

let options_hw = {
    adapters: { // adapters declaration
        'memory': require( 'sails-memory' )
    },
    connections: {default: {adapter: 'memory' }},
    models: { // common models parameters, not override exist declaration inside models
        connection: 'default',
        migrate: 'create',
        schema: true
    },
    decorateServer: true, // decorate server by method - getModel
    path: '../../..//lib/test/models' // string or array of strings with paths to folders with models declarations
};

function getServerPromise( options ) {
    let server = new Hapi.Server();

    server.connection( { host: '0.0.0.0', port: 3000 } );

    return new Promise(resolve=>{

        server.register( [
            {
                register: hapiWaterline,
                options: options_hw,
            },
            {
                register: hapiWH,
                options: options
            }

        ] )
            .then( ()=> {


                server.app.adapter=options_hw.adapters.memory;
                resolve(server)

            } )

    });

}

module.exports = getServerPromise;


