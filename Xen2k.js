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

function TaskTree () {
	this.parentNode = null;
	this.nodename = null; // number name, is number
	this.leftBranch = null;
	this.rightBranch = null;
	this.numstr = NaN; // num is index of rootNodeList
	this.push = (data, index) => {
		if (this.name === null) {
			this.name = data;
			this.num = index; 
			return;
		}
		if (data < this.name) {
			if (this.leftBranch === null)this.leftBranch = new TaskTree();
			this.leftBranch.push(data, index);
			return;
		} else {
			if (this.rightBranch  === null) this.rightBranch = new TaskTree();
			this.rightBranch.push(data, index);
			return;
		}
	}
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
function DrawableObject (a, b, type){
	this.a = a;
	this.b = b;
	this.type = type;
	this.Draw = () => {
		if (this.type === 0) {
			if (Xen2KHandle.console2Canvas && Xen2KHandle.currentCanvas !== null) {
				var pos = a;
				var size = b;
				Xen2KHandle.currentCanvas.beginPath();
				Xen2KHandle.currentCanvas.rect(parseInt(pos[0]), parseInt(pos[1]), parseInt(size[0]), parseInt(size[1]));
				Xen2KHandle.currentCanvas.closePath();
				Xen2KHandle.currentCanvas.fillStyle = "rgba(255, 255, 255,1)";
				Xen2KHandle.currentCanvas.fill();
			}
		} else if (this.type === 1) {
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
		} else if (this.type === 2) {
			if (Xen2KHandle.console2Canvas && Xen2KHandle.currentCanvas !== null) {
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
	}
}

function CanvasComment (nodename){
	this.position = [0,0];
	this.size = [50, 50];
	this.nodename = nodename;
	this.dragging = false;
	this.activated = false;
	this.SetPosition = function(x, y) {
		this.position = [x-50, y-25];
	}
	this.DrawNode = function(){
		var ctx = document.getElementById("MainCanvas").getContext("2d");
		ctx.beginPath();
		ctx.rect(this.position[0], this.position[1], this.size[0], this.size[1]);
		ctx.fillStyle = "rgba(200, 200, 240, 0.5)";
		ctx.fill();
		ctx.closePath();
		if (typingComment === this) {
			ctx.beginPath();
			ctx.fillStyle = "rgba(240, 240, 240, 1)";
			ctx.rect(this.position[0], this.position[1], this.size[0], 16);
			ctx.fill();
			ctx.closePath();
		}
		ctx.beginPath();
		ctx.strokeStyle = "rgba(100, 100, 20, 1)";
		ctx.font = "16px Arial, sans-serif";
		ctx.textBaseline = "top";
		ctx.strokeText(this.nodename,this.position[0], this.position[1]);
		ctx.closePath();
	}
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
	// member functions
	this.read = function(data){
		var tempdata = data.split("\n! ");
		var tempdata2 = tempdata[0].split("\n#");
		data = tempdata2[1];
		this.LoadToCanvas(data);
		this.construction = data; // add to constructor array
		this.classmember.push(tempdata2[0].split(","));
		var tempArray = [];
		for (var i = 1; i< tempdata.length; i++) {
			var memberFuncTree = [(i-1).toString(),this.SetupTree(new Array(0), this.tokenize(tempdata[i]))];
			tempArray.push(memberFuncTree);
		}
		this.classFunction.push(tempArray);
		AddClassToClassExplorer(this.classmember.length > this.classFunction.length? this.classmember.length:this.classFunction.length);
        return;
	};
	// parse: execute code
	this.parse = function(data){
        var tokens = this.tokenize(data);
        this.resultlist = [];
        this.instructionSequence = [];
        this.currentNodeList = this.SetupTree(this.currentNodeList,tokens);
		
        this.outcCalled = false;
        this.Traverse(false);
	};
	//LoadToCanvas: Load Code Tree to canvas
	this.LoadToCanvas = function(data) {
		bareNodeList = [];
		var tokens = this.tokenize(data);
        this.BuildCanvasBoxTree(tokens);
	}
	this.BuildCanvasBoxTree = function (tokens){
		var tempRootNodeList = [];
		var currentNode = null;
		var loopcount = 0;
		var indentcount = 0;
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
					instructioncalled = false;
					break;
				case '>': // do nothing for now
					break;
				case '<':
					// do nothing, because we already have passed this token 
					break;
				default: // instruction
					if (indentcount === 0)currentNode = new CanvasBox(FunctionInfos.get(elem),elem);
					instructioncalled = true;
					currentNode.nodename = FunctionInfos.get(elem);
					currentNode.numstr = elem;
					currentNode.position[0] = 25*loopcount;
			}
			if (instructioncalled === false && indentcount === 0) {
				tempRootNodeList.push(currentNode);
			}
			loopcount += 1;
		}
		// linearization
		function linearize (elem) {
			if (elem.leftBranch !== null)linearize(elem.leftBranch);
			if (elem.rightBranch !== null)linearize(elem.rightBranch);
			bareNodeList.push(elem);
		}
		for (var elem of tempRootNodeList){
			linearize(elem);
		}
		return;
	}
	this.SetupTree = function(NodeList,tokens){
		NodeList = [];
		var currentNode = null;
		var loopcount = 0;
		var treeDepth = 0;
		var indentcount = 0;
		var instructioncalled = false;
		for (var elem of tokens){
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
					currentNode.nodename = elem;
					currentNode.numstr = elem;
					instructioncalled = false;
					break;
				case '>': // do nothing for now
					break;
				case '<':
					// do nothing, because we already have passed this token 
					break;
				default: // instruction
					if (indentcount === 0)currentNode = new TaskTree();
					currentNode.nodename = elem;
					currentNode.numstr = itoa(elem);
					instructioncalled = true;
			}
			if (indentcount === 0 && instructioncalled === false){
				NodeList.push(currentNode);
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
		document.getElementById("ide_console").innerHTML += [String.fromCharCode(this.set( this.arg(a, false))), '\n'].join();
		this.outcCalled = true;
		return 0;
	} // "1 1 " : print ascii code of arg0(not working on windows mode)
	this.OUTSTR=(a, b)=>{
		for (var index in this.variables[this.arg(a, false)]) {
			document.getElementById("ide_console").innerHTML += String.fromCharCode(this.variables[this.arg(a, false)][index]);
		}
		document.getElementById("ide_console").innerHTML += '\n'
		this.set(this.variables[this.arg(a, false)].join());
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
	this.DRAWRECT = (a, b) => {
		// a is left top position, b is size
		DrawableObjectList.push(new DrawableObject(this.arg(a,false), this.arg(b,false), 0));
	}
	this.DRAWCIRCLE = (a, b) => {
		// a is center position, b is radius
		DrawableObjectList.push(new DrawableObject(this.arg(a,false), this.arg(b,false), 1));
	}
	this.DRAWLINE = (a, b) => {
		// both a and b are position(start, end)
		DrawableObjectList.push(new DrawableObject(this.arg(a,false), this.arg(b,false), 2));
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
		if (b !== 0 ) return this.set(this.arg(a, false).reverse().join());
		else return this.set(this.arg(a, false).join())
	}
	
	this.command = [
		['1001' , this.DEFCANVAS], // "830": initialize Canvas, arg0: list of width and height; arg1: 2d(0) or webgl(1)
		['1008' , this.VARUSE], // "837": get arg0[arg1]
		['1015' , this.DEFVECTOR],
		['1036', this.CALLMEMBER],
		['1043', this.GETMEMBER],
		['1050', this.DRAWRECT], 
		['1057', this.DRAWCIRCLE], 
		['1064', this.DRAWLINE], 
		['1071', this.SETTIMER], 
		['1078', this.DEFCALLBACK],
		['1085', this.LIST2STR],
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
        return (this.functions.get(ISA[0].nodename))(ISA[1],ISA[2]);
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

// callback functions
function onChangeFile(event) {
	var fileText;
	var file = event.target.files;
	for (var f of file) {
		var reader = new FileReader();
		reader.onload = function(e) {
		  fileText = e.target.result;
		  Xen2KHandle.read(fileText);
		};
		reader.readAsText(f);
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
	AddNodeToCanvas([ev.offsetX, ev.offsetY], data);
}

var dataArray =[];
function changeTargetMemberVar(ev) {
	const data = ev.dataTransfer.getData("text/plain");
	dataArray = data.split(",");
	ev.target.value = dataArray[2];
}

var BranchPoint = 0;
var DrawingLine = [[0,0], [0,0]];
var BranchParent = null;
var isDragging = false;
var rightbuttonDragging = false;
var rightbuttonDraggingTimer = null;
var commentplateArray = [];
var deleteType = 0;
function canvas_mousedown_handler(e) {
	e.preventDefault();
	if (e.button === 0) {
		var targetNode = null;
		for (var node of commentplateArray){
			if (e.offsetX >= node.position[0] && e.offsetX <= node.position[0] + node.size[0] && e.offsetY >= node.position[1] && e.offsetY <= node.position[1]+node.size[1] - 10) {
				targetNode = node;
			}
		}
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
			if (bareNodeList.indexOf(targetNode) < bareNodeList.length-1) {
				bareNodeList.push(targetNode);
				bareNodeList.splice(bareNodeList.indexOf(targetNode),1);
			}
			deleteType = 0;
		} else if (targetNode !== null && targetNode.constructor === CanvasComment) {
			targetNode.SetPosition(e.offsetX, e.offsetY);
			targetNode.dragging = true;
			if (commentplateArray.indexOf(targetNode) < commentplateArray.length-1) {
				commentplateArray.push(targetNode);
				commentplateArray.splice(commentplateArray.indexOf(targetNode),1);
			}
			deleteType = 1;
		} else if (DropMenuHandle.activated && e.offsetX >= DropMenuHandle.position[0] && e.offsetX < DropMenuHandle.position[0] + DropMenuHandle.size[0] && e.offsetY >= DropMenuHandle.position[1] && e.offsetY < DropMenuHandle.position[1] + DropMenuHandle.size[1] ) {
			// click element inside dropdown menu
			var clickpointY = Math.floor((e.offsetY- DropMenuHandle.position[1] ) / 16);
			bareNodeList.push(new CanvasBox(DropMenuHandle.MenuList[clickpointY + DropMenuHandle.sightpoint][1] ,DropMenuHandle.MenuList[clickpointY][0]));
			bareNodeList[bareNodeList.length-1].SetPosition(e.offsetX, e.offsetY);
		}
		else {
			// moving background
			isDragging = true;
		}
		
		DropMenuHandle.activated = false;
		if (typingComment !== null && !(e.offsetX >= typingComment.position[0] && e.offsetX <= typingComment.position[0] + typingComment.size[0] && e.offsetY >= typingComment.position[1] && e.offsetY <= typingComment.position[1]+24)) {
			typingComment = null;
		}
	} else if (e.button === 2) {
		rightbuttonDraggingTimer = setTimeout(function (x, y) {
			DropMenuHandle.activated = false;
			rightbuttonDragging = true;
			commentplateArray.push(new CanvasComment("comment" + commentplateArray.length.toString()));
			commentplateArray[commentplateArray.length-1].position = [e.offsetX, e.offsetY];
			commentplateArray[commentplateArray.length-1].activated = true;
		}, 200, e.offsetX, e.offsetY);
	}
}
function canvas_mousemove_handler(e){
	if (bareNodeList.length > 0 && bareNodeList[bareNodeList.length-1].dragging) {
		bareNodeList[bareNodeList.length-1].SetPosition(e.offsetX, e.offsetY);
	} else if (commentplateArray.length > 0 && commentplateArray[commentplateArray.length-1].dragging) {
		commentplateArray[commentplateArray.length-1].SetPosition(e.offsetX, e.offsetY);;
	} else if (isDragging){
		for (var node of commentplateArray) {
			node.position[0] += e.movementX;
			node.position[1] += e.movementY;
		}
		for (var node of bareNodeList) {
			node.position[0] += e.movementX;
			node.position[1] += e.movementY;
		}
	}
	if (BranchPoint !== 0) {
		DrawingLine[1] = [e.offsetX, e.offsetY];
	}
		
	if (rightbuttonDragging){
		commentplateArray[commentplateArray.length-1].size = [e.offsetX - commentplateArray[commentplateArray.length-1].position[0], e.offsetY - commentplateArray[commentplateArray.length-1].position[1]];
	}
}
function canvas_mouseup_handler(e){
	e.preventDefault();
	if (e.button === 0) {
		if (bareNodeList.length >0) bareNodeList[bareNodeList.length-1].dragging = false;
		if (commentplateArray.length > 0) commentplateArray[commentplateArray.length -1].dragging = false;
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
		
	} else if (e.button === 2) {
		if (rightbuttonDragging) {
			commentplateArray[commentplateArray.length-1].size = [e.offsetX - commentplateArray[commentplateArray.length-1].position[0], e.offsetY - commentplateArray[commentplateArray.length-1].position[1]];
			if (commentplateArray[commentplateArray.length-1].size[0] < 0) {
				commentplateArray[commentplateArray.length-1].position[0] += commentplateArray[commentplateArray.length-1].size[0];
				commentplateArray[commentplateArray.length-1].size[0] = commentplateArray[commentplateArray.length-1].size[0] * (-1);
			}
			if (commentplateArray[commentplateArray.length-1].size[1] < 0) {
				commentplateArray[commentplateArray.length-1].position[1] += commentplateArray[commentplateArray.length-1].size[1];
				commentplateArray[commentplateArray.length-1].size[1] = commentplateArray[commentplateArray.length-1].size[1] * (-1);
			}
		}
		else{
			clearTimeout(rightbuttonDraggingTimer);
			DropMenuHandle.position = [e.offsetX, e.offsetY];
			DropMenuHandle.activated = true;
		}
		rightbuttonDragging = false;
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

function canvas_doubleclick_handler(e){
	e.preventDefault();
	if (e.button === 0) {
		var targetNode = null;
		for (var node of commentplateArray){
			if (e.offsetX >= node.position[0] && e.offsetX < node.position[0] + node.size[0] && e.offsetY >= node.position[1] && e.offsetY < node.position[1]+node.size[1]) {
				targetNode = node;
			}
		}
		if (targetNode !== null){
			typingComment = targetNode;
		}
	}
}

function canvas_keydown_handler(e){
	e.preventDefault();
	if (typingComment !== null) {
		// editing typingComment
		if (e.key === "Backspace") typingComment.nodename = typingComment.nodename.slice(0, typingComment.nodename.length-1);
		else if (e.key.length === 1)typingComment.nodename = typingComment.nodename.concat(e.key);
	}
	else {
		if (e.code === 'Delete'){
			if ( deleteType === 0 && bareNodeList.length > 0){ // delete node
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
			} else if (deleteType === 1 && commentplateArray.length > 0){
				commentplateArray.pop();
			}
		}
	}
}
var rootNodeList =  [];
function savehandler(e) {
	if (bareNodeList.length === 0) return;
	resultscript = "";
	rootNodeList = [];
	for (var nodeElem of bareNodeList){
		if (nodeElem.parentNode === null) {
			rootNodeList.push(nodeElem); //type: CanvasBox
		}
	}
	//Sorting
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
	for (var index1 of rootNodeList){
		recursiveScriptBuilder(index1);
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
var resultscript = "";
// normal function
function recursiveScriptBuilder(targetnode){ // targetnode == a node of rootNodeList(CanvasBox)
	if (targetnode.nodename === '*' || targetnode.nodename === '_') {
		resultscript += targetnode.numstr;
		return;
	} else {
		//function found
		resultscript+=itoa(parseInt(targetnode.numstr));
		resultscript += "=";
		recursiveScriptBuilder(targetnode.leftBranch);
		resultscript += "+";
		recursiveScriptBuilder(targetnode.rightBranch);
		resultscript+= ".";
		return;
	}
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
function AddClassToClassExplorer (classindex) {
	var background = document.createElement("div");
	background.id="classbackground"+classindex.toString();
	background.style="width:296px;height:100px;display:table;border:2px solid";
	background.value= classindex;
	background.innerHTML = "<div width=\"100%\" style=\"display:table-header-group;border:2px solid;\"><div style=\"display:table-cell\">class "+classindex.toString() + "</div><div style=\"display:table-cell\">멤버 변수</div><div style=\"display:table-cell\">멤버 함수</div></div>";
	document.getElementById("ide_class").appendChild(background);
	
	var memberRowgroup = document.createElement("div");
	memberRowgroup.style.display = "table-row-group";
	for (var index = 0; index < (Xen2KHandle.classmember[classindex-1].length > Xen2KHandle.classFunction[classindex-1].length ? Xen2KHandle.classmember[classindex-1].length:Xen2KHandle.classFunction[classindex-1].length ); index++){
		var memberRow = document.createElement("div");
		memberRow.style.display = "table-row";
		var nulloption = document.createElement("div");
		nulloption.style.display = "table-cell";
		if (index === 0) nulloption.innerHTML = "<button>생성자</button>"
		memberRow.appendChild(nulloption);
		// member variable
		if (Xen2KHandle.classmember[classindex-1][index] !== undefined) {
			var tempoption = document.createElement("div");
			tempoption.className = "membervarTable"
			tempoption.style.display = "table-cell";
			tempoption.draggable = true;
			tempoption.addEventListener("dragstart", classvar_dragstart_handler);
			tempoption.value = index;
			tempoption.innerText = Xen2KHandle.classmember[classindex-1][index];
			memberRow.appendChild(tempoption);
		}
		if (Xen2KHandle.classFunction[classindex-1][index] !== undefined){
			var tempoption2 = document.createElement("div");
			tempoption2.style.display = "table-cell";
			tempoption2.value = Xen2KHandle.classFunction[classindex-1][index][1][0].nodename;
			tempoption2.innerText = Xen2KHandle.classFunction[classindex-1][index][1][0].numstr;
			memberRow.appendChild(tempoption2);
		}
		memberRowgroup.appendChild(memberRow);
	}
	background.appendChild(memberRowgroup);
}

function classvar_dragstart_handler(ev) {
	ev.dataTransfer.setData("text/plain", ev.target.parentNode.parentNode.parentNode.value+","+ev.target.value+","+ev.target.innerHTML);
}

function EditMemberVar (ev) {
	if (dataArray.length <3) return;
	document.getElementById("classbackground" + dataArray[0].toString()).getElementsByClassName("membervarTable")[parseInt(dataArray[1])].innerHTML = ev.target.value;
}

function renderCanvas(){
	document.getElementById("MainCanvas").width = document.getElementById("MainCanvas").width; // reset the canvas
	for (var elem of commentplateArray){
		elem.DrawNode();
	}
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
	if (Xen2KHandle.console2Canvas){
		document.getElementById("consoleCanvas").width = document.getElementById("consoleCanvas").width; // reset the canvas
		for (var elem of DrawableObjectList) {
			elem.Draw();
		}
	}
	if (DropMenuHandle.activated)DropMenuHandle.DrawMenu(document.getElementById("MainCanvas").getContext("2d"));
	requestAnimationFrame(renderCanvas);
}

var Xen2KHandle = new Xen2K();
var FunctionInfoDefault = [
		['1001', "DEFCANVAS"],
		['1015', "DEFVECTOR"],
		['1036', "CALLMEMBER"],
		['1043', "GETMEMBER"],
		['1050', "DRAWRECT"], 
		['1057', "DRAWCIRCLE"], 
		['1064', "DRAWLINE"], 
		['1071', "SETTIMER"], 
		['1078', "DEFCALLBACK"],
		['1085', "LIST2STR"]
		];
var DropMenuHandle = new DropdownMenu(FunctionInfoDefault);

var FunctionInfoElem = new Array(
        ['1001', "DEFCANVAS"], 
		['1015', "DEFVECTOR"],
		['1036', "CALLMEMBER"],
		['1043', "GETMEMBER"],		
		['1050', "DRAWRECT"], 
		['1057', "DRAWCIRCLE"], 
		['1064', "DRAWLINE"], 
		['1071', "SETTIMER"], 
		['1078', "DEFCALLBACK"],
		['1085', "LIST2STR"]);

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
Background.innerHTML = "<div id = \"mainplate\"> \
       <canvas id=\"MainCanvas\" width=\"800px\" height=\"600px\"></canvas> \
    </div>";
document.getElementById("mw-content-text").appendChild(Background);
Background.innerHTML += "<span id = \"nodelist\" width=\"800px\" height=\"600px\"> \
	Xen2K IDE<br>\
    </span>\
	";
var exportToFileButton = document.createElement("button");
exportToFileButton.id = "saveButton";
exportToFileButton.addEventListener("click", savehandler);
exportToFileButton.innerText = "Save";
document.getElementById("ide_main").appendChild(exportToFileButton); 

var formElement = document.createElement('form');
formElement.name = "uploadedFile";
formElement.innerHTML = "\
	  <span>꾸러미 가져오기</span>\
      <input id=\"uploadInput\" type=\"file\" name=\"myFiles\" onchange=\"onChangeFile(event)\" multiple>";
document.getElementById("ide_main").appendChild(formElement);

var consolepage = document.createElement('div');
consolepage.id = "ide_console";
consolepage.innerHTML = "console\n";
document.getElementById("ide_main").appendChild(consolepage);

var classpage = document.createElement('div');
classpage.id = "ide_class";
classpage.innerHTML = "<input name=\"ide_VarEdit\" value=\"0\" onchange=\"EditMemberVar(event)\">";
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
	element2.addEventListener("dblclick", canvas_doubleclick_handler);
	element2.addEventListener("contextmenu", function(e) {e.preventDefault();return false;});
	element2.addEventListener("mouseup",canvas_mouseup_handler);
	element2.addEventListener("mousemove",canvas_mousemove_handler);
	element2.addEventListener("wheel", canvas_wheel_handler);
	element2.addEventListener("keydown", canvas_keydown_handler);
	var elementMemVarEdit = document.getElementById("ide_class").querySelector("input");
	elementMemVarEdit.addEventListener("drop", changeTargetMemberVar);
	requestAnimationFrame(renderCanvas);
	
});
