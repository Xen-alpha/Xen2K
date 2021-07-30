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

var bareNodeList = [];
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

var contentChanged = 0;
// callback functions
function onChangeFile(event) {
	document.getElementById("ide_class").innerHTML = "변수 수정<input id=\"varEdit\" name=\"ide_VarEdit\" onchange=\"EditMemberVar(event)\">";
	document.getElementById("ide_class").innerHTML += "<button onclick=\"createFunction(event)\">새 함수 만들기</button>"
	var fileText;
	FreshPageLoaded = false;
	var file = event.target.files[0];
	var reader = new FileReader();
	reader.onload = function(e) {
	  fileText = e.target.result;
	  contentChanged = 1;
	  bareNodeList = [];
	  PostLoadProject();
	};
	reader.readAsText(file);
}

function PostLoadProject () {
	return;
}

function dragstart_handler(ev) {
	// Add the target element's id to the data transfer object
	ev.dataTransfer.setData("text/plain", ev.target.innerHTML);
}

function dragover_handler(ev) {
 ev.preventDefault();
 ev.dataTransfer.dropEffect = "move";
}
function drop_handler(ev) {
	ev.preventDefault();
	// Get the id of the target and add the moved element to the target's DOM
	const data = ev.dataTransfer.getData("text/plain");
	AddNodeToCanvas([ev.offsetX, ev.offsetY], data);
	
}
var currentCanvasClassIndex = -1;
var currentCanvasFuncIndex = -1;
var BranchPoint = 0;
var DrawingLine = [[0,0], [0,0]];
var BranchParent = null;
var isDragging = false;
var rightbuttonDragging = false;
var rightbuttonDraggingTimer = null;
var focusedIndex = -1;
var deleteType = 0;
function canvas_mousedown_handler(e) {
	e.preventDefault();
	if (e.button === 0) {
		if (currentCanvasClassIndex === -1 || currentCanvasFuncIndex === -1) return;
		var targetNode = null;
		for (var node of bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex]){
			if (e.offsetX >= node.position[0] && e.offsetX <= node.position[0] + node.size[0] && e.offsetY >= node.position[1] && e.offsetY <= node.position[1]+node.size[1] - 10) {
				targetNode = node;
			}
			else if (e.offsetX >= node.position[0] && e.offsetX < node.position[0] + node.size[0]/2 && e.offsetY >= node.position[1]+node.size[1] - 10 && e.offsetY <= node.position[1]+node.size[1]) {
				targetNode = node;
				if(node.numstr !== '*' && node.numstr !== '_') {
					BranchParent = node;
					BranchPoint = 1;
				}
			}
			else if (e.offsetX >= node.position[0] + node.size[0]/2 && e.offsetX < node.position[0] + node.size[0] && e.offsetY >= node.position[1]+node.size[1] - 10 && e.offsetY <= node.position[1]+node.size[1]) {
				targetNode = node;
				if(node.numstr !== '*' && node.numstr !== '_') {
					BranchParent = node;
					BranchPoint = 2;
				}
			}
		}
		if (targetNode !== null && targetNode.constructor === CanvasBox && BranchPoint !== 0){
			//linking branch started
			if (BranchPoint === 1)
				DrawingLine[0] = [targetNode.position[0] + targetNode.size[0] / 4, targetNode.position[1]+ targetNode.size[1]];
			else
				DrawingLine[0] = [targetNode.position[0] + 3* targetNode.size[0] / 4, targetNode.position[1]+ targetNode.size[1]];
			DrawingLine[1] = [e.offsetX, e.offsetY];
		}
		else if (targetNode !== null && targetNode.constructor === CanvasBox){
			//bootstrap the clicked node
			targetNode.SetPosition(e.offsetX, e.offsetY);
			targetNode.dragging = true;
			focusedIndex = bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex].indexOf(targetNode);
			deleteType = 0;
		} else if (DropMenuHandle.activated && e.offsetX >= DropMenuHandle.position[0] && e.offsetX < DropMenuHandle.position[0] + DropMenuHandle.size[0] && e.offsetY >= DropMenuHandle.position[1] && e.offsetY < DropMenuHandle.position[1] + DropMenuHandle.size[1] ) {
			// click element inside dropdown menu
			var clickpointY = Math.floor((e.offsetY- DropMenuHandle.position[1] ) / 16);
			bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex].push(new CanvasBox(DropMenuHandle.MenuList[clickpointY + DropMenuHandle.sightpoint][1] , itoa(parseInt(DropMenuHandle.MenuList[clickpointY + DropMenuHandle.sightpoint][0])) ));
			bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex].length-1].index = bareNodeList.length-1;
			bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex].length-1].SetPosition(e.offsetX, e.offsetY);
			contentChanged = 0;
		}
		else {
			// moving background
			isDragging = true;
		}
		
		DropMenuHandle.activated = false;
	} else if (e.button === 2) {
		DropMenuHandle.activated = false;
		if (rightbuttonDraggingTimer !== null) {
			clearTimeout(rightbuttonDraggingTimer);
			rightbuttonDraggingTimer = null;
			var targetNode = null;
			
			if (currentCanvasClassIndex <0 || currentCanvasFuncIndex <0) return;
			for (var node of bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex]){
				if (e.offsetX >= node.position[0] && e.offsetX <= node.position[0] + node.size[0] && e.offsetY >= node.position[1] && e.offsetY <= node.position[1]+node.size[1] - 10) {
					targetNode = node;
				}
			}
			if (targetNode !== null) {
				typingComment = targetNode;
			}
			
		} else {
			rightbuttonDraggingTimer = setTimeout(function (x, y) {
				DropMenuHandle.position = [x, y];
				DropMenuHandle.activated = true;
			}, 200, e.offsetX, e.offsetY);
		}
	}
}
function canvas_mousemove_handler(e){
	if (focusedIndex>=0){
		if (currentCanvasClassIndex >=0 && currentCanvasFuncIndex >= 0) {
			if (bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex].length > 0 && bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][focusedIndex].dragging) {
				bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][focusedIndex].SetPosition(e.offsetX, e.offsetY);
				return;
			}
		}
	}
	if (isDragging){
		if (currentCanvasClassIndex >=0 && currentCanvasFuncIndex >= 0) {
			for (var node of bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex]) {
				node.position[0] += e.movementX;
				node.position[1] += e.movementY;
			}
		}
		return;
	}
	if (BranchPoint !== 0) {
		DrawingLine[1] = [e.offsetX, e.offsetY];
	}
}
function canvas_mouseup_handler(e){
	e.preventDefault();
	if (e.button === 0) {
		if (focusedIndex >= 0){
			if (currentCanvasClassIndex >= 0 && bareNodeList_constructor[currentCanvasClassIndex].length >0 ) {
				bareNodeList_constructor[currentCanvasClassIndex][focusedIndex].dragging = false;
			}
			if (currentCanvasClassIndex >= 0 && currentCanvasFuncIndex >=0 && bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex].length >0) {
				bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][focusedIndex].dragging = false;
			}
		}
		var targetNode = null;
		if (BranchPoint !== 0){
			if (currentCanvasClassIndex === -1 || currentCanvasFuncIndex === -1) return;
			for (var node of bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex]){
				if ( e.offsetX >= node.position[0] && e.offsetX <= node.position[0] + node.size[0] && e.offsetY >= node.position[1] && e.offsetY <= node.position[1]+node.size[1] - 10){
					var parentindex = bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex].indexOf(BranchParent);
					if (BranchParent === node) break; // no self connect
					// No linking to root node
					var cancelLink = false;
					for (targetNode = node; targetNode.parentNode !== null; targetNode = targetNode.parentNode) {
						if (targetNode.parentNode === null) cancelLink = true;
					}
					if (cancelLink) break;
					// no double-linking
					if (node.parentNode !== null) break;
					// linking branch
					
					if (BranchPoint === 1) {
						if (bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][parentindex].leftBranch === null){
							bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][parentindex].leftBranch = node;
						} else {
							bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][parentindex].leftBranch.parentNode = null;
							bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][parentindex].leftBranch = node;
						}
					}
					else {
						if (bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][parentindex].rightBranch === null){
							bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][parentindex].rightBranch = node;
						} else {
							bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][parentindex].rightBranch.parentNode = null;
							bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][parentindex].rightBranch = node;
						}
					}
					node.parentNode = bareNodeList[parentindex];
					break;
				}
			}
			contentChanged = 0;
		}
		//reset
		BranchParent = null;
		BranchPoint = 0;
		DrawingLine = [[0,0], [0,0]];
		isDragging = false;
		
	} else if (e.button === 2) {
		// do nothing
	}
}

function canvas_wheel_handler(e) {
	e.preventDefault();
	if (e.offsetX >= DropMenuHandle.position[0] && e.offsetX < DropMenuHandle.position[0] + DropMenuHandle.size[0] && e.offsetY >= DropMenuHandle.position[1] && e.offsetY < DropMenuHandle.position[1] + DropMenuHandle.size[1]) {
		if (DropMenuHandle.sightpoint > 0 && e.deltaY < 0) DropMenuHandle.sightpoint -= 1;
		else if (DropMenuHandle.sightpoint + 10 < DropMenuHandle.MenuList.length && e.deltaY > 0) DropMenuHandle.sightpoint += 1;
	}
}

var typingComment = null;

function canvas_keydown_handler(e){
	if (e.key === "Delete" && focusedIndex !== -1 && typingComment === null){
		
		if ( bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex].length > 0){ // delete node
			if (bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][focusedIndex].leftBranch !== null){
				bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][focusedIndex].leftBranch.parentNode = null;
			}
			if (bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][focusedIndex].rightBranch !== null){
				bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][focusedIndex].rightBranch.parentNode = null;
			}
			if (bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][focusedIndex].parentNode !== null){
				if (bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][focusedIndex].parentNode.leftBranch === bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][focusedIndex]){
					bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][focusedIndex].parentNode.leftBranch = null;
				}
				if (bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][focusedIndex].parentNode.rightBranch === bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][focusedIndex]){
					bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][focusedIndex].parentNode.rightBranch = null;
				}
			}
			bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex].splice(focusedIndex, 1);
			focusedIndex = -1;
		}
	} else if (typingComment !== null) {
		e.preventDefault();
		if (e.key === "Backspace") {
			typingComment.comment = typingComment.comment.substring(0, typingComment.comment.length-1);
		} else if (e.key === "Enter"){
			typingComment = null;
		} else if (e.key !== "Shift" && e.key !== ",") {
			typingComment.comment += e.key;
		}
		contentChanged = 0;
	}
}

function StringifyBareNodeList(CanvasBoxNode){ // CanvasBoxNode: an array of CanvasBox objects
	var result = "";
	var rootNodeList = [];
	for (var elem in CanvasBoxNode){
		if (CanvasBoxNode[elem].parentNode === null) {
			rootNodeList.push(CanvasBoxNode[elem]); //type: CanvasBox
		}
	}
	if (rootNodeList.length>= 2){
		var sorted = false;
		while (!sorted) {
			sorted = true;
			for (var index1 = 0; index1 < rootNodeList.length -1 ; index1++) {
				if (rootNodeList[index1].position[0] > rootNodeList[index1+1].position[0]) {
					sorted = false;
					var temp = rootNodeList[index1];
					rootNodeList[index1] = rootNodeList[index1+1];
					rootNodeList[index1+1] = temp;
				}

			}
		}
	}
	
	function recursiveScriptBuilder(targetnode){ // targetnode == a node of rootNodeList(CanvasBox)
		if (targetnode.nodename === '*' || targetnode.nodename === '_') {
			result += targetnode.numstr;
			return;
		} else {
			//function found
			result+=targetnode.numstr;
			result += "=";
			recursiveScriptBuilder(targetnode.leftBranch);
			result += "+";
			recursiveScriptBuilder(targetnode.rightBranch);
			result+= ".";
			return;
		}
	}
	
	for (var index1 of rootNodeList){
		recursiveScriptBuilder(index1);
	}

	return result;
}

function savehandler(e) {
	if (contentChanged === 0) {
		var savemessagedialog = document.getElementById("savedialog");
		savemessagedialog.showModal();
	} else {
		// member saving
		var resultscript = StringifyBareNodeList(bareNodeList);
		
		// download the result
		var file = new Blob([resultscript], {type:"text/plain"});
		var a = document.createElement("a"),url = URL.createObjectURL(file);
		a.href = url;
		a.download = e.data;
		document.body.appendChild(a);
		a.click();
		setTimeout(function() {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);  
		}, 0);
	}
}

// normal function

function AddNodeToCanvas(pos, NodeName) {
	for (var node in NodeArray){
		if (NodeArray[node].nodename === NodeName){
			var sourceNode = new CanvasBox("","");
			Object.assign(sourceNode, NodeArray[node]);
			if (sourceNode.numstr !== "*" && sourceNode.numstr !== "_") sourceNode.numstr = itoa(parseInt(sourceNode.numstr));
			sourceNode.SetPosition(pos[0], pos[1]);
			if (currentCanvasClassIndex >=0 && currentCanvasFuncIndex >=0){
				sourceNode.index = bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex].length;
				bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex].push(sourceNode);
				contentChanged = 0;
			}
			
			break;
		}
	}
}

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

var FunctionInfoDefault = [
		['1001', "DEFCANVAS"],
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
		['1099', 'SPAWNSTICKMAN']
		];
var DropMenuHandle = new DropdownMenu(FunctionInfoDefault);

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

var FunctionInfos = new Map(FunctionInfoElem);

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

var consolepage = document.createElement('div');
consolepage.id = "ide_console";
consolepage.innerHTML = "console\n";
document.getElementById("ide_main").appendChild(consolepage);

var classpage = document.createElement('div');
classpage.id = "ide_class";
classpage.innerHTML = "변수 수정<input id=\"varEdit\" name=\"ide_VarEdit\" onchange=\"EditMemberVar(event)\">";
document.getElementById("mainplate").appendChild(classpage);

var NodeArray = [];
NodeArray.push(new CanvasBox([0,0],'VARUSE','1008'));
NodeArray.push(new CanvasBox([0,0],'BREAK','1561'));
NodeArray.push(new CanvasBox([0,0],'DIV','1568'));
NodeArray.push(new CanvasBox([0,0],'ADD','1638'));
NodeArray.push(new CanvasBox([0,0],'SUB','1687'));
NodeArray.push(new CanvasBox([0,0],'MUL','1715'));
NodeArray.push(new CanvasBox([0,0],'NAND','1806'));
NodeArray.push(new CanvasBox([0,0],'SHL','1813'));
NodeArray.push(new CanvasBox([0,0],'SET','2177'));
NodeArray.push(new CanvasBox([0,0],'STOP','2541'));
NodeArray.push(new CanvasBox([0,0],'VARDEC','2548'));
NodeArray.push(new CanvasBox([0,0],'OUTC','2562'));
NodeArray.push(new CanvasBox([0,0],'OUTSTR','2569'));
NodeArray.push(new CanvasBox([0,0],'IFEQ','7931'));
NodeArray.push(new CanvasBox([0,0],'IFLT','7938'));
NodeArray.push(new CanvasBox([0,0],'CMP','7980'));
NodeArray.push(new CanvasBox([0,0],'WHILE','8225'));
NodeArray.push(new CanvasBox([0,0],'*','*'));
NodeArray.push(new CanvasBox([0,0],'_','_'));
for (var node of NodeArray) {
	document.getElementById("nodelist").innerHTML += "<div class=\"nodes\" style=\"display:inline;background-color:#ecb324;margin:2px;\" draggable=\"true\">"+node.nodename+"</div>";
}

var FreshPageLoaded = false;

window.addEventListener('DOMContentLoaded', () => {
	FreshPageLoaded = true;
	// Get the element by id
	var element1 = document.getElementsByClassName("nodes");
	// Add the ondragstart event listener
	for (var elem of element1) {
		elem.addEventListener("dragstart", dragstart_handler);
	}
	
	var element2 = document.getElementById("MainCanvas");
	// Add the ondragstart event listener
	element2.addEventListener("drop", drop_handler);
	element2.addEventListener("dragover", dragover_handler);

	element2.addEventListener("mousedown", canvas_mousedown_handler);
	element2.addEventListener("contextmenu", function(e) {e.preventDefault();return false;});
	element2.addEventListener("mouseup",canvas_mouseup_handler);
	element2.addEventListener("mousemove",canvas_mousemove_handler);
	element2.addEventListener("wheel", canvas_wheel_handler);
	document.addEventListener("keydown", canvas_keydown_handler);
	
	requestAnimationFrame(renderCanvas);
	
});
