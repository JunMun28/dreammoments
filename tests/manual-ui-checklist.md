# Manual UI Checklist

## Animations
- Hero blob motion smooth, no jank
- Scroll reveal works, no flicker
- `prefers-reduced-motion` disables motion

## Accessibility
- Skip link focuses `#main`
- Keyboard: tab order sane, buttons + section shells Enter/Space
- Form labels readable, aria labels on RSVP inputs
- Contrast OK on hero + buttons

## Responsiveness
- 375/768/1024/1440: layout stable
- Header menu not overflow on mobile
- Editor mobile: preview/edit toggle, inline edit works

## Cross-browser
- Chrome desktop: full flows
- iOS Safari: invite + RSVP, editor preview
- Android Chrome: invite + RSVP, dashboard
