// Xen2K Objects


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