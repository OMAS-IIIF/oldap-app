<script lang="ts">

	import { LangString } from '$lib/oldap/datatypes/langstring';

	let {
		/** @param {string} label The label to be used for the text field */
		label,

		/** @param {string} name The HTML input element name */
		name,

		/** @param {string} [id] Optional `id` for the HTML input element */
		id,

		value = $bindable(null),

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
		value: Date | null,
		range?: number,
		required?: boolean,
		disabled?: boolean,
		class?: string
	} = $props();

	let current: Date = new Date();
	let year = $state<number>(current.getFullYear());
	let month = $state<number>(current.getMonth());
	let day = $state<number>(current.getDay());
	let dayrange = $derived(getDaysInMonth(year, month));
	let is_used = $state<boolean>(false);

	let monthlist = [
		'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
	]

	$effect(() => {
		if (value === null) return;
		year = value.getFullYear();
		month = value.getMonth();
		day = value.getDay();
		is_used = true;
	});

	function getDaysInMonth(year: number, month: number) {
		// month is 1-based (1 = January, 12 = December)
		return new Date(year, month + 1, 0).getDate();
	}

	function getWeekday(year: number, month: number, day: number) {
		// month is 1-based (1 = January, 12 = December)
		return new Date(year, month + 1, day).getDay();
	}

	const set_today = () => {
		year = current.getFullYear();
		month = current.getMonth();
		day = current.getDay();
	}

</script>

<div class="mt-3">
	<label for={id} class="{required ? 'underline' : ''} block text-xs/4 font-medium text-input-label-fg dark:text-input-label-fg-dark">{label}:</label>
	<div>
		{#if !required}
			<input type="checkbox" bind:checked={is_used}/>
		{/if}
		<select name="year" id={`${id}_year`} bind:value={year} disabled={disabled || !is_used}
						class="appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
			{#each Array.from(Array(range).keys()) as i}
				<option value={year + i - range/2} selected={year + i - range/2 === year}>{year + i - range/2}</option>
			{/each}
		</select>


		<select name="month" id={`${id}_month`} bind:value={month}  disabled={disabled || !is_used}
						class="appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
			{#each monthlist as m, i}
				<option value={i} selected={i === month}>{m}</option>
			{/each}
		</select>
		<select name="day" id={`${id}_day`} bind:value={day}  disabled={disabled || !is_used}
						class="appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
			{#each Array.from(Array(dayrange).keys()) as i}
				<option value={i + 1} selected={i + 1 === day}>{i + 1}</option>
			{/each}
		</select>
	</div>

</div>