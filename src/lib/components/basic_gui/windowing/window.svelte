<!--
  - Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
  -->

<script lang="ts">

	import type { Snippet } from 'svelte';

	let {
		/** @type {Snippet} */
		children,

		/** @type {number} */
		width = 400,

		/** @type {number} */
		height = 300,
	} : {
		children: Snippet;
		width?: number;
		height?: number;
	} = $props();
</script>

<div class="window">

</div>