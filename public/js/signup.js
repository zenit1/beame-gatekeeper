/**
 * Created by Alexz on 15/11/2016.
 */
$(document).ready(function () {
	QRmanager();
	whispererManager();
});

function QRmanager(){
	"use strict";
	/**
	 * Created by zenit1 on 25/09/2016.
	 */

	var qrContainer       = null;
	var sessionRSAPK;
	var relayEndpoint     = "";
	var sessionRSAPKverify;
	var tmpSocketID;
	var sessionAESkey;
	var sessionIV;
	var keyPair;
	var keyPairSign;

	var keyGenerated      = false;
	var TMPsocketRelay;
	var TMPsocketOrigin;

	function initRelay(socket) {

		TMPsocketRelay.on('disconnect', function () {
			console.log('disconnected, ID = ', TMPsocketRelay.id);
		});

		TMPsocketRelay.on('data', function (data) {
			console.log('data = ', data.payload.data);
			tmpSocketID = data.socketId;
			var encryptedData      = data.payload.data;
			var success = true;
			decryptDataWithRSAkey(encryptedData, RSAOAEP, keyPair.privateKey, function (err, decryptedDataB64) {
				if (!err) {
					var decryptedData = JSON.parse(atob(decryptedDataB64));
					var key2import = decryptedData.pk;
					importPublicKey(key2import, PK_RSAOAEP, ["encrypt"]).then(function (keydata) {
						console.log("Successfully imported RSAOAEP PK from external source");
						sessionRSAPK = keydata;
						window.crypto.subtle.exportKey('spki', keyPair.publicKey)
							.then(function (mobPK) {
								TMPsocketOrigin.emit('InfoPacketResponse',
									{
										'pin':       decryptedData.otp,
										'pk':        arrayBufferToBase64String(mobPK),
										'edge_fqdn': decryptedData.edge_fqdn
									});
							})
							.catch(function (error) {
								TMPsocketOrigin.emit('InfoPacketResponse',
									{'pin': data.payload.data.otp, 'error': 'mobile PK failure'});
								console.log('<*********< error >*********>:', error);
							});

						window.crypto.subtle.exportKey('spki', keyPairSign.publicKey)
							.then(function (keydata1) {
								console.log('SignKey: ', arrayBufferToBase64String(keydata1));
								encryptWithPK(keydata1, function (error, cipheredData) {
									if (!error) {
										console.log('Sending SignKey: ', JSON.stringify({
											'type':    'signkey',
											'payload': {'data': (cipheredData)}
										}));
										TMPsocketRelay.emit('data', {
											'socketId': tmpSocketID,
											'payload':  JSON.stringify({'type': 'signkey', 'data': (cipheredData)})
										});
									}
									else {
										success = false;
										console.error('Data encryption failed: ', error);
									}
								});
							})
							.catch(function (err) {
								success = false;
								console.error('Export Public Sign Key Failed', err);
							});


						importPublicKey(key2import, PK_PKCS, ["verify"]).then(function (keydata) {
							console.log("Successfully imported RSAPKCS PK from external source");
							sessionRSAPKverify = keydata;
						}).catch(function (err) {
							success = false;
							console.error('Import *Verify Key* Failed', err);
						});

					}).catch(function () {
						console.log('Import *Encrypt Key* failed');
						success = false;
					});
				}
				else {
					console.log('failed to decrypt mobile PK');
					TMPsocketRelay.emit('data', {'socketId': tmpSocketID, 'payload': 'failed to decrypt mobile PK'});
				}
			});
		});

		TMPsocketRelay.on('create_connection', function () {
			console.log('create_connection, ID = ', TMPsocketRelay.id);
		});

		TMPsocketRelay.on('hostRegistered', function (data) {
			console.log('hostRegistered, ID = ', TMPsocketRelay.id, '.. hostname: ', data.Hostname);

			socket.emit('virtSrvConfig', data.Hostname);
			//noinspection JSUnresolvedFunction,JSUnresolvedVariabl
		});

		TMPsocketRelay.on('error', function () {
			console.log('error, ID = ', TMPsocketRelay.id);
		});

		TMPsocketRelay.on('_end', function () {
			console.log('end, ID = ', TMPsocketRelay.id);
		});
	}


		var UID = generateUID(24) + VirtualPrefix;
		console.log('UID:', UID);
		//noinspection ES6ModulesDependencies,NodeModulesDependencies
		var socket = io.connect("/qr");//connect to origin

		socket.on('pinRenew',function (data) {
			try {
				var parsed = JSON.parse(data);
				if (parsed['data'] && keyGenerated) {

					window.crypto.subtle.exportKey('spki', keyPair.publicKey)
						.then(function (keydata) {
							var PK = arrayBufferToBase64String(keydata);
							console.log('Public Key Is Ready:', PK, '==>', PK);
							if (relayEndpoint.indexOf(TMPsocketRelay.io.engine.hostname) < 0) {
								console.log('Crap::',
									relayEndpoint, '..', TMPsocketRelay.io.engine.hostname);
								window.alert('Warning! Suspicious content, please verify domain URL and reload the page..');
							}
							else {
								var QRdata  = {'relay': 'https://' + relayEndpoint, 'PK': PK, 'UID': parsed['UID'],
									'PIN': parsed['data'], 'TYPE':'PROV','TIME':Date.now()};
								socket.emit('QRdata',QRdata);
								qrContainer = $('#qr');
								try {
									var dataStr = JSON.stringify(QRdata);
									if (dataStr.length > 30) {
										console.log(dataStr);
										qrContainer.empty();
										qrContainer.kendoQRCode({
											value:           dataStr,
											errorCorrection: "L",
											color:           "#000",
											background:      "transparent",
											padding:         0
										});
									}
									else {
										console.log('data is short:', dataStr.length, ', data:', data);//resend qr
									}
								}
								catch (e) {
									console.log('Invalid QR data:', data);
								}
							}

							//exampleSocket.send(JSON.stringify({'type':'key','payload':{'data':PK, 'token':
							//{'signedData':'key','signedBy':'signedBy','signature':'signature'}}}));
						})
						.catch(function (err) {
							console.error('Export Public Key Failed', err);
						});

				}
			}
			catch (e) {
				console.log('Error:', e);
			}

		});

		socket.on('connect', function () {
			TMPsocketOrigin = socket;//remove towards prod
			if (!relayEndpoint) {
				socket.emit('browser_connected',UID);
			}
		});

		socket.on('mobileProv1', function (data) {
			if (data.data && TMPsocketRelay) {
				var msg = {'socketId': tmpSocketID, 'payload': JSON.stringify(data)};
				console.log('******** Sedning:: ', msg);
				TMPsocketRelay.emit('data', msg);
			}
		});

		socket.on('mobilePinInvalid', function (data) {
			if (data.data && TMPsocketRelay) {
				var msg = {'socketId': tmpSocketID, 'payload': JSON.stringify(data)};
				console.log('******** Sedning:: ', msg);
				TMPsocketRelay.emit('data', msg);
			}
		});

		socket.on('relayEndpoint', function (data) {
			console.log('relayEndpoint', data);
			generateKeyPairs(function (error, keydata) {
				if (error) return;//send error to origin/show on browser
				keyPair      = keydata.keyPair;
				keyPairSign  = keydata.keyPairSign;

				keyGenerated = true;
				try {
					var parsedData = JSON.parse(data);
					relayEndpoint  = parsedData['data'];
					var lclTarget  = "https://" + relayEndpoint + "/control";
					if (relayEndpoint) {
						//noinspection ES6ModulesDependencies,NodeModulesDependencies
						TMPsocketRelay = io.connect(lclTarget);
						TMPsocketRelay.on('connect', function () {
							console.log('Connected, ID = ', TMPsocketRelay.id);
							TMPsocketRelay.emit('register_server',
								{
									'payload': {
										'socketId':      null,
										'hostname':      UID,
										//'signedData':UID,
										'signature':     parsedData['signature'],
										//'signedBy':window.location.hostname,
										'type':          'HTTPS',
										'isVirtualHost': true
									}
								});
							initRelay(socket);
						});
					}
				}
				catch (e) {
					socket.emit('browserFailure', {'error': 'relay fqdn get - failed'});
					console.error('failed to parse data:', e);
				}
			});

		});

		socket.on('resetQR', function () {
			console.log('QR read successfully - set green');
			qrContainer.empty();
			//noinspection JSUnresolvedFunction
			qrContainer.kendoQRCode({
				value: "{\"message\":\"QR used, reload the page to get new QR\"}",
				errorCorrection: "L",
				color:           "#0F9239",
				background:      "transparent",
				padding:         0
			});
		});


//window.location.host window.location.href
		$(window).on('resize', function () {
			if(qrContainer){
				if (qrContainer.data("kendoQRCode"))  qrContainer.data("kendoQRCode").redraw();
			}
		});
}

function whispererManager(){
	"use strict";
	/**
	 * Created by filip on 18/07/2016.
	 */
	var PIN          = null,
		UID          = null,
		keyPair,
		keyPairSign,
		keyGenerated = false,
		TMPSocketRelay,
		tmpSocketID,
		relayEndpoint,
	    sessionRSAPK,
		sessionRSAPKverify;

	var app = angular.module("WhispererWeb", []);

	app.controller("MainCtrl", ["$scope", function ($scope) {

		var tryDigest = function (scope) {
			if (!scope.$phase) {
				try {
					scope.$digest();
				}
				catch (e) {
				}
			}
		};

		var whispererTimeout = 1000 * 60;

		$scope.showWelcome = true;
		$scope.showConn    = true;
		$scope.showMsg     = false;
		$scope.w_msg       = '';
		$scope.soundOn     = true;

		$scope.showPopup = function (msg) {
			$scope.showWelcome = false;
			$scope.showMsg     = true;
			if (msg) {
				$scope.w_msg = msg;
			}
			tryDigest($scope);
		};

		/*---------*/
		if (!window.btoa) {
			$scope.btoa = function (input) {
				var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

				var output = "";
				var chr1, chr2, chr3;
				var enc1, enc2, enc3, enc4;
				var i      = 0;

				do {
					chr1 = input.charCodeAt(i++);
					chr2 = input.charCodeAt(i++);
					chr3 = input.charCodeAt(i++);

					enc1 = chr1 >> 2;
					enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
					enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
					enc4 = chr3 & 63;

					if (isNaN(chr2)) {
						enc3 = enc4 = 64;
					} else if (isNaN(chr3)) {
						enc4 = 64;
					}

					output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) +
						keyStr.charAt(enc3) + keyStr.charAt(enc4);
				} while (i < input.length);

				return output;
			}
		}

		$scope.nowPinging = false;
		/*function changeCode() {
		 if($scope.socketAlive){
		 console.log("Force change code");
		 socket.emit("changeCode");
		 }
		 }*/
		$scope.startPlaying = function () {
			if ($scope.audio && $scope.socketAlive) {
				console.log('playing: ' + $scope.pinData);
				if ($scope.audio.playing === true)
					$scope.audio.stop();
				$scope.audio.src  = $scope.audioData;
				$scope.audio.loop = true;
				$scope.audio.play();
			}
		};
		$scope.stopPlaying  = function () {
			if ($scope.audio) {
				$scope.audio.pause();
				$scope.audio.loop = false;
			}

			if ($scope.showWelcome)
				document.getElementById("pin").innerHTML = "audio from server stopped";
		};
		$scope.pingSocket   = function () {
			if (!$scope.socketAlive) {
				$scope.nowPinging = false;
				return;
			}
			$scope.nowPinging = true;


			setTimeout(function () {
				if (--$scope.keepAlive > 0) {
					$scope.pingSocket();
				}
				else {
					$scope.socketAlive = false;
					$scope.stopPlaying();
					console.log('Socket disconnected. Audio stopped');
				}
			}, whispererTimeout);
		};

		//pingSocket();
		$scope.keepAlive = 5;

		$scope.socketAlive = false;
		$scope.playPIN     = false;
		$scope.socket      = io.connect("/whisperer");


		$scope.socket.on('hey', function () {
			$scope.keepAlive   = 5;
			$scope.socketAlive = true;
		});

		$scope.socket.on('wh_timeout', function (timeout) {
			console.log('on whisperer timeout', timeout);
			whispererTimeout = timeout * 2;
		});

		$scope.socket.on('restartWhisperer', function () {
			console.log("restarting whisperer");
			location.reload();
		});

		$scope.socket.on('connect_ok', function (data) {
			console.log('DATA >>>>>>> ' + JSON.stringify(data));
			$scope.stopPlaying();
			$scope.showPopup('Code matched');

			var mob_socket = io.connect('https://' + data.clientFqdn + "/whisperer");

			mob_socket.on('connect', function () {

				$scope.showPopup('Mobile connected: verifying session token');

				mob_socket.emit('session_token', data);
			});

			mob_socket.on('your_id', function (message) {

				$scope.showPopup('Mobile connected: message received "' + message + '"');

			});

			mob_socket.on('sign_error', function (message) {

				$scope.showPopup('Mobile connected: signature error received "' + message + '"');

			});
		});

		$scope.socket.on('start_provision_session', function (data) {
			console.log('start_provision_session %j', data);
			$scope.stopPlaying();
			$scope.showPopup('Code matched');

			PIN = data.pin;
			UID = generateUID(24) + VirtualPrefix;

			generateKeyPairs(function (error, data) {
				if (error) return;
				keyPair      = data.keyPair;
				keyPairSign  = data.keyPairSign;
				keyGenerated = true;
				$scope.socket.emit('virtSrvConfig', {'UID': UID});
			});

		});


		function initRelay() {

			TMPSocketRelay.on('disconnect', function () {
				console.log('disconnected, ID = ', TMPSocketRelay.id);
			});

			TMPSocketRelay.on('data', function (data) {
				console.log('data = ', data.payload.data);
				tmpSocketID = data.socketId;
				var encryptedData      = data.payload.data;
				var success = true;
				decryptDataWithRSAkey(encryptedData, RSAOAEP, keyPair.privateKey, function (err, decryptedDataB64) {
					if (!err) {
						var decryptedData = JSON.parse(atob(decryptedDataB64));
						var key2import = decryptedData.pk;
						importPublicKey(key2import, PK_RSAOAEP, ["encrypt"]).then(function (keydata) {
							console.log("Successfully imported RSAOAEP PK from external source");
							sessionRSAPK = keydata;
							window.crypto.subtle.exportKey('spki', keyPair.publicKey)
								.then(function (mobPK) {
									$scope.socket.emit('InfoPacketResponse',
										{
											'pin':       data.payload.data.otp,
											'pk':        arrayBufferToBase64String(mobPK),
											//'name':      data.payload.data.name,
											//'email':     data.payload.data.email,
											'edge_fqdn': data.payload.data.edge_fqdn
										});
								})
								.catch(function (error) {
									$scope.socket.emit('InfoPacketResponse',
										{'pin': data.payload.data.otp, 'error': 'mobile PK failure'});
									console.log('<*********< error >*********>:', error);
								});

							window.crypto.subtle.exportKey('spki', keyPairSign.publicKey)
								.then(function (keydata1) {
									console.log('SignKey: ', arrayBufferToBase64String(keydata1));
									encryptWithPK(keydata1, function (error, cipheredData) {
										if (!error) {
											console.log('Sending SignKey: ', JSON.stringify({
												'type':    'signkey',
												'payload': {'data': (cipheredData)}
											}));
											TMPSocketRelay.emit('data', {
												'socketId': tmpSocketID,
												'payload':  JSON.stringify({'type': 'signkey', 'data': (cipheredData)})
											});
										}
										else {
											success = false;
											console.error('Data encryption failed: ', error);
										}
									});
								})
								.catch(function (err) {
									success = false;
									console.error('Export Public Sign Key Failed', err);
								});


							importPublicKey(key2import, PK_PKCS, ["verify"]).then(function (keydata) {
								console.log("Successfully imported RSAPKCS PK from external source");
								sessionRSAPKverify = keydata;
							}).catch(function (err) {
								success = false;
								console.error('Import *Verify Key* Failed', err);
							});

						}).catch(function () {
							console.log('Import *Encrypt Key* failed');
							success = false;
						});
					}
					else {
						console.log('failed to decrypt mobile PK');
						TMPSocketRelay.emit('data', {'socketId': tmpSocketID, 'payload': 'failed to decrypt mobile PK'});
					}
				});
			});

			TMPSocketRelay.on('create_connection', function () {
				console.log('create_connection, ID = ', TMPSocketRelay.id);
			});

			TMPSocketRelay.on('hostRegistered', function (data) {
				console.log('hostRegistered, ID = ', TMPSocketRelay.id, '.. hostname: ', data.Hostname);
				if (keyGenerated) {
					var UID = data.Hostname;
					//noinspection JSUnresolvedFunction,JSUnresolvedVariable
					window.crypto.subtle.exportKey('spki', keyPair.publicKey)
						.then(function (keydata) {
							var PK = arrayBufferToBase64String(keydata);
							console.log('Public Key Is Ready:', PK, '==>', PK);
							if (relayEndpoint.indexOf(TMPSocketRelay.io.engine.hostname) < 0) {
								console.log('Crap::', relayEndpoint, '..', TMPSocketRelay.io.engine.hostname);
								window.alert('Warning! Suspicious content, please verify domain URL and reload the page..');
							}
							else {
								var qrData = JSON.stringify({'relay': 'https://' + relayEndpoint, 'PK': PK, 'UID': UID,
									'PIN': PIN, 'TYPE':'PROV', 'TIME':Date.now()});
								console.log('sending qr data to whisperer %j',qrData);
								$scope.socket.emit('init_mobile_session', qrData);
							}

						})
						.catch(function (err) {
							console.error('Export Public Key Failed', err);
						});
				}
			});

			TMPSocketRelay.on('error', function () {
				console.log('error, ID = ', TMPSocketRelay.id);
			});

			TMPSocketRelay.on('_end', function () {
				console.log('end, ID = ', TMPSocketRelay.id);
			});
		}
		$scope.socket.on('mobileProv1', function (data) {
			if (data.data && TMPSocketRelay) {
				var msg = {'socketId': tmpSocketID, 'payload': JSON.stringify(data)};
				console.log('******** Sedning:: ', msg);
				TMPSocketRelay.emit('data', msg);
			}
		});

		$scope.socket.on('relayEndpoint', function (data) {
			console.log('relayEndpoint', data);
			try {
				var parsedData = JSON.parse(data);
				relayEndpoint  = parsedData['data'];
				var lclTarget  = "https://" + relayEndpoint + "/control";

				if (relayEndpoint) {
					//noinspection ES6ModulesDependencies,NodeModulesDependencies
					TMPSocketRelay = io.connect(lclTarget);
					TMPSocketRelay.on('connect', function () {
						console.log('Connected, ID = ', TMPSocketRelay.id);
						TMPSocketRelay.emit('register_server',
							{
								'payload': {
									'socketId':      null,
									'hostname':      UID,
									//'signedData':UID,
									'signature':     parsedData['signature'],
									//'signedBy':window.location.hostname,
									'type':          'HTTPS',
									'isVirtualHost': true
								}
							});
						initRelay();
					});
				}
			}
			catch (e) {
				$scope.socket.emit('browserFailure', {'error': 'relay fqdn get - failed'});
				console.error('failed to parse data:', e);
			}
		});

		$scope.socket.on('mobile_network_error',function(){
			console.log('Mobile connection failed');
			alert('Mobile connection failed');
		});

		$scope.socket.on('match_not_found', function () {
			$scope.stopPlaying();
			$scope.showPopup('Matching server not found');

		});

		$scope.socket.on('disconnect', function () {
			console.log('DISCONNECTED');
			$scope.socketAlive = false;
			$scope.stopPlaying();
			//    document.getElementById("player").innerHTML = "-- Server disconnected --";
		});

		$scope.socket.on('pindata', function (data) {
			if (!$scope.soundOn) return;
			$scope.showConn = false;
			tryDigest($scope);
			$scope.pinData   = data;
			$scope.keepAlive = 5;
			console.log('PIN:' + data);
			if ($scope.showWelcome)
				document.getElementById("pin").innerHTML = data;
		});

		$scope.socket.on('data', function (data) {
			$scope.socketAlive = true;
			console.log("data received:" + data.length);

			$scope.audioData = "data:audio/wav;base64," + escape(btoa(data));
			if (!$scope.audio)
				$scope.audio = new Audio();
			$scope.startPlaying();
			if (!$scope.nowPinging)
				$scope.pingSocket();
		});

		// Welcome screen actions
		$scope.turnSoundOn = function () {
			$scope.playPIN = true;
			$scope.soundOn = true;

			if ($scope.socket) {
				$scope.socket.emit("play_please");
			}

			$scope.startPlaying();
			tryDigest($scope);
		};

		$scope.turnSoundOff = function () {
			$scope.soundOn = false;
			$scope.playPIN = false;

			if ($scope.socket) {
				$scope.socket.emit("stop_please");
			}

			$scope.stopPlaying();
			tryDigest($scope);
		};

		// Popup actions
		$scope.hidePopup = function () {
			$scope.turnSoundOn();
		};

	}]);

	app.filter('to_trusted', ['$sce', function ($sce) {
		return function (text) {
			return $sce.trustAsHtml(text);
		};
	}]);

	app.directive("welcomeTemplate", function () {
		return {
			restrict:    "E",
			templateUrl: "templates/welcome.tpl.html"
		};
	});

}