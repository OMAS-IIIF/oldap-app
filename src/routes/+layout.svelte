<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	import MainWin from '$lib/components/oldap/MainWin.svelte';

	let { children } = $props();

</script>

<ParaglideJS {i18n}>
	<MainWin>{@render children()}</MainWin>
</ParaglideJS>
