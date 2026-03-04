import { useEffect, useMemo, useState } from 'react'
import { PaginationBar } from '../shared/TableControls'

const PAGE_SIZE = 10

const initialEntries = [
  { id: 'food-1', brand: 'Almarai', product: 'Full Fat Milk', servingSize: '250', servingUnit: 'ml', calories: '152', protein: '8', carbs: '12', fat: '8', barcode: '6281007102807' },
  { id: 'food-2', brand: 'Nestle', product: 'Coffee Mate Original', servingSize: '100', servingUnit: 'g', calories: '546', protein: '2', carbs: '57', fat: '35', barcode: '8850124020000' },
  { id: 'food-3', brand: 'Olipop', product: 'Cream Soda', servingSize: '355', servingUnit: 'ml', calories: '40', protein: '0', carbs: '17', fat: '0', barcode: '850027702186' },
  { id: 'food-4', brand: 'BRAGG', product: 'Liquid Aminos', servingSize: '5', servingUnit: 'ml', calories: '5', protein: '0', carbs: '0', fat: '0', barcode: '74305600005' },
  { id: 'food-5', brand: "Kellogg's", product: 'Special K', servingSize: '30', servingUnit: 'g', calories: '113', protein: '2', carbs: '25', fat: '0', barcode: '5053827185806' },
  { id: 'food-6', brand: 'bioa ORGANIC', product: 'Organic Coconut Agua', servingSize: '100', servingUnit: 'ml', calories: '84', protein: '1', carbs: '21', fat: '1', barcode: '5032722317772' },
  { id: 'food-7', brand: 'Apple Cider Vinegar', product: 'Tamimi Markets', servingSize: '100', servingUnit: 'g', calories: '0', protein: '0', carbs: '1', fat: '0', barcode: '2800003735552' },
  { id: 'food-8', brand: 'Almarai', product: 'Greek Yogurt', servingSize: '170', servingUnit: 'g', calories: '118', protein: '11', carbs: '7', fat: '4', barcode: '6281007034412' },
]

const emptyForm = {
  brand: '',
  product: '',
  servingSize: '100',
  servingUnit: 'g',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  barcode: '',
}

function validateFoodEntry(entry) {
  const errors = {}
  if (!String(entry?.brand || '').trim()) errors.brand = 'Brand is required.'
  if (!String(entry?.product || '').trim()) errors.product = 'Product is required.'
  if (!String(entry?.servingSize || '').trim() || Number(entry.servingSize) <= 0) errors.servingSize = 'Serving size must be greater than 0.'

  ;['calories', 'protein', 'carbs', 'fat'].forEach((key) => {
    const value = String(entry?.[key] ?? '').trim()
    if (value === '') {
      errors[key] = 'Required.'
      return
    }
    if (Number(value) < 0 || Number.isNaN(Number(value))) {
      errors[key] = 'Must be 0 or more.'
    }
  })

  return errors
}

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function SummaryCard({ label, value, note }) {
  return (
    <div className="rounded-2xl border border-[var(--fitco-border)] bg-[#fbfdfb] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b8d98]">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-[#203245]">{value}</p>
      <p className="mt-1 text-sm text-[#667b87]">{note}</p>
    </div>
  )
}

function Field({ label, children, span = '' }) {
  return (
    <label className={`block ${span}`}>
      <span className="mb-2 block text-sm font-semibold text-[#34475a]">{label}</span>
      {children}
    </label>
  )
}

function TableInput({ value, onChange, type = 'text', className = '', min, step, invalid = false }) {
  return (
    <input
      type={type}
      min={min}
      step={step}
      value={value}
      onChange={onChange}
      className={`h-9 w-full min-w-0 rounded-lg border bg-white px-3 text-sm text-[#2f3f4f] outline-none transition focus:ring-2 ${invalid ? 'border-[#e27d7d] focus:border-[#e27d7d] focus:ring-[#f7d8d8]' : 'border-[#ccdbcf] focus:border-[#81c987] focus:ring-[#d6edd8]'} ${className}`}
    />
  )
}

function TableSelect({ value, onChange, invalid = false }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`h-9 w-full min-w-0 rounded-lg border bg-white px-2 text-sm text-[#2f3f4f] outline-none transition focus:ring-2 ${invalid ? 'border-[#e27d7d] focus:border-[#e27d7d] focus:ring-[#f7d8d8]' : 'border-[#ccdbcf] focus:border-[#81c987] focus:ring-[#d6edd8]'}`}
    >
      <option value="g">g</option>
      <option value="ml">ml</option>
      <option value="piece">piece</option>
    </select>
  )
}

function ActionIcon({ type }) {
  if (type === 'edit') {
    return (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
    )
  }

  if (type === 'delete') {
    return (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
      </svg>
    )
  }

  if (type === 'save') {
    return (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    )
  }

  if (type === 'cancel') {
    return (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    )
  }

  return null
}

function IconButton({ label, children, className = '', ...props }) {
  return (
    <div className="group relative">
      <button type="button" aria-label={label} className={className} {...props}>
        {children}
      </button>
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 rounded-md bg-[#203245] px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100">
        {label}
      </span>
    </div>
  )
}

function PageToast({ toast }) {
  if (!toast) return null

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
        toast.type === 'error' ? 'border-[#f0d0d0] bg-[#fff6f6] text-[#c44d4d]' : 'border-[#cfe3d1] bg-[#f4fbf4] text-[#2f9b38]'
      }`}
    >
      {toast.message}
    </div>
  )
}

export default function FoodDatabasePage() {
  const [entries, setEntries] = useState(initialEntries)
  const [query, setQuery] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [page, setPage] = useState(1)
  const [editingRowId, setEditingRowId] = useState(null)
  const [rowDraft, setRowDraft] = useState(null)
  const [rowErrors, setRowErrors] = useState({})
  const [toast, setToast] = useState(null)

  const filteredEntries = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return entries

    return entries.filter((entry) =>
      [entry.brand, entry.product, entry.barcode].some((value) => String(value || '').toLowerCase().includes(keyword)),
    )
  }, [entries, query])

  const summary = useMemo(() => {
    const totalCalories = entries.reduce((sum, entry) => sum + toNumber(entry.calories), 0)
    const totalProtein = entries.reduce((sum, entry) => sum + toNumber(entry.protein), 0)

    return {
      totalItems: entries.length,
      avgCalories: entries.length ? Math.round(totalCalories / entries.length) : 0,
      avgProtein: entries.length ? (totalProtein / entries.length).toFixed(1) : '0.0',
    }
  }, [entries])

  useEffect(() => {
    setPage(1)
  }, [query])

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE))
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [filteredEntries.length, page])

  const paginatedEntries = useMemo(() => filteredEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredEntries, page])

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const pushToast = (message, type = 'success') => {
    setToast({ message, type })
    window.clearTimeout(pushToast.timeoutId)
    pushToast.timeoutId = window.setTimeout(() => setToast(null), 2400)
  }

  const resetForm = () => {
    setForm(emptyForm)
  }

  const handleSubmit = () => {
    if (!form.brand.trim() || !form.product.trim()) return

    setEntries((prev) => [
      {
        id: `food-${Date.now()}`,
        brand: form.brand.trim(),
        product: form.product.trim(),
        servingSize: form.servingSize.trim() || '100',
        servingUnit: form.servingUnit,
        calories: form.calories.trim() || '0',
        protein: form.protein.trim() || '0',
        carbs: form.carbs.trim() || '0',
        fat: form.fat.trim() || '0',
        barcode: form.barcode.trim(),
      },
      ...prev,
    ])

    resetForm()
    setPage(1)
  }

  const startRowEdit = (entry) => {
    setEditingRowId(entry.id)
    setRowDraft({ ...entry })
    setRowErrors({})
  }

  const cancelRowEdit = () => {
    setEditingRowId(null)
    setRowDraft(null)
    setRowErrors({})
  }

  const updateRowDraft = (key, value) => {
    setRowDraft((prev) => ({ ...prev, [key]: value }))
  }

  const saveRowEdit = () => {
    const nextErrors = validateFoodEntry(rowDraft || {})
    if (Object.keys(nextErrors).length) {
      setRowErrors(nextErrors)
      pushToast('Fix the highlighted row fields before saving.', 'error')
      return
    }

    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === editingRowId
          ? {
              ...entry,
              brand: rowDraft.brand.trim(),
              product: rowDraft.product.trim(),
              servingSize: String(rowDraft.servingSize || '100').trim(),
              servingUnit: rowDraft.servingUnit || 'g',
              calories: String(rowDraft.calories || '0').trim(),
              protein: String(rowDraft.protein || '0').trim(),
              carbs: String(rowDraft.carbs || '0').trim(),
              fat: String(rowDraft.fat || '0').trim(),
              barcode: String(rowDraft.barcode || '').trim(),
            }
          : entry,
      ),
    )

    pushToast('Food item updated successfully.')
    cancelRowEdit()
  }

  const handleDelete = (id) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
    if (editingRowId === id) {
      cancelRowEdit()
    }
    pushToast('Food item deleted.')
  }

  return (
    <div className="space-y-6">
      <PageToast toast={toast} />
      <section className="rounded-3xl border border-[var(--fitco-border)] bg-[#fbfdfb] p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8d98]">Food Database</p>
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-[#203245]">Add nutrition data cleanly</h3>
            <p className="mt-2 max-w-2xl text-sm text-[#667b87]">
              Built around the sheet structure from your screenshot, with the form first and the food list directly below it.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard label="Items" value={summary.totalItems} note="Total records" />
            <SummaryCard label="Avg Calories" value={summary.avgCalories} note="Per serving" />
            <SummaryCard label="Avg Protein" value={`${summary.avgProtein}g`} note="Per serving" />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--fitco-border)] bg-white p-5 md:p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-2xl font-bold tracking-tight text-[#203245]">New food item</h4>
            <p className="mt-1 text-sm text-[#667b87]">Keep entry simple and structured, like a cleaner version of the sheet.</p>
          </div>
          <div className="rounded-2xl border border-[#e4ece6] bg-[#f8fbf8] px-4 py-3 text-sm text-[#637884]">
            Fields: Brand, Product, Serving Size, Calories, Protein, Carbs, Fat, Barcode ID
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Brand">
            <input className="field" value={form.brand} onChange={(event) => handleChange('brand', event.target.value)} placeholder="Brand name" />
          </Field>

          <Field label="Product">
            <input className="field" value={form.product} onChange={(event) => handleChange('product', event.target.value)} placeholder="Product name" />
          </Field>

          <div className="grid grid-cols-[1fr_96px] gap-3 md:col-span-2 xl:col-span-1">
            <Field label="Serving Size">
              <input className="field" type="number" min="0" step="0.1" value={form.servingSize} onChange={(event) => handleChange('servingSize', event.target.value)} />
            </Field>

            <Field label="Unit">
              <select className="field" value={form.servingUnit} onChange={(event) => handleChange('servingUnit', event.target.value)}>
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="piece">piece</option>
              </select>
            </Field>
          </div>

          <Field label="Calories">
            <input className="field" type="number" min="0" step="0.1" value={form.calories} onChange={(event) => handleChange('calories', event.target.value)} />
          </Field>

          <Field label="Protein (g)">
            <input className="field" type="number" min="0" step="0.1" value={form.protein} onChange={(event) => handleChange('protein', event.target.value)} />
          </Field>

          <Field label="Carbs (g)">
            <input className="field" type="number" min="0" step="0.1" value={form.carbs} onChange={(event) => handleChange('carbs', event.target.value)} />
          </Field>

          <Field label="Fat (g)">
            <input className="field" type="number" min="0" step="0.1" value={form.fat} onChange={(event) => handleChange('fat', event.target.value)} />
          </Field>

          <Field label="Barcode ID" span="md:col-span-2 xl:col-span-2">
            <input className="field" value={form.barcode} onChange={(event) => handleChange('barcode', event.target.value)} placeholder="Barcode number" />
          </Field>

          <div className="flex flex-wrap items-end gap-3 md:col-span-2 xl:col-span-2">
            <button type="button" className="btn-primary w-auto px-6" onClick={handleSubmit}>
              Add Item
            </button>
            <button type="button" className="btn-outline w-auto px-6" onClick={resetForm}>
              Clear
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--fitco-border)] bg-white p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h4 className="text-2xl font-bold tracking-tight text-[#203245]">Food list</h4>
            <p className="mt-1 text-sm text-[#667b87]">Spreadsheet-style list with inline editing and pagination.</p>
          </div>

          <div className="w-full md:w-[280px]">
            <Field label="Search">
              <input
                className="field w-full"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search brand, product, barcode"
              />
            </Field>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--fitco-border)]">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[1060px] table-fixed border-collapse">
              <colgroup>
                <col className="w-14" />
                <col className="w-[150px]" />
                <col className="w-[200px]" />
                <col className="w-[150px]" />
                <col className="w-[120px]" />
                <col className="w-[120px]" />
                <col className="w-[120px]" />
                <col className="w-[120px]" />
                <col className="w-[170px]" />
                <col className="w-[88px]" />
              </colgroup>
              <thead className="bg-[#f6faf6]">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.14em] text-[#70828c]">
                  <th className="sticky top-0 z-10 w-14 border-b border-r border-[#e7efea] bg-[#f6faf6] px-3 py-3 text-center">#</th>
                  <th className="sticky top-0 z-10 border-b border-r border-[#e7efea] bg-[#f6faf6] px-4 py-3">Brand</th>
                  <th className="sticky top-0 z-10 border-b border-r border-[#e7efea] bg-[#f6faf6] px-4 py-3">Product</th>
                  <th className="sticky top-0 z-10 border-b border-r border-[#e7efea] bg-[#f6faf6] px-4 py-3">Serving Size</th>
                  <th className="sticky top-0 z-10 border-b border-r border-[#e7efea] bg-[#f6faf6] px-4 py-3">Calories</th>
                  <th className="sticky top-0 z-10 border-b border-r border-[#e7efea] bg-[#f6faf6] px-4 py-3">Protein</th>
                  <th className="sticky top-0 z-10 border-b border-r border-[#e7efea] bg-[#f6faf6] px-4 py-3">Carbs</th>
                  <th className="sticky top-0 z-10 border-b border-r border-[#e7efea] bg-[#f6faf6] px-4 py-3">Fat</th>
                  <th className="sticky top-0 z-10 border-b border-r border-[#e7efea] bg-[#f6faf6] px-4 py-3">Barcode ID</th>
                  <th className="sticky top-0 z-10 border-b bg-[#f6faf6] px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEntries.map((entry, index) => {
                  const isEditing = editingRowId === entry.id
                  const draft = isEditing ? rowDraft : entry
                  const isEven = index % 2 === 1
                  const stickyCellBg = isEditing ? '#ffffff' : isEven ? '#fcfdfc' : '#ffffff'

                  return (
                    <tr key={entry.id} className="border-t border-[#edf2ee] text-sm text-[#304250] transition hover:bg-[#f7fbf7] even:bg-[#fcfdfc]">
                      <td
                        className="sticky left-0 z-[1] border-r border-[#edf2ee] px-3 py-3 text-center text-xs font-semibold text-[#7b8d98]"
                        style={{ backgroundColor: stickyCellBg }}
                      >
                        {(page - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td className="border-r border-[#edf2ee] px-4 py-3">
                        {isEditing ? (
                          <div className="space-y-1">
                            <TableInput value={draft.brand} onChange={(event) => updateRowDraft('brand', event.target.value)} invalid={Boolean(rowErrors.brand)} />
                            {rowErrors.brand ? <p className="text-xs text-[#d94f4f]">{rowErrors.brand}</p> : null}
                          </div>
                        ) : (
                          <span className="block truncate font-semibold text-[#203245]">{entry.brand}</span>
                        )}
                      </td>
                      <td className="border-r border-[#edf2ee] px-4 py-3">
                        {isEditing ? (
                          <div className="space-y-1">
                            <TableInput value={draft.product} onChange={(event) => updateRowDraft('product', event.target.value)} invalid={Boolean(rowErrors.product)} />
                            {rowErrors.product ? <p className="text-xs text-[#d94f4f]">{rowErrors.product}</p> : null}
                          </div>
                        ) : (
                          <span className="block max-w-[180px] truncate" title={entry.product}>
                            {entry.product}
                          </span>
                        )}
                      </td>
                      <td className="border-r border-[#edf2ee] px-4 py-3">
                        {isEditing ? (
                          <div className="space-y-1">
                            <div className="grid grid-cols-[1fr_74px] gap-2">
                              <TableInput
                                type="number"
                                min="0"
                                step="0.1"
                                value={draft.servingSize}
                                onChange={(event) => updateRowDraft('servingSize', event.target.value)}
                                invalid={Boolean(rowErrors.servingSize)}
                              />
                              <TableSelect value={draft.servingUnit} onChange={(event) => updateRowDraft('servingUnit', event.target.value)} invalid={Boolean(rowErrors.servingSize)} />
                            </div>
                            {rowErrors.servingSize ? <p className="text-xs text-[#d94f4f]">{rowErrors.servingSize}</p> : null}
                          </div>
                        ) : (
                          <span className="block truncate">
                            {entry.servingSize}
                            {entry.servingUnit}
                          </span>
                        )}
                      </td>
                      <td className="border-r border-[#edf2ee] px-4 py-3">
                        {isEditing ? (
                          <div className="space-y-1">
                            <TableInput type="number" min="0" step="0.1" value={draft.calories} onChange={(event) => updateRowDraft('calories', event.target.value)} invalid={Boolean(rowErrors.calories)} />
                            {rowErrors.calories ? <p className="text-xs text-[#d94f4f]">{rowErrors.calories}</p> : null}
                          </div>
                        ) : (
                          entry.calories
                        )}
                      </td>
                      <td className="border-r border-[#edf2ee] px-4 py-3">
                        {isEditing ? (
                          <div className="space-y-1">
                            <TableInput type="number" min="0" step="0.1" value={draft.protein} onChange={(event) => updateRowDraft('protein', event.target.value)} invalid={Boolean(rowErrors.protein)} />
                            {rowErrors.protein ? <p className="text-xs text-[#d94f4f]">{rowErrors.protein}</p> : null}
                          </div>
                        ) : (
                          `${entry.protein}g`
                        )}
                      </td>
                      <td className="border-r border-[#edf2ee] px-4 py-3">
                        {isEditing ? (
                          <div className="space-y-1">
                            <TableInput type="number" min="0" step="0.1" value={draft.carbs} onChange={(event) => updateRowDraft('carbs', event.target.value)} invalid={Boolean(rowErrors.carbs)} />
                            {rowErrors.carbs ? <p className="text-xs text-[#d94f4f]">{rowErrors.carbs}</p> : null}
                          </div>
                        ) : (
                          `${entry.carbs}g`
                        )}
                      </td>
                      <td className="border-r border-[#edf2ee] px-4 py-3">
                        {isEditing ? (
                          <div className="space-y-1">
                            <TableInput type="number" min="0" step="0.1" value={draft.fat} onChange={(event) => updateRowDraft('fat', event.target.value)} invalid={Boolean(rowErrors.fat)} />
                            {rowErrors.fat ? <p className="text-xs text-[#d94f4f]">{rowErrors.fat}</p> : null}
                          </div>
                        ) : (
                          `${entry.fat}g`
                        )}
                      </td>
                      <td className="border-r border-[#edf2ee] px-4 py-3">
                        {isEditing ? (
                          <TableInput value={draft.barcode} onChange={(event) => updateRowDraft('barcode', event.target.value)} />
                        ) : (
                          <span className="block truncate text-xs text-[#667b87]">{entry.barcode || '-'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex flex-col gap-2">
                            <IconButton
                              label="Save"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#cfe3d1] bg-[#eef8ef] text-[#2f9b38]"
                              onClick={saveRowEdit}
                            >
                              <ActionIcon type="save" />
                            </IconButton>
                            <IconButton
                              label="Cancel"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#d7dfe3] text-[#5c6f7b]"
                              onClick={cancelRowEdit}
                            >
                              <ActionIcon type="cancel" />
                            </IconButton>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <IconButton
                              label="Edit"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#cfe3d1] text-[#2f9b38]"
                              onClick={() => startRowEdit(entry)}
                            >
                              <ActionIcon type="edit" />
                            </IconButton>
                            <IconButton
                              label="Delete"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#f0d0d0] text-[#d94f4f]"
                              onClick={() => handleDelete(entry.id)}
                            >
                              <ActionIcon type="delete" />
                            </IconButton>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {paginatedEntries.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-10 text-center text-sm text-[#6b7d88]">
                      No food items found for this search.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5">
          <PaginationBar currentPage={page} totalItems={filteredEntries.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </div>
      </section>
    </div>
  )
}
