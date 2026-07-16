<script setup lang="ts">
import { reactive, ref } from "vue";
import { DanxInput, DanxSelect, useFormValidation, required, email } from "danx-ui";

const model = reactive({ name: "", email: "", role: null });

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "guest", label: "Guest" },
];

const { errors, isValid, validate, reset } = useFormValidation(model, {
  name: [required()],
  email: [required(), email()],
  role: [required("Please choose a role")],
});

const submitted = ref(false);

async function onSubmit() {
  submitted.value = await validate();
}

function onReset() {
  model.name = "";
  model.email = "";
  model.role = null;
  submitted.value = false;
  reset();
}
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
    <DanxInput v-model="model.name" label="Name" :error="errors.name" />
    <DanxInput v-model="model.email" label="Email" type="email" :error="errors.email" />
    <DanxSelect
      v-model="model.role"
      :options="roleOptions"
      label="Role"
      placeholder="Pick a role"
      :error="errors.role"
    />
    <div class="flex gap-2">
      <button type="submit" class="px-3 py-1.5 rounded bg-blue-600 text-white" :disabled="!isValid">
        Submit
      </button>
      <button type="button" class="px-3 py-1.5 rounded border" @click="onReset">Reset</button>
    </div>
    <p v-if="submitted" class="text-sm text-green-600">Form is valid — submitted!</p>
  </form>
</template>
