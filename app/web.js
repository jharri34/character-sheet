module.exports = () => {
	var express = require('express');
	var logfmt = require('logfmt');
	var _ = require('underscore');
	var app = express();
	var fs = require('fs');

	var host = process.env.HOST,
		appFolder = process.env.APP_FOLDER;

	var db = require('monk')('localhost/mydb');

	// --- Configuration ---

	app.use(logfmt.requestLogger());
	app.use(express.cookieParser());
	app.use(express.json()); // this, urlencoded, and multipart supercede bodyParser
	app.use(express.urlencoded());
	app.use(express.multipart());
	app.use(express.methodOverride());
	app.use(express.session({ secret: 'Sho0bd0obe3do0w4h' }));

	// --- Character storage ---

	function save() {
		fs.writeFile("characters/characters.json", JSON.stringify(characters), function(err) {
			if (err) {
				console.log(err);				
				return;
			}
			console.log("Character file saved!");
		});
	}

	function load() {
		fs.readFile("characters/characters.json", function(err, data) {
			if (err) {
				console.log(err);
				return;
			}
			characters = JSON.parse(data);
			console.log("Character file loaded!");
		});
	}

	// store the characters
	var characters = {};
	load();

	// --- API Routes ---

	var apiBase = '/api/v1';

	app.get(apiBase, function (req, res) {
		res.send('This is the API service.');
	});

	app.get(apiBase + '/characters', function (req, res, next) {
		console.log("get all response = " + JSON.stringify(_.values(characters)));
		res.send(_.values(characters));
	});

	app.post(apiBase + '/characters', function (req, res, next) {
		var id = 1;
		while (id in characters) {
			id++;
		}
		req.body._id = id;
		characters[id] = req.body;
		console.log("post response = " + JSON.stringify(req.body));		
		res.status(201).send(req.body);
		save();
	});

	app.get(apiBase + '/characters/:id', function (req, res, next) { // this call doesn't require auth to allow for statblock sharing
		console.log("get response = " + JSON.stringify(characters[req.params.id]));					
		res.send(characters[req.params.id]);
	});

	app.put(apiBase + '/characters/:id', function (req, res, next) {
		console.log("new keys = " + JSON.stringify(_.keys(req.body)));
		characters[req.params.id] = Object.assign({}, characters[req.params.id], req.body)
		console.log("put response = " + JSON.stringify(characters[req.params.id]));
		res.send(characters[req.params.id]);
		save();
	});

	// --- App Routes ---

	app.use('/', express.static(__dirname + '/'));

	// --- Server Listening ---

	app.listen(port, function () {
		console.log('Listening on ' + global.port);
	});
}