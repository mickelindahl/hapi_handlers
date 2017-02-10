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

        options = options || {};

        let _handler = ( request, options ) => {

            debug( 'create', request.payload );

            let Model = request.server.getModel( options.model );

            return Model.create( request.payload )
        };

        let _reply = ( reply, response ) => {

            reply( response ).code( 201 );

        };

        return _do( _handler, _reply, request, reply, options );
        /**/
    }
}

function _do( _handler, _reply, request, reply, options ) {

    return new Promise( done => {

        if ( options.onPreHandler ) {

            return options.onPreHandler( request, models, done )

        }

        done( models )

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
 *   -`getCriteria` function `function(request)` that returns a
 *  [waterline criteria](https://github.com/balderdashy/waterline-docs/blob/master/queries/query-language.md)
 *  used to update models in the database
 *   - `model` (string) table to update
 *
 * @return function(request, reply)
 * @api public
 */
function update( options ) {
    return ( request, reply ) => {

        if ( options.getCriteria == undefined ) {

            return reply( Boom.badImplementation( 'Need to provide options.getCriteria callback!!!' ) );

        }

        let _handler = ( request, options ) => {

            var Model = request.server.getModel( options.model );

            let criteria = options.getCriteria( request )

            return Model.update( criteria, payload )
        }

        let _reply = ( reply, response ) => {

            reply( response );

        };

        return _do( _handler, _reply, request, reply, options )

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
 *   -`getCriteria` function `function(request)` that returns a
 *  [waterline criteria](https://github.com/balderdashy/waterline-docs/blob/master/queries/query-language.md)
 *  used to get models from the database
 *   criteria
 *   - `model` (string) table to update
 *
 * @return function(request, reply)
 * @api public
 */
function get( options ) {
    return ( request, reply ) => {

        if ( options.getCriteria == undefined ) {

            return reply( Boom.badImplementation( 'Need to provide options.getCriteria callback!!!' ) );

        }

        let _handler = ( request, options ) => {

            let Model = request.server.getModel( options.model );

            let criteria = options.getCriteria( request );

            return Model.find( criteria ).then( models => {

                if ( models.length == 0 ) {
                    return Boom.notFound();
                }

                return models;
            });
        };

        let _reply = ( reply, response ) => {

            reply( response );

        };

        return _do( _handler, _reply, request, reply, options )

    }
}

/**
 *  Delete a database entry/entries
 *
 * - `options` an object with the following keys.
 *   -`getCriteria` function `function(request)` that returns a
 *  [waterline criteria](https://github.com/balderdashy/waterline-docs/blob/master/queries/query-language.md)
 *  used to delete models in the database
 *   - `model` (string) table to delete entries in
 *
 * @return function(request, reply)
 * @api public
 */
function destroy( options ) {
    return ( request, reply ) => {

        if ( options.getCriteria == undefined ) {

            return reply( Boom.badImplementation( 'Need to provide options.getCriteria callback!!!' ) );

        }

        let _handler = ( request, options ) => {

            let Model = request.server.getModel( options.model );

            let criteria = options.getCriteria( request )

            Model.destroy( criteria ).then( ( models ) => {

                if ( models.length == 0 ) {
                    return Boom.notFound();
                }

                return models;

            } )
        };

        let _reply = ( reply, response ) => {

            reply( response ).code( 200 );

        };

        return _do( _handler, _reply, request, reply, options )

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
