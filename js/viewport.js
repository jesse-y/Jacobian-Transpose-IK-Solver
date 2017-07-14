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

	var j = new joint(0, -180, 0, 0);
	scene.add(j.get_object());

	var b1 = new THREE.Object3D();
	b1.matrixAutoUpdate = false;
	b1.add(new THREE.AxisHelper(10));
	b1.matrix = j.transform.clone();

	var dm = new THREE.Matrix4();
	dm.set(
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 10,
			0, 0, 0, 1
	);

	b1.matrix.multiply(dm);

	scene.add(b1);


	window.input.bind('Q', function() {
		a += 5;
		j.set_a(a);
		j.apply_parameters();
		render();
	});
	window.input.bind('A', function() {
		a -= 5;
		j.set_a(a);
		j.apply_parameters();
		render();
	});

	window.input.bind('W', function() {
		alpha += 5;
		j.set_alpha(alpha);
		j.apply_parameters();
		render();
	});

	window.input.bind('S', function() {
		alpha -= 5;
		j.set_alpha(alpha);
		j.apply_parameters();
		render();
	});

	window.input.bind('E', function() {
		d += 5;
		j.set_d(d);
		j.apply_parameters();
		render();
	});

	window.input.bind('D', function() {
		d -= 5;
		j.set_d(d);
		j.apply_parameters();
		render();
	});

	window.input.bind('R', function() {
		theta += 5;
		j.set_theta(theta);
		j.apply_parameters();
		render();
	});

	window.input.bind('F', function() {
		theta -= 5;
		j.set_theta(theta);
		j.apply_parameters();
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