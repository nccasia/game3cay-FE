
import HttpClient from "../HttpClient";
import * as GlobalVariable from '../Common/GlobalVariable';

const baseUrl = `${GlobalVariable.useSSL ? "https" : "http"}://${GlobalVariable.hostname}:${GlobalVariable.useSSL ? "" : `:${GlobalVariable.port}`}`;

export default class ApiService {
  static async getBalance(userId: string) {
    return HttpClient.post(`${baseUrl}/get-balance`, { user: userId });
  }

  static async addBalance(userId: string, value: number) {
    return HttpClient.post(`${baseUrl}/add-balance`, { user: userId, value });
  }

  static async deductBalance(userId: string, value: number) {
    return HttpClient.post(`${baseUrl}/deduct-balance`, { user: userId, value });
  }

  static async swapToken(userId: string, value: number) {
    return HttpClient.post(`${baseUrl}/swap-token`, { user: userId, value });
  }
}