var _requests = (function() {
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
            xmlRequest.send("data=" + encodeURIComponent(config.data));
        }
        else {
            xmlRequest.send();
        }
    }
    return {
        sendRequest: sendRequest
    }
})();