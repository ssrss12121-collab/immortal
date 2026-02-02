import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../constants.dart';

class CustomNavBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const CustomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 100,
      decoration: const BoxDecoration(color: Colors.transparent),
      child: Stack(
        alignment: Alignment.bottomCenter,
        children: [
          // Background black bar
          Container(
            height: 70,
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.95),
              border: Border(
                top: BorderSide(color: Colors.white.withValues(alpha: 0.05)),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.8),
                  blurRadius: 30,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
          ),

          // Navigation Items
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                _buildNavItem(0, LucideIcons.home, 'HOME'),
                _buildNavItem(1, LucideIcons.gamepad2, 'GAME'),
                _buildNavItem(2, LucideIcons.messageSquare, 'MESSAGE'),
                _buildPlayButton(),
                _buildNavItem(4, LucideIcons.layoutGrid, 'GUILD'),
                _buildNavItem(5, LucideIcons.users, 'RANKING'),
                _buildNavItem(6, LucideIcons.user, 'PROFILE'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    final isActive = currentIndex == index;
    return GestureDetector(
      onTap: () => onTap(index),
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 45,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              alignment: Alignment.center,
              children: [
                if (isActive)
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: AppConstants.accentColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: AppConstants.accentColor.withValues(alpha: 0.2),
                      ),
                    ),
                  ),
                Icon(
                  icon,
                  size: 20,
                  color: isActive ? AppConstants.accentColor : Colors.grey[600],
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 7,
                fontWeight: FontWeight.w900,
                letterSpacing: 0.5,
                color: isActive ? Colors.white : Colors.grey[700],
              ),
            ),
            const SizedBox(height: 4),
            // Indicator Dot
            AnimatedOpacity(
              duration: const Duration(milliseconds: 300),
              opacity: isActive ? 1 : 0,
              child: Container(
                width: 4,
                height: 4,
                decoration: const BoxDecoration(
                  color: AppConstants.accentColor,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(color: AppConstants.accentColor, blurRadius: 4),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlayButton() {
    final isActive = currentIndex == 3;
    return GestureDetector(
      onTap: () => onTap(3),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Outer Glow
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppConstants.accentColor.withValues(alpha: 0.3),
                    blurRadius: 15,
                    spreadRadius: 2,
                  ),
                ],
              ),
            ),
            // The Button
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: isActive
                    ? AppConstants.accentColor
                    : const Color(0xFF1A1A24),
                border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  bottomRight: Radius.circular(16),
                ),
              ),
              child: Icon(
                LucideIcons.play,
                size: 28,
                color: isActive ? Colors.black : Colors.grey[400],
                fill: isActive ? 1.0 : 0.0,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
