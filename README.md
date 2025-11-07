# @raburski/bunny-cdn-client

A TypeScript client for interacting with Bunny CDN Storage API. This package provides a simple, type-safe interface for uploading and deleting files from Bunny CDN storage.

## Features

- ✅ TypeScript support with full type definitions
- ✅ Environment variable agnostic (config passed via constructor)
- ✅ No hardcoded paths or domain-specific logic
- ✅ Upload files from buffer or external URL
- ✅ Delete files by path or URL
- ✅ List files in directories
- ✅ Check file existence and get metadata
- ✅ Works in Node.js environments

## Installation

```bash
npm install @raburski/bunny-cdn-client
```

## Usage

### Basic Setup

```typescript
import { BunnyCDNClient } from '@raburski/bunny-cdn-client'

const client = new BunnyCDNClient({
	storageZone: 'my-storage-zone',
	apiKey: 'my-api-key',
	cdnUrl: 'https://storage.bunnycdn.com',
	pullZoneUrl: 'https://cdn.example.com'
})
```

### Upload a File

```typescript
import { readFileSync } from 'fs'

// Read file as buffer
const buffer = readFileSync('path/to/image.jpg')

// Upload to CDN
const result = await client.uploadBuffer(
	buffer,
	'buildings/123/image.jpg',  // Full path including filename
	'image/jpeg'                 // Content type (optional, defaults to 'image/jpeg')
)

if (result.success) {
	console.log('File uploaded:', result.url)
} else {
	console.error('Upload failed:', result.error)
}
```

### Delete a File

```typescript
// Delete by path
const deleteResult = await client.deleteFile('buildings/123/image.jpg')

if (deleteResult.success) {
	console.log('File deleted successfully')
} else {
	console.error('Delete failed:', deleteResult.error)
}
```

### Delete a File by URL

```typescript
// Delete using public URL
const publicUrl = 'https://cdn.example.com/buildings/123/image.jpg'
const deleteResult = await client.deleteFileByUrl(
	publicUrl,
	'buildings/123'  // Base path to extract relative path
)

if (deleteResult.success) {
	console.log('File deleted successfully')
} else {
	console.error('Delete failed:', deleteResult.error)
}
```

### List Files in a Directory

```typescript
// List all files in a directory
const listResult = await client.listFiles('buildings/123')

if (listResult.success && listResult.files) {
	listResult.files.forEach(file => {
		console.log(`${file.name} - ${file.size} bytes - ${file.lastModified}`)
	})
} else {
	console.error('List failed:', listResult.error)
}
```

### Check if File Exists

```typescript
// Check if a file exists
const existsResult = await client.fileExists('buildings/123/image.jpg')

if (existsResult.exists) {
	console.log('File exists!')
} else {
	console.log('File does not exist')
}
```

### Get File Information

```typescript
// Get file metadata (size, last modified, etc.)
const fileInfoResult = await client.getFileInfo('buildings/123/image.jpg')

if (fileInfoResult.success && fileInfoResult.fileInfo) {
	const info = fileInfoResult.fileInfo
	console.log(`File: ${info.name}`)
	console.log(`Size: ${info.size} bytes`)
	console.log(`Last Modified: ${info.lastModified}`)
} else {
	console.error('Get file info failed:', fileInfoResult.error)
}
```

### Upload from External URL

```typescript
// Pull a file from an external URL and upload to Bunny CDN
const uploadResult = await client.uploadFromUrl(
	'https://example.com/image.jpg',  // Source URL
	'buildings/123/image.jpg'          // Destination path
)

if (uploadResult.success) {
	console.log('File uploaded from URL:', uploadResult.url)
} else {
	console.error('Upload failed:', uploadResult.error)
}
```

## API Reference

### `BunnyCDNClient`

#### Constructor

```typescript
new BunnyCDNClient(config: BunnyCDNConfig)
```

**Parameters:**
- `config.storageZone` (string): Your Bunny CDN storage zone name
- `config.apiKey` (string): Your Bunny CDN API key (Access Key)
- `config.cdnUrl` (string): Storage API URL (e.g., `https://storage.bunnycdn.com`)
- `config.pullZoneUrl` (string): Public CDN URL (e.g., `https://cdn.example.com`)

#### Methods

##### `uploadBuffer(buffer, path, contentType?)`

Uploads a buffer to Bunny CDN.

**Parameters:**
- `buffer` (Buffer): The file buffer to upload
- `path` (string): Full path including filename (e.g., `"buildings/123/image.jpg"`)
- `contentType` (string, optional): MIME type (default: `'image/jpeg'`)

**Returns:** `Promise<UploadResult>`

##### `deleteFile(path)`

Deletes a file from Bunny CDN.

**Parameters:**
- `path` (string): Full path including filename (e.g., `"buildings/123/image.jpg"`)

**Returns:** `Promise<DeleteResult>`

##### `deleteFileByUrl(publicUrl, basePath)`

Deletes a file using its public URL.

**Parameters:**
- `publicUrl` (string): Public CDN URL of the file
- `basePath` (string): Base path to extract the relative path (e.g., `"buildings/123"`)

**Returns:** `Promise<DeleteResult>`

##### `listFiles(path?)`

Lists files in a directory.

**Parameters:**
- `path` (string, optional): Directory path (e.g., `"buildings/123"` or `""` for root)

**Returns:** `Promise<ListFilesResult>`

##### `fileExists(path)`

Checks if a file exists.

**Parameters:**
- `path` (string): Full path including filename (e.g., `"buildings/123/image.jpg"`)

**Returns:** `Promise<FileExistsResult>`

##### `getFileInfo(path)`

Gets file information/metadata (size, last modified date, etc.).

**Parameters:**
- `path` (string): Full path including filename (e.g., `"buildings/123/image.jpg"`)

**Returns:** `Promise<GetFileInfoResult>`

##### `uploadFromUrl(sourceUrl, destinationPath)`

Uploads a file from an external URL (pulls the file and uploads it to Bunny CDN).

**Parameters:**
- `sourceUrl` (string): External URL to pull the file from
- `destinationPath` (string): Full destination path including filename (e.g., `"buildings/123/image.jpg"`)

**Returns:** `Promise<UploadFromUrlResult>`

## Types

```typescript
interface BunnyCDNConfig {
	storageZone: string
	apiKey: string
	cdnUrl: string
	pullZoneUrl: string
}

interface UploadResult {
	success: boolean
	url?: string
	error?: string
}

interface DeleteResult {
	success: boolean
	error?: string
}

interface FileInfo {
	name: string
	path: string
	size: number
	lastModified: Date
	isDirectory: boolean
}

interface ListFilesResult {
	success: boolean
	files?: FileInfo[]
	error?: string
}

interface FileExistsResult {
	exists: boolean
	error?: string
}

interface GetFileInfoResult {
	success: boolean
	fileInfo?: FileInfo
	error?: string
}

interface UploadFromUrlResult {
	success: boolean
	url?: string
	error?: string
}
```

## Error Handling

All methods return result objects with a `success` boolean and optional `error` or `url` fields. Always check the `success` field before using the result:

```typescript
const result = await client.uploadBuffer(buffer, path)

if (!result.success) {
	// Handle error
	console.error(result.error)
	return
}

// Use the URL
console.log(result.url)
```

## Requirements

- Node.js >= 18.0.0
- TypeScript >= 5.0.0 (for TypeScript projects)

## License

MIT

