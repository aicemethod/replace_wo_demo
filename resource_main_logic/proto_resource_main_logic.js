function onLoadForm(context) {
    console.log("RESOURCE DEBUG");

    const workOrderId = new URLSearchParams(parent.window.location.search)?.get("id")?.replace(/[{}]/g, "");
    if (!workOrderId) return;

    Xrm.WebApi.retrieveRecord(
        "proto_workorder",
        workOrderId,
        "?$select=proto_startdatetime,proto_enddatetime,proto_worktime,_proto_region_value"
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

        // proto_region の表示名（ラベル）を取得して判定
        const regionLabel = result["_proto_region_value@OData.Community.Display.V1.FormattedValue"];
        Xrm.Page.getControl("proto_tel_wo_so")?.setVisible(regionLabel === "EU");

    }).catch(function (error) {
        console.error("Failed to load proto_workorder fields.", error);
    });
}
