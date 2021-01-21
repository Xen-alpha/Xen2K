/**
 * Xen2K Javascript Converter
**/
const VERSION = "PSI 0.1.0";

function isWhitespace(c) {
    return (c == '-') || (c == '\r') || (c == '\n') || ((c >= 'A') && (c <= 'Z') && (c != 'E') && (c != 'S'));
}

function isDigit(c){
    return (c >= '0' && c <= '9') || (c == ' ');
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
	}
	this.processRecursive = function(tokens,offset){
	}
	this.lookupFunction = function(token){
	}
	this.set = function(value){}
	this.arg= function(argument, DoNotDisplay = false){}
	this.invoke= function(instruction, DoNotDisplay = false){}
	this.ADD= function(a, b){}
	this.DIV= function(a, b){}
	this.SUB= function(a, b){}
	this.MUL= function(a, b){}
	this.OUTC= function(a, b){}
	this.OUTSTR= function(a, b){}
	this.NAND= function(a, b){}
	this.SHL= function(a, b){}
	this.SET= function(a, b){}
	this.STOP= function(a, b){}
	this.WHILE= function(args){}
	this.CMP= function(a, b){}
	this.IFEQ= function(a, b){}
	this.IFLT= function(a, b){}
	this.VARDEC= function(a, b){}
	this.VARUSE= function(a, b){}
	this.BREAK= function(a, b){}
	this.tokenize= function(data){}
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