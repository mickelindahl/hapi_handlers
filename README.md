[![Build Status](https://travis-ci.org/mickelindahl/hapi_waterline_handlers.svg?branch=master)](https://travis-ci.org/mickelindahl/hapi_waterline_handlers)
[![Coverage Status](https://coveralls.io/repos/github/mickelindahl/hapi_waterline_handlers/badge.svg?branch=master)](https://coveralls.io/github/mickelindahl/hapi_waterline_handlers?branch=master)
# Hapi waterline handlers

A [hapi](https://www.npmjs.com/package/hapi) with that makes a couple of useful 
handlers for updating a database through 
[hapi-waterline](https://www.npmjs.com/package/hapi-waterline) OCR
available to the server. 

## Installation
npm install --save hapi-waterline-handlers

## Usage
```js
'use strict'

const Hapi = require( 'hapi' );

const server = new Hapi.Server( { port: 3000 } );

server.register( {
    register: require( 'hapi-waterline-handlers' ),
    options: { 
        log: console.error
    }
}).then(()=>{

    server.route([
        {
         method: 'POST',
         path:'/test/create',
         handler: server.methods.handler.create({model:'test'}),
        }
    ])
   
});
```

- `options` Object or list of objects with the following keys
  - `status_code` Function to print out error logs
  
## Methods

### `create(options)`
Returns a handler for creating a database entry

- `options` an object with the following keys.
  - `credentialAddToPayload` A credential key to
  - `model` (string) table to update
   add to payload at creation.

### `update(options)`
Returns a handler for updating a database entry
 
- `options` an object with the following keys.
  - `model` (string) table to update
  - `uniqueId` A id that uniquely identifies a database entry
 
###`getByCredential(options)`
Returns a handler for retrieving all entries belonging to a credential key
 
- `options` an object with the following keys.
  - `credentialAddToPayload` A credential key to add to payload at creation.
  - `model` (string) table to update

###`get(options)`
Returns a handler for retrieving a single database entry
 
- `options` an object with the following keys.
  - `model` (string) table to update
  - `uniqueId` A id that uniquely identifies a database entry
 
### `delete(options)`
Returns a handler for deleting a single a database entry

- `options` an object with the following keys.
  - `uniqueId` A id that uniquely identifies a database entry
 
## Test
`npm run-script test`

## Contributing
In lieu of a formal styleguide, take care to maintain the 
existing coding style. Add unit tests for any new or changed 
functionality. Lint and test your code.

## Release History

