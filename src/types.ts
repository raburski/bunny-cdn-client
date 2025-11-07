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

