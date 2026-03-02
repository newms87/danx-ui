<script setup>
import { ref } from "vue";
import { useToast, DanxButton } from "danx-ui";

const { toast } = useToast();

const wrapper = ref(null);

function showAt(index, placement) {
  if (!wrapper.value) return;
  var buttons = wrapper.value.querySelectorAll("button");
  var target = buttons[index];
  if (target) toast("Anchored toast!", { target, targetPlacement: placement, variant: "info" });
}
</script>

<template>
  <div ref="wrapper" class="flex items-center gap-4">
    <DanxButton variant="info" @click="showAt(0, 'top')">Top</DanxButton>
    <DanxButton variant="success" @click="showAt(1, 'right')">Right</DanxButton>
    <DanxButton variant="warning" @click="showAt(2, 'bottom')">Bottom</DanxButton>
    <DanxButton variant="danger" @click="showAt(3, 'left')">Left</DanxButton>
  </div>
</template>
