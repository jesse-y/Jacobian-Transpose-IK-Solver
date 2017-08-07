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
	document.body.appendChild(renderer.domElement);

	//bind input controller
	camera_controls = new SceneCamera(camera, renderer.domElement);
	camera_controls.addEventListener('change', render);

	//create manipulator object
	manipulator = new THREE.TransformControls(camera, renderer.domElement);
	manipulator.space = 'local';
	manipulator.addEventListener('change', render);

	//transform controls sourced from THREE.js examples
	//https://threejs.org/examples/misc_controls_transform.html
	window.addEventListener( 'keydown', function ( event ) {
		switch ( event.keyCode ) {
			case 81: // Q
				manipulator.setSpace( manipulator.space === "local" ? "world" : "local" );
				break;
			case 17: // Ctrl
				manipulator.setTranslationSnap( 5 );
				manipulator.setRotationSnap( THREE.Math.degToRad( 15 ) );
				break;
			case 87: // W
				manipulator.setMode( "translate" );
				break;
			case 69: // E
				manipulator.setMode( "rotate" );
				break;
		}
	});
	window.addEventListener( 'keyup', function ( event ) {
		switch ( event.keyCode ) {

			case 17: // Ctrl
				manipulator.setTranslationSnap( null );
				manipulator.setRotationSnap( null );
				break;
		}
	});

	//create target position geometry
	var ee_geo = new THREE.CylinderGeometry(1, 1, 2),
		ee_mat = new THREE.MeshBasicMaterial({color:0xff0000, transparent:true,  opacity:0.5});

	//modify ee_target to align the cylinder along Z axis
	ee_geo.rotateX(Math.PI / 2);
	ee_geo.translate(0, 0, 1);

	//create end effector target and starting position/orientation
	ee_target = new THREE.Mesh(ee_geo, ee_mat);
	ee_target.position.set(8, 17, 0);
	ee_target.rotation.set(Math.PI/2, 0, Math.PI);
	manipulator.attach(ee_target);

	scene.add(manipulator);
	scene.add(ee_target);

	//create kinematic chain. the chain is an N * 4 array where N
	//is the number of joints, and each entry refers to the 4 DH
	//parameters in this order: d, a, alpha, theta.
	chain = new KinematicChain([
		[5, 0, -90, 0],
		[0, 2, 90, 125],
		[0, 15, 0, -35],
		[15, 2, 90, 0],
		[0, 0, -90, 90],
		[2, 0, -90, 0]
	]);

	//add the chain's objects to the scene for visualisation.
	chain.get_all_meshes().forEach(function(m) {
		scene.add(m);
	});

	//handle resizing
	window.addEventListener('resize', on_resize, false);

	//help text
}

function animate() {
	//calculate a vector from the end effector to the target.
	//the vector is a 1D vector with 6 values in two groups:
	//[position == p, orientation == o] => [p.x, p.y, p.z, o.x, o.y, o.z]
	var ee_pos = [...chain.j_transforms[chain.a.length-1].elements.slice(12,15)],
		t_pos = [...ee_target.matrix.elements.slice(12,15)],
		ee_eul = new THREE.Euler().setFromRotationMatrix(chain.j_transforms[chain.a.length-1]),
		t_eul = ee_target.rotation.clone(),
		dist_to_target = Math.abs(new THREE.Vector3(...t_pos).sub(new THREE.Vector3(...ee_pos)).length());

	var to_target_6dof = [
		t_pos[0] - ee_pos[0],
		t_pos[1] - ee_pos[1],
		t_pos[2] - ee_pos[2],
		rot_diff(t_eul.x, ee_eul.x),
		rot_diff(t_eul.y, ee_eul.y),
		rot_diff(t_eul.z, ee_eul.z)
	];

	var angles = chain.iterateIK(to_target_6dof);

	//apply angles
	for (var i = 0; i < chain.theta.length; i++) {
		chain.theta[i] += angles[i];
	}

	chain.forward();

	render();
	window.setTimeout(animate, 50);
}

function rot_diff(a1, a2) {
	var diff = a1 - a2;
	if (diff < -Math.PI) diff += 2*Math.PI;
	if (diff > Math.PI) diff -= 2*Math.PI;
	return THREE.Math.radToDeg(diff);
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