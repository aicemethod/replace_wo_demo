import './App.css'
import WorkTable from './WorkTable'
import WorkGroupTable from './WorkGroupTable'
import WorkSameGroupTable from './WorkSameGroupTable'
import { getSectionFromParam } from './sectionVisibility'

function App() {
  const section = getSectionFromParam(window.location.search)

  return (
    <div className="page">
      {section === 'group' ? <WorkGroupTable /> : null}
      {section === 'main' ? <WorkTable /> : null}
      {section === 'same' ? <WorkSameGroupTable /> : null}
    </div>
  )
}

export default App
