import './App.css'
import type { EventInput } from '@fullcalendar/core'
import type { JSX } from 'react'
import { useDataverseQuery } from './hooks/useDataverseQuery'
import {
  CalendarController,
  CalendarView,
  DayCopyModal,
  Footer,
  Header,
  Sidebar,
  TimeEntryModal,
  UserListModal,
} from './components'
import { useState } from 'react'

type Account = {
  accountid: string
  name: string
  accountnumber?: string
}

function App(): JSX.Element {
  const [isUserListModalOpen, setIsUserListModalOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isDayCopyModalOpen, setIsDayCopyModalOpen] = useState(false)
  const [isTimeEntryModalOpen, setIsTimeEntryModalOpen] = useState(false)
  const [selectedDateTime, setSelectedDateTime] = useState<{ start: Date; end: Date } | null>(null)
  const { data } = useDataverseQuery<Account>(
    'account',
    '?$select=accountid,name,accountnumber&$top=10'
  )
  const options =
    data?.map((account) => ({
      value: account.accountid,
      label: account.name,
    })) ?? []
  const users =
    data?.map((account) => ({
      id: account.accountid,
      number: account.accountnumber ?? '',
      name: account.name,
    })) ?? []
  const formattedDate = new Intl.DateTimeFormat('ja-JP').format(currentDate)
  const calendarEvents: EventInput[] = []

  const handlePrev = () => {
    const nextDate = new Date(currentDate)
    nextDate.setDate(nextDate.getDate() - 7)
    setCurrentDate(nextDate)
  }

  const handleNext = () => {
    const nextDate = new Date(currentDate)
    nextDate.setDate(nextDate.getDate() + 7)
    setCurrentDate(nextDate)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="app">
      <Header options={options} />
      <CalendarController
        formattedDate={formattedDate}
        options={options}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onCreate={() => {
          setSelectedDateTime({ start: currentDate, end: currentDate })
          setIsTimeEntryModalOpen(true)
        }}
        onCopy={() => setIsDayCopyModalOpen(true)}
        isCopyEnabled
      />
      <div className="content-middle">
        <Sidebar
          users={users}
          selfUser={users[0] ?? { id: 'self', number: '', name: '' }}
        />
        <div className="content-main">
          <CalendarView
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onDateClick={(range) => {
              setSelectedDateTime(range)
              setIsTimeEntryModalOpen(true)
            }}
            events={calendarEvents}
          />
        </div>
      </div>
      <Footer onOpenUserList={() => setIsUserListModalOpen(true)} />
      <UserListModal
        isOpen={isUserListModalOpen}
        onClose={() => setIsUserListModalOpen(false)}
        users={users}
      />
      <DayCopyModal
        isOpen={isDayCopyModalOpen}
        onClose={() => setIsDayCopyModalOpen(false)}
        sourceDate={currentDate}
        sourceEntryCount={calendarEvents.length}
        onExecute={() => setIsDayCopyModalOpen(false)}
      />
      <TimeEntryModal
        isOpen={isTimeEntryModalOpen}
        onClose={() => setIsTimeEntryModalOpen(false)}
        selectedDateTime={selectedDateTime}
        woOptions={options}
        resources={users}
      />
      {/* <h2>Accounts</h2>

      <ul className="account-list">
        {data?.map((account) => (
          <li key={account.accountid} className="account-item">
            <p>{account.name}</p>
            <p>{account.accountnumber ?? '-'}</p>
          </li>
        ))}
      </ul> */}
    </div>
  )
}

export default App
