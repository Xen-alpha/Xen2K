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
            document.getElementById("mw-content-text").innerText += this.result;
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
		document.getElementById("mw-content-text").innerText.concat(this.set( this.arg(a, false) & 0x7F));
		this.outcCalled = true;
		return 0;
	} // "1 1 " : print ascii code of arg0(not working on windows mode)
	this.OUTSTR=(a, b)=>{
		document.getElementById("mw-content-text").innerText.concat(this.variables[this.arg(a, false)].toString());
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
	} // "5 67" : arg0 < arg1 -> execute arg0, else arg1
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

// main part
var Xen2KHandle = new Xen2K();
var formElement = document.createElement('form');
formElement.name = "uploadedFile";
formElement.innerHTML = "<div> \
      <input id=\"uploadInput\" type=\"file\" name=\"myFiles\" onchange=\"onChangeHeaderFile(event)\" multiple> \
    </div> \
	<div> \
      <input id=\"uploadProgram\" type=\"file\" name=\"myProgram\" onchange=\"onChangeProgramFile(event)\" multiple> \
    </div>"
document.getElementById("mw-content-text").appendChild(formElement);