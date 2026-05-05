import { defineStore } from 'pinia'
import type { MediaItem, MediaGallery, MediaFolder } from '@/types/media'
import { loadMediaFiles, deleteMediaFile as deleteMediaFileService, updateMediaFile as updateMediaFileService, hardDeleteMediaFile, loadDeletedMediaFiles, restoreMediaFile } from '@/utils/mediaService'

interface DeletedItem {
  item: MediaItem
  deletedAt: string
  expiresAt: string
}

export const useMediaStore = defineStore('media', {
  state: () => ({
    items: [] as MediaItem[],
    folders: [] as MediaFolder[],
    deletedItems: [] as DeletedItem[],
    selectedItem: null as MediaItem | null,
    viewMode: 'grid' as 'grid' | 'list',
    filterType: 'all' as 'all' | 'photo' | 'video' | 'audio' | 'document' | 'archive',
    groupByStudent: false,
    isLoading: false,
    isLoaded: false,
    currentFolderId: null as string | null
  }),
  
  getters: {
    filteredItems: (state) => {
      if (state.filterType === 'all') {
        return state.items
      }
      return state.items.filter(item => item.type === state.filterType)
    },
    
    totalItems: (state) => state.items.length,
    
    photoCount: (state) => state.items.filter(item => item.type === 'photo').length,
    
    videoCount: (state) => state.items.filter(item => item.type === 'video').length,
    
    totalSize: (state) => {
      return state.items.reduce((sum, item) => sum + (Number(item.fileSize) || 0), 0)
    },
    
    groupedByStudent: (state) => {
      const groups = new Map<string, MediaItem[]>()
      
      // 首先添加 localStorage 中保存的照片库文件夹（空文件夹也会显示）
      // 字段名为 studentId/studentName（由 createNewStudent 保存）
      try {
        const savedFolders = localStorage.getItem('photoStudentFolders')
        if (savedFolders) {
          const folders = JSON.parse(savedFolders) as Array<{ studentId: string; studentName: string }>
          folders.forEach(folder => {
            if (folder.studentName && !groups.has(folder.studentName)) {
              groups.set(folder.studentName, [])
            }
          })
        }
      } catch (e) {
        console.error('Failed to load photo student folders from localStorage:', e)
      }
      
      // 然后添加有媒体文件的学生
      state.items.forEach(item => {
        const key = item.studentName || '未分配学生'
        if (!groups.has(key)) {
          groups.set(key, [])
        }
        groups.get(key)!.push(item)
      })
      
      // 从 localStorage 获取文件夹 ID 映射
      let folderIdMap = new Map<string, string>()
      try {
        const savedFolders = localStorage.getItem('photoStudentFolders')
        if (savedFolders) {
          const folders = JSON.parse(savedFolders) as Array<{ studentId: string; studentName: string }>
          folders.forEach(folder => {
            if (folder.studentName && folder.studentId) {
              folderIdMap.set(folder.studentName, folder.studentId)
            }
          })
        }
      } catch (e) {
        // ignore
      }
      
      // 转换为数组并按学生名称排序
      return Array.from(groups.entries())
        .map(([studentName, items]) => ({
          studentName,
          // 优先使用媒体文件中的 studentId，否则使用 localStorage 中的 ID
          studentId: items.find(i => i.studentId)?.studentId || folderIdMap.get(studentName) || '',
          items: items.sort((a, b) => 
            new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
          ),
          photoCount: items.filter(i => i.type === 'photo').length,
          videoCount: items.filter(i => i.type === 'video').length,
          totalSize: items.reduce((sum, i) => sum + (Number(i.fileSize) || 0), 0)
        }))
        .sort((a, b) => {
          if (a.studentName === '未分配学生') return 1
          if (b.studentName === '未分配学生') return -1
          return a.studentName.localeCompare(b.studentName, 'zh-CN')
        })
    }
  },
  
  actions: {
    async loadMediaItems(force = false) {
      if (this.isLoaded && !force) return
      
      this.isLoading = true
      try {
        // 从数据库加载（已自动过滤 deleted_at IS NULL）
        const items = await loadMediaFiles()
        this.items = items
        console.log(`从数据库加载了 ${items.length} 个媒体文件（仅未删除）`)
        
        // 清空 localStorage 中的旧缓存，避免干扰
        localStorage.removeItem('mediaItems')
        
        // 如果数据库返回空，尝试从localStorage加载（仅用于首次迁移）
        if (items.length === 0) {
          const localItems = localStorage.getItem('mediaItems_backup')
          if (localItems) {
            const parsed = JSON.parse(localItems)
            console.log(`发现本地备份的 ${parsed.length} 个文件，建议重新上传到数据库`)
            this.items = parsed
          }
        }

        // 在尝试基于媒体记录自动生成回退文件夹之前，先从 localStorage 恢复已保存的文件夹
        try {
          this.loadFoldersFromLocal()
        } catch (e) {
          // ignore
        }

        // 如果 localStorage 中没有文件夹定义，但数据库中的媒体项包含 folderId，则基于记录自动生成回退的文件夹列表
        if ((!this.folders || this.folders.length === 0) && this.items.length > 0) {
          try {
            const folderMap = new Map<string, { id: string; name: string; parentId: string | null; path: string; createdAt: string; studentId: string; studentName: string; itemCount: number }>()
            this.items.forEach(it => {
              const fid = (it as any).folderId || (it as any).folder_id || null
              if (fid) {
                if (!folderMap.has(fid)) {
                  folderMap.set(fid, {
                    id: fid,
                    name: `子文件夹 ${fid.slice(0, 8)}`,
                    parentId: null,
                    path: `/${fid}`,
                    createdAt: new Date().toISOString(),
                    studentId: it.studentId || '',
                    studentName: it.studentName || '',
                    itemCount: 0
                  })
                }
                folderMap.get(fid)!.itemCount += 1
              }
            })

            if (folderMap.size > 0) {
              this.folders = Array.from(folderMap.values())
              console.log('基于媒体记录自动生成文件夹回退：', this.folders.length)
              this.saveFoldersToLocal()
            }
          } catch (e) {
            console.debug('自动生成文件夹失败', e)
          }
        }

        // 即使 localStorage 有部分文件夹，也要补齐数据库中存在但本地缺失的 folderId。
        // 否则这些文件会出现“数据库里存在，但页面无入口”的假丢失。
        if (this.items.length > 0) {
          try {
            const existingIds = new Set(this.folders.map((f: any) => String(f.id || '')))
            let added = 0

            this.items.forEach((it: any) => {
              const fid = String(it?.folderId ?? it?.folder_id ?? '').trim()
              if (!fid || existingIds.has(fid)) return

              const studentName = String(it?.studentName || '未命名学生')
              const fallbackName = `恢复文件夹-${fid.slice(-6)}`
              this.folders.push({
                id: fid,
                name: fallbackName,
                parentId: null,
                path: `/${fallbackName}`,
                createdAt: new Date().toISOString(),
                studentId: String(it?.studentId || ''),
                studentName,
                itemCount: 0
              })
              existingIds.add(fid)
              added += 1
            })

            if (added > 0) {
              console.warn(`检测到 ${added} 个缺失文件夹映射，已自动补齐，避免照片“消失”`) 
              this.saveFoldersToLocal()
            }
          } catch (e) {
            console.debug('补齐缺失文件夹失败', e)
          }
        }
        
        this.isLoaded = true
      } catch (error) {
        console.error('从数据库加载失败:', error)
        // Fallback to localStorage（仅作为紧急备份）
        console.warn('⚠️ 数据库连接失败，尝试从本地备份加载')
        try {
          const localItems = localStorage.getItem('mediaItems_backup')
          if (localItems) {
            this.items = JSON.parse(localItems)
            console.log('使用本地备份数据')
          }
        } catch (e) {
          console.error('从localStorage加载也失败:', e)
        }
      } finally {
        this.isLoading = false
      }
    },
    
    addMediaItem(item: MediaItem) {
      this.items.unshift(item)
      console.log('添加媒体项到列表:', item.fileName)
    },
    
    async removeMediaItem(id: string): Promise<boolean> {
      // 改为移到回收站而非直接删除
      return await this.moveToTrash(id)
    },
    
    // 直接删除（跳过回收站）
    async deleteMediaItem(id: string) {
      const item = this.items.find(item => item.id === id)
      if (!item) return
      
      // 从数组中提取 storage_path（如果存在）
      const storagePath = (item as any).storage_path || ''
      
      const result = await deleteMediaFileService(id, storagePath)
      if (result.success) {
        const index = this.items.findIndex(item => item.id === id)
        if (index !== -1) {
          this.items.splice(index, 1)
        }
        if (this.selectedItem?.id === id) {
          this.selectedItem = null
        }
      }
    },
    
    async updateMediaItem(id: string, updates: Partial<MediaItem>) {
      const result = await updateMediaFileService(id, {
        studentName: updates.studentName,
        studentId: updates.studentId,
        description: updates.description,
        tags: updates.tags
      })
      
      if (result.success) {
        const item = this.items.find(item => item.id === id)
        if (item) {
          Object.assign(item, updates)
        }
      } else {
        throw new Error('更新失败')
      }
    },
    
    selectItem(item: MediaItem) {
      this.selectedItem = item
    },
    
    clearSelection() {
      this.selectedItem = null
    },
    
    setViewMode(mode: 'grid' | 'list') {
      this.viewMode = mode
    },
    
    setFilterType(type: 'all' | 'photo' | 'video') {
      this.filterType = type
    },
    
    toggleGroupByStudent() {
      this.groupByStudent = !this.groupByStudent
    },
    
    searchItems(query: string) {
      const lowerQuery = query.toLowerCase()
      return this.items.filter(item => 
        item.fileName.toLowerCase().includes(lowerQuery) ||
        item.studentName?.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery) ||
        item.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
    },

    // 文件夹相关操作
    setCurrentFolder(folderId: string | null) {
      this.currentFolderId = folderId
    },

    getCurrentFolderItems() {
      return this.items.filter((item: any) => (item.folderId ?? item.folder_id ?? null) === this.currentFolderId)
    },

    getCurrentSubfolders() {
      return this.folders.filter(folder => folder.parentId === this.currentFolderId)
    },

    addFolder(folder: MediaFolder) {
      this.folders.push(folder)
      // 保存到 localStorage
      this.saveFoldersToLocal()
    },

    moveFolder(folderId: string, newParentId: string | null) {
      if (!folderId) return false
      // 防止移动到自己或自己的子孙
      const isDescendant = (candidateId: string, targetId: string | null): boolean => {
        if (!targetId) return false
        if (candidateId === targetId) return true
        const parent = this.folders.find(f => f.id === targetId)
        if (!parent) return false
        return isDescendant(candidateId, parent.parentId)
      }

      if (isDescendant(folderId, newParentId)) {
        console.warn('不能将文件夹移动到其子孙或自身')
        return false
      }

      const folder = this.folders.find(f => f.id === folderId)
      if (!folder) return false

      const oldPath = folder.path
      folder.parentId = newParentId

      const parentPath = newParentId ? (this.folders.find(f => f.id === newParentId)?.path || '') : ''
      folder.path = parentPath ? `${parentPath}/${folder.name}` : `/${folder.name}`

      // 更新子文件夹和文件路径
      this.updateChildPaths(folderId, oldPath, folder.path)
      this.saveFoldersToLocal()
      return true
    },

    removeFolder(folderId: string) {
      // 递归删除子文件夹和文件
      const deleteRecursive = (id: string) => {
        // 删除子文件夹
        const subFolders = this.folders.filter(f => f.parentId === id)
        subFolders.forEach(sf => deleteRecursive(sf.id))
        
        // 删除文件夹内的文件
        this.items = this.items.filter(item => item.folderId !== id)
        
        // 删除文件夹本身
        const index = this.folders.findIndex(f => f.id === id)
        if (index !== -1) {
          this.folders.splice(index, 1)
        }
      }
      
      deleteRecursive(folderId)
      this.saveFoldersToLocal()
    },

    renameFolder(folderId: string, newName: string) {
      const folder = this.folders.find(f => f.id === folderId)
      if (folder) {
        const oldPath = folder.path
        const oldName = folder.name
        folder.name = newName
        // 更新路径
        const parentPath = folder.parentId 
          ? this.folders.find(f => f.id === folder.parentId)?.path || ''
          : ''
        folder.path = parentPath ? `${parentPath}/${newName}` : `/${newName}`
        
        // 更新所有子文件夹的路径
        this.updateChildPaths(folderId, oldPath, folder.path)
        this.saveFoldersToLocal()

        // 如果该文件夹关联学生（studentId），同步更新 photoStudentFolders 中的 studentName，避免刷新时显示回退名
        try {
          if ((folder as any).studentId) {
            const studentId = (folder as any).studentId
            const saved = localStorage.getItem('photoStudentFolders')
            if (saved) {
              const arr = JSON.parse(saved) as Array<{ studentId: string; studentName: string }>
              let changed = false
              const updated = arr.map(entry => {
                if (entry.studentId === studentId) {
                  changed = true
                  return { ...entry, studentName: newName }
                }
                return entry
              })
              if (changed) {
                localStorage.setItem('photoStudentFolders', JSON.stringify(updated))
              }
            }
          }
        } catch (e) {
          console.error('同步 photoStudentFolders 失败:', e)
        }
      }
    },

    updateChildPaths(parentId: string, oldParentPath: string, newParentPath: string) {
      this.folders.forEach(folder => {
        if (folder.parentId === parentId) {
          const oldPath = folder.path
          folder.path = folder.path.replace(oldParentPath, newParentPath)
          this.updateChildPaths(folder.id, oldPath, folder.path)
        }
      })
      // 更新文件的 folderPath
      this.items.forEach(item => {
        if (item.folderPath?.startsWith(oldParentPath)) {
          item.folderPath = item.folderPath.replace(oldParentPath, newParentPath)
        }
      })
    },

    getFolderPath(folderId: string | null): string {
      if (!folderId) return '/'
      const folder = this.folders.find(f => f.id === folderId)
      return folder?.path || '/'
    },

    getBreadcrumbs(folderId: string | null): MediaFolder[] {
      const breadcrumbs: MediaFolder[] = []
      let currentId = folderId
      
      while (currentId) {
        const folder = this.folders.find(f => f.id === currentId)
        if (folder) {
          breadcrumbs.unshift(folder)
          currentId = folder.parentId || null
        } else {
          break
        }
      }
      
      return breadcrumbs
    },

    saveFoldersToLocal() {
      localStorage.setItem('mediaFolders', JSON.stringify(this.folders))
    },

    loadFoldersFromLocal() {
      try {
        const saved = localStorage.getItem('mediaFolders')
        if (saved) {
          this.folders = JSON.parse(saved)
        }
      } catch (e) {
        console.error('加载文件夹失败:', e)
      }
    },

    // ========== 回收站相关操作 ==========
    // 从数据库加载已删除的媒体（deleted_at IS NOT NULL）
    async loadDeletedItems() {
      try {
        const dbItems = await loadDeletedMediaFiles()
        this.deletedItems = dbItems.map(item => ({
          item,
          deletedAt: (item as any).deleted_at || new Date().toISOString(),
          expiresAt: new Date(new Date((item as any).deleted_at || Date.now()).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }))
        console.log('从数据库加载回收站项目:', this.deletedItems.length)
      } catch (e) {
        console.error('加载回收站失败:', e)
      }
    },

    saveDeletedItems() {
      // 不再使用 localStorage，回收站数据完全由数据库 deleted_at 字段驱动
    },

    // 将媒体项移到回收站（使用数据库软删除）
    async moveToTrash(id: string): Promise<boolean> {
      const item = this.items.find(item => item.id === id)
      if (!item) {
        console.error('[moveToTrash] 未找到媒体项:', id)
        return false
      }
      
      // 从数组中提取 storage_path（如果存在）
      const storagePath = (item as any).storage_path || ''
      
      try {
        // 调用 deleteMediaFile 方法，它会执行软删除（设置 deleted_at）
        console.log('[moveToTrash] 正在软删除:', id, item.fileName)
        const result = await deleteMediaFileService(id, storagePath)
        
        if (result.success) {
          console.log('[moveToTrash] 软删除成功:', id)
          // 从活跃列表中移除
          const index = this.items.findIndex(i => i.id === id)
          if (index !== -1) {
            this.items.splice(index, 1)
          }
          
          // 同步添加到回收站数组（用于内嵌回收站即时显示）
          const now = new Date().toISOString()
          this.deletedItems.push({
            item: { ...item, deleted_at: now } as any,
            deletedAt: now,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
          
          if (this.selectedItem?.id === id) {
            this.selectedItem = null
          }
          
          return true
        } else {
          console.error('[moveToTrash] 软删除失败:', result.error)
          return false
        }
      } catch (error) {
        console.error('[moveToTrash] 异常:', error)
        return false
      }
    },

    // 从回收站恢复（更新数据库 deleted_at = null）
    async restoreFromTrash(id: string) {
      try {
        const result = await restoreMediaFile(id)
        if (result.success) {
          // 从回收站列表中移除
          const index = this.deletedItems.findIndex(d => d.item.id === id)
          if (index !== -1) {
            const deletedItem = this.deletedItems[index]
            // 添加回活跃列表
            this.items.unshift(deletedItem.item)
            this.deletedItems.splice(index, 1)
          }
          // 刷新媒体列表
          this.isLoaded = false
          await this.loadMediaItems()
          return true
        }
        return false
      } catch (e) {
        console.error('恢复失败:', e)
        return false
      }
    },

    // 从回收站永久删除（硬删除：从数据库和存储中彻底移除）
    async permanentlyDelete(id: string) {
      const index = this.deletedItems.findIndex(d => d.item.id === id)
      if (index !== -1) {
        const deletedItem = this.deletedItems[index]
        const storagePath = (deletedItem.item as any).storage_path || ''
        
        // 真正从数据库中删除（硬删除）
        const result = await hardDeleteMediaFile(id, storagePath, (deletedItem.item.type || 'video') as 'photo' | 'video')
        
        if (result.success) {
          this.deletedItems.splice(index, 1)
          return true
        }
      }
      return false
    },

    // 清空回收站（硬删除所有已软删除的记录）
    async emptyTrash() {
      const errors: string[] = []
      for (const deleted of [...this.deletedItems]) {
        const storagePath = (deleted.item as any).storage_path || ''
        const result = await hardDeleteMediaFile(deleted.item.id, storagePath, (deleted.item.type || 'video') as 'photo' | 'video')
        if (!result.success) {
          errors.push(deleted.item.fileName)
        }
      }
      this.deletedItems = []
      // 重新加载确认清空
      await this.loadDeletedItems()
      if (errors.length > 0) {
        console.warn('部分文件删除失败:', errors)
      }
    },

    // 清理过期项目（30天后自动删除）
    async cleanupExpiredItems() {
      const now = new Date().getTime()
      const expiredItems = this.deletedItems.filter(d => new Date(d.expiresAt).getTime() < now)
      
      for (const expired of expiredItems) {
        const storagePath = (expired.item as any).storage_path || ''
        await hardDeleteMediaFile(expired.item.id, storagePath, (expired.item.type || 'video') as 'photo' | 'video')
      }
      
      this.deletedItems = this.deletedItems.filter(d => new Date(d.expiresAt).getTime() >= now)
    },

    // 获取回收站项目数量
    getTrashCount() {
      return this.deletedItems.length
    }
  }
})
