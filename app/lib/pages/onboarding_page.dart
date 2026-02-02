import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../services/auth_service.dart';
import '../constants.dart';
import 'welcome_page.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nameController = TextEditingController();
  final _ignController = TextEditingController();
  final _ageController = TextEditingController();
  final _expController = TextEditingController();

  String _selectedRole = 'Rusher';
  String _selectedCountry = 'Bangladesh';
  String _selectedDistrict = 'Dhaka';
  bool _termsAccepted = false;
  bool _isLoading = false;
  String? _error;

  final List<Map<String, dynamic>> _roles = [
    {'id': 'Rusher', 'icon': LucideIcons.zap},
    {'id': 'Sniper', 'icon': LucideIcons.crosshair},
    {'id': 'Supporter', 'icon': LucideIcons.shield},
    {'id': 'Nader', 'icon': LucideIcons.target},
  ];

  void _handleRegister() async {
    if (!_termsAccepted) {
      setState(() => _error = 'YOU MUST ACCEPT THE SQUAD PROTOCOLS.');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      await context.read<AuthService>().register({
        'name': _nameController.text,
        'ign': _ignController.text,
        'gameRole': _selectedRole,
        'experience': _expController.text,
        'age': int.tryParse(_ageController.text) ?? 18,
        'email': _emailController.text,
        'country': _selectedCountry,
        'district': _selectedCountry == 'Bangladesh'
            ? _selectedDistrict
            : 'International',
        'password': _passwordController.text,
      });
      if (mounted) Navigator.pushReplacementNamed(context, '/home');
    } catch (e) {
      setState(() => _error = e.toString().toUpperCase());
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
          // Background
          Positioned.fill(
            child: Opacity(
              opacity: 0.2,
              child: CachedNetworkImage(
                imageUrl:
                    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3',
                fit: BoxFit.cover,
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

          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(
                horizontal: 20.0,
                vertical: 32.0,
              ),
              child: Column(
                children: [
                  // Header
                  Text(
                    'IMMORAL\nZONE',
                    style: GoogleFonts.inter(
                      fontSize: 40,
                      fontWeight: FontWeight.w900,
                      fontStyle: FontStyle.italic,
                      height: 0.9,
                      letterSpacing: -1.5,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Container(
                    height: 2,
                    width: 100,
                    color: AppConstants.accentColor,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'INITIALIZE NEW OPERATOR',
                    style: GoogleFonts.shareTechMono(
                      color: AppConstants.accentColor,
                      fontSize: 10,
                      letterSpacing: 3,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Registration Card
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF0C0C12).withValues(alpha: 0.8),
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.1),
                      ),
                    ),
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (_error != null) ...[
                          Text(
                            _error!,
                            style: const TextStyle(
                              color: Colors.red,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1,
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],

                        // IGN
                        _buildLabel('CODENAME (IGN)'),
                        TextField(
                          controller: _ignController,
                          style: GoogleFonts.shareTechMono(),
                          decoration: const InputDecoration(
                            prefixIcon: Icon(LucideIcons.hash, size: 16),
                            hintText: 'E.G. NIGHTMARE',
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Name & Country
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  _buildLabel('FULL NAME'),
                                  TextField(
                                    controller: _nameController,
                                    decoration: const InputDecoration(
                                      prefixIcon: Icon(
                                        LucideIcons.user,
                                        size: 14,
                                      ),
                                      hintText: 'Name',
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  _buildLabel('COUNTRY'),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                    ),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF1A1A24),
                                      borderRadius: BorderRadius.circular(4),
                                      border: Border.all(
                                        color: Colors.white.withValues(
                                          alpha: 0.05,
                                        ),
                                      ),
                                    ),
                                    child: DropdownButtonHideUnderline(
                                      child: DropdownButton<String>(
                                        value: _selectedCountry,
                                        isExpanded: true,
                                        dropdownColor: const Color(0xFF0C0C12),
                                        style: GoogleFonts.shareTechMono(
                                          color: Colors.white,
                                          fontSize: 12,
                                        ),
                                        items: AppConstants.countries
                                            .map(
                                              (c) => DropdownMenuItem(
                                                value: c,
                                                child: Text(c),
                                              ),
                                            )
                                            .toList(),
                                        onChanged: (val) => setState(
                                          () => _selectedCountry = val!,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),

                        // District (if BD)
                        if (_selectedCountry == 'Bangladesh') ...[
                          _buildLabel('DISTRICT'),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1A1A24),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(
                                color: Colors.white.withValues(alpha: 0.05),
                              ),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                value: _selectedDistrict,
                                isExpanded: true,
                                dropdownColor: const Color(0xFF0C0C12),
                                style: GoogleFonts.shareTechMono(
                                  color: Colors.white,
                                  fontSize: 12,
                                ),
                                items: AppConstants.districts
                                    .map(
                                      (d) => DropdownMenuItem(
                                        value: d,
                                        child: Text(d),
                                      ),
                                    )
                                    .toList(),
                                onChanged: (val) =>
                                    setState(() => _selectedDistrict = val!),
                              ),
                            ),
                          ),
                          const SizedBox(height: 20),
                        ],

                        // Combat Role
                        _buildLabel('COMBAT ROLE'),
                        const SizedBox(height: 8),
                        Row(
                          children: _roles.map((r) {
                            final isSelected = _selectedRole == r['id'];
                            return Expanded(
                              child: GestureDetector(
                                onTap: () =>
                                    setState(() => _selectedRole = r['id']),
                                child: Container(
                                  margin: const EdgeInsets.symmetric(
                                    horizontal: 2,
                                  ),
                                  height: 64,
                                  decoration: BoxDecoration(
                                    color: isSelected
                                        ? AppConstants.secondaryAccent
                                              .withValues(alpha: 0.2)
                                        : const Color(0xFF1A1A24),
                                    border: Border.all(
                                      color: isSelected
                                          ? AppConstants.secondaryAccent
                                          : Colors.white.withValues(
                                              alpha: 0.05,
                                            ),
                                    ),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        r['icon'],
                                        size: 16,
                                        color: isSelected
                                            ? AppConstants.accentColor
                                            : Colors.grey,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        r['id'],
                                        style: const TextStyle(
                                          fontSize: 8,
                                          fontWeight: FontWeight.bold,
                                          letterSpacing: 1,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 20),

                        // Age & XP
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  _buildLabel('AGE'),
                                  TextField(
                                    controller: _ageController,
                                    keyboardType: TextInputType.number,
                                    decoration: const InputDecoration(
                                      prefixIcon: Icon(
                                        LucideIcons.calendar,
                                        size: 12,
                                      ),
                                      hintText: '18',
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  _buildLabel('XP'),
                                  TextField(
                                    controller: _expController,
                                    decoration: const InputDecoration(
                                      prefixIcon: Icon(
                                        LucideIcons.layers,
                                        size: 12,
                                      ),
                                      hintText: 'Years',
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),

                        // Email & Password
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  _buildLabel('EMAIL'),
                                  TextField(
                                    controller: _emailController,
                                    decoration: const InputDecoration(
                                      prefixIcon: Icon(
                                        LucideIcons.mail,
                                        size: 14,
                                      ),
                                      hintText: 'Email',
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  _buildLabel('PASSCODE'),
                                  TextField(
                                    controller: _passwordController,
                                    obscureText: true,
                                    decoration: const InputDecoration(
                                      prefixIcon: Icon(
                                        LucideIcons.lock,
                                        size: 14,
                                      ),
                                      hintText: '••••••••',
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),

                        // Terms
                        Row(
                          children: [
                            SizedBox(
                              width: 24,
                              height: 24,
                              child: Checkbox(
                                value: _termsAccepted,
                                onChanged: (val) =>
                                    setState(() => _termsAccepted = val!),
                                activeColor: AppConstants.accentColor,
                                checkColor: Colors.black,
                              ),
                            ),
                            const SizedBox(width: 12),
                            const Expanded(
                              child: Text(
                                'I AGREE TO SQUAD PROTOCOLS',
                                style: TextStyle(
                                  color: Colors.grey,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),

                        // Submit
                        SizedBox(
                          width: double.infinity,
                          height: 56,
                          child: ElevatedButton(
                            onPressed: _isLoading ? null : _handleRegister,
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
                                ? const CircularProgressIndicator(
                                    color: Colors.black,
                                  )
                                : const Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text(
                                        'DEPLOY PROFILE',
                                        style: TextStyle(
                                          fontWeight: FontWeight.w900,
                                          letterSpacing: 2,
                                        ),
                                      ),
                                      SizedBox(width: 8),
                                      Icon(LucideIcons.chevronRight, size: 18),
                                    ],
                                  ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),
                  // Alternative Link
                  TextButton(
                    onPressed: () =>
                        Navigator.pushReplacementNamed(context, '/login'),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text(
                          'EXISTING OPERATOR? ',
                          style: TextStyle(
                            color: Colors.grey,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1,
                          ),
                        ),
                        const Text(
                          'LOG IN',
                          style: TextStyle(
                            color: AppConstants.accentColor,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(
                          LucideIcons.chevronRight,
                          color: AppConstants.accentColor,
                          size: 14,
                        ),
                      ],
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

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Text(
        text,
        style: const TextStyle(
          color: Colors.grey,
          fontSize: 10,
          fontWeight: FontWeight.bold,
          letterSpacing: 2,
        ),
      ),
    );
  }
}
