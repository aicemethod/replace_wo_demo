import { FiSearch, FiEdit, FiRefreshCw } from 'react-icons/fi'

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onMemoClick: () => void
  onRefresh?: () => void
  isRefreshing?: boolean
}

/**
 * 検索バーとメモ入力欄コンポーネント
 */
export const SearchBar = ({ searchQuery, onSearchChange, onMemoClick, onRefresh, isRefreshing }: SearchBarProps) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      {/* 検索入力欄 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#f5f5f5',
        padding: '12px',
        borderRadius: '4px',
        marginBottom: '12px'
      }}>
        <FiSearch size={18} style={{ color: '#666' }} />
        <input
          type="text"
          placeholder="検索"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            fontSize: '14px',
            fontFamily: 'SegoeUI, "Segoe UI", "Helvetica Neue", sans-serif'
          }}
        />
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{
              padding: '6px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isRefreshing ? 0.6 : 1,
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isRefreshing) {
                e.currentTarget.style.backgroundColor = '#e0e0e0'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            title="再読み込み"
          >
            <FiRefreshCw 
              size={18} 
              style={{ 
                color: '#666',
                animation: isRefreshing ? 'spin 0.8s ease-in-out infinite' : 'none',
                transition: 'transform 0.2s ease-in-out'
              }} 
            />
          </button>
        )}
      </div>

      {/* メモ入力欄 */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px',
          marginBottom: '10px',
          borderBottom: '1px solid #ddd',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          backgroundColor: '#fff'
        }}
        onClick={onMemoClick}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
      >
        <FiEdit size={18} style={{ color: '#666' }} />
        <input
          type="text"
          placeholder="メモを入力"
          readOnly
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            fontSize: '14px',
            fontFamily: 'SegoeUI, "Segoe UI", "Helvetica Neue", sans-serif',
            cursor: 'pointer'
          }}
        />
      </div>
    </div>
  )
}
