console.log('workspace.js loaded');

document.body.style.margin = '0px';

var camera, scene, renderer, 
	camera_controls, manipulator,
	chain, ee_target;

init();
animate();

function init() {
	//setup camera
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);

	//setup scene
	scene = new THREE.Scene();

	//grid helper for visualisation of the ground plane
	scene.add(new THREE.GridHelper(100, 20));

	//setup lights
	scene.add(new THREE.AmbientLight(0x606060));

	//build renderer
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setClearColor(0xf0f0f0);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.domElement.style.display = 'block';
	document.body.appendChild(renderer.domElement);

	//bind input controller
	camera_controls = new SceneCamera(camera, renderer.domElement);
	camera_controls.addEventListener('change', render);

	//create manipulator object
	manipulator = new THREE.TransformControls(camera, renderer.domElement);
	manipulator.addEventListener('change', render);

	//create end effector target
	ee_target = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 2),
							   new THREE.MeshBasicMaterial({color:0xff0000, transparent:true,  opacity:0.5}));
	ee_target.position.set(15, 10, 0);
	manipulator.attach(ee_target);

	scene.add(manipulator);
	scene.add(ee_target);

	//create kinematic chain
	chain = new KinematicChain([
		[5, 0, -90, 0],
		[0, 5, 90, 125],
		[0, 15, 0, -35],
		[15, 5, 90, 0],
		[0, 0, -90, 90],
		[5, 0, -90, 0]
	]);

	chain.get_all_meshes().forEach(function(m) {
		scene.add(m);
	});

	//handle resizing
	window.addEventListener('resize', on_resize, false);
}

function animate() {
	var angles,
		target = ee_target.position.clone(),
		ee_pos = new THREE.Vector3(...chain.j_transforms[chain.a.length-1].elements.slice(12,15)),
		dist_to_target = Math.abs(ee_pos.clone().sub(target).length());

	if (dist_to_target > 0.5) {
		angles = chain.iterateIK(target);

		var max_speed = 10,
			rotation_speed = Math.log(dist_to_target);

		rotation_speed = Math.max(rotation_speed, 1);

		console.log(`max speed = ${max_speed}, rotation_speed = ${rotation_speed}`);

		for (var i = 0; i < chain.theta.length; i++) {
			chain.theta[i] += (angles[i]*rotation_speed) * -1;
		}

		chain.forward();
	}


	render();
	window.setTimeout(animate, 50);
}

function render() {
	renderer.render(scene, camera);
}

function on_resize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);

	render();
}