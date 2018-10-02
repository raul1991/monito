var _cookies = (function(){
    var get = (function (key) {
        var name = key + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    });
    var save = (function (key, value) {
        var d = new Date();
        d.setTime(d.getTime() + (365*24*60*60*1000));
        var expires = "expires=" + d.toGMTString();
        document.cookie = key + "=" + value + ";" + expires + ";path=/";
    });
    return {
        get : get,
        save : save
    }
})();