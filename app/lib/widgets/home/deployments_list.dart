import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../constants.dart';

class DeploymentsList extends StatelessWidget {
  final List<dynamic> tournaments;
  const DeploymentsList({super.key, required this.tournaments});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16),
          itemCount: tournaments.isEmpty ? 2 : tournaments.length,
          itemBuilder: (context, idx) {
            if (tournaments.isEmpty) return _buildSkeleton();
            final t = tournaments[idx];
            return _buildTournamentCard(t);
          },
        ),
      ],
    );
  }

  Widget _buildTournamentCard(dynamic t) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF0C0C12).withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Row(
        children: [
          // Tournament Image
          Container(
            width: 64,
            height: 48,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(4),
              image: DecorationImage(
                image: CachedNetworkImageProvider(
                  t['image'] ??
                      'https://images.unsplash.com/photo-1542751371-adc38448a05e',
                ),
                fit: BoxFit.cover,
                opacity: 0.7,
              ),
            ),
          ),
          const SizedBox(width: 16),
          // Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  t['title']?.toUpperCase() ?? 'CLASSIFIED MISSION',
                  style: GoogleFonts.plusJakartaSans(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.2,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: AppConstants.secondaryAccent,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      t['map'] ?? 'ERANGEL',
                      style: const TextStyle(
                        color: AppConstants.secondaryAccent,
                        fontSize: 9,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      '//',
                      style: TextStyle(color: Colors.white10, fontSize: 9),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      t['category'] ?? 'SQUAD',
                      style: const TextStyle(
                        color: Colors.grey,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Icon(
            LucideIcons.chevronRight,
            size: 16,
            color: AppConstants.accentColor,
          ),
        ],
      ),
    );
  }

  Widget _buildSkeleton() {
    return Container(
      height: 72,
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(8),
      ),
    );
  }
}
