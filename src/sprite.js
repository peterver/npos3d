NPos3d.Scene.prototype.drawSprite = function(c,o){
	c.save();
	c.translate(o.point2D.x, o.point2D.y);
	if(o.depthScale){
		c.scale(o.scale * o.point2D.scale, o.scale * o.point2D.scale);
	} else {
		c.scale(o.scale, o.scale);
	}
	c.rotate(o.rot);
	if(o.numFrames > 1){
		o.frameState += 0.3;
		if(o.frameState >= o.numFrames){
			o.frameState = 0;
		}
		c.drawImage(o.image, (o.width * Math.floor(o.frameState)), 0, o.width, o.height, o.offset.x, o.offset.y, o.width, o.height);
	}else{
		c.drawImage(o.image, o.offset.x, o.offset.y);
	}
	c.restore();
};
NPos3d.Scene.prototype.renderSprite = function(o){
	var t = this,c = t.c;
	if(o.loaded){
		//offset the points by the object's position
		var p3 = NPos3d.Maths.p3Add(o.pos, t.camera.pos);
		if( p3[2] < t.camera.clipNear && p3[2] > t.camera.clipFar ){
			o.point2D = t.project3Dto2D(p3); //a convenience measure
			//Just some basic positional culling... if it's not on screen, don't render it...
			if(
				(o.point2D.x + (o.offset.x * o.point2D.scale) < t.cx && o.point2D.x - (o.offset.x * o.point2D.scale) > -t.cx) &&
				(o.point2D.y + (o.offset.y * o.point2D.scale) < t.cy && o.point2D.y - (o.offset.y * o.point2D.scale) > -t.cy)
			){
				t.renderInstructionList.push({
					method: t.drawSprite,
					args: o, //It just seemed silly to re-define all of the render args over again in a new object
					z: p3[2]
				});
			}
		}
	}
};


NPos3d.blessWithSpriteBase = function(o,config){
	if(!config.path){throw 'You MUST provide an image `path` value on sprite type objects!'};
	o.pos = config.pos || [0,0,0];
	o.rot = config.rot || 0;
	o.scale = config.scale || 1;
	o.depthScale = config.depthScale || false; //Default behavior: Act as a non-scaling billboard
	o.numFrames = config.numFrames || 1;
	o.frameState = o.numFrames;
	o.width = 0;
	o.height = 0;
	o.loaded = false;
	o.image = new Image();
	o.image.onload = function(){
		o.width = o.image.width / o.numFrames;
		o.height = o.image.height;
		o.offset = {
			x:-Math.round(o.width/2),
			y:-Math.round(o.height/2)
		};
		o.boundingBox = [[o.offset.x,o.offset.y,-32],[-o.offset.x,-o.offset.y,32]];
		o.loaded = true;
		//console.log(t);
	};
	o.render = config.render || o.render;
	o.image.src = config.path;
	return o;
};

NPos3d.Sprite3D = function(config){
	var t = this, type = 'Sprite3D';
	if(t.type !== type){throw 'You must use the `new` keyword when invoking the ' + type + ' constructor.';}
	NPos3d.blessWithSpriteBase(t,config);
	return t;
};

NPos3d.Sprite3D.prototype = {
	type: 'Sprite3D',
	render: function(){
		this.scene.renderSprite(this);
	},
	update:function(){
		this.render();
	},
	destroy:NPos3d.destroyFunc
};