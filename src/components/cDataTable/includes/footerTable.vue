<style lang="scss">
.v-data-table-footer {
  padding: 0.625rem 1rem;
}
</style>
<template>
  <div class="v-data-table-footer">
    <div class="v-data-table-footer__items-per-page">
      <span>Items per page:</span>
      <v-select
        :items="getRowPages"
        v-model="vModelLimitRow"
        variant="outlined"
        :density="dense ? 'compact' : 'default'"
        hide-details
      />
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
</template>
<script setup lang="ts">
import { PropType, computed, ref } from "vue";
import { footerTableProps, styleProps } from "../tableProps";
import { IRowsPerPageOption } from "@/components/cDataTable.interface";

const defProps = defineProps({
  ...footerTableProps,
  ...styleProps,
  filteredListsLength: { type: Number, default: 0, required: true },
  listsPaginateLength: { type: Number, default: 0, required: true },
  itemsLength: { type: Number, default: 0, required: true },

  modelValuePageIndex: Number,
  modelValueLimitRows: Number,
});

const limitRows = ref<number>(0),
  pageIndex = ref<number>(1),
  dataRowsPerPageOption = ref<IRowsPerPageOption>({
    all:
      defProps.rowsPerPageOption.all === undefined
        ? true
        : defProps.rowsPerPageOption.all,
    rowPages: defProps.rowsPerPageOption.rowPages || [5, 10, 25, 50, 100],
    rowPageIndex:
      defProps.rowsPerPageOption.rowPageIndex === undefined
        ? -1
        : defProps.rowsPerPageOption.rowPageIndex,
  });

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

const emit = defineEmits([
  "update:modelValuePageIndex",
  "update:modelValueLimitRows",
]);
emit("update:modelValueLimitRows", limitRows.value);
const getRowPages = computed(() => [
    ...(dataRowsPerPageOption.value?.rowPages === undefined
      ? []
      : dataRowsPerPageOption.value?.rowPages),
    ...[!dataRowsPerPageOption.value?.all || "All"].filter(Boolean),
  ]),
  vModelLimitRow = computed({
    get() {
      return limitRows.value === -1 ? "All" : limitRows.value;
    },
    set(newValue: number | "All") {
      limitRows.value = newValue === "All" ? -1 : newValue;
      pageIndex.value = 1;
      emit("update:modelValuePageIndex", pageIndex.value);
      emit("update:modelValueLimitRows", limitRows.value);
    },
  }),
  statusNextLastPage = computed(
    () =>
      limitRows.value === -1 ||
      defProps.filteredListsLength - +limitRows.value * pageIndex.value < 1
  ),
  pageInfo = computed(() => {
    const previousTotalList = +limitRows.value * (pageIndex.value - 1);
    return defProps.filteredListsLength <= 0
      ? "-"
      : previousTotalList +
          1 +
          "-" +
          (previousTotalList + defProps.listsPaginateLength) +
          " of " +
          defProps.filteredListsLength;
  });
const onTogglePage = (pageNumber: "next" | "previous" | "first" | "last") => {
  //   if (defProps.showFirstLastButtons) {
  if (pageNumber === "first") pageIndex.value = 1;
  if (pageNumber === "last")
    pageIndex.value = Math.ceil(defProps.itemsLength / +limitRows.value);
  //   }
  if (pageNumber === "next") pageIndex.value += 1;
  if (pageNumber === "previous") pageIndex.value -= 1;
  emit("update:modelValuePageIndex", pageIndex.value);
};
//   pageIndexUpdate = () => {};
</script>
../tableProps
