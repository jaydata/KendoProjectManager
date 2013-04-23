
var viewModel = kendo.observable({
	loginName:null,
	password:null,
	stormProvider: null,
	
	projectList: null,
	taskList:null,
	myTaskList:null,
	workLogs:null,
    
	selectedProject:null,
	selectedTask:null,
	
	canAddProject:false,
	canEditProject:false,
	canChangeProject:false,
    
	canAddTask:false,
	canDeleteTask:false,
    canChangeTask:false,
    

    
	apiKey: {
		ownerId: '952014ac-da7c-4024-93b2-644217ddba2c',
		appId: 'ea20ec7c-6bd5-4db8-aa84-e62d789b2de5',
		serviceName: 'mydatabase'
	},
	login:function() {
		var credentials = {
			user: this.loginName,
			password: this.password
		};
		if (!credentials.user) {
			credentials.user = 'admin';
			credentials.password = 'admin';
			this.loginName = 'admin';
			this.password = 'admin';
		}
		console.log(credentials);
		app.showLoading();
		$data.initService(this.apiKey, credentials).then(function(mydatabase, factory, type) {
			viewModel.stormProvider = mydatabase;
			viewModel.projectList = mydatabase.Projects.asKendoDataSource();
			viewModel.myTaskList = mydatabase.Tasks.filter("it.AssignedTo == this.UserName", {UserName:viewModel.loginName}).asKendoDataSource();
			viewModel.taskList = mydatabase.Tasks.asKendoDataSource();
			viewModel.workLogs = mydatabase.WorkLogs.orderByDescending("it.CreateDate").asKendoDataSource();
			viewModel.taskList.bind("sync", viewModel.saveWorkLog);
			
			userViewModel.initializeUserList(function() {
				$.when(userViewModel.isInGroups(['admin','management']).then(function(result) {viewModel.set('canAddProject', result);}),
    				   userViewModel.isInGroups(['admin','management']).then(function(result) {viewModel.set('canEditProject', result);}),
                       userViewModel.isInGroups(['admin','management']).then(function(result) {viewModel.set('canChangeProject', result);}),
                       userViewModel.isInGroups(['admin','management','developer']).then(function(result) {viewModel.set('canAddTask', result);}),
                       userViewModel.isInGroups(['admin','management']).then(function(result) {viewModel.set('canDeleteTask', result);}),
                       userViewModel.isInGroups(['admin','management','developer']).then(function(result) {viewModel.set('canChangeTask', result);}),
                       userViewModel.isInGroups(['admin']).then(function(result) {userViewModel.set('canAddUser', result);}),
                       userViewModel.isInGroups(['admin']).then(function(result) {userViewModel.set('canDeleteUser', result);}))
    				.done(function() {
                        console.log("Goto project list");
                        $('.km-tabstrip').show();
    					app.navigate("views/projectList.html");
    				});
			});
		});
	},
	selectProject:function(e) {
		viewModel.set("selectedProject", e.dataItem);
	},
	newProject:function() {
		viewModel.set("selectedProject", viewModel.projectList.createItem());
	},
	saveProject:function() {
		if (viewModel.selectedProject.isNew()) {        
			viewModel.projectList.add(viewModel.selectedProject);
		}
		viewModel.projectList.sync();
		app.navigate("#:back");
	},
	initializeTaskList:function() {
		viewModel.taskList.filter({ field: "Project_Id", operator: "equal", value: viewModel.selectedProject.id });
	},
	initializeMyTaskList:function() {
		viewModel.myTaskList.read();
	},
	initializeEditTask:function() {
		$("input[type=date]").kendoDatePicker();
	},
	newTask:function() {
		viewModel.set("selectedTask", viewModel.taskList.createItem());
		viewModel.workLogs.filter({field:'Task_Id', operator:'equal', value:viewModel.selectedTask.id});
		viewModel.selectedTask.set("Project_Id", viewModel.selectedProject.id);
	},
	selectTask:function(e) {
		viewModel.set("selectedTask", e.dataItem);
		viewModel.workLogs.filter({field:'Task_Id', operator:'equal', value:viewModel.selectedTask.id});
	},
	saveTask:function() {
		if (viewModel.selectedTask.isNew()) {        
			viewModel.taskList.add(viewModel.selectedTask);
		}
		viewModel.taskList.sync();
	},
	removeTask:function() {
		console.log("remove task");
		while (viewModel.workLogs.data().length > 0) {
			viewModel.workLogs.remove(viewModel.workLogs.view()[0]);
		}
		viewModel.workLogs.sync()
		viewModel.taskList.remove(viewModel.selectedTask);
		viewModel.taskList.sync();
		app.navigate('#:back');
	},
	saveWorkLog:function() {
		console.log("Save worklog if needed");
		if ($('#taskDescription').val().length > 0) {
			var workLog = viewModel.workLogs.createItem();
			workLog.set('UserName', viewModel.loginName);
			workLog.set('CreateDate', new Date());
			workLog.set('Description', $('#taskDescription').val());
			workLog.set('Task_Id', viewModel.selectedTask.id);
			viewModel.workLogs.add(workLog);
			viewModel.workLogs.sync();
		}
		app.navigate("#:back");
	}
});