import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../constants.dart';

class GuildPage extends StatefulWidget {
  const GuildPage({super.key});

  @override
  State<GuildPage> createState() => _GuildPageState();
}

class _GuildPageState extends State<GuildPage> {
  String _activeTab = 'OPERATIONS';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            _buildTabs(),
            Expanded(child: _buildTabContent()),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    'GUILD ',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 26,
                      fontWeight: FontWeight.w900,
                      fontStyle: FontStyle.italic,
                      color: Colors.white,
                      letterSpacing: -0.5,
                    ),
                  ),
                  Text(
                    'HUB',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 26,
                      fontWeight: FontWeight.w900,
                      fontStyle: FontStyle.italic,
                      color: AppConstants.accentColor,
                      letterSpacing: -0.5,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                'BATTLE TOGETHER',
                style: GoogleFonts.shareTechMono(
                  color: Colors.grey,
                  fontSize: 8,
                  letterSpacing: 2,
                ),
              ),
            ],
          ),
          Container(
            decoration: const BoxDecoration(
              color: AppConstants.accentColor,
              shape: BoxShape.circle,
            ),
            child: IconButton(
              onPressed: () {},
              icon: const Icon(LucideIcons.plus, color: Colors.black, size: 20),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabs() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: const Color(0xFF12121A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Row(
        children: [
          _buildTabButton('POPULAR'),
          _buildTabButton('MY GUILD'),
          _buildTabButton('INVITES'),
        ],
      ),
    );
  }

  Widget _buildTabButton(String label) {
    bool isActive = _activeTab == label;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _activeTab = label),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isActive ? AppConstants.accentColor : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: GoogleFonts.plusJakartaSans(
              color: isActive ? Colors.black : Colors.grey,
              fontSize: 10,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTabContent() {
    if (_activeTab == 'OPERATIONS') {
      return _buildOperationsView();
    } else {
      return _buildIntelligenceView();
    }
  }

  Widget _buildOperationsView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            LucideIcons.users,
            size: 48,
            color: Colors.grey.withValues(alpha: 0.2),
          ),
          const SizedBox(height: 16),
          const Text(
            'NO ACTIVE DEPLOYMENTS FOUND',
            style: TextStyle(
              color: Colors.grey,
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 2,
              fontStyle: FontStyle.italic,
            ),
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: () => setState(() => _activeTab = 'INTELLIGENCE'),
            child: const Text(
              'ENLIST IN OTHER GUILDS',
              style: TextStyle(
                color: AppConstants.accentColor,
                fontSize: 10,
                fontWeight: FontWeight.w900,
                decoration: TextDecoration.underline,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIntelligenceView() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 120),
      children: [
        _buildSearch(),
        const SizedBox(height: 24),
        _buildGuildCard(
          'TR.ALPHASQUAD',
          'ALPHA SQUAD',
          'Primary strike force for seasonal tournaments.',
          150,
          450,
        ),
        _buildGuildCard(
          'TR.CYBERKNIGHTS',
          'CYBER KNIGHTS',
          'Tactical intelligence and stealth operations.',
          85,
          210,
        ),
      ],
    );
  }

  Widget _buildSearch() {
    return TextField(
      style: GoogleFonts.shareTechMono(fontSize: 12),
      decoration: InputDecoration(
        prefixIcon: const Icon(LucideIcons.search, size: 16),
        hintText: 'SEARCH GUILD DIRECTORY...',
        contentPadding: const EdgeInsets.symmetric(vertical: 16),
        filled: true,
        fillColor: const Color(0xFF0C0C12),
      ),
    );
  }

  Widget _buildGuildCard(
    String tag,
    String name,
    String desc,
    int units,
    int intel,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0C0C12),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
            ),
            child: const Icon(
              LucideIcons.shield,
              color: AppConstants.accentColor,
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Icon(
                      LucideIcons.checkCircle,
                      color: Colors.blue,
                      size: 12,
                    ),
                  ],
                ),
                Text(
                  desc,
                  style: const TextStyle(color: Colors.grey, fontSize: 10),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _buildSmallIconStat(LucideIcons.users, '$units UNITS'),
                    const SizedBox(width: 12),
                    _buildSmallIconStat(LucideIcons.heart, '$intel INTEL'),
                  ],
                ),
              ],
            ),
          ),
          const Icon(LucideIcons.chevronRight, color: Colors.grey, size: 16),
        ],
      ),
    );
  }

  Widget _buildSmallIconStat(IconData icon, String label) {
    return Row(
      children: [
        Icon(icon, color: Colors.grey, size: 10),
        const SizedBox(width: 4),
        Text(
          label,
          style: GoogleFonts.shareTechMono(color: Colors.grey, fontSize: 9),
        ),
      ],
    );
  }
}
