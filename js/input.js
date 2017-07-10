function SceneCamera(camera, render_func) {
	//button code for mouse clicks. 
	//IE8 returns 1, 4, 2 for left, middle and right buttons respectively.
	var l_btn = 0;
	var m_btn = 1;
	var r_btn = 2;
	const default_btn_state = [false, 0, 0, 0, 0];

	//the camera controller consists of a sphere defined around a target.
	//the camera sits along the surface of the sphere, looking at the target.
	//theta is the azimuth (horizontal angle) of the camera.
	//phi is the altitude (vertical angle) of the camera. phi is capped between
	//-pi/2 and pi/2.
	//radius r defines how physically close the camera is to the target.

	var theta, phi, r;
	var target = new THREE.Object3D();
	var prev_target = target.clone();
	var mouse = {};

	r = 150;
	theta = 70;
	phi = 70;

	mouse[l_btn] = default_btn_state;
	mouse[m_btn] = default_btn_state;
	mouse[r_btn] = default_btn_state;

	function mouse_down(event) {
		event.preventDefault();
		set_mouse(event, true);

		prev_target = target.clone();
	}

	function mouse_up(event) {
		event.preventDefault();
		set_mouse(event, false);
	}

	function set_mouse(event, status) {
		var btn = event.button;
		mouse[btn] = [status, event.clientX, event.clientY, theta, phi];
	}

	function mouse_move(event) {
		event.preventDefault();
		var btn = event.button;

		//if (!window.input.is_down('ALT')) return;

		if (mouse[btn][0]) {
			if (btn == l_btn) {
				orbit_camera(mouse[btn], event);
			} else if (btn == m_btn) {
				pan_camera(mouse[btn], event);
			} else if (btn == r_btn) {
				dolly_camera(mouse[btn], event);
			}
		}
	}

	//move the target forward in space along the Z axis. note there is subtle
	//difference between moving the target of the camera, and simply moving the camera
	//closer to the target. dolly_camera moves the target, keeping the camera at r distance
	//away from the target.
	function dolly_camera(btn_state, event) {
		var click_x = btn_state[1];
		var click_y = btn_state[2];

		var offset_x = -((event.clientX - click_x));
		var offset_y = ((event.clientY - click_y));

		var distance = Math.sqrt(offset_x**2 + offset_y**2) * 0.5;

		if (offset_x < 0) distance *= -1;

		target.position.copy(prev_target.position);

		target.translateZ(distance);

		set_camera_pos();
		render_func();
	}

	//move the camera along the X and Y axes of the target. note the target is looking
	//at the camera, so its X and Y axes form a plane that is parallel to the camera's
	//XY plane.
	function pan_camera(btn_state, event) {
		var click_x = btn_state[1];
		var click_y = btn_state[2];

		var offset_x = -((event.clientX - click_x) * 0.2);
		var offset_y = ((event.clientY - click_y) * 0.2);

		target.position.copy(prev_target.position);

		target.translateX(offset_x);
		target.translateY(offset_y);

		set_camera_pos();
		render_func();
	}

	//orbit the camera around the target.
	function orbit_camera(btn_state, event) {
		var click_x = btn_state[1];
		var click_y = btn_state[2];
		var click_theta = btn_state[3];
		var click_phi = btn_state[4];

		theta = - ((event.clientX - click_x) * 0.5) + click_theta;
		phi = ((event.clientY - click_y) * 0.5) + click_phi;

		//clamp values of theta prevent the camera jumping between extremes.
		//clamp phi so that the camera cannot become inverted along its WORLD UP
		//axis during extreme orbiting.
		if (theta < -Math.PI * 360) theta += 2*Math.PI * 360;
		if (theta > Math.PI * 360) theta -= 2*Math.PI * 360;
		if (phi > 180) phi = 180;
		if (phi < -180) phi = -180;

		set_camera_pos();
		render_func();
	}

	//zoom the camera by reducing the radius of the sphere upon which the camera sits.
	//note that the target does not move during zooming, compared to dollying.
	function zoom_camera(event) {
		if (event.deltaY) {
			if (event.deltaY > 0) {
				r += 10;
			} else {
				r -= 10;
			}

			if (r < 0) r = 0;
			set_camera_pos();
			render_func();
		}
	}

	//based on a target position, describe a sphere around the point, and then place the camera
	//on a point along its surface based on the camera's azimuth and altitude.
	//preserve the parallel property of the XY plane of the target and camera by having them
	//look at each other.
	function set_camera_pos() {
		camera.position.x = (r * Math.sin( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 )) + target.position.x;
		camera.position.y = (r * Math.sin( phi * Math.PI / 360 )) + target.position.y;
		camera.position.z = (r * Math.cos( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 )) + target.position.z;
		camera.updateMatrix();

		camera.lookAt(target.position);
		target.lookAt(camera.position);
	}

	//set the view to default values
	function reset_view() {
		target = new THREE.Object3D();
		prev_target = target.clone();

		r = 150;
		theta = 70;
		phi = 70;

		mouse[l_btn] = default_btn_state;
		mouse[m_btn] = default_btn_state;
		mouse[r_btn] = default_btn_state;

		set_camera_pos();
		render_func();
	}

	this.init = function() {
		var viewport_elem = document.getElementById('viewport').childNodes[0];
		viewport_elem.addEventListener('mousemove', mouse_move, false );
		viewport_elem.addEventListener('mousedown', mouse_down, false );
		viewport_elem.addEventListener('mouseup', mouse_up, false );
		viewport_elem.addEventListener('wheel', zoom_camera, false);

		viewport_elem.addEventListener('contextmenu', function(event) {
			event.preventDefault();
			return false;
		}, false);

		window.input.bind('F', reset_view);

		set_camera_pos();
		render_func();
	}

	this.init();
}

(function () {
	var keys = {};
	var bound_func = {};

	function setKey(event, status) {
		var code = event.keyCode;
		var key;

		if ((code >= 65 && code <= 90) || (code >= 48 && code <= 57)) {
			//keys from 0-9 and a-z
			key = String.fromCharCode(code);
		} else {
			switch(code) {
				case 16:
					key = 'SHIFT'; break;
				case 17:
					key = 'CTRL'; break;
				case 18:
					key = 'ALT'; break;
				case 27:
					key = 'ESCAPE'; break;
				case 32:
					key = 'SPACE'; break;
				case 37:
					key = 'LEFT'; break;
				case 38:
					key = 'UP'; break;
				case 39:
					key = 'RIGHT'; break;
				case 40:
					key = 'DOWN'; break;
				default:
					key = code; break;
			}
		}

		//console.log('changed('+code+') '+key+' to '+status);
		keys[key] = status;

		if (bound_func.hasOwnProperty(key) && status) {
			//console.log('fired function for key '+key);
			event.preventDefault();
			bound_func[key]();
		}
	}

	document.addEventListener('keydown', function(e) {
		setKey(e, true);
	})
	document.addEventListener('keyup', function(e) {
		setKey(e, false);
	})
	document.addEventListener('blur', function () {
		keys= {};
	})

	window.input = {
		is_down: function(key) {
			return keys[key.toUpperCase()];
		},
		bind: function(key, func) {
			bound_func[key.toUpperCase()] = func;
		},
		all_keys: function() {
			return keys;
		},
	};
})();