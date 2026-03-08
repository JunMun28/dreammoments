# Unique Template Content & Layouts — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Give each of the 4 wedding templates unique section order, unique internal layouts, template-specific sections, and personality-matched sample content — so they feel like completely different products.

**Architecture:** Each template gets restructured independently: new section order in JSX, new internal layout patterns (horizontal vs vertical timeline, masonry vs polaroid gallery, etc.), template-exclusive sections (Entourage, Love Letter, Parents' Honor, Dress Code), and new sample content in `buildSampleContent()`. The `InvitationContent` type gets optional fields for template-specific data. Template configs (`src/templates/*.ts`) get updated section lists. Shared components (SectionShell, SectionTitle) remain unchanged.

**Tech Stack:** React, TypeScript, Tailwind CSS v4, Motion (motion/react), CSS custom properties.

**Key files to understand first:**
- `src/lib/types.ts` — `InvitationContent` type (lines 18-123)
- `src/components/templates/types.ts` — `TemplateInvitationProps`
- `src/data/sample-invitation.ts` — `buildSampleContent()` function
- `src/templates/*.ts` — template configs with `sections` arrays
- `src/components/templates/*/` — template TSX + CSS files
- `src/components/templates/SectionShell.tsx` — section wrapper (don't modify)
- `src/components/templates/SectionTitle.tsx` — bilingual section header (don't modify)
- `src/components/templates/animations.tsx` — shared animation components

**Current state:** All 4 templates render the identical section sequence: hero → countdown → announcement → couple → story → gallery → schedule → venue → rsvp → gift → footer. Each is ~1250 lines with identical structure but different styling.

---

## Task 1: Add template-specific fields to InvitationContent type

**Files:**
- Modify: `src/lib/types.ts`

**Step 1: Add optional fields for template-specific sections**

Add these optional fields to the `InvitationContent` interface (after the existing `gift?` field, before `musicUrl?`):

```typescript
/** Template-specific: Double Happiness entourage/wedding party */
weddingParty?: {
  groomsmen: Array<{ name: string; role: string; photoUrl?: string }>;
  bridesmaids: Array<{ name: string; role: string; photoUrl?: string }>;
};
/** Template-specific: Romantic Cinematic love letter */
loveLetter?: {
  from: string;
  message: string;
};
/** Template-specific: Romantic Cinematic highlights */
highlightsReel?: {
  videoUrl?: string;
  photos: Array<{ url: string; caption?: string }>;
};
/** Template-specific: Classical Chinese parents' honor */
parentsHonor?: {
  groomParents: { father: string; mother: string };
  brideParents: { father: string; mother: string };
  hostingLine: string;
};
/** Template-specific: Botanical Garden dress code */
dressCode?: {
  guidelines: string;
  doColors: string[];
  dontColors: string[];
  tips: string[];
};
```

**Step 2: Verify**

Run: `pnpm exec tsc --noEmit`

**Step 3: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add optional template-specific fields to InvitationContent

- weddingParty (Double Happiness entourage)
- loveLetter, highlightsReel (Romantic Cinematic)
- parentsHonor (Classical Chinese)
- dressCode (Botanical Garden)"
```

---

## Task 2: Update sample content for all 4 templates

**Files:**
- Modify: `src/data/sample-invitation.ts`

**Step 1: Update Double Happiness sample content**

In the `templateId === "double-happiness"` block, update the couple to match the "Midnight Opulence" personality and add entourage data:

```typescript
if (templateId === "double-happiness") {
  base.hero.partnerOneName = "俊明";
  base.hero.partnerTwoName = "诗婷";
  base.hero.tagline = "始于初见，止于终老";
  base.hero.heroImageUrl = "/photos/hero-couple.jpg";
  base.announcement.title = "我们结婚啦";
  base.announcement.message =
    "兜兜转转，我们终于走到了这一天。\n从相遇到相知，从心动到坚定，每一步都是命运最好的安排。\n诚邀生命中重要的你，来见证这场双向奔赴的圆满。\n好久不见，婚礼见。";
  base.announcement.formalText =
    "Together with our families, we joyfully invite you to share in our happiness as we exchange wedding vows.";
  base.couple.partnerOne = {
    fullName: "陈俊明",
    bio: "温柔踏实，热爱摄影与旅行。\n喜欢用镜头记录每一个心动瞬间。",
    photoUrl: "/photos/groom-portrait.jpg",
  };
  base.couple.partnerTwo = {
    fullName: "林诗婷",
    bio: "浪漫细腻，喜欢花艺与烘焙。\n相信每一天都值得用心经营。",
    photoUrl: "/photos/bride-portrait.jpg",
  };
  base.couple.contactPhone = "60123456789";
  base.story.milestones = [
    {
      date: "2020",
      title: "相遇 · First Meeting",
      description:
        "那年秋天的鸡尾酒吧开幕夜，一杯Old Fashioned，一段爵士乐，从此心里多了一个人。",
      photoUrl: "/photos/candid-laugh.jpg",
    },
    {
      date: "2022",
      title: "相恋 · Falling in Love",
      description:
        "从Art Deco建筑巡礼到深夜爵士酒吧，每一次约会都是一场精心策划的冒险。",
      photoUrl: "/photos/couple-walking.jpg",
    },
    {
      date: "2024",
      title: "相守 · The Promise",
      description:
        "在我们最爱的那家酒吧，萨克斯风响起的瞬间，他单膝跪下。",
      photoUrl: "/photos/ceremony-moment.jpg",
    },
    {
      date: "2025",
      title: "永远 · Forever Begins",
      description:
        "遇见你是故事的开始，走到底是人间的欢喜。\n往后余生，四季与你。",
      photoUrl: "/photos/couple-sunset.jpg",
    },
  ];
  base.gallery.photos = [
    { url: "/photos/hero-couple.jpg", caption: "执手偕老" },
    { url: "/photos/couple-walking.jpg", caption: "并肩同行" },
    { url: "/photos/candid-laugh.jpg", caption: "怦然心动" },
    { url: "/photos/garden-portrait.jpg", caption: "花前月下" },
    { url: "/photos/couple-sunset.jpg", caption: "余晖相伴" },
    { url: "/photos/reception-toast.jpg", caption: "举杯同庆" },
  ];
  base.schedule.events = [
    { time: "5:00 PM", title: "迎宾签到", description: "Welcome & Registration" },
    { time: "5:30 PM", title: "证婚仪式", description: "Wedding Ceremony" },
    { time: "6:00 PM", title: "合影留念", description: "Group Photos" },
    { time: "7:00 PM", title: "婚宴晚席", description: "Wedding Banquet" },
    { time: "9:30 PM", title: "答谢派对", description: "After Party" },
  ];
  base.weddingParty = {
    groomsmen: [
      { name: "张伟豪", role: "Best Man" },
      { name: "李建国", role: "Groomsman" },
      { name: "王志强", role: "Groomsman" },
    ],
    bridesmaids: [
      { name: "陈美玲", role: "Maid of Honor" },
      { name: "黄雅琳", role: "Bridesmaid" },
      { name: "刘诗雨", role: "Bridesmaid" },
    ],
  };
  base.footer.message =
    "往后余生，四季与你。\nFor the rest of our lives, every season with you.";
  base.footer.socialLinks = {
    instagram: "@dreammoments",
    hashtag: "#俊明诗婷大婚",
  };
}
```

**Step 2: Update Romantic Cinematic sample content**

Replace the `templateId === "romantic-cinematic"` block with cinematic couple + new fields:

```typescript
if (templateId === "romantic-cinematic") {
  base.hero.partnerOneName = "Zhi Hao";
  base.hero.partnerTwoName = "Mei Lin";
  base.hero.tagline = "A love story written in the stars";
  base.hero.heroImageUrl = "/photos/hero-couple.jpg";
  base.announcement.title = "We're Getting Married";
  base.announcement.message =
    "Like the best films, our love story began with a chance encounter and grew into something extraordinary.\nWe invite you to the next chapter.";
  base.announcement.formalText =
    "诚挚邀请您见证我们的幸福时刻。\n愿与您共同分享这份喜悦与感动。";
  base.couple.partnerOne = {
    fullName: "Tan Zhi Hao",
    bio: "A filmmaker at heart who found his leading lady.\nBelieves every sunset deserves an audience.",
    photoUrl: "/photos/groom-portrait.jpg",
  };
  base.couple.partnerTwo = {
    fullName: "Wong Mei Lin",
    bio: "Warm-hearted storyteller, chaser of golden hour.\nFinds poetry in the everyday.",
    photoUrl: "/photos/bride-portrait.jpg",
  };
  base.couple.contactPhone = "60123456789";
  base.story.milestones = [
    {
      date: "2019",
      title: "First Glance · 初见",
      description:
        "A film festival in George Town. Two strangers reaching for the same Wong Kar-wai poster. One smile, and the credits rolled on everything before.",
      photoUrl: "/photos/candid-laugh.jpg",
    },
    {
      date: "2021",
      title: "Falling Deep · 相恋",
      description:
        "Rooftop cinema dates, 3AM conversations about Chungking Express, and a love that developed like film — slowly, beautifully, in the dark.",
      photoUrl: "/photos/couple-walking.jpg",
    },
    {
      date: "2024",
      title: "The Promise · 承诺",
      description:
        "A Taipei sunrise, a vintage ring, and the only question that ever mattered. She said yes before he finished asking.",
      photoUrl: "/photos/ceremony-moment.jpg",
    },
    {
      date: "2025",
      title: "Forever After · 永远",
      description:
        "Every love story is beautiful, but ours is our favourite.\n往后余生，四季与你。",
      photoUrl: "/photos/couple-sunset.jpg",
    },
  ];
  base.gallery.photos = [
    { url: "/photos/hero-couple.jpg", caption: "Together always" },
    { url: "/photos/couple-walking.jpg", caption: "Side by side" },
    { url: "/photos/candid-laugh.jpg", caption: "Pure joy" },
    { url: "/photos/garden-portrait.jpg", caption: "Golden hour" },
    { url: "/photos/couple-sunset.jpg", caption: "Into the sunset" },
    { url: "/photos/reception-toast.jpg", caption: "Cheers to love" },
  ];
  base.schedule.events = [
    { time: "5:00 PM", title: "Guest Arrival", description: "Welcome & Registration" },
    { time: "5:30 PM", title: "Wedding Ceremony", description: "Exchange of Vows" },
    { time: "6:00 PM", title: "Group Photos", description: "Capture the memories" },
    { time: "7:00 PM", title: "Wedding Banquet", description: "Dinner & Celebrations" },
    { time: "9:30 PM", title: "After Party", description: "Dancing & Festivities" },
  ];
  base.loveLetter = {
    from: "Zhi Hao",
    message:
      "Mei Lin,\n\nI used to think the best stories were on screen. Then I met you, and realised ours was the one I'd been waiting to tell.\n\nYou are my favourite scene, my best take, my forever reel.\n\nSee you at the altar.\n\n— Z.H.",
  };
  base.highlightsReel = {
    photos: [
      { url: "/photos/candid-laugh.jpg", caption: "The way she laughs" },
      { url: "/photos/couple-walking.jpg", caption: "Sunday strolls" },
      { url: "/photos/ceremony-moment.jpg", caption: "That golden hour" },
      { url: "/photos/couple-sunset.jpg", caption: "Our favourite ending" },
    ],
  };
  base.footer.message =
    "Thank you for being part of our story.\n感谢您的祝福，期待与您在婚礼相见。";
  base.footer.socialLinks = {
    instagram: "@dreammoments",
    hashtag: "#ZhiHaoMeiLin",
  };
}
```

**Step 3: Update Classical Chinese sample content**

Replace the `templateId === "classical-chinese"` block — shorter, more formal, with parents' honor:

```typescript
if (templateId === "classical-chinese") {
  base.hero.partnerOneName = "张文杰";
  base.hero.partnerTwoName = "王雅琴";
  base.hero.tagline = "百年好合 · 永结同心";
  base.hero.heroImageUrl = "/photos/hero-couple.jpg";
  base.announcement.title = "谨定于良辰吉日";
  base.announcement.message =
    "谨择吉日，诚邀亲友，共证良缘，同贺新禧。\n愿得一心人，白首不相离。\n恭请光临，共襄盛举。";
  base.announcement.formalText =
    "We respectfully invite you to witness and celebrate our union on this auspicious day.";
  base.couple.partnerOne = {
    fullName: "张文杰",
    bio: "温文尔雅，精于书画，志在四方。\n以诗书为伴，以山水为友。",
    photoUrl: "/photos/groom-portrait.jpg",
  };
  base.couple.partnerTwo = {
    fullName: "王雅琴",
    bio: "端庄贤淑，才华横溢，琴棋书画皆通。\n以花为媒，以茶会友。",
    photoUrl: "/photos/bride-portrait.jpg",
  };
  base.couple.contactPhone = "60123456789";
  base.story.milestones = [
    {
      date: "2019",
      title: "初遇",
      description: "月下花前初相见，一顾倾城再顾倾国。\n缘分天定，那年春日的茶会上，目光交汇的瞬间，便已心动。",
      photoUrl: "/photos/candid-laugh.jpg",
    },
    {
      date: "2021",
      title: "情深",
      description: "执子之手，共赏四季风华。\n琴瑟和鸣，诗书唱和，日子平淡却温馨如画。",
      photoUrl: "/photos/couple-walking.jpg",
    },
    {
      date: "2024",
      title: "盟誓",
      description: "愿得一心人，白首不相离。\n以天地为证，以日月为鉴，许下一生一世的承诺。",
      photoUrl: "/photos/ceremony-moment.jpg",
    },
  ];
  // Classical Chinese: NO gallery photos (deliberate minimalism)
  base.gallery.photos = [];
  base.schedule.events = [
    { time: "5:00 PM", title: "迎宾入席", description: "Welcome & Seating" },
    { time: "5:30 PM", title: "证婚大典", description: "Wedding Ceremony" },
    { time: "6:00 PM", title: "合影留念", description: "Group Photos" },
    { time: "7:00 PM", title: "喜宴开席", description: "Wedding Banquet" },
    { time: "9:30 PM", title: "答谢宾客", description: "Thank You & Farewell" },
  ];
  base.parentsHonor = {
    groomParents: { father: "张建国", mother: "李淑芬" },
    brideParents: { father: "王明华", mother: "陈秀英" },
    hostingLine: "谨订于公历二〇二五年六月十五日（农历五月二十），假座新加坡君悦大酒店，敬备喜筵，恭请光临。",
  };
  base.footer.message =
    "百年好合，永结同心。\nA hundred years of harmony, hearts forever entwined.";
  base.footer.socialLinks = {
    instagram: "@dreammoments",
    hashtag: "#文杰雅琴喜结良缘",
  };
}
```

**Step 4: Update Botanical Garden sample content**

Replace the `templateId === "botanical-garden"` block — casual, nature-inspired, with dress code:

```typescript
if (templateId === "botanical-garden") {
  base.hero.partnerOneName = "Wei Lun";
  base.hero.partnerTwoName = "Mei Xin";
  base.hero.tagline = "Where love blooms eternal";
  base.hero.heroImageUrl = "/photos/hero-couple.jpg";
  base.announcement.title = "You're Invited";
  base.announcement.message =
    "We fell in love surrounded by nature, and we can't imagine saying 'I do' anywhere else.\nJoin us for a garden celebration of love, laughter, and happily ever after.";
  base.announcement.formalText =
    "诚挚邀请您来见证我们的幸福时刻，与我们共同庆祝爱的花开。";
  base.couple.partnerOne = {
    fullName: "Lim Wei Lun",
    bio: "Weekend hiker, weekday engineer.\nBelieves the best views are earned, not given.",
    photoUrl: "/photos/groom-portrait.jpg",
  };
  base.couple.partnerTwo = {
    fullName: "Chen Mei Xin",
    bio: "Botanical garden volunteer, watercolour painter.\nFinds magic in morning dew and wildflowers.",
    photoUrl: "/photos/bride-portrait.jpg",
  };
  base.couple.contactPhone = "60123456789";
  base.story.milestones = [
    {
      date: "2019",
      title: "First Meeting",
      description:
        "A Saturday morning volunteer shift at the botanical gardens. She was sketching orchids. He was lost looking for the herb garden. Neither left alone.",
    },
    {
      date: "2021",
      title: "Growing Together",
      description:
        "Waterfall hikes, farmers' market Sundays, and a balcony garden that somehow survived two moves. Our love took root.",
    },
    {
      date: "2024",
      title: "The Proposal",
      description:
        "A sunrise hike to our favourite hilltop. The mist cleared, the valley glowed gold, and he asked the only question that mattered.",
    },
  ];
  base.gallery.photos = [
    { url: "/photos/hero-couple.jpg", caption: "Under the canopy" },
    { url: "/photos/couple-walking.jpg", caption: "Trail companions" },
    { url: "/photos/candid-laugh.jpg", caption: "Sunday blooms" },
    { url: "/photos/garden-portrait.jpg", caption: "Our garden" },
    { url: "/photos/couple-sunset.jpg", caption: "Golden hour" },
    { url: "/photos/reception-toast.jpg", caption: "Cheers to us" },
  ];
  base.schedule.events = [
    { time: "4:00 PM", title: "Garden Welcome", description: "Drinks under the pergola" },
    { time: "4:30 PM", title: "Garden Ceremony", description: "Exchange of vows" },
    { time: "5:30 PM", title: "Golden Hour Photos", description: "Capture the light" },
    { time: "6:30 PM", title: "Garden Dinner", description: "Farm-to-table feast" },
    { time: "9:00 PM", title: "Sparkler Send-Off", description: "Light the way home" },
  ];
  base.dressCode = {
    guidelines: "Garden semi-formal. Think flowy fabrics and earthy tones.",
    doColors: ["Sage green", "Dusty rose", "Terracotta", "Cream", "Lavender"],
    dontColors: ["White", "Black", "Bright red"],
    tips: [
      "Wear comfortable shoes — the ceremony is on grass",
      "Bring a light layer for the evening breeze",
      "Hats and fascinators welcome",
    ],
  };
  base.footer.message =
    "Thank you for being part of our story.\nLove grows where you plant it.";
  base.footer.socialLinks = {
    instagram: "@dreammoments",
    hashtag: "#WeiLunMeiXin",
  };
}
```

**Step 5: Verify**

Run: `pnpm check --write && pnpm exec tsc --noEmit && pnpm test --run`

**Step 6: Commit**

```bash
git add src/data/sample-invitation.ts
git commit -m "feat: unique sample content for each template

- Double Happiness: jazz bar couple, entourage data
- Romantic Cinematic: film festival couple, love letter, highlights reel
- Classical Chinese: traditional couple, parents' honor, 3 milestones, no gallery
- Botanical Garden: nature couple, dress code, garden-themed events"
```

---

## Task 3: Restructure Double Happiness layout — Entourage + Horizontal Story + Masonry Gallery

**Files:**
- Modify: `src/templates/double-happiness.ts` (add entourage section to config)
- Modify: `src/components/templates/double-happiness/DoubleHappinessInvitation.tsx`
- Modify: `src/components/templates/double-happiness/double-happiness.css`

**Step 1: Add entourage section to template config**

In `src/templates/double-happiness.ts`, add a new section entry after `couple`:

```typescript
{
  id: "entourage",
  type: "entourage",
  defaultVisible: true,
  notes: "Wedding party grid with Art Deco hexagonal frames.",
  fields: [
    { id: "members", label: "Wedding party", type: "list" },
  ],
},
```

**Step 2: Restructure the component**

In `DoubleHappinessInvitation.tsx`, make these changes:

**New section order in JSX:**
1. hero (keep existing)
2. announcement (keep, move before countdown)
3. couple (keep existing layout)
4. **entourage** (NEW — wedding party grid)
5. story (CHANGE to horizontal scroll)
6. gallery (CHANGE to masonry grid)
7. countdown (move after gallery)
8. schedule (keep existing)
9. venue (keep existing)
10. rsvp (keep existing)
11. gift + footer (merge into one section)

**New Entourage section** — add after the couple section:

```tsx
{/* ENTOURAGE — Wedding Party Grid */}
<SectionShell
  sectionId="entourage"
  mode={mode}
  hidden={hiddenSections?.entourage}
  onSelect={onSectionSelect}
  onAiClick={onAiClick}
  className="dh-section-dark relative overflow-hidden px-6 py-20 sm:px-10"
>
  <div className="mx-auto max-w-4xl text-center">
    <SectionTitle zhLabel="伴郎伴娘" enHeading="Wedding Party" className="text-[#FAF7F2]" />
    <ArtDecoDivider className="my-8" />
    {data.weddingParty && (
      <div className="grid grid-cols-2 gap-x-12 gap-y-4 sm:grid-cols-3">
        <Stagger staggerDelay={0.1}>
          <div className="text-center">
            <p className="text-sm tracking-widest" style={{ ...accentFont, color: COLORS.accent }}>GROOMSMEN</p>
          </div>
          {data.weddingParty.groomsmen.map((g) => (
            <Reveal key={g.name} direction="up">
              <div className="py-2 text-center">
                <p className="text-base text-[#FAF7F2]" style={headingFont}>{g.name}</p>
                <p className="text-xs text-[#FAF7F2]/60" lang="en">{g.role}</p>
              </div>
            </Reveal>
          ))}
          <div className="text-center">
            <p className="text-sm tracking-widest" style={{ ...accentFont, color: COLORS.accent }}>BRIDESMAIDS</p>
          </div>
          {data.weddingParty.bridesmaids.map((b) => (
            <Reveal key={b.name} direction="up">
              <div className="py-2 text-center">
                <p className="text-base text-[#FAF7F2]" style={headingFont}>{b.name}</p>
                <p className="text-xs text-[#FAF7F2]/60" lang="en">{b.role}</p>
              </div>
            </Reveal>
          ))}
        </Stagger>
      </div>
    )}
  </div>
</SectionShell>
```

**Story section → horizontal scroll:**

Replace the vertical timeline with a CSS scroll-snap horizontal layout:

```tsx
{/* STORY — Horizontal Scroll Timeline */}
<SectionShell
  sectionId="story"
  mode={mode}
  hidden={hiddenSections?.story}
  onSelect={onSectionSelect}
  onAiClick={onAiClick}
  className="dh-section-cream relative overflow-hidden px-6 py-20 sm:px-10"
>
  <div className="mx-auto max-w-5xl">
    <SectionTitle zhLabel="我们的故事" enHeading="Our Story" />
    <ArtDecoDivider className="my-8" />

    {/* Horizontal scroll container */}
    <div className="dh-story-scroll -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 sm:-mx-10 sm:px-10">
      {data.story.milestones.map((m, i) => (
        <Reveal key={m.date} direction="up" delay={i * 0.1}>
          <div className="dh-story-card min-w-[280px] max-w-[320px] flex-shrink-0 snap-center rounded-lg border border-[rgba(201,169,110,0.2)] bg-white p-6 shadow-sm sm:min-w-[340px]">
            <p className="text-sm tracking-widest" style={{ ...accentFont, color: COLORS.primary }}>{m.date}</p>
            <h3 className="mt-2 text-xl" style={{ ...headingFont, color: COLORS.dark }}>{m.title}</h3>
            {m.photoUrl && (
              <img
                src={m.photoUrl || PLACEHOLDER_PHOTO}
                alt={m.title}
                className="mt-4 aspect-[4/3] w-full rounded object-cover"
                loading="lazy"
                decoding="async"
              />
            )}
            <p className="mt-3 text-sm leading-relaxed whitespace-pre-line" style={{ color: COLORS.dark }}>
              {m.description}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  </div>
</SectionShell>
```

**Gallery → masonry grid:**

Replace the `SwiperGallery` with a CSS columns masonry layout:

```tsx
{/* GALLERY — Masonry Grid */}
<SectionShell
  sectionId="gallery"
  mode={mode}
  hidden={hiddenSections?.gallery}
  onSelect={onSectionSelect}
  onAiClick={onAiClick}
  className="dh-section-white relative overflow-hidden px-6 py-20 sm:px-10"
>
  <div className="mx-auto max-w-4xl">
    <SectionTitle zhLabel="甜蜜瞬间" enHeading="Gallery" />
    <ArtDecoDivider className="my-8" />
    <Stagger staggerDelay={0.08}>
      <div className="columns-2 gap-4 sm:columns-3">
        {data.gallery.photos.map((photo) => (
          <div key={photo.url} className="mb-4 break-inside-avoid">
            <Reveal direction="scale">
              <div className="overflow-hidden rounded-lg border border-[rgba(201,169,110,0.15)]">
                <img
                  src={photo.url || PLACEHOLDER_PHOTO}
                  alt={photo.caption || "Wedding photo"}
                  className="w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                {photo.caption && (
                  <p className="bg-white px-3 py-2 text-center text-xs" style={{ ...headingFont, color: COLORS.muted }}>
                    {photo.caption}
                  </p>
                )}
              </div>
            </Reveal>
          </div>
        ))}
      </div>
    </Stagger>
  </div>
</SectionShell>
```

**Gift + Footer merge:** Combine gift section content into the footer section, removing the separate gift SectionShell.

**Step 3: Add CSS for horizontal story scroll**

In `double-happiness.css`, add:

```css
.dh-story-scroll {
  scrollbar-width: none;
}
.dh-story-scroll::-webkit-scrollbar {
  display: none;
}
.dh-story-card {
  transition: box-shadow 0.3s ease;
}
@media (hover: hover) {
  .dh-story-card:hover {
    box-shadow: 0 8px 32px rgba(201, 169, 110, 0.15);
  }
}
```

**Step 4: Remove SwiperGallery import** since this template no longer uses it. Keep it only if other components reference it from this file (they don't — each template imports independently).

**Step 5: Verify**

Run: `pnpm check --write && pnpm exec tsc --noEmit && pnpm test --run`

**Step 6: Commit**

```bash
git add src/templates/double-happiness.ts src/components/templates/double-happiness/
git commit -m "feat: unique layout for Double Happiness

- Add Entourage section with wedding party grid
- Story: horizontal scroll timeline with snap
- Gallery: masonry grid replacing Swiper carousel
- Gift merged into Footer section
- New section order: hero → announcement → couple → entourage → story → gallery → countdown → schedule → venue → rsvp → footer"
```

---

## Task 4: Restructure Romantic Cinematic layout — Love Letter + Overlapping Couple + Full-bleed Story + Highlights Reel + Guest Wishes

**Files:**
- Modify: `src/templates/romantic-cinematic.ts` (add new section configs)
- Modify: `src/components/templates/romantic-cinematic/RomanticCinematicInvitation.tsx`
- Modify: `src/components/templates/romantic-cinematic/romantic-cinematic.css`

**Step 1: Update template config sections**

Add sections for `loveLetter`, `highlightsReel`, and `extra` (guest wishes) in `romantic-cinematic.ts`.

**Step 2: Restructure the component**

New section order in JSX:
1. hero (keep — curtain ClipReveal)
2. **loveLetter** (NEW — italic serif on parchment card)
3. couple (CHANGE — overlapping portrait frames)
4. story (CHANGE — full-bleed alternating layout)
5. gallery (keep film strip, with tilt)
6. **highlightsReel** (NEW — large cinematic photo montage)
7. schedule (CHANGE — vertical timeline with clock icons, dark bg)
8. venue (keep, dark bg)
9. countdown (CHANGE — elegant minimal centered)
10. rsvp (CHANGE — single-column centered, dark bg)
11. **guestWishes** (NEW — scrolling wishes wall, use existing RSVP messages)
12. gift + footer (merge)

**Love Letter section:**
```tsx
{data.loveLetter && (
  <SectionShell sectionId="extra" mode={mode} hidden={hiddenSections?.extra}
    onSelect={onSectionSelect} onAiClick={onAiClick}
    className="rc-section-parchment relative overflow-hidden px-6 py-24 sm:px-10">
    <Reveal direction="blur" duration={1.2}>
      <div className="mx-auto max-w-lg text-center">
        <div className="rounded-xl border border-[rgba(194,86,107,0.15)] bg-white/60 px-8 py-12 shadow-sm backdrop-blur-sm">
          <p className="text-sm tracking-widest" style={{ ...accentFont, color: COLORS.primary }}>
            A LETTER FROM {data.loveLetter.from.toUpperCase()}
          </p>
          <DiamondDivider className="my-6" />
          <p className="whitespace-pre-line text-base leading-loose italic"
            style={{ ...headingFont, color: COLORS.dark }}>
            {data.loveLetter.message}
          </p>
        </div>
      </div>
    </Reveal>
  </SectionShell>
)}
```

**Couple → overlapping frames:**
```tsx
{/* Overlapping portrait layout */}
<div className="relative mx-auto max-w-md">
  <Reveal direction="left">
    <div className="relative z-10 ml-0 w-3/5 overflow-hidden rounded-lg shadow-lg">
      <img src={data.couple.partnerOne.photoUrl || PLACEHOLDER_PHOTO}
        alt={data.couple.partnerOne.fullName}
        className="aspect-[3/4] w-full object-cover" loading="lazy" decoding="async" />
    </div>
  </Reveal>
  <Reveal direction="right" delay={0.2}>
    <div className="relative z-20 -mt-24 ml-auto mr-0 w-3/5 overflow-hidden rounded-lg shadow-lg border-2 border-white">
      <img src={data.couple.partnerTwo.photoUrl || PLACEHOLDER_PHOTO}
        alt={data.couple.partnerTwo.fullName}
        className="aspect-[3/4] w-full object-cover" loading="lazy" decoding="async" />
    </div>
  </Reveal>
  <div className="mt-6 text-center">
    <h3 style={{ ...headingFont, color: COLORS.dark }} className="text-2xl">
      {data.couple.partnerOne.fullName} <span style={{ color: COLORS.primary }}>&</span> {data.couple.partnerTwo.fullName}
    </h3>
  </div>
</div>
```

**Story → full-bleed alternating:**
Each milestone takes full width. Photo is full-bleed, text overlays on a dark band. Alternate photo left/right.

```tsx
{data.story.milestones.map((m, i) => (
  <Reveal key={m.date} direction="up" duration={0.9} delay={i * 0.15}>
    <div className={`flex flex-col ${i % 2 === 1 ? "sm:flex-row-reverse" : "sm:flex-row"}`}>
      {m.photoUrl && (
        <div className="sm:w-1/2">
          <img src={m.photoUrl || PLACEHOLDER_PHOTO} alt={m.title}
            className="aspect-[16/9] w-full object-cover" loading="lazy" decoding="async" />
        </div>
      )}
      <div className="flex flex-col justify-center bg-[#1A1225] px-8 py-10 text-[#F8F5F0] sm:w-1/2">
        <p className="text-sm tracking-widest" style={{ ...accentFont, color: COLORS.accent }}>{m.date}</p>
        <h3 className="mt-2 text-2xl" style={headingFont}>{m.title}</h3>
        <p className="mt-3 text-sm leading-relaxed whitespace-pre-line opacity-80">{m.description}</p>
      </div>
    </div>
  </Reveal>
))}
```

**Highlights Reel section:**
```tsx
{data.highlightsReel && (
  <SectionShell sectionId="details" mode={mode} hidden={hiddenSections?.details}
    onSelect={onSectionSelect} onAiClick={onAiClick}
    className="rc-section-aubergine relative overflow-hidden px-6 py-20 sm:px-10">
    <div className="mx-auto max-w-5xl text-center">
      <SectionTitle zhLabel="精彩瞬间" enHeading="Highlights" className="text-[#F8F5F0]" />
      <DiamondDivider className="my-8" />
      <Stagger staggerDelay={0.1}>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {data.highlightsReel.photos.map((photo) => (
            <div key={photo.url} className="group relative overflow-hidden rounded-lg">
              <img src={photo.url || PLACEHOLDER_PHOTO} alt={photo.caption || "Highlight"}
                className="aspect-[16/10] w-full object-cover" loading="lazy" decoding="async" />
              {photo.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1A1225]/80 to-transparent p-3">
                  <p className="text-xs text-[#F8F5F0]" style={headingFont}>{photo.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Stagger>
    </div>
  </SectionShell>
)}
```

**RSVP → single-column centered** (instead of split layout):
```tsx
<div className="mx-auto max-w-md">
  {/* Single column form, no info panel */}
  <form ...>
    {/* Same fields, just in a single centered column */}
  </form>
</div>
```

**Step 3: Add CSS**

Add `.rc-overlapping-couple`, `.rc-fullbleed-story` styles in `romantic-cinematic.css`.

**Step 4: Verify + Commit**

```bash
git add src/templates/romantic-cinematic.ts src/components/templates/romantic-cinematic/
git commit -m "feat: unique layout for Romantic Cinematic

- Add Love Letter section (italic serif on parchment card)
- Couple: overlapping portrait frames
- Story: full-bleed alternating photo/text layout
- Add Highlights Reel section (cinematic photo montage)
- RSVP: single-column centered on dark bg
- Gift merged into Footer
- New section order: hero → loveLetter → couple → story → gallery → highlightsReel → schedule → venue → countdown → rsvp → footer"
```

---

## Task 5: Restructure Classical Chinese layout — Parents' Honor + Vertical Couple + Ink Scroll Story + Table Schedule + No Gallery/Countdown/Gift

**Files:**
- Modify: `src/templates/classical-chinese.ts`
- Modify: `src/components/templates/classical-chinese/ClassicalChineseInvitation.tsx`
- Modify: `src/components/templates/classical-chinese/classical-chinese.css`

**Step 1: Update template config**

Remove `gallery`, `countdown`, `gift` sections from the config. Add `parentsHonor` section (use type `"extra"`).

**Step 2: Restructure the component**

New section order (9 sections — shortest):
1. hero (keep — obsidian bg, DrawPath 囍)
2. **parentsHonor** (NEW — parents' names with honorifics)
3. announcement (CHANGE — add vertical Chinese text option)
4. couple (CHANGE — stacked vertically with seal stamps)
5. story (CHANGE — ink scroll feel, vertical flow, fewer milestones)
6. schedule (CHANGE — clean table layout)
7. venue (keep, minimal with vermillion border)
8. rsvp (CHANGE — compact single-column, vermillion buttons)
9. footer (no gift — angpao assumed)

**Parents' Honor section:**
```tsx
{data.parentsHonor && (
  <SectionShell sectionId="extra" mode={mode} hidden={hiddenSections?.extra}
    onSelect={onSectionSelect} onAiClick={onAiClick}
    className="cc-section-obsidian cc-ink-texture relative overflow-hidden px-6 py-20 sm:px-10">
    <Reveal direction="up">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-sm tracking-[0.5em]" style={{ ...accentFont, color: "#B8860B" }}>家 长</p>
        <p className="mt-1 text-xs tracking-widest text-[#F5F0E8]/50" lang="en">HOSTED BY</p>
        <BrushDivider className="my-8" />
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs tracking-widest text-[#B8860B]" style={accentFont}>新郎方</p>
            <p className="mt-2 text-lg text-[#F5F0E8]" style={headingFont}>{data.parentsHonor.groomParents.father}</p>
            <p className="text-lg text-[#F5F0E8]" style={headingFont}>{data.parentsHonor.groomParents.mother}</p>
          </div>
          <div>
            <p className="text-xs tracking-widest text-[#B8860B]" style={accentFont}>新娘方</p>
            <p className="mt-2 text-lg text-[#F5F0E8]" style={headingFont}>{data.parentsHonor.brideParents.father}</p>
            <p className="text-lg text-[#F5F0E8]" style={headingFont}>{data.parentsHonor.brideParents.mother}</p>
          </div>
        </div>
        <BrushDivider className="my-8" />
        <p className="text-sm leading-loose text-[#F5F0E8]/80 whitespace-pre-line" style={bodyFont}>
          {data.parentsHonor.hostingLine}
        </p>
      </div>
    </Reveal>
  </SectionShell>
)}
```

**Couple → stacked vertically with seal stamps:**
```tsx
<div className="mx-auto max-w-sm space-y-8">
  {[data.couple.partnerOne, data.couple.partnerTwo].map((partner, i) => (
    <Reveal key={partner.fullName} direction="up" delay={i * 0.2}>
      <div className="text-center">
        <img src={partner.photoUrl || PLACEHOLDER_PHOTO} alt={partner.fullName}
          className="mx-auto h-48 w-48 rounded-full border-2 border-[#B8860B] object-cover" loading="lazy" decoding="async" />
        <div className="cc-seal mx-auto mt-4">囍</div>
        <h3 className="mt-3 text-2xl" style={{ ...headingFont, color: COLORS.dark }}>{partner.fullName}</h3>
        <p className="mt-2 text-sm leading-relaxed whitespace-pre-line" style={{ color: COLORS.muted }}>{partner.bio}</p>
      </div>
    </Reveal>
  ))}
</div>
```

**Schedule → table layout:**
```tsx
<div className="mx-auto max-w-md">
  <Stagger staggerDelay={0.08}>
    {data.schedule.events.map((event) => (
      <div key={event.time} className="flex items-baseline border-b border-[rgba(184,134,11,0.15)] py-4">
        <span className="w-24 flex-shrink-0 text-sm" style={{ ...accentFont, color: COLORS.accent }}>{event.time}</span>
        <div className="flex-1">
          <p className="text-base" style={{ ...headingFont, color: COLORS.dark }}>{event.title}</p>
          <p className="text-xs" style={{ color: COLORS.muted }} lang="en">{event.description}</p>
        </div>
      </div>
    ))}
  </Stagger>
</div>
```

**Remove:** Gallery section, Countdown section, Gift section entirely from this template's JSX.

**Step 3: Verify + Commit**

```bash
git add src/templates/classical-chinese.ts src/components/templates/classical-chinese/
git commit -m "feat: unique layout for Classical Chinese

- Add Parents' Honor section with family names and honorifics
- Couple: stacked vertically with seal stamps
- Story: ink scroll vertical flow, 3 milestones only
- Schedule: clean table layout replacing cards
- Remove Gallery, Countdown, Gift (deliberate minimalism)
- New section order: hero → parentsHonor → announcement → couple → story → schedule → venue → rsvp → footer"
```

---

## Task 6: Restructure Botanical Garden layout — Asymmetric Couple + Organic Story Path + Polaroid Gallery + Dress Code

**Files:**
- Modify: `src/templates/botanical-garden.ts`
- Modify: `src/components/templates/botanical-garden/BotanicalGardenInvitation.tsx`
- Modify: `src/components/templates/botanical-garden/botanical-garden.css`

**Step 1: Update template config**

Add `dressCode` section (use type `"extra"`) after `gallery`.

**Step 2: Restructure the component**

New section order:
1. hero (keep — diagonal ClipReveal)
2. couple (CHANGE — asymmetric layout)
3. story (CHANGE — organic flowing path)
4. gallery (CHANGE — polaroid scattered)
5. **dressCode** (NEW — visual guide with swatches)
6. schedule (CHANGE — card grid with leaf icons)
7. venue (CHANGE — large map hero)
8. countdown (keep)
9. rsvp (keep, nature-themed)
10. gift + footer (merge)

**Couple → asymmetric layout:**
```tsx
<div className="mx-auto max-w-3xl">
  <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
    <Reveal direction="left" className="sm:w-3/5">
      <div className="overflow-hidden rounded-2xl">
        <img src={data.couple.partnerOne.photoUrl || PLACEHOLDER_PHOTO}
          alt={data.couple.partnerOne.fullName}
          className="aspect-[3/4] w-full object-cover" loading="lazy" decoding="async" />
      </div>
      <h3 className="mt-4 text-2xl" style={{ ...headingFont, color: COLORS.dark }}>{data.couple.partnerOne.fullName}</h3>
      <p className="mt-1 text-sm leading-relaxed whitespace-pre-line" style={{ color: COLORS.muted }}>{data.couple.partnerOne.bio}</p>
    </Reveal>
    <Reveal direction="right" delay={0.2} className="sm:mt-16 sm:w-2/5">
      <div className="overflow-hidden rounded-2xl">
        <img src={data.couple.partnerTwo.photoUrl || PLACEHOLDER_PHOTO}
          alt={data.couple.partnerTwo.fullName}
          className="aspect-[3/4] w-full object-cover" loading="lazy" decoding="async" />
      </div>
      <h3 className="mt-4 text-2xl" style={{ ...headingFont, color: COLORS.dark }}>{data.couple.partnerTwo.fullName}</h3>
      <p className="mt-1 text-sm leading-relaxed whitespace-pre-line" style={{ color: COLORS.muted }}>{data.couple.partnerTwo.bio}</p>
    </Reveal>
  </div>
</div>
```

**Gallery → polaroid scattered:**
```tsx
<Stagger staggerDelay={0.1}>
  <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-3">
    {data.gallery.photos.map((photo, i) => {
      const rotations = [-2, 1.5, -1, 2, -1.5, 0.5];
      const rotation = rotations[i % rotations.length];
      return (
        <Reveal key={photo.url} direction="scale">
          <div className="bg-white p-2 shadow-md"
            style={{ transform: `rotate(${rotation}deg)` }}>
            <img src={photo.url || PLACEHOLDER_PHOTO} alt={photo.caption || ""}
              className="aspect-square w-full object-cover" loading="lazy" decoding="async" />
            {photo.caption && (
              <p className="pb-1 pt-2 text-center text-xs" style={{ ...headingFont, color: COLORS.muted }}>
                {photo.caption}
              </p>
            )}
          </div>
        </Reveal>
      );
    })}
  </div>
</Stagger>
```

**Dress Code section:**
```tsx
{data.dressCode && (
  <SectionShell sectionId="extra" mode={mode} hidden={hiddenSections?.extra}
    onSelect={onSectionSelect} onAiClick={onAiClick}
    className="bg-section-sage relative overflow-hidden px-6 py-20 sm:px-10">
    <div className="mx-auto max-w-lg text-center">
      <SectionTitle zhLabel="着装指南" enHeading="Dress Code" />
      <BotanicalDivider className="my-8" />
      <Reveal direction="up">
        <p className="text-base leading-relaxed" style={{ color: COLORS.dark }}>{data.dressCode.guidelines}</p>
      </Reveal>
      <div className="mt-8 grid grid-cols-2 gap-6">
        <Reveal direction="left">
          <div>
            <p className="text-sm font-medium" style={{ color: COLORS.primary }}>Wear these colours</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {data.dressCode.doColors.map((c) => (
                <span key={c} className="rounded-full border border-[rgba(6,78,59,0.15)] bg-white px-3 py-1 text-xs"
                  style={{ color: COLORS.dark }}>{c}</span>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal direction="right">
          <div>
            <p className="text-sm font-medium" style={{ color: COLORS.accent }}>Please avoid</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {data.dressCode.dontColors.map((c) => (
                <span key={c} className="rounded-full border border-[rgba(194,87,26,0.15)] bg-white px-3 py-1 text-xs line-through opacity-60"
                  style={{ color: COLORS.dark }}>{c}</span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
      {data.dressCode.tips.length > 0 && (
        <Reveal direction="up" delay={0.2}>
          <ul className="mt-8 space-y-2 text-left text-sm" style={{ color: COLORS.muted }}>
            {data.dressCode.tips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span style={{ color: COLORS.primary }}>✦</span>
                {tip}
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </div>
  </SectionShell>
)}
```

**Step 3: Remove SwiperGallery import** from this template (replaced by polaroid grid). Remove `announcement` section from JSX — botanical doesn't need the separate formal block (fold its content into hero).

**Step 4: Verify + Commit**

```bash
git add src/templates/botanical-garden.ts src/components/templates/botanical-garden/
git commit -m "feat: unique layout for Botanical Garden

- Couple: asymmetric layout (60/40 offset)
- Gallery: polaroid scattered with random rotations
- Add Dress Code section with color swatches and tips
- Story: organic flowing path with curved SVG
- Gift merged into Footer, Announcement folded into hero
- New section order: hero → couple → story → gallery → dressCode → schedule → venue → countdown → rsvp → footer"
```

---

## Task 7: Final verification and test fixes

**Files:**
- Possibly modify: `src/tests/data-sample.test.ts`, `src/tests/templates-*.test.ts`

**Step 1: Run full check suite**

```bash
pnpm check --write
pnpm exec tsc --noEmit
pnpm test --run
pnpm build
```

**Step 2: Fix any failures**

- Test assertions may reference old sample content (partner names, section counts)
- Template config tests may check for specific section IDs
- Update test expectations to match new content and section structures

**Step 3: Commit fixes**

```bash
git commit -am "fix: update tests for unique template layouts and content"
```
