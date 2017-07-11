console.log('kinematics.js loaded');

function kinematic_chain (geometry) {
	return;
}

function joint (link_length, link_twist, link_offset, joint_angle) {
	var a = new THREE.Matrix4();
	var alpha = new THREE.Matrix4();
	var d = new THREE.Matrix4();
	var theta = new THREE.Matrix4();

	var scene_object = new THREE.Object3D();
	scene_object.add(new THREE.AxisHelper(10));
	scene_object.matrixAutoUpdate = false;

	this.set_a = function(link_length) {
		a.set(
			1, 0, 0, link_length,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		);
		console.log('a', a);
	}

	this.set_alpha = function(link_twist) {
		var s = Math.sin(link_twist * Math.PI / 360);
		var c = Math.cos(link_twist * Math.PI / 360);
		alpha.set(
			1, 0, 0, 0,
			0, c, -s, 0,
			0, s, c, 0,
			0, 0, 0, 1
		);
		console.log('alpha', alpha);
	}

	this.set_d = function(link_offset) {
		d.set(
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, link_offset,
			0, 0, 0, 1
		);
		console.log('d', d);
	}

	this.set_theta = function(joint_angle) {
		var s = Math.sin(joint_angle * Math.PI / 360);
		var c = Math.cos(joint_angle * Math.PI / 360);
		theta.set(
			c, -s, 0, 0,
			s, c, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		);
		console.log('theta', theta);
	}

	this.apply_parameters = function() {
		var transform = new THREE.Matrix4();
		transform.multiply(a);
		transform.multiply(d);
		transform.multiply(alpha);
		transform.multiply(theta);

		scene_object.matrix = transform.clone();
	}

	this.get_object = function() {
		return scene_object;
	}

	this.init = function () {
		this.set_a(link_length);
		this.set_alpha(link_twist);
		this.set_d(link_offset);
		this.set_theta(joint_angle);

		this.apply_parameters();
	}

	this.init();
}