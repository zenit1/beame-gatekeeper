/**
 * Created by zenit1 on 17/11/2016.
 */
"use strict";

function startGatewaySession(authToken, relaySocket) {

	var gw_socket = null;

	function restartMobileRelaySocket(mob_relay_socket){
		mob_relay_socket.removeAllListeners();

		mob_relay_socket.on('disconnect', function () {
			console.log('mobile socket:: disconnected ', mob_relay_socket.id);
		});

		mob_relay_socket.on('data',function(data){
			var type = data.payload.data.type;

			switch (type) {
				case 'choose':
					return;
				case 'logout':
					gw_socket.emit('data',{
						type:'logout',

					});
					return;
				default:
					console.error('mobile socket:: unknown payload type ' + type);
					return;
			}
		});

		mob_relay_socket.on('error', function () {
			console.log('mobile socket:: error', mob_relay_socket.id);
		});

		mob_relay_socket.on('_end', function () {
			console.log('mobile socket:: end', mob_relay_socket.id);
		});

	}

	restartMobileRelaySocket(relaySocket);


	gw_socket = io.connect('/', {path: '/beame-gw/socket.io'});

	gw_socket.on('connection',function(){
		gw_socket.emit('')
	});

	gw_socket.on('data', data => {
		data = JSON.parse(data);
		console.log('DATA %j', data);
		var session_token, apps;
		if (data.type == 'authenticated') {
			console.log('data/authenticated');
			session_token = data.payload.session_token;
			apps          = data.payload.apps;

			gw_socket.emit('data', {
				type:    'choose',
				payload: {
					session_token: session_token,
					id:            1
				}
			});
			gw_socket.emit('data', {
				type:    'choose',
				payload: {
					session_token: session_token,
					id:            4
				}
			});

			setTimeout(() => {
				gw_socket.emit('data', {
					type:    'logout',
					payload: {
						session_token: session_token
					}
				});
			}, 1000);
		}
	});
}

