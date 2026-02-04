function viewTimesheet(primaryControl) {

    var globalContext = Xrm.Utility.getGlobalContext();

    globalContext.getCurrentAppProperties().then(
        function (appProperties) {

            var appId = appProperties.appId;
            var webResourceName = "new_/Timesheet.html";

            var url =
                globalContext.getClientUrl()
                + "/main.aspx"
                + "?appid=" + appId
                + "&pagetype=webresource"
                + "&webresourceName=" + encodeURIComponent(webResourceName);

            window.open(url, "_blank");
        },
        function (error) {
            console.error(error.message);
        }
    );
}
