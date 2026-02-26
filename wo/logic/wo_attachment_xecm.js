(function () {
  "use strict";

  var SELECTABLE_TYPES = {
    TSR: true,
    "技術検収書(Technical Acceptance)": true,
    "Technical Acceptance": true
  };

  var ADD_MENU_OPTIONS = [
    { value: 931440001, label: "TSR" },
    { value: 931440002, label: "技術検収書(Technical Acceptance)" },
    { value: 931440003, label: "Technical Document" },
    { value: 931440000, label: "Other" }
  ];

  document.addEventListener("DOMContentLoaded", function () {
    var container = document.querySelector(".file-table-container");
    if (!container) {
      return;
    }

    var addButton = container.querySelector(".action-button-menu");
    var addMenu = container.querySelector(".filetable-add-menu");
    var saveButton = container.querySelector(".action-button-primary");
    var refreshButton = container.querySelector(".action-button-refresh");
    var dangerButton = container.querySelector(".action-button-danger");
    var tbody = container.querySelector(".file-table tbody");
    var addRow = tbody ? tbody.querySelector(".file-table-add-row") : null;
    var cardsContainer = container.querySelector(".file-cards");

    if (!addButton || !addMenu || !saveButton || !refreshButton || !dangerButton || !tbody || !addRow || !cardsContainer) {
      return;
    }

    var addRowFilenameInput = addRow.querySelector(".file-table-input");
    var addRowFileInput = addRow.querySelector(".file-table-file-input");
    var addRowAttachButton = addRow.querySelector(".file-table-attach-button");
    var addRowPreview = addRow.querySelector(".file-table-file-preview");
    var addRowTypeText = addRow.querySelector(".file-table-type-text");
    var addRowCreatedCell = addRow.querySelector(".col-created");
    var addRowSyncCell = addRow.querySelector(".col-sync");
    var addRowDeleteCheckbox = addRow.querySelector(".file-delete-checkbox input");
    var addRowSelectCheckbox = addRow.querySelector(".toggle-switch input");

    var state = {
      isAddMenuOpen: false,
      showAddRow: false,
      isRefreshing: false,
      isSaving: false,
      isDeleting: false,
      newFile: null,
      newFileType: "TSR",
      newFileTypeValue: 931440001
    };

    function getDataRows() {
      return Array.prototype.slice.call(tbody.querySelectorAll("tr")).filter(function (row) {
        return row !== addRow && !row.classList.contains("no-data-row");
      });
    }

    function getRowDeleteCheckbox(row) {
      return row.querySelector(".file-delete-checkbox input");
    }

    function getRowSelectCheckbox(row) {
      var labels = row.querySelectorAll(".toggle-switch input");
      return labels.length ? labels[0] : null;
    }

    function getDeleteSelectedRows() {
      return getDataRows().filter(function (row) {
        var checkbox = getRowDeleteCheckbox(row);
        return checkbox && checkbox.checked;
      });
    }

    function getSaveSelectedRows() {
      return getDataRows().filter(function (row) {
        var checkbox = getRowSelectCheckbox(row);
        return checkbox && checkbox.checked && !checkbox.disabled;
      });
    }

    function formatDate(date) {
      function pad(num) {
        return String(num).padStart(2, "0");
      }

      return (
        date.getFullYear() +
        "/" +
        pad(date.getMonth() + 1) +
        "/" +
        pad(date.getDate()) +
        " " +
        pad(date.getHours()) +
        ":" +
        pad(date.getMinutes())
      );
    }

    function ensureNoDataRow() {
      var noDataRow = tbody.querySelector(".no-data-row");
      var hasData = getDataRows().length > 0;

      if (!hasData && !state.showAddRow) {
        if (!noDataRow) {
          noDataRow = document.createElement("tr");
          noDataRow.className = "no-data-row";
          noDataRow.innerHTML = '<td colspan="6" class="no-data">データがありません</td>';
          tbody.appendChild(noDataRow);
        }
      } else if (noDataRow) {
        noDataRow.remove();
      }
    }

    function updateDangerButton() {
      var icon = dangerButton.querySelector(".action-button-icon");
      var label = dangerButton.querySelector("span:not(.action-button-icon)");
      if (state.showAddRow) {
        dangerButton.title = "キャンセル";
        if (icon) {
          icon.textContent = "✕";
        }
        if (label) {
          label.textContent = "キャンセル";
        }
        dangerButton.disabled = false;
      } else {
        dangerButton.title = "削除";
        if (icon) {
          icon.textContent = "🗑";
        }
        if (label) {
          label.textContent = "削除";
        }
        dangerButton.disabled = state.isDeleting || getDeleteSelectedRows().length === 0;
      }
    }

    function updateSaveButton() {
      if (state.showAddRow) {
        saveButton.disabled = state.isSaving || !state.newFile;
        return;
      }
      saveButton.disabled = state.isSaving || getSaveSelectedRows().length === 0;
    }

    function updateRefreshButton() {
      refreshButton.disabled = state.isRefreshing;
      var icon = refreshButton.querySelector(".action-button-icon");
      if (!icon) {
        return;
      }
      if (state.isRefreshing) {
        icon.classList.add("action-button-icon-spin");
      } else {
        icon.classList.remove("action-button-icon-spin");
      }
    }

    function updateButtons() {
      updateSaveButton();
      updateDangerButton();
      updateRefreshButton();
    }

    function closeAddMenu() {
      state.isAddMenuOpen = false;
      addButton.classList.remove("is-open");
      addMenu.hidden = true;
    }

    function openAddMenu() {
      var rect = addButton.getBoundingClientRect();
      addMenu.style.top = rect.bottom + 4 + "px";
      addMenu.style.left = rect.left + "px";
      addMenu.style.width = rect.width + "px";
      state.isAddMenuOpen = true;
      addButton.classList.add("is-open");
      addMenu.hidden = false;
    }

    function renderAddMenu() {
      addMenu.innerHTML = "";
      ADD_MENU_OPTIONS.forEach(function (option) {
        var item = document.createElement("div");
        item.className = "filetable-add-item";
        item.setAttribute("data-type-value", String(option.value));
        item.setAttribute("data-type-label", option.label);
        item.innerHTML = '<span class="action-button-icon">+</span><span></span>';
        item.querySelector("span:not(.action-button-icon)").textContent = option.label;
        addMenu.appendChild(item);
      });
      addMenu.hidden = true;
    }

    function resetAddRowFields() {
      state.newFile = null;
      state.newFileType = "TSR";
      state.newFileTypeValue = 931440001;
      if (addRowFilenameInput) {
        addRowFilenameInput.value = "";
      }
      if (addRowFileInput) {
        addRowFileInput.value = "";
      }
      if (addRowPreview) {
        addRowPreview.textContent = "";
        addRowPreview.hidden = true;
      }
      if (addRowTypeText) {
        addRowTypeText.textContent = state.newFileType;
      }
      if (addRowCreatedCell) {
        addRowCreatedCell.textContent = "-";
      }
      if (addRowSyncCell) {
        addRowSyncCell.textContent = "-";
      }
      if (addRowDeleteCheckbox) {
        addRowDeleteCheckbox.checked = false;
      }
      if (addRowSelectCheckbox) {
        addRowSelectCheckbox.checked = false;
      }
    }

    function showAddRow(typeLabel, typeValue) {
      state.showAddRow = true;
      state.newFileType = typeLabel;
      state.newFileTypeValue = typeValue;
      addRow.hidden = false;
      if (addRowTypeText) {
        addRowTypeText.textContent = typeLabel;
      }
      if (addRowFilenameInput) {
        addRowFilenameInput.focus();
      }
      ensureNoDataRow();
      updateButtons();
    }

    function hideAddRow() {
      state.showAddRow = false;
      addRow.hidden = true;
      resetAddRowFields();
      ensureNoDataRow();
      updateButtons();
    }

    function createFileRow(fileInfo) {
      var row = document.createElement("tr");
      var selectable = !!SELECTABLE_TYPES[fileInfo.type];
      row.innerHTML =
        '<td class="col-delete">' +
        '  <label class="file-delete-checkbox">' +
        '    <input type="checkbox">' +
        '    <span class="file-delete-checkbox-box"></span>' +
        "  </label>" +
        "</td>" +
        '<td class="col-select">' +
        '  <label class="toggle-switch' + (selectable ? "" : " toggle-switch-disabled") + '">' +
        '    <input type="checkbox"' + (selectable ? "" : " disabled") + ">" +
        '    <span class="toggle-slider"></span>' +
        "  </label>" +
        "</td>" +
        '<td class="col-filename">' +
        '  <button type="button" class="file-table-link"></button>' +
        "</td>" +
        '<td class="col-type"></td>' +
        '<td class="col-created"></td>' +
        '<td class="col-sync">-</td>';

      row.querySelector(".file-table-link").textContent = fileInfo.filename;
      row.querySelector(".col-type").textContent = fileInfo.type;
      row.querySelector(".col-created").textContent = fileInfo.created;

      return row;
    }

    function saveAddRow() {
      if (!state.newFile) {
        return;
      }

      state.isSaving = true;
      updateButtons();

      window.setTimeout(function () {
        var filename = addRowFilenameInput && addRowFilenameInput.value.trim()
          ? addRowFilenameInput.value.trim()
          : state.newFile.name;

        var newRow = createFileRow({
          filename: filename,
          type: state.newFileType,
          created: formatDate(new Date())
        });

        tbody.insertBefore(newRow, addRow.nextSibling);
        hideAddRow();
        state.isSaving = false;
        ensureNoDataRow();
        renderMobileCards();
        updateButtons();
      }, 250);
    }

    function saveSelectedRows() {
      var selectedRows = getSaveSelectedRows();
      if (selectedRows.length === 0) {
        return;
      }

      state.isSaving = true;
      updateButtons();

      selectedRows.forEach(function (row) {
        row.style.backgroundColor = "#f6fbff";
      });

      window.setTimeout(function () {
        selectedRows.forEach(function (row) {
          row.style.backgroundColor = "";
        });
        state.isSaving = false;
        updateButtons();
      }, 300);
    }

    function handleSave() {
      if (state.showAddRow) {
        saveAddRow();
        return;
      }
      saveSelectedRows();
    }

    function handleRefresh() {
      if (state.isRefreshing) {
        return;
      }
      state.isRefreshing = true;
      updateButtons();
      window.setTimeout(function () {
        state.isRefreshing = false;
        updateButtons();
        renderMobileCards();
      }, 500);
    }

    function handleDeleteOrCancel() {
      if (state.showAddRow) {
        hideAddRow();
        return;
      }

      if (state.isDeleting) {
        return;
      }

      var targetRows = getDeleteSelectedRows();
      if (targetRows.length === 0) {
        return;
      }

      state.isDeleting = true;
      updateButtons();

      window.setTimeout(function () {
        targetRows.forEach(function (row) {
          row.remove();
        });
        state.isDeleting = false;
        ensureNoDataRow();
        renderMobileCards();
        updateButtons();
      }, 250);
    }

    function handleFileSelection(file) {
      state.newFile = file || null;
      if (!addRowFilenameInput || !addRowPreview) {
        updateButtons();
        return;
      }

      if (state.newFile) {
        if (!addRowFilenameInput.value.trim()) {
          addRowFilenameInput.value = state.newFile.name;
        }
        addRowPreview.textContent = state.newFile.name;
        addRowPreview.hidden = false;
      } else {
        addRowPreview.textContent = "";
        addRowPreview.hidden = true;
      }
      updateButtons();
    }

    function renderMobileCards() {
      var rows = getDataRows();
      cardsContainer.innerHTML = "";

      if (rows.length === 0) {
        var noData = document.createElement("div");
        noData.className = "no-data";
        noData.textContent = "データがありません";
        cardsContainer.appendChild(noData);
        return;
      }

      rows.forEach(function (row, index) {
        var selectCheckbox = getRowSelectCheckbox(row);
        var filenameEl = row.querySelector(".col-filename .file-table-link");
        var filenameCell = row.querySelector(".col-filename");
        var typeCell = row.querySelector(".col-type");
        var createdCell = row.querySelector(".col-created");
        var syncCell = row.querySelector(".col-sync");

        var filename = filenameEl ? filenameEl.textContent : (filenameCell ? filenameCell.textContent : "");
        var type = typeCell ? typeCell.textContent : "-";
        var created = createdCell ? createdCell.textContent : "-";
        var sync = syncCell ? syncCell.textContent : "-";
        var checked = !!(selectCheckbox && selectCheckbox.checked);
        var disabled = !!(selectCheckbox && selectCheckbox.disabled);

        var card = document.createElement("div");
        card.className = "file-card" + (checked ? " selected" : "");
        card.setAttribute("data-row-index", String(index));

        card.innerHTML =
          '<div class="file-card-header">' +
          '  <label class="toggle-switch' + (disabled ? " toggle-switch-disabled" : "") + '">' +
          '    <input type="checkbox"' +
          (checked ? " checked" : "") +
          (disabled ? " disabled" : "") +
          ">" +
          '    <span class="toggle-slider"></span>' +
          "  </label>" +
          '  <div class="file-card-filename"></div>' +
          "</div>" +
          '<div class="file-card-body">' +
          '  <div class="file-card-row"><span class="file-card-label">種別:</span><span class="file-card-value"></span></div>' +
          '  <div class="file-card-row"><span class="file-card-label">作成日時:</span><span class="file-card-value"></span></div>' +
          '  <div class="file-card-row"><span class="file-card-label">同期:</span><span class="file-card-value"></span></div>' +
          "</div>";

        var cardValues = card.querySelectorAll(".file-card-value");
        card.querySelector(".file-card-filename").textContent = filename || "";
        if (cardValues[0]) {
          cardValues[0].textContent = type || "-";
        }
        if (cardValues[1]) {
          cardValues[1].textContent = created || "-";
        }
        if (cardValues[2]) {
          cardValues[2].textContent = sync || "-";
        }

        cardsContainer.appendChild(card);
      });
    }

    function syncCardSelectionToTable(cardCheckbox) {
      var card = cardCheckbox.closest(".file-card");
      if (!card) {
        return;
      }
      var rowIndex = Number(card.getAttribute("data-row-index"));
      var rows = getDataRows();
      var row = rows[rowIndex];
      if (!row) {
        return;
      }
      var tableCheckbox = getRowSelectCheckbox(row);
      if (!tableCheckbox || tableCheckbox.disabled) {
        cardCheckbox.checked = !!(tableCheckbox && tableCheckbox.checked);
        return;
      }
      tableCheckbox.checked = cardCheckbox.checked;
      card.classList.toggle("selected", cardCheckbox.checked);
      updateButtons();
    }

    function handleTableChange(event) {
      var target = event.target;
      if (!(target instanceof HTMLInputElement)) {
        return;
      }

      if (target === addRowFileInput && target.type === "file") {
        handleFileSelection(target.files && target.files[0] ? target.files[0] : null);
        return;
      }

      if (target === addRowFilenameInput) {
        return;
      }

      if (target.closest(".file-table-add-row")) {
        return;
      }

      renderMobileCards();
      updateButtons();
    }

    function handleTableClick(event) {
      var target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      var addMenuItem = target.closest(".filetable-add-item");
      if (addMenuItem) {
        var typeLabel = addMenuItem.getAttribute("data-type-label") || "TSR";
        var typeValue = Number(addMenuItem.getAttribute("data-type-value") || "931440001");
        closeAddMenu();
        resetAddRowFields();
        showAddRow(typeLabel, typeValue);
        return;
      }

      if (target.closest(".file-table-attach-button")) {
        if (addRowFileInput) {
          addRowFileInput.click();
        }
        return;
      }

      var fileLink = target.closest(".file-table-link");
      if (fileLink) {
        event.preventDefault();
        window.alert("ダウンロード処理は未接続です。");
      }
    }

    function handleDocumentClick(event) {
      var target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      if (!state.isAddMenuOpen) {
        return;
      }
      if (!target.closest(".filetable-add-dropdown") && !target.closest(".filetable-add-menu")) {
        closeAddMenu();
      }
    }

    function init() {
      renderAddMenu();
      resetAddRowFields();
      addRow.hidden = true;
      ensureNoDataRow();

      addButton.addEventListener("click", function () {
        if (state.isAddMenuOpen) {
          closeAddMenu();
        } else {
          openAddMenu();
        }
      });

      saveButton.addEventListener("click", handleSave);
      refreshButton.addEventListener("click", handleRefresh);
      dangerButton.addEventListener("click", handleDeleteOrCancel);

      if (addRowAttachButton && addRowFileInput) {
        addRowAttachButton.addEventListener("click", function () {
          addRowFileInput.click();
        });
      }

      if (addRowFileInput) {
        addRowFileInput.addEventListener("change", function () {
          handleFileSelection(addRowFileInput.files && addRowFileInput.files[0] ? addRowFileInput.files[0] : null);
        });
      }

      if (addRowFilenameInput) {
        addRowFilenameInput.addEventListener("input", function () {
          updateButtons();
        });
      }

      tbody.addEventListener("change", handleTableChange);
      container.addEventListener("click", handleTableClick);
      document.addEventListener("click", handleDocumentClick);

      cardsContainer.addEventListener("change", function (event) {
        var target = event.target;
        if (!(target instanceof HTMLInputElement)) {
          return;
        }
        if (!target.closest(".file-card")) {
          return;
        }
        syncCardSelectionToTable(target);
        renderMobileCards();
      });

      renderMobileCards();
      updateButtons();
    }

    init();
  });
})();
