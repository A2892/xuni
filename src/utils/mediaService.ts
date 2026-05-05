import { supabase } from '@/lib/supabase'
// 当项目迁移到 CockroachDB（蟑螂云）时，前端通过后端 API 访问数据
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3001' : '/api'
const useCockroachApi = !!import.meta.env.VITE_COCKROACHDB_URL
const MAX_MEDIA_FILE_SIZE = Number(import.meta.env.VITE_MAX_MEDIA_FILE_SIZE || 5 * 1024 * 1024 * 1024)
const VIDEO_CLOUDINARY_MAX_SIZE = Number(import.meta.env.VITE_VIDEO_CLOUDINARY_MAX_SIZE || 100 * 1024 * 1024)
const CLOUDINARY_MAX_FILE_SIZE = Number(import.meta.env.VITE_CLOUDINARY_MAX_FILE_SIZE || VIDEO_CLOUDINARY_MAX_SIZE)
const CLOUDINARY_CLOUD_NAME = String(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '').trim()
const CLOUDINARY_UPLOAD_PRESET = String(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '').trim()
const CLOUDINARY_FOLDER = String(import.meta.env.VITE_CLOUDINARY_FOLDER || 'student-media').trim()
const useCloudinaryDirectUpload = Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET)
const R2_PRESIGN_RETRY_COUNT = Math.max(1, Number(import.meta.env.VITE_R2_PRESIGN_RETRY_COUNT || 3))
const R2_UPLOAD_RETRY_COUNT = Math.max(1, Number(import.meta.env.VITE_R2_UPLOAD_RETRY_COUNT || 3))
const R2_UPLOAD_TIMEOUT_MS = Math.max(60_000, Number(import.meta.env.VITE_R2_UPLOAD_TIMEOUT_MS || 30 * 60 * 1000))
import type { MediaItem } from '@/types/media'
import { getAllStudentProfiles } from './studentProfileService'
import type { StudentProfile } from '@/types/student'

/**
 * 使用本地存储上传文件（不需要Supabase）
 */
async function uploadToLocalStorage(
  file: File,
  metadata: {
    studentName?: string
    studentId?: string
    description?: string
    tags?: string[]
  }
): Promise<MediaUploadResult> {
  try {
    // 将文件转换为Base64
    const base64 = await fileToBase64(file)
    
    // 确定文件类型
    const type = file.type.startsWith('image/') ? 'photo' : 'video'
    
    // 创建媒体项
    const mediaItem: MediaItem = {
      id: generateId(),
      type,
      url: base64,
      thumbnail: base64,
      fileName: file.name,
      fileSize: file.size,
      uploadDate: new Date().toISOString(),
      studentName: metadata.studentName || undefined,
      studentId: metadata.studentId || undefined,
      description: metadata.description || undefined,
      tags: metadata.tags || []
    }
    
    // 保存到localStorage
    const existingItems = JSON.parse(localStorage.getItem('mediaItems') || '[]')
    existingItems.push(mediaItem)
    localStorage.setItem('mediaItems', JSON.stringify(existingItems))
    
    return {
      success: true,
      data: mediaItem
    }
  } catch (error) {
    return {
      success: false,
      error,
      message: '本地存储失败'
    }
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export interface MediaUploadResult {
  success: boolean
  data?: MediaItem
  error?: any
  message?: string
}

export interface MediaUploadProgress {
  percent: number
  loadedBytes: number
  totalBytes: number
  chunkIndex: number
  totalChunks: number
}

export interface MediaUploadOptions {
  onProgress?: (progress: MediaUploadProgress) => void
}

function isRateLimitLikeError(error: any): boolean {
  const msg = String(error?.message || error || '')
  return msg.includes('请求过于频繁') || msg.includes('429') || msg.toLowerCase().includes('too many requests')
}

function formatSizeMB(bytes: number): string {
  return `${(Math.max(0, bytes) / 1024 / 1024).toFixed(1)}MB`
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizePotentialR2ObjectKey(input: string): string {
  let key = String(input || '').trim()
  if (!key) return ''

  if (key.startsWith('r2:')) {
    key = key.slice(3)
  }

  // 兼容误传完整 URL 的情况，仅保留路径部分
  if (/^https?:\/\//i.test(key)) {
    try {
      const url = new URL(key)
      key = url.pathname || ''
      if (key.startsWith('/')) key = key.slice(1)
      const pathSeg = key.split('/')
      if (pathSeg.length > 2) {
        // 兼容 endpoint/bucket/key 形式，剥离前两段
        key = pathSeg.slice(2).join('/')
      }
    } catch {
      // keep raw key
    }
  }

  return key.replace(/^\/+/, '').trim()
}

function extractR2ObjectKeyFromUrl(rawUrl: string): string {
  const text = String(rawUrl || '').trim()
  if (!text) return ''
  try {
    const url = new URL(text)
    const host = String(url.hostname || '').toLowerCase()
    if (!host.includes('r2.cloudflarestorage.com')) return ''

    const path = String(url.pathname || '').replace(/^\/+/, '')
    if (!path) return ''

    const segments = path.split('/').filter(Boolean)
    if (segments.length <= 1) return ''
    // path-style: /bucket/key -> key
    return normalizePotentialR2ObjectKey(segments.slice(1).join('/'))
  } catch {
    return ''
  }
}

function buildR2StreamUrl(objectKey: string): string {
  const key = normalizePotentialR2ObjectKey(objectKey)
  if (!key) return ''
  return `${API_BASE_URL}/api/r2/stream?objectKey=${encodeURIComponent(key)}`
}

export function resolveFastVideoUrl(item: any): string {
  const currentUrl = String(item?.url || '').trim()
  const rawStoragePath = String(item?.storage_path || item?.storagePath || '').trim()

  if (currentUrl.includes('/api/r2/stream?objectKey=')) {
    return currentUrl
  }

  if (rawStoragePath.startsWith('r2:')) {
    const streamUrl = buildR2StreamUrl(rawStoragePath.replace(/^r2:/, ''))
    if (streamUrl) return streamUrl
  }

  const keyFromUrl = extractR2ObjectKeyFromUrl(currentUrl)
  if (keyFromUrl) {
    const streamUrl = buildR2StreamUrl(keyFromUrl)
    if (streamUrl) return streamUrl
  }

  return currentUrl
}

function normalizeCloudinaryUploadError(message: string, fileSize?: number): string {
  const text = String(message || '')
  const lower = text.toLowerCase()
  if (lower.includes('file size too large') || lower.includes('maximum is 104857600')) {
    const current = Number.isFinite(Number(fileSize)) ? `当前文件 ${formatSizeMB(Number(fileSize))}，` : ''
    return `Cloudinary 当前账号单文件上限为 ${formatSizeMB(CLOUDINARY_MAX_FILE_SIZE)}。${current}超过上限，无法继续上传到 Cloudinary。请升级 Cloudinary 套餐，或先压缩视频到 ${formatSizeMB(CLOUDINARY_MAX_FILE_SIZE)} 以内。`
  }
  if (lower.includes('unsupported video format or file')) {
    return 'Cloudinary 不支持该视频编码或文件内容异常。请将视频转为 H.264 + AAC 的 MP4 后再上传。'
  }
  if (lower.includes('upload preset') && lower.includes('not found')) {
    return 'Cloudinary 上传预设不存在，请检查 VITE_CLOUDINARY_UPLOAD_PRESET 配置是否正确。'
  }
  return text || 'Cloudinary 上传失败'
}

interface DirectUploadResult {
  url: string
  storagePath: string
  thumbnailUrl: string | null
}

interface PhotoReplicaRefs {
  cloudinaryPublicId?: string
  r2ObjectKey?: string
  cockroachPath?: string
}

const PHOTO_MULTI_STORAGE_PREFIX = 'multi|'
const VIDEO_PLAY_URL_CACHE = new Map<string, string>()

function buildMultiPhotoStoragePath(refs: PhotoReplicaRefs): string {
  const segments: string[] = []
  if (refs.cloudinaryPublicId) segments.push(`cloudinary=${encodeURIComponent(refs.cloudinaryPublicId)}`)
  if (refs.r2ObjectKey) segments.push(`r2=${encodeURIComponent(refs.r2ObjectKey)}`)
  if (refs.cockroachPath) segments.push(`cockroach=${encodeURIComponent(refs.cockroachPath)}`)
  if (segments.length === 0) return ''
  return `${PHOTO_MULTI_STORAGE_PREFIX}${segments.join('|')}`
}

function parseMultiPhotoStoragePath(storagePath: string | null | undefined): PhotoReplicaRefs | null {
  const raw = String(storagePath || '').trim()
  if (!raw.startsWith(PHOTO_MULTI_STORAGE_PREFIX)) return null

  const body = raw.slice(PHOTO_MULTI_STORAGE_PREFIX.length)
  const refs: PhotoReplicaRefs = {}

  body
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const idx = part.indexOf('=')
      if (idx <= 0) return
      const key = part.slice(0, idx)
      const value = decodeURIComponent(part.slice(idx + 1))
      if (!value) return
      if (key === 'cloudinary') refs.cloudinaryPublicId = value
      if (key === 'r2') refs.r2ObjectKey = value
      if (key === 'cockroach') refs.cockroachPath = value
    })

  return refs
}

function resolvePhotoReplicaRefs(storagePath: string | null | undefined): PhotoReplicaRefs {
  const parsed = parseMultiPhotoStoragePath(storagePath)
  if (parsed) return parsed

  const raw = String(storagePath || '').trim()
  if (!raw) return {}

  if (raw.startsWith('cloudinary:')) {
    return { cloudinaryPublicId: raw.replace(/^cloudinary:/, '').trim() }
  }

  if (raw.startsWith('r2:')) {
    return { r2ObjectKey: raw.replace(/^r2:/, '').trim() }
  }

  return { cockroachPath: raw }
}

function buildCloudinaryImageUrl(publicId: string): string {
  if (!CLOUDINARY_CLOUD_NAME || !publicId) return ''
  return `https://res.cloudinary.com/${encodeURIComponent(CLOUDINARY_CLOUD_NAME)}/image/upload/${publicId}`
}

function resolvePreferredPhotoUrl(record: any): string {
  const refs = resolvePhotoReplicaRefs(record?.storage_path)
  if (refs.cockroachPath && supabase) {
    const { data } = supabase.storage.from('student-media').getPublicUrl(refs.cockroachPath)
    if (data?.publicUrl) return data.publicUrl
  }

  if (record?.url) return String(record.url)

  if (refs.cloudinaryPublicId) {
    const cloudinaryUrl = buildCloudinaryImageUrl(refs.cloudinaryPublicId)
    if (cloudinaryUrl) return cloudinaryUrl
  }

  return ''
}

function resolvePreferredVideoUrl(record: any): string {
  return resolveFastVideoUrl(record)
}

function getCloudinaryResourceType(type: 'photo' | 'video'): 'image' | 'video' {
  return type === 'video' ? 'video' : 'image'
}

function buildCloudinaryDirectUploadResult(result: any, type: 'photo' | 'video'): DirectUploadResult {
  const publicId = String(result.public_id)
  const secureUrl = String(result.secure_url)
  const thumbnailUrl =
    type === 'video'
      ? `https://res.cloudinary.com/${encodeURIComponent(CLOUDINARY_CLOUD_NAME)}/video/upload/so_0/${publicId}.jpg`
      : secureUrl

  return {
    url: secureUrl,
    storagePath: `cloudinary:${publicId}`,
    thumbnailUrl
  }
}

async function uploadToCloudinaryDirect(
  file: File,
  type: 'photo' | 'video',
  onProgress?: (progress: MediaUploadProgress) => void
): Promise<DirectUploadResult> {
  if (!useCloudinaryDirectUpload) {
    throw new Error('Cloudinary 直传未配置')
  }

  if (file.size > CLOUDINARY_MAX_FILE_SIZE) {
    throw new Error(normalizeCloudinaryUploadError('File size too large', file.size))
  }

  const resourceType = getCloudinaryResourceType(type)
  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUDINARY_CLOUD_NAME)}/${resourceType}/upload`
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  if (CLOUDINARY_FOLDER) {
    form.append('folder', CLOUDINARY_FOLDER)
  }

  const result = await new Promise<any>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', endpoint)

    xhr.upload.onprogress = (event: ProgressEvent<EventTarget>) => {
      const loadedBytes = event.loaded || 0
      const totalBytes = event.total || file.size || 1
      const percent = Math.max(0, Math.min(100, Math.round((loadedBytes / totalBytes) * 100)))
      onProgress?.({
        percent,
        loadedBytes,
        totalBytes,
        chunkIndex: 1,
        totalChunks: 1
      })
    }

    xhr.onerror = () => reject(new Error(normalizeCloudinaryUploadError('Cloudinary 上传网络错误', file.size)))

    xhr.onload = () => {
      let json: any = null
      try {
        json = JSON.parse(xhr.responseText || '{}')
      } catch {
        // ignore parse error, use fallback below
      }

      if (xhr.status >= 200 && xhr.status < 300 && json?.secure_url && json?.public_id) {
        onProgress?.({
          percent: 100,
          loadedBytes: file.size,
          totalBytes: file.size,
          chunkIndex: 1,
          totalChunks: 1
        })
        resolve(json)
      } else {
        const headerErr = xhr.getResponseHeader('X-Cld-Error') || ''
        const message = json?.error?.message || headerErr || `Cloudinary 上传失败 (${xhr.status})`
        reject(new Error(normalizeCloudinaryUploadError(message, file.size)))
      }
    }

    xhr.send(form)
  })

  return buildCloudinaryDirectUploadResult(result, type)
}

async function uploadToStorageWithProgress(
  bucket: string,
  storagePath: string,
  file: File,
  onProgress?: (progress: MediaUploadProgress) => void
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE_URL}/api/storage/${bucket}/upload`)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
    xhr.setRequestHeader('x-file-path', storagePath)

    xhr.upload.onprogress = (event: ProgressEvent<EventTarget>) => {
      const loadedBytes = event.loaded || 0
      const totalBytes = event.total || file.size || 1
      const percent = Math.max(0, Math.min(100, Math.round((loadedBytes / totalBytes) * 100)))
      onProgress?.({
        percent,
        loadedBytes,
        totalBytes,
        chunkIndex: 1,
        totalChunks: 1
      })
    }

    xhr.onerror = () => reject(new Error('文件上传网络错误'))

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.({
          percent: 100,
          loadedBytes: file.size,
          totalBytes: file.size,
          chunkIndex: 1,
          totalChunks: 1
        })
        resolve()
      } else {
        reject(new Error(`文件上传失败 (${xhr.status})`))
      }
    }

    xhr.send(file)
  })
}

async function resolveStoragePathByMediaId(id: string): Promise<string> {
  if (!supabase) return ''
  try {
    const { data, error } = await supabase
      .from('student_media')
      .select('storage_path')
      .eq('id', id)
      .maybeSingle()
    if (error) return ''
    return data?.storage_path ? String(data.storage_path) : ''
  } catch {
    return ''
  }
}

async function removeCockroachStoragePath(path: string): Promise<void> {
  const storagePath = String(path || '').trim()
  if (!storagePath) return

  if (supabase) {
    await supabase.storage.from('student-media').remove([storagePath])
    return
  }

  await fetch(`${API_BASE_URL}/api/storage/student-media/remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paths: [storagePath] })
  })
}

async function deleteCloudinaryAsset(publicId: string, mediaType: 'photo' | 'video' = 'video'): Promise<void> {
  const resourceType = mediaType === 'video' ? 'video' : 'image'
  const response = await fetch(`${API_BASE_URL}/api/cloudinary/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      publicId,
      resourceType
    })
  })

  const result = await response.json().catch(() => ({ success: false, error: `HTTP ${response.status}` }))
  if (!response.ok || !result.success) {
    throw new Error(result?.error || `Cloudinary 删除失败 (${response.status})`)
  }
}

async function removePhotoReplicas(storagePath: string): Promise<void> {
  const refs = resolvePhotoReplicaRefs(storagePath)

  if (refs.cloudinaryPublicId) {
    await deleteCloudinaryAsset(refs.cloudinaryPublicId, 'photo')
  }

  if (refs.r2ObjectKey) {
    await deleteR2Object(refs.r2ObjectKey)
  }

  if (refs.cockroachPath) {
    await removeCockroachStoragePath(refs.cockroachPath)
  }
}

async function removeSingleReplica(storagePath: string, mediaType: 'photo' | 'video'): Promise<void> {
  const normalized = String(storagePath || '').trim()
  if (!normalized) return

  if (normalized.startsWith(PHOTO_MULTI_STORAGE_PREFIX)) {
    await removePhotoReplicas(normalized)
    return
  }

  if (normalized.startsWith('cloudinary:')) {
    const publicId = normalized.replace(/^cloudinary:/, '').trim()
    if (publicId) {
      await deleteCloudinaryAsset(publicId, mediaType)
    }
    return
  }

  if (normalized.startsWith('r2:')) {
    const objectKey = normalized.replace(/^r2:/, '').trim()
    if (objectKey) {
      await deleteR2Object(objectKey)
    }
    return
  }

  await removeCockroachStoragePath(normalized)
}

async function uploadToR2Direct(
  file: File,
  mediaType: 'photo' | 'video',
  onProgress?: (progress: MediaUploadProgress) => void
): Promise<DirectUploadResult> {
  const resolveR2PublicUrl = async (objectKey: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/api/r2/public-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objectKey })
    })
    const result = await response.json().catch(() => ({ success: false, error: `HTTP ${response.status}` }))
    if (!response.ok || !result?.success) {
      throw new Error(result?.error || `R2 公共地址解析失败 (${response.status})`)
    }
    return String(result?.data?.publicUrl || '')
  }

  let uploadUrl = ''
  let objectKey = ''
  let publicUrl = ''
  let presignErrorMessage = 'R2 预签名失败'

  for (let attempt = 1; attempt <= R2_PRESIGN_RETRY_COUNT; attempt += 1) {
    const presignResponse = await fetch(`${API_BASE_URL}/api/r2/presign-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        mediaType,
        fileSize: file.size
      })
    })

    const presignResult = await presignResponse.json().catch(() => ({ success: false, error: `HTTP ${presignResponse.status}` }))
    if (!presignResponse.ok || !presignResult?.success) {
      presignErrorMessage = String(presignResult?.error || `R2 预签名失败 (${presignResponse.status})`)
      if (attempt < R2_PRESIGN_RETRY_COUNT) {
        await sleep(attempt * 800)
        continue
      }
      throw new Error(presignErrorMessage)
    }

    const data = presignResult?.data || {}
    uploadUrl = String(data.uploadUrl || data.url || '')
    objectKey = normalizePotentialR2ObjectKey(String(data.objectKey || data.key || data.path || ''))
    publicUrl = String(data.publicUrl || data.fileUrl || '')

    if (uploadUrl && objectKey) {
      break
    }

    const snapshot = JSON.stringify(data)
    presignErrorMessage = `R2 预签名返回数据不完整: ${snapshot}`
    if (attempt < R2_PRESIGN_RETRY_COUNT) {
      await sleep(attempt * 800)
      continue
    }
    throw new Error(presignErrorMessage)
  }

  if (!uploadUrl || !objectKey) {
    throw new Error(presignErrorMessage)
  }

  if (!publicUrl) {
    publicUrl = await resolveR2PublicUrl(objectKey)
  }

  if (!publicUrl) {
    throw new Error('R2 公共地址为空，请检查后端 R2_ENDPOINT / R2_BUCKET / R2_PUBLIC_BASE_URL 配置')
  }

  let uploadLastError: Error | null = null
  for (let attempt = 1; attempt <= R2_UPLOAD_RETRY_COUNT; attempt += 1) {
    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', uploadUrl)
        xhr.timeout = R2_UPLOAD_TIMEOUT_MS
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

        xhr.upload.onprogress = (event: ProgressEvent<EventTarget>) => {
          const loadedBytes = event.loaded || 0
          const totalBytes = event.total || file.size || 1
          const percent = Math.max(0, Math.min(100, Math.round((loadedBytes / totalBytes) * 100)))
          onProgress?.({
            percent,
            loadedBytes,
            totalBytes,
            chunkIndex: 1,
            totalChunks: 1
          })
        }

        xhr.ontimeout = () => reject(new Error(`R2 上传超时（${Math.round(R2_UPLOAD_TIMEOUT_MS / 1000)}秒）`))
        xhr.onerror = () => reject(new Error('R2 上传网络错误'))
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            onProgress?.({
              percent: 100,
              loadedBytes: file.size,
              totalBytes: file.size,
              chunkIndex: 1,
              totalChunks: 1
            })
            resolve()
          } else {
            reject(new Error(`R2 上传失败 (${xhr.status})`))
          }
        }

        xhr.send(file)
      })

      return {
        url: publicUrl,
        storagePath: `r2:${normalizePotentialR2ObjectKey(objectKey)}`,
        thumbnailUrl: null
      }
    } catch (error: any) {
      uploadLastError = error instanceof Error ? error : new Error(String(error || 'R2 上传失败'))
      if (attempt < R2_UPLOAD_RETRY_COUNT) {
        await sleep(attempt * 1000)
        continue
      }
    }
  }

  throw uploadLastError || new Error('R2 上传失败')
}

async function deleteR2Object(objectKey: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/r2/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ objectKey })
  })

  const result = await response.json().catch(() => ({ success: false, error: `HTTP ${response.status}` }))
  if (!response.ok || !result.success) {
    throw new Error(result?.error || `R2 删除失败 (${response.status})`)
  }
}

export async function resolvePlayableVideoUrl(item: MediaItem | any): Promise<string> {
  const mediaType = String(item?.type || '').toLowerCase()
  const currentUrl = String(item?.url || '').trim()
  if (mediaType !== 'video') {
    return currentUrl
  }

  const itemId = String(item?.id || '').trim()
  if (itemId && VIDEO_PLAY_URL_CACHE.has(itemId)) {
    return String(VIDEO_PLAY_URL_CACHE.get(itemId) || currentUrl)
  }

  if (currentUrl.includes('/api/r2/stream?objectKey=')) {
    if (itemId) VIDEO_PLAY_URL_CACHE.set(itemId, currentUrl)
    return currentUrl
  }

  if (currentUrl.includes('X-Amz-Algorithm=')) {
    if (itemId) VIDEO_PLAY_URL_CACHE.set(itemId, currentUrl)
    return currentUrl
  }

  let rawStoragePath = String(item?.storage_path || item?.storagePath || '').trim()
  if (!rawStoragePath && item?.id) {
    rawStoragePath = await resolveStoragePathByMediaId(String(item.id))
  }

  let objectKey = ''
  if (rawStoragePath.startsWith('r2:')) {
    objectKey = normalizePotentialR2ObjectKey(rawStoragePath.replace(/^r2:/, ''))
  }

  if (!objectKey) {
    objectKey = extractR2ObjectKeyFromUrl(currentUrl)
  }

  if (!objectKey) {
    return currentUrl
  }

  const streamUrl = buildR2StreamUrl(objectKey)
  if (streamUrl) {
    if (itemId) VIDEO_PLAY_URL_CACHE.set(itemId, streamUrl)
    return streamUrl
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/r2/presign-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objectKey })
    })

    const result = await response.json().catch(() => ({ success: false, error: `HTTP ${response.status}` }))
    if (!response.ok || !result?.success) {
      throw new Error(result?.error || `R2 播放地址签名失败 (${response.status})`)
    }

    const signedUrl = String(result?.data?.signedUrl || '').trim()
    if (itemId && signedUrl) VIDEO_PLAY_URL_CACHE.set(itemId, signedUrl)
    return signedUrl || currentUrl
  } catch (error) {
    console.warn('获取 R2 播放签名地址失败，回退原地址:', error)
    return currentUrl
  }
}

/**
 * 上传媒体文件到 Supabase Storage
 */
export async function uploadMediaFile(
  file: File,
  metadata: {
    studentName?: string
    studentId?: string
    description?: string
    tags?: string[]
  },
  options?: MediaUploadOptions
): Promise<MediaUploadResult> {
  // 检查Supabase配置
  if (!supabase) {
    return {
      success: false,
      error: new Error('数据库未配置'),
      message: '数据库未配置，请联系管理员'
    }
  }

  let uploadCleanupStoragePath = ''
  let uploadCleanupType: 'photo' | 'video' | null = null

  try {
    // 确定文件类型
    const type = file.type.startsWith('image/') ? 'photo' : 'video'
    uploadCleanupType = type

    if (file.size > MAX_MEDIA_FILE_SIZE) {
      throw new Error(`单个文件不能超过 ${(MAX_MEDIA_FILE_SIZE / 1024 / 1024 / 1024).toFixed(1)}GB`)
    }
    
    // 生成唯一文件名
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`
    
    // 确定存储路径
    let storagePath = `${type === 'photo' ? 'photos' : 'videos'}/${fileName}`
    let publicUrl = ''
    let thumbnailUrl: string | null = null

    const shouldUseCloudinaryDirectUpload = type === 'video' && file.size <= VIDEO_CLOUDINARY_MAX_SIZE
    const shouldUseR2VideoUpload = type === 'video' && file.size > VIDEO_CLOUDINARY_MAX_SIZE

    if (type === 'photo') {
      if (!useCloudinaryDirectUpload) {
        throw new Error('Cloudinary 直传未配置：请设置 VITE_CLOUDINARY_CLOUD_NAME 和 VITE_CLOUDINARY_UPLOAD_PRESET')
      }

      const cockroachStoragePath = storagePath

      // 1) Cockroach 文件存储
      await uploadToStorageWithProgress('student-media', cockroachStoragePath, file, (p) => {
        options?.onProgress?.({
          ...p,
          percent: Math.min(100, Math.round(p.percent * 0.5))
        })
      })
      const { data: cockroachUrlData } = supabase.storage.from('student-media').getPublicUrl(cockroachStoragePath)

      // 2) Cloudinary
      const cloudinaryUpload = await uploadToCloudinaryDirect(file, 'photo', (p) => {
        options?.onProgress?.({
          ...p,
          percent: Math.min(100, Math.round(50 + p.percent * 0.5))
        })
      })
      const cloudinaryPublicId = cloudinaryUpload.storagePath.replace(/^cloudinary:/, '').trim()

      storagePath = buildMultiPhotoStoragePath({
        cloudinaryPublicId,
        cockroachPath: cockroachStoragePath
      })
      uploadCleanupStoragePath = storagePath

      // 照片仅保留 Cockroach + Cloudinary 副本；不再写入 R2
      publicUrl = cockroachUrlData.publicUrl || cloudinaryUpload.url
      thumbnailUrl = publicUrl
      options?.onProgress?.({
        percent: 100,
        loadedBytes: file.size,
        totalBytes: file.size,
        chunkIndex: 1,
        totalChunks: 1
      })
    } else if (shouldUseR2VideoUpload) {
      console.log('开始前端直传到 R2:', file.name)
      const directUpload = await uploadToR2Direct(file, 'video', options?.onProgress)
      storagePath = directUpload.storagePath
      publicUrl = directUpload.url
      thumbnailUrl = directUpload.thumbnailUrl
      uploadCleanupStoragePath = storagePath
      console.log('R2 上传成功:', storagePath)
    } else if (shouldUseCloudinaryDirectUpload) {
      if (!useCloudinaryDirectUpload) {
        throw new Error('Cloudinary 直传未配置：请设置 VITE_CLOUDINARY_CLOUD_NAME 和 VITE_CLOUDINARY_UPLOAD_PRESET')
      }
      console.log('开始前端直传到 Cloudinary:', file.name)
      const directUpload = await uploadToCloudinaryDirect(file, type, options?.onProgress)
      storagePath = directUpload.storagePath
      publicUrl = directUpload.url
      thumbnailUrl = directUpload.thumbnailUrl
      uploadCleanupStoragePath = storagePath
      console.log('Cloudinary 上传成功:', storagePath)
    } else {
      console.log('开始上传文件到 Supabase Storage:', storagePath)
      await uploadToStorageWithProgress('student-media', storagePath, file, options?.onProgress)
      uploadCleanupStoragePath = storagePath
      console.log('Storage上传成功:', storagePath)

      // 获取公开 URL
      const { data: urlData } = supabase.storage
        .from('student-media')
        .getPublicUrl(storagePath)

      publicUrl = urlData.publicUrl
      thumbnailUrl = type === 'photo' ? publicUrl : null
      console.log('获取公开URL:', publicUrl)
    }

    // 获取用户ID（如果有认证）
    let userId: string | null = null
    try {
      const userRes = await supabase.auth.getUser()
      userId = userRes.data?.user?.id || null
    } catch (e) {
      console.log('未认证用户，user_id设为null')
      userId = null
    }

    // 保存媒体信息到数据库
    const mediaRecord = {
      user_id: userId,
      type,
      file_name: file.name,
      file_size: file.size,
      storage_path: storagePath,
      url: publicUrl,
      thumbnail_url: thumbnailUrl,
      student_name: metadata.studentName || null,
      student_id: metadata.studentId || null,
      description: metadata.description || null,
      tags: metadata.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('开始保存到数据库:', mediaRecord)

    let dbData: any = null
    let dbError: any = null
    for (let attempt = 1; attempt <= 4; attempt++) {
      const result = await supabase
        .from('student_media')
        .insert(mediaRecord)
        .select()
        .single()

      dbData = result.data
      dbError = result.error
      if (!dbError) break

      if (!isRateLimitLikeError(dbError) || attempt === 4) {
        break
      }

      await new Promise((resolve) => setTimeout(resolve, attempt * 500))
    }

    if (dbError) {
      console.error('数据库保存失败:', dbError)
      throw new Error(`数据库保存失败: ${dbError.message}`)
    }

    console.log('数据库保存成功:', dbData)
    uploadCleanupStoragePath = ''

    // 转换为 MediaItem 格式
    const mediaItem: MediaItem = {
      id: dbData.id,
      type: dbData.type,
      url: dbData.url,
      thumbnail: dbData.thumbnail_url,
      fileName: dbData.file_name,
      fileSize: dbData.file_size,
      uploadDate: dbData.created_at,
      studentId: dbData.student_id,
      studentName: dbData.student_name,
      description: dbData.description,
      tags: dbData.tags
    }

    return {
      success: true,
      data: mediaItem
    }
  } catch (error) {
    if (uploadCleanupStoragePath && uploadCleanupType) {
      try {
        await removeSingleReplica(uploadCleanupStoragePath, uploadCleanupType)
      } catch (cleanupError) {
        console.warn('上传失败后的清理失败:', cleanupError)
      }
    }

    console.error('上传到数据库失败:', error)
    return {
      success: false,
      error,
      message: error instanceof Error ? error.message : '上传失败，请重试'
    }
  }
}

/**
 * 从数据库加载所有媒体文件
 */
export async function loadMediaFiles(): Promise<MediaItem[]> {
  // 如果 supabase 客户端不可用，但项目配置为使用 CockroachDB，则调用后端 API
  if (!supabase) {
    if (useCockroachApi) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/student-media`)
        if (res.ok) {
          const json = await res.json()
          // 期待后端返回 { success: true, data: [...] } 或直接数组
          const records = Array.isArray(json) ? json : (json.data || [])
          if (Array.isArray(records) && records.length > 0) {
            return records.map((record: any) => ({
              id: record.id,
              type: record.type,
              url: record.type === 'photo' ? resolvePreferredPhotoUrl(record) : resolvePreferredVideoUrl(record),
              thumbnail: record.type === 'photo' ? (resolvePreferredPhotoUrl(record) || record.thumbnail_url) : record.thumbnail_url,
              fileName: record.file_name,
              fileSize: record.file_size,
              uploadDate: record.created_at,
              studentId: record.student_id,
              studentName: record.student_name,
              description: record.description,
              tags: record.tags || [],
              folderId: record.folder_id || undefined,
              storage_path: record.storage_path || undefined
            }))
          }
        } else {
          console.warn('[mediaService] Cockroach API 请求失败', res.status)
        }
      } catch (e) {
        console.warn('[mediaService] Cockroach API 回退异常', e)
      }
    }

    // 原有 REST/localStorage 回退（Supabase 未配置）
    console.warn('[mediaService] Supabase 未配置，尝试 REST 回退或 localStorage')
    const restUrl = import.meta.env.VITE_SUPABASE_URL || ''
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    if (restUrl && anonKey) {
      try {
        const url = `${restUrl.replace(/\/$/, '')}/rest/v1/student_media?select=*&order=created_at.desc`
        const res = await fetch(url, { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } })
        if (res.ok) {
          const json = await res.json()
          if (Array.isArray(json) && json.length > 0) {
            return json.map((record: any) => ({
              id: record.id,
              type: record.type,
              url: record.type === 'photo' ? resolvePreferredPhotoUrl(record) : resolvePreferredVideoUrl(record),
              thumbnail: record.type === 'photo' ? (resolvePreferredPhotoUrl(record) || record.thumbnail_url) : record.thumbnail_url,
              fileName: record.file_name,
              fileSize: record.file_size,
              uploadDate: record.created_at,
              studentId: record.student_id,
              studentName: record.student_name,
              description: record.description,
              tags: record.tags || [],
              folderId: record.folder_id || undefined,
              storage_path: record.storage_path || undefined
            }))
          }
        } else {
          console.warn('[mediaService] REST 回退请求失败', res.status)
        }
      } catch (e) {
        console.warn('[mediaService] REST 回退异常', e)
      }
    }

    // fallback to localStorage if present
    try {
      const localItems = localStorage.getItem('mediaItems')
      if (localItems) return JSON.parse(localItems)
    } catch (e) {
      console.warn('[mediaService] 从 localStorage 加载 mediaItems 失败', e)
    }

    return []
  }

  try {
    // 只加载未删除的文件（deleted_at 为 null）
    const { data, error } = await supabase
      .from('student_media')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) throw error

    const mapped = data.map((record: any) => ({
      id: record.id,
      type: record.type,
      url: record.type === 'photo' ? resolvePreferredPhotoUrl(record) : resolvePreferredVideoUrl(record),
      thumbnail: record.type === 'photo' ? (resolvePreferredPhotoUrl(record) || record.thumbnail_url) : record.thumbnail_url,
      fileName: record.file_name,
      fileSize: record.file_size,
      uploadDate: record.created_at,
      studentId: record.student_id,
      studentName: record.student_name,
      description: record.description,
      tags: record.tags || [],
      folderId: record.folder_id || undefined,
      storage_path: record.storage_path || undefined
    }))

    // 如果部分媒体项没有 studentId，但有 studentName，尝试用 student_profiles 映射 studentId
    try {
      const needId = mapped.some((m: MediaItem) => !m.studentId && m.studentName)
      if (needId) {
        const profiles: StudentProfile[] = await getAllStudentProfiles()
        if (profiles && profiles.length > 0) {
          const nameToId = new Map<string, string>()
          profiles.forEach(p => {
            if (p && p.student_name) nameToId.set(p.student_name.trim(), p.student_id)
          })

          mapped.forEach((m: any) => {
            if (!m.studentId && m.studentName) {
              const key = m.studentName.trim()
              if (nameToId.has(key)) {
                m.studentId = nameToId.get(key)
              }
            }
          })
        }
      }
    } catch (e) {
      console.warn('[mediaService] 尝试根据 student_profiles 填充 studentId 失败', e)
    }

    // 如果 Supabase 返回为空，尝试使用 REST 回退或 localStorage
    if ((!mapped || mapped.length === 0)) {
      const restUrl = import.meta.env.VITE_SUPABASE_URL || ''
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
      if (restUrl && anonKey) {
        try {
          const url = `${restUrl.replace(/\/$/, '')}/rest/v1/student_media?select=*&order=created_at.desc`
          const res = await fetch(url, { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } })
          if (res.ok) {
            const json = await res.json()
            if (Array.isArray(json) && json.length > 0) {
              const recon = json.map((record: any) => ({
                id: record.id,
                type: record.type,
                url: record.type === 'photo' ? resolvePreferredPhotoUrl(record) : resolvePreferredVideoUrl(record),
                thumbnail: record.type === 'photo' ? (resolvePreferredPhotoUrl(record) || record.thumbnail_url) : record.thumbnail_url,
                fileName: record.file_name,
                fileSize: record.file_size,
                uploadDate: record.created_at,
                studentId: record.student_id,
                studentName: record.student_name,
                description: record.description,
                tags: record.tags || [],
                folderId: record.folder_id || undefined,
                storage_path: record.storage_path || undefined
              }))
              return recon
            }
          }
        } catch (e) {
          console.warn('[mediaService] REST 回退异常:', e)
        }
      }

      try {
        const localItems = localStorage.getItem('mediaItems')
        if (localItems) return JSON.parse(localItems)
      } catch (e) { /* ignore */ }
    }

    return mapped
  } catch (error) {
    console.error('加载媒体文件失败:', error)
    // 尝试 REST 回退
    try {
      const restUrl = import.meta.env.VITE_SUPABASE_URL || ''
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
      if (restUrl && anonKey) {
        const url = `${restUrl.replace(/\/$/, '')}/rest/v1/student_media?select=*&order=created_at.desc`
        const res = await fetch(url, { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } })
        if (res.ok) {
          const json = await res.json()
          if (Array.isArray(json) && json.length > 0) {
            return json.map((record: any) => ({
              id: record.id,
              type: record.type,
              url: record.type === 'photo' ? resolvePreferredPhotoUrl(record) : resolvePreferredVideoUrl(record),
              thumbnail: record.type === 'photo' ? (resolvePreferredPhotoUrl(record) || record.thumbnail_url) : record.thumbnail_url,
              fileName: record.file_name,
              fileSize: record.file_size,
              uploadDate: record.created_at,
              studentId: record.student_id,
              studentName: record.student_name,
              description: record.description,
              tags: record.tags || [],
              folderId: record.folder_id || undefined,
              storage_path: record.storage_path || undefined
            }))
          }
        }
      }
    } catch (e) {
      console.warn('[mediaService] 错误处理时 REST 回退失败:', e)
    }

    return []
  }
}

/**
 * 删除媒体文件（软删除，移到回收站）
 */
export async function deleteMediaFile(id: string, storagePath: string): Promise<{ success: boolean; error?: any }> {
  if (!supabase) {
    return {
      success: false,
      error: new Error('Supabase未配置')
    }
  }

  try {
    // 尝试软删除：设置 deleted_at 字段，不删除Storage文件
    const { error: softDeleteError } = await supabase
      .from('student_media')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    // 如果软删除失败（可能是因为列不存在），尝试直接删除
    if (softDeleteError) {
      console.warn('媒体软删除失败，尝试直接删除:', softDeleteError.message)
      
      // 先从 Storage 删除文件
      if (storagePath) {
        const inferredType: 'photo' | 'video' =
          storagePath.startsWith(PHOTO_MULTI_STORAGE_PREFIX) || storagePath.includes('/photos/') || storagePath.startsWith('photos/')
            ? 'photo'
            : 'video'
        await removeSingleReplica(storagePath, inferredType)
      }
      
      // 然后从数据库删除记录
      const { error: hardDeleteError } = await supabase
        .from('student_media')
        .delete()
        .eq('id', id)
      
      if (hardDeleteError) throw hardDeleteError
    }

    return { success: true }
  } catch (error) {
    console.error('删除失败:', error)
    return {
      success: false,
      error
    }
  }
}

/**
 * 更新媒体文件信息
 */
export async function updateMediaFile(
  id: string,
  updates: {
    studentName?: string
    studentId?: string
    description?: string
    tags?: string[]
  }
): Promise<{ success: boolean; error?: any }> {
  if (!supabase) {
    return {
      success: false,
      error: new Error('Supabase未配置')
    }
  }

  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (updates.studentName !== undefined) updateData.student_name = updates.studentName
    if (updates.studentId !== undefined) updateData.student_id = updates.studentId
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.tags !== undefined) updateData.tags = updates.tags

    const { error } = await supabase
      .from('student_media')
      .update(updateData)
      .eq('id', id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('更新失败:', error)
    return {
      success: false,
      error
    }
  }
}

/**
 * 批量更新学生的所有媒体文件信息
 */
export async function updateStudentMediaBatch(
  oldStudentName: string,
  oldStudentId: string,
  newStudentName: string,
  newStudentId: string
): Promise<{ success: boolean; count: number; error?: any }> {
  if (!supabase) {
    return {
      success: false,
      count: 0,
      error: new Error('Supabase未配置')
    }
  }

  try {
    // 更新所有匹配的记录
    const { data, error } = await supabase
      .from('student_media')
      .update({
        student_name: newStudentName,
        student_id: newStudentId,
        updated_at: new Date().toISOString()
      })
      .eq('student_name', oldStudentName)
      .eq('student_id', oldStudentId)
      .select()

    if (error) throw error

    return { 
      success: true,
      count: data?.length || 0
    }
  } catch (error) {
    console.error('批量更新失败:', error)
    return {
      success: false,
      count: 0,
      error
    }
  }
}

/**
 * 更新媒体文件的 folder_id
 */
export async function updateMediaFolderId(
  id: string,
  folderId: string | null
): Promise<{ success: boolean; error?: any }> {
  if (!supabase) {
    return {
      success: false,
      error: new Error('Supabase未配置')
    }
  }

  try {
    const { error } = await supabase
      .from('student_media')
      .update({
        folder_id: folderId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('更新folder_id失败:', error)
    return {
      success: false,
      error
    }
  }
}

/**
 * 根据学号获取学生照片
 */
export async function getStudentPhotos(studentId: string): Promise<MediaItem[]> {
  if (!supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('student_media')
      .select('*')
      .eq('student_id', studentId)
      .eq('type', 'photo')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map((record: any) => ({
      id: record.id,
      type: record.type,
      url: record.type === 'photo' ? resolvePreferredPhotoUrl(record) : resolvePreferredVideoUrl(record),
      thumbnail: record.type === 'photo' ? (resolvePreferredPhotoUrl(record) || record.thumbnail_url) : record.thumbnail_url,
      fileName: record.file_name,
      fileSize: record.file_size,
      uploadDate: record.created_at,
      studentId: record.student_id,
      studentName: record.student_name,
      description: record.description,
      tags: record.tags || []
    }))
  } catch (error) {
    console.error('获取学生照片失败:', error)
    return []
  }
}

/**
 * 硬删除：从存储中删除文件并从数据库中删除记录
 */
export async function hardDeleteMediaFile(
  id: string,
  storagePath: string,
  mediaType: 'photo' | 'video' = 'video'
): Promise<{ success: boolean; error?: any }> {
  // 如果有 Supabase 客户端，使用 Supabase 的 Storage + DB 删除
  if (supabase) {
    try {
      let resolvedStoragePath = storagePath || ''
      if (!resolvedStoragePath) {
        resolvedStoragePath = await resolveStoragePathByMediaId(id)
      }

      if (resolvedStoragePath) {
        await removeSingleReplica(resolvedStoragePath, mediaType)
      }

      const { error } = await supabase.from('student_media').delete().eq('id', id)
      if (error) throw error
      return { success: true }
    } catch (e) {
      return { success: false, error: e }
    }
  }

  // 使用后端 Cockroach API
  if (useCockroachApi) {
    try {
      let resolvedStoragePath = String(storagePath || '').trim()
      if (!resolvedStoragePath) {
        resolvedStoragePath = await resolveStoragePathByMediaId(id)
      }

      // 删除存储文件（后端会在 uploads/student-media 下删除）
      if (resolvedStoragePath) {
        await removeSingleReplica(resolvedStoragePath, mediaType)
      }

      // 从数据库删除记录
      const res = await fetch(`${API_BASE_URL}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'student_media', operation: 'delete', filters: [{ column: 'id', type: 'eq', value: id }] })
      })
      const json = await res.json()
      if (json.success === false) return { success: false, error: json.error }
      return { success: true }
    } catch (e) {
      return { success: false, error: e }
    }
  }

  return { success: false, error: new Error('未配置可用的数据库客户端') }
}

/**
 * 加载已删除的媒体（deleted_at IS NOT NULL）
 */
export async function loadDeletedMediaFiles(): Promise<MediaItem[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('student_media').select('*').not('deleted_at', 'is', null).order('created_at', { ascending: false })
      if (error) throw error
      return (data || []).map((record: any) => ({
        id: record.id,
        type: record.type,
        url: record.url,
        thumbnail: record.thumbnail_url,
        fileName: record.file_name,
        fileSize: record.file_size,
        uploadDate: record.created_at,
        studentId: record.student_id,
        studentName: record.student_name,
        description: record.description,
        tags: record.tags || [],
        folderId: record.folder_id || undefined,
        storage_path: record.storage_path || undefined
      }))
    } catch (e) {
      console.error('加载已删除媒体失败:', e)
      return []
    }
  }

  if (useCockroachApi) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'student_media',
          operation: 'select',
          select: '*',
          filters: [ { column: 'deleted_at', type: 'not', operator: 'is', value: null } ],
          options: { order: [ { column: 'created_at', ascending: false } ] }
        })
      })
      const json = await res.json()
      const rows = json.data || []
      return (rows || []).map((record: any) => ({
        id: record.id,
        type: record.type,
        url: record.url,
        thumbnail: record.thumbnail_url,
        fileName: record.file_name,
        fileSize: record.file_size,
        uploadDate: record.created_at,
        studentId: record.student_id,
        studentName: record.student_name,
        description: record.description,
        tags: record.tags || [],
        folderId: record.folder_id || undefined,
        storage_path: record.storage_path || undefined
      }))
    } catch (e) {
      console.error('加载已删除媒体（API）失败:', e)
      return []
    }
  }

  return []
}

/**
 * 恢复已删除的媒体（将 deleted_at 设为 null）
 */
export async function restoreMediaFile(id: string): Promise<{ success: boolean; error?: any }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('student_media').update({ deleted_at: null, updated_at: new Date().toISOString() }).eq('id', id)
      if (error) throw error
      return { success: true }
    } catch (e) {
      return { success: false, error: e }
    }
  }

  if (useCockroachApi) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'student_media',
          operation: 'update',
          data: { deleted_at: null, updated_at: new Date().toISOString() },
          filters: [ { column: 'id', type: 'eq', value: id } ],
          returnData: false
        })
      })
      const json = await res.json()
      if (json.success === false) return { success: false, error: json.error }
      return { success: true }
    } catch (e) {
      return { success: false, error: e }
    }
  }

  return { success: false, error: new Error('未配置可用的数据库客户端') }
}
