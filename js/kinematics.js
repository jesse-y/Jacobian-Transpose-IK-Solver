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

	this.theta_matrix = function(theta) {
		var s = Math.sin(radians(theta));
		var c = Math.cos(radians(theta));

		var m = new THREE.Matrix4();
		m.set(
			c, -s, 0, 0,
			s, c, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		);
		return m;
	}

	this.d_matrix = function(d) {
		var m = new THREE.Matrix4();
		m.set(
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, d,
			0, 0, 0, 1
		);
		return m;
	}

	this.a_matrix = function(a) {
		var m = new THREE.Matrix4();
		m.set(
			1, 0, 0, a,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		);
		return m;
	}

	this.alpha_matrix = function(alpha) {
		var s = Math.sin(radians(alpha));
		var c = Math.cos(radians(alpha));

		var m = new THREE.Matrix4();
		m.set(
			1, 0, 0, 0,
			0, c, -s, 0,
			0, s, c, 0,
			0, 0, 0, 1
		);
		return m;
	}

	this.apply_params = function() {
		console.log('apply_params');
		var st = Math.sin(radians(this.theta));
		var ct = Math.cos(radians(this.theta));

		var sa = Math.sin(radians(this.alpha));
		var ca = Math.cos(radians(this.alpha));

		console.log('before', this.a, this.d, this.alpha, this.theta);

		this.transform.set(
			ct, -st*ca,  st*sa, this.a*ct,
			st,  ct*ca, -ct*sa, this.a*st,
			 0,     sa,     ca,    this.d,
			 0,      0,      0,         1
		);

		console.log('after', JSON.stringify(this.transform.elements));

		this.mesh.matrix = this.transform.clone();
	}

	this.init = function() {
		console.log(this);
	}

	this.init();

	function radians (angle) {
		return (angle * Math.PI / 360);
	}
}