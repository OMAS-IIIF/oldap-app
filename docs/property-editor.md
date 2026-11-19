# Property editor contract

The model editor consumes the sibling `oldap-api/API-def/oldap-api.yaml` contract. Regenerate the client with `npm run zod`; generation also runs the guarded corrections in `tools/fix-generated-schema.mjs` for record schemas whose declared fields the generator drops.

## Form lifecycle

- Initialize an independent draft from a cloned property. Opening, cancelling, and failed writes must not change the shared model.
- Normalize optional QName and numeric values at the domain boundary. Missing references are `undefined`, not an empty QName serialized as `undefined:undefined`.
- Resolve property identities by full QName across project, shared, and base models. Deduplicate suggestions before rendering keyed lists.
- Serialize only editable fields, then compare against the initial editable snapshot. Updates are flat patches: omission preserves a field; `null` clears a previously present value. An unchanged form must not submit an empty patch.
- Preserve zero values. Inclusive and exclusive bounds are alternatives; changing between them clears the previous bound.
- Treat reusable property definitions separately from their resource-use attributes. Editing a reusable property's use must not overwrite its definition.
- Refresh the model after a successful write. Keep a failed draft available for correction or cancellation.

## Superproperties

The API accepts a legacy single `subPropertyOf` string or a complete array of parents.
Domain conversion retains every compact or absolute IRI; editors use detached rows
with add/remove controls. Only the owning project can change predicate hierarchy.
Unchanged parent sets are omitted from flat updates, so editing local constraints
preserves all imported relationships, including `dcterms:temporal`'s two parents.
Once multiple parents are involved, hierarchy edits retain the local datatype and
constraints instead of inferring them from an arbitrary remaining parent.
Library/API and frontend changes must be deployed together.

## Scope

The obsolete OWL characteristic controls are removed. Existing OWL metadata is not automatically deleted. SHACL `inversePath` remains in the domain model and continues to exclude derived reverse fields from ordinary instance edits; authoring reverse paths is outside this change.

The generated client reflects the current API, including annotation contracts. Reifier-shape management and resource-property policy editing are described in [Reifier shapes](reifier-shapes.md). Instance annotation editing remains a separate follow-up.

The existing generic `Property` read schema still exceeds the generator's support for its `oneOf`/`not` structure. Domain conversion and focused fixtures therefore remain necessary; generated types alone are not end-to-end compatibility evidence.

## Verification

Run `npm run check`, `npm run test:unit -- --run`, and `npm run test:e2e`. Browser tests intercept API requests and do not write to real services. They cover repeated properties, initialization, flat updates, removal/zero semantics, successful refresh, failed-write isolation, cancellation, and standalone updates.

Before deployment, verify the property workflow against a disposable project on the intended API version: open a model containing reused properties, edit and reopen a local property, and confirm that only the requested constraints changed. This checks the deployed ontology/API combination beyond the mocked browser boundary.
