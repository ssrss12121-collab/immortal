import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../services/auth_service.dart';
import '../constants.dart';
import 'welcome_page.dart'; // for CyberGridPainter and ScanlineEffect

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  String? _error;

  void _handleLogin() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      await context.read<AuthService>().login(
        _emailController.text,
        _passwordController.text,
      );
      if (mounted) Navigator.pushReplacementNamed(context, '/home');
    } catch (e) {
      setState(
        () => _error = e.toString().contains('Exception:')
            ? e.toString().split('Exception: ')[1]
            : e.toString(),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _handleGuestLogin() async {
    setState(() => _isLoading = true);
    try {
      await context.read<AuthService>().guestLogin();
      if (mounted) Navigator.pushReplacementNamed(context, '/home');
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Background Image with Overlay
          Positioned.fill(
            child: Opacity(
              opacity: 0.3,
              child: CachedNetworkImage(
                imageUrl:
                    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3',
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(color: Colors.black),
              ),
            ),
          ),
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                  colors: [
                    Colors.black,
                    Colors.black.withValues(alpha: 0.8),
                    AppConstants.accentColor.withValues(alpha: 0.1),
                  ],
                ),
              ),
            ),
          ),
          const Positioned.fill(child: CyberGridPainter()),

          // Main Content
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(
                horizontal: 24.0,
                vertical: 48.0,
              ),
              child: Column(
                children: [
                  // Header
                  const SizedBox(height: 40),
                  Text(
                    'IMMORAL\nZONE',
                    style: GoogleFonts.inter(
                      fontSize: 56,
                      fontWeight: FontWeight.w900,
                      fontStyle: FontStyle.italic,
                      height: 0.9,
                      letterSpacing: -2,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Container(
                    height: 4,
                    width: 140,
                    decoration: const BoxDecoration(
                      color: AppConstants.accentColor,
                      boxShadow: [
                        BoxShadow(
                          color: AppConstants.accentColor,
                          blurRadius: 10,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'SYSTEM ACCESS PORTAL',
                    style: GoogleFonts.shareTechMono(
                      color: AppConstants.accentColor,
                      fontSize: 10,
                      letterSpacing: 4,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 60),

                  // Login Card
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: const Color(0xFF0C0C12).withValues(alpha: 0.8),
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.1),
                      ),
                    ),
                    child: Stack(
                      children: [
                        // Decorative Corners
                        Positioned(
                          top: -1,
                          left: -1,
                          child: Container(
                            width: 12,
                            height: 12,
                            decoration: const BoxDecoration(
                              border: Border(
                                top: BorderSide(
                                  color: AppConstants.accentColor,
                                  width: 2,
                                ),
                                left: BorderSide(
                                  color: AppConstants.accentColor,
                                  width: 2,
                                ),
                              ),
                            ),
                          ),
                        ),
                        Positioned(
                          bottom: -1,
                          right: -1,
                          child: Container(
                            width: 12,
                            height: 12,
                            decoration: const BoxDecoration(
                              border: Border(
                                bottom: BorderSide(
                                  color: AppConstants.accentColor,
                                  width: 2,
                                ),
                                right: BorderSide(
                                  color: AppConstants.accentColor,
                                  width: 2,
                                ),
                              ),
                            ),
                          ),
                        ),

                        Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    width: 4,
                                    height: 24,
                                    color: AppConstants.secondaryAccent,
                                  ),
                                  const SizedBox(width: 12),
                                  const Text(
                                    'OPERATOR LOGIN',
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 1,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 32),

                              if (_error != null) ...[
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Colors.red.withValues(alpha: 0.2),
                                    border: Border.all(
                                      color: Colors.red.withValues(alpha: 0.5),
                                    ),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(
                                        LucideIcons.alertTriangle,
                                        color: Colors.red,
                                        size: 16,
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          _error!,
                                          style: const TextStyle(
                                            color: Colors.red,
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 24),
                              ],

                              // Identity Field
                              const Text(
                                'IDENTITY',
                                style: TextStyle(
                                  color: Colors.grey,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 2,
                                ),
                              ),
                              const SizedBox(height: 8),
                              TextField(
                                controller: _emailController,
                                style: GoogleFonts.shareTechMono(),
                                decoration: InputDecoration(
                                  prefixIcon: const Icon(
                                    LucideIcons.mail,
                                    size: 18,
                                  ),
                                  hintText: 'ENTER EMAIL ID',
                                  hintStyle: TextStyle(
                                    color: Colors.grey.withValues(alpha: 0.3),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 24),

                              // Passcode Field
                              const Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'PASSCODE',
                                    style: TextStyle(
                                      color: Colors.grey,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 2,
                                    ),
                                  ),
                                  Text(
                                    'FORGOT?',
                                    style: TextStyle(
                                      color: Colors.grey,
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              TextField(
                                controller: _passwordController,
                                obscureText: true,
                                style: GoogleFonts.shareTechMono(),
                                decoration: const InputDecoration(
                                  prefixIcon: Icon(LucideIcons.lock, size: 18),
                                  hintText: '••••••••••',
                                ),
                              ),
                              const SizedBox(height: 32),

                              // Submit Button
                              SizedBox(
                                width: double.infinity,
                                height: 56,
                                child: ElevatedButton(
                                  onPressed: _isLoading ? null : _handleLogin,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.white,
                                    foregroundColor: Colors.black,
                                    shape: const BeveledRectangleBorder(
                                      borderRadius: BorderRadius.all(
                                        Radius.circular(8),
                                      ),
                                    ),
                                  ),
                                  child: _isLoading
                                      ? const SizedBox(
                                          height: 20,
                                          width: 20,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            color: Colors.black,
                                          ),
                                        )
                                      : const Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            Text(
                                              'ESTABLISH LINK',
                                              style: TextStyle(
                                                fontWeight: FontWeight.w900,
                                                letterSpacing: 2,
                                              ),
                                            ),
                                            SizedBox(width: 8),
                                            Icon(
                                              LucideIcons.chevronRight,
                                              size: 18,
                                            ),
                                          ],
                                        ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 48),

                  // Initialize New Profile
                  OutlinedButton(
                    onPressed: () => Navigator.pushNamed(context, '/register'),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(
                        color: Colors.white.withValues(alpha: 0.2),
                      ),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 32,
                        vertical: 16,
                      ),
                      shape: const BeveledRectangleBorder(
                        borderRadius: BorderRadius.all(Radius.circular(8)),
                      ),
                    ),
                    child: const Text(
                      'INITIALIZE NEW PROFILE',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2,
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),
                  Text(
                    'SECURE CONNECTION v2.0.4',
                    style: GoogleFonts.shareTechMono(
                      color: Colors.grey.withValues(alpha: 0.5),
                      fontSize: 9,
                    ),
                  ),

                  const SizedBox(height: 24),
                  TextButton(
                    onPressed: _isLoading ? null : _handleGuestLogin,
                    child: const Text(
                      'GUEST ACCESS PROTOCOL',
                      style: TextStyle(
                        color: Colors.grey,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
