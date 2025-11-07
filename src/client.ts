import { buildHTTPSUrl, ensureHTTPS } from './utils'
import type { BunnyCDNConfig, UploadResult, DeleteResult } from './types'

/**
 * Client for interacting with Bunny CDN Storage API
 */
export class BunnyCDNClient {
	private config: BunnyCDNConfig

	/**
	 * Creates a new BunnyCDNClient instance
	 * @param config - Configuration object with storage zone, API key, and URLs
	 * @throws Error if required configuration is missing
	 */
	constructor(config: BunnyCDNConfig) {
		if (!config.storageZone || !config.apiKey || !config.cdnUrl || !config.pullZoneUrl) {
			throw new Error('Missing Bunny CDN configuration. All fields (storageZone, apiKey, cdnUrl, pullZoneUrl) are required.')
		}

		this.config = config
	}

	/**
	 * Upload a buffer to Bunny CDN (Node.js compatible)
	 * @param buffer - The file buffer to upload
	 * @param path - Full path including filename (e.g., "buildings/123/image.jpg")
	 * @param contentType - MIME type of the file (default: 'image/jpeg')
	 * @returns Promise resolving to upload result with success status and URL or error
	 */
	async uploadBuffer(
		buffer: Buffer,
		path: string,
		contentType: string = 'image/jpeg'
	): Promise<UploadResult> {
		try {
			const uploadUrl = buildHTTPSUrl(this.config.cdnUrl, `${this.config.storageZone}/${path}`)
			
			const response = await fetch(uploadUrl, {
				method: 'PUT',
				headers: {
					'AccessKey': this.config.apiKey,
					'Content-Type': contentType,
				},
				body: buffer,
			})

			if (!response.ok) {
				console.error('Bunny CDN upload failed:', response.status, response.statusText)
				return {
					success: false,
					error: `Upload failed: ${response.status} ${response.statusText}`
				}
			}

			const publicUrl = buildHTTPSUrl(this.config.pullZoneUrl, path)
			
			return {
				success: true,
				url: publicUrl
			}
		} catch (error) {
			console.error('Error uploading to Bunny CDN:', error)
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown upload error'
			}
		}
	}

	/**
	 * Delete a file from Bunny CDN
	 * @param path - Full path including filename (e.g., "buildings/123/image.jpg")
	 * @returns Promise resolving to delete result with success status or error
	 */
	async deleteFile(path: string): Promise<DeleteResult> {
		try {
			const deleteUrl = ensureHTTPS(`${this.config.cdnUrl}/${this.config.storageZone}/${path}`)
			
			const response = await fetch(deleteUrl, {
				method: 'DELETE',
				headers: {
					'AccessKey': this.config.apiKey,
				},
			})

			if (!response.ok) {
				console.warn('Failed to delete file from CDN:', response.status, response.statusText)
				return {
					success: false,
					error: `Delete failed: ${response.status} ${response.statusText}`
				}
			}

			return {
				success: true
			}
		} catch (error) {
			console.warn('Error deleting from Bunny CDN:', error)
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown delete error'
			}
		}
	}

	/**
	 * Delete a file from Bunny CDN using its public URL
	 * @param publicUrl - Public CDN URL of the file
	 * @param basePath - Base path to extract the relative path (e.g., "buildings/123")
	 * @returns Promise resolving to delete result with success status or error
	 */
	async deleteFileByUrl(publicUrl: string, basePath: string): Promise<DeleteResult> {
		try {
			// Extract filename from the public URL
			const urlParts = publicUrl.split('/')
			const filename = urlParts[urlParts.length - 1]
			
			if (!filename) {
				return {
					success: false,
					error: 'Could not extract filename from URL'
				}
			}
			
			// Construct the full path
			const fullPath = `${basePath}/${filename}`
			return await this.deleteFile(fullPath)
		} catch (error) {
			console.warn('Error deleting file by URL:', error)
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown delete error'
			}
		}
	}
}

