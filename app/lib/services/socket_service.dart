import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../constants.dart';

class SocketService {
  late io.Socket socket;

  void connect(String token) {
    socket = io.io(
      AppConstants.socketUrl,
      io.OptionBuilder().setTransports(['websocket']).setAuth({
        'token': token,
      }).build(),
    );

    socket.onConnect((_) {
      debugPrint('Socket connected');
    });

    socket.onDisconnect((_) => debugPrint('Socket disconnected'));

    socket.connect();
  }

  void disconnect() {
    socket.disconnect();
  }

  void emit(String event, dynamic data) {
    socket.emit(event, data);
  }

  void on(String event, Function(dynamic) callback) {
    socket.on(event, (data) => callback(data));
  }
}
