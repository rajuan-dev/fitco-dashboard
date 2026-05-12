import { useCallback, useDeferredValue, useEffect, useState } from 'react'
import { PaginationBar } from '../shared/TableControls'
import { api } from '../../../services/api'

const PAGE_SIZE = 10

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

function toCsvValue(value) {
  const text = String(value ?? '')
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function downloadCsv(filename, headers, rows) {
  const csv = [headers.join(','), ...rows.map((row) => row.map((value) => toCsvValue(value)).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
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
      dir={type === 'text' ? 'auto' : undefined}
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

const normalizeFoodItem = (entry) => ({
  id: entry?._id || entry?.id || '',
  brand: String(entry?.brand || ''),
  product: String(entry?.product || ''),
  servingSize: String(entry?.servingSize ?? ''),
  servingUnit: String(entry?.servingUnit || 'g'),
  calories: String(entry?.calories ?? '0'),
  protein: String(entry?.protein ?? '0'),
  carbs: String(entry?.carbs ?? '0'),
  fat: String(entry?.fat ?? '0'),
  barcode: String(entry?.barcode || ''),
})

export default function FoodDatabasePage() {
  const [entries, setEntries] = useState([])
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const [form, setForm] = useState(emptyForm)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [editingRowId, setEditingRowId] = useState(null)
  const [rowDraft, setRowDraft] = useState(null)
  const [rowErrors, setRowErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [reloadTick, setReloadTick] = useState(0)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: PAGE_SIZE, pages: 1 })
  const [summary, setSummary] = useState({ totalItems: 0, avgCalories: 0, avgProtein: '0.0' })
  const [selectedCsvFileName, setSelectedCsvFileName] = useState('')
  const [lastImportResult, setLastImportResult] = useState(null)

  useEffect(() => {
    setPage(1)
  }, [deferredQuery])

  const pushToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    window.clearTimeout(pushToast.timeoutId)
    pushToast.timeoutId = window.setTimeout(() => setToast(null), 2400)
  }, [])

  useEffect(() => {
    let mounted = true

    const loadFoods = async () => {
      setLoading(true)
      try {
        const payload = await api.listFoodDatabase({ page, limit: PAGE_SIZE, search: deferredQuery.trim() })
        if (!mounted) return

        const rows = Array.isArray(payload?.data) ? payload.data.map(normalizeFoodItem) : []
        setEntries(rows)
        setPagination(payload?.pagination || { total: rows.length, page, limit: PAGE_SIZE, pages: 1 })
        setSummary({
          totalItems: Number(payload?.summary?.totalItems || 0),
          avgCalories: Number(payload?.summary?.avgCalories || 0),
          avgProtein: Number(payload?.summary?.avgProtein || 0).toFixed(1),
        })
      } catch (error) {
        if (!mounted) return
        setEntries([])
        setPagination({ total: 0, page: 1, limit: PAGE_SIZE, pages: 1 })
        setSummary({ totalItems: 0, avgCalories: 0, avgProtein: '0.0' })
        pushToast(error?.payload?.message || error?.message || 'Failed to load food database.', 'error')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadFoods()
    return () => {
      mounted = false
    }
  }, [deferredQuery, page, pushToast, reloadTick])

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const resetForm = () => {
    setForm(emptyForm)
  }

  const refreshFoods = (nextPage = page) => {
    setPage(nextPage)
    setReloadTick((prev) => prev + 1)
  }

  const handleSubmit = async () => {
    const errors = validateFoodEntry(form)
    if (Object.keys(errors).length) {
      pushToast('Complete the required food fields before saving.', 'error')
      return
    }

    setSubmitting(true)
    try {
      await api.createFoodItem({
        brand: form.brand.trim(),
        product: form.product.trim(),
        servingSize: Number(form.servingSize),
        servingUnit: form.servingUnit,
        calories: Number(form.calories),
        protein: Number(form.protein),
        carbs: Number(form.carbs),
        fat: Number(form.fat),
        barcode: form.barcode.trim(),
      })

      resetForm()
      refreshFoods(1)
      pushToast('Food item created successfully.')
    } catch (error) {
      pushToast(error?.payload?.message || error?.message || 'Failed to create food item.', 'error')
    } finally {
      setSubmitting(false)
    }
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

  const saveRowEdit = async () => {
    const nextErrors = validateFoodEntry(rowDraft || {})
    if (Object.keys(nextErrors).length) {
      setRowErrors(nextErrors)
      pushToast('Fix the highlighted row fields before saving.', 'error')
      return
    }

    try {
      await api.updateFoodItem({
        foodId: editingRowId,
        brand: rowDraft.brand.trim(),
        product: rowDraft.product.trim(),
        servingSize: Number(rowDraft.servingSize),
        servingUnit: rowDraft.servingUnit,
        calories: Number(rowDraft.calories),
        protein: Number(rowDraft.protein),
        carbs: Number(rowDraft.carbs),
        fat: Number(rowDraft.fat),
        barcode: rowDraft.barcode.trim(),
      })

      cancelRowEdit()
      refreshFoods()
      pushToast('Food item updated successfully.')
    } catch (error) {
      pushToast(error?.payload?.message || error?.message || 'Failed to update food item.', 'error')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.deleteFoodItem({ foodId: id })
      if (editingRowId === id) {
        cancelRowEdit()
      }
      refreshFoods()
      pushToast('Food item deleted.')
    } catch (error) {
      pushToast(error?.payload?.message || error?.message || 'Failed to delete food item.', 'error')
    }
  }

  const handleCsvFileSelected = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedCsvFileName(file.name)
    setImporting(true)

    try {
      const csvContent = await file.text()
      const result = await api.importFoodDatabaseCsv({ csvContent })
      setLastImportResult(result)
      refreshFoods(1)
      pushToast(
        `CSV import finished. Imported: ${result?.importedCount || 0}, updated: ${result?.updatedCount || 0}, skipped: ${result?.skippedCount || 0}.`,
        result?.skippedCount ? 'error' : 'success',
      )
    } catch (error) {
      pushToast(error?.payload?.message || error?.message || 'Failed to import CSV.', 'error')
    } finally {
      setImporting(false)
      event.target.value = ''
    }
  }

  const downloadNormalizedRows = () => {
    if (!lastImportResult?.normalizedRows?.length) return
    downloadCsv(
      'food-database-normalized.csv',
      ['brand', 'product', 'servingSize', 'servingUnit', 'calories', 'protein', 'carbs', 'fat', 'barcode'],
      lastImportResult.normalizedRows.map((row) => [
        row.brand,
        row.product,
        row.servingSize,
        row.servingUnit,
        row.calories,
        row.protein,
        row.carbs,
        row.fat,
        row.barcode || '',
      ]),
    )
  }

  const downloadFailedRows = () => {
    if (!lastImportResult?.errors?.length) return
    downloadCsv(
      'food-database-import-errors.csv',
      ['rowNumber', 'error', 'rawLine'],
      lastImportResult.errors.map((row) => [row.rowNumber, row.error, row.rawLine || '']),
    )
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
              Connected to the backend food database with paginated search, create, update, delete, and barcode-ready storage.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard label="Items" value={summary.totalItems} note="Total records" />
            <SummaryCard label="Avg Calories" value={summary.avgCalories} note="Across current result set" />
            <SummaryCard label="Avg Protein" value={`${summary.avgProtein}g`} note="Across current result set" />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--fitco-border)] bg-white p-5 md:p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-2xl font-bold tracking-tight text-[#203245]">New food item</h4>
            <p className="mt-1 text-sm text-[#667b87]">Create food records that match the dashboard table and persist through the API.</p>
          </div>
          <div className="rounded-2xl border border-[#e4ece6] bg-[#f8fbf8] px-4 py-3 text-sm text-[#637884]">
            Fields: Brand, Product, Serving Size, Calories, Protein, Carbs, Fat, Barcode ID
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Brand">
            <input className="field" dir="auto" value={form.brand} onChange={(event) => handleChange('brand', event.target.value)} placeholder="Brand name" />
          </Field>

          <Field label="Product">
            <input className="field" dir="auto" value={form.product} onChange={(event) => handleChange('product', event.target.value)} placeholder="Product name" />
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
            <button type="button" className="btn-primary w-auto px-6" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Add Item'}
            </button>
            <button type="button" className="btn-outline w-auto px-6" onClick={resetForm} disabled={submitting}>
              Clear
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#e4ece6] bg-[#fbfdfb] p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h5 className="text-lg font-semibold text-[#203245]">Import original CSV</h5>
              <p className="text-sm text-[#667b87]">Upload the original sheet CSV. The importer will normalize serving sizes and skip broken rows safely.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[#cfe3d1] bg-white px-4 py-2 text-sm font-semibold text-[#2f9b38]">
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvFileSelected} disabled={importing} />
              {importing ? 'Importing CSV...' : 'Choose CSV'}
            </label>
          </div>
          {selectedCsvFileName ? <p className="mt-3 text-sm text-[#5c6f7b]">Selected file: {selectedCsvFileName}</p> : null}
          {lastImportResult ? (
            <div className="mt-4 rounded-2xl border border-[#dfe8e1] bg-white p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <SummaryCard label="Imported" value={lastImportResult.importedCount || 0} note="New rows created" />
                <SummaryCard label="Updated" value={lastImportResult.updatedCount || 0} note="Existing rows refreshed" />
                <SummaryCard label="Skipped" value={lastImportResult.skippedCount || 0} note="Rows needing cleanup" />
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" className="btn-outline w-auto px-5" onClick={downloadNormalizedRows}>
                  Download Normalized CSV
                </button>
                <button type="button" className="btn-outline w-auto px-5" onClick={downloadFailedRows} disabled={!lastImportResult.errors?.length}>
                  Download Failed Rows
                </button>
              </div>

              {lastImportResult.errors?.length ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-[#f0d0d0]">
                  <div className="bg-[#fff7f7] px-4 py-3 text-sm font-semibold text-[#c44d4d]">Import issues</div>
                  <div className="max-h-[240px] overflow-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead className="bg-[#fffafa] text-xs uppercase tracking-[0.12em] text-[#b06a6a]">
                        <tr>
                          <th className="border-b border-[#f3dede] px-4 py-3">Row</th>
                          <th className="border-b border-[#f3dede] px-4 py-3">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lastImportResult.errors.slice(0, 20).map((row) => (
                          <tr key={`${row.rowNumber}-${row.error}`} className="border-t border-[#f8e4e4] text-[#7b5656]">
                            <td className="px-4 py-3 font-semibold">{row.rowNumber}</td>
                            <td className="px-4 py-3">{row.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--fitco-border)] bg-white p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h4 className="text-2xl font-bold tracking-tight text-[#203245]">Food list</h4>
            <p className="mt-1 text-sm text-[#667b87]">Live API data with inline editing, search, and pagination.</p>
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
                {!loading &&
                  entries.map((entry, index) => {
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
                            <span className="block truncate font-semibold text-[#203245]" dir="auto">{entry.brand}</span>
                          )}
                        </td>
                        <td className="border-r border-[#edf2ee] px-4 py-3">
                          {isEditing ? (
                            <div className="space-y-1">
                              <TableInput value={draft.product} onChange={(event) => updateRowDraft('product', event.target.value)} invalid={Boolean(rowErrors.product)} />
                              {rowErrors.product ? <p className="text-xs text-[#d94f4f]">{rowErrors.product}</p> : null}
                            </div>
                          ) : (
                            <span className="block max-w-[180px] truncate" title={entry.product} dir="auto">
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
                          {isEditing ? <TableInput value={draft.barcode} onChange={(event) => updateRowDraft('barcode', event.target.value)} /> : <span className="block truncate text-xs text-[#667b87]">{entry.barcode || '-'}</span>}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex flex-col gap-2">
                              <IconButton label="Save" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#cfe3d1] bg-[#eef8ef] text-[#2f9b38]" onClick={saveRowEdit}>
                                <ActionIcon type="save" />
                              </IconButton>
                              <IconButton label="Cancel" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#d7dfe3] text-[#5c6f7b]" onClick={cancelRowEdit}>
                                <ActionIcon type="cancel" />
                              </IconButton>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <IconButton label="Edit" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#cfe3d1] text-[#2f9b38]" onClick={() => startRowEdit(entry)}>
                                <ActionIcon type="edit" />
                              </IconButton>
                              <IconButton label="Delete" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#f0d0d0] text-[#d94f4f]" onClick={() => handleDelete(entry.id)}>
                                <ActionIcon type="delete" />
                              </IconButton>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                {!loading && entries.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-10 text-center text-sm text-[#6b7d88]">
                      No food items found for this search.
                    </td>
                  </tr>
                ) : null}
                {loading ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-10 text-center text-sm text-[#6b7d88]">
                      Loading food database...
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5">
          <PaginationBar currentPage={pagination.page || page} totalItems={pagination.total || 0} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </div>
      </section>
    </div>
  )
}
