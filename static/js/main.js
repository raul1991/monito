//Responsive menu
var monito = (function (cookiesModule, requests, notes) {
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

    function getAuthor(data)
    {
        if (data.indexOf('-') != -1) {
            var tokens = data.split('-');
            return {author: tokens[0] + ' -', body: tokens[1]};
        }
        else {
            return {author: '@anonymous - ', body: data};
        }
    }

    function getAllMappings() {
        var table = document.querySelector('table');
        var columns = ['machine', 'owner', 'users', 'notes']; // change the sequences to change the order of display.
        requests.sendRequest({'requestType': 'GET', 'url': '/mappings'}, function (XMLObj) {
            var response = XMLObj.responseText;

            if (response) {
                var jsonResponse = JSON.parse(response);
                for (var i = 0; i < jsonResponse.length; i++) {
                    var row = document.createElement('tr');
                    var formattedData = jsonResponse[i];
                    row.id = formattedData.machine;
                    if (!machineExists(row.id)) {
                        machines.push(formattedData);
                        for (var k in columns) {
                            if (columns.hasOwnProperty(k)) {
                                var data = document.createElement('td');
                                if (columns[k] === 'notes')
                                {
                                    var notes = getAuthor(formattedData[columns[k]]);
                                    data.innerHTML = '<span style="color: blue">' + notes['author'] + '</span> ' + notes['body'];
                                }
                                else {
                                    data.innerHTML = formattedData[columns[k]];
                                }
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
            console.log(error);
        });
    }

    function updateUsersData(data) {
        document.getElementById(data.machine).children[2].innerHTML = data.users;
    }

    function machineExists(id) {
        return document.getElementById(id);
    }

    function init() {
        getAllMappings();
        restorePreferences();
    }

    function saveNote() {
        notes.save()
    }

    return {
        init: init,
        refresh: autoRefresh,
        initNotesDialog: initNotesDialog,
        saveNote: saveNote,
        displayInfo: displayInfo
    }
})(_cookies, _requests, _notes);
