function viewTimesheet(primaryControl) {

    var globalContext = Xrm.Utility.getGlobalContext();
    var recordId = primaryControl.data.entity.getId().replace(/[{}]/g, "");
    const workOrderName = primaryControl.data.entity.attributes.get("proto_wonumber");

    console.log("DEBUG MESSAGE");

    globalContext.getCurrentAppProperties().then(
        function (appProperties) {

            var appId = appProperties.appId;
            var webResourceName = "proto_timesheet_ui_demo";

            var url =
                globalContext.getClientUrl()
                + "/main.aspx"
                + "?appid=" + appId
                + "&pagetype=webresource"
                + "&webresourceName=" + encodeURIComponent(webResourceName)
                + "&data=" + encodeURIComponent(recordId)
                + "&wonumber=" + encodeURIComponent(workOrderName ? (workOrderName.getValue() || "") : "");

            window.open(url, "_blank");
        },
        function (error) {
            console.error(error.message);
        }
    );
}
