var Project = $data.define("Projects", {
	Name: String,
	Description: String
});

var Task = $data.define("Tasks", {
	Todo: String,
	StartDate: Date,
	EndDate: Date,
	Priority: "int",
	Completed: Boolean,
	Project_Id:"int"
});

var ProjectManager = $data.EntityContext.extend('ProjectManager', {
	Projects: { type: $data.EntitySet, elementType: Project },
	Tasks: { type: $data.EntitySet, elementType: Task },
});

var viewModel = kendo.observable({
	loginName:null,
	password:null,
	stormProvider: null,
	projectList: null,
	selectedProject:null,
	taskList:new kendo.data.DataSource(),
	selectedTask:null,
	workLogs:null,
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
		}
		console.log(credentials);
		app.showLoading();
		$data.initService(this.apiKey, credentials).then(function(mydatabase, factory, type) {
			viewModel.stormProvider = mydatabase;
			viewModel.projectList = mydatabase.Projects.asKendoDataSource();
			$('.km-tabstrip').show();
			app.navigate("projectList.html");
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
		viewModel.set("taskList", viewModel.stormProvider.Tasks.filter("it.Project_Id == this.pId", {pId:viewModel.selectedProject.id}).asKendoDataSource());
	},
	newTask:function() {
		viewModel.set("selectedTask", viewModel.taskList.createItem());
		viewModel.set("workLogs", viewModel.stormProvider.WorkLogs.filter("it.Task_Id == ''").asKendoDataSource());
		viewModel.selectedTask.set("Project_Id", viewModel.selectedProject.id);
	},
	saveTask:function() {
		if (viewModel.selectedTask.isNew()) {        
			viewModel.taskList.add(viewModel.selectedTask);
		}
		viewModel.taskList.sync();
		if ($('#taskDescription').val().length > 0) {
			console.log("save worklogs");
			var workLog = viewModel.workLogs.createItem();
			workLog.set('CreateDate', new Date());
			workLog.set('Description', $('#taskDescription').val());
			workLog.set('Task_Id', viewModel.selectedTask.id);
			viewModel.workLogs.add(workLog);
			viewModel.workLogs.sync();
		}
		app.navigate("#:back");
	},
	selectTask:function(e) {
		viewModel.set("selectedTask", e.dataItem);
		viewModel.set("workLogs", viewModel.stormProvider.WorkLogs.filter("it.Task_Id == this.tId", {tId:viewModel.selectedTask.id}).asKendoDataSource());
	}
});