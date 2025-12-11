
// Opaque types for stronger type safety on ID-like strings
export type Opaque<K, T> = T & { __TYPE__: K };

// Entity-specific IDs
export type ThreatId = Opaque<'ThreatId', string>;
export type CaseId = Opaque<'CaseId', string>;
export type ActorId = Opaque<'ActorId', string>;
export type UserId = Opaque<'UserId', string>;
export type AssetId = Opaque<'AssetId', string>;
export type VendorId = Opaque<'VendorId', string>;

// Utility types
export type FilePath = Opaque<'FilePath', string>;
export type ISOTimestamp = Opaque<'ISOTimestamp', string>;
export type JWT = Opaque<'JWT', string>;
