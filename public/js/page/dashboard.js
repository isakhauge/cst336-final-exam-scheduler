import {cout, get, isJSON, Http, getAttr, setAttr, make, flushChildren} from '../functions/functions.js';

function addEventListener(button, eventListener, callback) {
	button.onclick = eventListener;
	callback();
}

function onDetails(e) {
	const self = e.target;
	const tr = self.parentElement.parentElement;
	const date = getAttr(tr, 'data-date');
	const startTime = getAttr(tr, 'data-start-time');
	const endTime = getAttr(tr, 'data-end-time');
	resetModals();
	populateDetailsModal(date, startTime, endTime);
}

function onDelete(e) {
	const self = e.target;
	const tr = self.parentElement.parentElement;
	const id = getAttr(tr, 'data-id');
	const date = getAttr(tr, 'data-date');
	const startTime = getAttr(tr, 'data-start-time');
	const endTime = getAttr(tr, 'data-end-time');
	resetModals();
	populateDeleteModal(id, date, startTime, endTime);
	get('#button-delete').onclick = onDeleteRequest;
}

function onDeleteRequest(e) {
	const self = e.target;
	const id = getAttr(self, 'data-id');
	const url = `api/time/${id}`;
	Http.request(Http.method.delete, url, null, function(raw) {
		if (isJSON(raw)) {
			const JSONObject = JSON.parse(raw);
			if (JSONObject['affectedRows'] === 1)
				cout('Time slot removed from database!', 'success');
			updateTable();
		}
	});
}

function getFormData(callback) {
	callback({
		date: get('#add-time-date').value,
		startTime: get('#add-time-start').value,
		endTime: get('#add-time-end').value
	});
}

function onAddTime() {
	getFormData(function(body) {
		addTime(body, function(raw) {
			processResponseData(raw, function(JSONObject) {
				if (JSONObject['affectedRows'] === 1)
					cout('Time slot added to database!', 'success');
				updateTable();
			});
		});
	});
}

function addTime(body, callback) {
	const url = '/api/time';
	Http.request(Http.method.post, url, body, function(raw) {
		callback(raw);
	});
}

function processResponseData(raw, callback) {
	if (isJSON(raw)) {
		const JSONObject = JSON.parse(raw);
		callback(JSONObject);
	} else callback([]);
}

function processDate(date) {
	return date.split(/[T]/)[0];
}

function processTime(time) {
	const h = parseInt(time.split(/[:]/)[0]);
	let m = parseInt(time.split(/[:]/)[1]);
	const ampm = (h > 12) ? 'PM' : 'AM';
	m = (m < 10) ? ('0' + m) : m;
	return `${h}:${m} ${ampm}`;
}

function timeDifferenceInHours(startTime, endTime) {
	startTime = new Date(2000, 0, 0, parseInt(startTime.split(/[:]/)[0]), parseInt(startTime.split(/[:]/)[1]), 0, 0);
	endTime = new Date(2000, 0, 0, parseInt(endTime.split(/[:]/)[0]), parseInt(endTime.split(/[:]/)[1]), 0, 0);
	const diff = ((endTime.getTime() - startTime.getTime()) / 1000) / (60 * 60);
	return Math.abs(diff).toFixed(1);
}

function makeRow(timeId, date, startTime, endTime, bookedBy) {
	// Create elements:
	const tr = make('tr');
	const td_date = make('td', processDate(date));
	const td_start = make('td', processTime(startTime));
	const td_duration = make('td', timeDifferenceInHours(startTime, endTime) + ' hours');
	const td_bookedBy = make('td', (!bookedBy) ? 'Not booked' : bookedBy);
	const td_buttons = make('td');
	const btn_details = make('button', 'Details');
	const btn_delete = make('button', 'Delete');

	// Add attributes:
	setAttr(tr, 'data-id', timeId);
	setAttr(tr, 'data-date', processDate(date));
	setAttr(tr, 'data-start-time', startTime);
	setAttr(tr, 'data-end-time', endTime);
	setAttr(btn_details, 'data-id', timeId);
	setAttr(btn_details, 'class', 'btn btn-secondary mr-2');
	setAttr(btn_details, 'data-toggle', 'modal');
	setAttr(btn_details, 'data-target', '#details');
	setAttr(btn_delete, 'data-id', timeId);
	setAttr(btn_delete, 'class', 'btn btn-danger');
	setAttr(btn_delete, 'data-toggle','modal');
	setAttr(btn_delete, 'data-target', '#delete');

	// Add event listeners:
	btn_details.onclick = onDetails;
	btn_delete.onclick = onDelete;

	td_buttons.append(btn_details, btn_delete);
	tr.append(td_date, td_start, td_duration, td_bookedBy, td_buttons);

	return tr;
}

function loadScheduleData(callback) {
	const url = '/api/time/user';
	Http.request(Http.method.get, url, null, function(raw) {
		console.log(raw);
		callback(raw);
	});
}

function populateDetailsModal(date, startTime, endTime) {
	get('#details-date').value = date;
	get('#details-start').value = startTime;
	get('#details-end').value = endTime;
}

function populateDeleteModal(id, date, startTime, endTime) {
	get('#delete-date').value = date;
	get('#delete-start').value = startTime;
	get('#delete-end').value = endTime;
	setAttr(get('#button-delete'), 'data-id', id);
}

function resetModals() {
	populateDetailsModal('','','');
	populateDeleteModal('','','', '');
}

function updateTable() {
	loadScheduleData(function(raw) {
		processResponseData(raw, function(JSONObject) {
			const tbody = get('tbody');
			flushChildren(tbody, function () {
				JSONObject.forEach((time) => {
					const elem = makeRow(time['ID'], time['date'], time['start'], time['end'], time['booked_by']);
					tbody.append(elem);
				});
			})
		});
	});
}

window.onload = function () {
	cout('Dashboard: JS Module Loaded', 'success');
	addEventListener(get('#button-add-time'), onAddTime, function () {
		cout('Event Listener Added!');
	});
	get('#button-delete').onclick = onDeleteRequest;
	updateTable();
};