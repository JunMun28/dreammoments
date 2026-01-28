# Hunbei Long Page Editor Analysis

**Source URL:** https://www.hunbei.com/long_page/#/?scene_id=35672870
**Analysis Date:** January 2026

This document contains a comprehensive breakdown of all features in the Hunbei (婚贝) wedding invitation long page editor for cloning purposes.

---

## 1. Overall Layout Structure

### Main Interface Regions

```
┌─────────────────────────────────────────────────────────────────────┐
│  Top Bar (Logo, Undo/Redo, Save, Preview, Exit)                     │
├──────┬────────────┬─────────────────────────────┬───────────────────┤
│      │            │                             │                   │
│ Left │   Left     │      Canvas Area            │   Right Panel     │
│ Side │   Panel    │   (Main Editing Area)       │   (Properties)    │
│ bar  │   (varies) │                             │                   │
│      │            │                             │                   │
├──────┴────────────┼─────────────────────────────┼───────────────────┤
│                   │   Section Thumbnails Strip  │                   │
│                   │   (Bottom Horizontal Scroll)│                   │
└───────────────────┴─────────────────────────────┴───────────────────┘
```

---

## 2. Top Bar

### Left Section

- **Logo:** 婚贝请柬 (Hunbei Invitation) with icon
- **Undo/Redo:** Arrow icons for history navigation

### Right Section

- **保存 (Save):** Icon button to save work
- **预览分享 (Preview & Share):** Primary blue button
- **退出 (Exit):** Button to exit editor

---

## 3. Left Sidebar (Tool Selection)

Vertical icon toolbar with the following tools:

| Icon | Chinese | English     | Function                     |
| ---- | ------- | ----------- | ---------------------------- |
| 📄   | 页面    | Page        | View/manage page sections    |
| 📋   | 模板    | Template    | Browse and apply templates   |
| T    | 文字    | Text        | Add text elements            |
| 🖼️   | 素材    | Materials   | Add graphics/images/stickers |
| 🎨   | 背景    | Background  | Set canvas background        |
| 🎵   | 音乐    | Music       | Add background music         |
| 🧩   | 组件    | Components  | Add interactive components   |
| 👤   | 我的    | My/Personal | User's saved items           |
| ❓   | 帮助    | Help        | Help center with tutorials   |

---

## 4. Left Panel Content (by Tool)

### 4.1 Page Panel (页面)

- Shows vertical thumbnail preview of the entire long page
- Sections are listed with mini-previews
- **快速换图 (Quick Image Replace):** Button to quickly swap images

### 4.2 Template Panel (模板)

**Tabs:**

- 精选推荐 (Featured/Recommended)
- 收藏模板 (Saved Templates)

**Features:**

- Search box: 搜索模板 (Search templates)
- Template grid with thumbnails
- Templates marked with "长页" (Long Page) badge
- Categories of wedding invitation styles

### 4.3 Text Panel (文字)

- **+ 添加文字 (Add Text):** Button to add new text
- **点击添加标题文字:** Click-to-add title text (larger)
- **点击添加标题文字:** Click-to-add subtitle text (smaller)

### 4.4 Materials Panel (素材)

**Category Tabs:**

- 全部 (All)
- 婚礼元素 (Wedding Elements)
- 人物 (People/Characters)
- 捧花 (Bouquet)
- 猫狗宠物 (Pets)
- 喜字 (Double Happiness)
- 更多 ▼ (More - dropdown)

**Content Sections:**
Each category shows a grid of graphics with "查看更多" (See More) link

**Asset Categories Include:**

- Floral decorations and borders
- Cartoon bride & groom illustrations
- Traditional Chinese wedding elements (囍, lanterns, etc.)
- Ribbon and decorative elements
- Pet illustrations
- Bouquet designs

### 4.5 Background Panel (背景)

**纯色背景 (Solid Color Background):**

- Color picker grid with preset colors
- Includes: gradient, white, cream, blue, purple, red, orange, yellow, green, gray, black

**背景素材 (Background Materials):**

- Textured backgrounds grid
- Includes: marble, confetti, red Chinese patterns, subtle patterns
- Traditional wedding-themed backgrounds

### 4.6 Music Panel (音乐)

**Tabs:**

- 音乐库 (Music Library)
- 本地音乐 (Local Music)

**当前音乐 (Current Music):**

- Shows currently selected track with play, trim (scissors), delete icons

**Filter Buttons:**

- 全部 (All)
- 欢快 (Joyful)
- 安静 (Calm)
- 抖音 (TikTok trending)
- 纯音乐 (Instrumental)
- 民谣 (Folk)
- 儿童 (Children)
- 更多 (More)

**Track List:**
Each track shows:

- Music icon
- Track name
- Duration (e.g., "03:47")
- Scissors icon (trim)
- "使用" (Use) button / "使用中" (In Use) badge
- "默认" (Default) badge if applicable

**Sample Tracks:**

- Beautiful In White
- 告白气球
- 我们结婚啦
- Say u love me
- Love Paradise
- 咱们结婚吧
- 我是如此相信
- 执子之手-宝石Gem

**Right Panel (Music Settings):**

- 背景音乐 (Background Music): Shows current track
- 选择图标 (Select Icon): Various music note icons
- 图标颜色 (Icon Color): Color picker

### 4.7 Components Panel (组件)

#### 互动 (Interactive)

| Chinese  | English        | Function                      |
| -------- | -------------- | ----------------------------- |
| 日历     | Calendar       | Add calendar widget           |
| 地图     | Map            | Add venue map                 |
| 倒计时   | Countdown      | Add countdown timer           |
| 特效     | Effects        | Add visual effects/animations |
| 外链视频 | External Video | Embed external video link     |
| 一键拨号 | One-click Call | Add phone dial button         |
| 轮播相册 | Carousel Album | Add photo carousel/gallery    |

#### 表单 (Forms)

| Chinese  | English       | Function                |
| -------- | ------------- | ----------------------- |
| 单选     | Radio         | Single select option    |
| 多选     | Multi-select  | Checkbox options        |
| 下拉框   | Dropdown      | Dropdown select         |
| 输入框   | Input Field   | Text input              |
| 快捷表单 | Quick Form    | Pre-built form template |
| 提交按钮 | Submit Button | Form submission button  |

#### 悬浮按钮 (Floating Buttons)

| Chinese | English    | Function                    |
| ------- | ---------- | --------------------------- |
| 回执    | RSVP       | RSVP floating button        |
| 导航    | Navigation | Navigation floating button  |
| 电话    | Phone      | Phone call floating button  |
| 视频    | Video      | Video floating button       |
| 相册    | Album      | Photo album floating button |

---

## 5. Canvas Area

### Canvas Controls (Right side of canvas)

- **📱 Device Preview:** Toggle mobile preview frame
- **📚 Layers (图层):** Open layers panel
- **➕ Zoom In**
- **81%** - Current zoom level (dropdown: 200%, 150%, 100%, 50%)
- **➖ Zoom Out**

### Canvas Features

- **Drag handle at bottom:** "拖动调节页面高度" (Drag to adjust page height)
- **Selection handles:** Resize, rotate elements
- **Alignment guides:** Snap to guides when dragging elements
- **Multi-select:** Cmd/Ctrl + Click for multiple selection

### Section Thumbnails Strip (Bottom)

- Horizontal scrollable strip of all page sections
- Each thumbnail shows a preview of that section
- Click to navigate to section
- Visual indicator for currently visible section
- Left/Right scroll arrows

---

## 6. Right Panel (Properties)

### 6.1 Canvas/Background Settings (No element selected)

**Tabs:**

- 背景 (Background)
- 作品设置 (Work Settings)

**背景 Tab:**

- **标记背景 (Mark Background):** Toggle switch
- **画布高度 (Canvas Height):**
  - Slider (range: 1206 - 20000)
  - Number input (e.g., 14536)
- **画布背景 (Canvas Background):**
  - 颜色 (Color) tab - color picker
  - 图片 (Image) tab - background image
- **背景透明度 (Background Opacity):**
  - Slider (0-100)
  - Number input

**作品设置 Tab:**

- **自动滚动 (Auto Scroll):** Toggle switch
- **滚动时长(s) (Scroll Duration):**
  - Slider
  - Number input (e.g., 165 seconds)

### 6.2 Image Element Properties

**Tabs:**

- 图片 (Image)
- 动画 (Animation)
- 点击 (Click/Interaction)

**图片 Tab:**

- **图层名称 (Layer Name):** Editable text field (e.g., "图片13")
- **Preview thumbnail** of the image

**Action Buttons:**
| Chinese | English | Function |
|---------|---------|----------|
| 更换 | Replace | Replace image |
| 删除 | Delete | Delete element |
| 水平翻转 | Horizontal Flip | Flip horizontally |
| 垂直翻转 | Vertical Flip | Flip vertically |
| 裁剪 | Crop | Crop image |
| 智能抠图 | Smart Cutout | AI background removal (VIP) |

**Properties:**

- **透明度 (Opacity):** Slider 0-100
- **角度 (Rotation):** Slider/input in degrees

**Expandable Sections:**

- **边框样式 (Border Style)**
- **阴影样式 (Shadow Style)**

### 6.3 Text Element Properties

**Tabs:**

- 文字 (Text)
- 动画 (Animation)
- 点击 (Click/Interaction)

**文字 Tab:**

- **Text content:** Input field with × clear button
- **Font:** Dropdown (e.g., "思源宋体常规" / Noto Serif SC Regular)
- **Size:** Number input (e.g., 14)
- **行距 (Line Height):** Slider + input
- **字距 (Letter Spacing):** Slider + input
- **颜色 (Color):** Color picker
- **填充 (Fill):** Color/gradient picker

**Text Formatting:**

- **B** - Bold
- **I** - Italic
- **U** - Underline
- Text alignment: Left | Center | Right | Justify

**Properties:**

- **透明度 (Opacity):** Slider 0-100
- **角度 (Rotation):** Slider/input

**Expandable Sections:**

- **边框样式 (Border Style)**

### 6.4 Animation Tab (动画)

**Add Animation:**

- "添加动画" (Add Animation) button

**When animation is added:**

- **动画 (Animation):** Type name with delete icon
- Note: "页面打开后元素将执行[动画类型]动画，持续X秒，延迟X秒，循环播放"

**Animation Settings:**

- **类型 (Type):** Dropdown (e.g., 旋转2D / Rotate 2D)
- **时长(s) (Duration):** Slider + input (e.g., 1.5s)
- **延迟(s) (Delay):** Slider + input (e.g., 0s)

**动画速度 (Animation Speed):**

- 默认 (Default)
- 匀速 (Linear)
- 减速 (Decelerate)
- 起始慢 (Ease-in)

**动画基点设置 (Animation Origin/Pivot):**

```
┌────────┬────────┬────────┐
│  上左  │  上中  │  上右  │
│Top-Left│Top-Ctr │Top-Rgt │
├────────┼────────┼────────┤
│  左中  │  默认  │  右中  │
│Mid-Left│ Center │Mid-Rgt │
├────────┼────────┼────────┤
│  下左  │  下中  │  下右  │
│Btm-Left│Btm-Ctr │Btm-Rgt │
└────────┴────────┴────────┘
```

### 6.5 Click/Interaction Tab (点击)

- Dropdown to select interaction type
- Default: 无 (None)
- (Options likely include: link to URL, phone call, etc.)

---

## 7. Layers Panel

**Accessed via:** Layers icon on canvas right side

**Features:**

- List of all elements by name (e.g., "图片120", "文本112")
- Each layer shows:
  - Icon indicating element type
  - Layer name (editable)
  - Preview of content (for text elements, shows text content)
- Visibility toggle
- Reorderable list (drag to reorder z-index)

**Layer naming convention:**

- 图片X (Image X)
- 文本X (Text X)
- 形状X (Shape X)
- 倒计时X (Countdown X)
- 地图X (Map X)
- 日历X (Calendar X)
- 输入框 (Input Field)
- 提交按钮 (Submit Button)

---

## 8. Context Menu (Right-click on element)

| Chinese        | English               | Shortcut |
| -------------- | --------------------- | -------- |
| 锁定           | Lock                  | -        |
| 复制           | Copy                  | Ctrl+C   |
| 剪切           | Cut                   | Ctrl+X   |
| 删除元素       | Delete Element        | -        |
| 保存到我的收藏 | Save to My Collection | (VIP 👑) |
| 置顶           | Bring to Front        | -        |
| 置底           | Send to Back          | -        |
| 上移           | Move Up (z-index)     | -        |
| 下移           | Move Down (z-index)   | -        |

---

## 9. Keyboard Shortcuts

| Shortcut         | Action                      |
| ---------------- | --------------------------- |
| ⌘ + C            | Copy                        |
| ⌘ + V            | Paste                       |
| ⌘ + X            | Cut                         |
| ⌘ + A            | Select All                  |
| ⌘ + Click        | Multi-select                |
| ⌘ + S            | Save                        |
| ⌘ + Z            | Undo                        |
| ⌘ + Shift + Z    | Redo                        |
| Fn + Backspace   | Delete                      |
| ← ↑ → ↓          | Move by 1px                 |
| ⌘ + ← ↑ → ↓      | Move by 10px                |
| Shift + Drag     | Vertical constrained drag   |
| ⌘ + Shift + Drag | Horizontal constrained drag |

---

## 10. Help Center (帮助中心)

**Tabs:**

- 图文版 (Text/Image Guide)
- 视频版 (Video Guide)

**Tutorial Topics:**

- 如何修改文字 (How to edit text)
- 如何更换图片 (How to replace images)
- 如何修改视频 (How to edit video)
- 如何修改电话 (How to edit phone number)
- 如何修改地图 (How to edit map)
- 如何删除元素 (How to delete elements)
- 如何增加元素 (How to add elements)
- 如何设置页面高度 (How to set page height)

**Additional Help:**

- 联系客服 (Contact Support)
- 意见反馈 (Feedback)

---

## 11. Special Features

### 11.1 Quick Image Replace (快速换图)

- Button in the bottom-left of canvas area
- Allows rapid swapping of placeholder images

### 11.2 Smart Cutout (智能抠图) - VIP Feature

- AI-powered background removal
- Accessible from image element properties

### 11.3 Auto-scroll Preview

- Configurable automatic scrolling for long pages
- Duration setting (1-300 seconds)
- Creates cinematic viewing experience

### 11.4 Page Height Adjustment

- Drag handle at bottom of canvas
- Slider in settings (1206-20000px range)
- Direct number input

### 11.5 Zoom Controls

- Preset levels: 200%, 150%, 100%, 50%
- Custom zoom via buttons
- Current zoom displayed as percentage

---

## 12. Element Types Summary

| Type          | Chinese  | Properties                                                       |
| ------------- | -------- | ---------------------------------------------------------------- |
| Image         | 图片     | Replace, flip, crop, cutout, opacity, rotation, border, shadow   |
| Text          | 文字     | Font, size, color, spacing, alignment, opacity, rotation, border |
| Shape         | 形状     | Color, opacity, rotation, border                                 |
| Calendar      | 日历     | Date settings                                                    |
| Map           | 地图     | Location, style                                                  |
| Countdown     | 倒计时   | Target date, style                                               |
| Carousel      | 轮播相册 | Images, timing                                                   |
| Video         | 外链视频 | Video URL                                                        |
| Form Input    | 输入框   | Placeholder, validation                                          |
| Submit Button | 提交按钮 | Text, style                                                      |
| Dropdown      | 下拉框   | Options                                                          |
| Radio         | 单选     | Options                                                          |
| Checkbox      | 多选     | Options                                                          |

---

## 13. VIP/Premium Features

Features marked with crown (👑) or "VIP" badge:

- 智能抠图 (Smart Cutout / Background Removal)
- 保存到我的收藏 (Save to My Collection)
- Certain premium templates
- Certain premium music tracks

---

## 14. Mobile Preview

The editor shows:

- Phone-shaped frame around canvas
- Realistic mobile viewport dimensions
- Touch-friendly preview for final output

---

## 15. Implementation Notes for Cloning

### Priority Features (Must Have)

1. Long page canvas with adjustable height
2. Element layering system (z-index management)
3. Text editing with font selection and styling
4. Image upload and manipulation (flip, crop, opacity)
5. Background color/image settings
6. Section-based page structure
7. Element animation system
8. Preview functionality

### Secondary Features (Nice to Have)

1. Template library
2. Music library and playback
3. Interactive components (map, countdown, forms)
4. Auto-scroll feature
5. Quick image replace
6. Keyboard shortcuts

### Advanced Features (Future)

1. AI background removal
2. User collections/favorites
3. Share/export functionality
4. Video embedding

---

## 16. Technical Observations

- **Canvas Technology:** Likely uses HTML5 Canvas or DOM-based rendering
- **State Management:** Real-time preview suggests reactive state
- **Data Structure:** Elements stored with position, size, rotation, z-index, type-specific properties
- **Export Format:** Generates shareable URL (long_page/#/?scene_id=XXXXX)
- **Autosave:** Likely has automatic saving
- **Responsive:** Canvas is mobile-first (phone-width)

---

_Document generated from visual analysis of the Hunbei editor interface._
