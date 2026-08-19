# Issues Log

This mirrors the real GitHub Issues/PRs opened on this repo — kept here too
as a quick changelog.

---

### #2 — Contact form delivers to the wrong owner's email
**Type:** Bug · **Status:** ✅ Fixed in #6

The contact form (`pages/contact.html`) posted to a Formspree endpoint
(`formspree.io/f/maewlvza`) registered under `alaashamel32@gmail.com`.
This site belongs to Abdelrahman, so all messages were reaching the
wrong inbox.

**Fix:** switched the form's `action` to FormSubmit
(`https://formsubmit.co/abdo120056789.9@gmail.com`), which lets the
recipient be set directly in the endpoint URL. Added `_template=table`
and `_captcha=false` so the existing AJAX `fetch()` submit handler
keeps working without a redirect.

**Action needed from Abdelrahman:** FormSubmit requires a one-time
confirmation email the first time a message is sent to a new address —
check `abdo120056789.9@gmail.com` inbox (and spam) after the first test
submission and click confirm.

---

### #3 — Section nav (Training/Tools/Gym) never shows as active
**Type:** Bug · **Status:** ✅ Fixed in #7

Both the desktop dropdown and the mobile bottom-nav grouped menus only
highlighted the specific sub-link in accent color — the group
label/icon itself stayed unstyled even while on a page inside that
group, so it wasn't obvious which section a user was in.

**Fix:** `buildNavbar`/`buildMobileBottomNav` in `js/main.js` now check
if any child of a group matches the current page and color the parent
summary/label accordingly.

---

### #4 — Exercise animations look robotic / unrealistic
**Type:** Enhancement · **Status:** ✅ Fixed in #8

All motion keyframes (bench press, squat, deadlift hinge, curl, OHP,
lateral raise, pushdown, crunch...) used a flat symmetric ease-in-out
bounce with no sense of load or control.

**Fix:** rebuilt the keyframes with a real lifting tempo — slower
controlled eccentric (lowering), a short hold at peak contraction,
then a comparatively quicker concentric (lifting) phase — plus a live
rep counter badge on each card that increments in sync with the
animation loop. The mobile bottom nav was also polished (safe-area
support, animated active indicator, tap feedback) without being
removed or restructured.

---

### #5 — No way to save/bookmark favorite exercises
**Type:** Feature request · **Status:** ✅ Added in #9

Added a site-wide Favorites system (`js/favorites.js`):
- Heart toggle on every exercise card + a "Favorites only" filter.
- Favorites are scoped to the logged-in account (via the existing
  `js/auth.js` mock auth), with a guest bucket that auto-merges into
  the account on login/register.
- Profile page shows a live favorites count with a direct link to
  the filtered exercise list.

---

### Notes / things worth a follow-up issue later
- The auth system (`js/auth.js`) stores plaintext passwords in
  `localStorage` — fine for this demo/portfolio site, but flagged in
  case this ever needs to become a real backend.
- `pages/contact.html` still shows a placeholder phone number
  (`01000000000`) in the contact info card — replace with the real
  number when ready.
