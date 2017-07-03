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
			0: false,
			1: false,
			2: false
		}
	};

	function setKey(event, status) {
		var code = event.keyCode;
		var key;

		if ((code >= 65 && code <= 90) || (code >= 48 && code <= 57)) {
			//keys from 0-9 and a-z
			key = String.fromCharCode(code);
		} else {
			key = code;
		}

		/*
		switch(code) {
			default:
				key = String.fromCharCode(code); break;
		}
		*/

		//console.log('changed('+code+') '+key+' to '+status);
		keys[key] = status;
	}

	function setMouse(event, status) {
		var btn = event.button;
		mouse.btn_num[btn] = status;
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
		all_keys: function() {
			return keys;
		},
		mouseX: function() {
			return mouse.x;
		},
		mouseY: function() {
			return mouse.y;
		},
		lclick: function() {
			return mouse.btn_num[l_btn];
		},
		mclick: function() {
			return mouse.btn_num[m_btn];
		},
		rclick: function() {
			return mouse.btn_num[r_btn];
		}
	};
})();