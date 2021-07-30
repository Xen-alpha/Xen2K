//Xen2K UI

// UI Objects 
// Dropdown
function DropdownMenu (menulist){
	this.position = [0,0];
	this.size = [120, 160];
	this.activated = false;
	this.MenuList = menulist; // contain [[a, name], [b, name2], ...]
	this.sightpoint = 0; // determine the visible range of MenuList (sightpoint~sightpoint + 10)
	this.DrawMenu = (ctx) => {
		ctx.beginPath();
		ctx.rect(this.position[0], this.position[1], this.size[0], this.size[1]);
		ctx.fillStyle = "rgba(120, 120, 120, 1)";
		ctx.fill();
		
		ctx.closePath();
		for (var index in this.MenuList){
			if (index < this.sightpoint || index >= this.sightpoint+10) continue;
			ctx.beginPath();
			ctx.font = "10px Arial, sans-serif";
			ctx.strokeStyle = "rgba(20, 20, 20, 1)";
			ctx.textAlign = "left";
			ctx.textBaseline = "top";
			ctx.strokeText(this.MenuList[index][1], this.position[0], 4+this.position[1]+(index - this.sightpoint)*16);
			ctx.closePath();
		}
		// draw the scroll position
		if (this.MenuList.length > 10){
			ctx.beginPath();
			ctx.rect(this.position[0] + this.size[0] - 5, this.position[1] + this.sightpoint * 16 * 10 / this.MenuList.length, 5, 160* 10 / this.MenuList.length);
			ctx.fillStyle = "rgba(80,80,80,1)";
			ctx.fill();
			ctx.closePath();
		}
	}
}

var FunctionInfoDefault = [
	['1001', "DEFCANVAS"],
	['1008', 'VARUSE'],
	['1015', "DEFVECTOR"],
	['1036', "CALLMEMBER"],
	['1043', "GETMEMBER"],
	['1029', 'SETMEMBER'],
	['1050', "DRAWRECT"], 
	['1057', "DRAWCIRCLE"], 
	['1064', "DRAWLINE"],
	['1092', "DRAWTEXT"],
	['1071', "SETTIMER"], 
	['1078', "DEFCALLBACK"],
	['1085', "LIST2STR"],
	['1099', 'SPAWNSTICKMAN'],
	['1561', 'BREAK'],
	['1568', 'DIV'],
	['1638','ADD'],
	['1687','SUB'],
	['1715','MUL'],
	['1806','NAND'],
	['1813','SHL'],
	['2177','SET'],
	['2541','STOP'],
	['2548','VARDEC'],
	['2562','OUTC'],
	['2569','OUTSTR'],
	['7931','IFEQ'],
	['7938','IFLT'],
	['7980','CMP'],
	['8225','WHILE'],
	['*','*'],
	['_','_']
	];
var DropMenuHandle = new DropdownMenu(FunctionInfoDefault);

//psuedo Node
function psuedoNode (nodeInfo) {
	this.position = [nodeInfo[0], nodeInfo[1]];
	this.nodename = nodeInfo[2];
	this.numstr = nodeInfo[2];
	this.left = nodeInfo[3];
	this.right = nodeInfo[4];
}

// Canvas Node
function CanvasBox (position, nodename, numstr) {
	this.position = position;
	this.size = [100, 50];
	this.nodename = nodename;
	this.numstr = numstr;
	this.value = "";
	this.dragging = false;
	this.leftBranch = null;
	this.rightBranch = null;
	this.parentNode = null;
	this.SetPosition = function(x, y) {
		this.position = [x-50, y-25];
	}
	this.DrawNode = function(){
		var ctx = document.getElementById("MainCanvas").getContext("2d");
		ctx.beginPath();
		ctx.rect(this.position[0], this.position[1], this.size[0], this.size[1]);
		ctx.fillStyle = "rgba(200, 200, 24, 1)";
		ctx.fill();
		ctx.font = "10px Arial, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.strokeText(this.nodename,this.position[0]+50, this.position[1]+25);
		ctx.closePath();
		if(this.numstr !== '*' && this.numstr !== '_') {
			ctx.beginPath();
			ctx.rect(this.position[0], this.position[1]+ this.size[1] - 10, this.size[0]/2, 10);
			ctx.fillStyle = "rgba(200, 20, 24, 1)";
			ctx.fill();
			ctx.closePath();
			ctx.beginPath();
			ctx.rect(this.position[0]+ this.size[0]/2, this.position[1]+ this.size[1] - 10, this.size[0]/2, 10);
			ctx.fillStyle = "rgba(200, 20, 240, 1)";
			ctx.fill();
			ctx.closePath();
		}
		if (this.leftBranch !== null) {
			ctx.beginPath();
			ctx.moveTo(this.position[0] + this.size[0] / 4, this.position[1]+ this.size[1]);
			ctx.lineTo(this.leftBranch.position[0] + this.leftBranch.size[0] / 2, this.leftBranch.position[1]);
			ctx.closePath();
			ctx.strokeStyle = "black";
			ctx.lineWidth = 1.0;
			ctx.stroke();
		}
		if (this.rightBranch !== null) {
			ctx.beginPath();
			ctx.moveTo(this.position[0] + 3 * this.size[0] / 4, this.position[1]+ this.size[1]);
			ctx.lineTo(this.rightBranch.position[0] + this.rightBranch.size[0] / 2, this.rightBranch.position[1]);
			ctx.closePath();
			ctx.strokeStyle = "black";
			ctx.lineWidth = 1.0;
			ctx.stroke();
		}
		if (this.value.length >0) {
			ctx.beginPath();
			ctx.rect(this.position[0]+this.size[0], this.position[1], 12 , this.size[1]);
			ctx.fillStyle = "rgba(255, 255, 255, 1)";
			ctx.fill();
			ctx.closePath();
			ctx.font = "12px Arial, sans-serif";
			ctx.textAlign = "left";
			ctx.textBaseline = "alphabetic";
			ctx.strokeText(this.value,this.position[0] +this.size[0], this.position[1]+25);
			
		}
	}
}

var classNodeList = [];


var contentChanged = 0;
// callback functions
function onChangeFile(event) {
	var fileText;
	FreshPageLoaded = false;
	var file = event.target.files[0];
	var reader = new FileReader();
	reader.onload = function(e) {
	  fileText = e.target.result;
	  contentChanged = 1;
	  classNodeList = PostLoadProject(fileText);
	};
	reader.readAsText(file);
}

function PostLoadProject (text) {
	var resultNodeList = [];
	var tempClassList = [];
	var classes = text.trim().split("&");
	// member variable initial value
	var classvariable = classes[0].trim().split(",");
	resultNodeList.push(classvariable);
	for(var i = 1; i < classes.length; i++){
		tempClassList = [];
		// member class Node making
		var classText = classes[i];
		var classfuncs = classText.trim().split("!");
		for (var j = 1; j < classfuncs.length; j++){
			var classfunction = new psuedoNode(classfuncs[j].trim().split(","));
			tempClassList.push(classfunction);
		}
		resultNodeList.push(tempClassList);
	}
	return resultNodeList;
}

function canvas_click_handler(e) {
	e.preventDefault();
	if (e.button == 0){

	} else if (e.button === 2){
		DropMenuHandle.activated = !DropMenuHandle.activated;
	}
}

function canvas_mousedown_handler(e) {
	e.preventDefault();
	if (e.button == 0){

	}
}
function canvas_mousemove_handler(e){
	
}
function canvas_mouseup_handler(e){
	e.preventDefault();
	if (e.button === 0) {
		
	
	} else if (e.button === 2) {
		// do nothing
	}
}

function canvas_wheel_handler(e) {
	e.preventDefault();
	
}

function canvas_keydown_handler(e){
	if (e.key === "Delete" ){
		
		
	}
}

function savehandler(e) {
}

// normal function

function playProgram(ev) {
	return;
}

function renderCanvas(){
	document.getElementById("MainCanvas").width = document.getElementById("MainCanvas").width; // reset the canvas
	if (currentCanvasClassIndex >=0 ) {
		if (currentCanvasFuncIndex >=0){
			for (var elem of bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex]){
				elem.DrawNode();
			}
		}
	}
	if (BranchPoint !== 0){
		var ctx = document.getElementById("MainCanvas").getContext("2d");
		ctx.beginPath();
		ctx.moveTo(DrawingLine[0][0], DrawingLine[0][1]);
		ctx.lineTo(DrawingLine[1][0], DrawingLine[1][1]);
		ctx.closePath();
		ctx.fillStyle = "black";
		ctx.lineWidth = 1.0;
		ctx.stroke();
	}

	if (DropMenuHandle.activated)DropMenuHandle.DrawMenu(document.getElementById("MainCanvas").getContext("2d"));
	requestAnimationFrame(renderCanvas);
}



var Background = document.createElement('div');
Background.id = "ide_main";
Background.style.display = "table-row-group";
Background.innerHTML = "<div id=\"functioncanvas\"></div>\
	<div id = \"mainplate\"> \
       <canvas id=\"MainCanvas\" width=\"800px\" height=\"600px\"></canvas> \
    </div>";
document.getElementById("mw-content-text").appendChild(Background);
Background.innerHTML += "<span id = \"nodelist\" width=\"800px\" height=\"600px\"> \
	Xen2K IDE\
    </span><br>";
Background.innerHTML += "클래스 이름<input id=\"varEdit\" name=\"ide_VarEdit\" onchange=\"EditClassName(event)\"><button onclick=\"createClass(event)\">새 클래스 만들기</button>";

var savedialog = document.createElement("dialog");
savedialog.id = "savedialog";
var saveform = document.createElement("form");
saveform.method = "dialog";
saveform.innerText = "저장되지 않은 데이터가 지워집니다";
var cancelbutton = document.createElement("button");
cancelbutton.setAttribute("value", 0);
cancelbutton.innerText = "돌아가기";
var okbutton = document.createElement("button");
okbutton.setAttribute("value", 1);
okbutton.innerText = "무시";
saveform.appendChild(cancelbutton);
saveform.appendChild(okbutton);
savedialog.appendChild(saveform);
savedialog.addEventListener('close', function () {
	contentChanged = parseInt(savedialog.returnValue);
});
document.getElementById("ide_main").appendChild(savedialog);

var SaveButton = document.createElement("button");
SaveButton.id = "saveButton";
SaveButton.addEventListener("click", savehandler);
SaveButton.data = 
SaveButton.innerText = "저장";
document.getElementById("ide_main").appendChild(SaveButton);

var PlayButton = document.createElement("button");
PlayButton.id = "playButton";
PlayButton.addEventListener("click", playProgram);
PlayButton.innerText = "실행";
document.getElementById("ide_main").appendChild(PlayButton);

var formElement = document.createElement('form');
formElement.name = "uploadedFile";
formElement.innerHTML = "\
	  <span>프로젝트 가져오기</span>\
      <input id=\"uploadInput\" type=\"file\" name=\"myFiles\" onchange=\"onChangeFile(event)\">";
document.getElementById("ide_main").appendChild(formElement);

var FreshPageLoaded = false;

window.addEventListener('DOMContentLoaded', () => {
	FreshPageLoaded = true;
	// Get the element by id
	// var element1 = document.getElementsByClassName("nodes");
		
	var element2 = document.getElementById("MainCanvas");
	
	element2.addEventListener("click", canvas_click_handler);
	element2.addEventListener("mousedown", canvas_mousedown_handler);
	element2.addEventListener("contextmenu", function(e) {e.preventDefault();});
	element2.addEventListener("mouseup",canvas_mouseup_handler);
	element2.addEventListener("mousemove",canvas_mousemove_handler);
	element2.addEventListener("wheel", canvas_wheel_handler);
	document.addEventListener("keydown", canvas_keydown_handler);
	
	requestAnimationFrame(renderCanvas);
	
});
