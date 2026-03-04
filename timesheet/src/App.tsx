import './App.css'
import type { JSX } from 'react'
import { useDataverseQuery } from './hooks/useDataverseQuery'
import { Header } from './components'

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

  return (
    <div className="app">
      <Header
        options={
          data?.map((account) => ({
            value: account.accountid,
            label: account.name,
          })) ?? []
        }
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
