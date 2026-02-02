import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../services/data_service.dart';
import '../constants.dart';

class MessengerPage extends StatefulWidget {
  const MessengerPage({super.key});

  @override
  State<MessengerPage> createState() => _MessengerPageState();
}

class _MessengerPageState extends State<MessengerPage> {
  Map<String, dynamic>? _selectedChat;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DataService>().fetchConversations();
    });
  }

  @override
  Widget build(BuildContext context) {
    final conversations = context.watch<DataService>().conversations;

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: _selectedChat == null
            ? _buildInboxView(conversations)
            : _buildChatView(),
      ),
    );
  }

  Widget _buildInboxView(List<dynamic> conversations) {
    return Column(
      children: [
        _buildHeader(),
        _buildSearch(),
        const SizedBox(height: 16),
        Expanded(
          child: RefreshIndicator(
            onRefresh: () => context.read<DataService>().fetchConversations(),
            color: AppConstants.accentColor,
            child: conversations.isEmpty
                ? _buildEmptyState()
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 120),
                    itemCount: conversations.length,
                    itemBuilder: (context, idx) =>
                        _buildChatItem(conversations[idx]),
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return ListView(
      children: [
        SizedBox(height: MediaQuery.of(context).size.height * 0.2),
        const Center(
          child: Column(
            children: [
              Icon(LucideIcons.messageSquare, color: Colors.grey, size: 48),
              SizedBox(height: 16),
              Text(
                'NO RECENT TRANSMISSIONS',
                style: TextStyle(
                  color: Colors.grey,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'MESSENGER',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 26,
                  fontWeight: FontWeight.w900,
                  fontStyle: FontStyle.italic,
                  color: Colors.white,
                  letterSpacing: -0.5,
                ),
              ),
              const Icon(LucideIcons.settings, color: Colors.grey, size: 18),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: const BoxDecoration(
                  color: AppConstants.accentColor,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'SYSTEM ONLINE // ENCRYPTED',
                style: GoogleFonts.shareTechMono(
                  color: AppConstants.accentColor.withValues(alpha: 0.7),
                  fontSize: 8,
                  letterSpacing: 1.5,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSearch() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: TextField(
        style: GoogleFonts.plusJakartaSans(fontSize: 13, color: Colors.white),
        decoration: InputDecoration(
          prefixIcon: const Icon(
            LucideIcons.search,
            size: 18,
            color: Colors.grey,
          ),
          hintText: 'Search conversations...',
          hintStyle: const TextStyle(color: Colors.grey),
          contentPadding: const EdgeInsets.symmetric(vertical: 0),
          filled: true,
          fillColor: const Color(0xFF12121A),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.05)),
          ),
        ),
      ),
    );
  }

  Widget _buildChatItem(dynamic chat) {
    bool isCall = chat['lastMsg']?.contains('call') ?? false;

    return GestureDetector(
      onTap: () =>
          setState(() => _selectedChat = Map<String, dynamic>.from(chat)),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF0C0C12),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
        ),
        child: Row(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                image: DecorationImage(
                  image: NetworkImage(
                    chat['avatar'] ?? 'https://i.pravatar.cc/150',
                  ),
                  fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        chat['name']?.toUpperCase() ?? 'OPERATIVE',
                        style: GoogleFonts.plusJakartaSans(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      Text(
                        '20.43', // Placeholder for time correctly
                        style: GoogleFonts.shareTechMono(
                          color: Colors.grey,
                          fontSize: 9,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    chat['lastMsg'] ?? 'NO MESSAGES',
                    style: GoogleFonts.plusJakartaSans(
                      color: isCall ? Colors.grey : Colors.white70,
                      fontSize: 12,
                      fontWeight: isCall ? FontWeight.normal : FontWeight.w500,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            if (chat['unread'] != null && chat['unread'] > 0)
              Container(
                margin: const EdgeInsets.only(left: 12),
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(
                  color: AppConstants.accentColor,
                  shape: BoxShape.circle,
                ),
                child: Text(
                  chat['unread'].toString(),
                  style: const TextStyle(
                    color: Colors.black,
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  // Chat view implementation remains largely same but updated with standard styles...
  Widget _buildChatView() {
    return Column(
      children: [
        _buildChatHeader(),
        Expanded(
          child: Center(
            child: Text(
              'CHAT HISTORY ENCRYPTED',
              style: GoogleFonts.shareTechMono(
                color: Colors.grey,
                fontSize: 10,
              ),
            ),
          ),
        ),
        _buildChatInput(),
      ],
    );
  }

  Widget _buildChatHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0C0C12),
        border: Border(
          bottom: BorderSide(color: Colors.white.withValues(alpha: 0.05)),
        ),
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: () => setState(() => _selectedChat = null),
            icon: const Icon(LucideIcons.chevronLeft, color: Colors.white),
          ),
          const SizedBox(width: 8),
          Text(
            _selectedChat?['name'] ?? 'OPERATIVE',
            style: GoogleFonts.plusJakartaSans(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
          const Spacer(),
          const Icon(LucideIcons.phone, color: Colors.grey, size: 20),
          const SizedBox(width: 20),
          const Icon(LucideIcons.video, color: Colors.grey, size: 20),
        ],
      ),
    );
  }

  Widget _buildChatInput() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
      decoration: BoxDecoration(
        color: Colors.black,
        border: Border(
          top: BorderSide(color: Colors.white.withValues(alpha: 0.05)),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              style: GoogleFonts.plusJakartaSans(
                fontSize: 13,
                color: Colors.white,
              ),
              decoration: InputDecoration(
                hintText: 'TRANSMIT SIGNAL...',
                hintStyle: const TextStyle(color: Colors.grey),
                filled: true,
                fillColor: const Color(0xFF12121A),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 12,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(30),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Container(
            decoration: const BoxDecoration(
              color: AppConstants.accentColor,
              shape: BoxShape.circle,
            ),
            child: IconButton(
              onPressed: () {},
              icon: const Icon(LucideIcons.send, color: Colors.black, size: 18),
            ),
          ),
        ],
      ),
    );
  }
}
