var _gui = (function () {
    var navbar = (function () {
        var actions = (function () {
            var displayMenu = function () {
                var nav = document.querySelector('nav');

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
            };
            return {
                toggle: displayMenu
            }
        })();
        return {
            actions: actions
        }
    })();

    var displayInfo = function displayInfo(option) {
        var overlay = document.querySelector('#userInfoForm');

        if (option === 1) {
            overlay.classList.add('d-block');
        } else {
            overlay.classList.remove('d-block');
        }
    };

    var table = (function () {
        var table = document.getElementById('myMachinesView');
        var columns = ['machine', 'owner', 'users', 'notes', 'actions']; // change the sequences to change the order of display.
        var machines = [];
        var actions = (function() {
            var getMachines = function() {
                return machines;
            };

            var updateUserData = function updateUsersData(data) {
                document.getElementById(data.machine).children[2].innerHTML = data.users;
            };

            var machineExists = function machineExists(id) {
                return document.getElementById(id);
            };

            var getAuthor = function getAuthor(data) {
                if (data.indexOf('-') !== -1) {
                    var tokens = data.split('-');
                    return {author: tokens[0] + ' -', body: tokens[1]};
                }
                else {
                    return {author: '@anonymous - ', body: data};
                }
            };

            var getElement = function getElement(arr, colName) {
                switch (colName) {
                    case 'actions':
                        return '<button class="btn btn-primary" '+ arr[colName] + '>' + arr[colName] + '</button>';
                        break;
                    case 'notes':
                        var notes = getAuthor(arr[colName]);
                        return '<span style="color: blue">' + notes['author'] + '</span> ' + notes['body'];
                        break;
                    default:
                        return arr[colName];
                        break;
                }
            };

            var addRow = function (jsonResponse) {
                for (var i = 0; i < jsonResponse.length; i++) {
                    var row = document.createElement('tr');
                    var formattedData = jsonResponse[i]; // row
                    row.id = formattedData.machine;
                    if (!machineExists(row.id)) {
                        machines.push(formattedData);
                        for (var k in columns) {
                            if (columns.hasOwnProperty(k)) {
                                var data = document.createElement('td'); // column
                                data.innerHTML = getElement(formattedData, columns[k]);
                                row.appendChild(data);
                            }
                        }
                        table.appendChild(row);
                    }
                    else {
                        updateUserData(formattedData);
                    }
                }
            };

            var notes = (function() {
                var initNotesDialog = function() {
                    var machineDropdown = $('#machines');
                    $.each(machines, function(key, value) {
                        machineDropdown.append($('<option></option>').attr('value', value['machine']).text(value['machine']));
                    });
                };
               return {
                  populateMachines: initNotesDialog
               }
            })();
            return {
                notes: notes,
                addRow: addRow
            }
        })();
        return {
            actions: actions
        }
    })();

    return {
        displayInfo: displayInfo,
        navbar: navbar,
        table: table
    }
})();
