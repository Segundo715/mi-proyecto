"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import {
  FloorPlan,
  RestaurantTable,
  TableType,
  TYPE_META,
  STATUS_META,
  STATUS_ORDER,
  FLOOR_PLAN_STORAGE_KEY,
  newTableId,
} from "./types"
import FloorToolbar from "./FloorToolbar"
import TablePropertiesPanel from "./TablePropertiesPanel"

// react-konva no soporta SSR: el lienzo se carga solo en cliente.
const FloorCanvas = dynamic(() => import("./FloorCanvas"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center rounded-xl"
      style={{ height: 600, background: "#0b1020", color: "var(--ad-sub)" }}
    >
      Cargando lienzo…
    </div>
  ),
})

const PLAN_WIDTH = 1000
const PLAN_HEIGHT = 600
const GRID_SIZE = 25

const S = {
  card: "var(--ad-card)",
  accent: "var(--ad-accent)",
  text: "var(--ad-text)",
  sub: "var(--ad-sub)",
  border: "var(--ad-border)",
}

function emptyPlan(): FloorPlan {
  return {
    id: "plan-1",
    restaurantId: "default",
    name: "Plano principal",
    width: PLAN_WIDTH,
    height: PLAN_HEIGHT,
    tables: [],
  }
}

// Plano de ejemplo para el primer arranque (si no hay nada guardado).
function seedPlan(): FloorPlan {
  const plan = emptyPlan()
  plan.tables = [
    { id: newTableId(), name: "M1", type: "round",     capacity: 4, x: 160, y: 140, width: 80,  height: 80,  rotation: 0, zone: "Salón",   status: "free" },
    { id: newTableId(), name: "M2", type: "square",    capacity: 2, x: 320, y: 140, width: 70,  height: 70,  rotation: 0, zone: "Salón",   status: "occupied" },
    { id: newTableId(), name: "M3", type: "rectangle", capacity: 6, x: 540, y: 160, width: 130, height: 70,  rotation: 0, zone: "Salón",   status: "reserved" },
    { id: newTableId(), name: "Barra", type: "bar",    capacity: 8, x: 360, y: 360, width: 320, height: 42,  rotation: 0, zone: "Barra",   status: "free" },
  ]
  return plan
}

export default function FloorPlanEditor() {
  const [plan, setPlan] = useState<FloorPlan>(emptyPlan)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const [preview, setPreview] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const loadedRef = useRef(false)

  const flash = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 1800)
  }

  // --- Cargar el acomodo guardado al montar (o sembrar uno de ejemplo) ---
  useEffect(() => {
    // Hidratación desde localStorage: solo posible tras montar en el cliente.
    // La regla set-state-in-effect es un falso positivo para esta carga única.
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = localStorage.getItem(FLOOR_PLAN_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as FloorPlan
        if (parsed && Array.isArray(parsed.tables)) {
          setPlan({ ...emptyPlan(), ...parsed })
          loadedRef.current = true
          return
        }
      }
    } catch {
      // ignore
    }
    setPlan(seedPlan())
    loadedRef.current = true
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  const selected = plan.tables.find(t => t.id === selectedId) ?? null

  // --- Mutaciones de mesas ---
  const upsertTable = useCallback((table: RestaurantTable) => {
    setPlan(p => ({ ...p, tables: p.tables.map(t => (t.id === table.id ? table : t)) }))
    setDirty(true)
  }, [])

  const patchSelected = useCallback((patch: Partial<RestaurantTable>) => {
    if (!selectedId) return
    setPlan(p => ({ ...p, tables: p.tables.map(t => (t.id === selectedId ? { ...t, ...patch } : t)) }))
    setDirty(true)
  }, [selectedId])

  const addTable = (type: TableType) => {
    const m = TYPE_META[type]
    const table: RestaurantTable = {
      id: newTableId(),
      name: `M${plan.tables.length + 1}`,
      type,
      capacity: m.defaultCapacity,
      x: PLAN_WIDTH / 2 + (plan.tables.length % 5) * 12,
      y: PLAN_HEIGHT / 2 + (plan.tables.length % 5) * 12,
      width: m.defaultWidth,
      height: m.defaultHeight,
      rotation: 0,
      zone: "Salón",
      status: "free",
    }
    setPlan(p => ({ ...p, tables: [...p.tables, table] }))
    setSelectedId(table.id)
    setDirty(true)
  }

  const duplicateSelected = () => {
    if (!selected) return
    const copy: RestaurantTable = {
      ...selected,
      id: newTableId(),
      name: selected.name + " copia",
      x: selected.x + 30,
      y: selected.y + 30,
    }
    setPlan(p => ({ ...p, tables: [...p.tables, copy] }))
    setSelectedId(copy.id)
    setDirty(true)
  }

  const deleteSelected = () => {
    if (!selectedId) return
    setPlan(p => ({ ...p, tables: p.tables.filter(t => t.id !== selectedId) }))
    setSelectedId(null)
    setDirty(true)
  }

  const clearPlan = () => {
    if (!window.confirm("¿Vaciar el plano? Se quitarán todas las mesas (no se guarda hasta que pulses Guardar).")) return
    setPlan(p => ({ ...p, tables: [] }))
    setSelectedId(null)
    setDirty(true)
  }

  // --- Persistencia ---
  const save = () => {
    try {
      localStorage.setItem(FLOOR_PLAN_STORAGE_KEY, JSON.stringify(plan))
      setDirty(false)
      flash("Acomodo guardado ✓")
    } catch {
      flash("No se pudo guardar")
    }
  }

  const load = () => {
    try {
      const raw = localStorage.getItem(FLOOR_PLAN_STORAGE_KEY)
      if (!raw) return flash("No hay acomodo guardado")
      const parsed = JSON.parse(raw) as FloorPlan
      setPlan({ ...emptyPlan(), ...parsed })
      setSelectedId(null)
      setDirty(false)
      flash("Acomodo cargado ✓")
    } catch {
      flash("No se pudo cargar")
    }
  }

  // Atajo: Supr/Backspace elimina la mesa seleccionada (si no se está escribiendo).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId && !preview) {
        e.preventDefault()
        deleteSelected()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, preview])

  return (
    <div className="space-y-3">
      {/* Encabezado del módulo */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-black" style={{ color: S.text }}>Editor Visual de Plano de Mesas</h2>
          <p className="text-xs" style={{ color: S.sub }}>
            Arrastra para mover · selecciona para editar · usa las esquinas para rotar/redimensionar
          </p>
        </div>
        {/* Leyenda de estados */}
        <div className="flex flex-wrap gap-2">
          {STATUS_ORDER.map(st => (
            <span key={st} className="flex items-center gap-1 text-[11px]" style={{ color: S.sub }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_META[st].color }} />
              {STATUS_META[st].label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <FloorToolbar
          showGrid={showGrid}
          preview={preview}
          tableCount={plan.tables.length}
          dirty={dirty}
          onAddTable={addTable}
          onToggleGrid={() => setShowGrid(g => !g)}
          onTogglePreview={() => { setPreview(p => !p); setSelectedId(null) }}
          onSave={save}
          onLoad={load}
          onClear={clearPlan}
        />

        <div className="flex-1 min-w-0 rounded-2xl p-2" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
          <FloorCanvas
            tables={plan.tables}
            selectedId={selectedId}
            showGrid={showGrid}
            gridSize={GRID_SIZE}
            preview={preview}
            planWidth={plan.width}
            planHeight={plan.height}
            onSelect={setSelectedId}
            onChange={upsertTable}
          />
        </div>

        {!preview && (
          <TablePropertiesPanel
            table={selected}
            onChange={patchSelected}
            onDuplicate={duplicateSelected}
            onDelete={deleteSelected}
          />
        )}
      </div>

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm font-bold shadow-xl"
          style={{ backgroundColor: S.accent, color: "#000" }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
