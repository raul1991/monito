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
        var overlay = document.querySelector('.overlay');

        if (option === 1) {
            overlay.classList.add('displayInfo');
        } else {
            overlay.classList.remove('displayInfo');
        }
    };

    var table = (function () {
        var table = document.getElementById('monitoTable');
        var columns = ['machine', 'owner', 'users', 'notes']; // change the sequences to change the order of display.
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

            var addRow = function (jsonResponse) {
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
