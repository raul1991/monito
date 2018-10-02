//Responsive menu
var monito = (function (cookiesModule) {
    var machines = []; // to keep track of all the machines.
    var display = false;
    var autoRefreshElRef = document.getElementById('toggleAutoRefresh');
    var refreshIntervalId; // used to store the refresh interval id in order to clear it later on.
    var prefs = {
        'refreshInterval': 'prefs.refresh'
    };
    var autoRefresh = (function (cookies) {
        var update = (function (state) {
            autoRefreshElRef.innerHTML = state;
            cookies.update(prefs.refreshInterval, state);
            toggle(state);
        });
        var toggle = (function (state) {
            autoRefreshElRef.innerHTML = (state.toLocaleLowerCase() === 'enable') ? 'Disable' : 'Enable';
            reactToState(state);
        });
        var reactToState = (function (state) {
            if (state.toLocaleLowerCase() === 'enable' && !refreshIntervalId) {
                refreshIntervalId = window.setInterval(getAllMappings, 1000 * 10);
            }
            else {
                window.clearInterval(refreshIntervalId);
                refreshIntervalId = undefined;
            }
        });
        var state = (autoRefreshElRef && autoRefreshElRef.innerHTML) || 'Disable';
        return {
            state: state,
            update: update
        }
    })(cookiesModule);

    function restorePreferences() {
        autoRefresh.update(cookiesModule.get(prefs.refreshInterval));
    }

    function displayMenu() {
        var menu = document.querySelector('.menu');
        var nav = document.querySelector('nav');
        var bars = document.querySelector('.menu div');

        if (display === false) {
            nav.style.display = 'block';
            nav.style.opacity = '0';
            setTimeout(function () {
                nav.style.opacity = '1';
            }, 100);

            display = true;

        } else {
            nav.style.display = 'none';

            display = false;
        }
    }

    function initNotesDialog()
    {
        var machineDropdown = $('#machines');
        $.each(machines, function(key, value) {
            machineDropdown.append($('<option></option>').attr('value', value['machine']).text(value['machine']));
        });
    }

    //Display User information on dashboard

    function displayInfo(option) {
        var overlay = document.querySelector('.overlay');

        if (option === 1) {
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

    function sendRequest(config, action, error) {
        var xmlRequest = new XMLHttpRequest();

        xmlRequest.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                action(this);
            }
            else {
                error(this);
            }
        }
        xmlRequest.open(config.requestType, config.url, true); // async
        if (config.data) {
            xmlRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xmlRequest.send("data="+ config.data);
        }
        else {
            xmlRequest.send();
        }
    }

    function getAllMappings() {
        var table = document.querySelector('table');
        sendRequest({'requestType': 'GET', 'url': '/mappings'}, function (XMLObj) {
            var response = XMLObj.responseText;

            if (response) {
                response = response.split(';');

                for (var i = 0; i < response.length; i++) {
                    var row = document.createElement('tr');
                    var formattedData = getFormattedData(response[i]);
                    row.id = formattedData.machine;
                    if (!machineExists(row.id)) {
                        machines.push(formattedData);
                        for (k in formattedData) {
                            if (formattedData.hasOwnProperty(k)) {
                                var data = document.createElement('td');
                                data.innerHTML = formattedData[k];
                                row.appendChild(data);
                            }
                        }
                        table.appendChild(row);
                    }
                    else {
                        updateUsersData(formattedData);
                    }
                }
            }
        }, function(error) {
            console.log(error.responseText);
        });
    }

    function updateUsersData(data) {
        document.getElementById(data.machine).children[2].innerHTML = data.users;
    }

    function machineExists(id) {
        return document.getElementById(id);
    }

    function getFormattedData(response) {
        var id = response.split(':')[0];
        var obj = {};
        obj['machine'] = id;
        obj['owner'] = response.split(':')[1];
        obj['users'] = response.split(':')[2].split(',').join(', ');
        obj['notes'] = response.split(':')[3];
        return obj;
    }

    function init() {
        getAllMappings();
        restorePreferences();
    }

    function saveNote() {
        var modal = $('#notesModal');
        var form = document.getElementById('notesForm');
        var note = $('#notes-text').val();
        var machine = $('#machines').val();
        console.log("Sending : " + note + '&' + machine);
        sendRequest({requestType: 'PUT', url: '/machines/'+ machine, data: note}, function(response) {
            console.log(response.responseText);
            modal.modal('hide');
            form.reset();

        }, function(error) {
            // do error handling here.
        });
    }
    return {
        init: init,
        refresh: autoRefresh,
        initNotesDialog: initNotesDialog,
        saveNote: saveNote,
        displayInfo: displayInfo
    }
})(_cookies);
