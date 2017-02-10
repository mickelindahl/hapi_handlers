/**
 * Created by Mikael Lindahl on 2016-12-26.
 */

'use strict';

const code = require( "code" );
const debug = require( 'debug' )( 'hapi_handlers:lib/test/index' );
const Lab = require( "lab" );
const path = require( 'path' );
const serverPromise = require( './test_server.js' );

let lab = exports.lab = Lab.script();

let options = {
    model: 'test'

};

// Mock a request
let request = {

    auth: {
        credentials: {
            user: 123
        }
    },

    payload: {
        'stuff': 1,
    },
};


// The order of tests matters!!!
lab.experiment( "hapi handlers", ()=> {

    lab.test( 'Test create with credentials to add', normal('create'));

    //lab.test( 'Test create without credentials to add', normal('create', 'without'));
    //
    lab.test( 'Test create throw error', throwError( 'create' ));
    //
    lab.test( 'Test update', normal('update'));
    //
    //lab.test( 'Test update throw error with other unique id', throwError( 'update' ));
    //
    //lab.test( 'Test get not a unique id',notAUniqueId('update') );
    //
    //lab.test( 'Test getByCredential', normal('getByCredential'));
    //
    //lab.test( 'Test getByCredential not found', notFound('getByCredential'));
    //
    //lab.test( 'Test getByCredential throw error one',throwError('getByCredential') );
    //
    //lab.test( 'Test getByCredential', normal('getByCriteria'));
    //
    //lab.test( 'Test getByCredential empty object', normal('getByCriteria', 'empty'));
    //
    //lab.test( 'Test get not found', notFound('getByCriteria'));
    //
    //lab.test( 'Test get throw error one',throwError('getByCriteria') );
    //
    //lab.test( 'Test get', normal('get'));
    //
    //lab.test( 'Test get not found', notFound('get'));
    //
    //lab.test( 'Test get throw error one',throwError('get') );
    //
    //lab.test( 'Test get not a unique id',notAUniqueId('get') );
    //
    //lab.test( 'Test delete', normal('delete'));
    //
    //lab.test( 'Test delete not found', notFound('delete'));
    //
    //lab.test( 'Test delete throw error one', throwError('delete') );
    //
    //lab.test( 'Test delete not a unique id', notAUniqueId('delete'))

} );

function normal(handlerKey, flag){

    return ( done ) => {

        //options.getCredentials=(request)=>{return {user:request.auth.credentials.user}};
        options.getCriteria= (request, done)=>{done({user:'123'})};
        //options.uniqueId = 'id';

        options.onPreHandler=(request, done)=>{done()};
        options.onPreReply=(request, models, done)=>{ done(models) };

        request.params = { id: 1 };
        request.payload={stuff:2, id:1};

        let reply;
        if (handlerKey=='delete'){
            reply = (model)=> {
                code.expect( model.id ).to.equal( 1 );
                return {
                    code: ( number )=> {
                        code.expect( number ).to.equal( 200 );
                        request.server.app.adapter.teardown( done ); // fails otherwise
                    }
                }
            };
        }
        if (handlerKey=='get'){
            reply=(model)=>{

                code.expect(model.user).to.equal('123');
                request.server.app.adapter.teardown( done ); // fails otherwise

            };
        }
        if (handlerKey=='getByCredential'){
            reply=(model)=>{

                code.expect(model[0].user).to.equal('123');
                request.server.app.adapter.teardown( done ); // fails otherwise

            };
        }

        if (handlerKey=='getByCriteria'){
            reply=(model)=>{

                debug('getByCriteria', model);

                code.expect(model[0].user).to.equal('123');
                request.server.app.adapter.teardown( done ); // fails otherwise

            };
        }
        if(handlerKey=='update'){
            options.onPreReply=(request, models, done)=>{ done(models[0]) };
            reply=(model)=>{

                code.expect(model.stuff).to.equal('2');
                request.server.app.adapter.teardown( done ); // fails otherwise

            };
        }
        if(handlerKey=='create') {
            reply = ()=> {
                return {
                    code: ( number )=> {
                        delete options.onPreHandler;
                        delete options.onPreReply;

                        code.expect( number ).to.equal( 201 );
                        request.server.app.adapter.teardown( done ); // fails otherwise
                    }
                }
            };

            if (flag=='without'){

                delete options.credentialsAddToPayload

            } else if (flag=='empty'){

                options.credentials={}

            }
        }

        serverPromise( options ).then( server => {

            request.server = server;

            server.getModel( 'test' ).create( { stuff: 1, user: 123 } ).then( ()=> {

                let call = server.methods.handler[handlerKey]( options );

                call( request, reply );

            } )

        } )
    }
}

function notFound(handlerKey){
    return ( done ) => {

        options.uniqueId='id';
        request.params={id:1};

        let reply=(error)=>{

            code.expect(error.message).to.equal('Not Found');
            request.server.app.adapter.teardown( done ); // fails otherwise

        };

        serverPromise( options ).then( server => {

            request.server = server;

            let call=server.methods.handler[handlerKey](options);

            call(request, reply);

        } )
    }
}

function throwError(handlerKey){

    return done  => {

        delete options.uniqueId;
        request.params={ user:'123'};
        //         options.credentialsAddToPayload='user';

        let reply=(error)=>{

            code.expect(error.message).to.equal('error');
            request.server.app.adapter.teardown( done ); // fails otherwise

        };

        serverPromise( options ).then( server => {

            request.server = server;

            server.getModel('test').create({stuff:1, user:123}).then(()=>{

                server.getModel=()=>{
                    return {

                        create:()=>{return Promise.reject({message:'error'})},
                        destroy:()=>{return Promise.reject({message:'error'})},
                        findOne:()=>{return Promise.reject({message:'error'})},
                        find:()=>{return Promise.reject({message:'error'})},
                        update:()=>{return Promise.reject({message:'error'})},
                        definition:{id:{unique:true}, user:{unique:true}}
                    }
                };

                let call=server.methods.handler[handlerKey]();

                call(request, reply);

            })

        } )
    }
}

function notAUniqueId(handlerKey){
    return  done  => {

        options.log=console.error;
        options.uniqueId='stuff';
        request.params={ id:1};

        let reply=(error)=>{

            code.expect(error.message).to.equal('Not a unique id');
            request.server.app.adapter.teardown( done ); // fails otherwise

        };

        serverPromise( options ).then( server => {

            request.server = server;

            server.getModel('test').create({stuff:1, user:123}).then(()=>{

                let call=server.methods.handler[handlerKey](options);

                call(request, reply);

            })

        } )
    } ;

}


