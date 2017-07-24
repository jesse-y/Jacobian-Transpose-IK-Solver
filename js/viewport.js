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
	var j1 = new joint(4, 4, 90, 90);
	var j2 = new joint(0, 10, 0, -90);
	var j3 = new joint(0, 10, 0, 0);

	j0.set_parent(j1);
	j1.set_parent(j2);
	j2.set_parent(j3);

	var joints = [j0, j1, j2, j3];

	scene.add(j0.j_mesh);
	scene.add(j0.l_mesh);

	scene.add(j1.j_mesh);
	scene.add(j1.l_mesh);

	scene.add(j2.j_mesh);
	scene.add(j2.l_mesh);

	scene.add(j3.j_mesh);
	scene.add(j3.l_mesh);
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