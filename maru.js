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
		
	}
}

function X2KClass(idNum,classname, variables, functions){
	this.id = idNum;
	this.name = classname;
	this.varList = variables;
	this.classFunctions = functions; // list of subArray
	this.leftChild = -1;
	this.rightChild = -1;
	this.curVar = -1;
	this.curFunc = -1;
}

function linearizeClass(targetClass){
	// export to x2k file(not x2kp)
	var result = "& " + targetClass.name+"\n";
	for (var variable of targetClass.varList){
		result += "# " + variable[0] + "," + variable[1].toString()+"\n";
	}
	function recursiveStringifyFunction(functionNode){ // functionNode => CanvasBox
		if (functionNode === null) throw "Empty branch detected";
		if (functionNode.nodename === "*") return "*";
		if (functionNode.nodename === "_") return "_";
		var tempresult = functionNode.numstr;
		tempresult += "=";
		tempresult += recursiveStringifyFunction(functionNode.leftBranch);
		tempresult += "+";
		tempresult += recursiveStringifyFunction(functionNode.rightBranch);
		tempresult += ".";
		return tempresult;
	}
	for (var func of targetClass.classFunctions){
		// func will be an array of metadata for member functions
		result += "! ";
		try{
			result += recursiveStringifyFunction(func[1]);
		} catch (e){
			alert(e);
			return;
		}
		result += "\n";
	}
	return result;
}

var currentClass = 0;
var currentFunc = -1;
var currentVariable = -1;
var classList = [new X2KClass(0,"Main", [], [])];
var focusedNode = null;
var contentChanged = 0;
// callback functions
function onChangeFile(event) {
	var fileText;
	FreshPageLoaded = false;
	var file = event.target.files[0];
	var reader = new FileReader();
	reader.onload = function(e) {
	  fileText = e.target.result;
	  contentChanged = 0;
	  currentClass = 0;
	  currentFunc = 0;
	  PostLoadProject(fileText);
	};
	reader.readAsText(file);
}


var rightbuttonhandler = null;
var rightbuttonPressed = false;
var branchLeft = null;
var branchRight = null;
function canvas_mousedown_handler(e) {
	if (e.button === 0){
		focusedNode = null;
		branchLeft = null;
		branchRight = null;
		if (currentClass >=0 && currentFunc >= 0) {
			for (var node of classList[currentClass].classFunctions[currentFunc][1]){
				if (pointIsInArea([e.offsetX, e.offsetY], [node.position[0], node.position[1], node.size[0]-10, node.size[1]-10] ) === true) {
					focusedNode = node;
					break;
				} else if (pointIsInArea([e.offsetX, e.offsetY], [node.position[0], node.position[1] + node.size[1]-10, node.size[0]/2, 10] ) === true) {
					branchLeft = node;
					break;
				} else if (pointIsInArea([e.offsetX, e.offsetY], [node.position[0]+node.size[0]/2, node.position[1] + node.size[1]-10, node.size[0]/2, 10]) === true) {
					branchRight = node;
					break;
				}
			}
		}
		if (DropdownMenuHandler.activated === true) {
			if (currentClass >=0 && currentFunc >= 0) {
				if (pointIsInArea([e.offsetX, e.offsetY], [DropdownMenuHandler.position[0], DropdownMenuHandler.position[1], DropdownMenuHandler.size[0], DropdownMenuHandler.size[1]] ) === true) {
					var offset = Math.trunc((e.offsetY - DropdownMenuHandler.position[1]) / 16);
					var target = offset + DropdownMenuHandler.sightpoint;
					classList[currentClass].classFunctions[currentFunc][1].push(new CanvasBox(DropdownMenuHandler.position, DropdownMenuHandler.MenuList[target][1], DropdownMenuHandler.MenuList[target][0]));
				}
			}
			DropdownMenuHandler.activated = false;
		}
	} else if (e.button === 2) {
		if (currentFunc >= 0) {
			rightbuttonPressed = true;
			rightbuttonhandler = setTimeout(function (pos) {
				if (DropdownMenuHandler.activated === false) {
					DropdownMenuHandler.activated = true;
					DropdownMenuHandler.position = pos;
				}
			}, 200, [e.offsetX, e.offsetY]);
		}
	}
}
function canvas_mousemove_handler(e){
	if (rightbuttonPressed === true && focusedNode === null) {
		clearTimeout(rightbuttonhandler);
		if (currentClass >=0 && currentFunc >= 0) {
			for (var elem of classList[currentClass].classFunctions[currentFunc][1]){
				elem.position[0] += e.movementX;
				elem.position[1] += e.movementY;
			}
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
		if (focusedNode !== null) {
			focusedNode = null;
		}
		if (currentClass >= 0 && currentFunc >= 0){
			if (branchLeft !== null){
				for (var node of classList[currentClass].classFunctions[currentFunc][1]){
					if ( pointIsInArea([e.offsetX, e.offsetY], [node.position[0], node.position[1], node.size[0]-10, node.size[1]-10] ) === true) {
						if (branchLeft === node || node.parentNode !== null) continue;
						branchLeft.leftBranch = node;
						node.parentNode = branchLeft;
						break;
					}
				}
				branchLeft = null;
			}
			if (branchRight !== null){
				for (var node of classList[currentClass].classFunctions[currentFunc][1]){
					if ( pointIsInArea([e.offsetX, e.offsetY], [node.position[0], node.position[1], node.size[0]-10, node.size[1]-10] ) === true) {
						if(branchRight === node || node.parentNode !== null) continue;
						branchRight.rightBranch = node;
						node.parentNode = branchRight;
						break;
					}
				}
				branchRight = null;
			}
		}
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
	if (e.key === "Delete" && focusedNode !== null){
		if (currentClass >= 0 && currentFunc >= 0) {
			for (var nodenum in classList[currentClass].classFunctions[currentFunc]){
				if (focusedNode === classList[currentClass].classFunctions[currentFunc][1][nodenum]){
					classList[currentClass].classFunctions[currentFunc][1].splice(nodenum,1);
					break;
				}
			}
			focusedNode = null;
		}
	}
}

function PostLoadProject (fileText) {
	
}


function savehandler(e) {
	var result = "";
	// &: class name, #: class variable, !: class function node
	// save to x2kp file(not x2k file)
	for (var targetClass of classList) {
		result = "& " + targetClass.name+"\n";
		for (var variable of targetClass.varList){
			result += "# " + variable[0] + "," + variable[1].toString()+"\n";
		}
		
		for (var func of targetClass.classFunctions){
			// func will be an array of metadata and data for member functions
			result += "! ";
			try{
				if (func.nodename === "*" || func.nodename === "_" ) {
					result += func.position[0].toString() + "," + func.position[1].toString()+"," + func.nodename + "," + "-1" + "," + "-1";
					result += "\n";
					continue;
				}
				if (func.leftBranch === null || func.rightBranch === null) throw "Empty branch detected";
				result += func.position[0].toString() + "," + func.position[1].toString()+"," + func.nodename + "," + targetClass.classFunctions.indexOf(func.leftBranch)+ "," +targetClass.classFunctions.indexOf(func.rightBranch);
				result += "\n";
			} catch (e){
				alert(e);
				return "";
			}
		}
	}
	contentChanged = 0;
	var file = new Blob([result], {type:"text/plain"});
	var a = document.createElement("a"),url = URL.createObjectURL(file);
	a.href = url;
	a.download = "project.x2k";
	document.body.appendChild(a);
	a.click();
	setTimeout(function() {
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);  
	}, 0);
    
}

// normal function

function createClass(ev) {
	classList.push(new X2KClass(classList.length,"Class " + (classList.length).toString(10), [], []));
	currentClass = classList.length-1;
	currentFunc = -1;
	refreshEditor();
}

function deleteClass(ev)
{
	if(currentClass >= 0){
		classList.splice(parseInt(ev.target.value), 1);
		currentClass = 0;
	}
	refreshEditor();
}
function copyClass(ev) // for inheritance
{
	refreshEditor();
}

function loadClass(ev){
	currentClass = ev.target.value;
	currentFunc = -1;
	currentVariable = -1;
	refreshEditor();
}

function loadMapEditor(ev){
	currentClass = -1;
	currentFunc = -1;
	currentVariable = -1;
	refreshEditor();
}

function loadProjectSetting(ev){
	currentClass = -3;
	currentFunc = -1;
	currentVariable = -1;
	refreshEditor();
}

function loadUIEditor(ev) {
	currentClass = -2;
	currentFunc = -1;
	currentVariable = -1;
	refreshEditor();
}

function createMemVar(ev) {
	if(currentClass >=0){
		classList[currentClass].varList.push([classList[currentClass].varList.length, 0]);
		currentVariable = -1;
	}
	refreshEditor();
}
function deleteMemVar(ev) {
	if(currentClass >=0 && currentVariable >= 0) {
		classList[currentClass].varList.splice(parseInt(ev.target.value),1);
		currentVariable = -1;
	}
	refreshEditor();
}

function EditMemberVar(ev) {
	if(currentClass >= 0 && currentVariable >= 0)classList[currentClass].varList[currentVariable][1] = ev.target.value;
}
function SelectVariable(ev){
	for (var elem of document.getElementsByClassName("varinput")){
		elem.style.backgroundColor = "#ffffff";
		elem.style.display = "none";
	}
	for (var elem of document.getElementsByClassName("vardel")){
		elem.style.display = "none";
	}
	ev.target.style.backgroundColor = "#999890";
	document.getElementsByClassName("varinput")[parseInt(ev.target.value)].style.display = "block";
	document.getElementsByClassName("vardel")[parseInt(ev.target.value)].style.display = "block";
	currentVariable = parseInt(ev.target.value);
}

function createMemFunc(ev) {
	if(currentClass >=0){
		classList[currentClass].classFunctions.push(["함수 "+(classList[currentClass].classFunctions.length).toString(), []]);
		currentFunc = classList[currentClass].classFunctions.length-1;
	}
	refreshEditor();
}
function deleteMemFunc(ev) {
	if(currentClass >=0) {
		classList[currentClass].classFunctions.splice(parseInt(ev.target.value),1);
		currentFunc = -1;
	}
	refreshEditor();
}

function loadfunc(ev){
	for (var elem of document.getElementsByClassName("funcdel")){
		elem.style.display = "none";
	}
	currentFunc = parseInt(ev.target.value);
	document.getElementsByClassName("funcdel")[parseInt(ev.target.value)].style.display = "block";
	
}

function playProgram(ev) {

}

function refreshEditor(){
	var tabCanvas = document.getElementById("tabcanvas");
	tabCanvas.innerHTML = "";
	var settings = document.createElement("button");
	settings.id = "ProjectSetting";
	settings.innerText = " Project Settings ";
	if (-3 === currentClass) settings.style.backgroundColor = "#F99900";
	else settings.style.backgroundColor = "#999922";
	settings.style.border = "1px solid black";
	settings.style.display = "inline";
	settings.addEventListener("click", loadProjectSetting);
	var UIEditor = document.createElement("button");
	UIEditor.id = "UIEditor";
	UIEditor.innerText = " UI Editor ";
	if (-2 === currentClass) UIEditor.style.backgroundColor = "#F99900";
	else UIEditor.style.backgroundColor = "#999922";
	UIEditor.style.border = "1px solid black";
	UIEditor.style.display = "inline";
	UIEditor.addEventListener("click", loadUIEditor);
	var mapEditor = document.createElement("button");
	mapEditor.id = "mapEditor";
	mapEditor.innerText = " Map Editor ";
	if (-1 === currentClass) mapEditor.style.backgroundColor = "#F99900";
	else mapEditor.style.backgroundColor = "#999922";
	mapEditor.style.border = "1px solid black";
	mapEditor.style.display = "inline";
	mapEditor.addEventListener("click", loadMapEditor);
	document.getElementById("tabcanvas").appendChild(settings);
	document.getElementById("tabcanvas").appendChild(UIEditor);
	document.getElementById("tabcanvas").appendChild(mapEditor);
	for (var classdata of classList){
		var classTab = document.createElement("button");
		classTab.id = classdata.name;
		classTab.className = "classTab";
		classTab.value = classList.indexOf(classdata).toString();
		classTab.innerText = classdata.name;
		if (classTab.value === currentClass) classTab.style.backgroundColor = "#F99900";
		else classTab.style.backgroundColor = "#999922";
		classTab.style.border = "1px solid black";
		classTab.style.display = "inline";
		classTab.addEventListener("click", loadClass);
		document.getElementById("tabcanvas").appendChild(classTab);
		if (classList.indexOf(classdata) > 0){
			var delButton = document.createElement("button");
			delButton.className = "classdel";
			delButton.value = classList.indexOf(classdata).toString();
			delButton.innerText = "X";
			delButton.addEventListener("click",deleteClass);
			document.getElementById("tabcanvas").appendChild(delButton);
		}
	}

	var sideCanvas = document.getElementById("varlist");
	sideCanvas.innerHTML="";
	for (var index in classList[currentClass].varList){
		var vardiv = document.createElement("button");
		vardiv.className = "varlist_inner";
		vardiv.style.backgroundColor = "#808080";
		vardiv.value = index.toString();
		vardiv.addEventListener("click", SelectVariable);
		vardiv.innerHTML = "변수 "+ index.toString();
		var textbox = document.createElement("input");
		textbox.type = "text";
		textbox.size = "12";
		textbox.className = "varinput";
		textbox.value = classList[currentClass].varList[index][1].toString();
		textbox.style.backgroundColor = "#ffffff";
		textbox.addEventListener("change", EditMemberVar);
		textbox.style.display = "none";
		var delButton =document.createElement("button");
		delButton.style.backgroundColor = "#808080";
		delButton.className = "vardel";
		delButton.value = index.toString();
		delButton.addEventListener("click", deleteMemVar);
		delButton.innerText = "X";
		delButton.style.display = "none";

		sideCanvas.appendChild(vardiv);
		sideCanvas.appendChild(textbox);
		sideCanvas.appendChild(delButton);
	}
	var funclist = document.getElementById("funclist");
	funclist.innerHTML = "";
	for (var funcElem of classList[currentClass].classFunctions){
		var vardiv = document.createElement("button");
		vardiv.innerHTML = "함수 "+classList[currentClass].classFunctions.indexOf(funcElem).toString();
		vardiv.class = "classfunc";
		vardiv.value = classList[currentClass].classFunctions.indexOf(funcElem).toString();
		vardiv.addEventListener("click", loadfunc);
		funclist.appendChild(vardiv);
		var delButton =document.createElement("button");
		delButton.style.backgroundColor = "#808080";
		delButton.className = "funcdel";
		delButton.value = classList[currentClass].classFunctions.indexOf(funcElem).toString();
		delButton.addEventListener("click", deleteMemFunc);
		delButton.innerText = "X";
		delButton.style.display = "none";
		funclist.appendChild(delButton);
	}
	DropdownMenuHandler.activated = false;
}

function renderCanvas(){

	// reset main canvas
	document.getElementById("MainCanvas").width = document.getElementById("MainCanvas").width; // reset the canvas
	// draw current member function
	if (currentClass >= 0 && currentFunc >= 0) {
		for (var elem of classList[currentClass].classFunctions[currentFunc][1]){
			elem.DrawNode();
		}
	} else if (currentClass >= 0 && currentFunc <0) {
		var ctx = document.getElementById("MainCanvas").getContext("2d");
		ctx.beginPath();
		ctx.font = "10px Arial, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.strokeText("Select a function to modify",320, 240);
		ctx.closePath();
	} else if (currentClass === -1){
		// draw map editor
	} else if (currentClass === -2) {
		// draw UI editor
	} else if (currentClass === -3) {
		// draw Project Setting menu
	}

	if(DropdownMenuHandler.activated === true) DropdownMenuHandler.DrawMenu();

	requestAnimationFrame(renderCanvas);
}

var Background = document.createElement('div');
Background.id = "ide_main";
Background.style.display = "table-row-group";
Background.innerHTML = "<div id=\"tabcanvas\" style=\"width:640px;height:40px;background-color:#227433;display:inline-flex;overflow-y:hidden;overflow-x:scroll;\"></div>\
	<div id = \"mainplate\" style=\"width:640px;\"> \
       <canvas id=\"MainCanvas\" width=\"640px\" height=\"480px\" style=\"display:inline\"></canvas> \
    </div>";
document.getElementById("mw-content-text").appendChild(Background);
Background.innerHTML += "<span id = \"nodelist\" > \
	Xen2K IDE<br>\
	<div id=\"varlist\" style=\"width:640px;display:flex;overflow-x:scroll;\"></div>\
	<div id=\"funclist\" style=\"width:640px;display:flex;overflow-x:scroll;\"></div>\
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
okbutton.innerText = "계속";
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
projectsettings.innerHTML += "<button onclick=\"loadProjectSetting(event)\">프로젝트 세팅</button>";
projectsettings.innerHTML += "<button onclick=\"createClass(event)\">새 클래스 만들기</button>";
projectsettings.innerHTML += "<button onclick=\"createMemFunc(event)\">클래스 함수 만들기</button>";
projectsettings.innerHTML += "<button onclick=\"createMemVar(event)\">클래스 변수 만들기</button>";
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

refreshEditor();

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
