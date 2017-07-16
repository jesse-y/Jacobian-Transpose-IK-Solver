console.log('kinematics.js loaded');

function kinematic_chain (joints) {

	var end_effector = new THREE.Object3D();
	//end_effector.add(new THREE.AxisHelper(10));
	end_effector.matrixAutoUpdate = false;

	this.get_object = function() {
		return end_effector;
	}

	this.apply_transforms = function(parameters) {
		if (parameters.length != joints.length) {
			console.log('each joint requires a parameter!');
			return;
		}

		for (var i = 0; i < joints.length; i++) {
			//apply the ith parameter for the ith joint
			joints[i].set_theta(parameters[i]);

			if (i > 0) {
				joints[i].set_parent(joints[i-1].transform);
			}

			joints[i].apply_parameters();
		}

		end_effector.matrix = joints[joints.length-1].transform.clone();
	}

	this.init = function() {
		var parameters = [];
		joints.forEach(function(j) {
			parameters.push(0);
		})
		this.apply_transforms(parameters);
	}

	this.init();
}


function joint(theta, d, a, alpha) {
	this.mesh = new THREE.Object3D();
	this.mesh.add(new THREE.AxisHelper(5));
	this.mesh.matrixAutoUpdate = false;
	
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
		console.log('apply_params');
		//var st = Math.sin(radians(this.theta));
		//var ct = Math.cos(radians(this.theta));

		//var sa = Math.sin(radians(this.alpha));
		//var ca = Math.cos(radians(this.alpha));

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

		this.mesh.matrix = this.transform.clone();

		if (this.child) {
			this.child.apply_params();
		}
	}

	this.set_parent = function(child) {
		this.child = child;
		child.parent = this;
	}

	this.init = function() {
		console.log(this);
	}

	this.init();

	function radians (angle) {
		return (angle * Math.PI * 2 / 360);
	}
}