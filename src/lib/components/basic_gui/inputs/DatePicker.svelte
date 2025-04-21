<script lang="ts">

	import { LangString } from '$lib/oldap/datatypes/langstring';
	import { XsdDate } from '$lib/oldap/datatypes/xsd_date';

	let {
		/** @param {string} label The label to be used for the text field */
		label,

		/** @param {string} name The HTML input element name */
		name,

		/** @param {string} [id] Optional `id` for the HTML input element */
		id,

		value = null,

		range = 20,

		/** @param {boolean} [required] Optional flag to indicate of the field is mandatory. Defaults to false */
		required = undefined,

		/** @param {boolean} [disabled] Optional bindable flag to indicate if the field is disabled */
		disabled = $bindable(false),

		/** @param {string} [class] Optional string that is passed to the class attribute of HTML input element. Defaults to an empty string */
		class: userClass = ''

	}: {
		label: string,
		name: string,
		id?: string,
		value: XsdDate | null,
		range?: number,
		required?: boolean,
		disabled?: boolean,
		class?: string
	} = $props();

	let current: Date = new Date();
	let year = $state<number>(current.getFullYear());
	let month = $state<number>(current.getMonth()); // zero based
	let day = $state<number>(current.getDate());
	let dayrange = $derived(getDaysInMonth(year, month));
	let is_used = $state<boolean>(false);

	let monthlist = [
		'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
	]

	$effect(() => {
		if (value === null) return;
		year = value.year;
		month = value.month - 1; // month is zero based, value.month (XsdDate) is 1-based!
		day = value.day;
		console.log("*****>", year, month, day);
		is_used = true;
	});

	export const get_value = () => {
		if (!is_used) return null;
		console.log(year, month, day);
		return new XsdDate(year, month + 1, day);
	}

	function getDaysInMonth(year: number, month: number) {
		return new Date(year, month, 0).getDate();
	}

	function getWeekday(year: number, month: number, day: number) {
		return new Date(year, month, day).getDay();
	}

	const set_today = () => {
		year = current.getFullYear();
		month = current.getMonth(); // zero based
		day = current.getDay();
	}

</script>

<div class="mt-3">
	<label for={id}
				 class="{required ? 'underline' : ''} block text-xs/4 font-medium text-input-label-fg dark:text-input-label-fg-dark">{label}
		:</label>
	<div>
		{#if !required}
			<input type="checkbox" bind:checked={is_used} />
		{/if}

		<div class="relative inline-block w-auto mt-2 grid-cols-1">
			<select name="year" id={`${id}_year`} bind:value={year} disabled={disabled || !is_used}
							class="appearance-none rounded-md bg-white pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
				{#each Array.from(Array(range).keys()) as i}
					<option value={year + i - range/2} selected={year + i - range/2 === year}>{year + i - range / 2}</option>
				{/each}
			</select>
			<svg
				class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
				viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
				<path fill-rule="evenodd"
							d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
							clip-rule="evenodd" />
			</svg>
		</div>

		<div class="relative inline-block w-auto mt-2 grid-cols-1">
			<select name="month" id={`${id}_month`} bind:value={month} disabled={disabled || !is_used}
							class="appearance-none rounded-md bg-white pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
				{#each monthlist as m, i}
					<option value={i} selected={i === month}>{m}</option>
				{/each}
			</select>
			<svg
				class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
				viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
				<path fill-rule="evenodd"
							d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
							clip-rule="evenodd" />
			</svg>
		</div>

		<div class="relative inline-block w-auto mt-2 grid-cols-1">
			<select name="day" id={`${id}_day`} bind:value={day} disabled={disabled || !is_used}
							class="appearance-none rounded-md bg-white pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
				{#each Array.from(Array(dayrange).keys()) as i}
					<option value={i + 1} selected={i + 1 === day}>{i + 1}</option>
				{/each}
			</select>
			<svg
				class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
				viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
				<path fill-rule="evenodd"
							d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
							clip-rule="evenodd" />
			</svg>
		</div>
	</div>
</div>