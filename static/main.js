
//Responsive menu

var display = false;

function displayMenu() {
	var menu = document.querySelector('.menu');
	var nav = document.querySelector('nav');
	var bars = document.querySelector('.menu div');

	if(display == false) {
		nav.style.display = 'block';
		nav.style.opacity = '0';
		setTimeout(function() {
			nav.style.opacity = '1';
		}, 100);

		display = true;

	} else {
		nav.style.display = 'none';

		display = false;
	}
}

//Display User information on dashboard

function displayInfo(option) {
	var overlay = document.querySelector('.overlay');
	
	if(option == 1) {
		overlay.classList.add('displayInfo');
	} else {
		overlay.classList.remove('displayInfo');
	}
}

// Display update User information box

// function updateInfoMenu() {
// 	var updateMenu = document.querySelector('.updateMenu');
// 	updateMenu.classList.toggle('displayUpdateMenu');
// }

//AJAX

function sendRequest(config, action){
	var xmlRequest = new XMLHttpRequest();

	xmlRequest.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200)
		{
			action(this);
		}
	}

	xmlRequest.open(config.requestType, config.url, true); // async
	xmlRequest.send();
}

function getAllMappings() {
	function updateTable() {
		var table = document.querySelector('table');
		table.innerHTML = '<tr><th>Machine</th><th>User(s)</th></tr>';

		sendRequest({'requestType': 'GET', 'url': '/mappings'}, function(XMLObj) {
			var response = XMLObj.responseText;

			if(response) {
				response = response.split(';');

				for(var i = 0; i < response.length; i++) {
					if(i % 2 == 0) {
						background = '#fff';
					} else {
						background = '#efefef';
					}
					
					table.innerHTML += '<tr style = "background:' + background + ';"><td>' + response[i].split(':')[0] + '</td><td>' + response[i].split(':')[1].split(',').join(', ') + '</td></tr>'
				}
			} else {
				console.log('Empty');
			}
		});
	}

	updateTable();
	setInterval(updateTable, 1000 * 10);
}

