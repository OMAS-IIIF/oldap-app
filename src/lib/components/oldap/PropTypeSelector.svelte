<script lang="ts">

	import DropdownMenu from '$lib/components/basic_gui/dropdown/DropdownMenu.svelte';
	import DropdownButton from '$lib/components/basic_gui/dropdown/DropdownButton.svelte';
	import DropdownLinkItem from '$lib/components/basic_gui/dropdown/DropdownLinkItem.svelte';
	import { onMount } from 'svelte';
	import { XsdDatatypes } from '$lib/oldap/enums/xsd_datatypes';
	import { datamodelStore } from '$lib/stores/datamodel';
	import { Iri } from '$lib/oldap/datatypes/xsd_iri';

	let { propiri, datatype = $bindable(), toClass = $bindable(), label = 'PROPERTY', disabled = false }: {propiri: string, datatype?: string, toClass?: string, label: string, disabled: boolean} = $props();

	let proptype_is_open = $state(false);
	let selectedType = $state('LITERAL');

	let datatype_is_open = $state(false);
	let datatypeOptions = $state<string[]>([]);

	let reslink_is_open = $state(false);
	let all_res_list = $state<string[]>([]);

	let list_is_open = $state(false);
	let all_lists_list = $state<string[]>([]);

	const types = [
		'LITERAL', 'LINK', 'LIST'
	]

	onMount(() => {
		datatypeOptions = Object.values(XsdDatatypes);
		const tmp_resources = $datamodelStore?.resouces.filter(x => {
			const gaga = x?.superclass?.map(s => s.toString()) || [];
			return !gaga.includes('oldap:OldapListNode');
		}) || [];
		all_res_list = tmp_resources.map(r => r.iri.toString()) ?? [];

		const tmp_lists = $datamodelStore?.resouces.filter(x => {
			const gaga = x?.superclass?.map(s => s.toString()) || [];
			return gaga.includes('oldap:OldapListNode');
		}) || [];
		all_lists_list = tmp_lists.map(r => r.iri.toString()) ?? [];

		if (propiri === 'new') {
			selectedType = 'LITERAL';
		}
		else {
			if (datatype !== undefined) {
				selectedType = 'LITERAL';
			}
			else if (toClass !== undefined) {
				//
				// distinguish between link to other resource or link to a list
				//
				if (all_res_list.includes(toClass)) {
					selectedType = 'LINK';
				}
				else if (all_lists_list.includes(toClass)) {
					selectedType = 'LIST';
				}
			}
			else {
				; // raise error – should never happen!
			}
		}
	});

	$effect(() => {
		if (datatype !== undefined) {
			selectedType = 'LITERAL';
		} else if (toClass !== undefined) {
			//
			// distinguish between link to other resource or link to a list
			//
			if (all_res_list.includes(toClass)) {
				selectedType = 'LINK';
			} else if (all_lists_list.includes(toClass)) {
				selectedType = 'LIST';
			}
		}
	});

</script>

<div class="mt-3">
	<label for="proptypesel_id" class="block text-xs/4 font-medium text-input-label-fg dark:text-input-label-fg-dark">{label}</label>
	<DropdownButton bind:isOpen={proptype_is_open} buttonText={selectedType} name="proptypesel" {disabled} class="text-xs">
		<DropdownMenu bind:isOpen={proptype_is_open} position="left" name="proptypesel" id="proptypesel_id">
			{#each types as type}
				<DropdownLinkItem bind:isOpen={proptype_is_open}
													onclick={() => {selectedType = type}}
													selected={type === selectedType}>
					{type}
				</DropdownLinkItem>
			{/each}
		</DropdownMenu>
	</DropdownButton>
	{#if selectedType === 'LITERAL'}
		<DropdownButton bind:isOpen={datatype_is_open} buttonText={datatype || datatypeOptions[0]} name="datatype" {disabled} class="text-xs">
			<DropdownMenu bind:isOpen={datatype_is_open} position="left" name="datatype">
				{#each datatypeOptions as dtype}
					<DropdownLinkItem bind:isOpen={datatype_is_open}
														onclick={() => {datatype = dtype}}
														selected={dtype === datatype}>
						{dtype}
					</DropdownLinkItem>
				{/each}
			</DropdownMenu>
		</DropdownButton>
	{:else if selectedType === 'LINK'}
		<DropdownButton bind:isOpen={reslink_is_open} buttonText={toClass || all_lists_list[0]} name="reslink" {disabled} class="text-xs">
			<DropdownMenu bind:isOpen={reslink_is_open} position="left" name="reslink">
				{#each all_res_list as res}
					<DropdownLinkItem bind:isOpen={reslink_is_open}
														onclick={() => {toClass = res}}
														selected={res === toClass}>
						{res}
					</DropdownLinkItem>
				{/each}
			</DropdownMenu>
		</DropdownButton>
	{:else if selectedType === 'LIST'}
		<DropdownButton bind:isOpen={list_is_open} buttonText={toClass || all_res_list[0]} name="listlink" {disabled} class="text-xs">
			<DropdownMenu bind:isOpen={list_is_open} position="left" name="listlink">
				{#each all_lists_list as list}
					<DropdownLinkItem bind:isOpen={list_is_open}
														onclick={() => {toClass = list}}
														selected={list === toClass}>
						{list}
					</DropdownLinkItem>
				{/each}
			</DropdownMenu>
		</DropdownButton>

	{/if}

</div>

