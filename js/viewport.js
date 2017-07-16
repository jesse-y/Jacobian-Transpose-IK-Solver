console.log('viewport.js loaded');

var camera, scene, renderer, controls;

//default variables
var width = 1600;
var height = 900;

var a = 0, d = 0, alpha = 0, theta = 0;

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

	//handle resizing
	window.addEventListener( 'resize', onWindowResize, false );

	var j0 = new joint(0, 0, 0, 0);
	var j1 = new joint(0, 0, 0, 0);

	scene.add(j0.mesh);
	scene.add(j1.mesh);


	window.input.bind('Q', function() {
		j1.a += 5;
		j1.apply_params();
		render();
	});
	window.input.bind('A', function() {
		j1.a -= 5;
		j1.apply_params();
		render();
	});

	window.input.bind('W', function() {
		j1.alpha += 5;
		j1.apply_params();
		render();
	});

	window.input.bind('S', function() {
		j1.alpha -= 5;
		j1.apply_params();
		render();
	});

	window.input.bind('E', function() {
		j1.d += 5;
		j1.apply_params();
		render();
	});

	window.input.bind('D', function() {
		j1.d -= 5;
		j1.apply_params();
		render();
	});

	window.input.bind('R', function() {
		j1.theta += 5;
		j1.apply_params();
		render();
	});

	window.input.bind('F', function() {
		j1.theta -= 5;
		j1.apply_params();
		render();
	});
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