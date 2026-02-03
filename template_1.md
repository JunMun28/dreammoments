# Wedding Invitation Long-Page Template Specification
# Template 1: Chinese Traditional Red Theme (Hunbei Style)

## Overview

**Template Name**: Chinese Traditional Red Wedding Invitation
**Format**: Single-page vertical scroll (长页/Long Page)
**Theme**: Traditional Chinese wedding with modern elements
**Target Platform**: Mobile-first (375px base width)

---

## Global Configuration

### Viewport & Base Settings
```
Base font-size: 40.3px (root)
Viewport: width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no
Platform: Mobile-first (designed for ~375px width, uses rem units)
1rem = 40.3px
Page total height: 211.76rem (~8,533px)
Content width: 10rem (403px)
```

### Color Palette
| Name | Value | Usage |
|------|-------|-------|
| Primary Red | `rgb(179, 14, 14)` / `#B30E0E` | Text accents, hearts, highlights |
| Dark Maroon | `rgb(116, 18, 18)` / `#741212` | Buttons, calendar bg, countdown |
| White | `rgb(255, 255, 255)` | Text on dark backgrounds |
| Gold/Cream | `rgb(255, 224, 148)` / `#FFE094` | Decorative text, headers |
| Black | `rgb(0, 0, 0)` | Body text |
| Light Gray | `rgb(153, 153, 153)` | Borders (mostly transparent) |
| Heart Red | `rgb(202, 32, 52)` | Calendar heart indicators |

### Typography System
| Font Family | Type | Usage | Fallback |
|-------------|------|-------|----------|
| `siyuansongtichanggui` (思源宋体常规) | Chinese Serif Regular | Body text, names | serif |
| `siyuansongtijixi` (思源宋体极细) | Chinese Serif Light | Quotes, descriptions | serif |
| `wendingpljianzhongkai` (文鼎简中楷) | Chinese Calligraphy | Main header "我们结婚啦" | cursive |
| `Cinzel-Regular` | Latin Serif | English taglines | Georgia |
| `Cinzel-Bold` | Latin Serif Bold | "LOVE YOU" text | Georgia |
| `MAXWELL-Light` | Latin Sans Light | "GROOM" / "BRIDE" labels | sans-serif |

---

## Content Structure

### Data Model
```typescript
interface WeddingInvitation {
  // Couple Information
  groomName: string;           // e.g., "满小满"
  brideName: string;           // e.g., "美小美"

  // Date & Time
  weddingDate: Date;           // e.g., 2050-05-20
  weddingTime: string;         // e.g., "12:00PM"
  lunarDate: string;           // e.g., "农历四月廿二"
  dayOfWeek: string;           // e.g., "星期六"

  // Venue
  venueName: string;           // e.g., "婚贝大酒店A栋9F幸福宴会厅"
  venueAddress: string;
  venueCoordinates: {
    lat: number;
    lng: number;
  };

  // Photos (minimum 8-10 photos recommended)
  photos: {
    hero: string;              // Main hero photo
    couple1: string;           // Full photo 1
    couple2: string;           // Full photo 2
    groomPortrait: string;     // Groom solo
    bridePortrait: string;     // Bride solo
    gallery: string[];         // Additional photos
  };

  // Messages
  invitationMessage: string[];  // Array of message lines

  // Settings
  enableMusic: boolean;
  musicUrl: string;
  enableGifts: boolean;
  enableRsvp: boolean;
  enableBulletComments: boolean;
}
```

---

## Section-by-Section Specification

### Section 1: Hero Section
**Position**: 0rem - 20rem
**Purpose**: First impression, couple introduction

#### 1.1 Background Layer
```css
.hero-background {
  position: absolute;
  left: 0;
  top: 0;
  width: 10rem;
  height: 19.65rem;
  /* Image with decorative mask overlay */
  -webkit-mask-image: url("masks/soft-vignette.png");
  mask-image: url("masks/soft-vignette.png");
}
```

#### 1.2 Sparkle Overlay (Animated)
```css
.sparkle-overlay {
  position: absolute;
  left: 0;
  top: 0;
  width: 10rem;
  height: 18.93rem;
  background-image: url("effects/sparkle.gif");
  -webkit-mask-image: url("masks/fade-edges.png");
  opacity: 1;
  pointer-events: none;
}
```

#### 1.3 Header Text - "我们结婚啦"
```css
.header-announcement {
  position: absolute;
  left: 0.19rem;
  top: 0.36rem;
  width: 9.6rem;
  font-family: 'wendingpljianzhongkai', cursive;
  font-size: 0.37rem;
  line-height: 1;
  letter-spacing: 0.08rem;
  text-align: center;
  color: rgb(255, 224, 148);
}
```

#### 1.4 Double Happiness Character "囍"
```css
.double-happiness {
  position: absolute;
  left: 0;
  top: 1.1rem;
  width: 10rem;
  font-family: 'siyuansongtichanggui', serif;
  font-size: 1.15rem;
  line-height: 1;
  letter-spacing: 0.08rem;
  text-align: center;
  color: rgb(255, 224, 148);
}
```

#### 1.5 Couple Names Layout
```css
.names-container {
  position: absolute;
  top: 5.33rem;
  width: 10rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.groom-name {
  position: absolute;
  left: 0.81rem;
  width: 3.87rem;
  font-family: 'siyuansongtichanggui', serif;
  font-size: 0.37rem;
  letter-spacing: 0.05rem;
  text-align: right;
  color: rgb(255, 255, 255);
}

.name-separator {
  position: absolute;
  left: 4.49rem;
  width: 1.01rem;
  font-family: 'siyuansongtichanggui', serif;
  font-size: 0.37rem;
  text-align: center;
  color: rgb(255, 255, 255);
  /* Content: "×" */
}

.bride-name {
  position: absolute;
  left: 5.34rem;
  width: 3.87rem;
  font-family: 'siyuansongtichanggui', serif;
  font-size: 0.37rem;
  letter-spacing: 0.05rem;
  text-align: left;
  color: rgb(255, 255, 255);
}
```

#### 1.6 Role Labels
```css
.groom-label {
  position: absolute;
  left: 0.12rem;
  top: 5.98rem;
  width: 4.56rem;
  font-family: 'MAXWELL-Light', sans-serif;
  font-size: 0.32rem;
  letter-spacing: 0.05rem;
  text-align: right;
  color: rgb(255, 224, 148);
  /* Content: "GROOM" */
}

.bride-label {
  position: absolute;
  left: 5.34rem;
  top: 5.98rem;
  width: 4.56rem;
  font-family: 'MAXWELL-Light', sans-serif;
  font-size: 0.32rem;
  letter-spacing: 0.05rem;
  text-align: left;
  color: rgb(255, 224, 148);
  /* Content: "BRIDE" */
}
```

#### 1.7 Decorative Elements
```css
.divider-ornament-1 {
  position: absolute;
  left: 1.71rem;
  top: 2.61rem;
  width: 6.59rem;
  height: 0.96rem;
  /* Ornamental line with flourishes */
}

.divider-ornament-2 {
  position: absolute;
  left: 2.83rem;
  top: 3.62rem;
  width: 4.35rem;
  height: 0.85rem;
  /* Smaller ornamental line */
}

.heart-icon-small {
  position: absolute;
  left: 4.71rem;
  top: 4.48rem;
  width: 0.59rem;
  height: 0.59rem;
  /* Small decorative heart image */
}
```

---

### Section 2: Date & Couple Photo Section
**Position**: 20rem - 35rem
**Purpose**: Display wedding date and couple photo

#### 2.1 Corner Decorations
```css
.corner-decoration-tl {
  position: absolute;
  left: 0.24rem;
  top: 19.8rem;
  width: 2.69rem;
  height: 1.36rem;
  /* Floral corner decoration image */
}

.corner-decoration-tr {
  position: absolute;
  left: 7.33rem;
  top: 19.79rem;
  width: 2.4rem;
  height: 1.36rem;
  /* Floral corner decoration (mirrored) */
}
```

#### 2.2 Section Divider
```css
.date-section-divider {
  position: absolute;
  left: 2.31rem;
  top: 21.66rem;
  width: 5.39rem;
  height: 0.85rem;
  /* Ornamental divider with date frame */
}
```

#### 2.3 Main Couple Photo
```css
.couple-photo-main {
  position: absolute;
  left: 1.83rem;
  top: 22.95rem;
  width: 6.35rem;
  height: 4.64rem;
  object-fit: cover;
  border-radius: 0;
}
```

#### 2.4 Date Display
```css
.wedding-date-display {
  position: absolute;
  left: 0;
  top: 28rem;
  width: 10rem;
  font-family: 'Cinzel-Regular', Georgia, serif;
  font-size: 0.35rem;
  font-weight: bold;
  text-align: center;
  color: rgb(0, 0, 0);
  /* Format: "YYYY/MM/DD" */
}

.date-brackets {
  position: absolute;
  left: -0.03rem;
  top: 27.95rem;
  width: 10rem;
  font-family: 'siyuansongtichanggui', serif;
  font-size: 0.4rem;
  text-align: center;
  color: rgb(179, 14, 14);
  /* Content: decorative brackets around date */
}
```

#### 2.5 Love Quote Block
```css
.love-quote-block {
  position: absolute;
  left: 0;
  top: 29.13rem;
  width: 10rem;
  font-family: 'siyuansongtijixi', serif;
  font-size: 0.32rem;
  line-height: 2;
  letter-spacing: 0.027rem;
  text-align: center;
  color: rgb(0, 0, 0);
}

/* Sample content:
  "爱不落世俗，我永远爱你
   我们与浪漫同归
   爱没有定义，你在它就在"
*/
```

#### 2.6 English Tagline
```css
.english-tagline {
  position: absolute;
  left: 0;
  top: 31.76rem;
  width: 10rem;
  font-family: 'siyuansongtichanggui', serif;
  font-size: 0.32rem;
  text-align: center;
  color: rgb(179, 14, 14);
  /* Content: "You are in it." */
}
```

---

### Section 3: Full Photo with Message
**Position**: 33rem - 52rem
**Purpose**: Large photo with romantic message

#### 3.1 Full Width Photo
```css
.full-width-photo {
  position: absolute;
  left: 0;
  top: 33.06rem;
  width: 10.05rem;
  height: 11.6rem;
  object-fit: cover;
}
```

#### 3.2 English Tagline
```css
.tagline-fearless {
  position: absolute;
  left: 0;
  top: 44.76rem;
  width: 10rem;
  font-family: 'Cinzel-Regular', Georgia, serif;
  font-size: 0.32rem;
  letter-spacing: 0.11rem;
  text-align: center;
  color: rgb(179, 14, 14);
  /* Content: "Born free, loving and fearless" */
}
```

#### 3.3 Invitation Message
```css
.invitation-message {
  position: absolute;
  left: 0;
  top: 46rem;
  width: 10rem;
  font-family: 'siyuansongtijixi', serif;
  font-size: 0.32rem;
  line-height: 2;
  text-align: center;
  color: rgb(0, 0, 0);
}

/* Sample content:
  "你说最好的人会到身边
   当你收到这封邀请函
   我们已经在倒数着日子
   期待着与你们相见
   在我们最重要的这一天"
*/
```

#### 3.4 Section Title Decoration
```css
.section-title-decoration {
  position: absolute;
  left: 2.49rem;
  top: 50.13rem;
  width: 5.01rem;
  height: 1.44rem;
  /* Decorative title frame/divider image */
}
```

---

### Section 4: Portrait Photos Side-by-Side
**Position**: 52rem - 70rem
**Purpose**: Individual portraits of bride and groom

#### 4.1 Sparkle Overlay
```css
.sparkle-overlay-portraits {
  position: absolute;
  left: -0.03rem;
  top: 52.28rem;
  width: 10rem;
  height: 6.59rem;
  background-image: url("effects/sparkle.gif");
  -webkit-mask-image: url("masks/fade-edges.png");
  pointer-events: none;
}
```

#### 4.2 Groom Portrait
```css
.groom-portrait {
  position: absolute;
  left: 0;
  top: 52.27rem;
  width: 4.91rem;
  height: 7.6rem;
  object-fit: cover;
}
```

#### 4.3 Bride Portrait
```css
.bride-portrait {
  position: absolute;
  left: 5.09rem;
  top: 52.27rem;
  width: 4.91rem;
  height: 7.6rem;
  object-fit: cover;
}
```

#### 4.4 Name Labels
```css
.groom-name-label {
  position: absolute;
  left: 0.46rem;
  top: 61.75rem;
  width: 3.87rem;
  font-family: 'siyuansongtichanggui', serif;
  font-size: 0.37rem;
  font-weight: bold;
  text-align: center;
  color: rgb(0, 0, 0);
}

.bride-name-label {
  position: absolute;
  left: 5.56rem;
  top: 61.75rem;
  width: 3.87rem;
  font-family: 'siyuansongtichanggui', serif;
  font-size: 0.37rem;
  font-weight: bold;
  text-align: center;
  color: rgb(0, 0, 0);
}
```

#### 4.5 Underline Decorations
```css
.groom-underline {
  position: absolute;
  left: 1.06rem;
  top: 60.73rem;
  width: 2.67rem;
  height: 0.64rem;
  /* Ornamental underline image */
}

.bride-underline {
  position: absolute;
  left: 6.52rem;
  top: 60.73rem;
  width: 1.95rem;
  height: 0.61rem;
  /* Ornamental underline image */
}
```

#### 4.6 Heart Icon Between Names
```css
.heart-between-names {
  position: absolute;
  left: 4.8rem;
  top: 60.84rem;
  width: 0.4rem;
  height: 0.4rem;
}

/* SVG Heart Shape */
.heart-svg {
  fill: rgb(179, 14, 14);
}
```

---

### Section 5: Love Story Text
**Position**: 63rem - 80rem
**Purpose**: Romantic poetry/prose about the couple

#### 5.1 Poetry Block
```css
.poetry-block {
  position: absolute;
  left: -0.03rem;
  top: 63.19rem;
  width: 10rem;
  font-family: 'siyuansongtijixi', serif;
  font-size: 0.32rem;
  line-height: 2.3;
  text-align: center;
  color: rgb(0, 0, 0);
}

/* Sample content:
  "我们都由微粒组成
   从宇宙开始的那一刹就已然存在
   我愿意相信那些原子
   穿越一百四十亿年的时空创造了我们
   让我们走进彼此的生命
   共享同一颗行星和同一段时光"
*/
```

#### 5.2 Corner Decorations
```css
.corner-bl {
  position: absolute;
  left: 0.21rem;
  top: 68.6rem;
  width: 2.56rem;
  height: 1.12rem;
}

.corner-br {
  position: absolute;
  left: 7.68rem;
  top: 68.62rem;
  width: 2.13rem;
  height: 1.01rem;
}
```

#### 5.3 Circular Photo
```css
.circular-photo {
  position: absolute;
  left: 0;
  top: 69.9rem;
  width: 10.05rem;
  height: 9.97rem;
  object-fit: cover;
  -webkit-mask-image: url("masks/circular-soft-edge.png");
}
```

#### 5.4 "Because of you" Tagline
```css
.because-tagline {
  position: absolute;
  left: 0;
  top: 80.19rem;
  width: 10rem;
  font-family: 'siyuansongtichanggui', serif;
  font-size: 0.32rem;
  text-align: center;
  color: rgb(179, 14, 14);
  /* Content: "Because of you," */
}
```

---

### Section 6: Photo with Side Text
**Position**: 80rem - 100rem
**Purpose**: Asymmetric layout with photo and text

#### 6.1 Left Photo with Mask
```css
.left-masked-photo {
  position: absolute;
  left: 0;
  top: 81.29rem;
  width: 6.61rem;
  height: 9.6rem;
  object-fit: cover;
  -webkit-mask-image: url("masks/right-fade.png");
}
```

#### 6.2 Decorative Element
```css
.floral-decoration {
  position: absolute;
  left: 6.88rem;
  top: 82.04rem;
  width: 2.67rem;
  height: 2.19rem;
  /* Floral/leaf decoration image */
}
```

#### 6.3 Vertical Line
```css
.vertical-line {
  position: absolute;
  left: 8.91rem;
  top: 85.2rem;
  width: 0.027rem;
  height: 3.31rem;
  background-color: rgb(15, 15, 15);
}
```

#### 6.4 Side Text Block
```css
.side-text-block {
  position: absolute;
  left: 3.97rem;
  top: 89.48rem;
  width: 5.57rem;
  font-family: 'siyuansongtijixi', serif;
  font-size: 0.32rem;
  line-height: 2.2;
  text-align: right;
  color: rgb(0, 0, 0);
}

/* Sample content:
  "爱情更是一段长久的陪伴
   长到四季穿过蒹葭
   长到青丝抽离成白发"
*/
```

---

### Section 7: Full Width Photo + Text
**Position**: 93rem - 117rem
**Purpose**: Another large photo with message

#### 7.1 Full Width Photo
```css
.full-photo-2 {
  position: absolute;
  left: 0;
  top: 93.02rem;
  width: 10rem;
  height: 6.91rem;
  object-fit: cover;
}
```

#### 7.2 Sparkle Overlay
```css
.sparkle-overlay-2 {
  position: absolute;
  left: 0;
  top: 93.37rem;
  width: 10rem;
  height: 15.57rem;
  background-image: url("effects/sparkle.gif");
  -webkit-mask-image: url("masks/fade-edges.png");
}
```

#### 7.3 Artistic Frame Photo
```css
.artistic-frame-photo {
  position: absolute;
  left: 0;
  top: 99.9rem;
  width: 10rem;
  height: 13.44rem;
  object-fit: cover;
  -webkit-mask-image: url("masks/artistic-frame.png");
}
```

#### 7.4 Section Divider
```css
.section-divider-2 {
  position: absolute;
  left: 1.88rem;
  top: 111.95rem;
  width: 6.24rem;
  height: 1.15rem;
  /* Ornamental divider image */
}
```

#### 7.5 Text Block
```css
.romantic-text-block {
  position: absolute;
  left: 0;
  top: 113.45rem;
  width: 10rem;
  font-family: 'siyuansongtijixi', serif;
  font-size: 0.32rem;
  line-height: 2.2;
  text-align: center;
  color: rgb(0, 0, 0);
}

/* Sample content:
  "我们穿过万里之遥遇到彼此
   世界在繁华喧嚣的光晕里倒退
   你于我而言，是这场盛大浪漫里的唯一心动"
*/
```

---

### Section 8: LOVE YOU Feature
**Position**: 116rem - 131rem
**Purpose**: Decorative "LOVE YOU" with date

#### 8.1 Portrait Photo with Ornate Frame
```css
.ornate-frame-photo {
  position: absolute;
  left: 1.66rem;
  top: 116.68rem;
  width: 6.69rem;
  height: 9.41rem;
  object-fit: cover;
  -webkit-mask-image: url("masks/ornate-frame.png");
}
```

#### 8.2 "LOVE" Text
```css
.love-text {
  position: absolute;
  left: 0.88rem;
  top: 125.58rem;
  width: 2.19rem;
  font-family: 'Cinzel-Bold', Georgia, serif;
  font-size: 0.45rem;
  text-align: left;
  color: rgb(179, 14, 14);
}
```

#### 8.3 Date Display
```css
.love-date {
  position: absolute;
  left: 3.4rem;
  top: 125.58rem;
  width: 3.2rem;
  font-family: 'Cinzel-Bold', Georgia, serif;
  font-size: 0.45rem;
  letter-spacing: 0.05rem;
  text-align: center;
  color: rgb(179, 14, 14);
  /* Format: "MM/DD" */
}
```

#### 8.4 "YOU" Text
```css
.you-text {
  position: absolute;
  left: 7.09rem;
  top: 125.58rem;
  width: 2.03rem;
  font-family: 'Cinzel-Bold', Georgia, serif;
  font-size: 0.45rem;
  text-align: right;
  color: rgb(179, 14, 14);
}
```

#### 8.5 Bottom Quote
```css
.bottom-quote {
  position: absolute;
  left: 0;
  top: 127.21rem;
  width: 10rem;
  font-family: 'siyuansongtijixi', serif;
  font-size: 0.32rem;
  line-height: 2;
  text-align: center;
  color: rgb(0, 0, 0);
  /* Content: "回首亘年漫月里的所有怦然心动，你仍拔得头筹" */
}
```

---

### Section 9: Hero Photo Repeat
**Position**: 131rem - 150rem
**Purpose**: Large couple photo

#### 9.1 Full Bleed Photo
```css
.hero-photo-repeat {
  position: absolute;
  left: 0;
  top: 131.1rem;
  width: 10rem;
  height: 14.05rem;
  object-fit: cover;
}
```

#### 9.2 Sparkle Overlay
```css
.sparkle-overlay-3 {
  position: absolute;
  left: 0;
  top: 131.32rem;
  width: 10rem;
  height: 18.37rem;
  background-image: url("effects/sparkle.gif");
  -webkit-mask-image: url("masks/fade-edges.png");
}
```

---

### Section 10: Calendar Section
**Position**: 144rem - 158rem
**Purpose**: Interactive calendar with wedding date

#### 10.1 Background Rectangle
```css
.calendar-background {
  position: absolute;
  left: -0.53rem;
  top: 144.8rem;
  width: 11.2rem;
  height: 10.53rem;
  background-color: rgb(116, 18, 18);
}
```

#### 10.2 Corner Decorations
```css
.calendar-corner-tl {
  position: absolute;
  left: 0.29rem;
  top: 145.4rem;
  width: 2.24rem;
  height: 1.44rem;
}

.calendar-corner-tr {
  position: absolute;
  left: 6.91rem;
  top: 145.42rem;
  width: 2.85rem;
  height: 1.39rem;
}
```

#### 10.3 Calendar Component
```css
.calendar-container {
  position: absolute;
  left: 0.67rem;
  top: 146.61rem;
  width: 8.67rem;
  height: 8.67rem;
  transform: scale(0.855);
  background: transparent;
}

.calendar-header {
  /* Month/Day display: "08 / 01" */
  color: rgb(255, 255, 255);
  font-size: large;
}

.calendar-weekdays {
  display: flex;
  justify-content: space-around;
  /* Days: 一 二 三 四 五 六 日 */
  color: rgb(255, 255, 255);
}

.calendar-year {
  /* "2024" displayed on left */
  color: rgb(255, 255, 255);
  writing-mode: vertical-rl;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  color: rgb(255, 255, 255);
  text-align: center;
}

.calendar-day.active {
  /* Wedding date with heart indicator */
}

.calendar-heart {
  color: rgb(202, 32, 52);
  /* Heart icon below active date */
}
```

#### 10.4 Section Title
```css
.calendar-section-title {
  position: absolute;
  left: 2.04rem;
  top: 156.66rem;
  width: 5.95rem;
  height: 1.01rem;
  /* Decorative "Wedding Day" title image */
}
```

#### 10.5 Message Text
```css
.calendar-message {
  position: absolute;
  left: 0;
  top: 158.04rem;
  width: 10.03rem;
  font-family: 'siyuansongtijixi', serif;
  font-size: 0.37rem;
  text-align: center;
  color: rgb(0, 0, 0);
  /* Content: "【 好久不见/婚礼见 】" */
}
```

---

### Section 11: Countdown Timer
**Position**: 159rem - 162rem
**Purpose**: Live countdown to wedding date

#### 11.1 Container
```css
.countdown-container {
  position: absolute;
  left: 0;
  top: 159.14rem;
  width: 10rem;
  height: 2.27rem;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}
```

#### 11.2 Sparkle Overlay
```css
.countdown-sparkle {
  position: absolute;
  left: 1.84rem;
  top: 159.53rem;
  width: 6.32rem;
  height: 1.89rem;
  background-image: url("effects/sparkle.gif");
  -webkit-mask-image: url("masks/fade-edges.png");
}
```

#### 11.3 Countdown Boxes
```css
.countdown-box {
  background-color: rgb(116, 18, 18);
  border-radius: 0.13rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.2rem;
}

.countdown-digits {
  display: flex;
  color: rgb(255, 255, 255);
  font-size: 0.5rem;
  font-weight: bold;
}

.countdown-label {
  color: rgb(255, 255, 255);
  font-size: 0.24rem;
}

/* Labels: 天 (days), 时 (hours), 分 (minutes), 秒 (seconds) */
```

#### 11.4 Flip Animation (Optional)
```css
.countdown-digit {
  position: relative;
  overflow: hidden;
}

.countdown-digit .current,
.countdown-digit .next {
  transition: transform 0.3s ease-in-out;
}

/* Flip effect on digit change */
```

---

### Section 12: Map & Venue
**Position**: 162rem - 170rem
**Purpose**: Venue location and directions

#### 12.1 Map Container
```css
.map-container {
  position: absolute;
  left: 1.25rem;
  top: 162.09rem;
  width: 7.52rem;
  height: 3.57rem;
  border-radius: 0;
  overflow: hidden;
}

/* Use AMap (高德地图) or similar */
.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
```

#### 12.2 Map Marker
```css
.map-marker {
  width: 30px;
  height: 30px;
  background-image: url("icons/wedding-pin.svg");
  background-size: contain;
}
```

#### 12.3 Date & Time Text
```css
.venue-datetime {
  position: absolute;
  left: 0;
  top: 166.31rem;
  width: 10rem;
  font-family: 'siyuansongtijixi', serif;
  font-size: 0.32rem;
  line-height: 2;
  text-align: center;
  color: rgb(0, 0, 0);
}

/* Sample content:
  "2050年5月20日 星期六
   农历四月廿二 12:00PM"
*/
```

#### 12.4 Venue Address
```css
.venue-address {
  position: absolute;
  left: -0.01rem;
  top: 167.96rem;
  width: 10rem;
  font-family: 'siyuansongtijixi', serif;
  font-size: 0.32rem;
  line-height: 2;
  text-align: center;
  color: rgb(0, 0, 0);
  /* Content: Venue name and address */
}
```

---

### Section 13: Bottom Photo
**Position**: 169rem - 177rem
**Purpose**: Final decorative photo

#### 13.1 Photo
```css
.bottom-photo {
  position: absolute;
  left: 0;
  top: 169.82rem;
  width: 10rem;
  height: 7.2rem;
  object-fit: cover;
}
```

#### 13.2 Sparkle Overlay
```css
.bottom-sparkle {
  position: absolute;
  left: 0;
  top: 169.82rem;
  width: 10rem;
  height: 6.03rem;
  background-image: url("effects/sparkle.gif");
  -webkit-mask-image: url("masks/top-fade.png");
}
```

---

### Section 14: RSVP Form
**Position**: 177rem - 186rem
**Purpose**: Guest response form

#### 14.1 Section Title
```css
.rsvp-title {
  position: absolute;
  left: 3.66rem;
  top: 177.88rem;
  width: 2.67rem;
  height: 0.67rem;
  /* "RSVP" decorative text image */
}
```

#### 14.2 Name Input Field
```css
.input-name {
  position: absolute;
  left: 1.86rem;
  top: 179.39rem;
  width: 6.27rem;
  height: 1.07rem;
  background: rgb(255, 255, 255);
  border: 0.027rem solid rgb(153, 153, 153);
  border-radius: 0;
  padding: 0 0.3rem;
  font-family: '微软雅黑', sans-serif;
  font-size: 0.35rem;
  color: rgb(110, 110, 110);
}

.input-name::placeholder {
  color: rgb(110, 110, 110);
}

.required-indicator {
  color: red;
  position: absolute;
  left: 0.1rem;
}
```

#### 14.3 Guest Count Input
```css
.input-guests {
  position: absolute;
  left: 1.86rem;
  top: 181rem;
  width: 6.27rem;
  height: 1.07rem;
  background: rgb(255, 255, 255);
  border: 0.027rem solid rgb(153, 153, 153);
  font-family: '微软雅黑', sans-serif;
  font-size: 0.35rem;
  color: rgb(110, 110, 110);
}
```

#### 14.4 Submit Button
```css
.submit-button {
  position: absolute;
  left: 1.86rem;
  top: 182.61rem;
  width: 6.27rem;
  height: 1.07rem;
  background: rgb(116, 18, 18);
  border: none;
  border-radius: 0;
  font-size: 0.37rem;
  text-align: center;
  color: rgb(255, 255, 255);
  cursor: pointer;
}

.submit-button:active {
  opacity: 0.8;
}
```

#### 14.5 Bottom Decoration
```css
.rsvp-decoration {
  position: absolute;
  left: 2.93rem;
  top: 184.45rem;
  width: 4.13rem;
  height: 1.49rem;
  /* Decorative flourish image */
}
```

---

### Section 15: Footer Decorations
**Position**: 190rem - 194rem
**Purpose**: Final decorative elements

#### 15.1 Divider
```css
.footer-divider {
  position: absolute;
  left: 2.87rem;
  top: 190.45rem;
  width: 4.27rem;
  height: 1.04rem;
  /* Final ornamental divider image */
}
```

---

### Section 16: Gift Section
**Position**: 193.8rem - end
**Purpose**: Virtual gift marketplace

#### 16.1 Container
```css
.gift-section {
  position: absolute;
  top: 193.81rem;
  left: 0;
  width: 100%;
  background: rgb(255, 255, 255);
  padding: 0.5rem;
}
```

#### 16.2 Gift Section Header
```css
.gift-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.gift-title {
  font-weight: bold;
  font-size: 0.4rem;
}

.gift-subtitle {
  font-size: 0.28rem;
  color: gray;
}
```

#### 16.3 Gift Carousel
```css
.gift-carousel {
  width: 100%;
  overflow: hidden;
}

.gift-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 0.3rem;
}

.gift-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.2rem;
  cursor: pointer;
}

.gift-item.active {
  background: rgba(179, 14, 14, 0.1);
  border-radius: 0.1rem;
}

.gift-image {
  width: 1.2rem;
  height: 1.2rem;
  object-fit: contain;
}

.gift-name {
  font-size: 0.28rem;
  text-align: center;
  margin-top: 0.1rem;
}

.gift-price {
  font-size: 0.24rem;
  color: rgb(179, 14, 14);
}
```

#### 16.4 Gift Data
```javascript
const giftItems = [
  { id: 1, name: "烟火贺喜", price: 9.99, image: "gifts/fireworks.png" },
  { id: 2, name: "永结同心", price: 13.14, image: "gifts/hearts.png" },
  { id: 3, name: "早生贵子", price: 29.9, image: "gifts/baby.png" },
  { id: 4, name: "钟爱一生", price: 52.1, image: "gifts/clock.png" },
  { id: 5, name: "百年好合", price: 6.66, image: "gifts/lily.png" },
  { id: 6, name: "幸福长久", price: 39.9, image: "gifts/happiness.png" },
  { id: 7, name: "永浴爱河", price: 88.8, image: "gifts/river.png" },
  { id: 8, name: "比翼双飞", price: 128.8, image: "gifts/birds.png" },
  { id: 9, name: "祝福撒花", price: 3.88, image: "gifts/confetti.png" },
  { id: 10, name: "鞭炮贺喜", price: 18.88, image: "gifts/firecrackers.png" },
  // ... more gifts up to ￥5200
];
```

#### 16.5 Cash Gift Option
```css
.cash-gift-section {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-top: 1px solid #eee;
}

.cash-gift-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.cash-gift-info {
  margin-left: 0.3rem;
}

.cash-gift-title {
  font-weight: bold;
  font-size: 0.35rem;
}

.cash-gift-subtitle {
  font-size: 0.28rem;
  color: gray;
}
```

---

## Bottom Toolbar (Fixed)

### Container
```css
.bottom-toolbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: auto;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  align-items: center;
  padding: 0.3rem;
  gap: 0.3rem;
}
```

### Left Section - Message Input
```css
.message-input-wrapper {
  flex: 1;
  position: relative;
}

.message-input {
  width: 100%;
  height: 0.9rem;
  border: 1px solid #ddd;
  border-radius: 0.45rem;
  padding: 0 0.4rem;
  font-size: 0.32rem;
  background: #f5f5f5;
}

.message-input::placeholder {
  color: #999;
}

.bullet-list-icon {
  position: absolute;
  right: 0.3rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.5rem;
  color: #666;
}
```

### Center Section - Quick Gifts
```css
.quick-gifts {
  display: flex;
  gap: 0.2rem;
}

.quick-gift-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.quick-gift-icon {
  width: 0.8rem;
  height: 0.8rem;
}

.quick-gift-name {
  font-size: 0.2rem;
  color: #666;
}
```

### Right Section
```css
.gift-button {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.like-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.like-count {
  font-size: 0.24rem;
  color: #666;
}

.like-icon {
  width: 1rem;
  height: 1rem;
}

/* Like animation */
.like-popup {
  position: absolute;
  animation: floatUp 1s ease-out forwards;
  color: rgb(179, 14, 14);
}

@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-50px);
  }
}

/* Heart particles */
.heart-particle {
  position: absolute;
  width: 20px;
  height: 20px;
  animation: heartFloat 2s ease-out forwards;
}

@keyframes heartFloat {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-100px) scale(0.5);
  }
}
```

---

## Interactive Components

### Music Player
```css
.music-player {
  position: fixed;
  top: 0.5rem;
  right: 0.5rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: rgba(180, 46, 46, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
}

.music-icon {
  width: 0.6rem;
  height: 0.6rem;
}

.music-player.playing .music-icon {
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Message Modal
```css
.message-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  background: white;
  border-radius: 0.3rem;
  padding: 0.5rem;
  z-index: 2000;
}

.message-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1999;
}

.message-logo {
  width: 2rem;
  margin: 0 auto 0.3rem;
  display: block;
}

.message-title {
  text-align: center;
  font-size: 0.4rem;
  margin-bottom: 0.5rem;
}

.message-name-input {
  width: 100%;
  height: 1rem;
  border: 1px solid #ddd;
  border-radius: 0.1rem;
  padding: 0 0.3rem;
  margin-bottom: 0.3rem;
}

.message-textarea {
  width: 100%;
  height: 3rem;
  border: 1px solid #ddd;
  border-radius: 0.1rem;
  padding: 0.3rem;
  resize: none;
}

.message-send-button {
  width: 100%;
  height: 1rem;
  background: rgb(179, 14, 14);
  color: white;
  border: none;
  border-radius: 0.1rem;
  margin-top: 0.3rem;
  cursor: pointer;
}

.message-close {
  position: absolute;
  top: 0.3rem;
  right: 0.3rem;
  font-size: 0.5rem;
  cursor: pointer;
}
```

### Gift Bottom Sheet
```css
.gift-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60%;
  background: white;
  border-radius: 0.5rem 0.5rem 0 0;
  z-index: 2000;
  transform: translateY(100%);
  transition: transform 0.3s ease-out;
}

.gift-sheet.open {
  transform: translateY(0);
}

.gift-sheet-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
}

.gift-sheet-tab {
  flex: 1;
  padding: 0.4rem;
  text-align: center;
  cursor: pointer;
}

.gift-sheet-tab.active {
  color: rgb(179, 14, 14);
  border-bottom: 2px solid rgb(179, 14, 14);
}

.gift-effect-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem;
  background: #f9f9f9;
}

.gift-send-section {
  display: flex;
  padding: 0.3rem;
  gap: 0.3rem;
}

.gift-name-input {
  flex: 1;
  height: 1rem;
  border: 1px solid #ddd;
  border-radius: 0.1rem;
  padding: 0 0.3rem;
}

.gift-send-button {
  padding: 0 0.5rem;
  height: 1rem;
  background: rgb(116, 18, 18);
  color: white;
  border: none;
  border-radius: 0.1rem;
}
```

---

## Image Masks Reference

| Mask Name | File | Effect | Usage |
|-----------|------|--------|-------|
| Soft Vignette | `soft-vignette.png` | Circular soft edge fade | Hero photos |
| Fade Edges | `fade-edges.png` | All edges fade to transparent | Sparkle overlays |
| Right Fade | `right-fade.png` | Right side fades | Left-aligned photos |
| Top Fade | `top-fade.png` | Top fades to transparent | Bottom photo overlays |
| Artistic Frame | `artistic-frame.png` | Decorative border shape | Feature photos |
| Ornate Frame | `ornate-frame.png` | Elegant decorative frame | Portrait photos |
| Circular Soft | `circular-soft-edge.png` | Soft circular mask | Round photos |

---

## Animation Specifications

### Auto-Scroll (Optional)
```css
.auto-scroll-container {
  transform: translate3d(0px, 0px, 0px);
  transition: transform 42890ms linear;
}

/* Scrolls to final position over ~43 seconds */
```

### Scroll Reveal
```css
.scroll-reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.scroll-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Countdown Flip
```css
.flip-digit {
  perspective: 200px;
}

.flip-digit-inner {
  transition: transform 0.3s ease-in-out;
  transform-style: preserve-3d;
}

.flip-digit.flipping .flip-digit-inner {
  transform: rotateX(-180deg);
}
```

### Parallax Effect
```css
.parallax-layer {
  will-change: transform;
}

/* Apply different scroll speeds to different layers */
```

---

## Accessibility Considerations

```css
/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .music-player.playing .music-icon {
    animation: none;
  }

  .sparkle-overlay {
    display: none;
  }

  .auto-scroll-container {
    transition: none;
  }

  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus states for interactive elements */
button:focus,
input:focus,
textarea:focus {
  outline: 2px solid rgb(179, 14, 14);
  outline-offset: 2px;
}
```

---

## Performance Optimizations

1. **Image Loading**: Use lazy loading for images below the fold
2. **Sparkle GIFs**: Consider WebP or CSS animations as alternatives
3. **Font Loading**: Use `font-display: swap` for custom fonts
4. **Map Loading**: Lazy load map component when section is in view
5. **Countdown Timer**: Use `requestAnimationFrame` for smooth updates

---

## Implementation Notes

1. **Coordinate System**: All positions use absolute positioning with rem units
2. **Layer Order**: Use z-index strategically for overlays (sparkles on top)
3. **Font Loading**: Load custom fonts before rendering text elements
4. **Image Masks**: Use `-webkit-mask-image` with fallbacks
5. **Touch Events**: Ensure all interactive elements have proper touch targets (min 44px)
6. **Safe Areas**: Account for iPhone notch with `viewport-fit=cover`