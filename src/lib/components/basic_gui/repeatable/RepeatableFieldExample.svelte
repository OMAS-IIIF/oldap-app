<svelte:options runes={true} />

<!--
  @component

  Small usage examples for `RepeatableField`.

  The first example shows a simple list of strings.
  The second example demonstrates that more complex child editors work as well,
  because the wrapper only manages the array and the action buttons.
-->
<script lang="ts">
	import RepeatableField from './RepeatableField.svelte';

	type Contact = {
		label: string;
		value: string;
	};

	let string_values = $state<string[]>(['']);
	let contacts = $state<Contact[]>([{ label: 'home', value: '' }]);
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-input-label-fg dark:text-input-label-fg-dark block text-xs/4 font-medium">
			Simple string example
		</h3>

		<div class="mt-2">
			<RepeatableField
				label="Simple string values"
				bind:values={string_values}
				minCount={1}
				maxCount={3}
				createEmpty={() => ''}
			>
				{#snippet children(value, index, update)}
					<input
						class="py-1.0 oldap-textfield-common oldap-textfield-valid w-full"
						{value}
						placeholder={`Value ${index + 1}`}
						oninput={(e) => update(index, e.currentTarget.value)}
					/>
				{/snippet}
			</RepeatableField>
		</div>
	</div>

	<div>
		<h3 class="text-input-label-fg dark:text-input-label-fg-dark block text-xs/4 font-medium">
			Complex object example
		</h3>

		<div class="mt-2">
			<RepeatableField
				label="Complex object values"
				bind:values={contacts}
				minCount={1}
				maxCount={4}
				createEmpty={() => ({ label: '', value: '' })}
			>
				{#snippet children(contact, index, update)}
					<div class="grid grid-cols-2 gap-2">
						<input
							class="py-1.0 oldap-textfield-common oldap-textfield-valid w-full"
							value={contact.label}
							placeholder="Label"
							oninput={(e) =>
								update(index, {
									...contact,
									label: e.currentTarget.value
								})}
						/>

						<input
							class="py-1.0 oldap-textfield-common oldap-textfield-valid w-full"
							value={contact.value}
							placeholder="Value"
							oninput={(e) =>
								update(index, {
									...contact,
									value: e.currentTarget.value
								})}
						/>
					</div>
				{/snippet}
			</RepeatableField>
		</div>
	</div>
</div>
