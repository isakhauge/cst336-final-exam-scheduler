import {cout, get, isJSON, Http, getAttr, setAttr, make, flushChildren} from '../functions/functions.js';

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

function makeRow(timeId, date, startTime, endTime, bookedBy, name) {
	// Create elements:
	const tr = make('tr');
	const td_date = make('td', processDate(date));
	const td_start = make('td', processTime(startTime));
	const td_duration = make('td', timeDifferenceInHours(startTime, endTime) + ' hours');
	const td_bookedBy = make('td', (!bookedBy) ? 'Not booked' : bookedBy);
	const td_name = make('td', name);
	const td_buttons = make('td');
	const btn_book = make('button', 'Book');

	// Add attributes:
	setAttr(tr, 'data-id', timeId);
	setAttr(tr, 'data-date', processDate(date));
	setAttr(tr, 'data-start-time', startTime);
	setAttr(tr, 'data-end-time', endTime);
	setAttr(tr, 'data-name', name);
	setAttr(btn_book, 'data-id', timeId);
	setAttr(btn_book, 'class', 'btn btn-primary');
	setAttr(btn_book, 'data-toggle', 'modal');
	setAttr(btn_book, 'data-target', '#book');

	btn_book.onclick = onBook;

	td_buttons.append(btn_book);
	tr.append(td_date, td_start, td_duration, td_bookedBy, td_name, td_buttons);

	return tr;
}

function loadScheduleData(callback) {
	const url = '/api/time/bookable';
	Http.request(Http.method.get, url, null, function(raw) {
		console.log(raw);
		callback(raw);
	});
}

function populateBookingModal(name, date, startTime, endTime) {
	get('#book-name').value = name;
	get('#book-date').value = date;
	get('#book-start-time').value = startTime;
	get('#book-end-time').value = endTime;
}

function resetModals() {
	populateBookingModal('','','', '');
}

function onBook(ev) {
	const self = ev.target;
	const tr = self.parentElement.parentElement;
	const timeId = getAttr(tr, 'data-id');
	const name = getAttr(tr, 'data-name');
	const date = getAttr(tr, 'data-date');
	const startTime = getAttr(tr, 'data-start-time');
	const endTime = getAttr(tr, 'data-end-time');
	onBookRequest(timeId, function() {
		resetModals();
		populateBookingModal(name, date, startTime, endTime);
		updateTable();
	});
}

function onBookRequest(timeId, callback) {
	const url = '/api/time/book';
	const body = {timeId: timeId};
	Http.request(Http.method.post, url, body, function(raw) {
		processResponseData(raw, function (JSONObject) {
			if (JSONObject['affectedRows'] === 1) {
				cout('Time slot booked!', 'success');
			}
			callback();
		})
	});
}

function updateTable() {
	loadScheduleData(function(raw) {
		processResponseData(raw, function(JSONObject) {
			const tbody = get('tbody');
			flushChildren(tbody, function () {
				JSONObject.forEach((time) => {
					const elem = makeRow(time['ID'], time['date'], time['start'], time['end'], time['booked_by'], time['created_by']);
					tbody.append(elem);
				});
			})
		});
	});
}

window.onload = function () {
	cout('Booking: JS Module Loaded', 'success');
	updateTable();
};