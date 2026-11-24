<script lang="ts">
	import * as m from '#lib/paraglide/messages.js';

	/** Edits local property-use policy only. Unknown existing references remain selectable
	 * so an unrelated edit never silently clears them. Inherited policy is validated by the API.
	 */
	let {
		shapes,
		selected = $bindable<string[]>([]),
		required = $bindable<boolean | undefined>()
	}: {
		shapes: { iri: string }[];
		selected?: string[];
		required?: boolean;
	} = $props();

	const choices = $derived([...new Set([...shapes.map((shape) => shape.iri), ...selected])].sort());
	const available = $derived(new Set(shapes.map((shape) => shape.iri)));
	const requirement = $derived(required === undefined ? 'unset' : String(required));

	function toggle(iri: string, checked: boolean) {
		selected = checked
			? [...new Set([...selected, iri])]
			: selected.filter((value) => value !== iri);
	}
</script>

<fieldset class="mt-4 space-y-2 border-t pt-3">
	<legend class="text-sm font-semibold">{m.reifier_policy()}</legend>
	<p class="text-xs">{m.reifier_policy_help()}</p>
	<fieldset class="space-y-1">
		<legend class="text-xs font-medium">{m.reifier_policy_shapes()}</legend>
		{#each choices as iri (iri)}
			<label class="flex items-center gap-2 text-xs">
				<input
					type="checkbox"
					checked={selected.includes(iri)}
					onchange={(event) => toggle(iri, event.currentTarget.checked)}
				/>
				<span
					>{iri}{#if !available.has(iri)}
						— {m.reifier_policy_missing()}{/if}</span
				>
			</label>
		{:else}
			<p class="text-xs">{m.reifier_policy_empty()}</p>
		{/each}
	</fieldset>
	<label class="block text-xs">
		<span class="block">{m.reifier_policy_required()}</span>
		<select
			class="oldap-textfield-common w-full"
			value={requirement}
			onchange={(event) => {
				const value = event.currentTarget.value;
				required = value === 'unset' ? undefined : value === 'true';
			}}
		>
			<option value="unset">{m.reifier_policy_unset()}</option>
			<option value="true">{m.reifier_policy_true()}</option>
			<option value="false">{m.reifier_policy_false()}</option>
		</select>
	</label>
</fieldset>
