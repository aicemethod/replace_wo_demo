import type { JSX } from 'react'
import { SelectButton } from '../selectButton'
import './Header.css'

type HeaderOption = {
  value: string
  label: string
}

export type HeaderProps = {
  options?: HeaderOption[]
}

export function Header({ options = [] }: HeaderProps): JSX.Element {
  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="header-title">Time Sheet</h1>
      </div>

      <div className="header-right">
        <span className="header-label">対象WO</span>
        <SelectButton options={options} />
      </div>
    </header>
  )
}
