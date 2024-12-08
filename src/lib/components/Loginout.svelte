<script lang="ts">
	let apiUrl = import.meta.env.VITE_API_URL;
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
	<label class="label" for="url">
		<span class="label-text">OLDAP-Server:</span>
	</label>
	<input id="url"
				 type="url"
				 class="input input-bordered input-xs w-full max-w-xs"
				 placeholder="Server-URL"
				 bind:value={apiUrl} />

	<label class="label" for="userid">
		<span class="label-text">User-ID:</span>
	</label>
	<input id="userid"
				 type="text"
				 class="input input-bordered input-xs w-full max-w-xs"
				 placeholder="User ID"
				 bind:value={userid} />
	<label class="label" for="password">
		<span class="label-text">Password:</span>
	</label>
	<input id="password"
				 type="password"
				 class="input input-bordered input-xs w-full max-w-xs"
				 placeholder="Password" />
</ModalDialog>