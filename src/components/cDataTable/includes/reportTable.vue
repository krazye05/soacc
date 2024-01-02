<style lang="scss">
.reportInfoCheckList {
  white-space: nowrap;
  font-size: 0.875rem;
  line-height: normal;
  display: flex;
  text-align: center;
  align-items: center;
  margin: 0 12px;
  gap: 6px;
  opacity: var(--v-medium-emphasis-opacity);
}
</style>
<template>
  <v-dialog :model-value="modelValue" persistent class="auto">
    <v-card title="Export" prepend-icon="mdi-file-export">
      <v-card-text>
        <div class="fileConfig">
          <v-select
            color="primary"
            variant="outlined"
            density="compact"
            label="File Type"
            :items="fileTypeList"
            item-title="title"
            item-value="value"
            v-model="fileType"
            hide-details
            return-object
          />
          <v-select
            v-if="fileType.value === 'pdf'"
            class="mt-3"
            color="primary"
            variant="outlined"
            density="compact"
            label="Orientation"
            :items="orientationList"
            item-title="title"
            item-value="value"
            v-model="orientation"
            hide-details
            return-object
          />
          <v-row no-gutters class="mt-3">
            <v-col cols="12">
              <div class="d-flex align-center">
                <v-divider></v-divider>

                <div class="reportInfoCheckList">
                  <v-icon icon="mdi-alert-circle"></v-icon>
                  <span> Show Data Table Component </span>
                </div>

                <v-divider></v-divider>
              </div>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="12" sm="4">
              <v-checkbox-btn
                color="primary"
                label="Search Filtered"
                :model-value="headersPerPage"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-checkbox-btn
                color="primary"
                label="Sort"
                :model-value="headersPerPage"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-checkbox-btn
                color="primary"
                label="Show selected paginate"
                :model-value="headersPerPage"
              />
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="12">
              <div class="d-flex align-center">
                <v-divider></v-divider>

                <div class="reportInfoCheckList">
                  <v-icon icon="mdi-alert-circle"></v-icon>
                  <span> Other Report Config </span>
                </div>

                <v-divider></v-divider>
              </div>
            </v-col>
            <v-spacer></v-spacer>
            <template v-if="fileType.value === 'pdf'">
              <v-col cols="12" sm="4">
                <v-checkbox-btn
                  color="primary"
                  label="Headers Per Page"
                  :model-value="headersPerPage"
                />
              </v-col>
              <v-col cols="12" sm="4">
                <v-checkbox-btn
                  color="primary"
                  label="Show Page Number and Date"
                  :model-value="headersPerPage"
                />
              </v-col>
            </template>
            <v-col cols="12" sm="4">
              <v-checkbox-btn
                color="primary"
                label="Item Number"
                :model-value="headersPerPage"
              />
            </v-col>
          </v-row>
        </div>
        <div class="reportConfig" v-if="!simpleReport">
          <v-divider :class="fileType.value === 'pdf' ? 'mt-3 mb-6' : 'my-6'" />

          <multipleAutocomplete
            label="Headers"
            :items="headers"
            item-title="text"
            item-value="value"
            persistent-hint
            hint="* Required"
            color="primary"
            chips
            closable-chips
            fit-items
            select-all
            v-model="headersSelect"
            :minimum="2"
          />
        </div>
      </v-card-text>
      <v-card-actions style="padding: 0 0.5rem">
        <v-row class="mb-0" style="margin: 0 -12px">
          <v-col>
            <v-btn color="warning" block @click="exportFile" text="Export" />
          </v-col>
          <v-col>
            <v-btn color="error" block @click="closeDialog" text="Close" />
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { ref } from "vue";
import multipleAutocomplete from "@/components/multipleAutocomplete.vue";
import { dataTableProps, reportProps } from "../tableProps";
import { Font, Workbook } from "exceljs";

const emit = defineEmits(["update:modelValue", "export"]);
const defProps = defineProps({
  ...dataTableProps,
  ...reportProps,
  modelValue: Boolean,
});
const fileTypeList = [
    {
      title: "PDF",
      value: "pdf",
    },
    {
      title: "Excel 97 - 2003 (*.xls)",
      value: "xls",
    },
    {
      title: "Excel 2007 - 365 (*.xlsx)",
      value: "xlsx",
    },
  ],
  orientationList = [
    {
      title: "Portrait",
      value: "portrait",
    },
    {
      title: "Landscape",
      value: "landscape",
    },
  ];
const headersSelect = ref(JSON.parse(JSON.stringify(defProps.headers))),
  fileType = ref(fileTypeList[0]),
  orientation = ref(orientationList[0]),
  headersPerPage = ref(true);
const closeDialog = () => {
    emit("update:modelValue", !defProps.modelValue);
    headersSelect.value = JSON.parse(JSON.stringify(defProps.headers));
  },
  exportFile = async () => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(defProps.workSheetName);
    const headers = JSON.parse(JSON.stringify(defProps.headers))
      .map((header) => {
        return (
          headersSelect.value.find(
            (headerSelect) => headerSelect.value === header.value
          ) && header
        );
      })
      .filter(Boolean)
      .map((field) => ({
        header: field.text,
        key: field.value,
      }));
    worksheet.columns = headers;

    worksheet.addRows(JSON.parse(JSON.stringify(defProps.items)));

    worksheet.columns.forEach((column) => {
      let maxLength = 10;
      column.eachCell!({ includeEmpty: true }, (cell, rowNumber) => {
        if (cell.value) {
          cell.font = {
            name: "Arial",
            family: 1,
            size: 10,
            bold: rowNumber === 1,
          };
          const columnLength =
            cell.value.toString().length + cell.value.toString().length * 0.3;

          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        }
      });
      column.width = maxLength;
    });
    const blob = new Blob([await workbook.xlsx.writeBuffer()], {
      type: "text/xlsx",
    });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "Test.xlsx";
    link.click();
  };
</script>
