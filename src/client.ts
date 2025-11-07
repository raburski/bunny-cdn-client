import { buildHTTPSUrl, ensureHTTPS } from './utils'
import type {
	BunnyCDNConfig,
	UploadResult,
	DeleteResult,
	ListFilesResult,
	FileExistsResult,
	GetFileInfoResult,
	FileInfo,
	UploadFromUrlResult
} from './types'

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

	/**
	 * List files in a directory
	 * @param path - Directory path (e.g., "buildings/123" or "" for root)
	 * @returns Promise resolving to list result with files array or error
	 */
	async listFiles(path: string = ''): Promise<ListFilesResult> {
		try {
			const listUrl = buildHTTPSUrl(this.config.cdnUrl, `${this.config.storageZone}/${path}`)
			
			const response = await fetch(listUrl, {
				method: 'GET',
				headers: {
					'AccessKey': this.config.apiKey,
				},
			})

			if (!response.ok) {
				if (response.status === 404) {
					return {
						success: true,
						files: []
					}
				}
				return {
					success: false,
					error: `List files failed: ${response.status} ${response.statusText}`
				}
			}

			const data = await response.json()
			
			// BunnyCDN returns an array of file objects
			const files: FileInfo[] = Array.isArray(data) ? data.map((file: any) => ({
				name: file.ObjectName || file.Name || '',
				path: path ? `${path}/${file.ObjectName || file.Name || ''}` : (file.ObjectName || file.Name || ''),
				size: file.Length || file.Size || 0,
				lastModified: file.LastChanged ? new Date(file.LastChanged) : new Date(),
				isDirectory: file.IsDirectory || false
			})) : []

			return {
				success: true,
				files
			}
		} catch (error) {
			console.error('Error listing files:', error)
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown list files error'
			}
		}
	}

	/**
	 * Check if a file exists
	 * @param path - Full path including filename (e.g., "buildings/123/image.jpg")
	 * @returns Promise resolving to file exists result
	 */
	async fileExists(path: string): Promise<FileExistsResult> {
		try {
			const fileInfo = await this.getFileInfo(path)
			
			if (!fileInfo.success) {
				return {
					exists: false,
					error: fileInfo.error
				}
			}

			return {
				exists: fileInfo.fileInfo !== undefined && !fileInfo.fileInfo.isDirectory
			}
		} catch (error) {
			return {
				exists: false,
				error: error instanceof Error ? error.message : 'Unknown error checking file existence'
			}
		}
	}

	/**
	 * Get file information/metadata
	 * @param path - Full path including filename (e.g., "buildings/123/image.jpg")
	 * @returns Promise resolving to file info result
	 */
	async getFileInfo(path: string): Promise<GetFileInfoResult> {
		try {
			// Use HEAD request to get file metadata without downloading
			const fileUrl = buildHTTPSUrl(this.config.cdnUrl, `${this.config.storageZone}/${path}`)
			
			const response = await fetch(fileUrl, {
				method: 'HEAD',
				headers: {
					'AccessKey': this.config.apiKey,
				},
			})

			if (!response.ok) {
				if (response.status === 404) {
					return {
						success: true,
						fileInfo: undefined
					}
				}
				return {
					success: false,
					error: `Get file info failed: ${response.status} ${response.statusText}`
				}
			}

			const contentLength = response.headers.get('content-length')
			const lastModified = response.headers.get('last-modified')
			
			const pathParts = path.split('/')
			const fileName = pathParts[pathParts.length - 1]

			const fileInfo: FileInfo = {
				name: fileName,
				path: path,
				size: contentLength ? parseInt(contentLength, 10) : 0,
				lastModified: lastModified ? new Date(lastModified) : new Date(),
				isDirectory: false
			}

			return {
				success: true,
				fileInfo
			}
		} catch (error) {
			console.error('Error getting file info:', error)
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown get file info error'
			}
		}
	}

	/**
	 * Upload a file from an external URL (pull from URL)
	 * @param sourceUrl - External URL to pull the file from
	 * @param destinationPath - Full destination path including filename (e.g., "buildings/123/image.jpg")
	 * @returns Promise resolving to upload result with success status and URL or error
	 */
	async uploadFromUrl(sourceUrl: string, destinationPath: string): Promise<UploadFromUrlResult> {
		try {
			// First, fetch the file from the source URL
			const sourceResponse = await fetch(sourceUrl)
			
			if (!sourceResponse.ok) {
				return {
					success: false,
					error: `Failed to fetch source file: ${sourceResponse.status} ${sourceResponse.statusText}`
				}
			}

			const contentType = sourceResponse.headers.get('content-type') || 'application/octet-stream'
			const buffer = Buffer.from(await sourceResponse.arrayBuffer())

			// Upload the buffer using the existing uploadBuffer method
			return await this.uploadBuffer(buffer, destinationPath, contentType)
		} catch (error) {
			console.error('Error uploading from URL:', error)
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown upload from URL error'
			}
		}
	}
}

