const {mongoose} = require('./db/mongoose');
var {User} = require('./models/user'); 
var {Todo} = require('./models/todo'); 
const bodyParser = require('body-parser');
const express = require('express');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');

var port = process.env.PORT || 3000;

var app = express();

app.use(bodyParser.json());

app.post('/todos',(req, res)=>{

	var todo = new Todo({
		text: req.body.text,
	});

	todo.save()
	.then((docs)=>{
		res.status(200).send(docs);
	})
	.catch((e)=>{
		res.status(400).send(e);
	});
});

app.get('/todos',(req, res)=>{

	Todo.find({})
	.then((todos)=>{
		res.status(200).send({todos});
	})
	.catch((e)=>{
		res.status(400).send(e);
	});
});

app.get('/todos/:id', (req, res)=>{
	
	if(!ObjectID.isValid(req.params.id)){
		res.status(400).send({
			error : 'please enter a valid id'
		});
	}
	Todo.findById(req.params.id)
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

app.delete('/todos/:id', (req, res)=>{

	if(!ObjectID.isValid(req.params.id)){
		res.status(400).send({
			error : "please enter a valid id"
		});
	}
	Todo.findByIdAndRemove(req.params.id)
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

app.patch('/todos/:id', (req, res)=>{

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


	Todo.findByIdAndUpdate(req.params.id,{$set:body},{new:true})
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