import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class AuthService with ChangeNotifier {
  Map<String, dynamic>? _user;
  bool _isLoading = true;

  Map<String, dynamic>? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;

  AuthService() {
    _init();
  }

  Future<void> _init() async {
    final prefs = await SharedPreferences.getInstance();
    final String? userStr = prefs.getString('battle_arena_user');
    if (userStr != null) {
      _user = jsonDecode(userStr);
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    final response = await ApiService.post('/auth/login', {
      'email': email,
      'password': password,
    });

    final data = jsonDecode(response.body);
    if (data['success'] == true) {
      _user = data['user'];
      await _saveUser(_user!);
      notifyListeners();
    } else {
      throw Exception(data['message'] ?? 'Login failed');
    }
  }

  Future<void> guestLogin() async {
    final response = await ApiService.post('/auth/guest-login', {});
    final data = jsonDecode(response.body);
    if (data['success'] == true) {
      _user = data['user'];
      await _saveUser(_user!);
      notifyListeners();
    } else {
      throw Exception(data['message'] ?? 'Guest login failed');
    }
  }

  Future<void> register(Map<String, dynamic> userData) async {
    final response = await ApiService.post('/auth/register', userData);
    final data = jsonDecode(response.body);
    if (data['success'] == true) {
      _user = data['user'];
      await _saveUser(_user!);
      notifyListeners();
    } else {
      throw Exception(data['message'] ?? 'Registration failed');
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('battle_arena_user');
    _user = null;
    notifyListeners();
  }

  Future<void> _saveUser(Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('battle_arena_user', jsonEncode(user));
  }

  Future<void> refreshSession() async {
    if (_user == null) return;
    try {
      final id = _user!['id'] ?? _user!['_id'];
      final response = await ApiService.get('/users/$id');
      final data = jsonDecode(response.body);
      if (data['user'] != null) {
        // preserve token
        final token = _user!['token'];
        _user = data['user'];
        _user!['token'] = token;
        await _saveUser(_user!);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Refresh session error: $e');
    }
  }
}
