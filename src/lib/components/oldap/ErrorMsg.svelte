<script lang="ts">

import DialogWin from '$lib/components/basic_gui/dialogwin/DialogWin.svelte';
import { errorInfoStore } from '$lib/stores/errorinfo';
import type { OldapError } from '$lib/oldap/errors/OldapError';

let show_error = $state(false);
let errormsg = $state('')

errorInfoStore.subscribe((error: OldapError | null) => {
	if (error !== null) {
		errormsg = error?.message || 'Unknown error';
		show_error = true;
	}
});

const closing = (): void => {
	errorInfoStore.set(null);
}

</script>

<DialogWin alert={true} title="ERROR" bind:isopen={show_error} onclose={closing}>
	{errormsg}
</DialogWin>