import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { AdvancedSearchQuery } from '../models/AdvancedSearch';
import { UserForm } from '../models/User';
import { PasswordRecoveryResponse } from '../models/HttpResponse';

// This will only be set in development mode.  Production runs everything on the same domain.
const baseURL = process.env.REACT_APP_QSA_PUBLIC_URL || '';

const searchUrl = `${baseURL}/api/advanced_search`;
const fetchUrl = `${baseURL}/api/fetch`;
const contextUrl = `${baseURL}/api/fetch_context`;
const loginUrl = `${baseURL}/api/authenticate`;
const logoutUrl = `${baseURL}/api/logout`;
const loggedInUserUrl = `${baseURL}/api/logged_in_user`;
const registerUrl = `${baseURL}/api/users`;
const updateContactDetailsUrl = `${baseURL}/api/users/update`;
const updatePasswordUrl = `${baseURL}/api/users/update_password`;
const recoveryTokenUrl = `${baseURL}/api/generate_token`;
const recoveryTokenPasswordUrl = `${baseURL}/api/token_update_password`;
const userUrl = `${baseURL}/api/admin/user`;
const usersUrl = `${baseURL}/api/admin/users`;
const becomeUserUrl = `${baseURL}/api/admin/become_user`;
const cartUrl = `${baseURL}/api/users/cart`;
const addToCartUrl = `${baseURL}/api/users/cart/add_item`;
const updateCartItemsUrl = `${baseURL}/api/users/cart/update_items`;
const removeFromCartUrl = `${baseURL}/api/users/cart/remove_item`;
const submitReadingRoomRequestsUrl = `${baseURL}/api/users/cart/create_reading_room_requests`;
const userRequestsUrl = `${baseURL}/api/users/requests`;
const clearCartUrl = `${baseURL}/api/users/cart/clear`;
const submitDigitalQuoteUrl = `${baseURL}/api/users/cart/create_digital_copy_quote_requests`;
const digitalCopyPricingUrl = `${baseURL}/api/digital_copy_pricing`;
const submitOrderUrl = `${baseURL}/api/submit_order`;
const getTagsUrl = `${baseURL}/api/tags`;
const addTagUrl = `${baseURL}/api/tags`;
const flagTagUrl = `${baseURL}/api/tags/flag`;
const getFlaggedTagsUrl = `${baseURL}/api/tags/flagged`;
const moderateTagUrl = `${baseURL}/api/tags/moderate`;
const getBannedTagsUrl = `${baseURL}/api/tags/banned`;
const addToBannedTagsUrl = `${baseURL}/api/tags/add-to-banned`;
const removeFromBannedTagsUrl = `${baseURL}/api/tags/remove-from-banned`;
const getPreviewTagUrl = `${baseURL}/api/tags/preview`;
const verifyCaptchaUrl = `${baseURL}/api/verify-captcha`;
const isCaptchaVerifiedUrl = `${baseURL}/api/captcha-verified`;


export class Http {
  static config: AxiosRequestConfig = {
    headers: {
      Accept: 'application/json'
    }
  };

  private static instance: Http | null;
  private sessionId?: string;

  constructor(sessionId?: string) {
    this.sessionId = sessionId;
  }

  static login(sessionId: string | null): void {
    if (sessionId) {
      Http.instance = new Http(sessionId);
    } else {
      Http.logout();
    }
  }

  static logout(): void {
    Http.instance = null;
  }

  getConfig(): any {
    const result = { ...Http.config };
    result.headers = Object.assign(
      {},
      result.headers,
      this.sessionId ? { 'x-archivessearch-session': this.sessionId } : {}
    );

    return result;
  }

  static get(): any {
    if (!Http.instance) {
      Http.instance = new Http();
    }

    return Http.instance;
  }

  handleError(error: any, message?: string): any {
    let errorMessage = message;

    if (!errorMessage) {
      errorMessage = error.message;
    }

    window.location.href = "/error?msg=" + encodeURIComponent(errorMessage || '');

    return error;
  }

  async fetchResults<T>(advancedSearchQuery: AdvancedSearchQuery, page = 0): Promise<T[]> {
    const query = advancedSearchQuery.toJSON();
    const response = await axios.post(`${searchUrl}?query=${query}&page=${page}`, this.getConfig()).catch(error => {
      return this.handleError(error, "Failed to fetch search results");
    });

    return response.data || [];
  }

  async fetchByQSAID(qsaId: string, recordType: string): Promise<any> {
    const response = await axios
      .get(`${fetchUrl}?qsa_id=${qsaId}&type=${recordType}`, this.getConfig())
      .catch(error => {
        return this.handleError(error, `Failure fetching record with ID ${qsaId}`);
      });

    return response.data;
  }

  async fetchContextByQSAID(qsaId: string, recordType: string): Promise<any> {
    const response = await axios
      .get(`${contextUrl}?qsa_id=${qsaId}&type=${recordType}`, this.getConfig())
      .catch(error => {
        return {data: false}
      });

    return response.data;
  }

  async login(email: string, password: string): Promise<any> {
    const bodyFormData = new FormData();
    bodyFormData.set('email', email);
    bodyFormData.set('password', password);

    const response = await axios
      .post(loginUrl, bodyFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .catch(error => {
        return this.handleError(error, "Login failed");
      });

    return response.data || [];
  }

  async logout(): Promise<any> {
    const response = await axios.post(logoutUrl, this.getConfig()).catch(error => {
      return this.handleError(error, "Logout failed");
    });

    return response.data || [];
  }

  async getCurrentUser(): Promise<AxiosResponse> {
    return await axios.get(`${loggedInUserUrl}`, this.getConfig());
  }

  async register(user: UserForm): Promise<any> {
    const bodyFormData = new FormData();
    bodyFormData.set('user', JSON.stringify(user));

    const response = await axios
      .post(registerUrl, bodyFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .catch(error => {
        return this.handleError(error, "Failed to register new user");
      });

    return response.data || [];
  }

  async updateUser(user: UserForm): Promise<any> {
    const bodyFormData = new FormData();
    bodyFormData.set('user', JSON.stringify(user));

    const config = this.getConfig();
    config.headers['Content-Type'] = 'multipart/form-data';

    const response = await axios.post(updateContactDetailsUrl, bodyFormData, config).catch(error => {
      return this.handleError(error, "Failed to update user");
    });

    return response.data || [];
  }

  async updatePassword(data: any): Promise<any> {
    const bodyFormData = new FormData();
    bodyFormData.set('current_password', data.current_password);
    bodyFormData.set('password', data.password);
    bodyFormData.set('confirm_password', data.confirm_password);

    const config = this.getConfig();
    config.headers['Content-Type'] = 'multipart/form-data';

    const response = await axios.post(updatePasswordUrl, bodyFormData, config).catch(error => {
      return this.handleError(error, "Failed to update password");
    });

    return response.data || [];
  }

  async getUsers(page: number, filter: any): Promise<any> {
    const params = Object.assign({}, { page: page }, filter, {
      version: undefined
    });

    const response = await axios.get(`${usersUrl}`, Object.assign({}, this.getConfig(), { params }))
      .catch(error => {
        return this.handleError(error, "Failed to list users");
      });

    return response.data || [];
  }

  async getUser(userId: number): Promise<any> {
    const params = { user_id: userId };
    const response = await axios.get(`${userUrl}`, Object.assign({}, this.getConfig(), { params }))
      .catch(error => {
        return this.handleError(error, "Failed to get user");
      });

    return response.data || [];
  }

  async generateRecoveryToken(email: string): Promise<PasswordRecoveryResponse> {
    const params = { email };
    const response = await axios.get(`${recoveryTokenUrl}`, Object.assign({}, this.getConfig(), { params }))
      .catch(error => {
        return this.handleError(error, "Failed to get recovery token URL");
      });
    return response.data;
  }

  async recoverPassword(token: string, password: string): Promise<PasswordRecoveryResponse> {
    const params = { token, password };
    const response = await axios.get(`${recoveryTokenPasswordUrl}`, Object.assign({}, this.getConfig(), { params }))
      .catch(error => {
        return this.handleError(error, "Failed to set recovered password");
      });

    return response.data;
  }

  async getCart(): Promise<any> {
    const response = await axios.get(`${cartUrl}`, this.getConfig())
      .catch(error => {
        return this.handleError(error, "Failed to fetch cart");
      });

    return response.data || [];
  }

  async addToCart(item_id: string, request_type: string): Promise<any> {
    const bodyFormData = new FormData();
    bodyFormData.set('item_id', item_id);
    bodyFormData.set('request_type', request_type);

    const config = this.getConfig();
    config.headers['Content-Type'] = 'multipart/form-data';

    const response = await axios.post(addToCartUrl, bodyFormData, config)
      .catch(error => {
        return this.handleError(error, "Failed to add item to cart");
      });

    return response.data || [];
  }

  async updateCartItems(cartItems: any[], requestType: string): Promise<any> {
    const bodyFormData = new FormData();
    bodyFormData.set('request_type', requestType);
    cartItems.forEach((cartItem: any) => {
      bodyFormData.append('cart_items[]', JSON.stringify(cartItem.options));
    });

    const config = this.getConfig();
    config.headers['Content-Type'] = 'multipart/form-data';

    const response = await axios.post(updateCartItemsUrl, bodyFormData, config).catch(error => {
      return this.handleError(error, "Failed to update cart items");
    });

    return response.data || [];
  }

  async removeFromCart(cartItemId: number): Promise<any> {
    const bodyFormData = new FormData();
    bodyFormData.set('id', String(cartItemId));

    const config = this.getConfig();
    config.headers['Content-Type'] = 'multipart/form-data';

    const response = await axios.post(removeFromCartUrl, bodyFormData, config).catch(error => {
      return this.handleError(error, "Failed to remove item from cart");
    });

    return response.data || [];
  }

  async submitReadingRoomRequests(dateRequired?: string, agencyFields?: any): Promise<any> {
    const bodyFormData = new FormData();
    if (dateRequired) {
      bodyFormData.set('date_required', dateRequired);
    }

    if (agencyFields) {
      bodyFormData.set('agency_fields', JSON.stringify(agencyFields));
    }

    const config = this.getConfig();
    config.headers['Content-Type'] = 'multipart/form-data';

    const response = await axios.post(submitReadingRoomRequestsUrl, bodyFormData, config).catch(error => {
      return this.handleError(error, "Failed to submit reading room request");
    });

    return response.data || [];
  }

  async getRequests(): Promise<any> {
    const response = await axios.get(`${userRequestsUrl}`, this.getConfig()).catch(error => {
      return this.handleError(error, "Failed to get user requests");
    });

    return response.data || [];
  }

  async clearCart(requestType: string): Promise<any> {
    const config = this.getConfig();

    const bodyFormData = new FormData();
    bodyFormData.set('request_type', requestType);

    const response = await axios.post(clearCartUrl, bodyFormData, config).catch(error => {
      return this.handleError(error, "Failed to clear cart");
    });

    return response.data || [];
  }

  async submitDigitalQuoteRequest(): Promise<any> {
    const bodyFormData = new FormData();

    const config = this.getConfig();
    config.headers['Content-Type'] = 'multipart/form-data';

    const response = await axios.post(submitDigitalQuoteUrl, bodyFormData, config).catch(error => {
      return this.handleError(error, "Failed to submit digital quote request");
    });

    return response.data || [];
  }

  async becomeUser(userId: number): Promise<any> {
    const bodyFormData = new FormData();
    bodyFormData.set('user_id', ''+userId);

    const config = this.getConfig();
    config.headers['Content-Type'] = 'multipart/form-data';

    const response = await axios.post(becomeUserUrl, bodyFormData, config).catch(error => {
      return this.handleError(error, "Failed to become user");
    });

    return response.data || [];
  }

  async getDigitalCopyPricing(): Promise<any> {
    const response = await axios.get(`${digitalCopyPricingUrl}`, this.getConfig()).catch(error => {
      return this.handleError(error, "Failed to get digital copy pricing");
    });

    return response.data || {};
  }

  async goToPayment(options: any): Promise<any> {
    const bodyFormData = new FormData();

    Object.keys(options).forEach((key: string) => {
      bodyFormData.set(key, options[key]);
    });

    const config = this.getConfig();
    config.headers['Content-Type'] = 'multipart/form-data';

    return await axios.post(submitOrderUrl, bodyFormData, config).catch(error => {
      return this.handleError(error, "Failed to submit order");
    });
  }

  async getTags(recordId: string): Promise<any> {
    const params = {
      record_id: recordId
    };

    const response = await axios.get(`${getTagsUrl}`, Object.assign({}, this.getConfig(), { params }))
      .catch(error => {
        return this.handleError(error, "Failed to get tags");
      });

    return response.data || [];
  }

  async addTag(tag: string, recordId: string): Promise<any> {
    const bodyFormData = new FormData();
    bodyFormData.set('tag', JSON.stringify({
      tag: tag,
      record_id: recordId,
    }));

    const config = this.getConfig();
    config.headers['Content-Type'] = 'multipart/form-data';

    const response = await axios.post(addTagUrl, bodyFormData, config).catch(error => {
      return this.handleError(error, "Failed to add tag");
    });

    return response.data || [];
  }

  async flagTag(tagId: string): Promise<any> {
    const bodyFormData = new FormData();
    bodyFormData.set('tag_id', tagId);

    const config = this.getConfig();
    config.headers['Content-Type'] = 'multipart/form-data';

    const response = await axios.post(flagTagUrl, bodyFormData, config).catch(error => {
      return this.handleError(error, "Failed to flag tag");
    });

    return response.data || [];
  }

  async getAllFlaggedTags(): Promise<any> {
    const response = await axios.get(`${getFlaggedTagsUrl}`, this.getConfig()).catch(error => {
      return this.handleError(error, "Failed to list all flag tags");
    });

    return response.data || [];
  }

  async moderateTag(tagId: string, action: string): Promise<any> {
    const bodyFormData = new FormData();
    bodyFormData.set('tag_id', tagId);
    bodyFormData.set('action', action);

    const config = this.getConfig();
    config.headers['Content-Type'] = 'multipart/form-data';

    const response = await axios.post(moderateTagUrl, bodyFormData, config).catch(error => {
      return this.handleError(error, "Failed to moderate tag");
    });

    return response.data || [];
  }

  async getBannedTags(): Promise<any> {
    const response = await axios.get(`${getBannedTagsUrl}`, this.getConfig())
      .catch(error => {
        return this.handleError(error, "Failed to get banned tags");
      });

    return response.data || [];
  }

  async addToBannedTags(tags: string[]): Promise<any> {
    const bodyFormData = new FormData();
    tags.forEach((tag) => {
      bodyFormData.append('tag[]', tag);
    });

    const config = this.getConfig();
    config.headers['Content-Type'] = 'multipart/form-data';

    const response = await axios.post(addToBannedTagsUrl, bodyFormData, config)
      .catch(error => {
        return this.handleError(error, "Failed to add to banned tag");
      });

    return response.data || [];
  }

  async removeFromBannedTags(tags: string[]): Promise<any> {
    const bodyFormData = new FormData();
    tags.forEach((tag) => {
      bodyFormData.append('tag[]', tag);
    });

    const config = this.getConfig();
    config.headers['Content-Type'] = 'multipart/form-data';

    const response = await axios.post(removeFromBannedTagsUrl, bodyFormData, config).catch(error => {
      return this.handleError(error, "Failed to remove banned tags");
    });

    return response.data || [];
  }

  async previewTag(tag: string): Promise<any> {
    const params = {
      tag: tag
    };

    const response = await axios.get(`${getPreviewTagUrl}`, Object.assign({}, this.getConfig(), {params}))
      .catch(error => {
        // Non-fatal!
        return {data: []};
      });

    return response.data || [];
  }

  async verifyCaptcha(token: string): Promise<any> {
    const bodyFormData = new FormData();
    bodyFormData.append('captcha_token', token);

    const config = this.getConfig();
    config.headers['Content-Type'] = 'multipart/form-data';

    const response = await axios.post(verifyCaptchaUrl, bodyFormData, config).catch(error => {
      return this.handleError(error, "Failed to verify CAPTCHA");
    });

    return response.data || [];
  }

  async isCaptchaVerified(): Promise<any> {
    const response = await axios.get(`${isCaptchaVerifiedUrl}`, this.getConfig()).catch(error => {
      return this.handleError(error, "Failed to check CAPTCHA verification status");
    });

    return response.data || [];
  }
}
