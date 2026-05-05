<template>
  <div class="media-gallery">
    <div class="gallery-header">
      <div class="header-left">
        <h2>📚 学生照片库</h2>
        <div class="stats">
          <span class="stat-item">
            <span class="stat-icon">📸</span>
            <span>{{ mediaStore.photoCount }} 张照片</span>
          </span>
          <span class="stat-item">
            <span class="stat-icon">🎥</span>
            <span>{{ mediaStore.videoCount }} 个视频</span>
          </span>
          <span class="stat-item">
            <span class="stat-icon">💾</span>
            <span>{{ formatFileSize(mediaStore.totalSize) }}</span>
          </span>
        </div>
      </div>
      
      <div class="header-actions">
        <div class="view-toggle">
          <button 
            :class="['view-btn', { active: mediaStore.viewMode === 'grid' }]"
            @click="mediaStore.setViewMode('grid')"
            title="网格视图"
          >
            <span>⊞</span>
          </button>
          <button 
            :class="['view-btn', { active: mediaStore.viewMode === 'list' }]"
            @click="mediaStore.setViewMode('list')"
            title="列表视图"
          >
            <span>☰</span>
          </button>
        </div>
        
        <div class="filter-buttons">
          <button 
            :class="['filter-btn', { active: mediaStore.filterType === 'all' }]"
            @click="mediaStore.setFilterType('all')"
          >
            全部
          </button>
          <button 
            :class="['filter-btn', { active: mediaStore.filterType === 'photo' }]"
            @click="mediaStore.setFilterType('photo')"
          >
            📸 照片
          </button>
          <button 
            :class="['filter-btn', { active: mediaStore.filterType === 'video' }]"
            @click="mediaStore.setFilterType('video')"
          >
            🎥 视频
          </button>
        </div>
      </div>
    </div>

    <!-- 文件夹批量移动对话框 -->
    <div v-if="showFolderBatchMoveDialog" class="modal-overlay" @click="showFolderBatchMoveDialog = false">
      <div class="modal-content move-dialog" @click.stop>
        <div class="modal-header">
          <h3>移动选中文件夹</h3>
          <button class="close-btn" @click="showFolderBatchMoveDialog = false">✕</button>
        </div>
        <div class="modal-body">
          <p class="move-hint">将 {{ selectedFolders.length }} 个文件夹移动到：</p>
          <div class="folder-options-list">
            <div 
              v-for="folder in getBatchMoveTargets()" 
              :key="folder.id"
              class="folder-option"
              :class="{ selected: selectedFolderMoveTarget === folder.id }"
              @click="selectedFolderMoveTarget = folder.id"
            >
              <span class="folder-option-icon">{{ folder.id === 'root' ? '🏠' : '📂' }}</span>
              <span>{{ folder.name }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showFolderBatchMoveDialog = false">取消</button>
          <button class="confirm-btn" @click="confirmFolderBatchMove" :disabled="!selectedFolderMoveTarget">移动 {{ selectedFolders.length }} 个文件夹</button>
        </div>
      </div>
    </div>
    
    <div class="search-bar">
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="搜索文件名、学生姓名、描述或标签..."
        class="search-input"
        @input="handleSearch"
      />
      <button class="new-student-btn" @click="showNewStudentDialog = true">
        ➕ 新建学生文件夹
      </button>
      <button class="trash-btn" @click="showTrashView = true">
        🗑️ 回收站 ({{ mediaStore.deletedItems.length }})
      </button>
    </div>
    
    <!-- 新建学生对话框 -->
    <div v-if="showNewStudentDialog" class="modal-overlay" @click="closeNewStudentDialog">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新建学生文件夹</h3>
          <button class="close-btn" @click="closeNewStudentDialog">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>学生姓名 *</label>
            <input 
              v-model="newStudent.name" 
              type="text" 
              placeholder="请输入学生姓名"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>学号</label>
            <input 
              v-model="newStudent.id" 
              type="text" 
              placeholder="请输入学号（可选）"
              class="form-input"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeNewStudentDialog">取消</button>
          <button class="confirm-btn" @click="createNewStudent" :disabled="!newStudent.name.trim()">
            创建
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑学生对话框 -->
    <div v-if="showEditDialog" class="modal-overlay" @click="closeEditDialog">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑学生信息</h3>
          <button class="close-btn" @click="closeEditDialog">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>学生姓名 *</label>
            <input 
              v-model="editingStudent.name" 
              type="text" 
              placeholder="请输入学生姓名"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>学号</label>
            <input 
              v-model="editingStudent.id" 
              type="text" 
              placeholder="请输入学号（可选）"
              class="form-input"
            />
          </div>
          <div class="form-hint">
            💡 修改后，该学生的所有照片和视频信息都会同步更新
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeEditDialog">取消</button>
          <button class="confirm-btn" @click="updateStudentInfo" :disabled="!editingStudent.name.trim()">
            保存
          </button>
        </div>
      </div>
    </div>

    <!-- 按学生文件夹展示（主视图） -->
    <div v-if="!showSubfolderView && mediaStore.groupedByStudent.length > 0" class="student-groups">
      <div 
        v-for="group in mediaStore.groupedByStudent" 
        :key="group.studentName" 
        class="student-group"
        :class="{ 'drag-over': draggedFolder === group.studentName }"
        @drop="handleDrop($event, group)"
        @dragover="handleDragOver($event, group)"
        @dragleave="handleDragLeave"
      >
        <div class="group-header">
          <div class="group-title">
            <h3>📁 {{ group.studentName }}</h3>
            <span v-if="group.studentId" class="group-student-id">学号: {{ group.studentId }}</span>
            <button class="edit-folder-btn" @click="openEditDialog(group)" title="编辑学生信息">
              ✏️
            </button>
            <button class="new-subfolder-btn" @click="openNewSubfolderDialog(group)" title="新建子文件夹">
              📁+
            </button>
            <button class="delete-folder-btn" @click="deleteStudentFolder(group)" title="删除学生文件夹">
              🗑️
            </button>
          </div>
          <div class="group-stats">
            <span class="group-stat">📸 {{ group.photoCount }}</span>
            <span class="group-stat">🎥 {{ group.videoCount }}</span>
            <span class="group-stat">💾 {{ formatFileSize(group.totalSize) }}</span>
            <span class="group-stat" v-if="getStudentSubfolderCount(group) > 0">📂 {{ getStudentSubfolderCount(group) }} 个子文件夹</span>
            <button class="group-select-btn" @click.stop="selectAllInGroup(group)" title="全选根目录照片">☑️ 全选</button>
            <template v-if="hasSelectedInGroup(group)">
              <button class="group-select-btn primary" @click.stop="openBatchMoveDialog(group)" title="移动选中">📁 移动</button>
              <button class="group-select-btn primary" @click.stop="downloadSelectedItems" title="下载选中">⬇️ 下载</button>
              <button class="group-select-btn danger" @click.stop="deleteSelectedInGroup(group)" title="删除选中">🗑️ 删除</button>
              <button class="group-select-btn secondary" @click.stop="clearSelection" title="取消选择">取消</button>
            </template>
          </div>
        </div>
        
        <!-- 子文件夹显示 -->
        <div v-if="getStudentSubfolders(group).length > 0" class="subfolders-row">
          <div 
            v-for="folder in getStudentSubfolders(group)" 
            :key="folder.id"
            class="subfolder-chip"
            :class="{ 'drop-target': dragOverFolderId === folder.id }"
            @click="openSubfolderDetail(folder, group)"
            @dragover.prevent="handleFolderDragOver(folder.id)"
            @dragleave="handleFolderDragLeave"
            @drop.prevent="handleDropToFolder($event, folder, group)"
          >
            <input type="checkbox" class="folder-select-checkbox" :checked="selectedFolders.includes(folder.id)" @click.stop="toggleSelectFolder(folder.id)" />
            <span class="subfolder-icon">📂</span>
            <span class="subfolder-name">{{ folder.name }}</span>
            <span class="subfolder-count">({{ getMediaFolderItemCount(folder.id) }})</span>
            <button class="chip-rename-btn" @click.stop="renameFolderInline(folder)" title="重命名">✏️</button>
            <button class="chip-delete-btn" @click.stop="deleteNestedFolder(folder)" title="删除">🗑️</button>
          </div>

          <div v-if="selectedFolders.length > 0" class="folder-batch-actions" style="width:100%; margin-top:8px; display:flex; gap:8px;">
            <button class="confirm-btn" @click="openFolderBatchMoveDialog">📁 移动选中文件夹 ({{ selectedFolders.length }})</button>
            <button class="cancel-btn" @click="clearSelectedFolders">取消选择</button>
          </div>
        </div>
        
        <!-- 拖拽提示区域 -->
        <div v-if="draggedFolder === group.studentName" class="drop-zone-indicator">
          <div class="drop-zone-content">
            📤 松开鼠标上传到 {{ group.studentName }}
          </div>
        </div>
        
        <!-- 上传进度显示 -->
        <div v-if="uploadingFolders[group.studentName]" class="upload-progress-bar">
          <div class="progress-fill" :style="{ width: uploadingFolders[group.studentName] + '%' }"></div>
          <span class="progress-text">上传中... {{ uploadingFolders[group.studentName] }}%</span>
        </div>
        
        <div class="group-items">
          <div 
            v-for="(item, index) in getRootFolderItems(group)" 
            :key="item.id"
            class="media-card"
            :class="{ selected: selectedItems.includes(item.id) }"
            draggable="true"
            @click.shift="shiftSelectItem(item.id)"
            @dragstart="handleMediaDragStart($event, item)"
            @dragend="handleMediaDragEnd"
          >
            <div class="select-checkbox" @click.stop="toggleSelectItem(item.id)">
              <input type="checkbox" :checked="selectedItems.includes(item.id)" />
            </div>
            <div class="media-thumbnail" @click.stop="selectMedia(item)" @mouseenter="enableCardVideoPreview(item.id)">
              <img v-if="item.type === 'photo'" :src="item.url" :alt="item.fileName" />
              <img
                v-else-if="item.thumbnail"
                :src="item.thumbnail"
                :alt="item.fileName"
                class="video-poster-thumb"
              />
              <video
                v-else-if="shouldRenderCardVideoPreview(item, index)"
                :src="getCardVideoPreviewSrc(item)"
                preload="metadata"
                playsinline
                muted
              ></video>
              <div v-else class="video-thumb-placeholder" aria-label="视频文件">
                <span class="video-thumb-icon">🎥</span>
              </div>
              <div class="media-overlay">
                <span class="media-type-badge">{{ item.type === 'photo' ? '📸' : '🎥' }}</span>
              </div>
            </div>
            <div class="media-info">
              <p class="media-filename" :title="item.fileName">{{ item.fileName }}</p>
              <p class="media-meta">{{ formatFileSize(item.fileSize) }} · {{ formatDate(item.uploadDate) }}</p>
            </div>
            <div class="media-actions">
              <button class="action-btn rename-btn" @click.stop="renameMediaItem(item)" title="重命名">✏️</button>
              <button class="action-btn move-btn" @click.stop="openMoveDialog(item, group)" title="移动">📁</button>
              <button class="action-btn delete-btn" @click.stop="deleteMedia(item.id)" title="删除">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!showSubfolderView && !showTrashView" class="empty-state">
      <div class="empty-icon">📁</div>
      <p>还没有上传任何照片或视频</p>
      <p class="empty-hint">点击上传按钮开始添加</p>
    </div>

    <!-- 回收站视图 -->
    <div v-if="showTrashView" class="trash-view">
      <div class="trash-header">
        <button class="back-btn" @click="showTrashView = false">← 返回</button>
        <h2>🗑️ 回收站</h2>
        <span class="trash-count">{{ mediaStore.deletedItems.length }} 个项目</span>
        <button v-if="mediaStore.deletedItems.length > 0" class="empty-trash-btn" @click="handleEmptyTrash">
          🗑️ 清空回收站
        </button>
      </div>
      <div class="trash-hint">
        <p>💡 删除的文件将保留 30 天，过期后自动永久删除。您可以随时恢复或彻底删除。</p>
      </div>
      <div v-if="mediaStore.deletedItems.length === 0" class="trash-empty">
        <div class="empty-icon">✨</div>
        <p>回收站是空的</p>
      </div>
      <div v-else class="trash-items">
        <div 
          v-for="(deleted, index) in mediaStore.deletedItems" 
          :key="deleted.item.id"
          class="trash-card"
        >
          <div class="trash-thumbnail" @mouseenter="enableCardVideoPreview(deleted.item.id)">
            <img v-if="deleted.item.type === 'photo'" :src="deleted.item.url" :alt="deleted.item.fileName" />
            <img
              v-else-if="deleted.item.thumbnail"
              :src="deleted.item.thumbnail"
              :alt="deleted.item.fileName"
              class="video-poster-thumb"
            />
            <video
              v-else-if="shouldRenderCardVideoPreview(deleted.item, index)"
              :src="getCardVideoPreviewSrc(deleted.item)"
              preload="metadata"
              playsinline
              muted
            ></video>
            <div v-else class="video-thumb-placeholder" aria-label="视频文件">
              <span class="video-thumb-icon">🎥</span>
            </div>
            <div class="trash-overlay">
              <span class="media-type-badge">{{ deleted.item.type === 'photo' ? '📸' : '🎥' }}</span>
            </div>
          </div>
          <div class="trash-info">
            <p class="trash-filename" :title="deleted.item.fileName">{{ deleted.item.fileName }}</p>
            <p class="trash-meta">
              来自: {{ deleted.item.studentName }}
              <span v-if="deleted.item.folderName"> / {{ deleted.item.folderName }}</span>
            </p>
            <p class="trash-date">
              删除于: {{ formatDate(deleted.deletedAt) }}
              <span class="expire-hint">({{ getDaysUntilExpire(deleted.deletedAt) }})</span>
            </p>
          </div>
          <div class="trash-actions">
            <button class="action-btn restore-btn" @click="handleRestore(deleted)" title="恢复">
              ♻️ 恢复
            </button>
            <button class="action-btn delete-btn" @click="handlePermanentDelete(deleted)" title="彻底删除">
              ❌ 删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 子文件夹内联视图 -->
    <div v-if="showSubfolderView && selectedSubfolder" class="subfolder-view">
      <!-- 子文件夹头部 -->
      <div class="subfolder-view-header">
        <div class="subfolder-header-left">
          <button class="back-btn" @click="goBackFromSubfolder">← 返回</button>
          <div class="subfolder-breadcrumb-inline">
            <span class="breadcrumb-item clickable" @click="goBackToRoot">{{ selectedSubfolderStudent?.studentName }}</span>
            <template v-for="(crumb, index) in subfolderBreadcrumbs" :key="crumb.id">
              <span class="breadcrumb-sep">›</span>
              <span 
                class="breadcrumb-item" 
                :class="{ active: index === subfolderBreadcrumbs.length - 1, clickable: index < subfolderBreadcrumbs.length - 1 }"
                @click="index < subfolderBreadcrumbs.length - 1 ? navigateToFolder(crumb) : null"
              >{{ crumb.name }}</span>
            </template>
          </div>
          <button class="rename-btn-inline" @click="renameFolderInline(selectedSubfolder)" title="重命名文件夹">✏️</button>
        </div>
        <div class="subfolder-header-actions">
          <input
            ref="subfolderFileInput"
            type="file"
            multiple
            accept="image/*,video/*"
            style="display: none"
            @change="handleSubfolderFileSelect"
          />
          <button class="header-action-btn" @click="openNestedSubfolderDialog" title="新建子文件夹">📁+ 新建文件夹</button>
          <button class="header-action-btn" @click="triggerSubfolderUpload" title="上传文件">📤 上传</button>
          <button class="header-action-btn" @click="selectAllInSubfolder" title="全选">☑️ 全选</button>
          <button 
            v-if="selectedItems.length > 0" 
            class="header-action-btn primary" 
            @click="openBatchMoveDialog()"
            title="移动选中"
          >📁 移动 ({{ selectedItems.length }})</button>
          <button 
            v-if="selectedItems.length > 0" 
            class="header-action-btn primary" 
            @click="downloadSelectedItems"
            title="下载选中"
          >⬇️ 下载 ({{ selectedItems.length }})</button>
          <button 
            v-if="selectedItems.length > 0" 
            class="header-action-btn danger" 
            @click="deleteSelectedItems"
            title="删除选中"
          >🗑️ 删除选中 ({{ selectedItems.length }})</button>
          <button 
            v-if="selectedItems.length > 0" 
            class="header-action-btn secondary" 
            @click="clearSelection"
          >取消选择</button>
        </div>
      </div>
      
      <!-- 子文件夹内容区域 -->
      <div 
        class="subfolder-view-content"
        :class="{ 'drag-over': isDraggingInSubfolder }"
        @dragover.prevent="isDraggingInSubfolder = true"
        @dragleave="isDraggingInSubfolder = false"
        @drop.prevent="handleSubfolderDrop"
      >
        <div v-if="isDraggingInSubfolder" class="subfolder-drop-hint">
          📤 松开鼠标上传到此文件夹
        </div>
        
        <!-- 上传进度 -->
        <div v-if="subfolderUploadProgress > 0 && subfolderUploadProgress < 100" class="upload-progress-bar">
          <div class="progress-fill" :style="{ width: subfolderUploadProgress + '%' }"></div>
          <span class="progress-text">上传中... {{ subfolderUploadProgress }}%</span>
        </div>
        
        <!-- 子文件夹列表 -->
        <div v-if="getNestedSubfolders(selectedSubfolder.id).length > 0" class="nested-subfolders-section">
          <h4 class="section-title">📁 文件夹</h4>
          <div class="nested-subfolders-grid">
            <div 
              v-for="folder in getNestedSubfolders(selectedSubfolder.id)" 
              :key="folder.id"
              class="nested-folder-card"
              :class="{ 'drop-target': dragOverFolderId === folder.id }"
              @click="navigateToFolder(folder)"
              @contextmenu.prevent="showFolderContextMenu(folder, $event)"
              draggable="true"
              @dragstart="(e) => handleFolderDragStart(e, folder)"
              @dragend="handleFolderDragEnd"
              @dragover.prevent="handleFolderDragOver(folder.id)"
              @dragleave="handleFolderDragLeave"
              @drop.prevent="handleNestedFolderDrop($event, folder)"
            >
              <div class="folder-icon-large">📂</div>
              <div class="folder-info">
                <h5 class="folder-name">{{ folder.name }}</h5>
                <p class="folder-count">{{ getMediaFolderItemCount(folder.id) }} 个项目</p>
              </div>
              <div class="folder-actions-inline" @click.stop>
                <button class="mini-action-btn" @click="renameFolderInline(folder)" title="重命名">✏️</button>
                <button class="mini-action-btn" @click="showFolderContextMenu(folder, $event)">⋮</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 媒体文件区域 -->
        <div v-if="getSubfolderItems(selectedSubfolder.id).length > 0" class="media-items-section">
          <h4 class="section-title">📸 照片/视频</h4>
          <div class="media-items-grid">
            <div 
              v-for="(item, index) in getSubfolderItems(selectedSubfolder.id)" 
              :key="item.id"
              class="media-card"
              :class="{ selected: selectedItems.includes(item.id) }"
              draggable="true"
              @click.shift="shiftSelectItem(item.id)"
              @dragstart="handleMediaDragStart($event, item)"
              @dragend="handleMediaDragEnd"
            >
              <div class="select-checkbox" @click.stop="toggleSelectItem(item.id)">
                <input type="checkbox" :checked="selectedItems.includes(item.id)" />
              </div>
              <div class="media-thumbnail" @click.stop="selectMedia(item)" @mouseenter="enableCardVideoPreview(item.id)">
                <img v-if="item.type === 'photo'" :src="item.url" :alt="item.fileName" />
                <img
                  v-else-if="item.thumbnail"
                  :src="item.thumbnail"
                  :alt="item.fileName"
                  class="video-poster-thumb"
                />
                <video
                  v-else-if="shouldRenderCardVideoPreview(item, index)"
                  :src="getCardVideoPreviewSrc(item)"
                  preload="metadata"
                  playsinline
                  muted
                ></video>
                <div v-else class="video-thumb-placeholder" aria-label="视频文件">
                  <span class="video-thumb-icon">🎥</span>
                </div>
                <div class="media-overlay">
                  <span class="media-type-badge">{{ item.type === 'photo' ? '📸' : '🎥' }}</span>
                </div>
              </div>
              <div class="media-info">
                <p class="media-filename" :title="item.fileName">{{ item.fileName }}</p>
                <p class="media-meta">{{ formatFileSize(item.fileSize) }}</p>
              </div>
              <div class="media-actions">
                <button class="action-btn rename-btn" @click.stop="renameMediaItem(item)" title="重命名">✏️</button>
                <button class="action-btn move-btn" @click.stop="openMoveDialogFromSubfolder(item)" title="移动">📁</button>
                <button class="action-btn delete-btn" @click.stop="deleteMedia(item.id)" title="删除">🗑️</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="getNestedSubfolders(selectedSubfolder.id).length === 0 && getSubfolderItems(selectedSubfolder.id).length === 0" class="empty-subfolder-view">
          <div class="empty-icon">📂</div>
          <p>此文件夹为空</p>
          <p class="empty-hint">拖拽文件到这里上传，或点击上方按钮添加</p>
        </div>
      </div>
    </div>

    <!-- 预览模态框 -->
    <div v-if="mediaStore.selectedItem" class="preview-modal" @click="mediaStore.clearSelection()">
      <div class="preview-content" @click.stop>
        <button class="close-btn" @click="mediaStore.clearSelection()">✕</button>
        
        <!-- 左右翻页按钮 -->
        <button 
          v-if="canGoPrevious" 
          class="nav-btn nav-btn-left" 
          @click="goToPrevious"
          title="上一张 (←)"
        >
          ◀
        </button>
        <button 
          v-if="canGoNext" 
          class="nav-btn nav-btn-right" 
          @click="goToNext"
          title="下一张 (→)"
        >
          ▶
        </button>
        
        <div class="preview-media" :class="{ 'video-original-mode': isSelectedVideo && videoSizeMode === 'original' }">
          <img 
            v-if="mediaStore.selectedItem.type === 'photo'" 
            :src="mediaStore.selectedItem.url" 
            :alt="mediaStore.selectedItem.fileName"
          />
          <video 
            v-else 
            ref="previewVideoRef"
            :src="mediaStore.selectedItem.url" 
            :poster="mediaStore.selectedItem.thumbnail || undefined"
            :style="previewVideoRenderStyle"
            controls
            preload="auto"
            autoplay
            playsinline
            @loadedmetadata="handlePreviewVideoLoadedMetadata"
            @timeupdate="handlePreviewVideoTimeUpdate"
          ></video>
        </div>

        <div v-if="isSelectedVideo" class="video-progress-wrap">
          <span class="video-time">{{ formatVideoTime(previewVideoCurrentTime) }}</span>
          <input
            class="video-progress-slider"
            type="range"
            min="0"
            :max="Math.max(previewVideoDuration, 0)"
            step="0.1"
            :value="previewVideoCurrentTime"
            @input="handlePreviewVideoSeek"
            @mousedown="isPreviewVideoSeeking = true"
            @mouseup="isPreviewVideoSeeking = false"
            @touchstart="isPreviewVideoSeeking = true"
            @touchend="isPreviewVideoSeeking = false"
          />
          <span class="video-time">{{ formatVideoTime(previewVideoDuration) }}</span>
        </div>

        <div v-if="isSelectedVideo" class="video-size-controls">
          <button class="size-toggle-btn" @click="toggleVideoSizeMode">
            {{ videoSizeMode === 'fit' ? '切换为完整显示' : '切换为适应窗口' }}
          </button>
          <span class="video-size-hint">
            当前: {{ videoSizeMode === 'fit' ? '适应窗口' : '完整显示' }}
          </span>
        </div>
        
        <!-- 图片计数 -->
        <div class="image-counter">
          {{ currentImageIndex + 1 }} / {{ displayItems.length }}
        </div>
        
        <div class="preview-details">
          <h3>{{ mediaStore.selectedItem.fileName }}</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">类型:</span>
              <span>{{ mediaStore.selectedItem.type === 'photo' ? '照片' : '视频' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">大小:</span>
              <span>{{ formatFileSize(mediaStore.selectedItem.fileSize) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">上传时间:</span>
              <span>{{ formatDate(mediaStore.selectedItem.uploadDate) }}</span>
            </div>
            <div v-if="isSelectedVideo && previewVideoNaturalWidth > 0 && previewVideoNaturalHeight > 0" class="detail-item">
              <span class="detail-label">分辨率:</span>
              <span>{{ previewVideoNaturalWidth }} × {{ previewVideoNaturalHeight }}</span>
            </div>
            <div v-if="mediaStore.selectedItem.studentName" class="detail-item">
              <span class="detail-label">学生:</span>
              <span>{{ mediaStore.selectedItem.studentName }}</span>
            </div>
            <div v-if="mediaStore.selectedItem.studentId" class="detail-item">
              <span class="detail-label">学号:</span>
              <span>{{ mediaStore.selectedItem.studentId }}</span>
            </div>
          </div>
          
          <div v-if="mediaStore.selectedItem.description" class="description">
            <span class="detail-label">描述:</span>
            <p>{{ mediaStore.selectedItem.description }}</p>
          </div>
          
          <div v-if="mediaStore.selectedItem.tags?.length" class="tags">
            <span class="detail-label">标签:</span>
            <div class="tag-list">
              <span v-for="tag in mediaStore.selectedItem.tags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="preview-actions">
            <button class="preview-action-btn download" @click="downloadCurrentMedia">
              ⬇️ 下载
            </button>
            <button class="preview-action-btn delete" @click="deleteCurrentMedia">
              🗑️ 删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <ConfirmDialog
      v-model:visible="showDeleteMediaDialog"
      type="danger"
      title="确认删除"
      message="确定要删除这个文件吗？文件将移到回收站，30天后自动永久删除。"
      confirm-text="确认删除"
      cancel-text="取消"
      @confirm="handleDeleteMediaConfirmed"
      @cancel="showDeleteMediaDialog = false"
    />

    <!-- 新建子文件夹对话框 -->
    <div v-if="showNewSubfolderDialog" class="modal-overlay" @click="closeNewSubfolderDialog">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新建子文件夹</h3>
          <button class="close-btn" @click="closeNewSubfolderDialog">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>将在 {{ currentStudentForSubfolder?.studentName }} 下创建子文件夹</label>
            <input 
              v-model="newSubfolderName" 
              type="text" 
              placeholder="请输入文件夹名称"
              class="form-input"
              @keyup.enter="createSubfolder"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeNewSubfolderDialog">取消</button>
          <button class="confirm-btn" @click="createSubfolder" :disabled="!newSubfolderName.trim()">
            创建
          </button>
        </div>
      </div>
    </div>

    <!-- 在子文件夹中新建嵌套子文件夹对话框 -->
    <div v-if="showNestedSubfolderDialog" class="modal-overlay" @click="showNestedSubfolderDialog = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新建子文件夹</h3>
          <button class="close-btn" @click="showNestedSubfolderDialog = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>将在 "{{ selectedSubfolder?.name }}" 下创建子文件夹</label>
            <input 
              v-model="nestedSubfolderName" 
              type="text" 
              placeholder="请输入文件夹名称"
              class="form-input"
              @keyup.enter="createNestedSubfolder"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showNestedSubfolderDialog = false">取消</button>
          <button class="confirm-btn" @click="createNestedSubfolder" :disabled="!nestedSubfolderName.trim()">
            创建
          </button>
        </div>
      </div>
    </div>

    <!-- 重命名对话框 -->
    <div v-if="showRenameDialog" class="modal-overlay" @click="closeRenameDialog">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ renameType === 'folder' ? '重命名文件夹' : '重命名文件' }}</h3>
          <button class="close-btn" @click="closeRenameDialog">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>新名称</label>
            <input 
              v-model="renameNewName" 
              type="text" 
              placeholder="请输入新名称"
              class="form-input"
              @keyup.enter="confirmRename"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeRenameDialog">取消</button>
          <button class="confirm-btn" @click="confirmRename" :disabled="!renameNewName.trim()">
            确定
          </button>
        </div>
      </div>
    </div>

    <!-- 移动文件对话框 -->
    <div v-if="showMoveDialog" class="modal-overlay" @click="closeMoveDialog">
      <div class="modal-content move-dialog" @click.stop>
        <div class="modal-header">
          <h3>移动到文件夹</h3>
          <button class="close-btn" @click="closeMoveDialog">✕</button>
        </div>
        <div class="modal-body">
          <p class="move-hint">选择要将 "{{ movingItem?.fileName }}" 移动到的位置：</p>
          
          <!-- 根目录选项 -->
          <div 
            class="folder-option"
            :class="{ selected: selectedMoveTarget === 'root' }"
            @click="selectedMoveTarget = 'root'"
          >
            <span class="folder-option-icon">🏠</span>
            <span>根目录（{{ movingItemStudent?.studentName }}）</span>
          </div>
          
          <!-- 子文件夹选项 -->
          <div 
            v-for="folder in getAvailableMoveTargets()" 
            :key="folder.id"
            class="folder-option"
            :class="{ selected: selectedMoveTarget === folder.id }"
            @click="selectedMoveTarget = folder.id"
          >
            <span class="folder-option-icon">📂</span>
            <span>{{ folder.name }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeMoveDialog">取消</button>
          <button class="confirm-btn" @click="confirmMove" :disabled="!selectedMoveTarget">
            移动
          </button>
        </div>
      </div>
    </div>

    <!-- 批量移动对话框 -->
    <div v-if="showBatchMoveDialog" class="modal-overlay" @click="showBatchMoveDialog = false">
      <div class="modal-content move-dialog" @click.stop>
        <div class="modal-header">
          <h3>批量移动</h3>
          <button class="close-btn" @click="showBatchMoveDialog = false">✕</button>
        </div>
        <div class="modal-body">
          <p class="move-hint">将 {{ selectedItems.length }} 个文件移动到：</p>
          
          <!-- 学生选择器（当有多个学生时显示） -->
          <div v-if="batchMoveStudentOptions.length > 1" class="student-selector">
            <label>选择目标学生：</label>
            <select v-model="batchMoveStudentId" class="student-select">
              <option :value="null">跨学生移动（显示所有文件夹）</option>
              <option 
                v-for="student in batchMoveStudentOptions" 
                :key="student.studentId"
                :value="student.studentId"
              >
                {{ student.studentName }}
              </option>
            </select>
          </div>
          
          <!-- 目标文件夹选项 -->
          <div class="folder-options-list">
            <div 
              v-for="folder in getBatchMoveTargets()" 
              :key="folder.id"
              class="folder-option"
              :class="{ selected: selectedMoveTarget === folder.id }"
              @click="selectedMoveTarget = folder.id"
            >
              <span class="folder-option-icon">{{ folder.id === 'root' ? '🏠' : '📂' }}</span>
              <span>{{ folder.name }}</span>
            </div>
          </div>
          
          <p v-if="getBatchMoveTargets().length === 0" class="no-targets-hint">
            暂无可用的目标文件夹，请先创建文件夹或选择学生
          </p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showBatchMoveDialog = false">取消</button>
          <button class="confirm-btn" @click="confirmBatchMove" :disabled="!selectedMoveTarget">
            移动 {{ selectedItems.length }} 个文件
          </button>
        </div>
      </div>
    </div>

    <!-- 文件夹右键菜单 -->
    <div 
      v-if="showFolderMenu" 
      class="folder-context-menu"
      :style="{ left: folderMenuPosition.x + 'px', top: folderMenuPosition.y + 'px' }"
      @click.stop
    >
      <button class="context-menu-item" @click="handleFolderMenuRename">
        <span class="menu-icon">✏️</span>
        <span>重命名</span>
      </button>
      <button class="context-menu-item danger" @click="handleFolderMenuDelete">
        <span class="menu-icon">🗑️</span>
        <span>删除</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useMediaStore } from '@/stores/media'
import type { MediaItem, MediaFolder } from '@/types/media'
import { uploadMediaFile, updateStudentMediaBatch, updateMediaFolderId, resolvePlayableVideoUrl, resolveFastVideoUrl } from '@/utils/mediaService'
import { saveStudentProfile } from '@/utils/studentProfileService'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const mediaStore = useMediaStore()
const searchQuery = ref('')
const searchResults = ref<MediaItem[]>([])
const draggedFolder = ref<string | null>(null)
const uploadingFolders = ref<Record<string, number>>({}) // 学生名 -> 进度百分比
const showNewStudentDialog = ref(false)
const showDeleteMediaDialog = ref(false)
const mediaToDelete = ref('')
const newStudent = ref({
  name: '',
  id: ''
})
const showEditDialog = ref(false)
const editingStudent = ref({
  originalName: '',
  originalId: '',
  name: '',
  id: ''
})

// 子文件夹相关
const showNewSubfolderDialog = ref(false)
const newSubfolderName = ref('')
const currentStudentForSubfolder = ref<{ studentId: string; studentName: string } | null>(null)
const showSubfolderDetailDialog = ref(false)
const showSubfolderView = ref(false) // 新增：控制子文件夹内联视图
const selectedSubfolder = ref<MediaFolder | null>(null)
const selectedSubfolderStudent = ref<{ studentId: string; studentName: string } | null>(null)
const subfolderFileInput = ref<HTMLInputElement | null>(null)
const isDraggingInSubfolder = ref(false)
const subfolderUploadProgress = ref(0)

// 拖拽移动相关
const draggingMediaItem = ref<MediaItem | null>(null)
const draggingFolder = ref<MediaFolder | null>(null)
const dragOverFolderId = ref<string | null>(null)
const showMoveDialog = ref(false)
const movingItem = ref<MediaItem | null>(null)
const movingItemStudent = ref<{ studentId: string; studentName: string } | null>(null)
const selectedMoveTarget = ref<string | null>(null)

// 多选相关
const selectedItems = ref<string[]>([])
const lastSelectedIndex = ref<number>(-1)

// 嵌套子文件夹相关
const showNestedSubfolderDialog = ref(false)
const nestedSubfolderName = ref('')
const subfolderBreadcrumbs = ref<MediaFolder[]>([])
// 文件夹勾选与批量移动
const selectedFolders = ref<string[]>([])
const showFolderBatchMoveDialog = ref(false)
const selectedFolderMoveTarget = ref<string | null>(null)

// 重命名相关
const showRenameDialog = ref(false)
const renameType = ref<'folder' | 'media'>('folder')
const renamingItem = ref<MediaFolder | MediaItem | null>(null)
const renameNewName = ref('')

// 文件夹右键菜单相关
const showFolderMenu = ref(false)
const folderMenuPosition = ref({ x: 0, y: 0 })
const contextMenuFolder = ref<MediaFolder | null>(null)
const previewVideoRef = ref<HTMLVideoElement | null>(null)
const previewVideoDuration = ref(0)
const previewVideoCurrentTime = ref(0)
const isPreviewVideoSeeking = ref(false)
const previewVideoNaturalWidth = ref(0)
const previewVideoNaturalHeight = ref(0)
const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1280)
const viewportHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 720)
const videoSizeMode = ref<'fit' | 'original'>('fit')

// 回收站相关
const showTrashView = ref(false)
const cardVideoPreviewEnabledIds = ref(new Set<string>())

const enableCardVideoPreview = (itemId: string) => {
  if (!itemId) return
  if (cardVideoPreviewEnabledIds.value.has(itemId)) return
  const next = new Set(cardVideoPreviewEnabledIds.value)
  next.add(itemId)
  cardVideoPreviewEnabledIds.value = next
}

const shouldRenderCardVideoPreview = (item: MediaItem, index: number): boolean => {
  if (!item || item.type !== 'video') return false
  if (String(item.thumbnail || '').trim()) return false
  if (index < 8) return true
  return cardVideoPreviewEnabledIds.value.has(item.id)
}

const getCardVideoPreviewSrc = (item: MediaItem): string => {
  const raw = String(item?.url || '').trim()
  if (!raw) return ''
  if (raw.includes('#t=')) return raw
  return `${raw}#t=0.1`
}

// 页面可见性变化时刷新数据
const handleVisibilityChange = async () => {
  if (document.visibilityState === 'visible') {
    console.log('[MediaGallery] 页面重新可见，刷新数据')
    await mediaStore.loadMediaItems(true)
    await mediaStore.loadDeletedItems()
  }
}

// 加载媒体文件
onMounted(async () => {
  // 强制重新加载数据（忽略 isLoaded 标志）
  console.log('[MediaGallery] 组件挂载，强制加载数据')
  await mediaStore.loadMediaItems(true)
  mediaStore.loadFoldersFromLocal()
  await mediaStore.loadDeletedItems() // 从数据库加载回收站数据
  mediaStore.cleanupExpiredItems() // 清理过期项目
  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('resize', handleWindowResize)
  // 监听页面可见性变化
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeUnmount(() => {
  // 移除事件监听
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('resize', handleWindowResize)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

const displayItems = computed(() => {
  return searchQuery.value ? searchResults.value : mediaStore.filteredItems
})

// 当前图片索引
const currentImageIndex = computed(() => {
  if (!mediaStore.selectedItem) return -1
  return displayItems.value.findIndex(item => item.id === mediaStore.selectedItem?.id)
})

// 是否可以翻到上一张
const canGoPrevious = computed(() => {
  return currentImageIndex.value > 0
})

// 是否可以翻到下一张
const canGoNext = computed(() => {
  return currentImageIndex.value >= 0 && currentImageIndex.value < displayItems.value.length - 1
})

const isSelectedVideo = computed(() => mediaStore.selectedItem?.type === 'video')

const previewVideoRenderStyle = computed(() => {
  if (!isSelectedVideo.value) return {}
  if (!previewVideoNaturalWidth.value || !previewVideoNaturalHeight.value) return {}

  if (videoSizeMode.value === 'original') {
    return {
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain'
    }
  }

  // 适应窗口模式：不放大视频，只在超出视口时按比例缩小
  const maxW = Math.max(320, viewportWidth.value - 180)
  const maxH = Math.max(240, Math.floor(viewportHeight.value * 0.6))
  const scale = Math.min(
    1,
    maxW / previewVideoNaturalWidth.value,
    maxH / previewVideoNaturalHeight.value
  )

  return {
    width: `${Math.floor(previewVideoNaturalWidth.value * scale)}px`,
    height: `${Math.floor(previewVideoNaturalHeight.value * scale)}px`
  }
})

const formatVideoTime = (seconds: number): string => {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0))
  const min = Math.floor(safe / 60)
  const sec = safe % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

const handlePreviewVideoLoadedMetadata = () => {
  const video = previewVideoRef.value
  if (!video) return
  previewVideoDuration.value = Number.isFinite(video.duration) ? video.duration : 0
  previewVideoNaturalWidth.value = Number(video.videoWidth || 0)
  previewVideoNaturalHeight.value = Number(video.videoHeight || 0)
}

const handlePreviewVideoTimeUpdate = () => {
  const video = previewVideoRef.value
  if (!video || isPreviewVideoSeeking.value) return
  previewVideoCurrentTime.value = Number.isFinite(video.currentTime) ? video.currentTime : 0
  if (Number.isFinite(video.duration)) {
    previewVideoDuration.value = video.duration
  }
}

const handlePreviewVideoSeek = (event: Event) => {
  const video = previewVideoRef.value
  if (!video) return
  const target = event.target as HTMLInputElement
  const nextTime = Number.parseFloat(target.value || '0')
  if (!Number.isFinite(nextTime)) return
  previewVideoCurrentTime.value = nextTime
  video.currentTime = nextTime
}

const handleWindowResize = () => {
  viewportWidth.value = window.innerWidth
  viewportHeight.value = window.innerHeight
}

const toggleVideoSizeMode = () => {
  videoSizeMode.value = videoSizeMode.value === 'fit' ? 'original' : 'fit'
}

// 上一张
const goToPrevious = () => {
  if (canGoPrevious.value) {
    const prevItem = displayItems.value[currentImageIndex.value - 1]
    void selectMedia(prevItem)
  }
}

// 下一张
const goToNext = () => {
  if (canGoNext.value) {
    const nextItem = displayItems.value[currentImageIndex.value + 1]
    void selectMedia(nextItem)
  }
}

// 键盘事件处理
const handleKeyDown = (event: KeyboardEvent) => {
  if (!mediaStore.selectedItem) return
  
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      goToPrevious()
      break
    case 'ArrowRight':
      event.preventDefault()
      goToNext()
      break
    case 'Escape':
      mediaStore.clearSelection()
      break
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    searchResults.value = mediaStore.searchItems(searchQuery.value)
  } else {
    searchResults.value = []
  }
}

const selectMedia = async (item: MediaItem) => {
  if (item.type !== 'video') {
    mediaStore.selectItem(item)
    return
  }

  // 先同步切到最快可用地址，避免先请求旧地址导致黑屏或额外等待。
  const fastUrl = resolveFastVideoUrl(item as any)
  const optimisticItem = fastUrl && fastUrl !== item.url
    ? { ...item, url: fastUrl }
    : item

  if (optimisticItem !== item) {
    const optimisticIndex = mediaStore.items.findIndex((i) => i.id === item.id)
    if (optimisticIndex !== -1) {
      mediaStore.items[optimisticIndex] = optimisticItem
    }
  }

  mediaStore.selectItem(optimisticItem)

  const signedUrl = await resolvePlayableVideoUrl(optimisticItem as any)
  if (!signedUrl || signedUrl === optimisticItem.url) return

  const nextItem = { ...optimisticItem, url: signedUrl }
  const index = mediaStore.items.findIndex((i) => i.id === item.id)
  if (index !== -1) {
    mediaStore.items[index] = nextItem
  }
  mediaStore.selectItem(nextItem)
}

watch(
  () => mediaStore.selectedItem,
  async (item) => {
    if (!item || item.type !== 'video') return
    if (String(item.url || '').includes('X-Amz-Algorithm=')) return

    const signedUrl = await resolvePlayableVideoUrl(item as any)
    if (!signedUrl || signedUrl === item.url) return

    const nextItem = { ...item, url: signedUrl }
    const index = mediaStore.items.findIndex((i) => i.id === item.id)
    if (index !== -1) {
      mediaStore.items[index] = nextItem
    }
    mediaStore.selectItem(nextItem)
  }
)

// 下载当前预览的媒体
const downloadCurrentMedia = async () => {
  const item = mediaStore.selectedItem
  if (!item) return
  
  try {
    const response = await fetch(item.url)
    const blob = await response.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = item.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  } catch (error) {
    console.error('下载失败:', error)
    alert('下载失败，请重试')
  }
}

// 删除当前预览的媒体
const deleteCurrentMedia = async () => {
  const item = mediaStore.selectedItem
  if (!item) return
  
  if (!confirm(`确定要删除 "${item.fileName}" 吗？此操作不可恢复。`)) return
  
  try {
    await mediaStore.removeMediaItem(item.id)
    mediaStore.clearSelection()
  } catch (error) {
    console.error('删除失败:', error)
    alert('删除失败，请重试')
  }
}

const deleteMedia = async (id: string) => {
  mediaToDelete.value = id
  showDeleteMediaDialog.value = true
}

const handleDeleteMediaConfirmed = async () => {
  showDeleteMediaDialog.value = false
  if (mediaToDelete.value) {
    try {
      const success = await mediaStore.removeMediaItem(mediaToDelete.value)
      if (success) {
        alert('✅ 已删除，文件已移至回收站')
      } else {
        alert('❌ 删除失败，请检查网络连接后重试')
      }
    } catch (error) {
      console.error('删除异常:', error)
      alert('❌ 删除失败，请重试')
    }
    mediaToDelete.value = ''
  }
}

// 编辑学生信息
const openEditDialog = (group: any) => {
  editingStudent.value = {
    originalName: group.studentName,
    originalId: group.studentId || '',
    name: group.studentName,
    id: group.studentId || ''
  }
  showEditDialog.value = true
}

const closeEditDialog = () => {
  showEditDialog.value = false
  editingStudent.value = { originalName: '', originalId: '', name: '', id: '' }
}

const updateStudentInfo = async () => {
  if (!editingStudent.value.name.trim()) {
    alert('请输入学生姓名')
    return
  }
  
  const originalName = editingStudent.value.originalName
  const originalId = editingStudent.value.originalId
  const newName = editingStudent.value.name
  const newId = editingStudent.value.id || originalId || `STU${Date.now()}`
  
  if (originalName === newName && originalId === newId) {
    alert('信息未修改')
    return
  }
  
  try {
    // 1. 批量更新数据库中该学生的所有媒体文件
    const batchResult = await updateStudentMediaBatch(
      originalName,
      originalId,
      newName,
      newId
    )
    
    if (!batchResult.success) {
      alert('更新媒体文件失败: ' + batchResult.error)
      return
    }
    
    // 2. 更新学生档案
    const profileResult = await saveStudentProfile({
      student_name: newName,
      student_id: newId
    })
    
    if (!profileResult.success) {
      console.warn('更新学生档案失败:', profileResult.error)
    }
    
    alert(`✅ 学生信息已更新！\n📝 ${batchResult.count} 个文件已同步更新`)
    closeEditDialog()
    
    // 重新加载数据以刷新显示
    await mediaStore.loadMediaItems()
  } catch (error) {
    console.error('更新学生信息失败:', error)
    alert('更新失败，请重试')
  }
}

// 新建学生文件夹
const closeNewStudentDialog = () => {
  showNewStudentDialog.value = false
  newStudent.value = { name: '', id: '' }
}

const createNewStudent = async () => {
  if (!newStudent.value.name.trim()) {
    alert('请输入学生姓名')
    return
  }
  
  try {
    const studentId = newStudent.value.id || `STU${Date.now()}`
    
    // 照片库的学生文件夹不需要创建学生档案记录
    // 只需要创建一个空的本地文件夹标识即可
    // 当上传照片时，会自动关联这个学生ID和姓名
    
    // 创建一个虚拟的学生文件夹标识（存储在localStorage）
    const existingFolders = JSON.parse(localStorage.getItem('photoStudentFolders') || '[]')
    const newFolder = {
      studentId: studentId,
      studentName: newStudent.value.name,
      createdAt: new Date().toISOString()
    }
    
    // 检查是否已存在
    const exists = existingFolders.some((f: any) => 
      f.studentId === studentId || f.studentName === newStudent.value.name
    )
    
    if (exists) {
      alert('该学生文件夹已存在')
      return
    }
    
    existingFolders.push(newFolder)
    localStorage.setItem('photoStudentFolders', JSON.stringify(existingFolders))
    
    alert(`✅ 学生文件夹 "${newStudent.value.name}" 创建成功！\n现在可以拖拽照片到文件夹中上传了。`)
    closeNewStudentDialog()
    
    // 重新加载以显示新的空文件夹
    await mediaStore.loadMediaItems()
  } catch (error) {
    console.error('创建学生文件夹失败:', error)
    alert('创建失败，请重试')
  }
}

// 拖拽处理
const handleDragOver = (event: DragEvent, group: any) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
  draggedFolder.value = group.studentName
}

const handleDragLeave = (event: DragEvent) => {
  draggedFolder.value = null
}

const handleDrop = async (event: DragEvent, group: any) => {
  event.preventDefault()
  draggedFolder.value = null
  
  const files = event.dataTransfer?.files
  if (!files || files.length === 0) return
  
  const studentName = group.studentName
  const studentId = group.studentId
  
  // 验证文件类型
  const validFiles: File[] = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      validFiles.push(file)
    }
  }
  
  if (validFiles.length === 0) {
    alert('请拖入图片或视频文件')
    return
  }
  
  // 开始上传
  uploadingFolders.value[studentName] = 0
  
  try {
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i]
      
      // 上传文件
      const result = await uploadMediaFile(file, {
        studentName,
        studentId: studentId || '',
        description: ''
      }, {
        onProgress: (progress) => {
          uploadingFolders.value[studentName] = Math.round(((i + progress.percent / 100) / validFiles.length) * 100)
        }
      })
      
      if (result.success && result.data) {
        await mediaStore.addMediaItem(result.data)
      } else {
        console.error('上传失败:', result.error)
        alert(`文件 ${file.name} 上传失败: ${result.error}`)
      }
      
      // 更新进度
      uploadingFolders.value[studentName] = Math.max(uploadingFolders.value[studentName] || 0, Math.round(((i + 1) / validFiles.length) * 100))
    }
    
    // 上传完成，延迟清除进度显示
    setTimeout(() => {
      delete uploadingFolders.value[studentName]
    }, 1000)
    
  } catch (error) {
    console.error('批量上传失败:', error)
    alert('上传过程中发生错误')
    delete uploadingFolders.value[studentName]
  }
}

const formatFileSize = (bytes: number | string | undefined): string => {
  const numBytes = typeof bytes === 'string' ? parseInt(bytes) : (bytes || 0)
  if (!numBytes || numBytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(numBytes) / Math.log(k))
  return Math.round(numBytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  
  return date.toLocaleDateString('zh-CN')
}

// 子文件夹相关函数
const getStudentSubfolders = (group: any) => {
  const sid = String(group?.studentId || '').trim()
  const sname = String(group?.studentName || '').trim()

  return mediaStore.folders.filter((f: any) => {
    if (f.parentId) return false
    const fidStudentId = String(f.studentId || '').trim()
    const fidStudentName = String(f.studentName || '').trim()

    // 优先按 studentId 精确匹配；若任一侧缺失或历史不一致，则回退按 studentName 匹配
    if (sid && fidStudentId && sid === fidStudentId) return true
    if (sname && fidStudentName && sname === fidStudentName) return true
    return false
  })
}

const getStudentSubfolderCount = (group: any) => {
  return getStudentSubfolders(group).length
}

const getMediaFolderItemCount = (folderId: string): number => {
  const fid = folderId == null ? '' : String(folderId)
  const itemsCount = mediaStore.items.filter(i => {
    const itemFid = (i as any).folderId ?? (i as any).folder_id ?? ''
    return String(itemFid) === fid
  }).length
  const subfolders = mediaStore.folders.filter(f => String(f.parentId || '') === fid).length
  return itemsCount + subfolders
}

const getRootFolderItems = (group: any): MediaItem[] => {
  // 返回没有 folderId 或 folder_id 的项目（根目录）
  return group.items.filter((item: MediaItem) => {
    const itemFid = (item as any).folderId ?? (item as any).folder_id ?? null
    return !itemFid
  })
}

const openNewSubfolderDialog = (group: any) => {
  currentStudentForSubfolder.value = {
    studentId: group.studentId,
    studentName: group.studentName
  }
  newSubfolderName.value = ''
  showNewSubfolderDialog.value = true
}

const closeNewSubfolderDialog = () => {
  showNewSubfolderDialog.value = false
  newSubfolderName.value = ''
  currentStudentForSubfolder.value = null
}

const createSubfolder = () => {
  if (!newSubfolderName.value.trim() || !currentStudentForSubfolder.value) return
  
  const newFolder: MediaFolder = {
    id: `media_folder_${Date.now()}`,
    name: newSubfolderName.value.trim(),
    parentId: null,
    path: newSubfolderName.value.trim(),
    createdAt: new Date().toISOString(),
    studentId: currentStudentForSubfolder.value.studentId,
    studentName: currentStudentForSubfolder.value.studentName,
    itemCount: 0
  }
  
  mediaStore.addFolder(newFolder)
  closeNewSubfolderDialog()
}

const closeSubfolderDetail = () => {
  showSubfolderDetailDialog.value = false
  showSubfolderView.value = false // 同时关闭内联视图
  selectedSubfolder.value = null
  selectedSubfolderStudent.value = null
  subfolderBreadcrumbs.value = []
  clearSelection()
}

const getSubfolderItems = (folderId: string): MediaItem[] => {
  const fid = folderId == null ? '' : String(folderId)
  return mediaStore.items.filter(item => {
    const itemFid = (item as any).folderId ?? (item as any).folder_id ?? ''
    return String(itemFid) === fid
  })
}

// ========== 拖拽移动相关函数 ==========
const handleMediaDragStart = (event: DragEvent, item: MediaItem) => {
  draggingMediaItem.value = item
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', item.id)
  }
}

const handleMediaDragEnd = () => {
  draggingMediaItem.value = null
  dragOverFolderId.value = null
}

const handleFolderDragOver = (folderId: string) => {
  if (draggingMediaItem.value) {
    dragOverFolderId.value = folderId
  }
}

const handleFolderDragLeave = () => {
  dragOverFolderId.value = null
}

const handleDropToFolder = async (event: DragEvent, folder: MediaFolder, group: any) => {
  event.preventDefault()
  dragOverFolderId.value = null
  
  // 如果是拖拽媒体项目
  if (draggingMediaItem.value) {
    const item = draggingMediaItem.value
    // 移动到目标文件夹
    await moveMediaToFolder(item, folder.id)
    draggingMediaItem.value = null
    return
  }
  
  // 如果是拖拽文件上传
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    await uploadFilesToFolder(files, folder.id, group.studentId, group.studentName)
  }
}

const moveMediaToFolder = async (item: MediaItem, targetFolderId: string | null) => {
  // 更新数据库中的 folder_id
  const result = await updateMediaFolderId(item.id, targetFolderId)
  
  if (!result.success) {
    console.error('更新数据库失败:', result.error)
    alert('移动文件失败，请重试')
    return
  }
  
  // 更新媒体项的 folderId
  const updatedItem = { ...item, folderId: targetFolderId || undefined }
  
  // 更新store中的项目
  const index = mediaStore.items.findIndex(i => i.id === item.id)
  if (index !== -1) {
    mediaStore.items[index] = updatedItem
  }
  
  // 保存到本地存储
  try {
    localStorage.setItem('mediaItems', JSON.stringify(mediaStore.items))
  } catch (e) {
    console.error('保存媒体项失败:', e)
  }
}

const uploadFilesToFolder = async (files: FileList, folderId: string, studentId: string, studentName: string) => {
  const validFiles: File[] = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/')) {
      validFiles.push(file)
    }
  }
  
  if (validFiles.length === 0) {
    alert('请选择图片、视频或音频文件')
    return
  }
  
  subfolderUploadProgress.value = 0
  
  try {
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i]
      const result = await uploadMediaFile(file, {
        studentName,
        studentId: studentId || '',
        description: ''
      }, {
        onProgress: (progress) => {
          subfolderUploadProgress.value = Math.round(((i + progress.percent / 100) / validFiles.length) * 100)
        }
      })
      
      if (result.success && result.data) {
        // 更新数据库中的 folder_id
        if (folderId) {
          await updateMediaFolderId(result.data.id, folderId)
        }
        
        const mediaItem = { ...result.data, folderId }
        await mediaStore.addMediaItem(mediaItem)
      } else {
        console.error('上传失败:', result.error)
        alert(`文件 ${file.name} 上传失败: ${result.error}`)
      }
      
      subfolderUploadProgress.value = Math.max(subfolderUploadProgress.value, Math.round(((i + 1) / validFiles.length) * 100))
    }
    
    setTimeout(() => {
      subfolderUploadProgress.value = 0
    }, 1000)
    
  } catch (error) {
    console.error('上传失败:', error)
    alert('上传过程中发生错误')
    subfolderUploadProgress.value = 0
  }
}

// ========== 移动对话框相关函数 ==========
const openMoveDialog = (item: MediaItem, group: any) => {
  movingItem.value = item
  movingItemStudent.value = {
    studentId: group.studentId,
    studentName: group.studentName
  }
  selectedMoveTarget.value = item.folderId || null
  showMoveDialog.value = true
}

const openMoveDialogFromSubfolder = (item: MediaItem) => {
  movingItem.value = item
  movingItemStudent.value = selectedSubfolderStudent.value
  selectedMoveTarget.value = item.folderId || null
  showMoveDialog.value = true
}

const closeMoveDialog = () => {
  showMoveDialog.value = false
  movingItem.value = null
  movingItemStudent.value = null
  selectedMoveTarget.value = null
}

const confirmMove = async () => {
  if (!movingItem.value) return
  
  await moveMediaToFolder(movingItem.value, selectedMoveTarget.value)
  closeMoveDialog()
}

const getAvailableMoveTargets = (): (MediaFolder | { id: null; name: string })[] => {
  if (!movingItemStudent.value) return []
  
  const studentFolders = mediaStore.folders.filter(f => 
    f.studentId === movingItemStudent.value!.studentId && !f.parentId
  )
  
  // 添加根目录选项
  return [
    { id: null, name: '📁 根目录 (不在任何文件夹中)' },
    ...studentFolders
  ]
}

// ========== 子文件夹上传相关函数 ==========
const triggerSubfolderUpload = () => {
  subfolderFileInput.value?.click()
}

const handleSubfolderFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0 || !selectedSubfolder.value || !selectedSubfolderStudent.value) return
  
  await uploadFilesToFolder(
    files, 
    selectedSubfolder.value.id, 
    selectedSubfolderStudent.value.studentId, 
    selectedSubfolderStudent.value.studentName
  )
  
  // 清空input
  input.value = ''
}

const handleSubfolderDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDraggingInSubfolder.value = true
}

const handleSubfolderDragLeave = () => {
  isDraggingInSubfolder.value = false
}

const handleSubfolderDrop = async (event: DragEvent) => {
  event.preventDefault()
  isDraggingInSubfolder.value = false
  
  const files = event.dataTransfer?.files
  if (!files || files.length === 0 || !selectedSubfolder.value || !selectedSubfolderStudent.value) return
  
  await uploadFilesToFolder(
    files, 
    selectedSubfolder.value.id, 
    selectedSubfolderStudent.value.studentId, 
    selectedSubfolderStudent.value.studentName
  )
}

const deleteMediaFromSubfolder = async (mediaId: string) => {
  if (!confirm('确定要删除这个文件吗？\n\n文件将移到回收站，30天后自动删除。')) return
  const success = await mediaStore.removeMediaItem(mediaId)
  if (success) {
    alert('✅ 已删除，文件已移至回收站')
  } else {
    alert('❌ 删除失败，请检查网络连接后重试')
  }
}

// ========== 多选相关函数 ==========
const toggleSelectItem = (itemId: string) => {
  const index = selectedItems.value.indexOf(itemId)
  if (index === -1) {
    selectedItems.value.push(itemId)
  } else {
    selectedItems.value.splice(index, 1)
  }
  // 更新最后选中的索引
  const allItems = selectedSubfolder.value 
    ? getSubfolderItems(selectedSubfolder.value.id)
    : mediaStore.items.filter(i => !i.folderId)
  lastSelectedIndex.value = allItems.findIndex(i => i.id === itemId)
}

const shiftSelectItem = (itemId: string) => {
  const allItems = selectedSubfolder.value 
    ? getSubfolderItems(selectedSubfolder.value.id)
    : mediaStore.items.filter(i => !i.folderId)
  
  const currentIndex = allItems.findIndex(i => i.id === itemId)
  
  if (lastSelectedIndex.value === -1) {
    toggleSelectItem(itemId)
    return
  }
  
  const start = Math.min(lastSelectedIndex.value, currentIndex)
  const end = Math.max(lastSelectedIndex.value, currentIndex)
  
  for (let i = start; i <= end; i++) {
    if (!selectedItems.value.includes(allItems[i].id)) {
      selectedItems.value.push(allItems[i].id)
    }
  }
}

const deleteSelectedItems = async () => {
  if (selectedItems.value.length === 0) return
  if (!confirm(`确定要删除选中的 ${selectedItems.value.length} 个文件吗？\n\n文件将移到回收站，30天后自动删除。`)) return
  
  const total = selectedItems.value.length
  let successCount = 0
  for (const id of [...selectedItems.value]) {
    const ok = await mediaStore.removeMediaItem(id)
    if (ok) successCount++
  }
  selectedItems.value = []
  if (successCount === total) {
    alert(`✅ 已删除 ${total} 个文件，已移至回收站`)
  } else {
    alert(`删除完成：${successCount}/${total} 成功，${total - successCount} 个失败`)
  }
}

const clearSelection = () => {
  selectedItems.value = []
  lastSelectedIndex.value = -1
}

// 全选指定学生文件夹的根目录照片
const selectAllInGroup = (group: any) => {
  const rootItems = getRootFolderItems(group)
  selectedItems.value = rootItems.map(item => item.id)
}

// 检查指定学生文件夹中是否有选中的项目
const hasSelectedInGroup = (group: any) => {
  const rootItems = getRootFolderItems(group)
  return rootItems.some(item => selectedItems.value.includes(item.id))
}

// 删除指定学生文件夹中选中的项目
const deleteSelectedInGroup = async (group: any) => {
  const rootItems = getRootFolderItems(group)
  const toDelete = rootItems.filter(item => selectedItems.value.includes(item.id))
  
  if (toDelete.length === 0) return
  if (!confirm(`确定要删除选中的 ${toDelete.length} 个文件吗？\n\n文件将移到回收站，30天后自动删除。`)) return
  
  const total = toDelete.length
  let successCount = 0
  for (const item of toDelete) {
    const ok = await mediaStore.removeMediaItem(item.id)
    if (ok) successCount++
  }
  clearSelection()
  if (successCount === total) {
    alert(`✅ 已删除 ${total} 个文件，已移至回收站`)
  } else {
    alert(`删除完成：${successCount}/${total} 成功，${total - successCount} 个失败`)
  }
}

// 批量移动相关
const showBatchMoveDialog = ref(false)
const batchMoveStudentId = ref<string | null>(null)
const batchMoveStudentOptions = ref<{ studentId: string; studentName: string }[]>([])

const openBatchMoveDialog = (group?: any) => {
  if (selectedItems.value.length === 0) return
  
  // 从选中的项目中获取所有学生ID
  const selectedStudentMap = new Map<string, string>()
  selectedItems.value.forEach(id => {
    const item = mediaStore.items.find(i => i.id === id)
    if (item && item.studentId) {
      selectedStudentMap.set(item.studentId, item.studentName || item.studentId)
    }
  })
  
  batchMoveStudentOptions.value = Array.from(selectedStudentMap.entries()).map(([id, name]) => ({
    studentId: id,
    studentName: name
  }))
  
  // 优先使用传入的group，然后是当前子文件夹学生，最后是选中项目的学生
  batchMoveStudentId.value = group?.studentId || 
    selectedSubfolderStudent.value?.studentId || 
    (batchMoveStudentOptions.value.length === 1 ? batchMoveStudentOptions.value[0].studentId : null)
  
  selectedMoveTarget.value = null
  showBatchMoveDialog.value = true
}

const getBatchMoveTargets = () => {
  // 递归获取所有子文件夹的辅助函数
  const getAllFoldersRecursive = (folders: MediaFolder[], parentId: string | null, prefix: string): { id: string; name: string }[] => {
    const result: { id: string; name: string }[] = []
    const children = folders.filter(f => f.parentId === parentId)
    
    children.forEach(folder => {
      const folderName = prefix ? `${prefix} / ${folder.name}` : folder.name
      result.push({ id: folder.id, name: `📂 ${folderName}` })
      // 递归获取子文件夹
      const subFolders = getAllFoldersRecursive(folders, folder.id, folderName)
      result.push(...subFolders)
    })
    
    return result
  }

  // 获取 localStorage 中的空学生文件夹
  const getLocalStorageStudents = (): Array<{ studentId: string; studentName: string }> => {
    try {
      const savedFolders = localStorage.getItem('photoStudentFolders')
      if (savedFolders) {
        return JSON.parse(savedFolders)
      }
    } catch (e) {
      console.error('Failed to load photo student folders from localStorage:', e)
    }
    return []
  }

  // 合并 mediaStore 中的学生和 localStorage 中的学生
  const allStudents = new Map<string, string>()
  
  // 从 mediaStore.folders 获取学生
  mediaStore.folders.forEach(folder => {
    if (folder.studentId && folder.studentName) {
      allStudents.set(folder.studentId, folder.studentName)
    }
  })
  
  // 从 mediaStore.groupedByStudent 获取学生
  mediaStore.groupedByStudent.forEach(group => {
    if (group.studentId && group.studentName) {
      allStudents.set(group.studentId, group.studentName)
    }
  })
  
  // 从 localStorage 获取学生
  getLocalStorageStudents().forEach(s => {
    if (s.studentId && s.studentName) {
      allStudents.set(s.studentId, s.studentName)
    }
  })

  // 如果没有选中特定学生，返回所有学生的文件夹
  if (!batchMoveStudentId.value) {
    const result: { id: string; name: string }[] = [
      { id: 'root', name: '📁 根目录 (不在任何文件夹中)' }
    ]
    
    allStudents.forEach((studentName, studentId) => {
      // 获取该学生的所有文件夹
      const studentFolders = mediaStore.folders.filter(f => f.studentId === studentId)
      
      if (studentFolders.length > 0) {
        const rootFolders = studentFolders.filter(f => !f.parentId)
        rootFolders.forEach(folder => {
          result.push({ id: folder.id, name: `📂 ${studentName} / ${folder.name}` })
          const subFolders = getAllFoldersRecursive(studentFolders, folder.id, `${studentName} / ${folder.name}`)
          result.push(...subFolders)
        })
      }
    })

    // 兼容性：如果上面没有包含某些独立存在的根文件夹（例如 localStorage 中未记录学生），
    // 也把 mediaStore 中所有没有 parentId 的文件夹加入目标列表。
    mediaStore.folders
      .filter(f => !f.parentId)
      .forEach(folder => {
        if (!result.some(r => r.id === folder.id)) {
          const displayName = folder.studentName ? `${folder.studentName} / ${folder.name}` : folder.name
          result.push({ id: folder.id, name: `📂 ${displayName}` })
        }
      })

    return result
  }
  
  // 获取特定学生的所有文件夹（包括嵌套的）
  const studentFolders = mediaStore.folders.filter(f => 
    f.studentId === batchMoveStudentId.value
  )
  
  const result: { id: string; name: string }[] = [
    { id: 'root', name: '📁 根目录 (不在任何文件夹中)' }
  ]
  
  // 获取根文件夹
  const rootFolders = studentFolders.filter(f => !f.parentId)
  rootFolders.forEach(folder => {
    result.push({ id: folder.id, name: `📂 ${folder.name}` })
    // 递归获取子文件夹
    const subFolders = getAllFoldersRecursive(studentFolders, folder.id, folder.name)
    result.push(...subFolders)
  })
  
  return result
}

const confirmBatchMove = async () => {
  if (!selectedMoveTarget.value || selectedItems.value.length === 0) return
  
  const targetFolderId = selectedMoveTarget.value === 'root' ? null : selectedMoveTarget.value
  
  for (const id of selectedItems.value) {
    const item = mediaStore.items.find(i => i.id === id)
    if (item) {
      await moveMediaToFolder(item, targetFolderId)
    }
  }
  
  clearSelection()
  showBatchMoveDialog.value = false
}

// ========== 文件夹批量移动相关 ==========
const toggleSelectFolder = (folderId: string) => {
  const idx = selectedFolders.value.indexOf(folderId)
  if (idx === -1) selectedFolders.value.push(folderId)
  else selectedFolders.value.splice(idx, 1)
}

const clearSelectedFolders = () => {
  selectedFolders.value = []
}

const openFolderBatchMoveDialog = () => {
  if (selectedFolders.value.length === 0) return
  selectedFolderMoveTarget.value = null
  showFolderBatchMoveDialog.value = true
}

const confirmFolderBatchMove = async () => {
  if (!selectedFolderMoveTarget.value) return
  const targetFolderId = selectedFolderMoveTarget.value === 'root' ? null : selectedFolderMoveTarget.value
  for (const fid of selectedFolders.value) {
    try {
      if (typeof (mediaStore as any).moveFolder === 'function') {
        ;(mediaStore as any).moveFolder(fid, targetFolderId)
      } else {
        // Fallback: perform move locally if store action isn't available (HMR edge-case)
        const folder = mediaStore.folders.find(f => f.id === fid)
        if (!folder) continue
        const oldPath = folder.path
        folder.parentId = targetFolderId
        const parentPath = targetFolderId ? (mediaStore.folders.find(f => f.id === targetFolderId)?.path || '') : ''
        folder.path = parentPath ? `${parentPath}/${folder.name}` : `/${folder.name}`
        // update children paths
        mediaStore.updateChildPaths(fid, oldPath, folder.path)
        mediaStore.saveFoldersToLocal()
      }
    } catch (e) {
      console.error('移动文件夹失败:', e)
    }
  }
  clearSelectedFolders()
  showFolderBatchMoveDialog.value = false
}

// 批量下载功能
const downloadSelectedItems = async () => {
  if (selectedItems.value.length === 0) return
  
  const itemsToDownload = mediaStore.items.filter(item => selectedItems.value.includes(item.id))
  
  for (const item of itemsToDownload) {
    try {
      const response = await fetch(item.url)
      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = item.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
      // 添加小延迟避免浏览器阻止多个下载
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (error) {
      console.error('下载失败:', item.fileName, error)
    }
  }
}

// ========== 嵌套子文件夹相关函数 ==========
const getNestedSubfolders = (parentId: string): MediaFolder[] => {
  return mediaStore.folders.filter(f => f.parentId === parentId)
}

const handleFolderDragStart = (event: DragEvent, folder: MediaFolder) => {
  draggingFolder.value = folder
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', folder.id)
  }
}

const handleFolderDragEnd = () => {
  draggingFolder.value = null
  dragOverFolderId.value = null
}

const openNestedSubfolderDialog = () => {
  nestedSubfolderName.value = ''
  showNestedSubfolderDialog.value = true
}

const createNestedSubfolder = () => {
  if (!nestedSubfolderName.value.trim() || !selectedSubfolder.value || !selectedSubfolderStudent.value) return
  
  const newFolder: MediaFolder = {
    id: `media_folder_${Date.now()}`,
    name: nestedSubfolderName.value.trim(),
    parentId: selectedSubfolder.value.id,
    path: `${selectedSubfolder.value.path}/${nestedSubfolderName.value.trim()}`,
    createdAt: new Date().toISOString(),
    studentId: selectedSubfolderStudent.value.studentId,
    studentName: selectedSubfolderStudent.value.studentName,
    itemCount: 0
  }
  
  mediaStore.addFolder(newFolder)
  showNestedSubfolderDialog.value = false
  nestedSubfolderName.value = ''
}

const navigateToFolder = (folder: MediaFolder | null) => {
  if (!folder) {
    // 返回根目录
    closeSubfolderDetail()
    return
  }
  
  // 更新面包屑
  const breadcrumbIndex = subfolderBreadcrumbs.value.findIndex(f => f.id === folder.id)
  if (breadcrumbIndex !== -1) {
    // 点击面包屑中的某个项，截取到该位置
    subfolderBreadcrumbs.value = subfolderBreadcrumbs.value.slice(0, breadcrumbIndex + 1)
  } else {
    // 进入新文件夹，添加到面包屑
    subfolderBreadcrumbs.value.push(folder)
  }
  
  selectedSubfolder.value = folder
  clearSelection()
}

const handleNestedFolderDrop = async (event: DragEvent, folder: MediaFolder) => {
  event.preventDefault()
  dragOverFolderId.value = null

  // 如果正在拖动媒体项
  if (draggingMediaItem.value) {
    await moveMediaToFolder(draggingMediaItem.value, folder.id)
    draggingMediaItem.value = null
    return
  }

  // 如果正在拖动文件夹
  if (draggingFolder.value) {
    const moved = mediaStore.moveFolder(draggingFolder.value.id, folder.id)
    if (!moved) {
      alert('移动失败：不能将文件夹移动到其自身或子文件夹')
    }
    draggingFolder.value = null
    return
  }
}

const deleteNestedFolder = (folder: MediaFolder) => {
  if (!confirm(`确定要删除文件夹 "${folder.name}" 及其所有内容吗？\n\n这些文件将移到回收站，30天后自动删除。`)) return
  
  // 递归删除子文件夹
  const deleteRecursive = (folderId: string) => {
    const subfolders = mediaStore.folders.filter(f => f.parentId === folderId)
    subfolders.forEach(sf => deleteRecursive(sf.id))
    
    // 删除文件夹中的媒体项（移入回收站）
    const items = mediaStore.items.filter(i => i.folderId === folderId)
    items.forEach(item => mediaStore.removeMediaItem(item.id))
    
    // 删除文件夹
    mediaStore.removeFolder(folderId)
  }
  
  deleteRecursive(folder.id)
  alert('✅ 文件夹已删除，文件已移至回收站')
}

// 删除学生根目录文件夹
const deleteStudentFolder = (group: any) => {
  if (!confirm(`确定要删除学生文件夹 "${group.studentName}" 及其所有内容吗？\n\n这些文件将移到回收站，30天后自动删除。`)) return
  
  try {
    // 删除该学生的所有子文件夹
    const studentFolders = mediaStore.folders.filter(f => f.studentId === group.studentId)
    studentFolders.forEach(folder => {
      // 递归删除子文件夹及其内容
      const deleteRecursive = (folderId: string) => {
        const subfolders = mediaStore.folders.filter(f => f.parentId === folderId)
        subfolders.forEach(sf => deleteRecursive(sf.id))
        
        const items = mediaStore.items.filter(i => i.folderId === folderId)
        items.forEach(item => mediaStore.removeMediaItem(item.id))
        
        mediaStore.removeFolder(folderId)
      }
      deleteRecursive(folder.id)
    })
    
    // 删除该学生根目录下的所有媒体项
    const rootItems = mediaStore.items.filter(i => i.studentId === group.studentId && !i.folderId)
    rootItems.forEach(item => mediaStore.removeMediaItem(item.id))
    
    // 从 localStorage 中移除照片库学生文件夹
    try {
      const savedFolders = localStorage.getItem('photoStudentFolders')
      if (savedFolders) {
        const folders = JSON.parse(savedFolders) as Array<{ studentId: string; studentName: string }>
        const updatedFolders = folders.filter(f => f.studentId !== group.studentId && f.studentName !== group.studentName)
        localStorage.setItem('photoStudentFolders', JSON.stringify(updatedFolders))
      }
    } catch (e) {
      console.error('Failed to remove photo student folder from localStorage:', e)
    }
    
    alert('✅ 已将学生文件夹移至回收站')
  } catch (error) {
    console.error('删除学生文件夹失败:', error)
    alert('删除失败，请重试')
  }
}

// ========== 回收站相关函数 ==========
const getDaysUntilExpire = (deletedAt: string): string => {
  const deleteDate = new Date(deletedAt)
  const expireDate = new Date(deleteDate.getTime() + 30 * 24 * 60 * 60 * 1000)
  const now = new Date()
  const daysLeft = Math.ceil((expireDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
  
  if (daysLeft <= 0) return '即将删除'
  if (daysLeft === 1) return '1 天后过期'
  return `${daysLeft} 天后过期`
}

const handleRestore = async (deleted: any) => {
  try {
    await mediaStore.restoreFromTrash(deleted.item.id)
    alert('✅ 已恢复文件')
  } catch (error) {
    console.error('恢复失败:', error)
    alert('恢复失败，请重试')
  }
}

const handlePermanentDelete = async (deleted: any) => {
  if (!confirm(`确定要彻底删除 "${deleted.item.fileName}" 吗？\n\n此操作不可恢复！`)) return
  
  try {
    await mediaStore.permanentlyDelete(deleted.item.id)
    alert('✅ 已彻底删除')
  } catch (error) {
    console.error('删除失败:', error)
    alert('删除失败，请重试')
  }
}

const handleEmptyTrash = async () => {
  if (!confirm(`确定要清空回收站吗？\n\n这将永久删除 ${mediaStore.deletedItems.length} 个文件，此操作不可恢复！`)) return
  
  try {
    await mediaStore.emptyTrash()
    alert('✅ 回收站已清空')
  } catch (error) {
    console.error('清空失败:', error)
    alert('清空失败，请重试')
  }
}

// ========== 文件夹右键菜单函数 ==========
const showFolderContextMenu = (folder: MediaFolder, event: MouseEvent) => {
  contextMenuFolder.value = folder
  folderMenuPosition.value = { x: event.clientX, y: event.clientY }
  showFolderMenu.value = true
  
  // 点击其他地方关闭菜单
  const closeMenu = () => {
    showFolderMenu.value = false
    document.removeEventListener('click', closeMenu)
  }
  setTimeout(() => document.addEventListener('click', closeMenu), 0)
}

const handleFolderMenuRename = () => {
  if (contextMenuFolder.value) {
    renameFolderInline(contextMenuFolder.value)
  }
  showFolderMenu.value = false
}

const handleFolderMenuDelete = () => {
  if (contextMenuFolder.value) {
    deleteNestedFolder(contextMenuFolder.value)
  }
  showFolderMenu.value = false
}

// ========== 重命名相关函数 ==========
const renameFolderInline = (folder: MediaFolder) => {
  renameType.value = 'folder'
  renamingItem.value = folder
  renameNewName.value = folder.name
  showRenameDialog.value = true
}

const renameMediaItem = (item: MediaItem) => {
  renameType.value = 'media'
  renamingItem.value = item
  // 去掉扩展名显示
  const lastDot = item.fileName.lastIndexOf('.')
  renameNewName.value = lastDot > 0 ? item.fileName.substring(0, lastDot) : item.fileName
  showRenameDialog.value = true
}

const closeRenameDialog = () => {
  showRenameDialog.value = false
  renamingItem.value = null
  renameNewName.value = ''
}

const confirmRename = () => {
  if (!renamingItem.value || !renameNewName.value.trim()) return
  
  if (renameType.value === 'folder') {
    const folder = renamingItem.value as MediaFolder
    mediaStore.renameFolder(folder.id, renameNewName.value.trim())
    
    // 如果是当前打开的文件夹，更新显示
    if (selectedSubfolder.value?.id === folder.id) {
      selectedSubfolder.value = { ...selectedSubfolder.value, name: renameNewName.value.trim() }
    }
  } else {
    const item = renamingItem.value as MediaItem
    // 保留原扩展名
    const lastDot = item.fileName.lastIndexOf('.')
    const ext = lastDot > 0 ? item.fileName.substring(lastDot) : ''
    const newFileName = renameNewName.value.trim() + ext
    
    // 更新store中的项目
    const index = mediaStore.items.findIndex(i => i.id === item.id)
    if (index !== -1) {
      mediaStore.items[index] = { ...mediaStore.items[index], fileName: newFileName }
      // 保存到本地存储
      try {
        localStorage.setItem('mediaItems', JSON.stringify(mediaStore.items))
      } catch (e) {
        console.error('保存媒体项失败:', e)
      }
    }
  }
  
  closeRenameDialog()
}

// 更新 openSubfolderDetail 以初始化面包屑
const openSubfolderDetailOriginal = (folder: MediaFolder, group: any) => {
  selectedSubfolder.value = folder
  selectedSubfolderStudent.value = {
    studentId: group.studentId,
    studentName: group.studentName
  }
  subfolderBreadcrumbs.value = [folder]
  clearSelection()
  showSubfolderView.value = true // 改为显示内联视图
  showSubfolderDetailDialog.value = true
}

// 覆盖原来的函数
const openSubfolderDetail = openSubfolderDetailOriginal

// 返回上一级
const goBackFromSubfolder = () => {
  if (subfolderBreadcrumbs.value.length > 1) {
    // 返回上一级子文件夹
    subfolderBreadcrumbs.value.pop()
    selectedSubfolder.value = subfolderBreadcrumbs.value[subfolderBreadcrumbs.value.length - 1]
  } else {
    // 返回主视图
    goBackToRoot()
  }
  clearSelection()
}

// 返回主视图
const goBackToRoot = () => {
  showSubfolderView.value = false
  selectedSubfolder.value = null
  selectedSubfolderStudent.value = null
  subfolderBreadcrumbs.value = []
  clearSelection()
}

// 全选当前子文件夹内的项目
const selectAllInSubfolder = () => {
  if (!selectedSubfolder.value) return
  const items = getSubfolderItems(selectedSubfolder.value.id)
  selectedItems.value = items.map(item => item.id)
}
</script>

<style scoped>
.media-gallery {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 20px;
}

.header-left h2 {
  margin: 0 0 10px 0;
  font-size: 28px;
  color: #333;
}

.stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
}

.stat-icon {
  font-size: 16px;
}

.group-toggle-btn {
  padding: 8px 16px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.group-toggle-btn:hover {
  border-color: #42b983;
  background: #f0fdf7;
}

.group-toggle-btn.active {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.student-groups {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.student-group {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s;
  position: relative;
}

.student-group.drag-over {
  border: 3px dashed #42b983;
  background: #f0fdf7;
  box-shadow: 0 4px 16px rgba(66, 185, 131, 0.2);
}

.drop-zone-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(66, 185, 131, 0.1);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  z-index: 10;
  pointer-events: none;
}

.drop-zone-content {
  background: white;
  padding: 24px 48px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #42b983;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.upload-progress-bar {
  position: relative;
  height: 32px;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #42b983, #35a372);
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #333;
  font-size: 13px;
  font-weight: 600;
  z-index: 1;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.group-title h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.group-student-id {
  padding: 4px 12px;
  background: #f0f0f0;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
}

.new-subfolder-btn {
  padding: 4px 10px;
  background: #fefce8;
  border: 1px solid #fde047;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.new-subfolder-btn:hover {
  background: #fef9c3;
}

/* 子文件夹行 */
.subfolders-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
  padding: 10px 0;
  border-bottom: 1px dashed #e0e0e0;
}

.subfolder-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #fefce8;
  border: 1px solid #fde047;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
}

.subfolder-chip:hover {
  background: #fef9c3;
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(253, 224, 71, 0.3);
}

.subfolder-icon {
  font-size: 16px;
}

.subfolder-name {
  color: #333;
  font-weight: 500;
}

.subfolder-count {
  color: #6b7280;
  font-size: 12px;
}

/* 子文件夹详情模态框 */
.subfolder-detail-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 900px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.subfolder-detail-modal .modal-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.subfolder-detail-modal .modal-header h3 {
  margin: 0;
  font-size: 20px;
}

.subfolder-path {
  flex: 1;
  font-size: 13px;
  color: #6b7280;
}

.subfolder-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.subfolder-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.empty-subfolder {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.empty-subfolder .empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.edit-folder-btn {
  padding: 6px 10px;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-folder-btn:hover {
  background: #f0f0f0;
  border-color: #42b983;
  color: #42b983;
  transform: scale(1.05);
}

.group-stats {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
}

.group-stat {
  padding: 6px 12px;
  background: #f8f8f8;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
}

.group-select-btn {
  padding: 6px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.group-select-btn:hover {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.group-select-btn.danger {
  background: #ff4444;
  color: white;
  border-color: #ff4444;
}

.group-select-btn.danger:hover {
  background: #cc0000;
}

.group-select-btn.primary {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.group-select-btn.primary:hover {
  background: #369870;
}

.group-select-btn.secondary {
  background: #f5f5f5;
  color: #666;
}

.group-select-btn.secondary:hover {
  background: #e0e0e0;
}

.group-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.stat-icon {
  font-size: 18px;
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.view-toggle {
  display: flex;
  gap: 5px;
  background: #f5f5f5;
  padding: 4px;
  border-radius: 8px;
}

.view-btn {
  padding: 8px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  font-size: 16px;
  transition: all 0.2s;
}

.view-btn:hover {
  background: #e0e0e0;
}

.view-btn.active {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #f5f5f5;
}

.filter-btn.active {
  background: #4B6EF5;
  color: white;
  border-color: #4B6EF5;
}

.search-bar {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #4B6EF5;
}

/* 网格视图 */
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.media-card {
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.media-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.media-thumbnail {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f5f5;
  cursor: pointer;
}

.media-thumbnail:hover {
  opacity: 0.9;
}

.media-thumbnail img,
.media-thumbnail video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eef2ff 0%, #e2e8f0 100%);
}

.video-thumb-icon {
  font-size: 34px;
  opacity: 0.9;
}

.media-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
}

.media-type-badge {
  background: rgba(0,0,0,0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 14px;
}

.media-info {
  padding: 12px;
}

.media-filename {
  margin: 0 0 6px 0;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-meta {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #999;
}

.media-student {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.delete-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255,255,255,0.9);
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  opacity: 0;
  transition: opacity 0.2s, background 0.2s;
}

.media-card:hover .delete-btn,
.media-list-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: #ff4444;
}

/* 列表视图 */
.media-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.media-list-item {
  position: relative;
  display: flex;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.media-list-item:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.list-thumbnail {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  flex-shrink: 0;
}

.list-thumbnail img,
.list-thumbnail video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.list-info {
  flex: 1;
}

.list-filename {
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.list-meta {
  margin: 0 0 6px 0;
  font-size: 13px;
  color: #999;
  display: flex;
  gap: 8px;
}

.list-student {
  margin: 0 0 6px 0;
  font-size: 14px;
  color: #666;
}

.list-description {
  margin: 0;
  font-size: 13px;
  color: #888;
  line-height: 1.5;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state p {
  margin: 10px 0;
  font-size: 16px;
}

.empty-hint {
  font-size: 14px !important;
  color: #bbb !important;
}

/* 预览模态框 */
.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.preview-content {
  position: relative;
  background: white;
  border-radius: 16px;
  max-width: 1000px;
  max-height: 90vh;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(0,0,0,0.7);
}

.preview-media {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  width: 100%;
  max-height: 60vh;
}

.preview-media.video-original-mode {
  overflow: hidden;
  max-height: 78vh;
  height: min(78vh, 760px);
  justify-content: center;
  align-items: center;
}

.preview-media img,
.preview-media video {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
}

.preview-media.video-original-mode video {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.video-progress-wrap {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  margin-top: -6px;
}

.video-progress-slider {
  width: 100%;
  cursor: pointer;
}

.video-time {
  font-size: 12px;
  color: #6b7280;
  min-width: 38px;
  text-align: center;
}

.video-size-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: -6px;
}

.size-toggle-btn {
  border: 1px solid #cdd7f1;
  background: #fff;
  color: #334155;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
}

.size-toggle-btn:hover {
  border-color: #7c9cff;
  color: #1f3fa3;
}

.video-size-hint {
  font-size: 12px;
  color: #6b7280;
}

/* 翻页按钮 */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.nav-btn:hover {
  background: rgba(66, 185, 131, 0.9);
  transform: translateY(-50%) scale(1.1);
}

.nav-btn-left {
  left: 20px;
}

.nav-btn-right {
  right: 20px;
}

/* 图片计数 */
.image-counter {
  position: absolute;
  top: 20px;
  right: 60px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.preview-details h3 {
  margin: 0 0 16px 0;
  font-size: 20px;
  color: #333;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.detail-label {
  font-weight: 600;
  color: #666;
}

.description {
  margin-bottom: 16px;
}

.description p {
  margin: 8px 0 0 0;
  color: #666;
  line-height: 1.6;
}

.tags {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-block;
  padding: 4px 12px;
  background: #f0f0f0;
  border-radius: 16px;
  font-size: 13px;
  color: #666;
}

/* 预览操作按钮 */
.preview-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.preview-action-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.preview-action-btn.download {
  background: linear-gradient(135deg, #42b983, #35a372);
  color: white;
}

.preview-action-btn.download:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.4);
}

.preview-action-btn.delete {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.preview-action-btn.delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
}

/* 新建学生按钮 */
.new-student-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #42b983, #35a372);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.3);
}

.new-student-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.4);
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.form-hint {
  background: #f0fdf7;
  border-left: 4px solid #42b983;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
  margin-top: 16px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
}

.cancel-btn,
.confirm-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.confirm-btn {
  background: linear-gradient(135deg, #42b983, #35a372);
  color: white;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.3);
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.4);
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .gallery-header {
    flex-direction: column;
  }
  
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
  
  .media-thumbnail {
    height: 150px;
  }
}

/* ========== 拖拽移动相关样式 ========== */
.media-card[draggable="true"] {
  cursor: grab;
}

.media-card[draggable="true"]:active {
  cursor: grabbing;
}

.media-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 5;
}

.media-card:hover .media-actions {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  min-width: 28px;
  flex-shrink: 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
}

.rename-btn {
  background: rgba(52, 152, 219, 0.9);
  color: white;
}

.rename-btn:hover {
  background: rgba(52, 152, 219, 1);
  transform: scale(1.1);
}

.move-btn {
  background: rgba(66, 185, 131, 0.9);
  color: white;
}

.move-btn:hover {
  background: rgba(66, 185, 131, 1);
  transform: scale(1.1);
}

.media-actions .delete-btn {
  background: rgba(231, 76, 60, 0.9);
  color: white;
  position: static;
  padding: 0;
  opacity: 1;
}

.media-actions .delete-btn:hover {
  background: rgba(231, 76, 60, 1);
  transform: scale(1.1);
}

/* 文件夹拖放目标 */
.subfolder-chip.drop-target {
  background: linear-gradient(135deg, #42b983, #35a372) !important;
  color: white !important;
  transform: scale(1.08);
  box-shadow: 0 4px 16px rgba(66, 185, 131, 0.4);
}

.subfolder-drop-hint {
  font-size: 10px;
  opacity: 0.9;
  margin-top: 2px;
}

/* ========== 子文件夹详情弹窗上传区域 ========== */
.subfolder-upload-area {
  margin-bottom: 20px;
}

.upload-btn-small {
  padding: 8px 16px;
  background: linear-gradient(135deg, #42b983, #35a372);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;
}

.upload-btn-small:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.4);
}

.subfolder-drop-zone {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  color: #999;
  transition: all 0.3s;
}

.subfolder-drop-zone.drag-over {
  border-color: #42b983;
  background: #f0fdf7;
  color: #42b983;
}

.subfolder-drop-zone p {
  margin: 0;
}

.subfolder-upload-progress {
  margin-top: 12px;
}

.subfolder-upload-progress .progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.subfolder-upload-progress .progress-bar .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #42b983, #35a372);
  transition: width 0.3s;
}

.subfolder-upload-progress .progress-text {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  text-align: center;
}

/* 子文件夹媒体项 */
.subfolder-media-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
}

.subfolder-media-item img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.subfolder-media-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.subfolder-media-item:hover .subfolder-media-actions {
  opacity: 1;
}

.subfolder-media-actions .action-btn {
  width: 24px;
  height: 24px;
  font-size: 12px;
}

/* ========== 移动对话框样式 ========== */
.move-dialog .modal-content {
  max-width: 500px;
}

.move-hint {
  margin-bottom: 16px;
  font-size: 14px;
  color: #666;
}

.student-selector {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.student-selector label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.student-select {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.student-select:focus {
  outline: none;
  border-color: #42b983;
}

.folder-options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
  padding: 4px;
}

.folder-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.folder-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.folder-option:hover {
  border-color: #42b983;
  background: #f0fdf7;
}

.folder-option.selected {
  border-color: #42b983;
  background: linear-gradient(135deg, rgba(66, 185, 131, 0.1), rgba(53, 163, 114, 0.1));
}

.folder-option-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.no-targets-hint {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}

.folder-option input[type="radio"] {
  accent-color: #42b983;
}

.folder-option .folder-name {
  flex: 1;
  font-size: 14px;
}

/* 空状态 */
.subfolder-empty {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.subfolder-empty p {
  margin: 0;
}

.subfolder-media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

/* ========== 多选相关样式 ========== */
.media-card.selected {
  border: 3px solid #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.2);
}

.select-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 5;
  opacity: 0;
  transition: opacity 0.2s;
}

.media-card:hover .select-checkbox,
.media-card.selected .select-checkbox {
  opacity: 1;
}

.select-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #42b983;
}

/* ========== 嵌套子文件夹样式 ========== */
.header-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rename-btn-small {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.rename-btn-small:hover {
  background: rgba(66, 185, 131, 0.1);
}

.subfolder-breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.breadcrumb-item {
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s;
}

.breadcrumb-item:hover {
  background: #f0f0f0;
  color: #42b983;
}

.breadcrumb-item.active {
  font-weight: 600;
  color: #42b983;
}

.breadcrumb-sep {
  color: #999;
}

.action-btn-small {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn-small:hover {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.action-btn-small.danger:hover {
  background: #ff4444;
  border-color: #ff4444;
}

.nested-subfolders {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.nested-folder-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 140px;
}

.nested-folder-card:hover {
  border-color: #42b983;
  background: #f0fdf7;
}

.nested-folder-card.drop-target {
  background: linear-gradient(135deg, #42b983, #35a372);
  color: white;
  border-color: #42b983;
}

.nested-folder-card .folder-icon {
  font-size: 20px;
}

.nested-folder-card .folder-name {
  flex: 1;
  font-weight: 500;
}

.nested-folder-card .folder-count {
  font-size: 12px;
  color: #999;
}

.nested-folder-card .folder-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.nested-folder-card:hover .folder-actions {
  opacity: 1;
}

.mini-btn {
  background: white;
  border: 1px solid #ddd;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.mini-btn:hover {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.mini-btn.danger:hover {
  background: #ff4444;
  border-color: #ff4444;
}

/* 重命名按钮 */
.action-btn.rename-btn {
  background: rgba(255, 193, 7, 0.9);
  color: white;
}

.action-btn.rename-btn:hover {
  background: rgba(255, 193, 7, 1);
}

.chip-rename-btn {
  background: none;
  border: none;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  opacity: 0;
  transition: all 0.2s;
  margin-left: 4px;
}

.chip-delete-btn {
  background: none;
  border: none;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  opacity: 0;
  transition: all 0.2s;
  margin-left: 2px;
}

.subfolder-chip:hover .chip-rename-btn,
.subfolder-chip:hover .chip-delete-btn {
  opacity: 1;
}

.chip-rename-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.chip-delete-btn:hover {
  background: rgba(255, 100, 100, 0.3);
}

/* ========== 子文件夹内联视图样式 ========== */
.subfolder-view {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.subfolder-view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-bottom: 1px solid #e0e0e0;
  flex-wrap: wrap;
  gap: 12px;
}

.subfolder-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f5f5f5;
  border-color: #42b983;
  color: #42b983;
}

.subfolder-breadcrumb-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #666;
}

.subfolder-breadcrumb-inline .breadcrumb-item {
  color: #666;
}

.subfolder-breadcrumb-inline .breadcrumb-item.clickable {
  cursor: pointer;
  color: #42b983;
}

.subfolder-breadcrumb-inline .breadcrumb-item.clickable:hover {
  text-decoration: underline;
}

.subfolder-breadcrumb-inline .breadcrumb-item.active {
  color: #333;
  font-weight: 600;
}

.subfolder-breadcrumb-inline .breadcrumb-sep {
  color: #999;
}

.rename-btn-inline {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.rename-btn-inline:hover {
  background: rgba(0, 0, 0, 0.05);
}

.subfolder-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.header-action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  transition: all 0.2s;
}

.header-action-btn:hover {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.header-action-btn.danger {
  background: #ff4444;
  color: white;
  border-color: #ff4444;
}

.header-action-btn.danger:hover {
  background: #cc0000;
}

.header-action-btn.primary {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.header-action-btn.primary:hover {
  background: #369870;
}

.header-action-btn.secondary {
  background: #f5f5f5;
  color: #666;
}

.header-action-btn.secondary:hover {
  background: #e0e0e0;
}

.subfolder-view-content {
  padding: 24px;
  min-height: 400px;
  position: relative;
}

.subfolder-view-content.drag-over {
  background: rgba(66, 185, 131, 0.05);
}

.nested-subfolders-section,
.media-items-section {
  margin-bottom: 24px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.nested-subfolders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.nested-folder-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #fefce8;
  border: 1px solid #fde047;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.nested-folder-card:hover {
  background: #fef9c3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(253, 224, 71, 0.3);
}

.nested-folder-card.drop-target {
  background: rgba(66, 185, 131, 0.1);
  border-color: #42b983;
}

.folder-icon-large {
  font-size: 32px;
}

.folder-info {
  flex: 1;
  min-width: 0;
}

.folder-info .folder-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.folder-info .folder-count {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.folder-actions-inline {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.nested-folder-card:hover .folder-actions-inline {
  opacity: 1;
}

.mini-action-btn {
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.mini-action-btn:hover {
  background: white;
  transform: scale(1.1);
}

/* 文件夹右键菜单 */
.folder-context-menu {
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 140px;
  z-index: 2000;
  animation: menuSlideIn 0.15s ease;
}

@keyframes menuSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background 0.15s;
  text-align: left;
}

.context-menu-item:hover {
  background: #f5f5f5;
}

.context-menu-item.danger {
  color: #e74c3c;
}

.context-menu-item.danger:hover {
  background: #fef2f2;
}

.menu-icon {
  font-size: 16px;
}

.mini-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.mini-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.mini-btn.danger {
  background: rgba(255, 68, 68, 0.1);
  color: #ff4444;
}

.mini-btn.danger:hover {
  background: #ff4444;
  color: white;
}

.media-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.empty-subfolder-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-subfolder-view .empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-subfolder-view p {
  margin: 0;
  font-size: 16px;
  color: #666;
}

.empty-subfolder-view .empty-hint {
  margin-top: 8px;
  font-size: 14px;
  color: #999;
}

/* ========== 回收站样式 ========== */
.trash-btn {
  padding: 8px 16px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.trash-btn:hover {
  background: #ee5a5a;
}

.trash-view {
  padding: 20px;
}

.trash-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.trash-header h2 {
  margin: 0;
  font-size: 20px;
}

.trash-count {
  color: #666;
  font-size: 14px;
}

.empty-trash-btn {
  margin-left: auto;
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.empty-trash-btn:hover {
  background: #c82333;
}

.trash-hint {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
}

.trash-hint p {
  margin: 0;
  color: #856404;
  font-size: 14px;
}

.trash-empty {
  padding: 60px 20px;
  text-align: center;
}

.trash-empty .empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.trash-empty p {
  color: #666;
  font-size: 16px;
}

.trash-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.trash-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border: 1px solid #eee;
}

.trash-thumbnail {
  position: relative;
  height: 160px;
  background: #f5f5f5;
  overflow: hidden;
}

.trash-thumbnail img,
.trash-thumbnail video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7;
}

.trash-thumbnail .video-thumb-placeholder {
  opacity: 0.7;
}

.trash-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
}

.trash-info {
  padding: 12px;
}

.trash-filename {
  margin: 0 0 6px 0;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trash-meta {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #666;
}

.trash-date {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.expire-hint {
  color: #e74c3c;
  font-weight: 500;
}

.trash-actions {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #eee;
  background: #f9f9f9;
}

.trash-actions .restore-btn {
  flex: 1;
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.trash-actions .restore-btn:hover {
  background: #218838;
}

.trash-actions .delete-btn {
  flex: 1;
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.trash-actions .delete-btn:hover {
  background: #c82333;
}

/* 删除按钮样式 */
.delete-folder-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 6px;
  border-radius: 4px;
  opacity: 0.6;
  transition: all 0.2s;
}

.delete-folder-btn:hover {
  opacity: 1;
  background: rgba(220, 53, 69, 0.1);
}

.chip-delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 3px;
  opacity: 0.6;
  transition: all 0.2s;
}

.chip-delete-btn:hover {
  opacity: 1;
  background: rgba(220, 53, 69, 0.2);
}
</style>
