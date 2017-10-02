const {mongoose} = require('./db/mongoose');
var {User} = require('./models/user'); 
var {Todo} = require('./models/todo'); 
const bodyParser = require('body-parser');
const express = require('express');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
const {authenticate} = require('./middlewares/authenticate');

var port = process.env.PORT || 3000;

var app = express();

app.use(bodyParser.json());



app.get('/users/info', authenticate, (req, res)=>{
	res.send(req.user);
});

app.post('/users/signup',(req, res)=>{

	var body = _.pick(req.body, ['email','password']);

	var user = new User(body);

	user.save()
	.then(()=>{
		return user.generateAuthToken();
	})
	.then((token)=>{
		res.header('x-auth', token).status(200).send(user);
	})
	.catch((e)=>{
		res.status(400).send(e);
	});
});

app.post('/todos',authenticate ,(req, res)=>{

	var todo = new Todo({
		text: req.body.text,
		_creator: req.user._id
	});

	todo.save()
	.then((docs)=>{
		res.status(200).send(docs);
	})
	.catch((e)=>{
		res.status(400).send(e);
	});
});

app.post('/users/login', (req, res)=>{
	var body =  _.pick(req.body,['email','password']);
	User.findByCredentials(body.email,body.password)
		.then((user)=>{
			return user.generateAuthToken().then((token)=>{
				res.header('x-auth', token).status(200).send(user);
			});
		})
		.catch((e)=>{
			res.status(401).send({
				error:'email and password don\'t match'
			});
		});
});

app.delete('/users/logout',authenticate , (req, res)=>{
	req.user.removeToken(req.token)
		.then((user)=>{
			res.status(200).send(user);
		})
		.catch((e)=>{
			res.status(400).send(e);
		});
});

// app.get('/del',(req, res)=>{
// 	User.remove({})
// 	.then((users)=>{
// 		res.status(200).send({users});
// 	})
// 	.catch((e)=>{
// 		res.status(400).send(e);
// 	});
// });

// app.get('/all',(req, res)=>{
// 	User.find({})
// 	.then((users)=>{
// 		res.status(200).send({users});
// 	})
// 	.catch((e)=>{
// 		res.status(400).send(e);
// 	});
// });

app.get('/todos',authenticate ,(req, res)=>{

	Todo.find({_creator:req.user._id})
	.then((todos)=>{
		res.status(200).send({todos});
	})
	.catch((e)=>{
		res.status(400).send(e);
	});
});

app.get('/todos/:id',authenticate , (req, res)=>{
	
	if(!ObjectID.isValid(req.params.id)){
		res.status(400).send({
			error : 'please enter a valid id'
		});
	}
	Todo.findOne({_id:req.params.id,_creator:req.user._id})
		.then((todo)=>{
			if(!todo){
				res.status(400).send({
					error : 'todo not found'
				});
			}
			res.status(200).send({todo});
		}).catch((e)=>{
			res.status(400).send({
					error : 'todo not found'
				});
		});

});

app.delete('/todos/:id',authenticate , (req, res)=>{

	if(!ObjectID.isValid(req.params.id)){
		res.status(400).send({
			error : "please enter a valid id"
		});
	}
	Todo.findOneAndRemove({_id:req.params.id,_creator:req.user._id})
		.then((todo)=>{
			if(!todo){
				res.status(400).send({
					error : 'todo not found'
				});
			}
			res.status(200).send({todo});
		})
		.catch((e)=>{
			res.status(400).send({
				error : "todo not found"
			});
		})

});

app.patch('/todos/:id',authenticate , (req, res)=>{

	if(!ObjectID.isValid(req.params.id)){
		res.status(400).send({
			error : "please enter a valid id"
		});
	}

	var body = _.pick(req.body,['text','completed']);

	if(body.completed == 'true'){
		body.completedAt = new Date().getTime();
	}else{
		body.completed = false;
		body.completedAt = null;
	}


	Todo.findOneAndUpdate({_id:req.params.id,_creator:req.user._id},{$set:body},{new:true})
		.then((todo)=>{
			if(!todo){
				res.status(400).send({
					error : 'todo not found'
				});
			}
			res.status(200).send({todo});
		})
		.catch((e)=>{
			res.status(400).send({
				error : "todo not found"
			});
		})

});


app.listen(port,()=>{
	console.log('app is running at port ',port);
});

module.exports = {app};