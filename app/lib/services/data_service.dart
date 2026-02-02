import 'dart:convert';
import 'package:flutter/material.dart';
import 'api_service.dart';

class DataService extends ChangeNotifier {
  List<dynamic> _news = [];
  List<dynamic> _mvps = [];
  List<dynamic> _tournaments = [];
  Map<String, dynamic> _liveConfig = {'streams': [], 'archive': []};
  List<dynamic> _conversations = [];
  bool _isLoading = false;

  List<dynamic> get news => _news;
  List<dynamic> get mvps => _mvps;
  List<dynamic> get tournaments => _tournaments;
  Map<String, dynamic> get liveConfig => _liveConfig;
  List<dynamic> get conversations => _conversations;
  bool get isLoading => _isLoading;

  Future<void> fetchAllData() async {
    _isLoading = true;
    notifyListeners();

    try {
      await Future.wait([
        fetchNews(),
        fetchMVPs(),
        fetchTournaments(),
        fetchLiveConfig(),
        fetchConversations(),
      ]);
    } catch (e) {
      debugPrint('Error fetching data: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchConversations() async {
    try {
      final response = await ApiService.get('/chat/conversations');
      final data = jsonDecode(response.body);
      if (data['success'] == true) {
        _conversations = data['conversations'];
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error fetching conversations: $e');
    }
  }

  Future<void> fetchNews() async {
    final response = await ApiService.get('/news');
    final data = jsonDecode(response.body);
    if (data['success'] == true) {
      _news = data['news'];
      notifyListeners();
    }
  }

  Future<void> fetchMVPs() async {
    final response = await ApiService.get('/mvps');
    final data = jsonDecode(response.body);
    if (data['success'] == true) {
      _mvps = data['mvps'];
      notifyListeners();
    }
  }

  Future<void> fetchTournaments() async {
    final response = await ApiService.get('/tournaments');
    final data = jsonDecode(response.body);
    if (data['success'] == true) {
      _tournaments = data['tournaments'];
      notifyListeners();
    }
  }

  Future<void> fetchLiveConfig() async {
    final response = await ApiService.get('/system/settings/live_config');
    final data = jsonDecode(response.body);
    if (data['value'] != null) {
      _liveConfig = data['value'];
    } else {
      _liveConfig = {'streams': [], 'archive': []};
    }
    notifyListeners();
  }
}
