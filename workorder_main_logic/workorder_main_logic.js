function onLoadForm(context) {
    const formContext = context.getFormContext();

    const startdatetime = formContext.getAttribute("proto_actualstartdatetime")?.getValue();
    const enddatetime = formContext.getAttribute("proto_actualenddatetime")?.getValue();

    if (!startdatetime || !enddatetime) return;

    const diffHours = (enddatetime.getTime() - startdatetime.getTime()) / (1000 * 60 * 60);
    formContext.getAttribute("proto_worktime")?.setValue(diffHours);
}
