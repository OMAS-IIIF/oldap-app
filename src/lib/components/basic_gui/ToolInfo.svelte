<!--
  @component

  Eine erweiterte HTML-Tooltip-Komponente mit Tailwind CSS für Svelte 5.
-->

<script lang="ts">
	type Position = 'top' | 'bottom' | 'left' | 'right' | 'auto';

	let {
		content = '',
		position = 'top',
		showDelay = 300,
		hideDelay = 100,
		disabled = false,
		maxWidth = 'max-w-sm',
		class: additionalClass = '',
		triggerClass = '',
		children
	}: {
		content?: string;
		position?: Position;
		showDelay?: number;
		hideDelay?: number;
		disabled?: boolean;
		maxWidth?: string;
		class?: string;
		triggerClass?: string;
		children?: any;
	} = $props();

	let isVisible = $state(false);
	let triggerElement = $state<HTMLElement>();
	let tooltipElement = $state<HTMLElement>();
	let showTimeout: ReturnType<typeof setTimeout> | undefined = $state();
	let hideTimeout: ReturnType<typeof setTimeout> | undefined = $state();
	let actualPosition = $state<Position>(position);
	let tooltipStyles = $state('');

	// ✅ Normale Variable statt $derived für HTML-Inhalt
	let sanitizedContent = $state('');

	// ✅ Effect um sanitizedContent zu aktualisieren
	$effect(() => {
		sanitizedContent = content
			.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
			.replace(/<(?!\/?)(?!(?:b|strong|i|em|u|br|p|span|div|h[1-6]|ul|ol|li|a|code|pre)\b)[^>]+>/gi, '');
	});

	// Tooltip anzeigen
	const showTooltip = () => {
		if (disabled || !content.trim()) return;

		clearTimeout(hideTimeout);
		showTimeout = setTimeout(() => {
			isVisible = true;
			setTimeout(calculatePosition, 10);
		}, showDelay);
	};

	// Tooltip verstecken
	const hideTooltip = () => {
		clearTimeout(showTimeout);
		hideTimeout = setTimeout(() => {
			isVisible = false;
		}, hideDelay);
	};

	// Position berechnen
	const calculatePosition = () => {
		if (!triggerElement || !tooltipElement) return;

		const triggerRect = triggerElement.getBoundingClientRect();
		const tooltipRect = tooltipElement.getBoundingClientRect();
		const viewport = {
			width: window.innerWidth,
			height: window.innerHeight
		};

		let finalPosition = position;

		if (position === 'auto') {
			const spaceTop = triggerRect.top;
			const spaceBottom = viewport.height - triggerRect.bottom;
			const spaceLeft = triggerRect.left;
			const spaceRight = viewport.width - triggerRect.right;

			if (spaceBottom >= tooltipRect.height + 10) {
				finalPosition = 'bottom';
			} else if (spaceTop >= tooltipRect.height + 10) {
				finalPosition = 'top';
			} else if (spaceRight >= tooltipRect.width + 10) {
				finalPosition = 'right';
			} else {
				finalPosition = 'left';
			}
		}

		actualPosition = finalPosition;

		let top = 0;
		let left = 0;

		switch (finalPosition) {
			case 'top':
				top = triggerRect.top + window.scrollY - tooltipRect.height - 8;
				left = triggerRect.left + window.scrollX + (triggerRect.width - tooltipRect.width) / 2;
				break;
			case 'bottom':
				top = triggerRect.bottom + window.scrollY + 8;
				left = triggerRect.left + window.scrollX + (triggerRect.width - tooltipRect.width) / 2;
				break;
			case 'left':
				top = triggerRect.top + window.scrollY + (triggerRect.height - tooltipRect.height) / 2;
				left = triggerRect.left + window.scrollX - tooltipRect.width - 8;
				break;
			case 'right':
				top = triggerRect.top + window.scrollY + (triggerRect.height - tooltipRect.height) / 2;
				left = triggerRect.right + window.scrollX + 8;
				break;
		}

		left = Math.max(8, Math.min(left, viewport.width - tooltipRect.width - 8));
		top = Math.max(8, Math.min(top, viewport.height + window.scrollY - tooltipRect.height - 8));

		tooltipStyles = `top: ${top}px; left: ${left}px;`;
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape' && isVisible) {
			hideTooltip();
		}
	};

	$effect(() => {
		return () => {
			clearTimeout(showTimeout);
			clearTimeout(hideTimeout);
		};
	});

	// Arrow-Klassen als $derived (das ist OK, da es nicht für {@html} verwendet wird)
	const arrowClasses = $derived(() => {
		const base = 'absolute w-0 h-0';
		switch (actualPosition) {
			case 'top':
				return `${base} top-full left-1/2 -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-900`;
			case 'bottom':
				return `${base} bottom-full left-1/2 -translate-x-1/2 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-gray-900`;
			case 'left':
				return `${base} left-full top-1/2 -translate-y-1/2 border-t-[6px] border-b-[6px] border-l-[6px] border-t-transparent border-b-transparent border-l-gray-900`;
			case 'right':
				return `${base} right-full top-1/2 -translate-y-1/2 border-t-[6px] border-b-[6px] border-r-[6px] border-t-transparent border-b-transparent border-r-gray-900`;
			default:
				return `${base} top-full left-1/2 -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-900`;
		}
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<span
	bind:this={triggerElement}
	class="inline-block cursor-help {triggerClass}"
	onmouseenter={showTooltip}
	onmouseleave={hideTooltip}
	onfocus={showTooltip}
	onblur={hideTooltip}
	tabindex="0"
	role="button"
	aria-describedby={isVisible ? 'html-tooltip' : undefined}
>
  {@render children()}
</span>

{#if isVisible && content.trim()}
	<div
		bind:this={tooltipElement}
		id="html-tooltip"
		class="fixed z-[9999] bg-gray-900 text-white rounded-lg px-4 py-3 text-sm leading-relaxed shadow-xl pointer-events-none break-words {maxWidth} {additionalClass}"
		style={tooltipStyles}
		role="tooltip"
		aria-live="polite"
	>
		<div class="html-tooltip-content">
			{@html sanitizedContent}
		</div>
		<div class={arrowClasses}></div>
	</div>
{/if}