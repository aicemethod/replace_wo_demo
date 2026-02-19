function onLoadForm(context) {
    console.log("RESOURCE DEBUG");

    // 現在表示しているワークオーダのIDをURLから取得
    const workOrderId = new URLSearchParams(parent.window.location.search)?.get("id")?.replace(/[{}]/g, "");
    if (!workOrderId) return;

    Xrm.WebApi.retrieveRecord(
        "proto_workorder",
        workOrderId,
        "?$select=proto_startdatetime,proto_enddatetime,proto_worktime"
    ).then(function (result) {
        Xrm.Page.getAttribute("proto_startdatetime")?.setValue(
            result.proto_startdatetime ? new Date(result.proto_startdatetime) : null
        );
        Xrm.Page.getAttribute("proto_enddatetime")?.setValue(
            result.proto_enddatetime ? new Date(result.proto_enddatetime) : null
        );
        Xrm.Page.getAttribute("proto_worktime")?.setValue(
            result.proto_worktime ?? null
        );
    }).catch(function (error) {
        console.error("Failed to load proto_workorder datetime fields.", error);
    });
}
