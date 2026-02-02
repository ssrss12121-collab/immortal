import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../pages/welcome_page.dart';
import '../widgets/main_layout.dart';
import '../constants.dart';

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = context.watch<AuthService>();

    if (authService.isLoading) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: CircularProgressIndicator(color: AppConstants.accentColor),
        ),
      );
    }

    if (authService.isAuthenticated) {
      return const MainLayout();
    } else {
      return const WelcomePage();
    }
  }
}
