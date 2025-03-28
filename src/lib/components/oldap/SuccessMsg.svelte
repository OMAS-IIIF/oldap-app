<script lang="ts">

import DialogWin from '$lib/components/basic_gui/dialogs/DialogWin.svelte';
import { successInfoStore } from '$lib/stores/successinfo';

let show_success = $state(false);
let successmsg = $state('')

successInfoStore.subscribe((msg: string | null) => {
	if (msg !== null) {
		successmsg = msg || 'Success';
		show_success = true;
	}
});

const closing = (): void => {
	successInfoStore.set(null);
	window.history.back();
}

</script>

<DialogWin title="Success" bind:isopen={show_success} onclose={closing}>
	{successmsg}
</DialogWin>