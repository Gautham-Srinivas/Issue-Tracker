/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.MONGOLAB_URI; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
      var findQuery = req.query;
    if(findQuery._id) {
      findQuery._id = new ObjectId(findQuery._id) 
    }
    if(findQuery.open) {
      findQuery.open = new String(findQuery.open) == "true" 
    }
    MongoClient.connect(CONNECTION_STRING, function(err, db) {
      if (err) throw err;
      var collection = db.collection(project);
      collection.find(findQuery).toArray(function(err, result) {
        console.log(result)
        if (err) throw err;
        res.json(result)
  });
}); 
    })
    
    .post(function (req, res){
      var project = req.params.project;
      var issue ={ 
        issue_title:req.body.issue_title, 
        issue_text:req.body.issue_text,
        created_by:req.body.created_by, 
        assigned_to:req.body.assigned_to || '',
        status_text: req.body.status_text || '',
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      }
      
      if(!issue.issue_title || !issue.issue_text || !issue.created_by){
        res.send('missing inputs')
      }else{
        MongoClient.connect(CONNECTION_STRING, function(err, db) {
        var collection = db.collection(project);
          collection.insertOne(issue,function(err,doc){
             if (err) throw err;
            issue._id = doc.insertedId;
            res.json(issue);
          });
        });
      }
      
    })
    
    .put(function (req, res){
      var project = req.params.project;
      var issue = req.body._id;
      delete req.body._id;
      var update = req.body;
    for (var val in update) { if (!update[val]) { delete update[val] } }
      if (update.open) { update.open = String(update.open) == "true" }
    if (Object.keys(update).length === 0) {
        res.send('no updated field sent');
      } else {
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        var collection = db.collection(project);
          collection.findAndModify({_id:new ObjectId(issue)},[['_id','asc']],{$set:update},{new: true},function(err,doc){
             if (err) throw res.send('could not update '+issue+' '+err);
            res.send('successfully updated');
          });
        });
      }
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      var issue = req.body._id;
      
      if(!issue){
        res.send('_id error')
      }else{
        MongoClient.connect(CONNECTION_STRING, function(err, db) {
        var collection = db.collection(project);
          collection.findAndRemove({_id:new ObjectId(issue)},function(err,result){
             if (err) throw res.send('could not delete '+issue+' '+err);
            res.send('deleted '+issue)   
          });
    });
        }
    
    });
};
