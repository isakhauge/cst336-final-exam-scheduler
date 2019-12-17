import {cout, get, isJSON, Http} from '../functions/functions.js';

function getFormData(callback) {
	callback({
		email: get('#email').value,
		password: get('#password').value
	});
}

function getLoginButton() {
	return get('#login');
}

function addEventListener(button, eventListener, callback) {
	button.onclick = eventListener;
	callback();
}

function onLogin() {
	getFormData(function(body) {
		login(body, function(raw) {
			validateResult(raw, function() {
				console.log('Result validation function invoked.');
			});
		});
	});
}

function login(body, callback) {
	validateForm(function(isValid) {
		if (isValid) {
			const url = '/api/user/login';
			Http.request(Http.method.post, url, body, function(raw) {
				callback(raw);
			});
		} else {
			alert('All fields must be filled out!');
			callback(false);
		}
	});
}

function validateForm(callback) {
	getFormData(function(body) {
		let validation = true;
		if (body.email.length < 1) validation = false;
		if (body.password.length < 1) validation = false;
		callback(validation);
	});
}

function validateResult(raw, callback) {
	if (isJSON(raw)) {
		const obj = JSON.parse(raw);
		if (obj['gateKeeper'] === 'Unlocked!') {
			cout('GateKeeper: ' + obj['gateKeeper'], 'success');
			window.location.href = '/dashboard';
		} else {
			cout('GateKeeper: ' + obj['gateKeeper'], 'danger');
		}
	} else {
		cout('Login failed', 'danger');
	}
	callback();
}

window.onload =  function() {
	cout('Login JS Module: Loaded', 'success');
	addEventListener(getLoginButton(), onLogin, function() {
		cout('Event listener added.');
	});
};