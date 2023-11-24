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
    <div class="table-title pb-5">
      <div style="align-items: center; display: flex" v-if="title !== ''">
        <div class="text-h6 text-title">
          <v-icon class="title-icon" size="28">mdi-bookmark</v-icon>
          {{ title }}
        </div>
        <!-- </div> -->
      </div>
      <div class="searchTable">
        <v-text-field
          :density="dense ? 'compact' : 'default'"
          color="info"
          variant="outlined"
          label="Search"
          append-inner-icon="mdi-magnify"
          hide-details
          v-model="searchValue"
        ></v-text-field>
      </div>
      <div
        v-if="actionButton || generateReport"
        style="align-items: center; display: flex"
      >
        <div class="actionReportButton">
          <div>
            <v-btn
              block
              :disabled="checkActionButtonDisabled"
              :loading="checkActionButtonLoading"
              v-if="actionButton && typeof actionButton?.action === 'function'"
              @click="actionButton.action()"
              color="primary"
              :text="actionButton.title"
            />

            <v-menu
              v-if="actionButton && typeof actionButton?.action !== 'function'"
            >
              <template v-slot:activator="{ isActive, props }">
                <v-btn color="primary" v-bind="props">
                  {{ actionButton.title }}
                  <template v-slot:append>
                    <v-icon
                      :style="[
                        'transition: .2s cubic-bezier(.4,0,.2,1) background-color 90ms 0ms cubic-bezier(0.4, 0, 0.6, 1)',

                        { transform: isActive ? 'rotate(180deg)' : '' },
                      ]"
                    >
                      mdi-menu-down
                    </v-icon>
                  </template>
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="actionButtonList in actionButton.action"
                  @click="actionButtonList.action()"
                >
                  <v-list-item-title style="text-align: center">
                    {{ actionButtonList.title }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
          <div>
            <v-btn
              block
              :disabled="checkActionButtonDisabled"
              :loading="checkActionButtonLoading"
              v-if="generateReport"
              @click="clickGenerateReport"
              color="warning"
              text="Export"
            />
          </div>
        </div>
      </div>
    </div>
    <!-- <v-checkbox-btn class="pe-2"></v-checkbox-btn> -->
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
                ></v-checkbox-btn>
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
                ></v-checkbox-btn>
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
    <div class="v-data-table-footer">
      <div class="v-data-table-footer__items-per-page">
        <JsonExcel
          class="btn btn-default"
          :data="items"
          :fields="headerExportFile"
          type="xlsx"
          worksheet="My Worksheet"
          name="filename.xlsx"
          title="Excel"
        >
          Excel
        </JsonExcel>
        <span>Items per page:</span>
        <v-select
          @update:modelValue="pageIndex = 1"
          :items="getRowPages"
          v-model="vModelLimitRow"
          variant="outlined"
          :density="dense ? 'compact' : 'default'"
          hide-details
        ></v-select>
      </div>
      <div class="v-data-table-footer__info">
        <div>{{ pageInfo }}</div>
      </div>
      <div class="v-data-table-footer__pagination" style="gap: 5px">
        <v-btn
          variant="plain"
          v-if="showFirstLastButtons"
          :disabled="pageIndex == 1"
          @click="onTogglePage('first')"
          icon="mdi-page-first"
          :size="dense ? 'small' : 'default'"
          elevation="0"
        >
        </v-btn>
        <v-btn
          variant="plain"
          :disabled="pageIndex == 1"
          @click="onTogglePage('previous')"
          icon="mdi-chevron-left"
          :size="dense ? 'small' : 'default'"
          elevation="0"
        >
        </v-btn>
        <v-btn
          variant="plain"
          :disabled="statusNextLastPage"
          @click="onTogglePage('next')"
          icon="mdi-chevron-right"
          :size="dense ? 'small' : 'default'"
          elevation="0"
        >
        </v-btn>
        <v-btn
          variant="plain"
          v-if="showFirstLastButtons"
          :disabled="statusNextLastPage"
          @click="onTogglePage('last')"
          icon="mdi-page-last"
          :size="dense ? 'small' : 'default'"
          elevation="0"
        >
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  IHeader,
  IRowsOptions,
  IRowsPerPageOption,
  ISort,
} from "../cDataTable.interface";
import { computed, PropType, Ref, ref, useSlots } from "vue";
import cSort from "./cSort.vue";
import JsonExcel from "vue-json-excel3";
const emit = defineEmits(["update:modelValue"]);
const defProps = defineProps({
  title: {
    required: false,
    type: [String, Number],
    default: "",
  },
  showFirstLastButtons: {
    required: false,
    type: Boolean,
    default: true,
  },
  dense: {
    required: false,
    type: Boolean,
    default: false,
  },
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
  hover: {
    required: false,
    type: [Boolean, String],
    default: false,
  },
  headers: {
    required: true,
    type: Array as PropType<IHeader[]>,
  },
  items: {
    required: true,
    type: Array as PropType<Array<any>>,
    default: [],
  },
  rowsPerPageOption: {
    required: false,
    type: Object as PropType<IRowsPerPageOption>,
    default: {
      all: true,
      rowPages: [5, 10, 25, 50, 100],
      rowPageIndex: -1,
    },
  },
  rowsOptions: Object as PropType<IRowsOptions>,
  actionButton: Object as PropType<{
    title: string;
    action:
      | Function
      | {
          title: string;
          action: Function;
          loading?: boolean | Ref;
          disabled?: boolean | Ref;
        }[];
    loading?: boolean | Ref;
    disabled?: boolean | Ref;
  }>,
  generateReport: Boolean,
  showSelect: Boolean,
  showSelectKey: String,
  singleSelect: Boolean,
});

const limitRows = ref<number>(0),
  singleSort = ref<ISort | undefined>(),
  multiSortList = ref<Array<ISort>>([]),
  searchValue = ref<string>(""),
  pageIndex = ref<number>(1),
  dataRowsPerPageOption = ref<IRowsPerPageOption>(),
  selectData = ref<Array<any>>([]);

dataRowsPerPageOption.value = {
  all:
    defProps.rowsPerPageOption.all === undefined
      ? true
      : defProps.rowsPerPageOption.all,
  rowPages: defProps.rowsPerPageOption.rowPages || [5, 10, 25, 50, 100],
  rowPageIndex:
    defProps.rowsPerPageOption.rowPageIndex === undefined
      ? -1
      : defProps.rowsPerPageOption.rowPageIndex,
};

limitRows.value = (() => {
  const rowsPerPage =
      dataRowsPerPageOption.value.rowPages === undefined
        ? []
        : dataRowsPerPageOption.value.rowPages,
    rowPageIndex =
      dataRowsPerPageOption.value.rowPageIndex === undefined
        ? -1
        : dataRowsPerPageOption.value.rowPageIndex;

  return rowPageIndex < 0 && dataRowsPerPageOption.value.all
    ? -1
    : rowsPerPage[rowsPerPage.length - 1 < rowPageIndex ? 0 : rowPageIndex];
})();
const slots = useSlots();
const getRowPages = computed(() => [
    ...(dataRowsPerPageOption.value?.rowPages === undefined
      ? []
      : dataRowsPerPageOption.value?.rowPages),
    ...[!dataRowsPerPageOption.value?.all || "All"].filter(Boolean),
  ]),
  checkActionButtonLoading = computed(() => {
    if (defProps.actionButton?.loading === undefined) return false;
    return typeof defProps.actionButton.loading === "object"
      ? defProps.actionButton.loading.value
      : defProps.actionButton.loading;
  }),
  checkActionButtonDisabled = computed(() => {
    if (defProps.actionButton?.disabled === undefined) return false;
    return typeof defProps.actionButton.disabled === "object"
      ? defProps.actionButton.disabled.value
      : defProps.actionButton.disabled;
  }),
  vModelLimitRow = computed({
    get() {
      return limitRows.value === -1 ? "All" : limitRows.value;
    },
    set(newValue: number | "All") {
      limitRows.value = newValue === "All" ? -1 : newValue;
    },
  }),
  statusNextLastPage = computed(
    () =>
      limitRows.value === -1 ||
      filteredLists.value.length - +limitRows.value * pageIndex.value < 1
  ),
  filteredLists = computed<Array<any>>(() => {
    const itemList = JSON.parse(JSON.stringify(defProps.items));
    if (itemList.length === 0) return itemList;
    if (
      (defProps.sort && singleSort !== undefined) ||
      (defProps.multiSort && multiSortList.value.length > 0)
    )
      sortData(
        itemList,
        defProps.multiSort && multiSortList.value.length > 0
          ? multiSortList.value
          : singleSort.value === undefined
          ? []
          : [singleSort.value]
      );

    return itemList
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
  }),
  listsPaginate = computed(() => {
    const _filteredLists = JSON.parse(JSON.stringify(filteredLists.value));

    if (limitRows.value === -1) return _filteredLists;
    return _filteredLists.splice(
      (pageIndex.value - 1) * +limitRows.value,
      +limitRows.value
    );
  }),
  pageInfo = computed(() => {
    const previousTotalList = +limitRows.value * (pageIndex.value - 1);
    return filteredLists.value.length <= 0
      ? "-"
      : previousTotalList +
          1 +
          "-" +
          (previousTotalList + listsPaginate.value.length) +
          " of " +
          filteredLists.value.length;
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
  ),
  headerExportFile = computed(() => {
    return defProps.headers.reduce((accumulator, value) => {
      return { ...accumulator, [value.text]: value.value };
    }, {});
  });
const sortAvailable = (header: IHeader) =>
    header.sort === undefined
      ? defProps.multiSort || String(defProps.sort).toLowerCase() === "true"
      : header.sort,
  clickGenerateReport = () => {},
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
  onTogglePage = (pageNumber: "next" | "previous" | "first" | "last") => {
    if (defProps.showFirstLastButtons) {
      if (pageNumber === "first") pageIndex.value = 1;
      if (pageNumber === "last")
        pageIndex.value = Math.ceil(defProps.items.length / +limitRows.value);
    }
    if (pageNumber === "next") pageIndex.value += 1;
    if (pageNumber === "previous") pageIndex.value -= 1;
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
  };
</script>
