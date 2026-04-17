import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { uploadDocument, getDocuments, deleteDocument } from '../utils/api'

const fileIcon = (name = '') => {
  if (/\.pdf$/i.test(name)) return '📄'
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(name)) return '🖼️'
  return '📎'
}

export default function DocumentVault({ refreshKey = 0 }) {
  const { t } = useTheme()
  const [docs, setDocs] = useState([])
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState(null)

  useEffect(() => { fetchDocs() }, [refreshKey])

  const fetchDocs = async () => {
    try {
      const res = await getDocuments()
      setDocs(res.data.documents)
      if (!res.data.documents.some(doc => selectedDoc?._id === doc._id)) {
        setSelectedDoc(null)
      }
    } catch {
      /* silent */
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('document', file)
      await uploadDocument(fd); setFile(null); fetchDocs()
    } catch { /* silent */ }
    finally { setUploading(false) }
  }

  const handleDelete = async id => {
    try { await deleteDocument(id); fetchDocs() }
    catch { /* silent */ }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '800', color: t.text }}>📁 Medical Documents</h2>
        <span style={{
          padding: '4px 12px', borderRadius: '20px',
          background: t.primaryLight, color: t.primary,
          fontSize: '11px', fontWeight: '700',
        }}>
          {docs.length} file{docs.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); setFile(e.dataTransfer.files[0]) }}
        onClick={() => document.getElementById('vaultFileInput').click()}
        style={{
          border: `2px dashed ${dragOver ? t.primary : t.inputBorder}`,
          borderRadius: '18px', padding: '20px',
          textAlign: 'center',
          background: dragOver ? t.primaryLight : t.surfaceAlt,
          transition: 'all 0.2s ease', cursor: 'pointer', marginBottom: '14px',
        }}
      >
        <input id="vaultFileInput" type="file" accept="image/*,.pdf"
          style={{ display: 'none' }}
          onChange={e => setFile(e.target.files[0])} />
        <div style={{ fontSize: '30px', marginBottom: '8px' }}>{file ? '✅' : '☁️'}</div>
        {file ? (
          <>
            <p style={{ fontSize: '13px', fontWeight: '700', color: t.text }}>{file.name}</p>
            <p style={{ fontSize: '11px', color: t.textMuted }}>{(file.size / 1024).toFixed(1)} KB</p>
          </>
        ) : (
          <>
            <p style={{ fontSize: '13px', fontWeight: '600', color: t.textSub }}>Drop file here or tap to browse</p>
            <p style={{ fontSize: '11px', color: t.textMuted, marginTop: '4px' }}>PDF, images supported</p>
          </>
        )}
      </div>

      {file && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          <button onClick={() => setFile(null)} style={{
            padding: '12px', borderRadius: '14px',
            border: `1.5px solid ${t.border}`, background: t.surface,
            color: t.textMuted, fontWeight: '600', fontSize: '13px',
            cursor: 'pointer', flex: 1, fontFamily: 'inherit',
          }}>Cancel</button>
          <button onClick={handleUpload} disabled={uploading} style={{
            padding: '12px', borderRadius: '14px', border: 'none',
            background: uploading ? t.surfaceAlt : t.primaryGrad,
            color: uploading ? t.textMuted : '#fff',
            fontWeight: '700', fontSize: '13px',
            cursor: uploading ? 'default' : 'pointer', flex: 2,
            boxShadow: uploading ? 'none' : `0 6px 18px ${t.primary}44`,
            fontFamily: 'inherit',
          }}>
            {uploading ? '⬆ Uploading...' : '⬆ Upload Document'}
          </button>
        </div>
      )}

      {/* List */}
      {docs.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '24px',
          background: t.surfaceAlt, borderRadius: '18px',
          border: `1px solid ${t.border}`,
        }}>
          <div style={{ fontSize: '34px', marginBottom: '8px' }}>🗂️</div>
          <p style={{ color: t.textMuted, fontSize: '13px', fontWeight: '500' }}>No documents yet</p>
          <p style={{ color: t.textLight, fontSize: '11px', marginTop: '4px' }}>Upload prescriptions & reports</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {docs.map(doc => (
            <div key={doc._id} style={{
              background: selectedDoc?._id === doc._id ? t.primaryLight : t.surface,
              borderRadius: '16px', padding: '13px 15px',
              display: 'flex', alignItems: 'center', gap: '12px',
              boxShadow: t.shadow, border: `1px solid ${t.border}`,
              cursor: 'pointer',
            }}
              onClick={() => setSelectedDoc(doc)}
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: '14px',
                background: t.primaryLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', flexShrink: 0,
              }}>
                {fileIcon(doc.fileName)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: '700', color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {doc.fileName}
                </p>
                <p style={{ fontSize: '11px', color: t.textMuted, marginTop: '2px' }}>
                  {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '7px', flexShrink: 0 }}>
                <a href={doc.fileUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{
                  padding: '7px 13px', borderRadius: '10px',
                  background: t.primaryLight, color: t.primary,
                  fontSize: '12px', fontWeight: '700', textDecoration: 'none',
                  border: `1px solid ${t.primary}33`,
                }}>View</a>
                <button onClick={e => { e.stopPropagation(); handleDelete(doc._id) }} style={{
                  padding: '7px 10px', borderRadius: '10px',
                  background: `${t.error}15`, color: t.error,
                  fontSize: '13px', border: `1px solid ${t.error}33`,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDoc && (
        <div style={{ marginTop: '18px', padding: '18px', borderRadius: '20px', background: t.surfaceAlt, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: t.text }}>{selectedDoc.fileName}</h3>
          <p style={{ margin: '8px 0 18px', color: t.textMuted, fontSize: '12px' }}>
            Clicked document preview
          </p>
          {selectedDoc.fileType?.startsWith('image/') ? (
            <img src={selectedDoc.fileUrl} alt={selectedDoc.fileName} style={{ width: '100%', borderRadius: '18px', maxHeight: '280px', objectFit: 'contain' }} />
          ) : (
            <div style={{ padding: '24px', borderRadius: '18px', background: t.surface, textAlign: 'center' }}>
              <div style={{ fontSize: '34px', marginBottom: '12px' }}>{fileIcon(selectedDoc.fileName)}</div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: t.text }}>Preview not available</p>
              <p style={{ margin: '6px 0 0', color: t.textMuted, fontSize: '12px' }}>Open the document to view it in full.</p>
              <a href={selectedDoc.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '14px', padding: '10px 16px', borderRadius: '14px', background: t.primary, color: '#fff', textDecoration: 'none', fontWeight: '700' }}>Open document</a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
