import './App.css'
import WorkTable from './WorkTable'
import WorkGroupTable from './WorkGroupTable'
import WorkSameGroupTable from './WorkSameGroupTable'

function App() {
  return (
    <div className="page">
      <WorkGroupTable />
      <WorkTable />
      <WorkSameGroupTable />
    </div>
  )
}

export default App
