console.log('kinematics.js loaded');

function joint(d, a, alpha, theta) {
	this.theta = theta;
	this.d = d;
	this.a = a;
	this.alpha = alpha;

	var j_col = 0xb2b2b2
	this.l_col = 0xffe100;

	this.j_mesh = make_j_mesh(this);
	this.l_mesh = make_l_mesh(this);

	this.transform = new THREE.Matrix4();

	this.parent;
	this.child;

	function make_j_mesh(scope) {
		var j_geo = new THREE.CylinderGeometry(1, 1, 1);
		var j_mat = new THREE.MeshBasicMaterial( {color: j_col, transparent:true, opacity:0.8} );

		j_geo.rotateX(Math.PI / 2);
		j_geo.translate(0, 0, 0.5);
		j_geo.scale(1, 1, scope.d);
		j_geo.translate(0, 0, -scope.d);

		var mesh = new THREE.Mesh(j_geo, j_mat);
		//mesh.add(new THREE.AxisHelper(5));
		mesh.matrixAutoUpdate = false;
		mesh.joint_parent = this;

		return mesh;
	}

	function make_l_mesh(scope) {
		var l_geo = new THREE.CylinderGeometry(1, 1, 1);
		var l_mat = new THREE.MeshBasicMaterial( {color: scope.l_col, transparent:true, opacity:0.8} );

		l_geo.rotateZ(Math.PI / 2);
		l_geo.translate(0.5, 0, 0);

		if (scope.child) {
			l_geo.scale(scope.child.a, 1, 1);
		} else {
			l_geo.scale(0, 1, 1);
		}

		var mesh = new THREE.Mesh(l_geo, l_mat);
		mesh.matrixAutoUpdate = false;
		mesh.joint_parent = this;


		return mesh;
	}

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

		this.transform = new THREE.Matrix4();

		if (this.parent) {
			this.transform.multiply(this.parent.transform.clone());
		}

		this.transform.multiply(alm);
		this.transform.multiply(am);

		this.transform.multiply(thm);
		this.transform.multiply(dm);

		this.j_mesh.matrix = this.transform.clone();
		this.l_mesh.matrix = this.transform.clone();


		if (this.child) {
			this.child.apply_params();
		} else {
			console.log('==========| END JOINTS | ==========');
		}
	}

	this.set_parent = function(child) {
		this.child = child;
		child.parent = this;

		this.l_mesh = make_l_mesh(this);

		//apply transforms for all objects in the chain
		this.apply_params();
	}

	this.make_meshes = function() {
		this.l_mesh = make_l_mesh(this);
	}

	this.init = function() {
		this.apply_params();
	}

	this.init();

	this.get_ee_position = function() {
		this.apply_params();
		if (this.hasOwnProperty('child')) {
			var c = this.child;
			while (c.child) {
				c = c.child;
			}
			return c.transform;
		} else {
			return this.transform;
		}
	}

	this.iterateIK = function(target, scene, render, last) {
		var joint_centre = new THREE.Vector3(...this.transform.elements.slice(12, 15));
		var tip = new THREE.Vector3(...last.transform.elements.slice(12, 15));

		var to_tip = tip.clone().sub(joint_centre);
		var to_target = target.clone().sub(tip);

		var movement_vector = to_tip.clone().cross(new THREE.Vector3(...this.transform.elements.slice(8, 11))).normalize();
		var gradient = movement_vector.clone().dot(to_target.clone().normalize());

		var colour = 0xff00ff;

		/*
		var jc = new THREE.ArrowHelper(joint_centre.clone().normalize(), new THREE.Vector3(0, 0, 0), joint_centre.length(), colour);
		var t = new THREE.ArrowHelper(tip.clone().normalize(), new THREE.Vector3(0,0,0), tip.length(), colour);
		var tt = new THREE.ArrowHelper(to_tip.clone().normalize(), joint_centre, to_tip.length(), colour);
		var tta = new THREE.ArrowHelper(to_target.clone().normalize(), tip, to_target.length(), colour);
		var a = new THREE.ArrowHelper(new THREE.Vector3(...this.transform.elements.slice(8,11)).normalize(), new THREE.Vector3(0,0,0), 20, 0xffff00);
		var mv = new THREE.ArrowHelper(movement_vector.clone().normalize(), tip, movement_vector.length(), 0x0000ff);
		console.log('gradient=', gradient);
		console.log('relative magnitude=', gradient/movement_vector.length());

		scene.add(jc);
		scene.add(t);
		scene.add(tt);
		scene.add(tta);
		scene.add(a);
		scene.add(mv);
		render();*/

		return gradient;
	}

	function radians (angle) {
		return (angle * Math.PI * 2 / 360);
	}

	function rand_col () {
		return parseInt(
			(Math.random() * 0xFF << 0).toString(16) + 
			(Math.random() * 0xFF << 0).toString(16) + 
			(Math.random() * 0xFF << 0).toString(16)
		, 16);
	}
}