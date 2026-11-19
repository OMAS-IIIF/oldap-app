# Reifier shapes in the model editor

The data-model administration page lists project-owned reifier shapes and shared definitions. A shape is a named annotation definition, not a resource class. The app uses the existing `/admin/datamodel/{project}/reifier-shape/{shape}` API; it does not issue RDF/SPARQL writes or load instance annotations.

## Managing definitions

Create a shape using a local name in the selected project. Add fields using a prefix selector and a local identifier, with either a literal datatype or a target class. Prefix choices include the selected project, base/standard prefixes and defined external ontologies; existing unfamiliar prefixes remain available when editing. Field cardinalities, localized labels and supported additional constraints describe the annotation values. Existing definitions are freshly read when opened, and edits use detached drafts.

Shape updates replace the complete field list. The domain serializer retains untouched supported constraints and strips only read-only audit information; it translates read `toClass` to write `class`. Unsupported constraints are retained for inspection and cause an explicit save error, rather than silently disappearing during replacement. Removing a field or all fields is intentional replacement, subject to API integrity checks.

Shared definitions can be inspected outside their owning project. To change them, select their owning project with model-management permission. The API remains authoritative for permissions, reference integrity, and structural changes on predicates with existing data. A rejected save uses the app's shared error popup above the editor and keeps the draft available. Closing the popup or pressing Escape returns to that draft; late load errors from an already closed editor are ignored. Deletion requires confirmation; referenced definitions cannot be deleted.

After a successful mutation the model snapshots are refreshed. If refresh fails, the UI offers a read-only retry and does not repeat the committed mutation. The API has no client ETag concurrency contract; a fresh read at editor opening does not guarantee protection from another user's later edits.

## Superproperty

Each annotation field exposes zero or more `subPropertyOf` rows with a prefix and local name. Imported full IRIs remain intact and are displayed in a single input. Add/remove controls edit individual parents; all declarations survive full field replacement. The API accepts the legacy scalar for a single parent and arrays for multiple parents.
It describes the shared predicate, so changing it affects every use of that IRI.
Only the predicate's owning project can edit it; foreign fields display the
relation read-only. The field's datatype, cardinality and other constraints remain
local and are not inherited from the parent. Clearing or removing a row removes that relation for an existing field. Clearing all rows removes all parents. Removing the field itself leaves predicate metadata
intact. A newly added field without a parent reuses an existing declaration.

This requires the corresponding library/API implementation: older servers reject
`subPropertyOf` on reifier fields. The editor preserves drafts on rejection.

## Assigning shapes

Open a property inside a resource class. The Reification section selects local/shared shapes for that particular property use, including uses of reusable standalone properties. Multiple shapes apply together. The standalone predicate editor does not edit use-specific policy.

The requirement selector preserves three states:

| UI state              | Update value                                               |
| --------------------- | ---------------------------------------------------------- |
| Required              | `reificationRequired: true`                                |
| Not required locally  | `reificationRequired: false`                               |
| Not specified locally | `reificationRequired: null` when clearing an existing flag |

Inherited requirements still apply. Clearing references sends `reifierShapes: []`; an unchanged selection sends nothing. References whose definitions are unavailable remain visible and are preserved unless explicitly deselected. The server validates combinations such as required reification with no locally or ancestrally available shape.

## Verification and scope

Run `npm run check`, `npm run test:unit -- --run`, and `npm run test:e2e`. Domain tests cover full field replacement, unknown constraints, duplicate identifiers and zero/false/omission semantics. Browser fixtures exercise CRUD, shared ownership, preserved constraints, property-use assignment and clearing, errors, cancellation and refresh recovery without live writes.

Before deployment, use an empty disposable project on the intended API version to create a shape, assign it to a resource property, reload both editors, clear the assignment and delete the shape. Existing production data may legitimately prevent structural changes; this UI is not a data migration facility.

Instance annotation viewing/editing remains a separate follow-up. Authoritative backend semantics: [model contract](../../oldaplib/docs/reification-stage1b.md) and [API model documentation](../../oldap-api/doc/reification-model.md).
