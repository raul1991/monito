var _notes = (function(requests) {
    var init = function() {
        console.log("Notes module initiated");
    };

    var saveNote = function() {
        var modal = $('#notesModal');
        var form = document.getElementById('notesForm');
        var note = $('#notes-text').val();
        var machine = $('#machines').val();
        var errorLabel = $('#error');
        requests.sendRequest({requestType: 'PUT', url: '/machines/'+ machine, data: note}, function(response) {
            modal.modal('hide');
            form.reset();
            window.location = "/dashboard";
        }, function(error) {
            // do error handling here.
            errorLabel.html("Server says : " + error.statusText.toLocaleLowerCase());
            setTimeout(function() {
               errorLabel.html("");
            }, 3000);
        });
    };
    return {
        init: init,
        save: saveNote

    }
})(_requests);