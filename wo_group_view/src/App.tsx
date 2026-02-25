import './App.css'
import WorkTable from './WorkTable'
import WorkGroupTable from './WorkGroupTable'
import WorkSameGroupTable from './WorkSameGroupTable'
import { getSectionFromParam } from './sectionVisibility'
import { getAppLocaleFromXrm } from './i18n'

function App() {
  const section = getSectionFromParam(window.location.search)
  const locale = getAppLocaleFromXrm()

  return (
    <div className="page">
      {section === 'group' ? <WorkGroupTable locale={locale} /> : null}
      {section === 'main' ? <WorkTable locale={locale} /> : null}
      {section === 'same' ? <WorkSameGroupTable locale={locale} /> : null}
    </div>
  )
}

export default App
