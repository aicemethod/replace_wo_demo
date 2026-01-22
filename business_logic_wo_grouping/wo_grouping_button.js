function updateProjectFromParent(primaryControl) {
    try {
        // 現在のフォーム（親 proto_workorder）
        var formContext = primaryControl;
        var currentProject = formContext.getAttribute("proto_project").getValue();

        if (!currentProject) {
            Xrm.Navigation.openAlertDialog({ text: "親のプロジェクトが未設定です。" });
            return;
        }

        // サブグリッド取得
        var subgrid = formContext.getControl("group_candidate_list_section");
        if (!subgrid) {
            Xrm.Navigation.openAlertDialog({ text: "サブグリッドが見つかりません。" });
            return;
        }

        var selectedItems = subgrid.getGrid().getSelectedRows();
        if (selectedItems.getLength() === 0) {
            Xrm.Navigation.openAlertDialog({ text: "サブグリッドでレコードを選択してください。" });
            return;
        }

        selectedItems.forEach(function (row) {
            var entity = row.getData().getEntity();
            var id = entity.getId().replace(/[{}]/g, "");
            var entityName = entity.getEntityName();

            var data = {
                "proto_project@odata.bind": "/proto_projects(" + currentProject[0].id.replace(/[{}]/g, "") + ")"
            };

            Xrm.WebApi.updateRecord(entityName, id, data).then(
                function success(result) {
                    console.log("Updated:", id);
                },
                function (error) {
                    console.error(error.message);
                }
            );
        });

        Xrm.Navigation.openAlertDialog({ text: "更新が完了しました。" });

    } catch (e) {
        console.error(e);
        Xrm.Navigation.openAlertDialog({ text: "エラーが発生しました：" + e.message });
    }
}

function showButtonCondition(primaryControl) {
    // 現在のセクションが group_candidate_list_section の場合のみ表示
    var section = primaryControl.getControl("group_candidate_list_section");
    return section && section.getVisible();
}
