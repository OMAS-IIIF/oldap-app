<script lang="ts">

	import { languageTag } from '$lib/paraglide/runtime';
	import type { PageProps } from './$types';
	import * as m from '$lib/paraglide/messages';
	import { userStore } from '$lib/stores/user';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import { OldapUser } from '$lib/oldap/classes/user';
	import Textfield from '$lib/components/basic_gui/inputs/Textfield.svelte';
	import { OldapProject } from '$lib/oldap/classes/project';
	import LangstringField from '$lib/components/basic_gui/inputs/LangstringField.svelte';
	import { LangString } from '$lib/oldap/datatypes/langstring';
	import DropdownMenu from '$lib/components/basic_gui/dropdown/DropdownMenu.svelte';
	import DropdownButtonItem from '$lib/components/basic_gui/dropdown/DropdownButtonItem.svelte';
	import DropdownButton from '$lib/components/basic_gui/dropdown/DropdownButton.svelte';
	import { DataPermission } from '$lib/oldap/enums/data_permissions';
	import DropdownLinkItem from '$lib/components/basic_gui/dropdown/DropdownLinkItem.svelte';
	import DropdownLabel from '$lib/components/basic_gui/dropdown/DropdownLabel.svelte';

	let { data } : PageProps = $props();

	const permset_iri_pattern: RegExp = /^(https?:\/\/[^\s<>"]+|urn:[^\s<>"]+|[A-Za-z_][\w.-]*:[\w.-]+)$/;
	const ncname_pattern: RegExp = /^[A-Za-z_][A-Za-z0-9._-]*$/;

	let lang = $state(languageTag());

	let authinfo: AuthInfo | null = $authInfoStore;
	let administrator = $state<OldapUser | null>(null);

	let permset: OldapProject;
	let permsetIri = $state('');
	let permsetid = $state('');
	let label_field: LangstringField;
	let label = $state<LangString | null>(null);
	let comment_field: LangstringField;
	let comment = $state<LangString | null>(null);


	let permission_select_open = $state(false);

	const allPermissions = Object.values(DataPermission) as DataPermission[];
	let currentPermission = $state(DataPermission.DATA_RESTRICTED);

	let topwin = $state<HTMLElement>();

	userStore.subscribe((admin) => {
		administrator = admin;
	});

	authInfoStore.subscribe(data => {
		authinfo = data;
	})

	function scrollToTop() {
		if (topwin) {
			topwin.scrollTo({ top: -1000, behavior: 'smooth' });
		}
	}


</script>

<div class="absolute top-0 left-0 right-0 bottom-0 overflow-auto flex flex-col justify-center items-center" bind:this={topwin}>
	<div>{data.permsetid !== 'new' ? m.edit()  : m.add()} {m.permset()} </div>
	<form class="max-w-128 min-w-96">
		<Textfield type='text' label={m.permset_iri()} name="permsetiri" id="permsetiri" placeholder="permset Iri" required={false}
							 bind:value={permsetIri} pattern={permset_iri_pattern} disabled={data?.permsetid !== 'new'} />
		<Textfield type='text' label={m.permset_id()} name="permsetid" id="permsetid" placeholder="permset ID" required={true}
							 bind:value={permsetid} pattern={ncname_pattern} disabled={data?.permsetid !== 'new'} />
		<!--
		<DropdownButton bind:isOpen={permission_select_open} buttonText={currentPermission} name="add-proj-menu" class="text-xs">
			<DropdownMenu bind:isOpen={permission_select_open} name="add-proj-menu" id="add-proj-menu-id" size="" transparent={false}>
				{#each allPermissions as perm}
					<DropdownButtonItem bind:isOpen={permission_select_open} onclick={() => {}}>{perm}</DropdownButtonItem>
				{/each}
			</DropdownMenu>
		</DropdownButton>
		-->
		<DropdownLabel bind:isOpen={permission_select_open} name="permission"
									 labelText={currentPermission}>
			<DropdownMenu bind:isOpen={permission_select_open} position="left" name="permission" id="permission-id">
				{#each allPermissions as perm}
					<DropdownLinkItem bind:isOpen={permission_select_open}
														onclick={() => {currentPermission = perm}} id="oldap"
														selected={perm === currentPermission}>
						{perm}
					</DropdownLinkItem>
				{/each}
			</DropdownMenu>
		</DropdownLabel>

		<LangstringField bind:this={label_field} label={m.label()} name="label" id="label" placeholder="label" value={label} />
		<LangstringField bind:this={comment_field} label="COMMENT" name="comment" id="comment" placeholder="comment" value={comment} />


	</form>
</div>