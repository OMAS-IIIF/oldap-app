<!--
  - Copyright (©) 2026. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
  -->

<!-- ResourceLinkSearchField.svelte -->
<svelte:options runes={true} />
<script lang="ts">
	/** OLDAP field name: usually a QName like "schema:familyName" */
	export type OldapFieldName = string;

	export type SearchHit = {
		iri: string;   // selected resource IRI
		text: string;  // display text (value of the searched field)
	};

	export type SearchFn = (args: { field: OldapFieldName; q: string; limit: number }) => Promise<SearchHit[]>;

	let {
		name,
		id,
		value = $bindable<string | undefined>(undefined),

		field,
		search,

		limit = 10,
		minChars = 2,
		placeholder = '',
		disabled = false,
		readonly = false
	}: {
		name: string;
		id?: string;
		value?: string;
		field: OldapFieldName;
		search: SearchFn;
		limit?: number;
		minChars?: number;
		placeholder?: string;
		disabled?: boolean;
		readonly?: boolean;
	} = $props();

	let query = $state('');
	let results = $state<SearchHit[]>([]);
	let open = $state(false);
	let loading = $state(false);
	let errorText = $state<string | null>(null);

	let debounceHandle: ReturnType<typeof setTimeout> | null = null;
	let reqId = 0;

	// When user edits text after a selection, the stored IRI is no longer valid.
	let lastSelectedText = $state<string | null>(null);

	function choose(hit: SearchHit) {
		value = hit.iri;
		query = hit.text;
		lastSelectedText = hit.text;
		open = false;
		results = [];
	}

	function clearSelection() {
		value = undefined;
		query = '';
		lastSelectedText = null;
		open = false;
		results = [];
	}

	function onUserTyped(newVal: string) {
		// If user changes the selected text, drop the selected iri.
		if (value && lastSelectedText !== null && newVal !== lastSelectedText) {
			value = undefined;
			lastSelectedText = null;
		}
	}

	$effect(() => {
		if (disabled || readonly) return;

		if (debounceHandle) clearTimeout(debounceHandle);

		const q = query.trim();
		if (q.length < minChars) {
			results = [];
			open = false;
			errorText = null;
			loading = false;
			return;
		}

		debounceHandle = setTimeout(async () => {
			const myId = ++reqId;
			loading = true;
			errorText = null;

			try {
				const res = await search({ field, q, limit });
				if (myId !== reqId) return;
				results = res ?? [];
				open = true;
			} catch (e) {
				if (myId !== reqId) return;
				errorText = 'Search failed';
				results = [];
				open = true;
			} finally {
				if (myId === reqId) loading = false;
			}
		}, 200);
	});

	function handleBlur() {
		setTimeout(() => (open = false), 150);
	}
</script>

<div class="relative">
	<div class="flex gap-2 items-center">
		<input
			class="w-full py-1.0 oldap-textfield-common {disabled ? 'oldap-textfield-disabled' : 'oldap-textfield-valid'}"
			{name}
			{id}
			placeholder={placeholder}
			bind:value={query}
			oninput={(e) => onUserTyped((e.target as HTMLInputElement).value)}
			{disabled}
			{readonly}
			onfocus={() => {
        if (results.length || loading || errorText) open = true;
      }}
			onblur={handleBlur}
		/>

		{#if value}
			<button
				type="button"
				class="px-2 py-1 rounded-md border text-sm"
				onclick={clearSelection}
				disabled={disabled || readonly}
				title="Clear selection"
				aria-label="Clear selection"
			>
				×
			</button>
		{/if}
	</div>

	{#if open}
		<div class="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-sm max-h-60 overflow-auto">
			{#if loading}
				<div class="p-2 text-sm opacity-70">Searching…</div>
			{:else if errorText}
				<div class="p-2 text-sm text-red-600">{errorText}</div>
			{:else if results.length === 0}
				<div class="p-2 text-sm opacity-70">No matches</div>
			{:else}
				{#each results as hit (hit.iri)}
					<button
						type="button"
						class="w-full text-left p-2 hover:bg-black/5"
						onclick={() => choose(hit)}
					>
						<div class="text-sm">{hit.text}</div>
					</button>
				{/each}
			{/if}
		</div>
	{/if}
</div>