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

    const url = new URL('/api/report/sms', window.location.origin)
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
          <DatePickerWithRange
            date={dateRange}
            onSelect={range => {
              setDateRange(range)
              setPageIndex(0)
            }}
          />
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
      </div>

      <div className="px-4 overflow-auto mb-4">
        <DataTable<ApiEntry, typeof apiSchema>
          data={rows}
          columns={apiColumns}
          schema={apiSchema}
          getRowId={row => row.id.toString()}
        />
      </div>


      <div className="flex items-center justify-between px-4 py-2">
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
