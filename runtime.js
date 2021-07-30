// runtime.js

/**
 * Xen2K Javascript Converter
**/
const VERSION = "PSI 0.1.2";

var Xen2KProgramCanvas = null;

function BreakLoop(Exception){
    this.message = Exception;
    this.name = "Break";
}
BreakLoop.prototype.toString = function () {
    return this.name + ': "' + this.message + '"';
}

function TreeNode(num){
	this.parentNode = null;
	this.numstr = num;
	this.value = NaN;
	this.leftBranch = null;
	this.rightBranch = null;
}

// main program class

function Xen2K() {
	// member variables/objects
	this.currentNodeList = [];
	this.variables = [];
	this.classmember = [];
	this.classFunction = [];
	this.DrawableObjectList = [];
	
	// read: parse code and set a binary CanvasBox Tree
	this.read = function(data){
		this.currentNodeList = [];
		this.variables = [];
		this.classmember = [];
		this.classFunction = [];
		
		var classes = data.trim().split("&");
		//classes.pop();
		for(var classtext of classes) {
			// comment Extraction
			//member function and constructor parsing
			var tempdata = classtext.trim().split("!");
			var tempArray2 = new Array(0);
			for (var i = 1; i< tempdata.length; i++) {
				var memberFuncInfo = tempdata[i].trim().split(",");
				var memberFuncTokens = [parseInt(memberFuncInfo[0]), parseInt(memberFuncInfo[1]), this.tokenize(memberFuncInfo[2])];
				tempArray2.push(memberFuncTokens);
			}
			this.classFunction.push(tempArray2);
			//member variables
			var tempArray = tempdata[0].trim().split("#");
			var tempArray3 = new Array(0);
			for (var i = 1; i< tempArray.length; i++) {
				var memberVarInfo = tempArray[i].trim().split(",");
				var memberVarTokens = [parseInt(memberVarInfo[0]), parseInt(memberVarInfo[1]), this.tokenize(memberVarInfo[2])];
				tempArray3.push(memberVarTokens);
			} 
			this.classmember.push(tempArray3);
		}
        return;
	};
	
	this.BuildTree = function (tokens){
		if (tokens === []) return [];
		var resultNodeList = [];
		var tempRootNodeList = [];
		var currentNode = null;
		var indentcount = 0;
		var indexcount = 0;
		var instructioncalled = false;
		for (var elem of tokens){
			switch (elem){
				case '/':
					if (instructioncalled) {
						indentcount += 1;
						currentNode.leftBranch = new TreeNode("");
						currentNode.leftBranch.parentNode = currentNode;
						currentNode = currentNode.leftBranch;
					}
					else {
						currentNode = currentNode.parentNode; 
						currentNode.rightBranch = new TreeNode("");
						currentNode.rightBranch.parentNode = currentNode;
						currentNode = currentNode.rightBranch;
					}
					break;
				case '=':
					indentcount += 1;
					currentNode.leftBranch = new TreeNode( "");
					currentNode.leftBranch.parentNode = currentNode;
					currentNode = currentNode.leftBranch;
					break;
				case '+':
					currentNode = currentNode.parentNode; 
					currentNode.rightBranch = new TreeNode( "");
					currentNode.rightBranch.parentNode = currentNode;
					currentNode = currentNode.rightBranch;
					break;
				case '\\':
				case '.':
					currentNode = currentNode.parentNode;
					indentcount -= 1;
					break;
				case '*': //random
					currentNode.numstr = elem;
					indexcount += 1;
					instructioncalled = false;
					break;
				case '_': //data
					currentNode.numstr = elem;
					indexcount += 1;
					instructioncalled = false;
					break;
				case '>': // do nothing for now
					break;
				case '<':
					// do nothing, because we already have passed this token 
					break;
				default: // instruction
					if (indentcount === 0)currentNode = new TreeNode(elem);
					instructioncalled = true;
					currentNode.numstr = elem;
					indexcount += 1;
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
	
	this.Traverse = (tokens, DoNotDisplay) => {
		this.currentNodeList = this.BuildTree(tokens);
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
		document.getElementById("mw-content-text").appendChild(consoleCanvas);
		return consoleCanvas.getContext("2d");
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
		//a = b;
		return 0;
	}
	this.DRAWRECT = (a, b) => {
		// a is left top position, b is size
		this.DrawableObjectList.push( new DrawableObject(null,this.arg(a,false), this.arg(b,false), 0));
	}
	this.DRAWCIRCLE = (a, b) => {
		// a is center position, b is radius
		this.DrawableObjectList.push( new DrawableObject(null,this.arg(a,false), this.arg(b,false), 1));
	}
	this.DRAWLINE = (a, b) => {
		// both a and b are position(start, end)
		this.DrawableObjectList.push( new DrawableObject(null,this.arg(a,false), this.arg(b,false), 2));
	}
	this.DRAWTEXT = function (a, b) {
		// both a and b are position(start, end)
		this.DrawableObjectList.push( new DrawableObject(null,this.arg(a,false), this.arg(b,false), 3));
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
		this.DrawableObjectList.push( new StickMan(this.arg(a,false), this.arg(b,false)));
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
        if (DoNotDisplay && (ISA[0].numstr === '2562'|| ISA[0].numstr === '2569'))
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