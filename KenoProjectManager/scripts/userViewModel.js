var userViewModel = kendo.observable({
	userList:new kendo.data.DataSource(),
	groupList:new kendo.data.DataSource(),
	selectedUser:null,
	stormProvider: null,
	apiKey: {
		ownerId:'952014ac-da7c-4024-93b2-644217ddba2c',
		appId: 'ea20ec7c-6bd5-4db8-aa84-e62d789b2de5',
		serviceName:'User'
	},
	initializeUserList:function() {
		var credentials = {
			user: viewModel.loginName,
			password: viewModel.password
		};
		if (!credentials.user) {
			credentials.user = 'admin';
			credentials.password = 'admin';
		}
		console.log(this, this.apiKey, credentials);
		$data.initService(userViewModel.apiKey, credentials).then(function(mydatabase, factory, type) {
			console.log("Connect to db");
			userViewModel.stormProvider = mydatabase;
			userViewModel.set('userList', mydatabase.Users.asKendoDataSource());
			userViewModel.set('groupList', mydatabase.Groups.asKendoDataSource());
			userViewModel.userList.bind("sync", userViewModel.setPassword);
		});
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