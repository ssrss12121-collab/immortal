import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../constants.dart';

class MVPSpotlight extends StatelessWidget {
  final List<dynamic> mvps;
  const MVPSpotlight({super.key, required this.mvps});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          height: 150,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemCount: mvps.isEmpty ? 2 : mvps.length,
            itemBuilder: (context, idx) {
              if (mvps.isEmpty) return _buildSkeleton();
              final mvp = mvps[idx];
              return _buildMVPCard(mvp);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildMVPCard(dynamic mvp) {
    return Container(
      width: 140,
      margin: const EdgeInsets.symmetric(horizontal: 4),
      decoration: BoxDecoration(
        color: const Color(0xFF0C0C12),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.amber.withValues(alpha: 0.1)),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Background Glow
          Positioned(
            top: 20,
            child: Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.amber.withValues(alpha: 0.1),
                    blurRadius: 30,
                    spreadRadius: 10,
                  ),
                ],
              ),
            ),
          ),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircleAvatar(
                radius: 30,
                backgroundColor: Colors.white10,
                backgroundImage: NetworkImage(
                  mvp['image'] ?? 'https://i.pravatar.cc/150',
                ),
              ),
              const SizedBox(height: 12),
              Text(
                mvp['ign'] ?? 'OPERATIVE',
                style: GoogleFonts.plusJakartaSans(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                mvp['title'] ?? 'TOP FRAGGER',
                style: GoogleFonts.plusJakartaSans(
                  color: AppConstants.accentColor,
                  fontSize: 9,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          // Crown Icon
          const Positioned(
            top: 8,
            right: 8,
            child: Icon(LucideIcons.crown, size: 12, color: Colors.amber),
          ),
        ],
      ),
    );
  }

  Widget _buildSkeleton() {
    return Container(
      width: 140,
      margin: const EdgeInsets.symmetric(horizontal: 4),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16),
      ),
    );
  }
}
