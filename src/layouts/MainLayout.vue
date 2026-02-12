<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title> User Management App </q-toolbar-title>

        <div></div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Menu </q-item-label>

        <EssentialLink v-for="link in essentialLinks" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EssentialLink from 'src/components/EssentialLink.vue';

interface EssentialLink {
  title: string;
  caption?: string;
  icon: string;
  link: string;
  pageName: string;
}

const essentialLinks: EssentialLink[] = [
  {
    title: 'Users',
    caption: 'Manage users',
    icon: 'people',
    link: '/',
    pageName: 'UserPage',
  },
];

const leftDrawerOpen = ref(false);
</script>
