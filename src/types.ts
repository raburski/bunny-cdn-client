/**
 * Configuration for BunnyCDNClient
 */
export interface BunnyCDNConfig {
	storageZone: string
	apiKey: string
	cdnUrl: string
	pullZoneUrl: string
}

/**
 * Result of an upload operation
 */
export interface UploadResult {
	success: boolean
	url?: string
	error?: string
}

/**
 * Result of a delete operation
 */
export interface DeleteResult {
	success: boolean
	error?: string
}

/**
 * File information/metadata
 */
export interface FileInfo {
	name: string
	path: string
	size: number
	lastModified: Date
	isDirectory: boolean
}

/**
 * Result of a list files operation
 */
export interface ListFilesResult {
	success: boolean
	files?: FileInfo[]
	error?: string
}

/**
 * Result of a file exists check
 */
export interface FileExistsResult {
	exists: boolean
	error?: string
}

/**
 * Result of a get file info operation
 */
export interface GetFileInfoResult {
	success: boolean
	fileInfo?: FileInfo
	error?: string
}

/**
 * Result of an upload from URL operation
 */
export interface UploadFromUrlResult {
	success: boolean
	url?: string
	error?: string
}

