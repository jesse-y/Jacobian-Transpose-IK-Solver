console.log('viewport.js loaded');

var camera, scene, renderer, controls;

init();
render();

function init() {
	var vport_div = document.createElement('div');
	vport_div.id = 'viewport';
	document.body.appendChild(vport_div);

	//setup camera
	camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 1000);

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
	renderer.setSize( window.innerWidth, window.innerHeight );
	vport_div.appendChild( renderer.domElement );

	//bind input controller
	controls = new SceneCamera(camera, render);

	//handle resizing
	window.addEventListener( 'resize', onWindowResize, false );

	var loc = new THREE.Object3D();
	loc.position.set(0,0,0);
	loc.add(new THREE.AxisHelper(10));
	scene.add(loc);
}


function render() {
	renderer.render(scene, camera);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

	render();
}