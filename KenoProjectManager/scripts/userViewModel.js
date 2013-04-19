var userViewModel = kendo.observable({
	userList:null,
	groupList:null,
	selectedUser:null,
	stormProvider: null,
	logedInUser:null,
	logedInUserGroups:null,
	apiKey: {
		ownerId:'952014ac-da7c-4024-93b2-644217ddba2c',
		appId: 'ea20ec7c-6bd5-4db8-aa84-e62d789b2de5',
		serviceName:'User'
	},
	initializeUserList:function(callback) {
		var credentials = {
			user: viewModel.loginName,
			password: viewModel.password
		};
		console.log(this, this.apiKey, credentials);
		$data.initService(userViewModel.apiKey, credentials).then(function(mydatabase, factory, type) {
			console.log("Connect to db");
			userViewModel.stormProvider = mydatabase;
			userViewModel.set('userList', mydatabase.Users.asKendoDataSource());
			userViewModel.set('groupList', mydatabase.Groups.asKendoDataSource());
			userViewModel.userList.bind("sync", userViewModel.setPassword);
			callback();
		});
	},
	loadUser:function() {
		var def = new $.Deferred();
        console.log("Loading user.....");
		if (!userViewModel.logedInUser) {
			userViewModel.stormProvider.Users.single("it.Login == this.usr", {usr:viewModel.loginName})
			.then(function(usr) {
				userViewModel.set("logedInUser", usr);
                console.log("Loaded user");
				def.resolve();
			});
		}
		else {
			def.resolve();
		}
		return def;
	},
	resolveUsersGroup:function() {
		var def = new $.Deferred();
        console.log("resolve groups.....");
		if (!userViewModel.logedInUserGroups) {
			userViewModel.groupList.fetch(function() {
				var groupList = [];
				var idx = 0;
				while (idx < userViewModel.logedInUser.Groups.length) {
					var groupId = userViewModel.logedInUser.Groups[idx++];
					var group = userViewModel.groupList.get(groupId);
					if (group) {
						groupList.push(group.Name);
					}
				}
				userViewModel.set('logedInUserGroups', groupList);
                console.log("resolved group");
				def.resolve();
			});
		}
		else { 
			def.resolve();
		}
		return def;
	},
	isInGroups:function(groups) {
		var def= new $.Deferred();
        var g = groups;
		if (!(groups instanceof Array)) {
			g = [groups];
		}
        
		userViewModel.loadUser()
		.then(function() {
			userViewModel.resolveUsersGroup()
			.then(function() {
                console.log("start is in group");
				var result = false;
				var idx = 0;
                console.log("groups: ", g);
				while (idx < g.length && !result) {
					console.log("check group: ", g[idx], " pre result:", result);
					result = result || (userViewModel.logedInUserGroups.indexOf(g[idx++]) >= 0);
                    console.log("check group: ", g[idx], " post result:", result);
				}
				def.resolve(result);
			});
		});
        return def;
	},
	updateViewModel:function() {
		console.log("Update viewModel");
		userViewModel.userList.read();
	},
	newUser:function() {
		userViewModel.set("selectedUser", userViewModel.userList.createItem());
	},
	selectUser:function(e) {
		userViewModel.set("selectedUser", e.dataItem);
	},
	saveUser:function() {
		if (userViewModel.selectedUser.isNew()) {
			userViewModel.userList.add(userViewModel.selectedUser);
		}
		userViewModel.userList.sync();
	},
	setPassword:function() {
		if ($('#usrPsw').val().length > 0) {
			console.log("save password");
			userViewModel.stormProvider.setPassword(userViewModel.selectedUser.Login, $('#usrPsw').val())
			.then(function() {
				console.log("change user password:", arguments);
				app.navigate('#:back');
			});
		}
		else {
			app.navigate('#:back');
		}
	},
	removeUser:function() {
		userViewModel.userList.remove(userViewModel.selectedUser);
		userViewModel.userList.sync();
	},
	isInGroup:function(item) {
		return userViewModel.selectedUser.Groups.indexOf(item.GroupID) >= 0;
	}
});