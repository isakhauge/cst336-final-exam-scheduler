import {cout, get, isJSON, Http} from '../functions/functions.js';

function addEventListener(button, ev, callback) {
	button.onclick = ev;
	callback();
}

function getButton() {
	return get('#register');
}

function getFormData(callback) {
	callback({
		name: get('#name').value,
		email: get('#email').value,
		password: get('#password').value,
		password2: get('#password-confirm').value
	});
}

function onRegister() {
	getFormData(function(body) {
		validateForm(function(isValid) {
			if (isValid) {
				if (body.password !== body.password2) {
					alert('Password mismatch!');
					return;
				}
				makeUser(body, function(raw) {
					if (isJSON(raw)) {
						const obj = JSON.parse(raw);
						if (obj['affectedRows'] && obj['affectedRows'] === 1) {
							cout(`New user ${body.name} created!`, 'success');
							alert(`New user ${body.name} created!`);
						}
					}
				});
			} else {
				alert('All fields must be filled out!');
			}
		});
	});
}

function validateForm(callback) {
	getFormData(function(body) {
		let validation = true;
		if (body.name.length < 1) validation = false;
		if (body.email.length < 1) validation = false;
		if (body.password.length < 1) validation = false;
		if (body.password2.length < 1) validation = false;
		callback(validation);
	});
}

function makeUser(body, callback) {
	const url = '/api/user';
	Http.request(Http.method.post, url, body, function (raw) {
		callback(raw);
	});
}

window.onload = function() {
	cout('Register JS Module: Loaded', 'success');
	addEventListener(getButton(), onRegister, function() {
		cout('Event listener added.');
	});
};