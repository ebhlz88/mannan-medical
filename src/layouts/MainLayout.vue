<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="bg-purple toolbar">
        <q-toolbar-title class="toolbar-title"> Mannan Medical </q-toolbar-title>

        <div></div>
      </q-toolbar>
    </q-header>

    <q-page-container class="page-cont">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts"></script>
<style scoped>
.toolbar {
  padding-top: 20px;
}
.toolbar-title {
  padding-bottom: 10px;
}
.page-cont {
  margin-top: 40px;
}
</style>
