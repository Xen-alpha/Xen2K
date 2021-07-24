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
	memFuncAdd.value = classindex.toString();
	memberFuncModifyButtons.appendChild(memFuncAdd);
	var memFuncDel = document.createElement("button");
	memFuncDel.onclick = deleteMemFunc;
	memFuncDel.innerText = "함수 제거";
	memFuncDel.value = classindex.toString();
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