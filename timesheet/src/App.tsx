import './App.css'
import type { JSX } from 'react'
import { useDataverseQuery } from './hooks/useDataverseQuery'

type Account = {
  accountid: string
  name: string
  accountnumber?: string
}

function App(): JSX.Element {
  const { data, isLoading, error } = useDataverseQuery<Account>(
    'account',
    '?$select=accountid,name,accountnumber&$top=10'
  )

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error.message}</div>

  return (
    <div className="app">
      <h2>Accounts</h2>

      <ul className="account-list">
        {data?.map((account) => (
          <li key={account.accountid} className="account-item">
            <p>{account.name}</p>
            <p>{account.accountnumber ?? '-'}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
