import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants.dart';

class WelcomePage extends StatefulWidget {
  const WelcomePage({super.key});

  @override
  State<WelcomePage> createState() => _WelcomePageState();
}

class _WelcomePageState extends State<WelcomePage>
    with TickerProviderStateMixin {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  late AnimationController _rotationController;

  final List<Map<String, dynamic>> _slides = [
    {
      'title': 'ENTER THE ARENA',
      'subtitle': 'PROVE YOUR SUPREMACY',
      'description':
          'Join the ultimate eSports ecosystem. Compete in high-stakes tournaments where every kill counts.',
      'icon': LucideIcons.trophy,
      'accent': Colors.amber,
    },
    {
      'title': 'ASSEMBLE SQUAD',
      'subtitle': 'TACTICAL DOMINANCE',
      'description':
          'Form alliances, recruit operatives, and execute coordinated strikes. Your team is your weapon.',
      'icon': LucideIcons.users,
      'accent': Colors.cyanAccent,
    },
    {
      'title': 'CLAIM BOUNTIES',
      'subtitle': 'GET PAID TO PLAY',
      'description':
          'Convert your skills into real rewards. Climb the ranks to become an Immortal Legend.',
      'icon': LucideIcons.target,
      'accent': AppConstants.accentColor,
    },
  ];

  @override
  void initState() {
    super.initState();
    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat();
  }

  @override
  void dispose() {
    _rotationController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  void _onNext() {
    if (_currentPage < _slides.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOut,
      );
    } else {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Background Image with opacity
          Positioned.fill(
            child: Opacity(
              opacity: 0.4,
              child: Image.network(
                'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2670',
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) =>
                    Container(color: Colors.black),
              ),
            ),
          ),

          // Cyber Grid Effect
          const Positioned.fill(child: CyberGridPainter()),

          // Scanlines Effect
          const Positioned.fill(child: ScanlineEffect()),

          // Main Content
          SafeArea(
            child: Column(
              children: [
                // Top HUD
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: _slides[_currentPage]['accent'],
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: _slides[_currentPage]['accent'],
                                  blurRadius: 10,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'SYSTEM_INIT_V2.0',
                            style: GoogleFonts.shareTechMono(
                              color: Colors.white70,
                              fontSize: 10,
                              letterSpacing: 2,
                            ),
                          ),
                        ],
                      ),
                      TextButton(
                        onPressed: () =>
                            Navigator.pushReplacementNamed(context, '/login'),
                        child: Text(
                          'SKIP_SEQ',
                          style: GoogleFonts.shareTechMono(
                            color: Colors.white54,
                            fontSize: 10,
                            letterSpacing: 2,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Slides
                Expanded(
                  child: PageView.builder(
                    controller: _pageController,
                    onPageChanged: (idx) => setState(() => _currentPage = idx),
                    itemCount: _slides.length,
                    itemBuilder: (context, idx) {
                      final slide = _slides[idx];
                      return SingleChildScrollView(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 32.0),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              // Central Icon Graphic
                              SizedBox(
                                width: 240,
                                height: 240,
                                child: Stack(
                                  alignment: Alignment.center,
                                  children: [
                                    // Rotating Ring
                                    RotationTransition(
                                      turns: _rotationController,
                                      child: Container(
                                        width: 200,
                                        height: 200,
                                        decoration: BoxDecoration(
                                          border: Border.all(
                                            color: (slide['accent'] as Color)
                                                .withValues(alpha: 0.3),
                                            width: 2,
                                          ),
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                    ),
                                    // Icon
                                    Icon(
                                      slide['icon'],
                                      size: 80,
                                      color: slide['accent'],
                                    ),
                                    // Glow
                                    Container(
                                      width: 100,
                                      height: 100,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        boxShadow: [
                                          BoxShadow(
                                            color: (slide['accent'] as Color)
                                                .withValues(alpha: 0.1),
                                            blurRadius: 100,
                                            spreadRadius: 20,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 48),
                              // Text Content
                              Text(
                                slide['title'],
                                style: GoogleFonts.inter(
                                  fontSize: 32,
                                  fontWeight: FontWeight.w900,
                                  fontStyle: FontStyle.italic,
                                  height: 1.1,
                                  letterSpacing: -1,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 12),
                              Container(
                                height: 2,
                                width: 80,
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [
                                      Colors.transparent,
                                      Colors.white.withValues(alpha: 0.5),
                                      Colors.transparent,
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                slide['subtitle'],
                                style: GoogleFonts.shareTechMono(
                                  color: slide['accent'],
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 4,
                                ),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                slide['description'],
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 14,
                                  height: 1.5,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),

                // Bottom Controls
                Padding(
                  padding: const EdgeInsets.all(32.0),
                  child: Column(
                    children: [
                      // Indicators
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(_slides.length, (idx) {
                          return AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            height: 4,
                            width: _currentPage == idx ? 40 : 8,
                            decoration: BoxDecoration(
                              color: _currentPage == idx
                                  ? _slides[idx]['accent']
                                  : Colors.white10,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          );
                        }),
                      ),
                      const SizedBox(height: 32),
                      // Next Button
                      SizedBox(
                        width: double.infinity,
                        height: 60,
                        child: ElevatedButton(
                          onPressed: _onNext,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: Colors.black,
                            shape: const BeveledRectangleBorder(
                              borderRadius: BorderRadius.only(
                                topLeft: Radius.circular(12),
                                bottomRight: Radius.circular(12),
                              ),
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                _currentPage == _slides.length - 1
                                    ? 'DEPLOY OPERATOR'
                                    : 'NEXT PROTOCOL',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 2,
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Icon(LucideIcons.chevronRight, size: 20),
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
        ],
      ),
    );
  }
}

class CyberGridPainter extends StatelessWidget {
  const CyberGridPainter({super.key});

  @override
  Widget build(BuildContext context) {
    return CustomPaint(painter: _GridPainter());
  }
}

class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.05)
      ..strokeWidth = 1;

    for (double i = 0; i < size.width; i += 40) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), paint);
    }
    for (double i = 0; i < size.height; i += 40) {
      canvas.drawLine(Offset(0, i), Offset(size.width, i), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class ScanlineEffect extends StatelessWidget {
  const ScanlineEffect({super.key});

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.transparent,
              Colors.black.withValues(alpha: 0.05),
              Colors.transparent,
            ],
            stops: const [0.0, 0.5, 1.0],
          ),
        ),
      ),
    );
  }
}
