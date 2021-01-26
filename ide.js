function CanvasBox (nodename, numstr) {
	this.position = [0,0];
	this.size = [100, 50];
	this.nodename = nodename;
	this.numstr = numstr;
	this.dragging = false;
	this.leftBranch = null;
	this.rightBranch = null;
	this.parentNode = null;
	this.SetPosition = function(x, y) {
		this.position = [x-50, y-75];
	}
	this.DrawNode = function(){
		var ctx = document.getElementById("MainCanvas").getContext("2d");
		ctx.beginPath();
		ctx.rect(this.position[0], this.position[1], this.size[0], this.size[1]);
		ctx.fillStyle = "rgba(200, 200, 24, 1)";
		ctx.fill();
		ctx.font = "10px Arial, sans-serif";
		ctx.textAlign = "center";
		ctx.strokeText(this.nodename,this.position[0]+50, this.position[1]+25);
		ctx.closePath();
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

// callback functions
function onChangeHeaderFile(event) {
	var fileText;
	var file = event.target.files[0];
	var reader = new FileReader();
	reader.onload = function(e) {
	  fileText = e.target.result;
	  Xen2KHandle.readuserfunctions(fileText);
	};
	reader.readAsText(file);
  }
  // callback functions
  function onChangeProgramFile(event) {
	var fileText;
	var file = event.target.files[0];
	var reader = new FileReader();
	reader.onload = function(e) {
	  fileText = e.target.result;
	  Xen2KHandle.read(fileText);
	};
	reader.readAsText(file);
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
	AddNodeToCanvas([ev.clientX, ev.clientY], data);
}

var BranchPoint = 0;
var DrawingLine = [[0,0], [0,0]];
var BranchParent = null;
var isDragging = false;
function canvas_mousedown_handler(e) {
	var targetNode = null;
	for (var node of bareNodeList){
		if (e.clientX >= node.position[0] && e.clientX <= node.position[0] + node.size[0] && e.clientY >= node.position[1]+50 && e.clientY <= node.position[1]+node.size[1]+50 - 10) {
			targetNode = node;
		}
		else if (e.clientX >= node.position[0] && e.clientX < node.position[0] + node.size[0]/2 && e.clientY >= node.position[1]+node.size[1]+50 - 10 && e.clientY <= node.position[1]+node.size[1]+50) {
			
			targetNode = node;
			BranchParent = node;
			BranchPoint = 1;
		}
		else if (e.clientX >= node.position[0] + node.size[0]/2 && e.clientX < node.position[0] + node.size[0] && e.clientY >= node.position[1]+node.size[1]+50 - 10 && e.clientY <= node.position[1]+node.size[1]+50) {
			targetNode = node;
			BranchParent = node;
			BranchPoint = 2;
		}
	}
	if (targetNode !== null && BranchPoint !== 0){
		if (BranchPoint === 1)
			DrawingLine[0] = [targetNode.position[0] + targetNode.size[0] / 4, targetNode.position[1]+ targetNode.size[1]];
		else
			DrawingLine[0] = [targetNode.position[0] + 3* targetNode.size[0] / 4, targetNode.position[1]+ targetNode.size[1]];
		DrawingLine[1] = [e.clientX, e.clientY];
	}
	else if (targetNode !== null){
		targetNode.SetPosition(e.clientX, e.clientY);
		targetNode.dragging = true;
		if (bareNodeList.indexOf(targetNode) < bareNodeList.length-1) {
			bareNodeList.push(targetNode);
			bareNodeList.splice(bareNodeList.indexOf(targetNode),1);
		}
	} else {
		isDragging = true;
	}
}
function canvas_mousemove_handler(e){
	if (bareNodeList.length > 0 && bareNodeList[bareNodeList.length-1].dragging) {
		bareNodeList[bareNodeList.length-1].SetPosition(e.clientX, e.clientY);
	}
	if (BranchPoint !== 0){
		var ctx = document.getElementById("MainCanvas").getContext("2d");
		DrawingLine[1] = [e.clientX, e.clientY];
		ctx.beginPath();
		ctx.moveTo(DrawingLine[0][0], DrawingLine[0][1]);
		ctx.lineTo(DrawingLine[1][0], DrawingLine[1][1]);
		ctx.closePath();
		ctx.fillStyle = "black";
		ctx.lineWidth = 1.0;
		ctx.stroke();
	}
	if (isDragging){
		for (var node of bareNodeList) {
			node.position[0] += e.movementX;
			node.position[1] += e.movementY;
		}
	}
}
function canvas_mouseup_handler(e){
	if (bareNodeList.length >0) bareNodeList[bareNodeList.length-1].dragging = false;
	var targetNode = null;
	if (BranchPoint !== 0){
		for (var node of bareNodeList){
			if ( e.clientX >= node.position[0] && e.clientX <= node.position[0] + node.size[0] && e.clientY >= node.position[1]+50 && e.clientY <= node.position[1]+node.size[1]+50 - 10){
				var parentindex = bareNodeList.indexOf(BranchParent);
				if (BranchParent === node) break; // no self connect
				// No linking to root node
				var cancelLink = false;
				for (targetNode = node; targetNode.parentNode !== null; targetNode = targetNode.parentNode) {
					if (targetNode.parentNode === null) cancelLink = true;
				}
				if (cancelLink) break;
				// linking branch
				if (BranchPoint === 1) {
					if (bareNodeList[parentindex].leftBranch === null){
						bareNodeList[parentindex].leftBranch = node;
					} else {
						bareNodeList[parentindex].leftBranch.parentNode = null;
						bareNodeList[parentindex].leftBranch = node;
					}
				}
				else {
					if (bareNodeList[parentindex].rightBranch === null){
						bareNodeList[parentindex].rightBranch = node;
					} else {
						bareNodeList[parentindex].rightBranch.parentNode = null;
						bareNodeList[parentindex].rightBranch = node;
					}
				}
				node.parentNode = bareNodeList[parentindex];
				break;
			}
		}
	}
	//reset
	BranchParent = null;
	BranchPoint = 0;
	DrawingLine = [[0,0], [0,0]];
	isDragging = false;
}

function canvas_keydown_handler(e){
	if (e.keyCode === 46){ // delete node
		if (bareNodeList[bareNodeList.length-1].leftBranch !== null){
			bareNodeList[bareNodeList.length-1].leftBranch.parentNode = null;
		}
		if (bareNodeList[bareNodeList.length-1].rightBranch !== null){
			bareNodeList[bareNodeList.length-1].rightBranch.parentNode = null;
		}
		if (bareNodeList[bareNodeList.length-1].parentNode !== null){
			if (bareNodeList[bareNodeList.length-1].parentNode.leftBranch === bareNodeList[bareNodeList.length-1]){
				bareNodeList[bareNodeList.length-1].parentNode.leftBranch = null;
			}
			if (bareNodeList[bareNodeList.length-1].parentNode.rightBranch === bareNodeList[bareNodeList.length-1]){
				bareNodeList[bareNodeList.length-1].parentNode.rightBranch = null;
			}
		}
		bareNodeList.pop();
	}
}

function exporthandler(e) {
	if (bareNodeList.length === 0) return;
	var rootNodeList = new Array();
	for (var nodeElem of bareNodeList){
		if (nodeElem.parentNode === null) rootNodeList.push(nodeElem);
	}
	// sort rootNodeList
	var markedNodeIndex = 0;
	var sortComplete = false;
	while (!sortComplete){
		sortComplete = true;
		var minimum = 0;
		for (var nodeElem of rootNodeList){
			if (nodeElem.position[0] < rootNodeList[minimum].position[0]) {
				minimum = rootNodeList.indexOf(nodeElem);
				sortedComplete = false;
			}
		}
		tempNode = rootNodeList[minimum];
		rootNodeList.splice(minimum, 1, rootNodeList.splice(markedNodeIndex, 1, tempNode)[0]);
		markedNodeIndex += 1;
	}

	resultscript = "";
	for (var nodeElem of rootNodeList){
		resultscript += itoa(parseInt(nodeElem.numstr));
		resultscript += "=";
		recursiveScriptBuilder(nodeElem.leftBranch);
		resultscript += "+";
		recursiveScriptBuilder(nodeElem.rightBranch);
		resultscript+= ".";
	}
	//out to console
	document.getElementById("ide_console").innerHTML = resultscript;
}

// normal function
var resultscript = "";
function recursiveScriptBuilder(targetnode){
	if (targetnode.nodename === '*' || targetnode.nodename === '_') {
		resultscript += targetnode.numstr;
	} else {
		//function found
		resultscript+=itoa(parseInt(targetnode.numstr));
		resultscript += "=";
		recursiveScriptBuilder(targetnode.leftBranch);
		resultscript += "+";
		recursiveScriptBuilder(targetnode.rightBranch);
		resultscript+= ".";
	}
}

function itoa(number){
    //"Given a number, return a 11-based representation of it."
    var result = "";
    while (number !== 0){
        var r = number % 11;
        if (r < 10)
            result += r.toString() ;
        else
            result += " ";
        number = Math.trunc(number / 11);
	}
    return result.split("").reverse().join("");
}
function AddNodeToCanvas(pos, NodeName) {
	for (var node in NodeArray){
		if (NodeArray[node].nodename === NodeName){
			var sourceNode = new CanvasBox("","");
			Object.assign(sourceNode, NodeArray[node]);
			sourceNode.SetPosition(pos[0], pos[1]);
			bareNodeList.push(sourceNode);
			break;
		}
	}
}
function renderCanvas(){
	document.getElementById("MainCanvas").width = document.getElementById("MainCanvas").width; // reset the canvas
	for (var elem of bareNodeList){
		elem.DrawNode();
	}
	requestAnimationFrame(renderCanvas);
}

var bareNodeList = [];

var Background = document.createElement('div');
Background.id = "ide_main";
Background.style.display = "table-row-group";
Background.width = "800px";
Background.innerHTML = "<div id = \"nodelist\"> \
	X2K IDE<br>\
    </div> \
	<div id = \"mainplate\"> \
       <canvas id=\"MainCanvas\" width=\"800px\" height=\"550px\"></canvas> \
    </div>"
document.getElementById("mw-content-text").appendChild(Background);

var consolepage = document.createElement('div');
consolepage.id = "ide_console";
consolepage.width = "800px";
consolepage.innerHTML = "console";
document.getElementById("mw-content-text").appendChild(consolepage);

var NodeArray = [];
NodeArray.push(new CanvasBox('VARUSE','1008'));
NodeArray.push(new CanvasBox('BREAK','1561'));
NodeArray.push(new CanvasBox('DIV','1568'));
NodeArray.push(new CanvasBox('ADD','1638'));
NodeArray.push(new CanvasBox('SUB','1687'));
NodeArray.push(new CanvasBox('MUL','1715'));
NodeArray.push(new CanvasBox('NAND','1806'));
NodeArray.push(new CanvasBox('SHL','1813'));
NodeArray.push(new CanvasBox('SET','2177'));
NodeArray.push(new CanvasBox('STOP','2541'));
NodeArray.push(new CanvasBox('VARDEC','2548'));
NodeArray.push(new CanvasBox('OUTC','2562'));
NodeArray.push(new CanvasBox('OUTSTR','2569'));
NodeArray.push(new CanvasBox('IFEQ','7931'));
NodeArray.push(new CanvasBox('IFLT','7938'));
NodeArray.push(new CanvasBox('CMP','7980'));
NodeArray.push(new CanvasBox('WHILE','8225'));
NodeArray.push(new CanvasBox('*','*'));
NodeArray.push(new CanvasBox('_','_'));
for (var node of NodeArray) {
	document.getElementById("nodelist").innerHTML += "<div class=\"nodes\" style=\"display:inline;background-color:#ecb324;margin:2px;\" draggable=\"true\">"+node.nodename+"</div>";

}

var exportToFileButton = document.createElement("button");
exportToFileButton.id = "exportButton";
exportToFileButton.addEventListener("click", exporthandler);
exportToFileButton.innerText = "Export";
document.getElementById("ide_main").appendChild(exportToFileButton); 

var formElement = document.createElement('form');
formElement.name = "uploadedFile";
formElement.innerHTML = "<div> \
	  <span>함수꾸러미</span>\
      <input id=\"uploadInput\" type=\"file\" name=\"myFiles\" onchange=\"onChangeHeaderFile(event)\" multiple> \
    </div> \
	<div> \
	  <span>코드 파일</span>\
      <input id=\"uploadProgram\" type=\"file\" name=\"myProgram\" onchange=\"onChangeProgramFile(event)\" multiple> \
    </div>"
document.getElementById("mw-content-text").appendChild(formElement);

window.addEventListener('DOMContentLoaded', () => {
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
	element2.addEventListener("mouseup",canvas_mouseup_handler);
	element2.addEventListener("mousemove",canvas_mousemove_handler);
	document.addEventListener("keydown", canvas_keydown_handler);
	requestAnimationFrame(renderCanvas);
});