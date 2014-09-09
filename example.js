var unifi = require('unifi');

if(process.argv[2] === '-h'){
	console.log("node app.js url user password command mac [mins]");
	console.log("url = http://127.0.0.1 ");
	console.log("user = admin ");
	console.log("password = password ");
	console.log("command = [BLOCK,AUTH,UNAUTH,KICK,LIST] ");
	console.log("mac = dc:9f:db:f2:xx:xx ");
	console.log("if command AUTH then follow mac by number of minutes they are authorised for ");
	console.log("if command LIST then no need to follow with mac address");
	process.exit();
}
//console.log(process.argv);

var url = process.argv[2],
	admin = process.argv[3],
	password = process.argv[4],
	cmd = process.argv[5];

// Let's create a new unifi session for the default site code
var default_site = new unifi(url, 8443, 'default');

// Let's go ahead and login
default_site.login(admin, password, function(err){
    if(err){return console.error(err);}
    console.log('Login Successful, Lets get all the access points now');
    default_site.getDevices(function(err, data){
        if(err){return console.error(err);}
        
		if(cmd!='LIST'){
			//get mac address to do command on
			var macAddress = process.argv[6];
		}
		switch(cmd) {
			case 'BLOCK':
				//block the mac address of the client
				default_site.blockClient(macAddress,function(err,data){
					if(err){return console.error(err);}
					console.log(macAddress + " is now Blocked");
				});
				break;
			case 'AUTH':
				//Get the number of minutes to authorise
				var mins = process.argv[7];
				//authorise mac address
				default_site.authorizeGuest(macAddress, mins, function(err,data){
					if(err){return console.error(err);}
					console.log(macAddress + " is now Authorised for " + mins + " minutes");
				});
				break;
			case 'UNAUTH':
				//unauthorise the mac address of the client
				default_site.unauthorizeGuest(macAddress,function(err,data){
					if(err){return console.error(err);}
					console.log(macAddress + " is now unauthorised");
				});
				break;
			case 'KICK':
				//unauthorise the mac address of the client
				default_site.disconnectClient(macAddress,function(err,data){
					if(err){return console.error(err);}
					console.log(macAddress + " has been kicked");
				});
				break;
			case 'LIST':
				// Now that we have all the access points, let print out the access points name and MAC and IP address
				data.forEach(function(AP){
					console.log(AP.name, AP.mac, AP.ip);
				});
			default:
				console.log("No command entered");
			}
		

        // Now that we are done, lets logout
        default_site.logout();
    });
});
