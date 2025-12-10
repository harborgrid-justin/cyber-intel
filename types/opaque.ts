
export type Opaque<K, T> = T & { __TYPE__: K };
export type FilePath = Opaque<'FilePath', string>;
export type ISOTimestamp = Opaque<'ISOTimestamp', string>;
export type JWT = Opaque<'JWT', string>;

export const toFilePath = (s: string): FilePath => s as FilePath;
export const toISOTimestamp = (d: Date): ISOTimestamp => d.toISOString() as ISOTimestamp;

export type ThreatId = string;
export type CaseId = string;
export type ActorId = string;
export type UserId = string;
export type AssetId = string;
export type VendorId = string;
