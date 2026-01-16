import ActionHeader from './ActionHeader';
import Sidebar from './Sidebar';
import CalendarView from './CalendarView';
import Footer from './Footer';
import TimeEntryModal from './TimeEntryModal';
import { useContent } from './useContent';
import './Content.css';

function Content() {
  const {
    viewMode,
    setViewMode,
    currentDate,
    setCurrentDate,
    dateView,
    setDateView,
    modalState,
    handleNavigate,
    handleToday,
    handleCloseModal,
    handleSubmitModal,
    handleDeleteModal,
    handleDuplicateModal,
    handleCalendarEntry,
    handleDuplicateEntry,
    handleCreateEntry,
  } = useContent();

  return (
    <main className="main">
      <div className="content-card">
        <ActionHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          dateView={dateView}
          onDateViewChange={setDateView}
          onPrev={() => handleNavigate('prev')}
          onNext={() => handleNavigate('next')}
          onToday={handleToday}
          onCreateEntry={handleCreateEntry}
        />
        <div className="content-body">
          <Sidebar viewMode={viewMode} />
          <CalendarView
            currentDate={currentDate}
            dateView={dateView}
            viewMode={viewMode}
            onEntryTrigger={handleCalendarEntry}
            onDuplicateTrigger={handleDuplicateEntry}
          />
        </div>
        <Footer />
      </div>
      <TimeEntryModal
        open={modalState.open}
        context={modalState.context}
        mode={modalState.mode}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
        onDelete={modalState.mode === 'edit' ? handleDeleteModal : undefined}
        onDuplicate={modalState.mode === 'edit' ? handleDuplicateModal : undefined}
      />
    </main>
  );
}

export default Content;


