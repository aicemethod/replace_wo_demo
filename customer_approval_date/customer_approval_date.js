function setCustomerApprovalDate(context) {
    const formContext = context?.getFormContext?.();
    if (!formContext) return;

    const customerApprovalValue = formContext.getAttribute("proto_customerapprovaltype");
    if (customerApprovalValue === 931440001) {
        const attr = formContext.getAttribute("proto_wo_customersignreceivedon");
        if (attr) attr.setValue(new Date());
    }

}