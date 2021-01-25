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
		ctx.rect(this.position[0], this.position[1]+ 40, this.size[0]/2, 10);
		ctx.fillStyle = "rgba(200, 20, 24, 1)";
		ctx.fill();
		ctx.closePath();
		ctx.beginPath();
		ctx.rect(this.position[0]+ this.size[0]/2, this.position[1]+ 40, this.size[0]/2, 10);
		ctx.fillStyle = "rgba(200, 20, 240, 1)";
		ctx.fill();
		ctx.closePath();
	}
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

function canvas_mousedown_handler(e) {
	var targetNode = null;
	for (var node of bareNodeList){
		if (e.clientX >= node.position[0] && e.clientX <= node.position[0] + node.size[0] && e.clientY >= node.position[1]+50 && e.clientY <= node.position[1]+node.size[1]+50 - 10) {
			targetNode = node;
		}
	}
	if (targetNode !== null){
		targetNode.SetPosition(e.clientX, e.clientY);
		targetNode.dragging = true;
		if (bareNodeList.indexOf(targetNode) < bareNodeList.length-1) {
			bareNodeList.push(targetNode);
			bareNodeList.splice(bareNodeList.indexOf(targetNode),1);
		}
	}
}
function canvas_mousemove_handler(e){
	if (bareNodeList.length > 0 && bareNodeList[bareNodeList.length-1].dragging) {
		bareNodeList[bareNodeList.length-1].SetPosition(e.clientX, e.clientY);
	}
}
function canvas_mouseup_handler(e){
	if (bareNodeList.length >0) bareNodeList[bareNodeList.length-1].dragging = false;
}

function canvas_keydown_handler(e){
	if (e.keyCode === 46){
		bareNodeList.pop();
	}
}

// normal function
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
       <canvas id=\"MainCanvas\" width=\"800px\" height=\"600px\"></canvas> \
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