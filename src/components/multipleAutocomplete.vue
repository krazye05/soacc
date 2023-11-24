<style lang="scss">
.vnAutoCompleteVList {
  .v-list {
    padding: 0px !important;
    padding-bottom: 8px !important;
    > .v-list-item:first-child {
      margin-top: 8px;
    }
  }
}
</style>

<template>
  <v-autocomplete
    v-resize="initializeItems"
    multiple
    variant="outlined"
    density="compact"
    :clearable="defProps.clearable"
    :label="label"
    :items="items"
    :disabled="disabled"
    v-model="autoCompleteModel"
    @update:modelValue="
      emit('update:modelValue', autoCompleteModel), setDefaultState()
    "
    :item-title="
      (e) =>
        typeof itemTitle === 'function' ? itemTitle(e) : e[itemTitle || '']
    "
    :item-value="
      (e) =>
        itemValue
          ? typeof itemValue === 'function'
            ? itemValue(e)
            : e[itemValue || '']
          : e
    "
    :persistent-hint="persistentHint"
    :hint="hint"
    :color="color"
    @update:search="autoCompleteSearch = $event"
    @update:focused="autoCompleteFocus"
    :menu-props="{ contentClass: 'vnAutoCompleteVList' }"
    class="vnAutoComplete"
  >
    <template v-slot:selection="{ item, index }">
      <template v-if="!fitItems || index <= maxIndex">
        <v-chip
          size="small"
          v-if="chips"
          :closable="closableChips"
          @click:close="removeData(item.value)"
        >
          <span>{{ getValueUsed(item.value) }}</span>
        </v-chip>
        <span v-else>{{
          getValueUsed(item.value) +
          (index + 1 === autoCompleteModel.length ? "" : ",")
        }}</span>
      </template>
      <v-tooltip
        v-if="fitItems && showOthersDetail && index === maxIndex"
        location="bottom"
      >
        <template v-slot:activator="{ props }">
          <span
            style="padding-left: 2px"
            v-bind="props"
            v-if="showOthersDetail && index === maxIndex"
            class="text-grey text-caption align-self-center"
          >
            (+{{ totalNotShowingLists }} others)
          </span>
        </template>
        <span>{{ getFilteredList }}</span>
      </v-tooltip>
    </template>
    <template v-slot:prepend-item v-if="selectAll && filteredItems.length > 1">
      <div
        style="
          position: sticky;
          top: 0;
          background-color: RGBA(var(--v-theme-surface));
          z-index: 11111;
          padding-top: 8px;
        "
      >
        <v-list-item title="Select All" @click="selectAllMethod()">
          <template v-slot:prepend>
            <v-list-item-action start>
              <v-checkbox-btn
                :color="color"
                :model-value="checkSelectAllValue"
                :indeterminate="checkSelectAllIndeterminate"
              ></v-checkbox-btn>
            </v-list-item-action>
          </template>
        </v-list-item>

        <v-divider class="my-2"></v-divider>
      </div>
    </template>
    <template v-slot:item="{ props, item }">
      <v-list-item v-bind="props" :title="getValueUsed(item.value)">
        <template v-slot:prepend="{ isActive }">
          <v-list-item-action start>
            <v-checkbox-btn
              :model-value="isActive"
              :color="color"
            ></v-checkbox-btn>
          </v-list-item-action>
        </template>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>
<script lang="ts" setup>
import { computed, PropType, ref, watch } from "vue";

const defProps = defineProps({
  modelValue: Array as PropType<Array<any>>,
  itemTitle: [String, Function],
  itemValue: [String, Function],
  label: String,
  clearable: Boolean,
  items: {
    type: Array as PropType<Array<any>>,
    default: [],
  },
  disabled: Boolean,
  persistentHint: Boolean,
  hint: String,
  color: String,
  fitItems: Boolean,
  chips: Boolean,
  closableChips: Boolean,
  selectAll: Boolean,
});

const maxIndex = ref(0),
  showOthersDetail = ref(false);
const autoCompleteModel = ref<any[]>([]),
  autoCompleteSearch = ref("");

const filteredItems = computed(() =>
    defProps.items
      .map((e) => {
        return (
          (getValueUsed(e)
            .toString()
            .toLowerCase()
            .indexOf(autoCompleteSearch.value || "") > -1 &&
            e) ||
          false
        );
      })
      .filter(Boolean)
  ),
  validateSelectAll = computed(() =>
    filteredItems.value.map(
      (e: any) =>
        !!autoCompleteModel.value.find((autoCompleteModelData) =>
          findAutoCompleteModelExist(autoCompleteModelData, getValueUsed(e))
        )
    )
  ),
  checkSelectAllIndeterminate = computed(
    () =>
      validateSelectAll.value.includes(true) &&
      validateSelectAll.value.includes(false)
  ),
  checkSelectAllValue = computed(
    () => !validateSelectAll.value.includes(false)
  ),
  totalNotShowingLists = computed(
    () => autoCompleteModel.value.length - maxIndex.value - 1
  ),
  getFilteredList = computed(() =>
    autoCompleteModel.value
      .slice(maxIndex.value + 1)
      .map((e) => getValueUsed(e))
      .join(", ")
  );

const emit = defineEmits(["update:modelValue"]);

const selectAllMethod = () => {
    if (checkSelectAllValue.value)
      filteredItems.value.forEach((e: any) => {
        removeData(e);
      });
    else
      autoCompleteModel.value = [
        ...autoCompleteModel.value,
        ...filteredItems.value
          .map((e: any) => {
            const findData = autoCompleteModel.value.find(
              (autoCompleteModelData) =>
                findAutoCompleteModelExist(
                  autoCompleteModelData,
                  getValueUsed(e)
                )
            );

            return findData ? false : e;
          })
          .filter(Boolean),
      ];
    emit("update:modelValue", autoCompleteModel.value);
  },
  getValueUsed = (data: any): string => {
    if (typeof data === "string") return data;
    const valueUsed = defProps.itemValue || defProps.itemTitle;
    return (
      (typeof valueUsed === "function"
        ? valueUsed(data)
        : data[valueUsed || ""]) || ""
    );
  },
  findAutoCompleteModelExist = (
    autoCompleteModelData: any,
    compareValue: string
  ) => getValueUsed(autoCompleteModelData) === compareValue,
  removeData = (data: any) => {
    autoCompleteModel.value.splice(
      autoCompleteModel.value.findIndex((autoCompleteModelData) =>
        findAutoCompleteModelExist(autoCompleteModelData, getValueUsed(data))
      ),
      1
    );
  },
  setDefaultState = () => {
    maxIndex.value = defProps.items.length;
    showOthersDetail.value = false;
    const selectionList = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".vnAutoComplete .v-field__input .v-autocomplete__selection"
      )
    );

    selectionList.forEach((e: HTMLElement) => {
      e.style.display = "";
    });
  };
let timerInitializeItems: any = null;
const autoCompleteFocus = (e: boolean) => {
    if (defProps.fitItems) setDefaultState();
    if (!e) initializeItems();
  },
  initializeItems = () => {
    if (autoCompleteModel.value.length > 0 && defProps.fitItems) {
      if (timerInitializeItems != null) clearTimeout(timerInitializeItems);
      timerInitializeItems = setTimeout(() => {
        const selectionList = Array.from(
          document.querySelectorAll<HTMLElement>(
            ".vnAutoComplete .v-field__input .v-autocomplete__selection"
          )
        );
        const createChipMethod = (text: string) => {
            const chipParent = document.createElement("div"),
              childchipTonal = document.createElement("span"),
              childText = document.createElement("span"),
              childChipCloseParent = document.createElement("div"),
              childChipCloseIcon = document.createElement("i");

            childChipCloseIcon.className =
              "mdi-close-circle mdi v-icon notranslate v-icon--size-x-small";

            childText.innerHTML = text;
            childChipCloseParent.classList.add("v-chip__close");
            childChipCloseParent.appendChild(childChipCloseIcon);

            childchipTonal.classList.add("v-chip__underlay");
            chipParent.className =
              "v-chip v-chip--density-default v-chip--size-small v-chip--variant-tonal";
            chipParent.append(childchipTonal, childText, childChipCloseParent);
            return chipParent;
          },
          addElement = (element: HTMLElement) => {
            element.style.opacity = "0";
            element.style.position = "fixed";

            document.querySelector("#app .v-application")!.appendChild(element);
          };
        const createOtherDetails = document.createElement("span");
        createOtherDetails.className =
          "text-grey text-caption align-self-center";
        addElement(createOtherDetails);
        const returnValue = {
          width: 0,
          index: 0,
          showOthersDetail: false,
        };
        const vnAutocompleteWidth =
          document.querySelector<HTMLElement>(
            ".vnAutoComplete .v-field__input"
          )!.offsetWidth - 22;
        for (const [i, value] of autoCompleteModel.value.entries()) {
          createOtherDetails.innerHTML =
            "(+" + (autoCompleteModel.value.length - (i + 1)) + " others)";
          const createChip = createChipMethod(getValueUsed(value));
          addElement(createChip);
          const chipWidth = createChip.offsetWidth;
          createChip.remove();
          if (
            returnValue.showOthersDetail ||
            Math.ceil(chipWidth) +
              returnValue.width +
              createOtherDetails.offsetWidth +
              2 +
              (i + 1 === autoCompleteModel.value.length ? 0 : 4) >=
              vnAutocompleteWidth
          )
            returnValue.showOthersDetail = true;
          else {
            returnValue.width += Math.ceil(chipWidth) + 4;
            returnValue.index += 1;
          }
          selectionList[i].style.display =
            returnValue.index + 1 <= i ? "none" : "";
        }
        createOtherDetails.remove();
        maxIndex.value = returnValue.index === 0 ? 0 : returnValue.index - 1;
        showOthersDetail.value = returnValue.showOthersDetail;
      });
    }
  };
watch(
  () => defProps.fitItems,
  () => {
    setDefaultState();
    if (defProps.fitItems) initializeItems();
  }
);
</script>
