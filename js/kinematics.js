console.log('kinematics.js loaded');

function joint(d, a, alpha, theta) {
	var j_geo = new THREE.CylinderGeometry(2, 2, 4, 12);
	var j_mat = new THREE.MeshBasicMaterial( {color: 0xffe100} );

	j_geo.rotateX(Math.PI / 2);

	this.j_mesh = new THREE.Mesh(j_geo, j_mat);
	this.j_mesh.add(new THREE.AxisHelper(5));
	this.j_mesh.matrixAutoUpdate = false;
	this.j_mesh.joint_parent = this;

	var l_geo;
	var l_mat = new THREE.MeshBasicMaterial( {color: 0x569e0e} );

	this.l_mesh = new THREE.Object3D();
	
	this.theta = theta;
	this.d = d;
	this.a = a;
	this.alpha = alpha;

	this.transform = new THREE.Matrix4();

	this.parent;
	this.child;

	this.d_matrix = function() {
		var m = new THREE.Matrix4();
		m.set(
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, this.d,
			0, 0, 0, 1
		);
		return m;
	}

	this.a_matrix = function() {
		var m = new THREE.Matrix4();
		m.set(
			1, 0, 0, this.a,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		);
		return m;
	}

	this.alpha_matrix = function() {
		var s = Math.sin(radians(this.alpha));
		var c = Math.cos(radians(this.alpha));

		var m = new THREE.Matrix4();
		m.set(
			1, 0, 0, 0,
			0, c, -s, 0,
			0, s, c, 0,
			0, 0, 0, 1
		);
		return m;
	}

	this.theta_matrix = function() {
		var s = Math.sin(radians(this.theta));
		var c = Math.cos(radians(this.theta));

		var m = new THREE.Matrix4();
		m.set(
			c, -s, 0, 0,
			s, c, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		);
		return m;
	}

	this.apply_params = function() {
		console.log(`apply_params: [ d=${this.d}, a=${this.a}, alpha=${this.alpha}, theta=${this.theta} ]`);

		var am = this.a_matrix();
		var dm = this.d_matrix();
		var alm = this.alpha_matrix();
		var thm = this.theta_matrix();

		if (this.parent) {
			this.transform = this.parent.transform.clone();
		} else {
			this.transform = new THREE.Matrix4();
		}

		this.transform.multiply(dm);
		this.transform.multiply(am);
		this.transform.multiply(alm);
		this.transform.multiply(thm);

		this.j_mesh.matrix = this.transform.clone();
		this.l_mesh.matrix = this.transform.clone();

		if (this.child) {
			this.child.apply_params();
		}
	}

	this.set_parent = function(child) {
		this.child = child;
		child.parent = this;

		var x_depth = Math.max(2, child.a);
		var z_depth = Math.max(2, child.d);

		l_geo = new THREE.BoxGeometry(x_depth, 2, z_depth);
		l_geo.translate(child.a/2, 0, child.d/2);

		this.l_mesh = new THREE.Mesh(l_geo, l_mat);
		this.l_mesh.matrixAutoUpdate = false;
		this.l_mesh.joint_parent = this;

		//apply transforms for all objects in the chain
		this.apply_params();
	}

	this.init = function() {
		console.log(this);
		this.apply_params();
	}

	this.init();

	function radians (angle) {
		return (angle * Math.PI * 2 / 360);
	}
}