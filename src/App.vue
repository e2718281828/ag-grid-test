<script setup lang="ts">
import { TreeStore } from './utils/TreeStore';
import items from './data/data';
import Table from './components/Table.vue';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

// Register all Community and Enterprise features
ModuleRegistry.registerModules([AllEnterpriseModule]);

const store = new TreeStore(items);
</script>

<template>
  <div class="app">
    <Table :store="store" />
  </div>
</template>
