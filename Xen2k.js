/**
 * Xen2K Javascript Converter
**/
const VERSION = "PSI 0.1.2";

var DrawableObjectList = [];
function DrawableObject (parentobj, a, b, type){
	this.a = a;
	this.b = b;
	this.type = type;
	this.parentObject = parentobj;
	this.loopAnimation = false;
	this.animationSequenceNumber = 0;
	this.maxAnimationSequenceNumber = 0;
	this.Draw = function () {
		if (this.type === 0) { // rectangle
			if (Xen2KHandle.console2Canvas && Xen2KHandle.currentCanvas !== null) {
				var pos = a;
				var size = b;
				Xen2KHandle.currentCanvas.beginPath();
				Xen2KHandle.currentCanvas.rect(parseInt(pos[0]), parseInt(pos[1]), parseInt(size[0]), parseInt(size[1]));
				Xen2KHandle.currentCanvas.closePath();
				Xen2KHandle.currentCanvas.fillStyle = "rgba(255, 255, 255,1)";
				Xen2KHandle.currentCanvas.fill();
			}
		} else if (this.type === 1) { // circle
			if (Xen2KHandle.console2Canvas && Xen2KHandle.currentCanvas !== null) {
				var pos = a;
				var radius = b;
				Xen2KHandle.currentCanvas.beginPath();
				Xen2KHandle.currentCanvas.arc(parseInt(pos[0]), parseInt(pos[1]), radius, 0, 2*Math.PI, true);
				Xen2KHandle.currentCanvas.closePath();
				Xen2KHandle.currentCanvas.fillStyle = "rgba(255, 255, 255,1)";
				Xen2KHandle.currentCanvas.fill();
				Xen2KHandle.currentCanvas.strokeStyle = "rgba(255, 255, 255,1)";
				Xen2KHandle.currentCanvas.stroke();
			}
		} else if (this.type === 2) { // line
			if (Xen2KHandle.console2Canvas && Xen2KHandle.currentCanvas !== null) {
				if (this.parentObject !== null) {
					var pos2 = b;
					Xen2KHandle.currentCanvas.beginPath();
					Xen2KHandle.currentCanvas.moveTo(parseInt(this.parentObject.b[0]), parseInt(this.parentObject.b[1]));
					Xen2KHandle.currentCanvas.LineTo(parseInt(pos2[0]), parseInt(pos2[1]));
					Xen2KHandle.currentCanvas.closePath();
					Xen2KHandle.currentCanvas.fillStyle = "rgba(255, 255, 255,1)";
					Xen2KHandle.currentCanvas.fill();
				} else {
					var pos = a;
					var pos2 = b;
					Xen2KHandle.currentCanvas.beginPath();
					Xen2KHandle.currentCanvas.moveTo(parseInt(pos[0]), parseInt(pos[1]));
					Xen2KHandle.currentCanvas.LineTo(parseInt(pos2[0]), parseInt(pos2[1]));
					Xen2KHandle.currentCanvas.closePath();
					Xen2KHandle.currentCanvas.fillStyle = "rgba(255, 255, 255,1)";
					Xen2KHandle.currentCanvas.fill();
				}
			}
		} else if (this.type === 3) { // text
			if (Xen2KHandle.console2Canvas && Xen2KHandle.currentCanvas !== null) {
				var targetText = a;
				var pos = b;
				Xen2KHandle.currentCanvas.beginPath();
				Xen2KHandle.currentCanvas.font = "12px Arial, sans-serif";
				Xen2KHandle.currentCanvas.textAlign = "center";
				Xen2KHandle.currentCanvas.textBaseline = "alphabetic";
				Xen2KHandle.currentCanvas.strokeText(targetText, parseInt(pos[0]), parseInt(pos[1]));
				Xen2KHandle.currentCanvas.closePath();
			}
		}
		// no more Draw method addition to this part!
	}
	// rotate method
	this.rotate = function (targetPoint, basePoint, angle) {
		var movedPoint = [targetPoint[0] - basePoint[0], targetPoint[1] - basePoint[1]];
		var rotatedPoint = [Math.cos(Math.PI / 180 * angle) *movedPoint[0] - Math.sin(Math.PI/180 * angle) * movedPoint[1], Math.sin(Math.PI/180 * angle) * movedPoint[0] + Math.cos(Math.PI / 180 * angle) *movedPoint[1]];
		targetPoint = [basePoint[0] + rotatedPoint[0], basePoint[1] + rotatedPoint[1]];
		return targetPoint;
		
	}
}

function StickMan (a, b) {
	DrawableObject.call(null,null,null,-1);
	this.position = a; // feet position
	this.weight = b;
	this.name = "";
	this.parentobject = parentobj;
	this.childnodeList = [];
	this.animationSequenceNumber = 0;
	this.maxAnimationSequenceNumber = 179;
	this.loopAnimation = true;
	this.walkingAnimationCommand = [];
	// build skeletal tree: the head Object will be a neck~pelvis of stickman(body)
	this.rootObject = new DrawableObject(this,[position[0], position[1]-60], [position[0], position[1]-40], 2);// body
	this.rootObject.childnodeList.push(new DrawableObject(this.rootObject,[position[0], position[1]-60], [position[0], position[1]-40], 2)); // one arm
	this.rootObject.childnodeList.push(new DrawableObject(this.rootObject,[position[0], position[1]-60], [position[0], position[1]-40], 2)); // other arm
	this.rootObject.childnodeList.push(new DrawableObject(this.rootObject,[position[0], position[1]-80], 10, 1)); // head
	this.rootObject.childnodeList.push(new DrawableObject(this.rootObject,[position[0], position[1]-40], [position[0], position[1] - 20], 2)); // one thigh
	this.rootObject.childnodeList.push(new DrawableObject(this.rootObject[this.rootObject.childnodeList.length -1], [position[0], position[1] - 20], [position[0], position[1]],2));// one shin part
	this.rootObject.childnodeList.push(new DrawableObject(this.rootObject,[position[0], position[1]-40], [position[0], position[1] - 20], 2)); // other thigh
	this.rootObject.childnodeList.push(new DrawableObject(this.rootObject[this.rootObject.childnodeList.length -1], [position[0], position[1] - 20], [position[0], position[1]],2)); //other shin part
	
	// Draw overriding
	this.Draw = function(){
		this.rootObject.Draw();
		for (var index in this.rootObject.childnodeList) {
			this.rootObject.childnodeList[index].Draw();
		}
	}
	this.Walk = function () {
		if (this.animationSequenceNumber >= 45 && this.animationSequenceNumber < 135) {
			this.walkingAnimationCommand = [-1, 1, 0, -1, 1, 1, 1];
		} else {
			this.walkingAnimationCommand = [1, -1, 0, 1, 1, -1, 1];
		}
		for (var delta in this.walkingAnimationCommand){
			if (this.rootObject.childnodeList[delta].type === 2)this.RecursiveWalkingAnimationProcess(this.rootObject.childenodeList[delta].parentObject, this.rootObject.childnodeList[delta], this.walkingAnimationCommand[delta]);
		}
		if (this.animationSequenceNumber < this.maxAnimationSequenceNumber)this.animationSequenceNumber += 1;
		else {
			if (loopAnimation) this.animationSequenceNumber = 0;
		}
	}
	this.RecursiveWalkingAnimationProcess = function (parentobj, childobj, angle) {
		childobj.b = childobj.rotate(parseInt(childobj.b), parseInt(parentobj.b), angle);
		if (childobj.childnodeList.length > 0) {
			for (var target of childobj.childnodeList) {
				if (target.type === 2)this.RecursiveWalkingAnimationProcess(parentobj, target, angle);
			}
		}
	}
	
}
StickMan.prototype = Object.create(DrawableObject.prototype);
StickMan.prototype.constructor = StickMan;

// main program class

function Xen2K() {
	// member variables/objects
	this.currentNodeList = [];
	this.currentCanvas = null;
	this.console2Canvas = false;
	this.lastUse = 0;
	this.variables = [];

	this.classmember = [];
	this.classFunction = [];
	this.comments = [];

	// read: parse code and set a binary CanvasBox Tree
	this.read = function(data){

		this.classmember = [];
		this.classFunction = [];
		this.comments = [];
		var classes = data.split("&");
		classes.pop();
		for(var classtext of classes) {
			//member function
			var tempdata = classtext.split("!");
			var tempArray2 = new Array(0);
			for (var i = 1; i< tempdata.length; i++) {
				var memberFuncTokens = this.tokenize(tempdata[i].trim());
				tempArray2.push(memberFuncTokens);
			}
			this.classFunction.push(tempArray2);
			//member variables
			var tempArray = tempdata2[0].split(",");
			tempArray.pop();
			this.classmember.push(tempArray);
		}
        return;
	};
	this.BuildCanvasBoxTree = function (tokens, TreeIndex){
		if (tokens === []) return [];
		var resultNodeList = [];
		var tempRootNodeList = [];
		var currentNode = null;
		var loopcount = 0;
		var indentcount = 0;
		var indexcount = 0;
		var instructioncalled = false;
		for (var elem of tokens){
			switch (elem){
				case '/':
					if (instructioncalled) {
						indentcount += 1;
						currentNode.leftBranch = new CanvasBox("", "");
						currentNode.leftBranch.parentNode = currentNode;
						currentNode.leftBranch.position[0] = currentNode.leftBranch.parentNode.position[0]-25*indentcount;
						currentNode.leftBranch.position[1] = 60*indentcount;
						currentNode = currentNode.leftBranch;
					}
					else {
						currentNode = currentNode.parentNode; 
						currentNode.rightBranch = new CanvasBox("", "");
						currentNode.rightBranch.parentNode = currentNode;
						currentNode.rightBranch.position[0] = currentNode.rightBranch.parentNode.position[0]+25*indentcount;
						currentNode.rightBranch.position[1] = 60*indentcount;
						currentNode = currentNode.rightBranch;
					}
					break;
				case '=':
					indentcount += 1;
					currentNode.leftBranch = new CanvasBox("", "");
					currentNode.leftBranch.parentNode = currentNode;
					currentNode.leftBranch.position[0] = currentNode.leftBranch.parentNode.position[0]-25*indentcount;
					currentNode.leftBranch.position[1] = 60*indentcount;
					currentNode = currentNode.leftBranch;
					break;
				case '+':
					currentNode = currentNode.parentNode; 
					currentNode.rightBranch = new CanvasBox("", "");
					currentNode.rightBranch.parentNode = currentNode;
					currentNode.rightBranch.position[0] = currentNode.rightBranch.parentNode.position[0]+25*indentcount;
					currentNode.rightBranch.position[1] = 60*indentcount;
					currentNode = currentNode.rightBranch;
					break;
				case '\\':
				case '.':
					currentNode = currentNode.parentNode;
					indentcount -= 1;
					break;
				case '*': //random
				case '_': //previous
					currentNode.nodename = elem;
					currentNode.numstr = elem;
					currentNode.index = indexcount;
					indexcount += 1;
					instructioncalled = false;
					break;
				case '>': // do nothing for now
					break;
				case '<':
					// do nothing, because we already have passed this token 
					break;
				default: // instruction
					if (indentcount === 0)currentNode = new CanvasBox(FunctionInfos.get(atoi(elem).toString()),elem);
					instructioncalled = true;
					currentNode.nodename = FunctionInfos.get(atoi(elem).toString());
					currentNode.numstr = elem;
					currentNode.index = indexcount;
					indexcount += 1;
					currentNode.position[0] = 25*loopcount;
					break;
			}
			if (instructioncalled === false && indentcount === 0) {
				tempRootNodeList.push(currentNode);
			}
			loopcount += 1;
		}
		// linearization
		function linearize (elem) {
			resultNodeList.push(elem);
			if (elem.leftBranch !== null)linearize(elem.leftBranch);
			if (elem.rightBranch !== null)linearize(elem.rightBranch);
		}
		for (var elem of tempRootNodeList){
			linearize(elem);
		}
		return resultNodeList;
	}
	this.Traverse = (DoNotDisplay) => {
		for (var node of this.currentNodeList){
			if (node.parentNode === null) {
				this.invoke([node, node.leftBranch, node.rightBranch], DoNotDisplay);
			}
		}
	};
	this.set = (value) =>{
        this.result = value;
        return this.result;
    };
	this.arg = (argument, DoNotDisplay = false)=>{
        if ( argument.nodename === '*') {
			return this.set(Math.floor(Math.random()* 10000));
		}
        else if (argument.nodename === '_'){
            return this.result;
		}
        else  // we need recursion to traverse the instruction tree
			return this.set( this.invoke([argument, argument.leftBranch, argument.rightBranch], DoNotDisplay) );
    };
	
	this.DEFCANVAS=(a,b) =>{
		var consoleCanvas = document.createElement("canvas");
		consoleCanvas.id = "consoleCanvas";
		consoleCanvas.style = "display:table-cell";
		consoleCanvas.width = this.arg(a, false);
		consoleCanvas.height = this.arg(b, false);
		document.getElementById("ide_console").appendChild(consoleCanvas);
		this.currentCanvas = consoleCanvas.getContext("2d");
		this.console2Canvas = true;
		return 0;
	} // "830": initialize Canvas; arg0, arg1: list of width and height
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
		return this.variables[b];
	} // "1 07" : declare integer list named arg1, with its length arg0
	this.OUTC=(a, b)=>{
		document.getElementById("ide_console").innerHTML += [String.fromCharCode(this.set( this.arg(a, false))), '\n'].join('');
		this.outcCalled = true;
		return 0;
	} // "1 1 " : print ascii code of arg0(not working on windows mode)
	this.OUTSTR=(a, b)=>{
		for (var index in this.variables[this.arg(a, false)]) {
			document.getElementById("ide_console").innerHTML += String.fromCharCode(this.variables[this.arg(a, false)][index]);
		}
		document.getElementById("ide_console").innerHTML += '\n'
		this.set(this.variables[this.arg(a, false)].join(''));
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
				//console.log(e);
				break;
			}
		}
	} // "61 8" : infinite loop with execute arg0, excute arg1 if error occurred
	/**
	*	class implementation with an array
	*/
	this.DEFVECTOR = (a, b) => {
		return [this.arg(a,false), this.arg(b,false)];
	}
	this.CALLMEMBER = (a, b) => {
		// a is member indexes, b is parameter list
		// return the result of member function
		return (this.classFunction[this.arg(a,false)[0]][this.arg(a,false)[1]])(this.arg(b, false)[0], this.arg(b, false)[1]);
	}
	this.GETMEMBER = (a,b) => {
		return this.classmember[this.arg(a,false)][this.arg(b, false)];
	}
	this.SETMEMBER = function (a,b) {
		a = this.arg(a, false);
		b = this.arg(b, false);
		a = b;
		return 0;
	}
	this.DRAWRECT = (a, b) => {
		// a is left top position, b is size
		DrawableObjectList.push( new DrawableObject(null,this.arg(a,false), this.arg(b,false), 0));
	}
	this.DRAWCIRCLE = (a, b) => {
		// a is center position, b is radius
		DrawableObjectList.push( new DrawableObject(null,this.arg(a,false), this.arg(b,false), 1));
	}
	this.DRAWLINE = (a, b) => {
		// both a and b are position(start, end)
		DrawableObjectList.push( new DrawableObject(null,this.arg(a,false), this.arg(b,false), 2));
	}
	this.DRAWTEXT = function (a, b) {
		// both a and b are position(start, end)
		DrawableObjectList.push( new DrawableObject(null,this.arg(a,false), this.arg(b,false), 3));
	}
	this.SETTIMER = (a, b) => {
		// a is content, b is timeout value
		window.setTimeout( this.functions.get(a.nodeName), this.arg(b, false));
	}
	this.DEFCALLBACK = (a, b) => {
		// a is event name, b is callback function
		document.getElementById("ide_console").addEventListener(this.arg(a, false), this.functions.get(b.nodeName));
	}
	this.LIST2STR = (a, b) => {
		//a is source list, b is reverse join flag
		if (b !== 0 ) return this.set(this.arg(a, false).reverse().join(''));
		else return this.set(this.arg(a, false).join(''))
	}
	this.SPAWNSTICKMAN = function (a,b) {
		DrawableObjectList.push( new StickMan(this.arg(a,false), this.arg(b,false)));
	}
	this.command = [
		['1001' , this.DEFCANVAS], // "830": initialize Canvas, arg0: list of width and height; arg1: 2d(0) or webgl(1)
		['1008' , this.VARUSE], // "837": get arg0[arg1]
		['1015' , this.DEFVECTOR],
		['1029', this.SETMEMBER],
		['1036', this.CALLMEMBER],
		['1043', this.GETMEMBER],
		['1050', this.DRAWRECT], 
		['1057', this.DRAWCIRCLE], 
		['1064', this.DRAWLINE], 
		['1071', this.SETTIMER], 
		['1078', this.DEFCALLBACK],
		['1085', this.LIST2STR],
		['1092', this.DRAWTEXT],
		['1099', this.SPAWNSTICKMAN],
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
        if (DoNotDisplay && (ISA[0].name === '2562'|| ISA[0].naver === '2569'))
            return this.set(this.arg(ISA[1], DoNotDisplay));
        return (this.functions.get(atoi(ISA[0].numstr).toString()))(ISA[1],ISA[2]);
    };
	this.tokenize= function(data){
		if (data === "") return [];
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
                    result.push( itoa(number) );
                }
                result.push( c );
            }
            else if ("/\\*_+.=".indexOf(c) !== -1) { // built-in function call
                if (isRecordingNumber) {
                    isRecordingNumber = false;
                    result.push( itoa(number) );
                }
				result.push( c );
			}
		}
        if (isRecordingNumber)
            result.push( itoa(number) );
		return result;
    };
	this.lookupFunction = function(token){
        return this.functions.get(token);
	};
}