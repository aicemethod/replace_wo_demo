import SectionHeader from './components/SectionHeader'
import SectionTitle from './components/SectionTitle'
import Lookup from './components/Lookup'
import DateTimePicker from './components/DateTimePicker'
import Select from './components/Select'
import TextField from './components/TextField'
import TextArea from './components/TextArea'
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
          <DateTimePicker label='顧客ご確認日' />
        </div>
        <div>
          <SectionTitle title='TSR' />
          <Select options={test_options} />
          <TextField />
          <TextArea />
        </div>
      </GridLayout>
    </>
  )
}

export default App
