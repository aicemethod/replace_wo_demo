import type { ButtonHTMLAttributes, JSX, ReactNode } from 'react'
import './Button.css'

type ButtonColor = 'primary' | 'secondary'

export type ButtonProps = {
  label: string
  color?: ButtonColor
  icon?: ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

export function Button({
  label,
  color = 'primary',
  icon,
  className = '',
  type = 'button',
  ...props
}: ButtonProps): JSX.Element {
  const classes = ['btn', `btn-${color}`, className].filter(Boolean).join(' ')

  return (
    <button type={type} className={classes} {...props}>
      {icon && <span className="btn-icon">{icon}</span>}
      <span>{label}</span>
    </button>
  )
}
