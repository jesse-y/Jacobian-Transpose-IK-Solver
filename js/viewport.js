console.log('viewport.js loaded');

document.body.style.margin = '0px';

var camera, scene, renderer, controls, manipulator, joints, ee_target;

//default variables
var width = 1600;
var height = 900;

var joint_index = 0;

init();
animate();
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
	renderer.domElement.style.display = 'block';
	vport_div.appendChild( renderer.domElement );

	//bind input controller
	controls = new SceneCamera(camera, render);

	//transform
	manipulator = new THREE.TransformControls(camera, renderer.domElement);
	manipulator.addEventListener('change', render);

	//endeffector target
	var ee_geo = new THREE.CylinderGeometry(1, 1, 2),
		ee_mat = new THREE.MeshBasicMaterial( {color: 0xff0000, transparent:true, opacity:0.5});
	ee_target = new THREE.Mesh(ee_geo, ee_mat);
	ee_target.position.set(15, 10, 0);

	manipulator.attach(ee_target);

	scene.add(manipulator);
	scene.add(ee_target);

	//handle resizing
	window.addEventListener( 'resize', onWindowResize, false );

	/*var j0 = new joint(10, 10, 0, 0);
	var j1 = new joint(0, 0, 0, 0);
	var j2 = new joint(0, 0, 0, 0);
	var j3 = new joint(0, 0, 0, 0);
	var j4 = new joint(0, 0, 0, 0);
	var j5 = new joint(0, 0, 0, 0);*/


	var j0 = new joint(5, 0, -90, 0);
	var j1 = new joint(0, 5, 90, 125);
	var j2 = new joint(0, 15, 0, -35);
	var j3 = new joint(15, 5, 90, 0);
	var j4 = new joint(0, 0, -90, 90);
	var j5 = new joint(5, 0, -90, 0);

	var colours = [0xff2121, 0xff96b21, 0xf7ff21, 0x4dff21, 0x2181ff, 0xb121ff];
	var tmp = [j0, j1, j2, j3, j4, j5];
	var joint_objects = [];
	
	joints = tmp.map(function(item, index) {
		item.l_col = colours[index];
		item.make_meshes();
		return item;
	});

	j0.set_parent(j1);
	j1.set_parent(j2);
	j2.set_parent(j3);
	j3.set_parent(j4);
	j4.set_parent(j5);

	joints.forEach(function(j) {
		joint_objects.push(j.l_mesh);
		joint_objects.push(j.j_mesh);
	})

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

/*
	var pos = j2.get_world_transform().elements.slice(12, 15);
	var result = new THREE.AxisHelper(10);
	result.position.copy(new THREE.Vector3(...pos));
	scene.add(result);*/

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


function animate() {
	var angles = [],
		target = ee_target.position.clone(),
		ee_pos = new THREE.Vector3(...joints[5].transform.elements.slice(12, 15)),
		dist_to_target = Math.abs(ee_pos.clone().sub(target).length());
	//joints[2].iterateIK(target, scene, render, joints[5]);
	//return;



	if (dist_to_target > 0.5) {
		joints.forEach(function(j) {
			angles.push(j.iterateIK(target, scene, render, joints[5]));
		});

		var max_speed = 10,
			//rotation_speed = (dist_to_target / 30) * max_speed,
			rotation_speed = Math.log(dist_to_target);

		rotation_speed = Math.max(rotation_speed, 3);

		console.log(`max speed = ${max_speed}, rotation_speed = ${rotation_speed}`);

		joints.forEach(function(j, i) {
			j.theta += (angles[i]*rotation_speed) * -1;
		});

		joints[0].apply_params();
	}

	render();
	window.setTimeout(animate, 50);
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