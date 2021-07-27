// Xen2K Objects

var DrawableObjectList = [];
function DrawableObject (parentobj, a, b, type){
	this.a = a;
	this.b = b;
	this.type = type;
	this.parentObject = parentobj;
	this.loopAnimation = false;
	this.animationSequenceNumber = 0;
	this.maxAnimationSequenceNumber = 0;
	this.gravity = 0;
	this.Draw = function () {
		if (this.type === 0) { // rectangle
			if ( Xen2KProgramCanvas !== null) {
				var pos = a;
				var size = b;
				Xen2KProgramCanvas.beginPath();
				Xen2KProgramCanvas.rect(parseInt(pos[0]), parseInt(pos[1]), parseInt(size[0]), parseInt(size[1]));
				Xen2KProgramCanvas.closePath();
				Xen2KProgramCanvas.fillStyle = "rgba(255, 255, 255,1)";
				Xen2KProgramCanvas.fill();
			}
		} else if (this.type === 1) { // circle
			if ( Xen2KProgramCanvas !== null) {
				var pos = a;
				var radius = b;
				Xen2KProgramCanvas.beginPath();
				Xen2KProgramCanvas.arc(parseInt(pos[0]), parseInt(pos[1]), radius, 0, 2*Math.PI, true);
				Xen2KProgramCanvas.closePath();
				Xen2KProgramCanvas.fillStyle = "rgba(255, 255, 255,1)";
				Xen2KProgramCanvas.fill();
				Xen2KProgramCanvas.strokeStyle = "rgba(255, 255, 255,1)";
				Xen2KProgramCanvas.stroke();
			}
		} else if (this.type === 2) { // line
			if ( Xen2KProgramCanvas !== null) {
				if (this.parentObject !== null) {
					var pos2 = b;
					Xen2KProgramCanvas.beginPath();
					Xen2KProgramCanvas.moveTo(parseInt(this.parentObject.b[0]), parseInt(this.parentObject.b[1]));
					Xen2KProgramCanvas.LineTo(parseInt(pos2[0]), parseInt(pos2[1]));
					Xen2KProgramCanvas.closePath();
					Xen2KProgramCanvas.fillStyle = "rgba(255, 255, 255,1)";
					Xen2KProgramCanvas.fill();
				} else {
					var pos = a;
					var pos2 = b;
					Xen2KProgramCanvas.beginPath();
					Xen2KProgramCanvas.moveTo(parseInt(pos[0]), parseInt(pos[1]));
					Xen2KProgramCanvas.LineTo(parseInt(pos2[0]), parseInt(pos2[1]));
					Xen2KProgramCanvas.closePath();
					Xen2KProgramCanvas.fillStyle = "rgba(255, 255, 255,1)";
					Xen2KProgramCanvas.fill();
				}
			}
		} else if (this.type === 3) { // text
			if ( Xen2KProgramCanvas !== null) {
				var targetText = a;
				var pos = b;
				Xen2KProgramCanvas.beginPath();
				Xen2KProgramCanvas.font = "12px Arial, sans-serif";
				Xen2KProgramCanvas.textAlign = "center";
				Xen2KProgramCanvas.textBaseline = "alphabetic";
				Xen2KProgramCanvas.strokeText(targetText, parseInt(pos[0]), parseInt(pos[1]));
				Xen2KProgramCanvas.closePath();
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

