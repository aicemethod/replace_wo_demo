import type { JSX } from 'react'
import { FaUser } from 'react-icons/fa'
import { Button } from '../button'
import './Footer.css'

export type FooterProps = {
  onOpenUserList?: () => void
}

export function Footer({ onOpenUserList }: FooterProps): JSX.Element {
  return (
    <footer className="content-bottom">
      <div className="content-bottom-left">
        <Button
          label="ユーザー 一覧設定"
          color="secondary"
          icon={<FaUser />}
          onClick={onOpenUserList}
          className="footer-button"
        />
      </div>
    </footer>
  )
}
