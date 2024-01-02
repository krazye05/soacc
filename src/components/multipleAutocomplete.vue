<style lang="scss">
.vnAutoCompleteVList {
  &:not(.rangeSelect) {
    .v-list {
      padding-bottom: 8px !important;
    }
  }
  .v-list {
    padding: 0px !important;
    .selectAll,
    .rangeInfo {
      position: sticky;

      background-color: RGBA(var(--v-theme-surface));
      z-index: 11111;
    }
    .selectAll {
      padding-top: 8px;
      top: 0;
    }
    .rangeInfo {
      padding-bottom: 8px;
      bottom: 0;
    }
  }
}
.tooltipDetails {
  padding-left: 2px;
  user-select: none;
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
    :rules="rules"
    return-object
    @update:modelValue="
      emit('update:modelValue', autoCompleteModel || []), setDefaultState()
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
    :menu-props="{
      contentClass:
        'vnAutoCompleteVList' + (minimum || maximum ? ' rangeSelect' : ''),
    }"
    class="vnAutoComplete"
  >
    <template v-slot:selection="{ item, index }">
      <template v-if="!fitItems || index <= maxIndex">
        <v-chip
          size="small"
          v-if="chips"
          :closable="closableChips && !disabledCheckbox(item)"
          @click:close="removeData(item.value)"
        >
          <span>{{ getTitleUsed(item.raw) }}</span>
        </v-chip>
        <span v-else>{{
          getTitleUsed(item.value) +
          (index + 1 === (autoCompleteModel || []).length ? "" : ",")
        }}</span>
      </template>
      <v-tooltip
        v-if="showOthersDetail && index === maxIndex"
        location="bottom"
      >
        <template v-slot:activator="{ props }">
          <span
            v-bind="props"
            v-if="showOthersDetail && index === maxIndex"
            class="text-grey text-caption align-self-center tooltipDetails"
          >
            (+{{ totalNotShowingLists }} others)
          </span>
        </template>
        <span>{{ getFilteredList }}</span>
      </v-tooltip>
    </template>
    <template
      v-slot:prepend-item
      v-if="selectAll && filteredItems.length > 1 && !maximum"
    >
      <div class="selectAll">
        <v-list-item title="Select All" @click="selectAllMethod()">
          <template v-slot:prepend>
            <v-list-item-action start>
              <v-checkbox-btn
                :color="color"
                :model-value="checkSelectAllValue"
                :indeterminate="checkSelectAllIndeterminate"
              />
            </v-list-item-action>
          </template>
        </v-list-item>

        <v-divider class="my-2" />
      </div>
    </template>
    <!-- :disabled="
          totalDisable && +totalDisable > 0 ? totalDisableCheckBox(item) : false
        " -->
    <template v-slot:item="{ props, item }">
      <v-list-item
        v-bind="props"
        :title="getTitleUsed(item.raw)"
        :disabled="disabledCheckbox(item)"
      >
        <template v-slot:prepend="{ isActive }">
          <v-list-item-action start>
            <v-checkbox-btn :model-value="isActive" :color="color" />
          </v-list-item-action>
        </template>
      </v-list-item>
    </template>
    <template v-slot:append-item v-if="minimum || maximum">
      <div class="rangeInfo">
        <v-divider class="my-2" />
        <v-list-item
          density="compact"
          :lines="minimum && maximum ? 'two' : 'one'"
        >
          <v-list-item-subtitle>
            <p class="my-1">
              {{ minimum ? "Minimum: " + minimum + " items" : "" }}
            </p>
            <p class="my-1">
              {{ maximum ? "Maximum: " + maximum + " items" : "" }}
            </p>
          </v-list-item-subtitle>
        </v-list-item>
      </div>
    </template>
  </v-autocomplete>
</template>
<script lang="ts" setup>
import helpers from "@/plugins/helpers";
import { computed, PropType, ref, watch } from "vue";

const defProps = defineProps({
  modelValue: {
    type: Array as PropType<Array<any> | null>,
    default: [],
  },
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
  rules: Array<any>,

  minimum: {
    type: Number,
    default: 0,
  },
  maximum: {
    type: Number,
    default: 0,
  },
});

const maxIndex = ref(0),
  showOthersDetail = ref(false);
const autoCompleteModel = ref<any[]>([]),
  autoCompleteSearch = ref(""),
  catchLastTotalDisabledModel = ref<any[]>(
    (() => {
      const returnValue: any[] = [];
      if (defProps.minimum)
        for (let index = 0; index < defProps.minimum; index++)
          returnValue.push(helpers.rebuildObject(defProps.items)[index]);

      return returnValue;
    })()
  );
autoCompleteModel.value = defProps.modelValue || [];
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
        !!(autoCompleteModel.value || []).find((autoCompleteModelData) =>
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
    () => (autoCompleteModel.value || []).length - maxIndex.value - 1
  ),
  getFilteredList = computed(() =>
    (autoCompleteModel.value || [])
      .slice(maxIndex.value + 1)
      .map((e) => getTitleUsed(e))
      .join(", ")
  );

const emit = defineEmits(["update:modelValue"]);

const selectAllMethod = () => {
    if (defProps.minimum > 0 && checkSelectAllValue.value)
      autoCompleteModel.value = catchLastTotalDisabledModel.value;
    else if (checkSelectAllValue.value) {
      filteredItems.value.forEach((e: any) => {
        removeData(e);
      });
    } else
      autoCompleteModel.value = [
        ...(autoCompleteModel.value || []),
        ...filteredItems.value
          .map((e: any) => {
            const valueData = getValueUsed(e);
            const findData = (autoCompleteModel.value || []).find(
              (autoCompleteModelData) =>
                findAutoCompleteModelExist(autoCompleteModelData, valueData)
            );

            return findData ? false : e;
          })
          .filter(Boolean),
      ];
    emit("update:modelValue", autoCompleteModel.value || []);
  },
  getTitleUsed = (data: any): string => {
    if (typeof data === "string") return data;
    const valueUsed = defProps.itemTitle || defProps.itemValue;
    return (
      (typeof valueUsed === "function"
        ? valueUsed(data)
        : data[valueUsed || ""]) || ""
    );
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
    (autoCompleteModel.value || []).splice(
      (autoCompleteModel.value || []).findIndex((autoCompleteModelData) =>
        findAutoCompleteModelExist(autoCompleteModelData, getValueUsed(data))
      ),
      1
    );
    setLastModel();
  },
  setDefaultState = () => {
    maxIndex.value = defProps.items.length;
    showOthersDetail.value = false;

    Array.from(
      document.querySelectorAll<HTMLElement>(
        ".vnAutoComplete .v-field__input .v-autocomplete__selection"
      )
    ).forEach((e: HTMLElement) => {
      e.style.display = "";
    });
    setLastModel();
  },
  setLastModel = () => {
    if (
      defProps.minimum > 0 &&
      autoCompleteModel.value.length < defProps.items.length
    ) {
      catchLastTotalDisabledModel.value = autoCompleteModel.value;
    }
  };
let timerInitializeItems: any = null;
const autoCompleteFocus = (e: boolean) => {
    if (defProps.fitItems) setDefaultState();
    if (!e) initializeItems();
  },
  initializeItems = () => {
    if ((autoCompleteModel.value || []).length > 0 && defProps.fitItems) {
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
            if (defProps.closableChips) {
              childChipCloseParent.classList.add("v-chip__close");
              childChipCloseParent.appendChild(childChipCloseIcon);
            }

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
        for (const [i, value] of (autoCompleteModel.value || []).entries()) {
          createOtherDetails.innerHTML =
            "(+" +
            ((autoCompleteModel.value || []).length - (i + 1)) +
            " others)";
          const createChip = createChipMethod(getValueUsed(value));
          addElement(createChip);
          const chipWidth = createChip.offsetWidth;
          createChip.remove();
          if (
            returnValue.showOthersDetail ||
            Math.ceil(chipWidth) +
              returnValue.width +
              (autoCompleteModel.value.length - 1 == i
                ? 0
                : createOtherDetails.offsetWidth) +
              2 +
              (i + 1 === (autoCompleteModel.value || []).length ? 0 : 4) >=
              vnAutocompleteWidth
          )
            returnValue.showOthersDetail = true;
          else {
            returnValue.width += Math.ceil(chipWidth) + 4;
            returnValue.index += 1;
          }
          // selectionList[i].style.display =
          //   returnValue.index + 1 <= i ? "none" : "";
        }
        createOtherDetails.remove();
        maxIndex.value = returnValue.index === 0 ? 0 : returnValue.index - 1;
        showOthersDetail.value = returnValue.showOthersDetail;
      });
    }
  },
  disabledCheckbox: (item: any) => boolean = (item) => {
    if (!defProps.modelValue || (!defProps.minimum && !defProps.maximum))
      return false;
    const findModelItem = defProps.modelValue.find(
      (e) => getValueUsed(e) === getValueUsed(item.raw)
    );
    const minimum =
      defProps.modelValue.length === defProps.minimum ? !!findModelItem : false;
    const maximum =
      defProps.modelValue.length === defProps.maximum ? !findModelItem : false;
    return (!!defProps.minimum && minimum) || (!!defProps.maximum && maximum);
  };

watch(
  () => defProps.fitItems,
  () => {
    setDefaultState();
    if (defProps.fitItems) initializeItems();
  }
);
</script>
