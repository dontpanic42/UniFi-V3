var https = require('https'),
	querystring = require('querystring'),
	_ = require('underscore')._;

var unifi = function(hostname, port, site){
	var _self = this;
	
	_self._cookie = '';
	_self._site = site;
	
	_self._options = {
		maxRedirects: 10,
		followRedirect: true,
		followAllRedirects: true,
		hostname: 'localhost',
		port: 8443,
		secureProtocol: 'SSLv3_client_method',
		rejectUnauthorized: false,
		requestCert: true,
		agent: false
	};
	
	if(typeof hostname != 'undefined'){_self._options.hostname = hostname;}
	if(typeof port != 'undefined'){_self._options.port = parseInt(port);}
	
	_self.login = function(username, password, cb){
		if(!_.isFunction(cb)){
			throw new Error('Callback Function Required.');
		}
		var data = querystring.stringify({
			login: 'Login',
			username: username,
			password: password
		});
		
		var req = https.request(_.extend({},_self._options,{
			path: '/login',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(data)
			}
			}),function(res){
				if(res.statusCode == 302){ // Login Successful
					_self._cookie = res.headers['set-cookie'][0];
					cb(false);
				}else if(res.statusCode == 200){ // Login Failed
					cb('Login Failure, Probably Incorrect Username and/or Password');
				}
				res.on('error', function(d){
					cb(d.message);
				});
		});
		
		req.on('error', function(err){
			cb(err.message);
		});
		req.end(data);
	};
	
	_self.logout = function(cb){
		var req = https.request(_.extend({},_self._options,{
			path: '/logout',
			method: 'GET',
			headers: {
				'Cookie': _self._cookie
			}
		}),function(res){
			if(res.statusCode == 302){
				if(_.isFunction(cb)){cb();}
			}else{
				if(_.isFunction(cb)){cb('There was a problem while logging out');}
			}
		});
		req.on('error', function(err){
			if(_.isFunction(cb)){
				cb(err.message);
			}
		});
		req.end();
	};
	
	_self.getDevices = function(cb){
		if(!_.isFunction(cb)){
			throw new Error('Callback Function Required.');
		}
		var req = https.request(_.extend({},_self._options,{
			path: '/api/s/' + _self._site + '/stat/device',
			method: 'GET',
			headers: {
				'Cookie': _self._cookie
			}
		}),function(res){
			var s = '';
			res.on('data',function(chunk){
				s += chunk.toString();
			});
			res.on('end', function(){
				var data = JSON.parse(s);
				if(data.rc == 'error'){cb('Login Required');return;}
				cb(false,data.data);
			});
		});
		req.on('error', function(err){
			cb(err.message);
		});
		req.end();
	};
	
	_self.createVoucher = function(opt,CB){
		var req = https.request(_.extend({},_self._options,{
			path: '/api/s/' + _self._site + '/cmd/hotspot',
			method: 'POST',
			headers: {
				'Cookie': _self._cookie
			}
		}),function(res){
			console.log(res.statusCode);
			var s = '';
			res.on('data',function(chunk){
				s += chunk.toString();
			});
			res.on('end', function(){
				s = JSON.parse(s);
				if(_.isFunction(CB)){
					if(s.meta.rc == 'ok'){
						_self.getVouchers({"create_time":s.data[0].create_time},CB);
					}
				}
			});
		});
		req.on('error', function(err){
			if(_.isFunction(CB)){CB(err);}
		});
		req.end('json=' + JSON.stringify(_.extend({},opt,{cmd:'create-voucher'})));
	};
	
	_self.getVouchers = function(opt,CB){
		var req = https.request(_.extend({},_self._options,{
			path: '/api/s/' + _self._site + '/stat/voucher',
			method: 'POST',
			headers: {
				'Cookie': _self._cookie
			}
		}),function(res){
			var s = '';
			res.on('data', function(chunk){
				s += chunk.toString();
			});
			
			res.on('end', function(){
				if(_.isFunction(CB)){
					CB(false,JSON.parse(s).data);
				}
			});
		});
		req.on('error', function(err){
			if(_.isFunction(CB)){CB(err);}
		});
		req.end("json="+JSON.stringify(opt));
	};
	
	_self.deleteVoucher = function(_id,CB){
		var req = https.request(_.extend({},_self._options,{
			path: '/api/s/' + _self._site + '/cmd/hotspot',
			method: 'POST',
			headers: {
				'Cookie': _self._cookie
			}
		}),function(res){
			var s = '';
			res.on('data', function(chunk){
				s += chunk.toString();
			});
			res.on('end', function(){
				console.log(s);
			});
		});
		req.on('error', function(err){
			if(_.isFunction(CB)){CB(err);}
		});		
		req.end('json={"cmd":"delete-voucher", "_id":"' + _id + '"}');
	};
};

module.exports = unifi;