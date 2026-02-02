import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/data_service.dart';
import '../constants.dart';
import '../widgets/home/home_carousel.dart';
import '../widgets/home/intel_feed.dart';
import '../widgets/home/mvp_spotlight.dart';
import '../widgets/home/deployments_list.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DataService>().fetchAllData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthService>().user;
    final dataService = context.watch<DataService>();

    return Container(
      color: Colors.black,
      child: RefreshIndicator(
        color: AppConstants.accentColor,
        backgroundColor: const Color(0xFF1B1B25),
        onRefresh: () => dataService.fetchAllData(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.only(bottom: 110),
          child: Column(
            children: [
              _buildHeader(user?['name'] ?? 'Operator'),
              const SizedBox(height: 24),
              HomeCarousel(
                slides: const [
                  {
                    'type': 'BANNER',
                    'data': {
                      'image':
                          'https://images.unsplash.com/photo-1542751371-adc38448a05e',
                      'title': 'GLOBAL OFFENSIVE V5',
                      'description':
                          'The ultimate showdown begins now. Join the elite.',
                      'badgeText': 'ACTIVE NOW',
                    },
                  },
                  {
                    'type': 'BANNER',
                    'data': {
                      'image':
                          'https://images.unsplash.com/photo-1511512578047-dfb367046420',
                      'title': 'NIGHT CITY BOUNTY',
                      'description':
                          'Contract details decrypted. High stakes, high rewards.',
                      'badgeText': 'FEATURED',
                    },
                  },
                ],
              ),
              const SizedBox(height: 32),
              _buildSectionHeader(LucideIcons.radio, 'INTEL FEED'),
              const SizedBox(height: 20),
              IntelFeed(news: dataService.news),
              const SizedBox(height: 32),
              _buildTechSeparator(),
              const SizedBox(height: 32),
              _buildSectionHeader(LucideIcons.award, 'MVP SPOTLIGHT'),
              const SizedBox(height: 20),
              MVPSpotlight(mvps: dataService.mvps),
              const SizedBox(height: 32),
              _buildSectionHeader(LucideIcons.swords, 'ACTIVE DEPLOYMENTS'),
              const SizedBox(height: 20),
              DeploymentsList(tournaments: dataService.tournaments),
              const SizedBox(height: 48),
              _buildSectionHeader(LucideIcons.users, 'ELITE_OPERATORS'),
              const SizedBox(height: 20),
              SizedBox(
                height: 110,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: 8,
                  itemBuilder: (context, idx) => _buildOperatorAvatar(),
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(String name) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 50, 20, 0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    'IMMORAL ',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                      fontStyle: FontStyle.italic,
                      letterSpacing: -1,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    'ZONE',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                      fontStyle: FontStyle.italic,
                      letterSpacing: -1,
                      color: AppConstants.accentColor,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppConstants.accentColor,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppConstants.accentColor,
                          blurRadius: 4,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'SYSTEM ONLINE',
                    style: GoogleFonts.plusJakartaSans(
                      color: AppConstants.accentColor,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 2,
                    ),
                  ),
                ],
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF1B1B25),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
            ),
            child: const Icon(LucideIcons.bell, color: Colors.white, size: 22),
          ),
        ],
      ),
    );
  }

  Widget _buildTechSeparator() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: Row(
        children: [
          Expanded(
            child: Container(
              height: 1,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.transparent,
                    AppConstants.accentColor.withValues(alpha: 0.4),
                  ],
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Text(
              'ENCRYPTED DATA STREAM',
              style: GoogleFonts.shareTechMono(
                color: AppConstants.accentColor,
                fontSize: 8,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.5,
              ),
            ),
          ),
          Expanded(
            child: Container(
              height: 1,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppConstants.accentColor.withValues(alpha: 0.4),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(IconData icon, String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(icon, size: 20, color: AppConstants.accentColor),
              const SizedBox(width: 12),
              Text(
                title.toUpperCase(),
                style: GoogleFonts.plusJakartaSans(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  fontStyle: FontStyle.italic,
                  letterSpacing: 1,
                ),
              ),
            ],
          ),
          if (title.toUpperCase() == 'INTEL FEED')
            Text(
              'VIEW ALL >',
              style: GoogleFonts.plusJakartaSans(
                color: Colors.white60,
                fontSize: 9,
                fontWeight: FontWeight.bold,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildOperatorAvatar() {
    return Container(
      margin: const EdgeInsets.only(right: 16),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: AppConstants.accentColor.withValues(alpha: 0.3),
                width: 1.5,
              ),
            ),
            child: const CircleAvatar(
              radius: 30,
              backgroundImage: NetworkImage('https://i.pravatar.cc/150'),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'OPERATIVE',
            style: GoogleFonts.shareTechMono(
              fontSize: 8,
              color: Colors.white70,
              fontWeight: FontWeight.bold,
              letterSpacing: 1,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
