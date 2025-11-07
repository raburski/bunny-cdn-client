# @raburski/bunny-cdn-client

A TypeScript client for interacting with Bunny CDN Storage API. This package provides a simple, type-safe interface for uploading and deleting files from Bunny CDN storage.

## Features

- ✅ TypeScript support with full type definitions
- ✅ Environment variable agnostic (config passed via constructor)
- ✅ No hardcoded paths or domain-specific logic
- ✅ Simple API for upload and delete operations
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

