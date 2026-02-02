import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../constants.dart';

class RankingsPage extends StatefulWidget {
  const RankingsPage({super.key});

  @override
  State<RankingsPage> createState() => _RankingsPageState();
}

class _RankingsPageState extends State<RankingsPage> {
  String _activeTab = 'Roles';

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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'LEADER',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 26,
                  fontWeight: FontWeight.w900,
                  fontStyle: FontStyle.italic,
                  color: Colors.white,
                  letterSpacing: -0.5,
                ),
              ),
              Text(
                'BOARD',
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
            'GLOBAL RANKING DATA',
            style: GoogleFonts.shareTechMono(
              color: Colors.grey,
              fontSize: 8,
              letterSpacing: 2,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabs() {
    final tabs = ['Roles', 'Districts', 'Teams', 'Players'];
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: const Color(0xFF12121A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Row(
        children: tabs.map((tab) {
          bool isActive = _activeTab == tab;
          return Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _activeTab = tab),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: isActive
                      ? AppConstants.accentColor
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  tab.toUpperCase(),
                  textAlign: TextAlign.center,
                  style: GoogleFonts.plusJakartaSans(
                    color: isActive ? Colors.black : Colors.grey,
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildTabContent() {
    switch (_activeTab) {
      case 'Roles':
        return _buildRolesView();
      case 'Districts':
        return _buildDistrictsView();
      case 'Teams':
        return _buildTeamsView();
      case 'Players':
        return _buildPlayersView();
      default:
        return const Center(
          child: Text('Coming Soon', style: TextStyle(color: Colors.grey)),
        );
    }
  }

  Widget _buildRolesView() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 120),
      children: [
        _buildTopPlayerCard(),
        const SizedBox(height: 24),
        _buildListHeader('CONTENDERS'),
        const SizedBox(height: 12),
        _buildContenderItem(2, 'CyberGhost', '2,450', 'Rusher'),
        _buildContenderItem(3, 'Viper-X', '2,310', 'Sniper'),
        _buildContenderItem(4, 'Nightmare', '2,100', 'Supporter'),
      ],
    );
  }

  Widget _buildTopPlayerCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A24),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppConstants.accentColor.withValues(alpha: 0.3),
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            right: -20,
            bottom: -20,
            child: Icon(
              LucideIcons.swords,
              color: Colors.white.withValues(alpha: 0.03),
              size: 120,
            ),
          ),
          Row(
            children: [
              Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: 70,
                    height: 70,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: AppConstants.accentColor,
                        width: 2,
                      ),
                    ),
                    child: const CircleAvatar(
                      backgroundImage: NetworkImage(
                        'https://i.pravatar.cc/150?u=1',
                      ),
                    ),
                  ),
                  const Positioned(
                    top: -10,
                    right: -10,
                    child: Icon(
                      LucideIcons.crown,
                      color: Colors.amber,
                      size: 24,
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'NOOBMASTER69',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'GLOBAL MVP // CLASS RUSHER',
                      style: TextStyle(
                        color: AppConstants.accentColor,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _buildSmallStat('2,850', 'PTS'),
                        const SizedBox(width: 16),
                        _buildSmallStat('1.85', 'KD'),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSmallStat(String val, String label) {
    return Row(
      children: [
        Text(
          val,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 12,
            fontWeight: FontWeight.w900,
            fontStyle: FontStyle.italic,
          ),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: const TextStyle(
            color: Colors.grey,
            fontSize: 8,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildListHeader(String title) {
    return Row(
      children: [
        Container(width: 4, height: 16, color: AppConstants.accentColor),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 12,
            fontWeight: FontWeight.w900,
            letterSpacing: 2,
          ),
        ),
      ],
    );
  }

  Widget _buildContenderItem(int rank, String ign, String pts, String role) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF0C0C12),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 30,
            child: Text(
              '#$rank',
              style: const TextStyle(
                color: Colors.grey,
                fontSize: 12,
                fontWeight: FontWeight.bold,
                fontStyle: FontStyle.italic,
              ),
            ),
          ),
          const CircleAvatar(
            radius: 16,
            backgroundImage: NetworkImage('https://i.pravatar.cc/150'),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  ign.toUpperCase(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  role.toUpperCase(),
                  style: TextStyle(
                    color: Colors.grey,
                    fontSize: 8,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                pts,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const Text(
                'PTS',
                style: TextStyle(
                  color: Colors.grey,
                  fontSize: 8,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDistrictsView() => const Center(
    child: Text(
      'DISTRICT INTEL PENDING',
      style: TextStyle(color: Colors.grey, fontSize: 10, letterSpacing: 2),
    ),
  );
  Widget _buildTeamsView() => const Center(
    child: Text(
      'SQUAD DATA ENCRYPTED',
      style: TextStyle(color: Colors.grey, fontSize: 10, letterSpacing: 2),
    ),
  );
  Widget _buildPlayersView() => const Center(
    child: Text(
      'OPERATIVE BIOMETRICS PENDING',
      style: TextStyle(color: Colors.grey, fontSize: 10, letterSpacing: 2),
    ),
  );
}
