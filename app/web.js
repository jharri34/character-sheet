module.exports = () => {
	var express = require('express');
	var logfmt = require('logfmt');
	var _ = require('underscore');
	var app = express();

	var host = process.env.HOST,
		appFolder = process.env.APP_FOLDER,
		GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET,
		GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID,
		GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

	var db = require('monk')('localhost/mydb');

	// --- Configuration ---

	app.use(logfmt.requestLogger());
	app.use(express.cookieParser());
	app.use(express.json()); // this, urlencoded, and multipart supercede bodyParser
	app.use(express.urlencoded());
	app.use(express.multipart());
	app.use(express.methodOverride());
	app.use(express.session({ secret: 'Sho0bd0obe3do0w4h' }));

	app.param('collectionName', function (req, res, next, collectionName) {
		req.collection = db.get(collectionName);
		return next();
	});

	// --- API Routes ---

	var apiBase = '/api/v1';

	app.get(apiBase, function (req, res) {
		res.send('This is the API service.');
	});

	app.get(apiBase + '/:collectionName', function (req, res, next) {
		var q = JSON.parse(req.query.q.replace(/@\$/g, '$')),
			f = JSON.parse(req.query.f);
		req.collection.find(q, f).then(function (results) {
			// , { limit: 50, sort: [['_id', -1]] }
			res.send(results);
		}).catch(function (err) {
			return next(err);
		});
	});

	app.post(apiBase + '/:collectionName', function (req, res, next) {
		// require a user object in the body minimally
		if (req.body.user && req.body.user.id) {
			req.collection.insert(req.body).then(function (doc) {
				res.status(201).send(doc);
			}).catch(function (err) {
				return next(err);
			});
		} else {
			res.send(401);
		}
	});

	app.get(apiBase + '/:collectionName/:id', function (req, res, next) { // this call doesn't require auth to allow for statblock sharing
		req.collection.findOne({ _id: req.params.id }).then(function (doc) {
			res.send(doc);
		}).catch(function (err) {
			return next(err);
		});
	});

	app.put(apiBase + '/:collectionName/:id', function (req, res, next) {
		if (req.body.user && req.body.user.id) {
			req.collection.findOneAndUpdate({ _id: req.params.id }, { $set: req.body }).then(function (updatedDoc) {
				res.send(updatedDoc);
			}).catch(function (err) {
				return next(err);
			});
		} else {
			res.send(401);
		}
	});

	app.del('/collections/:collectionName/:id', function(req, res, next) {
		req.collection.findOneAndDelete({ _id: req.params.id }).then(function () {
			res.send(204); // (No Content)
		}).catch(function (err) {
			return next(err);
		});
	});

	// --- App Routes ---

	// app.use('/pathfinder_dev', express.static('app/'));
	// app.use('/pathfinder', express.static('dist/'));
	app.use('/', express.static(__dirname + '/'));

	// --- Server Listening ---

	app.listen(port, function () {
		console.log('Listening on ' + global.port);
	});
}