/** proto_tcc_automatic_link_btn が true のとき承認種別・サイン受領日を非活性、false のとき活性 */
function applyAutomaticLinkFieldLock(formContext) {
    const autoAttr = formContext.getAttribute("proto_tcc_automatic_link_btn");
    if (!autoAttr) return;
    const lock = autoAttr.getValue() === true;
    const approvalCtrl = formContext.getControl("proto_customerapprovaltype");
    const signCtrl = formContext.getControl("proto_wo_customersignreceivedon");
    if (approvalCtrl) approvalCtrl.setDisabled(lock);
    if (signCtrl) signCtrl.setDisabled(lock);
}

/** フォームの OnLoad に登録（初回適用 + トグル変更時に再適用） */
function onCustomerApprovalFormLoad(context) {
    const formContext = context && context.getFormContext && context.getFormContext();
    if (!formContext) return;
    applyAutomaticLinkFieldLock(formContext);
    const autoAttr = formContext.getAttribute("proto_tcc_automatic_link_btn");
    if (autoAttr) {
        autoAttr.addOnChange(function () {
            applyAutomaticLinkFieldLock(formContext);
        });
    }
}

function setCustomerApprovalDate(context) {
    const formContext = context?.getFormContext?.();
    if (!formContext) return;

    const customerApprovalValue = formContext.getAttribute("proto_customerapprovaltype");
    if (customerApprovalValue === 931440001) {
        const attr = formContext.getAttribute("proto_wo_customersignreceivedon");
        if (attr) attr.setValue(new Date());
    }

}