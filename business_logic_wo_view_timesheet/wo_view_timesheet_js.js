function viewTimesheet(primaryControl) {

    var globalContext = Xrm.Utility.getGlobalContext();

    globalContext.getCurrentAppProperties().then(
        function (appProperties) {

            var appId = appProperties.appId;
            var webResourceName = "new_/Timesheet.html";
            // 現在開いているWO（フォーム）のレコードIDを取得し、Timesheet側に渡す
            // timesheet_view は URL パラメータ recordid を見て selectedWO を初期化する
            var recordId = null;
            try {
                if (
                    primaryControl &&
                    primaryControl.data &&
                    primaryControl.data.entity &&
                    typeof primaryControl.data.entity.getId === "function"
                ) {
                    recordId = primaryControl.data.entity.getId();
                }
            } catch (e) {
                // 取得できない場合は null のまま（全件表示などにフォールバック）
                recordId = null;
            }
            if (recordId) {
                // "{GUID}" -> "GUID"
                recordId = recordId.replace(/[{}]/g, "");
            }

            var url =
                globalContext.getClientUrl()
                + "/main.aspx"
                + "?appid=" + appId
                + "&pagetype=webresource"
                + "&webresourceName=" + encodeURIComponent(webResourceName)
                + (recordId ? ("&recordid=" + encodeURIComponent(recordId)) : "");

            window.open(url, "_blank");
        },
        function (error) {
            console.error(error.message);
        }
    );
}
