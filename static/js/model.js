/**
 * Model contains the state of the entire application.
 * This should be set as a pre-requisite for other modules.
 *
 */
var model = (function () {

    /**
     * Returns the data object for the specified namespace.
     */
    var getData = (function (namespace) {
        return {};
    });

    return {
        get: get
    }
})();
