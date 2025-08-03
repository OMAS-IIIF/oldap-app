<script lang="ts">

	let { children, text, delay = 750 } = $props();

	let enclosingEl = $state<HTMLElement | null>(null);

	let tooltipEl: HTMLElement | null = null;

	let showTimeout: ReturnType<typeof setTimeout> | null = null;

	function show() {
		if (!enclosingEl) return;

		showTimeout = setTimeout(() => {
			const rect = enclosingEl.getBoundingClientRect();
			let top = rect.bottom + window.scrollY;
			let bottom = document.documentElement.clientHeight - top;
			let left = rect.left + window.scrollX;
			let right = document.documentElement.clientWidth - (rect.right + window.scrollX);

			tooltipEl = document.createElement('div');
			tooltipEl.className = 'oldap-tooltip';
			document.body.appendChild(tooltipEl);
			tooltipEl.textContent = text;

			requestAnimationFrame(() => {
				if (!tooltipEl) return;
				let ele_width2 = Math.round(tooltipEl.offsetWidth / 2.0);
				let ele_height = tooltipEl.offsetHeight;
				if (left < (ele_width2 + 10)) {
					Object.assign(tooltipEl.style, {
						left: `${rect.left + window.scrollX}px`
					});
				} else if (right < (ele_width2 + 10)) {
					Object.assign(tooltipEl.style, {
						//right: `${rect.right + window.scrollX - ele_width2}px`
						right: `${ele_width2}px`
					});
				} else {
					Object.assign(tooltipEl.style, {
						left: `${rect.left + window.scrollX - ele_width2}px`
					});
				}

				if (bottom < (ele_height + 10)) {
					Object.assign(tooltipEl.style, {
						bottom: `${rect.top + window.scrollY - 8}px`
					});
				} else {
					Object.assign(tooltipEl.style, {
						top: `${rect.bottom + window.scrollY + 8}px`
					});
				}
			});
		}, delay);
	}

	function hide() {
		if (showTimeout) {
			clearTimeout(showTimeout);
			showTimeout = null;
		}
		tooltipEl?.remove();
	}
</script>

<div role="tooltip" bind:this={enclosingEl} onmouseenter={show} onmouseleave={hide}>
	{@render children()}
</div>
