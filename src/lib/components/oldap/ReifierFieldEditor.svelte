<script lang="ts">
	import { untrack } from 'svelte';
	import * as m from '$lib/paraglide/messages';
	import { projectStore } from '$lib/stores/project';
	import { datamodelStore } from '$lib/stores/datamodel';
	import { datamodelOldapStore } from '$lib/stores/datamodel_oldap';
	import { datamodelSharedStore } from '$lib/stores/datamodel_shared';
	import { getLocale, locales } from '$lib/paraglide/runtime';
	import { XsdDatatypes } from '$lib/oldap/enums/xsd_datatypes';
	import AllowedValues from './AllowedValues.svelte';
	import AllowedLangSelector from './AllowedLangSelector.svelte';
	import type { ReifierField } from '$lib/oldap/classes/reifierShape';

	/** Edit a detached shape field. Bound constraints change only through user events;
	 * untouched metadata survives complete shape replacement. Read-only viewers may
	 * still select the display language. Explicit type changes clear incompatible constraints. */
	let {
		value = $bindable(),
		index,
		readonly = false,
		onremove
	}: {
		value: ReifierField;
		index: number;
		readonly?: boolean;
		onremove: () => void;
	} = $props();
	let language = $state(getLocale());
	const datatypes = Object.values(XsdDatatypes);
	const inputClass = 'oldap-textfield-common oldap-textfield-valid w-full px-2 py-1';
	const qnamePattern = '[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*';
	const localNamePattern = '[A-Za-z_][A-Za-z0-9._-]*';
	const separator = $derived(value.iri.indexOf(':'));
	const fieldPrefix = $derived(separator < 0 ? '' : value.iri.slice(0, separator));
	const fieldLocalName = $derived(separator < 0 ? value.iri : value.iri.slice(separator + 1));
	const ownerPrefix = $derived(
		$projectStore?.projectShortName.toString() ?? $datamodelStore?.projectid.toString() ?? ''
	);
	const parentReadonly = $derived(readonly || (!!ownerPrefix && fieldPrefix !== ownerPrefix));
	/** Rows belong to this keyed, detached field draft. Empty rows are presentation
	 * only; changes publish all nonempty parents without touching other constraints. */
	let parentRows = $state(
		untrack(() => {
			const parents =
				value.subPropertyOf === undefined
					? []
					: Array.isArray(value.subPropertyOf)
						? value.subPropertyOf
						: [value.subPropertyOf];
			return (parents.length ? parents : ['']).map((parent) => {
				const fullIri = /^(https?:|urn:)/.test(parent);
				const colon = parent.indexOf(':');
				return {
					fullIri,
					prefix: colon < 0 || fullIri ? fieldPrefix : parent.slice(0, colon),
					name: fullIri ? parent : colon < 0 ? '' : parent.slice(colon + 1)
				};
			});
		})
	);

	function publishParents() {
		const parents = [
			...new Set(
				parentRows
					.filter((row) => row.name.trim())
					.map((row) => (row.fullIri ? row.name.trim() : `${row.prefix}:${row.name.trim()}`))
			)
		];
		value.subPropertyOf = parents.length > 1 ? parents : parents[0];
	}

	function removeParent(position: number) {
		parentRows.splice(position, 1);
		if (!parentRows.length) parentRows.push({ fullIri: false, prefix: fieldPrefix, name: '' });
		publishParents();
	}
	const prefixes = $derived([
		...new Set(
			[
				$projectStore?.projectShortName.toString() ?? $datamodelStore?.projectid.toString() ?? '',
				'oldap',
				'shared',
				'skos',
				'schema',
				'dcterms',
				...[$datamodelStore, $datamodelOldapStore, $datamodelSharedStore].flatMap(
					(model) => model?.externalOntologies.map((ontology) => ontology.prefix.toString()) ?? []
				),
				fieldPrefix
			].filter(Boolean)
		)
	]);

	/** Keep one canonical QName in the draft; each control changes only its own part.
	 * Existing prefixes remain selectable even when their ontology is not loaded. */
	function setFieldIri(prefix: string, localName: string) {
		value.iri = prefix ? `${prefix}:${localName}` : localName;
	}
	const literal = $derived(value.datatype !== undefined);
	const stringTypes = new Set([
		'xsd:string',
		'rdf:langString',
		'xsd:normalizedString',
		'xsd:token',
		'xsd:language',
		'xsd:name',
		'xsd:NCName',
		'xsd:NMTOKEN',
		'xsd:ID',
		'xsd:IDREF'
	]);
	const numericTypes = new Set([
		'xsd:decimal',
		'xsd:float',
		'xsd:double',
		'xsd:integer',
		'xsd:nonPositiveInteger',
		'xsd:negativeInteger',
		'xsd:long',
		'xsd:int',
		'xsd:short',
		'xsd:byte',
		'xsd:nonNegativeInteger',
		'xsd:unsignedLong',
		'xsd:unsignedInt',
		'xsd:unsignedShort',
		'xsd:unsignedByte',
		'xsd:positiveInteger'
	]);
	const stringValue = $derived(stringTypes.has(value.datatype ?? ''));
	const numericValue = $derived(numericTypes.has(value.datatype ?? ''));
	const nodeKinds = [
		'sh:IRI',
		'sh:BlankNode',
		'sh:Literal',
		'sh:BlankNodeOrIRI',
		'sh:BlankNodeOrLiteral',
		'sh:IRIOrLiteral'
	];
	type NumericKey =
		| 'minCount'
		| 'maxCount'
		| 'minLength'
		| 'maxLength'
		| 'order'
		| 'minInclusive'
		| 'minExclusive'
		| 'maxInclusive'
		| 'maxExclusive';
	const boundFields = [
		{ key: 'minInclusive', label: () => m.reifier_min_inclusive() },
		{ key: 'minExclusive', label: () => m.reifier_min_exclusive() },
		{ key: 'maxInclusive', label: () => m.reifier_max_inclusive() },
		{ key: 'maxExclusive', label: () => m.reifier_max_exclusive() }
	] as const;

	/** Retain compatible restrictions within a datatype family; clear restrictions
	 * that cannot describe the newly selected values. This never runs on initial load. */
	function setDatatype(datatype: string | undefined) {
		const wasString = stringTypes.has(value.datatype ?? '');
		const wasNumeric = numericTypes.has(value.datatype ?? '');
		const nextString = stringTypes.has(datatype ?? '');
		const nextNumeric = numericTypes.has(datatype ?? '');
		if (!nextString) {
			delete value.minLength;
			delete value.maxLength;
			delete value.pattern;
		}
		if (!['rdf:langString', 'xsd:string'].includes(datatype ?? '')) {
			delete value.languageIn;
			delete value.uniqueLang;
		}
		if (!nextNumeric) for (const { key } of boundFields) delete value[key];
		if (!(wasString && nextString) && !(wasNumeric && nextNumeric)) delete value.inSet;
		value.datatype = datatype;
	}

	/** Keep language variants outside the selected language unchanged, including legacy values. */
	function labelText(key: 'name' | 'description'): string {
		const raw = value[key];
		const entries = typeof raw === 'string' ? [raw] : (raw ?? []);
		const found = entries.find((text) => text.endsWith(`@${language}`));
		return found ? found.slice(0, -(language.length + 1)) : '';
	}
	function setLabel(key: 'name' | 'description', text: string) {
		const raw = value[key];
		const entries = (typeof raw === 'string' ? [raw] : (raw ?? [])).filter(
			(entry) => !entry.endsWith(`@${language}`)
		);
		if (text.trim()) entries.push(`${text}@${language}`);
		value[key] = entries.length ? entries : undefined;
	}
	function setKind(kind: string) {
		setDatatype(undefined);
		delete value.nodeKind;
		delete value.toClass;
		delete value.class;
		// These two types are derived from the explicitly selected kind. Other metadata is retained.
		if (value.type)
			value.type = value.type.filter(
				(type) =>
					![
						'DataProperty',
						'ObjectProperty',
						'owl:DatatypeProperty',
						'owl:ObjectProperty'
					].includes(type)
			);
		if (kind === 'literal') setDatatype('xsd:string');
		else value.class = '';
	}
	function setNumber(key: NumericKey, text: string) {
		value[key] = text === '' ? undefined : Number(text);
	}
</script>

<fieldset class="rounded border border-gray-300 p-3 dark:border-gray-600">
	<legend class="px-1 text-sm font-semibold"
		>{value.iri || `${m.reifier_fields()} ${index + 1}`}</legend
	>
	<div class="grid gap-3 sm:grid-cols-2">
		<div class="grid gap-2 sm:col-span-2 sm:grid-cols-3">
			<label class="text-xs"
				>{m.reifier_prefix()}
				<select
					class={inputClass}
					disabled={readonly}
					required
					aria-label={`${m.reifier_prefix()} ${index + 1}`}
					value={fieldPrefix}
					onchange={(event) => setFieldIri(event.currentTarget.value, fieldLocalName)}
				>
					{#if !fieldPrefix}<option value="">{m.reifier_unspecified()}</option>{/if}
					{#each prefixes as prefix}<option value={prefix}>{prefix}</option>{/each}
				</select>
			</label>
			<label class="text-xs sm:col-span-2"
				>{m.reifier_field_iri()}
				<input
					disabled={readonly}
					class={inputClass}
					aria-label={`${m.reifier_field_iri()} ${index + 1}`}
					value={fieldLocalName}
					oninput={(event) => setFieldIri(fieldPrefix, event.currentTarget.value)}
					pattern={localNamePattern}
					required
				/>
			</label>
		</div>
		<div class="sm:col-span-2">
			{#each parentRows as row, parentIndex}
				<div class="mb-2 grid grid-cols-3 gap-2">
					{#if !row.fullIri}
						<label class="text-xs"
							>{m.reifier_parent_prefix()}
							<select
								class={inputClass}
								disabled={parentReadonly}
								aria-label={`${m.reifier_parent_prefix()} ${index + 1}${parentIndex ? `.${parentIndex + 1}` : ''}`}
								value={row.prefix}
								onchange={(event) => {
									row.prefix = event.currentTarget.value;
									publishParents();
								}}
							>
								{#each [...new Set([...prefixes, row.prefix].filter(Boolean))] as prefix}<option
										value={prefix}>{prefix}</option
									>{/each}
							</select>
						</label>
					{/if}
					<label class="text-xs {row.fullIri ? 'col-span-3' : 'col-span-2'}"
						>subPropertyOf
						<input
							class={inputClass}
							disabled={parentReadonly}
							aria-label={`subPropertyOf ${index + 1}${parentIndex ? `.${parentIndex + 1}` : ''}`}
							value={row.name}
							pattern={row.fullIri ? undefined : localNamePattern}
							oninput={(event) => {
								row.name = event.currentTarget.value;
								publishParents();
							}}
						/>
					</label>
					{#if !parentReadonly && (parentRows.length > 1 || row.name)}
						<button
							type="button"
							class="oldap-button col-span-3 justify-self-end text-xs"
							aria-label={`${m.superproperty_remove()} ${index + 1}.${parentIndex + 1}`}
							onclick={() => removeParent(parentIndex)}>{m.superproperty_remove()}</button
						>
					{/if}
				</div>
			{/each}
			{#if !parentReadonly}
				<button
					type="button"
					class="oldap-button text-xs"
					onclick={() => parentRows.push({ fullIri: false, prefix: fieldPrefix, name: '' })}
					>{m.superproperty_add()}</button
				>
			{/if}
			<p class="mt-1 text-xs text-gray-500">{m.reifier_parent_hint()}</p>
		</div>
		<label class="text-xs"
			>{m.property()}
			<select
				disabled={readonly}
				class={inputClass}
				aria-label={`${m.property()} ${index + 1}`}
				value={literal ? 'literal' : 'link'}
				onchange={(event) => setKind(event.currentTarget.value)}
			>
				<option value="literal">{m.reifier_literal()}</option>
				<option value="link">{m.reifier_link()}</option>
			</select>
		</label>
		{#if literal}
			<label class="text-xs"
				>{m.datatype()}
				<select
					disabled={readonly}
					class={inputClass}
					aria-label={`${m.datatype()} ${index + 1}`}
					value={value.datatype}
					onchange={(event) => setDatatype(event.currentTarget.value)}
					required
				>
					{#if value.datatype && !datatypes.includes(value.datatype as XsdDatatypes)}<option
							value={value.datatype}>{value.datatype}</option
						>{/if}
					{#each datatypes as datatype}<option value={datatype}>{datatype}</option>{/each}
				</select>
			</label>
		{:else}
			<label class="text-xs"
				>{m.reifier_class()}
				<input
					disabled={readonly}
					class={inputClass}
					aria-label={`${m.reifier_class()} ${index + 1}`}
					value={value.class ?? value.toClass ?? ''}
					oninput={(event) => {
						delete value.toClass;
						value.class = event.currentTarget.value;
					}}
					pattern={qnamePattern}
					required
				/>
			</label>
		{/if}
		<label class="text-xs"
			>{m.reifier_min_count()}
			<input
				disabled={readonly}
				class={inputClass}
				aria-label={`${m.reifier_min_count()} ${index + 1}`}
				type="number"
				min="0"
				step="1"
				value={value.minCount ?? ''}
				oninput={(event) => setNumber('minCount', event.currentTarget.value)}
			/>
		</label>
		<label class="text-xs"
			>{m.reifier_max_count()}
			<input
				disabled={readonly}
				class={inputClass}
				aria-label={`${m.reifier_max_count()} ${index + 1}`}
				type="number"
				min="0"
				step="1"
				value={value.maxCount ?? ''}
				oninput={(event) => setNumber('maxCount', event.currentTarget.value)}
			/>
		</label>
		<label class="text-xs sm:col-span-2"
			>{m.lang()}
			<select class={inputClass} aria-label={`${m.lang()} ${index + 1}`} bind:value={language}>
				{#each locales as locale}<option value={locale}>{locale.toUpperCase()}</option>{/each}
			</select>
		</label>
		<label class="text-xs"
			>{m.name()}
			<input
				disabled={readonly}
				class={inputClass}
				aria-label={`${m.name()} ${index + 1}`}
				value={labelText('name')}
				oninput={(event) => setLabel('name', event.currentTarget.value)}
			/>
		</label>
		<label class="text-xs"
			>{m.description()}
			<textarea
				disabled={readonly}
				class={inputClass}
				aria-label={`${m.description()} ${index + 1}`}
				rows="2"
				value={labelText('description')}
				oninput={(event) => setLabel('description', event.currentTarget.value)}
			></textarea>
		</label>
	</div>
	{#if !readonly}<p class="mt-2 text-xs text-gray-500">{m.reifier_type_change_help()}</p>{/if}
	<details class="mt-3 text-xs">
		<summary class="cursor-pointer">{m.reifier_constraints()}</summary>
		<div class="mt-2 grid gap-3 sm:grid-cols-2">
			{#if stringValue || value.minLength !== undefined || value.maxLength !== undefined || value.pattern !== undefined}
				<label
					>{m.min_length()}
					<input
						disabled={readonly}
						class={inputClass}
						aria-label={`${m.min_length()} ${index + 1}`}
						type="number"
						min="0"
						step="1"
						value={value.minLength ?? ''}
						oninput={(event) => setNumber('minLength', event.currentTarget.value)}
					/>
				</label>
				<label
					>{m.max_length()}
					<input
						disabled={readonly}
						class={inputClass}
						aria-label={`${m.max_length()} ${index + 1}`}
						type="number"
						min="0"
						step="1"
						value={value.maxLength ?? ''}
						oninput={(event) => setNumber('maxLength', event.currentTarget.value)}
					/>
				</label>
				<label class="sm:col-span-2"
					>{m.regex_pattern()}
					<input
						disabled={readonly}
						class={inputClass}
						aria-label={`${m.regex_pattern()} ${index + 1}`}
						value={value.pattern ?? ''}
						oninput={(event) => {
							value.pattern = event.currentTarget.value || undefined;
						}}
					/>
				</label>
			{/if}
			{#if numericValue || boundFields.some(({ key }) => value[key] !== undefined)}
				{#each boundFields as field}
					<label
						>{field.label()}
						<input
							class={inputClass}
							disabled={readonly}
							aria-label={`${field.label()} ${index + 1}`}
							type="number"
							step="any"
							value={value[field.key] ?? ''}
							oninput={(event) => setNumber(field.key, event.currentTarget.value)}
						/>
					</label>
				{/each}
			{/if}
			<label
				>{m.reifier_node_kind()}
				<select
					class={inputClass}
					disabled={readonly}
					aria-label={`${m.reifier_node_kind()} ${index + 1}`}
					value={value.nodeKind ?? ''}
					onchange={(event) => (value.nodeKind = event.currentTarget.value || undefined)}
				>
					<option value="">{m.reifier_unspecified()}</option>
					{#if value.nodeKind && !nodeKinds.includes(value.nodeKind)}<option value={value.nodeKind}
							>{value.nodeKind}</option
						>{/if}
					{#each nodeKinds as kind}<option value={kind}>{kind}</option>{/each}
				</select>
			</label>
			{#if ['rdf:langString', 'xsd:string'].includes(value.datatype ?? '') || value.languageIn !== undefined || value.uniqueLang !== undefined}
				<label
					>{m.reifier_unique_language()}
					<select
						class={inputClass}
						disabled={readonly}
						aria-label={`${m.reifier_unique_language()} ${index + 1}`}
						value={value.uniqueLang === undefined ? '' : String(value.uniqueLang)}
						onchange={(event) =>
							(value.uniqueLang =
								event.currentTarget.value === ''
									? undefined
									: event.currentTarget.value === 'true')}
					>
						<option value="">{m.reifier_unspecified()}</option>
						<option value="true">{m.reifier_yes()}</option>
						<option value="false">{m.reifier_no()}</option>
					</select>
				</label>
				<div class="sm:col-span-2">
					<AllowedLangSelector
						disabled={readonly}
						id={`reifier-languages-${index}`}
						label={m.allowed_langs_sel()}
						placeholder={m.sel_lang()}
						searchLabel={m.search_lang()}
						bind:selectedLanguages={
							() => (value.languageIn ?? []).map((language) => language.toUpperCase()),
							(languages: string[]) =>
								(value.languageIn = languages.length
									? languages.map((language) => language.toLowerCase())
									: undefined)
						}
					/>
				</div>
			{/if}
			<div class="sm:col-span-2">
				<AllowedValues
					disabled={readonly}
					id={`reifier-values-${index}`}
					valueType={numericValue ? 'number' : 'string'}
					label={numericValue ? m.allowed_numvals() : m.allowed_textvals()}
					placeholder={numericValue ? m.enter_valid_num() : m.enter_text()}
					bind:values={
						() => new Set(value.inSet ?? []),
						(values) => (value.inSet = values.size ? [...values] : undefined)
					}
				/>
			</div>
			<label
				>{m.reifier_order()}
				<input
					class={inputClass}
					disabled={readonly}
					aria-label={`${m.reifier_order()} ${index + 1}`}
					type="number"
					step="any"
					value={value.order ?? ''}
					oninput={(event) => setNumber('order', event.currentTarget.value)}
				/>
			</label>
			<label
				>{m.reifier_group()}
				<input
					class={inputClass}
					disabled={readonly}
					aria-label={`${m.reifier_group()} ${index + 1}`}
					pattern={qnamePattern}
					value={value.group ?? ''}
					oninput={(event) => (value.group = event.currentTarget.value || undefined)}
				/>
			</label>
			<label
				>{m.reifier_editor()}
				<input
					class={inputClass}
					disabled={readonly}
					aria-label={`${m.reifier_editor()} ${index + 1}`}
					pattern={qnamePattern}
					value={value.editor ?? ''}
					oninput={(event) => (value.editor = event.currentTarget.value || undefined)}
				/>
			</label>
		</div>
	</details>
	{#if !readonly}<button type="button" class="oldap-button mt-3 text-xs" onclick={onremove}
			>{m.reifier_field_remove()}</button
		>{/if}
</fieldset>
