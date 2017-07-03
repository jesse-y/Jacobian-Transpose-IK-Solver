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
	camera.position.set(50, 80, 130);
	camera.lookAt(new THREE.Vector3());

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
	controls = new Controller(camera);
	document.addEventListener('mousemove', controls.update);

	//handle resizing
	window.addEventListener( 'resize', onWindowResize, false );

	var loc = new THREE.Object3D();
	loc.add(new THREE.AxisHelper(10));
	scene.add(loc);
}

function Controller(camera) {
	var x, y, z;
	var theta, phi, r;

	r = camera.position.distanceTo(new THREE.Vector3());
	theta = Math.acos(camera.position.z/r);
	phi = Math.atan(camera.position.y/camera.position.x);

	this.update = function(e) {
		if (window.input.lclick()) {
			var click_pos = window.input.lclick_pos();
			var curr_pos = window.input.m_pos();

			var xdiff = -(curr_pos[0] - click_pos[0])*0.1;
			var ydiff = (curr_pos[1] - click_pos[1])*0.1;

			console.log(xdiff, ydiff);

			if (xdiff == 0 && ydiff == 0) return;

			theta += xdiff;
			phi += ydiff;

			phi = Math.min( 180, Math.max( 0, phi ) );

			camera.position.x = r * Math.sin( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
			camera.position.y = r * Math.sin( phi * Math.PI / 360 );
			camera.position.z = r * Math.cos( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
			camera.updateMatrix();

			//camera.position.set( x, y, z );
			camera.lookAt(new THREE.Vector3());
			//camera.updateProjectionMatrix();

			render();
		} else {
			return
		}
	}
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