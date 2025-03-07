<script lang="ts">

	let { children, text } = $props();

	let enclosingEl = $state<HTMLElement | null>(null);

	let tooltipEl: HTMLElement | null = null;

	function show() {
		if (!enclosingEl) {
			return;
		}
		const rect = enclosingEl.getBoundingClientRect();

		tooltipEl = document.createElement('div');
		tooltipEl.className = 'tooltip';
		document.body.appendChild(tooltipEl);
		tooltipEl.textContent = text;
		Object.assign(tooltipEl?.style, {
			position: 'absolute',
			left: `${rect.left + window.scrollX}px`,
			top: `${rect.bottom + window.scrollY + 8}px`,
			background: 'black',
			color: 'white',
			padding: '5px 10px',
			borderRadius: '4px',
			fontSize: '12px',
			whiteSpace: 'nowrap',
			zIndex: '1000'
		});
	}

	function hide() {
		console.log('--->MOUSE LEFT');
		tooltipEl?.remove();
	}
</script>

<div role="tooltip" bind:this={enclosingEl} onmouseenter={show} onmouseleave={hide}>
	{@render children()}
</div>

<!-- <TooltipHelper text={text} bind:open={showTooltip} anchor={buttonEl} /> -->