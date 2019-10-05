var _helpers = (function() {
  var snackBarElRef;

  var generateSnackbar = function(message, type) {
    var snackbarClass = "alert-success";

    if (type === "danger") {
      snackbarClass = "alert-danger";
    }

    if (type === "warning") {
      snackbarClass = "alert-warning";
    }

    return `
      <div class="monito-alert alert ${snackbarClass} fade show" role="alert" style="position: absolute; top: 85px; right: 45px">
        <p style="margin:0; width: 100%; text-align: center">${message}</p>
      </div>
    `;
  };

  var showSnackbar = function(message, type, timeout) {
    if (snackBarElRef) {
      $(snackBarElRef).alert("close");
    }

    // Append snackbar element to body
    snackbarMessage = generateSnackbar(message, type);
    $("body").append(snackbarMessage);

    snackBarElRef = $(".monito-alert");

    setTimeout(() => {
      $(snackBarElRef).alert("close");
    }, timeout || 3000);
  };

  return {
    showSnackbar: showSnackbar
  };
})();
