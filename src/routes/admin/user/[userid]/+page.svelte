<script lang="ts">
	import type { PageProps } from './$types';
	import Textfield from '$lib/components/basic_gui/inputs/Textfield.svelte';
	import { apiClient } from '$lib/shared/apiClient';
	import { OldapUser } from '$lib/oldap/classes/user';
	import { api_config } from '$lib/helpers/api_config';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import Checkbox from '$lib/components/basic_gui/checkbox/Checkbox.svelte';

	let { data }: PageProps = $props();
	let authinfo = AuthInfo.fromString(sessionStorage.getItem('authinfo'));
	let user: OldapUser | null = $state(null);
	const ncname_pattern = /^[A-Za-z_][A-Za-z0-9._-]*$/;
	const email_pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

	if (data && data.userid) {
		let config_userdata = api_config(authinfo, { userId: data.userid });
		apiClient.getAdminuserUserId(config_userdata).then((jsondata) => {
			user = OldapUser.fromOldapJson(jsondata);
		})
			.catch(error => {
				console.log(error);
			});
	}


</script>

<div>
	<h1>{data.userid ? "Edit" : "Add"} User "{data.userid}"</h1>
	<form class="max-w-96">
		<Textfield type='text' label="User ID" name="userid" id="userid" placeholder="user id" required={true} value={user?.userId.toString()} pattern={ncname_pattern}/>
		<Textfield type='text' label="Family name" name="familyName" id="familyName" placeholder="family name" required={true} value={user?.familyName} />
		<Textfield type='text' label="Given name" name="givenName" id="givenName" placeholder="given name" required={true} value={user?.givenName} />
		<Textfield type='email' label="Email" name="email" id="email" placeholder="john.doe@example.org" required={true} value={user?.email} pattern={email_pattern} />
		<Checkbox label="isActive" name="isActive" />
	</form>
</div>
