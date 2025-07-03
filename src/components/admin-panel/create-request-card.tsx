'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from "sonner"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'

const STATUS_OPTIONS = [
  { value: 'PENDING_APPROVAL', label: 'Ожидает одобрения' },
  { value: 'ACTIVE', label: 'Активный' },
  { value: 'INACTIVE', label: 'Не активный' },
  { value: 'REJECTED', label: 'Отклонён' },
]

export default function CreateRequestCard() {
  const router = useRouter()

  // form state
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [originator, setOriginator] = useState('')
  const [status, setStatus] = useState(STATUS_OPTIONS[0].value)
  const [merchantId, setMerchantId] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // минимальная валидация
    if (!name || !content || !originator || !merchantId) {
      setError('Заполните все поля')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/sms-templates', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content, status, originator, merchantId }),
      })

      const body = await res.json()
      if (!res.ok) {
        throw new Error(body.message || `Ошибка ${res.status}`)
      }
      toast.success("Шаблон был успешно создан!")
    } catch (err: any) {
      setError(err.message)
      toast.error('Произошла ошибка!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="rounded-xl border-none">
        <CardHeader>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>
                Описание и требования к оформлению шаблонов
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div>
                    <h1 className="font-bold">Описание переменных:</h1>
                    <ul className="list-none py-4 space-y-2">
                      <li className="relative pl-4 before:absolute before:left-0 before:content-['-']">
                        %w – любой непрерывный набор букв,
                        цифр и или спецсимволов.
                      </li>
                      <li className="relative pl-4 before:absolute before:left-0 before:content-['-']">
                        %d – любой непрерывный набор цифр и или
                        спецсимволов.
                      </li>
                      <li className="relative pl-4 before:absolute before:left-0 before:content-['-']">
                        %w(1,n) - ограниченная последовательность слов (состоящих из букв, цифр или спецсимволов описанных ниже), разделенных пробелом (или несколькими пробелами), где п - число слов (слов должно быть не менее 1 и не более чем п); Важно: значение п должно быть не более 10. Переменную %w(1,1) использовать нельзя.
                      </li>
                      <li className="relative pl-4 before:absolute before:left-0 before:content-['-']">
                        %d(1,n) - ограниченная последовательность чисел (состоящих из цифр или спецсимволов описанных ниже), разделенных пробелом (или несколькими пробелами), где п - число чисел (чисел должно быть не менее 1 и на более чем п): Важно: значение п должно быть не более 10. Переменную %d(1.1) использовать нельзя.
                      </li>
                      <li className="relative pl-4 before:absolute before:left-0 before:content-['-']">
                        Набор букв или цифр %d и %w может содержать знаки
                        препинания и спецсимволы: ! № # %..:: ?\/()+-™"—_***&^?()[]
                        &lt;&gt;/\||®#5%^()+=~*
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h1 className="font-bold">
                      Требования к оформлению шаблонов:
                    </h1>
                    <ul className="list-none space-y-2 py-4">
                      <li className="relative pl-4 before:absolute before:left-0 before:content-['-']">
                        Шаблон должен быть записан корректно с применением правил
                        применения переменных в шаблоне.
                      </li>
                      <li className="relative pl-4 before:absolute before:left-0 before:content-['-']">
                        Корректность написания шаблона — целиком и полностью в
                        зоне ответственности клиента.
                      </li>
                      <li className="relative pl-4 before:absolute before:left-0 before:content-['-']">
                        Операнда %w(1,n) будет гарантировано согласована для
                        использования: государственными органами, благотворительными
                        фондами … в остальных случаях её использование не обоснованно.
                      </li>
                      <li className="relative pl-4 before:absolute before:left-0 before:content-['-']">
                        Для указания даты, телефона, пароля — желательно
                        использование операнды %d(1,n).
                      </li>
                      <li className="relative pl-4 before:absolute before:left-0 before:content-['-']">
                        Не стоит объединять все подряд в групповых переменных
                        %w, %d, %w(1,n), %d(1,n).
                      </li>
                      <li className="relative pl-4 before:absolute before:left-0 before:content-['-']">
                        Простое правило: чем читабельнее шаблон для человека,
                        тем меньше вопросов он вызывает при согласовании.
                      </li>
                      <li className="relative pl-4 before:absolute before:left-0 before:content-['-']">
                        Следует избегать дублирования шаблонов, кроме случаев,
                        когда шаблон используется для нескольких имён отправителей.
                      </li>
                      <li className="relative pl-4 before:absolute before:left-0 before:content-['-']">
                        После обозначения каждой переменной в п.2 в шаблоне
                        необходимо ставить пробел.
                      </li>
                      <li className="relative pl-4 before:absolute before:left-0 before:content-['-']">
                        Если любая переменная из п.2 используется внутри
                        шаблона, то перед ней необходимо ставить пробел.
                      </li>
                      <li className="relative pl-4 before:absolute before:left-0 before:content-['-']">
                        Отступления от правил возможны при согласовании
                        модератором, если есть обоснование транзакционного или
                        сервисного характера шаблона.
                      </li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="text-red-600 font-medium">{error}</div>
          )}

          <div className="grid grid-cols-[150px_1fr] items-center gap-4">
            <CardDescription>Название</CardDescription>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Имя шаблона"
              className="rounded-2xl"
            />
          </div>

          <div className="grid grid-cols-[150px_1fr] items-start gap-4">
            <CardDescription>Текст</CardDescription>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Текст SMS"
              className="rounded-2xl"
            />
          </div>

          <div className="grid grid-cols-[150px_1fr] items-center gap-4">
            <CardDescription>Имя отправителя</CardDescription>
            <Input
              value={originator}
              onChange={e => setOriginator(e.target.value)}
              placeholder="Sender ID"
              className="rounded-2xl"
            />
          </div>

          <div className="grid grid-cols-[150px_1fr] items-center gap-4">
            <CardDescription>Статус</CardDescription>
            <Select onValueChange={v => setStatus(v)} value={status}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent side="top">
                {STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-[150px_1fr] items-center gap-4">
            <CardDescription>Мерчант ID</CardDescription>
            <Input
              value={merchantId}
              onChange={e => setMerchantId(e.target.value)}
              placeholder="Например, 1"
              className="rounded-2xl"
            />
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button
              type="submit"
              className="rounded-2xl bg-[#2563EB] hover:bg-[#1E40AF]"
              disabled={loading}
            >
              {loading ? 'Сохраняем...' : 'Создать'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
