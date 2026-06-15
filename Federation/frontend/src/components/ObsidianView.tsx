export function ObsidianView() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <iframe 
        src="http://localhost:3000/" 
        style={{ flex: 1, border: 'none', borderRadius: '8px' }} 
        title="Obsidian Vault View"
      />
    </div>
  );
}
