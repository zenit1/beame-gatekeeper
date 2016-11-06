"use strict";

const https       = require('https');

const httpProxy   = require('http-proxy');

const beame       = require('beame-sdk');
const ProxyClient = beame.ProxyClient;

const proxy = httpProxy.createProxyServer({});

// TODO: Look if this can help: https://github.com/senchalabs/connect

// https://github.com/nodejitsu/node-http-proxy/blob/d8fb34471594f8899013718e77d99c2acbf2c6c9/examples/http/custom-proxy-error.js
proxy.on('error', (err, req, res) => {
	console.error('--- Proxy error - start ---');
	console.error(err);
	console.error('--- Proxy error - end ---');
	res.writeHead(502, {'Content-Type': 'text/plain'});
	res.end(`Hi.\nThis is beame-insta-server gateway proxy.\n\nProxying failed. Error follows:\n\n===8<===\n${err.stack}\n===8<===\n`);
});

// Extracts URL token either from URL or from Cookie
function extractAuthToken(req) {
	return null;
}

function proxyRequestToAuthServer(req, res) {
	try {
		proxy.web(req, res, { target: `http://127.0.0.1:${process.env.BEAME_INSTA_SERVER_AUTH_PORT || 65001}` });
	} catch(e) {
		res.writeHead(502, {'Content-Type': 'text/plain'});
		res.end(`Proxying failed:\n${e.stack}`);
	}
}

// TODO: Make sure X-Forwarded-For is set
function handleRequest(req, res) {
	const authToken = extractAuthToken(req);
	if (!authToken) {
		// Must get some authorization
		proxyRequestToAuthServer(req, res);
		return;
	}
}

function startRequestsHandler(cert) {
	console.log('startRequestsHandler');
	return new Promise((resolve, reject) => {
		var serverCerts = {
			key:  cert.getKey("PRIVATE_KEY"),
			cert: cert.getKey("P7B"),
			ca:   cert.getKey("CA")
		};
		const server = https.createServer(serverCerts, handleRequest);
		server.listen(process.env.BEAME_INSTA_SERVER_GW_PORT || 0, () => {
			const port = server.address().port;
			console.log(`beame-insta-server listening port ${port}`);
			resolve([cert, port]);
		});
	});
}

function startTunnel([cert, requestsHandlerPort]) {
	console.log('startTunnel');
	return new Promise((resolve, reject) => {
		
		var serverCerts = {
			key:  cert.getKey("PRIVATE_KEY"),
			cert: cert.getKey("P7B"),
			ca:   cert.getKey("CA")
		};
		new ProxyClient("HTTPS", cert.fqdn,
						cert.getMetadataKey('EDGE_FQDN'), 'localhost',
						requestsHandlerPort, {},
						null, serverCerts);

	});
}

function runServer(cert) {
	console.log(`Starting server at https://${cert.fqdn}`);
	return startRequestsHandler(cert)
		.then(startTunnel);
};

module.exports = {
	runServer
};
