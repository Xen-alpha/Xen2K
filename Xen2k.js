/**
 * Xen2K Javascript Converter
**/
const VERSION = "PSI 0.1.0";

function isWhitespace(c) {
    return (c === '-') || (c === '\r') || (c === '\n') || ((c >= 'A') && (c <= 'Z') && (c != 'E') && (c != 'S'));
}

function isDigit(c){
    return (c >= '0' && c <= '9') || (c === ' ');
}
function digit(c){
    if (c >= '0' && c <= '9'){
        return ord(c) - ord('0');
    }
    return 10;
}
// handle or data
var Xen2KHandle;

// callback functions
function onChangeHeaderFile(event) {
  var fileText;
  var file = event.target.files[0];
  var reader = new FileReader();
  reader.onload = function(e) {
    fileText = e.target.result;
	Xen2KHandle.readuserfunctions(fileText);
  };
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
}
//class
function BreakLoop(Exception){
    this.message = Exception;
    this.name = "Break";
}
BreakLoop.prototype.toString = function () {
    return this.name + ': "' + this.message + '"';
}
function Xen2K() {
	// member variables/objects
    this.functions = {
        // 1001 : this.SETSIZE // set windows with size (arg0, arg1)
        1008 : this.VARUSE, // "837": get arg0[arg1]
        // 1015 : 
        // 1022 : 
        1561 : this.BREAK, // "119 ": throw error in Xen2K
        1568 : this.DIV, // "11 6"
        1638 : this.ADD, // "125 "
        1687 : this.SUB, // "12 4"
        1715 : this.MUL, // "131 "
        1806 : this.NAND, // "13 2": NAND operation
        1813 : this.SHL, // "13 9": SHIFT arg0's Bit left arg1 times
        2177 : this.SET, // "16  " : arg0 <= arg1
        2541 : this.STOP, // "1 00": stop the program
        2548 : this.VARDEC, // "1 07" : declare integer list named arg1, with its length arg0
        2562 : this.OUTC, // "1 1 " : print ascii code of arg0(not working on windows mode)
        2569 : this.OUTSTR, // "1 26": print ascii code array of arg0(not working on windows mode)
        7931 : this.IFEQ, // "5 60" : last compared was equal -> execute arg0, else -> execute arg1
        7938 : this.IFLT, // "5 67" : arg0 < arg1 -> execute arg0, else arg1
        7980 : this.CMP, // "5  5" : compare arg0 and arg1 -> use this with 7931
        8225 : this.WHILE, // "61 8" : infinite loop with execute arg0, excute arg1 if error occurred
    }
	this.userfunctions = [];
	// member functions
	this.readuserfunctions = function (data){
		this.userfunctions = [];
        if (data !== ""){
            var functiondata = data.split('!')
            if (functiondata.length > 0){
                functiondata.splice(0,1); // removing useless empty string
			}
            if (len(functiondata) > 0){
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
        this.resultIsRandom = False;
        this.resultlist = [];
        this.variables = {};
        var instructionSequence = [];
        var offset = 0
        while (offset < tokens.length) {
            var instructionInfo = this.processRecursive(tokens, offset)
            instructionSequence.push( instructionInfo.instruction )
            offset += instructionInfo.l
        }
        this.ip = 0 // initialize the instructor pointer
        this.outcCalled = false;
        this.instructionSequence = instructionSequence;
        while (this.ip < this.instructionSequence.length) {
            var instruction = this.instructionSequence[this.ip];
            this.ip += 1;
            this.invoke(instruction,false);
        }
        if (!this.outcCalled)
            document.getElementById("mw-content-text").innerText += this.result;
	};
	this.processRecursive = function(tokens,offset){
        var argument = tokens[offset]
        if (argument === '*' || argument === '_')
            return {instruction: argument, l: 1};
        else if (argument === '>') {
            //function caller, just make it inline so make a sub-tokens
            temptokens = tokens.reverse();
            temptokensEndpoint=temptokens.index('<'); // find first < character
            subtokens = temptokens.splice(temptokensEndpoint+1,len(tokens)-offset);
            subtokens = subtokens.reverse();
            // now do the recursive read and do the invoke test
            var instructionInfo = this.processRecursive(subtokens, 0);
            // invoke and get the this.result to find index of this.userfunctions
            // we can expect that only one this.result will be derived since we expect only one result
            this.result = this.arg(instructionInfo.instruction, true);
            // now this.result holds the index of this.userfunctions.
            instructionInfo_Inner = this.processRecursive(this.userfunctions[this.result], 0);
            return {instruction: instructionInfo_Inner.instruction, l:instructionInfo.l+2} // >(function context)< --> result the instruction tree with invocation passed 
        }
        // no special
        this.context = (tokens, offset);
        var function_context = this.lookupFunction(tokens[offset]);
        instruction_a = this.processRecursive(tokens, offset+2);
        instruction_b = this.processRecursive(tokens, offset+len_a+3);
        len_combined = len_a+len_b+4
        if (tokens[offset+1] === '/')
            return {instruction: [function_context, a, b], l: len_combined}
        else
            return {instruction: [function_context, b, a], l: len_combined}
	};
	this.lookupFunction = function(token){
        return this.functions[token];
	};
	this.set = function(value){
        this.result = value;
        return this.result;
    };
	this.arg= function(argument, DoNotDisplay = false){
        if ( argument === '*')
            return this.set( random.randint(0, 12345) );
        else if (argument === '_')
            return this.result;
            
        return this.set( this.invoke(argument, DoNotDisplay) );
    };
	this.invoke= function(instruction, DoNotDisplay = false){
        let ISA = instruction;
        if (DoNotDisplay && ISA[0] === this.functions[2562])
            return this.set(this.arg(ISA[1]));
        return ISA[0](ISA[1],ISA[2]);
    };
	this.ADD= function(a, b){
        return this.set( this.arg(a) + this.arg(b) );
    }
	this.DIV= function(a, b){
        return this.set( this.arg(a) / this.arg(b) );
    }
	this.SUB= function(a, b){
        return this.set( this.arg(a) - this.arg(b) );
    }
	this.MUL= function(a, b){
        return this.set( this.arg(a) * this.arg(b) );
    }
	this.OUTC= function(a, b){
        document.getElementById("mw-content-text").innerText +=  this.set( this.arg(a) ) & 0x7F;
        this.outcCalled = true;
    }
	this.OUTSTR= function(a, b){
        document.getElementById("mw-content-text").innerText += this.variables[this.arg(a)].toString;
        this.set(this.variables[this.arg(a)]);
        this.outcCalled = True;
    }
	this.NAND= function(a, b){
        a = Boolean(this.arg(a))
        b = Boolean(this.arg(b));
        function nand(a, b){
            return !(a && b);
        }
        return this.set( nand(a, b) );
    }
	this.SHL= function(a, b){
        return this.set(this.arg(a) << this.arg(b));
    }
	this.SET= function(a, b){
        a = this.arg(a);
        b = this.arg(b);
        this.variables[this.lastUse][a] = b;
        return this.set( b );
    }
	this.STOP= function(a, b){
        throw "Program Terminated";
    }
	this.WHILE= function(a, b){
        while (true) {
            try{
                this.set(this.arg(a));
            }
            catch (e) {
                this.set(this.arg(b));
                console.log(e);
                break;
            }
        }
    }
    this.CMP= function(a, b){
        a = this.arg(a);
        b = this.arg(b);
        this.cmpEqual = a === b;
        this.cmpLess = a < b;
    }
	this.IFEQ= function(a, b){
        a = this.arg(a);
        b = this.arg(b);
        if (this.cmpEqual){
            return this.set(a);
        }
        else{
            return this.set(b);
        }
    }
	this.IFLT= function(a, b){
        a = this.arg(a);
        b = this.arg(b);
        if (this.cmpLess)
            return this.set(a);
        else{
            return this.set(b);
        }
    }
	this.VARDEC= function(a, b){
        a = this.arg(a);
        b = this.arg(b);
        this.variables[b] = new Array(a+1);
        return 0;
    }
    this.VARUSE= function(a, b){
        a = this.arg(a);
        b = this.arg(b);
        this.lastUse = a;
        return this.set( this.variables[a][b] );
    }
	this.BREAK= function(a, b){
        throw "Break Occurred"
    }
	this.tokenize= function(data){
        var result = [];
        var number = 0;
        var isRecordingNumber = false;
        for (var c of data)
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
                    result.append( number );
                }
                result.append( c );
            }
            else if ("/\*_+.=".indexOf(c) !== -1) // built-in function call
                if (isRecordingNumber) {
                    isRecordingNumber = False;
                    result.append( number );
                }
                result.append( c );
        if (isRecordingNumber)
            result.append( number );
        return result;
    }
}
// main part
Xen2KHandle = new Xen2K();
var formElement = document.createElement('form');
formElement.name = "uploadedFile";
formElement.innerHTML = "<div> \
      <input id=\"uploadInput\" type=\"file\" name=\"myFiles\" onchange=\"onChangeHeaderFile(event)\" multiple> \
    </div> \
	<div> \
      <input id=\"uploadProgram\" type=\"file\" name=\"myProgram\" onchange=\"onChangeProgramFile(event)\" multiple> \
    </div>"
document.getElementById("mw-content-text").appendChild(formElement);