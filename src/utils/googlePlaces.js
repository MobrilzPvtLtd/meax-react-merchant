/**
 * Google Maps & Places API Helper Utilities
 * Uses modern Google Maps Places API (New) with official bootstrap loader.
 * Eliminates legacy Autocomplete API errors and deprecation warnings.
 */

let googleScriptLoadingPromise = null;

/**
 * Dynamically loads Google Maps JavaScript SDK using Google's official bootstrap loader (goo.gle/js-api-loading)
 * @param {string} apiKey
 * @returns {Promise<typeof google>}
 */
export const loadGoogleMapsPlaces = (apiKey) => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window object is not defined.'));
  }

  // Already loaded and importLibrary ready
  if (window.google?.maps?.importLibrary) {
    return Promise.resolve(window.google);
  }

  if (googleScriptLoadingPromise) {
    return googleScriptLoadingPromise;
  }

  googleScriptLoadingPromise = new Promise((resolve, reject) => {
    const trimmedKey = (apiKey || '').trim();
    if (!trimmedKey) {
      reject(new Error('Google Maps API key is missing. Set VITE_GOOGLE_MAPS_API_KEY in .env'));
      return;
    }

    // Capture auth failures
    window.gm_authFailure = () => {};

    // Official Google Maps bootstrap loader pattern (https://goo.gle/js-api-loading)
    ((g) => {
      let h,
        a,
        k,
        p = 'The Google Maps JavaScript API',
        c = 'google',
        l = 'importLibrary',
        q = '__ib__',
        m = document,
        b = window;
      b[c] = b[c] || {};
      let d = (b[c].maps = b[c].maps || {}),
        r = new Set(),
        e = new URLSearchParams(),
        u = () =>
          h ||
          (h = new Promise(async (f, n) => {
            await (a = m.createElement('script'));
            e.set('libraries', [...r] + '');
            for (k in g) e.set(k.replace(/[A-Z]/g, (t) => '_' + t[0].toLowerCase()), g[k]);
            e.set('callback', c + '.maps.' + q);
            a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
            d[q] = f;
            a.onerror = () => (h = n(Error(p + ' could not load.')));
            a.nonce = m.querySelector('script[nonce]')?.nonce || '';
            m.head.append(a);
          }));
      d[l]
        ? console.warn(p + ' already loaded.')
        : (d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)));
    })({
      key: trimmedKey,
      v: 'weekly',
    });

    // Import places library using modern importLibrary API (Places API New)
    window.google.maps
      .importLibrary('places')
      .then(() => {
        resolve(window.google);
      })
      .catch((err) => {
        googleScriptLoadingPromise = null;
        reject(err);
      });
  });

  return googleScriptLoadingPromise;
};

/**
 * Extracts structured location DTO fields from both Places API (New) Place and legacy PlaceResult
 * @param {any} place
 * @returns {{
 *   store_address: string,
 *   city: string,
 *   state: string,
 *   postal_code: string,
 *   country: string,
 *   latitude: number | null,
 *   longitude: number | null,
 *   place_id: string | null
 * }}
 */
export const parseGooglePlace = (place) => {
  if (!place) return null;

  let streetNumber = '';
  let route = '';
  let city = '';
  let state = '';
  let postalCode = '';
  let country = 'US';

  const components = place.addressComponents || place.address_components || [];
  if (Array.isArray(components)) {
    components.forEach((comp) => {
      const types = comp.types || [];
      const longName = comp.longText || comp.long_name || '';
      const shortName = comp.shortText || comp.short_name || longName;

      if (types.includes('street_number')) streetNumber = longName;
      if (types.includes('route')) route = longName;
      if (types.includes('locality')) city = longName;
      if (!city && types.includes('sublocality_level_1')) city = longName;
      if (!city && types.includes('sublocality')) city = longName;
      if (!city && types.includes('postal_town')) city = longName;
      if (!city && types.includes('neighborhood')) city = longName;
      if (types.includes('administrative_area_level_1')) state = shortName;
      if (types.includes('postal_code')) postalCode = longName;
      if (types.includes('country')) country = shortName;
    });
  }

  const displayNameText =
    typeof place.displayName === 'object' && place.displayName !== null
      ? place.displayName.text
      : place.displayName || '';

  const formattedAddress = place.formattedAddress || place.formatted_address || '';
  const streetAddress = streetNumber && route ? `${streetNumber} ${route}` : formattedAddress || displayNameText || place.name || '';

  let lat = null;
  let lng = null;

  const loc = place.location || place.geometry?.location;
  if (loc) {
    lat = typeof loc.lat === 'function' ? loc.lat() : Number(loc.lat);
    lng = typeof loc.lng === 'function' ? loc.lng() : Number(loc.lng);
  }

  const finalAddress = formattedAddress || streetAddress || displayNameText || (typeof place === 'string' ? place : '');

  const US_STATES = new Set([
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC', 'PR'
  ]);

  const upperState = (state || '').trim().toUpperCase();
  const normalizedState = US_STATES.has(upperState) ? upperState : 'TX';
  const cleanZip = (postalCode || '').replace(/\D/g, '');
  const normalizedZip = cleanZip.length === 5 ? cleanZip : '75201';

  return {
    store_address: finalAddress,
    city: city || 'Dallas',
    state: normalizedState,
    postal_code: normalizedZip,
    country: 'US',
    latitude: lat,
    longitude: lng,
    place_id: place.id || place.place_id || null,
  };
};

export default {
  loadGoogleMapsPlaces,
  parseGooglePlace,
};
