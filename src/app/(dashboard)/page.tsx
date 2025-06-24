'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ContentLayout } from '@/components/admin-panel/content-layout'
import { DataTable } from '@/components/admin-panel/data-table'
import { apiSchema, apiColumns, ApiEntry } from '@/lib/main-api-table'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
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
import { DatePickerWithRange } from '@/components/admin-panel/data-picker'
import type { DateRange } from 'react-day-picker'
import { Input } from '@/components/ui/input'

export default function RequestsPage() {
  const router = useRouter()

  const [rows, setRows] = useState<ApiEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  async function fetchPage(
    idx: number,
    size: number,
    range?: DateRange
  ) {
    setLoading(true)
    setError(null)

    const token = sessionStorage.getItem('accessToken')
    if (!token) {
      router.replace('/login')
      return
    }

    let url = new URL('http://185.8.212.114:8987/api/report/sms')
    url.searchParams.set('page', String(idx))
    url.searchParams.set('size', String(size))
    if (range?.from) {
      url.searchParams.set('startDate', format(range.from, 'yyyy-MM-dd'))
    }
    if (range?.to) {
      url.searchParams.set('endDate', format(range.to, 'yyyy-MM-dd'))
    }

    try {
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Сервер вернул ${res.status}`)

      const page = (await res.json()) as {
        content: ApiEntry[]
        totalPages: number
      }

      const parsed = z.array(apiSchema).safeParse(page.content)
      if (!parsed.success) {
        console.error('❌ Zod ошибки:', parsed.error.format())
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
  }, [pageIndex, pageSize, dateRange])

  if (loading) {
    return (
      <ContentLayout title="SMS отчёты">
        <div>Загрузка…</div>
      </ContentLayout>
    )
  }
  if (error) {
    return (
      <ContentLayout title="SMS отчёты">
        <div className="text-red-600">{error}</div>
      </ContentLayout>
    )
  }

  return (
    <ContentLayout title="SMS отчёты">
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {/* 1) Календарь */}
        <DatePickerWithRange
          date={dateRange}
          onSelect={range => {
            setDateRange(range)
            setPageIndex(0)
          }}
        />

        {/* 2) Инпут с иконкой */}
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Поиск..."
            className="w-full pl-10 pr-3 py-2 border rounded-2xl text-sm"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 2a7.5 7.5 0 010 14.65z"
            />
          </svg>
        </div>

        {/* 3) Кнопка сброса */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setDateRange(undefined)
            setPageIndex(0)
          }}
        >
          Сбросить
        </Button>
      </div>


      <div className="overflow-auto mb-4">
        <DataTable<ApiEntry, typeof apiSchema>
          data={rows}
          columns={apiColumns}
          schema={apiSchema}
          getRowId={row => row.id.toString()}
        />
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t">
        <div className="flex gap-2">
          <Button size="icon" variant="outline" onClick={() => setPageIndex(0)} disabled={pageIndex === 0}>
            <ChevronsLeftIcon />
          </Button>
          <Button size="icon" variant="outline" onClick={() => setPageIndex(p => Math.max(p - 1, 0))} disabled={pageIndex === 0}>
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
              {[5, 10].map(s => (
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
