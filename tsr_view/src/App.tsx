import SectionHeader from './components/SectionHeader'
import SectionTitle from './components/SectionTitle'
import GridLayout from './Layouts'
import './App.css'

function App() {

  return (
    <>
      <SectionHeader title='TSR' />
      <GridLayout columns={2} gap="1rem">
        <SectionTitle title='TSR' />
        <SectionTitle title='TSR' />
      </GridLayout>
    </>
  )
}

export default App
