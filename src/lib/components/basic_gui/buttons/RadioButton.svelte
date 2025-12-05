<!--
  - Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
-->

<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * Tailwind-based Radio Button for Svelte 5 ($runes)
	 *
	 * Usage:
	 *  <RadioButton name="group1" value="a" bind:selected={choice}>A</RadioButton>
	 *  <RadioButton name="group1" value="b" bind:selected={choice}>B</RadioButton>
	 */

	type ChangeHandler<T> = (value: T) => void | Promise<void>;

	let {
		// visual/content
		children,
		class: userClass = '',

		// radio grouping
		name,
		value,
		selected = $bindable<unknown>(),

		// behavior
		disabled = false,
		id = undefined as string | undefined,
		onChange = undefined as ChangeHandler<unknown> | undefined,
		ariaLabel = undefined as string | undefined
	}: {
		children?: Snippet;
		class?: string;
		name: string;
		value: unknown;
		selected: unknown; // bindable
		disabled?: boolean;
		id?: string;
		onChange?: ChangeHandler<unknown>;
		ariaLabel?: string;
	} = $props();


	function onInputChange(e: Event) {
		if (disabled) return;
		onChange?.(value);
	}

	// no-op
</script>

<label
	class="inline-flex items-center gap-2 select-none cursor-pointer text-sm {disabled ? 'opacity-50 cursor-not-allowed' : ''} {userClass}">
	<!-- Native input kept for a11y, visually hidden via sr-only and used as peer -->
	<input
		type="radio"
		{name}
		{id}
		value={value}
		aria-label={ariaLabel}
		disabled={disabled}
		bind:group={selected}
		onchange={onInputChange}
	/>

	<!-- Label content -->
	<span class="leading-none text-gray-900 dark:text-gray-100">
    {@render children?.()}
  </span>
</label>

