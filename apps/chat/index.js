'use strict';

const beameSDK    = require('beame-sdk');
const module_name = "ChatApp";
const BeameLogger = beameSDK.Logger;
const logger      = new BeameLogger(module_name);
const Service = require('../../constants').SetupServices.SampleChat;
const host    = 'localhost';
const express = require('express');
const app     = express();
// Hack attack!

class Server {

	start(cb) {

		let http = require('http').Server(app);
		let io = require('socket.io')(http);

		app.use('/', express.static(__dirname + '/public'));

		let numUsers = 0;

		io.on('connection',  (socket) => {
			let addedUser = false;

			// when the client emits 'new message', this listens and executes
			socket.on('new message', function (data) {
				// we tell the client to execute 'new message'
				socket.broadcast.emit('new message', {
					username: socket.username,
					message: data
				});
			});

			// when the client emits 'add user', this listens and executes
			socket.on('add user', function (username) {
				if (addedUser){ return;}

				// we store the username in the socket session for this client
				socket.username = username;
				++numUsers;
				addedUser = true;
				socket.emit('login', {
					numUsers: numUsers
				});
				// echo globally (all clients) that a person has connected
				socket.broadcast.emit('user joined', {
					username: socket.username,
					numUsers: numUsers
				});
			});

			// when the client emits 'typing', we broadcast it to others
			socket.on('typing', function () {
				socket.broadcast.emit('typing', {
					username: socket.username
				});
			});

			// when the client emits 'stop typing', we broadcast it to others
			socket.on('stop typing', function () {
				socket.broadcast.emit('stop typing', {
					username: socket.username
				});
			});

			// when the user disconnects.. perform this
			socket.on('disconnect', function () {
				if (addedUser) {
					--numUsers;

					// echo globally that this client has left
					socket.broadcast.emit('user left', {
						username: socket.username,
						numUsers: numUsers
					});
				}
			});
		});

		http.listen(0, host, () =>{
			this._server = http;
			logger.info(`Listening on ${host}:${this._server.address().port}`);
			cb && cb(null,{code:Service.code, url:`http://${host}:${this._server.address().port}`})
		});

		this._app = app;
		this._http = http;
	}
}

module.exports = Server;
