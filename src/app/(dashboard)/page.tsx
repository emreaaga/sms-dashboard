'use client'
import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ContentLayout } from '@/components/admin-panel/content-layout'
import { DataTable } from '@/components/admin-panel/data-table'
import { apiSchema, apiColumns, ApiEntry } from '@/lib/main-api-table'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Checkbox } from "@/components/ui/checkbox"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react'
import FilterIcon from '@/icons/navbar/filter.svg'
import { DatePickerWithRange } from '@/components/admin-panel/data-picker'
import type { DateRange } from 'react-day-picker'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function RequestsPage() {
  const [rows, setRows] = useState<ApiEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedOperators, setSelectedOperators] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedSenders, setSelectedSenders] = useState<string[]>([])

  const OPERATORS = [
    { id: '1', label: 'Beeline' },
    { id: '2', label: 'Ucell' },
    { id: '3', label: 'UzMobile' },
    { id: '4', label: 'MOBIUZ' },
    { id: '5', label: 'PERFECTUM' },
    { id: '10', label: 'HUMANS' },
  ]
  const STATUSES = [
    'Ошибка', 'Созданно', 'В обработке', 'Отправлено', 'Доставлено',
    'Не доставлено', 'Просрочено', 'Отклонено', 'Удалено', 'Блокированный',
  ]
  const SENDERS = ['22700', 'QuickPay']

  async function fetchPage(
    idx: number,
    size: number,
    range?: DateRange
  ) {
    setLoading(true)
    setError(null)

    // собираем URL с параметрами
    const url = new URL('/api/report/sms', window.location.origin)
    url.searchParams.set('page', String(idx))
    url.searchParams.set('size', String(size))
    if (range?.from) url.searchParams.set(
      'startDate', format(range.from, 'yyyy-MM-dd')
    )
    if (range?.to) url.searchParams.set(
      'endDate', format(range.to, 'yyyy-MM-dd')
    )
    selectedOperators.forEach(op => url.searchParams.append('operator', op))
    selectedStatuses.forEach(st => url.searchParams.append('status', st))
    selectedSenders.forEach(sd => url.searchParams.append('sender', sd))

    try {
      const res = await fetch(url.toString(), {
        credentials: 'include',  // отправляем HttpOnly-cookie автоматически
      })
      if (!res.ok) throw new Error(`Сервер вернул ${res.status}`)

      const page = await res.json() as {
        content: ApiEntry[]
        totalPages: number
      }

      const parsed = z.array(apiSchema).safeParse(page.content)
      if (!parsed.success) {
        console.error('Zod errors', parsed.error.format())
        setRows([])
      } else {
        setRows(parsed.data)
      }
      setTotalPages(page.totalPages || 1)
    } catch (e: any) {
      console.error('Ошибка загрузки:', e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPage(pageIndex, pageSize, dateRange)
  }, [
    pageIndex,
    pageSize,
    dateRange,
    selectedOperators,
    selectedStatuses,
    selectedSenders,
  ])

  if (error) {
    return (
      <ContentLayout title="SMS отчёты">
        <div className="text-red-600">{error}</div>
      </ContentLayout>
    )
  }

  return (
    <ContentLayout title="SMS Главная">
      <div className="px-4 mb-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* сразу отправляем запрос при выборе даты */}
          <DatePickerWithRange
            date={dateRange}
            onSelect={range => {
              setDateRange(range)
              setPageIndex(0)
            }}
          />

          {/* остальные фильтры */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-2xl flex items-center gap-2 h-8 px-3">
                <FilterIcon className="h-4 w-4" />
                <span>Фильтры</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-70 p-2">
              <DropdownMenuLabel>Фильтры</DropdownMenuLabel>
              <Accordion type="single" collapsible>
                <AccordionItem value="operator">
                  <AccordionTrigger>По оператору</AccordionTrigger>
                  <AccordionContent>
                    {OPERATORS.map(op => (
                      <label key={op.id} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={selectedOperators.includes(op.id)}
                          onCheckedChange={ch =>
                            setSelectedOperators(prev =>
                              ch ? [...prev, op.id] : prev.filter(x => x !== op.id)
                            )
                          }
                        />
                        {op.label}
                      </label>
                    ))}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="status">
                  <AccordionTrigger>По статусу</AccordionTrigger>
                  <AccordionContent>
                    {STATUSES.map(st => (
                      <label key={st} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={selectedStatuses.includes(st)}
                          onCheckedChange={ch =>
                            setSelectedStatuses(prev =>
                              ch ? [...prev, st] : prev.filter(x => x !== st)
                            )
                          }
                        />
                        {st}
                      </label>
                    ))}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="sender">
                  <AccordionTrigger>По отправителю</AccordionTrigger>
                  <AccordionContent>
                    {SENDERS.map(sd => (
                      <label key={sd} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={selectedSenders.includes(sd)}
                          onCheckedChange={ch =>
                            setSelectedSenders(prev =>
                              ch ? [...prev, sd] : prev.filter(x => x !== sd)
                            )
                          }
                        />
                        {sd}
                      </label>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              {/* Сброс всех фильтров */}
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-[#E34D5E]"
                  onClick={() => {
                    setSelectedOperators([])
                    setSelectedStatuses([])
                    setSelectedSenders([])
                    setDateRange(undefined)
                    setPageIndex(0)
                  }}
                >
                  Сбросить
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* сама таблица */}
      <div className="px-4 overflow-auto mb-4">
        <DataTable<ApiEntry, typeof apiSchema>
          data={rows}
          columns={apiColumns}
          schema={apiSchema}
          getRowId={row => row.id.toString()}
        />
      </div>

      {/* пагинация */}
      <div className="flex items-center justify-between px-4 py-2 border-t">
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setPageIndex(0)}
            disabled={pageIndex === 0}
          >
            <ChevronsLeftIcon />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setPageIndex(p => Math.max(p - 1, 0))}
            disabled={pageIndex === 0}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setPageIndex(p => Math.min(p + 1, totalPages - 1))}
            disabled={pageIndex + 1 >= totalPages}
          >
            <ChevronRightIcon />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setPageIndex(totalPages - 1)}
            disabled={pageIndex + 1 >= totalPages}
          >
            <ChevronsRightIcon />
          </Button>
        </div>
        <div className="text-sm font-medium">
          Страница {pageIndex + 1} из {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <span>Элементов на странице:</span>
          <Select
            value={`${pageSize}`}
            onValueChange={v => {
              setPageSize(Number(v))
              setPageIndex(0)
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 50].map(s => (
                <SelectItem key={s} value={`${s}`}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </ContentLayout>
  )
}
