console.log('viewport.js loaded');

var camera, scene, renderer, controls, selector;

//default variables
var width = 1600;
var height = 900;

var joint_index = 0;

init();
render();

function init() {
	var vport_div = document.createElement('div');
	vport_div.id = 'viewport';
	document.body.appendChild(vport_div);

	//setup camera
	camera = new THREE.PerspectiveCamera(45, window.innerWidth/height, 1, 1000);

	//setup scene
	scene = new THREE.Scene();

	//add grid
	var gridHelper = new THREE.GridHelper(100, 20);
	scene.add(gridHelper);

	//setup lights
	var ambientLight = new THREE.AmbientLight( 0x606060 );
	scene.add( ambientLight );

	var directionalLight = new THREE.DirectionalLight( 0xffffff );
	directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
	scene.add( directionalLight );

	//build renderer
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setClearColor( 0xf0f0f0 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, height );
	vport_div.appendChild( renderer.domElement );

	//bind input controller
	controls = new SceneCamera(camera, render);

	//create object selection class
	selector = new Selector(scene, camera, render);

	//handle resizing
	window.addEventListener( 'resize', onWindowResize, false );

	var j0 = new joint(0, 0, -90, 0);
	var j1 = new joint(0, 5, 90, 90);
	var j2 = new joint(0, 15, 0, 0);
	var j3 = new joint(20, 0, 90, 0);
	var j4 = new joint(0, 0, -90, -180);
	var j5 = new joint(5, 0, -90, 0);

	//j3.base_transform.makeRotationY(Math.PI/2);

	j0.set_parent(j1);
	j1.set_parent(j2);
	j2.set_parent(j3);
	j3.set_parent(j4);
	j4.set_parent(j5);

	var joints = [j0, j1, j2, j3, j4, j5];

	scene.add(j0.j_mesh);
	scene.add(j0.l_mesh);

	scene.add(j1.j_mesh);
	scene.add(j1.l_mesh);

	scene.add(j2.j_mesh);
	scene.add(j2.l_mesh);

	scene.add(j3.j_mesh);
	scene.add(j3.l_mesh);

	scene.add(j4.j_mesh);
	scene.add(j4.l_mesh);

	scene.add(j5.j_mesh);
	scene.add(j5.l_mesh);

	window.input.bind('Q', function() {
		joints[joint_index].a += 5;
		joints[joint_index].apply_params();
		render();
	});
	window.input.bind('A', function() {
		joints[joint_index].a -= 5;
		joints[joint_index].apply_params();
		render();
	});

	window.input.bind('W', function() {
		joints[joint_index].alpha += 5;
		joints[joint_index].apply_params();
		render();
	});

	window.input.bind('S', function() {
		joints[joint_index].alpha -= 5;
		joints[joint_index].apply_params();
		render();
	});

	window.input.bind('E', function() {
		joints[joint_index].d += 5;
		joints[joint_index].apply_params();
		render();
	});

	window.input.bind('D', function() {
		joints[joint_index].d -= 5;
		joints[joint_index].apply_params();
		render();
	});

	window.input.bind('R', function() {
		joints[joint_index].theta += 5;
		joints[joint_index].apply_params();
		render();
	});

	window.input.bind('F', function() {
		joints[joint_index].theta -= 5;
		joints[joint_index].apply_params();
		render();
	});

	window.input.bind('T', function() {
		joint_index += 1;
		joint_index = joint_index % joints.length;
	});

	window.input.bind('G', function() {
		joint_index -= 1;
		if (joint_index < 0) joint_index = 5;
	})

}

function render() {
	renderer.render(scene, camera);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / height;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, height );

	render();
}