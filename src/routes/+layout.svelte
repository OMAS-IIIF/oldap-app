<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	import MainWin from '$lib/components/oldap/MainWin.svelte';
	import { userStore } from '$lib/stores/user';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { onMount } from 'svelte';
	import { loginUnknownUser } from '$lib/helpers/login_unknown_user';

	let { children } = $props();

	onMount(async () => {
		// Automatisches Login für unbekannten Benutzer beim Anwendungsstart
		if (!$userStore && !$authInfoStore) {
			await loginUnknownUser();
		}
	});

</script>

<ParaglideJS {i18n}>
	<MainWin>{@render children()}</MainWin>
</ParaglideJS>
