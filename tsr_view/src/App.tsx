import SectionHeader from './components/SectionHeader'
import SectionTitle from './components/SectionTitle'
import Lookup from './components/Lookup'
import DateTimePicker from './components/DateTimePicker'
import GridLayout from './Layouts'
import './App.css'

function App() {

  const test_options: {
    label: string;
    value: string;
  }[] = [
      {
        label: "test",
        value: "aaa",
      },
    ];

  return (
    <>
      <SectionHeader title='TSR' />
      <GridLayout columns={2} gap="1rem">
        <div>
          <SectionTitle title='TSR' />
          <Lookup label='担当者氏名' options={test_options} />
          <DateTimePicker />
        </div>
        <div>
          <SectionTitle title='TSR' />
        </div>
      </GridLayout>
    </>
  )
}

export default App
