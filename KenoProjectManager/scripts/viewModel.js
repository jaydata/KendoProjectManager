
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
			this.password ='admin';
		}
		console.log(credentials);
		app.showLoading();
		$data.initService(this.apiKey, credentials).then(function(mydatabase, factory, type) {
			viewModel.stormProvider = mydatabase;
			viewModel.projectList = mydatabase.Projects.asKendoDataSource();
            viewModel.myTaskList = mydatabase.Tasks.filter("it.Todo == this.UserName", {UserName:viewModel.loginName}).asKendoDataSource();
            viewModel.taskList =  mydatabase.Tasks.asKendoDataSource();//mydatabase.Tasks.filter("it.Project_Id == this.pId", {pId:viewModel.selectedProjectId}).asKendoDataSource();
            viewModel.workLogs =  mydatabase.WorkLogs.orderByDescending("it.CreateDate").asKendoDataSource();
            
			$('.km-tabstrip').show();
			app.navigate("views/projectList.html");
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
        viewModel.taskList.filter( { field: "Project_Id", operator: "equal", value: viewModel.selectedProject.id });
	},
    initializeMyTaskList:function() {
		viewModel.myTaskList.read();
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
		viewModel.taskList.bind("sync", function() {
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
		});
		viewModel.taskList.sync();
	}
});