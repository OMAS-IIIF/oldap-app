<script lang="ts">
	import DialogWin from '#lib/components/basic_gui/dialogs/DialogWin.svelte';
	import { errorInfoStore } from '#lib/stores/errorinfo.ts';
	import type { OldapError } from '#lib/oldap/errors/OldapError.ts';

	let show_error = $state(false);
	let errormsg = $state('');

	errorInfoStore.subscribe((error: OldapError | null) => {
		if (error !== null) {
			errormsg = error?.message || 'Unknown error';
			show_error = true;
		}
	});

	const closing = (): void => {
		errorInfoStore.set(null);
	};
</script>

<DialogWin nativeModal={true} alert={true} title="ERROR" bind:isopen={show_error} onclose={closing}>
	{errormsg}
</DialogWin>
