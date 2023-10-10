<template id="app-header">
  <nav class="h-16 border-b border-gray-300">
    <div class="flex h-full w-full items-center justify-between">
      <div class="hidden h-full 2xl:block">
        <nuxt-link to="/HomePage">
          <img
            src="/images/top-nav.png"
            class="min-w-8 h-full"
            alt="Name Examination"
          />
        </nuxt-link>
      </div>

      <div class="ml-3 flex gap-10 text-bcgov-blue5">
        <AppHeaderNavLink text="Admin" :route="Routes.Admin" />
        <AppHeaderNavLink text="Examine Names" :route="Routes.Examine" />
        <AppHeaderNavLink text="Search" :route="Routes.Search" />
      </div>

      <div class="ml-auto flex items-center">
        <SearchInput placeholder="NR Number Lookup" />

        <nuxt-link to="/stats" class="mx-3 text-sm text-blue-800 underline">
          <a>Stats</a>
        </nuxt-link>

        <div class="flex space-x-2 px-3">
          <ToggleSwitch
            label="Classify Words"
            v-model="examineOptions.classifyWords"
          />
          <ToggleSwitch
            label="Priority Queue"
            v-model="examineOptions.priorityQueue"
          />
        </div>

        <div class="flex flex-col border-l-2 border-gray-300 px-3">
          <span class="text-sm">{{ data?.user?.name }}</span>
          <a class="text-sm text-blue-800" href="#" @click="signOut()"
            >Log Out</a
          >
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ArrowRightOnRectangleIcon } from '@heroicons/vue/24/solid'
import { useExamineOptionsStore } from '~/store/examine-options'
import { Routes } from '~/enums/routes'
import { useAuth } from '#imports'
/* eslint-disable require-jsdoc */

const examineOptions = useExamineOptionsStore()
const { data, signOut } = useAuth()
</script>
