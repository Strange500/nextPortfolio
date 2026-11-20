'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

const ids = [
  'intro',
  'rust',
  'nix',
  'testing',
  'bitcoin',
  'missions',
  'contact'
]

const desktopSnapshot = () => matchMedia('(min-width: 900px)').matches
const subscribeDesktop = (update: () => void) => {
  const media = matchMedia('(min-width: 900px)')
  media.addEventListener('change', update)
  return () => media.removeEventListener('change', update)
}

/** One gesture advances one screen. The same window position drives the WASM scene. */
export default function StepNavigation({ lang }: { lang: 'fr' | 'en' }) {
  const [active, setActive] = useState(0)
  const desktop = useSyncExternalStore(
    subscribeDesktop,
    desktopSnapshot,
    () => false
  )
  const fr = lang === 'fr'
  useEffect(() => {
    if (!desktop) return
    const surface = document.querySelector<HTMLElement>('.narrative')!
    const panels = ids.map(id => document.getElementById(id)!)
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    let index = Math.max(0, ids.indexOf(location.hash.slice(1)))
    let frame = 0,
      total = 0,
      lastWheel = 0,
      locked = false,
      touchY = 0,
      needsRelease = false,
      touchScrolled = false
    const top = (i: number) =>
      panels[i].getBoundingClientRect().top +
      scrollY -
      Number(panels[i].dataset.sceneShift || 0)
    const reset = () => {
      total = 0
    }
    const go = (next: number, animate = true) => {
      next = Math.max(0, Math.min(ids.length - 1, next))
      // A gesture into the document boundary is a no-op, not a new scene.
      // Keep forced initialization/resize alignment available.
      if (animate && next === index && Math.abs(scrollY - top(next)) < 2) {
        reset()
        return
      }
      cancelAnimationFrame(frame)
      const start = scrollY,
        end = top(next),
        started = performance.now()
      const firstJourney =
        innerWidth >= 900 &&
        ((next === 1 && Math.abs(start - top(0)) < 2) ||
          (next === 0 && Math.abs(start - top(1)) < 2))
      index = next
      setActive(next)
      total = 0
      locked = true
      needsRelease = true
      surface.dataset.step = ids[index]
      surface.dataset.stepProgress = '0'
      surface.dataset.transitioning = 'true'
      history.replaceState(null, '', `#${ids[index]}`)
      const duration =
        !animate || media.matches ? 0 : firstJourney ? 2400 : 1100
      const tick = (now: number) => {
        const p = duration ? Math.min(1, (now - started) / duration) : 1
        // One continuous passage: no interior stop or separate cube clock.
        const eased = (1 - Math.cos(Math.PI * p)) / 2
        surface.dataset.stepProgress = String(p)
        scrollTo({ top: start + (end - start) * eased, behavior: 'instant' })
        if (p < 1) frame = requestAnimationFrame(tick)
        else {
          locked = false
          surface.dataset.transitioning = 'false'
        }
        // Draw after this exact scroll write, in the same display frame. The
        // scene must not compensate the preceding frame's scroll position for pinned text.
        window.dispatchEvent(
          new CustomEvent('portfolio-scene-frame', { detail: now })
        )
      }
      frame = requestAnimationFrame(tick)
    }
    const canScroll = (target: EventTarget | null, direction: number) => {
      let node = target instanceof Element ? target : null
      while (node && node !== surface) {
        const el = node as HTMLElement
        if (
          /auto|scroll/.test(getComputedStyle(el).overflowY) &&
          el.scrollHeight > el.clientHeight + 2 &&
          (direction > 0
            ? el.scrollTop + el.clientHeight < el.scrollHeight - 2
            : el.scrollTop > 2)
        )
          return true
        node = node.parentElement
      }
      return false
    }
    const wheel = (e: WheelEvent) => {
      if (e.target instanceof Element && e.target.closest('[data-cube-panel]'))
        return
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
      const now = performance.now(),
        gap = now - lastWheel
      lastWheel = now
      if (locked) {
        e.preventDefault()
        reset()
        return
      }
      if (needsRelease && gap < 180) {
        e.preventDefault()
        return
      }
      needsRelease = false
      if (canScroll(e.target, e.deltaY)) {
        reset()
        return
      }
      e.preventDefault()
      if (gap > 220 || Math.sign(total) !== Math.sign(e.deltaY)) reset()
      total +=
        e.deltaY *
        (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1)
      if (Math.abs(total) >= 100) go(index + Math.sign(total))
    }
    const key = (e: KeyboardEvent) => {
      if (e.target instanceof Element && e.target.closest('[data-cube-panel]'))
        return
      if (
        e.target instanceof Element &&
        e.target.closest(
          'input, textarea, select, button, summary, [contenteditable="true"], [role="menu"]'
        )
      )
        return
      if (e.key === ' ' && e.target instanceof Element && e.target.closest('a'))
        return
      const direction = ['ArrowDown', 'PageDown', ' '].includes(e.key)
        ? e.shiftKey
          ? -1
          : 1
        : ['ArrowUp', 'PageUp'].includes(e.key)
          ? -1
          : 0
      if (!direction && !['Home', 'End'].includes(e.key)) return
      if (direction && canScroll(e.target, direction)) return
      e.preventDefault()
      if (!locked)
        go(
          e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? ids.length - 1
              : index + direction
        )
    }
    const click = (e: MouseEvent) => {
      const a =
        e.target instanceof Element
          ? e.target.closest<HTMLAnchorElement>('a[href^="#"]')
          : null
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const next = ids.indexOf(a.hash.slice(1))
      if (next < 0) return
      e.preventDefault()
      e.stopPropagation()
      go(next)
    }
    const request = (e: Event) => {
      const next = ids.indexOf((e as CustomEvent<string>).detail)
      if (next >= 0) go(next)
    }
    const startTouch = (e: TouchEvent) => {
      if (
        e.target instanceof Element &&
        (e.target.closest('[data-cube-panel]') ||
          (surface.dataset.step === 'intro' &&
            e.target.closest('[data-cube-manipulation="true"]')))
      )
        return
      touchY = e.touches[0].clientY
      touchScrolled = e.touches.length !== 1
    }
    const moveTouch = (e: TouchEvent) => {
      if (
        e.target instanceof Element &&
        (e.target.closest('[data-cube-panel]') ||
          (surface.dataset.step === 'intro' &&
            e.target.closest('[data-cube-manipulation="true"]')))
      )
        return
      if (e.touches.length !== 1) return
      const delta = touchY - e.touches[0].clientY
      if (!locked && canScroll(e.target, delta)) {
        touchScrolled = true
        return
      }
      e.preventDefault()
    }
    const endTouch = (e: TouchEvent) => {
      if (
        e.target instanceof Element &&
        (e.target.closest('[data-cube-panel]') ||
          (surface.dataset.step === 'intro' &&
            e.target.closest('[data-cube-manipulation="true"]')))
      )
        return
      const delta = touchY - e.changedTouches[0].clientY
      if (!locked && !touchScrolled && Math.abs(delta) > 60)
        go(index + Math.sign(delta))
    }
    const focus = (e: FocusEvent) => {
      const next = panels.findIndex(panel => panel.contains(e.target as Node))
      if (next >= 0 && next !== index) go(next, false)
    }
    const resize = () => go(index, false)
    const hash = () => {
      const next = ids.indexOf(location.hash.slice(1))
      if (next >= 0) go(next)
    }
    surface.dataset.stepped = 'true'
    go(index, false)
    window.addEventListener('wheel', wheel, { passive: false })
    window.addEventListener('keydown', key)
    document.addEventListener('click', click, true)
    window.addEventListener('portfolio-step', request)
    window.addEventListener('touchstart', startTouch, { passive: true })
    window.addEventListener('touchmove', moveTouch, { passive: false })
    window.addEventListener('touchend', endTouch)
    window.addEventListener('resize', resize)
    window.addEventListener('hashchange', hash)
    document.addEventListener('focusin', focus)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('wheel', wheel)
      window.removeEventListener('keydown', key)
      document.removeEventListener('click', click, true)
      window.removeEventListener('portfolio-step', request)
      window.removeEventListener('touchstart', startTouch)
      window.removeEventListener('touchmove', moveTouch)
      window.removeEventListener('touchend', endTouch)
      window.removeEventListener('resize', resize)
      window.removeEventListener('hashchange', hash)
      document.removeEventListener('focusin', focus)
      delete surface.dataset.stepped
      delete surface.dataset.step
      delete surface.dataset.transitioning
      delete surface.dataset.stepProgress
    }
  }, [desktop])
  const request = (next: number) =>
    window.dispatchEvent(
      new CustomEvent('portfolio-step', { detail: ids[next] })
    )
  if (!desktop) return null
  return (
    <nav
      className='step-controls mono'
      aria-label={fr ? 'Navigation par étapes' : 'Step navigation'}
    >
      <button
        type='button'
        disabled={active === 0}
        onClick={() => request(active - 1)}
        aria-label={fr ? 'Étape précédente' : 'Previous step'}
      >
        ↑
      </button>
      <span aria-live='polite' aria-atomic='true'>
        {active + 1} / {ids.length}
      </span>
      <button
        type='button'
        disabled={active === ids.length - 1}
        onClick={() => request(active + 1)}
        aria-label={fr ? 'Étape suivante' : 'Next step'}
      >
        ↓
      </button>
    </nav>
  )
}
