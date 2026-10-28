const request = indexedDB.open("gameDB");
let db: IDBDatabase;

request.onerror = function(event) {
	console.error("Local games database failed to open:", event.target.errorCode);
}

request.onsuccess = function(event) {
	db = event.target.result;
	console.log("Local game databases opened successfully");
};

request.onupgradeneeded = function(event) {
	db = event.target.result;
	const store = db.createObjectStore("games", {keyPath: "id", autoIncrement: true});
	const gameIndex = store.createIndex("by_date", "date", {unique: true});
	const gameIndex = store.createIndex("guesses", "guesses", {unique: false});
	console.log("Local games database setup complete");
}

function addData() {
	let transaction = db.transaction(["gameDB"], "readwrite");
	let store = transaction.objectStore("gameDB");

	let newData = {date: "2026-10-28", guesses: [""]}
	let request	= store.add(newData);

	request.onsuccess = function() {
		console.log("Data added successfully to local game database");
	};

	request.onerror = function() {
		console.error("Error adding data to local game database");
	};
}

function getData(id: number) {
	let transaction = db.transaction(["gameDB"], "readonly");
	let store = transaction.objectStore("gameDB");
	let request = store.get(id);

	request.onsuccess = function() {
		if (request.result) {
			console.log("Game data retrieved:", request.result);
		} else {
			console.log("Game data not found");
		}
	};

	request.onerror = function() {
		console.error("Error retrieving data")
	}
}
