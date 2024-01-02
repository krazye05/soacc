<style scoped lang="scss">
.table-title {
  display: flex;
  justify-content: space-between;
  .title-icon {
    color: RGBA(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  }
  .text-title {
    white-space: nowrap;
    align-items: center;
    display: flex;
    color: RGBA(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  }
  .actionReportButton {
    display: flex;
    justify-content: space-between;
  }
  .searchTable {
    width: 100%;
  }
  div {
    &:not(:first-child) {
      margin-left: 8px;
    }
  }
}
@media (max-width: 768px) {
  .table-title {
    flex-wrap: wrap;
    justify-content: center !important;
    div {
      width: 100%;
      &:not(:last-child) {
        margin-bottom: 8px !important;
      }
      &:not(:first-child) {
        margin-left: unset !important;
      }
    }
    .actionReportButton {
      flex-wrap: wrap;
      justify-content: center !important;
    }
  }
}
</style>
<template>
  <div class="table-title pb-5">
    <div style="align-items: center; display: flex" v-if="title !== ''">
      <div class="text-h6 text-title">
        <v-icon class="title-icon" size="28" icon="mdi-bookmark" />
        {{ title }}
      </div>
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
        @update:modelValue="emit('update:modelValue', searchValue)"
      />
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
                    icon=" mdi-menu-down"
                  />
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
        <div v-if="generateReport">
          <v-btn
            block
            @click="emit('update:modelValueExport', !modelValueExport)"
            color="warning"
            text="Export"
          />
          <!-- <v-menu>
            <template v-slot:activator="{ isActive, props }">
              <v-btn
                block
                :disabled="checkActionButtonDisabled"
                :loading="checkActionButtonLoading"
                v-bind="props"
                color="warning"
                text="Export"
              >
                <template v-slot:append>
                  <v-icon
                    :style="[
                      'transition: .2s cubic-bezier(.4,0,.2,1)',
                      { transform: isActive ? 'rotate(180deg)' : '' },
                    ]"
                    icon=" mdi-menu-down"
                  />
                </template>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="onGenerateReport('PDF')">
                <v-list-item-title style="text-align: center">
                  PDF
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="onGenerateReport('EXCEL')">
                <v-list-item-title style="text-align: center">
                  Excel
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu> -->
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { Workbook } from "exceljs";
import { headerTableProps, styleProps } from "../tableProps";
const defProps = defineProps({
  ...headerTableProps,
  ...styleProps,
  modelValue: String,
  modelValueExport: Boolean,
});
const emit = defineEmits(["update:modelValue", "update:modelValueExport"]);
const searchValue = ref<string>("");
const checkActionButtonDisabled = computed(() => {
    if (defProps.actionButton?.disabled === undefined) return false;
    return typeof defProps.actionButton.disabled === "object"
      ? defProps.actionButton.disabled.value
      : defProps.actionButton.disabled;
  }),
  checkActionButtonLoading = computed(() => {
    if (defProps.actionButton?.loading === undefined) return false;
    return typeof defProps.actionButton.loading === "object"
      ? defProps.actionButton.loading.value
      : defProps.actionButton.loading;
  });
const onGenerateReport = async (type: "PDF" | "EXCEL") => {
  if (type == "EXCEL") {
    const users = [
      { id: 1, name: "John", phone: "123456789" },
      { id: 2, name: "Anne", phone: "987654321" },
      { id: 3, name: "Zack", phone: "123987456" },
      { id: 4, name: "Jill", phone: "456123789" },
      { id: 5, name: "Judy", phone: "789456123" },
      { id: 6, name: "Jenny", phone: "123789456" },
      { id: 7, name: "David", phone: "456789123" },
    ];
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("sheet");
    worksheet.columns = [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "phone", label: "Phone" },
    ].map((field) => ({
      header: field.label,
      key: field.key,
    }));

    worksheet.addRows(users);

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], { type: "text/xlsx" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "Test.xlsx";
    link.click();
  }
};
</script>
