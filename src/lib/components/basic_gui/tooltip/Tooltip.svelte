<script>
	import { fly } from "svelte/transition";
	let { children, text } = $props()
	let show = $state(false);
</script>

<div class="tooltip-wrapper" role="tooltip" aria-roledescription="tooltip"
		 onmouseenter={() => (show = true)}
		 onmouseleave={() => (show = false)}>

	{@render children()}
</div>

			{#if show}
		<div class="tooltip" transition:fly={{ y: -5, duration: 150 }}>
			{text}
		</div>
			{/if}

<style>
    .tooltip-wrapper {
        position: relative;
        display: inline-block;
    }

    .tooltip {
        position: absolute;
        bottom: 120%;
        left: 50%;
        transform: translateX(-50%);
        background: black;
        color: white;
        padding: 6px 10px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0.9;
        transition: opacity 0.2s ease-in-out;
        z-index: 9999!important;
    }
</style>