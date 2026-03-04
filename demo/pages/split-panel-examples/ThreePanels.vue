<script setup>
import { ref } from "vue";
import {
  DanxSplitPanel,
  DanxIcon,
  DanxBadge,
  DanxButton,
  DanxChip,
  DanxProgressBar,
  DanxButtonGroup,
  DanxTooltip,
  DanxInput,
  DanxScroll,
} from "danx-ui";

const panels = [
  { id: "nav", label: "Nav", defaultWidth: 1 },
  { id: "main", label: "Main", defaultWidth: 2.5 },
  { id: "aside", label: "Aside", defaultWidth: 1.2 },
];
const active = ref(["nav", "main", "aside"]);
const toggleButtons = panels.map((p) => ({ value: p.id, label: p.label }));
const searchQuery = ref("");

const navItems = [
  { icon: "list", label: "Dashboard", count: 3, active: true },
  { icon: "users", label: "Team", count: 8 },
  { icon: "database", label: "Storage", count: null },
  { icon: "gear", label: "Settings", count: null },
];

const activities = [
  { user: "Alice", action: "deployed v2.4.1", time: "2m ago", variant: "success" },
  { user: "Bob", action: "opened PR #347", time: "15m ago", variant: "info" },
  { user: "Carol", action: "flagged issue", time: "1h ago", variant: "warning" },
  { user: "Dave", action: "reverted commit", time: "3h ago", variant: "danger" },
];

const team = [
  { name: "Alice", role: "Lead", variant: "success", online: true },
  { name: "Bob", role: "Dev", variant: "info", online: true },
  { name: "Carol", role: "QA", variant: "warning", online: false },
];
</script>

<template>
  <DanxSplitPanel
    v-model="active"
    :panels="panels"
    class="h-[450px] rounded-xl border-2 border-blue-500/40 shadow-xl overflow-hidden"
  >
    <template #toggles>
      <DanxButtonGroup v-model="active" :buttons="toggleButtons" multiple class="mb-3" />
    </template>
    <template #nav>
      <div class="h-full bg-blue-500/5 flex flex-col border-r-2 border-blue-500/30">
        <div class="p-3 border-b-2 border-blue-500/20 bg-blue-500/10">
          <DanxChip variant="info">
            <DanxIcon icon="code" class="w-3 h-3" />
            Acme Co
          </DanxChip>
        </div>
        <DanxScroll tag="nav" class="flex-1 p-2 flex flex-col gap-1 bg-blue-500/5">
          <DanxTooltip
            v-for="item in navItems"
            :key="item.label"
            :text="item.label"
            position="right"
          >
            <DanxButton size="sm" :variant="item.active ? 'info' : ''" class="w-full justify-start">
              <DanxIcon :icon="item.icon" class="w-3.5 h-3.5" />
              <span class="flex-1 text-left">{{ item.label }}</span>
              <DanxBadge v-if="item.count" variant="info" size="sm">{{ item.count }}</DanxBadge>
            </DanxButton>
          </DanxTooltip>
        </DanxScroll>
        <div class="p-3 border-t-2 border-blue-500/20 bg-blue-500/10">
          <div class="flex items-center gap-2 mb-2">
            <DanxBadge variant="success" size="sm">Online</DanxBadge>
            <span class="text-xs text-text-muted">alice@acme.co</span>
          </div>
          <DanxProgressBar :value="42" size="sm" variant="warning" :show-text="false" />
          <span class="text-xs text-text-subtle mt-1">42% quota used</span>
        </div>
      </div>
    </template>
    <template #main>
      <div class="h-full flex flex-col bg-surface shadow-inner">
        <div class="px-5 py-3 border-b-2 border-border flex items-center gap-3 bg-surface-sunken">
          <div>
            <div class="font-bold">Dashboard</div>
            <div class="text-xs text-text-muted">Workspace activity and metrics</div>
          </div>
          <div class="ml-auto flex items-center gap-2">
            <DanxInput v-model="searchQuery" placeholder="Search..." class="w-40" />
            <DanxTooltip text="Refresh data">
              <DanxButton size="xs" variant="info"
                ><DanxIcon icon="refresh" class="w-3.5 h-3.5"
              /></DanxButton>
            </DanxTooltip>
          </div>
        </div>
        <DanxScroll class="flex-1 p-5 flex flex-col gap-4">
          <div class="grid grid-cols-3 gap-3">
            <div class="rounded-lg border-2 border-green-500/30 p-3 bg-green-500/5 shadow-sm">
              <div class="flex items-center gap-2 mb-1">
                <DanxIcon icon="confirm" class="w-3.5 h-3.5 text-success" />
                <span class="text-xs text-text-subtle uppercase tracking-wide">Deploys</span>
              </div>
              <div class="text-2xl font-bold text-success">142</div>
              <DanxProgressBar
                :value="85"
                size="sm"
                variant="success"
                :show-text="false"
                class="mt-2"
              />
            </div>
            <div class="rounded-lg border-2 border-blue-500/30 p-3 bg-blue-500/5 shadow-sm">
              <div class="flex items-center gap-2 mb-1">
                <DanxIcon icon="code" class="w-3.5 h-3.5 text-info" />
                <span class="text-xs text-text-subtle uppercase tracking-wide">Open PRs</span>
              </div>
              <div class="text-2xl font-bold text-info">23</div>
              <DanxProgressBar
                :value="46"
                size="sm"
                variant="info"
                :show-text="false"
                class="mt-2"
              />
            </div>
            <div class="rounded-lg border-2 border-amber-500/30 p-3 bg-amber-500/5 shadow-sm">
              <div class="flex items-center gap-2 mb-1">
                <DanxIcon icon="warning-triangle" class="w-3.5 h-3.5 text-warning" />
                <span class="text-xs text-text-subtle uppercase tracking-wide">Issues</span>
              </div>
              <div class="text-2xl font-bold text-warning">7</div>
              <DanxProgressBar
                :value="14"
                size="sm"
                variant="warning"
                :show-text="false"
                class="mt-2"
              />
            </div>
          </div>
          <div class="rounded-lg border border-border p-4 bg-surface shadow-sm flex-1">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-semibold">Recent Activity</span>
              <DanxChip variant="muted">Last 24h</DanxChip>
            </div>
            <div class="flex flex-col gap-2">
              <div
                v-for="(a, i) in activities"
                :key="i"
                class="flex items-center gap-3 py-1.5 px-3 rounded-md bg-surface-sunken text-sm"
              >
                <DanxBadge :variant="a.variant" size="sm">{{ a.action }}</DanxBadge>
                <span class="text-text-muted"
                  >by <strong class="text-text">{{ a.user }}</strong></span
                >
                <DanxChip variant="muted" class="ml-auto">{{ a.time }}</DanxChip>
              </div>
            </div>
          </div>
        </DanxScroll>
      </div>
    </template>
    <template #aside>
      <div class="h-full bg-green-500/5 flex flex-col border-l-2 border-green-500/30">
        <div class="px-4 py-3 border-b-2 border-green-500/20 bg-green-500/10">
          <DanxChip variant="success">
            <DanxIcon icon="confirm" class="w-3 h-3" />
            All Systems Go
          </DanxChip>
        </div>
        <DanxScroll class="flex-1 p-4 flex flex-col gap-5">
          <div>
            <div class="text-xs text-text-subtle uppercase tracking-wide mb-2">Team</div>
            <div class="flex flex-col gap-2">
              <div
                v-for="t in team"
                :key="t.name"
                class="flex items-center gap-2 p-2 rounded-lg bg-surface border border-border shadow-sm"
              >
                <DanxBadge :variant="t.variant" size="sm">{{ t.name[0] }}</DanxBadge>
                <div class="flex-1">
                  <div class="text-sm font-medium">{{ t.name }}</div>
                  <div class="text-xs text-text-subtle">{{ t.role }}</div>
                </div>
                <DanxChip :variant="t.online ? 'success' : 'muted'" class="text-xs">
                  {{ t.online ? "online" : "away" }}
                </DanxChip>
              </div>
            </div>
          </div>
          <div>
            <div class="text-xs text-text-subtle uppercase tracking-wide mb-2">Uptime</div>
            <DanxProgressBar :value="99.7" size="lg" variant="success" gradient />
          </div>
          <div>
            <div class="text-xs text-text-subtle uppercase tracking-wide mb-2">Build Health</div>
            <DanxProgressBar :value="78" size="lg" variant="info" striped />
          </div>
          <div>
            <div class="text-xs text-text-subtle uppercase tracking-wide mb-2">Disk Usage</div>
            <DanxProgressBar :value="61" size="lg" variant="warning" gradient />
          </div>
        </DanxScroll>
      </div>
    </template>
  </DanxSplitPanel>
</template>
