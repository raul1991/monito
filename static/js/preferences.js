var _prefs = (function (storage) {
    var init = function() {
        console.log("Loaded the preferences");
    };

    var save = function (key, value) {
        storage.save(key, value);
    };

    var restore = function () {
        console.log("Restoring the preferences");
    };

    var get = function (key) {
        return storage.get(key);
    }

    return {
        init: init,
        save: save,
        get: get,
        restore: restore
    };
})(_cookies);