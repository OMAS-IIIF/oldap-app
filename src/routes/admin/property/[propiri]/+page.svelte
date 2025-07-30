<script lang="ts">

	import { page } from '$app/state';
	import Property from '$lib/components/oldap/Property.svelte';
	import type { PageProps } from '../../../../../.svelte-kit/types/src/routes/admin/property/[propiri]/$types';
	import { onMount } from 'svelte';
	import { projectStore } from '$lib/stores/project';

	let topwin = $state<HTMLElement>();

	let { data } : PageProps = $props();

	let projectid = $state<string>('');

	projectStore.subscribe(project => {
		projectid = project?.projectShortName.toString() || '';
	})

</script>
<div class="absolute top-0 left-0 right-0 bottom-0 overflow-auto flex flex-col justify-center items-center" bind:this={topwin}>
	<Property propiri={data.propiri} {projectid} {topwin} />
</div>