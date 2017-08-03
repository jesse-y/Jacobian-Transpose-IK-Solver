console.log('kinematics.js loaded');

function KinematicChain(joints) {
	var self = this;

	this.a = [];
	this.d = [];
	this.alpha = [];
	this.theta = [];

	this.base_transform = new THREE.Matrix4();
	this.j_transforms;

	this.j_mesh = [];
	this.l_mesh = [];

	var l_colours = [0xff2121, 0xff96b21, 0xf7ff21, 0x4dff21, 0x2181ff, 0xb121ff],
		j_colour = 0xb2b2b2;

	this.forward = function() {
		this.j_transforms = [];
		console.log('=================== FORWARD START ===================');
		var transform = this.base_transform.clone();
		for (var i = 0; i < joints.length; i++) {
			console.log(`joint ${i}: [d=${this.d[i]}, a=${this.a[i]}, alpha=${this.alpha[i]}, theta=${this.theta[i]}]`);
			this.j_transforms[i] = transform.multiply(this.get_dh_matrix(i)).clone();
			this.j_mesh[i].matrix = this.j_transforms[i].clone();
			this.l_mesh[i].matrix = this.j_transforms[i].clone();
		}
		console.log('=================== FORWARD FINISH ==================');
	}

	this.iterateIK = function(target) {
		var joint_centre, tip, to_tip, to_target, movement_vector, gradient;
		var angles = [];
		for (var i = 0; i < this.theta.length; i++) {
			joint_centre = new THREE.Vector3(...this.j_transforms[i].elements.slice(12, 15));
			tip = new THREE.Vector3(...this.j_transforms[this.theta.length-1].elements.slice(12, 15));

			to_tip = tip.clone().sub(joint_centre);
			to_target = target.clone().sub(tip);

			movement_vector = to_tip.clone().cross(new THREE.Vector3(...this.j_transforms[i].elements.slice(8, 11))).normalize();
			gradient = movement_vector.clone().dot(to_target.clone().normalize());

			console.log(`joint ${i}: gradient=${gradient}`);

			angles.push(gradient);
		}

		return angles;
	}

	this.get_dh_matrix = function(index) {
		var am = a_matrix(this.a[index]),
			dm = d_matrix(this.d[index]),
			alm = alpha_matrix(this.alpha[index]),
			thm = theta_matrix(this.theta[index]),
			result = new THREE.Matrix4();

		result.multiply(alm);
		result.multiply(am);

		result.multiply(thm);
		result.multiply(dm);

		return result;
	}

	this.get_all_meshes = function() {
		return this.l_mesh.concat(this.j_mesh);
	}

	init();

	function init() {
		//populate dh parameter arrays. joints start from the base to the tip.
		for (var i = 0; i < joints.length; i++) {
			self.d.push(joints[i][0]);
			self.a.push(joints[i][1]);
			self.alpha.push(joints[i][2]);
			self.theta.push(joints[i][3]);
		}

		//populate mesh arrays
		for (var i = 0; i < joints.length; i++) {
			self.j_mesh[i] = make_j_mesh(i);
			self.l_mesh[i] = make_l_mesh(i);
		}

		//populate the transforms array for this joint angle config
		self.forward();
	}

	function make_j_mesh(index) {
		var j_geo = new THREE.CylinderGeometry(1, 1, 1);
		var j_mat = new THREE.MeshBasicMaterial( {color: j_colour, transparent:true, opacity:0.8} );

		j_geo.rotateX(Math.PI / 2);
		if (self.d[index] != 0) {
			j_geo.translate(0, 0, 0.5);
			j_geo.scale(1, 1, self.d[index]);
			j_geo.translate(0, 0, -self.d[index]);
		}

		var mesh = new THREE.Mesh(j_geo, j_mat);
		mesh.matrixAutoUpdate = false;

		return mesh;
	}

	function make_l_mesh(index) {
		var l_geo = new THREE.CylinderGeometry(1, 1, 1);
		var l_mat = new THREE.MeshBasicMaterial( {color: l_colours[index], transparent:true, opacity:0.8} );

		l_geo.rotateZ(Math.PI / 2);

		if (index+1 < self.theta.length && self.a[index+1] != 0) {
			l_geo.translate(0.5, 0, 0);
			l_geo.scale(self.a[index+1], 1, 1);
		}

		var mesh = new THREE.Mesh(l_geo, l_mat);
		mesh.matrixAutoUpdate = false;

		return mesh;
	}

	function d_matrix (val) {
		var m = new THREE.Matrix4();
		m.set(
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, val,
			0, 0, 0, 1
		);
		return m;
	}

	function a_matrix (val) {
		var m = new THREE.Matrix4();
		m.set(
			1, 0, 0, val,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		);
		return m;
	}

	function alpha_matrix(val) {
		var s = Math.sin(radians(val));
		var c = Math.cos(radians(val));

		var m = new THREE.Matrix4();
		m.set(
			1, 0, 0, 0,
			0, c, -s, 0,
			0, s, c, 0,
			0, 0, 0, 1
		);
		return m;
	}

	function theta_matrix(val) {
		var s = Math.sin(radians(val));
		var c = Math.cos(radians(val));

		var m = new THREE.Matrix4();
		m.set(
			c, -s, 0, 0,
			s, c, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		);
		return m;
	}

	function radians (angle) {
		return (angle * Math.PI * 2 / 360);
	}
}