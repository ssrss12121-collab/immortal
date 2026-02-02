import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../constants.dart';

class HomeCarousel extends StatefulWidget {
  final List<Map<String, dynamic>> slides;
  const HomeCarousel({super.key, required this.slides});

  @override
  State<HomeCarousel> createState() => _HomeCarouselState();
}

class _HomeCarouselState extends State<HomeCarousel> {
  final PageController _controller = PageController(viewportFraction: 1.0);
  int _currentPage = 0;

  @override
  Widget build(BuildContext context) {
    if (widget.slides.isEmpty) {
      return Container(
        height: 220,
        margin: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
        ),
        child: const Center(
          child: CircularProgressIndicator(color: AppConstants.accentColor),
        ),
      );
    }

    return Column(
      children: [
        Container(
          height: 220,
          margin: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: AppConstants.accentColor.withValues(alpha: 0.3),
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: AppConstants.accentColor.withValues(alpha: 0.1),
                blurRadius: 20,
                spreadRadius: -10,
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(11),
            child: Stack(
              children: [
                PageView.builder(
                  controller: _controller,
                  onPageChanged: (idx) => setState(() => _currentPage = idx),
                  itemCount: widget.slides.length,
                  itemBuilder: (context, idx) {
                    final slide = widget.slides[idx];
                    final data = slide['data'];
                    return _buildSlide(data);
                  },
                ),
                // Custom Indicators inside the slide
                Positioned(
                  bottom: 20,
                  right: 20,
                  child: Row(
                    children: List.generate(widget.slides.length, (idx) {
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        margin: const EdgeInsets.symmetric(horizontal: 2),
                        height: 3,
                        width: _currentPage == idx ? 16 : 6,
                        decoration: BoxDecoration(
                          color: _currentPage == idx
                              ? AppConstants.accentColor
                              : Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      );
                    }),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSlide(dynamic data) {
    return Container(
      decoration: BoxDecoration(
        image: DecorationImage(
          image: CachedNetworkImageProvider(
            data['image'] ??
                'https://images.unsplash.com/photo-1542751371-adc38448a05e',
          ),
          fit: BoxFit.cover,
        ),
      ),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.bottomCenter,
            end: Alignment.topCenter,
            colors: [
              Colors.black.withValues(alpha: 0.85),
              Colors.black.withValues(alpha: 0.2),
            ],
          ),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.end,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (data['badgeText'] != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppConstants.accentColor.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(
                    color: AppConstants.accentColor.withValues(alpha: 0.4),
                  ),
                ),
                child: Text(
                  data['badgeText'].toUpperCase(),
                  style: GoogleFonts.plusJakartaSans(
                    color: AppConstants.accentColor,
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1,
                  ),
                ),
              ),
            const SizedBox(height: 12),
            Text(
              data['title'] ?? 'COMMAND CENTER',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 22,
                fontWeight: FontWeight.w900,
                fontStyle: FontStyle.italic,
                color: Colors.white,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              data['description'] ?? 'Establishing connection...',
              style: GoogleFonts.plusJakartaSans(
                color: Colors.white.withValues(alpha: 0.7),
                fontSize: 11,
                fontWeight: FontWeight.w500,
                letterSpacing: 0.2,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 12),
            Container(
              width: 30,
              height: 3,
              decoration: BoxDecoration(
                color: AppConstants.accentColor,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
