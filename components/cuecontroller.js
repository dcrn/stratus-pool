CueController = function() {
    this.radius = 0.3;
    this.length = 20;
    this.raycaster = new THREE.Raycaster();
    this.dist = 2;
    this.outdist = 2;
    this.hitforce = 2000;
    
    this.raypoint = new Vector3();
    
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('mousedown', this.onMouseDown.bind(this));
}

CueController.prototype.onMouseDown = function(e) {
    this.hitting = true;
}

CueController.prototype.onMouseMove = function(e) {
    var ent = this.entity;
    if (!ent || !ent.scene.entities.cam || !ent.scene.entities.table)
        return;
    var cam = this.entity.scene.entities.cam.get('camera').threeobj;
    var table = this.entity.scene.entities.table.get('mesh').threeobj;
    
    var x = e.clientX / window.innerWidth * 2 - 1;
    var y = e.clientY / window.innerHeight * -2 + 1;
    
    this.raycaster.setFromCamera(new THREE.Vector2(x, y), cam);
    
    var res = this.raycaster.intersectObject(table);
    if (res.length > 0) {
        this.raypoint.copy(res[0].point);
    }
}

CueController.prototype.onComponentAdded = function(ent, comp) {
    if (comp == this && this.entity.has('transform') || comp.id == 'transform') {
        this.entity.get('transform').setScale(new Vector3(this.radius, this.length, this.radius));
    }
}

CueController.prototype.update = function(dt) {
    var ent = this.entity;
    var cball = ent.scene.entities.cueball;
    if (cball) {
        var cpos = cball.get('transform').getPosition();
        this.raypoint.setComponent(2, cpos.getComponent(2));
        var dir = this.raypoint.clone().sub(cpos);
            dir.normalize();
            
        if (this.hitting) {
            this.dist -= 0.1
            if (this.dist < 0.1) {
                this.hitting = false;
                cball.get('physics').applyCentralForce(dir.clone().multiplyScalar(-this.hitforce));
            }
        }
        else {
            this.dist = this.outdist
        }
        
        var npos = cpos.clone().add(dir.clone().multiplyScalar(this.length/2 + this.outdist * THREE.Math.smoothstep(this.dist, 0, this.outdist)));
        var quat = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir);
    
        ent.get('transform').setRotation(quat);
        ent.get('transform').setPosition(npos);
    }
}

Components.register('cuecontroller', CueController);