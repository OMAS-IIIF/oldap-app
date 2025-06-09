<script lang="ts">
	import { page } from '$app/state';

	import { afterNavigate } from '$app/navigation';


</script>

<h1>{page?.error?.message}</h1>