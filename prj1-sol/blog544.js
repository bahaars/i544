// -*- mode: JavaScript; -*-

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

  constructor(meta, options) {
    //@TODO
    this.mapUsers={};
    this.mapArticles={};
    this.mapComments={};
    this.masterData = {
      'users': this.mapUsers,
      'articles': this.mapArticles,
      'comments': this.mapComments
    };
    this.objReferences = {
      'users': {},
      'articles': {},
      // 'comments': {}
    };
    this.meta = meta;
    this.options = options;
    this.validator = new Validator(meta);
  }

  static async make(meta, options) {
    //@TODO
    return new Blog544(meta, options);
  }

  /** Remove all data for this blog */
  async clear() {
    //@TODO
    
   this.mapUsers={};
    this.mapArticles={};
    this.mapComments={};
    this.masterData={};
     this.objReferences = {
      'users': {},
      'articles': {},
      // 'comments': {}
    };
  }

  debug(varName) {
    // console.log(eval.bind(this)(varName.id));
    console.log(JSON.stringify(this.objReferences.comments[varName.id]));
  }

  /** Create a blog object as per createSpecs and
   * return id of newly created object
   */
  async create(category, createSpecs) {
   // console.log('category', category);
    const obj = this.validator.validate(category, 'create', createSpecs);
    if(category=='users')
    {
        this.mapUsers[obj.id] = obj;
        //console.log(obj);
        //console.log(this.mapUsers.get(obj.id));
        return obj.id;
  }
  else if(category=='articles')
    {
        if (!('id' in obj)) {
          obj.id = (Math.random() * 1000).toFixed(4);
        }
        if (!(obj['authorId'] in this.objReferences['users']))
          this.objReferences['users'][obj['authorId']] = {articles: {id:'authorId', keys:[]}, comments: {id:'commenterId', keys:[]}};

        this.objReferences['users'][obj['authorId']]['articles'].keys.push(obj.id);
        this.mapArticles[obj.id] = obj;
        return obj.id;
  }

  else if(category=='comments')
    {
        if (!('articleId' in createSpecs)) {
          console.log("ERROR: No articleId was provided");
          return null;
        }
        if (!('id' in obj)) {
          obj.id = (Math.random() * 1000).toFixed(4);
        }

        if (!(obj['authorId'] in this.objReferences['users']))
          this.objReferences['users'][obj['commenterId']] = {articles: {id:'authorId', keys:[]}, comments: {id:'commenterId', keys:[]}};
        if (!(obj['articleId'] in this.objReferences['articles']))
          this.objReferences['articles'][obj['articleId']] = {comments: {id: 'articleId', keys: []}};
        // if (!(obj['commentId'] in this.objReferences['comments']))
        //   this.objReferences['comments'][obj.id] = {articles: {id: 'commentId', keys: []}};

        // this.mapArticles[createSpecs['articleId']]['commentsId'] = obj.id;
        this.objReferences['users'][obj['commenterId']]['comments'].keys.push(obj.id);
        this.objReferences['articles'][obj['articleId']]['comments'].keys.push(obj.id);
        // this.objReferences['comments'][obj.id]['articles'].keys.push(obj.articleId);
        this.mapComments[obj.id] = obj;

        return obj.id;
      }
    }

  /** Find blog objects from category which meets findSpec.  Returns
   *  list containing up to findSpecs._count matching objects (empty
   *  list if no matching objects).  _count defaults to DEFAULT_COUNT.
   */
  async find(category, findSpecs={}) {
    const obj = this.validator.validate(category, 'find', findSpecs);
    //@TODO
    //console.log(obj);
      // console.log(this.mapUsers.get(findSpecs.id));
       //console.log(category);

       //console.log(findSpecs);
     //  console.log(findSpecs.id);


      let retVal = [];
       if(findSpecs)
       {
          let obj = this.masterData[category];
          for (let id in obj) {
            let isMatch = true;
            for (let key in findSpecs) {
              if (obj[id][key] !== findSpecs[key]) {
                isMatch = false;
                break;
              }
            }
            if (isMatch)
              retVal.push(obj[id]);
          }
          // return  Object.entries(this.masterData[category]).filter(
          //       (item) => {
          //         for (let key in findSpecs) {
          //           if (item[1][key] !== findSpecs[key])
          //             return false;
          //         }
          //         return true;
          //       }
          //     ).map(item => item[1]);
       }
    return retVal;
  }

  objReference(category, id) {
    if (id in this.objReferences[category]) {
      let retVal = [];
      for (let key in this.objReferences[category][id]) {
        retVal.push([ category, id, this.objReferences[category][id][key].id, key, this.objReferences[category][id][key].keys.join(', ') ]);
      }
      return retVal;
    } else return null;
  }

  /** Remove up to one blog object from category with id == rmSpecs.id. */
  async remove(category, rmSpecs) {
    const rmObj = this.validator.validate(category, 'remove', rmSpecs);
    //@TODO
    let obj = this.masterData[category];
    if ('id' in rmSpecs)
      if (rmSpecs['id'] in obj) {
        let obRef;
        if (!(obRef = this.objReference(category, rmSpecs['id']))) {
          delete obj[rmSpecs['id']];
          console.log("It's gone");
          return true;
        } else {
          for (let o of obRef)
            console.log("BAD_ID: %s %s is referenced by %s for %s %s", ...o);
          return false;
        }
      }
    else {
      console.log("Please provide appropriate ID");
    }
  }

  /** Update blog object updateSpecs.id from category as per
   *  updateSpecs.
   */
  async update(category, updateSpecs) {
    const obj = this.validator.validate(category, 'update', updateSpecs);
    //@TODO
  }
 
}

const DEFAULT_COUNT = 5;

//You can add code here and refer to it from any methods in Blog544.

