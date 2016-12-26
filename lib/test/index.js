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
    model: 'test',
    credentialsAddToPayload: ['user']
};


// Mock a request
let request={

    auth:{
      credentials:{
          user:123
      }
    },

    payload:{
        'stuff':1,
    },
};



// The order of tests matters!!!
lab.experiment( "hapi handlers", ()=> {

    // lab.test( 'Test create with credentials to add',
    //     ( done ) => {
    //
    //         let reply=()=>{
    //             return {
    //                 code:(number)=>{
    //                     code.expect(number).to.equal(201);
    //                     _server.app.adapter.teardown( done ); // fails otherwise
    //                 }
    //             }
    //         };
    //
    //         serverPromise( options ).then( server => {
    //
    //             _server=server;
    //             request.server = server;
    //
    //             let create=server.methods.handler.create(options);
    //
    //             create(request, reply);
    //
    //         } ).catch(err=>{
    //
    //             debug(err)
    //
    //         })
    //     } );
    //
    // lab.test( 'Test create without credentials to add',
    //     ( done ) => {
    //
    //         delete options.credentialsAddToPayload
    //
    //         let reply=(error)=>{
    //
    //             code.expect(error.message).to.equal('error');
    //             _server.app.adapter.teardown( done ); // fails otherwise
    //
    //         };
    //
    //         serverPromise( options ).then( server => {
    //
    //             _server=server;
    //             let getModel=server.getModel;
    //             server.getModel=()=>{
    //                 return {
    //                     create:()=>{return Promise.reject({message:'error'})}
    //                 }
    //             };
    //
    //             request.server = server;
    //
    //             let create=server.methods.handler.create(options);
    //
    //             create(request, reply);
    //
    //         } )
    //     } );

    // lab.test( 'Test update',
    //     ( done ) => {
    //
    //         request.payload={stuff:2, id:1};
    //
    //         let reply=(model)=>{
    //
    //             code.expect(model.stuff).to.equal('2');
    //             request.server.app.adapter.teardown( done ); // fails otherwise
    //
    //         };
    //
    //         serverPromise( options ).then( server => {
    //
    //             request.server = server;
    //
    //             server.getModel('test').create({stuff:1}).then(()=>{
    //
    //                 let update=server.methods.handler.update(options);
    //
    //                 update(request, reply);
    //
    //             })
    //
    //         } ).catch(err=>{
    //
    //             debug(err)
    //
    //         })
    //     } );
    //
    // lab.test( 'Test update throw error with other unique id',
    //     ( done ) => {
    //
    //         request.payload={stuff:2, id:1};
    //
    //         let reply=(error)=>{
    //
    //             code.expect(error.message).to.equal('error');
    //             request.server.app.adapter.teardown( done ); // fails otherwise
    //
    //         };
    //
    //         options.id='user';
    //
    //         serverPromise( options ).then( server => {
    //
    //             request.server = server;
    //
    //             server.getModel('test').create({stuff:1}).then(()=>{
    //
    //                 server.getModel=()=>{
    //                     return {
    //                         update:()=>{return Promise.reject({message:'error'})}
    //                     }
    //                 };
    //
    //                 let update=server.methods.handler.update(options);
    //
    //                 update(request, reply);
    //
    //             })
    //
    //         } ).catch(err=>{
    //
    //             debug(err)
    //
    //         })
    //     } );

    lab.test( 'Test get by credentials',
        ( done ) => {

            options.credentialsAddToPayload='user'
            request.params={stuff:2, id:1};

            let reply=(model)=>{

                code.expect(model[0].user).to.equal('123');
                request.server.app.adapter.teardown( done ); // fails otherwise

            };

            serverPromise( options ).then( server => {

                request.server = server;

                server.getModel('test').create({stuff:1, user:123}).then(()=>{

                    let get=server.methods.handler.getByCredential(options);

                    get(request, reply);

                })

            } ).catch(err=>{

                debug(err)

            })
        } );
});