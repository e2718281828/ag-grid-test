<template>
  <div class="table-container">
    <ag-grid-vue
      class="ag-theme-quartz custom-table"
      :rowData="rowData"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :autoGroupColumnDef="autoGroupColumnDef"
      :treeData="true"
      :getDataPath="getDataPath"
      :groupDefaultExpanded="0"
      :animateRows="true"
      style="width: 1200px; height: 600px"
    />
  </div>
</template>

<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3';
import { TreeStore, type TreeItem } from '../utils/TreeStore';
import { ref } from 'vue';
import type { ColDef, ValueGetterParams } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

const props = defineProps<{ store: TreeStore }>();

interface TreeRowData extends TreeItem {
  hierarchy: string[];
  category: string;
}

const transformData = (): TreeRowData[] => {
  const items = props.store.getAll();

  const buildHierarchyPath = (item: TreeItem): string[] => {
    const path: (string | number)[] = [];
    let current: TreeItem | undefined = item;

    while (current) {
      path.unshift(current.id);
      if (current.parent === null) break;
      current = props.store.getItem(current.parent);
    }

    return path.map((id) => String(id));
  };

  const getCategory = (item: TreeItem): string => {
    const children = props.store.getChildren(item.id);
    return children.length > 0 ? 'Группа' : 'Элемент';
  };

  return items.map((item) => ({
    ...item,
    hierarchy: buildHierarchyPath(item),
    category: getCategory(item),
  }));
};

const rowData = ref<TreeRowData[]>(transformData());

const columnDefs = ref<ColDef[]>([
  {
    headerName: '№ п/п',
    valueGetter: (params: ValueGetterParams) => {
      if (params.node && params.node.rowIndex !== null) {
        return params.node.rowIndex + 1;
      }
      return '';
    },
    width: 100,
    cellStyle: { textAlign: 'center' },
  },
  {
    headerName: 'Наименование',
    field: 'label',
    flex: 1,
  },
]);

const defaultColDef = ref<ColDef>({
  sortable: false,
  filter: false,
  resizable: true,
});

const autoGroupColumnDef = ref<ColDef>({
  headerName: 'Категория',
  minWidth: 300,
  cellRendererParams: {
    suppressCount: true,
    innerRenderer: (params: any) => {
      return params.data?.category || '';
    },
  },
});

const getDataPath = (data: TreeRowData): string[] => {
  return data.hierarchy;
};
</script>
