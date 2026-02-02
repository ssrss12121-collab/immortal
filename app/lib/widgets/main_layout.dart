import 'package:flutter/material.dart';
import '../widgets/nav_bar.dart';
import '../pages/home_page.dart';
import '../pages/rankings_page.dart';
import '../pages/messenger_page.dart';
import '../pages/play_page.dart';
import '../pages/guild_page.dart';
import '../pages/live_page.dart';
import '../pages/profile_page.dart';

class MainLayout extends StatefulWidget {
  const MainLayout({super.key});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _currentIndex = 0;

  final List<Widget> _pages = [
    const HomePage(), // 0: HOME
    const PlayPage(), // 1: GAME
    const MessengerPage(), // 2: MESSAGE
    const LivePage(), // 3: LIVE (Central)
    const GuildPage(), // 4: GUILD
    const RankingsPage(), // 5: RANKING
    const ProfilePage(), // 6: PROFILE
  ];

  void _onNavigationChanged(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: IndexedStack(index: _currentIndex, children: _pages),
      bottomNavigationBar: CustomNavBar(
        currentIndex: _currentIndex,
        onTap: _onNavigationChanged,
      ),
      extendBody: true,
    );
  }
}
