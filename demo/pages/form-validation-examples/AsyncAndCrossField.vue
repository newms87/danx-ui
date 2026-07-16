<script setup lang="ts">
import { reactive } from "vue";
import { DanxInput, useFormValidation, required, minLength, custom, sleep } from "danx-ui";

const model = reactive({ username: "", password: "", confirm: "" });

const TAKEN_USERNAMES = ["admin", "root"];

const { errors, isValidating, validateField, validate } = useFormValidation(model, {
  username: [
    required(),
    async (value) => {
      await sleep(400);
      return TAKEN_USERNAMES.includes(String(value).toLowerCase()) ? "Username is taken" : null;
    },
  ],
  password: [required(), minLength(8)],
  confirm: [
    required(),
    custom((value, m) => (value !== m.password ? "Passwords must match" : null)),
  ],
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxInput
      v-model="model.username"
      label="Username"
      :error="errors.username"
      @blur="validateField('username')"
    />
    <p v-if="isValidating" class="text-sm text-slate-500">Checking username availability…</p>
    <DanxInput
      v-model="model.password"
      type="password"
      label="Password"
      :error="errors.password"
      @blur="validateField('password')"
    />
    <DanxInput
      v-model="model.confirm"
      type="password"
      label="Confirm Password"
      :error="errors.confirm"
      @blur="validate"
    />
  </div>
</template>
