async function copyWorkOrderInfo(primaryControl) {
    const SOURCE_ENTITY_LOGICAL_NAME = "proto_workorder";
    const SUB_STATUS_FIELD_LOGICAL_NAME = "proto_workordersubstatus";
    const SUB_STATUS_NAVIGATION_PROPERTY_NAME = "proto_workordersubstatus";
    const WO_TITLE_FIELD_LOGICAL_NAME = "proto_wotitle";
    const DEVICE_SEARCH_FIELD_LOGICAL_NAME = "proto_devicesearch";
    const DEVICE_SEARCH_NAVIGATION_PROPERTY_NAME = "proto_devicesearch";
    const PROGRESS_MESSAGE = "コピー中...";
    console.log("DEBUG");

    Xrm.Utility.showProgressIndicator(PROGRESS_MESSAGE);

    try {
        const getAttributeInfo = (logicalName) => {
            const attribute = Xrm?.Page?.getAttribute(logicalName);
            return {
                value: attribute ? attribute.getValue() : null,
                type: attribute ? attribute.getAttributeType() : null
            };
        };

        const subStatus = getAttributeInfo(SUB_STATUS_FIELD_LOGICAL_NAME);
        const woTitle = getAttributeInfo(WO_TITLE_FIELD_LOGICAL_NAME);
        const deviceSearch = getAttributeInfo(DEVICE_SEARCH_FIELD_LOGICAL_NAME);
        const createData = {};

        if (
            (subStatus.type === "lookup" ||
                subStatus.type === "customer" ||
                subStatus.type === "owner") &&
            Array.isArray(subStatus.value) &&
            subStatus.value.length > 0
        ) {
            const lookupValue = subStatus.value[0];
            const lookupEntityMetadata = await Xrm.Utility.getEntityMetadata(lookupValue.entityType);
            const lookupId = lookupValue.id.replace(/[{}]/g, "");

            createData[`${SUB_STATUS_NAVIGATION_PROPERTY_NAME}@odata.bind`] =
                `/${lookupEntityMetadata.EntitySetName}(${lookupId})`;
        } else if (subStatus.value !== null && subStatus.value !== undefined) {
            createData[SUB_STATUS_FIELD_LOGICAL_NAME] = subStatus.value;
        }

        if (woTitle.value !== null && woTitle.value !== undefined) {
            createData[WO_TITLE_FIELD_LOGICAL_NAME] = woTitle.value;
        }

        if (
            (deviceSearch.type === "lookup" ||
                deviceSearch.type === "customer" ||
                deviceSearch.type === "owner") &&
            Array.isArray(deviceSearch.value) &&
            deviceSearch.value.length > 0
        ) {
            const lookupValue = deviceSearch.value[0];
            const lookupEntityMetadata = await Xrm.Utility.getEntityMetadata(lookupValue.entityType);
            const lookupId = lookupValue.id.replace(/[{}]/g, "");

            createData[`${DEVICE_SEARCH_NAVIGATION_PROPERTY_NAME}@odata.bind`] =
                `/${lookupEntityMetadata.EntitySetName}(${lookupId})`;
        } else if (deviceSearch.value !== null && deviceSearch.value !== undefined) {
            createData[DEVICE_SEARCH_FIELD_LOGICAL_NAME] = deviceSearch.value;
        }

        const createResult = await Xrm.WebApi.createRecord(SOURCE_ENTITY_LOGICAL_NAME, createData);
        await Xrm.Navigation.openForm({
            entityName: SOURCE_ENTITY_LOGICAL_NAME,
            entityId: createResult.id
        });
    } catch (error) {
        Xrm.Navigation.openAlertDialog({
            title: "エラー",
            text: error && error.message ? error.message : "登録に失敗しました。"
        });
    } finally {
        Xrm.Utility.closeProgressIndicator();
    }
}
