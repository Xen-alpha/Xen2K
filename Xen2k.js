/**
 * Xen2K Javascript Converter
**/
const VERSION = "PSI 0.1.2";

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


//class
function BreakLoop(Exception){
    this.message = Exception;
    this.name = "Break";
}
BreakLoop.prototype.toString = function () {
    return this.name + ': "' + this.message + '"';
}

function TaskTree () {
	this.parentNode = null;
	this.name = null;
	//this.data = 0;
	this.leftBranch = null;
	this.rightBranch = null;
}

// main program class

function Xen2K() {
	// member variables/objects
	this.userfunctions = [];
	this.currentNodeList = [];
	// member functions
	this.readuserfunctions = function (data){
		this.userfunctions = [];
        if (data !== ""){
            var functiondata = data.split('! ')
            if (functiondata.length > 0){
                functiondata.splice(0,1); // removing useless empty string
			}
            if (functiondata.length > 0){
                for (let func of functiondata) {
                    var tokens = this.tokenize(func);
                    this.userfunctions.push(tokens);
				}
			}
		}
	};
	this.read = function(data){
        return this.parse(data);
	};
	this.parse = function(data){
        var tokens = this.tokenize(data);
        this.resultlist = [];
        this.variables = [];
        this.instructionSequence = [];
        this.currentNodeList = this.SetupTree(this.currentNodeList,tokens);
		
        this.outcCalled = false;
        this.Traverse(false);

        if (!this.outcCalled)
            document.getElementById("ide_console").innerText = String.fromCharCode(this.result);
	};
	this.SetupTree = function(NodeList,tokens){
		NodeList = [];
		var currentNode = null;
		var loopcount = 0;
		var treeDepth = 0;
		var indentcount = 0;
		var instructioncalled = false;
		for (var elem of tokens){
			if (indentcount === 0 && instructioncalled === false) {
				currentNode = new TaskTree();
			}
			switch (elem){
				case '/':
					if (instructioncalled) {
						indentcount += 1;
						currentNode.leftBranch = new TaskTree();
						currentNode.leftBranch.parentNode = currentNode;
						currentNode = currentNode.leftBranch;
					}
					else {
						currentNode = currentNode.parentNode; 
						currentNode.rightBranch = new TaskTree();
						currentNode.rightBranch.parentNode = currentNode;
						currentNode = currentNode.rightBranch;
					}
					break;
				case '=':
					indentcount += 1;
					currentNode.leftBranch = new TaskTree();
					currentNode.leftBranch.parentNode = currentNode;
					currentNode = currentNode.leftBranch;
					break;
				case '+':
					currentNode = currentNode.parentNode; 
					currentNode.rightBranch = new TaskTree();
					currentNode.rightBranch.parentNode = currentNode;
					currentNode = currentNode.rightBranch;
					break;
				case '\\':
				case '.':
					currentNode = currentNode.parentNode;
					indentcount -= 1;
					break;
				case '*': //random
				case '_': //previous
					currentNode.name = elem;
					instructioncalled = false;
					break;
				case '>': // function call
					var functionContent = tokens.slice(loopcount, tokens.indexOf('<',loopcount));
					var tempNodeTree = new TaskTree();
					var functionContentTree = this.SetupTree(tempNodeTree, functionContent);
					var ContentResult = this.invoke([functionContentTree, functionContentTree.leftBranch, functionContentTree.rightBranch], true);
					tokens.splice(loopcount, tokens.indexOf('<',loopcount)); // delete items except '<'
					for (var newelem of this.userfunctions[ContentResult]){
						tokens.splice(loopcount,0,newelem);
						loopcount += 1;
					}
				case '<':
					// do nothing, because we already have passed this token 
					break;
				default: // instruction
					currentNode.name = elem;
					instructioncalled = true;
					if (indentcount === 0){
						NodeList.push(currentNode);
					}
			}
			loopcount += 1;
		}
		return NodeList;
	};
	this.Traverse = (DoNotDisplay) => {
		for (var rootnode of this.currentNodeList){
			this.invoke([rootnode, rootnode.leftBranch, rootnode.rightBranch], DoNotDisplay);
		}
	};
	this.set = (value) =>{
        this.result = value;
        return this.result;
    };
	this.arg = (argument, DoNotDisplay = false)=>{
        if ( argument.name === '*') {
			return this.set(Math.floor(Math.random()* 10000));
		}
        else if (argument.name === '_')
            return this.result;
        else  // we need recursion to traverse the instruction tree
			return this.set( this.invoke([argument, argument.leftBranch, argument.rightBranch], DoNotDisplay) );
    };
		// 1001 , this.SETSIZE // set windows with size (arg0, arg1)
	this.VARUSE=(a, b)=>{
		a = this.arg(a, false);
		b = this.arg(b, false);
		this.lastUse = a;
		return this.set( this.variables[a][b] );
	}// "837": get arg0[arg1]
	this.BREAK= (a, b)=>{
		throw "Break Occurred";
	} // "119 ": throw error in Xen2K
	this.DIV = (a, b) => {
		return this.set( this.arg(a, false) / this.arg(b, false) );
	} // "11 6"
	this.ADD=(a, b)=>{
		return this.set( this.arg(a, false) + this.arg(b, false) );
	}// "125 "
	this.SUB=(a, b)=>{
		return this.set( this.arg(a, false) - this.arg(b, false) );
	}// "12 4"
	this.MUL=(a, b)=>{
		return this.set( this.arg(a, false) * this.arg(b, false) );
	} // "131 "
	this.NAND=(a, b)=>{
		a = Boolean(this.arg(a, false));
		b = Boolean(this.arg(b, false));
		function nand(a, b){
			return !(a && b);
		}
		return this.set( nand(a, b) );
	} // "13 2": NAND operation
	this.SHL=(a, b)=>{
		return this.set(this.arg(a, false) << this.arg(b, false));
	} // "13 9": SHIFT arg0's Bit left arg1 times
	this.SET=(a, b)=>{
		a = this.arg(a, false);
		b = this.arg(b, false);
		this.variables[this.lastUse][a] = b;
		return this.set( b );
	} // "16  " : arg0 <= arg1
	this.STOP=(a, b)=>{
		throw "Program Terminated";
	} // "1 00": stop the program
	this.VARDEC=(a, b)=>{
		a = this.arg(a, false);
		b = this.arg(b, false);
		this.variables[b] = new Array(a+1);
		return 0;
	} // "1 07" : declare integer list named arg1, with its length arg0
	this.OUTC=(a, b)=>{
		document.getElementById("ide_console").innerHTML += String.fromCharCode(this.set( this.arg(a, false)));
		this.outcCalled = true;
		return 0;
	} // "1 1 " : print ascii code of arg0(not working on windows mode)
	this.OUTSTR=(a, b)=>{
		for (var index in this.variables[this.arg(a, false)]) {
			document.getElementById("ide_console").innerHTML += String.fromCharCode(this.variables[this.arg(a, false)][index]);
		}
		this.set(this.variables[this.arg(a, false)]);
		this.outcCalled = true;
		return 0;
	}// "1 26": print ascii code array of arg0(not working on windows mode)
	this.IFEQ=(a, b)=>{
		a = this.arg(a, false);
		b = this.arg(b, false);
		if (this.cmpEqual){
			return this.set(a);
		}
		else{
			return this.set(b);
		}
	} // "5 60" : last compared was equal -> execute arg0, else -> execute arg1
	this.IFLT=(a, b)=>{
		a = this.arg(a, false);
		b = this.arg(b, false);
		if (this.cmpLess)
			return this.set(a);
		else{
			return this.set(b);
		}
	} // "5 67" : last arg0 < last arg1 -> execute arg0, else arg1
	this.CMP=(a, b)=>{
		a = this.arg(a, false);
		b = this.arg(b, false);
		this.cmpEqual = (a === b);
		this.cmpLess = a < b;
	} // "5  5" : compare arg0 and arg1 -> use this with 7931
	this.WHILE=(a, b)=>{
		while (true) {
			try{
				this.set(this.arg(a, false));
			}
			catch (e) {
				this.set(this.arg(b, false));
				console.log(e);
				break;
			}
		}
	} // "61 8" : infinite loop with execute arg0, excute arg1 if error occurred
	
	this.command = [
		['1008' , this.VARUSE], // "837": get arg0[arg1]
		['1561' , this.BREAK],// "119 ": throw error in Xen2K
		['1568' , this.DIV], // "11 6"
		['1638' , this.ADD], // "125 "
		['1687' , this.SUB], // "12 4"
		['1715' , this.MUL], // "131 "
		['1806' , this.NAND], // "13 2": NAND operation
		['1813' , this.SHL], // "13 9": SHIFT arg0's Bit left arg1 times
		['2177' , this.SET], // "16  " : arg0 <= arg1
		['2541' , this.STOP], // "1 00": stop the program
		['2548' , this.VARDEC], // "1 07" : declare integer list named arg1, with its length arg0
		['2562' , this.OUTC], // "1 1 " : print ascii code of arg0(not working on windows mode)
		['2569' , this.OUTSTR], // "1 26": print ascii code array of arg0(not working on windows mode)
		['7931' , this.IFEQ], // "5 60" : last compared was equal -> execute arg0, else -> execute arg1
		['7938' , this.IFLT], // "5 67" : arg0 < arg1 -> execute arg0, else arg1
		['7980' , this.CMP], // "5  5" : compare arg0 and arg1 -> use this with 7931
		['8225' , this.WHILE] // "61 8" : infinite loop with execute arg0, excute arg1 if error occurred
    ];
	this.functions = new Map(this.command);
	this.invoke= function(instruction, DoNotDisplay = false){
        var ISA = instruction;
        if (DoNotDisplay && ISA[0].name === '2562')
            return this.set(this.arg(ISA[1], DoNotDisplay));
        return (this.functions.get(ISA[0].name))(ISA[1],ISA[2]);
    };
	this.tokenize= function(data){
        var result = [];
        var number = 0;
        var isRecordingNumber = false;
        for (var c of data) {
            if (isDigit(c)) {
                if (!isRecordingNumber) {
                    isRecordingNumber = true;
                    number = digit(c);
                }
                else{
                    number *= 11;
                    number += digit(c);
                }
            }
            else if ("><".indexOf(c) !== -1) { // user-defined function call
                if (isRecordingNumber) {
                    isRecordingNumber = false;
                    result.push( number.toString() );
                }
                result.push( c );
            }
            else if ("/\\*_+.=".indexOf(c) !== -1) { // built-in function call
                if (isRecordingNumber) {
                    isRecordingNumber = false;
                    result.push( number.toString() );
                }
				result.push( c );
			}
		}
        if (isRecordingNumber)
            result.push( number.toString() );
		return result;
    };
	this.lookupFunction = function(token){
        return this.functions.get(token);
	};
}

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
	AddNodeToCanvas([ev.offsetX, ev.offsetY], data);
}

var BranchPoint = 0;
var DrawingLine = [[0,0], [0,0]];
var BranchParent = null;
var isDragging = false;
function canvas_mousedown_handler(e) {
	var targetNode = null;
	for (var node of bareNodeList){
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
	if (targetNode !== null && BranchPoint !== 0){
		if (BranchPoint === 1)
			DrawingLine[0] = [targetNode.position[0] + targetNode.size[0] / 4, targetNode.position[1]+ targetNode.size[1]];
		else
			DrawingLine[0] = [targetNode.position[0] + 3* targetNode.size[0] / 4, targetNode.position[1]+ targetNode.size[1]];
		DrawingLine[1] = [e.offsetX, e.offsetY];
	}
	else if (targetNode !== null){
		targetNode.SetPosition(e.offsetX, e.offsetY);
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
		bareNodeList[bareNodeList.length-1].SetPosition(e.offsetX, e.offsetY);
	}
	if (isDragging){
		for (var node of bareNodeList) {
			node.position[0] += e.movementX;
			node.position[1] += e.movementY;
		}
	}
	if (BranchPoint !== 0) {
		DrawingLine[1] = [e.offsetX, e.offsetY];
	}
}
function canvas_mouseup_handler(e){
	if (bareNodeList.length >0) bareNodeList[bareNodeList.length-1].dragging = false;
	var targetNode = null;
	if (BranchPoint !== 0){
		for (var node of bareNodeList){
			if ( e.offsetX >= node.position[0] && e.offsetX <= node.position[0] + node.size[0] && e.offsetY >= node.position[1] && e.offsetY <= node.position[1]+node.size[1] - 10){
				var parentindex = bareNodeList.indexOf(BranchParent);
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
	//load result to console
	//document.getElementById("ide_console").innerHTML = resultscript;
	Xen2KHandle.read(resultscript);
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
	requestAnimationFrame(renderCanvas);
}

var Xen2KHandle = new Xen2K();

var bareNodeList = [];

var Background = document.createElement('div');
Background.id = "ide_main";
Background.style.display = "table-row-group";
Background.width = "800px";
Background.innerHTML = "<div id = \"mainplate\"> \
       <canvas id=\"MainCanvas\" width=\"800px\" height=\"550px\"></canvas> \
    </div> \
	<div id = \"nodelist\"> \
	X2K IDE<br>\
    </div> ";
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
