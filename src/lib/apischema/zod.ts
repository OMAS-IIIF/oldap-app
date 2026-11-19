import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";



type ReifierShape = {
    iri: string;
    creator?: string | undefined;
    created?: string | undefined;
    contributor?: string | undefined;
    modified?: string | undefined;
    properties: Array<Property & Partial<{
        iri: string;
    }>>;
};;
type Property = unknown | unknown;;
type ReifierShapeWrite = Partial<{
    /**
     * Complete field definitions using existing property-write keys. Nested reification and inverse paths are unsupported. Omission preserves fields on POST.
     */
    properties: Array<{
        iri: string;
        subPropertyOf?: (/**
         * Complete shared predicate parent set, editable only in its owning project. Omission, null or an empty array clears existing field parents; a new field without parents reuses existing predicate parents. Removing the field preserves all predicate declarations. No field constraints are inherited.
         */
        SuperProperties | null) | undefined;
        datatype?: string | undefined;
        class?: string | undefined;
        minCount?: /**
         * @minimum 0
         */
        number | undefined;
        maxCount?: /**
         * @minimum 0
         */
        number | undefined;
        name?: Array<string> | undefined;
        description?: Array<string> | undefined;
    } & {
        [key: string]: any;
    }>;
}>;;
type SuperProperties = /**
 * A single superproperty IRI or a complete set of superproperty IRIs. Order is insignificant.
 */
string | Array<string>;;
type ManagedFulltextState = {
    project: string;
    configuration: ManagedFulltextConfiguration | null;
    revision: string | null;
    /**
     * @enum absent, active
     */
    status: "absent" | "active";
};;
type ManagedFulltextConfiguration = {
    graph: string;
    fields: {};
};;
type ArchiveStructureApplyRequest = {
    plan: ArchiveStructurePlan;
    reviewDigest: ArchiveStructureDigest;
    /**
     * @enum true
     */
    confirm: true;
};;
type ArchiveStructurePlan = {
    sourceFolderIri: ArchiveStructureIri;
    applyMappings?: /**
     * Defaults to true. False creates archive units only and records source correspondence without changing folder defaults.
     */
    boolean | undefined;
    sourceSnapshot: ArchiveStructureDigest;
    newUnits: Array<ArchiveStructureNewUnit>;
    mappings: Array<ArchiveStructureMapping>;
};;
type ArchiveStructureIri = /**
 * @maxLength 2048
 * @pattern ^(https?://|urn:)[^\s<>"{}|\\^`]+$
 */
string;;
type ArchiveStructureDigest = /**
 * @pattern ^[0-9a-f]{64}$
 */
string;;
type ArchiveStructureNewUnit = {
    /**
     * @pattern ^[A-Za-z][A-Za-z0-9_-]{0,63}$
     */
    key: string;
    name: ArchiveStructureName;
    /**
     * @enum shared:ArchiveGroup, shared:Fonds, shared:Subfonds, shared:Series, shared:Subseries, shared:File, shared:Item
     */
    archiveLevel: "shared:ArchiveGroup" | "shared:Fonds" | "shared:Subfonds" | "shared:Series" | "shared:Subseries" | "shared:File" | "shared:Item";
    parent: ArchiveStructureTarget | /**
     * @enum
     */
    {} | null;
    position?: (/**
     * @minimum 0
     */
    number | null) | undefined;
};;
type ArchiveStructureName = /**
 * Language keys must match ^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$. The frozen JSON Schema is authoritative.
 */
{};;
type ArchiveStructureTarget = {
    iri: ArchiveStructureIri;
} | {
    /**
     * @pattern ^[A-Za-z][A-Za-z0-9_-]{0,63}$
     */
    key: string;
};;
type ArchiveStructureMapping = {
    folderIri: ArchiveStructureIri;
    /**
     * @enum set
     */
    action: "set";
    target: ArchiveStructureTarget;
} | {
    folderIri: ArchiveStructureIri;
    /**
     * @enum clear, skip
     */
    action: "clear" | "skip";
};;
type ArchiveStructureApplyResponse = {
    operationId: ArchiveStructureOperationId;
    /**
     * @enum committed
     */
    state: "committed";
    reviewDigest: ArchiveStructureDigest;
    createdUnits: Array<{
        key: string;
        iri: ArchiveStructureIri;
    }>;
    mappings: Array<{
        folderIri: ArchiveStructureIri;
        /**
         * @maxLength 2048
         * @pattern ^(https?://|urn:)[^\s<>"{}|\\^`]+$
         */
        targetIri: string | null;
    }>;
};;
type ArchiveStructureOperationId = string;;
type ArchiveStructureFolderRow = {
    iri: ArchiveStructureIri;
    /**
     * @maxLength 2048
     * @pattern ^(https?://|urn:)[^\s<>"{}|\\^`]+$
     */
    parentIri: string | null;
    /**
     * @maxLength 1000
     */
    name: string;
    revision: ArchiveStructureDigest;
    /**
     * @maxLength 2048
     * @pattern ^(https?://|urn:)[^\s<>"{}|\\^`]+$
     */
    defaultArchiveUnitIri: string | null;
    /**
     * @enum unmapped, mapped, unavailable
     */
    mappingState: "unmapped" | "mapped" | "unavailable";
    protected: boolean;
    directMediaCount?: /**
     * Readable distinct direct media including archive references, excluding descendants. Optional for older servers and structure-import proposals.
     *
     * @minimum 0
     */
    number | undefined;
};;
type ArchiveStructurePreflightRequest = {
    plan: ArchiveStructurePlan;
};;
type ArchiveStructurePreflightResponse = {
    reviewDigest: ArchiveStructureDigest;
    counts: {
        /**
         * @minimum 0
         */
        create: number;
        /**
         * @minimum 0
         */
        set: number;
        /**
         * @minimum 0
         */
        clear: number;
        /**
         * @minimum 0
         */
        skip: number;
    };
    warnings: Array<ArchiveStructureWarning>;
};;
type ArchiveStructureWarning = {
    /**
     * @minLength 1
     * @maxLength 80
     */
    code: string;
    /**
     * @minLength 1
     * @maxLength 500
     */
    message: string;
};;
type ArchiveStructureProposalRequest = {
    sourceFolderIri: ArchiveStructureIri;
};;
type ArchiveStructureProposalResponse = {
    sourceFolderIri: ArchiveStructureIri;
    stagingAreaIri: ArchiveStructureIri;
    sourceSnapshot: ArchiveStructureDigest;
    folders: Array<ArchiveStructureFolderRow>;
    suggestedPlan: ArchiveStructurePlan;
    warnings: Array<ArchiveStructureWarning>;
};;
type ArchiveStructureInventoryResponse = {
    folderIri: ArchiveStructureIri;
    revision: ArchiveStructureDigest;
    entries: Array<ArchiveStructureInventoryEntry>;
    /**
     * @maxLength 4096
     */
    nextCursor: string | null;
    warnings: Array<ArchiveStructureWarning>;
};;
type ArchiveStructureInventoryEntry = Partial<{
    /**
     * @enum stagingMedia
     */
    kind: unknown;
}> | Partial<{
    /**
     * @enum archiveReference
     */
    kind: unknown;
    /**
     * @enum false
     */
    canEditMetadata: unknown;
    /**
     * @enum false
     */
    canDeleteMedia: unknown;
}>;;
type ArchiveStructureRevision = ArchiveStructureDigest;;
type ArchiveStructureReferenceMoveRequest = {
    mediaIri: ArchiveStructureIri;
    sourceFolderIri: ArchiveStructureIri;
    targetFolderIri: ArchiveStructureIri;
    sourceRevision: ArchiveStructureDigest;
    targetRevision: ArchiveStructureDigest;
};;
type ArchiveStructureReferenceMoveResponse = {
    operationId: ArchiveStructureOperationId;
    /**
     * @enum committed
     */
    state: "committed";
    mediaIri: ArchiveStructureIri;
    sourceFolderIri: ArchiveStructureIri;
    targetFolderIri: ArchiveStructureIri;
    sourceRevision: ArchiveStructureDigest;
    targetRevision: ArchiveStructureDigest;
};;
type ArchiveStructureError = {
    /**
     * @enum INVALID_REQUEST, TOO_LARGE, FORBIDDEN, NOT_FOUND, STALE_REVIEW, STALE_FOLDER, INVALID_HIERARCHY, REFERENCE_IN_USE, IDEMPOTENCY_CONFLICT, COORDINATION_UNAVAILABLE
     */
    code: "INVALID_REQUEST" | "TOO_LARGE" | "FORBIDDEN" | "NOT_FOUND" | "STALE_REVIEW" | "STALE_FOLDER" | "INVALID_HIERARCHY" | "REFERENCE_IN_USE" | "IDEMPOTENCY_CONFLICT" | "COORDINATION_UNAVAILABLE";
    /**
     * @maxLength 500
     */
    message: string;
    requestId: ArchiveStructureOperationId;
};;
type MobileMediaCommitRequest = {
    /**
     * Stable event identity; exact replay requires the same canonical payload.
     */
    eventId: string;
    uploadId: string;
    clientAssetId: string;
    ownerUserIri: string;
    /**
     * Immutable untrusted scope; no folder IRI is accepted.
     */
    stagingAreaId: string;
    /**
     * NFC-normalized, path-free name limited to 255 UTF-8 bytes.
     *
     * @minLength 1
     * @maxLength 255
     */
    originalName: string;
    /**
     * @enum image/jpeg, image/png, image/heic, image/heif
     */
    originalMimeType: "image/jpeg" | "image/png" | "image/heic" | "image/heif";
    /**
     * @minimum 1
     * @maximum 104857600
     */
    byteLength: number;
    /**
     * @pattern ^sha256:[0-9a-f]{64}$
     */
    checksum: string;
    comment?: /**
     * Optional NFC-normalized, control-free German short note; surrounding whitespace is removed.
     *
     * @maxLength 2000
     */
    string | undefined;
    publication: MobileMediaPublicationEvidence;
};;
type MobileMediaPublicationEvidence = {
    ownerUploadId: string;
    assetId: string;
    /**
     * @minimum 1
     * @maximum 104857600
     */
    byteLength: number;
    /**
     * @pattern ^sha256:[0-9a-f]{64}$
     */
    checksum: string;
    derivativeNames: Array</**
     * @enum master.tif
     */
    "master.tif">;
    /**
     * Exact media-owned published base path; OLDAP requires it to equal the current server-derived path.
     *
     * @minLength 1
     */
    storagePath: string;
};;
type CreateExportJobRequest = {
    /**
     * @pattern ^[A-Za-z][A-Za-z0-9_-]{0,63}$
     */
    projectShortName: string;
    kind: ExportKind;
    selectionIri?: /**
     * Absolute HTTP(S) IRI
     *
     * @maxLength 2048
     */
    string | undefined;
    includeTrash?: /**
     * @default false
     */
    boolean | undefined;
};;
type ExportKind = /**
 * @enum STAGING_FOLDER, STAGING_ALL, ARCHIVE_UNIT, ARCHIVE_ALL
 */
"STAGING_FOLDER" | "STAGING_ALL" | "ARCHIVE_UNIT" | "ARCHIVE_ALL";;
type ExportEstimate = {
    projectShortName: string;
    kind: ExportKind;
    selectionIri?: /**
     * Absolute IRI/URN or OLDAP QName identifying the frozen selection.
     */
    string | undefined;
    /**
     * @minLength 1
     * @maxLength 255
     */
    displayName: string;
    /**
     * @minLength 1
     * @maxLength 4096
     */
    displayPath: string;
    /**
     * @minimum 0
     */
    filesTotal: number;
    /**
     * @minimum 0
     */
    sourceBytes: number;
    /**
     * @minimum 0
     */
    warningCount: number;
    exceedsLimit: boolean;
    /**
     * Deployment-selected limit within the ZIP-export v1 hard ceiling.
     *
     * @minimum 1
     * @maximum 50000000000
     */
    maxArchiveBytes: number;
};;
type ExportSelectionSnapshot = {
    projectShortName: string;
    kind: ExportKind;
    selectionIri?: /**
     * Absolute IRI/URN or OLDAP QName identifying the frozen selection.
     */
    string | undefined;
    /**
     * @minLength 1
     * @maxLength 255
     */
    displayName: string;
    /**
     * @minLength 1
     * @maxLength 4096
     */
    displayPath: string;
    /**
     * @pattern ^[a-z][a-z0-9-]{0,62}-v[1-9][0-9]*$
     */
    profileId: string;
    /**
     * @pattern ^[1-9][0-9]*\.[0-9]+\.[0-9]+$
     */
    profileVersion: string;
    /**
     * @pattern ^[0-9a-f]{64}$
     */
    profileSha256: string;
    metadataSchemaVersion: string;
};;
type ExportJob = {
    exportId: string;
    state: ExportState;
    /**
     * @minimum 0
     */
    stateVersion: number;
    createdAt: string;
    updatedAt: string;
    snapshotAt?: string | undefined;
    readyAt?: string | undefined;
    expiresAt?: string | undefined;
    deletedAt?: string | undefined;
    auditDeleteAt?: string | undefined;
    requestedByIri: string;
    selection: ExportSelectionSnapshot;
    /**
     * @minimum 0
     * @maximum 50000000000
     */
    estimatedSourceBytes: number;
    progress: ExportProgress;
    archiveSizeBytes?: /**
     * @minimum 1
     * @maximum 50000000000
     */
    number | undefined;
    archiveSha256?: /**
     * @pattern ^[0-9a-f]{64}$
     */
    string | undefined;
    failureCode?: /**
     * @pattern ^[A-Z][A-Z0-9_]{2,63}$
     */
    string | undefined;
    /**
     * @minimum 0
     */
    warningCount: number;
    canDownload: boolean;
    canDelete: boolean;
    notification?: ExportNotificationStatus | undefined;
};;
type ExportState = /**
 * @enum QUEUED, BUILDING, READY, FAILED, CANCELLED, EXPIRED, DELETING, DELETED
 */
"QUEUED" | "BUILDING" | "READY" | "FAILED" | "CANCELLED" | "EXPIRED" | "DELETING" | "DELETED";;
type ExportProgress = {
    /**
     * @minimum 0
     */
    filesDone: number;
    /**
     * @minimum 0
     */
    filesTotal: number;
    /**
     * @minimum 0
     */
    bytesDone: number;
    /**
     * @minimum 0
     */
    bytesTotal: number;
};;
type ExportNotificationStatus = {
    /**
     * @enum PENDING, SENT, FAILED
     */
    status: "PENDING" | "SENT" | "FAILED";
    /**
     * @enum READY, FAILED
     */
    forState: "READY" | "FAILED";
    /**
     * @minimum 0
     * @maximum 3
     */
    attempts: number;
    sentAt?: string | undefined;
};;
type ExportClaim = ExportBuildClaim | ExportCleanupClaim;;
type ExportBuildClaim = {
    claimId: string;
    exportId: string;
    task: string;
    /**
     * @minimum 0
     */
    stateVersion: number;
    claimedAt: string;
    leaseExpiresAt: string;
    /**
     * @pattern ^[0-9a-f]{64}$
     */
    manifestSha256: string;
};;
type ExportCleanupClaim = {
    claimId: string;
    exportId: string;
    task: string;
    /**
     * @minimum 0
     */
    stateVersion: number;
    claimedAt: string;
    leaseExpiresAt: string;
    /**
     * @enum READY_DELETE, FAILED, CANCELLED, EXPIRED
     */
    cleanupReason: "READY_DELETE" | "FAILED" | "CANCELLED" | "EXPIRED";
};;
type ExportBuildResult = ExportBuildReadyResult | ExportBuildFailedResult;;
type ExportBuildReadyResult = {
    eventId: string;
    claimId: string;
    /**
     * @minimum 0
     */
    expectedStateVersion: number;
    /**
     * @pattern ^[0-9a-f]{64}$
     */
    manifestSha256: string;
    outcome: string;
    completedAt: string;
    /**
     * @minimum 1
     * @maximum 50000000000
     */
    archiveSizeBytes: number;
    /**
     * @pattern ^[0-9a-f]{64}$
     */
    archiveSha256: string;
    artifactFinalized: boolean;
    partialArtifactsDeleted: boolean;
};;
type ExportBuildFailedResult = {
    eventId: string;
    claimId: string;
    /**
     * @minimum 0
     */
    expectedStateVersion: number;
    /**
     * @pattern ^[0-9a-f]{64}$
     */
    manifestSha256: string;
    outcome: string;
    completedAt: string;
    /**
     * @pattern ^[A-Z][A-Z0-9_]{2,63}$
     */
    failureCode: string;
    partialArtifactsDeleted: boolean;
};;
type ImportJob = {
    importId: string;
    state: ImportState;
    /**
     * @minimum 0
     */
    stateVersion: number;
    createdAt: string;
    updatedAt: string;
    uploadedAt?: string | undefined;
    validationCompletedAt?: string | undefined;
    importedAt?: string | undefined;
    expiresAt?: string | undefined;
    requestedByIri: string;
    target: ImportTargetSnapshot;
    /**
     * @minLength 1
     * @maxLength 255
     */
    originalFileName: string;
    /**
     * @minimum 1
     * @maximum 500000000
     */
    declaredCompressedSizeBytes: number;
    actualCompressedSizeBytes?: /**
     * @minimum 0
     * @maximum 500000000
     */
    number | undefined;
    extractedSizeBytes?: /**
     * @minimum 0
     * @maximum 3000000000
     */
    number | undefined;
    /**
     * @minimum 0
     * @maximum 3000000000
     */
    quotaReservedBytes: number;
    reportAvailable: boolean;
    canConfirm: boolean;
    cleanupPending: boolean;
    summary?: {} | undefined;
    failureCode?: /**
     * @pattern ^[A-Z][A-Z0-9_]{2,63}$
     */
    string | undefined;
    notification?: ImportNotificationStatus | undefined;
};;
type ImportState = /**
 * @enum UPLOADING, VALIDATING, READY, IMPORTING, IMPORTED, INVALID, FAILED, CANCELLED, EXPIRED
 */
"UPLOADING" | "VALIDATING" | "READY" | "IMPORTING" | "IMPORTED" | "INVALID" | "FAILED" | "CANCELLED" | "EXPIRED";;
type ImportTargetSnapshot = {
    /**
     * @pattern ^[A-Za-z][A-Za-z0-9_-]{0,63}$
     */
    projectShortName: string;
    /**
     * @maxLength 2048
     */
    stagingAreaIri: string;
    /**
     * @minLength 1
     * @maxLength 255
     */
    stagingAreaName: string;
    /**
     * @maxLength 2048
     */
    targetRootFolderIri: string;
    /**
     * @minLength 1
     * @maxLength 255
     */
    targetRootFolderName: string;
};;
type ImportNotificationStatus = {
    /**
     * @enum PENDING, SENT, FAILED
     */
    status: "PENDING" | "SENT" | "FAILED";
    /**
     * @enum READY, INVALID, FAILED, IMPORTED
     */
    forState: "READY" | "INVALID" | "FAILED" | "IMPORTED";
    /**
     * @minimum 0
     * @maximum 3
     */
    attempts: number;
    sentAt?: string | undefined;
};;
type CreateImportJobResponse = {
    job: ImportJob;
    upload: ImportUploadAuthorization;
};;
type ImportUploadAuthorization = {
    url: string;
    method: string;
    contentType: string;
    /**
     * @minLength 1
     */
    bearerToken: string;
    expiresAt: string;
    maxBytes: number;
};;
type ImportClaim = {
    claimId: string;
    importId: string;
    /**
     * @enum VALIDATE, IMPORT, CLEANUP
     */
    task: "VALIDATE" | "IMPORT" | "CLEANUP";
    /**
     * @minimum 0
     */
    stateVersion: number;
    claimedAt: string;
    leaseExpiresAt: string;
    target: ImportTargetSnapshot;
    jobCreatedAt: string;
    /**
     * @maxLength 2048
     */
    requestedByIri: string;
    /**
     * @minLength 1
     * @maxLength 255
     */
    originalFileName: string;
    /**
     * @minimum 1
     * @maximum 500000000
     */
    compressedSizeBytes: number;
    sipSha256?: /**
     * @pattern ^[0-9a-f]{64}$
     */
    string | undefined;
    manifestSha256?: /**
     * @pattern ^[0-9a-f]{64}$
     */
    string | undefined;
    cleanupReason?: (/**
     * @enum CANCELLED, EXPIRED, IMPORTED, FAILED
     */
    "CANCELLED" | "EXPIRED" | "IMPORTED" | "FAILED") | undefined;
};;
type ImportTargetPreflightRequest = {
    /**
     * @pattern ^[A-Za-z0-9._-]{1,128}$
     */
    workerId: string;
    /**
     * @minimum 0
     */
    expectedStateVersion: number;
    topLevelEntries: Array<ImportTargetPreflightEntry>;
};;
type ImportTargetPreflightEntry = {
    /**
     * @minimum 0
     * @maximum 9999
     */
    entryIndex: number;
    /**
     * @minLength 1
     * @maxLength 255
     */
    name: string;
    /**
     * @enum file, directory
     */
    entryType: "file" | "directory";
};;
type ImportTargetPreflightResponse = {
    claimId: string;
    /**
     * @maxLength 2048
     */
    targetRootFolderIri: string;
    findings: Array<ImportTargetPreflightFinding>;
};;
type ImportTargetPreflightFinding = {
    entryIndex?: /**
     * @minimum 0
     * @maximum 9999
     */
    number | undefined;
    /**
     * @enum TARGET_CHANGED, TARGET_FOLDER_COLLISION, TARGET_MEDIA_NAME_COLLISION
     */
    code: "TARGET_CHANGED" | "TARGET_FOLDER_COLLISION" | "TARGET_MEDIA_NAME_COLLISION";
    blocking: boolean;
    existingKind?: (/**
     * @enum folder, media
     */
    "folder" | "media") | undefined;
    existingName?: /**
     * @minLength 1
     * @maxLength 255
     */
    string | undefined;
};;
type ImportCommitRequest = {
    eventId: string;
    claimId: string;
    /**
     * @minimum 0
     */
    expectedStateVersion: number;
    /**
     * @pattern ^[0-9a-f]{64}$
     */
    manifestSha256: string;
    folders: Array<ImportFolderCommitItem>;
    media: Array<ImportMediaCommitItem>;
};;
type ImportFolderCommitItem = {
    /**
     * @minimum 0
     * @maximum 9999
     */
    entryIndex: number;
    /**
     * @minLength 1
     * @maxLength 1024
     */
    relativePath: string;
    /**
     * @maxLength 1024
     */
    parentRelativePath: string;
    /**
     * @minLength 1
     * @maxLength 255
     */
    name: string;
};;
type ImportMediaCommitItem = {
    /**
     * @minimum 0
     * @maximum 9999
     */
    entryIndex: number;
    /**
     * @minLength 1
     * @maxLength 1024
     */
    relativePath: string;
    /**
     * @maxLength 1024
     */
    parentRelativePath: string;
    /**
     * @pattern ^[A-Za-z0-9._~-]{1,128}$
     */
    assetId: string;
    /**
     * @pattern ^[0-9a-f]{64}$
     */
    checksumSha256: string;
    /**
     * @minLength 1
     * @maxLength 255
     */
    originalName: string;
    /**
     * @enum image/jpeg, image/tiff, image/png, image/heic, image/heif, audio/wav, audio/flac, audio/mpeg, video/mp4, application/pdf, text/plain
     */
    originalMimeType: "image/jpeg" | "image/tiff" | "image/png" | "image/heic" | "image/heif" | "audio/wav" | "audio/flac" | "audio/mpeg" | "video/mp4" | "application/pdf" | "text/plain";
    /**
     * @enum dcmitype:StillImage, dcmitype:MovingImage, dcmitype:Sound, dcmitype:Text
     */
    dctermsType: "dcmitype:StillImage" | "dcmitype:MovingImage" | "dcmitype:Sound" | "dcmitype:Text";
    /**
     * @enum iiif, http
     */
    protocol: "iiif" | "http";
    /**
     * @enum master.tif, web.mp3, web.mp4, document.pdf, document.txt
     */
    derivativeName: "master.tif" | "web.mp3" | "web.mp4" | "document.pdf" | "document.txt";
    /**
     * @minLength 1
     * @maxLength 1024
     */
    storagePath: string;
};;
type ImportCommitResponse = {
    eventId: string;
    job: ImportJob;
    resources: Array<ImportResourceMapping>;
};;
type ImportResourceMapping = {
    /**
     * @minimum 0
     * @maximum 9999
     */
    entryIndex: number;
    /**
     * @minLength 1
     * @maxLength 1024
     */
    relativePath: string;
    resourceIri: string;
    assetId?: /**
     * @pattern ^[A-Za-z0-9._~-]{1,128}$
     */
    string | undefined;
};;
type HasRoleMap = /**
 * Mapping from QName role to data permission
 */
{};;
type DataPermission = /**
 * @enum DATA_RESTRICTED, DATA_VIEW, DATA_EXTEND, DATA_UPDATE, DATA_DELETE, DATA_PERMISSIONS
 */
"DATA_RESTRICTED" | "DATA_VIEW" | "DATA_EXTEND" | "DATA_UPDATE" | "DATA_DELETE" | "DATA_PERMISSIONS" | null;;
type UserAdditionalProperties = /**
 * Mapping from user-class-specific property QName to scalar or array values.
 */
{};;
type UserAdditionalPropertyValue = string | number | number | boolean | Array<string | number | number | boolean>;;
type AttachedToRoleMap = /**
 * Map of role IRI/QName to permission value.
 */
{};;
type AttachedToRoleUpdate = /**
 * Update payload for `oldap:attachedToRole`. Clients may either send a full replacement map of role IRI/QName to DataPermission, or a patch object with `add` and/or `del`. `add` grants or changes permissions for the given roles; `del` removes role attachments from the instance.

 */
AttachedToRoleMap | Partial<{
    add: AttachedToRoleMap;
    del: AttachedToRoleDelete;
}>;;
type AttachedToRoleDelete = /**
 * One role IRI/QName or a list of role IRIs/QNames to remove from an instance permission map.
 */
/**
 * Role IRI/QName.
 */
string | Array</**
 * Role IRI/QName.
 */
string>;;
type ValueArray = Array<DatingValue | string | number | number | boolean | null>;;
type DatingValue = {
    dateStart: Array<number>;
    dateEnd: Array<number>;
    datePrecision: string;
    inCalendar: string;
    iri?: string | undefined;
    verbatimDate?: string | undefined;
    before?: Array<string> | undefined;
};;
type AnnotationFilter = {
    /**
     * Modeled forward base predicate
     */
    property: string;
    value?: AnnotationInputValue | undefined;
    exists?: /**
     * False requires an asserted base value without a matching managed reifier. Missing base properties do not match.
     *
     * @default true
     */
    boolean | undefined;
    fields?: /**
     * All conditions bind the same reifier; repeated conditions on one field bind the same value.
     */
    Array<AnnotationFieldFilter> | undefined;
};;
type AnnotationInputValue = /**
 * Typed RDF term, or a scalar converted using the current field model
 */
AnnotationRdfTerm | string | number | boolean;;
type AnnotationRdfTerm = {
    /**
     * @enum uri, literal, bnode
     */
    type: "uri" | "literal" | "bnode";
    value: string;
    datatype?: /**
     * Literal datatype IRI or QName; exclusive with xml:lang
     */
    string | undefined;
    "xml:lang"?: string | undefined;
};;
type AnnotationFieldFilter = Partial<{
    /**
     * @enum exists, not_exists
     */
    op: unknown;
}> | {
    op?: /**
     * @enum eq, ne, lt, le, gt, ge
     */
    unknown | undefined;
};;
type AnnotationFields = {};;
type AnnotationAdd = {
    /**
     * @enum add
     */
    op: "add";
    property: string;
    value: AnnotationInputValue;
    fields: AnnotationFields;
};;
type AnnotationOperation = /**
 * Explicit edits committed with the parent instance; replace supplies the complete field set
 */
AnnotationAdd | {
    /**
     * @enum replace
     */
    op: "replace";
    iri: string;
    fields: AnnotationFields;
} | {
    /**
     * @enum remove
     */
    op: "remove";
    iri: string;
};;
type AssertionAnnotation = {
    /**
     * Stable reifier IRI; diagnostic blank IDs use _: prefix
     */
    iri: string;
    property: string;
    value: AnnotationRdfTerm;
    fields: {};
    /**
     * Marker only; mutation rechecks exclusive graph ownership and permission
     */
    managed: boolean;
    asserted: boolean;
};;
type InstanceCreateData = Partial<{
    "@annotations": Array<AnnotationAdd>;
    attachedToRole: AttachedToRoleMap;
    "oldap:attachedToRole": AttachedToRoleMap;
} & {
    [key: string]: any;
}>;;
type InstanceUpdateData = Partial<{
    "@annotations": Array<AnnotationOperation>;
    "oldap:attachedToRole": AttachedToRoleUpdate;
} & {
    [key: string]: any;
}>;;
type InstanceTransformData = {
    /**
     * QName of the target resource class.
     */
    targetClass: string;
    /**
     * QName of the base resource class whose properties must be retained.
     */
    preserveClass: string;
    expectedSourceClass?: /**
     * Optional QName guard for the current concrete resource class.
     */
    string | undefined;
    properties?: /**
     * Target-class properties to add during the transformation.
     */
    {} | undefined;
    additionalProperties?: /**
     * Alias for target-class properties, useful for media-server style payloads.
     */
    {} | undefined;
    attachedToRole?: AttachedToRoleMap | undefined;
    "oldap:attachedToRole"?: AttachedToRoleMap | undefined;
    linkFrom?: {
        /**
         * Resource that will link to the transformed instance.
         */
        resourceIri: string;
        /**
         * QName of the source resource's object property.
         */
        property: string;
    } | undefined;
};;
type ResourceSummary = {
    iri: string;
    /**
     * Most specific known OLDAP resource-class QName.
     */
    resclass: string;
    /**
     * Requested metadata plus explicit `rdf:type` and optional `virtual:inferredTypes`, using the normal instance JSON value shapes.

     */
    data: {
        "rdf:type": Array<string>;
        "virtual:inferredTypes"?: Array<string> | undefined;
    } & {
        [key: string]: ValueArray | DatingValue | string | number | boolean | null;
    };
    mediaDelivery?: ResourceSummaryMediaDelivery | undefined;
};;
type ResourceSummaryMediaDelivery = /**
 * Optional authorized image delivery derived without a follow-up query.
 */
{
    kind: string;
    infoUrl: string;
    /**
     * Short-lived media capability for IIIF metadata and tiles.
     */
    capability: /**
     * Short-lived media capability for IIIF metadata and tiles.
     */
    string | /**
     * Short-lived media capability for IIIF metadata and tiles.
     */
    null;
} | {
    kind: string;
    url: string;
    thumbnailUrl: string | null;
} | null;;
type ResourceSummaryResponse = {
    /**
     * Readable summaries in first-occurrence input order. Missing and unreadable requested resources are omitted without distinction.

     */
    resources: Array<ResourceSummary>;
};;
type InstanceData = {
    "rdf:type"?: /**
     * Explicit resource type assertions from the project data graph. Reasoning-derived types are returned separately in `virtual:inferredTypes`.

     */
    Array</**
     * QName or IRI of an asserted resource class.
     */
    string> | undefined;
    "virtual:inferredTypes"?: /**
     * Resource types visible through repository reasoning but not explicitly asserted as `rdf:type` in the project data graph.

     */
    Array</**
     * QName or IRI of a reasoning-inferred resource class.
     */
    string> | undefined;
    "oldap:attachedToRole"?: AttachedToRoleMap | undefined;
    "oldap:createdBy": Array<string>;
    "oldap:lastModifiedBy": Array<string>;
    "oldap:creationDate": Array<string>;
    "oldap:lastModificationDate": Array<string>;
} & {
    [key: string]: ValueArray | DatingValue | string | number | number | boolean | null | AttachedToRoleMap;
};;
type user_get_body_200 = Partial<{
    userIri: string;
    /**
     * QName of the user class. Must be oldap:User or a subclass.
     *
     * @default "oldap:User"
     */
    userclass: string;
    additionalProperties: UserAdditionalProperties;
    userId: string;
    familyName: string;
    givenName: string;
    email: string;
    /**
     * Timestamp when a password reset was requested.
     */
    passwordResetRequestAt: /**
     * Timestamp when a password reset was requested.
     */
    string | /**
     * Timestamp when a password reset was requested.
     */
    null;
    in_projects: Array<Partial<{
        project: string;
        permissions: Array<string>;
    }>>;
    hasRole: HasRoleMap;
}>;;
type new_user = {
    givenName: string;
    familyName: string;
    /**
     * @minLength 8
     */
    password: string;
    isActive?: boolean | undefined;
    email?: string | undefined;
    passwordResetRequestAt?: (/**
     * Timestamp when a password reset was requested.
     */
    /**
     * Timestamp when a password reset was requested.
     */
    string | /**
     * Timestamp when a password reset was requested.
     */
    null) | undefined;
    userclass?: /**
     * QName of the user class. Must be oldap:User or a subclass.
     *
     * @default "oldap:User"
     */
    string | undefined;
    additionalProperties?: UserAdditionalProperties | undefined;
    inProjects?: /**
     * The project field is the QName of the project, the permissions is a sets of admin permissions.
     */
    Array<Partial<{
        project: string;
        permissions: Array</**
         * @enum ADMIN_OLDAP, ADMIN_USERS, ADMIN_ROLES, ADMIN_RESOURCES, ADMIN_MODEL, ADMIN_CREATE
         */
        "ADMIN_OLDAP" | "ADMIN_USERS" | "ADMIN_ROLES" | "ADMIN_RESOURCES" | "ADMIN_MODEL" | "ADMIN_CREATE">;
    }>> | undefined;
    hasPermissions?: /**
     * Lust be a list of QNames of the permission sets.
     */
    Array<string> | undefined;
};;
type mod_user = Partial<{
    givenName: string;
    familyName: string;
    password: string;
    email: string;
    /**
     * Timestamp when a password reset was requested. Use null to clear it.
     */
    passwordResetRequestAt: /**
     * Timestamp when a password reset was requested. Use null to clear it.
     */
    string | /**
     * Timestamp when a password reset was requested. Use null to clear it.
     */
    null;
    additionalProperties: UserAdditionalProperties | Partial<{
        add: UserAdditionalProperties;
        del: Array<string>;
    }> | null;
    inProjects: Array<Partial<{
        project: string;
        permissions: Array<string>;
    }>>;
    hasPermissions: Array<string>;
}>;;
type ExternalOntology = Partial<{
    creator: string;
    created: string;
    contributor: string;
    modified: string;
    /**
     * Prefix to be used for the external ontology
     */
    prefix: string;
    /**
     * Namespace of the ontology
     */
    namespaceIri: string;
    /**
     * Human readable label.
     */
    label: LangString | Partial<{
        add: LangString;
        del: LangString;
    }> | null;
    /**
     * A description of the property.
     */
    comment: LangString | Partial<{
        add: LangString;
        del: LangString;
    }> | null;
    /**
     * Resource classes that can be proposed a superclasses
     */
    proposedResourceClass: Array<string> | Partial<{
        add: Array<string>;
        del: Array<string>;
    }> | null;
    /**
     * Property classes that can be proposed a super-properties (owl:DatatypeProperty)
     */
    proposedDatatypePropertyClass: Array<string> | Partial<{
        add: Array<string>;
        del: Array<string>;
    }> | null;
    /**
     * Property classes that can be proposed a super-properties (owl:DatatypeProperty)
     */
    proposedObjectPropertyClass: Array<string> | Partial<{
        add: Array<string>;
        del: Array<string>;
    }> | null;
}>;;
type LangString = /**
 * List of strings, each with an optional language tag (e.g., ["Lastname@en", "Nachname@de"])
 *
 * @example ["Eine Buchseite@de","A page of a book@en"]
 */
Array<string> | /**
 * Single string with optional language tag (e.g., "Lastname@en").
 *
 * @example "A page of a book@en"
 */
string | null;;
type PropertyCreate = /**
 * Flat property creation payload. Supply exactly one of datatype or class. GUI cardinalities apply to resource-owned properties; the server validates datatype-specific constraints and rejects incompatible combinations.
 */
Partial<{
    iri: string;
    type: OwlPropertyType;
    subPropertyOf: SuperProperties;
    appliesToProperty: string;
    datatype: string;
    class: string;
    nodeKind: string;
    name: LangString;
    description: LangString;
    languageIn: Array<string>;
    uniqueLang: boolean;
    inSet: Array<string | number>;
    /**
     * @minimum 0
     */
    minLength: number;
    /**
     * @minimum 0
     */
    maxLength: number;
    pattern: string;
    minExclusive: number;
    minInclusive: number;
    maxExclusive: number;
    maxInclusive: number;
    lessThan: string;
    lessThanOrEquals: string;
    inversePath: string;
    inverseOf: string;
    equivalentProperty: string;
    /**
     * @minimum 0
     */
    minCount: number;
    /**
     * @minimum 0
     */
    maxCount: number;
    order: number;
    group: string;
    editor: string;
    reifierShapes: Array<string>;
    reificationRequired: boolean;
}> & (unknown | unknown);;
type OwlPropertyType = Array</**
 * @enum AnnotationProperty, DataProperty, ObjectProperty, TransitiveProperty, SymmetricProperty, ReflexiveProperty, IrreflexiveProperty, FunctionalProperty, InverseFunctionalProperty
 */
"AnnotationProperty" | "DataProperty" | "ObjectProperty" | "TransitiveProperty" | "SymmetricProperty" | "ReflexiveProperty" | "IrreflexiveProperty" | "FunctionalProperty" | "InverseFunctionalProperty">;;
type Resource = Partial<{
    iri: Iri;
    creator: string;
    created: string;
    contributor: string;
    modified: string;
    projectid: string;
    label: LangString;
    superclass: Array<string>;
    comment: LangString;
    /**
     * The standard closed constraint of RDF. See https://www.w3.org/TR/shacl/#ClosedConstraintComponent
     *
     * @example true
     */
    closed: boolean;
    properties: Array<Partial<{
        iri: Iri;
    }> & Property>;
}>;;
type Iri = /**
 * IRI in the format 'project:object', where 'project' is the project name and 'object' is the object name.
 *
 * @example "myproj:pageOf"
 * @pattern ^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$
 */
string;;

const Property: z.ZodType<Property> = z.union([z.unknown(), z.unknown()]);
const ReifierShape: z.ZodType<ReifierShape> = z.object({ iri: z.string(), creator: z.string().optional(), created: z.string().datetime({ offset: true }).optional(), contributor: z.string().optional(), modified: z.string().datetime({ offset: true }).optional(), properties: z.array(Property.and(z.object({ iri: z.string() }).partial().passthrough())) }).passthrough();
const SuperProperties = z.union([z.string(), z.array(z.string())]);
const ReifierShapeWrite: z.ZodType<ReifierShapeWrite> = z.object({ properties: z.array(z.object({ iri: z.string(), subPropertyOf: z.union([SuperProperties, z.null()]).optional(), datatype: z.string().optional(), class: z.string().optional(), minCount: z.number().int().gte(0).optional(), maxCount: z.number().int().gte(0).optional(), name: z.array(z.string()).optional(), description: z.array(z.string()).optional() }).passthrough()) }).partial();
const ManagedFulltextConfiguration: z.ZodType<ManagedFulltextConfiguration> = z.object({ graph: z.string().url(), fields: z.record(z.array(z.string().url()).min(1).max(16)) });
const ManagedFulltextState: z.ZodType<ManagedFulltextState> = z.object({ project: z.string(), configuration: z.union([ManagedFulltextConfiguration, z.null()]), revision: z.union([z.string(), z.null()]), status: z.enum(["absent", "active"]) });
const putAdminfulltextProject_Body = z.object({ configuration: ManagedFulltextConfiguration, expectedRevision: z.union([z.string(), z.null()]) });
const WriterRecoveryCapabilities = z.object({ enabled: z.boolean(), canRecover: z.boolean() });
const WriterRecoveryError = z.object({ code: z.enum(["FORBIDDEN", "RECOVERY_DISABLED", "TOO_LARGE", "INVALID_REQUEST", "RECOVERY_BLOCKED", "RESULT_UNKNOWN"]), message: z.string(), requestId: z.string().uuid() });
const WriterRecoveryStatus = z.object({ state: z.enum(["free", "occupied", "recovery_required", "recovery_in_progress", "store_unavailable"]), revision: z.string().regex(/^[0-9a-f]{64}$/).optional(), startedAt: z.string().optional(), operationId: z.string().uuid().optional() });
const WriterRecoveryBegin = z.object({ operationId: z.string().uuid(), expectedRevision: z.string().regex(/^[0-9a-f]{64}$/), reason: z.string().min(10).max(2000) });
const WriterRecoveryOperation = z.object({ operationId: z.string().uuid(), state: z.enum(["awaiting_operator", "controller_blocked", "ready", "completed"]), requestedAt: z.string(), reason: z.string(), canFinish: z.boolean(), completedAt: z.string().optional() });
const Error = z.object({ message: z.string(), error: z.string().optional(), details: z.object({}).partial().passthrough().optional() }).passthrough();
const AccessTokenResponse = z.object({ message: z.string(), accessToken: z.string(), tokenType: z.string(), expiresIn: z.number().int(), token: z.string() }).passthrough();
const MobileLoginRequest = z.object({ userId: z.string().min(1), password: z.string() });
const MobileTokenResponse = z.object({ accessToken: z.string(), tokenType: z.string(), expiresIn: z.number().int().gte(1), refreshToken: z.string(), refreshTokenExpiresIn: z.number().int().gte(1) });
const MobileAuthError = z.object({ code: z.string(), message: z.string() });
const MobileRefreshRequest = z.object({ refreshToken: z.string().min(1) });
const MobileAccessTokenResponse = z.object({ accessToken: z.string(), tokenType: z.string(), expiresIn: z.number().int().gte(1) });
const password_reset_request_body = z.union([z.unknown(), z.unknown()]);
const password_reset_message_response = z.object({ message: z.string() }).passthrough();
const password_reset_confirm_body = z.object({ token: z.string(), password: z.string().min(8) });
const UserAdditionalPropertyValue = z.union([z.string(), z.number(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number(), z.number(), z.boolean()]))]);
const UserAdditionalProperties: z.ZodType<UserAdditionalProperties> = z.record(UserAdditionalPropertyValue);
const DataPermission = z.enum(["DATA_RESTRICTED", "DATA_VIEW", "DATA_EXTEND", "DATA_UPDATE", "DATA_DELETE", "DATA_PERMISSIONS"]);
const HasRoleMap: z.ZodType<HasRoleMap> = z.record(z.union([DataPermission, z.null()]));
const putAdminuserUserId_Body = z.object({ givenName: z.string(), familyName: z.string(), email: z.string().optional(), password: z.string().min(8), isActive: z.boolean().optional(), passwordResetRequestAt: z.union([z.string(), z.null()]).optional(), userclass: z.string().optional().default("oldap:User"), additionalProperties: UserAdditionalProperties.optional(), inProjects: z.array(z.object({ project: z.string(), permissions: z.array(z.enum(["ADMIN_OLDAP", "ADMIN_USERS", "ADMIN_ROLES", "ADMIN_RESOURCES", "ADMIN_MODEL", "ADMIN_CREATE", "ADMIN_LISTS"])) }).partial().passthrough()).optional(), hasRole: HasRoleMap.optional() }).passthrough();
const postAdminuserUserId_Body = z.object({ userId: z.string(), givenName: z.string(), familyName: z.string(), email: z.string(), password: z.string(), isActive: z.boolean(), passwordResetRequestAt: z.union([z.string(), z.null()]), additionalProperties: z.union([UserAdditionalProperties, z.object({ add: UserAdditionalProperties, del: z.array(z.string()) }).partial().passthrough(), z.null()]), inProjects: z.union([z.object({ add: z.object({ project: z.string(), permissions: z.union([z.array(z.string()), z.null()]) }).partial().passthrough(), del: z.array(z.string()) }).partial().passthrough(), z.array(z.object({ project: z.string(), permissions: z.union([z.array(z.string()), z.object({ add: z.array(z.string()), del: z.array(z.string()) }).partial().passthrough(), z.null()]) }).partial().passthrough())]), hasRole: z.union([HasRoleMap, z.object({ add: HasRoleMap, del: z.array(z.string()) }).partial().passthrough(), z.null()]) }).partial().passthrough();
const LangString = z.union([z.array(z.string()), z.string(), z.null()]);
const putAdminprojectProjectId_Body = z.object({ projectIri: z.string(), label: LangString, comment: LangString, namespaceIri: z.string(), projectStart: z.string(), projectEnd: z.string() }).partial().passthrough();
const postAdminprojectProjectId_Body = z.object({ label: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]), comment: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]), projectStart: z.union([z.string(), z.null()]), projectEnd: z.union([z.string(), z.null()]) }).partial().passthrough();
const putAdminroleDefinedByProjectRoleId_Body = z.object({ label: LangString, comment: LangString }).partial().passthrough();
const postAdminroleDefinedByProjectRoleId_Body = z.object({ label: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.unknown()]), comment: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]) }).partial().passthrough();
const ExternalOntology: z.ZodType<ExternalOntology> = z.object({ creator: z.string(), created: z.string().datetime({ offset: true }), contributor: z.string(), modified: z.string().datetime({ offset: true }), prefix: z.string(), namespaceIri: z.string(), label: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]), comment: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]), proposedResourceClass: z.union([z.array(z.string()), z.object({ add: z.array(z.string()), del: z.array(z.string()) }).partial().passthrough(), z.null()]), proposedDatatypePropertyClass: z.union([z.array(z.string()), z.object({ add: z.array(z.string()), del: z.array(z.string()) }).partial().passthrough(), z.null()]), proposedObjectPropertyClass: z.union([z.array(z.string()), z.object({ add: z.array(z.string()), del: z.array(z.string()) }).partial().passthrough(), z.null()]) }).partial();
const Iri = z.string();
const Resource: z.ZodType<Resource> = z.object({ iri: Iri.regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/), creator: z.string(), created: z.string().datetime({ offset: true }), contributor: z.string(), modified: z.string().datetime({ offset: true }), projectid: z.string(), label: LangString, superclass: z.array(z.string()), comment: LangString, closed: z.boolean(), properties: z.array(z.object({ iri: Iri.regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/) }).partial().passthrough().and(Property)) }).partial().passthrough();
const OwlPropertyType = z.array(z.enum(["AnnotationProperty", "DataProperty", "ObjectProperty", "TransitiveProperty", "SymmetricProperty", "ReflexiveProperty", "IrreflexiveProperty", "FunctionalProperty", "InverseFunctionalProperty"]));
const PropertyCreate: z.ZodType<PropertyCreate> = z.object({ iri: z.string(), type: OwlPropertyType, subPropertyOf: SuperProperties, appliesToProperty: z.string(), datatype: z.string(), class: z.string(), nodeKind: z.string(), name: LangString, description: LangString, languageIn: z.array(z.string()), uniqueLang: z.boolean(), inSet: z.array(z.union([z.string(), z.number()])), minLength: z.number().int().gte(0), maxLength: z.number().int().gte(0), pattern: z.string(), minExclusive: z.number(), minInclusive: z.number(), maxExclusive: z.number(), maxInclusive: z.number(), lessThan: z.string(), lessThanOrEquals: z.string(), inversePath: z.string(), inverseOf: z.string(), equivalentProperty: z.string(), minCount: z.number().int().gte(0), maxCount: z.number().int().gte(0), order: z.number(), group: z.string(), editor: z.string(), reifierShapes: z.array(z.string()), reificationRequired: z.boolean() }).partial().refine((value) => (value.datatype !== undefined) !== (value.class !== undefined), "Supply exactly one of datatype or class");
const postAdmindatamodelProjectpropertyProperty_Body = z.object({ subPropertyOf: z.union([SuperProperties, z.null()]), nodeKind: z.union([z.string(), z.null()]), reifierShapes: z.array(z.string()), reificationRequired: z.union([z.boolean(), z.null()]), type: z.union([OwlPropertyType, z.object({ add: OwlPropertyType, del: OwlPropertyType }).partial().passthrough(), z.null()]), datatype: z.union([z.string(), z.null()]), class: z.union([Iri, z.null()]), name: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]), description: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]), languageIn: z.union([z.array(z.string()), z.null()]), uniqueLang: z.boolean(), inSet: z.union([z.array(z.union([z.string(), z.number(), z.number()])), z.null()]), minLength: z.union([z.number(), z.number(), z.null()]), maxLength: z.union([z.number(), z.number(), z.null()]), pattern: z.union([z.string(), z.null()]), minExclusive: z.union([z.number(), z.number(), z.null()]), minInclusive: z.union([z.number(), z.number(), z.null()]), maxExclusive: z.union([z.number(), z.number(), z.null()]), maxInclusive: z.union([z.number(), z.number(), z.null()]), lessThan: z.union([Iri, z.null()]), lessThanOrEquals: z.union([Iri, z.null()]), inverseOf: z.union([Iri, z.null()]), equivalentProperty: z.union([Iri, z.null()]) }).partial();
const postAdmindatamodelProjectResource_Body = z.object({ closed: z.boolean(), superclass: z.union([z.array(z.string()), z.object({ add: z.array(z.string()), del: z.array(z.string()) }).partial().passthrough(), z.null()]), label: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]), comment: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]) }).partial().passthrough();
const postAdmindatamodelProjectResourceProperty_Body = z.object({ subPropertyOf: z.union([SuperProperties, z.null()]), nodeKind: z.union([z.string(), z.null()]), reifierShapes: z.array(z.string()), reificationRequired: z.union([z.boolean(), z.null()]), type: z.union([OwlPropertyType, z.object({ add: OwlPropertyType, del: OwlPropertyType }).partial().passthrough(), z.null()]), datatype: z.union([z.string(), z.null()]), class: z.union([Iri, z.null()]), name: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]), description: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]), languageIn: z.union([z.array(z.string()), z.null()]), uniqueLang: z.boolean(), inSet: z.union([z.array(z.union([z.string(), z.number(), z.number()])), z.null()]), minLength: z.union([z.number(), z.number(), z.null()]), maxLength: z.union([z.number(), z.number(), z.null()]), pattern: z.union([z.string(), z.null()]), minExclusive: z.union([z.number(), z.number(), z.null()]), minInclusive: z.union([z.number(), z.number(), z.null()]), maxExclusive: z.union([z.number(), z.number(), z.null()]), maxInclusive: z.union([z.number(), z.number(), z.null()]), lessThan: z.union([Iri, z.null()]), lessThanOrEquals: z.union([Iri, z.null()]), inverseOf: z.union([Iri, z.null()]), equivalentProperty: z.union([Iri, z.null()]), minCount: z.union([z.number(), z.null()]), maxCount: z.union([z.number(), z.null()]), order: z.union([z.number(), z.null()]), group: z.union([z.string(), z.null()]), editor: z.union([z.string(), z.null()]) }).partial();
const putAdminhlistProjectHlistid_Body = z.object({ prefLabel: LangString, definition: LangString }).partial().passthrough();
const postAdminhlistProjectHlistid_Body = z.object({ prefLabel: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]), definition: z.union([LangString, z.object({ add: LangString, del: LangString }).partial().passthrough(), z.null()]) }).partial().passthrough();
const putAdminhlistProjectHlistidNodeid_Body = z.union([z.object({ prefLabel: LangString, definition: LangString.optional(), position: z.enum(["belowOf", "leftOf", "rightOf"]), refnode: z.string() }).passthrough(), z.object({ prefLabel: LangString, definition: LangString.optional(), position: z.literal("root") }).passthrough()]);
const postAdminhlistProjectHlistidNodeidmove_Body = z.union([z.object({ leftOf: z.string() }).passthrough(), z.object({ rightOf: z.string() }).passthrough(), z.object({ belowOf: z.string() }).passthrough()]);
const AnnotationRdfTerm: z.ZodType<AnnotationRdfTerm> = z.object({ type: z.enum(["uri", "literal", "bnode"]), value: z.string(), datatype: z.string().optional(), "xml:lang": z.string().optional() });
const AnnotationInputValue = z.union([AnnotationRdfTerm, z.string(), z.number(), z.boolean()]);
const AnnotationFieldFilter: z.ZodType<AnnotationFieldFilter> = z.union([z.object({ op: z.unknown() }).partial().passthrough(), z.object({ op: z.unknown().optional() }).passthrough()]);
const AnnotationFilter: z.ZodType<AnnotationFilter> = z.object({ property: z.string(), value: AnnotationInputValue.optional(), exists: z.boolean().optional().default(true), fields: z.array(AnnotationFieldFilter).optional() });
const SearchFilterItem = z.union([z.enum(["AND", "&&", "OR", "||", "(", "LEFT", "LEFT_", ")", "RIGHT", "_RIGHT"]), z.object({ logic: z.enum(["AND", "&&", "OR", "||", "(", "LEFT", "LEFT_", ")", "RIGHT", "_RIGHT"]) }), z.union([z.unknown(), z.unknown()]).and(z.union([z.unknown(), z.unknown()])), z.union([z.unknown(), z.unknown()])]);
const SearchSortBy = z.union([z.string(), z.object({ property: z.string(), prop: z.string(), direction: z.enum(["asc", "desc"]).default("asc"), dir: z.enum(["asc", "desc"]), kind: z.enum(["auto", "value", "dating"]).default("auto") }).partial()]);
const postDatasearchProject_Body = z.object({ q: z.string(), searchString: z.string(), ftField: z.string().regex(/^[A-Za-z_][A-Za-z0-9_.-]*$/), ftProperty: z.string().regex(/^[A-Za-z_][A-Za-z0-9_.-]*$/), resClass: z.string().regex(/^([A-Za-z_][A-Za-z0-9:_-]*:)?[A-Za-z_][A-Za-z0-9:_-]*$/), annotationFilter: z.array(AnnotationFilter), includeAnnotations: z.boolean().default(false), includeProperties: z.array(z.string()), filter: z.array(SearchFilterItem), ftfilter: z.array(z.union([z.string(), z.object({ field: z.string().regex(/^[A-Za-z_][A-Za-z0-9_.-]*$/), fieldName: z.string().regex(/^[A-Za-z_][A-Za-z0-9_.-]*$/), property: z.string().regex(/^[A-Za-z_][A-Za-z0-9_.-]*$/), prop: z.string().regex(/^[A-Za-z_][A-Za-z0-9_.-]*$/), query: z.string(), q: z.string() }).partial()])), hlfilter: z.array(z.union([z.string(), z.object({ logic: z.string(), property: z.string(), prop: z.string(), node: z.union([z.string(), z.object({ listId: z.string(), nodeId: z.string() })]) }).partial()])), countOnly: z.boolean(), sortBy: z.array(SearchSortBy), limit: z.number().int().default(100), offset: z.number().int().default(0) }).partial();
const AssertionAnnotation: z.ZodType<AssertionAnnotation> = z.object({ iri: z.string(), property: z.string(), value: AnnotationRdfTerm, fields: z.record(z.array(AnnotationRdfTerm)), managed: z.boolean(), asserted: z.boolean() }).passthrough();
const postDatasearchProjectclassResclass_Body = z.object({ q: z.string(), searchString: z.string(), ftField: z.string().regex(/^[A-Za-z_][A-Za-z0-9_.-]*$/), ftProperty: z.string().regex(/^[A-Za-z_][A-Za-z0-9_.-]*$/), annotationFilter: z.array(AnnotationFilter), includeAnnotations: z.boolean().default(false), includeProperties: z.array(z.string()), filter: z.array(SearchFilterItem), ftfilter: z.array(z.union([z.string(), z.object({ field: z.string().regex(/^[A-Za-z_][A-Za-z0-9_.-]*$/), fieldName: z.string().regex(/^[A-Za-z_][A-Za-z0-9_.-]*$/), property: z.string().regex(/^[A-Za-z_][A-Za-z0-9_.-]*$/), prop: z.string().regex(/^[A-Za-z_][A-Za-z0-9_.-]*$/), query: z.string(), q: z.string() }).partial()])), hlfilter: z.array(z.union([z.string(), z.object({ logic: z.string(), property: z.string(), prop: z.string(), node: z.union([z.string(), z.object({ listId: z.string(), nodeId: z.string() })]) }).partial()])), countOnly: z.boolean(), sortBy: z.array(SearchSortBy), limit: z.number().int().default(100), offset: z.number().int().default(0) }).partial();
const DatingValue: z.ZodType<DatingValue> = z.object({ dateStart: z.array(z.number().int()).min(1).max(3), dateEnd: z.array(z.number().int()).min(1).max(3), datePrecision: z.string(), inCalendar: z.string(), iri: z.string().optional(), verbatimDate: z.string().optional(), before: z.array(z.string()).optional() }).passthrough();
const ValueArray: z.ZodType<ValueArray> = z.array(z.union([DatingValue, z.string(), z.number(), z.number(), z.boolean(), z.null()]));
const AnnotationFields: z.ZodType<AnnotationFields> = z.record(z.array(AnnotationInputValue));
const AnnotationAdd: z.ZodType<AnnotationAdd> = z.object({ op: z.literal("add"), property: z.string(), value: AnnotationInputValue, fields: AnnotationFields });
const AttachedToRoleMap: z.ZodType<AttachedToRoleMap> = z.record(DataPermission);
const InstanceCreateData: z.ZodType<InstanceCreateData> = z.object({ "@annotations": z.array(AnnotationAdd), attachedToRole: AttachedToRoleMap, "oldap:attachedToRole": AttachedToRoleMap }).partial().passthrough();
const ResourceSummaryRequest = z.object({ iris: z.array(z.string()).min(1).max(100), includeProperties: z.array(z.string()).max(32).optional().default(["schema:name"]), includeMediaDelivery: z.boolean().optional().default(false) });
const ResourceSummaryMediaDelivery = z.union([z.object({ kind: z.string(), infoUrl: z.string().url(), capability: z.union([z.string(), z.null()]) }), z.object({ kind: z.string(), url: z.string().url(), thumbnailUrl: z.union([z.string(), z.null()]) }), z.null()]);
const ResourceSummary: z.ZodType<ResourceSummary> = z.object({ iri: z.string(), resclass: z.string(), data: z.object({
    "rdf:type": z.array(z.string()).min(1),
    "virtual:inferredTypes": z.array(z.string()).optional()
}).catchall(z.union([ValueArray, DatingValue, z.string(), z.number(), z.boolean(), z.null()])), mediaDelivery: ResourceSummaryMediaDelivery.optional() });
const ResourceSummaryResponse: z.ZodType<ResourceSummaryResponse> = z.object({ resources: z.array(ResourceSummary) });
const InstanceData: z.ZodType<InstanceData> = z.object({
    "rdf:type": z.array(z.string()).optional(),
    "virtual:inferredTypes": z.array(z.string()).optional(),
    "oldap:attachedToRole": AttachedToRoleMap.optional(),
    "oldap:createdBy": z.array(z.string()),
    "oldap:lastModifiedBy": z.array(z.string()),
    "oldap:creationDate": z.array(z.string()),
    "oldap:lastModificationDate": z.array(z.string())
}).catchall(z.union([ValueArray, DatingValue, z.string(), z.number(), z.boolean(), z.null(), AttachedToRoleMap]));
const AnnotationOperation: z.ZodType<AnnotationOperation> = z.union([AnnotationAdd, z.object({ op: z.literal("replace"), iri: z.string(), fields: AnnotationFields }), z.object({ op: z.literal("remove"), iri: z.string() })]);
const AttachedToRoleDelete = z.union([z.string(), z.array(z.string())]);
const AttachedToRoleUpdate: z.ZodType<AttachedToRoleUpdate> = z.union([AttachedToRoleMap, z.object({ add: AttachedToRoleMap, del: AttachedToRoleDelete }).partial()]);
const InstanceUpdateData: z.ZodType<InstanceUpdateData> = z.object({ "@annotations": z.array(AnnotationOperation), "oldap:attachedToRole": AttachedToRoleUpdate }).partial().passthrough();
const archivePlacementStatus_Body = z.object({ targets: z.array(z.object({ iri: z.string(), kind: z.enum(["entry", "media"]) })).min(1).max(500) });
const authorizeStagingUploadTarget_Body = z.object({ stagingAreaIri: z.string(), stagingFolderIri: z.string() });
const InstanceTransformData: z.ZodType<InstanceTransformData> = z.object({ targetClass: z.string(), preserveClass: z.string(), expectedSourceClass: z.string().optional(), properties: z.object({}).partial().passthrough().optional(), additionalProperties: z.object({}).partial().passthrough().optional(), attachedToRole: AttachedToRoleMap.optional(), "oldap:attachedToRole": AttachedToRoleMap.optional(), linkFrom: z.object({ resourceIri: z.string(), property: z.string() }).optional() });
const ArchiveUnitMoveData = z.object({ "shared:parentArchiveUnit": z.union([z.string(), z.null()]), "schema:position": z.union([z.number(), z.null()]).optional() });
const StagingFolderMoveData = z.object({ "shared:inStagingFolder": z.string() });
const ArchiveImportPlan = z.object({ documentHash: z.string().regex(/^[0-9a-f]{64}$/), project: z.string(), unitCount: z.number().int().gte(1).lte(5000), externalParents: z.array(z.string()), warnings: z.array(z.string()), units: z.array(z.object({ order: z.number().int().gte(1), id: z.string(), iri: z.string(), level: z.string(), parentIri: z.union([z.string(), z.null()]) }).passthrough()) }).passthrough();
const postArchiveProjectimportsapply_Body = z.object({ yaml: z.string().max(2000000), documentHash: z.string().regex(/^[0-9a-f]{64}$/), confirm: z.boolean() }).passthrough();
const ExportKind = z.enum(["STAGING_FOLDER", "STAGING_ALL", "ARCHIVE_UNIT", "ARCHIVE_ALL"]);
const CreateExportJobRequest: z.ZodType<CreateExportJobRequest> = z.object({ projectShortName: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,63}$/), kind: ExportKind, selectionIri: z.string().max(2048).optional(), includeTrash: z.boolean().optional().default(false) });
const ExportEstimate: z.ZodType<ExportEstimate> = z.object({ projectShortName: z.string(), kind: ExportKind, selectionIri: z.string().optional(), displayName: z.string().min(1).max(255), displayPath: z.string().min(1).max(4096), filesTotal: z.number().int().gte(0), sourceBytes: z.number().int().gte(0), warningCount: z.number().int().gte(0), exceedsLimit: z.boolean(), maxArchiveBytes: z.number().int().gte(1).lte(50000000000) });
const ExportState = z.enum(["QUEUED", "BUILDING", "READY", "FAILED", "CANCELLED", "EXPIRED", "DELETING", "DELETED"]);
const ExportSelectionSnapshot: z.ZodType<ExportSelectionSnapshot> = z.object({ projectShortName: z.string(), kind: ExportKind, selectionIri: z.string().optional(), displayName: z.string().min(1).max(255), displayPath: z.string().min(1).max(4096), profileId: z.string().regex(/^[a-z][a-z0-9-]{0,62}-v[1-9][0-9]*$/), profileVersion: z.string().regex(/^[1-9][0-9]*\.[0-9]+\.[0-9]+$/), profileSha256: z.string().regex(/^[0-9a-f]{64}$/), metadataSchemaVersion: z.string() });
const ExportProgress: z.ZodType<ExportProgress> = z.object({ filesDone: z.number().int().gte(0), filesTotal: z.number().int().gte(0), bytesDone: z.number().int().gte(0), bytesTotal: z.number().int().gte(0) });
const ExportNotificationStatus: z.ZodType<ExportNotificationStatus> = z.object({ status: z.enum(["PENDING", "SENT", "FAILED"]), forState: z.enum(["READY", "FAILED"]), attempts: z.number().int().gte(0).lte(3), sentAt: z.string().datetime({ offset: true }).optional() });
const ExportJob: z.ZodType<ExportJob> = z.object({ exportId: z.string().uuid(), state: ExportState, stateVersion: z.number().int().gte(0), createdAt: z.string().datetime({ offset: true }), updatedAt: z.string().datetime({ offset: true }), snapshotAt: z.string().datetime({ offset: true }).optional(), readyAt: z.string().datetime({ offset: true }).optional(), expiresAt: z.string().datetime({ offset: true }).optional(), deletedAt: z.string().datetime({ offset: true }).optional(), auditDeleteAt: z.string().datetime({ offset: true }).optional(), requestedByIri: z.string().url(), selection: ExportSelectionSnapshot, estimatedSourceBytes: z.number().int().gte(0).lte(50000000000), progress: ExportProgress, archiveSizeBytes: z.number().int().gte(1).lte(50000000000).optional(), archiveSha256: z.string().regex(/^[0-9a-f]{64}$/).optional(), failureCode: z.string().regex(/^[A-Z][A-Z0-9_]{2,63}$/).optional(), warningCount: z.number().int().gte(0), canDownload: z.boolean(), canDelete: z.boolean(), notification: ExportNotificationStatus.optional() });
const ExportDownloadAuthorization = z.object({ url: z.string().url(), method: z.string(), expiresAt: z.string().datetime({ offset: true }) });
const ExportClaimRequest = z.object({ workerId: z.string().regex(/^[A-Za-z0-9._-]{1,128}$/), supportedTasks: z.array(z.enum(["BUILD", "CLEANUP"])).min(1), requestedLeaseSeconds: z.number().int().gte(60).lte(900).optional().default(300) });
const ExportBuildClaim: z.ZodType<ExportBuildClaim> = z.object({ claimId: z.string().uuid(), exportId: z.string().uuid(), task: z.string(), stateVersion: z.number().int().gte(0), claimedAt: z.string().datetime({ offset: true }), leaseExpiresAt: z.string().datetime({ offset: true }), manifestSha256: z.string().regex(/^[0-9a-f]{64}$/) });
const ExportCleanupClaim: z.ZodType<ExportCleanupClaim> = z.object({ claimId: z.string().uuid(), exportId: z.string().uuid(), task: z.string(), stateVersion: z.number().int().gte(0), claimedAt: z.string().datetime({ offset: true }), leaseExpiresAt: z.string().datetime({ offset: true }), cleanupReason: z.enum(["READY_DELETE", "FAILED", "CANCELLED", "EXPIRED"]) });
const ExportClaim: z.ZodType<ExportClaim> = z.union([ExportBuildClaim, ExportCleanupClaim]);
const ExportClaimHeartbeat = z.object({ workerId: z.string().regex(/^[A-Za-z0-9._-]{1,128}$/), expectedStateVersion: z.number().int().gte(0) });
const ExportLease = z.object({ claimId: z.string().uuid(), leaseExpiresAt: z.string().datetime({ offset: true }) });
const ExportManifest = z.object({ documentType: z.string(), schemaVersion: z.string(), exportId: z.string().uuid() }).passthrough();
const ExportBuildReadyResult: z.ZodType<ExportBuildReadyResult> = z.object({ eventId: z.string().uuid(), claimId: z.string().uuid(), expectedStateVersion: z.number().int().gte(0), manifestSha256: z.string().regex(/^[0-9a-f]{64}$/), outcome: z.string(), completedAt: z.string().datetime({ offset: true }), archiveSizeBytes: z.number().int().gte(1).lte(50000000000), archiveSha256: z.string().regex(/^[0-9a-f]{64}$/), artifactFinalized: z.boolean(), partialArtifactsDeleted: z.boolean() });
const ExportBuildFailedResult: z.ZodType<ExportBuildFailedResult> = z.object({ eventId: z.string().uuid(), claimId: z.string().uuid(), expectedStateVersion: z.number().int().gte(0), manifestSha256: z.string().regex(/^[0-9a-f]{64}$/), outcome: z.string(), completedAt: z.string().datetime({ offset: true }), failureCode: z.string().regex(/^[A-Z][A-Z0-9_]{2,63}$/), partialArtifactsDeleted: z.boolean() });
const ExportBuildResult: z.ZodType<ExportBuildResult> = z.union([ExportBuildReadyResult, ExportBuildFailedResult]);
const ExportCleanupResult = z.object({ eventId: z.string().uuid(), claimId: z.string().uuid(), expectedStateVersion: z.number().int().gte(0), completedAt: z.string().datetime({ offset: true }), artifactDeleted: z.boolean() });
const CreateImportJobRequest = z.object({ projectShortName: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,63}$/), stagingAreaIri: z.string().max(2048), targetRootFolderIri: z.string().max(2048), originalFileName: z.string().min(1).max(255), compressedSizeBytes: z.number().int().gte(1).lte(500000000) });
const ImportState = z.enum(["UPLOADING", "VALIDATING", "READY", "IMPORTING", "IMPORTED", "INVALID", "FAILED", "CANCELLED", "EXPIRED"]);
const ImportTargetSnapshot: z.ZodType<ImportTargetSnapshot> = z.object({ projectShortName: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,63}$/), stagingAreaIri: z.string().max(2048).url(), stagingAreaName: z.string().min(1).max(255), targetRootFolderIri: z.string().max(2048).url(), targetRootFolderName: z.string().min(1).max(255) });
const ImportNotificationStatus: z.ZodType<ImportNotificationStatus> = z.object({ status: z.enum(["PENDING", "SENT", "FAILED"]), forState: z.enum(["READY", "INVALID", "FAILED", "IMPORTED"]), attempts: z.number().int().gte(0).lte(3), sentAt: z.string().datetime({ offset: true }).optional() });
const ImportJob: z.ZodType<ImportJob> = z.object({ importId: z.string().uuid(), state: ImportState, stateVersion: z.number().int().gte(0), createdAt: z.string().datetime({ offset: true }), updatedAt: z.string().datetime({ offset: true }), uploadedAt: z.string().datetime({ offset: true }).optional(), validationCompletedAt: z.string().datetime({ offset: true }).optional(), importedAt: z.string().datetime({ offset: true }).optional(), expiresAt: z.string().datetime({ offset: true }).optional(), requestedByIri: z.string().url(), target: ImportTargetSnapshot, originalFileName: z.string().min(1).max(255), declaredCompressedSizeBytes: z.number().int().gte(1).lte(500000000), actualCompressedSizeBytes: z.number().int().gte(0).lte(500000000).optional(), extractedSizeBytes: z.number().int().gte(0).lte(3000000000).optional(), quotaReservedBytes: z.number().int().gte(0).lte(3000000000), reportAvailable: z.boolean(), canConfirm: z.boolean(), cleanupPending: z.boolean(), summary: z.object({}).partial().passthrough().optional(), failureCode: z.string().regex(/^[A-Z][A-Z0-9_]{2,63}$/).optional(), notification: ImportNotificationStatus.optional() });
const ImportUploadAuthorization: z.ZodType<ImportUploadAuthorization> = z.object({ url: z.string().url(), method: z.string(), contentType: z.string(), bearerToken: z.string().min(1), expiresAt: z.string().datetime({ offset: true }), maxBytes: z.number().int() });
const CreateImportJobResponse: z.ZodType<CreateImportJobResponse> = z.object({ job: ImportJob, upload: ImportUploadAuthorization });
const VersionedImportAction = z.object({ expectedStateVersion: z.number().int().gte(0) });
const ImportReport = z.object({ documentType: z.string(), schemaVersion: z.string(), importId: z.string().uuid(), generatedAt: z.string().datetime({ offset: true }), status: z.enum(["READY", "INVALID", "FAILED"]), canConfirm: z.boolean() }).passthrough();
const SipStoredEvent = z.object({ eventId: z.string().uuid(), storedAt: z.string().datetime({ offset: true }), sizeBytes: z.number().int().gte(1).lte(500000000), sha256: z.string().regex(/^[0-9a-f]{64}$/), uploadRequestId: z.string().uuid() });
const ImportClaimRequest = z.object({ workerId: z.string().regex(/^[A-Za-z0-9._-]{1,128}$/), supportedTasks: z.array(z.enum(["VALIDATE", "IMPORT", "CLEANUP"])).min(1), requestedLeaseSeconds: z.number().int().gte(60).lte(900).optional().default(300) });
const ImportClaim: z.ZodType<ImportClaim> = z.object({ claimId: z.string().uuid(), importId: z.string().uuid(), task: z.enum(["VALIDATE", "IMPORT", "CLEANUP"]), stateVersion: z.number().int().gte(0), claimedAt: z.string().datetime({ offset: true }), leaseExpiresAt: z.string().datetime({ offset: true }), target: ImportTargetSnapshot, jobCreatedAt: z.string().datetime({ offset: true }), requestedByIri: z.string().max(2048).url(), originalFileName: z.string().min(1).max(255), compressedSizeBytes: z.number().int().gte(1).lte(500000000), sipSha256: z.string().regex(/^[0-9a-f]{64}$/).optional(), manifestSha256: z.string().regex(/^[0-9a-f]{64}$/).optional(), cleanupReason: z.enum(["CANCELLED", "EXPIRED", "IMPORTED", "FAILED"]).optional() });
const ImportClaimHeartbeat = z.object({ workerId: z.string().regex(/^[A-Za-z0-9._-]{1,128}$/), expectedStateVersion: z.number().int().gte(0) });
const ImportLease = z.object({ claimId: z.string().uuid(), leaseExpiresAt: z.string().datetime({ offset: true }) });
const ImportTargetPreflightEntry: z.ZodType<ImportTargetPreflightEntry> = z.object({ entryIndex: z.number().int().gte(0).lte(9999), name: z.string().min(1).max(255), entryType: z.enum(["file", "directory"]) });
const ImportTargetPreflightRequest: z.ZodType<ImportTargetPreflightRequest> = z.object({ workerId: z.string().regex(/^[A-Za-z0-9._-]{1,128}$/), expectedStateVersion: z.number().int().gte(0), topLevelEntries: z.array(ImportTargetPreflightEntry).min(1).max(10000) });
const ImportTargetPreflightFinding: z.ZodType<ImportTargetPreflightFinding> = z.object({ entryIndex: z.number().int().gte(0).lte(9999).optional(), code: z.enum(["TARGET_CHANGED", "TARGET_FOLDER_COLLISION", "TARGET_MEDIA_NAME_COLLISION"]), blocking: z.boolean(), existingKind: z.enum(["folder", "media"]).optional(), existingName: z.string().min(1).max(255).optional() });
const ImportTargetPreflightResponse: z.ZodType<ImportTargetPreflightResponse> = z.object({ claimId: z.string().uuid(), targetRootFolderIri: z.string().max(2048).url(), findings: z.array(ImportTargetPreflightFinding).max(10001) });
const ImportValidationResult = z.unknown().and(z.unknown()).and(z.unknown());
const ImportFolderCommitItem: z.ZodType<ImportFolderCommitItem> = z.object({ entryIndex: z.number().int().gte(0).lte(9999), relativePath: z.string().min(1).max(1024), parentRelativePath: z.string().max(1024), name: z.string().min(1).max(255) });
const ImportMediaCommitItem: z.ZodType<ImportMediaCommitItem> = z.object({ entryIndex: z.number().int().gte(0).lte(9999), relativePath: z.string().min(1).max(1024), parentRelativePath: z.string().max(1024), assetId: z.string().regex(/^[A-Za-z0-9._~-]{1,128}$/), checksumSha256: z.string().regex(/^[0-9a-f]{64}$/), originalName: z.string().min(1).max(255), originalMimeType: z.enum(["image/jpeg", "image/tiff", "image/png", "image/heic", "image/heif", "audio/wav", "audio/flac", "audio/mpeg", "video/mp4", "application/pdf", "text/plain"]), dctermsType: z.enum(["dcmitype:StillImage", "dcmitype:MovingImage", "dcmitype:Sound", "dcmitype:Text"]), protocol: z.enum(["iiif", "http"]), derivativeName: z.enum(["master.tif", "web.mp3", "web.mp4", "document.pdf", "document.txt"]), storagePath: z.string().min(1).max(1024) });
const ImportCommitRequest: z.ZodType<ImportCommitRequest> = z.object({ eventId: z.string().uuid(), claimId: z.string().uuid(), expectedStateVersion: z.number().int().gte(0), manifestSha256: z.string().regex(/^[0-9a-f]{64}$/), folders: z.array(ImportFolderCommitItem).max(10000), media: z.array(ImportMediaCommitItem).min(1).max(10000) });
const ImportResourceMapping: z.ZodType<ImportResourceMapping> = z.object({ entryIndex: z.number().int().gte(0).lte(9999), relativePath: z.string().min(1).max(1024), resourceIri: z.string().url(), assetId: z.string().regex(/^[A-Za-z0-9._~-]{1,128}$/).optional() });
const ImportCommitResponse: z.ZodType<ImportCommitResponse> = z.object({ eventId: z.string().uuid(), job: ImportJob, resources: z.array(ImportResourceMapping).max(10000) });
const ImportTaskFailure = z.object({ eventId: z.string().uuid(), claimId: z.string().uuid(), expectedStateVersion: z.number().int().gte(0), task: z.string(), failureCode: z.string().regex(/^[A-Z][A-Z0-9_]{2,63}$/), compensated: z.boolean(), temporaryPayloadDeleted: z.boolean() });
const ImportCleanupResult = z.object({ eventId: z.string().uuid(), claimId: z.string().uuid(), expectedStateVersion: z.number().int().gte(0), reason: z.enum(["CANCELLED", "EXPIRED", "IMPORTED", "FAILED"]), temporaryPayloadDeleted: z.boolean(), completedAt: z.string().datetime({ offset: true }) });
const MobileMediaPublicationEvidence: z.ZodType<MobileMediaPublicationEvidence> = z.object({ ownerUploadId: z.string().uuid(), assetId: z.string().uuid(), byteLength: z.number().int().gte(1).lte(104857600), checksum: z.string().regex(/^sha256:[0-9a-f]{64}$/), derivativeNames: z.array(z.literal("master.tif")).min(1).max(1), storagePath: z.string().min(1) });
const MobileMediaCommitRequest: z.ZodType<MobileMediaCommitRequest> = z.object({ eventId: z.string().uuid(), uploadId: z.string().uuid(), clientAssetId: z.string().uuid(), ownerUserIri: z.string().url(), stagingAreaId: z.string().url(), originalName: z.string().min(1).max(255), originalMimeType: z.enum(["image/jpeg", "image/png", "image/heic", "image/heif"]), byteLength: z.number().int().gte(1).lte(104857600), checksum: z.string().regex(/^sha256:[0-9a-f]{64}$/), comment: z.string().max(2000).optional(), publication: MobileMediaPublicationEvidence });
const MobileMediaCommitResult = z.object({ eventId: z.string().uuid(), uploadId: z.string().uuid(), clientAssetId: z.string().uuid(), stagingAreaId: z.string().url(), assetId: z.string().uuid(), resourceIri: z.string().url(), checksum: z.string().regex(/^sha256:[0-9a-f]{64}$/), committedAt: z.string().datetime({ offset: true }) });
const ArchiveStructureIri = z.string();
const ArchiveStructureDigest = z.string();
const ArchiveStructureInventoryEntry: z.ZodType<ArchiveStructureInventoryEntry> = z.union([z.object({ kind: z.unknown() }).partial().passthrough(), z.object({ kind: z.unknown(), canEditMetadata: z.unknown(), canDeleteMedia: z.unknown() }).partial().passthrough()]);
const ArchiveStructureWarning: z.ZodType<ArchiveStructureWarning> = z.object({ code: z.string().min(1).max(80), message: z.string().min(1).max(500) });
const ArchiveStructureInventoryResponse: z.ZodType<ArchiveStructureInventoryResponse> = z.object({ folderIri: ArchiveStructureIri.max(2048).regex(/^(https?:\/\/|urn:)[^\s<>"{}|\\^`]+$/).url(), revision: ArchiveStructureDigest.regex(/^[0-9a-f]{64}$/), entries: z.array(ArchiveStructureInventoryEntry).max(100), nextCursor: z.string().max(4096).nullable(), warnings: z.array(ArchiveStructureWarning).max(100) });
const ArchiveStructureOperationId = z.string();
const ArchiveStructureError: z.ZodType<ArchiveStructureError> = z.object({ code: z.enum(["INVALID_REQUEST", "TOO_LARGE", "FORBIDDEN", "NOT_FOUND", "STALE_REVIEW", "STALE_FOLDER", "INVALID_HIERARCHY", "REFERENCE_IN_USE", "IDEMPOTENCY_CONFLICT", "COORDINATION_UNAVAILABLE"]), message: z.string().max(500), requestId: ArchiveStructureOperationId.uuid() });
const ArchiveStructureCapabilitiesResponse = z.object({ enabled: z.boolean(), canManageStructure: z.boolean(), canCreateUnits: z.boolean(), maxSourceFolders: z.literal(5000), maxMutations: z.literal(500), maxRequestBytes: z.literal(2000000) });
const ArchiveStructureReferenceMoveRequest: z.ZodType<ArchiveStructureReferenceMoveRequest> = z.object({ mediaIri: ArchiveStructureIri.max(2048).regex(/^(https?:\/\/|urn:)[^\s<>"{}|\\^`]+$/).url(), sourceFolderIri: ArchiveStructureIri.max(2048).regex(/^(https?:\/\/|urn:)[^\s<>"{}|\\^`]+$/).url(), targetFolderIri: ArchiveStructureIri.max(2048).regex(/^(https?:\/\/|urn:)[^\s<>"{}|\\^`]+$/).url(), sourceRevision: ArchiveStructureDigest.regex(/^[0-9a-f]{64}$/), targetRevision: ArchiveStructureDigest.regex(/^[0-9a-f]{64}$/) });
const ArchiveStructureReferenceMoveResponse: z.ZodType<ArchiveStructureReferenceMoveResponse> = z.object({ operationId: ArchiveStructureOperationId.uuid(), state: z.literal("committed"), mediaIri: ArchiveStructureIri.max(2048).regex(/^(https?:\/\/|urn:)[^\s<>"{}|\\^`]+$/).url(), sourceFolderIri: ArchiveStructureIri.max(2048).regex(/^(https?:\/\/|urn:)[^\s<>"{}|\\^`]+$/).url(), targetFolderIri: ArchiveStructureIri.max(2048).regex(/^(https?:\/\/|urn:)[^\s<>"{}|\\^`]+$/).url(), sourceRevision: ArchiveStructureDigest.regex(/^[0-9a-f]{64}$/), targetRevision: ArchiveStructureDigest.regex(/^[0-9a-f]{64}$/) });
const ArchiveStructureApplyResponse: z.ZodType<ArchiveStructureApplyResponse> = z.object({ operationId: ArchiveStructureOperationId.uuid(), state: z.literal("committed"), reviewDigest: ArchiveStructureDigest.regex(/^[0-9a-f]{64}$/), createdUnits: z.array(z.object({ key: z.string(), iri: ArchiveStructureIri.max(2048).regex(/^(https?:\/\/|urn:)[^\s<>"{}|\\^`]+$/).url() })).max(500), mappings: z.array(z.object({ folderIri: ArchiveStructureIri.max(2048).regex(/^(https?:\/\/|urn:)[^\s<>"{}|\\^`]+$/).url(), targetIri: z.string().max(2048).regex(/^(https?:\/\/|urn:)[^\s<>"{}|\\^`]+$/).url().nullable() })).max(500) });
const ArchiveStructureProposalRequest: z.ZodType<ArchiveStructureProposalRequest> = z.object({ sourceFolderIri: ArchiveStructureIri.max(2048).regex(/^(https?:\/\/|urn:)[^\s<>"{}|\\^`]+$/).url() });
const ArchiveStructureFolderRow: z.ZodType<ArchiveStructureFolderRow> = z.object({ iri: ArchiveStructureIri.max(2048).regex(/^(https?:\/\/|urn:)[^\s<>"{}|\\^`]+$/).url(), parentIri: z.string().max(2048).regex(/^(https?:\/\/|urn:)[^\s<>"{}|\\^`]+$/).url().nullable(), name: z.string().max(1000), revision: ArchiveStructureDigest.regex(/^[0-9a-f]{64}$/), defaultArchiveUnitIri: z.string().max(2048).regex(/^(https?:\/\/|urn:)[^\s<>"{}|\\^`]+$/).url().nullable(), mappingState: z.enum(["unmapped", "mapped", "unavailable"]), protected: z.boolean(), directMediaCount: z.number().int().gte(0).optional() });
const ArchiveStructureName: z.ZodType<ArchiveStructureName> = z.record(z.string().min(1).max(1000));
const ArchiveStructureTarget = z.union([z.object({ iri: ArchiveStructureIri.max(2048).regex(/^(https?:\/\/|urn:)[^\s<>"{}|\\^`]+$/).url() }), z.object({ key: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,63}$/) })]);
const ArchiveStructureNewUnit: z.ZodType<ArchiveStructureNewUnit> = z.object({ key: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,63}$/), name: ArchiveStructureName, archiveLevel: z.enum(["shared:ArchiveGroup", "shared:Fonds", "shared:Subfonds", "shared:Series", "shared:Subseries", "shared:File", "shared:Item"]), parent: z.union([ArchiveStructureTarget, z.object({}).partial().passthrough()]).nullable(), position: z.number().int().gte(0).nullish() });
const ArchiveStructureMapping = z.union([z.object({ folderIri: ArchiveStructureIri.max(2048).regex(/^(https?:\/\/|urn:)[^\s<>"{}|\\^`]+$/).url(), action: z.literal("set"), target: ArchiveStructureTarget }), z.object({ folderIri: ArchiveStructureIri.max(2048).regex(/^(https?:\/\/|urn:)[^\s<>"{}|\\^`]+$/).url(), action: z.enum(["clear", "skip"]) })]);
const ArchiveStructurePlan: z.ZodType<ArchiveStructurePlan> = z.object({ sourceFolderIri: ArchiveStructureIri.max(2048).regex(/^(https?:\/\/|urn:)[^\s<>"{}|\\^`]+$/).url(), applyMappings: z.boolean().optional(), sourceSnapshot: ArchiveStructureDigest.regex(/^[0-9a-f]{64}$/), newUnits: z.array(ArchiveStructureNewUnit).max(500), mappings: z.array(ArchiveStructureMapping).max(500) });
const ArchiveStructureProposalResponse: z.ZodType<ArchiveStructureProposalResponse> = z.object({ sourceFolderIri: ArchiveStructureIri.max(2048).regex(/^(https?:\/\/|urn:)[^\s<>"{}|\\^`]+$/).url(), stagingAreaIri: ArchiveStructureIri.max(2048).regex(/^(https?:\/\/|urn:)[^\s<>"{}|\\^`]+$/).url(), sourceSnapshot: ArchiveStructureDigest.regex(/^[0-9a-f]{64}$/), folders: z.array(ArchiveStructureFolderRow).max(5000), suggestedPlan: ArchiveStructurePlan, warnings: z.array(ArchiveStructureWarning).max(100) });
const ArchiveStructurePreflightRequest: z.ZodType<ArchiveStructurePreflightRequest> = z.object({ plan: ArchiveStructurePlan });
const ArchiveStructurePreflightResponse: z.ZodType<ArchiveStructurePreflightResponse> = z.object({ reviewDigest: ArchiveStructureDigest.regex(/^[0-9a-f]{64}$/), counts: z.object({ create: z.number().int().gte(0), set: z.number().int().gte(0), clear: z.number().int().gte(0), skip: z.number().int().gte(0) }), warnings: z.array(ArchiveStructureWarning).max(100) });
const ArchiveStructureApplyRequest: z.ZodType<ArchiveStructureApplyRequest> = z.object({ plan: ArchiveStructurePlan, reviewDigest: ArchiveStructureDigest.regex(/^[0-9a-f]{64}$/), confirm: z.literal(true) });
const MobileMediaLifecycleClaim = z.object({ eventId: z.string().uuid(), claimId: z.string().uuid(), workerId: z.string().regex(/^[A-Za-z0-9._:-]{1,128}$/), kind: z.enum(["moved", "staging_deleted", "archived"]), uploadId: z.string().uuid(), clientAssetId: z.string().uuid(), ownerUserIri: z.string().url(), stagingAreaId: z.string().url(), resourceIri: z.string().url(), checksum: z.string().regex(/^sha256:[0-9a-f]{64}$/), occurredAt: z.string().datetime({ offset: true }), leaseExpiresAt: z.string().datetime({ offset: true }) });
const postInternalmobileMediav1lifecycleEventsEventIdcomplete_Body = z.object({ claimId: z.string().uuid(), workerId: z.string().regex(/^[A-Za-z0-9._:-]{1,128}$/) });
const PublicationCapabilities = z.object({ automaticEditorialGrants: z.boolean().optional(), statusPropertyName: z.string().optional(), enabled: z.boolean(), canPublish: z.boolean(), rootClassIris: z.array(z.string().url()).max(500).optional(), mediaClassIris: z.array(z.string().url()).max(500).optional(), statusPropertyIri: z.string().url().optional(), publishedStatusIri: z.string().url().optional() });
const PublicationPreviewRequest = z.object({ resourceIri: z.string().url(), permission: z.enum(["DATA_VIEW", "DATA_RESTRICTED"]) });
const PublicationPreview = z.object({ resourceIri: z.string().url(), revision: z.string().regex(/^[a-f0-9]{64}$/), resources: z.array(z.object({ iri: z.string().url(), permission: z.enum(["DATA_VIEW", "DATA_RESTRICTED"]) })).max(500) });
const PublicationApplyRequest = z.object({ resourceIri: z.string().url(), permission: z.enum(["DATA_VIEW", "DATA_RESTRICTED"]), revision: z.string().regex(/^[a-f0-9]{64}$/) });
const PublicationResult = z.object({ operationId: z.string().uuid(), state: z.literal("committed"), resourceIris: z.array(z.string().url()).max(500) });

export const schemas = {
	Property,
	ReifierShape,
	SuperProperties,
	ReifierShapeWrite,
	ManagedFulltextConfiguration,
	ManagedFulltextState,
	putAdminfulltextProject_Body,
	WriterRecoveryCapabilities,
	WriterRecoveryError,
	WriterRecoveryStatus,
	WriterRecoveryBegin,
	WriterRecoveryOperation,
	Error,
	AccessTokenResponse,
	MobileLoginRequest,
	MobileTokenResponse,
	MobileAuthError,
	MobileRefreshRequest,
	MobileAccessTokenResponse,
	password_reset_request_body,
	password_reset_message_response,
	password_reset_confirm_body,
	UserAdditionalPropertyValue,
	UserAdditionalProperties,
	DataPermission,
	HasRoleMap,
	putAdminuserUserId_Body,
	postAdminuserUserId_Body,
	LangString,
	putAdminprojectProjectId_Body,
	postAdminprojectProjectId_Body,
	putAdminroleDefinedByProjectRoleId_Body,
	postAdminroleDefinedByProjectRoleId_Body,
	ExternalOntology,
	Iri,
	Resource,
	OwlPropertyType,
	PropertyCreate,
	postAdmindatamodelProjectpropertyProperty_Body,
	postAdmindatamodelProjectResource_Body,
	postAdmindatamodelProjectResourceProperty_Body,
	putAdminhlistProjectHlistid_Body,
	postAdminhlistProjectHlistid_Body,
	putAdminhlistProjectHlistidNodeid_Body,
	postAdminhlistProjectHlistidNodeidmove_Body,
	AnnotationRdfTerm,
	AnnotationInputValue,
	AnnotationFieldFilter,
	AnnotationFilter,
	SearchFilterItem,
	SearchSortBy,
	postDatasearchProject_Body,
	AssertionAnnotation,
	postDatasearchProjectclassResclass_Body,
	DatingValue,
	ValueArray,
	AnnotationFields,
	AnnotationAdd,
	AttachedToRoleMap,
	InstanceCreateData,
	ResourceSummaryRequest,
	ResourceSummaryMediaDelivery,
	ResourceSummary,
	ResourceSummaryResponse,
	InstanceData,
	AnnotationOperation,
	AttachedToRoleDelete,
	AttachedToRoleUpdate,
	InstanceUpdateData,
	archivePlacementStatus_Body,
	authorizeStagingUploadTarget_Body,
	InstanceTransformData,
	ArchiveUnitMoveData,
	StagingFolderMoveData,
	ArchiveImportPlan,
	postArchiveProjectimportsapply_Body,
	ExportKind,
	CreateExportJobRequest,
	ExportEstimate,
	ExportState,
	ExportSelectionSnapshot,
	ExportProgress,
	ExportNotificationStatus,
	ExportJob,
	ExportDownloadAuthorization,
	ExportClaimRequest,
	ExportBuildClaim,
	ExportCleanupClaim,
	ExportClaim,
	ExportClaimHeartbeat,
	ExportLease,
	ExportManifest,
	ExportBuildReadyResult,
	ExportBuildFailedResult,
	ExportBuildResult,
	ExportCleanupResult,
	CreateImportJobRequest,
	ImportState,
	ImportTargetSnapshot,
	ImportNotificationStatus,
	ImportJob,
	ImportUploadAuthorization,
	CreateImportJobResponse,
	VersionedImportAction,
	ImportReport,
	SipStoredEvent,
	ImportClaimRequest,
	ImportClaim,
	ImportClaimHeartbeat,
	ImportLease,
	ImportTargetPreflightEntry,
	ImportTargetPreflightRequest,
	ImportTargetPreflightFinding,
	ImportTargetPreflightResponse,
	ImportValidationResult,
	ImportFolderCommitItem,
	ImportMediaCommitItem,
	ImportCommitRequest,
	ImportResourceMapping,
	ImportCommitResponse,
	ImportTaskFailure,
	ImportCleanupResult,
	MobileMediaPublicationEvidence,
	MobileMediaCommitRequest,
	MobileMediaCommitResult,
	ArchiveStructureIri,
	ArchiveStructureDigest,
	ArchiveStructureInventoryEntry,
	ArchiveStructureWarning,
	ArchiveStructureInventoryResponse,
	ArchiveStructureOperationId,
	ArchiveStructureError,
	ArchiveStructureCapabilitiesResponse,
	ArchiveStructureReferenceMoveRequest,
	ArchiveStructureReferenceMoveResponse,
	ArchiveStructureApplyResponse,
	ArchiveStructureProposalRequest,
	ArchiveStructureFolderRow,
	ArchiveStructureName,
	ArchiveStructureTarget,
	ArchiveStructureNewUnit,
	ArchiveStructureMapping,
	ArchiveStructurePlan,
	ArchiveStructureProposalResponse,
	ArchiveStructurePreflightRequest,
	ArchiveStructurePreflightResponse,
	ArchiveStructureApplyRequest,
	MobileMediaLifecycleClaim,
	postInternalmobileMediav1lifecycleEventsEventIdcomplete_Body,
	PublicationCapabilities,
	PublicationPreviewRequest,
	PublicationPreview,
	PublicationApplyRequest,
	PublicationResult,
};

const endpoints = makeApi([
	{
		method: "post",
		path: "/admin/auth/:userId",
		alias: "postAdminauthUserId",
		description: `Authenticate with user ID and password. Returns a short-lived access token and sets an absolute-lifetime refresh JWT in the secure HttpOnly refresh cookie. The deprecated token field aliases accessToken for one transition release. The unknown pseudo-user receives no refresh token.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: z.object({ password: z.string() }).partial().passthrough()
			},
			{
				name: "userId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string(), token: z.string(), accessToken: z.string(), tokenType: z.string(), expiresIn: z.number().int() }).passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 403: Forbidden - Insufficient permissions to perform the requested operation`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/auth/logout",
		alias: "postAdminauthlogout",
		description: `Atomically increment the refresh token user&#x27;s authVersion and clear the refresh cookie. The cookie is also cleared when it is absent, malformed, expired, or already revoked. Existing access tokens remain valid until their short expiry.
`,
		requestFormat: "json",
		response: z.void(),
		errors: [
			{
				status: 403,
				description: `Error 403: Forbidden - Insufficient permissions to perform the requested operation`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/auth/password-reset/confirm",
		alias: "postAdminauthpasswordResetconfirm",
		description: `Set a new password using a password-reset JWT. The token is accepted only if its resetRequestedAt claim equals the current oldap:passwordResetRequestAt value stored on the user; the timestamp is deleted after a successful reset.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: password_reset_confirm_body
			},
		],
		response: z.object({ message: z.string() }).passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/auth/password-reset/request",
		alias: "postAdminauthpasswordResetrequest",
		description: `Request a password-reset link by User-ID or email. Exactly one identifier must be supplied. If exactly one user is found, oldap:passwordResetRequestAt is replaced, a two-hour JWT is created, and a reset link is sent by email. If no unique user can be found, the API returns a conflict response.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: z.union([z.unknown(), z.unknown()])
			},
		],
		response: z.object({ message: z.string() }).passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 409,
				description: `No unique user could be identified`,
				schema: z.object({ message: z.string() }).passthrough()
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/auth/refresh",
		alias: "postAdminauthrefresh",
		description: `Validate the HttpOnly refresh cookie, load the user and current permissions from GraphDB, compare authVersion, and return a new short-lived access token. The refresh cookie keeps its original absolute expiry and is not rotated.
`,
		requestFormat: "json",
		response: AccessTokenResponse,
		errors: [
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 403: Forbidden - Insufficient permissions to perform the requested operation`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "put",
		path: "/admin/datamodel/:project",
		alias: "putAdmindatamodelProject",
		description: `Creates an empty datamodel to be filled later by other viewfunctions`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/datamodel/:project",
		alias: "getAdmindatamodelProject",
		description: `Read the current datamodel directly from GraphDB, bypassing the model cache so external graph edits are visible.`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ project: z.string(), externalOntologies: z.array(ExternalOntology), reifierShapes: z.array(ReifierShape), assertionProperties: z.array(Property), resources: z.array(Resource) }).partial().passthrough(),
		errors: [
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/admin/datamodel/:project",
		alias: "deleteAdmindatamodelProject",
		description: `Viewfunction to delete the entire datamodel of a given project. Use carefully!`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "put",
		path: "/admin/datamodel/:project/:resource",
		alias: "putAdmindatamodelProjectResource",
		description: `Viewfunction to add a resource to an existing datamodel. A JSON is expectet that has the following form. In the hasProperty, either the class or the datatype must be given but not both at the same time. If the datatype is given, then all fields are optional. If the class is given, only subPropertyOf, name and desctiption are allowed.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: Resource
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "resource",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/admin/datamodel/:project/:resource",
		alias: "deleteAdmindatamodelProjectResource",
		description: `Viewfunction that deletes an entire resource inside the projects datamodel`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "resource",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/datamodel/:project/:resource",
		alias: "postAdmindatamodelProjectResource",
		description: `Viewfunction to modify a resource. A JSON is expected that has the following form. All fields are optional -- at least one needs to be given Note: To modify the fields of a property of the resource -- use modify_attribute_in_has_prop instead.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: postAdmindatamodelProjectResource_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "resource",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "put",
		path: "/admin/datamodel/:project/:resource/:property",
		alias: "putAdmindatamodelProjectResourceProperty",
		description: `Viewfunction to add a property to an existing resource inside a datamodel. A JSON is expectet that has the following form. In the hasProperty, either the class or the datatype must be given but not both at the same time. If the datatype is given, then all fields are optional. If the class is given, only subPropertyOf, name and desctiption are allowed.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: PropertyCreate
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "resource",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
			{
				name: "property",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/admin/datamodel/:project/:resource/:property",
		alias: "deleteAdmindatamodelProjectResourceProperty",
		description: `Viewfunction that deletes an entire property inside a resource that is located in the projects datamodel`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "resource",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
			{
				name: "property",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/datamodel/:project/:resource/:property",
		alias: "postAdmindatamodelProjectResourceProperty",
		description: `Viewfunction to modify the fields of a single property inside a resource.A JSON is expected that has the following form. inversePath is currently read/create-only and cannot be modified.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: postAdmindatamodelProjectResourceProperty_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "resource",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
			{
				name: "property",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/datamodel/:project/download",
		alias: "getAdmindatamodelProjectdownload",
		description: `Export the current GraphDB datamodel as TriG, bypassing the model cache.`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.void(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "put",
		path: "/admin/datamodel/:project/extonto/:prefix",
		alias: "putAdmindatamodelProjectextontoPrefix",
		description: `Add an external ontology reference to the data model. The external ontology reference is defined by a prefx and the namespace Iri. If it&#x27;s declared in the datamode, definitions from this ontology may be used withing the data model.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: ExternalOntology
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "prefix",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/admin/datamodel/:project/extonto/:prefix",
		alias: "deleteAdmindatamodelProjectextontoPrefix",
		description: `Viewfunction that deletes an external ontology reference inside the project&#x27;s datamodel`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "prefix",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/datamodel/:project/extonto/:prefix",
		alias: "postAdmindatamodelProjectextontoPrefix",
		description: `Route to modify the label or the comment of an external ontology reference`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: ExternalOntology
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "prefix",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "put",
		path: "/admin/datamodel/:project/property/:property",
		alias: "putAdmindatamodelProjectpropertyProperty",
		description: `Viewfunction to add a annotation property to an existing datamodel. A JSON is expectet that has the following form. Either the class or the datatype must be given but not both at the same time. If the datatype is given, then all fields are optional. If the class is given, only subPropertyOf, name and desctiption are allowed.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: PropertyCreate
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "property",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/admin/datamodel/:project/property/:property",
		alias: "deleteAdmindatamodelProjectpropertyProperty",
		description: `Viewfunction that deletes an entire Annotation property inside the projects datamodel`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "property",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/datamodel/:project/property/:property",
		alias: "postAdmindatamodelProjectpropertyProperty",
		description: `Viewfunction to modify a annotation property. A JSON is expected that has the following form. At least one field must be given. All fields are optional. At least one field must be given. inversePath is currently read/create-only and cannot be modified.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: postAdmindatamodelProjectpropertyProperty_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "property",
				type: "Path",
				schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/)
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/datamodel/:project/reifier-shape/:shape",
		alias: "getAdmindatamodelProjectreifierShapeShape",
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "shape",
				type: "Path",
				schema: z.string()
			},
		],
		response: ReifierShape,
		errors: [
			{
				status: 400,
				description: `Invalid or unsupported model`,
				schema: z.void()
			},
			{
				status: 401,
				description: `Authentication required`,
				schema: z.void()
			},
			{
				status: 403,
				description: `Model permission required`,
				schema: z.void()
			},
			{
				status: 404,
				description: `Shape or project not found`,
				schema: z.void()
			},
			{
				status: 409,
				description: `Shape exists, is in use, or changed concurrently`,
				schema: z.void()
			},
		]
	},
	{
		method: "put",
		path: "/admin/datamodel/:project/reifier-shape/:shape",
		alias: "putAdmindatamodelProjectreifierShapeShape",
		description: `Requires ADMIN_MODEL or ADMIN_OLDAP. Properties replace the full field list when supplied; omission preserves it on POST. Structural changes with existing predicate data are rejected. Instance annotation operations are documented separately under /data.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: ReifierShapeWrite
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "shape",
				type: "Path",
				schema: z.string()
			},
		],
		response: ReifierShape,
		errors: [
			{
				status: 400,
				description: `Invalid or unsupported model`,
				schema: z.void()
			},
			{
				status: 401,
				description: `Authentication required`,
				schema: z.void()
			},
			{
				status: 403,
				description: `Model permission required`,
				schema: z.void()
			},
			{
				status: 404,
				description: `Shape or project not found`,
				schema: z.void()
			},
			{
				status: 409,
				description: `Shape exists, is in use, or changed concurrently`,
				schema: z.void()
			},
		]
	},
	{
		method: "post",
		path: "/admin/datamodel/:project/reifier-shape/:shape",
		alias: "postAdmindatamodelProjectreifierShapeShape",
		description: `Requires ADMIN_MODEL or ADMIN_OLDAP. Properties replace the full field list when supplied; omission preserves it on POST. Structural changes with existing predicate data are rejected. Instance annotation operations are documented separately under /data.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: ReifierShapeWrite
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "shape",
				type: "Path",
				schema: z.string()
			},
		],
		response: ReifierShape,
		errors: [
			{
				status: 400,
				description: `Invalid or unsupported model`,
				schema: z.void()
			},
			{
				status: 401,
				description: `Authentication required`,
				schema: z.void()
			},
			{
				status: 403,
				description: `Model permission required`,
				schema: z.void()
			},
			{
				status: 404,
				description: `Shape or project not found`,
				schema: z.void()
			},
			{
				status: 409,
				description: `Shape exists, is in use, or changed concurrently`,
				schema: z.void()
			},
		]
	},
	{
		method: "delete",
		path: "/admin/datamodel/:project/reifier-shape/:shape",
		alias: "deleteAdmindatamodelProjectreifierShapeShape",
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "shape",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.void(),
		errors: [
			{
				status: 400,
				description: `Invalid or unsupported model`,
				schema: z.void()
			},
			{
				status: 401,
				description: `Authentication required`,
				schema: z.void()
			},
			{
				status: 403,
				description: `Model permission required`,
				schema: z.void()
			},
			{
				status: 404,
				description: `Shape or project not found`,
				schema: z.void()
			},
			{
				status: 409,
				description: `Shape exists, is in use, or changed concurrently`,
				schema: z.void()
			},
		]
	},
	{
		method: "get",
		path: "/admin/fulltext/:project",
		alias: "getAdminfulltextProject",
		description: `Requires a backend-bound Jena connection and fresh ADMIN_MODEL or ADMIN_OLDAP authorization. Returns 503 on GraphDB connections.`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: ManagedFulltextState,
		errors: [
			{
				status: 401,
				description: `Authentication required`,
				schema: z.void()
			},
			{
				status: 403,
				description: `Current model administration permission required`,
				schema: z.void()
			},
			{
				status: 404,
				description: `Project not found`,
				schema: z.void()
			},
			{
				status: 503,
				description: `Backend unavailable or activation outcome uncertain`,
				schema: z.void()
			},
		]
	},
	{
		method: "put",
		path: "/admin/fulltext/:project",
		alias: "putAdminfulltextProject",
		description: `Synchronous rebuild. No automatic retry after a timeout or uncertain result. The graph must match the authoritative project namespace. expectedRevision null asserts absence.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: putAdminfulltextProject_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: ManagedFulltextState,
		errors: [
			{
				status: 400,
				description: `Invalid configuration or mismatched project graph`,
				schema: z.void()
			},
			{
				status: 401,
				description: `Authentication required`,
				schema: z.void()
			},
			{
				status: 403,
				description: `Current model administration permission required`,
				schema: z.void()
			},
			{
				status: 404,
				description: `Project not found`,
				schema: z.void()
			},
			{
				status: 409,
				description: `Stale revision or backend busy; inspect current state`,
				schema: z.void()
			},
			{
				status: 413,
				description: `Request too large`,
				schema: z.void()
			},
			{
				status: 503,
				description: `Backend unavailable or uncertain result; do not replay blindly`,
				schema: z.void()
			},
		]
	},
	{
		method: "put",
		path: "/admin/hlist/:project/:hlistid",
		alias: "putAdminhlistProjectHlistid",
		description: `Creates an empty hierarchical list. Later to be filled with nodes.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: putAdminhlistProjectHlistid_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "hlistid",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/hlist/:project/:hlistid",
		alias: "postAdminhlistProjectHlistid",
		description: `Viewfunction to modify the metadata of a hierarchical list`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: postAdminhlistProjectHlistid_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "hlistid",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/admin/hlist/:project/:hlistid",
		alias: "deleteAdminhlistProjectHlistid",
		description: `Viewfunction to delete a hierarchical list`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "hlistid",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/hlist/:project/:hlistid",
		alias: "getAdminhlistProjectHlistid",
		description: `Viewfunction to get the information about a hierarchical of a project. A (hierarchical) ordered List of all the nodes will be delivered.`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "hlistid",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.union([z.object({}).partial().passthrough(), z.array(z.any()), z.string(), z.number(), z.boolean(), z.unknown()]),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/hlist/:project/:hlistid/:nodeid",
		alias: "getAdminhlistProjectHlistidNodeid",
		description: `Viewfunction to retrieve all information of the given node
`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "hlistid",
				type: "Path",
				schema: z.string()
			},
			{
				name: "nodeid",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ nodeid: z.string(), creator: z.string(), created: z.string().datetime({ offset: true }), contributor: z.string(), modified: z.string().datetime({ offset: true }), prefLabel: LangString, description: LangString }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
	{
		method: "put",
		path: "/admin/hlist/:project/:hlistid/:nodeid",
		alias: "putAdminhlistProjectHlistidNodeid",
		description: `Viewfunction to add a new node to an existing hierarchical list. A JSON is expected that has the following form.
Note: if the position is &quot;root&quot;, then &quot;refnode&quot; must be omitted.

Example JSON:
{
  &quot;prefLabel&quot;: [&quot;testrootnodelabel@en&quot;],
  &quot;definition&quot;: [&quot;testrootnodedefinition@en&quot;],
  &quot;position&quot;: &quot;leftOf&quot;,
  &quot;refnode&quot;: &quot;nodeA&quot;
}
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: putAdminhlistProjectHlistidNodeid_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "hlistid",
				type: "Path",
				schema: z.string()
			},
			{
				name: "nodeid",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/admin/hlist/:project/:hlistid/:nodeid",
		alias: "deleteAdminhlistProjectHlistidNodeid",
		description: `Viewfunction that deletes a node from the hierarchical list
`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "hlistid",
				type: "Path",
				schema: z.string()
			},
			{
				name: "nodeid",
				type: "Path",
				schema: z.string()
			},
			{
				name: "recursive",
				type: "Query",
				schema: z.enum(["1", "true", "yes", "on", "0", "false", "no", "off"]).optional()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/hlist/:project/:hlistid/:nodeid",
		alias: "postAdminhlistProjectHlistidNodeid",
		description: `Viewfunction to modify the parameters of a node
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: postAdminhlistProjectHlistid_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "hlistid",
				type: "Path",
				schema: z.string()
			},
			{
				name: "nodeid",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.unknown() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/hlist/:project/:hlistid/:nodeid/move",
		alias: "postAdminhlistProjectHlistidNodeidmove",
		description: `Viewfunction that moves a node inside the hierarchical list from one place to another.
When there are any number of nodes below the node one wish to move, they get moved automatically alongside the other node.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: postAdminhlistProjectHlistidNodeidmove_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "hlistid",
				type: "Path",
				schema: z.string()
			},
			{
				name: "nodeid",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/hlist/:project/:hlistid/download",
		alias: "downloadHList",
		description: `Downloads a hierarchical list as YAML or JSON depending on the &#x60;format&#x60; query parameter.
The user must be authenticated with a Bearer token.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "hlistid",
				type: "Path",
				schema: z.string()
			},
			{
				name: "format",
				type: "Query",
				schema: z.enum(["YAML", "JSON"]).optional()
			},
		],
		response: z.object({}).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/hlist/:project/:hlistid/in_use",
		alias: "getAdminhlistProjectHlistidin_use",
		description: `Viewfunction to check if a hierarchical list is in use. It is in use, if any property in the datamodel references the list.`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "hlistid",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ in_use: z.boolean() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/hlist/:project/upload",
		alias: "postAdminhlistProjectupload",
		description: `Uploads a hierarchical list to a specific project via a YAML file.`,
		requestFormat: "form-data",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: z.object({ yamlfile: z.instanceof(File) }).partial().passthrough()
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/hlist/get",
		alias: "getAdminhlistget",
		description: `Get all hlist data from the hlist iri`,
		requestFormat: "json",
		parameters: [
			{
				name: "iri",
				type: "Query",
				schema: z.string()
			},
		],
		response: z.object({ hlistIri: z.string(), creator: z.string(), created: z.string(), contributor: z.string(), modified: z.string(), hlistId: z.string(), prefLabel: LangString, definition: LangString, nodeNamespaceIri: z.string(), nodeClassIri: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/hlist/search",
		alias: "getAdminhlistsearch",
		description: `Search for a given user`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "hlist",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "prefLabel",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "definition",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "exactMatch",
				type: "Query",
				schema: z.boolean().optional()
			},
		],
		response: z.array(z.string()),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/lucene/:project",
		alias: "readProjectLuceneConnector",
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ name: z.string(), configuration: z.union([z.object({}).partial().passthrough(), z.null()]), revision: z.union([z.string(), z.null()]) }).passthrough(),
		errors: [
			{
				status: 401,
				description: `Authentication required`,
				schema: z.void()
			},
			{
				status: 403,
				description: `Project ADMIN_MODEL or system ADMIN_OLDAP required`,
				schema: z.void()
			},
			{
				status: 404,
				description: `Project not found`,
				schema: z.void()
			},
			{
				status: 500,
				description: `Connector export failed`,
				schema: z.void()
			},
			{
				status: 503,
				description: `Matching oldaplib connector service unavailable`,
				schema: z.void()
			},
		]
	},
	{
		method: "put",
		path: "/admin/lucene/:project",
		alias: "applyProjectLuceneConnector",
		description: `Replacement may rebuild the index and is not an RDF transaction. Identical configuration remains unchanged. expectedRevision is mandatory for replace, including null for absence.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: z.unknown()
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ name: z.string(), status: z.enum(["created", "replaced", "unchanged"]) }).passthrough(),
		errors: [
			{
				status: 400,
				description: `Invalid input`,
				schema: z.void()
			},
			{
				status: 401,
				description: `Authentication required`,
				schema: z.void()
			},
			{
				status: 403,
				description: `Model administration required`,
				schema: z.void()
			},
			{
				status: 404,
				description: `Project not found`,
				schema: z.void()
			},
			{
				status: 409,
				description: `Existing connector in create mode or stale replacement revision`,
				schema: z.void()
			},
			{
				status: 500,
				description: `Command failed; inspect reported recovery status before retrying`,
				schema: z.void()
			},
			{
				status: 503,
				description: `Matching oldaplib connector service unavailable`,
				schema: z.void()
			},
		]
	},
	{
		method: "put",
		path: "/admin/project/:projectId",
		alias: "putAdminprojectProjectId",
		description: `Creates a new project in the database`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: putAdminprojectProjectId_Body
			},
			{
				name: "projectId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/admin/project/:projectId",
		alias: "deleteAdminprojectProjectId",
		description: `The user that has the rights (given by his token) deletes a project`,
		requestFormat: "json",
		parameters: [
			{
				name: "projectId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/project/:projectId",
		alias: "getAdminprojectProjectId",
		description: `The user that has the rights (given by his token) gets Information about a project`,
		requestFormat: "json",
		parameters: [
			{
				name: "projectId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ projectIri: z.string(), creator: z.string(), created: z.string(), contributor: z.string(), modified: z.string(), label: LangString, comment: LangString, message: z.string(), shortName: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9._-]*$/), namespaceIri: z.string(), projectStart: z.string(), projectEnd: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/project/:projectId",
		alias: "postAdminprojectProjectId",
		description: `The user that has the rights (given by his token) modifies a project`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: postAdminprojectProjectId_Body
			},
			{
				name: "projectId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/project/get",
		alias: "getAdminprojectget",
		description: `Get all project data from the project iri`,
		requestFormat: "json",
		parameters: [
			{
				name: "iri",
				type: "Query",
				schema: z.string()
			},
		],
		response: z.object({ projectIri: z.string(), creator: z.string(), created: z.string(), contributor: z.string(), modified: z.string(), label: LangString, comment: LangString, message: z.string(), shortName: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9._-]*$/), namespaceIri: z.string(), projectStart: z.string(), projectEnd: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/project/getid",
		alias: "getAdminprojectgetid",
		description: `Get the project shortname from the project IRI`,
		requestFormat: "json",
		parameters: [
			{
				name: "iri",
				type: "Query",
				schema: z.string()
			},
		],
		response: z.object({ id: z.string() }).passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/project/search",
		alias: "getAdminprojectsearch",
		description: `The user that has the rights (given by his token) searches for given parameters in projects`,
		requestFormat: "json",
		parameters: [
			{
				name: "label",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "comment",
				type: "Query",
				schema: z.string().optional()
			},
		],
		response: z.array(z.object({ projectIri: z.string(), projectShortName: z.string() }).partial().passthrough()),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
		]
	},
	{
		method: "put",
		path: "/admin/role/:definedByProject/:roleId",
		alias: "putAdminroleDefinedByProjectRoleId",
		description: `Creates a new permissionset in the database`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: putAdminroleDefinedByProjectRoleId_Body
			},
			{
				name: "definedByProject",
				type: "Path",
				schema: z.string()
			},
			{
				name: "roleId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/admin/role/:definedByProject/:roleId",
		alias: "deleteAdminroleDefinedByProjectRoleId",
		description: `The user that has the rights (given by his token) deletes a permissionset`,
		requestFormat: "json",
		parameters: [
			{
				name: "definedByProject",
				type: "Path",
				schema: z.string()
			},
			{
				name: "roleId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/role/:definedByProject/:roleId",
		alias: "getAdminroleDefinedByProjectRoleId",
		description: `The user that has the rights (given by his token) gets Information about a role`,
		requestFormat: "json",
		parameters: [
			{
				name: "definedByProject",
				type: "Path",
				schema: z.string()
			},
			{
				name: "roleId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ roleIri: z.string(), creator: z.string(), created: z.string().datetime({ offset: true }), contributor: z.string(), modified: z.string().datetime({ offset: true }), roleId: z.string(), label: LangString, comment: LangString, definedByProject: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/role/:definedByProject/:roleId",
		alias: "postAdminroleDefinedByProjectRoleId",
		description: `The user that has the rights (given by his token) modifies a permissionset`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: postAdminroleDefinedByProjectRoleId_Body
			},
			{
				name: "definedByProject",
				type: "Path",
				schema: z.string()
			},
			{
				name: "roleId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/role/:definedByProject/:roleId/in_use",
		alias: "getAdminroleDefinedByProjectRoleIdin_use",
		description: `Viewfunction to check if a hierarchical list is in use. It is in use, if any property in the datamodel references the list.`,
		requestFormat: "json",
		parameters: [
			{
				name: "definedByProject",
				type: "Path",
				schema: z.string()
			},
			{
				name: "roleId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ in_use: z.boolean() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/role/get",
		alias: "getAdminroleget",
		description: `Get complete role data by iri`,
		requestFormat: "json",
		parameters: [
			{
				name: "iri",
				type: "Query",
				schema: z.string()
			},
		],
		response: z.object({ creator: z.string(), created: z.string().datetime({ offset: true }), contributor: z.string(), modified: z.string().datetime({ offset: true }), roleIri: z.string(), roleId: z.string(), label: LangString, comment: LangString, definedByProject: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/role/search",
		alias: "getAdminrolesearch",
		description: `The user that has the rights (given by his token) searches for given parameters in role`,
		requestFormat: "json",
		parameters: [
			{
				name: "label",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "definedByProject",
				type: "Query",
				schema: z.string().optional()
			},
		],
		response: z.array(z.string()),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
		]
	},
	{
		method: "put",
		path: "/admin/user/:userId",
		alias: "putAdminuserUserId",
		description: `Create a new user with the given data`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: putAdminuserUserId_Body
			},
			{
				name: "userId",
				type: "Path",
				schema: z.string().max(32)
			},
		],
		response: z.object({ message: z.string(), userId: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/admin/user/:userId",
		alias: "deleteAdminuserUserId",
		description: `The user that has the rights (given by his token) deletes another user`,
		requestFormat: "json",
		parameters: [
			{
				name: "userId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Ambiguous RDF 1.2 permission reifier describes multiple memberships; separate it before editing.`,
				schema: z.void()
			},
		]
	},
	{
		method: "get",
		path: "/admin/user/:userId",
		alias: "getAdminuserUserId",
		description: `Get all information about a user`,
		requestFormat: "json",
		parameters: [
			{
				name: "userId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ creator: z.string(), created: z.string().datetime({ offset: true }), contributor: z.string(), modified: z.string().datetime({ offset: true }), userIri: z.string(), userclass: z.string().optional().default("oldap:User"), userId: z.string(), familyName: z.string(), givenName: z.string(), email: z.string(), passwordResetRequestAt: z.union([z.string(), z.null()]).optional(), isActive: z.boolean().optional(), inProjects: z.array(z.object({ project: z.string(), permissions: z.array(z.string()) }).partial().passthrough()).optional(), hasRole: HasRoleMap.optional(), additionalProperties: UserAdditionalProperties.optional() }).passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/admin/user/:userId",
		alias: "postAdminuserUserId",
		description: `Modify value(s) of a user definition.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: postAdminuserUserId_Body
			},
			{
				name: "userId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Ambiguous RDF 1.2 permission reifier describes multiple memberships; separate it before editing.`,
				schema: z.void()
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/user/get",
		alias: "getAdminuserget",
		description: `Get all user data from the user Iri`,
		requestFormat: "json",
		parameters: [
			{
				name: "iri",
				type: "Query",
				schema: z.string()
			},
		],
		response: z.object({ creator: z.string(), created: z.string().datetime({ offset: true }), contributor: z.string(), modified: z.string().datetime({ offset: true }), userIri: z.string(), userclass: z.string().optional().default("oldap:User"), userId: z.string(), familyName: z.string(), givenName: z.string(), email: z.string(), passwordResetRequestAt: z.string().datetime({ offset: true }).optional(), isActive: z.boolean().optional(), inProjects: z.array(z.object({ project: z.string(), permissions: z.array(z.string()) }).partial().passthrough()).optional(), hasRole: HasRoleMap.optional(), additionalProperties: UserAdditionalProperties.optional() }).passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/user/search",
		alias: "getAdminusersearch",
		description: `Search for a given user`,
		requestFormat: "json",
		parameters: [
			{
				name: "userId",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "email",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "familyName",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "givenName",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "inProject",
				type: "Query",
				schema: z.string().optional()
			},
		],
		response: z.array(z.string()),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/admin/writer-recovery/capabilities",
		alias: "writerRecoveryCapabilities",
		description: `Deployment-wide operator capability. Responses are no-store. Maintenance proof is established offline; requests never accept runtime targets or evidence. Retain the exact operation ID and begin body after any uncertain response. A 409 leaves recovery blocked; a 503 may have an unknown result. No automatic replay of archive writes.`,
		requestFormat: "json",
		response: WriterRecoveryCapabilities,
		errors: [
			{
				status: 400,
				description: `Invalid closed request`,
				schema: WriterRecoveryError
			},
			{
				status: 401,
				description: `Missing or invalid bearer authentication`,
				schema: z.void()
			},
			{
				status: 403,
				description: `Operational role missing`,
				schema: WriterRecoveryError
			},
			{
				status: 409,
				description: `Recovery blocked or inspected revision changed`,
				schema: WriterRecoveryError
			},
			{
				status: 413,
				description: `Request too large`,
				schema: WriterRecoveryError
			},
			{
				status: 503,
				description: `Unavailable or result unknown`,
				schema: WriterRecoveryError
			},
		]
	},
	{
		method: "post",
		path: "/admin/writer-recovery/operations",
		alias: "writerRecoveryBegin",
		description: `Deployment-wide operator capability. Responses are no-store. Maintenance proof is established offline; requests never accept runtime targets or evidence. Retain the exact operation ID and begin body after any uncertain response. A 409 leaves recovery blocked; a 503 may have an unknown result. No automatic replay of archive writes.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: WriterRecoveryBegin
			},
		],
		response: WriterRecoveryOperation,
		errors: [
			{
				status: 400,
				description: `Invalid closed request`,
				schema: WriterRecoveryError
			},
			{
				status: 401,
				description: `Missing or invalid bearer authentication`,
				schema: z.void()
			},
			{
				status: 403,
				description: `Operational role missing`,
				schema: WriterRecoveryError
			},
			{
				status: 409,
				description: `Recovery blocked or inspected revision changed`,
				schema: WriterRecoveryError
			},
			{
				status: 413,
				description: `Request too large`,
				schema: WriterRecoveryError
			},
			{
				status: 503,
				description: `Unavailable or result unknown`,
				schema: WriterRecoveryError
			},
		]
	},
	{
		method: "get",
		path: "/admin/writer-recovery/operations/:identifier",
		alias: "writerRecoveryOperation",
		description: `Deployment-wide operator capability. Responses are no-store. Maintenance proof is established offline; requests never accept runtime targets or evidence. Retain the exact operation ID and begin body after any uncertain response. A 409 leaves recovery blocked; a 503 may have an unknown result. No automatic replay of archive writes.`,
		requestFormat: "json",
		parameters: [
			{
				name: "identifier",
				type: "Path",
				schema: z.string().uuid()
			},
		],
		response: WriterRecoveryOperation,
		errors: [
			{
				status: 400,
				description: `Invalid closed request`,
				schema: WriterRecoveryError
			},
			{
				status: 401,
				description: `Missing or invalid bearer authentication`,
				schema: z.void()
			},
			{
				status: 403,
				description: `Operational role missing`,
				schema: WriterRecoveryError
			},
			{
				status: 409,
				description: `Recovery blocked or inspected revision changed`,
				schema: WriterRecoveryError
			},
			{
				status: 413,
				description: `Request too large`,
				schema: WriterRecoveryError
			},
			{
				status: 503,
				description: `Unavailable or result unknown`,
				schema: WriterRecoveryError
			},
		]
	},
	{
		method: "post",
		path: "/admin/writer-recovery/operations/:identifier/finish",
		alias: "writerRecoveryFinish",
		description: `Deployment-wide operator capability. Responses are no-store. Maintenance proof is established offline; requests never accept runtime targets or evidence. Retain the exact operation ID and begin body after any uncertain response. A 409 leaves recovery blocked; a 503 may have an unknown result. No automatic replay of archive writes.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: z.object({  }).partial()
			},
			{
				name: "identifier",
				type: "Path",
				schema: z.string().uuid()
			},
		],
		response: WriterRecoveryOperation,
		errors: [
			{
				status: 400,
				description: `Invalid closed request`,
				schema: WriterRecoveryError
			},
			{
				status: 401,
				description: `Missing or invalid bearer authentication`,
				schema: z.void()
			},
			{
				status: 403,
				description: `Operational role missing`,
				schema: WriterRecoveryError
			},
			{
				status: 409,
				description: `Recovery blocked or inspected revision changed`,
				schema: WriterRecoveryError
			},
			{
				status: 413,
				description: `Request too large`,
				schema: WriterRecoveryError
			},
			{
				status: 503,
				description: `Unavailable or result unknown`,
				schema: WriterRecoveryError
			},
		]
	},
	{
		method: "get",
		path: "/admin/writer-recovery/status",
		alias: "writerRecoveryStatus",
		description: `Deployment-wide operator capability. Responses are no-store. Maintenance proof is established offline; requests never accept runtime targets or evidence. Retain the exact operation ID and begin body after any uncertain response. A 409 leaves recovery blocked; a 503 may have an unknown result. No automatic replay of archive writes.`,
		requestFormat: "json",
		response: WriterRecoveryStatus,
		errors: [
			{
				status: 400,
				description: `Invalid closed request`,
				schema: WriterRecoveryError
			},
			{
				status: 401,
				description: `Missing or invalid bearer authentication`,
				schema: z.void()
			},
			{
				status: 403,
				description: `Operational role missing`,
				schema: WriterRecoveryError
			},
			{
				status: 409,
				description: `Recovery blocked or inspected revision changed`,
				schema: WriterRecoveryError
			},
			{
				status: 413,
				description: `Request too large`,
				schema: WriterRecoveryError
			},
			{
				status: 503,
				description: `Unavailable or result unknown`,
				schema: WriterRecoveryError
			},
		]
	},
	{
		method: "post",
		path: "/archive/:project/imports/apply",
		alias: "postArchiveProjectimportsapply",
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: postArchiveProjectimportsapply_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ documentHash: z.string(), createdCount: z.number().int(), createdIris: z.array(z.string()) }).passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 403: Forbidden - Insufficient permissions to perform the requested operation`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/archive/:project/imports/preflight",
		alias: "postArchiveProjectimportspreflight",
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: z.object({ yaml: z.string().max(2000000) }).passthrough()
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: ArchiveImportPlan,
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 403: Forbidden - Insufficient permissions to perform the requested operation`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 413,
				description: `YAML exceeds the upload limit`,
				schema: z.void()
			},
		]
	},
	{
		method: "post",
		path: "/archive/:project/placement-status",
		alias: "archivePlacementStatus",
		description: `Uses server-configured archive classes and media-to-root relationships. Counts readable media only; unreadable targets are omitted. Placement existence includes hidden archive units without returning their identities. Advisory counts do not replace write-time validation. No data is modified.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: archivePlacementStatus_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ items: z.array(z.object({ iri: z.string(), mediaCount: z.number().int().gte(0), unassignedCount: z.number().int().gte(0) }).passthrough()) }).passthrough(),
		errors: [
			{
				status: 400,
				description: `Invalid batch or missing project relationship configuration.`,
				schema: z.void()
			},
			{
				status: 401,
				description: `Authentication required.`,
				schema: z.void()
			},
			{
				status: 503,
				description: `Archive configuration or database unavailable.`,
				schema: z.void()
			},
		]
	},
	{
		method: "post",
		path: "/archive/:project/publication/apply",
		alias: "publicationApply",
		description: `Project-configured publication. Responses are no-store. Fresh publisher membership and per-resource UPDATE are required. Apply is atomic and revision-bound; preserve the exact body and Idempotency-Key after uncertain responses.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: PublicationApplyRequest
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "Idempotency-Key",
				type: "Header",
				schema: z.string().uuid()
			},
		],
		response: PublicationResult,
		errors: [
			{
				status: 400,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
			{
				status: 401,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
			{
				status: 403,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
			{
				status: 404,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
			{
				status: 409,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
			{
				status: 503,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
		]
	},
	{
		method: "get",
		path: "/archive/:project/publication/capabilities",
		alias: "publicationCapabilities",
		description: `Project-configured publication. Responses are no-store. Fresh publisher membership and per-resource UPDATE are required. Apply is atomic and revision-bound; preserve the exact body and Idempotency-Key after uncertain responses.`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "resourceIri",
				type: "Query",
				schema: z.string().url().optional()
			},
		],
		response: PublicationCapabilities,
		errors: [
			{
				status: 400,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
			{
				status: 401,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
			{
				status: 403,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
			{
				status: 404,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
			{
				status: 409,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
			{
				status: 503,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
		]
	},
	{
		method: "get",
		path: "/archive/:project/publication/operations/:operationId",
		alias: "publicationOperation",
		description: `Project-configured publication. Responses are no-store. Fresh publisher membership and per-resource UPDATE are required. Apply is atomic and revision-bound; preserve the exact body and Idempotency-Key after uncertain responses.`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "operationId",
				type: "Path",
				schema: z.string().uuid()
			},
		],
		response: PublicationResult,
		errors: [
			{
				status: 400,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
			{
				status: 401,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
			{
				status: 403,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
			{
				status: 404,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
			{
				status: 409,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
			{
				status: 503,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
		]
	},
	{
		method: "post",
		path: "/archive/:project/publication/preview",
		alias: "publicationPreview",
		description: `Project-configured publication. Responses are no-store. Fresh publisher membership and per-resource UPDATE are required. Apply is atomic and revision-bound; preserve the exact body and Idempotency-Key after uncertain responses.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: PublicationPreviewRequest
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: PublicationPreview,
		errors: [
			{
				status: 400,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
			{
				status: 401,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
			{
				status: 403,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
			{
				status: 404,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
			{
				status: 409,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
			{
				status: 503,
				description: `Request rejected; no partial publication is committed.`,
				schema: z.void()
			},
		]
	},
	{
		method: "get",
		path: "/archive/:project/staging-proposal",
		alias: "getArchiveProjectstagingProposal",
		description: `Generates a read-only, editable archive YAML version 1 proposal from StagingFolder resources visible to the authenticated user. Technical folders are omitted, archive levels remain editorial suggestions, and media are never transformed into ArchiveUnits.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "stagingAreaIri",
				type: "Query",
				schema: z.string().url()
			},
		],
		response: z.void(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/archive/:project/structure/apply",
		alias: "archiveStructureApply",
		description: `Opt-in structure capability and instance permissions are required. Responses use Cache-Control: no-store. Limits: 2,000,000 request bytes, 5,000 source folders, 500 combined creates and set/clear actions. Existing archive units are never edited by adoption. See doc/archive_structure_adoption.md and the frozen v1 JSON Schema.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: ArchiveStructureApplyRequest
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "Idempotency-Key",
				type: "Header",
				schema: z.string().uuid()
			},
		],
		response: ArchiveStructureApplyResponse,
		errors: [
			{
				status: 400,
				description: `Invalid request or hierarchy.`,
				schema: ArchiveStructureError
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 403,
				description: `Role or resource permission denied.`,
				schema: ArchiveStructureError
			},
			{
				status: 404,
				description: `Source, target or receipt unavailable.`,
				schema: ArchiveStructureError
			},
			{
				status: 409,
				description: `Stale review or idempotency conflict.`,
				schema: ArchiveStructureError
			},
			{
				status: 413,
				description: `Select a smaller subtree or plan.`,
				schema: ArchiveStructureError
			},
			{
				status: 503,
				description: `Coordination unavailable.`,
				schema: ArchiveStructureError
			},
		]
	},
	{
		method: "get",
		path: "/archive/:project/structure/capabilities",
		alias: "archiveStructureCapabilities",
		description: `Opt-in capabilities supplement instance rights. Absent project policy returns enabled&#x3D;false. Responses use Cache-Control: no-store.`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: ArchiveStructureCapabilitiesResponse,
		errors: [
			{
				status: 400,
				description: `Invalid request or hierarchy.`,
				schema: ArchiveStructureError
			},
			{
				status: 401,
				description: `Authentication required; retains the legacy message envelope.`,
				schema: z.void()
			},
			{
				status: 403,
				description: `Operation not permitted.`,
				schema: ArchiveStructureError
			},
			{
				status: 404,
				description: `Resource or owner-scoped receipt unavailable.`,
				schema: ArchiveStructureError
			},
			{
				status: 503,
				description: `Coordination or configuration unavailable.`,
				schema: ArchiveStructureError
			},
		]
	},
	{
		method: "post",
		path: "/archive/:project/structure/defaults/proposal",
		alias: "archiveDefaultProposal",
		description: `Opt-in structure capability and instance permissions are required. Responses use Cache-Control: no-store. Limits: 2,000,000 request bytes, 5,000 source folders, 500 combined creates and set/clear actions. Existing archive units are never edited by adoption. See doc/archive_structure_adoption.md and the frozen v1 JSON Schema.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: ArchiveStructureProposalRequest
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: ArchiveStructureProposalResponse,
		errors: [
			{
				status: 400,
				description: `Invalid request or hierarchy.`,
				schema: ArchiveStructureError
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 403,
				description: `Role or resource permission denied.`,
				schema: ArchiveStructureError
			},
			{
				status: 404,
				description: `Source, target or receipt unavailable.`,
				schema: ArchiveStructureError
			},
			{
				status: 409,
				description: `Stale review or idempotency conflict.`,
				schema: ArchiveStructureError
			},
			{
				status: 413,
				description: `Select a smaller subtree or plan.`,
				schema: ArchiveStructureError
			},
			{
				status: 503,
				description: `Coordination unavailable.`,
				schema: ArchiveStructureError
			},
		]
	},
	{
		method: "get",
		path: "/archive/:project/structure/operations/:operationId",
		alias: "archiveStructureOperation",
		description: `Returns a currently visible committed structure-apply or reference-move result. A missing receipt never permits a new mutation. A UUID used in both command scopes requires replay at the original endpoint. Responses use Cache-Control: no-store.`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "operationId",
				type: "Path",
				schema: z.string().uuid()
			},
		],
		response: z.union([ArchiveStructureReferenceMoveResponse, ArchiveStructureApplyResponse]),
		errors: [
			{
				status: 400,
				description: `Invalid request or hierarchy.`,
				schema: ArchiveStructureError
			},
			{
				status: 401,
				description: `Authentication required; retains the legacy message envelope.`,
				schema: z.void()
			},
			{
				status: 403,
				description: `Operation not permitted.`,
				schema: ArchiveStructureError
			},
			{
				status: 404,
				description: `Resource or owner-scoped receipt unavailable.`,
				schema: ArchiveStructureError
			},
			{
				status: 409,
				description: `Stale state, reference or idempotency conflict.`,
				schema: ArchiveStructureError
			},
			{
				status: 503,
				description: `Coordination or configuration unavailable.`,
				schema: ArchiveStructureError
			},
		]
	},
	{
		method: "post",
		path: "/archive/:project/structure/preflight",
		alias: "archiveStructurePreflight",
		description: `Opt-in structure capability and instance permissions are required. Responses use Cache-Control: no-store. Limits: 2,000,000 request bytes, 5,000 source folders, 500 combined creates and set/clear actions. Existing archive units are never edited by adoption. See doc/archive_structure_adoption.md and the frozen v1 JSON Schema.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: ArchiveStructurePreflightRequest
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: ArchiveStructurePreflightResponse,
		errors: [
			{
				status: 400,
				description: `Invalid request or hierarchy.`,
				schema: ArchiveStructureError
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 403,
				description: `Role or resource permission denied.`,
				schema: ArchiveStructureError
			},
			{
				status: 404,
				description: `Source, target or receipt unavailable.`,
				schema: ArchiveStructureError
			},
			{
				status: 409,
				description: `Stale review or idempotency conflict.`,
				schema: ArchiveStructureError
			},
			{
				status: 413,
				description: `Select a smaller subtree or plan.`,
				schema: ArchiveStructureError
			},
			{
				status: 503,
				description: `Coordination unavailable.`,
				schema: ArchiveStructureError
			},
		]
	},
	{
		method: "post",
		path: "/archive/:project/structure/proposal",
		alias: "archiveStructureProposal",
		description: `Opt-in structure capability and instance permissions are required. Responses use Cache-Control: no-store. Limits: 2,000,000 request bytes, 5,000 source folders, 500 combined creates and set/clear actions. Existing archive units are never edited by adoption. See doc/archive_structure_adoption.md and the frozen v1 JSON Schema.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: ArchiveStructureProposalRequest
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: ArchiveStructureProposalResponse,
		errors: [
			{
				status: 400,
				description: `Invalid request or hierarchy.`,
				schema: ArchiveStructureError
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 403,
				description: `Role or resource permission denied.`,
				schema: ArchiveStructureError
			},
			{
				status: 404,
				description: `Source, target or receipt unavailable.`,
				schema: ArchiveStructureError
			},
			{
				status: 409,
				description: `Stale review or idempotency conflict.`,
				schema: ArchiveStructureError
			},
			{
				status: 413,
				description: `Select a smaller subtree or plan.`,
				schema: ArchiveStructureError
			},
			{
				status: 503,
				description: `Coordination unavailable.`,
				schema: ArchiveStructureError
			},
		]
	},
	{
		method: "get",
		path: "/data/:project/:instiri",
		alias: "getDataProjectInstiri",
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "instiri",
				type: "Path",
				schema: z.string()
			},
		],
		response: InstanceData,
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/data/:project/:instiri",
		alias: "postDataProjectInstiri",
		description: `Accepts an object of known model properties. Unknown properties, including null and delta writes, are rejected. Clearing an absent known optional property is idempotent. Hierarchy changes for ArchiveUnit and StagingFolder (including project subclasses) use their respective move endpoints. Typed domain errors retain the existing message response envelope.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: z.object({ "@annotations": z.array(AnnotationOperation), "oldap:attachedToRole": AttachedToRoleUpdate }).partial().passthrough()
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "instiri",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/data/:project/:instiri",
		alias: "deleteDataProjectInstiri",
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "instiri",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Resource is in use or has an ambiguous RDF 1.2 permission reifier.`,
				schema: z.void()
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/data/:project/:instiri/archive-move",
		alias: "postDataProjectInstiriarchiveMove",
		description: `Changes &#x60;shared:parentArchiveUnit&#x60; and optionally &#x60;schema:position&#x60; in one resource update. The backend rejects self-parenting and moves below descendants so clients cannot create archive hierarchy cycles.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: ArchiveUnitMoveData
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "instiri",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string(), iri: z.string(), "shared:parentArchiveUnit": z.union([z.string(), z.null()]), "schema:position": z.union([z.number(), z.null()]) }).passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/data/:project/:instiri/staging-folder-move",
		alias: "postDataProjectInstiristagingFolderMove",
		description: `Changes only the folder&#x27;s &#x60;shared:inStagingFolder&#x60; relation. Descendant folders and media retain their existing parent relations and therefore move with the subtree. The backend rejects system-folder moves, targets in another Staging area, self/descendant targets, and portable sibling name collisions.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: z.object({ "shared:inStagingFolder": z.string() })
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "instiri",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string(), iri: z.string(), "shared:inStagingFolder": z.string() }).passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/data/:project/:instiri/transform",
		alias: "postDataProjectInstiritransform",
		description: `Reclassifies an existing resource instance in one backend transaction. Properties belonging to &#x60;preserveClass&#x60; are retained, source-class-specific properties are removed, target-class properties from &#x60;properties&#x60; and &#x60;additionalProperties&#x60; are inserted, optional role attachments are replaced, an optional shape-valid &#x60;linkFrom&#x60; relation is added after a fresh DATA_UPDATE check on its source resource, and OLDAP modification metadata is updated. All mutations commit or roll back together.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: InstanceTransformData
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "instiri",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string(), iri: z.string(), resourceClass: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "put",
		path: "/data/:project/:resclass",
		alias: "putDataProjectResclass",
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: z.object({ "@annotations": z.array(AnnotationAdd), attachedToRole: AttachedToRoleMap, "oldap:attachedToRole": AttachedToRoleMap }).partial().passthrough()
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "resclass",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string(), iri: z.string(), annotationIris: z.array(z.string()) }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/data/:project/:stagingAreaIri/staging-area",
		alias: "deleteEmptyStagingArea",
		description: `Deletes exactly one unambiguous, empty StagingArea together with its direct system-folder set &#x60;top&#x60;, &#x60;top/Mobile&#x60;, and &#x60;top/Trash&#x60; in one GraphDB transaction. The operation rejects media, user folders, misplaced or duplicate system folders, external references, and insufficient delete permission. Generic API operations cannot mutate or remove the protected &#x60;top&#x60;, &#x60;top/Mobile&#x60;, or &#x60;top/Trash&#x60; system folders, transform a StagingArea, or bypass this atomic route for StagingArea deletion.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "stagingAreaIri",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ message: z.string(), stagingAreaIri: z.string() }).passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/data/:project/staging-folder-inventory",
		alias: "stagingFolderInventory",
		description: `Policy-enabled, project-neutral mixed direct media inventory ordered by kind and mediaIri. Cursors bind caller/project/folder/revision/last key and are integrity-protected. Hidden media identifiers and counts are not returned. Reference entries never grant metadata editing or media deletion. Responses use Cache-Control: no-store; original downloads reauthorize through existing media APIs.`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "folderIri",
				type: "Query",
				schema: z.string().max(2048).regex(/^(https?:\/\/|urn:)[^\s<>"{}|\\^`]+$/).url()
			},
			{
				name: "limit",
				type: "Query",
				schema: z.number().int().gte(1).lte(100).optional().default(50)
			},
			{
				name: "cursor",
				type: "Query",
				schema: z.string().max(4096).optional()
			},
		],
		response: ArchiveStructureInventoryResponse,
		errors: [
			{
				status: 400,
				description: `Invalid query or cursor context.`,
				schema: ArchiveStructureError
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 403,
				description: `Folder inventory access is not permitted.`,
				schema: ArchiveStructureError
			},
			{
				status: 404,
				description: `Folder is unavailable.`,
				schema: ArchiveStructureError
			},
			{
				status: 409,
				description: `STALE_FOLDER: reload from the first page.`,
				schema: ArchiveStructureError
			},
			{
				status: 503,
				description: `Coordination or configuration is unavailable.`,
				schema: ArchiveStructureError
			},
		]
	},
	{
		method: "post",
		path: "/data/:project/staging-reference-move",
		alias: "moveStagingReference",
		description: `Requires source/target folder UPDATE and media VIEW in the same area, matching folder digests and a source edge. The medium and archive unit remain unchanged. Exact retries return a durable owner-scoped receipt after rechecking visibility. Same-folder moves are validated no-ops; existing target edges are retained. Responses use Cache-Control: no-store.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: ArchiveStructureReferenceMoveRequest
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "Idempotency-Key",
				type: "Header",
				schema: z.string().uuid()
			},
		],
		response: ArchiveStructureReferenceMoveResponse,
		errors: [
			{
				status: 400,
				description: `Invalid request or hierarchy.`,
				schema: ArchiveStructureError
			},
			{
				status: 401,
				description: `Authentication required; retains the legacy message envelope.`,
				schema: z.void()
			},
			{
				status: 403,
				description: `Operation not permitted.`,
				schema: ArchiveStructureError
			},
			{
				status: 404,
				description: `Resource or owner-scoped receipt unavailable.`,
				schema: ArchiveStructureError
			},
			{
				status: 409,
				description: `Stale state, reference or idempotency conflict.`,
				schema: ArchiveStructureError
			},
			{
				status: 413,
				description: `Request exceeds 2,000,000 bytes.`,
				schema: ArchiveStructureError
			},
			{
				status: 503,
				description: `Coordination or configuration unavailable.`,
				schema: ArchiveStructureError
			},
		]
	},
	{
		method: "post",
		path: "/data/:project/staging-system-folders",
		alias: "ensureStagingSystemFolders",
		description: `Requires project ADMIN_RESOURCES or system ADMIN_OLDAP. Creates missing top, top/Trash and top/Mobile in one coordinated transaction. Retries reuse existing folders without changing their metadata or ACLs. The default role receives DATA_DELETE on new top/Trash and DATA_VIEW on Mobile. Does not grant the administrator private data access. Duplicate or misplaced system folders are rejected. Returns no private contents.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: z.object({ stagingAreaIri: z.string() })
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ ready: z.literal(true) }).passthrough(),
		errors: [
			{
				status: 400,
				description: `Invalid request.`,
				schema: z.void()
			},
			{
				status: 401,
				description: `Authentication required.`,
				schema: z.void()
			},
			{
				status: 403,
				description: `Administrative permission required.`,
				schema: z.void()
			},
			{
				status: 404,
				description: `Project or StagingArea does not exist.`,
				schema: z.void()
			},
			{
				status: 409,
				description: `Ambiguous or misplaced system folders.`,
				schema: z.void()
			},
			{
				status: 503,
				description: `Write coordination or verification unavailable.`,
				schema: z.void()
			},
		]
	},
	{
		method: "post",
		path: "/data/:project/staging-upload-target",
		alias: "authorizeStagingUploadTarget",
		description: `Validates that the authenticated user may create data in the project and update the selected StagingArea/folder pair. Returns server-owned upload configuration such as the media path, default role permission, and quota. Clients must not choose or override these trusted values. The protected Mobile inbox is intentionally rejected by this endpoint; its resumable upload workflow uses the dedicated mobile-upload API.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: authorizeStagingUploadTarget_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ projectShortName: z.string(), stagingAreaIri: z.string(), stagingAreaName: z.string().optional(), stagingFolderIri: z.string(), stagingFolderName: z.string().optional(), mediaPath: z.string(), quotaBytes: z.number().int().gte(1), attachedToRole: z.record(z.string()) }).passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `The target is protected or has incomplete quota/configuration.`,
				schema: z.void()
			},
			{
				status: 503,
				description: `OLDAP could not resolve the target configuration.`,
				schema: z.void()
			},
		]
	},
	{
		method: "get",
		path: "/data/annotations/:project/:instiri",
		alias: "getDataannotationsProjectInstiri",
		description: `Lazy opt-in expansion. Ordinary instance GET, summaries and search do not load annotations. Returns independent reifier IDs and typed RDF values; external, blank-node and orphan records are diagnostic/read-only.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "instiri",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ items: z.array(AssertionAnnotation) }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Instance not found or not visible`,
				schema: z.void()
			},
		]
	},
	{
		method: "get",
		path: "/data/history/:project/:instiri",
		alias: "getDatahistoryProjectInstiri",
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "instiri",
				type: "Path",
				schema: z.string()
			},
			{
				name: "property",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "limit",
				type: "Query",
				schema: z.number().int().gte(1).lte(1000).optional().default(100)
			},
			{
				name: "offset",
				type: "Query",
				schema: z.number().int().gte(0).optional().default(0)
			},
		],
		response: z.void(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Instance not found or not visible`,
				schema: z.void()
			},
		]
	},
	{
		method: "post",
		path: "/data/history/:project/:instiri/restore",
		alias: "postDatahistoryProjectInstirirestore",
		description: `Restores base values and annotation groups atomically. Changed annotation groups receive fresh owned IDs; unrelated annotations are retained. An identical group is a no-op. Current model constraints still apply.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: z.object({ historyIri: z.string() })
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "instiri",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.void(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Instance or history entry not found`,
				schema: z.void()
			},
			{
				status: 409,
				description: `Current model, ownership or concurrent-write conflict`,
				schema: z.void()
			},
		]
	},
	{
		method: "get",
		path: "/data/mediaobject/id/:id",
		alias: "getDatamediaobjectidId",
		description: `Missing media return HTTP 404 with message &quot;MediaObject not found&quot;, whether the lookup returns no result or raises a not-found error. Other lookup errors retain their status; they are not treated as missing media.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "id",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ iri: z.string(), graph: z.unknown(), permval: z.unknown(), "oldap:createdBy": z.unknown(), "oldap:creationDate": z.unknown(), "oldap:lastModifiedBy": z.unknown(), "oldap:lastModificationDate": z.unknown(), "shared:assetId": z.unknown(), "shared:originalName": z.unknown(), "dcterms:type": z.unknown(), "shared:mediaAccessMode": z.enum(["local", "external"]), "shared:originalMimeType": z.string(), "shared:serverUrl": z.string(), "shared:path": z.string(), "shared:protocol": z.enum(["iiif", "http", "custom"]), "shared:mediaUrl": z.string().url(), "shared:thumbnailUrl": z.string().url(), token: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/data/mediaobject/iri/:iri",
		alias: "getDatamediaobjectiriIri",
		description: `Missing media return HTTP 404 with message &quot;MediaObject not found&quot;, whether the lookup returns no result or raises a not-found error. Other lookup errors retain their status; they are not treated as missing media.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "iri",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.object({ "oldap:createdBy": z.string(), "oldap:creationDate": z.string().datetime({ offset: true }), "oldap:lastModifiedBy": z.string(), "oldap:lastModificationDate": z.string().datetime({ offset: true }), "shared:assetId": z.string(), "shared:originalName": z.string(), "dcterms:type": z.enum(["dcmitype:Collection", "dcmitype:Dataset", "dcmitype:StillImage", "dcmitype:Image", "dcmitype:MovingImage", "dcmitype:Sound", "dcmitype:Text"]), "shared:mediaAccessMode": z.enum(["local", "external"]), "shared:originalMimeType": z.string(), "shared:serverUrl": z.string(), "shared:path": z.string(), "shared:protocol": z.enum(["iiif", "http", "custom"]), "shared:mediaUrl": z.string().url(), "shared:thumbnailUrl": z.string().url(), token: z.string() }).partial().passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/data/ofclass/:project",
		alias: "getDataofclassProject",
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "resClass",
				type: "Query",
				schema: z.string().regex(/^([A-Za-z_][A-Za-z0-9._-]*:)?[A-Za-z_][A-Za-z0-9._-]*$/)
			},
			{
				name: "includeProperties",
				type: "Query",
				schema: z.array(z.string().regex(/^([A-Za-z_][A-Za-z0-9._-]*:)?[A-Za-z_][A-Za-z0-9._-]*$/)).optional()
			},
			{
				name: "countOnly",
				type: "Query",
				schema: z.boolean().optional()
			},
			{
				name: "sortBy",
				type: "Query",
				schema: z.array(z.string().regex(/^(?:[A-Za-z_][A-Za-z0-9._-]*:)?[A-Za-z_][A-Za-z0-9._-]*\|(asc|desc)$/)).optional()
			},
			{
				name: "limit",
				type: "Query",
				schema: z.number().int().optional().default(100)
			},
			{
				name: "offset",
				type: "Query",
				schema: z.number().int().optional().default(0)
			},
		],
		response: z.union([z.array(z.record(z.union([z.string(), z.number(), z.boolean(), z.null(), ValueArray, DatingValue, z.object({}).partial().passthrough()]))), z.object({ count: z.number().int() })]),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/data/search/:project",
		alias: "postDatasearchProject",
		description: `Structured instance search. Use this endpoint for property filters, Lucene ftfilter searches and hlfilter searches.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: postDatasearchProject_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.union([z.array(z.object({ "@annotations": z.array(AssertionAnnotation) }).partial().passthrough()), z.object({ count: z.number().int() }).passthrough()]),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/data/search/:project/class/:resclass",
		alias: "postDatasearchProjectclassResclass",
		description: `Structured instance search restricted to the given resource class. Use this endpoint for property filters, Lucene ftfilter searches and hlfilter searches.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: postDatasearchProjectclassResclass_Body
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "resclass",
				type: "Path",
				schema: z.string().regex(/^([A-Za-z_][A-Za-z0-9:_-]*:)?[A-Za-z_][A-Za-z0-9:_-]*$/)
			},
		],
		response: z.union([z.array(z.object({ "@annotations": z.array(AssertionAnnotation) }).partial().passthrough()), z.object({ count: z.number().int() }).passthrough()]),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/data/summaries/:project",
		alias: "postDatasummariesProject",
		description: `Returns compact metadata for at most 100 requested resource IRIs using one backend batch read. Missing and unreadable resources are both omitted, so callers cannot use the endpoint to probe protected resource existence. &#x60;rdf:type&#x60; is always returned; &#x60;includeProperties&#x60; controls all other metadata fields. When &#x60;includeMediaDelivery&#x60; is true, readable media resources also receive a short-lived authorized IIIF delivery or an external-image delivery description. Existing single-resource endpoints are unchanged.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: ResourceSummaryRequest
			},
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
		],
		response: ResourceSummaryResponse,
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 500,
				description: `Error 500: Internal Server Error - Unexpected server error occurred`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/data/text/:project",
		alias: "getDatatextProject",
		description: `Searches all available text fields for the given string via ResourceInstance.search_fulltext. The optional resource class can be provided as the resClass query parameter.`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "q",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "searchString",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "resClass",
				type: "Query",
				schema: z.string().regex(/^([A-Za-z_][A-Za-z0-9:_-]*:)?[A-Za-z_][A-Za-z0-9:_-]*$/).optional()
			},
			{
				name: "countOnly",
				type: "Query",
				schema: z.boolean().optional()
			},
			{
				name: "sortBy",
				type: "Query",
				schema: z.array(z.string().regex(/^(?:[A-Za-z_][A-Za-z0-9._-]*:)?[A-Za-z_][A-Za-z0-9._-]*\|(asc|desc)$/)).optional()
			},
			{
				name: "limit",
				type: "Query",
				schema: z.number().int().optional().default(100)
			},
			{
				name: "offset",
				type: "Query",
				schema: z.number().int().optional().default(0)
			},
		],
		response: z.union([z.array(z.object({}).partial().passthrough()), z.object({ count: z.number().int() }).passthrough()]),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/data/text/:project/class/:resclass",
		alias: "getDatatextProjectclassResclass",
		description: `Searches all available text fields for the given string via ResourceInstance.search_fulltext, restricted to the given resource class.`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "resclass",
				type: "Path",
				schema: z.string().regex(/^([A-Za-z_][A-Za-z0-9:_-]*:)?[A-Za-z_][A-Za-z0-9:_-]*$/)
			},
			{
				name: "q",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "searchString",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "countOnly",
				type: "Query",
				schema: z.boolean().optional()
			},
			{
				name: "sortBy",
				type: "Query",
				schema: z.array(z.string()).optional()
			},
			{
				name: "limit",
				type: "Query",
				schema: z.number().int().optional().default(100)
			},
			{
				name: "offset",
				type: "Query",
				schema: z.number().int().optional().default(0)
			},
		],
		response: z.union([z.array(z.object({}).partial().passthrough()), z.object({ count: z.number().int() }).passthrough()]),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/data/textsearch/:project",
		alias: "getDatatextsearchProject",
		description: `Compatibility endpoint for ResourceInstance.search_fulltext. Searches all available text fields for the given string and optionally restricts results to a resource class.`,
		requestFormat: "json",
		parameters: [
			{
				name: "project",
				type: "Path",
				schema: z.string()
			},
			{
				name: "searchString",
				type: "Query",
				schema: z.string()
			},
			{
				name: "q",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "resClass",
				type: "Query",
				schema: z.string().regex(/^([A-Za-z_][A-Za-z0-9:_-]*:)?[A-Za-z_][A-Za-z0-9:_-]*$/).optional()
			},
			{
				name: "countOnly",
				type: "Query",
				schema: z.boolean().optional()
			},
			{
				name: "sortBy",
				type: "Query",
				schema: z.array(z.enum(["PROPVAL", "CREATED", "LASTMOD", "PROPVAL|asc", "PROPVAL|desc", "CREATED|asc", "CREATED|desc", "LASTMOD|asc", "LASTMOD|desc"])).optional()
			},
			{
				name: "limit",
				type: "Query",
				schema: z.number().int().optional().default(100)
			},
			{
				name: "offset",
				type: "Query",
				schema: z.number().int().optional().default(0)
			},
		],
		response: z.union([z.array(z.object({}).partial().passthrough()), z.object({ count: z.number().int() }).passthrough()]),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/exports",
		alias: "postExports",
		description: `Requires DATA_VIEW on every included resource and freezes a versioned project-profile manifest.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: CreateExportJobRequest
			},
		],
		response: ExportJob,
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 403: Forbidden - Insufficient permissions to perform the requested operation`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 413,
				description: `Error 413: Payload Too Large - Declared ZIP or export size exceeds its limit`,
				schema: Error
			},
			{
				status: 429,
				description: `Error 429: Too Many Requests - Export job or retained-byte quota is exhausted`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/exports",
		alias: "getExports",
		requestFormat: "json",
		parameters: [
			{
				name: "state",
				type: "Query",
				schema: z.enum(["QUEUED", "BUILDING", "READY", "FAILED", "CANCELLED", "EXPIRED", "DELETING", "DELETED"]).optional()
			},
			{
				name: "cursor",
				type: "Query",
				schema: z.string().max(512).optional()
			},
			{
				name: "limit",
				type: "Query",
				schema: z.number().int().gte(1).lte(100).optional().default(25)
			},
		],
		response: z.object({ items: z.array(ExportJob), nextCursor: z.string().max(512).optional() }),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/exports/:exportId",
		alias: "getExportsExportId",
		requestFormat: "json",
		parameters: [
			{
				name: "exportId",
				type: "Path",
				schema: z.string().uuid()
			},
		],
		response: ExportJob,
		errors: [
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "delete",
		path: "/exports/:exportId",
		alias: "deleteExportsExportId",
		requestFormat: "json",
		parameters: [
			{
				name: "exportId",
				type: "Path",
				schema: z.string().uuid()
			},
			{
				name: "expectedStateVersion",
				type: "Query",
				schema: z.number().int().gte(0)
			},
		],
		response: ExportJob,
		errors: [
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/exports/:exportId/download-capability",
		alias: "postExportsExportIddownloadCapability",
		requestFormat: "json",
		parameters: [
			{
				name: "exportId",
				type: "Path",
				schema: z.string().uuid()
			},
		],
		response: ExportDownloadAuthorization,
		errors: [
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 403: Forbidden - Insufficient permissions to perform the requested operation`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/exports/estimate",
		alias: "postExportsestimate",
		description: `Read-only estimate. The later authorized manifest snapshot remains authoritative.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: CreateExportJobRequest
			},
		],
		response: ExportEstimate,
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 403: Forbidden - Insufficient permissions to perform the requested operation`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/imports",
		alias: "postImports",
		description: `Requires ADMIN_CREATE and effective DATA_UPDATE on the selected staging area.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: CreateImportJobRequest
			},
		],
		response: CreateImportJobResponse,
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 403: Forbidden - Insufficient permissions to perform the requested operation`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 413,
				description: `Error 413: Payload Too Large - Declared ZIP or export size exceeds its limit`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/imports",
		alias: "getImports",
		requestFormat: "json",
		parameters: [
			{
				name: "state",
				type: "Query",
				schema: z.enum(["UPLOADING", "VALIDATING", "READY", "IMPORTING", "IMPORTED", "INVALID", "FAILED", "CANCELLED", "EXPIRED"]).optional()
			},
			{
				name: "cursor",
				type: "Query",
				schema: z.string().max(512).optional()
			},
			{
				name: "limit",
				type: "Query",
				schema: z.number().int().gte(1).lte(100).optional().default(25)
			},
		],
		response: z.object({ items: z.array(ImportJob), nextCursor: z.string().max(512).optional() }),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/imports/:importId",
		alias: "getImportsImportId",
		requestFormat: "json",
		parameters: [
			{
				name: "importId",
				type: "Path",
				schema: z.string().uuid()
			},
		],
		response: ImportJob,
		errors: [
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/imports/:importId/cancel",
		alias: "postImportsImportIdcancel",
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: z.object({ expectedStateVersion: z.number().int().gte(0) })
			},
			{
				name: "importId",
				type: "Path",
				schema: z.string().uuid()
			},
		],
		response: ImportJob,
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/imports/:importId/confirm",
		alias: "postImportsImportIdconfirm",
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: z.object({ expectedStateVersion: z.number().int().gte(0) })
			},
			{
				name: "importId",
				type: "Path",
				schema: z.string().uuid()
			},
		],
		response: ImportJob,
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 403: Forbidden - Insufficient permissions to perform the requested operation`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/imports/:importId/report",
		alias: "getImportsImportIdreport",
		description: `The API authorizes ownership and retrieves the immutable record with a purpose-specific internal token that is never returned to the browser.`,
		requestFormat: "json",
		parameters: [
			{
				name: "importId",
				type: "Path",
				schema: z.string().uuid()
			},
		],
		response: z.object({ documentType: z.string(), schemaVersion: z.string(), importId: z.string().uuid(), generatedAt: z.string().datetime({ offset: true }), status: z.enum(["READY", "INVALID", "FAILED"]), canConfirm: z.boolean() }).passthrough(),
		errors: [
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/imports/:importId/upload-capability",
		alias: "postImportsImportIduploadCapability",
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: z.object({ expectedStateVersion: z.number().int().gte(0) })
			},
			{
				name: "importId",
				type: "Path",
				schema: z.string().uuid()
			},
		],
		response: ImportUploadAuthorization,
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/internal/export-claims",
		alias: "postInternalexportClaims",
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: ExportClaimRequest
			},
		],
		response: z.union([ExportClaim, z.null()]),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/internal/export-claims/:claimId/heartbeat",
		alias: "postInternalexportClaimsClaimIdheartbeat",
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: ExportClaimHeartbeat
			},
			{
				name: "claimId",
				type: "Path",
				schema: z.string().uuid()
			},
		],
		response: ExportLease,
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/internal/exports/:exportId/cleanup-result",
		alias: "postInternalexportsExportIdcleanupResult",
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: ExportCleanupResult
			},
			{
				name: "exportId",
				type: "Path",
				schema: z.string().uuid()
			},
		],
		response: ExportJob,
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "get",
		path: "/internal/exports/:exportId/manifest",
		alias: "getInternalexportsExportIdmanifest",
		requestFormat: "json",
		parameters: [
			{
				name: "exportId",
				type: "Path",
				schema: z.string().uuid()
			},
			{
				name: "claimId",
				type: "Query",
				schema: z.string().uuid()
			},
		],
		response: z.object({ documentType: z.string(), schemaVersion: z.string(), exportId: z.string().uuid() }).passthrough(),
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/internal/exports/:exportId/result",
		alias: "postInternalexportsExportIdresult",
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: ExportBuildResult
			},
			{
				name: "exportId",
				type: "Path",
				schema: z.string().uuid()
			},
		],
		response: ExportJob,
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/internal/import-claims",
		alias: "postInternalimportClaims",
		description: `Internal-only single-worker queue. No second task is returned while any unexpired lease exists.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: ImportClaimRequest
			},
		],
		response: ImportClaim,
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/internal/import-claims/:claimId/heartbeat",
		alias: "postInternalimportClaimsClaimIdheartbeat",
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: ImportClaimHeartbeat
			},
			{
				name: "claimId",
				type: "Path",
				schema: z.string().uuid()
			},
		],
		response: ImportLease,
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/internal/import-claims/:claimId/target-preflight",
		alias: "postInternalimportClaimsClaimIdtargetPreflight",
		description: `Internal claim-bound operation. The API reads and normalizes current direct children; the worker receives only collision findings.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: ImportTargetPreflightRequest
			},
			{
				name: "claimId",
				type: "Path",
				schema: z.string().uuid()
			},
		],
		response: ImportTargetPreflightResponse,
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/internal/imports/:importId/cleanup-result",
		alias: "postInternalimportsImportIdcleanupResult",
		description: `Internal-only idempotent result. EXPIRED becomes authoritative only after deletion proof; IMPORTED keeps its staging quota reservation.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: ImportCleanupResult
			},
			{
				name: "importId",
				type: "Path",
				schema: z.string().uuid()
			},
		],
		response: ImportJob,
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/internal/imports/:importId/commit",
		alias: "postInternalimportsImportIdcommit",
		description: `Rechecks the original user&#x27;s current authorization, target identity, default role, direct-child collisions, deterministic resource IRIs, and asset IDs in the same GraphDB transaction as the complete resource/job write.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: ImportCommitRequest
			},
			{
				name: "importId",
				type: "Path",
				schema: z.string().uuid()
			},
		],
		response: ImportCommitResponse,
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 403,
				description: `Error 403: Forbidden - Insufficient permissions to perform the requested operation`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/internal/imports/:importId/failed",
		alias: "postInternalimportsImportIdfailed",
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: ImportTaskFailure
			},
			{
				name: "importId",
				type: "Path",
				schema: z.string().uuid()
			},
		],
		response: ImportJob,
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/internal/imports/:importId/sip-stored",
		alias: "postInternalimportsImportIdsipStored",
		description: `Internal-only route. It performs UPLOADING to VALIDATING; identical event replay returns the accepted job and conflicting replay returns 409.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: SipStoredEvent
			},
			{
				name: "importId",
				type: "Path",
				schema: z.string().uuid()
			},
		],
		response: ImportJob,
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/internal/imports/:importId/validation-result",
		alias: "postInternalimportsImportIdvalidationResult",
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: z.unknown().and(z.unknown()).and(z.unknown())
			},
			{
				name: "importId",
				type: "Path",
				schema: z.string().uuid()
			},
		],
		response: ImportJob,
		errors: [
			{
				status: 400,
				description: `Error 400: Bad Request - Invalid input parameters, malformed request, or validation errors`,
				schema: Error
			},
			{
				status: 401,
				description: `Error 401: Unauthorized - Authentication failed, invalid token, or missing credentials`,
				schema: Error
			},
			{
				status: 404,
				description: `Error 404: Not Found - Requested resource does not exist`,
				schema: Error
			},
			{
				status: 409,
				description: `Error 409: Conflict - Resource already exists or operation conflicts with current state`,
				schema: Error
			},
			{
				status: 503,
				description: `Error 503: Service Unavailable - Required backend service or configuration is missing`,
				schema: Error
			},
		]
	},
	{
		method: "post",
		path: "/internal/mobile-media/v1/lifecycle-events/:eventId/complete",
		alias: "postInternalmobileMediav1lifecycleEventsEventIdcomplete",
		description: `Internal worker-only exact-claim acknowledgement. An identical replay after a lost response is idempotent. A stale or foreign active claim is rejected and the durable event remains recoverable.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: postInternalmobileMediav1lifecycleEventsEventIdcomplete_Body
			},
			{
				name: "eventId",
				type: "Path",
				schema: z.string().uuid()
			},
		],
		response: z.object({ eventId: z.string().uuid(), state: z.string() }),
		errors: [
			{
				status: 400,
				description: `Stable privacy-preserving internal mobile-media failure.`,
				schema: z.void()
			},
			{
				status: 401,
				description: `Stable privacy-preserving internal mobile-media failure.`,
				schema: z.void()
			},
			{
				status: 409,
				description: `Stable privacy-preserving internal mobile-media failure.`,
				schema: z.void()
			},
			{
				status: 503,
				description: `Stable privacy-preserving internal mobile-media failure.`,
				schema: z.void()
			},
		]
	},
	{
		method: "post",
		path: "/internal/mobile-media/v1/lifecycle-events/claims",
		alias: "postInternalmobileMediav1lifecycleEventsclaims",
		description: `Internal worker-only operation over the GraphDB outbox. The oldest pending or expired claim is leased without exposing a public media or staging lookup. Empty work returns 204. The purpose-specific token is not accepted by the mobile commit operation and vice versa.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: z.object({ workerId: z.string().regex(/^[A-Za-z0-9._:-]{1,128}$/) })
			},
		],
		response: MobileMediaLifecycleClaim,
		errors: [
			{
				status: 400,
				description: `Stable privacy-preserving internal mobile-media failure.`,
				schema: z.void()
			},
			{
				status: 401,
				description: `Stable privacy-preserving internal mobile-media failure.`,
				schema: z.void()
			},
			{
				status: 503,
				description: `Stable privacy-preserving internal mobile-media failure.`,
				schema: z.void()
			},
		]
	},
	{
		method: "post",
		path: "/internal/mobile-media/v1/uploads/:uploadId/commit",
		alias: "postInternalmobileMediav1uploadsUploadIdcommit",
		description: `Internal-only exact-replay operation. The media service asserts upload-owned durable publication, while OLDAP independently revalidates the active Fasnacht account, organisation, role, StagingArea, ADMIN_CREATE permission, and exact protected top/Mobile inbox. The API derives all resource, storage, staging-status, and role facts and writes exactly one StagingMediaObject plus its permanent receipt in one GraphDB transaction.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: MobileMediaCommitRequest
			},
			{
				name: "uploadId",
				type: "Path",
				schema: z.string().uuid()
			},
		],
		response: MobileMediaCommitResult,
		errors: [
			{
				status: 400,
				description: `Stable privacy-preserving internal mobile-media failure.`,
				schema: z.void()
			},
			{
				status: 401,
				description: `Stable privacy-preserving internal mobile-media failure.`,
				schema: z.void()
			},
			{
				status: 403,
				description: `Stable privacy-preserving internal mobile-media failure.`,
				schema: z.void()
			},
			{
				status: 404,
				description: `Stable privacy-preserving internal mobile-media failure.`,
				schema: z.void()
			},
			{
				status: 409,
				description: `Stable privacy-preserving internal mobile-media failure.`,
				schema: z.void()
			},
			{
				status: 503,
				description: `Stable privacy-preserving internal mobile-media failure.`,
				schema: z.void()
			},
		]
	},
	{
		method: "post",
		path: "/mobile/v1/auth/login",
		alias: "postMobilev1authlogin",
		description: `Authenticate a named OLDAP user and return the existing Variant D access and refresh JWTs in JSON for native Keychain/Keystore storage. This additive route never creates an authentication cookie and does not change token claims, signing, lifetimes, or the browser login contract.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: MobileLoginRequest
			},
		],
		response: MobileTokenResponse,
		errors: [
			{
				status: 400,
				description: `Stable native authentication error`,
				schema: MobileAuthError
			},
			{
				status: 401,
				description: `Stable native authentication failure`,
				schema: MobileAuthError
			},
			{
				status: 503,
				description: `Stable native authentication error`,
				schema: MobileAuthError
			},
		]
	},
	{
		method: "post",
		path: "/mobile/v1/auth/refresh",
		alias: "postMobilev1authrefresh",
		description: `Validate a fixed-lifetime stateless refresh JWT supplied in JSON, load current user permissions, compare authVersion, and return a new access JWT. The refresh JWT is not rotated and no authentication cookie is read or written.
`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: z.object({ refreshToken: z.string().min(1) })
			},
		],
		response: MobileAccessTokenResponse,
		errors: [
			{
				status: 400,
				description: `Stable native authentication error`,
				schema: MobileAuthError
			},
			{
				status: 401,
				description: `Stable native authentication failure`,
				schema: MobileAuthError
			},
			{
				status: 503,
				description: `Stable native authentication error`,
				schema: MobileAuthError
			},
		]
	},
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
    return new Zodios(baseUrl, endpoints, options);
}
