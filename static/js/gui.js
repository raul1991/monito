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

    var tabs = (function () {
        var allocatedMachines = {};
        var machinePool = {};
        var otherMachinePool = {}; // the pool which is allocated to other users
        var allocatedMachineView = $('#myMachinesView');
        var machinePoolView = $('#allMachinesView');
        var otherMachinesView = $('#otherMachinesView');
        var columns = ['machine', 'owner', 'users', 'actions']; // change the sequences to change the order of display.

        var table = (function () {

            var actions = (function () {
                var build = function (rowData, columns) {
                    var row = $('<tr></tr>').attr('id', rowData.machine);
                    for (var k in columns) {
                        if (columns.hasOwnProperty(k)) {
                            var col = $('<td></td>').html(getElement(rowData, columns[k])); // column
                            row.append(col);
                        }
                    }
                    return row;
                };

                return {
                    buildRow: build
                }
            })();
            return {
                cols: columns,
                actions: actions
            }
        })();

        var releaseMachine = function (machineData) {
            // remove from allocated
            delete allocatedMachines[machineData.machine];
            // update the gui.
            $('#' + machineData.machine).remove();
            // add to pool.
            machinePool[machineData.machine] = machineData;
            // build a new row with new data
            machineData.actions = 'Assign to me';
            machineData.isAllocated = false;
            machineData.owner = '-'; // hack.
            // append the new row
            machinePoolView.append(table.actions.buildRow(machineData, columns));
        };

        var allocateMachine = function (machineData) {
            // remove from pool
            delete machinePool[machineData.machine];
            // update the gui.
            $('#' + machineData.machine).remove();
            // add to allocated
            allocatedMachines[machineData.machine] = machineData;
            // build a new row with new data
            machineData.actions = 'release';
            machineData.isAllocated = true;
            machineData.owner = $('#name').html(); // hack.
            // append the new row
            allocatedMachineView.append(table.actions.buildRow(machineData, columns));
        };

        /**
         * A callback that gets called when the allocate/de-allocate button is pressed.
         * @param rowData
         */
        var onClickHandler = function (rowData, endpoint) {
            _requests.sendRequest({
                url: '/'+ endpoint + '/'+ rowData.machine,
                requestType: 'put',
                data: JSON.stringify(rowData)
            }, function (response) {
                // todo: remove the machines from the
                if (endpoint === 'release') {
                    // release a machine.
                    releaseMachine(rowData);
                }
                else if (endpoint === 'allocate') {
                    allocateMachine(rowData);
                }
            }, function (error) {
                console.log(error);
            });
        };

        var getEndpoint = function (actionLabel) {
            switch (actionLabel) {
                case "release":
                    return actionLabel;
                case "Assign to me":
                    return "allocate";
                default:
                    return "none";
            }
        };

        var getElement = function getElement(arr, colName) {
            switch (colName) {
                case 'actions':
                    var classes = "btn btn-primary";
                    var actionsLabel = arr[colName];
                    var endpoint = getEndpoint(actionsLabel);
                    if (endpoint === "none")
                    {
                        return $('<button></button>').val(actionsLabel).html(actionsLabel).attr('class', classes);
                    }
                    return $('<button></button>').val(endpoint).html(actionsLabel).attr('class', classes).click(function () {
                        onClickHandler(arr, endpoint);
                    });

                default:
                    return arr[colName];
                    break;
            }
        };

        var isAllocatedToMe = (function (data) {
            return data.isAllocated && data.owner === $("#name").html();
        });

        /**
         * Renders the view with the data provided.
         *
         * @param data - an object like {"free": [{}, {}]}
         * @param view - a ui element
         * @param poolType - either machinePool or freeMachines object
         *
         */
        var renderTable = (function (data, view, poolType, cols) {
            // for each tab
            $.each(data, function (key, rowData) {
                // for each row update the view.
                var newRow = table.actions.buildRow(rowData, cols);
                view.append(newRow);
                // add machine to the corresponding pool
                poolType[rowData.machine] = rowData;
            });
        });

        /**
         * machines : [{"free": [{}, {}]}, {"allocated": [{}, {}]}]
         */
        var init = (function (machines) {

            var exemptions = $('.exempted-headers').detach(); // headers of the tables should be preserved.
            allocatedMachineView.empty().append(exemptions[0]); // delete all child nodes and recreate as per the server response.
            machinePoolView.empty().append(exemptions[1]);
            otherMachinesView.empty().append(exemptions[2]);

            // reload the gui.
            renderTable(machines.filter(function (machine) {
                return !machine.isAllocated;
            }), machinePoolView, machinePool, columns);

            renderTable(machines.filter(function (machine) {
                return isAllocatedToMe(machine);
            }), allocatedMachineView, allocatedMachines, columns);

            renderTable(machines.filter(function (machine) {
                return machine.isAllocated && machine.owner !== $("#name").html();
            }), otherMachinesView, otherMachinePool, ['machine', 'owner', 'users']);
        });

        return {
            init: init,
            allocations: allocatedMachines,
            free: machinePool
        }
    })();

    return {
        displayInfo: displayInfo,
        navbar: navbar,
        tabs: tabs
    }
})();
