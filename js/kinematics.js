console.log('kinematics.js loaded');

function joint(d, a, alpha, theta) {
	this.theta = theta;
	this.d = d;
	this.a = a;
	this.alpha = alpha;

	var j_col = rand_col();

	this.j_mesh = make_j_mesh(this);
	this.l_mesh = make_l_mesh(this);

	this.transform = new THREE.Matrix4();

	this.parent;
	this.child;

	function make_j_mesh(scope) {
		var j_geo = new THREE.CylinderGeometry(1, 1, 1);
		var j_mat = new THREE.MeshBasicMaterial( {color: 0xffe100} );

		j_geo.rotateX(Math.PI / 2);
		j_geo.translate(0, 0, 0.5);
		j_geo.scale(1, 1, Math.max(0.5, scope.d));
		j_geo.translate(0, 0, -scope.d);

		var mesh = new THREE.Mesh(j_geo, j_mat);
		mesh.add(new THREE.AxisHelper(5));
		mesh.matrixAutoUpdate = false;
		mesh.joint_parent = this;

		return mesh;
	}

	function make_l_mesh(scope) {
		var l_geo = new THREE.CylinderGeometry(1, 1, 1);
		var l_mat = new THREE.MeshBasicMaterial( {color: 0x569e0e} );

		l_geo.rotateZ(Math.PI / 2);
		l_geo.translate(0.5, 0, 0);

		if (scope.child) {
			l_geo.scale(Math.max(scope.child.a, 0.5), 1, 1);
			//l_geo.translate(-scope.child.a, 0, 0);
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

	this.init = function() {
		console.log(this);
		this.apply_params();
	}

	this.init();

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