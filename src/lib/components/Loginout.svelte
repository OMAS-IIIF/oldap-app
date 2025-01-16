<script lang="ts">
	import ModalDialog from '$lib/components/ModalDialog.svelte';

	let apiUrl = import.meta.env.VITE_API_URL;
	let userid = '';
	let password = ''
	let showDialog = false;
	let errorMessage = ''

	async function okAction(): Promise<boolean> {
		if (!userid || !password) {
			errorMessage = 'userid or password missing';
			return false;
		}
		errorMessage = '';
		const response = await fetch('/login/' + userid, {
			'method': 'POST',
			'headers': {
				'Content-Type': 'application/json'
			},
			'body': JSON.stringify({
				'password': password
			})
		});
		const res = await response.json();
		if (!res.success) {
			errorMessage = res.errormsg;
			console.log("ERROR:", res.errormsg);
			return false;
		}
		console.log("SUCCESS:", res.token);
		/*
		if (!response.ok) {
			const error = await response.json();
			errorMessage = error.message;
			console.log("ERROR1:", errorMessage);
			return false;
		}
		const logindata = await response.json();

		let response2: Response;
		try {
			response2 = await fetch(apiUrl + '/admin/user/' + userid, {
				'headers': {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + logindata.token
				}
			});
		}
		catch (e: unknown) {
			if (e instanceof Error) {
				errorMessage = e.message;
			}
			return false;
		}
		if (!response2.ok) {
			const error = await response2.json();
			errorMessage = error.message;
			console.log("ERROR2:", errorMessage)
			return false;
		}
		const userdata = await response2.json();
		console.log(userdata)

		 */
		return true;
	}

	const cancelAction = () => {
		errorMessage = '';
		userid = '';
	}
</script>

<div>
	{#if userid}
		<span class="text-xs">user: {userid}</span>
		<button class="link-style btn btn-ghost btn-sm text-xs"  onclick={()=>{showDialog=true}}>logout</button>
	{:else}
		<button class="link-style btn btn-ghost btn-sm text-xs" onclick={()=>{showDialog=true}}>login</button>
	{/if}
</div>
<ModalDialog bind:isOpen={showDialog} title="Login" okAction={okAction} cancelAction={cancelAction}>
	<div class="flex flex-col space-y-5">
		<div>
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
						 placeholder="Password"
						 bind:value={password} />
		</div>
	{#if errorMessage}
		<div role="alert" class="alert alert-error">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 shrink-0 stroke-current"
				fill="none"
				viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span>{errorMessage}</span>
		</div>
	{/if}
	</div>
</ModalDialog>
