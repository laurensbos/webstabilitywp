export default function Loading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0f0d',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          border: '3px solid rgba(0, 229, 153, 0.2)',
          borderTopColor: '#00e599',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
