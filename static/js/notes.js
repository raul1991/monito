var _notes = (function(requests) {
    var init = function() {
        console.log("Notes module initiated");
    };

    var saveNote = function() {
        var modal = $('#notesModal');
        var form = document.getElementById('notesForm');
        var note = $('#notes-text').val();
        var machine = $('#machines').val();
        requests.sendRequest({requestType: 'PUT', url: '/machines/'+ machine, data: note}, function(response) {
            console.log(response.responseText);
            modal.modal('hide');
            form.reset();
            window.location = "/dashboard";

        }, function(error) {
            // do error handling here.
        });
    };
    return {
        init: init,
        save: saveNote

    }
})(_requests);