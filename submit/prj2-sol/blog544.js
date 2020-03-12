
// -*- mode: JavaScript; -*-

import mongo from 'mongodb';

import BlogError from './blog-error.js';
import Validator from './validator.js';

//debugger; //uncomment to force loading into chrome debugger

/**
A blog contains users, articles and comments.  Each user can have
multiple Role's from [ 'admin', 'author', 'commenter' ]. An author can
create/update/remove articles.  A commenter can comment on a specific
article.

Errors
======

DB:
  Database error

BAD_CATEGORY:
  Category is not one of 'articles', 'comments', 'users'.

BAD_FIELD:
  An object contains an unknown field name or a forbidden field.

BAD_FIELD_VALUE:
  The value of a field does not meet its specs.

BAD_ID:
  Object not found for specified id for update/remove
  Object being removed is referenced by another category.
  Other category object being referenced does not exist (for example,
  authorId in an article refers to a non-existent user).

EXISTS:
  An object being created already exists with the same id.

MISSING_FIELD:
  The value of a required field is not specified.

*/

export default class Blog544 {

  constructor(meta, options,client,db) {
    //@TODO
    this.meta = meta;
    this.options = options;
    this.validator = new Validator(meta);
    this.client=client;
    this.db=db;
    this.usersCollection=this.db.collection('users');
     this.articlesCollection=this.db.collection('articles');
     this.commentsCollection=this.db.collection('comments');
  }

  /** options.dbUrl contains URL for mongo database */
  static async make(meta, options) {
    //@TODO
    //this.url=options.dbUrl;
    this.dbName="Project2";

    //options.client=await mongo.connect(this.url,MONGO_CONNECT_OPTIONS);
    //options.db=options.client.db(this.dbName);



     const client = await mongo.connect(options.dbUrl,MONGO_CONNECT_OPTIONS);
    const db = client.db(this.dbName);
    return new Blog544(meta, options,client,db);
  }

  /** Release all resources held by this blog.  Specifically, close
   *  any database connections.
   */
  async close() {
    //@TODO
    this.client.close();
  }

  /** Remove all data for this blog */
  async clear() {
    //@TODO
    await this.db.collection('users').deleteMany({});
    await this.db.collection('articles').deleteMany({});
    await this.db.collection('comments').deleteMany({});
  }

  /** Create a blog object as per createSpecs and 
   * return id of newly created object 
   */
  async create(category, createSpecs) {
    const obj = this.validator.validate(category, 'create', createSpecs);
    //@TODO
    if(category==='users')
    {


   const userDetails =Object.assign({_id:obj.id},obj);
    //delete userDetails.id;
   const usersCollection=this.db.collection('users');
   // const dbTable = this.db.collection(USERS_TABLE);

   const ret=await usersCollection.insertOne(userDetails);
     
     }

    else if(category==='articles')
     {
      if (obj.id=== undefined) {
          obj.id = (Math.random() * 1000).toFixed(4);
        }
        const articlesDetails=Object.assign({_id:obj.id},obj);
        //delete articlesDetails.id;
        const articlesCollection=this.db.collection('articles');
        const ret=await articlesCollection.insertOne(articlesDetails);
     }
else if(category==='comments')
{
if (obj.id === undefined) {
          obj.id = (Math.random() * 1000).toFixed(4);
        }

        const commentsDetails=Object.assign({_id:obj.id},obj);
         //delete commentsDetails.id;
        const commentsCollection=this.db.collection('comments');
        const ret=await commentsCollection.insertOne(commentsDetails);
}


  return obj.id;
  }

  /** Find blog objects from category which meets findSpec.  
   *
   *  First returned result will be at offset findSpec._index (default
   *  0) within all the results which meet findSpec.  Returns list
   *  containing up to findSpecs._count (default DEFAULT_COUNT)
   *  matching objects (empty list if no matching objects).  _count .
   *  
   *  The _index and _count specs allow paging through results:  For
   *  example, to page through results 10 at a time:
   *    find() 1: _index 0, _count 10
   *    find() 2: _index 10, _count 10
   *    find() 3: _index 20, _count 10
   *    ...
   *  
   */
  async find(category, findSpecs={}) {
    const obj = this.validator.validate(category, 'find', findSpecs);
    //@TODO
    //console.log(findSpecs);
    let ret= [];
    //const usersCollection=this.db.collection('users');
    //const articlesCollection=this.db.collection('articles');
    //const commentsCollection=this.db.collection('comments');
    if(category==='users')
    {

      const count =findSpecs._count ? findSpecs._count  : DEFAULT_COUNT;
      const skip_count=findSpecs._index ? findSpecs._index  : 0;
      //const obj= findSpecs;

      delete findSpecs._count; 
      delete findSpecs._index; 

      //console.log(findSpecs);
       if(findSpecs.creationTime)
       {
      //   //ret=await this.usersCollection.find(findSpecs).sort({creationTime:-1}).({'creationTime' : {$lte : findSpecs.creationTime}}).limit(Number(count)).skip(Number(skip_count)).toArray();
      
       ret= await this.usersCollection.find({'creationTime': {$lte : new Date(findSpecs.creationTime)}}).sort({creationTime:-1}).limit(Number(count)).skip(Number(skip_count)).toArray();
      }

      
      
       else

        ret= await this.usersCollection.find(findSpecs).sort({creationTime:-1}).limit(Number(count)).skip(Number(skip_count)).toArray();
}

      if(category==='articles')
    {

      const count =findSpecs._count ? findSpecs._count  : DEFAULT_COUNT;
      const skip_count=findSpecs._index ? findSpecs._index  : 0;

      delete findSpecs._count; 
      delete findSpecs._index; 

      //console.log(findSpecs);

      if(findSpecs.creationTime)
       {
      //   //ret=await this.usersCollection.find(findSpecs).sort({creationTime:-1}).({'creationTime' : {$lte : findSpecs.creationTime}}).limit(Number(count)).skip(Number(skip_count)).toArray();
      
       ret= await this.articlesCollection.find({'creationTime': {$lte : new Date(findSpecs.creationTime)}}).sort({creationTime:-1}).limit(Number(count)).skip(Number(skip_count)).toArray();
      }

      else

        ret= await this.articlesCollection.find(findSpecs).sort({creationTime:-1}).limit(Number(count)).skip(Number(skip_count)).toArray();
}


      if(category==='comments')
    {

      const count =findSpecs._count ? findSpecs._count  : DEFAULT_COUNT;
      const skip_count=findSpecs._index ? findSpecs._index  : 0;

      delete findSpecs._count; 
      delete findSpecs._index; 
      if(findSpecs.creationTime)
       {
     
      
       ret= await this.commentsCollection.find({'creationTime': {$lte : new Date(findSpecs.creationTime)}}).sort({creationTime:-1}).limit(Number(count)).skip(Number(skip_count)).toArray();
      }

      else
      
      
        ret= await this.commentsCollection.find(findSpecs).sort({creationTime:-1}).limit(Number(count)).skip(Number(skip_count)).toArray();
}



   
  
   return (ret.length > 0)? ret: [];
}
  /** Remove up to one blog object from category with id == rmSpecs.id. */
  async remove(category, rmSpecs) {
    const obj = this.validator.validate(category, 'remove', rmSpecs);
    let ret=0;
    let findValue=0;
    let x = 0;
    let y = 0;
    //debugger;
    if(category==='users')
    {
          findValue=await this.find('users',rmSpecs);
          if(findValue)
          {
            x = await this.find('articles', {authorId:findValue.id});
            y = await this.find('comments', {commenterId:findValue.id});
              if(x||y)
              {
                throw new BlogError('BAD','This user is associated with articles or comments'); 
              }
              else{
            ret = await this.usersCollection.deleteOne(rmSpecs);

              }
            
          }
         

    }

    if(category==='articles')
    findValue=await this.find('articles',rmSpecs);
          if(findValue)
          {
           // x = await this.find('articles', {authorId:findValue.id});
            y = await this.find('comments', {commenterId:findValue.authorId});
              if(y)
              {
                throw new BlogError('BAD','This user is associated with comments'); 
              }
              else{
            ret = await this.articlesCollection.deleteOne(rmSpecs);

              }
            
          }
         
if(category==='comments')
    {
        
         ret = await this.commentsCollection.deleteOne(rmSpecs);

    }

  //return ret;
   
    //@TODO
  }

  /** Update blog object updateSpecs.id from category as per
   *  updateSpecs.
   */
  async update(category, updateSpecs) {
    const obj = this.validator.validate(category, 'update', updateSpecs);
    //@TODO
    delete obj.id;
    const findValue = await this.find(category,{id:updateSpecs.id});
    if(findValue.length>0)
    {


    if(category==='users')
    {
          
          await this.usersCollection.updateOne({id:updateSpecs.id},{$set: obj});
         

    }

if(category==='articles')
    {
          
          await this.articlesCollection.updateOne({id:updateSpecs.id},{$set: obj});
         

    }

if(category==='comments')
    {
          
          await this.commentsCollection.updateOne({id:updateSpecs.id},{$set: obj});
         

    }
    
    console.log("record updated.");
}
else
{
  throw new BlogError('BAD ID','This doesnot exist'); 
}


  }
}
  


const DEFAULT_COUNT = 5;

const MONGO_CONNECT_OPTIONS = { useUnifiedTopology: true };
