function viewTimesheet(primaryControl) {

    // グローバルコンテキスト取得
    var globalContext = Xrm.Utility.getGlobalContext();

    // 現在のアプリ ID を取得
    var appId = globalContext.getCurrentAppId();

    // Web リソース名（固定）
    var webResourceName = "new_/Timesheet.html";

    // URL 組み立て
    var url =
        globalContext.getClientUrl()
        + "/main.aspx"
        + "?appid=" + appId
        + "&pagetype=webresource"
        + "&webresourceName=" + encodeURIComponent(webResourceName);

    // 別タブで開く
    window.open(url, "_blank");
}
