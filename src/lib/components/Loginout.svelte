<script lang="ts">
	import ModalDialog from '$lib/components/ModalDialog.svelte';
	let userid = '';
	let showDialog = false;

	//const openDialog = () => (showDialog = true);
</script>
<div>
	{#if userid}
		<button type="button" class="btn btn-sm text-xs" onclick={()=>{userid='';}}>user: {userid}</button>
	{:else}
		<button type="button" class="btn btn-sm text-xs" onclick={()=>{showDialog=true}}>login</button>
	{/if}

</div>
<ModalDialog bind:isOpen={showDialog} title="login">
	<input type="url"
				 class="input input-bordered input-xs w-full max-w-xs"
				 placeholder="Server-URL"
				 bind:value={userid} />

	<input type="text"
				 class="input input-bordered input-xs w-full max-w-xs"
				 placeholder="User ID"
				 bind:value={userid} />
	<input type="password"
				 class="input input-bordered input-xs w-full max-w-xs"
				 placeholder="Password" />
</ModalDialog>