(function () {
	//button code for mouse clicks. 
	//IE8 returns 1, 4, 2 for left, middle and right buttons respectively.
	var l_btn = 0;
	var m_btn = 1;
	var r_btn = 2;

	var keys = {};
	var mouse = {
		x: 0,
		y: 0,
		btn_num: {
			0: [false, 0, 0],
			1: [false, 0, 0],
			2: [false, 0, 0]
		}
	};
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

	function setMouse(event, status) {
		var btn = event.button;
		mouse.btn_num[btn] = [status, event.clientX, event.clientY];
		//console.log('mouse button '+btn+' is '+status);
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
	document.addEventListener('mousemove', function(e) {
		mouse.x = e.clientX;
		mouse.y = e.clientY;
	})
	document.addEventListener('mousedown', function(e) {
		setMouse(e, true);
	})
	document.addEventListener('mouseup', function(e) {
		setMouse(e, false);
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
		m_pos: function() {
			return [mouse.x, mouse.y];
		},
		lclick: function() {
			return mouse.btn_num[l_btn][0];
		},
		mclick: function() {
			return mouse.btn_num[m_btn][0];
		},
		rclick: function() {
			return mouse.btn_num[r_btn][0];
		},
		lclick_pos: function() {
			return mouse.btn_num[l_btn].slice(1);
		},
		mclick_pos: function() {
			return mouse.btn_num[m_btn].slice(1);
		},
		rclick_pos: function() {
			return mouse.btn_num[r_btn].slice(1);
		}
	};
})();