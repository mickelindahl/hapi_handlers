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
  - `log` Function to print out error logs

## Methods

The `handler` is attached to hapijs `server.methods`

<a name="server.methods.module_handler"></a>

## handler

* [handler](#server.methods.module_handler)
    * [~create()](#server.methods.module_handler..create) ⇒
    * [~update()](#server.methods.module_handler..update) ⇒
    * [~get()](#server.methods.module_handler..get) ⇒
    * [~destroy()](#server.methods.module_handler..destroy) ⇒

<a name="server.methods.module_handler..create"></a>

### handler~create() ⇒
Returns a handler for creating a database entry/entries with data in
 `request.payload` where request is a [hapijs request](https://hapijs.com/api#requests)
 object

- `options` an object with the following keys.
  - `model` (string) table to update
  - `ext` function handler extensions functions `function(request, models, done)`
  where request is a [hapi request](https://hapijs.com/api#requests)
  object, models is  [sails create](http://sailsjs.com/documentation/reference/waterline-orm/models/create)
  return models object and done is promise resolve should be called one completion.
    - `onPreHandler` evoked before handler
    - `onPreReply` evoked before reply. `done` shoudl be called with preferred reply payload.

**Kind**: inner method of <code>[handler](#server.methods.module_handler)</code>  
**Returns**: function(request, reply)  
**Api**: public  
<a name="server.methods.module_handler..update"></a>

### handler~update() ⇒
Returns a handler for updating a database with data in
 `request.payload` where request is a [hapijs request](https://hapijs.com/api#requests)
 object

- `options` an object with the following keys.
  - `ext` function handler extensions functions `function(request, models, done)`
  where request is a [hapijs request](https://hapijs.com/api#requests)
  object, models is  [sails create](http://sailsjs.com/documentation/reference/waterline-orm/models/create)
  return models object and done is promise resolve should be called one completion.
    - `onPreHandler` evoked before handler
    - `onPreReply` evoked before reply. `done` shoudl be called with preferred reply payload.
  -`getCriteria` function `function(request, done)` that calls done
 [waterline criteria](https://github.com/balderdashy/waterline-docs/blob/master/queries/query-language.md)
 used to update models in the database
  - `model` (string) table to update

**Kind**: inner method of <code>[handler](#server.methods.module_handler)</code>  
**Returns**: function(request, reply)  
**Api**: public  
<a name="server.methods.module_handler..get"></a>

### handler~get() ⇒
Returns a handler used to retrieve entry/entries from a database

- `options` an object with the following keys.
  - `ext` function handler extensions functions `function(request, models, done)`
  where request is a [hapi request](https://hapijs.com/api#requests)
  object, models is  [sails create](http://sailsjs.com/documentation/reference/waterline-orm/models/create)
  return models object and done is promise resolve should be called one completion.
    - `onPreHandler` evoked before handler
    - `onPreReply` evoked before reply. `done` shoudl be called with preferred reply payload.
  -`getCriteria` function `function(request, done)` that calls done
 [waterline criteria](https://github.com/balderdashy/waterline-docs/blob/master/queries/query-language.md)
 used to get models from the database
  - `model` (string) table to update

**Kind**: inner method of <code>[handler](#server.methods.module_handler)</code>  
**Returns**: function(request, reply)  
**Api**: public  
<a name="server.methods.module_handler..destroy"></a>

### handler~destroy() ⇒
Delete a database entry/entries

- `options` an object with the following keys.
  -`getCriteria` function `function(request, done)` that calls done
 [waterline criteria](https://github.com/balderdashy/waterline-docs/blob/master/queries/query-language.md)
 used to delete models in the database
  - `model` (string) table to delete entries in

**Kind**: inner method of <code>[handler](#server.methods.module_handler)</code>  
**Returns**: function(request, reply)  
**Api**: public  
## Test
`npm run-script test`

## Contributing
In lieu of a formal styleguide, take care to maintain the 
existing coding style. Add unit tests for any new or changed 
functionality. Lint and test your code.

## Release History

