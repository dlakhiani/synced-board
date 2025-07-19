<script setup lang="ts">
import { Button } from 'primevue'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
</script>

<template>
    <div>
        <Button label="Verify" />
        <InputGroup>
            <InputGroupAddon>
                <Button icon="pi pi-check" severity="secondary" />
            </InputGroupAddon>
            <InputText placeholder="Vote" />
            <InputGroupAddon>
                <Button icon="pi pi-times" severity="danger" />
            </InputGroupAddon>
        </InputGroup>
    </div>
</template>

<style scoped></style>
