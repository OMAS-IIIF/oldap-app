<script lang="ts">

	import DropdownMenu from '$lib/components/basic_gui/dropdown/DropdownMenu.svelte';
	import DropdownButton from '$lib/components/basic_gui/dropdown/DropdownButton.svelte';
	import DropdownLinkItem from '$lib/components/basic_gui/dropdown/DropdownLinkItem.svelte';
	import { onMount } from 'svelte';
	import { XsdDatatypes } from '$lib/oldap/enums/xsd_datatypes';
	import { datamodelStore } from '$lib/stores/datamodel';
	import { PropType, propTypeFromString } from '$lib/oldap/enums/proptypes';


	let {
		propiri,
		proptype = $bindable(PropType.LITERAL),
		datatype = $bindable(),
		toClass = $bindable(),
		label = 'PROPERTY',
		all_res_list,
		all_lists_list,
		disabled = false
	}: {
		propiri: string,
		proptype: PropType,
		datatype?: string,
		toClass?: string,
		label: string,
		all_res_list: string[],
		all_lists_list: string[],
		disabled: boolean
	} = $props();

	let proptype_is_open = $state(false);
	//let proptype = $state<PropType>(PropType.LITERAL);

	let datatype_is_open = $state(false);
	let datatypeOptions = $state<string[]>([]);

	let reslink_is_open = $state(false);
	//let all_res_list = $state<string[]>([]);

	let list_is_open = $state(false);
	//let all_lists_list = $state<string[]>([]);

	const types = Object.values(PropType);

	onMount(() => {
		datatypeOptions = Object.values(XsdDatatypes);

		if (propiri === 'new') {
			proptype = PropType.LITERAL;
		}
		else {
			if (datatype !== undefined) {
				proptype = PropType.LITERAL;
			}
			else if (toClass !== undefined) {
				//
				// distinguish between link to other resource or link to a list
				//
				if (all_res_list.includes(toClass)) {
					proptype = PropType.LINK;
				}
				else if (all_lists_list.includes(toClass)) {
					proptype = PropType.LIST;
				}
			}
			else {
				; // raise error – should never happen!
			}
		}
	});

/*
	$effect(() => {
		if (datatype !== undefined) {
			proptype = PropType.LITERAL;
		} else if (toClass !== undefined) {
			//
			// distinguish between link to other resource or link to a list
			//
			if (all_res_list.includes(toClass)) {
				proptype = PropType.LINK;
			} else if (all_lists_list.includes(toClass)) {
				proptype = PropType.LIST;
			}
		}
	});
*/

	$effect(() => {
		if (proptype === PropType.LITERAL) {
			datatype = datatypeOptions[0];
		}
		else if (proptype === PropType.LINK) {
			toClass = all_res_list[0];
		}
		else if (proptype === PropType.LIST) {
			toClass = all_lists_list[0];
		}
	});

</script>

<div class="mt-3">
	<label for="proptypesel_id" class="block text-xs/4 font-medium text-input-label-fg dark:text-input-label-fg-dark">{label}</label>
	<DropdownButton bind:isOpen={proptype_is_open} buttonText={proptype} name="proptypesel" {disabled} class="text-xs">
		<DropdownMenu bind:isOpen={proptype_is_open} position="left" name="proptypesel" id="proptypesel_id">
			{#each types as type}
				<DropdownLinkItem bind:isOpen={proptype_is_open}
													value={propTypeFromString(type)}
													onclick={(x: PropType) => {proptype = x}}
													selected={type === proptype}>
					{type}
				</DropdownLinkItem>
			{/each}
		</DropdownMenu>
	</DropdownButton>
	{#if proptype === 'LITERAL'}
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
	{:else if proptype === 'LINK'}
		<DropdownButton bind:isOpen={reslink_is_open} buttonText={toClass || all_res_list[0]} name="reslink" {disabled} class="text-xs">
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
	{:else if proptype === 'LIST'}
		<DropdownButton bind:isOpen={list_is_open} buttonText={toClass || all_lists_list[0]} name="listlink" {disabled} class="text-xs">
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

