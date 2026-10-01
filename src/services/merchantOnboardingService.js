/**
 * Merchant Onboarding API Service
 * Handles multi-step merchant registration and status tracking.
 */

import { api } from './api';

export const merchantOnboardingService = {
  /**
   * Step 1: Register Business Profile
   * Calls: POST /auth/merchant/register/business
   * 
   * @param {{
   *   business_name: string,
   *   store_category_type: number,
   *   business_email: string,
   *   business_phone: string,
   *   password?: string
   * }} data
   */
  async registerBusiness(data) {
    const rawPhone = (data.business_phone || '').trim();
    let phone = rawPhone.replace(/[^\d+]/g, '');
    if (phone && !phone.startsWith('+')) {
      if (phone.length === 10) {
        phone = `+1${phone}`;
      } else if (phone.length === 11 && phone.startsWith('1')) {
        phone = `+${phone}`;
      } else {
        phone = `+${phone}`;
      }
    }

    const payload = {
      business_name: (data.business_name || '').trim(),
      store_category_type: Number(data.store_category_type) || 1,
      business_email: (data.business_email || '').trim().toLowerCase(),
      business_phone: phone || rawPhone,
    };

    if (data.password) {
      payload.password = data.password;
    }

    const response = await api.post('/auth/merchant/register/business', payload);
    return response.data || response;
  },

  /**
   * Step 2: Save Store Location & Address
   * Calls: POST /auth/merchant/onboarding/location
   * 
   * @param {{
   *   store_address: string,
   *   suite_or_unit?: string,
   *   city?: string,
   *   state?: string,
   *   postal_code?: string,
   *   country?: string,
   *   latitude?: number,
   *   longitude?: number,
   *   place_id?: string
   * }} data
   */
  async saveLocation(data) {
    let city = data.city || '';
    let state = data.state || '';
    let postal_code = data.postal_code || '';
    let country = data.country || 'US';

    // Parse address string if city/state/postal_code were not already extracted
    if (data.store_address && (!city || !state || !postal_code)) {
      const parts = data.store_address.split(',').map((p) => p.trim());
      if (parts.length >= 2 && !city) {
        city = parts[1];
      }
      if (parts.length >= 3) {
        const stateZip = parts[2].trim().split(/\s+/);
        if (stateZip[0] && !state) state = stateZip[0];
        if (stateZip[1] && !postal_code) postal_code = stateZip[1];
      }
      if (parts.length >= 4 && (!country || country === 'US')) {
        const c = parts[3].trim();
        if (c.length === 2 || c.toLowerCase() === 'usa' || c.toLowerCase() === 'united states') {
          country = c === 'USA' || c === 'United States' ? 'US' : c;
        }
      }
    }

    // Exact contract matching backend expectation and user specification
    const payload = {
      store_address: (data.store_address || '').trim().slice(0, 255),
      suite_or_unit: data.suite_or_unit && data.suite_or_unit.trim() ? data.suite_or_unit.trim().slice(0, 100) : null,
      city: (city && city.trim() ? city.trim() : 'Dallas').slice(0, 100),
      state: (state && state.trim() ? state.trim() : 'TX').slice(0, 100),
      postal_code: (postal_code && postal_code.trim() ? postal_code.trim() : '75201').slice(0, 20),
      country: (country && country.trim() ? country.trim() : 'US').slice(0, 100),
      latitude:
        typeof data.latitude === 'number'
          ? data.latitude
          : data.latitude != null && !isNaN(Number(data.latitude))
          ? Number(data.latitude)
          : null,
      longitude:
        typeof data.longitude === 'number'
          ? data.longitude
          : data.longitude != null && !isNaN(Number(data.longitude))
          ? Number(data.longitude)
          : null,
      place_id: data.place_id ? String(data.place_id).slice(0, 255) : null,
    };

    const response = await api.post('/auth/merchant/onboarding/location', payload);
    return response.data || response;
  },

  /**
   * Step 3: Upload Business License Document
   * Calls: POST /auth/merchant/onboarding/license
   * 
   * @param {File} file
   */
  async uploadLicense(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/auth/merchant/onboarding/license', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data || response;
  },

  /**
   * Step 4: Setup Stripe Connect Payout Account
   * Calls: POST /auth/merchant/onboarding/payout
   * 
   * @param {{
   *   legal_business_name: string,
   *   ein: string,
   *   routing_number: string,
   *   account_number: string
   * }} data
   */
  async setupPayout(data) {
    const rawEin = (data.ein || '').trim().replace(/[^\d]/g, '');
    let formattedEin = (data.ein || '').trim();
    if (rawEin.length === 9) {
      formattedEin = `${rawEin.slice(0, 2)}-${rawEin.slice(2)}`;
    }

    const payload = {
      legal_business_name: (data.legal_business_name || '').trim().slice(0, 255),
      ein: formattedEin,
      routing_number: (data.routing_number || '').trim().replace(/\D/g, ''),
      account_number: (data.account_number || '').trim().replace(/\D/g, ''),
    };

    const response = await api.post('/auth/merchant/onboarding/payout', payload);
    return response.data || response;
  },

  /**
   * Fetch current onboarding progress
   * Calls: GET /auth/merchant/onboarding/tracking
   */
  async getTracking() {
    const response = await api.get('/auth/merchant/onboarding/tracking');
    return response.data || response;
  },

  /**
   * Resolves where the merchant should be routed based on admin approval & onboarding state
   * @param {string} fallbackTarget
   * @returns {Promise<string>}
   */
  async resolveDestination(fallbackTarget = '/dashboard') {
    try {
      const response = await this.getTracking();
      const tracking = response?.data || response;

      // 1. If admin has approved the application, grant access to Dashboard
      if (tracking?.registration_status === 'APPROVED' || tracking?.checklist?.admin_approved) {
        return fallbackTarget;
      }

      // 2. Unapproved merchant onboarding route is clean /register
      return '/register';
    } catch (err) {
      console.warn('Unable to resolve merchant onboarding tracking status:', err);
    }
    return fallbackTarget;
  },
};

export default merchantOnboardingService;
