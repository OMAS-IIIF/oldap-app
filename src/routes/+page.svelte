<script lang="ts">
import WindowManager from '$lib/components/basic_gui/windowing/WindowManager.svelte';

import type { PageData } from './$types';

let {
	data
}: {
	data: PageData;
} = $props();

</script>

<div class="h-full min-h-0">
	<WindowManager config={data.config}/>
</div>