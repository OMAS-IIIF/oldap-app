<script lang="ts">
	import '../app.css';
	import Loginout from '$lib/components/Loginout.svelte';
	let { children } = $props();
</script>

<div class="navbar bg-base-100">
	<div class="flex-none">
		<a href="/" class="btn btn-ghost btn-sm text-xs">Home</a>
	</div>
	<div class="flex-none">
		<a href="/admin" class="btn btn-ghost btn-sm text-xs">Admin</a>
	</div>
	<div class="flex-none grow"></div>
	<div class="flex-none"><Loginout /></div>

</div>

<!--
<nav>
	<a href="/">Home</a>
	<a href="/about">About</a>
	<a href="/Admin">Admin</a>
</nav>
-->

{@render children()}
