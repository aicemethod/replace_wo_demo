export interface SummaryRow {
  date: string
  personCount: number
  totalWorkHours: number
  totalTravelHours: number
}

export interface DetailRow {
  employeeNumber: string
  name: string
  task: string
  startTime: string
  endTime: string
  actualHour: number
  location: string
}

export const summaryData: SummaryRow[] = [
  { date: '2024/01/15', personCount: 2, totalWorkHours: 8.5, totalTravelHours: 2.0 },
  { date: '2024/01/16', personCount: 3, totalWorkHours: 12.0, totalTravelHours: 3.0 },
]

export const detailData: DetailRow[] = [
  { employeeNumber: 'E001', name: '山田太郎', task: 'Task A', startTime: '2024/01/15 09:00', endTime: '2024/01/15 18:00', actualHour: 8.0, location: 'Tokyo (JST)' },
  { employeeNumber: 'E002', name: '佐藤花子', task: 'Task B', startTime: '2024/01/15 10:00', endTime: '2024/01/15 19:00', actualHour: 8.5, location: 'Tokyo (JST)' },
  { employeeNumber: 'E003', name: '鈴木一郎', task: 'Task C', startTime: '2024/01/16 08:30', endTime: '2024/01/16 17:30', actualHour: 8.0, location: 'Tokyo (JST)' },
  { employeeNumber: 'E004', name: '田中次郎', task: 'Task D', startTime: '2024/01/16 09:00', endTime: '2024/01/16 18:00', actualHour: 8.0, location: 'Tokyo (JST)' },
]
