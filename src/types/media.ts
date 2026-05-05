export interface MediaItem {
  id: string
  type: 'photo' | 'video' | 'audio' | 'document' | 'archive'
  url: string
  thumbnail?: string
  fileName: string
  fileSize: number
  uploadDate: string
  studentId?: string
  studentName?: string
  description?: string
  tags?: string[]
  folderId?: string  // 所属文件夹ID
  folderPath?: string  // 文件夹路径，如 "照片/证件照"
}

export interface MediaFolder {
  id: string
  name: string
  parentId?: string | null  // 父文件夹ID，null或undefined表示根目录
  path: string  // 完整路径，如 "/照片/证件照"
  createdAt: string
  studentId?: string
  studentName?: string
  itemCount?: number
}

export interface MediaGallery {
  items: MediaItem[]
  folders: MediaFolder[]
  selectedItem: MediaItem | null
  viewMode: 'grid' | 'list'
  filterType: 'all' | 'photo' | 'video' | 'audio' | 'document' | 'archive'
  currentFolderId?: string
}

// 文件类型映射
export const FILE_TYPE_MAP: Record<string, MediaItem['type']> = {
  // 图片
  'jpg': 'photo',
  'jpeg': 'photo',
  'png': 'photo',
  'gif': 'photo',
  'webp': 'photo',
  'bmp': 'photo',
  'svg': 'photo',
  // 视频
  'mp4': 'video',
  'webm': 'video',
  'avi': 'video',
  'mov': 'video',
  'mkv': 'video',
  // 音频
  'mp3': 'audio',
  'wav': 'audio',
  'ogg': 'audio',
  'flac': 'audio',
  'm4a': 'audio',
  // 文档
  'pdf': 'document',
  'doc': 'document',
  'docx': 'document',
  'xls': 'document',
  'xlsx': 'document',
  'ppt': 'document',
  'pptx': 'document',
  'txt': 'document',
  // 压缩包
  'zip': 'archive',
  'rar': 'archive',
  '7z': 'archive',
  'tar': 'archive',
  'gz': 'archive'
}

// 获取文件类型
export function getFileType(fileName: string): MediaItem['type'] {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  return FILE_TYPE_MAP[ext] || 'document'
}

// 获取文件图标
export function getFileIcon(fileName: string): string {
  const type = getFileType(fileName)
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  
  const iconMap: Record<string, string> = {
    // 图片
    'photo': '🖼️',
    // 视频
    'video': '🎬',
    // 音频
    'audio': '🎵',
    // 压缩包
    'archive': '📦',
    // 文档
    'pdf': '📕',
    'doc': '📘',
    'docx': '📘',
    'xls': '📗',
    'xlsx': '📗',
    'ppt': '📙',
    'pptx': '📙',
    'txt': '📝',
    'document': '📄'
  }
  
  if (type === 'document' && iconMap[ext]) {
    return iconMap[ext]
  }
  return iconMap[type] || '📄'
}
