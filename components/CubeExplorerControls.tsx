'use client'
import { useEffect, useRef, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { Layers, X, Pause, Play } from 'lucide-react'
import {
  contextTechnologies,
  technologyNote,
  technologySource,
  technologyTitle
} from '@/data/cube-context'
import type { CubeExplorer } from './useCubeExplorer'
const subscribeSlot = () => () => {}
const mobileControlsSlot = () => document.getElementById('mobile-cube-controls')

export default function CubeExplorerControls({
  explorer,
  lang
}: {
  explorer: CubeExplorer
  lang: 'fr' | 'en'
}) {
  const mobileTarget = useSyncExternalStore(
    subscribeSlot,
    mobileControlsSlot,
    () => null
  )
  const fr = lang === 'fr',
    { ui } = explorer,
    closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (ui.selected || ui.catalog)
      closeRef.current?.focus({ preventScroll: true })
  }, [ui.selected, ui.catalog])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (ui.selected || ui.catalog)) {
        e.preventDefault()
        explorer.close()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [explorer, ui.selected, ui.catalog])
  const names = contextTechnologies[ui.context] || []
  const source = ui.selected
    ? technologySource(ui.selected.name, ui.selected.context, lang)
    : undefined
  return (
    <>
      {mobileTarget &&
        createPortal(
          <>
            <button
              type='button'
              id='mobile-cube-catalog'
              onClick={explorer.catalog}
              aria-expanded={ui.catalog || !!ui.selected}
              aria-controls='cube-technology-panel'
            >
              {fr ? 'Les technologies' : 'Technologies'} ↗
            </button>
            <button
              type='button'
              id='mobile-cube-pause'
              onClick={explorer.pause}
              aria-pressed={ui.pause}
              aria-label={
                ui.pause
                  ? fr
                    ? 'Reprendre la rotation'
                    : 'Resume rotation'
                  : fr
                    ? 'Suspendre la rotation'
                    : 'Pause rotation'
              }
            >
              {ui.pause ? (
                <Play size={14} aria-hidden='true' />
              ) : (
                <Pause size={14} aria-hidden='true' />
              )}
            </button>
          </>,
          mobileTarget
        )}
      <svg className='cube-callout-wires' aria-hidden='true'>
        {Array.from({ length: 6 }, (_, face) => (
          <line key={face} data-face-wire={face} />
        ))}
      </svg>
      {Array.from({ length: 6 }, (_, face) => (
        <div
          className='cube-face-callout'
          key={face}
          data-face-callout={face}
          data-visible='false'
          aria-hidden='true'
        >
          <button
            type='button'
            tabIndex={-1}
            onPointerEnter={() => explorer.hover(face)}
            onPointerLeave={() => explorer.hover(null)}
            onFocus={() => explorer.hover(face)}
            onBlur={() => explorer.hover(null)}
            onClick={() => explorer.open(ui.names[face])}
          >
            <span>{technologyTitle(ui.names[face] || '')}</span>
            <small>
              {technologyNote(ui.names[face] || '', ui.context, fr)}
            </small>
          </button>
        </div>
      ))}
      {names.length > 0 && (
        <button
          id='cube-explore-trigger'
          type='button'
          className='cube-explore-trigger'
          aria-expanded={ui.catalog || !!ui.selected}
          aria-controls='cube-technology-panel'
          aria-label={fr ? 'Explorer les technologies' : 'Explore technologies'}
          onClick={explorer.catalog}
        >
          <Layers size={16} aria-hidden='true' />
          <span>{fr ? 'Technologies' : 'Technologies'}</span>
        </button>
      )}
      {(ui.catalog || ui.selected) && (
        <aside
          id='cube-technology-panel'
          data-cube-panel
          className='cube-technology-panel'
          role='dialog'
          aria-label={
            ui.selected
              ? technologyTitle(ui.selected.name)
              : fr
                ? 'Technologies de cette section'
                : 'Section technologies'
          }
        >
          <button
            ref={closeRef}
            className='cube-panel-close'
            type='button'
            aria-label={fr ? 'Fermer' : 'Close'}
            onClick={explorer.close}
          >
            <X size={18} />
          </button>
          {ui.selected ? (
            <>
              <p className='eyebrow'>
                {fr ? 'TECHNOLOGIE / CONTEXTE' : 'TECHNOLOGY / CONTEXT'}
              </p>
              <h3>{technologyTitle(ui.selected.name)}</h3>
              <p>{technologyNote(ui.selected.name, ui.selected.context, fr)}</p>
              {source && (
                <a className='text-link' href={source}>
                  {fr
                    ? 'Voir le projet ou sa source'
                    : 'View project or source'}{' '}
                  ↗
                </a>
              )}
            </>
          ) : (
            <>
              <h3>{fr ? 'Technologies' : 'Technologies'}</h3>
              <p>
                {fr
                  ? 'Choisissez une technologie pour la découvrir.'
                  : 'Choose a technology to explore it.'}
              </p>
              <div className='cube-technology-list'>
                {names.map(name => (
                  <button
                    type='button'
                    key={name}
                    onClick={() => explorer.open(name)}
                  >
                    {technologyTitle(name)}
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>
      )}
    </>
  )
}
