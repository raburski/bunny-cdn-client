/**
 * Ensures a URL uses HTTPS protocol
 * @param url - The URL to ensure HTTPS for
 * @returns The URL with HTTPS protocol
 */
export function ensureHTTPS(url: string): string {
	if (!url) {
		return url
	}

	// If URL already has a protocol, ensure it's HTTPS
	if (url.startsWith('http://')) {
		return url.replace('http://', 'https://')
	}

	// If URL doesn't have a protocol, add HTTPS
	if (!url.startsWith('https://') && !url.startsWith('http://')) {
		return `https://${url}`
	}

	// URL already has HTTPS or is relative
	return url
}

/**
 * Constructs a full HTTPS URL from a base URL and path
 * @param baseUrl - The base URL (e.g., pull zone URL)
 * @param path - The path to append
 * @returns The full HTTPS URL
 */
export function buildHTTPSUrl(baseUrl: string, path: string): string {
	const cleanBaseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
	const cleanPath = path.replace(/^\//, '') // Remove leading slash
	const fullUrl = `${cleanBaseUrl}/${cleanPath}`
	return ensureHTTPS(fullUrl)
}

