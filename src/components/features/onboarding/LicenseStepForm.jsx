import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import merchantOnboardingService from '../../../services/merchantOnboardingService';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

/**
 * Step 3: Business License Upload Form
 * Matches the "Upload your business license" screen with drag-and-drop and file preview.
 */
export const LicenseStepForm = ({ onBack, onStepComplete, initialData = null }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(initialData?.file || null);
  const [existingUrl, setExistingUrl] = useState(initialData?.license_document_url || null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const validateFile = (file) => {
    if (!file) return 'Please choose a business license file.';

    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const isValidType =
      ALLOWED_MIME_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(fileExtension);

    if (!isValidType) {
      return 'Invalid file format. Please upload a PDF, JPG, or PNG file.';
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return 'File size exceeds 10 MB limit. Please choose a smaller file.';
    }

    return null;
  };

  const handleFileSelection = (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      if (existingUrl) {
        if (onStepComplete) {
          onStepComplete({ file: null, license_document_url: existingUrl });
        }
        return;
      }
      setError('Please select your business license file before continuing.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await merchantOnboardingService.uploadLicense(selectedFile);
      setSuccessData(result);
      if (onStepComplete) {
        onStepComplete({
          ...result,
          file: selectedFile,
          license_document_url: result?.license_document_url || existingUrl,
        });
      }
    } catch (err) {
      const message =
        err.message ||
        err.fieldErrors?.file ||
        'Failed to upload business license. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div
        style={{
          background: '#f4fbf4',
          border: '1px solid #d2ebd0',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#e8f5e9',
            color: '#2e7d32',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}
        >
          <CheckCircle2 size={28} />
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1b4313', marginBottom: '0.5rem' }}>
          License Document Uploaded!
        </h3>

        <p style={{ fontSize: '0.9rem', color: '#274d1c', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Your business license document has been securely stored and attached to your application.
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => onStepComplete && onStepComplete(successData)}
            style={{
              background: '#2e7d32',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Continue to Step 4: Payouts
          </button>
        </div>
      </div>
    );
  }

  const isContinueEnabled = (Boolean(selectedFile) || Boolean(existingUrl)) && !loading;

  return (
    <div>
      <h1
        style={{
          fontSize: '1.95rem',
          fontWeight: 800,
          color: '#1a1a1a',
          margin: '0 0 0.5rem 0',
          letterSpacing: '-0.02em',
        }}
      >
        Upload your business license
      </h1>

      <p
        style={{
          fontSize: '0.925rem',
          color: '#4b5563',
          margin: '0 0 1.75rem 0',
          lineHeight: 1.5,
        }}
      >
        This is the only document MEAX needs. Your store can't receive orders until Admin approves it.
      </p>

      <form noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          id="license_file_input"
          type="file"
          accept=".pdf,image/png,image/jpeg,image/jpg"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Dashed Upload Dropzone Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          style={{
            border: `2px dashed ${error ? '#dc2626' : isDragging ? '#1b4313' : '#2e7d32'}`,
            borderRadius: '14px',
            background: isDragging ? '#eef7ec' : selectedFile ? '#f8fbf7' : '#ffffff',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '190px',
            boxSizing: 'border-box',
          }}
        >
          {selectedFile || existingUrl ? (
            /* Selected File State */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: '#e8f5e9',
                  color: '#2e7d32',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '4px',
                }}
              >
                <FileText size={28} />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  maxWidth: '90%',
                  background: '#ffffff',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: '1px solid #d2ebd0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}
              >
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#1a1a1a',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '240px',
                  }}
                  title={selectedFile ? selectedFile.name : 'Business License on file'}
                >
                  {selectedFile ? selectedFile.name : 'Business License on file'}
                </span>

                {selectedFile && (
                  <span style={{ fontSize: '0.78rem', color: '#6b7280', flexShrink: 0 }}>
                    ({formatFileSize(selectedFile.size)})
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  title="Remove file"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '2px',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                >
                  <X size={16} />
                </button>
              </div>

              <span style={{ fontSize: '0.8rem', color: '#2e7d32', fontWeight: 600, marginTop: '4px' }}>
                Click or drop another file to replace
              </span>
            </div>
          ) : (
            /* Empty / Idle Upload State */
            <>
              {/* Upload Icon */}
              <div
                style={{
                  color: '#4b5563',
                  marginBottom: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Upload size={38} strokeWidth={1.8} />
              </div>

              {/* Upload Prompt */}
              <div
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: '#1a1a1a',
                  marginBottom: '0.35rem',
                }}
              >
                Upload your business license
              </div>

              {/* Supported Format & Size */}
              <div
                style={{
                  fontSize: '0.85rem',
                  color: '#6b7280',
                }}
              >
                PDF, JPG or PNG up to 10 MB
              </div>
            </>
          )}
        </div>

        {/* Inline Error Message */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#dc2626',
              fontSize: '0.825rem',
              fontWeight: 500,
              marginTop: '-0.75rem',
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Navigation Buttons Row */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '0.25rem' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              flex: 1,
              background: '#fff',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '12px 18px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            Back
          </button>

          <button
            type="submit"
            disabled={!isContinueEnabled}
            style={{
              flex: 1,
              background: isContinueEnabled ? '#2e7d32' : '#c4d4c2',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 18px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: isContinueEnabled ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s ease',
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#ffffff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                <span>Uploading license...</span>
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LicenseStepForm;
