async function copyWorkOrderInfo(primaryControl) {
    const SOURCE_ENTITY_LOGICAL_NAME = "proto_workorder";
    const SUB_STATUS_FIELD_LOGICAL_NAME = "proto_workordersubstatus";
    const SUB_STATUS_NAVIGATION_PROPERTY_NAME = "proto_workordersubstatus";
    const WO_TITLE_FIELD_LOGICAL_NAME = "proto_wotitle";
    const DEVICE_SEARCH_FIELD_LOGICAL_NAME = "proto_devicesearch";
    const DEVICE_SEARCH_NAVIGATION_PROPERTY_NAME = "proto_devicesearch";
    const PROGRESS_MESSAGE = "登録中...";
    console.log("DEBUG");

    Xrm.Utility.showProgressIndicator(PROGRESS_MESSAGE);

    try {
        const subStatusAttribute = Xrm?.Page?.getAttribute(SUB_STATUS_FIELD_LOGICAL_NAME);
        const subStatusValue = subStatusAttribute ? subStatusAttribute.getValue() : null;
        const subStatusAttributeType = subStatusAttribute ? subStatusAttribute.getAttributeType() : null;
        const woTitleAttribute = Xrm?.Page?.getAttribute(WO_TITLE_FIELD_LOGICAL_NAME);
        const woTitleValue = woTitleAttribute ? woTitleAttribute.getValue() : null;
        const deviceSearchAttribute = Xrm?.Page?.getAttribute(DEVICE_SEARCH_FIELD_LOGICAL_NAME);
        const deviceSearchValue = deviceSearchAttribute ? deviceSearchAttribute.getValue() : null;
        const deviceSearchAttributeType = deviceSearchAttribute ? deviceSearchAttribute.getAttributeType() : null;
        const createData = {};

        if (
            (subStatusAttributeType === "lookup" ||
                subStatusAttributeType === "customer" ||
                subStatusAttributeType === "owner") &&
            Array.isArray(subStatusValue) &&
            subStatusValue.length > 0
        ) {
            const lookupValue = subStatusValue[0];
            const lookupEntityMetadata = await Xrm.Utility.getEntityMetadata(lookupValue.entityType);
            const lookupId = lookupValue.id.replace(/[{}]/g, "");

            createData[`${SUB_STATUS_NAVIGATION_PROPERTY_NAME}@odata.bind`] =
                `/${lookupEntityMetadata.EntitySetName}(${lookupId})`;
        } else if (subStatusValue !== null && subStatusValue !== undefined) {
            createData[SUB_STATUS_FIELD_LOGICAL_NAME] = subStatusValue;
        }

        if (woTitleValue !== null && woTitleValue !== undefined) {
            createData[WO_TITLE_FIELD_LOGICAL_NAME] = woTitleValue;
        }

        if (
            (deviceSearchAttributeType === "lookup" ||
                deviceSearchAttributeType === "customer" ||
                deviceSearchAttributeType === "owner") &&
            Array.isArray(deviceSearchValue) &&
            deviceSearchValue.length > 0
        ) {
            const lookupValue = deviceSearchValue[0];
            const lookupEntityMetadata = await Xrm.Utility.getEntityMetadata(lookupValue.entityType);
            const lookupId = lookupValue.id.replace(/[{}]/g, "");

            createData[`${DEVICE_SEARCH_NAVIGATION_PROPERTY_NAME}@odata.bind`] =
                `/${lookupEntityMetadata.EntitySetName}(${lookupId})`;
        } else if (deviceSearchValue !== null && deviceSearchValue !== undefined) {
            createData[DEVICE_SEARCH_FIELD_LOGICAL_NAME] = deviceSearchValue;
        }

        await Xrm.WebApi.createRecord(SOURCE_ENTITY_LOGICAL_NAME, createData);
    } catch (error) {
        Xrm.Navigation.openAlertDialog({
            title: "エラー",
            text: error && error.message ? error.message : "登録に失敗しました。"
        });
    } finally {
        Xrm.Utility.closeProgressIndicator();
    }
}
