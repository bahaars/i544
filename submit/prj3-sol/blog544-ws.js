import assert from 'assert';
import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import querystring, { parse } from 'querystring';

import BlogError from './blog-error.js';


const OK = 200;
const CREATED = 201;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const CONFLICT = 409;
const SERVER_ERROR = 500;

export default function serve(port, meta, model) {
  const app = express();
  app.locals.port = port;
  app.locals.meta = meta;
  app.locals.model = model;
  setupRoutes(app);
  app.listen(port, function() {
    console.log(`listening on port ${port}`);
  });
}

function setupRoutes(app) {
  app.use(cors());
  app.use(bodyParser.json());
  app.get('/',doList(app));

  app.get('/meta', doMeta(app));


  app.get('/users/:id',getObject(app,'users'));
  app.get('/articles/:id',getObject(app,'articles'));
  app.get('/comments/:id',getObject(app,'comments'));


  app.get('/users',getCategory(app,'users'));
  app.get('/articles',getCategory(app,'articles'));
  app.get('/comments',getCategory(app,'comments'));

   app.delete('/users/:id',doDelete(app,'users'));
   app.delete('/articles/:id',doDelete(app,'articles'));
   app.delete('/comments/:id',doDelete(app,'comments'));

   app.patch('/users/:id',doUpdate(app,'users'));
   app.patch('/articles/:id',doUpdate(app,'articles'));
   app.patch('/comments/:id',doUpdate(app,'comments'));


   app.post('/users',doCreate(app,'users'));
   app.post('/articles',doCreate(app,'articles'));
   app.post('/comments',doCreate(app,'comments'));
  //@TODO
}

/****************************** Handlers *******************************/
function doList(app) {
  return errorWrap(async function(req, res) {
   
    try {
     
      var obj= {

      
      "links":   [
        {
        "rel": "self",
        "name": "self",
        "url": requestUrl(req)
      },

     {
        "rel": "describedly",
        "name": "meta",
        "url": requestUrl(req) + '/' + 'meta'
      },
      {
        "rel": "collection",
        "url": requestUrl(req) + '/' + 'users',
        "name": "users"
        
      },

      {
        "rel": "collection",
        "url": requestUrl(req) + '/' + 'articles',
        "name": "articles"
        
      },

      {
        "rel": "collection",
        "url": requestUrl(req) + '/' + 'comments',
        "name": "comments"
        
      }

    ]
  }
      res.json(obj);
    }
    catch (err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });
}


function doUpdate(app,category) {
  return errorWrap(async function(req, res) {
    try {
      const patch = Object.assign({}, req.body);
      patch.id = req.params.id;
      const results = app.locals.model.update(category,patch);
      res.sendStatus(OK);
      //res.json(results);
    }
    catch(err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });
}


function doMeta(app) {
  return errorWrap(async function(req, res) {
    
    try {
      const results = await app.locals.meta;
      
      results.links= [{
        "rel": "self",
        "name": "self",
        "href": requestUrl(req)

      }]
      
      res.json(results);
    }
    catch (err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });
}


function doCreate(app,category) {
  return errorWrap(async function(req, res) {
    try {
      const obj = req.body;
      const results = await app.locals.model.create(category,obj);
      res.append('Location', requestUrl(req) + '/' + obj.id);
      res.sendStatus(CREATED);
    }
    catch(err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });
}


function getObject(app,category) {
  return errorWrap(async function(req, res) {
    try {
      const id = req.params.id;
     // console.log(id);
      const results = await app.locals.model.find(category,{ id: id });
      
      
      results[0].links= [{
        "rel": "self",
        "name": "self",
        "href": requestUrl(req)

      }]
    
     res.json(results);
     
    }
    catch(err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });
}



function getCategory(app,category) {
  return errorWrap(async function(req, res) {
    try {
     // const query = req.query.q;
      const q = req.query || {};
      
      //req.query._count=parseInt(req.query._count)+1;
      const results = await app.locals.model.find(category,q);
      const max = results.length;
     //console.log(max);
     //console.log(req.query._count);
     var count=0;
      const skip_count=req.query._index ? req.query._index  : 0;
    
    if(req.query._count !== "" && req.query._count !== undefined)
     count = parseInt(req.query._count);
     else
      count = DEFAULT_COUNT; 

     for(let i=0;i<max;i++)
     {
      results[i].links= [{
        "rel": "self",
        "name": "self",
        "href": requestUrl(req) + '/' + results[i].id
      }]
     }
   // console.log('before json');
     res.json({
       [category]: results,
       links: paginationLinks(
         requestUrl(req),
         parseInt(skip_count),
         parseInt(count),
         max
        )
     });
     
     
    }
    catch(err) {
      const mapped = mapError(err);
      
      res.status(mapped.status).json(mapped);
    }
  });
}

// Prev, Current, Next - types of pagination links
function paginationLinks(url, index, count, maxCount) {
  let nextIdx = index + count,
      prevIdx = index - count;
  let retVal = [
    {
      "rel": "self",
      "name":"self",
      "url": url + `?_count=${count}&_index=${index}`
    },
  ];
//console.log(maxCount);
//console.log(count);
  if (count <= maxCount) {
    
    retVal.push(
      {
        "rel": "next",
        "name":"next",
        "url": url + `?_count=${count}&_index=${nextIdx}`
      },
    );
  }
  if (prevIdx >= 0)
    retVal.push(
      {
        "rel": "prev",
        "name":"prev",
        "url": url + `?_count=${count}&_index=${prevIdx}`
      }
    );
    return retVal;
}






function doDelete(app,category) {
  return errorWrap(async function(req, res) {
    try {
      const id = req.params.id;
      const results = await app.locals.model.remove(category,{ id: id });
      res.sendStatus(OK);
    }
    catch(err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });
}







//@TODO

/**************************** Error Handling ***************************/

/** Ensures a server error results in nice JSON sent back to client
 *  with details logged on console.
 */ 
function doErrors(app) {
  return async function(err, req, res, next) {
    res.status(SERVER_ERROR);
    res.json({ code: 'SERVER_ERROR', message: err.message });
    console.error(err);
  };
}

/** Set up error handling for handler by wrapping it in a 
 *  try-catch with chaining to error handler on error.
 */
function errorWrap(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    }
    catch (err) {
      next(err);
    }
  };
}

const ERROR_MAP = {
  BAD_CATEGORY: NOT_FOUND,
  EXISTS: CONFLICT,
}

/** Map domain/internal errors into suitable HTTP errors.  Return'd
 *  object will have a "status" property corresponding to HTTP status
 *  code.
 */
function mapError(err) {
  console.error(err);
  return (err instanceof Array && err.length > 0 && err[0] instanceof BlogError)
    ? { status: (ERROR_MAP[err[0].code] || BAD_REQUEST),
	code: err[0].code,
	message: err.map(e => e.message).join('; '),
      }
    : { status: SERVER_ERROR,
	code: 'INTERNAL',
	message: err.toString()
      };
} 

/****************************** Utilities ******************************/

/** Return original URL for req (excluding query params)
 *  Ensures that url does not end with a /
 */
function requestUrl(req) {
  const port = req.app.locals.port;
  const url = req.originalUrl.replace(/\/?(\?.*)?$/, '');
  return `${req.protocol}://${req.hostname}:${port}${url}`;
}


const DEFAULT_COUNT = 5;

//@TODO
