/**
 * Created by mikael on 9/23/16.
 */
'use strict';

const Boom = require( 'boom' );
const debug = require( 'debug' )( 'hapi_handlers:lib:index.js' );

let _log;

/**@module server.methods.handler*/

/**
 *  Returns a handler for creating a database entry/entries with data in
 *  `request.payload` where request is a [hapijs request](https://hapijs.com/api#requests)
 *  object
 *
 * - `options` an object with the following keys.
 *   - `model` (string) table to update
 *   - `ext` function handler extensions functions `function(request, models, done)`
 *   where request is a [hapi request](https://hapijs.com/api#requests)
 *   object, models is  [sails create](http://sailsjs.com/documentation/reference/waterline-orm/models/create)
 *   return models object and done is promise resolve should be called one completion.
 *     - `onPreHandler` evoked before handler
 *     - `onPreReply` evoked before reply. `done` shoudl be called with preferred reply payload.
 *
 * @return function(request, reply)
 * @api public
 */
function create( options ) {
    return ( request, reply ) => {

        let _handler = ( request, options ) => {

            debug( 'create', request.payload );

            let Model = request.server.getModel( options.model );

            return Model.create( request.payload )
        };

        let _reply = ( reply, response ) => {

            reply( response ).code( 201 );

        };

        return _do( _handler, _reply, request, reply, options, 'create' );
        /**/
    }
}

function _do( _handler, _reply, request, reply, options, flag ) {

    options = options || {};


    if ( ['update', 'get', 'delete'].indexOf(flag) != -1
        && options.getCriteria == undefined  ) {

        return reply( Boom.badImplementation( 'Need to provide options.getCriteria callback!!!' ) );

    }

    return new Promise( done => {


        if ( options.onPreHandler ) {

            return options.onPreHandler( request, done )

        }

        done( )

    } ).then( () => {

        return _handler( request, options )

    } ).then( models => {

        return new Promise( done => {
            if ( options.onPreReply ) {

                options.onPreReply( request, models, done )

            }

            done( models )

        } )
    } ).then( response => {

        _reply( reply, response )

    } ).catch( function ( err ) {

        _log( err );
        reply( Boom.badImplementation( err.message ) );

    } );

}

/**
 *  Returns a handler for updating a database with data in
 *  `request.payload` where request is a [hapijs request](https://hapijs.com/api#requests)
 *  object
 *
 * - `options` an object with the following keys.
 *   - `ext` function handler extensions functions `function(request, models, done)`
 *   where request is a [hapijs request](https://hapijs.com/api#requests)
 *   object, models is  [sails create](http://sailsjs.com/documentation/reference/waterline-orm/models/create)
 *   return models object and done is promise resolve should be called one completion.
 *     - `onPreHandler` evoked before handler
 *     - `onPreReply` evoked before reply. `done` shoudl be called with preferred reply payload.
 *   -`getCriteria` function `function(request, done)` that calls done
 *  [waterline criteria](https://github.com/balderdashy/waterline-docs/blob/master/queries/query-language.md)
 *  used to update models in the database
 *   - `model` (string) table to update
 *
 * @return function(request, reply)
 * @api public
 */
function update( options ) {
    return ( request, reply ) => {

        let _handler = ( request, options ) => {

            debug( 'update', request.payload );

            return new Promise( done => {

                options.getCriteria( request, done )

            } ).then(criteria=> {

                var Model = request.server.getModel( options.model );

                return Model.update( criteria, request.payload )
            })
        };

        let _reply = ( reply, response ) => {

            reply( response );

        };

        return _do( _handler, _reply, request, reply, options, 'update' )

    }
}

/**
 *  Returns a handler used to retrieve entry/entries from a database
 *
 * - `options` an object with the following keys.
 *   - `ext` function handler extensions functions `function(request, models, done)`
 *   where request is a [hapi request](https://hapijs.com/api#requests)
 *   object, models is  [sails create](http://sailsjs.com/documentation/reference/waterline-orm/models/create)
 *   return models object and done is promise resolve should be called one completion.
 *     - `onPreHandler` evoked before handler
 *     - `onPreReply` evoked before reply. `done` shoudl be called with preferred reply payload.
 *   -`getCriteria` function `function(request, done)` that calls done
 *  [waterline criteria](https://github.com/balderdashy/waterline-docs/blob/master/queries/query-language.md)
 *  used to get models from the database
 *   - `model` (string) table to update
 *
 * @return function(request, reply)
 * @api public
 */
function get( options ) {
    return ( request, reply ) => {

        let _handler = ( request, options ) => {

            debug( 'get', request.payload );

            return new Promise( done => {

                options.getCriteria( request, done )

            } ).then(criteria=> {

                let Model = request.server.getModel( options.model );

                return Model.find( criteria ).then( models => {

                    if ( models.length == 0 ) {
                        return Boom.notFound();
                    }

                    return models;
                });
            })
        };

        let _reply = ( reply, response ) => {

            reply( response );

        };

        return _do( _handler, _reply, request, reply, options, 'get' )

    }
}

/**
 *  Delete a database entry/entries
 *
 * - `options` an object with the following keys.
 *   -`getCriteria` function `function(request, done)` that calls done
 *  [waterline criteria](https://github.com/balderdashy/waterline-docs/blob/master/queries/query-language.md)
 *  used to delete models in the database
 *   - `model` (string) table to delete entries in
 *
 * @return function(request, reply)
 * @api public
 */
function destroy( options ) {
    return ( request, reply ) => {

        let _handler = ( request, options ) => {

            debug( 'destroy', request.payload );

            return new Promise( done => {

                options.getCriteria( request, done )

            } ).then(criteria=> {

                let Model = request.server.getModel( options.model );


                return Model.destroy( criteria ).then( models => {

                    if ( models.length == 0 ) {
                        return Boom.notFound();
                    }

                    return models;

                } )
            })

        };

        let _reply = ( reply, response ) => {

            reply( response ).code( 200 );

        };

        return _do( _handler, _reply, request, reply, options, 'delete' )

    }
}

exports.register = function ( server, options, next ) {

    _log = options.log || console.error;

    server.method( [
        {
            name: 'handler.create',
            method: create,
            options: {}
        },
        {
            name: 'handler.update',
            method: update,
            options: {}
        },
        {
            name: 'handler.get',
            method: get,
            options: {}
        },
        {
            name: 'handler.delete',
            method: destroy,
            options: {}
        }] );

    next();
};

exports.register.attributes = {
    name: 'handler',
    version: '1.0.0'
};
