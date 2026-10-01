import React, { useState, useEffect, useRef } from 'react';
import { MapPin, AlertCircle, CheckCircle2, Navigation } from 'lucide-react';
import merchantOnboardingService from '../../../services/merchantOnboardingService';
import { loadGoogleMapsPlaces, parseGooglePlace } from '../../../utils/googlePlaces';
import { APP_CONFIG } from '../../../utils/constants';

/**
 * Step 2: Store Location Form
 * Live Google Places API (New) integration using PlaceAutocompleteElement.
 * Extracts: store_address, city, state, postal_code, country, latitude, longitude, place_id.
 */
export const LocationStepForm = ({ onBack, onStepComplete }) => {
  const placesContainerRef = useRef(null);
  const fallbackInputRef = useRef(null);
  const autocompleteElementRef = useRef(null);

  const [formData, setFormData] = useState({
    store_address: '',
    suite_or_unit: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    latitude: null,
    longitude: null,
    place_id: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [successData, setSuccessData] = useState(null);

  // Initialize live Google Places (New) Autocomplete element
  useEffect(() => {
    let isMounted = true;
    const apiKey = APP_CONFIG.GOOGLE_MAPS_API_KEY || '';

    if (!apiKey) {
      return;
    }

    loadGoogleMapsPlaces(apiKey)
      .then(async (google) => {
        if (!isMounted || !placesContainerRef.current) return;

        // Import modern Places API (New)
        const { PlaceAutocompleteElement } = await google.maps.importLibrary('places');

        if (PlaceAutocompleteElement && isMounted) {
          const placeAutocomplete = new PlaceAutocompleteElement();
          placeAutocomplete.id = 'store_address_place_autocomplete';
          placeAutocomplete.style.width = '100%';
          try {
            placeAutocomplete.includedPrimaryCountries = ['us'];
            placeAutocomplete.componentRestrictions = { country: 'us' };
          } catch {
            // Ignore if property unsupported in certain loader builds
          }

          // Clear validation errors and capture input changes immediately across shadow DOM
          const syncAddressText = (text) => {
            if (typeof text !== 'string') return;
            const trimmed = text.trim();
            if (trimmed) {
              setFormData((prev) => ({
                ...prev,
                store_address: trimmed,
              }));
              if (trimmed.length >= 5) {
                setValidationErrors((prev) => {
                  const updated = { ...prev };
                  delete updated.store_address;
                  delete updated.address;
                  return updated;
                });
                setError(null);
              }
            }
          };

          const handleInputSync = (e) => {
            const innerInput = e.composedPath ? e.composedPath().find((el) => el.tagName === 'INPUT') : null;
            const shadowInput = placeAutocomplete.shadowRoot?.querySelector('input');
            const val = innerInput?.value || shadowInput?.value || (typeof placeAutocomplete.value === 'string' ? placeAutocomplete.value : '') || '';
            syncAddressText(val);
          };

          placeAutocomplete.addEventListener('input', handleInputSync);
          placeAutocomplete.addEventListener('change', handleInputSync);

          // Deep bind to inner shadow input directly
          const bindShadowInput = () => {
            const shadowInput = placeAutocomplete.shadowRoot?.querySelector('input');
            if (shadowInput && !shadowInput._hasSyncListener) {
              shadowInput._hasSyncListener = true;
              shadowInput.addEventListener('input', (e) => {
                syncAddressText(e.target?.value || '');
              });
              shadowInput.addEventListener('change', (e) => {
                syncAddressText(e.target?.value || '');
              });
            }
          };

          bindShadowInput();
          setTimeout(bindShadowInput, 150);
          setTimeout(bindShadowInput, 600);

          // Handler for both modern 'gmp-select' and previous 'gmp-placeselect'
          const handlePlaceSelection = async (event) => {
            let place = null;

            // In modern Google Places (New), event contains placePrediction
            if (event.placePrediction && typeof event.placePrediction.toPlace === 'function') {
              try {
                place = event.placePrediction.toPlace();
              } catch (err) {
                console.warn('Error converting placePrediction to Place:', err);
              }
            } else if (event.place) {
              place = typeof event.place.toPlace === 'function' ? event.place.toPlace() : event.place;
            } else if (event.detail?.place) {
              place = typeof event.detail.place?.toPlace === 'function' ? event.detail.place.toPlace() : event.detail.place;
            }

            // Immediately clear validation errors
            setValidationErrors((prev) => {
              const updated = { ...prev };
              delete updated.store_address;
              delete updated.address;
              return updated;
            });
            setError(null);

            // Fetch rich fields from Place object
            if (place && typeof place.fetchFields === 'function') {
              try {
                await place.fetchFields({
                  fields: [
                    'id',
                    'displayName',
                    'formattedAddress',
                    'addressComponents',
                    'location',
                  ],
                });
              } catch (err) {
                console.warn('fetchFields error:', err);
              }
            }

            const parsed = place ? parseGooglePlace(place) : null;
            const shadowInput = placeAutocomplete.shadowRoot?.querySelector('input');
            const predictionText =
              event.placePrediction?.text?.toString() ||
              event.placePrediction?.description ||
              '';

            const resolvedAddress =
              parsed?.store_address ||
              place?.formattedAddress ||
              (typeof place?.displayName === 'string' ? place.displayName : place?.displayName?.text) ||
              predictionText ||
              shadowInput?.value ||
              (typeof placeAutocomplete.value === 'string' ? placeAutocomplete.value : '') ||
              '';

            if (resolvedAddress) {
              setFormData((prev) => ({
                ...prev,
                store_address: resolvedAddress,
                ...(parsed?.city ? { city: parsed.city } : {}),
                ...(parsed?.state ? { state: parsed.state } : {}),
                ...(parsed?.postal_code ? { postal_code: parsed.postal_code } : {}),
                ...(parsed?.country ? { country: parsed.country } : {}),
                ...(parsed?.latitude != null ? { latitude: parsed.latitude } : {}),
                ...(parsed?.longitude != null ? { longitude: parsed.longitude } : {}),
                ...(parsed?.place_id ? { place_id: parsed.place_id } : {}),
              }));
            }
          };

          // Register for both Google Places (New) event names
          placeAutocomplete.addEventListener('gmp-select', handlePlaceSelection);
          placeAutocomplete.addEventListener('gmp-placeselect', handlePlaceSelection);

          // Mount PlaceAutocompleteElement into container
          placesContainerRef.current.replaceChildren(placeAutocomplete);
          autocompleteElementRef.current = placeAutocomplete;
          setGoogleReady(true);
        }
      })
      .catch(() => {
        // Fallback to manual entry if Google Places script fails to load
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddressChange = (e) => {
    const value = e.target.value;

    // Auto-parse city, state, zip if user pasted standard address format
    let parsedCity = '';
    let parsedState = '';
    let parsedZip = '';
    const parts = value.split(',').map((p) => p.trim());
    if (parts.length >= 2) parsedCity = parts[1];
    if (parts.length >= 3) {
      const stateZip = parts[2].trim().split(/\s+/);
      if (stateZip[0]) parsedState = stateZip[0];
      if (stateZip[1]) parsedZip = stateZip[1];
    }

    setFormData((prev) => ({
      ...prev,
      store_address: value,
      ...(parsedCity ? { city: parsedCity } : {}),
      ...(parsedState ? { state: parsedState } : {}),
      ...(parsedZip ? { postal_code: parsedZip } : {}),
    }));

    if (validationErrors.store_address || validationErrors.address) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next.store_address;
        delete next.address;
        return next;
      });
    }
  };

  const handleSuiteChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, suite_or_unit: value }));

    if (validationErrors.suite_or_unit) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next.suite_or_unit;
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Read latest address from state OR from the PlaceAutocompleteElement shadow input
    const shadowInput =
      autocompleteElementRef.current?.shadowRoot?.querySelector('input') ||
      placesContainerRef.current?.querySelector('gmp-place-autocomplete')?.shadowRoot?.querySelector('input');
    const inputEl = placesContainerRef.current?.querySelector('input');
    const autocompleteVal =
      (typeof autocompleteElementRef.current?.value === 'string' ? autocompleteElementRef.current?.value : '') ||
      shadowInput?.value ||
      inputEl?.value ||
      fallbackInputRef.current?.value ||
      '';

    const addressToSubmit = (
      (typeof formData.store_address === 'string' && formData.store_address.trim() ? formData.store_address : '') ||
      autocompleteVal ||
      ''
    ).trim();

    if (!addressToSubmit || addressToSubmit.length < 5) {
      setValidationErrors({
        store_address: 'Store address must be at least 5 characters',
      });
      return;
    }

    if (formData.store_address !== addressToSubmit) {
      setFormData((prev) => ({ ...prev, store_address: addressToSubmit }));
    }

    setLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      const result = await merchantOnboardingService.saveLocation({
        store_address: addressToSubmit,
        suite_or_unit: formData.suite_or_unit,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: formData.country,
        latitude: formData.latitude,
        longitude: formData.longitude,
        place_id: formData.place_id,
      });

      setSuccessData(result);
      if (onStepComplete) {
        onStepComplete(result);
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to save store location. Please try again.';
      setError(errorMsg);

      if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setValidationErrors(err.fieldErrors);
      } else if (err.details && Array.isArray(err.details)) {
        const extracted = {};
        err.details.forEach((item) => {
          if (item.field) {
            extracted[item.field] = item.message;
          }
        });
        if (Object.keys(extracted).length > 0) {
          setValidationErrors(extracted);
        }
      } else if (err.message) {
        setValidationErrors({ store_address: err.message });
      }
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
          Store Location Saved!
        </h3>

        <p style={{ fontSize: '0.9rem', color: '#274d1c', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Location confirmed: <strong>{formData.store_address}</strong>
          {formData.suite_or_unit && <span>, {formData.suite_or_unit}</span>}
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
            Continue to Step 3: License
          </button>
        </div>
      </div>
    );
  }

  const effectiveAddress =
    (typeof formData.store_address === 'string' && formData.store_address.trim() ? formData.store_address.trim() : '') ||
    placesContainerRef.current?.querySelector('gmp-place-autocomplete')?.shadowRoot?.querySelector('input')?.value ||
    placesContainerRef.current?.querySelector('input')?.value ||
    '';

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
        Where is your store?
      </h1>

      <p
        style={{
          fontSize: '0.925rem',
          color: '#4b5563',
          margin: '0 0 1.5rem 0',
          lineHeight: 1.5,
        }}
      >
        Drivers pick up from this address. Customers see stores sorted by distance from it.
      </p>

      {/* Global Error Banner */}
      {error && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '1.25rem',
            color: '#991b1b',
            fontSize: '0.875rem',
            lineHeight: 1.4,
          }}
        >
          <AlertCircle size={18} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 600 }}>Error Saving Location</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      <form noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Store address Field */}
        <div style={{ position: 'relative' }}>
          <label
            htmlFor="store_address"
            style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '6px' }}
          >
            Store address
          </label>

          {/* Mount target for Google Places (New) PlaceAutocompleteElement or fallback input */}
          <div ref={placesContainerRef} style={{ width: '100%', minHeight: '44px' }}>
            <div style={{ position: 'relative' }}>
              <MapPin
                size={18}
                color={validationErrors.store_address || validationErrors.address ? '#dc2626' : '#374151'}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
              <input
                ref={fallbackInputRef}
                id="store_address"
                name="store_address"
                type="text"
                value={formData.store_address}
                onChange={handleAddressChange}
                placeholder="3012 Greenville Ave, Dallas, TX 75206"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '8px',
                  border: `1px solid ${
                    validationErrors.store_address || validationErrors.address ? '#dc2626' : '#d1d5db'
                  }`,
                  boxShadow:
                    validationErrors.store_address || validationErrors.address
                      ? '0 0 0 1px #dc2626'
                      : 'none',
                  fontSize: '0.9375rem',
                  color: '#1a1a1a',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#fff',
                }}
              />
            </div>
          </div>

          {(validationErrors.store_address || validationErrors.address) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: '#dc2626',
                fontSize: '0.8rem',
                fontWeight: 500,
                marginTop: '4px',
              }}
            >
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span>{validationErrors.store_address || validationErrors.address}</span>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: '#6b7280',
              marginTop: '6px',
            }}
          >
            <span>Search powered by Google Places</span>
            {googleReady && (
              <span style={{ color: '#2e7d32', fontWeight: 600, fontSize: '0.75rem' }}>
                ✓ Google Places (New) Active
              </span>
            )}
          </div>
        </div>

        {/* Map Preview Graphic */}
        <div
          style={{
            height: '140px',
            borderRadius: '10px',
            background: '#eef3ea',
            border: '1px solid #dce8d8',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {/* Stylized street block patterns */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              padding: '10px',
              opacity: 0.75,
            }}
          >
            <div style={{ background: '#e3ece0', borderRadius: '4px' }} />
            <div style={{ background: '#e3ece0', borderRadius: '4px' }} />
            <div style={{ background: '#e3ece0', borderRadius: '4px' }} />
            <div style={{ background: '#e3ece0', borderRadius: '4px' }} />
          </div>

          {/* Stylized road & dashed delivery zone boundary */}
          <div
            style={{
              position: 'absolute',
              width: '85%',
              height: '80px',
              border: '2px dashed #2e7d32',
              borderRadius: '8px',
              pointerEvents: 'none',
            }}
          />

          {/* Centered Store Pin */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              background: '#2e7d32',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: '999px',
              boxShadow: '0 4px 12px rgba(46, 125, 50, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            <MapPin size={14} />
            <span>
              {effectiveAddress ? 'Store Location Pinned' : 'Pin your store location'}
            </span>
          </div>

          {/* Location Coordinates & Place ID indicator if selected */}
          {formData.latitude && formData.longitude && (
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                fontSize: '0.72rem',
                color: '#1b4313',
                background: 'rgba(255, 255, 255, 0.85)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Navigation size={11} color="#2e7d32" />
              <span>
                {Number(formData.latitude).toFixed(4)}, {Number(formData.longitude).toFixed(4)}
              </span>
              {formData.place_id && <span style={{ color: '#4b5563' }}>• Place ID captured</span>}
            </div>
          )}
        </div>

        {/* Suite or unit Field */}
        <div>
          <label
            htmlFor="suite_or_unit"
            style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '6px' }}
          >
            Suite or unit
          </label>
          <input
            id="suite_or_unit"
            name="suite_or_unit"
            type="text"
            value={formData.suite_or_unit}
            onChange={handleSuiteChange}
            placeholder="Optional"
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: '8px',
              border: `1px solid ${validationErrors.suite_or_unit ? '#dc2626' : '#d1d5db'}`,
              boxShadow: validationErrors.suite_or_unit ? '0 0 0 1px #dc2626' : 'none',
              fontSize: '0.9375rem',
              color: '#1a1a1a',
              outline: 'none',
              boxSizing: 'border-box',
              background: '#fff',
            }}
          />
          {validationErrors.suite_or_unit && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: '#dc2626',
                fontSize: '0.8rem',
                fontWeight: 500,
                marginTop: '4px',
              }}
            >
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span>{validationErrors.suite_or_unit}</span>
            </div>
          )}
        </div>

        {/* Action Buttons Row: Back and Continue */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '0.5rem' }}>
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
            disabled={loading}
            style={{
              flex: 1,
              background: '#2e7d32',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 18px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.15s ease',
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
                <span>Saving location...</span>
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

export default LocationStepForm;
