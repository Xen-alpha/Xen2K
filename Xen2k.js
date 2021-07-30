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

function CanvasBox (nodename, numstr) {
	this.position = [0,0];
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


// main program class

function Xen2K() {
	// member variables/objects
	this.currentNodeList = [];
	this.currentCanvas = null;
	this.console2Canvas = false;
	this.lastUse = 0;
	this.variables = [];
	this.construction = [];
	this.classmember = [];
	this.classFunction = [];
	this.comments = [];
	this.constructorcomments = [];
	
	// read: parse code and set a binary CanvasBox Tree
	this.read = function(data){
		this.construction = [];
		this.classmember = [];
		this.classFunction = [];
		this.comments = [];
		this.constructorcomments = [];
		
		var classes = data.split("&");
		classes.pop();
		for(var classtext of classes) {
			// comment Extraction
			var commentdata = classtext.split("?");
			var tempCommentArray = new Array(0);
			var tempConstructorCommentArray = new Array(0);
			for (var i = 1; i< commentdata.length; i++) {
				var CommentTokens = commentdata[i].trim().split(",");
				if (CommentTokens[0] === "-1") {
					tempConstructorCommentArray.push([-1, parseInt(CommentTokens[1]), CommentTokens[2]] );
				} else {
					tempCommentArray.push([parseInt(CommentTokens[0]), parseInt(CommentTokens[1]), CommentTokens[2]] );
				}
			}
			this.comments.push( tempCommentArray);
			this.constructorcomments.push(tempConstructorCommentArray);
			//member function
			var tempdata = commentdata[0].split("!");
			var tempArray2 = new Array(0);
			for (var i = 1; i< tempdata.length; i++) {
				var memberFuncTokens = this.tokenize(tempdata[i].trim());
				tempArray2.push(memberFuncTokens);
			}
			this.classFunction.push(tempArray2);
			// next parsing: constructor
			var tempdata2 = tempdata[0].split("#");
			var constructdata = tempdata2[1];
			constructdata = this.tokenize(constructdata);
			this.construction.push(constructdata); // add to constructor array
			//member variables
			var tempArray = tempdata2[0].split(",");
			tempArray.pop();
			this.classmember.push(tempArray);
		}
		refreshClassExplorer();
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
					if (TreeIndex <0) {
						for (var index0 in this.constructorcomments) {
							for (var index1 in this.constructorcomments[index0]) {
								if ( this.constructorcomments[index0][index1][1] === indexcount ) {
									currentNode.comment = this.constructorcomments[index0][index1][2];
								}
							}
						}
					} else {
						for (var index0 in this.comments) {
							for (var index1 in this.comments[index0]) {
								if (this.comments[index0][index1][0] === TreeIndex && this.comments[index0][index1][1] === indexcount ) {
									currentNode.comment = this.comments[index0][index1][2];
								}
							}
						}
					}
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
					if (TreeIndex <0) {
						for (var index0 in this.constructorcomments) {
							for (var index1 in this.constructorcomments[index0]) {
								if ( this.constructorcomments[index0][index1][1] === indexcount ) {
									currentNode.comment = this.constructorcomments[index0][index1][2];
								}
							}
						}
					} else {
						for (var index0 in this.comments) {
							for (var index1 in this.comments[index0]) {
								if (this.comments[index0][index1][0] === TreeIndex && this.comments[index0][index1][1] === indexcount ) {
									currentNode.comment = this.comments[index0][index1][2];
								}
							}
						}
					}
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
		this.currentNodeList = this.BuildCanvasBoxTree(this.construction[0], -1);
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

var contentChanged = 1;
// callback functions
function onChangeFile(event) {
	document.getElementById("ide_class").innerHTML = "변수 수정<input id=\"varEdit\" name=\"ide_VarEdit\" onchange=\"EditMemberVar(event)\">";
	document.getElementById("ide_class").innerHTML += "<button onclick=\"createClass(event)\">새 클래스 만들기</button>"
	var fileText;
	FreshPageLoaded = false;
	var file = event.target.files[0];
	var reader = new FileReader();
	reader.onload = function(e) {
	  fileText = e.target.result;
	  contentChanged = 1;
	  bareNodeList_constructor = [];
	  bareNodeList = [];
	  constructorLoaded = 1;
	  Xen2KHandle.read(fileText);
	  PostLoadProject();
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
		if (!constructorLoaded) {
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
		} else {
			if (currentCanvasClassIndex === -1 ) return;
			var targetNode = null;
			
			for (var node of bareNodeList_constructor[currentCanvasClassIndex]){
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
				focusedIndex = bareNodeList_constructor[currentCanvasClassIndex].indexOf(targetNode);
				deleteType = 0;
			} else if (DropMenuHandle.activated && e.offsetX >= DropMenuHandle.position[0] && e.offsetX < DropMenuHandle.position[0] + DropMenuHandle.size[0] && e.offsetY >= DropMenuHandle.position[1] && e.offsetY < DropMenuHandle.position[1] + DropMenuHandle.size[1] ) {
				// click element inside dropdown menu
				var clickpointY = Math.floor((e.offsetY- DropMenuHandle.position[1] ) / 16);
				bareNodeList_constructor[currentCanvasClassIndex].push(new CanvasBox(DropMenuHandle.MenuList[clickpointY + DropMenuHandle.sightpoint][1] ,itoa(parseInt(DropMenuHandle.MenuList[clickpointY + DropMenuHandle.sightpoint][0]))));
				bareNodeList_constructor[currentCanvasClassIndex][bareNodeList_constructor[currentCanvasClassIndex].length-1].index = bareNodeList_constructor.length-1;
				bareNodeList_constructor[currentCanvasClassIndex][bareNodeList_constructor[currentCanvasClassIndex].length-1].SetPosition(e.offsetX, e.offsetY);
				contentChanged = 0;
			}
			else {
				// moving background
				isDragging = true;
			}
			typingComment = null;
			DropMenuHandle.activated = false;
		}
	} else if (e.button === 2) {
		DropMenuHandle.activated = false;
		if (rightbuttonDraggingTimer !== null) {
			clearTimeout(rightbuttonDraggingTimer);
			rightbuttonDraggingTimer = null;
			var targetNode = null;
			if (constructorLoaded) {
				if (currentCanvasClassIndex <0) return;
				for (var node of bareNodeList_constructor[currentCanvasClassIndex]){
					if (e.offsetX >= node.position[0] && e.offsetX <= node.position[0] + node.size[0] && e.offsetY >= node.position[1] && e.offsetY <= node.position[1]+node.size[1] - 10) {
						targetNode = node;
					}
				}
				if (targetNode !== null) {
					typingComment = targetNode;
				}
			} else {
				if (currentCanvasClassIndex <0 || currentCanvasFuncIndex <0) return;
				for (var node of bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex]){
					if (e.offsetX >= node.position[0] && e.offsetX <= node.position[0] + node.size[0] && e.offsetY >= node.position[1] && e.offsetY <= node.position[1]+node.size[1] - 10) {
						targetNode = node;
					}
				}
				if (targetNode !== null) {
					typingComment = targetNode;
				}
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
		if (!constructorLoaded) {
			if (currentCanvasClassIndex >=0 && currentCanvasFuncIndex >= 0) {
				if (bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex].length > 0 && bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][focusedIndex].dragging) {
					bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex][focusedIndex].SetPosition(e.offsetX, e.offsetY);
					return;
				}
			}
		} else {
			if (currentCanvasClassIndex >=0 ) {
				if (bareNodeList_constructor[currentCanvasClassIndex].length > 0 && bareNodeList_constructor[currentCanvasClassIndex][focusedIndex].dragging) {
					bareNodeList_constructor[currentCanvasClassIndex][focusedIndex].SetPosition(e.offsetX, e.offsetY);
					return;
				}
			}
		}
		
	}
	if (isDragging){
		if (!constructorLoaded) {
			if (currentCanvasClassIndex >=0 && currentCanvasFuncIndex >= 0) {
				for (var node of bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex]) {
					node.position[0] += e.movementX;
					node.position[1] += e.movementY;
				}
			}
		} else {
			if (currentCanvasClassIndex >=0 ) {
				for (var node of bareNodeList_constructor[currentCanvasClassIndex]) {
					node.position[0] += e.movementX;
					node.position[1] += e.movementY;
				}
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
			if (!constructorLoaded) {
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
			} else {
				if (currentCanvasClassIndex === -1 ) return;
				for (var node of bareNodeList_constructor[currentCanvasClassIndex]){
					if ( e.offsetX >= node.position[0] && e.offsetX <= node.position[0] + node.size[0] && e.offsetY >= node.position[1] && e.offsetY <= node.position[1]+node.size[1] - 10){
						var parentindex = bareNodeList_constructor[currentCanvasClassIndex].indexOf(BranchParent);
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
							if (bareNodeList_constructor[currentCanvasClassIndex][parentindex].leftBranch === null){
								bareNodeList_constructor[currentCanvasClassIndex][parentindex].leftBranch = node;
							} else {
								bareNodeList_constructor[currentCanvasClassIndex][parentindex].leftBranch.parentNode = null;
								bareNodeList_constructor[currentCanvasClassIndex][parentindex].leftBranch = node;
							}
						}
						else {
							if (bareNodeList_constructor[currentCanvasClassIndex][parentindex].rightBranch === null){
								bareNodeList_constructor[currentCanvasClassIndex][parentindex].rightBranch = node;
							} else {
								bareNodeList_constructor[currentCanvasClassIndex][parentindex].rightBranch.parentNode = null;
								bareNodeList_constructor[currentCanvasClassIndex][parentindex].rightBranch = node;
							}
						}
						node.parentNode = bareNodeList_constructor[currentCanvasClassIndex][parentindex];
						break;
					}
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
		if (constructorLoaded) {
			if (  bareNodeList_constructor[currentCanvasClassIndex].length > 0){ // delete node
				if (bareNodeList_constructor[currentCanvasClassIndex][focusedIndex].leftBranch !== null){
					bareNodeList_constructor[currentCanvasClassIndex][focusedIndex].leftBranch.parentNode = null;
				}
				if (bareNodeList_constructor[currentCanvasClassIndex][focusedIndex].rightBranch !== null){
					bareNodeList_constructor[currentCanvasClassIndex][focusedIndex].rightBranch.parentNode = null;
				}
				if (bareNodeList_constructor[currentCanvasClassIndex][focusedIndex].parentNode !== null){
					if (bareNodeList_constructor[currentCanvasClassIndex][focusedIndex].parentNode.leftBranch === bareNodeList_constructor[currentCanvasClassIndex][focusedIndex]){
						bareNodeList_constructor[currentCanvasClassIndex][focusedIndex].parentNode.leftBranch = null;
					}
					else if (bareNodeList_constructor[currentCanvasClassIndex][focusedIndex].parentNode.rightBranch === bareNodeList_constructor[currentCanvasClassIndex][focusedIndex]){
						bareNodeList_constructor[currentCanvasClassIndex][focusedIndex].parentNode.rightBranch = null;
					}
				}
				bareNodeList_constructor[currentCanvasClassIndex].splice(focusedIndex, 1);
				focusedIndex = -1;
			} 
		} else {
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

function PostLoadProject () {
	localStorage.setItem("X2Kcount", Xen2KHandle.construction.length);
	bareNodeList = new Array(Xen2KHandle.construction.length);
	bareNodeList_constructor = new Array(Xen2KHandle.construction.length);
	for (var index = 0; index < Xen2KHandle.construction.length; index++){
		localStorage.setItem("constructor"+index.toString(), Xen2KHandle.construction[index].join(''));
		bareNodeList_constructor[index] =( Xen2KHandle.BuildCanvasBoxTree(Xen2KHandle.construction[index],-1));
		localStorage.setItem("constructorComment" + index.toString(), StringifyBareNodeListComment(-1, bareNodeList_constructor[index]));
		localStorage.setItem("memvar"+index.toString(), Xen2KHandle.classmember[index]);
		localStorage.setItem("X2KClassFuncCount"+ index.toString(), Xen2KHandle.classFunction[index].length);
		bareNodeList[index] = new Array(Xen2KHandle.classFunction[index].length);
		for (var index2 in Xen2KHandle.classFunction[index]) {
			localStorage.setItem("memfunc"+index.toString()+"_"+(index2).toString(), Xen2KHandle.classFunction[index][index2].join(''));
			bareNodeList[index][index2] = Xen2KHandle.BuildCanvasBoxTree(Xen2KHandle.classFunction[index][index2], index2);
			localStorage.setItem("memfuncComment"+index.toString() + "_" + index2.toString(), StringifyBareNodeListComment(index2, bareNodeList[index][index2]));
		}
	}
}

function StringifyBareNodeList(CanvasBoxNode){
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

function StringifyBareNodeListComment ( commentNum,CanvasBoxNode) {
	var result = "";
	for (var elem in CanvasBoxNode){
		if (CanvasBoxNode[elem].comment.length >0 ) {
			result += "\n?" + commentNum.toString() +","+CanvasBoxNode[elem].index.toString() +","+CanvasBoxNode[elem].comment;
		}
	}
	return result;
}

function savehandler(e) {
	localStorage.clear();
	localStorage.setItem("X2Kcount", Xen2KHandle.construction.length);
	for (var index = 0; index < Xen2KHandle.construction.length; index++){
		localStorage.setItem("constructor"+index.toString(), StringifyBareNodeList(bareNodeList_constructor[index]));
		localStorage.setItem("constructorComment" + index.toString(), StringifyBareNodeListComment(-1, bareNodeList_constructor[index]));
		//
		localStorage.setItem("memvar"+index.toString(), Xen2KHandle.classmember[index]);
		//
		localStorage.setItem("X2KClassFuncCount"+ index.toString(), Xen2KHandle.classFunction[index].length);
		for (var index2 in Xen2KHandle.classFunction[index]) {
			localStorage.setItem("memfunc"+index.toString()+"_"+(index2).toString(), StringifyBareNodeList(bareNodeList[index][index2]));
			localStorage.setItem("memfuncComment"+index.toString() + "_" + index2.toString(), StringifyBareNodeListComment(index2, bareNodeList[index][index2]));
		}
	}
	contentChanged = 1;
	refreshClassExplorer();
}

function exporthandler(e) {
	if (contentChanged === 0) {
		var savemessagedialog = document.getElementById("savedialog");
		savemessagedialog.showModal();
	} else {
		var rootNodeList =  [];
		// member saving
		var resultscript = "";
		for (var index0 in Xen2KHandle.construction) {
			for (var member of Xen2KHandle.classmember[index0]){
				resultscript += member.toString() + ",";
			}
			resultscript += "\n#";
			//constructor saving
			resultscript += window.localStorage.getItem("constructor"+index0.toString()); // constructor;
			//member function saving
			for (var index1 in Xen2KHandle.classFunction[index0]){
				resultscript += "\n! ";
				resultscript += window.localStorage.getItem("memfunc"+index0.toString()+"_"+index1.toString());
			}
			//comment saving
			resultscript += window.localStorage.getItem("constructorComment" + index0.toString());
			for (var index1 in Xen2KHandle.classFunction[index0]) {
				resultscript += window.localStorage.getItem("memfuncComment"+index0.toString()+"_"+index1.toString());
			}
			//finish
			resultscript += "\n&";
		}
		
		// download the result
		var file = new Blob([resultscript], {type:"text/plain"});
		var a = document.createElement("a"),url = URL.createObjectURL(file);
		a.href = url;
		a.download = "exported.x2k";
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
			if (!constructorLoaded) {
				if (currentCanvasClassIndex >=0 && currentCanvasFuncIndex >=0){
					sourceNode.index = bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex].length;
					bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex].push(sourceNode);
					contentChanged = 0;
				}
			} else {
				if (currentCanvasClassIndex >=0 ){
					sourceNode.index = bareNodeList_constructor[currentCanvasClassIndex].length;
					bareNodeList_constructor[currentCanvasClassIndex].push(sourceNode);
					contentChanged = 0;
				}
			}
			break;
		}
	}
}
/*
function reflectToFunc(NodeList) {
	var resultArray = [];
	var sourceArray = [];
	var rootNodeList =  [];
	if (NodeList === null || NodeList.length === 0 ) return [];
	for (var nodeElem of NodeList){
		if (nodeElem.parentNode === null) {
			rootNodeList.push(nodeElem); //type: CanvasBox
		}
	}

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

	function recursiveScriptBuilder(targetnode){ // targetnode == a node of bareNodeList(CanvasBox)
		if (targetnode.nodename === '*' || targetnode.nodename === '_') {
			resultArray.push(targetnode.numstr);
			return;
		} else {
			//function found
			resultArray.push(targetnode.numstr);
			resultArray.push("=");
			if (targetnode.leftBranch !== null)recursiveScriptBuilder(targetnode.leftBranch);
			resultArray.push("+");
			if (targetnode.rightBranch !== null)recursiveScriptBuilder(targetnode.rightBranch);
			resultArray.push(".");
			return;
		}
	}
	for (var index1 of rootNodeList){
		recursiveScriptBuilder(index1);
	}
	return resultArray;
}
*/
var Xen2KHandle = new Xen2K();

function createClass() {
	Xen2KHandle.construction.push(new Array(0));
	Xen2KHandle.classmember.push(new Array("새 변수"));
	Xen2KHandle.classFunction.push(new Array([]));
	bareNodeList_constructor.push([]);
	bareNodeList.push([[]]);
	refreshClassExplorer();
}

function deleteClass(ev)
{
	if (bareNodeList.length > 0) {
		Xen2KHandle.construction.splice(ev.target.getAttribute("value"), 1);
		Xen2KHandle.classmember.splice(ev.target.getAttribute("value"), 1);
		Xen2KHandle.classFunction.splice(ev.target.getAttribute("value"), 1);
		bareNodeList.pop();
	}
	refreshClassExplorer();
}
function copyClass(ev)
{
	Xen2KHandle.construction.push(Array.from(Xen2KHandle.construction[ev.target.getAttribute("value")]));
	Xen2KHandle.classmember.push(Array.from(Xen2KHandle.classmember[ev.target.getAttribute("value")]));
	Xen2KHandle.classFunction.push(Array.from(Xen2KHandle.classFunction[ev.target.getAttribute("value")]));
	bareNodeList_constructor.push(Array.from(bareNodeList_constructor[ev.target.getAttribute("value")]));
	bareNodeList.push(Array.from(bareNodeList[ev.target.getAttribute("value")]));
	refreshClassExplorer();
}

function refreshClassExplorer () {
	if (localStorage.length >0) {
		for (var index0 in Xen2KHandle.construction){
			Xen2KHandle.construction[index0] = Xen2KHandle.tokenize(window.localStorage.getItem("constructor"+index0.toString())); // constructor;
			Xen2KHandle.classmember[index0] = (window.localStorage.getItem("memvar"+index0.toString())).split(",");
			//member function saving
			if (Xen2KHandle.classFunction[index0].length >0){
				for (var index1 in Xen2KHandle.classFunction[index0]){
					if (Xen2KHandle.classFunction[index0][index1].length >0){
						Xen2KHandle.classFunction[index0][index1] =  Xen2KHandle.tokenize(window.localStorage.getItem("memfunc"+index0.toString()+"_"+index1.toString()));
					}
				}
			}
		}
	}
	
	document.getElementById("ide_class").innerHTML = "변수 수정<input id=\"varEdit\" name=\"ide_VarEdit\" onchange=\"EditMemberVar(event)\">";
	document.getElementById("ide_class").innerHTML += "<button onclick=\"createClass(event)\">새 클래스 만들기</button>"
	for (var i = 0 ; i < Xen2KHandle.construction.length; i++){
		addClassToClassExplorer(i);
	}	
}

function addClassToClassExplorer (classindex) { // parameter: index of Class 
	var oldClass = document.getElementById("classbackground"+(classindex).toString());
	if (oldClass !== null) document.getElementById("ide_class").removeChild(oldClass);
	var background = document.createElement("div");
	background.id="classbackground"+(classindex).toString();
	background.style="width:396px;height:100px;display:table;border:2px solid black;border-bottom-color:transparent";
	background.value= classindex;
	background.innerHTML = "<div style=\"display:table-header-group;border:2px solid;\"><div style=\"display:table-cell\">class "+(classindex).toString() + "<button onclick=\"copyClass(event)\" value="+(classindex).toString()+">복제</button><button onclick=\"deleteClass(event)\" value="+(classindex).toString()+">X</button></div><div style=\"display:table-cell\">멤버 변수</div></div>";
	document.getElementById("ide_class").appendChild(background);
	
	var memberVarRowgroup = document.createElement("div");
	memberVarRowgroup.style.display = "table-row-group";
	for (var index = 0; index <  Xen2KHandle.classmember[classindex].length ; index++){
		var memberRow = document.createElement("div");
		memberRow.value = index;
		memberRow.style.display = "table-row";
		var nulloption = document.createElement("div");
		nulloption.style.display = "table-cell";
		nulloption.style.width = "80px";
		memberRow.appendChild(nulloption);
		// member variable
		if (Xen2KHandle.classmember[classindex][index] !== undefined) {
			var elem = document.createElement("div");
			elem.style.display = "table-cell";
			elem.style.width = "80px";
			memberRow.appendChild(elem);
			var tempoption = document.createElement("span");
			tempoption.value = classindex.toString() + ","+index.toString(); // tokenized Array
			tempoption.addEventListener("dblclick", classvar_dbclick_handler);
			tempoption.innerHTML += Xen2KHandle.classmember[classindex][index];
			elem.appendChild(tempoption);
		} else { // empty cell
			var elem = document.createElement("div");
			elem.style.display = "table-cell";
			elem.style.width = "80px";
			memberRow.appendChild(elem);
		}
		memberVarRowgroup.appendChild(memberRow);
	}
	// some buttons
	var memberVarModifyButtonGroup = document.createElement("div");
	memberVarModifyButtonGroup.style.display = "table-row";
	var nulloption = document.createElement("div");
	nulloption.style.display = "table-cell";
	memberVarModifyButtonGroup.appendChild(nulloption);
	var memberVarModifyButtons = document.createElement("div");
	memberVarModifyButtons.style.display = "table-cell";
	var memVarAdd = document.createElement("button");
	memVarAdd.onclick = createMemVar;
	memVarAdd.value = classindex.toString();
	memVarAdd.innerText = "변수 생성";
	memberVarModifyButtons.appendChild(memVarAdd);
	var memVarDel = document.createElement("button");
	memVarDel.onclick = deleteMemVar;
	memVarDel.innerText = "변수 제거";
	memVarDel.value = classindex.toString();
	memberVarModifyButtons.appendChild(memVarDel);
	memberVarModifyButtonGroup.appendChild(memberVarModifyButtons);
	memberVarRowgroup.appendChild(memberVarModifyButtonGroup);
	background.appendChild(memberVarRowgroup);
	
	// member function table
	var background_sub = document.createElement("div");
	background_sub.style = "width:396px;height:100px;display:table;border:2px solid black;border-top-color:transparent";
	background.value= classindex;
	background_sub.innerHTML = "<div style=\"display:table-header-group;border:2px solid;\"><div style=\"display:table-cell\" onclick=\"loadConstructor(event)\" value="+classindex.toString()+">생성자 열기</div><div style=\"display:table-cell\">멤버 함수</div></div>";
	var memberFuncRowgroup = document.createElement("div");
	memberFuncRowgroup.style.display = "table-row-group";
	for (var index = 0 ; index < Xen2KHandle.classFunction[classindex].length; index++) {
		// member function
		var memberRow = document.createElement("div");
		memberRow.value = index;
		memberRow.style.display = "table-row";
		var nulloption = document.createElement("div");
		nulloption.style.display = "table-cell";
		nulloption.style.width = "80px";
		memberRow.appendChild(nulloption);
		if (Xen2KHandle.classFunction[classindex][index] !== undefined){
			var elem = document.createElement("div");
			elem.style.display = "table-cell";
			elem.style.width = "80px";
			memberRow.appendChild(elem);
			var tempoption2 = document.createElement("span");
			tempoption2.value = classindex.toString() + ","+index.toString(); // tokenized Array
			tempoption2.addEventListener("dblclick", classFunc_dbclick_handler);
			tempoption2.innerHTML += "Func("+Xen2KHandle.classFunction[classindex][index][0]+"...)"; // first element of tokenized Array as name
			elem.appendChild(tempoption2);
		} else { // empty cell
			var elem = document.createElement("div");
			elem.style.display = "table-cell";
			elem.style.width = "80px";
			memberRow.appendChild(elem);
		}
		memberFuncRowgroup.appendChild(memberRow);
	}
	background_sub.appendChild(memberFuncRowgroup);
	var memberFuncModifyButtonGroup = document.createElement("div");
	memberFuncModifyButtonGroup.style.display = "table-row";
	var nulloption = document.createElement("div");
	nulloption.style.display = "table-cell";
	memberFuncModifyButtonGroup.appendChild(nulloption);
	var memberFuncModifyButtons = document.createElement("div");
	memberFuncModifyButtons.style.display = "table-cell";
	var memFuncAdd = document.createElement("button");
	memFuncAdd.onclick = createMemFunc;
	memFuncAdd.innerText = "함수 생성";
	memFuncAdd.value = classindex.toString() + "," + Xen2KHandle.classFunction[classindex].length.toString();
	memberFuncModifyButtons.appendChild(memFuncAdd);
	var memFuncDel = document.createElement("button");
	memFuncDel.onclick = deleteMemFunc;
	memFuncDel.innerText = "함수 제거";
	memFuncDel.value = classindex.toString() + "," + Xen2KHandle.classFunction[classindex].length.toString();
	memberFuncModifyButtons.appendChild(memFuncDel);
	memberFuncModifyButtonGroup.appendChild(memberFuncModifyButtons);
	memberFuncRowgroup.appendChild(memberFuncModifyButtonGroup);
	document.getElementById("ide_class").appendChild(background_sub);
	
}

var constructorLoaded = false;
var bareNodeList_constructor = [];

function loadConstructor(ev) {
	if (contentChanged === 0) {
		var savemessagedialog = document.getElementById("savedialog");
		savemessagedialog.showModal();
	} else {
		currentCanvasClassIndex = parseInt(ev.target.getAttribute("value"));
		if (localStorage.getItem("constructor"+ev.target.getAttribute("value")).length >0) {
			bareNodeList_constructor[currentCanvasClassIndex] =Xen2KHandle.BuildCanvasBoxTree(Xen2KHandle.tokenize(localStorage.getItem("constructor"+ev.target.getAttribute("value"))),-1);
			if (localStorage.getItem("constructorComment" + currentCanvasClassIndex.toString()) !== null ){
				for (var index1 in localStorage.getItem("constructorComment" + currentCanvasClassIndex.toString()).split("?") ){
					if (index1 === 0 ) continue;
					for (var index in bareNodeList_constructor[currentCanvasClassIndex]) { 
						if (bareNodeList_constructor[currentCanvasClassIndex][index].index === parseInt(localStorage.getItem("constructorComment" + currentCanvasClassIndex.toString()).split("?")[index1].split(",")[1])) {
							bareNodeList_constructor[currentCanvasClassIndex][index].comment = localStorage.getItem("constructorComment" + currentCanvasClassIndex.toString()).split("?")[index1].split(",")[2];
						}
					}
				}
			}
		}
		constructorindex = parseInt(ev.target.getAttribute("value"));
		constructorLoaded = true;
	}
}

function createMemVar(ev) {
	Xen2KHandle.classmember[parseInt(ev.target.getAttribute("value"))].push("새 변수");
	localStorage.setItem("memvar"+ev.target.getAttribute("value"), Xen2KHandle.classmember[parseInt(ev.target.getAttribute("value"))]);
	refreshClassExplorer();
}
function deleteMemVar(ev) {
	if (Xen2KHandle.classmember.length > 0){
		Xen2KHandle.classmember[parseInt(ev.target.getAttribute("value"))].pop();
		localStorage.setItem("memvar"+ev.target.getAttribute("value"), Xen2KHandle.classmember[parseInt(ev.target.getAttribute("value"))]);
	}
	refreshClassExplorer();
}
function createMemFunc(ev) {
	var indeces = ev.target.getAttribute("value");
	Xen2KHandle.classFunction[parseInt(indeces)].push([]);
	bareNodeList[parseInt(indeces)].push([]);
	localStorage.setItem("memfunc"+indeces.toString()+"_"+ (Xen2KHandle.classFunction[parseInt(indeces)].length-1).toString(), StringifyBareNodeList(bareNodeList[indeces][Xen2KHandle.classFunction[parseInt(indeces)]]));
	refreshClassExplorer();
}
function deleteMemFunc(ev) {
	var indeces = ev.target.getAttribute("value");
	if (bareNodeList.length > 0 &&bareNodeList[parseInt(indeces)].length > 0 ) {
		localStorage.removeItem("memfunc"+indeces.toString()+"_"+ (Xen2KHandle.classFunction[parseInt(indeces)].length-1).toString());
		bareNodeList[parseInt(indeces)].pop();
		Xen2KHandle.classFunction[parseInt(indeces)].pop();
	}
	refreshClassExplorer();	
}

var dataArray = [];

function classvar_dbclick_handler(ev) {
	var index1 = parseInt(ev.target.value.split(",")[0]);
	var index2 = parseInt(ev.target.value.split(",")[1]);
	document.getElementById("varEdit").value = Xen2KHandle.classmember[index1][index2];
	dataArray = [index1, index2];
}
var funcArray = [];
function classFunc_dbclick_handler(ev) {
	if (contentChanged === 0) {
		var savemessagedialog = document.getElementById("savedialog");
		savemessagedialog.showModal();
	} else {
		var index1 = parseInt(ev.target.value.split(",")[0]);
		var index2 = parseInt(ev.target.value.split(",")[1]);
		currentCanvasClassIndex = index1;
		currentCanvasFuncIndex = index2;
		if (localStorage.getItem("memfunc"+currentCanvasClassIndex.toString()+"_"+ currentCanvasFuncIndex.toString()) !== null) bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex] = Xen2KHandle.BuildCanvasBoxTree(Xen2KHandle.tokenize(localStorage.getItem("memfunc"+currentCanvasClassIndex.toString()+"_"+ currentCanvasFuncIndex.toString())), currentCanvasFuncIndex);
		for (var index in window.localStorage.getItem("memfuncComment"+index1.toString()+"_"+index2.toString()).split("?")) {
			if (index === 0) continue;
			for (var index3 in bareNodeList[index1][index2]) {
				if (window.localStorage.getItem("memfuncComment"+index1.toString()+"_"+index2.toString()) !== null && window.localStorage.getItem("memfuncComment"+index1.toString()+"_"+index2.toString()).length >0 && window.localStorage.getItem("memfuncComment"+index1.toString()+"_"+index2.toString()).split("?")[index].split(",")[1] === index3.toString()) {
					bareNodeList[index1][index2][index3].comment = window.localStorage.getItem("memfuncComment"+index1.toString()+"_"+index2.toString()).split("?")[index].split(",")[2];
				}
			}
		}
		constructorLoaded = false;
		funcArray = [index1,index2];
	}
}

function EditMemberVar (ev) {
	if (contentChanged === 0) {
		var savemessagedialog = document.getElementById("savedialog");
		savemessagedialog.showModal();
	} else {
		Xen2KHandle.classmember[dataArray[0]][dataArray[1]] = ev.target.value;
		localStorage.setItem("memvar"+dataArray[0].toString(), Xen2KHandle.classmember[dataArray[0]]);
		refreshClassExplorer();
	}
}

function playProgram(ev) {
	if (Xen2KHandle.construction.length === 0 || Xen2KHandle.construction[0].length === 0) return;
	savehandler(ev);
	Xen2KHandle.Traverse(false);
}

function renderCanvas(){
	document.getElementById("MainCanvas").width = document.getElementById("MainCanvas").width; // reset the canvas
	if (currentCanvasClassIndex >=0 ) {
		if (constructorLoaded){
			for (var elem of bareNodeList_constructor[currentCanvasClassIndex]) {
				elem.DrawNode();
			}
		} else {
			if (currentCanvasFuncIndex >=0){
				for (var elem of bareNodeList[currentCanvasClassIndex][currentCanvasFuncIndex]){
					elem.DrawNode();
				}
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
	if (Xen2KHandle.console2Canvas){
		document.getElementById("consoleCanvas").width = document.getElementById("consoleCanvas").width; // reset the canvas
		for (var elem of DrawableObjectList) {
			elem.Draw();
		}
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

var bareNodeList = [];


var Background = document.createElement('div');
Background.id = "ide_main";
Background.style.display = "table-row-group";
Background.innerHTML = "<div id=\"functioncanvas\"></div>\
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

var SaveButton = document.createElement("button");
SaveButton.id = "saveButton";
SaveButton.addEventListener("click", savehandler);
SaveButton.innerText = "임시저장";
document.getElementById("ide_main").appendChild(SaveButton);
	
var exportToFileButton = document.createElement("button");
exportToFileButton.id = "exportButton";
exportToFileButton.addEventListener("click", exporthandler);
exportToFileButton.innerText = "X2K로 내보내기";
document.getElementById("ide_main").appendChild(exportToFileButton);

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

var consolepage = document.createElement('div');
consolepage.id = "ide_console";
consolepage.innerHTML = "console\n";
document.getElementById("ide_main").appendChild(consolepage);

var classpage = document.createElement('div');
classpage.id = "ide_class";
classpage.innerHTML = "변수 수정<input id=\"varEdit\" name=\"ide_VarEdit\" onchange=\"EditMemberVar(event)\">";
classpage.innerHTML += "<button onclick=\"createClass(event)\">새 클래스 만들기</button>"
document.getElementById("mainplate").appendChild(classpage);

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

var FreshPageLoaded = false;

window.addEventListener('DOMContentLoaded', () => {
	FreshPageLoaded = true;
	localStorage.clear();
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
