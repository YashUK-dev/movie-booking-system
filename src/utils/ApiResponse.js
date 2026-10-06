export class ApiResponse {
  constructor(statusCode, message = 'Success', data = null, pagination = undefined) {
    this.success = statusCode < 400;
    this.message = message;
    if (data !== null) {
      this.data = data;
    }
    if (pagination !== undefined) {
      this.pagination = pagination;
    }
  }
}
