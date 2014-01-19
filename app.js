var restify = require('restify');

var mongodb = require('mongodb');

//var MONGOHQ_URL="mongodb://localhost/yandv";


// Setting the mongo client to a global variable so that it is 
// accessible everywhere
var globalClient;

mongodb.Db.connect(MONGOHQ_URL, function(error, client) {  
		if (error) {
			throw error;
		}
		else {
			globalClient = client;
		}
});



function respondAllMessages(req , res , next) {
	findMessages(null, function(docs) {
		res.send(docs);
	})
}

function respondMessageById(req , res , next) {
	findMessages(req.params.id, function(doc) {
		res.send(doc);
	})
}

function respondPostMessage(req,res,next) {
	// console.log(req.body);
	
	insertMessage(req.body.message,req.body.author,function(){
		res.send("ok");		
	})
}

function respondStatus(req,res,next) {
	res.send({date : new Date(),
		status : 'ok'});
}

// Creating rest server
var server = restify.createServer();
server.use(restify.bodyParser({ mapParams: false }));
// Allow Cross Origin Requests
server.use(restify.CORS());
server.use(restify.fullResponse());

// routes definition

// Get Routes
server.get('/messages/', respondAllMessages);
server.get('/message/:id', respondMessageById);
server.get('/status',respondStatus);

// Post routes
 server.post('/message/', respondPostMessage);

// Let that server run
server.listen(process.env.PORT || 5000, function() {
  console.log('%s listening at %s', server.name, server.url);
});


function findMessages(id,callback){
	globalClient.collection("messages" , function(error,collection){
		if(error) throw error;

		if(id !== null) {

			 collection.findOne({"_id": new mongodb.ObjectID(id)} , function(error,doc){
				if(error) throw error;

				if(doc === null) {
					console.log("unknown ID");
					doc = {error : "unknown ID"};
				}
				callback(doc);

			});
		}
		else {
			collection.find().toArray(function(error,docs){
				if(error) throw error;

				if(docs === null) {
					console.log("Collection is empty")					
				}

				callback(docs);

			});
		}
	});
}

function insertMessage(message, author,callback){
	globalClient.collection("messages", function(error,collection){
		if (error) throw error;
		var abstract = message.substring(0,60);
		collection.insert({"author":author.capitalize(), "message":message, "abstract":abstract,"createdDate":new Date()},function(err,result){
			//console.log(result);
            if(err) throw err;

            callback();
          });

	});	
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
