import './App.css'
import type { JSX } from 'react'
import { useDataverseQuery } from './hooks/useDataverseQuery'
import { CalendarController, Header } from './components'

type Account = {
  accountid: string
  name: string
  accountnumber?: string
}

function App(): JSX.Element {
  const { data } = useDataverseQuery<Account>(
    'account',
    '?$select=accountid,name,accountnumber&$top=10'
  )
  const options =
    data?.map((account) => ({
      value: account.accountid,
      label: account.name,
    })) ?? []
  const formattedDate = new Intl.DateTimeFormat('ja-JP').format(new Date())

  return (
    <div className="app">
      <Header options={options} />
      <CalendarController formattedDate={formattedDate} options={options} />
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
