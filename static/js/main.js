//Responsive menu
var monito = (function (preferences, requests, notes, gui) {
    var display = false;
    var autoRefreshElRef = document.getElementById('toggleAutoRefresh');
    var refreshIntervalId; // used to store the refresh interval id in order to clear it later on.
    var prefKeys = {
        'refreshInterval': 'prefs.refresh'
    };

    var autoRefresh = (function (prefs) {
        var update = (function (state) {
            autoRefreshElRef.innerHTML = state;
            prefs.save(prefKeys.refreshInterval, state);
            toggle(state);
        });
        var toggle = (function (state) {
            autoRefreshElRef.innerHTML = (state.toLocaleLowerCase() === 'enable') ? 'Disable' : 'Enable';
            reactToState(state);
        });
        var reactToState = (function (state) {
            if (state.toLocaleLowerCase() === 'enable' && !refreshIntervalId) {
                refreshIntervalId = window.setInterval(getAllMappings, 1000 * 10);
            } else {
                window.clearInterval(refreshIntervalId);
                refreshIntervalId = undefined;
            }
        });
        var state = (autoRefreshElRef && autoRefreshElRef.innerHTML) || 'Disable';
        return {
            state: state,
            update: update
        }
    })(preferences);

    function restorePreferences() {
        autoRefresh.update(preferences.get(prefKeys.refreshInterval));
    }

    function displayMenu() {
        gui.navbar.toggle();
    }

    function initNotesDialog() {
        gui.table.actions.notes.populateMachines();
    }

    //Display User information on dashboard

    function displayInfo(option) {
        gui.displayInfo(option);
    }

    // Display update User information box

    // function updateInfoMenu() {
    // 	var updateMenu = document.querySelector('.updateMenu');
    // 	updateMenu.classList.toggle('displayUpdateMenu');
    // }

    function getAllMappings() {
        requests.sendRequest({'requestType': 'GET', 'url': '/mappings'}, function (XMLObj) {
            var response = XMLObj.responseText;

            if (response) {
                var jsonResponse = JSON.parse(response);
                gui.tabs.init(jsonResponse);
            }
        }, function (error) {
            console.log(error);
        });
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
        displayInfo: displayInfo,
        displayMenu: displayMenu
    }
})(_prefs, _requests, _notes, _gui);
