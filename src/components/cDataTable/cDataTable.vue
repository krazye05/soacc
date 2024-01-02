<style scoped lang="scss">
@import "./cDataTable.scss";
</style>
<template>
  <div
    :class="[
      'custom-table v-data-table',
      {
        'has-title': title !== '',
        'has-actionButton': actionButton,
        'has-generateReport': generateReport,
      },
    ]"
  >
    <headerTable
      :title="title"
      :dense="dense"
      :action-button="actionButton"
      :generate-report="generateReport"
      v-model="searchValue"
      v-model:model-value-export="dialog"
    />

    <div class="custom-table-container">
      <div class="custom-table-wrapper">
        <v-table
          :density="dense ? 'compact' : 'default'"
          :class="hover ? 'table-hover' : ''"
        >
          <thead>
            <tr>
              <th v-if="showSelect">
                <v-checkbox-btn
                  :disabled="filteredLists.length <= 0"
                  @click="selectAllMethod"
                  :model-value="checkSelectAllValue"
                  :indeterminate="checkSelectAllIndeterminate"
                />
              </th>
              <th
                v-for="header in headers"
                :key="'headerkey_' + header.text"
                class="text-left"
                :class="{
                  'v-data-table__th--sortable': sortAvailable(header),
                  'v-data-table__th--sorted': sortValue(header) !== null,
                }"
                @click="sortAvailable(header) ? onSort(header) : false"
              >
                <div
                  style="display: flex; align-items: center; position: relative"
                >
                  <div>
                    {{ header.text }}
                  </div>
                  <div class="sortIcon">
                    <cSort
                      v-if="sortAvailable(header)"
                      :type="sortValue(header)"
                    />
                  </div>
                  <div style="width: 40px">
                    <div
                      v-if="multiSort && sortIndex(header) >= 1"
                      class="v-data-table-header__sort-badge"
                    >
                      {{ sortIndex(header) }}
                    </div>
                  </div>
                </div>
              </th>
              <th v-if="slots.optionRow">Options</th>
            </tr>
          </thead>
          <tbody>
            <tr
              class="v-data-table-rows-no-data"
              v-if="listsPaginate.length === 0"
            >
              <td
                :colspan="
                  headers.length +
                  (showSelect ? 1 : 0) +
                  (slots.optionRow ? 1 : 0)
                "
              >
                No data available
              </td>
            </tr>

            <tr
              v-else
              v-for="(value, index) in listsPaginate"
              :key="'headerbodyrowitemkey_' + index"
            >
              <td :class="[loadRowOptionColor(value)]" v-if="showSelect">
                <div
                  :class="[
                    'td-overlay',
                    { 'has-color': loadRowOptionColor(value) || false },
                  ]"
                ></div>
                <v-checkbox-btn
                  :model-value="selectDataExist(value)"
                  @update:modelValue="clickRowCheckBox($event, value)"
                />
              </td>
              <td
                :class="[loadRowOptionColor(value)]"
                v-for="header in headers"
                :key="'headerkeybodyrow_' + header.text"
              >
                <div
                  :class="[
                    'td-overlay',
                    { 'has-color': loadRowOptionColor(value) || false },
                  ]"
                ></div>
                <label> {{ renderText(value, header) }}</label>
              </td>
              <td :class="[loadRowOptionColor(value)]" v-if="slots.optionRow">
                <div
                  :class="[
                    'td-overlay',
                    { 'has-color': loadRowOptionColor(value) || false },
                  ]"
                ></div>
                <slot name="optionRow" :value="value" />
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </div>
    <footerTable
      v-model:model-value-limit-rows="limitRows"
      v-model:model-value-page-index="pageIndex"
      :filtered-lists-length="filteredLists.length"
      :lists-paginate-length="listsPaginate.length"
      :items-length="items.length"
      :dense="dense"
      :show-first-last-buttons="showFirstLastButtons"
      :rows-per-page-option="rowsPerPageOption"
    />
    <reportTable
      v-if="generateReport"
      :headers="headers"
      :items="items"
      v-model="dialog"
      :work-sheet-name="workSheetName || title || 'Sheet 1'"
    />
  </div>
</template>

<script setup lang="ts">
import { IHeader, IRowsOptions, ISort } from "../cDataTable.interface";
import headerTable from "./includes/headerTable.vue";
import footerTable from "./includes/footerTable.vue";
import reportTable from "./includes/reportTable.vue";
import { computed, PropType, ref, useSlots } from "vue";
import cSort from "./cSort.vue";

import {
  headerTableProps,
  footerTableProps,
  styleProps,
  dataTableProps,
  reportProps,
} from "./tableProps";
defineOptions({
  inheritAttrs: false,
});
const emit = defineEmits(["update:modelValue"]);
const defProps = defineProps({
  ...headerTableProps,
  ...footerTableProps,
  ...dataTableProps,
  ...styleProps,
  ...reportProps,

  sort: {
    required: false,
    type: Boolean,
    default: true,
  },
  multiSort: {
    required: false,
    type: Boolean,
    default: false,
  },

  rowsOptions: Object as PropType<IRowsOptions>,
  showSelect: Boolean,
  showSelectKey: String,
  singleSelect: Boolean,
});

const limitRows = ref<number>(0),
  singleSort = ref<ISort | undefined>(),
  multiSortList = ref<Array<ISort>>([]),
  searchValue = ref<string>(""),
  pageIndex = ref<number>(1),
  selectData = ref<Array<any>>([]),
  dialog = ref(false);

const slots = useSlots();
const filteredLists = computed<Array<any>>(() => {
    const itemList = JSON.parse(JSON.stringify(defProps.items));
    if (itemList.length === 0) return itemList;
    const returnValue = itemList
      .map((item: any) => {
        return defProps.headers
          .map((header: any) => {
            const value =
              header.render !== undefined
                ? header.render(item, header)
                : item[header.value];
            return (
              (value || "")
                .toString()
                .toLowerCase()
                .indexOf(searchValue.value.toLowerCase()) > -1
            );
          })
          .includes(true) || searchValue.value === ""
          ? item
          : false;
      })
      .filter(Boolean);
    if (
      (defProps.sort && singleSort.value !== undefined) ||
      (defProps.multiSort && multiSortList.value.length > 0)
    )
      return sortData(
        returnValue,
        defProps.multiSort && multiSortList.value.length > 0
          ? multiSortList.value
          : singleSort.value === undefined
          ? []
          : [singleSort.value]
      );
    return returnValue;
  }),
  listsPaginate = computed(() => {
    const _filteredLists = JSON.parse(JSON.stringify(filteredLists.value));

    if (limitRows.value === -1) return _filteredLists;
    return _filteredLists.splice(
      (pageIndex.value - 1) * +limitRows.value,
      +limitRows.value
    );
  }),
  validateSelectAll = computed(() =>
    defProps.items.map((e: any) => selectDataExist(e))
  ),
  checkSelectAllIndeterminate = computed(
    () =>
      validateSelectAll.value.includes(true) &&
      validateSelectAll.value.includes(false)
  ),
  checkSelectAllValue = computed(
    () => !validateSelectAll.value.includes(false)
  );
const sortAvailable = (header: IHeader) =>
    header.sort === undefined
      ? defProps.multiSort || String(defProps.sort).toLowerCase() === "true"
      : header.sort,
  sortValue = (header: IHeader) => {
    const sortData = defProps.multiSort
      ? multiSortList.value.find((e) => e.value === header.value)
      : singleSort.value != undefined && singleSort.value.value === header.value
      ? singleSort.value
      : undefined;
    return sortData === undefined ? null : sortData.type;
  },
  onSort = (header: IHeader) => {
    if (defProps.multiSort) {
      const multiSortData = multiSortList.value.find(
        (e) => e.value === header.value
      );
      if (multiSortData === undefined)
        return multiSortList.value.push({ value: header.value, type: "ASC" });
      if (multiSortData.type === "DESC")
        multiSortList.value.splice(
          multiSortList.value.findIndex((e) => e.value == header.value),
          1
        );
      return (multiSortData.type =
        multiSortData.type === "ASC" ? "DESC" : "ASC");
    } else {
      if (singleSort.value !== undefined && singleSort.value.type === "DESC")
        return (singleSort.value = undefined);
      return (singleSort.value = {
        value: header.value,
        type:
          singleSort.value === undefined ||
          singleSort.value.type === null ||
          singleSort.value.value !== header.value
            ? "ASC"
            : singleSort.value.type === "ASC"
            ? "DESC"
            : null,
      });
    }
  },
  sortData = (data: any, sorts: any) => {
    return data.sort(function (a: any, b: any) {
      sorts.map((sort: any) => {
        sort.uniques = Array.from(
          new Set(data.map((obj: any) => obj[sort.value]))
        );
        sort.uniques = sort.uniques.sort((a: any, b: any) => {
          if (typeof a === "string") {
            return sort.type === "ASC"
              ? a.localeCompare(b)
              : b.localeCompare(a);
          } else if (typeof a === "number") {
            return sort.type === "ASC" ? a - b : b - a;
          } else if (typeof a === "boolean") {
            return sort.type === "ASC"
              ? a === b
                ? 0
                : a
                ? 1
                : -1
              : a === b
              ? 0
              : a
              ? -1
              : 1;
          }
          return 0;
        });
      });
      const weightOfObject = (obj: any) => {
        let weight = "";

        sorts.forEach((weightOfObjectsort: any) => {
          weight += weightOfObjectsort.uniques
            .indexOf(obj[weightOfObjectsort.value])
            .toString()
            .padStart(`${weightOfObjectsort.uniques.length}`.length, "0");
        });

        return weight;
      };
      return weightOfObject(a).localeCompare(weightOfObject(b));
    });
  },
  sortIndex = (header: IHeader) =>
    multiSortList.value.findIndex((e) => e.value === header.value) + 1,
  renderText = (value: any, header: IHeader) =>
    header.render !== undefined
      ? header.render(value, header)
      : value[header.value],
  loadRowOptionColor = (data: any) => {
    return defProps.rowsOptions?.color &&
      defProps.rowsOptions?.color(data) !== false
      ? "text-" + defProps.rowsOptions?.color(data)
      : "";
  },
  clickRowCheckBox = (status: boolean, data: any) => {
    if (status) selectData.value.push(data);
    else
      selectData.value.splice(
        selectData.value.findIndex(
          (e) => JSON.stringify(e) === JSON.stringify(data)
        ),
        1
      );
    emit("update:modelValue", selectData.value);
  },
  selectRowExist = (object1: any, object2: any) => {
    return defProps.showSelectKey
      ? object1[defProps.showSelectKey] === object2[defProps.showSelectKey]
      : JSON.stringify(object1) === JSON.stringify(object2);
  },
  selectDataExist = (data: any) => {
    return !!selectData.value.find((listsselectData: any) =>
      selectRowExist(listsselectData, data)
    );
  },
  selectAllMethod = () => {
    selectData.value = checkSelectAllValue.value ? [] : defProps.items.slice();
    emit("update:modelValue", selectData.value);
  },
  exportReport = async (e) => {
    // console.log(e);
    // if (type == "EXCEL") {
    // const users = [
    //   { id: 1, name: "John", phone: "123456789" },
    //   { id: 2, name: "Anne", phone: "987654321" },
    //   { id: 3, name: "Zack", phone: "123987456" },
    //   { id: 4, name: "Jill", phone: "456123789" },
    //   { id: 5, name: "Judy", phone: "789456123" },
    //   { id: 6, name: "Jenny", phone: "123789456" },
    //   { id: 7, name: "David", phone: "456789123" },
    // ];
    // const workbook = new Workbook();
    // const worksheet = workbook.addWorksheet("sheet");
    // worksheet.columns = [
    //   { key: "id", label: "ID" },
    //   { key: "name", label: "Name" },
    //   { key: "phone", label: "Phone" },
    // ].map((field) => ({
    //   header: field.label,
    //   key: field.key,
    // }));
    // worksheet.addRows(users);
    // const buffer = await workbook.xlsx.writeBuffer();
    // const blob = new Blob([buffer], { type: "text/xlsx" });
    // const link = document.createElement("a");
    // link.href = window.URL.createObjectURL(blob);
    // link.download = "Test.xlsx";
    // link.click();
  };
</script>
