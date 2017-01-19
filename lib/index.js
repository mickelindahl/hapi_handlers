/**
 * Created by mikael on 9/23/16.
 */
'use strict';

const Boom=require('boom');
const debug=require('debug')('hapi_handlers:lib/index.js');

let _log;

/**
 *  Returns a handler for creating a database entry
 *
 * - `options` an object with the following keys.
 *   - `credentialAddToPayload` A credential key to
 *   - `model` (string) table to update
 *   add to payload at creation.
 *
 * @param {options|object} object with options
 * @return function(request, reply)
 * @api public
 */
function create (options) {
    return (request, reply)=> {

        debug('create', request.payload)

        var payload = request.payload;

        var Model = request.server.getModel(options.model);

        let key=options.credentialsAddToPayload

        if (request.auth.credentials[key]){

            payload[key] = request.auth.credentials[key];

        }

        Model.create(payload).then((models)=>{

            reply(models).code(201);

        }).catch(function (err) {

            _log(err);
            reply(Boom.badImplementation(err.message));

        });/**/
    }
}

/**
 *  Returns a handler for updating a database entry
 *
 * - `options` an object with the following keys.
 *   - `model` (string) table to update
 *   - `uniqueId` A id that uniquely identifies a database entry
 *
 * @param {options|object} object with options
 * @return function(request, reply)
 * @api public
 */
function update (options) {
    return (request, reply)=> {

        let payload = request.payload;

        let Model = request.server.getModel(options.model);

        let key=options.uniqueId ? options.uniqueId : 'id';

        if (!Model.definition[key].unique){

            return reply(Boom.badData('Not a unique id'))

        }

        Model.update({[key]: payload[key]}, payload).then((models)=>{

            reply(models[0]);

        }).catch(function (err) {

            _log(err);
            reply(Boom.badImplementation(err.message));

        });
    }
}

/**
 *  Returns a handler for retrieving all entries belonging to a credential key
 *
 * - `options` an object with the following keys.
 *   -`credentialAddToPayload` A credential key to
 *   add to payload at creation.
 *   - `model` (string) table to update
 *
 * @param {options|object} object with options
 * @return function(request, reply)
 * @api public
 */
function getByCredential( options ) {
    return (request, reply)=> {

        let Model = request.server.getModel(options.model);

        let id=options.credentialsAddToPayload;

        Model.find({[id]:request.auth.credentials[id]}).then( models => {

            if ( models.length==0 ) {
                return reply(Boom.notFound());
            }

            reply(models);

        }).catch( err=> {

            _log(err);
            reply(Boom.badImplementation(err.message));

        });
    }
}

/**
 *  Returns a handler for retrieving a single database entry
 *
 * - `options` an object with the following keys.
 *   - `model` (string) table to update
 *   - `uniqueId` A id that uniquely identifies a database entry
 *
 * @param {options|object} object with options
 * @return function(request, reply)
 * @api public
 */
function get(options) {
    return (request, reply)=> {

        debug('get', request.params);

        let Model = request.server.getModel(options.model);

        let key=options.uniqueId ? options.uniqueId : 'id';

        if (Model.definition[key].unique==undefined){

            return reply(Boom.badData('Not a unique id'))

        }

        Model.findOne({ [key]:request.params[key]}).then( models=>{

            if ( !models ) {
                return reply(Boom.notFound());
            }

            reply(models);

        }).catch( err => {

            _log(err);
            reply(Boom.badImplementation(err.message));

        });
    }
}

/**
 *  Delete a database entry
 *
 * - `options` an object with the following keys.
 *   -`uniqueId` A id that uniquely identifies a database entry
 *
 * @param {options|object} object with options
 * @return function(request, reply)
 * @api public
 */
function destroy (options) {
    return (request, reply)=> {

        let key=options.uniqueId ? options.uniqueId : 'id';

        let Model = request.server.getModel(options.model);

        if (!Model.definition[key].unique){

            return reply(Boom.badData('Not a unique id'))

        }

        debug({[key]:request.params[key]})

        Model.destroy({[key]:request.params[key]}).then((models)=>{

            if (models.length==0) return reply( Boom.notFound());

            return reply({[key]: request.params[key]}).code(200);

        }).catch( err => {

            _log(err);
            reply(Boom.badImplementation(err.message));

        });
    }
}

exports.register = function (server, options, next) {

    _log = options.log || console.error;

    server.method([
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
            name: 'handler.getByCredential',
            method: getByCredential,
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
        }]);

    next();
};

exports.register.attributes = {
    name: 'handler',
    version: '1.0.0'
};
