// maru.js
// Xen2K visual editor
// author: Xena

// var Xen2KHandle = new Xen2K();

function isWhitespace(c) {
    return (c === '-') || (c === '\r') || (c === '\n') || ((c >= 'A') && (c <= 'Z') && (c !== 'E') && (c !== 'S'));
}

function isDigit(c){
    return (c.charCodeAt(0) >= '0'.charCodeAt(0) && c.charCodeAt(0) <= '9'.charCodeAt(0)) || (c === ' ');
}
function digit(c){
    if (c.charCodeAt(0) >= '0'.charCodeAt(0) && c.charCodeAt(0) <= '9'.charCodeAt(0)){
        return (c.charCodeAt(0) - '0'.charCodeAt(0));
    }
    return 10;
}

function pointIsInArea(pos, area){
	if (pos[0] > area[0] && pos[0]< area[0]+ area[2] && pos[1] > area[1] && pos[1] < area[1]+ area[3]){
		return true;
	} else {
		return false;
	}
}

function atoi(number) {
    //"Given a 11-based number, return the integer for it"
    var result = 0;
    for (var c of number){
        if (isDigit(c)){
            result *= 11;
            result += digit(c);
		}
        else{
            break;
		}
	}
    return result;
}

function itoa(number) {
    //"Given a number, return a 11-based representation of it."
    var result = [];
    while (number !== 0){
        r = number % 11;
        if (r < 10) {
            result.push( r.toString() );
		}
		else if (r == NaN) { // we have to check this no matter of what type of r is.
			return "";
		}
        else {
            result.push( ' ' );
		}
        number = Math.trunc(number / 11);
	}
    result.reverse();
    return result.join('');
}

//class
function BreakLoop(Exception){
    this.message = Exception;
    this.name = "Break";
}
BreakLoop.prototype.toString = function () {
    return this.name + ': "' + this.message + '"';
}


function DropdownMenu (menulist){
	this.position = [0,0];
	this.size = [120, 160];
	this.activated = false;
	this.MenuList = menulist; // contain [[a, name], [b, name2], ...]
	this.sightpoint = 0; // determine the visible range of MenuList (sightpoint~sightpoint + 10)
	this.DrawMenu = () => {
		var ctx = document.getElementById("MainCanvas").getContext("2d");
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

var FunctionInfoElem = new Array(
    ['1001', "DEFCANVAS"], 
    ['1015', "DEFVECTOR"],
    ['1029', 'SETMEMBER'],
    ['1036', "CALLMEMBER"],
    ['1043', "GETMEMBER"],		
    ['1050', "DRAWRECT"], 
    ['1057', "DRAWCIRCLE"], 
    ['1064', "DRAWLINE"], 
    ['1071', "SETTIMER"], 
    ['1078', "DEFCALLBACK"],
    ['1085', "LIST2STR"],
    ['1092', "DRAWTEXT"],
    ['1099', 'SPAWNSTICKMAN']
    );

FunctionInfoElem.push(['1008', 'VARUSE']);
FunctionInfoElem.push(['1561', 'BREAK']);
FunctionInfoElem.push(['1568', 'DIV']);
FunctionInfoElem.push(['1638','ADD']);
FunctionInfoElem.push(['1687','SUB']);
FunctionInfoElem.push(['1715','MUL']);
FunctionInfoElem.push(['1806','NAND']);
FunctionInfoElem.push(['1813','SHL']);
FunctionInfoElem.push(['2177','SET']);
FunctionInfoElem.push(['2541','STOP']);
FunctionInfoElem.push(['2548','VARDEC']);
FunctionInfoElem.push(['2562','OUTC']);
FunctionInfoElem.push(['2569','OUTSTR']);
FunctionInfoElem.push(['7931','IFEQ']);
FunctionInfoElem.push(['7938','IFLT']);
FunctionInfoElem.push(['7980','CMP']);
FunctionInfoElem.push(['8225','WHILE']);
FunctionInfoElem.push(['*','*']);
FunctionInfoElem.push(['_','_']);

var DropdownMenuHandler = new DropdownMenu(FunctionInfoElem);

function CanvasBox (pos, nodename, numstr) {
	this.position = pos;
	this.size = [100, 50];
	this.nodename = nodename;
	this.numstr = numstr;
	this.comment = "";
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
		if (this.comment.length >0) {
			ctx.beginPath();
			ctx.rect(this.position[0]+this.size[0], this.position[1], 12 , this.size[1]);
			ctx.fillStyle = "rgba(255, 255, 255, 1)";
			ctx.fill();
			ctx.closePath();
			ctx.font = "12px Arial, sans-serif";
			ctx.textAlign = "left";
			ctx.textBaseline = "alphabetic";
			ctx.strokeText(this.comment,this.position[0] +this.size[0], this.position[1]+25);
			
		}
	}
}
var bareNodeList = [];
var focusedNode = null;
var contentChanged = 1;
// callback functions
function onChangeFile(event) {
	var fileText;
	FreshPageLoaded = false;
	var file = event.target.files[0];
	var reader = new FileReader();
	reader.onload = function(e) {
	  fileText = e.target.result;
	  contentChanged = 1;
	  bareNodeList = [];

	  PostLoadProject(fileText);
	};
	reader.readAsText(file);
}

var rightbuttonhandler = null;
var rightbuttonPressed = false;

function canvas_mousedown_handler(e) {
	if (e.button === 0){
		focusedNode = null;
		for (var node of bareNodeList){
			if (pointIsInArea([e.offsetX, e.offsetY], [node.position[0], node.position[1], node.size[0], node.size[1]] ) === true) {
				focusedNode = node;
				break;
			}
		}
		if (DropdownMenuHandler.activated === true) {
			if (pointIsInArea([e.offsetX, e.offsetY], [DropdownMenuHandler.position[0], DropdownMenuHandler.position[1], DropdownMenuHandler.size[0], DropdownMenuHandler.size[1]] ) === true) {
				var offset = Math.floor((e.offsetY - DropdownMenuHandler.position[1]) / 10);
				var target = offset + DropdownMenuHandler.sightpoint;
				bareNodeList.push(new CanvasBox(DropdownMenuHandler.position, DropdownMenuHandler.MenuList[target][1], DropdownMenuHandler.MenuList[target][0]));
			}
			DropdownMenuHandler.activated = false;
		}
	} else if (e.button === 2) {
		rightbuttonPressed = true;
		rightbuttonhandler = setTimeout(function (pos) {
			if (DropdownMenuHandler.activated === false) {
				DropdownMenuHandler.activated = true;
				DropdownMenuHandler.position = pos;
			}
		}, 200, [e.offsetX, e.offsetY]);
	}
}
function canvas_mousemove_handler(e){
	if (rightbuttonPressed === true && focusedNode === null) {
		clearTimeout(rightbuttonhandler);
		for (var elem of bareNodeList){
			elem.position[0] += e.movementX;
			elem.position[1] += e.movementY;
		}
	}
	if (focusedNode !== null && rightbuttonPressed === false){
		focusedNode.position[0] += e.movementX;
		focusedNode.position[1] += e.movementY;
	}
}
function canvas_mouseup_handler(e){
	e.preventDefault();
	if(e.button === 0){
		focusedNode = null;
	} else if (e.button === 2){
		clearTimeout(rightbuttonhandler);
		rightbuttonPressed = false;
	}
}

function canvas_wheel_handler(e) {
	e.preventDefault();
	if ( DropdownMenuHandler.activated === true) {
		if (e.wheelDeltaY > 0 && DropdownMenuHandler.sightpoint > 0) {
			DropdownMenuHandler.sightpoint--;
		}
		if (e.wheelDeltaY < 0 && DropdownMenuHandler.sightpoint < DropdownMenuHandler.MenuList.length - 10) {
			DropdownMenuHandler.sightpoint++;
		}
	}
}

function canvas_keydown_handler(e){
	
}

function PostLoadProject (fileText) {
	
}

function StringifyBareNodeList(CanvasBoxNode){
	
}

function savehandler(e) {
    /*
	// download the result
    if (contentChanged === 0) {
		var savemessagedialog = document.getElementById("savedialog");
		contentChanged = savemessagedialog.showModal();
	}
    else {
        var file = new Blob([], {type:"text/plain"});
        var a = document.createElement("a"),url = URL.createObjectURL(file);
        a.href = url;
        a.download = "savedata.x2k";
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0);
    }
    */
}

// normal function

function createClass() {
	
}

function deleteClass(ev)
{
	
}
function copyClass(ev)
{
	
}

function refreshClassExplorer () {
	
}


function createMemVar(ev) {
	
}
function deleteMemVar(ev) {
	
}
function createMemFunc(ev) {
	
}
function deleteMemFunc(ev) {
	
}

function EditMemberVar(ev) {
	
}

function playProgram(ev) {

}

function renderCanvas(){
	document.getElementById("MainCanvas").width = document.getElementById("MainCanvas").width; // reset the canvas

	for (var elem of bareNodeList){
		elem.DrawNode();
	}

	if(DropdownMenuHandler.activated === true)DropdownMenuHandler.DrawMenu();

	requestAnimationFrame(renderCanvas);
}

var Background = document.createElement('div');
Background.id = "ide_main";
Background.style.display = "table-row-group";
Background.innerHTML = "<div id=\"tabcanvas\"></div>\
<div id = \"mainplate\"> \
       <canvas id=\"MainCanvas\" width=\"800px\" height=\"600px\"></canvas> \
    </div>";
document.getElementById("mw-content-text").appendChild(Background);
Background.innerHTML += "<span id = \"nodelist\" width=\"800px\" height=\"600px\"> \
	Xen2K IDE<br>\
    </span>";

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

var projectsettings = document.createElement('div');
projectsettings.id = "ide_projectsettings";
projectsettings.innerHTML = "";
projectsettings.innerHTML += "<button onclick=\"createClass(event)\">새 클래스 만들기</button>"
document.getElementById("ide_main").appendChild(projectsettings);

var SaveButton = document.createElement("button");
SaveButton.id = "saveButton";
SaveButton.addEventListener("click", savehandler);
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
	  <span>꾸러미 가져오기</span>\
      <input id=\"uploadInput\" type=\"file\" name=\"myFiles\" onchange=\"onChangeFile(event)\">";
document.getElementById("ide_main").appendChild(formElement);


window.addEventListener('DOMContentLoaded', () => {
	
	var element2 = document.getElementById("MainCanvas");
	ctx = document.getElementById("MainCanvas").getContext("2d");

	
	element2.addEventListener("mousedown", canvas_mousedown_handler);
	element2.addEventListener("contextmenu", function(e) {e.preventDefault();return false;});
	element2.addEventListener("mouseup",canvas_mouseup_handler);
	element2.addEventListener("mousemove",canvas_mousemove_handler);
	element2.addEventListener("wheel", canvas_wheel_handler);
	document.addEventListener("keydown", canvas_keydown_handler);
	
	requestAnimationFrame(renderCanvas);
	
});
