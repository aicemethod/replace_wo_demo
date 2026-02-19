function onLoadForm(context) {
    const formContext = context.getFormContext();

    const startdatetime = formContext.getAttribute("proto_startdatetime")?.getValue();
    const enddatetime = formContext.getAttribute("proto_enddatetime")?.getValue();

    if (!startdatetime || !enddatetime) return;

    const diffMinutes = Math.round((enddatetime.getTime() - startdatetime.getTime()) / (1000 * 60));
    formContext.getAttribute("proto_worktime")?.setValue(diffMinutes);
}
