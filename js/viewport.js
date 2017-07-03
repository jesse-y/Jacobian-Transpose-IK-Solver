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
	camera.position.x = 150 * Math.sin( 60 * Math.PI / 360 ) * Math.cos( 45 * Math.PI / 360 );
	camera.position.y = 150 * Math.sin( 45 * Math.PI / 360 );
	camera.position.z = 150 * Math.cos( 60 * Math.PI / 360 ) * Math.cos( 45 * Math.PI / 360 );
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
	loc.position.set(0,10,0);
	loc.add(new THREE.AxisHelper(10));
	scene.add(loc);
}

function Controller(camera) {
	var x, y, z;
	var theta, phi, r;

	r = 150;
	theta = 60;
	phi = 45;

	var isMouseDown, onMouseDownTheta, onMouseDownPhi, onMouseDownPosition;
	onMouseDownPosition = { x:0, y: 0 };
	onMouseDownTheta = theta;
	onMouseDownPhi = phi;

	function onDocumentMouseDown( event ) {

		event.preventDefault();

		isMouseDown = true;

		onMouseDownTheta = theta;
		onMouseDownPhi = phi;
		onMouseDownPosition.x = event.clientX;
		onMouseDownPosition.y = event.clientY;

	}

	function onDocumentMouseMove( event ) {

		event.preventDefault();

		if ( isMouseDown ) {

			theta = - ( ( event.clientX - onMouseDownPosition.x ) * 0.5 ) + onMouseDownTheta;
			phi = ( ( event.clientY - onMouseDownPosition.y ) * 0.5 ) + onMouseDownPhi;

			if (theta < -Math.PI * 360) theta += 2*Math.PI * 360;
			if (theta > Math.PI * 360) theta -= 2*Math.PI * 360;
			if (phi > 180) phi = 180;
			if (phi < -180) phi = -180;

			//phi = Math.min( 180, Math.max( 0, phi ) );

			camera.position.x = r * Math.sin( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
			camera.position.y = r * Math.sin( phi * Math.PI / 360 );
			camera.position.z = r * Math.cos( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
			camera.updateMatrix();

			console.log(theta, phi, camera.position);

			camera.lookAt(new THREE.Vector3());
		}

		render();
	}

	function onDocumentMouseUp( event ) {

		event.preventDefault();

		isMouseDown = false;

		onMouseDownPosition.x = event.clientX - onMouseDownPosition.x;
		onMouseDownPosition.y = event.clientY - onMouseDownPosition.y;
	}

	this.init = function() {
		document.addEventListener( 'mousemove', onDocumentMouseMove, false );
		document.addEventListener( 'mousedown', onDocumentMouseDown, false );
		document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	}

	this.init();
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