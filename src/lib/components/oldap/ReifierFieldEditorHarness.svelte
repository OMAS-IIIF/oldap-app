<script lang="ts">
	import { untrack } from 'svelte';
	import ReifierFieldEditor from './ReifierFieldEditor.svelte';
	import type { ReifierField } from '#lib/oldap/classes/reifierShape.ts';
	let { initial, readonly = false }: { initial: ReifierField; readonly?: boolean } = $props();
	// Each fixture owns a reactive detached draft, just like the shape dialog.
	let value = $state<ReifierField>(untrack(() => ({ ...initial })));
</script>

<ReifierFieldEditor bind:value index={0} {readonly} onremove={() => {}} />
<output data-testid="field-value">{JSON.stringify(value)}</output>
