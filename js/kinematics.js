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

function joint (link_length, link_twist, link_offset, joint_angle) {
	var debug = false;

	var a = new THREE.Matrix4();
	var alpha = new THREE.Matrix4();
	var d = new THREE.Matrix4();
	var theta = new THREE.Matrix4();

	var parent_transform;
	this.transform = new THREE.Matrix4();

	var scene_object = new THREE.Object3D();
	scene_object.add(new THREE.AxisHelper(5));
	scene_object.matrixAutoUpdate = false;

	this.set_parent = function(transform) {
		parent_transform = transform;
	}

	this.set_a = function(link_length) {
		a.set(
			1, 0, 0, link_length,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		);
		if (debug) console.log('a', a, link_length);
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
		if (debug) console.log('alpha', alpha, link_twist);
	}

	this.set_d = function(link_offset) {
		d.set(
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, link_offset,
			0, 0, 0, 1
		);
		if (debug) console.log('d', d, link_offset);
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
		if (debug) console.log('theta', theta, joint_angle);
	}

	this.apply_parameters = function() {
		var base_transform = new THREE.Matrix4();
		console.log('apply transform with', link_length, link_twist, link_offset, joint_angle);

		base_transform.multiply(d);
		base_transform.multiply(a);
		base_transform.multiply(alpha);
		base_transform.multiply(theta);

		if (typeof parent_transform !== 'undefined') {
			this.transform = parent_transform.clone();
			this.transform.multiply(base_transform);
		} else {
			this.transform = base_transform.clone();
		}

		scene_object.matrix = this.transform.clone();
	}

	this.get_object = function() {
		return scene_object;
	}

	this.get_transform = function() {
		return this.transform;
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