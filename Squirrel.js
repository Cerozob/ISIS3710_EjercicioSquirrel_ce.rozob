const body = document.body;
const data = fetch(
	"https://gist.githubusercontent.com/josejbocanegra/b1873c6b7e732144355bb1627b6895ed/raw/d91df4c8093c23c41dce6292d5c1ffce0f01a68b/newDatalog.json"
);

//map de la parte B
var correlationMap = new Map();

// Parte A

const tableA = document.createElement("table");

const theadA = document.createElement("thead");

const tableHeaderA = document.createElement("tr");

const colNumber = document.createElement("td");
const colEventsA = document.createElement("td");
const colSquirrel = document.createElement("td");

const tbodyA = document.createElement("tbody");

colNumber.innerText = "#";
colEventsA.innerText = "Events";
colSquirrel.innerText = "Squirrel";

tableHeaderA.appendChild(colNumber);
tableHeaderA.appendChild(colEventsA);
tableHeaderA.appendChild(colSquirrel);

theadA.appendChild(tableHeaderA);

tableA.appendChild(theadA);
function loadTable(data) {
	for (i = 0; i < data.length; i++) {
		// cargar datos y tabla #1

		let record = data[i];
		let number = document.createElement("td");
		let events = document.createElement("td");
		let eventsList = record.events;
		let squirrel = document.createElement("td");
		let index = i + 1;
		number.innerText = index;
		events.innerText = eventsList;
		squirrel.innerText = record.squirrel;
		let dataRow = document.createElement("tr");
		if (record.squirrel) {
			//highlight
			dataRow.style.backgroundColor = "#FF0000";
		}
		dataRow.appendChild(number);
		dataRow.appendChild(events);
		dataRow.appendChild(squirrel);
		tbodyA.appendChild(dataRow);

		// crear map para la tabla #2
		for (let j = 0; j < eventsList.length; j++) {
			let eventName = eventsList[j];
			if (!correlationMap.has(eventName)) {
				let obj = {
					name: eventName, //simplifica la conversión a array para ordenarlo
					correlation: 0,
					FP: 0,
					FN: 0,
					TN: 0,
					TP: 0,
				};
				correlationMap.set(eventName, obj);
			}
		}
	}
	correlationTable(data);
}

tableA.appendChild(tbodyA);
body.appendChild(tableA);

// Parte B

const tableB = document.createElement("table");

const theadB = document.createElement("thead");

const tableHeaderB = document.createElement("tr");

const colNumberB = document.createElement("td");
const colEventB = document.createElement("td");
const colCorrelation = document.createElement("td");

const tbodyB = document.createElement("tbody");

colNumber.innerText = "#";
colEventB.innerText = "Event";
colCorrelation.innerText = "Correlation";

tableHeaderB.appendChild(colNumber);
tableHeaderB.appendChild(colEventB);
tableHeaderB.appendChild(colCorrelation);

theadB.appendChild(tableHeaderB);

tableB.appendChild(theadB);

/* 
    False Positiva = FP = squirrel true; evento false
    False Negative = FN = squirrel false; evento true
    True Positive  = TP = squirrel true; evento true
    True Negative  = TN = squirrel false; evento false
*/

function correlationCalculator(event) {
	/*
        event es un objeto -> {name: eventName, correlation: 0,FP: 0,FN: 0,TN: 0,TP: 0,};
    */
	let fp = event.FP;
	let fn = event.FN;
	let tp = event.TP;
	let tn = event.TN;
	let mcc =
		(tp * tn - fp * fn) /
		Math.sqrt((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn));
	event.correlation = mcc;
	return event;
}

function correlationComparator(a, b) {
	/*
        a y b son objetos -> {name: eventName, correlation: 0,FP: 0,FN: 0,TN: 0,TP: 0,};
    */
	return a.correlation > b.correlation //orden inverso para que el append quede en orden
		? -1
		: a.correlation === b.correlation
		? 0
		: 1;
}

function correlationTable(data) {
	//correlation
	//aquí estoy seguro de que ya están todos los eventos en el map
	for (i = 0; i < data.length; i++) {
		let record = data[i];
		let squirrelValue = record.squirrel;

		let eventsList = record.events;

		for (let [key, value] of correlationMap) {
			correlObject = value;
			if (eventsList.includes(key)) {
				if (squirrelValue) {
					correlObject.TP++;
				} else {
					correlObject.FN++;
				}
			} else {
				if (squirrelValue) {
					correlObject.FP++;
				} else {
					correlObject.TN++;
				}
			}
		}
	}
	//calcular correlación de cada uno y ordenar
	var calculatedEvents = Array.from(
		correlationMap.values(),
		correlationCalculator
	);

	//ordenar
	calculatedEvents.sort(correlationComparator);

	//rendering
	for (i = 0; i < calculatedEvents.length; i++) {
		let index = i + 1;
		let eventName = calculatedEvents[i].name;
		let correlation = calculatedEvents[i].correlation;

		let number = document.createElement("td");
		let event = document.createElement("td");
		let correl = document.createElement("td");
		let dataRow = document.createElement("tr");

		number.innerText = index;
		event.innerText = eventName;
		correl.innerText = correlation;

		dataRow.appendChild(number);
		dataRow.appendChild(event);
		dataRow.appendChild(correl);

		tbodyB.appendChild(dataRow);
	}
}

data.then((resp) => {
	resp.json().then(loadTable);
});

tableB.appendChild(tbodyB);
body.appendChild(tableB);
