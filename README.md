UniFi-V3
========

unifi-v3 is an implementation of the Ubiquiti UniFi Controller V3.x API. This module gives you the same ability as the unifi-api Python version, plus a few extra functions.

Install
-------

	$ npm install unifi-v3
	
## Examples

### List all access point

First we need to login to the controller and from there we can get a list of all the access points

	var unifi = require('unifi');
	
	// Let's create a new unifi session for the default site code
	var default_site = new unifi('localhost', 8443, 'default');
	
	// Let's go ahead and login
	default_site.login('admin', 'password', function(err){
		if(err){return console.error(err)}
		console.log('Login Successful, Lets get all the access points now');
		default_site.getDevices(function(err, data){
			if(err){return console.error(err)}
			// Now that we have all the access points, let print out the access points name and MAC and IP address
			data.forEach(function(AP){
				console.log(AP.name, AP.mac, AP.ip);
			});
			// Now that we are done, lets logout
			default_site.logout();
		});
	});
	
And this is the output (for this example, these MAC address aren't real):

	$ node app.js
	Login Successful, Lets get all the access points now
	AP1 dc:9f:db:f2:xx:xx 10.1.1.50
	AP2 dc:9f:db:f2:xx:xx 10.1.1.51
	AP3 24:a4:3c:a2:xx:xx 10.1.1.52
	AP4 dc:9f:db:f2:xx:xx 10.1.1.53
	AP5 dc:9f:db:f2:xx:xx 10.1.1.54
	
Easy ;-)
	
### Vouchers

Okay so now lets get a list of all vouchers for the guest portal and print that out.

	var unifi = require('unifi');
	
	// Let's create a new unifi session for the default site code
	var default_site = new unifi('localhost', 8443, 'default');
	default_site.login('admin', 'password', function(err){
		if(err){return console.error(err)}
		console.log('Login Successful...');
		// Let get all the Vouchers
		default_site.getVouchers({},function(err,data){
			if(err){return console.error(err)}
			// Lets Print out the access code and how many people are currently using them
			data.forEach(function(voucher){
				console.log(voucher.code, 'Used:', voucher.used);
			});
		});
	});
	
And the output:
	
	$ node app.js
	Login was a Success!!
	5460104798 Used: 0
	4826534051 Used: 3
	3016605550 Used: 2
	7674805776 Used: 0
	5005612488 Used: 1
	
Awesome, Now let's Delete all the vouchers

	var unifi = require('unifi');
	
	// Let's create a new unifi session for the default site code
	var default_site = new unifi('localhost', 8443, 'default');
	default_site.login('admin', 'password', function(err){
		if(err){return console.error(err)}
		console.log('Login Successful...');
		// Let get all the Vouchers
		default_site.getVouchers({},function(err,data){
			if(err){return console.error(err)}
			// Lets Print out the access code and how many people are currently using them
			data.forEach(function(voucher){
				default_site.deleteVoucher(voucher._id);
			});
		});
	});
	
Tada! easy as that.

//Block mac address
default_site.blockClient(macAddress,function(err,data){
	if(err){return console.error(err);}
	console.log(macAddress + " is now Blocked");
});


//authorise mac address
default_site.authorizeGuest(macAddress, mins, function(err,data){
	if(err){return console.error(err);}
	console.log(macAddress + " is now Authorised for " + mins + " minutes");
});

//unauthorise the mac address of the client
default_site.unauthorizeGuest(macAddress,function(err,data){
	if(err){return console.error(err);}
	console.log(macAddress + " is now unauthorised");
});

//kick the mac address of the client, they can reconnect
default_site.disconnectClient(macAddress,function(err,data){
	if(err){return console.error(err);}
	console.log(macAddress + " has been kicked");
});


