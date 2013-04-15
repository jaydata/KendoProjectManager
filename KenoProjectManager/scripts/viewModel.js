var Project = $data.define("Projects", {
	Name: String,
	Description: String
});

var Task = $data.define("Tasks", {
	Todo: String,
	StartDate: Date,
	EndDate: Date,
	Priority: "int",
	Completed: Boolean
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
	login:function() {
		console.log(this.loginName, this.password);
		app.showLoading();
        this.stormProvider = new ProjectManager({ name: 'local', databaseName: 'ProjectManager' });
        this.stormProvider.onReady().then(function(){
            viewModel.projectList = viewModel.stormProvider.Projects.asKendoDataSource();
            $('.km-tabstrip').show();
			app.navigate("projectList.html");
        });
	},
    selectProject:function(){
        alert("select");
    },
    newProject:function(){
        viewModel.set("selectedProject", viewModel.projectList.createItem());
    },
    saveProject:function(){
        console.log(arguments);
    }
});