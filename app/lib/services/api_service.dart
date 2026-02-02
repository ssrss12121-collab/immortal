import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants.dart';

class ApiService {
  static Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final String? sessionStr = prefs.getString('battle_arena_user');

    Map<String, String> headers = {'Content-Type': 'application/json'};

    if (sessionStr != null) {
      final user = jsonDecode(sessionStr);
      final token = user['token'];
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }
    return headers;
  }

  static Future<http.Response> get(String endpoint) async {
    final headers = await _getHeaders();
    return await http.get(
      Uri.parse('${AppConstants.apiBaseUrl}$endpoint'),
      headers: headers,
    );
  }

  static Future<http.Response> post(String endpoint, dynamic body) async {
    final headers = await _getHeaders();
    return await http.post(
      Uri.parse('${AppConstants.apiBaseUrl}$endpoint'),
      headers: headers,
      body: jsonEncode(body),
    );
  }

  static Future<http.Response> delete(String endpoint) async {
    final headers = await _getHeaders();
    return await http.delete(
      Uri.parse('${AppConstants.apiBaseUrl}$endpoint'),
      headers: headers,
    );
  }
}
